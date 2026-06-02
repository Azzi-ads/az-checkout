import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminApp from './AdminApp.jsx'
import Checkout from './pages/Checkout.jsx'
import Login from './pages/Login.jsx'
import { initAuth, isAuthed } from './auth.js'
import { hydrate } from './store.js'

function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/" replace />
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [, tick] = useState(0)

  useEffect(() => {
    const onAuth = async () => {
      if (isAuthed()) { try { await hydrate() } catch { /* segue local */ } }
      setReady(true); tick((n) => n + 1)
    }
    const unsub = initAuth(onAuth)
    return unsub
  }, [])

  if (!ready) {
    return (
      <div className="boot">
        <img src="/logo-wide.png" alt="AZ Checkout" width="430" height="96" />
        <span className="boot-spin" aria-hidden="true" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/app" element={<Protected><AdminApp /></Protected>} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout/:slug" element={<Checkout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
