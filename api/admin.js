// Painel do dono — lê TODAS as contas/vendas e permite editar (service_role).
// Só responde a quem for o dono (verifica o token de sessão).
// Também concentra o health-check de gateways (evita criar função nova no Hobby).
import { createClient } from '@supabase/supabase-js'
import { runHealthCheckOnce, cleanupOldHealth, gatewayIds } from '../jobs/healthCheck.js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'
const OWNERS = ['enzoazzi76@gmail.com', 'enzozzi76@gmail.com']

export default async function handler(req, res) {
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!key) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE não configurada.' })
  const sb = createClient(SB_URL, key)

  const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
  if (!token) return res.status(401).json({ error: 'Sem autenticação.' })

  let email = ''
  try {
    const { data: userData } = await sb.auth.getUser(token)
    email = (userData?.user?.email || '').toLowerCase()
  } catch { return res.status(401).json({ error: 'Token inválido.' }) }
  if (!OWNERS.includes(email)) return res.status(403).json({ error: 'Acesso restrito ao dono.' })

  // ---- editar conta ----
  if (req.method === 'POST') {
    try {
      const body = req.body || {}
      if (body.action === 'gatewayHealthCheck') {
        // roda um ciclo de health-check sob demanda (substitui o job no Hobby)
        await runHealthCheckOnce(sb)
        cleanupOldHealth(sb).catch(() => {})
        return res.status(200).json({ ok: true, gateways: gatewayIds() })
      }
      if (body.action === 'novidade') {
        if (!body.title) return res.status(400).json({ error: 'Título obrigatório.' })
        const { error } = await sb.from('announcements').insert({ title: body.title, body: body.body || '', tag: body.tag || 'Novidade' })
        if (error) return res.status(500).json({ error: error.message })
        return res.status(200).json({ ok: true })
      }
      const { action, email: target, plan } = body
      const { data: prof } = await sb.from('profiles').select('id,email').eq('email', target).limit(1)
      const id = prof?.[0]?.id
      if (!id) return res.status(404).json({ error: 'Conta não encontrada.' })
      if (OWNERS.includes((target || '').toLowerCase()) && action === 'delete') return res.status(400).json({ error: 'Não dá para apagar a conta do dono.' })
      if (action === 'delete') {
        const { error } = await sb.auth.admin.deleteUser(id)
        if (error) return res.status(500).json({ error: error.message })
        return res.status(200).json({ ok: true })
      }
      if (action === 'setPlan') {
        await sb.from('profiles').update({ plan }).eq('id', id)
        return res.status(200).json({ ok: true })
      }
      return res.status(400).json({ error: 'Ação inválida.' })
    } catch (e) { return res.status(500).json({ error: 'Falha na ação.' }) }
  }

  // ---- ler tudo ----
  try {
    const [{ data: profiles }, { data: sales }] = await Promise.all([
      sb.from('profiles').select('id,email,name,plan,security,created_at'),
      sb.from('sales').select('owner,total,status,created_at'),
    ])
    const allSales = sales || []
    const pagos = allSales.filter((s) => s.status === 'pago')
    const receita = pagos.reduce((a, s) => a + Number(s.total || 0), 0)
    const byOwner = {}
    for (const s of allSales) {
      const o = s.owner || 'x'
      if (!byOwner[o]) byOwner[o] = { sales: 0, receita: 0 }
      byOwner[o].sales += 1
      if (s.status === 'pago') byOwner[o].receita += Number(s.total || 0)
    }
    const accounts = (profiles || []).map((p) => ({
      email: p.email, name: p.name, plan: p.plan, security: p.security, created_at: p.created_at,
      sales: byOwner[p.id]?.sales || 0, receita: byOwner[p.id]?.receita || 0,
    })).sort((a, b) => b.receita - a.receita)
    return res.status(200).json({ totalContas: profiles?.length || 0, totalVendas: allSales.length, pagos: pagos.length, receita, accounts })
  } catch (e) {
    return res.status(500).json({ error: 'Falha ao carregar o painel.' })
  }
}
