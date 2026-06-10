import { useState } from 'react'

// Marca PinguFy. Usa /logo-wide.png se existir; senão mostra o wordmark em gradiente.
export default function BrandLogo({ className = '' }) {
  const [err, setErr] = useState(false)
  if (err) return <span className={`pingu-word ${className}`}>PinguFy</span>
  return <img className={className} src="/logo-wide.png" alt="PinguFy" width="430" height="96" onError={() => setErr(true)} />
}
