import Icon from '../components/Icon.jsx'
import { ACCENTS, MODES, DEFAULT_THEME } from '../theme.js'

// Personaliza o tema do SITE (painel). As mudanças aplicam ao vivo porque o
// AdminApp injeta as variáveis CSS no contêiner .app.
export default function Aparencia({ theme, onChange }) {
  const set = (patch) => onChange({ ...theme, ...patch })

  return (
    <div className="grid set-grid">
      <div className="card">
        <div className="card-head"><h3>Modo</h3></div>
        <div className="appear-modes">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`appear-mode${theme.mode === m.key ? ' on' : ''}`}
              aria-pressed={theme.mode === m.key}
              onClick={() => set({ mode: m.key })}
            >
              <span className={`appear-mode-prev ${m.key}`} aria-hidden="true"><i /><i /></span>
              {m.label}
            </button>
          ))}
        </div>

        <div className="card-head" style={{ marginTop: 22 }}><h3>Cor de destaque</h3></div>
        <div className="swatches">
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`swatch${theme.accent.toLowerCase() === a.color.toLowerCase() ? ' on' : ''}`}
              style={{ background: a.color }}
              aria-label={a.label}
              aria-pressed={theme.accent.toLowerCase() === a.color.toLowerCase()}
              onClick={() => set({ accent: a.color, preset: a.key })}
            >
              {theme.accent.toLowerCase() === a.color.toLowerCase() && <Icon name="check" strokeWidth={3} />}
            </button>
          ))}
          <label className="swatch swatch-custom" title="Cor personalizada">
            <Icon name="palette" />
            <input type="color" value={theme.accent} onChange={(e) => set({ accent: e.target.value, preset: 'custom' })} aria-label="Escolher cor personalizada" />
          </label>
        </div>

        <button type="button" className="btn btn-ghost" style={{ marginTop: 22 }} onClick={() => onChange(DEFAULT_THEME)}>
          <Icon name="refresh" />Restaurar padrão
        </button>
      </div>

      <div className="card">
        <div className="card-head"><h3>Pré-visualização</h3><span className="pill">ao vivo</span></div>
        <div className="appear-preview">
          <div className="prev-kpi card kpi kpi-hi">
            <div className="lbl">Faturamento</div>
            <div className="val num">R$ 12.480</div>
          </div>
          <div className="prev-row">
            <button type="button" className="btn btn-primary">Botão primário</button>
            <span className="tag pend"><span className="d" />Em destaque</span>
          </div>
          <div className="prev-bar"><div className="prev-fill" /></div>
          <p className="profile-hint">É assim que o painel fica com o tema escolhido.</p>
        </div>
      </div>
    </div>
  )
}
