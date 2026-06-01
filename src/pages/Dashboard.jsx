import KPICard from '../components/KPICard.jsx'
import Icon from '../components/Icon.jsx'
import { dashboardKpis, recentSales, revenueChart, geoReach, newsWall } from '../data.js'
import { getUser } from '../auth.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function firstName(name = '') {
  return name.trim().split(/\s+/)[0] || 'por aqui'
}

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

export default function Dashboard({ profile }) {
  const name = profile?.name || getUser()?.name
  return (
    <>
      <div className="greeting">
        <h2>{greeting()}, {firstName(name)} 👋</h2>
        <p>Sua operação começa aqui. Crie um produto e compartilhe o checkout para ver os números aparecerem.</p>
      </div>

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
          {recentSales.length === 0 ? (
            <div className="empty"><Icon name="bag" /><p>Nenhuma venda ainda</p><span>Suas vendas aparecem aqui em tempo real.</span></div>
          ) : (
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
          )}
        </div>
      </div>

      <div className="grid row2">
        <div className="card">
          <div className="card-head">
            <h3>Alcance geográfico</h3>
            <span className="pill">Últimos 30 dias</span>
          </div>
          {geoReach.length === 0 ? (
            <div className="empty"><Icon name="produtos" /><p>Sem visitantes ainda</p><span>O alcance por região aparece quando seu checkout receber acessos.</span></div>
          ) : (
            <div className="geo">
              {geoReach.map((g) => (
                <div className="geo-row" key={g.region}>
                  <div className="geo-nm">{g.region}</div>
                  <div className="geo-bar"><div className="geo-fill" style={{ width: `${g.pct}%` }} /></div>
                  <div className="geo-val num">{g.visitors}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-head"><h3>Mural de novidades</h3></div>
          <div className="news">
            {newsWall.map((n) => (
              <div className={`news-it${n.desc ? ' news-feat' : ''}`} key={n.title}>
                {n.desc ? (
                  <>
                    <div className="news-ic"><Icon name="megaphone" /></div>
                    <div>
                      <span className="news-tag">{n.tag}</span>
                      <b>{n.title}</b>
                      <p>{n.desc}</p>
                      <span className="news-time">{n.time}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <b>{n.title}</b>
                    <span className="news-time">{n.time}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
