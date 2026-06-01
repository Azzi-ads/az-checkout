import { analyticsPeriods } from '../data.js'

// Seletor de período (Hoje / Ontem / 7 dias / Mês / Ano) — usado em Análises e Custos.
export default function PeriodTabs({ value, onChange }) {
  return (
    <div className="period" role="group" aria-label="Período">
      {analyticsPeriods.map((p) => (
        <button
          key={p.key}
          type="button"
          className={`period-btn${value === p.key ? ' on' : ''}`}
          aria-pressed={value === p.key}
          onClick={() => onChange(p.key)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
