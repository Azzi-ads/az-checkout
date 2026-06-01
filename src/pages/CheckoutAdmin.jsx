import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import Toggle from '../components/Toggle.jsx'
import { CheckoutView } from './Checkout.jsx'
import { ACCENTS, MODES } from '../theme.js'
import { CHECKOUT_MODELS, FIELD_DEFS, METHOD_DEFS, applyModel, ensureCheckout } from '../checkoutConfig.js'
import { getProducts, saveProducts } from '../store.js'

/* ---------- editor de checkout de UM produto ---------- */
function CheckoutCustomizer({ product, onSave, onBack }) {
  const [draft, setDraft] = useState(() => ({ ...product, checkout: ensureCheckout(product) }))
  const cfg = draft.checkout
  const setCfg = (patch) => setDraft((d) => ({ ...d, checkout: { ...d.checkout, ...patch } }))
  const setField = (k, v) => setCfg({ fields: { ...cfg.fields, [k]: v } })
  const setMethod = (k, v) => setCfg({ methods: { ...cfg.methods, [k]: v } })
  const setBump = (patch) => setCfg({ bump: { ...cfg.bump, ...patch } })

  return (
    <div className="editor">
      <div className="editor-head">
        <button type="button" className="ck-back" onClick={onBack} aria-label="Voltar"><Icon name="arrowLeft" /></button>
        <h2>Checkout — {product.name}</h2>
        <div className="editor-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>Voltar</button>
          <button type="button" className="btn btn-primary" onClick={() => onSave(draft)}>Salvar checkout</button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-form">
          <section className="card">
            <div className="card-head"><h3>Modelo de checkout</h3></div>
            <div className="model-cards">
              {CHECKOUT_MODELS.map((m) => (
                <button type="button" key={m.key} className={`model-card${cfg.model === m.key ? ' on' : ''}`} onClick={() => setDraft((d) => ({ ...d, checkout: applyModel(d.checkout, m.key) }))}>
                  <Icon name={m.icon} /><b>{m.label}</b><span>{m.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-head"><h3>Cores do checkout</h3></div>
            <div className="swatches">
              {ACCENTS.map((a) => (
                <button type="button" key={a.key} className={`swatch${cfg.accent.toLowerCase() === a.color.toLowerCase() ? ' on' : ''}`} style={{ background: a.color }} aria-label={a.label} onClick={() => setCfg({ accent: a.color })}>
                  {cfg.accent.toLowerCase() === a.color.toLowerCase() && <Icon name="check" strokeWidth={3} />}
                </button>
              ))}
              <label className="swatch swatch-custom" title="Cor personalizada"><Icon name="palette" />
                <input type="color" value={cfg.accent} onChange={(e) => setCfg({ accent: e.target.value })} aria-label="Cor personalizada" /></label>
            </div>
            <div className="appear-modes" style={{ marginTop: 16 }}>
              {MODES.map((m) => (
                <button type="button" key={m.key} className={`appear-mode${cfg.theme === m.key ? ' on' : ''}`} onClick={() => setCfg({ theme: m.key })}>
                  <span className={`appear-mode-prev ${m.key}`} aria-hidden="true"><i /><i /></span>{m.label}
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-head"><h3>Textos</h3></div>
            <div className="field"><label htmlFor="ce-title">Título</label>
              <input id="ce-title" value={cfg.title} onChange={(e) => setCfg({ title: e.target.value })} /></div>
            <div className="field"><label htmlFor="ce-sub">Subtítulo</label>
              <input id="ce-sub" value={cfg.subtitle} onChange={(e) => setCfg({ subtitle: e.target.value })} /></div>
            <div className="ck-row">
              <div className="field"><label htmlFor="ce-cta">Texto do botão</label>
                <input id="ce-cta" value={cfg.ctaText} onChange={(e) => setCfg({ ctaText: e.target.value })} /></div>
              <div className="field"><label htmlFor="ce-guar">Selo de garantia</label>
                <input id="ce-guar" value={cfg.guarantee} onChange={(e) => setCfg({ guarantee: e.target.value })} /></div>
            </div>
          </section>

          <section className="card">
            <div className="card-head"><h3>Campos do formulário</h3></div>
            {FIELD_DEFS.map((f) => <Toggle key={f.key} title={f.label} on={!!cfg.fields[f.key]} onChange={(v) => setField(f.key, v)} />)}
          </section>

          <section className="card">
            <div className="card-head"><h3>Formas de pagamento</h3></div>
            {METHOD_DEFS.map((m) => <Toggle key={m.key} title={m.label} on={!!cfg.methods[m.key]} onChange={(v) => setMethod(m.key, v)} />)}
          </section>

          <section className="card">
            <div className="card-head"><h3>Order bump & extras</h3></div>
            <Toggle title="Mostrar order bump" desc="Oferta extra com 1 clique no checkout." on={cfg.bump.enabled} onChange={(v) => setBump({ enabled: v })} />
            {cfg.bump.enabled && (
              <div style={{ paddingTop: 8 }}>
                <div className="field"><label htmlFor="ce-bt">Título do bump</label>
                  <input id="ce-bt" value={cfg.bump.title} onChange={(e) => setBump({ title: e.target.value })} /></div>
                <div className="field"><label htmlFor="ce-bd">Descrição do bump</label>
                  <input id="ce-bd" value={cfg.bump.desc} onChange={(e) => setBump({ desc: e.target.value })} /></div>
                <div className="ck-row">
                  <div className="field"><label htmlFor="ce-ba">Preço do bump</label>
                    <input id="ce-ba" type="number" min="0" value={cfg.bump.amount} onChange={(e) => setBump({ amount: Number(e.target.value) })} /></div>
                  <div className="field"><label htmlFor="ce-bo">Preço "de" do bump</label>
                    <input id="ce-bo" type="number" min="0" value={cfg.bump.oldAmount} onChange={(e) => setBump({ oldAmount: Number(e.target.value) })} /></div>
                </div>
              </div>
            )}
            <Toggle title="Cronômetro de escassez" desc="Contagem regressiva no topo." on={cfg.timer} onChange={(v) => setCfg({ timer: v })} />
          </section>
        </div>

        <div className="editor-preview-wrap">
          <div className="editor-preview-label"><Icon name="bolt" /> Pré-visualização ao vivo</div>
          <div className="editor-preview"><CheckoutView product={draft} preview /></div>
        </div>
      </div>
    </div>
  )
}

/* ---------- aba Checkout: escolher produto ---------- */
export default function CheckoutAdmin() {
  const [products, setProducts] = useState(() => getProducts())
  const [slug, setSlug] = useState(null)
  const selected = products.find((p) => p.slug === slug)

  function handleSave(draft) {
    const next = products.map((p) => (p.slug === draft.slug ? { ...draft } : p))
    setProducts(next)
    saveProducts(next)
    setSlug(null)
  }

  if (selected) {
    return <CheckoutCustomizer product={selected} onSave={handleSave} onBack={() => setSlug(null)} />
  }

  return (
    <>
      <p className="area-intro">Escolha um produto para personalizar o checkout dele: modelo, cores, textos, campos, pagamentos e order bump.</p>
      {products.length === 0 ? (
        <div className="card empty">
          <Icon name="card" />
          <p>Nenhum produto ainda</p>
          <span>Crie um produto na aba Produtos para personalizar o checkout.</span>
        </div>
      ) : (
        <div className="grid pick-grid">
          {products.map((p) => (
            <button type="button" className="card pick-card" key={p.slug} onClick={() => setSlug(p.slug)}>
              <div className="pick-thumb">{p.image ? <img src={p.image} alt="" /> : <Icon name={p.icon} strokeWidth={1.6} />}</div>
              <div className="pick-body">
                <b>{p.name}</b>
                <span>{p.price}</span>
              </div>
              <span className="pick-cta"><Icon name="edit" />Personalizar</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
