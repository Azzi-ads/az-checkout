import { useId } from 'react'
import Icon from './Icon.jsx'

export default function Topbar({ title, sub }) {
  const searchId = useId()
  return (
    <header className="topbar">
      <div>
        <h1 id="page-title">{title}</h1>
        <div className="sub">{sub}</div>
      </div>
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
