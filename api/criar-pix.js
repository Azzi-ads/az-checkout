// Cria a transação PIX no BravoPay, extrai o QR (em qualquer formato de resposta)
// e registra a venda no banco com o tx_id (para o webhook confirmar depois).
import { createClient } from '@supabase/supabase-js'
import { sendPushToOwner, brl } from '../lib/push.js'

const BASE = 'https://bravopay.solutions/api/v1'
const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

// busca profunda por uma string que satisfaça `pred`
function deepFindStr(obj, pred, depth = 0) {
  if (obj == null || depth > 7) return null
  if (typeof obj === 'string') return pred(obj) ? obj : null
  if (Array.isArray(obj)) { for (const v of obj) { const r = deepFindStr(v, pred, depth + 1); if (r) return r } return null }
  if (typeof obj === 'object') { for (const k of Object.keys(obj)) { const r = deepFindStr(obj[k], pred, depth + 1); if (r) return r } }
  return null
}
// busca o valor de uma chave (ex.: id) em qualquer nível
function deepFindKey(obj, names, depth = 0) {
  if (obj == null || depth > 7 || typeof obj !== 'object') return null
  for (const k of Object.keys(obj)) {
    if (names.includes(k.toLowerCase()) && (typeof obj[k] === 'string' || typeof obj[k] === 'number')) return String(obj[k])
  }
  for (const k of Object.keys(obj)) { const r = deepFindKey(obj[k], names, depth + 1); if (r) return r }
  return null
}
const isEmv = (s) => s.length > 40 && (s.startsWith('000201') || /br\.gov\.bcb\.pix/i.test(s) || /pix/i.test(s) && /\d{6,}/.test(s) && s.length > 80)
const isImg = (s) => s.startsWith('data:image') || (s.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(s))
// chaves só de estrutura (debug), sem valores gigantes
function shape(obj, depth = 0) {
  if (depth > 4 || obj == null) return typeof obj
  if (typeof obj === 'string') return `str(${obj.length})`
  if (Array.isArray(obj)) return [obj.length ? shape(obj[0], depth + 1) : 'empty']
  if (typeof obj === 'object') { const o = {}; for (const k of Object.keys(obj)) o[k] = shape(obj[k], depth + 1); return o }
  return typeof obj
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const key = process.env.BRAVOPAY_API_KEY
  if (!key) return res.status(500).json({ error: 'BRAVOPAY_API_KEY não configurada.' })

  try {
    const { product_id, amount_cents, customer, utm, fbclid, ttclid, gclid, slug, items, total } = req.body || {}
    if (!product_id) return res.status(400).json({ error: 'Produto sem ID do BravoPay. Configure em Produtos → Editar.' })
    if (!amount_cents || amount_cents < 1) return res.status(400).json({ error: 'Valor inválido.' })

    const r = await fetch(`${BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ product_id, amount_cents, method: 'pix', customer, utm, fbclid, ttclid, gclid }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      const raw = data && Object.keys(data).length ? JSON.stringify(data) : `HTTP ${r.status}`
      return res.status(r.status).json({ error: `BravoPay (${r.status}): ${raw}`, status: r.status })
    }

    // extrai QR (copia-e-cola) e imagem em QUALQUER formato
    const emv = deepFindStr(data, isEmv)
    let img = deepFindStr(data, isImg)
    if (img && !img.startsWith('data:image')) img = `data:image/png;base64,${img.replace(/\s/g, '')}`
    const txId = data.id || data.transaction?.id || data.data?.id || deepFindKey(data, ['id', 'transaction_id', 'txid'])

    if (!emv && !img) {
      // criou no gateway mas não achamos o QR — devolve a estrutura para diagnóstico
      return res.status(502).json({ error: 'Transação criada, mas não encontrei o QR na resposta do BravoPay.', shape: shape(data) })
    }

    // registra a venda (aguardando) ligada ao tx_id
    let saleId = null
    const srv = process.env.SUPABASE_SERVICE_ROLE
    if (srv && slug) {
      try {
        const sb = createClient(SB_URL, srv)
        const { data: prod } = await sb.from('products').select('owner').eq('slug', slug).limit(1)
        const owner = prod?.[0]?.owner || null
        const { data: sale } = await sb.from('sales').insert({
          owner, tx_id: txId, product_slug: slug, customer: customer || {},
          items: items || [], total: total || (amount_cents / 100), method: 'pix', status: 'aguardando',
        }).select('id').single()
        saleId = sale?.id || null
        if (owner) await sendPushToOwner(sb, owner, { title: 'Novo Pix gerado ⏳', body: `${customer?.name || 'Cliente'} · ${brl(total || amount_cents / 100)} — aguardando pagamento`, url: '/app' })
      } catch { /* segue sem saleId */ }
    }

    return res.status(200).json({ id: txId, status: data.status || 'PENDING', qr_code: emv || '', qr_code_image: img || '', saleId })
  } catch (e) {
    return res.status(500).json({ error: 'Falha na comunicação com o gateway.' })
  }
}
