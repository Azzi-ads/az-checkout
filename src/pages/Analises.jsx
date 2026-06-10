import { useMemo, useState } from 'react'
import PeriodTabs from '../components/PeriodTabs.jsx'
import Icon from '../components/Icon.jsx'
import { abandonedSeries, checkoutJourney, operationHealth, formatBRL } from '../data.js'
import { useSales, computeMetrics, DAY } from '../metrics.js'
import { generateAlerts } from '../alerts.js'
import { getProducts } from '../store.js'

const WIN = { hoje: DAY, ontem: DAY, '7d': 7 * DAY, mes: 30 * DAY, ano: 365 * DAY }

// Gráfico de linhas: abandonados vs finalizados.
function AbandonedChart() {
  const { labels, finalizados, abandonados } = abandonedSeries
  const W = 640, H = 190, pad = 16
  const max = (Math.max(...abandonados, ...finalizados) || 1) * 1.1
  const x = (i) => (i * (W - pad * 2)) / (labels.length - 1) + pad
  const y = (v) => H - 24 - (v / max) * (H - 44)
  const path = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = (arr) => `${path(arr)} L${x(arr.length - 1)},${H - 24} L${x(0)},${H - 24} Z`
  return (
    <>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Carrinhos abandonados versus finalizados nos últimos 7 dias">
        <defs>
          <linearGradient id="ab" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(168,85,247,.28)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} className="gl" x1="0" y1={(H - 24) * g + 10} x2={W} y2={(H - 24) * g + 10} />
        ))}
        <path className="area" d={area(abandonados)} fill="url(#ab)" />
        <path d={path(abandonados)} fill="none" stroke="var(--yellow)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={path(finalizados)} fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="chart-legend">
        <span><i style={{ background: 'var(--yellow)' }} />Abandonados</span>
        <span><i style={{ background: 'var(--green)' }} />Finalizados</span>
      </div>
    </>
  )
}

export default function Analises() {
  const [period, setPeriod] = useState('hoje')
  const sales = useSales()
  const alerts = useMemo(() => generateAlerts(sales, getProducts()), [sales])
  const m = computeMetrics(sales, WIN[period] || DAY)
  const kpis = [
    { key: 'vendas', label: 'Vendas Geradas', value: formatBRL(m.receita), sub: `${m.pagos} pedidos`, highlight: true },
    { key: 'receita', label: 'Receita Confirmada', value: formatBRL(m.receita), sub: `${m.pagos} pagos` },
    { key: 'ticket', label: 'Ticket Médio', value: formatBRL(m.ticket) },
    { key: 'conv', label: 'Conversão Checkout', value: `${m.conv}%`, sub: `${m.total} criados` },
    { key: 'abandono', label: 'Carrinhos Abandonados', value: String(m.abandonos), sub: `${m.total ? Math.round((m.abandonos / m.total) * 100) : 0}% abandono` },
  ]

  return (
    <>
      <div className="page-head">
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      <div className="card insights" style={{ marginBottom: 16 }}>
        <div className="card-head"><h3>Insights</h3><span className="pill">{alerts.length}</span></div>
        {alerts.length === 0 ? (
          <div className="empty"><Icon name="check" /><p>Tudo certo!</p><span>Sua operação está saudável — sem alertas no momento.</span></div>
        ) : (
          <div className="insight-list">
            {alerts.map((a, i) => (
              <div className={`insight insight-${a.type}`} key={i}>
                <div className="insight-ic"><Icon name={a.type === 'success' ? 'check' : a.type === 'info' ? 'bolt' : 'shield'} /></div>
                <div className="insight-body">
                  <b>{a.title}</b>
                  <p>{a.desc}</p>
                  {a.action && <span className="insight-act"><Icon name="bolt" />{a.action}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid metrics">
        {kpis.map((k) => (
          <div className={`card kpi${k.highlight ? ' kpi-hi' : ''}`} key={k.key}>
            <div className="lbl">{k.label}</div>
            <div className="val num">{k.value}</div>
            {k.sub && <div className="kpi-sub">{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid row2">
        <div className="card">
          <div className="card-head">
            <h3>Carrinhos abandonados</h3>
            <span className="pill">0% de abandono</span>
          </div>
          <AbandonedChart />
        </div>
        <div className="card">
          <div className="card-head"><h3>Jornada do checkout</h3></div>
          <div className="funnel">
            {checkoutJourney.map((s) => (
              <div className="step" key={s.step}>
                <div className="nm">{s.step}</div>
                <div className="bar"><div className="fill" style={{ width: `${s.pct}%` }}>{s.value}</div></div>
              </div>
            ))}
          </div>
          <div className="funnel-foot">
            Conversão total <b className="num">0%</b>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h3>Saúde da operação</h3></div>
        <div className="grid health">
          {operationHealth.map((h) => (
            <div className="health-item" key={h.label}>
              <div className="lbl">{h.label}</div>
              <div className="val num">{h.value}</div>
              <div className={`delta ${h.trend}`}>{h.delta}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
