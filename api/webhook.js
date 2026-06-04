// Webhook do BravoPay — fonte da verdade do pagamento.
// Confirma a venda e dispara o push (pago / reembolsado).
import { createClient } from '@supabase/supabase-js'
import { sendPushToOwner, brl } from '../lib/push.js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'
const STATUS_BY_EVENT = {
  'transaction.paid': 'pago',
  'transaction.refunded': 'reembolsado',
  'transaction.chargeback': 'chargeback',
}

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

    // estado anterior (para não notificar 2x — o polling do checkout pode já ter confirmado)
    const { data: rows } = await sb.from('sales').select('owner,total,customer,items,status').eq('tx_id', txId).limit(1)
    const sale = rows?.[0]
    await sb.from('sales').update({ status }).eq('tx_id', txId)
    const ctx = { name: sale?.customer?.name, total: sale?.total, product: sale?.items?.[0]?.name }

    if (sale?.owner && status === 'pago' && sale.status !== 'pago') {
      await sendPushToOwner(sb, sale.owner, 'paid', ctx)
    } else if (sale?.owner && status === 'reembolsado' && sale.status !== 'reembolsado') {
      await sendPushToOwner(sb, sale.owner, 'refunded', ctx)
    }
    return res.status(200).json({ received: true })
  } catch (e) {
    return res.status(200).json({ received: true })
  }
}
