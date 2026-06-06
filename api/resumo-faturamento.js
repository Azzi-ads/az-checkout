// Resumo de faturamento — disparado pelo Vercel Cron às 9h/12h/16h/20h (BRT).
// Para cada vendedor com push ativo, envia o total faturado hoje.
import { createClient } from '@supabase/supabase-js'
import { sendPushToOwner, brl } from '../lib/push.js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

// início do dia em horário de Brasília (UTC-3), em ISO UTC
function brtTodayStartISO(now = Date.now()) {
  const brt = new Date(now - 3 * 3600000)
  const midnightUtcOfDate = Date.UTC(brt.getUTCFullYear(), brt.getUTCMonth(), brt.getUTCDate(), 0, 0, 0)
  return new Date(midnightUtcOfDate + 3 * 3600000).toISOString()
}

export default async function handler(req, res) {
  const srv = process.env.SUPABASE_SERVICE_ROLE
  if (!srv) return res.status(200).json({ skipped: 'no service role' })
  const sb = createClient(SB_URL, srv)
  try {
    const startISO = brtTodayStartISO()
    // donos que têm algum aparelho inscrito
    const { data: subs } = await sb.from('push_subscriptions').select('owner')
    const owners = [...new Set((subs || []).map((s) => s.owner).filter(Boolean))]
    let sent = 0
    for (const owner of owners) {
      const { data: rows } = await sb.from('sales').select('total').eq('owner', owner).eq('status', 'pago').gte('created_at', startISO)
      const receita = (rows || []).reduce((a, s) => a + Number(s.total || 0), 0)
      const n = rows?.length || 0
      const body = n > 0 ? `Hoje: ${brl(receita)} em ${n} venda${n > 1 ? 's' : ''}` : 'Hoje ainda sem vendas pagas — bora pro tráfego! 🚀'
      const r = await sendPushToOwner(sb, owner, 'summary', { title: 'Resumo de faturamento 📊', body })
      if (r?.sent) sent += r.sent
    }
    return res.status(200).json({ ok: true, owners: owners.length, sent })
  } catch {
    return res.status(200).json({ error: true })
  }
}
