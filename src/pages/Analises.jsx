import { useState } from 'react'
import PeriodTabs from '../components/PeriodTabs.jsx'
import {
  analyticsKpis, abandonedSeries,
  checkoutJourney, operationHealth,
} from '../data.js'

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
            <stop offset="0%" stopColor="rgba(255,212,0,.28)" />
            <stop offset="100%" stopColor="rgba(255,212,0,0)" />
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

  return (
    <>
      <div className="page-head">
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      <div className="grid metrics">
        {analyticsKpis.map((k) => (
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
