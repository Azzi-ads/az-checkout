import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import Icon from '../components/Icon.jsx'
import { products as seedProducts, checkoutDescriptions, installments, formatBRL } from '../data.js'
import { getProducts, getProfile, fetchProductBySlug } from '../store.js'
import { themeVars } from '../theme.js'
import { ensureCheckout } from '../checkoutConfig.js'
import { ping, leave, recordEvent } from '../liveTracker.js'
import { recordSale, updateSale, addSaleItem } from '../sales.js'
import { hasBackend } from '../supabase.js'

async function apiRegistrarVenda(payload) {
  try {
    const r = await fetch('/api/registrar-venda', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const j = await r.json(); return j.id || null
  } catch { return null }
}
function apiAtualizarVenda(id, patch) {
  if (!id) return
  try { fetch('/api/atualizar-venda', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, patch }) }) } catch { /* */ }
}

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

/* moldura: página inteira ou preview embutido. White-label: usa a marca do
   vendedor (logo do checkout ou nome do produto), nunca a logo da AZ. */
function Brand({ logo, name }) {
  if (logo) return <img className="ck-logo" src={logo} alt={name || 'Logo'} />
  if (name) return <span className="ck-brandname">{name}</span>
  return <span />
}

// Mostra a imagem do QR do gateway, ou gera uma a partir do copia-e-cola.
function QrImage({ code, src }) {
  const [url, setUrl] = useState(src || '')
  useEffect(() => {
    if (src) { setUrl(src); return }
    if (!code) return
    let alive = true
    QRCode.toDataURL(code, { margin: 1, width: 260 }).then((u) => { if (alive) setUrl(u) }).catch(() => {})
    return () => { alive = false }
  }, [code, src])
  return url ? <img className="ck-qr" src={url} alt="QR Code Pix" /> : <FakeQR />
}

function WaButton({ wa }) {
  if (!wa?.enabled || !wa.number) return null
  return (
    <a className="ck-wa" href={`https://wa.me/${String(wa.number).replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
      <Icon name="phone" />{wa.text || 'WhatsApp'}
    </a>
  )
}

function Frame({ children, preview, styleVars, showTimer, mmss, logo, brandName, secure, bg, wa, tpl }) {
  const bgStyle = bg
    ? { background: `linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.6)), ${bg}`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}
  const style = { ...styleVars, ...bgStyle }
  if (preview) {
    return (
      <div className={`ck-preview ck-tpl-${tpl || 'padrao'}`} style={style}>
        <div className="ck-preview-top">
          <Brand logo={logo} name={brandName} />
          <span className="ck-safe"><Icon name="lock" />Compra segura</span>
        </div>
        <div className="ck-preview-body">{children}</div>
        <WaButton wa={wa} />
      </div>
    )
  }
  return (
    <div className={`ck-page ck-tpl-${tpl || 'padrao'}`} style={style}>
      {showTimer && (
        <div className="ck-timer"><Icon name="bolt" /> Oferta por tempo limitado — expira em <b className="num">{mmss}</b></div>
      )}
      <header className="ck-top">
        <Brand logo={logo} name={brandName} />
        <span className="ck-safe"><Icon name="lock" />Compra segura</span>
      </header>
      <main className="ck-body">{children}</main>
      <footer className="ck-foot">
        {secure && <span className="ck-secured"><Icon name="shield" />Protegido por AZ Security</span>}
        <span>Pagamento processado com segurança</span>
      </footer>
      <WaButton wa={wa} />
    </div>
  )
}

export function CheckoutView({ product, preview = false }) {
  const cfg = ensureCheckout(product)
  const styleVars = themeVars({ accent: cfg.accent, mode: cfg.theme })
  const isRapido = cfg.model === 'rapido'
  const secure = (() => { try { return !!getProfile().security } catch { return false } })()
  const gridClass = `ck-grid ck-lay-${cfg.layout || 'classico'}`
  const tList = cfg.testimonials || []

  const methods = useMemo(
    () => Object.keys(cfg.methods).filter((k) => cfg.methods[k]).map((k) => ({ key: k, ...METHOD_META[k] })),
    [cfg.methods],
  )
  const [method, setMethod] = useState(methods[0]?.key || 'pix')
  const [data, setData] = useState({ name: '', email: '', phone: '', cpf: '' })
  const [addr, setAddr] = useState({ cep: '', rua: '', numero: '', bairro: '', cidade: '', uf: '' })
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvv: '', parc: 1 })
  const [bump, setBump] = useState(false)
  const [freeAmount, setFreeAmount] = useState('')
  const [qty, setQty] = useState(1)
  const [ship, setShip] = useState(0)
  const [phase, setPhase] = useState(0)
  const [status, setStatus] = useState('form')
  const [copied, setCopied] = useState(false)
  const [secs, setSecs] = useState(9 * 60 + 59)
  const [pixData, setPixData] = useState(null) // { id, qr_code, qr_code_image } do BravoPay
  const [loading, setLoading] = useState(false)
  const [payError, setPayError] = useState('')
  const [saleId, setSaleId] = useState(null)
  const [proofSent, setProofSent] = useState(false)
  const proofRef = useRef(null)
  const [sid] = useState(() => Math.random().toString(36).slice(2, 8))
  const stepRef = useRef('Dados')
  stepRef.current = status === 'pix' ? 'Pagamento' : status === 'paid' ? 'Aprovado' : 'Dados'
  const recordedRef = useRef(false)
  const outcomeRef = useRef('abandoned')
  const infoRef = useRef({})

  useEffect(() => {
    if (!cfg.timer || preview) return
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [cfg.timer, preview])
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  const description = checkoutDescriptions[product.slug] || product.desc || 'Acesso imediato após o pagamento'
  const stepsN = cfg.steps || 1
  const addressOn = cfg.fields.address || stepsN >= 3
  const qtyVal = cfg.quantity?.enabled && !cfg.valorLivre ? Math.max(1, qty) : 1
  const unit = cfg.valorLivre ? (Number(freeAmount) || 0) : product.amount
  const baseAmount = unit * qtyVal
  const shipOpts = cfg.shipping?.options || []
  const shipSel = cfg.shipping?.enabled ? (shipOpts[ship] || shipOpts[0]) : null
  const shipPrice = shipSel?.price || 0
  const total = baseAmount + (bump && cfg.bump.enabled ? cfg.bump.amount : 0) + shipPrice
  const parcelas = useMemo(() => installments(total), [total])

  const emailOk = /\S+@\S+\.\S+/.test(data.email)
  const nameOk = data.name.trim().length > 2
  const cpfOk = !cfg.fields.cpf || data.cpf.length >= 14
  const addrOk = !addressOn || (addr.cep.length >= 9 && addr.rua && addr.numero && addr.cidade && addr.uf)
  const cardOk = method !== 'card' || (card.number.length >= 18 && card.name.trim() && card.exp.length === 5 && card.cvv.length >= 3)
  const valorOk = !cfg.valorLivre || baseAmount > 0
  const canPay = emailOk && nameOk && cpfOk && addrOk && cardOk && valorOk

  // etapas (multi-step)
  const phases = stepsN >= 3 ? ['dados', 'endereco', 'pagamento'] : stepsN === 2 ? ['dados', 'pagamento'] : ['single']
  const ph = Math.min(phase, phases.length - 1)
  const phaseKey = phases[ph]
  const dadosOk = nameOk && emailOk && cpfOk && valorOk && (stepsN === 2 && cfg.fields.address ? addrOk : true)
  const phaseValid = phaseKey === 'dados' ? dadosOk : phaseKey === 'endereco' ? addrOk : true

  const set = (k) => (e) => setData((s) => ({ ...s, [k]: e.target.value }))
  const setA = (k) => (e) => setAddr((s) => ({ ...s, [k]: e.target.value }))

  async function pay(e) {
    e.preventDefault()
    if (!canPay || loading) return
    if (stepsN > 1 && ph < phases.length - 1) return
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
            customer: buildCustomer(),
            slug: product.slug, items: buildItems(), total,
            ...getTracking(),
          }),
        })
        const json = await resp.json()
        if (!resp.ok) throw new Error(json.shape ? `${json.error} → ${JSON.stringify(json.shape)}` : (json.error || 'Não foi possível gerar o Pix.'))
        setPixData(json)
        const id = json.saleId || (!hasBackend ? recordSale({ customer: buildCustomer(), items: buildItems(), total, method: 'pix', status: 'aguardando' }) : null)
        setSaleId(id)
        setStatus('pix')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (err) {
        setPayError(err.message)
      } finally {
        setLoading(false)
      }
    } else {
      // Cartão/boleto ainda não integrados de verdade (a doc cobre PIX). Mock por enquanto.
      goPaid()
    }
  }

  function copyPix() {
    const code = pixData?.qr_code || ''
    if (code) navigator.clipboard?.writeText(code)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  function buildCustomer() {
    const c = { name: data.name, email: data.email, phone: d(data.phone), cpf: d(data.cpf) }
    if (addressOn) c.address = `${addr.rua}, ${addr.numero} — ${addr.cidade}/${addr.uf} (${addr.cep})`
    return c
  }
  function buildItems() {
    const items = [{ name: product.name, kind: 'Front', amount: baseAmount }]
    if (bump && cfg.bump.enabled) items.push({ name: cfg.bump.title, kind: 'Order bump', amount: cfg.bump.amount })
    return items
  }
  // após confirmar pagamento: registra/atualiza a venda e oferece upsell se houver
  function goPaid() {
    if (!preview) {
      if (hasBackend) {
        // Pix: a confirmação é feita pelo webhook do BravoPay (server-side, confiável).
        // Cartão/boleto (mock, sem webhook): registramos como pago para o teste aparecer.
        if (method && method !== 'pix') {
          apiRegistrarVenda({ slug: product.slug, customer: buildCustomer(), items: buildItems(), total, method, status: 'pago' })
        }
      } else if (saleId) updateSale(saleId, { status: 'pago' })
      else { const id = recordSale({ customer: buildCustomer(), items: buildItems(), total, method, status: 'pago' }); setSaleId(id) }
    }
    if (cfg.upsell?.enabled) { setStatus('upsell'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    else setStatus('paid')
  }

  // Back redirect: ao tentar voltar (botão voltar), redireciona para a URL configurada.
  useEffect(() => {
    if (preview || !cfg.backRedirect) return
    try { window.history.pushState(null, '', window.location.href) } catch { /* ignore */ }
    const onPop = () => { window.location.href = cfg.backRedirect }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [preview, cfg.backRedirect])

  // Polling: enquanto aguarda o Pix, consulta o status a cada 3s.
  useEffect(() => {
    if (preview || status !== 'pix' || !pixData?.id) return
    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/status?id=${encodeURIComponent(pixData.id)}`)
        const j = await r.json()
        if (j.status === 'PAID') {
          clearInterval(id)
          // confirma a venda na hora (status real veio do BravoPay) — não espera o webhook
          if (hasBackend && saleId) apiAtualizarVenda(saleId, { status: 'pago' })
          goPaid()
        }
        else if (['EXPIRED', 'FAILED', 'CANCELED'].includes(j.status)) {
          clearInterval(id); setPayError(`Pagamento ${j.status.toLowerCase()}.`); setStatus('form'); setPixData(null)
        }
      } catch { /* tenta de novo no próximo ciclo */ }
    }, 2000)
    return () => clearInterval(id)
  }, [status, pixData, preview])

  // ---- Rastreio ao vivo + registro de métricas ----
  if (status === 'paid') outcomeRef.current = 'paid'
  infoRef.current = { product: product.name, amount: total, value: formatBRL(total), step: stepRef.current }

  function endSession() {
    if (recordedRef.current || preview) return
    recordedRef.current = true
    recordEvent({ ...infoRef.current, outcome: outcomeRef.current, ts: Date.now() })
    leave(sid)
  }

  // heartbeat enquanto está no checkout (para o Livex ao vivo)
  useEffect(() => {
    if (preview || status === 'paid') return
    const send = () => { if (!recordedRef.current) ping(sid, infoRef.current) }
    send()
    const iv = setInterval(send, 4000)
    return () => clearInterval(iv)
  }, [sid, preview, status, product.name, total])

  // pagou → registra evento "paid"
  useEffect(() => { if (status === 'paid') endSession() }, [status])

  // saiu (fechou aba / navegou) → registra evento (abandono, se não pagou)
  useEffect(() => {
    if (preview) return
    const onUnload = () => endSession()
    window.addEventListener('beforeunload', onUnload)
    return () => { endSession(); window.removeEventListener('beforeunload', onUnload) }
  }, [preview])

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
      {cfg.quantity?.enabled && !cfg.valorLivre && (
        <div className="ck-qty">
          <span>Quantidade</span>
          <div className="ck-qty-ctrl">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir">–</button>
            <b className="num">{qtyVal}</b>
            <button type="button" onClick={() => setQty((q) => Math.min(cfg.quantity.max || 10, q + 1))} aria-label="Aumentar">+</button>
          </div>
        </div>
      )}
      <div className="ck-lines">
        {cfg.valorLivre ? (
          <div className="ck-field" style={{ marginBottom: 2 }}>
            <label htmlFor="ck-valor">Quanto deseja pagar?</label>
            <div className="ck-input"><span style={{ color: 'var(--muted-2)', fontWeight: 700 }}>R$</span>
              <input id="ck-valor" type="number" min="0" step="0.01" value={freeAmount} onChange={(e) => setFreeAmount(e.target.value)} placeholder="0,00" /></div>
          </div>
        ) : (
          <div className="ck-line"><span>{product.name}{qtyVal > 1 ? ` × ${qtyVal}` : ''}</span><span className="num">{product.oldAmount && qtyVal === 1 && <s>{formatBRL(product.oldAmount)}</s>} {formatBRL(baseAmount)}</span></div>
        )}
        {bump && cfg.bump.enabled && <div className="ck-line"><span>+ {cfg.bump.title}</span><span className="num">{formatBRL(cfg.bump.amount)}</span></div>}
        {cfg.shipping?.enabled && shipOpts.length > 0 && (
          <div className="ck-ship">
            <span className="ck-ship-title">Escolha o frete</span>
            {shipOpts.map((o, i) => (
              <label key={i} className={`ck-ship-opt${ship === i ? ' on' : ''}`}>
                <input type="radio" name="ckship" checked={ship === i} onChange={() => setShip(i)} />
                <span>{o.label || `Opção ${i + 1}`}</span>
                <b className="num">{o.price ? formatBRL(o.price) : 'Grátis'}</b>
              </label>
            ))}
          </div>
        )}
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
      <Frame preview={preview} styleVars={styleVars} showTimer={cfg.timer} mmss={mmss} logo={cfg.logo} brandName={product.name} secure={secure} bg={cfg.bg} wa={cfg.whatsapp} tpl={cfg.model}>
        <div className={gridClass}>
          <div className="card ck-pixbox">
            <span className="ck-badge"><span className="dot" />Aguardando pagamento</span>
            <h2>Pague com Pix para liberar na hora</h2>
            <p className="ck-muted">Abra o app do seu banco, escaneie o QR Code ou use o Pix copia e cola.</p>
            <QrImage code={pixData?.qr_code} src={pixData?.qr_code_image} />
            {pixData?.qr_code && <div className="ck-pixcode">{pixData.qr_code}</div>}
            <button type="button" className={`btn ${copied ? 'btn-ghost' : 'btn-primary'} ck-copy`} onClick={copyPix}>
              <Icon name={copied ? 'check' : 'copy'} />{copied ? 'Código copiado!' : 'Copiar código Pix'}
            </button>
            <div className="ck-pixinfo"><span>Valor</span><b className="num">{formatBRL(total)}</b></div>
            <input ref={proofRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const url = String(r.result); if (hasBackend) apiAtualizarVenda(saleId, { proof: url }); else if (saleId) updateSale(saleId, { proof: url }); setProofSent(true) }; r.readAsDataURL(f) }} />
            <button type="button" className={`btn ${proofSent ? 'btn-ghost' : 'btn-primary'} ck-paid-btn`} onClick={() => proofRef.current?.click()}>
              <Icon name={proofSent ? 'check' : 'camera'} />{proofSent ? 'Comprovante enviado!' : 'Enviar comprovante'}
            </button>
            <button type="button" className="btn btn-ghost ck-paid-btn" onClick={goPaid}>Já fiz o pagamento</button>
          </div>
          {Resumo}
        </div>
      </Frame>
    )
  }

  /* upsell / downsell */
  if (status === 'upsell' || status === 'downsell') {
    const o = status === 'upsell' ? cfg.upsell : cfg.downsell
    const decline = () => setStatus(status === 'upsell' && cfg.downsell?.enabled ? 'downsell' : 'paid')
    return (
      <Frame preview={preview} styleVars={styleVars} showTimer={false} mmss={mmss} logo={cfg.logo} brandName={product.name} secure={secure} bg={cfg.bg} wa={cfg.whatsapp} tpl={cfg.model}>
        <div className="ck-offer card">
          <span className="ck-badge"><span className="dot" />{status === 'upsell' ? 'Oferta exclusiva' : 'Última chance'}</span>
          <h2>{o.title}</h2>
          <p className="ck-muted">{o.desc}</p>
          <div className="ck-offer-price">{formatBRL(o.price)}</div>
          <button type="button" className="btn btn-primary ck-offer-yes" onClick={() => { if (!hasBackend && saleId) addSaleItem(saleId, { name: o.title, kind: status === 'upsell' ? 'Upsell' : 'Downsell', amount: o.price }); setStatus('paid') }}><Icon name="check" />Sim, adicionar por {formatBRL(o.price)}</button>
          <button type="button" className="btn btn-ghost ck-offer-no" onClick={decline}>Não, obrigado</button>
        </div>
      </Frame>
    )
  }

  /* aprovado */
  if (status === 'paid') {
    return (
      <Frame preview={preview} styleVars={styleVars} showTimer={false} mmss={mmss} logo={cfg.logo} brandName={product.name} secure={secure} bg={cfg.bg} wa={cfg.whatsapp} tpl={cfg.model}>
        <div className="ck-done card">
          <div className="ck-done-ic"><Icon name="check" strokeWidth={3} /></div>
          <h2>Pagamento confirmado! 🎉</h2>
          <p className="ck-muted">Sua compra de <b>{product.name}</b> foi aprovada.</p>
          <div className="ck-done-val"><span>Total pago</span><b className="num">{formatBRL(total)}</b></div>
          {(() => {
            const ent = product.entrega || {}
            if (ent.tipo === 'link' && ent.url) return (
              <a className="btn btn-primary ck-deliver-btn" href={ent.url} target="_blank" rel="noopener noreferrer"><Icon name="bolt" />Acessar meu produto</a>
            )
            if (ent.tipo === 'conteudo' && ent.conteudo) return (
              <div className="ck-deliver"><div className="ck-deliver-h"><Icon name="lock" />Seu acesso</div><p>{ent.conteudo}</p></div>
            )
            return <p className="ck-muted">Enviamos o acesso para <b>{data.email || 'seu e-mail'}</b>.</p>
          })()}
          <p className="ck-muted">Você já pode fechar esta página.</p>
        </div>
      </Frame>
    )
  }

  /* formulário */
  const fieldNode = (key) => {
    const label = (cfg.fieldLabels && cfg.fieldLabels[key]) || key
    if (key === 'name') return <Field key="name" id="ck-name" label={label} icon="user" placeholder="Seu nome" value={data.name} onChange={set('name')} autoComplete="name" />
    if (key === 'email') return <Field key="email" id="ck-email" label={label} icon="mail" type="email" placeholder="voce@email.com" value={data.email} onChange={set('email')} autoComplete="email" hint="O acesso é enviado para este e-mail." />
    if (key === 'phone') return cfg.fields.phone ? <Field key="phone" id="ck-phone" label={label} icon="phone" inputMode="tel" placeholder="(11) 90000-0000" value={data.phone} onChange={(e) => setData((s) => ({ ...s, phone: maskPhone(e.target.value) }))} /> : null
    if (key === 'cpf') return cfg.fields.cpf ? <Field key="cpf" id="ck-cpf" label={label} icon="lock" inputMode="numeric" placeholder="000.000.000-00" value={data.cpf} onChange={(e) => setData((s) => ({ ...s, cpf: maskCPF(e.target.value) }))} /> : null
    return null
  }
  const orderKeys = cfg.fieldOrder && cfg.fieldOrder.length ? cfg.fieldOrder : ['name', 'email', 'phone', 'cpf']

  const dadosSection = (
    <section className="card ck-step" key="dados">
      <header className="ck-step-head"><span className="ck-num">1</span><h2>Seus dados</h2></header>
      {orderKeys.map(fieldNode)}
    </section>
  )
  const enderecoSection = (
    <section className="card ck-step" key="end">
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
  )
  const pagamentoSection = (
    <section className="card ck-step" key="pag">
      <header className="ck-step-head"><span className="ck-num">{stepsN === 1 ? (addressOn ? 3 : 2) : ph + 1}</span><h2>Pagamento</h2></header>
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
  )
  const bumpNode = cfg.bump.enabled ? (
    <button type="button" key="bump" className={`ck-bump${bump ? ' on' : ''}`} onClick={() => setBump((b) => !b)} aria-pressed={bump}>
      <span className="ck-bump-check" aria-hidden="true">{bump && <Icon name="check" strokeWidth={3} />}</span>
      <div className="ck-bump-body">
        <span className="ck-bump-badge">OFERTA ÚNICA</span>
        <b>{cfg.bump.title}</b><p>{cfg.bump.desc}</p>
        <span className="ck-bump-price"><s>{formatBRL(cfg.bump.oldAmount)}</s> {formatBRL(cfg.bump.amount)}</span>
      </div>
    </button>
  ) : null
  const testsNode = tList.length > 0 ? (
    <div className="card ck-tests" key="tests">
      <div className="card-head"><h3 style={{ fontSize: 15 }}>Quem já comprou</h3></div>
      {tList.map((t, i) => (<div className="ck-test" key={i}><div className="ck-test-stars">★★★★★</div><p>“{t.text}”</p><b>{t.name}</b></div>))}
    </div>
  ) : null

  let phaseContent
  if (stepsN === 1) phaseContent = <>{dadosSection}{addressOn && enderecoSection}{pagamentoSection}{bumpNode}{testsNode}</>
  else if (phaseKey === 'dados') phaseContent = <>{dadosSection}{stepsN === 2 && cfg.fields.address && enderecoSection}</>
  else if (phaseKey === 'endereco') phaseContent = enderecoSection
  else phaseContent = <>{pagamentoSection}{bumpNode}{testsNode}</>

  const isLast = stepsN === 1 || ph === phases.length - 1
  const stepLabel = (p) => (p === 'dados' ? 'Dados' : p === 'endereco' ? 'Endereço' : 'Pagamento')

  return (
    <Frame preview={preview} styleVars={styleVars} showTimer={cfg.timer} mmss={mmss} logo={cfg.logo} brandName={product.name} secure={secure} bg={cfg.bg} wa={cfg.whatsapp} tpl={cfg.model}>
      {cfg.bannerTop && <img className="ck-bannerimg" src={cfg.bannerTop} alt="" />}
      <form className={gridClass} onSubmit={pay}>
        <div className="ck-main">
          {cfg.headline?.enabled && cfg.headline.text && <div className="ck-banner">{cfg.headline.text}</div>}
          <div className="ck-intro"><h2>{cfg.title}</h2><p>{cfg.subtitle}</p></div>

          {stepsN > 1 && (
            <div className="ck-stepper">
              {phases.map((p, i) => (
                <div key={p} className={`ck-stp${i === ph ? ' on' : ''}${i < ph ? ' done' : ''}`}>
                  <span>{i < ph ? '✓' : i + 1}</span>{stepLabel(p)}
                </div>
              ))}
            </div>
          )}

          {phaseContent}

          {payError && <div className="ck-error"><Icon name="close" />{payError}</div>}

          {isLast ? (
            <>
              <button type="submit" className="btn btn-primary ck-cta" disabled={!canPay || loading}>
                <Icon name="lock" />{loading ? 'Gerando Pix…' : `${cfg.ctaText} ${formatBRL(total)}`}
              </button>
              <p className="ck-secure"><Icon name="shield" /> Ambiente seguro e criptografado</p>
            </>
          ) : (
            <div className="ck-nav">
              {ph > 0 && <button type="button" className="btn btn-ghost" onClick={() => setPhase(ph - 1)}>Voltar</button>}
              <button type="button" className="btn btn-primary ck-continue" disabled={!phaseValid} onClick={() => setPhase(ph + 1)}>Continuar</button>
            </div>
          )}
        </div>
        {Resumo}
      </form>
      {cfg.bannerBottom && <img className="ck-bannerimg" src={cfg.bannerBottom} alt="" />}
    </Frame>
  )
}

/* Rota pública /checkout/:slug */
export default function Checkout() {
  const { slug } = useParams()
  const local = useMemo(() => getProducts().filter((p) => p.slug).find((p) => p.slug === slug) || null, [slug])
  const [product, setProduct] = useState(local)
  const [loading, setLoading] = useState(!local)

  useEffect(() => {
    if (local) { setProduct(local); setLoading(false); return }
    let alive = true
    setLoading(true)
    fetchProductBySlug(slug).then((p) => {
      if (!alive) return
      setProduct(p || seedProducts.find((x) => x.slug === slug) || seedProducts.find((x) => x.slug) || null)
      setLoading(false)
    })
    return () => { alive = false }
  }, [slug, local])

  if (loading) return <div className="boot"><span className="boot-spin" /></div>
  if (!product) return <div className="boot"><p style={{ color: 'var(--muted)' }}>Produto não encontrado.</p></div>
  return <CheckoutView product={product} />
}
