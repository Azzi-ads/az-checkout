// Presença "ao vivo" no checkout via Supabase Realtime Presence.
// Funciona entre dispositivos/visitantes reais (não depende de localStorage).
// Canal por vendedor: `live:<ownerUid>`.
import { supabase, hasBackend } from './supabase.js'

// Comprador: entra na presença do checkout do vendedor (owner).
// getInfo() devolve { step, product, value } e é chamado a cada atualização.
export function joinCheckoutPresence(owner, getInfo) {
  if (!hasBackend || !owner) return { update() {}, leave() {} }
  const key = `v_${Math.random().toString(36).slice(2, 10)}`
  const since = Date.now()
  const ch = supabase.channel(`live:${owner}`, { config: { presence: { key } } })
  let joined = false
  ch.subscribe(async (st) => {
    if (st === 'SUBSCRIBED') {
      joined = true
      try { await ch.track({ ...getInfo(), since }) } catch { /* ignore */ }
    }
  })
  return {
    async update(info) { if (joined) { try { await ch.track({ ...info, since }) } catch { /* ignore */ } } },
    leave() { try { supabase.removeChannel(ch) } catch { /* ignore */ } },
  }
}

// Vendedor: observa quem está no seu checkout agora. onChange recebe a lista.
export function watchCheckoutPresence(owner, onChange) {
  if (!hasBackend || !owner) return () => {}
  const ch = supabase.channel(`live:${owner}`, { config: { presence: { key: `watch_${Math.random().toString(36).slice(2, 8)}` } } })
  const emit = () => {
    const state = ch.presenceState()
    const list = []
    for (const k of Object.keys(state)) {
      const metas = state[k] || []
      const m = metas[metas.length - 1] || {}
      if (m.role === 'watch') continue // ignora outros observadores
      list.push({ id: k, ...m })
    }
    onChange(list)
  }
  ch.on('presence', { event: 'sync' }, emit)
  ch.on('presence', { event: 'join' }, emit)
  ch.on('presence', { event: 'leave' }, emit)
  ch.subscribe((st) => { if (st === 'SUBSCRIBED') { ch.track({ role: 'watch' }); emit() } })
  return () => { try { supabase.removeChannel(ch) } catch { /* ignore */ } }
}
