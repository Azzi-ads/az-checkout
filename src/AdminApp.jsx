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
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifPerm, setNotifPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied')

  function selectPage(id) { setPage(id); setMenuOpen(false) }

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
        if (!s) return
        const prefs = getProfile()
        let txt = ''
        if (payload.eventType === 'INSERT' && s.status === 'aguardando') { if (prefs.notifPending === false) return; txt = `Pix gerado — ${formatBRL(s.total || 0)} (pendente)` }
        else if (s.status === 'pago') { if (prefs.notifPaid === false) return; txt = `Venda aprovada — ${formatBRL(s.total || 0)} 🎉` }
        if (txt) { setToast(txt); setTimeout(() => setToast(''), 6000) }
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  function flash(msg) { setToast(msg); setTimeout(() => setToast(''), 6000) }
  async function askNotif() {
    try {
      const p = await Notification.requestPermission()
      setNotifPerm(p)
      if (p !== 'granted') { flash('Permissão de notificação negada nas configurações.'); return }
      const u = getUser()
      const ok = u?.id ? await subscribeToPush(u.id) : false
      flash(ok ? 'Avisos ativados! 🔔' : 'Permissão ok — mas faltam as chaves VAPID no Vercel pra ligar o push.')
    } catch { flash('Não foi possível ativar os avisos.') }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }
  function handleProfileSave(next) {
    setProfile(saveProfile(next))
  }
  function toggleNotifPref(key) {
    setProfile(saveProfile({ [key]: !(profile[key] !== false) }))
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
      <Sidebar page={page} onSelect={selectPage} liveCount={live.atCheckout} onLogout={handleLogout} profile={profile} open={menuOpen} />
      {menuOpen && <div className="app-overlay" onClick={() => setMenuOpen(false)} />}
      <main className="main" ref={mainRef}>
        <Topbar
          title={title}
          sub={sub}
          onMenu={() => setMenuOpen(true)}
          notif={hasBackend ? { perm: notifPerm, onEnable: askNotif, prefs: { notifPending: profile.notifPending !== false, notifPaid: profile.notifPaid !== false }, onToggle: toggleNotifPref } : null}
        />
        <section className="page page-enter" id="conteudo" key={page} tabIndex={-1} aria-labelledby="page-title">
          {renderPage()}
        </section>
      </main>

      {toast && <div className="sale-toast"><Icon name="revenue" />{toast}</div>}
    </div>
  )
}
