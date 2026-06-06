// Event Bus leve — outros módulos podem escutar os eventos do Intent Engine.
// Eventos: intent:score-updated, intent:tier-changed, intent:discount-triggered,
//          intent:exit-triggered, intent:purchase-completed
const map = new Map()
export const bus = {
  on(ev, fn) {
    if (!map.has(ev)) map.set(ev, new Set())
    map.get(ev).add(fn)
    return () => map.get(ev)?.delete(fn)
  },
  emit(ev, data) {
    map.get(ev)?.forEach((fn) => { try { fn(data) } catch { /* ignore */ } })
  },
}
