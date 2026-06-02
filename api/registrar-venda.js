// Registra uma venda vinda do checkout público (comprador anônimo).
// Usa a service_role (server-side) para gravar na conta do VENDEDOR dono do produto.
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!key) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE não configurada.' })
  const sb = createClient(SB_URL, key)
  try {
    const { slug, customer, items, total, method, status } = req.body || {}
    let owner = null
    if (slug) {
      const { data } = await sb.from('products').select('owner').eq('slug', slug).limit(1)
      owner = data?.[0]?.owner || null
    }
    const { data, error } = await sb.from('sales').insert({
      owner,
      product_slug: slug || null,
      customer: customer || {},
      items: items || [],
      total: total || 0,
      method: method || 'pix',
      status: status || 'aguardando',
    }).select('id').single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ id: data.id })
  } catch (e) {
    return res.status(500).json({ error: 'Falha ao registrar a venda.' })
  }
}
