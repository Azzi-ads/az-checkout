import { useRef } from 'react'

// Tablist acessível (padrão WAI-ARIA):
// - role="tablist" / role="tab" com aria-selected
// - roving tabindex: só a aba ativa fica no fluxo do Tab
// - setas ←/→, Home e End navegam e ativam as abas
export default function Tabs({ tabs, value, onChange, panelId, label }) {
  const refs = useRef([])

  function onKeyDown(e) {
    const i = tabs.findIndex((t) => t.key === value)
    let next = null
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next === null) return
    e.preventDefault()
    onChange(tabs[next].key)
    refs.current[next]?.focus()
  }

  return (
    <div className="chips" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((t, i) => {
        const selected = t.key === value
        return (
          <button
            key={t.key}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            className={`chip${selected ? ' on' : ''}`}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
