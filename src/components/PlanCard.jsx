import Icon from './Icon.jsx'

export default function PlanCard({ plan }) {
  const { variant, recommend, tagtop, name, desc, price, priceSuffix, fee, benefits, cta } = plan
  return (
    <div className={`plan ${variant}`}>
      {recommend && <div className="recommend">{recommend}</div>}
      <div className="tagtop">{tagtop}</div>
      <h3>{name}</h3>
      <div className="desc">{desc}</div>
      <div className="price">
        {price}
        {priceSuffix && <small>{priceSuffix}</small>}
      </div>
      <div className="fee">
        <div className="fl">Taxa por pedido</div>
        <div className="fv">
          {fee.rate} <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>por pedido pago</span>
        </div>
        <div className="fn">{fee.note}</div>
      </div>
      <ul className="bens">
        <li className="bt">Benefícios incluídos</li>
        {benefits.map((b) => (
          <li className="b" key={b}>
            <Icon name="check" strokeWidth={3} />
            {b}
          </li>
        ))}
      </ul>
      <button type="button" className={`btn btn-${cta.variant} cta`}>{cta.label}</button>
    </div>
  )
}
