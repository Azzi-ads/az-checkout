import { useState } from 'react'
import Icon from './Icon.jsx'

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'AZ'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

// Estrutura do menu (grupos). Um item com `children` vira grupo retrátil.
const SECTIONS = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      {
        id: 'analises', label: 'Análises', icon: 'chart',
        children: [
          { id: 'analises', label: 'Visão geral', icon: 'pulse' },
          { id: 'custos', label: 'Custos', icon: 'revenue' },
        ],
      },
      { id: 'livex', label: 'Livex', icon: 'livex', live: true },
      { id: 'produtos', label: 'Produtos', icon: 'produtos' },
      { id: 'vendas', label: 'Vendas', icon: 'vendas' },
      { id: 'config', label: 'Configurações', icon: 'config' },
    ],
  },
  {
    label: 'Conta',
    items: [{ id: 'planos', label: 'Planos', icon: 'planos' }],
  },
]

function NavItem({ item, page, onSelect, liveCount, sub }) {
  const active = page === item.id
  return (
    <button
      type="button"
      className={`nav-item${active ? ' active' : ''}${sub ? ' nav-sub' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(item.id)}
    >
      <Icon name={item.icon} />
      {item.label}
      {item.live && (
        <span className="badge" aria-live="polite" aria-label={`${liveCount} pessoas ao vivo no checkout`}>
          <span className="dot" aria-hidden="true" />
          <span>{liveCount}</span>
        </span>
      )}
    </button>
  )
}

function NavGroup({ item, page, onSelect }) {
  const childActive = item.children.some((c) => c.id === page)
  const [open, setOpen] = useState(childActive)
  const regionId = `grp-${item.id}`
  return (
    <>
      <button
        type="button"
        className={`nav-item nav-group${childActive ? ' has-active' : ''}`}
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name={item.icon} />
        {item.label}
        <Icon name="chevron" className={`nav-chevron${open ? ' open' : ''}`} />
      </button>
      <div id={regionId} role="group" aria-label={item.label} hidden={!open}>
        {item.children.map((c) => (
          <NavItem key={c.id} item={c} page={page} onSelect={onSelect} sub />
        ))}
      </div>
    </>
  )
}

export default function Sidebar({ page, onSelect, liveCount, onLogout, user }) {
  const initials = initialsOf(user?.name)
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-logo" src="/logo-wide.png" alt="AZ Checkout" width="1921" height="819" />
      </div>

      <button type="button" className="store-switch" aria-label="Trocar de loja">
        <span className="store-av" aria-hidden="true">{initials}</span>
        <span className="store-meta">
          <b>{user?.name || 'Minha loja'}</b>
          <span>Plano Start</span>
        </span>
        <Icon name="chevron" />
      </button>

      <nav aria-label="Menu principal">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="nav-label">{section.label}</div>
            {section.items.map((item) =>
              item.children
                ? <NavGroup key={item.label} item={item} page={page} onSelect={onSelect} />
                : <NavItem key={item.id} item={item} page={page} onSelect={onSelect} liveCount={liveCount} />,
            )}
          </div>
        ))}
      </nav>

      <div className="side-foot">
        <div className="user">
          <div className="av" aria-hidden="true">{initials}</div>
          <div className="meta"><b>{user?.name || 'Você'}</b><span>{user?.email || 'Plano Start'}</span></div>
          <button type="button" className="logout" onClick={onLogout} aria-label="Sair da conta" title="Sair">
            <Icon name="arrowLeft" />
          </button>
        </div>
      </div>
    </aside>
  )
}
