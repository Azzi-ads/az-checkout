import Icon from './Icon.jsx'
import { navMenu, navAccount, currentUser } from '../data.js'

function NavItem({ item, active, onSelect, liveCount }) {
  return (
    <button
      type="button"
      className={`nav-item${active ? ' active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={() => onSelect(item.id)}
    >
      <Icon name={item.icon} />
      {item.label}
      {item.live && (
        <span
          className="badge"
          aria-live="polite"
          aria-label={`${liveCount} pessoas ao vivo no checkout`}
        >
          <span className="dot" aria-hidden="true" />
          <span>{liveCount}</span>
        </span>
      )}
    </button>
  )
}

export default function Sidebar({ page, onSelect, liveCount }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark" aria-hidden="true">AZ</div>
        <div className="name">AZ <b>Checkout</b><small>Plataforma</small></div>
      </div>

      <nav aria-label="Menu principal">
        <div className="nav-label" id="nav-menu-label">Menu</div>
        <div role="group" aria-labelledby="nav-menu-label">
          {navMenu.map((item) => (
            <NavItem key={item.id} item={item} active={page === item.id} onSelect={onSelect} liveCount={liveCount} />
          ))}
        </div>

        <div className="nav-label" id="nav-account-label">Conta</div>
        <div role="group" aria-labelledby="nav-account-label">
          {navAccount.map((item) => (
            <NavItem key={item.id} item={item} active={page === item.id} onSelect={onSelect} liveCount={liveCount} />
          ))}
        </div>
      </nav>

      <div className="side-foot">
        <div className="user">
          <div className="av" aria-hidden="true">{currentUser.initials}</div>
          <div className="meta"><b>{currentUser.name}</b><span>{currentUser.plan}</span></div>
        </div>
      </div>
    </aside>
  )
}
