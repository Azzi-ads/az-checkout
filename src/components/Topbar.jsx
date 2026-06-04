import { useId, useState } from 'react'
import Icon from './Icon.jsx'

function NotifBell({ perm, onEnable, prefs, onToggle }) {
  const [open, setOpen] = useState(false)
  const granted = perm === 'granted'
  return (
    <div className="notif-bell">
      <button type="button" className="bell-btn" aria-label="Notificações" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="bell" />
        {!granted && <span className="bell-dot" aria-hidden="true" />}
      </button>
      {open && (
        <>
          <div className="bell-overlay" onClick={() => setOpen(false)} />
          <div className="bell-menu" role="dialog" aria-label="Notificações">
            <div className="bell-head"><Icon name="bell" />Notificações</div>
            {granted ? (
              <div className="bell-status"><Icon name="check" />Ativadas neste aparelho</div>
            ) : (
              <button type="button" className="btn btn-primary bell-enable" onClick={() => { onEnable(); }}>
                <Icon name="bolt" />Ativar notificações
              </button>
            )}
            <div className="bell-sep" />
            <button type="button" className="bell-row" onClick={() => onToggle('notifPending')}>
              <span><b>Pix pendente</b><small>Quando um Pix é gerado</small></span>
              <span className={`bell-sw${prefs.notifPending !== false ? ' on' : ''}`} role="switch" aria-checked={prefs.notifPending !== false}><i /></span>
            </button>
            <button type="button" className="bell-row" onClick={() => onToggle('notifPaid')}>
              <span><b>Venda paga</b><small>Quando o pagamento é confirmado</small></span>
              <span className={`bell-sw${prefs.notifPaid !== false ? ' on' : ''}`} role="switch" aria-checked={prefs.notifPaid !== false}><i /></span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

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

export default function Topbar({ title, sub, onMenu, notif }) {
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
      {notif && <NotifBell {...notif} />}
      <button type="button" className="btn btn-primary">
        <Icon name="plus" />Novo
      </button>
    </header>
  )
}
