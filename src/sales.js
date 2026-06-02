// Vendas, clientes e comprovantes (localStorage). Sem backend ainda — fica no
// navegador. TODO(roadmap): mover para banco para ser global e por vendedor.
const KEY = 'az_sales'

function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
function write(arr) { try { localStorage.setItem(KEY, JSON.stringify(arr.slice(-1000))) } catch { /* ignore */ } }

const rid = () => Math.random().toString(36).slice(2, 8).toUpperCase()

// cria uma venda; retorna o id
export function recordSale(sale) {
  const arr = read()
  const id = rid()
  arr.push({ id, ts: Date.now(), proof: null, status: 'aguardando', items: [], ...sale })
  write(arr)
  return id
}
export function updateSale(id, patch) {
  const arr = read().map((s) => (s.id === id ? { ...s, ...patch } : s))
  write(arr)
}
export function addSaleItem(id, item) {
  const arr = read().map((s) => (s.id === id ? { ...s, items: [...(s.items || []), item] } : s))
  write(arr)
}
export function getSales() { return read().slice().reverse() }

// agrupa por cliente (e-mail)
export function getClientes() {
  const map = {}
  for (const s of read()) {
    const key = (s.customer?.email || s.customer?.name || s.id).toLowerCase()
    if (!map[key]) map[key] = { customer: s.customer || {}, sales: 0, items: 0, total: 0, last: 0 }
    map[key].sales += 1
    map[key].items += (s.items || []).length
    map[key].total += s.status === 'pago' ? (s.total || 0) : 0
    map[key].last = Math.max(map[key].last, s.ts || 0)
  }
  return Object.values(map).sort((a, b) => b.last - a.last)
}
export function getComprovantes() {
  return read().filter((s) => s.proof).slice().reverse()
}
