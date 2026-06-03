import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Analises from './pages/Analises.jsx'
import Custos from './pages/Custos.jsx'
import Livex from './pages/Livex.jsx'
import Produtos from './pages/Produtos.jsx'
import CheckoutAdmin from './pages/CheckoutAdmin.jsx'
import Integracoes from './pages/Integracoes.jsx'
import Vendas from './pages/Vendas.jsx'
import Config from './pages/Config.jsx'
import Planos from './pages/Planos.jsx'
import Perfil from './pages/Perfil.jsx'
import Aparencia from './pages/Aparencia.jsx'
import AZSecurity from './pages/AZSecurity.jsx'
import Admin from './pages/Admin.jsx'
import useLiveCount from './useLiveCount.js'
import Icon from './components/Icon.jsx'
import { pageTitles, formatBRL } from './data.js'
import { logout, getUser } from './auth.js'
import { getProfile, saveProfile, getTheme, saveTheme } from './store.js'
import { themeVars } from './theme.js'
import { supabase, hasBackend } from './supabase.js'
import { subscribeToPush } from './push.js'

const SIMPLE_PAGES = {
  analises: Analises,
  custos: Custos,
  checkout: CheckoutAdmin,
  integracoes: Integracoes,
  admin: Admin,
  vendas: Vendas,
  config: Config,
  planos: Planos,
}

export default function AdminApp() {
  const [page, setPage] = useState('dashboard')
  const [profile, setProfile] = useState(() => getProfile())
  const [theme, setTheme] = useState(() => getTheme())
  const live = useLiveCount()
  const mainRef = useRef(null)
  const navigate = useNavigate()
  const [title, sub] = pageTitles[page]
  const [toast, setToast] = useState('')
  const [notifPerm, setNotifPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied')

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  // Notificação de venda em tempo real (PWA): avisa quando uma venda é paga.
  useEffect(() => {
    if (!hasBackend) return
    const u = getUser()
    if (!u?.id) return
    const ch = supabase
      .channel('sales-notify')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales', filter: `owner=eq.${u.id}` }, (payload) => {
        const s = payload.new
        if (s && s.status === 'pago') {
          const txt = `Venda aprovada — ${formatBRL(s.total || 0)}`
          setToast(txt)
          setTimeout(() => setToast(''), 6000)
          try {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Venda aprovada! 🎉', { body: `${s.customer?.name || 'Cliente'} · ${formatBRL(s.total || 0)}`, icon: '/icon-192.png' })
            }
          } catch { /* ignore */ }
        }
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function askNotif() {
    try {
      const p = await Notification.requestPermission()
      setNotifPerm(p)
      if (p === 'granted') { const u = getUser(); if (u?.id) subscribeToPush(u.id) }
    } catch { /* */ }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }
  function handleProfileSave(next) {
    setProfile(saveProfile(next))
  }
  function handleThemeChange(next) {
    setTheme(saveTheme(next))
  }

  function renderPage() {
    if (page === 'dashboard') return <Dashboard profile={profile} />
    if (page === 'livex') return <Livex live={live} />
    if (page === 'produtos') return <Produtos />
    if (page === 'perfil') return <Perfil profile={profile} onSave={handleProfileSave} />
    if (page === 'aparencia') return <Aparencia theme={theme} onChange={handleThemeChange} />
    if (page === 'security') return <AZSecurity profile={profile} onSave={handleProfileSave} />
    const Page = SIMPLE_PAGES[page]
    return <Page />
  }

  const appStyle = { ...themeVars(theme), ...(theme.bg ? { background: theme.bg } : {}) }

  return (
    <div className="app" style={appStyle}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Sidebar page={page} onSelect={setPage} liveCount={live.atCheckout} onLogout={handleLogout} profile={profile} />
      <main className="main" ref={mainRef}>
        <Topbar title={title} sub={sub} />
        <section className="page page-enter" id="conteudo" key={page} tabIndex={-1} aria-labelledby="page-title">
          {renderPage()}
        </section>
      </main>

      {hasBackend && notifPerm === 'default' && (
        <button type="button" className="notif-prompt" onClick={askNotif}>
          <Icon name="bolt" />Ativar avisos de venda
        </button>
      )}
      {toast && <div className="sale-toast"><Icon name="revenue" />{toast}</div>}
    </div>
  )
}
