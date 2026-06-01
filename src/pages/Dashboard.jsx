import KPICard from '../components/KPICard.jsx'
import { dashboardKpis, recentSales, revenueChart } from '../data.js'

function RevenueChart() {
  const { area, line, dot, labels } = revenueChart
  return (
    <>
      <svg className="chart" viewBox="0 0 640 220" preserveAspectRatio="none" role="img" aria-label="Faturamento dos últimos 7 dias, tendência de alta">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,212,0,.34)" />
            <stop offset="100%" stopColor="rgba(255,212,0,0)" />
          </linearGradient>
        </defs>
        <line className="gl" x1="0" y1="40" x2="640" y2="40" />
        <line className="gl" x1="0" y1="95" x2="640" y2="95" />
        <line className="gl" x1="0" y1="150" x2="640" y2="150" />
        <path className="area" d={area} />
        <path className="line" d={line} />
        <circle className="dot" cx={dot.cx} cy={dot.cy} r="5" />
      </svg>
      <svg viewBox="0 0 640 20" style={{ width: '100%', height: 20 }} aria-hidden="true">
        {labels.map((l) => (
          <text className="xlab" key={l.t} x={l.x} y="14">{l.t}</text>
        ))}
      </svg>
    </>
  )
}

export default function Dashboard() {
  return (
    <>
      <div className="grid kpis">
        {dashboardKpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid row2">
        <div className="card">
          <div className="card-head">
            <h3>Faturamento — 7 dias</h3>
            <span className="pill">{revenueChart.total}</span>
          </div>
          <RevenueChart />
        </div>
        <div className="card">
          <div className="card-head"><h3>Vendas recentes</h3></div>
          <div className="feed">
            {recentSales.map((s) => (
              <div className="it" key={s.who + s.what}>
                <div className="av" aria-hidden="true">{s.initials}</div>
                <div>
                  <div className="who">{s.who}</div>
                  <div className="what">{s.what}</div>
                </div>
                <div className="amt num">{s.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
