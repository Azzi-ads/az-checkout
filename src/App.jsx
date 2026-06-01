import { useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Livex from './pages/Livex.jsx'
import Produtos from './pages/Produtos.jsx'
import Vendas from './pages/Vendas.jsx'
import Config from './pages/Config.jsx'
import Planos from './pages/Planos.jsx'
import useLiveCount from './useLiveCount.js'
import { pageTitles } from './data.js'

const PAGES = {
  dashboard: Dashboard,
  livex: Livex,
  produtos: Produtos,
  vendas: Vendas,
  config: Config,
  planos: Planos,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const live = useLiveCount()
  const mainRef = useRef(null)
  const [title, sub] = pageTitles[page]

  // Ao trocar de tela: volta ao topo (igual ao protótipo).
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const Page = PAGES[page]

  return (
    <div className="app">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <Sidebar page={page} onSelect={setPage} liveCount={live.atCheckout} />
      <main className="main" ref={mainRef}>
        <Topbar title={title} sub={sub} />
        <section
          className="page page-enter"
          id="conteudo"
          key={page}
          tabIndex={-1}
          aria-labelledby="page-title"
        >
          {page === 'livex' ? <Livex live={live} /> : <Page />}
        </section>
      </main>
    </div>
  )
}
