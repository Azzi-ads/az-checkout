import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import {
  products, checkoutDescriptions, orderBump, paymentMethods,
  installments, formatBRL, checkoutTrust,
} from '../data.js'

/* ---------- máscaras simples (pt-BR) ---------- */
const onlyDigits = (s) => s.replace(/\D/g, '')
const maskCPF = (s) => onlyDigits(s).slice(0, 11)
  .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
const maskPhone = (s) => onlyDigits(s).slice(0, 11)
  .replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
const maskCard = (s) => onlyDigits(s).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
const maskExpiry = (s) => onlyDigits(s).slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2')
const maskCVV = (s) => onlyDigits(s).slice(0, 4)

/* ---------- componentes auxiliares ---------- */
function Field({ id, label, icon, hint, ...rest }) {
  return (
    <div className="ck-field">
      <label htmlFor={id}>{label}</label>
      <div className="ck-input">
        {icon && <Icon name={icon} />}
        <input id={id} {...rest} />
      </div>
      {hint && <small>{hint}</small>}
    </div>
  )
}

function FakeQR() {
  // QR fictício (visual). Padrão determinístico só para parecer um QR real.
  const cells = []
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const corner = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
      const on = corner ? (x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5) || (x > 14 && (x === 14 || x === 20) ) ) : ((x * 7 + y * 13) % 3 === 0)
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)
    }
  }
  return (
    <svg className="ck-qr" viewBox="0 0 21 21" role="img" aria-label="QR Code Pix (exemplo)">
      <rect x="0" y="0" width="21" height="21" fill="#fff" />
      <g fill="#000">{cells}</g>
    </svg>
  )
}

/* ---------- página ---------- */
export default function Checkout() {
  const { slug } = useParams()
  const product = useMemo(
    () => products.find((p) => p.slug === slug) || products.find((p) => p.slug),
    [slug],
  )

  const [data, setData] = useState({ name: '', email: '', phone: '', cpf: '' })
  const [method, setMethod] = useState('pix')
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvv: '', parc: 1 })
  const [bump, setBump] = useState(false)
  const [status, setStatus] = useState('form') // form | pix | paid
  const [copied, setCopied] = useState(false)
  const [secs, setSecs] = useState(9 * 60 + 59)

  // cronômetro de escassez
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  const total = product.amount + (bump ? orderBump.amount : 0)
  const parcelas = useMemo(() => installments(total), [total])

  const emailOk = /\S+@\S+\.\S+/.test(data.email)
  const baseOk = data.name.trim().length > 2 && emailOk && data.cpf.length >= 14
  const cardOk = method !== 'card' || (card.number.length >= 18 && card.name.trim() && card.exp.length === 5 && card.cvv.length >= 3)
  const canPay = baseOk && cardOk

  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }))

  function handlePay(e) {
    e.preventDefault()
    if (!canPay) return
    setStatus(method === 'pix' ? 'pix' : 'paid')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function copyPix() {
    const code = '00020126aZcheckoutPixExemplo5204000053039865802BR6009SAO PAULO62070503***6304AZ00'
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* resumo do pedido (reaproveitado nas telas) */
  const Resumo = (
    <aside className="ck-summary card">
      <div className="ck-prod">
        <div className="ck-prod-thumb"><Icon name={product.icon} strokeWidth={1.6} /></div>
        <div>
          <h3>{product.name}</h3>
          <p>{checkoutDescriptions[product.slug]}</p>
        </div>
      </div>

      <div className="ck-lines">
        <div className="ck-line">
          <span>{product.name}</span>
          <span className="num">
            {product.oldAmount && <s>{formatBRL(product.oldAmount)}</s>} {formatBRL(product.amount)}
          </span>
        </div>
        {bump && (
          <div className="ck-line">
            <span>+ {orderBump.title}</span>
            <span className="num">{formatBRL(orderBump.amount)}</span>
          </div>
        )}
        <div className="ck-line ck-total">
          <span>Total</span>
          <span className="num">{formatBRL(total)}</span>
        </div>
      </div>

      <ul className="ck-trust">
        {checkoutTrust.map((t) => (
          <li key={t.title}>
            <Icon name={t.icon} />
            <div><b>{t.title}</b><span>{t.desc}</span></div>
          </li>
        ))}
      </ul>
    </aside>
  )

  /* ---------- tela: Pix gerado ---------- */
  if (status === 'pix') {
    return (
      <CheckoutShell mmss={mmss}>
        <div className="ck-grid">
          <div className="card ck-pixbox">
            <span className="ck-badge"><span className="dot" />Aguardando pagamento</span>
            <h2>Pague com Pix para liberar na hora</h2>
            <p className="ck-muted">Abra o app do seu banco, escaneie o QR Code ou use o Pix copia e cola.</p>
            <FakeQR />
            <button type="button" className={`btn ${copied ? 'btn-ghost' : 'btn-primary'} ck-copy`} onClick={copyPix}>
              <Icon name={copied ? 'check' : 'copy'} />{copied ? 'Código copiado!' : 'Copiar código Pix'}
            </button>
            <div className="ck-pixinfo">
              <span>Valor</span><b className="num">{formatBRL(total)}</b>
            </div>
            <button type="button" className="btn btn-ghost ck-paid-btn" onClick={() => setStatus('paid')}>
              Já fiz o pagamento
            </button>
          </div>
          {Resumo}
        </div>
      </CheckoutShell>
    )
  }

  /* ---------- tela: aprovado ---------- */
  if (status === 'paid') {
    return (
      <CheckoutShell mmss={mmss} hideTimer>
        <div className="ck-done card">
          <div className="ck-done-ic"><Icon name="check" strokeWidth={3} /></div>
          <h2>Pagamento confirmado! 🎉</h2>
          <p className="ck-muted">
            Enviamos o acesso de <b>{product.name}</b> para <b>{data.email || 'seu e-mail'}</b>.
            O acesso também já está liberado na sua conta.
          </p>
          <div className="ck-done-val">
            <span>Total pago</span><b className="num">{formatBRL(total)}</b>
          </div>
          <Link to="/app" className="btn btn-primary">Voltar ao painel</Link>
        </div>
      </CheckoutShell>
    )
  }

  /* ---------- tela: formulário ---------- */
  return (
    <CheckoutShell mmss={mmss}>
      <form className="ck-grid" onSubmit={handlePay}>
        <div className="ck-main">
          {/* passo 1 — dados */}
          <section className="card ck-step">
            <header className="ck-step-head"><span className="ck-num">1</span><h2>Seus dados</h2></header>
            <Field id="ck-name" label="Nome completo" icon="livex" placeholder="Como no seu documento"
              value={data.name} onChange={set('name')} autoComplete="name" />
            <div className="ck-row">
              <Field id="ck-email" label="E-mail" icon="mail" type="email" placeholder="voce@email.com"
                value={data.email} onChange={set('email')} autoComplete="email"
                hint="O acesso é enviado para este e-mail." />
              <Field id="ck-phone" label="Celular / WhatsApp" icon="phone" inputMode="tel" placeholder="(11) 90000-0000"
                value={data.phone} onChange={(e) => setData((d) => ({ ...d, phone: maskPhone(e.target.value) }))} />
            </div>
            <Field id="ck-cpf" label="CPF" icon="lock" inputMode="numeric" placeholder="000.000.000-00"
              value={data.cpf} onChange={(e) => setData((d) => ({ ...d, cpf: maskCPF(e.target.value) }))} />
          </section>

          {/* passo 2 — pagamento */}
          <section className="card ck-step">
            <header className="ck-step-head"><span className="ck-num">2</span><h2>Pagamento</h2></header>

            <div className="ck-methods" role="tablist" aria-label="Forma de pagamento">
              {paymentMethods.map((m) => (
                <button type="button" key={m.key} role="tab" aria-selected={method === m.key}
                  className={`ck-method${method === m.key ? ' on' : ''}`} onClick={() => setMethod(m.key)}>
                  <Icon name={m.icon} />
                  <b>{m.label}</b>
                  <span>{m.note}</span>
                </button>
              ))}
            </div>

            {method === 'pix' && (
              <div className="ck-pane">
                <p className="ck-pane-info"><Icon name="bolt" /> Pagamento aprovado na hora. O acesso é liberado automaticamente.</p>
              </div>
            )}

            {method === 'card' && (
              <div className="ck-pane">
                <Field id="ck-cardnum" label="Número do cartão" icon="card" inputMode="numeric" placeholder="0000 0000 0000 0000"
                  value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: maskCard(e.target.value) }))} />
                <Field id="ck-cardname" label="Nome impresso no cartão" placeholder="Como está no cartão"
                  value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} />
                <div className="ck-row">
                  <Field id="ck-exp" label="Validade" inputMode="numeric" placeholder="MM/AA"
                    value={card.exp} onChange={(e) => setCard((c) => ({ ...c, exp: maskExpiry(e.target.value) }))} />
                  <Field id="ck-cvv" label="CVV" inputMode="numeric" placeholder="123"
                    value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: maskCVV(e.target.value) }))} />
                </div>
                <div className="ck-field">
                  <label htmlFor="ck-parc">Parcelas</label>
                  <div className="ck-input">
                    <select id="ck-parc" value={card.parc} onChange={(e) => setCard((c) => ({ ...c, parc: Number(e.target.value) }))}>
                      {parcelas.map((p) => <option key={p.n} value={p.n}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {method === 'boleto' && (
              <div className="ck-pane">
                <p className="ck-pane-info"><Icon name="barcode" /> O boleto vence em 1 dia útil. O acesso é liberado após a compensação (1-2 dias úteis).</p>
              </div>
            )}
          </section>

          {/* order bump */}
          <button type="button" className={`ck-bump${bump ? ' on' : ''}`} onClick={() => setBump((b) => !b)}
            aria-pressed={bump}>
            <span className="ck-bump-check" aria-hidden="true">{bump && <Icon name="check" strokeWidth={3} />}</span>
            <div className="ck-bump-body">
              <span className="ck-bump-badge">{orderBump.badge}</span>
              <b>{orderBump.title}</b>
              <p>{orderBump.desc}</p>
              <span className="ck-bump-price">
                <s>{formatBRL(orderBump.oldAmount)}</s> {formatBRL(orderBump.amount)}
              </span>
            </div>
          </button>

          {/* CTA */}
          <button type="submit" className="btn btn-primary ck-cta" disabled={!canPay}>
            <Icon name="lock" />Pagar {formatBRL(total)}
          </button>
          <p className="ck-secure"><Icon name="shield" /> Ambiente seguro e criptografado · AZ Checkout</p>
        </div>

        {Resumo}
      </form>
    </CheckoutShell>
  )
}

/* moldura comum: cabeçalho com logo + cronômetro */
function CheckoutShell({ children, mmss, hideTimer }) {
  return (
    <div className="ck-page">
      {!hideTimer && (
        <div className="ck-timer">
          <Icon name="bolt" /> Oferta por tempo limitado — expira em <b className="num">{mmss}</b>
        </div>
      )}
      <header className="ck-top">
        <Link to="/app" className="ck-back" aria-label="Voltar ao painel"><Icon name="arrowLeft" /></Link>
        <img className="ck-logo" src="/logo-wide.png" alt="AZ Checkout" width="1921" height="819" />
        <span className="ck-safe"><Icon name="lock" />Compra segura</span>
      </header>
      <main className="ck-body">{children}</main>
      <footer className="ck-foot">
        <span>© AZ Checkout</span><span>·</span><span>Pagamento processado com segurança</span>
      </footer>
    </div>
  )
}
