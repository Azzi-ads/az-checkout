import { useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import Toggle from '../components/Toggle.jsx'
import { CheckoutView } from './Checkout.jsx'
import { ACCENTS, MODES } from '../theme.js'
import {
  CHECKOUT_MODELS, FIELD_DEFS, METHOD_DEFS, applyModel, defaultCheckout, ensureCheckout,
} from '../checkoutConfig.js'

const CATEGORIES = [
  { icon: 'p-video', label: 'Curso / vídeo' },
  { icon: 'p-doc', label: 'E-book / PDF' },
  { icon: 'p-user', label: 'Mentoria' },
  { icon: 'p-grid', label: 'Templates / pack' },
  { icon: 'p-layers', label: 'Assinatura' },
]

function newDraft() {
  return { icon: 'p-video', name: '', amount: 0, oldAmount: 0, status: 'Ativo', desc: '', image: '', bravoProductId: '', checkout: defaultCheckout('infoproduto') }
}

export default function ProductEditor({ product, onSave, onCancel }) {
  const editing = !!product
  const [draft, setDraft] = useState(() => (product ? { ...product, oldAmount: product.oldAmount || 0, checkout: ensureCheckout(product) } : newDraft()))
  const fileRef = useRef(null)

  const cfg = draft.checkout
  const setDraftF = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const setCfg = (patch) => setDraft((d) => ({ ...d, checkout: { ...d.checkout, ...patch } }))
  const setField = (k, v) => setCfg({ fields: { ...cfg.fields, [k]: v } })
  const setMethod = (k, v) => setCfg({ methods: { ...cfg.methods, [k]: v } })
  const setBump = (patch) => setCfg({ bump: { ...cfg.bump, ...patch } })

  function pickPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = () => setDraftF({ image: String(r.result) })
    r.readAsDataURL(file)
  }

  const canSave = draft.name.trim().length > 1 && Number(draft.amount) > 0

  return (
    <div className="editor">
      <div className="editor-head">
        <button type="button" className="ck-back" onClick={onCancel} aria-label="Voltar"><Icon name="arrowLeft" /></button>
        <h2>{editing ? 'Editar produto' : 'Novo produto'}</h2>
        <div className="editor-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button type="button" className="btn btn-primary" disabled={!canSave} onClick={() => onSave(draft)}>
            {editing ? 'Salvar' : 'Criar produto'}
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-form">
          {/* Produto */}
          <section className="card">
            <div className="card-head"><h3>Produto</h3></div>
            <div className="profile-photo">
              <div className="profile-av" style={{ borderRadius: 12 }}>
                {draft.image ? <img src={draft.image} alt="" /> : <Icon name={draft.icon} strokeWidth={1.4} />}
              </div>
              <div className="profile-photo-actions">
                <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}><Icon name="camera" />Foto do produto</button>
                {draft.image && <button type="button" className="btn btn-ghost" onClick={() => setDraftF({ image: '' })}><Icon name="trash" />Remover</button>}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
              </div>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label htmlFor="pe-name">Nome do produto</label>
              <input id="pe-name" value={draft.name} onChange={(e) => setDraftF({ name: e.target.value })} placeholder="Ex.: Curso de Tráfego Pago" />
            </div>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="field"><label htmlFor="pe-price">Preço (R$)</label>
                <input id="pe-price" type="number" min="0" step="0.01" value={draft.amount} onChange={(e) => setDraftF({ amount: Number(e.target.value) })} /></div>
              <div className="field"><label htmlFor="pe-old">Preço "de" (opcional)</label>
                <input id="pe-old" type="number" min="0" step="0.01" value={draft.oldAmount} onChange={(e) => setDraftF({ oldAmount: Number(e.target.value) })} /></div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="field"><label htmlFor="pe-cat">Categoria</label>
                <select id="pe-cat" value={draft.icon} onChange={(e) => setDraftF({ icon: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c.icon} value={c.icon}>{c.label}</option>)}</select></div>
              <div className="field"><label htmlFor="pe-status">Status</label>
                <select id="pe-status" value={draft.status} onChange={(e) => setDraftF({ status: e.target.value })}><option>Ativo</option><option>Rascunho</option></select></div>
            </div>
            <div className="field"><label htmlFor="pe-desc">Descrição</label>
              <input id="pe-desc" value={draft.desc} onChange={(e) => setDraftF({ desc: e.target.value })} placeholder="Breve descrição (aparece no resumo do checkout)" /></div>
          </section>

          {/* Integração de pagamento */}
          <section className="card">
            <div className="card-head"><h3>Pagamento (BravoPay)</h3></div>
            <div className="field">
              <label htmlFor="pe-bravo">ID do produto no BravoPay</label>
              <input id="pe-bravo" value={draft.bravoProductId || ''} onChange={(e) => setDraftF({ bravoProductId: e.target.value })} placeholder="Ex.: prod_xxx (do painel BravoPay)" />
              <small style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--muted-2)' }}>
                Encontre em bravopay.solutions/dashboard/produtos. Sem isso, o Pix real não é gerado.
              </small>
            </div>
          </section>

          {/* Modelo */}
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

          {/* Cores */}
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

          {/* Textos */}
          <section className="card">
            <div className="card-head"><h3>Textos</h3></div>
            <div className="field"><label htmlFor="pe-title">Título</label>
              <input id="pe-title" value={cfg.title} onChange={(e) => setCfg({ title: e.target.value })} /></div>
            <div className="field"><label htmlFor="pe-sub">Subtítulo</label>
              <input id="pe-sub" value={cfg.subtitle} onChange={(e) => setCfg({ subtitle: e.target.value })} /></div>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="field"><label htmlFor="pe-cta">Texto do botão</label>
                <input id="pe-cta" value={cfg.ctaText} onChange={(e) => setCfg({ ctaText: e.target.value })} /></div>
              <div className="field"><label htmlFor="pe-guar">Selo de garantia</label>
                <input id="pe-guar" value={cfg.guarantee} onChange={(e) => setCfg({ guarantee: e.target.value })} /></div>
            </div>
          </section>

          {/* Campos */}
          <section className="card">
            <div className="card-head"><h3>Campos do formulário</h3></div>
            {FIELD_DEFS.map((f) => (
              <Toggle key={f.key} title={f.label} on={!!cfg.fields[f.key]} onChange={(v) => setField(f.key, v)} />
            ))}
          </section>

          {/* Pagamentos */}
          <section className="card">
            <div className="card-head"><h3>Formas de pagamento</h3></div>
            {METHOD_DEFS.map((m) => (
              <Toggle key={m.key} title={m.label} on={!!cfg.methods[m.key]} onChange={(v) => setMethod(m.key, v)} />
            ))}
          </section>

          {/* Order bump + timer */}
          <section className="card">
            <div className="card-head"><h3>Order bump & extras</h3></div>
            <Toggle title="Mostrar order bump" desc="Oferta extra com 1 clique no checkout." on={cfg.bump.enabled} onChange={(v) => setBump({ enabled: v })} />
            {cfg.bump.enabled && (
              <div style={{ paddingTop: 8 }}>
                <div className="field"><label htmlFor="pe-bt">Título do bump</label>
                  <input id="pe-bt" value={cfg.bump.title} onChange={(e) => setBump({ title: e.target.value })} /></div>
                <div className="field"><label htmlFor="pe-bd">Descrição do bump</label>
                  <input id="pe-bd" value={cfg.bump.desc} onChange={(e) => setBump({ desc: e.target.value })} /></div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="field"><label htmlFor="pe-ba">Preço do bump</label>
                    <input id="pe-ba" type="number" min="0" value={cfg.bump.amount} onChange={(e) => setBump({ amount: Number(e.target.value) })} /></div>
                  <div className="field"><label htmlFor="pe-bo">Preço "de" do bump</label>
                    <input id="pe-bo" type="number" min="0" value={cfg.bump.oldAmount} onChange={(e) => setBump({ oldAmount: Number(e.target.value) })} /></div>
                </div>
              </div>
            )}
            <Toggle title="Cronômetro de escassez" desc="Mostra contagem regressiva no topo." on={cfg.timer} onChange={(v) => setCfg({ timer: v })} />
          </section>
        </div>

        {/* preview ao vivo */}
        <div className="editor-preview-wrap">
          <div className="editor-preview-label"><Icon name="bolt" /> Pré-visualização ao vivo</div>
          <div className="editor-preview">
            <CheckoutView product={draft} preview />
          </div>
        </div>
      </div>
    </div>
  )
}
