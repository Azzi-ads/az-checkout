// Teste A/B — assign (sticky), convert, e gestão (list/create/status).
// Público: assign/convert. Dono (token): list/create/set-status. Via service_role.
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

function weightedPick(vars) {
  const tot = vars.reduce((a, v) => a + Number(v.weight || 0), 0) || vars.length
  let r = Math.random() * tot
  for (const v of vars) { r -= Number(v.weight || 0); if (r <= 0) return v }
  return vars[0]
}
async function getUserId(sb, token) { if (!token) return null; try { const { data } = await sb.auth.getUser(token); return data?.user?.id || null } catch { return null } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const srv = process.env.SUPABASE_SERVICE_ROLE
  if (!srv) return res.status(200).json({ error: 'no backend' })
  const sb = createClient(SB_URL, srv)
  const action = req.body?.action
  try {
    if (action === 'assign') {
      const { slug, sessionId } = req.body || {}
      if (!slug || !sessionId) return res.status(400).json({ error: 'params' })
      const { data: exps } = await sb.from('experiments').select('id').eq('checkout_slug', slug).eq('status', 'running').limit(1)
      const exp = exps?.[0]; if (!exp) return res.status(200).json({ variant: null })
      const { data: vars } = await sb.from('variants').select('*').eq('experiment_id', exp.id)
      if (!vars?.length) return res.status(200).json({ variant: null })
      const { data: existing } = await sb.from('assignments').select('variant_id').eq('experiment_id', exp.id).eq('session_id', sessionId).limit(1)
      let vid = existing?.[0]?.variant_id
      if (!vid) {
        vid = weightedPick(vars).id
        await sb.from('assignments').insert({ experiment_id: exp.id, variant_id: vid, session_id: sessionId })
        await sb.from('exp_results').insert({ experiment_id: exp.id, variant_id: vid, session_id: sessionId, converted: false })
      }
      const v = vars.find((x) => x.id === vid)
      return res.status(200).json({ experimentId: exp.id, variantId: vid, config: v?.config || {}, isControl: !!v?.is_control })
    }
    if (action === 'convert') {
      const { sessionId, revenue, bump, upsell, downsell } = req.body || {}
      if (!sessionId) return res.status(400).json({ error: 'params' })
      await sb.from('exp_results').update({ converted: true, revenue: revenue || 0, bump: !!bump, upsell: !!upsell, downsell: !!downsell }).eq('session_id', sessionId)
      return res.status(200).json({ ok: true })
    }

    // ===== ações do dono =====
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
    const uid = await getUserId(sb, token)
    if (!uid) return res.status(401).json({ error: 'auth' })

    if (action === 'list') {
      const { slug } = req.body || {}
      const { data: exps } = await sb.from('experiments').select('*').eq('owner', uid).eq('checkout_slug', slug).order('created_at', { ascending: false })
      const out = []
      for (const e of exps || []) {
        const { data: vars } = await sb.from('variants').select('*').eq('experiment_id', e.id)
        const { data: results } = await sb.from('exp_results').select('variant_id,converted,revenue').eq('experiment_id', e.id)
        const summary = (vars || []).map((v) => {
          const r = (results || []).filter((x) => x.variant_id === v.id)
          const visitors = r.length; const conv = r.filter((x) => x.converted).length
          const receita = r.reduce((a, x) => a + Number(x.revenue || 0), 0)
          return { id: v.id, name: v.name, isControl: v.is_control, weight: v.weight, visitors, conv, cr: visitors ? conv / visitors : 0, receita, erpv: visitors ? receita / visitors : 0 }
        })
        out.push({ id: e.id, name: e.name, status: e.status, winner: e.winner_variant, variants: vars, summary })
      }
      return res.status(200).json({ experiments: out })
    }
    if (action === 'create') {
      const { slug, name, variants } = req.body || {}
      if (!slug || !variants?.length) return res.status(400).json({ error: 'params' })
      const { data: exp } = await sb.from('experiments').insert({ owner: uid, checkout_slug: slug, name: name || 'Teste A/B', status: 'running' }).select('id').single()
      const rows = variants.map((v) => ({ experiment_id: exp.id, name: v.name, is_control: !!v.isControl, config: v.config || {}, weight: v.weight || 100 / variants.length }))
      await sb.from('variants').insert(rows)
      return res.status(200).json({ ok: true, id: exp.id })
    }
    if (action === 'set-status') {
      const { id, status, winner } = req.body || {}
      const { data: e } = await sb.from('experiments').select('owner').eq('id', id).limit(1)
      if (e?.[0]?.owner !== uid) return res.status(403).json({ error: 'forbidden' })
      await sb.from('experiments').update({ status, ...(winner ? { winner_variant: winner } : {}) }).eq('id', id)
      return res.status(200).json({ ok: true })
    }
    return res.status(400).json({ error: 'unknown action' })
  } catch {
    return res.status(500).json({ error: 'falha' })
  }
}
