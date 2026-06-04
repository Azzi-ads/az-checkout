import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { isAuthed, login, signUp, getUser } from '../auth.js'
import { hydrate, getProfile, saveProfile } from '../store.js'

const onlyDigits = (s) => (s || '').replace(/\D/g, '')
function maskCPF(v) {
  return onlyDigits(v).slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
function maskPhone(v) {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}
function isValidCPF(v) {
  const c = onlyDigits(v)
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false
  let s = 0
  for (let i = 0; i < 9; i++) s += +c[i] * (10 - i)
  let d1 = (s * 10) % 11; if (d1 === 10) d1 = 0
  if (d1 !== +c[9]) return false
  s = 0
  for (let i = 0; i < 10; i++) s += +c[i] * (11 - i)
  let d2 = (s * 10) % 11; if (d2 === 10) d2 = 0
  return d2 === +c[10]
}

function traduzErro(msg = '') {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Esse e-mail já tem uma conta. Faça login.'
  if (m.includes('at least 6')) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (m.includes('email') && m.includes('valid')) return 'Digite um e-mail válido.'
  return msg || 'Algo deu errado. Tente de novo.'
}

const FEATURES = [
  'Checkout de alta conversão em Pix, cartão e boleto',
  'Order bump, upsell e temas 100% personalizáveis',
  'Análises ao vivo: lucro real, jornada e abandono',
]

function nameFromEmail(email) {
  const base = (email.split('@')[0] || 'Você').replace(/[._-]+/g, ' ')
  return base.replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Login() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [pass, setPass] = useState('')
  const [mode, setMode] = useState('login') // login | signup
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState('') // e-mail enviado p/ confirmação

  // Já logado? vai direto pro painel.
  if (isAuthed()) return <Navigate to="/app" replace />

  // sincroniza KYC do metadata pro perfil (após login/cadastro com sessão)
  function syncKyc() {
    const u = getUser(); if (!u) return
    const p = getProfile()
    if ((u.cpf && !p.cpf) || (u.phone && !p.phone)) saveProfile({ cpf: u.cpf || p.cpf, phone: u.phone || p.phone })
  }

  async function submit(e) {
    e.preventDefault()
    if (mode === 'signup') {
      if (!name.trim()) { setErr('Digite seu nome.'); return }
      if (onlyDigits(phone).length < 10) { setErr('Digite um telefone válido com DDD.'); return }
      if (!isValidCPF(cpf)) { setErr('CPF inválido. Confira os números.'); return }
    }
    if (!email || !pass) return
    setBusy(true); setErr('')
    const res = mode === 'signup'
      ? await signUp({ name: name.trim() || nameFromEmail(email), email: email.trim(), password: pass, phone: maskPhone(phone), cpf: maskCPF(cpf) })
      : await login(email.trim(), pass)
    setBusy(false)
    if (res.error) { setErr(traduzErro(res.error.message)); return }
    if (res.needsConfirm) { setSent(email.trim()); return }
    try { await hydrate() } catch { /* segue local */ }
    syncKyc()
    navigate('/app')
  }

  return (
    <div className="login">
      <section className="login-hero">
        <img className="login-logo" src="/logo-wide.png" alt="AZ Checkout" width="430" height="96" />
        <h1>A plataforma de checkout<br /> que <b>vende mais</b>.</h1>
        <p>Crie checkouts de alta conversão para seus infoprodutos — com Pix na hora, cartão em 12x e tudo personalizável.</p>
        <ul className="login-feats">
          {FEATURES.map((f) => (
            <li key={f}><Icon name="check" strokeWidth={3} />{f}</li>
          ))}
        </ul>
        <div className="login-trust"><Icon name="lock" /> Ambiente seguro e criptografado</div>
      </section>

      <section className="login-panel">
        {sent ? (
          <div className="login-card login-sent">
            <div className="ck-done-ic"><Icon name="mail" strokeWidth={2.2} /></div>
            <h2>Confirme seu e-mail</h2>
            <p className="login-sub">Enviamos um link de confirmação para <b>{sent}</b>. Abra seu e-mail e clique no link para ativar a conta e entrar.</p>
            <p className="login-sub" style={{ marginTop: 10 }}>Não chegou? Veja o spam ou aguarde 1 minuto.</p>
            <button type="button" className="btn btn-primary login-btn" onClick={() => { setSent(''); setMode('login') }}>Voltar para o login</button>
          </div>
        ) : (
        <form className="login-card" onSubmit={submit}>
          <div className="login-tabs">
            <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>Entrar</button>
            <button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')}>Criar conta</button>
          </div>

          <h2>{mode === 'login' ? 'Acesse sua conta' : 'Comece de graça'}</h2>
          <p className="login-sub">{mode === 'login' ? 'Entre para gerenciar seus checkouts.' : 'Crie sua conta em segundos.'}</p>

          {mode === 'signup' && (
            <div className="ck-field">
              <label htmlFor="lg-name">Nome completo</label>
              <div className="ck-input"><Icon name="livex" /><input id="lg-name" placeholder="Seu nome completo"
                value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
            </div>
          )}
          <div className="ck-field">
            <label htmlFor="lg-email">E-mail</label>
            <div className="ck-input"><Icon name="mail" /><input id="lg-email" type="email" placeholder="voce@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
          </div>
          {mode === 'signup' && (
            <>
              <div className="ck-field">
                <label htmlFor="lg-phone">Telefone (com DDD)</label>
                <div className="ck-input"><Icon name="phone" /><input id="lg-phone" inputMode="tel" placeholder="(11) 90000-0000"
                  value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} autoComplete="tel" /></div>
              </div>
              <div className="ck-field">
                <label htmlFor="lg-cpf">CPF</label>
                <div className="ck-input"><Icon name="lock" /><input id="lg-cpf" inputMode="numeric" placeholder="000.000.000-00"
                  value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} /></div>
              </div>
            </>
          )}
          <div className="ck-field">
            <label htmlFor="lg-pass">Senha</label>
            <div className="ck-input"><Icon name="lock" /><input id="lg-pass" type="password" placeholder="••••••••"
              value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" /></div>
          </div>

          {mode === 'login' && <a className="login-forgot" href="#recuperar" onClick={(e) => e.preventDefault()}>Esqueci minha senha</a>}

          {err && <p className="login-err">{err}</p>}

          <button type="submit" className="btn btn-primary login-btn" disabled={busy}>
            {busy ? 'Aguarde…' : (mode === 'login' ? 'Entrar' : 'Criar conta e entrar')}
          </button>

          <p className="login-alt">
            {mode === 'login' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
            <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Criar agora' : 'Entrar'}
            </button>
          </p>

          <Link className="login-demo" to="/checkout/curso-de-trafego-pago">Ver um checkout de exemplo →</Link>
        </form>
        )}
      </section>
    </div>
  )
}
