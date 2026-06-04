// Envia uma notificação de teste para o próprio vendedor logado.
// Serve de diagnóstico: diz se as chaves VAPID existem, quantos aparelhos
// estão inscritos e quantos receberam.
import { createClient } from '@supabase/supabase-js'
import { sendPushToOwner } from '../lib/push.js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const srv = process.env.SUPABASE_SERVICE_ROLE
  if (!srv) return res.status(500).json({ error: 'Backend não configurado.' })
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
    if (!token) return res.status(401).json({ error: 'Sem token.' })
    const sb = createClient(SB_URL, srv)
    const { data: u } = await sb.auth.getUser(token)
    const owner = u?.user?.id
    if (!owner) return res.status(401).json({ error: 'Token inválido.' })

    const vapid = !!(process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE)
    const { data: subs } = await sb.from('push_subscriptions').select('id').eq('owner', owner)
    const nSubs = subs?.length || 0
    if (!vapid) return res.status(200).json({ ok: false, vapid: false, subs: nSubs, sent: 0 })

    const r = await sendPushToOwner(sb, owner, 'test', { name: 'Cliente teste', total: 97, product: 'Notificação de teste' })
    return res.status(200).json({ ok: !!r?.sent, vapid: true, subs: nSubs, sent: r?.sent || 0 })
  } catch {
    return res.status(500).json({ error: 'Falha no teste.' })
  }
}
