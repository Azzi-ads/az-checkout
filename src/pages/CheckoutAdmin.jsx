import { useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import Toggle from '../components/Toggle.jsx'
import { CheckoutView } from './Checkout.jsx'
import { ACCENTS, MODES } from '../theme.js'
import {
  CHECKOUT_MODELS, CHECKOUT_THEMES, CHECKOUT_LAYOUTS,
  FIELD_DEFS, METHOD_DEFS, applyModel, ensureCheckout,
} from '../checkoutConfig.js'
import { getProducts, saveProducts } from '../store.js'

const WIDGETS = [
  { key: 'geral', label: 'Geral', icon: 'config' },
  { key: 'contador', label: 'Contador', icon: 'bolt' },
  { key: 'capa', label: 'Capa', icon: 'camera' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'phone' },
  { key: 'banner', label: 'Banner', icon: 'megaphone' },
  { key: 'depoimentos', label: 'Depoimentos', icon: 'user' },
  { key: 'frete', label: 'Frete', icon: 'produtos' },
  { key: 'cores', label: 'Cores', icon: 'palette' },
]

function CheckoutBuilder({ product, onSave, onBack }) {
  const [draft, setDraft] = useState(() => ({ ...product, checkout: ensureCheckout(product) }))
  const [widget, setWidget] = useState('geral')
  const cfg = draft.checkout
  const setCfg = (patch) => setDraft((d) => ({ ...d, checkout: { ...d.checkout, ...patch } }))
  const setField = (k, v) => setCfg({ fields: { ...cfg.fields, [k]: v } })
  const setMethod = (k, v) => setCfg({ methods: { ...cfg.methods, [k]: v } })
  const setBump = (patch) => setCfg({ bump: { ...cfg.bump, ...patch } })
  const logoRef = useRef(null)
  const bgRef = useRef(null)
  const readImg = (e, cb) => {
    const f = e.target.files?.[0]; if (!f) return
    const r = new FileReader(); r.onload = () => cb(String(r.result)); r.readAsDataURL(f)
  }
  // depoimentos
  const tList = cfg.testimonials || []
  const setT = (list) => setCfg({ testimonials: list })
  const addT = () => setT([...tList, { name: '', text: '' }])
  const updT = (i, patch) => setT(tList.map((t, idx) => (idx === i ? { ...t, ...patch } : t)))
  const delT = (i) => setT(tList.filter((_, idx) => idx !== i))

  function Controls() {
    if (widget === 'geral') return (
      <>
        <div className="field"><label>Layout</label>
          <select value={cfg.layout} onChange={(e) => setCfg({ layout: e.target.value })}>
            {CHECKOUT_LAYOUTS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
          </select></div>
        <div className="field"><label>Título</label><input value={cfg.title} onChange={(e) => setCfg({ title: e.target.value })} /></div>
        <div className="field"><label>Subtítulo</label><input value={cfg.subtitle} onChange={(e) => setCfg({ subtitle: e.target.value })} /></div>
        <div className="field"><label>Texto do botão</label><input value={cfg.ctaText} onChange={(e) => setCfg({ ctaText: e.target.value })} /></div>
        <div className="field"><label>Selo de garantia</label><input value={cfg.guarantee} onChange={(e) => setCfg({ guarantee: e.target.value })} /></div>
        <div className="wgroup">Campos do formulário</div>
        {FIELD_DEFS.map((f) => <Toggle key={f.key} title={f.label} on={!!cfg.fields[f.key]} onChange={(v) => setField(f.key, v)} />)}
        <div className="wgroup">Formas de pagamento</div>
        {METHOD_DEFS.map((m) => <Toggle key={m.key} title={m.label} on={!!cfg.methods[m.key]} onChange={(v) => setMethod(m.key, v)} />)}
        <div className="wgroup">Order bump</div>
        <Toggle title="Mostrar order bump" on={cfg.bump.enabled} onChange={(v) => setBump({ enabled: v })} />
        {cfg.bump.enabled && (
          <>
            <div className="field"><label>Título do bump</label><input value={cfg.bump.title} onChange={(e) => setBump({ title: e.target.value })} /></div>
            <div className="ck-row">
              <div className="field"><label>Preço</label><input type="number" min="0" value={cfg.bump.amount} onChange={(e) => setBump({ amount: Number(e.target.value) })} /></div>
              <div className="field"><label>Preço "de"</label><input type="number" min="0" value={cfg.bump.oldAmount} onChange={(e) => setBump({ oldAmount: Number(e.target.value) })} /></div>
            </div>
          </>
        )}
        <div className="wgroup">Avançado</div>
        <Toggle title="Valor livre" desc="Cliente escolhe quanto pagar." on={cfg.valorLivre} onChange={(v) => setCfg({ valorLivre: v })} />
      </>
    )
    if (widget === 'contador') return (
      <Toggle title="Cronômetro de escassez" desc="Mostra contagem regressiva no topo do checkout." on={cfg.timer} onChange={(v) => setCfg({ timer: v })} />
    )
    if (widget === 'capa') return (
      <div className="profile-photo">
        <div className="profile-av" style={{ borderRadius: 12, width: 60, height: 60, flexBasis: 60 }}>
          {cfg.logo ? <img src={cfg.logo} alt="" /> : <Icon name="camera" />}
        </div>
        <div className="profile-photo-actions">
          <button type="button" className="btn btn-ghost" onClick={() => logoRef.current?.click()}><Icon name="camera" />Logo do checkout</button>
          {cfg.logo && <button type="button" className="btn btn-ghost" onClick={() => setCfg({ logo: '' })}><Icon name="trash" />Remover</button>}
          <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => readImg(e, (v) => setCfg({ logo: v }))} />
          <p className="profile-hint">Sem logo, mostramos o nome do produto. A logo da AZ não aparece.</p>
        </div>
      </div>
    )
    if (widget === 'whatsapp') return (
      <>
        <Toggle title="Botão de WhatsApp" desc="Botão flutuante de suporte no checkout." on={cfg.whatsapp.enabled} onChange={(v) => setCfg({ whatsapp: { ...cfg.whatsapp, enabled: v } })} />
        {cfg.whatsapp.enabled && (
          <>
            <div className="field"><label>Número (com DDI)</label><input value={cfg.whatsapp.number} onChange={(e) => setCfg({ whatsapp: { ...cfg.whatsapp, number: e.target.value } })} placeholder="5511999999999" /></div>
            <div className="field"><label>Mensagem do botão</label><input value={cfg.whatsapp.text} onChange={(e) => setCfg({ whatsapp: { ...cfg.whatsapp, text: e.target.value } })} /></div>
          </>
        )}
      </>
    )
    if (widget === 'banner') return (
      <>
        <Toggle title="Banner no topo" desc="Faixa de aviso no topo do checkout." on={cfg.banner.enabled} onChange={(v) => setCfg({ banner: { ...cfg.banner, enabled: v } })} />
        {cfg.banner.enabled && <div className="field"><label>Texto do banner</label><input value={cfg.banner.text} onChange={(e) => setCfg({ banner: { ...cfg.banner, text: e.target.value } })} /></div>}
      </>
    )
    if (widget === 'depoimentos') return (
      <>
        <p className="profile-hint" style={{ marginBottom: 12 }}>Mostre provas sociais no checkout para aumentar a confiança.</p>
        {tList.map((t, i) => (
          <div className="t-edit" key={i}>
            <div className="field"><label>Nome</label><input value={t.name} onChange={(e) => updT(i, { name: e.target.value })} placeholder="Ex.: Ana S." /></div>
            <div className="field"><label>Depoimento</label><input value={t.text} onChange={(e) => updT(i, { text: e.target.value })} placeholder="O que essa pessoa disse" /></div>
            <button type="button" className="btn btn-ghost" onClick={() => delT(i)}><Icon name="trash" />Remover</button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost" onClick={addT}><Icon name="plus" />Adicionar depoimento</button>
      </>
    )
    if (widget === 'frete') return (
      <>
        <Toggle title="Mostrar frete" desc="Linha de frete no resumo (para produtos físicos)." on={cfg.frete.enabled} onChange={(v) => setCfg({ frete: { ...cfg.frete, enabled: v } })} />
        {cfg.frete.enabled && (
          <div className="ck-row">
            <div className="field"><label>Rótulo</label><input value={cfg.frete.label} onChange={(e) => setCfg({ frete: { ...cfg.frete, label: e.target.value } })} /></div>
            <div className="field"><label>Valor (0 = grátis)</label><input type="number" min="0" value={cfg.frete.price} onChange={(e) => setCfg({ frete: { ...cfg.frete, price: Number(e.target.value) } })} /></div>
          </div>
        )}
      </>
    )
    if (widget === 'cores') return (
      <>
        <div className="wgroup">Temas</div>
        <div className="theme-grid">
          {CHECKOUT_THEMES.map((t) => {
            const on = (cfg.bg || '') === t.bg && cfg.accent.toLowerCase() === t.accent.toLowerCase()
            return (
              <button type="button" key={t.key} className={`theme-card${on ? ' on' : ''}`} onClick={() => setCfg({ bg: t.bg, accent: t.accent, theme: t.mode })}>
                <span className="theme-prev" style={{ background: t.bg || 'var(--bg)' }}><i style={{ background: t.accent }} /></span><b>{t.label}</b>
              </button>
            )
          })}
        </div>
        <div className="wgroup">Cor de destaque</div>
        <div className="swatches">
          {ACCENTS.map((a) => (
            <button type="button" key={a.key} className={`swatch${cfg.accent.toLowerCase() === a.color.toLowerCase() ? ' on' : ''}`} style={{ background: a.color }} aria-label={a.label} onClick={() => setCfg({ accent: a.color })}>
              {cfg.accent.toLowerCase() === a.color.toLowerCase() && <Icon name="check" strokeWidth={3} />}
            </button>
          ))}
          <label className="swatch swatch-custom" title="Cor personalizada"><Icon name="palette" /><input type="color" value={cfg.accent} onChange={(e) => setCfg({ accent: e.target.value })} /></label>
        </div>
        <div className="wgroup">Modo</div>
        <div className="appear-modes">
          {MODES.map((m) => (
            <button type="button" key={m.key} className={`appear-mode${cfg.theme === m.key ? ' on' : ''}`} onClick={() => setCfg({ theme: m.key })}>
              <span className={`appear-mode-prev ${m.key}`} aria-hidden="true"><i /><i /></span>{m.label}
            </button>
          ))}
        </div>
        <div className="wgroup">Imagem de fundo</div>
        <div className="profile-photo-actions">
          <button type="button" className="btn btn-ghost" onClick={() => bgRef.current?.click()}><Icon name="camera" />Enviar imagem</button>
          {cfg.bg && String(cfg.bg).startsWith('url(') && <button type="button" className="btn btn-ghost" onClick={() => setCfg({ bg: '' })}><Icon name="trash" />Remover</button>}
          <input ref={bgRef} type="file" accept="image/*" hidden onChange={(e) => readImg(e, (v) => setCfg({ bg: `url(${v})` }))} />
        </div>
      </>
    )
    return null
  }

  return (
    <div className="builder">
      <div className="builder-top">
        <button type="button" className="ck-back" onClick={onBack} aria-label="Voltar"><Icon name="arrowLeft" /></button>
        <h2>Checkout Builder</h2>
        <div className="builder-model">
          <span>Modelo</span>
          <select value={cfg.model} onChange={(e) => setDraft((d) => ({ ...d, checkout: applyModel(d.checkout, e.target.value) }))}>
            {CHECKOUT_MODELS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => onSave(draft)}><Icon name="check" />Salvar alterações</button>
      </div>

      <div className="builder-grid">
        <nav className="builder-nav" aria-label="Widgets">
          <div className="wnav-title">Widgets</div>
          {WIDGETS.map((w) => (
            <button type="button" key={w.key} className={`wnav-item${widget === w.key ? ' on' : ''}`} onClick={() => setWidget(w.key)}>
              <Icon name={w.icon} />{w.label}
            </button>
          ))}
        </nav>

        <div className="builder-ctrl">
          <div className="builder-ctrl-head">{WIDGETS.find((w) => w.key === widget)?.label}</div>
          {Controls()}
        </div>

        <div className="builder-preview">
          <div className="editor-preview-label"><Icon name="bolt" /> Preview ao vivo</div>
          <div className="editor-preview"><CheckoutView product={draft} preview /></div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutAdmin() {
  const [products, setProducts] = useState(() => getProducts())
  const [slug, setSlug] = useState(null)
  const selected = products.find((p) => p.slug === slug)

  function handleSave(draft) {
    const next = products.map((p) => (p.slug === draft.slug ? { ...draft } : p))
    setProducts(next); saveProducts(next); setSlug(null)
  }

  if (selected) return <CheckoutBuilder product={selected} onSave={handleSave} onBack={() => setSlug(null)} />

  return (
    <>
      <p className="area-intro">Escolha um produto para abrir o Checkout Builder e personalizar tudo: modelo, widgets, cores e fundo.</p>
      {products.length === 0 ? (
        <div className="card empty">
          <Icon name="card" /><p>Nenhum produto ainda</p><span>Crie um produto na aba Produtos para personalizar o checkout.</span>
        </div>
      ) : (
        <div className="grid pick-grid">
          {products.map((p) => (
            <button type="button" className="card pick-card" key={p.slug} onClick={() => setSlug(p.slug)}>
              <div className="pick-thumb">{p.image ? <img src={p.image} alt="" /> : <Icon name={p.icon} strokeWidth={1.6} />}</div>
              <div className="pick-body"><b>{p.name}</b><span>{p.price}</span></div>
              <span className="pick-cta"><Icon name="edit" />Personalizar</span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
