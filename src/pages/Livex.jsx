import KPICard from '../components/KPICard.jsx'
import DataTable from '../components/DataTable.jsx'
import Icon from '../components/Icon.jsx'
import { livexKpis, livexSessions, livexFunnel } from '../data.js'

export default function Livex({ live }) {
  // Substitui os valores dinâmicos vindos do contador ao vivo.
  const kpis = livexKpis.map((k) => {
    if (k.id === 'noCheckout') return { ...k, value: String(live.atCheckout) }
    if (k.id === 'emPagamento') return { ...k, value: String(live.atPayment) }
    return k
  })

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
        {kpis.map((k) => (
          <KPICard key={k.label} {...k} />
        ))}
      </div>

      <div className="grid row2">
        <div className="card">
          <div className="card-head">
            <h3>Sessões ativas</h3>
            <span className="pill">Atualiza em tempo real</span>
          </div>
          {livexSessions.rows.length === 0 ? (
            <div className="empty"><Icon name="livex" /><p>Ninguém no checkout agora</p><span>As sessões ativas aparecem aqui em tempo real.</span></div>
          ) : (
            <DataTable columns={livexSessions.columns} rows={livexSessions.rows} caption="Sessões ativas no checkout" />
          )}
        </div>
        <div className="card">
          <div className="card-head"><h3>Funil ao vivo</h3></div>
          <div className="funnel">
            {livexFunnel.map((step) => (
              <div className="step" key={step.name}>
                <div className="nm">{step.name}</div>
                <div className="bar">
                  <div className="fill" style={{ width: `${step.width}%` }}>{step.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
