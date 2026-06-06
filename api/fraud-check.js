// AZ Security — antifraude comportamental. Avalia risco ANTES de gerar o Pix.
// Nunca bloqueia em caso de erro técnico (default = ALLOW).
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'
const HOUR = 3600000

const DISPOSABLE = ['mailinator', 'guerrillamail', '10minutemail', 'tempmail', 'temp-mail', 'yopmail', 'trashmail', 'getnada', 'sharklasers', 'maildrop', 'dispostable']
const SUS_NAMES = ['teste teste', 'qwerty', 'asdf', 'aaaa', '1234']

const sha = (v) => crypto.createHash('sha256').update(String(v || '')).digest('hex')
const isDisposable = (email, list) => { const d = (email || '').split('@')[1] || ''; return list.some((x) => d.includes(x)) }
const isSusName = (name) => { const n = (name || '').trim().toLowerCase(); if (n.length < 3) return true; if (/^(.)\1+$/.test(n.replace(/\s/g, ''))) return true; if (/^\d+$/.test(n.replace(/\s/g, ''))) return true; return SUS_NAMES.some((s) => n.includes(s)) }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const srv = process.env.SUPABASE_SERVICE_ROLE
  // Sem backend → não bloqueia
  if (!srv) return res.status(200).json({ action: 'allow', score: 0 })
  const sb = createClient(SB_URL, srv)
  try {
    const b = req.body || {}
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null
    const sessionId = b.sessionId || sha(`${ip}-${b.fingerprint}-${Date.now()}`).slice(0, 16)

    // dono + config
    let owner = null, cfg = {}
    if (b.slug) {
      const { data: prod } = await sb.from('products').select('owner').eq('slug', b.slug).limit(1)
      owner = prod?.[0]?.owner || null
    }
    if (owner) {
      const { data: prof } = await sb.from('profiles').select('security,fraud_config').eq('id', owner).maybeSingle()
      if (prof && prof.security === false) return res.status(200).json({ action: 'allow', score: 0, disabled: true })
      cfg = prof?.fraud_config || {}
    }
    const blockAt = cfg.block || 61
    const medAt = cfg.medium || 31
    const disposable = cfg.disposable?.length ? cfg.disposable : DISPOSABLE
    const cpfHash = b.cpf ? sha(b.cpf.replace(/\D/g, '')) : null
    const fp = b.fingerprint || null

    // contagens (best-effort)
    const since = new Date(Date.now() - HOUR).toISOString()
    const sinceDay = new Date(Date.now() - 24 * HOUR).toISOString()
    let cpfCount = 0, ipCount = 0, fpSeen = 0, ipChargeback = 0
    try { if (cpfHash) { const { count } = await sb.from('fraud_sessions').select('id', { count: 'exact', head: true }).eq('cpf_hash', cpfHash).gte('created_at', since); cpfCount = count || 0 } } catch { /* */ }
    try { if (ip) { const { count } = await sb.from('fraud_sessions').select('id', { count: 'exact', head: true }).eq('ip', ip).gte('created_at', sinceDay); ipCount = count || 0 } } catch { /* */ }
    try { if (fp) { const { count } = await sb.from('fraud_sessions').select('id', { count: 'exact', head: true }).eq('fingerprint', fp); fpSeen = count || 0 } } catch { /* */ }
    try { if (ip) { const { data } = await sb.from('ip_reputation').select('chargeback_count').eq('ip', ip).maybeSingle(); ipChargeback = data?.chargeback_count || 0 } } catch { /* */ }

    // pontuação
    const signals = []
    const add = (cond, type, pts, desc) => { if (cond) { signals.push({ signal_type: type, risk_points: pts, description: desc }) } }
    add(b.fillTimeMs != null && b.fillTimeMs < 3000, 'fast_checkout', 40, 'Checkout em menos de 3s')
    add(isDisposable(b.email, disposable), 'disposable_email', 30, 'E-mail descartável')
    add(cpfCount >= 5, 'cpf_5x_1h', 80, 'Mesmo CPF 5+ vezes em 1h')
    add(cpfCount >= 3 && cpfCount < 5, 'cpf_3x_1h', 50, 'Mesmo CPF 3+ vezes em 1h')
    add(ipChargeback > 0, 'ip_chargeback', 60, 'IP com histórico de chargeback')
    add(ipCount >= 10, 'ip_10x', 50, '10+ pedidos do mesmo IP')
    add(ipCount >= 3 && ipCount < 10, 'ip_3x', 20, '3+ pedidos do mesmo IP')
    add(fpSeen >= 1, 'fingerprint_repeat', 40, 'Mesmo dispositivo repetido')
    add(isSusName(b.name), 'suspicious_name', 20, 'Nome suspeito')

    const score = Math.min(100, signals.reduce((a, s) => a + s.risk_points, 0))
    const risk_level = score >= blockAt ? 'HIGH_RISK' : score >= medAt ? 'MEDIUM_RISK' : 'LOW_RISK'
    const action = score >= blockAt ? 'block' : score >= medAt ? 'email_verification' : 'allow'

    // persiste (best-effort)
    const nowISO = new Date().toISOString()
    try {
      await sb.from('fraud_sessions').insert({ session_id: sessionId, owner, fingerprint: fp, ip, cpf_hash: cpfHash, user_agent: b.device?.user_agent || null, browser: b.device?.browser || null, os: b.device?.os || null, screen_resolution: b.device?.screen_resolution || null, timezone: b.device?.timezone || null, language: b.device?.language || null, created_at: nowISO })
      if (signals.length) await sb.from('fraud_signals').insert(signals.map((s) => ({ ...s, session_id: sessionId, created_at: nowISO })))
      await sb.from('fraud_assessments').insert({ session_id: sessionId, owner, ip, fingerprint: fp, cpf_hash: cpfHash, total_score: score, risk_level, action_taken: action, reasons: signals.map((s) => s.description), created_at: nowISO })
    } catch { /* não bloqueia por erro de log */ }

    return res.status(200).json({ action, score, risk_level, message: cfg.message || 'Estamos enfrentando uma instabilidade temporária. Tente novamente mais tarde.' })
  } catch {
    return res.status(200).json({ action: 'allow', score: 0 })
  }
}
