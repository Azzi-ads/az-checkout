// Vendedor conecta a própria chave de gateway (BravoPay). Chave fica só no servidor.
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'
const BASE = 'https://bravopay.solutions/api/v1'

async function testKey(key) {
  try {
    const r = await fetch(`${BASE}/products`, { headers: { Authorization: `Bearer ${key}` } })
    return r.ok || r.status === 404 // 404 = chave válida, conta sem produtos
  } catch { return false }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const srv = process.env.SUPABASE_SERVICE_ROLE
  if (!srv) return res.status(500).json({ error: 'Backend não configurado.' })
  const sb = createClient(SB_URL, srv)
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
    const { data: u } = await sb.auth.getUser(token)
    const uid = u?.user?.id
    if (!uid) return res.status(401).json({ error: 'Não autorizado.' })

    const { action, apiKey } = req.body || {}

    if (action === 'disconnect') {
      await sb.from('gateway_credentials').delete().eq('owner', uid)
      await sb.from('profiles').update({ gateway_connected: false }).eq('id', uid)
      return res.status(200).json({ ok: true, connected: false })
    }

    // connect (default)
    if (!apiKey || apiKey.length < 8) return res.status(400).json({ error: 'Chave inválida.' })
    const valid = await testKey(apiKey)
    if (!valid) return res.status(400).json({ error: 'Chave recusada pelo BravoPay. Confira se copiou a chave correta.' })
    await sb.from('gateway_credentials').upsert({ owner: uid, gateway: 'bravopay', api_key: apiKey, updated_at: new Date().toISOString() })
    await sb.from('profiles').update({ gateway_connected: true }).eq('id', uid)
    return res.status(200).json({ ok: true, connected: true })
  } catch {
    return res.status(500).json({ error: 'Falha ao conectar o gateway.' })
  }
}
