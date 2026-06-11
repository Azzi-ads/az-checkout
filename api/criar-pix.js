// Cria a transação PIX no BravoPay, extrai o QR (em qualquer formato de resposta)
// e registra a venda no banco com o tx_id (para o webhook confirmar depois).
import { createClient } from '@supabase/supabase-js'
import { sendPushToOwner, brl } from '../lib/push.js'
import { keyByOwner } from '../lib/gateway.js'
import { processWithFallback, NoGatewayAvailableError } from '../lib/gatewayRouter.js'

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

  try {
    const { product_id, amount_cents, customer, utm, fbclid, ttclid, gclid, slug, items, total } = req.body || {}
    if (!product_id) return res.status(400).json({ error: 'Produto sem ID do BravoPay. Configure em Produtos → Editar.' })
    if (!amount_cents || amount_cents < 1) return res.status(400).json({ error: 'Valor inválido.' })

    // chave do PRÓPRIO vendedor (multi-tenant); cai pra plataforma só como fallback
    const srv = process.env.SUPABASE_SERVICE_ROLE
    const sb = srv ? createClient(SB_URL, srv) : null
    let owner = null
    if (sb && slug) { const { data: prod } = await sb.from('products').select('owner').eq('slug', slug).limit(1); owner = prod?.[0]?.owner || null }
    const key = (sb && owner ? await keyByOwner(sb, owner) : null) || process.env.BRAVOPAY_API_KEY
    if (!key) return res.status(400).json({ error: 'Gateway não conectado. Conecte o BravoPay em Integrações.' })

    // Processador de UM gateway. Hoje só sabemos falar com o BravoPay;
    // outros gateways da fila de saúde são pulados (fallback continua).
    const bravoBody = JSON.stringify({ product_id, amount_cents, method: 'pix', customer, utm, fbclid, ttclid, gclid })
    const processOne = async (gatewayId) => {
      if (gatewayId !== 'bravopay') throw new Error(`Sem processador para o gateway "${gatewayId}"`)
      const r = await fetch(`${BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: bravoBody,
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) { const err = new Error('bravopay_http'); err.httpStatus = r.status; err.payload = d; throw err }
      return { data: d, gatewayId }
    }
    const httpErr = (e) => {
      const raw = e.payload && Object.keys(e.payload).length ? JSON.stringify(e.payload) : `HTTP ${e.httpStatus}`
      return res.status(e.httpStatus).json({ error: `BravoPay (${e.httpStatus}): ${raw}`, status: e.httpStatus })
    }

    // Roteia pela saúde dos gateways; sem histórico de saúde (caso normal no
    // lançamento) cai direto no BravoPay — preserva o comportamento original.
    let data, gatewayUsed = 'bravopay', usedFallback = false
    try {
      const routed = await processWithFallback(sb, { product_id, amount_cents }, processOne)
      data = routed.result?.data || {}
      gatewayUsed = routed.gatewayUsed
      usedFallback = routed.usedFallback
    } catch (e) {
      if (e?.httpStatus) return httpErr(e)
      if (!(e instanceof NoGatewayAvailableError)) {
        // todos os gateways da fila falharam por rede/timeout → último recurso BravoPay
      }
      try {
        const direct = await processOne('bravopay')
        data = direct.data
      } catch (e2) {
        if (e2?.httpStatus) return httpErr(e2)
        throw e2
      }
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
    if (sb && slug) {
      try {
        const { data: sale } = await sb.from('sales').insert({
          owner, tx_id: txId, product_slug: slug, customer: customer || {},
          items: items || [], total: total || (amount_cents / 100), method: 'pix', status: 'aguardando',
        }).select('id').single()
        saleId = sale?.id || null
        // registra o gateway usado / fallback (separado: se a coluna não existir, não quebra a venda)
        if (saleId) { try { await sb.from('sales').update({ gateway_id: gatewayUsed, gateway_fallback: usedFallback }).eq('id', saleId) } catch { /* coluna pode não existir */ } }
        if (owner) await sendPushToOwner(sb, owner, 'pending', { name: customer?.name, total: total || amount_cents / 100, product: items?.[0]?.name })
      } catch { /* segue sem saleId */ }
    }

    return res.status(200).json({ id: txId, status: data.status || 'PENDING', qr_code: emv || '', qr_code_image: img || '', saleId })
  } catch (e) {
    return res.status(500).json({ error: 'Falha na comunicação com o gateway.' })
  }
}
