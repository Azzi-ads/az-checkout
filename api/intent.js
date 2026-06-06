// Persiste a sessão de intenção do checkout (Intent Score Engine) para análise.
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const srv = process.env.SUPABASE_SERVICE_ROLE
  if (!srv) return res.status(200).json({ skipped: true })
  const sb = createClient(SB_URL, srv)
  try {
    const b = req.body || {}
    if (!b.sessionId) return res.status(400).json({ error: 'sessionId obrigatório' })
    let owner = b.owner || null
    if (!owner && b.checkoutSlug) {
      const { data } = await sb.from('products').select('owner').eq('slug', b.checkoutSlug).limit(1)
      owner = data?.[0]?.owner || null
    }
    await sb.from('checkout_sessions').upsert({
      session_id: b.sessionId, owner, checkout_slug: b.checkoutSlug || null,
      score: b.score || 0, tier: b.tier || null, events: b.events || [],
      time_on_page: b.timeOnPage || 0, scroll_depth: b.scrollDepth || 0,
      converted: !!b.converted, conversion_value: b.conversionValue || 0,
      utm_source: b.utm?.source || null, utm_campaign: b.utm?.campaign || null, utm_medium: b.utm?.medium || null,
      device_type: b.deviceType || null, updated_at: new Date().toISOString(),
    }, { onConflict: 'session_id' })
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(200).json({ error: true })
  }
}
