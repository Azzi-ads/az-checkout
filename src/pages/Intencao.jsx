import { useEffect, useState } from 'react'
import KPICard from '../components/KPICard.jsx'
import Icon from '../components/Icon.jsx'
import { formatBRL } from '../data.js'
import { supabase, hasBackend } from '../supabase.js'
import { tierOf } from '../intent/intentScore.js'

const TIERS = [
  { key: 'quente', label: 'Comprador quente', range: '80–100', color: 'var(--green)' },
  { key: 'hesitando', label: 'Hesitando', range: '50–79', color: 'var(--yellow)' },
  { key: 'interessado', label: 'Interessado', range: '30–49', color: '#fb923c' },
  { key: 'abandono', label: 'Abandono iminente', range: '0–29', color: 'var(--red)' },
]
const EV_LABELS = {
  page_open: 'Abriu a página', scroll25: 'Rolou 25%', scroll50: 'Rolou 50%', scroll75: 'Rolou 75%',
  stay30: 'Ficou 30s', stay60: 'Ficou 60s', hover_pay: 'Hover no botão', click_pay: 'Clicou em pagar',
  field_focus: 'Focou num campo', fill_name: 'Preencheu nome', fill_email: 'Preencheu e-mail', fill_phone: 'Preencheu telefone',
  price_view: 'Viu o preço', price_review: 'Revisou o preço', testimonials_view: 'Viu depoimentos', guarantee_view: 'Viu garantia',
  inactive_2m: 'Inativo 2min', inactive_5m: 'Inativo 5min', tab_change: 'Trocou de aba', try_close: 'Tentou fechar', back: 'Tentou voltar',
}

const countEvents = (arr) => {
  const m = {}
  arr.forEach((s) => (s.events || []).forEach((e) => { const k = e.event || e; m[k] = (m[k] || 0) + 1 }))
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6)
}

export default function Intencao() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasBackend) { setLoading(false); return }
    let alive = true
    supabase.from('checkout_sessions').select('*').order('created_at', { ascending: false }).limit(2000)
      .then(({ data }) => { if (alive) { setSessions(data || []); setLoading(false) } })
      .catch(() => setLoading(false))
    return () => { alive = false }
  }, [])

  const total = sessions.length
  const avg = total ? Math.round(sessions.reduce((a, s) => a + (s.score || 0), 0) / total) : 0
  const conv = sessions.filter((s) => s.converted)
  const convRate = total ? Math.round((conv.length / total) * 100) : 0
  const receita = conv.reduce((a, s) => a + Number(s.conversion_value || 0), 0)

  const byTier = TIERS.map((t) => {
    const arr = sessions.filter((s) => (s.tier || tierOf(s.score)) === t.key)
    const c = arr.filter((s) => s.converted)
    return { ...t, n: arr.length, rate: arr.length ? Math.round((c.length / arr.length) * 100) : 0, receita: c.reduce((a, s) => a + Number(s.conversion_value || 0), 0) }
  })
  const maxN = Math.max(1, ...byTier.map((t) => t.n))
  const beforeBuy = countEvents(conv)
  const beforeAband = countEvents(sessions.filter((s) => !s.converted))

  if (loading) return <div className="empty"><Icon name="spark" /><p>Carregando intenção…</p></div>
  if (total === 0) return (
    <div className="card empty"><Icon name="spark" /><p>Sem dados de intenção ainda</p><span>Quando o checkout receber acessos, o comportamento dos visitantes aparece aqui.</span></div>
  )

  return (
    <>
      <div className="grid kpis">
        <KPICard icon="spark" label="Sessões" value={String(total)} />
        <KPICard icon="chart" label="Score médio" value={String(avg)} />
        <KPICard icon="bag" label="Conversão geral" value={`${convRate}%`} />
        <KPICard icon="revenue" label="Receita rastreada" value={formatBRL(receita)} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h3>Conversão por faixa de intenção</h3></div>
        <div className="intent-tiers">
          {byTier.map((t) => (
            <div className="intent-tier" key={t.key}>
              <div className="intent-tier-top"><b>{t.label}</b><span>{t.range}</span></div>
              <div className="intent-tier-bar"><div style={{ width: `${(t.n / maxN) * 100}%`, background: t.color }} /></div>
              <div className="intent-tier-meta"><span>{t.n} sessões</span><b>{t.rate}% conv.</b><span>{formatBRL(t.receita)}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid row2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-head"><h3>Antes de comprar</h3><span className="pill ok">{conv.length}</span></div>
          {beforeBuy.length === 0 ? <div className="empty"><Icon name="check" /><p>Sem conversões ainda</p></div> : (
            <div className="feed">{beforeBuy.map(([ev, n]) => (<div className="it" key={ev}><div className="who">{EV_LABELS[ev] || ev}</div><div className="amt num">{n}</div></div>))}</div>
          )}
        </div>
        <div className="card">
          <div className="card-head"><h3>Antes de abandonar</h3></div>
          {beforeAband.length === 0 ? <div className="empty"><Icon name="bag" /><p>Sem abandonos</p></div> : (
            <div className="feed">{beforeAband.map(([ev, n]) => (<div className="it" key={ev}><div className="who">{EV_LABELS[ev] || ev}</div><div className="amt num">{n}</div></div>))}</div>
          )}
        </div>
      </div>
    </>
  )
}
