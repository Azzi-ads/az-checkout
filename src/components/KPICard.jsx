import Icon from './Icon.jsx'

// Cartão de indicador. `icon` e `delta` são opcionais — a tela Livex usa
// só label + valor.
export default function KPICard({ icon, label, value, delta, trend, valueId }) {
  return (
    <div className="card kpi">
      {icon && (
        <div className="ic">
          <Icon name={icon} />
        </div>
      )}
      <div className="lbl">{label}</div>
      <div className="val num" id={valueId}>{value}</div>
      {delta && (
        <div className={`delta ${trend}`}>
          <Icon name={trend} strokeWidth={3} />
          {delta}
        </div>
      )}
    </div>
  )
}
