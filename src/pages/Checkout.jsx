import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { products as seedProducts, checkoutDescriptions, installments, formatBRL } from '../data.js'
import { getProducts } from '../store.js'
import { themeVars } from '../theme.js'
import { ensureCheckout } from '../checkoutConfig.js'

/* máscaras */
const d = (s) => s.replace(/\D/g, '')
const maskCPF = (s) => d(s).slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
const maskPhone = (s) => d(s).slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
const maskCard = (s) => d(s).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
const maskExp = (s) => d(s).slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2')
const maskCVV = (s) => d(s).slice(0, 4)
const maskCEP = (s) => d(s).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')

const METHOD_META = {
  pix: { label: 'Pix', icon: 'pix', note: 'Aprovação na hora' },
  card: { label: 'Cartão', icon: 'card', note: 'Em até 12x' },
  boleto: { label: 'Boleto', icon: 'barcode', note: '1-2 dias úteis' },
}

// captura UTMs e click ids da URL para enviar ao gateway (rastreio de campanha)
function getTracking() {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  const v = (k) => p.get(k) || undefined
  return {
    utm: { source: v('utm_source'), medium: v('utm_medium'), campaign: v('utm_campaign'), content: v('utm_content'), term: v('utm_term') },
    fbclid: v('fbclid'), ttclid: v('ttclid'), gclid: v('gclid'),
  }
}

function Field({ id, label, icon, hint, ...rest }) {
  return (
    <div className="ck-field">
      <label htmlFor={id}>{label}</label>
      <div className="ck-input">{icon && <Icon name={icon} />}<input id={id} {...rest} /></div>
      {hint && <small>{hint}</small>}
    </div>
  )
}

function FakeQR() {
  const cells = []
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) {
    const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
    const on = corner ? (x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5)) : ((x * 7 + y * 13) % 3 === 0)
    if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
  }
  return (
    <svg className="ck-qr" viewBox="0 0 21 21" role="img" aria-label="QR Code Pix (exemplo)">
      <rect x="0" y="0" width="21" height="21" fill="#fff" /><g fill="#000">{cells}</g>
    </svg>
  )
}

/* moldura: página inteira ou preview embutido */
function Frame({ children, preview, styleVars, showTimer, mmss }) {
  if (preview) {
    return (
      <div className="ck-preview" style={styleVars}>
        <div className="ck-preview-top">
          <img className="ck-logo" src="/logo-wide.png" alt="AZ Checkout" />
          <span className="ck-safe"><Icon name="lock" />Compra segura</span>
        </div>
        <div className="ck-preview-body">{children}</div>
      </div>
    )
  }
  return (
    <div className="ck-page" style={styleVars}>
      {showTimer && (
        <div className="ck-timer"><Icon name="bolt" /> Oferta por tempo limitado — expira em <b className="num">{mmss}</b></div>
      )}
      <header className="ck-top">
        <img className="ck-logo" src="/logo-wide.png" alt="AZ Checkout" width="1921" height="819" />
        <span className="ck-safe"><Icon name="lock" />Compra segura</span>
      </header>
      <main className="ck-body">{children}</main>
      <footer className="ck-foot"><span>© AZ Checkout</span><span>·</span><span>Pagamento processado com segurança</span></footer>
    </div>
  )
}

export function CheckoutView({ product, preview = false }) {
  const cfg = ensureCheckout(product)
  const styleVars = themeVars({ accent: cfg.accent, mode: cfg.theme })
  const isRapido = cfg.model === 'rapido'

  const methods = useMemo(
    () => Object.keys(cfg.methods).filter((k) => cfg.methods[k]).map((k) => ({ key: k, ...METHOD_META[k] })),
    [cfg.methods],
  )
  const [method, setMethod] = useState(methods[0]?.key || 'pix')
  const [data, setData] = useState({ name: '', email: '', phone: '', cpf: '' })
  const [addr, setAddr] = useState({ cep: '', rua: '', numero: '', bairro: '', cidade: '', uf: '' })
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvv: '', parc: 1 })
  const [bump, setBump] = useState(false)
  const [status, setStatus] = useState('form')
  const [copied, setCopied] = useState(false)
  const [secs, setSecs] = useState(9 * 60 + 59)
  const [pixData, setPixData] = useState(null) // { id, qr_code, qr_code_image } do BravoPay
  const [loading, setLoading] = useState(false)
  const [payError, setPayError] = useState('')

  useEffect(() => {
    if (!cfg.timer || preview) return
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [cfg.timer, preview])
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  const description = checkoutDescriptions[product.slug] || product.desc || 'Acesso imediato após o pagamento'
  const total = product.amount + (bump && cfg.bump.enabled ? cfg.bump.amount : 0)
  const parcelas = useMemo(() => installments(total), [total])

  const emailOk = /\S+@\S+\.\S+/.test(data.email)
  const cpfOk = !cfg.fields.cpf || data.cpf.length >= 14
  const addrOk = !cfg.fields.address || (addr.cep.length >= 9 && addr.rua && addr.numero && addr.cidade && addr.uf)
  const cardOk = isRapido || method !== 'card' || (card.number.length >= 18 && card.name.trim() && card.exp.length === 5 && card.cvv.length >= 3)
  const canPay = emailOk && (isRapido || data.name.trim().length > 2) && cpfOk && addrOk && cardOk

  const set = (k) => (e) => setData((s) => ({ ...s, [k]: e.target.value }))
  const setA = (k) => (e) => setAddr((s) => ({ ...s, [k]: e.target.value }))

  async function pay(e) {
    e.preventDefault()
    if (!canPay || loading) return
    const goPix = isRapido || method === 'pix'

    // Preview do editor: não chama o gateway de verdade (usa mock visual).
    if (preview) {
      setStatus(goPix ? 'pix' : 'paid')
      return
    }

    if (goPix) {
      if (!product.bravoProductId) {
        setPayError('Este produto ainda não está ligado ao BravoPay. Vá em Produtos → Editar e preencha o "ID do produto no BravoPay".')
        return
      }
      setLoading(true); setPayError('')
      try {
        const resp = await fetch('/api/criar-pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: product.bravoProductId,
            amount_cents: Math.round(total * 100),
            customer: { name: data.name, email: data.email, phone: d(data.phone), cpf: d(data.cpf) },
            ...getTracking(),
          }),
        })
        const json = await resp.json()
        if (!resp.ok) throw new Error(json.error || 'Não foi possível gerar o Pix.')
        setPixData(json)
        setStatus('pix')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (err) {
        setPayError(err.message)
      } finally {
        setLoading(false)
      }
    } else {
      // Cartão/boleto ainda não integrados de verdade (a doc cobre PIX). Mock por enquanto.
      setStatus('paid')
    }
  }

  function copyPix() {
    const code = pixData?.qr_code || ''
    if (code) navigator.clipboard?.writeText(code)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // Polling: enquanto aguarda o Pix, consulta o status a cada 3s.
  useEffect(() => {
    if (preview || status !== 'pix' || !pixData?.id) return
    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/status?id=${encodeURIComponent(pixData.id)}`)
        const j = await r.json()
        if (j.status === 'PAID') { clearInterval(id); setStatus('paid') }
        else if (['EXPIRED', 'FAILED', 'CANCELED'].includes(j.status)) {
          clearInterval(id); setPayError(`Pagamento ${j.status.toLowerCase()}.`); setStatus('form'); setPixData(null)
        }
      } catch { /* tenta de novo no próximo ciclo */ }
    }, 3000)
    return () => clearInterval(id)
  }, [status, pixData, preview])

  const trust = [
    { icon: 'shield', title: 'Compra 100% segura', desc: 'Seus dados são criptografados.' },
    { icon: 'refresh', title: cfg.guarantee, desc: 'Não gostou? Devolvemos seu dinheiro.' },
    { icon: 'bolt', title: 'Acesso imediato', desc: 'Liberação automática após o pagamento.' },
  ]

  const Resumo = (
    <aside className="ck-summary card">
      <div className="ck-prod">
        <div className="ck-prod-thumb">
          {product.image ? <img src={product.image} alt="" /> : <Icon name={product.icon} strokeWidth={1.6} />}
        </div>
        <div><h3>{product.name}</h3><p>{description}</p></div>
      </div>
      <div className="ck-lines">
        <div className="ck-line"><span>{product.name}</span><span className="num">{product.oldAmount && <s>{formatBRL(product.oldAmount)}</s>} {formatBRL(product.amount)}</span></div>
        {bump && cfg.bump.enabled && <div className="ck-line"><span>+ {cfg.bump.title}</span><span className="num">{formatBRL(cfg.bump.amount)}</span></div>}
        <div className="ck-line ck-total"><span>Total</span><span className="num">{formatBRL(total)}</span></div>
      </div>
      <ul className="ck-trust">
        {trust.map((t) => (<li key={t.title}><Icon name={t.icon} /><div><b>{t.title}</b><span>{t.desc}</span></div></li>))}
      </ul>
    </aside>
  )

  /* Pix gerado */
  if (status === 'pix') {
    return (
      <Frame preview={preview} styleVars={styleVars} showTimer={cfg.timer} mmss={mmss}>
        <div className="ck-grid">
          <div className="card ck-pixbox">
            <span className="ck-badge"><span className="dot" />Aguardando pagamento</span>
            <h2>Pague com Pix para liberar na hora</h2>
            <p className="ck-muted">Abra o app do seu banco, escaneie o QR Code ou use o Pix copia e cola.</p>
            {pixData?.qr_code_image
              ? <img className="ck-qr" src={pixData.qr_code_image} alt="QR Code Pix" />
              : <FakeQR />}
            {pixData?.qr_code && <div className="ck-pixcode">{pixData.qr_code}</div>}
            <button type="button" className={`btn ${copied ? 'btn-ghost' : 'btn-primary'} ck-copy`} onClick={copyPix}>
              <Icon name={copied ? 'check' : 'copy'} />{copied ? 'Código copiado!' : 'Copiar código Pix'}
            </button>
            <div className="ck-pixinfo"><span>Valor</span><b className="num">{formatBRL(total)}</b></div>
            <button type="button" className="btn btn-ghost ck-paid-btn" onClick={() => setStatus('paid')}>Já fiz o pagamento</button>
          </div>
          {Resumo}
        </div>
      </Frame>
    )
  }

  /* aprovado */
  if (status === 'paid') {
    return (
      <Frame preview={preview} styleVars={styleVars} showTimer={false} mmss={mmss}>
        <div className="ck-done card">
          <div className="ck-done-ic"><Icon name="check" strokeWidth={3} /></div>
          <h2>Pagamento confirmado! 🎉</h2>
          <p className="ck-muted">Enviamos o acesso de <b>{product.name}</b> para <b>{data.email || 'seu e-mail'}</b>.</p>
          <div className="ck-done-val"><span>Total pago</span><b className="num">{formatBRL(total)}</b></div>
          <p className="ck-muted">Você já pode fechar esta página.</p>
        </div>
      </Frame>
    )
  }

  /* formulário */
  return (
    <Frame preview={preview} styleVars={styleVars} showTimer={cfg.timer} mmss={mmss}>
      <form className="ck-grid" onSubmit={pay}>
        <div className="ck-main">
          <div className="ck-intro">
            <h2>{cfg.title}</h2>
            <p>{cfg.subtitle}</p>
          </div>

          <section className="card ck-step">
            <header className="ck-step-head"><span className="ck-num">1</span><h2>Seus dados</h2></header>
            {!isRapido && (
              <Field id="ck-name" label="Nome completo" icon="user" placeholder="Como no seu documento" value={data.name} onChange={set('name')} autoComplete="name" />
            )}
            <div className={cfg.fields.phone ? 'ck-row' : ''}>
              <Field id="ck-email" label="E-mail" icon="mail" type="email" placeholder="voce@email.com" value={data.email} onChange={set('email')} autoComplete="email" hint="O acesso é enviado para este e-mail." />
              {cfg.fields.phone && (
                <Field id="ck-phone" label="Celular / WhatsApp" icon="phone" inputMode="tel" placeholder="(11) 90000-0000" value={data.phone} onChange={(e) => setData((s) => ({ ...s, phone: maskPhone(e.target.value) }))} />
              )}
            </div>
            {cfg.fields.cpf && (
              <Field id="ck-cpf" label="CPF" icon="lock" inputMode="numeric" placeholder="000.000.000-00" value={data.cpf} onChange={(e) => setData((s) => ({ ...s, cpf: maskCPF(e.target.value) }))} />
            )}
          </section>

          {cfg.fields.address && (
            <section className="card ck-step">
              <header className="ck-step-head"><span className="ck-num">2</span><h2>Endereço de entrega</h2></header>
              <div className="ck-row">
                <Field id="ck-cep" label="CEP" inputMode="numeric" placeholder="00000-000" value={addr.cep} onChange={(e) => setAddr((s) => ({ ...s, cep: maskCEP(e.target.value) }))} />
                <Field id="ck-cidade" label="Cidade" placeholder="Cidade" value={addr.cidade} onChange={setA('cidade')} />
              </div>
              <Field id="ck-rua" label="Endereço" placeholder="Rua, avenida…" value={addr.rua} onChange={setA('rua')} />
              <div className="ck-row">
                <Field id="ck-num" label="Número" placeholder="123" value={addr.numero} onChange={setA('numero')} />
                <Field id="ck-uf" label="Estado (UF)" placeholder="SP" value={addr.uf} onChange={setA('uf')} />
              </div>
            </section>
          )}

          {!isRapido && (
            <section className="card ck-step">
              <header className="ck-step-head"><span className="ck-num">{cfg.fields.address ? 3 : 2}</span><h2>Pagamento</h2></header>
              <div className="ck-methods" role="tablist" aria-label="Forma de pagamento">
                {methods.map((m) => (
                  <button type="button" key={m.key} role="tab" aria-selected={method === m.key} className={`ck-method${method === m.key ? ' on' : ''}`} onClick={() => setMethod(m.key)}>
                    <Icon name={m.icon} /><b>{m.label}</b><span>{m.note}</span>
                  </button>
                ))}
              </div>
              {method === 'pix' && <div className="ck-pane"><p className="ck-pane-info"><Icon name="bolt" /> Pagamento aprovado na hora.</p></div>}
              {method === 'boleto' && <div className="ck-pane"><p className="ck-pane-info"><Icon name="barcode" /> Compensa em 1-2 dias úteis.</p></div>}
              {method === 'card' && (
                <div className="ck-pane">
                  <Field id="ck-cardnum" label="Número do cartão" icon="card" inputMode="numeric" placeholder="0000 0000 0000 0000" value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: maskCard(e.target.value) }))} />
                  <Field id="ck-cardname" label="Nome impresso no cartão" placeholder="Como está no cartão" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} />
                  <div className="ck-row">
                    <Field id="ck-exp" label="Validade" inputMode="numeric" placeholder="MM/AA" value={card.exp} onChange={(e) => setCard((c) => ({ ...c, exp: maskExp(e.target.value) }))} />
                    <Field id="ck-cvv" label="CVV" inputMode="numeric" placeholder="123" value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: maskCVV(e.target.value) }))} />
                  </div>
                  <div className="ck-field">
                    <label htmlFor="ck-parc">Parcelas</label>
                    <div className="ck-input"><select id="ck-parc" value={card.parc} onChange={(e) => setCard((c) => ({ ...c, parc: Number(e.target.value) }))}>
                      {parcelas.map((p) => <option key={p.n} value={p.n}>{p.label}</option>)}</select></div>
                  </div>
                </div>
              )}
            </section>
          )}

          {cfg.bump.enabled && (
            <button type="button" className={`ck-bump${bump ? ' on' : ''}`} onClick={() => setBump((b) => !b)} aria-pressed={bump}>
              <span className="ck-bump-check" aria-hidden="true">{bump && <Icon name="check" strokeWidth={3} />}</span>
              <div className="ck-bump-body">
                <span className="ck-bump-badge">OFERTA ÚNICA</span>
                <b>{cfg.bump.title}</b><p>{cfg.bump.desc}</p>
                <span className="ck-bump-price"><s>{formatBRL(cfg.bump.oldAmount)}</s> {formatBRL(cfg.bump.amount)}</span>
              </div>
            </button>
          )}

          {payError && <div className="ck-error"><Icon name="close" />{payError}</div>}
          <button type="submit" className="btn btn-primary ck-cta" disabled={!canPay || loading}>
            <Icon name="lock" />{loading ? 'Gerando Pix…' : `${cfg.ctaText} ${formatBRL(total)}`}
          </button>
          <p className="ck-secure"><Icon name="shield" /> Ambiente seguro e criptografado · AZ Checkout</p>
        </div>
        {Resumo}
      </form>
    </Frame>
  )
}

/* Rota pública /checkout/:slug */
export default function Checkout() {
  const { slug } = useParams()
  const product = useMemo(() => {
    const stored = getProducts().filter((p) => p.slug)
    const list = stored.length ? stored : seedProducts.filter((p) => p.slug)
    return list.find((p) => p.slug === slug) || list[0]
  }, [slug])
  return <CheckoutView product={product} />
}
