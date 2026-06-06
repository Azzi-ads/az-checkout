// Envia o pedido aprovado para o Utmify (server-side, com retry e log).
// O token fica no perfil do dono (nunca exposto ao cliente).
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'
const UTMIFY_URL = 'https://api.utmify.com.br/api-credentials/orders'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const srv = process.env.SUPABASE_SERVICE_ROLE
  if (!srv) return res.status(200).json({ skipped: true })
  const sb = createClient(SB_URL, srv)
  try {
    const b = req.body || {}
    if (!b.slug) return res.status(400).json({ error: 'slug obrigatório' })
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null
    const { data: prod } = await sb.from('products').select('owner').eq('slug', b.slug).limit(1)
    const owner = prod?.[0]?.owner
    const { data: prof } = await sb.from('profiles').select('tracking').eq('id', owner).maybeSingle()
    const token = prof?.tracking?.utmifyToken
    if (!token) return res.status(200).json({ skipped: 'no token' })

    const payload = {
      orderId: b.transactionId || b.sessionId,
      platform: 'AZ Checkout',
      paymentMethod: b.method || 'pix',
      status: 'paid',
      createdAt: new Date().toISOString(),
      approvedDate: new Date().toISOString(),
      customer: { name: b.customer?.name, email: b.customer?.email, phone: b.customer?.phone, document: b.customer?.cpf },
      products: [{ name: b.product, quantity: 1, priceInCents: Math.round((Number(b.value) || 0) * 100) }],
      trackingParameters: b.utms || {},
      commission: { totalPriceInCents: Math.round((Number(b.value) || 0) * 100), currency: 'BRL' },
      ip, userAgent: b.userAgent || null,
    }

    let status = 'error', response = null, error = null
    for (let i = 0; i < 3; i++) {
      try {
        const r = await fetch(UTMIFY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-token': token }, body: JSON.stringify(payload) })
        response = (await r.text())?.slice(0, 500)
        if (r.ok) { status = 'ok'; break }
      } catch (e) { error = String(e).slice(0, 200) }
    }
    try { await sb.from('tracking_logs').insert({ provider: 'utmify', event: 'purchase', payload, status, response, error }) } catch { /* ignore */ }
    return res.status(200).json({ ok: status === 'ok' })
  } catch { return res.status(200).json({ error: true }) }
}
