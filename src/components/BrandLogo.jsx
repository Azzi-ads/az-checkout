import { useState } from 'react'
import { getTheme } from '../store.js'

// Marca PinguFy. Usa a logo clara/escrita-clara no tema escuro e a normal no claro.
// Se a imagem não existir, mostra o wordmark em gradiente.
export default function BrandLogo({ className = '', mode }) {
  const [err, setErr] = useState(false)
  const dark = (mode || getTheme()?.mode) === 'dark'
  const src = dark ? '/logo-wide-dark.png' : '/logo-wide.png'
  if (err) return <span className={`pingu-word ${className}`}>PinguFy</span>
  return <img className={className} src={src} alt="PinguFy" onError={() => setErr(true)} />
}
