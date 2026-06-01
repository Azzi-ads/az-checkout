import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Analises from './pages/Analises.jsx'
import Custos from './pages/Custos.jsx'
import Livex from './pages/Livex.jsx'
import Produtos from './pages/Produtos.jsx'
import Integracoes from './pages/Integracoes.jsx'
import Vendas from './pages/Vendas.jsx'
import Config from './pages/Config.jsx'
import Planos from './pages/Planos.jsx'
import Perfil from './pages/Perfil.jsx'
import Aparencia from './pages/Aparencia.jsx'
import useLiveCount from './useLiveCount.js'
import { pageTitles } from './data.js'
import { logout } from './auth.js'
import { getProfile, saveProfile, getTheme, saveTheme } from './store.js'
import { themeVars } from './theme.js'

const SIMPLE_PAGES = {
  analises: Analises,
  custos: Custos,
  integracoes: Integracoes,
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

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

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
    const Page = SIMPLE_PAGES[page]
    return <Page />
  }

  return (
    <div className="app" style={themeVars(theme)}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Sidebar page={page} onSelect={setPage} liveCount={live.atCheckout} onLogout={handleLogout} profile={profile} />
      <main className="main" ref={mainRef}>
        <Topbar title={title} sub={sub} />
        <section className="page page-enter" id="conteudo" key={page} tabIndex={-1} aria-labelledby="page-title">
          {renderPage()}
        </section>
      </main>
    </div>
  )
}
