import { Routes, Route, Navigate } from 'react-router-dom'
import AdminApp from './AdminApp.jsx'
import Checkout from './pages/Checkout.jsx'

export default function App() {
  return (
    <Routes>
      {/* Painel administrativo (visão do lojista) */}
      <Route path="/" element={<AdminApp />} />
      {/* Checkout do cliente (visão do comprador) */}
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/checkout/:slug" element={<Checkout />} />
      {/* Qualquer outra rota volta para o painel */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
