// Rastreio de presença "ao vivo" no checkout, via localStorage (sincroniza entre
// abas do mesmo navegador). É o que alimenta o Livex.
// TODO(roadmap): para rastrear entre dispositivos/visitantes reais, trocar por
// backend em tempo real (Vercel KV / WebSocket).
const KEY = 'az_live'
const TTL = 15000 // sem heartbeat por 15s = saiu do checkout

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
function write(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)) } catch { /* ignore */ }
}
function prune(map) {
  const now = Date.now()
  const out = {}
  for (const id of Object.keys(map)) {
    if (now - (map[id].t || 0) <= TTL) out[id] = map[id]
  }
  return out
}

export function ping(id, info) {
  const map = read()
  map[id] = { ...info, since: map[id]?.since || Date.now(), t: Date.now() }
  write(prune(map))
}
export function leave(id) {
  const map = read()
  delete map[id]
  write(map)
}
export function getLiveSessions() {
  const map = prune(read())
  write(map)
  return Object.entries(map).map(([id, v]) => ({ id, ...v }))
}
