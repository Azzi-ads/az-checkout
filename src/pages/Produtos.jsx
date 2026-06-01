import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { formatBRL } from '../data.js'
import { getProducts, saveProducts } from '../store.js'

const CATEGORIES = [
  { icon: 'p-video', label: 'Curso / vídeo' },
  { icon: 'p-doc', label: 'E-book / PDF' },
  { icon: 'p-user', label: 'Mentoria' },
  { icon: 'p-grid', label: 'Templates / pack' },
  { icon: 'p-layers', label: 'Assinatura' },
]

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'produto'
}
function uniqueSlug(base, products) {
  let slug = base, i = 2
  while (products.some((p) => p.slug === slug)) slug = `${base}-${i++}`
  return slug
}

const EMPTY_FORM = { name: '', amount: '', desc: '', icon: 'p-video', status: 'Ativo' }

function ProductCard({ p, onDelete }) {
  return (
    <div className="card prod">
      <div className="thumb"><Icon name={p.icon} strokeWidth={1.6} /></div>
      <button type="button" className="prod-del" onClick={() => onDelete(p)} aria-label={`Apagar ${p.name}`} title="Apagar">
        <Icon name="trash" />
      </button>
      <div className="body">
        <h4>{p.name}</h4>
        <div className="price num">
          {p.price}{p.priceSuffix && <small style={{ fontSize: 13, color: 'var(--muted)' }}>{p.priceSuffix}</small>}
        </div>
        <div className="meta">
          <span className={`tag ${p.tone}`}><span className="d" />{p.status}</span>
          <span>{p.meta}</span>
        </div>
        <Link className="prod-link" to={`/checkout/${p.slug}`}>Ver checkout<Icon name="arrowLeft" strokeWidth={2.4} /></Link>
      </div>
    </div>
  )
}

function NewProductModal({ onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const amount = Number(form.amount) || 0
  const canCreate = form.name.trim().length > 1 && amount > 0

  function submit(e) {
    e.preventDefault()
    if (!canCreate) return
    onCreate({
      name: form.name.trim(),
      amount,
      icon: form.icon,
      status: form.status,
      desc: form.desc.trim(),
    })
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="np-title" onSubmit={submit}>
        <div className="modal-head">
          <h3 id="np-title">Novo produto</h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Fechar"><Icon name="close" /></button>
        </div>

        <div className="ck-field">
          <label htmlFor="np-name">Nome do produto</label>
          <div className="ck-input"><input id="np-name" value={form.name} onChange={set('name')} placeholder="Ex.: Curso de Tráfego Pago" autoFocus /></div>
        </div>
        <div className="ck-row">
          <div className="ck-field">
            <label htmlFor="np-price">Preço</label>
            <div className="ck-input"><span style={{ color: 'var(--muted-2)', fontWeight: 700 }}>R$</span>
              <input id="np-price" type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0,00" /></div>
          </div>
          <div className="ck-field">
            <label htmlFor="np-status">Status</label>
            <div className="ck-input"><select id="np-status" value={form.status} onChange={set('status')}>
              <option>Ativo</option><option>Rascunho</option></select></div>
          </div>
        </div>
        <div className="ck-field">
          <label htmlFor="np-cat">Categoria</label>
          <div className="ck-input"><select id="np-cat" value={form.icon} onChange={set('icon')}>
            {CATEGORIES.map((c) => <option key={c.icon} value={c.icon}>{c.label}</option>)}</select></div>
        </div>
        <div className="ck-field">
          <label htmlFor="np-desc">Descrição (opcional)</label>
          <div className="ck-input"><input id="np-desc" value={form.desc} onChange={set('desc')} placeholder="Breve descrição do produto" /></div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={!canCreate}>Criar produto</button>
        </div>
      </form>
    </div>
  )
}

export default function Produtos() {
  const [products, setProducts] = useState(() => getProducts())
  const [modal, setModal] = useState(false)

  function persist(next) {
    setProducts(next)
    saveProducts(next)
  }

  function handleCreate(data) {
    const slug = uniqueSlug(slugify(data.name), products)
    const product = {
      icon: data.icon,
      slug,
      name: data.name,
      price: formatBRL(data.amount),
      amount: data.amount,
      tone: data.status === 'Ativo' ? 'pago' : 'pend',
      status: data.status,
      meta: '0 vendas',
      desc: data.desc,
    }
    persist([product, ...products])
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
        <button type="button" className="btn btn-primary" onClick={() => setModal(true)}>
          <Icon name="plus" />Adicionar produto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="card empty">
          <Icon name="produtos" />
          <p>Você ainda não tem produtos</p>
          <span>Crie seu primeiro produto para gerar um checkout.</span>
          <button type="button" className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => setModal(true)}>
            <Icon name="plus" />Criar primeiro produto
          </button>
        </div>
      ) : (
        <div className="grid prod-grid">
          {products.map((p) => (
            <ProductCard key={p.slug} p={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal && <NewProductModal onClose={() => setModal(false)} onCreate={handleCreate} />}
    </>
  )
}
