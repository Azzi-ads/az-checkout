import { useId } from 'react'

// Linha de configuração com um switch acessível.
// O <button role="switch"> já responde a Espaço/Enter nativamente; aria-checked
// expõe o estado e aria-labelledby associa o rótulo visível ao controle.
export default function Toggle({ title, desc, on, onChange }) {
  const labelId = useId()
  const descId = useId()
  return (
    <div className="toggle-row">
      <div className="t">
        <b id={labelId}>{title}</b>
        {desc && <span id={descId}>{desc}</span>}
      </div>
      <button
        type="button"
        className={`sw${on ? ' on' : ''}`}
        role="switch"
        aria-checked={on}
        aria-labelledby={labelId}
        aria-describedby={desc ? descId : undefined}
        onClick={() => onChange(!on)}
      />
    </div>
  )
}
