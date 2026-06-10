import { useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { getUser } from '../auth.js'

function initialsOf(name = '') {
  const p = name.trim().split(/\s+/).filter(Boolean)
  return p.length ? (p[0][0] + (p[1]?.[0] || '')).toUpperCase() : 'PF'
}

export default function Perfil({ profile, onSave }) {
  const email = getUser()?.email || ''
  const [name, setName] = useState(profile?.name || '')
  const [avatar, setAvatar] = useState(profile?.avatar || '')
  const cpf = profile?.cpf || getUser()?.cpf || ''
  const phone = profile?.phone || getUser()?.phone || ''
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)

  function pickFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result))
    reader.readAsDataURL(file)
  }

  function save(e) {
    e.preventDefault()
    onSave({ name: name.trim(), avatar })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form className="grid set-grid" onSubmit={save}>
      <div className="card">
        <div className="card-head"><h3>Foto de perfil</h3></div>
        <div className="profile-photo">
          <div className="profile-av">
            {avatar ? <img src={avatar} alt="Sua foto de perfil" /> : <span>{initialsOf(name)}</span>}
          </div>
          <div className="profile-photo-actions">
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
              <Icon name="camera" />Enviar foto
            </button>
            {avatar && (
              <button type="button" className="btn btn-ghost" onClick={() => setAvatar('')}>
                <Icon name="trash" />Remover
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
            <p className="profile-hint">PNG ou JPG, até alguns MB. A foto fica salva na sua conta.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h3>Seus dados</h3></div>
        <div className="field">
          <label htmlFor="pf-name">Nome de usuário</label>
          <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como quer ser chamado" />
        </div>
        <div className="field">
          <label htmlFor="pf-email">E-mail</label>
          <input id="pf-email" value={email} disabled />
          <small style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--muted-2)' }}>
            O e-mail é o do login e não pode ser alterado por aqui.
          </small>
        </div>
        <div className="ck-row">
          <div className="field">
            <label htmlFor="pf-phone">Telefone</label>
            <input id="pf-phone" value={phone || '—'} disabled />
          </div>
          <div className="field">
            <label htmlFor="pf-cpf">CPF</label>
            <input id="pf-cpf" value={cpf || '—'} disabled />
          </div>
        </div>
        <small style={{ display: 'block', marginTop: -4, marginBottom: 4, fontSize: 12, color: 'var(--muted-2)' }}>
          Telefone e CPF são dados de verificação (KYC) e ficam travados. Para alterar, fale com o suporte.
        </small>
        <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }}>
          {saved ? <><Icon name="check" />Salvo!</> : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}
