import { useId } from 'react'
import Icon from './Icon.jsx'

// Meta de faturamento (0 → 100k). Conta nova começa em R$ 0.
// TODO(roadmap): puxar o faturamento real do período quando houver backend.
const META = 100000
const ATUAL = 0

function MetaBar() {
  const pct = Math.min(100, (ATUAL / META) * 100)
  const fmt = (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)
  return (
    <div className="meta-bar" title={`Meta de faturamento: R$ ${fmt(ATUAL)} de R$ ${fmt(META)}`}>
      <span className="meta-cap"><Icon name="bolt" />Meta</span>
      <div className="meta-track" role="progressbar" aria-valuemin={0} aria-valuemax={META} aria-valuenow={ATUAL} aria-label="Meta de faturamento">
        <div className="meta-fill" style={{ width: `${pct}%` }} />
        <span className="meta-head" style={{ left: `${pct}%` }} aria-hidden="true"><Icon name="bolt" /></span>
      </div>
      <b className="meta-val">R$ {fmt(ATUAL)}<span> / {fmt(META)}</span></b>
    </div>
  )
}

export default function Topbar({ title, sub, onMenu }) {
  const searchId = useId()
  return (
    <header className="topbar">
      <button type="button" className="menu-btn" onClick={onMenu} aria-label="Abrir menu"><Icon name="lines" /></button>
      <div>
        <h1 id="page-title">{title}</h1>
        <div className="sub">{sub}</div>
      </div>
      <MetaBar />
      <div className="search">
        <Icon name="search" />
        <label htmlFor={searchId} className="sr-only">Buscar</label>
        <input id={searchId} type="search" placeholder="Buscar..." />
      </div>
      <button type="button" className="btn btn-primary">
        <Icon name="plus" />Novo
      </button>
    </header>
  )
}
