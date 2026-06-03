// Webhook do BravoPay — fonte da verdade do pagamento.
// Confirma a venda no banco e DISPARA o push (notificação com o app fechado).
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'
const STATUS_BY_EVENT = {
  'transaction.paid': 'pago',
  'transaction.refunded': 'reembolsado',
  'transaction.chargeback': 'chargeback',
}

const brl = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { event, transaction } = req.body || {}
    const txId = transaction?.id
    const status = STATUS_BY_EVENT[event]
    console.log('[BravoPay webhook]', event, txId)

    const srv = process.env.SUPABASE_SERVICE_ROLE
    if (!srv || !txId || !status) return res.status(200).json({ received: true })
    const sb = createClient(SB_URL, srv)

    // marca a venda e pega o dono + dados
    await sb.from('sales').update({ status }).eq('tx_id', txId)
    const { data: rows } = await sb.from('sales').select('owner,total,customer').eq('tx_id', txId).limit(1)
    const sale = rows?.[0]

    // dispara push só quando pago e VAPID configurado
    if (status === 'pago' && sale?.owner && process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE) {
      webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@azcheckout.com', process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE)
      const { data: subs } = await sb.from('push_subscriptions').select('id,subscription').eq('owner', sale.owner)
      const payload = JSON.stringify({ title: 'Venda aprovada! 🎉', body: `${sale.customer?.name || 'Cliente'} · ${brl(sale.total)}`, url: '/app' })
      await Promise.all((subs || []).map(async (row) => {
        try { await webpush.sendNotification(row.subscription, payload) }
        catch (err) { if (err?.statusCode === 410 || err?.statusCode === 404) await sb.from('push_subscriptions').delete().eq('id', row.id) }
      }))
    }
    return res.status(200).json({ received: true })
  } catch (e) {
    return res.status(200).json({ received: true })
  }
}
