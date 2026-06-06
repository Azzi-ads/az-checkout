import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { formatBRL } from '../data.js'
import { defaultCheckout } from '../checkoutConfig.js'
import { isOwner } from '../auth.js'
import { supabase } from '../supabase.js'

const CATEGORIES = [
  { icon: 'p-video', label: 'Curso / vídeo' },
  { icon: 'p-doc', label: 'E-book / PDF' },
  { icon: 'p-user', label: 'Mentoria' },
  { icon: 'p-grid', label: 'Templates / pack' },
  { icon: 'p-layers', label: 'Assinatura' },
]

const bvId = (p) => p.id || p.product_id || p.uuid || ''
const bvName = (p) => p.name || p.title || p.description || bvId(p)
const bvCents = (p) => (p.amount_cents != null ? p.amount_cents : (p.price != null ? Math.round(p.price * 100) : null))

function newDraft() {
  return { icon: 'p-video', name: '', amount: 0, oldAmount: 0, status: 'Ativo', desc: '', image: '', bravoProductId: '', entrega: { tipo: 'email', url: '', conteudo: '' }, checkout: defaultCheckout('infoproduto') }
}

export default function ProductForm({ product, onSave, onClose }) {
  const editing = !!product
  const [draft, setDraft] = useState(() => (product ? { ...product, oldAmount: product.oldAmount || 0 } : newDraft()))
  const [bravoList, setBravoList] = useState(null)
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState('')
  const fileRef = useRef(null)
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function pickPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = () => set({ image: String(r.result) })
    r.readAsDataURL(file)
  }
  async function buscarProdutos() {
    setLoadingList(true); setListError('')
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token || ''
      const r = await fetch('/api/produtos-bravo', { headers: { Authorization: `Bearer ${token}` } })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Erro ao buscar produtos.')
      setBravoList(j.products || [])
    } catch (e) { setListError(e.message) } finally { setLoadingList(false) }
  }
  function escolher(id) {
    const p = (bravoList || []).find((x) => bvId(x) === id)
    const cents = p ? bvCents(p) : null
    set({ bravoProductId: id, ...(cents != null ? { amount: cents / 100 } : {}) })
  }

  const canSave = draft.name.trim().length > 1 && Number(draft.amount) > 0

  function submit(e) {
    e.preventDefault()
    if (!canSave) return
    onSave(draft)
  }

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="pf-title" onSubmit={submit}>
        <div className="modal-head">
          <h3 id="pf-title">{editing ? 'Editar produto' : 'Novo produto'}</h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Fechar"><Icon name="close" /></button>
        </div>

        <div className="profile-photo">
          <div className="profile-av" style={{ borderRadius: 12, width: 64, height: 64, flexBasis: 64, fontSize: 22 }}>
            {draft.image ? <img src={draft.image} alt="" /> : <Icon name={draft.icon} strokeWidth={1.4} />}
          </div>
          <div className="profile-photo-actions">
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}><Icon name="camera" />Foto</button>
            {draft.image && <button type="button" className="btn btn-ghost" onClick={() => set({ image: '' })}><Icon name="trash" />Remover</button>}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
          </div>
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="pf-name">Nome do produto</label>
          <input id="pf-name" value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ex.: Curso de Tráfego Pago" autoFocus />
        </div>
        <div className="ck-row">
          <div className="field"><label htmlFor="pf-price">Preço (R$)</label>
            <input id="pf-price" type="number" min="0" step="0.01" value={draft.amount} onChange={(e) => set({ amount: Number(e.target.value) })} /></div>
          <div className="field"><label htmlFor="pf-old">Preço "de" (opcional)</label>
            <input id="pf-old" type="number" min="0" step="0.01" value={draft.oldAmount} onChange={(e) => set({ oldAmount: Number(e.target.value) })} /></div>
        </div>
        <div className="ck-row">
          <div className="field"><label htmlFor="pf-cat">Categoria</label>
            <select id="pf-cat" value={draft.icon} onChange={(e) => set({ icon: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.icon} value={c.icon}>{c.label}</option>)}</select></div>
          <div className="field"><label htmlFor="pf-status">Status</label>
            <select id="pf-status" value={draft.status} onChange={(e) => set({ status: e.target.value })}><option>Ativo</option><option>Rascunho</option></select></div>
        </div>
        <div className="field"><label htmlFor="pf-desc">Descrição</label>
          <input id="pf-desc" value={draft.desc} onChange={(e) => set({ desc: e.target.value })} placeholder="Aparece no resumo do checkout" /></div>

        {/* vínculo com o gateway */}
        <div className="field">
          <label>ID do produto no gateway {isOwner() && <button type="button" className="link-btn" onClick={buscarProdutos} disabled={loadingList}>{loadingList ? 'buscando…' : 'buscar'}</button>}</label>
          {bravoList ? (
            <select value={draft.bravoProductId || ''} onChange={(e) => escolher(e.target.value)}>
              <option value="">Selecione…</option>
              {bravoList.map((p) => <option key={bvId(p)} value={bvId(p)}>{bvName(p)}{bvCents(p) != null ? ` — ${formatBRL(bvCents(p) / 100)}` : ''}</option>)}
            </select>
          ) : (
            <input value={draft.bravoProductId || ''} onChange={(e) => set({ bravoProductId: e.target.value })} placeholder={isOwner() ? 'Clique em “buscar” ou cole o ID' : 'Cole o ID do produto no seu gateway'} />
          )}
          {listError && <small style={{ color: 'var(--red)', display: 'block', marginTop: 6 }}>{listError}</small>}
        </div>

        {/* entrega após o pagamento */}
        {(() => {
          const ent = draft.entrega || { tipo: 'email', url: '', conteudo: '' }
          const setEnt = (patch) => set({ entrega: { ...ent, ...patch } })
          return (
            <>
              <div className="field">
                <label htmlFor="pf-entrega">Entrega após o pagamento</label>
                <select id="pf-entrega" value={ent.tipo} onChange={(e) => setEnt({ tipo: e.target.value })}>
                  <option value="email">Só confirmar (cliente recebe por e-mail)</option>
                  <option value="link">Liberar um link de acesso</option>
                  <option value="conteudo">Mostrar um conteúdo (chave, instruções)</option>
                </select>
              </div>
              {ent.tipo === 'link' && (
                <div className="field"><label htmlFor="pf-ent-url">Link de acesso</label>
                  <input id="pf-ent-url" value={ent.url} onChange={(e) => setEnt({ url: e.target.value })} placeholder="https://sua-area-de-membros.com/..." /></div>
              )}
              {ent.tipo === 'conteudo' && (
                <div className="field"><label htmlFor="pf-ent-cont">Conteúdo liberado</label>
                  <textarea id="pf-ent-cont" rows={4} value={ent.conteudo} onChange={(e) => setEnt({ conteudo: e.target.value })} placeholder="Ex.: link do grupo VIP, chave de acesso, instruções de download…" /></div>
              )}
            </>
          )
        })()}

        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={!canSave}>{editing ? 'Salvar' : 'Criar produto'}</button>
        </div>
      </form>
    </div>
  )
}
