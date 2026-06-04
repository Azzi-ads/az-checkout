// Helper compartilhado pelas funções /api para enviar Web Push ao vendedor (owner).
// Monta o texto (automático aleatório ou personalizado) e respeita as preferências.
import webpush from 'web-push'

export const brl = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`

// "IA" simples: variações de texto pra não chegar sempre igual.
const POOLS = {
  paid: [
    'Caiu mais uma! 🤑 {cliente} pagou {valor}',
    'Dinheiro na conta 💸 {valor} de {cliente}',
    'Venda aprovada! 🎉 {cliente} · {valor}',
    'Mais uma venda 🔥 {valor} ({cliente})',
    'Bora! 🚀 {cliente} comprou — {valor}',
    'Pix confirmado ✅ {valor} de {cliente}',
    'Toca o caixa! 🛎️ {cliente} · {valor}',
  ],
  pending: [
    'Pix gerado ⏳ {cliente} · {valor}',
    'Quase lá ⏳ {cliente} gerou um Pix de {valor}',
    'Novo Pix ⏳ {valor} — aguardando pagamento',
    'Tem cliente quente 🔥 Pix de {valor} ({cliente})',
  ],
  refunded: ['Venda reembolsada · {cliente} {valor}'],
}

function render(tpl, ctx) {
  return String(tpl || '')
    .replace(/\{cliente\}/gi, ctx.cliente)
    .replace(/\{valor\}/gi, ctx.valor)
    .replace(/\{produto\}/gi, ctx.produto)
    .trim()
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// kind: 'pending' | 'paid' | 'refunded' | 'test'  (test ignora preferências)
export async function sendPushToOwner(sb, owner, kind, ctx = {}) {
  if (!owner || !process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) return { ok: false, reason: 'vapid', sent: 0, subs: 0 }
  try {
    let prof = null
    try {
      const r = await sb.from('profiles').select('notif_pending,notif_paid,notif_mode,notif_text_paid,notif_text_pending,notif_color').eq('id', owner).maybeSingle()
      prof = r.data
    } catch { /* colunas podem não existir ainda */ }
    if (prof) {
      if (kind === 'pending' && prof.notif_pending === false) return { ok: false, reason: 'off', sent: 0, subs: 0 }
      if (kind === 'paid' && prof.notif_paid === false) return { ok: false, reason: 'off', sent: 0, subs: 0 }
    }

    const c = { cliente: ctx.name || 'Cliente', valor: brl(ctx.total), produto: ctx.product || 'Pedido' }
    const poolKey = kind === 'test' ? 'paid' : kind
    const mode = prof?.notif_mode || 'auto'
    const custom = kind === 'paid' ? prof?.notif_text_paid : kind === 'pending' ? prof?.notif_text_pending : ''
    const text = (mode === 'custom' && custom && custom.trim())
      ? render(custom, c)
      : render(pick(POOLS[poolKey] || POOLS.paid), c)
    const payload = { title: text || 'AZ Checkout', body: ctx.product || '', url: '/app', color: prof?.notif_color || '' }

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
