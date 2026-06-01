import { useId, useState } from 'react'
import Toggle from '../components/Toggle.jsx'
import {
  storeFields, currencyOptions, appearanceFields,
  gatewayToggles, appearanceToggle, notificationToggles,
} from '../data.js'

function Field({ label, value }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} defaultValue={value} />
    </div>
  )
}

export default function Config() {
  const currencyId = useId()
  // Estado de todos os switches em um único objeto { id: boolean }.
  const allToggles = [...gatewayToggles, appearanceToggle, ...notificationToggles]
  const [on, setOn] = useState(() =>
    Object.fromEntries(allToggles.map((t) => [t.id, t.on])),
  )
  const set = (id) => (val) => setOn((s) => ({ ...s, [id]: val }))

  return (
    <div className="grid set-grid">
      <div className="card">
        <div className="card-head"><h3>Dados da loja</h3></div>
        {storeFields.map((f) => (
          <Field key={f.label} label={f.label} value={f.value} />
        ))}
        <div className="field">
          <label htmlFor={currencyId}>Moeda padrão</label>
          <select id={currencyId} defaultValue={currencyOptions[0]}>
            {currencyOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Gateways de pagamento</h3></div>
        {gatewayToggles.map((t) => (
          <Toggle key={t.id} title={t.title} desc={t.desc} on={on[t.id]} onChange={set(t.id)} />
        ))}
      </div>

      <div className="card">
        <div className="card-head"><h3>Aparência do checkout</h3></div>
        {appearanceFields.map((f) => (
          <Field key={f.label} label={f.label} value={f.value} />
        ))}
        <Toggle
          title={appearanceToggle.title}
          desc={appearanceToggle.desc}
          on={on[appearanceToggle.id]}
          onChange={set(appearanceToggle.id)}
        />
      </div>

      <div className="card">
        <div className="card-head"><h3>Notificações</h3></div>
        {notificationToggles.map((t) => (
          <Toggle key={t.id} title={t.title} desc={t.desc} on={on[t.id]} onChange={set(t.id)} />
        ))}
      </div>
    </div>
  )
}
