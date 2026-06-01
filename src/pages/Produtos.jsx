import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { formatBRL } from '../data.js'
import { getProducts, saveProducts } from '../store.js'
import ProductForm from './ProductForm.jsx'

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'produto'
}
function uniqueSlug(base, products) {
  let slug = base, i = 2
  while (products.some((p) => p.slug === slug)) slug = `${base}-${i++}`
  return slug
}

function CheckoutLinkRow({ slug }) {
  const [copied, setCopied] = useState(false)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  function copy() {
    navigator.clipboard?.writeText(`${origin}/checkout/${slug}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="prod-foot">
      <Link className="prod-link" to={`/checkout/${slug}`}>Ver checkout<Icon name="arrowLeft" strokeWidth={2.4} /></Link>
      <button type="button" className="prod-copy" onClick={copy} title="Copiar link do checkout">
        <Icon name={copied ? 'check' : 'copy'} />{copied ? 'Copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}

function ProductCard({ p, onEdit, onDelete }) {
  return (
    <div className="card prod">
      <div className="thumb">{p.image ? <img src={p.image} alt="" /> : <Icon name={p.icon} strokeWidth={1.6} />}</div>
      <div className="prod-tools">
        <button type="button" onClick={() => onEdit(p)} aria-label={`Editar ${p.name}`} title="Editar"><Icon name="edit" /></button>
        <button type="button" className="del" onClick={() => onDelete(p)} aria-label={`Apagar ${p.name}`} title="Apagar"><Icon name="trash" /></button>
      </div>
      <div className="body">
        <h4>{p.name}</h4>
        <div className="price num">{p.price}{p.priceSuffix && <small style={{ fontSize: 13, color: 'var(--muted)' }}>{p.priceSuffix}</small>}</div>
        <div className="meta">
          <span className={`tag ${p.tone}`}><span className="d" />{p.status}</span>
          <span>{p.meta}</span>
        </div>
        <CheckoutLinkRow slug={p.slug} />
      </div>
    </div>
  )
}

export default function Produtos() {
  const [products, setProducts] = useState(() => getProducts())
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  function persist(next) { setProducts(next); saveProducts(next) }
  function openNew() { setEditing(null); setModal(true) }
  function openEdit(p) { setEditing(p); setModal(true) }

  function handleSave(draft) {
    const price = formatBRL(Number(draft.amount))
    const tone = draft.status === 'Ativo' ? 'pago' : 'pend'
    const base = { ...draft, amount: Number(draft.amount), oldAmount: Number(draft.oldAmount) || undefined, price, tone }
    let next
    if (draft.slug) {
      next = products.map((p) => (p.slug === draft.slug ? { ...base } : p))
    } else {
      const slug = uniqueSlug(slugify(draft.name), products)
      next = [{ ...base, slug, meta: '0 vendas' }, ...products]
    }
    persist(next)
    setModal(false)
  }

  function handleDelete(p) {
    if (!window.confirm(`Apagar "${p.name}"? Essa ação não pode ser desfeita.`)) return
    persist(products.filter((x) => x.slug !== p.slug))
  }

  return (
    <>
      <div className="card-head">
        <h3 style={{ fontSize: 17 }}>Seus produtos</h3>
        <button type="button" className="btn btn-primary" onClick={openNew}><Icon name="plus" />Adicionar produto</button>
      </div>

      {products.length === 0 ? (
        <div className="card empty">
          <Icon name="produtos" />
          <p>Você ainda não tem produtos</p>
          <span>Crie seu primeiro produto. Depois é só personalizar o checkout na aba Checkout.</span>
          <button type="button" className="btn btn-primary" style={{ marginTop: 14 }} onClick={openNew}><Icon name="plus" />Criar primeiro produto</button>
        </div>
      ) : (
        <div className="grid prod-grid">
          {products.map((p) => <ProductCard key={p.slug} p={p} onEdit={openEdit} onDelete={handleDelete} />)}
        </div>
      )}

      {modal && <ProductForm product={editing} onSave={handleSave} onClose={() => setModal(false)} />}
    </>
  )
}
