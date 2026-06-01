import { useState } from 'react'
import PeriodTabs from '../components/PeriodTabs.jsx'
import Icon from '../components/Icon.jsx'
import { costsBase, costsDefaults, formatBRL } from '../data.js'

function CurrencyInput({ id, label, value, onChange }) {
  return (
    <div className="cost-field">
      <label htmlFor={id}>{label}</label>
      <div className="cost-input">
        <span>R$</span>
        <input
          id={id}
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
        />
      </div>
    </div>
  )
}

export default function Custos() {
  const [period, setPeriod] = useState('mes')
  const [ads, setAds] = useState(costsDefaults.ads)
  const [gateway, setGateway] = useState(costsDefaults.gateway)
  const [outros, setOutros] = useState(costsDefaults.outros)

  const { pedidos, faturamento, checkoutRate } = costsBase
  const checkoutFee = faturamento * checkoutRate
  const totalCustos = ads + gateway + outros + checkoutFee
  const lucro = faturamento - totalCustos
  const margem = faturamento ? (lucro / faturamento) * 100 : 0

  const linhas = [
    { label: 'Faturamento bruto', value: faturamento, op: '' },
    { label: 'Custo com Ads', value: -ads, op: '−' },
    { label: 'Taxa do gateway', value: -gateway, op: '−' },
    { label: `Taxa do checkout (${(checkoutRate * 100).toFixed(1)}%)`, value: -checkoutFee, op: '−' },
    { label: 'Outros custos', value: -outros, op: '−' },
  ]

  return (
    <>
      <div className="page-head">
        <span className="pill">Taxa do checkout {(checkoutRate * 100).toFixed(1)}%</span>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      <div className="grid metrics">
        <div className="card kpi"><div className="lbl">Pedidos vendidos</div><div className="val num">{pedidos}</div><div className="kpi-sub">pagos no período</div></div>
        <div className="card kpi"><div className="lbl">Faturamento bruto</div><div className="val num">{formatBRL(faturamento)}</div><div className="kpi-sub">receita confirmada</div></div>
        <div className="card kpi"><div className="lbl">Total em custos</div><div className="val num">{formatBRL(totalCustos)}</div><div className="kpi-sub">automáticos + manuais</div></div>
        <div className="card kpi kpi-hi"><div className="lbl">Lucro líquido</div><div className="val num">{formatBRL(lucro)}</div><div className="kpi-sub">resultado final</div></div>
        <div className="card kpi"><div className="lbl">Margem de lucro</div><div className={`val num ${lucro >= 0 ? '' : 'neg'}`}>{margem.toFixed(1)}%</div><div className="kpi-sub">rentabilidade</div></div>
      </div>

      <div className="grid row2">
        <div className="card">
          <div className="card-head"><h3>Composição de custos</h3></div>

          <div className="cost-sub">Automáticos</div>
          <div className="grid cost-auto">
            <div className="cost-auto-it"><span>Pedidos vendidos</span><b className="num">{pedidos}</b></div>
            <div className="cost-auto-it"><span>Faturamento bruto</span><b className="num">{formatBRL(faturamento)}</b></div>
            <div className="cost-auto-it"><span>Taxa do checkout</span><b className="num">{formatBRL(checkoutFee)}</b></div>
          </div>

          <div className="cost-sub">Manuais <small>· edite para ver o lucro real</small></div>
          <div className="grid cost-manual">
            <CurrencyInput id="c-ads" label="Custo com Ads" value={ads} onChange={setAds} />
            <CurrencyInput id="c-gw" label="Taxa do gateway" value={gateway} onChange={setGateway} />
            <CurrencyInput id="c-out" label="Outros custos" value={outros} onChange={setOutros} />
          </div>
        </div>

        <div className="card result">
          <div className="card-head"><h3>Resultado real</h3></div>
          <div className="result-lines">
            {linhas.map((l) => (
              <div className="result-line" key={l.label}>
                <span>{l.op && <i>{l.op}</i>} {l.label}</span>
                <span className="num">{formatBRL(Math.abs(l.value))}</span>
              </div>
            ))}
            <div className={`result-line result-total${lucro >= 0 ? '' : ' neg'}`}>
              <span><Icon name="revenue" /> Lucro líquido real</span>
              <span className="num">{formatBRL(lucro)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
