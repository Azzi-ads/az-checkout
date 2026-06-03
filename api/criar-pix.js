// Cria a transação PIX no BravoPay e já registra a venda no banco (com tx_id),
// para o webhook confirmar o pagamento depois (server-side, confiável).
import { createClient } from '@supabase/supabase-js'

const BASE = 'https://bravopay.solutions/api/v1'
const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const key = process.env.BRAVOPAY_API_KEY
  if (!key) return res.status(500).json({ error: 'BRAVOPAY_API_KEY não configurada.' })

  try {
    const { product_id, amount_cents, customer, utm, fbclid, ttclid, gclid, slug, items, total } = req.body || {}
    if (!product_id) return res.status(400).json({ error: 'Produto sem ID do BravoPay. Configure em Produtos → Editar.' })
    if (!amount_cents || amount_cents < 1) return res.status(400).json({ error: 'Valor inválido.' })

    // 1) cria a transação no gateway
    const r = await fetch(`${BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ product_id, amount_cents, method: 'pix', customer, utm, fbclid, ttclid, gclid }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      const raw = data && Object.keys(data).length ? JSON.stringify(data) : `HTTP ${r.status}`
      return res.status(r.status).json({ error: `BravoPay (${r.status}): ${raw}`, status: r.status, detail: data })
    }

    // 2) registra a venda no banco (aguardando) ligada ao tx_id
    let saleId = null
    const srv = process.env.SUPABASE_SERVICE_ROLE
    if (srv && slug) {
      try {
        const sb = createClient(SB_URL, srv)
        const { data: prod } = await sb.from('products').select('owner').eq('slug', slug).limit(1)
        const owner = prod?.[0]?.owner || null
        const { data: sale } = await sb.from('sales').insert({
          owner, tx_id: data.id, product_slug: slug, customer: customer || {},
          items: items || [], total: total || (amount_cents / 100), method: 'pix', status: 'aguardando',
        }).select('id').single()
        saleId = sale?.id || null
      } catch { /* segue sem saleId */ }
    }

    return res.status(200).json({
      id: data.id, status: data.status, qr_code: data.qr_code, qr_code_image: data.qr_code_image,
      expires_at: data.expires_at, amount_cents: data.amount_cents, saleId,
    })
  } catch (e) {
    return res.status(500).json({ error: 'Falha na comunicação com o gateway.' })
  }
}
