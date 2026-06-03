// Webhook do BravoPay — fonte da verdade do pagamento.
// Quando o gateway confirma (transaction.paid), marca a venda como paga no banco.
// Eventos: transaction.paid | transaction.refunded | transaction.chargeback
import { createClient } from '@supabase/supabase-js'

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
    if (srv && txId && status) {
      const sb = createClient(SB_URL, srv)
      await sb.from('sales').update({ status }).eq('tx_id', txId)
      // TODO(entrega): aqui é o ponto para liberar o produto / enviar e-mail de acesso.
    }
    return res.status(200).json({ received: true })
  } catch (e) {
    return res.status(200).json({ received: true })
  }
}
