import { useState } from 'react'
import Icon from './Icon.jsx'

const NOTIF_COLORS = ['', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#f97316', '#ec4899']

function NotifBell({ perm, onEnable, onTest, prefs, onToggle, cfg, onCfg }) {
  const [open, setOpen] = useState(false)
  const granted = perm === 'granted'
  const custom = cfg.notifMode === 'custom'
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
            <div className="bell-actions">
              <button type="button" className="btn btn-primary bell-enable" onClick={onEnable}>
                <Icon name="bolt" />{granted ? 'Reativar avisos' : 'Ativar notificações'}
              </button>
              <button type="button" className="btn btn-ghost bell-test" onClick={onTest}>Enviar teste</button>
            </div>
            {granted && <div className="bell-status"><Icon name="check" />Permitido neste aparelho</div>}

            <div className="bell-sep" />
            <button type="button" className="bell-row" onClick={() => onToggle('notifPending')}>
              <span><b>Pix pendente</b><small>Quando um Pix é gerado</small></span>
              <span className={`bell-sw${prefs.notifPending !== false ? ' on' : ''}`} role="switch" aria-checked={prefs.notifPending !== false}><i /></span>
            </button>
            <button type="button" className="bell-row" onClick={() => onToggle('notifPaid')}>
              <span><b>Venda paga</b><small>Quando o pagamento é confirmado</small></span>
              <span className={`bell-sw${prefs.notifPaid !== false ? ' on' : ''}`} role="switch" aria-checked={prefs.notifPaid !== false}><i /></span>
            </button>
            <button type="button" className="bell-row" onClick={() => onToggle('notifSummary')}>
              <span><b>Resumo de faturamento</b><small>Às 9h, 12h, 16h e 20h</small></span>
              <span className={`bell-sw${prefs.notifSummary !== false ? ' on' : ''}`} role="switch" aria-checked={prefs.notifSummary !== false}><i /></span>
            </button>

            <div className="bell-sep" />
            <div className="bell-label">Texto do aviso</div>
            <div className="bell-seg">
              <button type="button" className={!custom ? 'on' : ''} onClick={() => onCfg({ notifMode: 'auto' })}>Padrão</button>
              <button type="button" className={custom ? 'on' : ''} onClick={() => onCfg({ notifMode: 'custom' })}>Personalizado</button>
            </div>
            {!custom ? (
              <p className="bell-hint">Padrão: “Venda Pendente” / “Venda Aprovada” + valor.</p>
            ) : (
              <div className="bell-fields">
                <label>Venda paga
                  <input type="text" value={cfg.notifTextPaid} onChange={(e) => onCfg({ notifTextPaid: e.target.value })} placeholder="Caiu mais uma! {cliente} pagou {valor}" />
                </label>
                <label>Pix pendente
                  <input type="text" value={cfg.notifTextPending} onChange={(e) => onCfg({ notifTextPending: e.target.value })} placeholder="Novo Pix de {valor} — {cliente}" />
                </label>
                <p className="bell-hint">Use <b>{'{cliente}'}</b>, <b>{'{valor}'}</b> e <b>{'{produto}'}</b> — são trocados automaticamente.</p>
              </div>
            )}

            <div className="bell-sep" />
            <div className="bell-label">Cor do aviso</div>
            <div className="bell-colors">
              {NOTIF_COLORS.map((col) => (
                <button
                  key={col || 'def'}
                  type="button"
                  className={`bell-color${(cfg.notifColor || '') === col ? ' on' : ''}${col ? '' : ' def'}`}
                  style={col ? { background: col } : undefined}
                  aria-label={col ? `Cor ${col}` : 'Cor padrão (amarelo)'}
                  onClick={() => onCfg({ notifColor: col })}
                />
              ))}
            </div>
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
  return (
    <header className="topbar">
      <button type="button" className="menu-btn" onClick={onMenu} aria-label="Abrir menu"><Icon name="lines" /></button>
      <div className="topbar-title">
        <h1 id="page-title">{title}</h1>
        <div className="sub">{sub}</div>
      </div>
      <MetaBar />
      {notif && <NotifBell {...notif} />}
    </header>
  )
}
