import KPICard from '../components/KPICard.jsx'
import Icon from '../components/Icon.jsx'
import { revenueChart, geoReach, newsWall, rewardJourney, formatBRL } from '../data.js'
import { getUser } from '../auth.js'
import { useSales, computeMetrics, DAY } from '../metrics.js'
import { supabase, hasBackend } from '../supabase.js'
import { useEffect, useState } from 'react'

const ini = (n = '') => (n.trim().split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join('') || '?').toUpperCase()
function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)}d`
}

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
  const sales = useSales()
  const hoje = computeMetrics(sales, DAY)
  const tudo = computeMetrics(sales)
  const kpis = [
    { icon: 'revenue', label: 'Faturamento hoje', value: formatBRL(hoje.receita) },
    { icon: 'bag', label: 'Pedidos pagos', value: String(tudo.pagos) },
    { icon: 'lines', label: 'Ticket médio', value: formatBRL(tudo.ticket) },
    { icon: 'chart', label: 'Taxa de conversão', value: `${tudo.conv}%` },
  ]
  const recent = [...sales]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5)
    .map((s) => ({ initials: ini(s.customer?.name), who: s.customer?.name || 'Cliente', what: s.items?.[0]?.name || 'Pedido', amount: formatBRL(s.total || 0) }))
  const pendentes = [...sales]
    .filter((s) => s.status === 'aguardando')
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 6)

  const [news, setNews] = useState(newsWall)
  useEffect(() => {
    if (!hasBackend) return
    let alive = true
    const load = async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(8)
      if (alive && data && data.length) setNews(data.map((r) => ({ tag: r.tag, title: r.title, desc: r.body || '', time: relTime(r.created_at) })))
    }
    load()
    const ch = supabase.channel('novidades-rt').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, load).subscribe()
    return () => { alive = false; supabase.removeChannel(ch) }
  }, [])

  return (
    <>
      <div className="greeting">
        <h2>{greeting()}, {firstName(name)} 👋</h2>
        <p>Sua operação começa aqui. Crie um produto e compartilhe o checkout para ver os números aparecerem.</p>
      </div>

      <div className="card journey-card">
        <div className="card-head">
          <h3>Jornada de premiação</h3>
          <span className="pill">R$ {Math.round(rewardJourney.current / 1000)}k / {Math.round(rewardJourney.goal / 1000)}k</span>
        </div>
        <div className="journey-track">
          <div className="journey-fill" style={{ width: `${Math.min(100, (rewardJourney.current / rewardJourney.goal) * 100)}%` }} />
          {rewardJourney.milestones.map((m) => {
            const unlocked = rewardJourney.current >= m.value
            return (
              <div className="journey-node" key={m.value} style={{ left: `${(m.value / rewardJourney.goal) * 100}%` }}>
                <span className={`journey-dot${unlocked ? ' on' : ''}`}><Icon name="bolt" /></span>
                <b>{m.label}</b>
                <span>{m.prize}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid kpis">
        {kpis.map((k) => (
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
          {recent.length === 0 ? (
            <div className="empty"><Icon name="bag" /><p>Nenhuma venda ainda</p><span>Suas vendas aparecem aqui em tempo real.</span></div>
          ) : (
            <div className="feed">
              {recent.map((s) => (
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

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h3>Vendas pendentes</h3><span className="pill">{pendentes.length}</span></div>
        {pendentes.length === 0 ? (
          <div className="empty"><Icon name="bag" /><p>Nenhuma venda pendente</p><span>Pix gerados que ainda não foram pagos aparecem aqui.</span></div>
        ) : (
          <div className="feed">
            {pendentes.map((s) => (
              <div className="it" key={s.id}>
                <div className="av" aria-hidden="true">{ini(s.customer?.name)}</div>
                <div>
                  <div className="who">{s.customer?.name || 'Cliente'}</div>
                  <div className="what">{s.items?.[0]?.name || 'Pedido'} · aguardando pagamento</div>
                </div>
                <div className="amt num">{formatBRL(s.total || 0)}</div>
              </div>
            ))}
          </div>
        )}
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
            {news.map((n) => (
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
