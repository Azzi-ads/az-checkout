// Função serverless (Vercel) — lista os produtos da conta BravoPay do DONO.
// Restrita ao dono da plataforma (o catálogo BravoPay é dele, não pode vazar
// para os clientes). Usada pelo editor para escolher o produto sem digitar o ID.
import { createClient } from '@supabase/supabase-js'

const BASE = 'https://bravopay.solutions/api/v1'
const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'
const OWNERS = ['enzoazzi76@gmail.com', 'enzozzi76@gmail.com']

export default async function handler(req, res) {
  const key = process.env.BRAVOPAY_API_KEY
  if (!key) return res.status(500).json({ error: 'BRAVOPAY_API_KEY não configurada no servidor.' })

  // só o dono pode listar o catálogo BravoPay
  try {
    const srv = process.env.SUPABASE_SERVICE_ROLE
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
    if (!srv || !token) return res.status(401).json({ error: 'Não autorizado.' })
    const sb = createClient(SB_URL, srv)
    const { data: u } = await sb.auth.getUser(token)
    const email = (u?.user?.email || '').trim().toLowerCase()
    if (!OWNERS.includes(email)) return res.status(403).json({ error: 'Disponível apenas para o dono da conta.' })
  } catch {
    return res.status(401).json({ error: 'Não autorizado.' })
  }

  try {
    const r = await fetch(`${BASE}/products`, { headers: { Authorization: `Bearer ${key}` } })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: `BravoPay (${r.status}): ${JSON.stringify(data)}` })
    const products = Array.isArray(data) ? data : (data.data || data.products || data.items || [])
    return res.status(200).json({ products })
  } catch (e) {
    return res.status(500).json({ error: 'Falha ao listar produtos do BravoPay.' })
  }
}
