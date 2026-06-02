import { useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import Toggle from '../components/Toggle.jsx'
import { CheckoutView } from './Checkout.jsx'
import { ACCENTS, MODES } from '../theme.js'
import {
  CHECKOUT_MODELS, CHECKOUT_THEMES, CHECKOUT_LAYOUTS, METHOD_DEFS,
  applyModel, ensureCheckout,
} from '../checkoutConfig.js'
import { getProducts, saveProducts } from '../store.js'

const WIDGETS = [
  { key: 'geral', label: 'Geral', icon: 'config' },
  { key: 'campos', label: 'Campos', icon: 'lines' },
  { key: 'etapas', label: 'Etapas', icon: 'chart' },
  { key: 'contador', label: 'Contador', icon: 'bolt' },
  { key: 'capa', label: 'Capa', icon: 'camera' },
  { key: 'headline', label: 'Headline', icon: 'megaphone' },
  { key: 'banners', label: 'Banners', icon: 'p-grid' },
  { key: 'quantidade', label: 'Quantidade', icon: 'bag' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'phone' },
  { key: 'depoimentos', label: 'Depoimentos', icon: 'user' },
  { key: 'frete', label: 'Frete', icon: 'produtos' },
  { key: 'cores', label: 'Cores', icon: 'palette' },
]
const FIELD_NAMES = { name: 'Nome', email: 'E-mail', phone: 'Celular / WhatsApp', cpf: 'CPF' }
const STEPS = [
  { n: 1, l: '1 etapa', d: 'Tudo em uma página.' },
  { n: 2, l: '2 etapas', d: 'Dados → Pagamento.' },
  { n: 3, l: '3 etapas', d: 'Dados → Endereço → Pagamento.' },
]

function CheckoutBuilder({ product, onSave, onBack }) {
  const [draft, setDraft] = useState(() => ({ ...product, checkout: ensureCheckout(product) }))
  const [widget, setWidget] = useState('geral')
  const cfg = draft.checkout
  const setCfg = (patch) => setDraft((d) => ({ ...d, checkout: { ...d.checkout, ...patch } }))
  const setField = (k, v) => setCfg({ fields: { ...cfg.fields, [k]: v } })
  const setMethod = (k, v) => setCfg({ methods: { ...cfg.methods, [k]: v } })
  const setBump = (patch) => setCfg({ bump: { ...cfg.bump, ...patch } })
  const logoRef = useRef(null); const bgRef = useRef(null); const topRef = useRef(null); const botRef = useRef(null)
  const readImg = (e, cb) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => cb(String(r.result)); r.readAsDataURL(f) }

  // campos
  const order = cfg.fieldOrder && cfg.fieldOrder.length ? cfg.fieldOrder : ['name', 'email', 'phone', 'cpf']
  const moveField = (i, dir) => {
    const arr = [...order]; const j = i + dir; if (j < 0 || j >= arr.length) return
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t; setCfg({ fieldOrder: arr })
  }
  const setLabel = (k, v) => setCfg({ fieldLabels: { ...cfg.fieldLabels, [k]: v } })
  // frete (múltiplo)
  const shipOpts = cfg.shipping?.options || []
  const setShipOpts = (opts) => setCfg({ shipping: { ...cfg.shipping, options: opts } })
  // depoimentos
  const tList = cfg.testimonials || []
  const setT = (list) => setCfg({ testimonials: list })

  function Controls() {
    if (widget === 'geral') return (
      <>
        <div className="field"><label>Layout</label>
          <select value={cfg.layout} onChange={(e) => setCfg({ layout: e.target.value })}>
            {CHECKOUT_LAYOUTS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}</select></div>
        <div className="field"><label>Título</label><input value={cfg.title} onChange={(e) => setCfg({ title: e.target.value })} /></div>
        <div className="field"><label>Subtítulo</label><input value={cfg.subtitle} onChange={(e) => setCfg({ subtitle: e.target.value })} /></div>
        <div className="field"><label>Texto do botão</label><input value={cfg.ctaText} onChange={(e) => setCfg({ ctaText: e.target.value })} /></div>
        <div className="field"><label>Selo de garantia</label><input value={cfg.guarantee} onChange={(e) => setCfg({ guarantee: e.target.value })} /></div>
        <div className="wgroup">Pagamentos</div>
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
    if (widget === 'campos') return (
      <>
        <p className="profile-hint" style={{ marginBottom: 12 }}>Reordene (↑/↓), renomeie e ative/desative cada campo.</p>
        {order.map((key, i) => (
          <div className="fld-row" key={key}>
            <div className="fld-move">
              <button type="button" disabled={i === 0} onClick={() => moveField(i, -1)} aria-label="Subir">↑</button>
              <button type="button" disabled={i === order.length - 1} onClick={() => moveField(i, 1)} aria-label="Descer">↓</button>
            </div>
            <input value={cfg.fieldLabels?.[key] || FIELD_NAMES[key]} onChange={(e) => setLabel(key, e.target.value)} />
            {(key === 'phone' || key === 'cpf')
              ? <button type="button" className={`fld-tog${cfg.fields[key] ? ' on' : ''}`} onClick={() => setField(key, !cfg.fields[key])}>{cfg.fields[key] ? 'Ativo' : 'Off'}</button>
              : <span className="fld-req">fixo</span>}
          </div>
        ))}
      </>
    )
    if (widget === 'etapas') return (
      <>
        <div className="model-cards">
          {STEPS.map((s) => (
            <button type="button" key={s.n} className={`model-card${(cfg.steps || 1) === s.n ? ' on' : ''}`} onClick={() => setCfg({ steps: s.n })}>
              <Icon name="chart" /><b>{s.l}</b><span>{s.d}</span>
            </button>
          ))}
        </div>
        <div className="wgroup">Endereço</div>
        <Toggle title="Pedir endereço de entrega" desc="No modo 3 etapas o endereço já é pedido." on={!!cfg.fields.address} onChange={(v) => setField('address', v)} />
      </>
    )
    if (widget === 'contador') return (
      <Toggle title="Cronômetro de escassez" desc="Contagem regressiva no topo." on={cfg.timer} onChange={(v) => setCfg({ timer: v })} />
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
          <p className="profile-hint">Sem logo, mostramos o nome do produto.</p>
        </div>
      </div>
    )
    if (widget === 'headline') return (
      <>
        <Toggle title="Headline no topo" desc="Frase de destaque acima do checkout." on={cfg.headline.enabled} onChange={(v) => setCfg({ headline: { ...cfg.headline, enabled: v } })} />
        {cfg.headline.enabled && <div className="field"><label>Texto</label><input value={cfg.headline.text} onChange={(e) => setCfg({ headline: { ...cfg.headline, text: e.target.value } })} /></div>}
      </>
    )
    if (widget === 'banners') return (
      <>
        <div className="wgroup">Banner do topo (imagem)</div>
        <div className="profile-photo-actions">
          <button type="button" className="btn btn-ghost" onClick={() => topRef.current?.click()}><Icon name="camera" />Enviar imagem</button>
          {cfg.bannerTop && <button type="button" className="btn btn-ghost" onClick={() => setCfg({ bannerTop: '' })}><Icon name="trash" />Remover</button>}
          <input ref={topRef} type="file" accept="image/*" hidden onChange={(e) => readImg(e, (v) => setCfg({ bannerTop: v }))} />
        </div>
        {cfg.bannerTop && <img className="banner-prev" src={cfg.bannerTop} alt="" />}
        <div className="wgroup">Banner do rodapé (imagem)</div>
        <div className="profile-photo-actions">
          <button type="button" className="btn btn-ghost" onClick={() => botRef.current?.click()}><Icon name="camera" />Enviar imagem</button>
          {cfg.bannerBottom && <button type="button" className="btn btn-ghost" onClick={() => setCfg({ bannerBottom: '' })}><Icon name="trash" />Remover</button>}
          <input ref={botRef} type="file" accept="image/*" hidden onChange={(e) => readImg(e, (v) => setCfg({ bannerBottom: v }))} />
        </div>
        {cfg.bannerBottom && <img className="banner-prev" src={cfg.bannerBottom} alt="" />}
      </>
    )
    if (widget === 'quantidade') return (
      <>
        <Toggle title="Permitir escolher quantidade" on={cfg.quantity.enabled} onChange={(v) => setCfg({ quantity: { ...cfg.quantity, enabled: v } })} />
        {cfg.quantity.enabled && <div className="field"><label>Quantidade máxima</label><input type="number" min="1" value={cfg.quantity.max} onChange={(e) => setCfg({ quantity: { ...cfg.quantity, max: Number(e.target.value) } })} /></div>}
      </>
    )
    if (widget === 'whatsapp') return (
      <>
        <Toggle title="Botão de WhatsApp" desc="Botão flutuante de suporte." on={cfg.whatsapp.enabled} onChange={(v) => setCfg({ whatsapp: { ...cfg.whatsapp, enabled: v } })} />
        {cfg.whatsapp.enabled && (
          <>
            <div className="field"><label>Número (com DDI)</label><input value={cfg.whatsapp.number} onChange={(e) => setCfg({ whatsapp: { ...cfg.whatsapp, number: e.target.value } })} placeholder="5511999999999" /></div>
            <div className="field"><label>Mensagem do botão</label><input value={cfg.whatsapp.text} onChange={(e) => setCfg({ whatsapp: { ...cfg.whatsapp, text: e.target.value } })} /></div>
          </>
        )}
      </>
    )
    if (widget === 'depoimentos') return (
      <>
        <p className="profile-hint" style={{ marginBottom: 12 }}>Provas sociais no checkout aumentam a confiança.</p>
        {tList.map((t, i) => (
          <div className="t-edit" key={i}>
            <div className="field"><label>Nome</label><input value={t.name} onChange={(e) => setT(tList.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} /></div>
            <div className="field"><label>Depoimento</label><input value={t.text} onChange={(e) => setT(tList.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))} /></div>
            <button type="button" className="btn btn-ghost" onClick={() => setT(tList.filter((_, idx) => idx !== i))}><Icon name="trash" />Remover</button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost" onClick={() => setT([...tList, { name: '', text: '' }])}><Icon name="plus" />Adicionar depoimento</button>
      </>
    )
    if (widget === 'frete') return (
      <>
        <Toggle title="Mostrar frete (cliente escolhe)" on={cfg.shipping.enabled} onChange={(v) => setCfg({ shipping: { ...cfg.shipping, enabled: v } })} />
        {cfg.shipping.enabled && (
          <>
            {shipOpts.map((o, i) => (
              <div className="ship-edit" key={i}>
                <div className="field"><label>Nome do frete</label><input value={o.label} onChange={(e) => setShipOpts(shipOpts.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} /></div>
                <div className="field"><label>Preço (0 = grátis)</label><input type="number" min="0" value={o.price} onChange={(e) => setShipOpts(shipOpts.map((x, idx) => idx === i ? { ...x, price: Number(e.target.value) } : x))} /></div>
                {shipOpts.length > 1 && <button type="button" className="btn btn-ghost" onClick={() => setShipOpts(shipOpts.filter((_, idx) => idx !== i))}><Icon name="trash" />Remover</button>}
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={() => setShipOpts([...shipOpts, { label: 'Novo frete', price: 0 }])}><Icon name="plus" />Adicionar opção de frete</button>
          </>
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
      <p className="area-intro">Escolha um produto para abrir o Checkout Builder e personalizar tudo.</p>
      {products.length === 0 ? (
        <div className="card empty"><Icon name="card" /><p>Nenhum produto ainda</p><span>Crie um produto na aba Produtos.</span></div>
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
