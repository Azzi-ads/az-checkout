import { useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import KPICard from '../components/KPICard.jsx'
import { supabase, hasBackend } from '../supabase.js'

const CHECKPOINTS = [
  { icon: 'mail', title: 'Dados de contato', desc: 'e-mail e telefone' },
  { icon: 'lock', title: 'Operação interna', desc: 'tokens e chaves' },
  { icon: 'shield', title: 'Antifraude', desc: 'score comportamental' },
  { icon: 'bolt', title: 'Bloqueio automático', desc: 'alto risco' },
]
const DAY = 864e5
const topN = (arr, key) => {
  const m = {}
  arr.forEach((a) => { const v = a[key]; if (v) m[v] = (m[v] || 0) + 1 })
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5)
}

export default function AZSecurity({ profile, onSave }) {
  const on = !!profile?.security
  const [rows, setRows] = useState([])
  const cfg = profile?.fraudConfig || {}
  const [block, setBlock] = useState(cfg.block || 61)
  const [msg, setMsg] = useState(cfg.message || 'Estamos enfrentando uma instabilidade temporária. Tente novamente mais tarde.')
  const [disp, setDisp] = useState((cfg.disposable || []).join(', '))
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!hasBackend) return
    let alive = true
    supabase.from('fraud_assessments').select('*').order('created_at', { ascending: false }).limit(2000)
      .then(({ data }) => { if (alive) setRows(data || []) }).catch(() => {})
    return () => { alive = false }
  }, [])

  const stats = useMemo(() => {
    const today = rows.filter((r) => Date.now() - new Date(r.created_at).getTime() <= DAY)
    const suspeitas = today.filter((r) => (r.total_score || 0) >= 31).length
    const bloqueios = today.filter((r) => r.action_taken === 'block').length
    const avg = today.length ? Math.round(today.reduce((a, r) => a + (r.total_score || 0), 0) / today.length) : 0
    return { suspeitas, bloqueios, avg, ips: topN(rows, 'ip'), fps: topN(rows, 'fingerprint'), cpfs: topN(rows, 'cpf_hash') }
  }, [rows])

  function saveCfg() {
    onSave({ fraudConfig: { block: Number(block) || 61, message: msg, disposable: disp.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) } })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <div className="card sec-hero">
        <div className="sec-main">
          <div className="sec-status">
            <span className={`sec-live${on ? ' on' : ''}`}><span className="dot" />PROTEÇÃO ANTIFRAUDE</span>
            <span className={`sec-badge${on ? ' on' : ''}`}>{on ? 'Ativa' : 'Inativa'}</span>
          </div>
          <h2>{on ? 'Checkout protegido' : 'Antifraude desligado'}</h2>
          <p>{on ? 'Cada checkout passa por análise comportamental de risco antes de gerar a cobrança.' : 'Ative para analisar risco e bloquear tentativas de fraude automaticamente.'}</p>
          <div className="sec-bars">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={`sec-bar${on && i < 4 ? ' on' : ''}`} />)}</div>
        </div>
        <div className="sec-side">
          <div className="sec-toggle">
            <span>ANTIFRAUDE</span><b>{on ? 'Ativo' : 'Inativo'}</b>
            <button type="button" className={`sw${on ? ' on' : ''}`} role="switch" aria-checked={on} aria-label="Ativar antifraude" onClick={() => onSave({ security: !on })} />
          </div>
          <div className="sec-indicators">
            <div className="sec-ind-title">Checkpoints</div>
            {CHECKPOINTS.map((c) => (
              <div className="sec-ind" key={c.title}>
                <div className="sec-ind-top"><span>{c.title}</span><b>{on ? 'ok' : '—'}</b></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid kpis" style={{ marginTop: 16 }}>
        <KPICard icon="shield" label="Sessões suspeitas (hoje)" value={String(stats.suspeitas)} />
        <KPICard icon="lock" label="Bloqueios (hoje)" value={String(stats.bloqueios)} />
        <KPICard icon="chart" label="Score médio (hoje)" value={String(stats.avg)} />
        <KPICard icon="bolt" label="Análises (total)" value={String(rows.length)} />
      </div>

      <div className="grid row2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-head"><h3>IPs suspeitos</h3></div>
          {stats.ips.length === 0 ? <div className="empty"><Icon name="shield" /><p>Nada por aqui</p></div> : (
            <div className="feed">{stats.ips.map(([ip, n]) => <div className="it" key={ip}><div className="who num">{ip}</div><div className="amt num">{n}</div></div>)}</div>
          )}
        </div>
        <div className="card">
          <div className="card-head"><h3>Dispositivos recorrentes</h3></div>
          {stats.fps.length === 0 ? <div className="empty"><Icon name="shield" /><p>Nada por aqui</p></div> : (
            <div className="feed">{stats.fps.map(([fp, n]) => <div className="it" key={fp}><div className="who">{fp}</div><div className="amt num">{n}</div></div>)}</div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h3>Configurações do antifraude</h3></div>
        <div className="ck-row">
          <div className="field"><label>Bloquear a partir do score</label><input type="number" min="31" max="100" value={block} onChange={(e) => setBlock(e.target.value)} /></div>
          <div className="field"><label>Domínios descartáveis (separados por vírgula)</label><input value={disp} onChange={(e) => setDisp(e.target.value)} placeholder="mailinator, tempmail, ..." /></div>
        </div>
        <div className="field"><label>Mensagem de bloqueio</label><input value={msg} onChange={(e) => setMsg(e.target.value)} /></div>
        <button type="button" className="btn btn-primary" onClick={saveCfg}>{saved ? <><Icon name="check" />Salvo!</> : 'Salvar configurações'}</button>
      </div>
    </>
  )
}
