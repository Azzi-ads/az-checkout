import Icon from '../components/Icon.jsx'

const CHECKPOINTS = [
  { icon: 'mail', title: 'Dados de contato', desc: 'e-mail e telefone' },
  { icon: 'lock', title: 'Operação interna', desc: 'tokens e chaves' },
  { icon: 'shield', title: 'Mascaramento', desc: 'dados externos' },
  { icon: 'bolt', title: 'Camada adicional', desc: 'anti-fraude' },
]
const indicators = (on) => [
  { label: 'Risco atual', value: on ? 'Reduzido' : 'Exposto', pct: on ? 22 : 85 },
  { label: 'Dados externos', value: on ? 'Mascarados' : 'Visíveis', pct: on ? 92 : 18 },
  { label: 'Cobertura', value: on ? 'Ativa' : 'Inativa', pct: on ? 96 : 0 },
]

export default function AZSecurity({ profile, onSave }) {
  const on = !!profile?.security

  return (
    <>
      <div className="card sec-hero">
        <div className="sec-main">
          <div className="sec-status">
            <span className={`sec-live${on ? ' on' : ''}`}><span className="dot" />STATUS DA PROTEÇÃO</span>
            <span className={`sec-badge${on ? ' on' : ''}`}>{on ? 'Ativa' : 'Inativa'}</span>
          </div>
          <h2>{on ? 'Protegido' : 'Desprotegido'}</h2>
          <p>{on
            ? 'Integrações externas recebem dados mascarados e o checkout fica blindado.'
            : 'Ative para blindar o checkout e mascarar os dados enviados a terceiros.'}</p>
          <div className="sec-bars">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={`sec-bar${on && i < 4 ? ' on' : ''}`} />)}</div>
        </div>

        <div className="sec-side">
          <div className="sec-toggle">
            <span>PROTEÇÃO</span>
            <b>{on ? 'Ativa' : 'Inativa'}</b>
            <button type="button" className={`sw${on ? ' on' : ''}`} role="switch" aria-checked={on} aria-label="Ativar proteção" onClick={() => onSave({ security: !on })} />
          </div>
          <div className="sec-indicators">
            <div className="sec-ind-title">Indicadores</div>
            {indicators(on).map((i) => (
              <div className="sec-ind" key={i.label}>
                <div className="sec-ind-top"><span>{i.label}</span><b>{i.value}</b></div>
                <div className="sec-ind-bar"><div className="sec-ind-fill" style={{ width: `${i.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h3>Checkpoints</h3><span className="pill">{on ? '4 de 4 protegidos' : '0 de 4'}</span></div>
        <div className="grid sec-checks">
          {CHECKPOINTS.map((c) => (
            <div className={`sec-check${on ? ' on' : ''}`} key={c.title}>
              <div className="sec-check-ic"><Icon name={c.icon} /></div>
              <div className="sec-check-body"><b>{c.title}</b><span>{c.desc}</span></div>
              <span className={`sec-chip${on ? ' on' : ''}`}><span className="d" />{on ? 'Protegido' : 'Inativo'}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="area-intro" style={{ marginTop: 16 }}>
        Quando ativa, a PinguFy Security mascara dados sensíveis enviados a integrações externas e adiciona uma camada extra de proteção ao checkout — sem afetar sua operação interna. O selo “Protegido por PinguFy Security” passa a aparecer no checkout.
      </p>
    </>
  )
}
