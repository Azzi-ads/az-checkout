import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { formatBRL } from '../data.js'
import { supabase, hasBackend } from '../supabase.js'

async function token() { if (!hasBackend) return ''; const { data } = await supabase.auth.getSession(); return data?.session?.access_token || '' }
async function api(body) {
  const t = await token()
  const r = await fetch('/api/exp', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify(body) })
  return r.json()
}
function cleanCfg(c) { const o = {}; if (c.title) o.title = c.title; if (c.ctaText) o.ctaText = c.ctaText; if (c.accent) o.accent = c.accent; return o }

export default function ABTest({ product }) {
  const slug = product.slug
  const [exps, setExps] = useState(null)
  const [creating, setCreating] = useState(false)
  const [variants, setVariants] = useState([{ name: 'Variante B', config: { title: '', ctaText: '', accent: '' } }])
  const [busy, setBusy] = useState(false)

  const load = () => api({ action: 'list', slug }).then((j) => setExps(j.experiments || [])).catch(() => setExps([]))
  useEffect(() => { if (hasBackend) load(); else setExps([]) /* eslint-disable-next-line */ }, [slug])

  const running = (exps || []).find((e) => e.status === 'running')
  const setVar = (i, patch) => setVariants((vs) => vs.map((v, idx) => idx === i ? { ...v, config: { ...v.config, ...patch } } : v))

  async function start() {
    setBusy(true)
    const vs = [{ name: 'Controle', isControl: true, config: {} }, ...variants.map((v) => ({ name: v.name, config: cleanCfg(v.config) }))]
    await api({ action: 'create', slug, name: 'Teste A/B', variants: vs })
    setBusy(false); setCreating(false); setVariants([{ name: 'Variante B', config: { title: '', ctaText: '', accent: '' } }]); load()
  }
  async function setStatus(id, status) { await api({ action: 'set-status', id, status }); load() }

  if (exps === null) return <p className="profile-hint">Carregando testes…</p>

  if (running) {
    const best = [...running.summary].sort((a, b) => b.erpv - a.erpv)[0]
    return (
      <>
        <p className="profile-hint" style={{ marginBottom: 10 }}>Teste rodando. Métrica principal: <b>ERPV</b> (receita por visitante).</p>
        <div className="ab-rows">
          {running.summary.map((v) => (
            <div className={`ab-row${best && v.id === best.id && v.visitors > 0 ? ' win' : ''}`} key={v.id}>
              <div className="ab-row-h"><b>{v.name}</b>{best && v.id === best.id && v.visitors > 0 && <span className="ab-win">▲ líder</span>}</div>
              <div className="ab-row-m">
                <span>{v.visitors} visitantes</span>
                <span>{Math.round(v.cr * 100)}% conv.</span>
                <b>{formatBRL(v.erpv)}/visit.</b>
                <span>{formatBRL(v.receita)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="profile-photo-actions" style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={() => setStatus(running.id, 'paused')}><Icon name="bolt" />Pausar</button>
          <button type="button" className="btn btn-ghost" onClick={() => setStatus(running.id, 'finished')}><Icon name="check" />Encerrar</button>
        </div>
      </>
    )
  }

  if (!creating) return (
    <>
      <p className="profile-hint" style={{ marginBottom: 12 }}>Crie variações do checkout e descubra qual gera mais receita por visitante.</p>
      <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><Icon name="plus" />Criar teste A/B</button>
      {(exps || []).filter((e) => e.status !== 'running').length > 0 && (
        <div className="ab-rows" style={{ marginTop: 14 }}>
          {(exps || []).filter((e) => e.status !== 'running').map((e) => (
            <div className="ab-row" key={e.id}>
              <div className="ab-row-h"><b>{e.name}</b><span className="ab-win" style={{ color: 'var(--muted-2)' }}>{e.status}</span></div>
            </div>
          ))}
        </div>
      )}
    </>
  )

  return (
    <>
      <p className="profile-hint" style={{ marginBottom: 10 }}>O <b>Controle</b> é o checkout atual. Configure as variações (campos vazios mantêm o original):</p>
      {variants.map((v, i) => (
        <div className="ab-edit" key={i}>
          <div className="wgroup">{v.name}</div>
          <div className="field"><label>Título</label><input value={v.config.title} onChange={(e) => setVar(i, { title: e.target.value })} placeholder="(mantém o atual)" /></div>
          <div className="field"><label>Texto do botão</label><input value={v.config.ctaText} onChange={(e) => setVar(i, { ctaText: e.target.value })} placeholder="(mantém o atual)" /></div>
          <div className="field"><label>Cor de destaque</label>
            <div className="ck-color-row"><input type="color" value={v.config.accent || '#16a34a'} onChange={(e) => setVar(i, { accent: e.target.value })} />{v.config.accent && <button type="button" className="btn btn-ghost" onClick={() => setVar(i, { accent: '' })}>Padrão</button>}</div>
          </div>
        </div>
      ))}
      {variants.length < 3 && <button type="button" className="btn btn-ghost" onClick={() => setVariants((vs) => [...vs, { name: `Variante ${String.fromCharCode(66 + vs.length)}`, config: { title: '', ctaText: '', accent: '' } }])}><Icon name="plus" />Adicionar variante</button>}
      <div className="profile-photo-actions" style={{ marginTop: 12 }}>
        <button type="button" className="btn btn-ghost" onClick={() => setCreating(false)}>Cancelar</button>
        <button type="button" className="btn btn-primary" onClick={start} disabled={busy}><Icon name="check" />{busy ? 'Iniciando…' : 'Iniciar teste'}</button>
      </div>
    </>
  )
}
