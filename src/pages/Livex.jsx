import { useEffect, useState } from 'react'
import KPICard from '../components/KPICard.jsx'
import DataTable from '../components/DataTable.jsx'
import Icon from '../components/Icon.jsx'
import { livexKpis, livexSessions, livexFunnel } from '../data.js'
import { getLiveSessions } from '../liveTracker.js'

function since(ms) {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000))
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
}

export default function Livex({ live }) {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    const tick = () => setSessions(getLiveSessions())
    tick()
    const id = setInterval(tick, 2000)
    window.addEventListener('storage', tick)
    return () => { clearInterval(id); window.removeEventListener('storage', tick) }
  }, [])

  const kpis = livexKpis.map((k) => {
    if (k.id === 'noCheckout') return { ...k, value: String(live.atCheckout) }
    if (k.id === 'emPagamento') return { ...k, value: String(live.atPayment) }
    return k
  })

  const rows = sessions.map((s) => ({
    visitor: `Visitante #${s.id}`,
    product: s.product || '—',
    step: { label: s.step || 'Dados', tone: s.step === 'Pagamento' ? 'pend' : 'pago' },
    time: since(s.since),
    value: s.value || '—',
  }))

  return (
    <>
      <div className="live-hero">
        <div className="live-ring">
          <span className="pulse" aria-hidden="true" />
          <b aria-hidden="true">{live.atCheckout}</b>
        </div>
        <div className="txt">
          <span className="live-now"><span className="dot" aria-hidden="true" />AO VIVO AGORA</span>
          <h3>Pessoas no checkout neste momento</h3>
          <p aria-live="polite">
            <span className="sr-only">{live.atCheckout} pessoas no checkout agora. </span>
            Acompanhe em tempo real quem está finalizando uma compra e onde cada pessoa está parada no fluxo.
          </p>
        </div>
      </div>

      <div className="grid kpis" style={{ marginTop: 16 }}>
        {kpis.map((k) => <KPICard key={k.label} {...k} />)}
      </div>

      <div className="grid row2">
        <div className="card">
          <div className="card-head">
            <h3>Sessões ativas</h3>
            <span className="pill">Atualiza em tempo real</span>
          </div>
          {rows.length === 0 ? (
            <div className="empty"><Icon name="livex" /><p>Ninguém no checkout agora</p><span>Abra um checkout (ex.: em outra aba) que a pessoa aparece aqui ao vivo.</span></div>
          ) : (
            <DataTable columns={livexSessions.columns} rows={rows} caption="Sessões ativas no checkout" />
          )}
        </div>
        <div className="card">
          <div className="card-head"><h3>Funil ao vivo</h3></div>
          <div className="funnel">
            {livexFunnel.map((step) => (
              <div className="step" key={step.name}>
                <div className="nm">{step.name}</div>
                <div className="bar"><div className="fill" style={{ width: `${step.width}%` }}>{step.value}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
