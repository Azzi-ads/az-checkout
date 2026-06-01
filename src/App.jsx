import { Routes, Route, Navigate } from 'react-router-dom'
import AdminApp from './AdminApp.jsx'
import Checkout from './pages/Checkout.jsx'
import Login from './pages/Login.jsx'
import { isAuthed } from './auth.js'

// Rota protegida: sem login, volta para a página de entrada.
function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Entrada pública: login / criar conta */}
      <Route path="/" element={<Login />} />
      {/* Painel administrativo (protegido) */}
      <Route path="/app" element={<Protected><AdminApp /></Protected>} />
      {/* Checkout do cliente (público) */}
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout/:slug" element={<Checkout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
