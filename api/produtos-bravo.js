// Lista os produtos da conta BravoPay do PRÓPRIO vendedor (usa a chave dele).
import { createClient } from '@supabase/supabase-js'
import { keyByOwner } from '../lib/gateway.js'

const BASE = 'https://bravopay.solutions/api/v1'
const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

export default async function handler(req, res) {
  const srv = process.env.SUPABASE_SERVICE_ROLE
  if (!srv) return res.status(500).json({ error: 'Backend não configurado.' })
  const sb = createClient(SB_URL, srv)
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
    const { data: u } = await sb.auth.getUser(token)
    const uid = u?.user?.id
    if (!uid) return res.status(401).json({ error: 'Não autorizado.' })

    const key = (await keyByOwner(sb, uid)) || process.env.BRAVOPAY_API_KEY
    if (!key) return res.status(400).json({ error: 'Conecte seu gateway (BravoPay) em Integrações primeiro.' })

    const r = await fetch(`${BASE}/products`, { headers: { Authorization: `Bearer ${key}` } })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: `BravoPay (${r.status}): ${JSON.stringify(data)}` })
    const products = Array.isArray(data) ? data : (data.data || data.products || data.items || [])
    return res.status(200).json({ products })
  } catch {
    return res.status(500).json({ error: 'Falha ao listar produtos do BravoPay.' })
  }
}
