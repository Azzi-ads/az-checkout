import KPICard from '../components/KPICard.jsx'
import Icon from '../components/Icon.jsx'
import { geoReach, newsWall, rewardJourney, formatBRL } from '../data.js'
import { getUser } from '../auth.js'
import { useSales, computeMetrics, DAY } from '../metrics.js'
import { forecast, buildChartPaths } from '../forecast.js'
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

function RevenueChart({ paths }) {
  return (
    <>
      <svg className="chart" viewBox="0 0 640 220" preserveAspectRatio="none" role="img" aria-label="Faturamento dos últimos 30 dias e projeção">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(168,85,247,.34)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0)" />
          </linearGradient>
        </defs>
        <line className="gl" x1="0" y1="55" x2="640" y2="55" />
        <line className="gl" x1="0" y1="110" x2="640" y2="110" />
        <line className="gl" x1="0" y1="165" x2="640" y2="165" />
        {paths.area && <path className="area" d={paths.area} />}
        {paths.line && <path className="line" d={paths.line} />}
        {paths.projLine && <path d={paths.projLine} fill="none" stroke="var(--yellow)" strokeWidth="2" strokeDasharray="5 5" opacity="0.6" />}
        {paths.dot && <circle className="dot" cx={paths.dot.cx} cy={paths.dot.cy} r="5" />}
      </svg>
      <div className="chart-legend">
        <span><i style={{ background: 'var(--yellow)' }} />Últimos 30 dias</span>
        <span><i style={{ background: 'var(--yellow)', opacity: 0.5 }} />Projeção</span>
      </div>
    </>
  )
}

const QUICK = [
  { id: 'produtos', icon: 'plus', title: 'Criar produto', sub: 'Adicione algo pra vender', c: 'g' },
  { id: 'vendas', icon: 'vendas', title: 'Vendas', sub: 'Acompanhe seus pedidos', c: 'b' },
  { id: 'cobrancas', icon: 'revenue', title: 'Cobranças', sub: 'Taxa e recebimentos', c: 'p' },
  { id: 'checkout', icon: 'card', title: 'Checkout', sub: 'Personalize sua página', c: 'o' },
  { id: 'integracoes', icon: 'store', title: 'Integrações', sub: 'Conecte seu gateway', c: 'c' },
]

export default function Dashboard({ profile, onNav }) {
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
  const fc = forecast(sales)
  const chartPaths = buildChartPaths(fc.daily, fc.projected)
  const trendArrow = fc.trend === 'up' ? '↑' : fc.trend === 'down' ? '↓' : '→'

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
    <div className="dash">
      <div className="greeting">
        <h2>{greeting()}, {firstName(name)} 👋</h2>
        <p>Sua operação começa aqui. Crie um produto e compartilhe o checkout para ver os números aparecerem.</p>
      </div>

      <section className="dash-sec">
        <div className="dash-label">Acesso rápido</div>
        <div className="quick">
          {QUICK.map((q) => (
            <button type="button" key={q.id} className={`quick-card q-${q.c}`} onClick={() => onNav?.(q.id)}>
              <span className="quick-ic"><Icon name={q.icon} /></span>
              <b>{q.title}</b>
              <span className="quick-sub">{q.sub}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="dash-sec">
        <div className="dash-label">Resumo de hoje</div>
        <div className="grid kpis">
          {kpis.map((k) => (
            <KPICard key={k.label} {...k} />
          ))}
        </div>
      </section>

      <section className="dash-sec">
        <div className="dash-label">Projeção & desempenho</div>
        <div className="grid dash-3">
          <KPICard icon="chart" label={`Projeção do mês ${trendArrow}`} value={formatBRL(fc.projMonth)} />
          <KPICard icon="revenue" label="LTV médio (por cliente)" value={formatBRL(fc.ltv)} />
          <KPICard icon="bag" label="Produto em alta (7d)" value={fc.topProduct || '—'} />
        </div>
      </section>

      <div className="grid row2">
        <div className="card">
          <div className="card-head">
            <h3>Faturamento — 30 dias</h3>
            <span className="pill">{formatBRL(fc.daily.reduce((a, b) => a + b, 0))} no período</span>
          </div>
          <RevenueChart paths={chartPaths} />
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

      <div className="card">
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
          {news.length === 0 ? (
            <div className="empty"><Icon name="megaphone" /><p>Nenhuma novidade ainda</p><span>Os avisos da plataforma aparecem aqui.</span></div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
