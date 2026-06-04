// Helper compartilhado pelas funções /api para enviar Web Push ao vendedor (owner).
import webpush from 'web-push'

export async function sendPushToOwner(sb, owner, payload) {
  if (!owner || !process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) return
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@azcheckout.com', process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE)
    const { data: subs } = await sb.from('push_subscriptions').select('id,subscription').eq('owner', owner)
    await Promise.all((subs || []).map(async (row) => {
      try { await webpush.sendNotification(row.subscription, JSON.stringify(payload)) }
      catch (e) { if (e?.statusCode === 410 || e?.statusCode === 404) await sb.from('push_subscriptions').delete().eq('id', row.id) }
    }))
  } catch { /* silencioso */ }
}

export const brl = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`
