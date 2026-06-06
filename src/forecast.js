// Previsão de receita — calculada sobre as vendas reais (sem dependências).
import { DAY } from './metrics.js'

const tsOf = (s) => (s.created_at ? new Date(s.created_at).getTime() : (s.ts || 0))

// receita paga por dia, dos últimos `days` dias (mais antigo → mais novo)
export function dailyRevenue(sales, days, now = Date.now()) {
  const paid = sales.filter((s) => s.status === 'pago')
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date(now - i * DAY); start.setHours(0, 0, 0, 0)
    const s0 = start.getTime(); const s1 = s0 + DAY
    out.push(paid.reduce((a, s) => { const t = tsOf(s); return t >= s0 && t < s1 ? a + Number(s.total || 0) : a }, 0))
  }
  return out
}

// regressão linear (mínimos quadrados) sobre os valores y (x = índice)
export function linReg(ys) {
  const n = ys.length
  if (!n) return { slope: 0, intercept: 0 }
  let sx = 0, sy = 0, sxy = 0, sx2 = 0
  ys.forEach((y, x) => { sx += x; sy += y; sxy += x * y; sx2 += x * x })
  const den = n * sx2 - sx * sx
  const slope = den ? (n * sxy - sx * sy) / den : 0
  const intercept = (sy - slope * sx) / n
  return { slope, intercept }
}

export function forecast(sales = [], now = Date.now()) {
  const daily = dailyRevenue(sales, 30, now)
  const { slope, intercept } = linReg(daily)
  const d = new Date(now)
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const remaining = Math.max(0, daysInMonth - d.getDate())
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
  const paid = sales.filter((s) => s.status === 'pago')
  const monthSoFar = paid.reduce((a, s) => (tsOf(s) >= monthStart ? a + Number(s.total || 0) : a), 0)
  const avg7 = daily.slice(-7).reduce((a, b) => a + b, 0) / 7
  const projMonth = monthSoFar + avg7 * remaining
  const trend = slope > 1 ? 'up' : slope < -1 ? 'down' : 'stable'

  const rev = paid.reduce((a, s) => a + Number(s.total || 0), 0)
  const clients = new Set(paid.map((s) => s.customer?.cpf || s.customer?.email).filter(Boolean))
  const ltv = clients.size ? rev / clients.size : 0

  const byProd = {}
  paid.filter((s) => now - tsOf(s) <= 7 * DAY).forEach((s) => { const n = s.items?.[0]?.name || 'Produto'; byProd[n] = (byProd[n] || 0) + Number(s.total || 0) })
  const topProduct = Object.entries(byProd).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  const projected = Array.from({ length: 14 }, (_, i) => Math.max(0, intercept + slope * (30 + i)))
  return { daily, projected, projMonth, trend, ltv, topProduct, hasData: paid.length > 0 }
}

// paths SVG (viewBox 640x220) a partir de daily (real) + projected (tracejado)
export function buildChartPaths(daily, projected) {
  const all = [...daily, ...projected]
  const max = Math.max(1, ...all) * 1.12
  const W = 640, base = 188, top = 18
  const N = all.length
  const x = (i) => (N > 1 ? (i * W) / (N - 1) : 0)
  const y = (v) => base - (v / max) * (base - top)
  const realLine = daily.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const li = Math.max(0, daily.length - 1)
  const area = daily.length ? `${realLine} L${x(li).toFixed(1)},${base} L0,${base} Z` : ''
  const projLine = projected.map((v, i) => `${i ? 'L' : 'M'}${x(li + i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return { area, line: realLine, projLine, dot: { cx: x(li), cy: y(daily[li] || 0) } }
}
