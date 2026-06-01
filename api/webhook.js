// Função serverless (Vercel) — recebe os webhooks do BravoPay.
// Eventos: transaction.created | transaction.paid | transaction.refunded | transaction.chargeback
//
// IMPORTANTE (produção): a confirmação de venda deve vir DAQUI (não confie só no
// polling do cliente). Hoje não há banco de dados, então só registramos o evento.
// TODO(roadmap): validar autenticidade + persistir o pedido como pago no banco.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { event, transaction } = req.body || {}
    console.log('[BravoPay webhook]', event, transaction?.id, transaction?.amount_cents)
    // aqui: marcar pedido como pago / enviar acesso, quando houver banco
    return res.status(200).json({ received: true })
  } catch (e) {
    return res.status(200).json({ received: true })
  }
}
