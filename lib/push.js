// Helper compartilhado pelas funções /api para enviar Web Push ao vendedor (owner).
// Monta o texto (automático aleatório ou personalizado) e respeita as preferências.
import webpush from 'web-push'

export const brl = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

// Títulos padrão (simples e claros)
const STD = { pending: 'Venda Pendente', paid: 'Venda Aprovada', refunded: 'Venda Reembolsada', test: 'Notificação de teste' }

function render(tpl, ctx) {
  return String(tpl || '')
    .replace(/\{cliente\}/gi, ctx.cliente)
    .replace(/\{valor\}/gi, ctx.valor)
    .replace(/\{produto\}/gi, ctx.produto)
    .trim()
}

// kind: 'pending' | 'paid' | 'refunded' | 'test' | 'summary'
// ctx.title/ctx.body (quando passados) sobrescrevem o texto (usado no resumo).
export async function sendPushToOwner(sb, owner, kind, ctx = {}) {
  if (!owner || !process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) return { ok: false, reason: 'vapid', sent: 0, subs: 0 }
  try {
    let prof = null
    try {
      const r = await sb.from('profiles').select('notif_pending,notif_paid,notif_summary,notif_mode,notif_text_paid,notif_text_pending,notif_color').eq('id', owner).maybeSingle()
      prof = r.data
    } catch { /* colunas podem não existir ainda */ }
    if (prof) {
      if (kind === 'pending' && prof.notif_pending === false) return { ok: false, reason: 'off', sent: 0, subs: 0 }
      if (kind === 'paid' && prof.notif_paid === false) return { ok: false, reason: 'off', sent: 0, subs: 0 }
      if (kind === 'summary' && prof.notif_summary === false) return { ok: false, reason: 'off', sent: 0, subs: 0 }
    }

    let title, body
    if (ctx.title) {
      title = ctx.title; body = ctx.body || ''
    } else {
      const c = { cliente: ctx.name || 'Cliente', valor: brl(ctx.total), produto: ctx.product || 'Pedido' }
      const mode = prof?.notif_mode || 'auto'
      const custom = kind === 'paid' ? prof?.notif_text_paid : kind === 'pending' ? prof?.notif_text_pending : ''
      if (mode === 'custom' && custom && custom.trim()) { title = render(custom, c); body = ctx.product || '' }
      else { title = STD[kind] || STD.paid; body = ctx.name ? `${c.valor} · ${c.cliente}` : c.valor }
    }
    const payload = { title: title || 'AZ Checkout', body: body || '', url: '/app', color: prof?.notif_color || '' }

    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@azcheckout.com', process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE)
    const { data: subs } = await sb.from('push_subscriptions').select('id,subscription').eq('owner', owner)
    let sent = 0
    await Promise.all((subs || []).map(async (row) => {
      try { await webpush.sendNotification(row.subscription, JSON.stringify(payload)); sent++ }
      catch (e) { if (e?.statusCode === 410 || e?.statusCode === 404) await sb.from('push_subscriptions').delete().eq('id', row.id) }
    }))
    return { ok: true, sent, subs: subs?.length || 0 }
  } catch { return { ok: false, reason: 'error', sent: 0, subs: 0 } }
}
