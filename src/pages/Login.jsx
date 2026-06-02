import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import { isAuthed, login, signUp } from '../auth.js'

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
  const [pass, setPass] = useState('')
  const [mode, setMode] = useState('login') // login | signup
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  // Já logado? vai direto pro painel.
  if (isAuthed()) return <Navigate to="/app" replace />

  async function submit(e) {
    e.preventDefault()
    if (!email || !pass || (mode === 'signup' && !name)) return
    setBusy(true); setErr('')
    const res = mode === 'signup'
      ? await signUp(name.trim() || nameFromEmail(email), email.trim(), pass)
      : await login(email.trim(), pass)
    setBusy(false)
    if (res.error) { setErr(traduzErro(res.error.message)); return }
    if (res.needsConfirm) { setErr('Conta criada! Confirme pelo e-mail para entrar.'); return }
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
        <form className="login-card" onSubmit={submit}>
          <div className="login-tabs">
            <button type="button" className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>Entrar</button>
            <button type="button" className={mode === 'signup' ? 'on' : ''} onClick={() => setMode('signup')}>Criar conta</button>
          </div>

          <h2>{mode === 'login' ? 'Acesse sua conta' : 'Comece de graça'}</h2>
          <p className="login-sub">{mode === 'login' ? 'Entre para gerenciar seus checkouts.' : 'Crie sua conta em segundos.'}</p>

          {mode === 'signup' && (
            <div className="ck-field">
              <label htmlFor="lg-name">Nome</label>
              <div className="ck-input"><Icon name="livex" /><input id="lg-name" placeholder="Seu nome"
                value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
            </div>
          )}
          <div className="ck-field">
            <label htmlFor="lg-email">E-mail</label>
            <div className="ck-input"><Icon name="mail" /><input id="lg-email" type="email" placeholder="voce@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
          </div>
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
      </section>
    </div>
  )
}
