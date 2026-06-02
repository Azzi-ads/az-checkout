// Atualiza status/comprovante de uma venda (do checkout público).
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!key) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE não configurada.' })
  const sb = createClient(SB_URL, key)
  try {
    const { id, patch } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id obrigatório' })
    const allowed = {}
    if (patch?.status) allowed.status = patch.status
    if (patch?.proof) allowed.proof = patch.proof
    if (patch?.items) allowed.items = patch.items
    if (patch?.total != null) allowed.total = patch.total
    const { error } = await sb.from('sales').update(allowed).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: 'Falha ao atualizar a venda.' })
  }
}
