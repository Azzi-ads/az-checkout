import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import KPICard from '../components/KPICard.jsx'
import { formatBRL } from '../data.js'
import { isOwner } from '../auth.js'
import { useSales } from '../metrics.js'
import { planRate, planName, ratePct } from '../plans.js'
import { supabase, hasBackend } from '../supabase.js'

// horário das cobranças automáticas (ajustável depois)
const SCHEDULE_LABEL = 'Todo dia às 23h (horário de Brasília)'

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) } catch { return '' }
}

export default function Cobrancas({ profile, onGoPlanos }) {
  const sales = useSales()
  const owner = isOwner()
  const plan = owner ? 'elite' : (profile?.plan || 'start')
  const rate = owner ? 0 : planRate(plan)

  const pagos = sales.filter((s) => s.status === 'pago')
  const totalVendido = pagos.reduce((a, s) => a + Number(s.total || 0), 0)
  const baseACobrar = pagos.filter((s) => !s.fee_charged).reduce((a, s) => a + Number(s.total || 0), 0)
  const aCobrar = baseACobrar * rate
  const taxaTotal = totalVendido * rate

  const card = profile?.card
  const [history, setHistory] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!hasBackend) return
    let alive = true
    supabase.from('fee_charges').select('*').order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => { if (alive) setHistory(data || []) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  function cadastrarCartao() {
    // Será ligado ao Mercado Pago (tokenização) assim que as chaves forem configuradas.
    setMsg('Cadastro de cartão via Mercado Pago em configuração — chega no próximo passo.')
    setTimeout(() => setMsg(''), 5000)
  }

  return (
    <>
      <div className="grid row2">
        <div className="card">
          <div className="card-head"><h3>Seu plano</h3><span className="pill">{ratePct(plan)} por venda</span></div>
          <div className="bill-plan">
            <div className="bill-plan-name"><Icon name="planos" />{owner ? 'Plano Elite (dono — isento)' : planName(plan)}</div>
            <p className="ck-muted">{owner ? 'Como dono da plataforma, você não paga taxa.' : `A cada venda paga, ${ratePct(plan)} é a taxa da AZ, cobrada no seu cartão nos horários definidos.`}</p>
            {!owner && <button type="button" className="btn btn-ghost" onClick={onGoPlanos}><Icon name="planos" />Mudar de plano</button>}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Cartão de cobrança</h3>{card?.status === 'active' && <span className="pill ok">ativo</span>}</div>
          {card ? (
            <div className="bill-card">
              <div className="bill-card-face"><Icon name="card" /><b>{(card.brand || 'Cartão').toUpperCase()} •••• {card.last4}</b></div>
              <p className="ck-muted">É deste cartão que a taxa da AZ é descontada automaticamente.</p>
              <button type="button" className="btn btn-ghost" onClick={cadastrarCartao}><Icon name="refresh" />Trocar cartão</button>
            </div>
          ) : (
            <div className="bill-card">
              <div className="empty" style={{ padding: '14px 0' }}>
                <Icon name="card" />
                <p>Nenhum cartão cadastrado</p>
                <span>Cadastre um cartão para a cobrança automática da taxa.</span>
              </div>
              <button type="button" className="btn btn-primary" onClick={cadastrarCartao}><Icon name="plus" />Cadastrar cartão</button>
            </div>
          )}
          {msg && <p className="ck-muted" style={{ marginTop: 10 }}>{msg}</p>}
        </div>
      </div>

      <div className="grid kpis" style={{ marginTop: 16 }}>
        <KPICard icon="revenue" label="Total vendido (pago)" value={formatBRL(totalVendido)} />
        <KPICard icon="chart" label="Taxa acumulada total" value={formatBRL(taxaTotal)} />
        <KPICard icon="bolt" label="A cobrar agora" value={formatBRL(aCobrar)} />
        <KPICard icon="refresh" label="Próxima cobrança" value="Diária • 23h" />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h3>Histórico de cobranças</h3></div>
        {history.length === 0 ? (
          <div className="empty"><Icon name="revenue" /><p>Nenhuma cobrança ainda</p><span>As cobranças da taxa aparecem aqui quando começarem a rodar.</span></div>
        ) : (
          <div className="feed">
            {history.map((h) => (
              <div className="it" key={h.id}>
                <div className="av" aria-hidden="true"><Icon name="card" /></div>
                <div>
                  <div className="who">{formatBRL((h.amount_cents || 0) / 100)}</div>
                  <div className="what">{h.period_label || 'Taxa'} · {fmtDate(h.created_at)}</div>
                </div>
                <div className={`tag ${h.status === 'pago' ? 'pago' : h.status === 'falhou' ? 'reemb' : 'pend'}`}><span className="d" />{h.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
