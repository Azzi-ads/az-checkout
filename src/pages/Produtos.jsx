import Icon from '../components/Icon.jsx'
import { products } from '../data.js'

function ProductCard({ p }) {
  return (
    <div className="card prod">
      <div className="thumb"><Icon name={p.icon} strokeWidth={1.6} /></div>
      <div className="body">
        <h4>{p.name}</h4>
        {p.isNew ? (
          <div className="price" style={{ color: 'var(--muted-2)' }}>{p.priceText}</div>
        ) : (
          <div className="price num">
            {p.price}
            {p.priceSuffix && <small style={{ fontSize: 13, color: 'var(--muted)' }}>{p.priceSuffix}</small>}
          </div>
        )}
        <div className="meta">
          {p.status && (
            <span className={`tag ${p.tone}`}><span className="d" />{p.status}</span>
          )}
          <span>{p.meta}</span>
        </div>
      </div>
    </div>
  )
}

export default function Produtos() {
  return (
    <>
      <div className="card-head">
        <h3 style={{ fontSize: 18 }}>Seus produtos</h3>
        <button type="button" className="btn btn-primary"><Icon name="plus" />Adicionar produto</button>
      </div>
      <div className="grid prod-grid">
        {products.map((p) => (
          <ProductCard key={p.name} p={p} />
        ))}
      </div>
    </>
  )
}
