// Alertas inteligentes — insights automáticos calculados sobre as vendas reais.
import { DAY } from './metrics.js'
import { formatBRL } from './data.js'

const META = 100000
const tsOf = (s) => (s.created_at ? new Date(s.created_at).getTime() : (s.ts || 0))
const within = (sales, ms, now) => sales.filter((s) => now - tsOf(s) <= ms)
const conv = (arr) => (arr.length ? arr.filter((s) => s.status === 'pago').length / arr.length : 0)

export function generateAlerts(sales = [], products = [], now = Date.now()) {
  const out = []
  const paid = sales.filter((s) => s.status === 'pago')

  // 1) Muitos checkouts de hoje sem pagar (abandono)
  const today = within(sales, DAY, now)
  if (today.length >= 5) {
    const aband = 1 - today.filter((s) => s.status === 'pago').length / today.length
    if (aband > 0.6) out.push({ type: 'warning', severity: 'high', title: `${Math.round(aband * 100)}% dos checkouts de hoje não foram pagos`, desc: 'Muitos Pix gerados sem pagamento — pode ser lentidão no Pix ou falta de confiança.', action: 'Confira a geração do QR e os selos de segurança.' })
  }

  // 2) Queda de conversão vs semana passada
  const wNow = within(sales, 7 * DAY, now)
  const wPrev = sales.filter((s) => now - tsOf(s) > 7 * DAY && now - tsOf(s) <= 14 * DAY)
  if (wNow.length >= 5 && wPrev.length >= 5) {
    const cN = conv(wNow); const cP = conv(wPrev)
    if (cP > 0 && cN < cP * 0.9) out.push({ type: 'warning', severity: 'high', title: `Conversão caiu ${Math.round((1 - cN / cP) * 100)}% vs semana passada`, desc: 'Possível mudança na qualidade do tráfego ou problema no checkout.', action: 'Compare as fontes de tráfego das duas semanas.' })
  }

  // 3) Taxa de reembolso alta (30d)
  const m30 = within(sales, 30 * DAY, now)
  const reemb = m30.filter((s) => s.status === 'reembolsado').length
  const paid30 = m30.filter((s) => s.status === 'pago').length
  if (paid30 >= 10 && reemb / (paid30 + reemb) > 0.05) out.push({ type: 'warning', severity: 'high', title: `Reembolsos acima do ideal (${Math.round((reemb / (paid30 + reemb)) * 100)}%)`, desc: 'Acima de 5% costuma indicar desalinhamento entre oferta e entrega.', action: 'Revise a página de vendas e o conteúdo entregue.' })

  // 4) Produto ativo sem venda há 7+ dias
  if (paid.length > 0) {
    products.filter((p) => p.status === 'Ativo').forEach((p) => {
      const last = paid.filter((s) => s.product_slug === p.slug || s.items?.[0]?.name === p.name).map(tsOf).sort((a, b) => b - a)[0]
      if (!last || now - last > 7 * DAY) out.push({ type: 'warning', severity: 'medium', title: `"${p.name}" sem vendas há 7+ dias`, desc: 'O checkout pode precisar de otimização — ou o tráfego está pausado.' })
    })
  }

  // 5) Melhor horário (7d)
  const wkPaid = wNow.filter((s) => s.status === 'pago')
  if (wkPaid.length >= 8) {
    const byHour = {}
    wkPaid.forEach((s) => { const h = new Date(tsOf(s)).getHours(); byHour[h] = (byHour[h] || 0) + 1 })
    const best = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0]
    if (best) out.push({ type: 'info', severity: 'low', title: `Seu melhor horário é ${best[0]}h`, desc: 'Concentre o tráfego pago nesse horário para maximizar o ROI.' })
  }

  // 6) Meta próxima (mês)
  const d = new Date(now)
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
  const monthRev = paid.reduce((a, s) => (tsOf(s) >= monthStart ? a + Number(s.total || 0) : a), 0)
  if (monthRev >= META * 0.8 && monthRev < META) out.push({ type: 'success', severity: 'medium', title: `Você está a ${Math.round((monthRev / META) * 100)}% da meta mensal!`, desc: `Faltam ${formatBRL(META - monthRev)} para bater R$ 100k. Bora um push de tráfego.` })

  const rank = { high: 0, medium: 1, low: 2 }
  return out.sort((a, b) => rank[a.severity] - rank[b.severity]).slice(0, 5)
}
