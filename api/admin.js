// Painel do dono — lê TODAS as contas e vendas (service_role), mas só responde
// se quem chamar for o dono (verifica o token de sessão).
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'
const OWNERS = ['enzoazzi76@gmail.com', 'enzozzi76@gmail.com']

export default async function handler(req, res) {
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!key) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE não configurada.' })
  const sb = createClient(SB_URL, key)

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
  if (!token) return res.status(401).json({ error: 'Sem autenticação.' })

  try {
    const { data: userData } = await sb.auth.getUser(token)
    const email = (userData?.user?.email || '').toLowerCase()
    if (!OWNERS.includes(email)) return res.status(403).json({ error: 'Acesso restrito ao dono.' })

    const [{ data: profiles }, { data: sales }] = await Promise.all([
      sb.from('profiles').select('id,email,name,plan,security,created_at'),
      sb.from('sales').select('owner,total,status,created_at'),
    ])
    const allSales = sales || []
    const pagos = allSales.filter((s) => s.status === 'pago')
    const receita = pagos.reduce((a, s) => a + Number(s.total || 0), 0)

    const byOwner = {}
    for (const s of allSales) {
      const o = s.owner || 'desconhecido'
      if (!byOwner[o]) byOwner[o] = { sales: 0, receita: 0 }
      byOwner[o].sales += 1
      if (s.status === 'pago') byOwner[o].receita += Number(s.total || 0)
    }
    const accounts = (profiles || []).map((p) => ({
      email: p.email, name: p.name, plan: p.plan, security: p.security, created_at: p.created_at,
      sales: byOwner[p.id]?.sales || 0, receita: byOwner[p.id]?.receita || 0,
    })).sort((a, b) => b.receita - a.receita)

    return res.status(200).json({
      totalContas: profiles?.length || 0,
      totalVendas: allSales.length,
      pagos: pagos.length,
      receita,
      accounts,
    })
  } catch (e) {
    return res.status(500).json({ error: 'Falha ao carregar o painel.' })
  }
}
