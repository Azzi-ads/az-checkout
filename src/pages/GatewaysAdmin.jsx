// Painel do dono: saúde dos gateways PIX ao vivo (Supabase Realtime).
// Status, taxa de aprovação 1h, latência, último check e mini-gráfico (SVG nativo,
// sem Recharts — o projeto não usa libs de gráfico). Botão "Atualizar agora"
// dispara um ciclo de health-check via /api/admin (substitui o job no Hobby).
import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { supabase, hasBackend } from '../supabase.js'

const STATUS = {
  ok: { label: 'Operacional', cls: 'gw-ok' },
  degraded: { label: 'Degradado', cls: 'gw-degraded' },
  down: { label: 'Fora do ar', cls: 'gw-down' },
}

function relTime(iso) {
  if (!iso) return '—'
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return `há ${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)}d`
}

// mini gráfico de linha das últimas leituras de taxa (0–100)
function Sparkline({ values }) {
  if (!values || values.length < 2) return <div className="gw-spark gw-spark-empty">sem histórico</div>
  const w = 220, h = 48, pad = 4
  const max = 100, min = Math.min(...values, 0)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1)
    const y = pad + (1 - (v - min) / span) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg className="gw-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts.join(' ')} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export default function GatewaysAdmin() {
  const [groups, setGroups] = useState([]) // [{ id, latest, history:[taxa...] }]
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!hasBackend) return
    try {
      const { data, error } = await supabase
        .from('gateway_health')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(600)
      if (error) { setErr(error.message); return }
      const byId = {}
      for (const row of data || []) {
        if (!byId[row.gateway_id]) byId[row.gateway_id] = { id: row.gateway_id, latest: row, rows: [] }
        byId[row.gateway_id].rows.push(row)
      }
      const list = Object.values(byId).map((g) => ({
        id: g.id,
        latest: g.latest,
        // últimas 12 leituras, em ordem cronológica, só a taxa
        history: g.rows.slice(0, 12).reverse().map((r) => Number(r.taxa_aprovacao_1h)),
      })).sort((a, b) => a.id.localeCompare(b.id))
      setGroups(list)
      setErr('')
    } catch (e) { setErr(e?.message || 'Falha ao carregar.') }
  }, [])

  useEffect(() => {
    setBusy(true)
    load().finally(() => setBusy(false))
    if (!hasBackend) return undefined
    // tempo real: qualquer insert em gateway_health recarrega
    const ch = supabase
      .channel('gateway_health_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gateway_health' }, () => load())
      .subscribe()
    return () => { try { supabase.removeChannel(ch) } catch { /* */ } }
  }, [load])

  async function refreshNow() {
    setRefreshing(true); setErr('')
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token
      const r = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify({ action: 'gatewayHealthCheck' }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) setErr(j.error || 'Falha ao rodar o health-check.')
      else await load()
    } catch (e) { setErr(e?.message || 'Falha na requisição.') }
    finally { setRefreshing(false) }
  }

  const empty = useMemo(() => !busy && groups.length === 0, [busy, groups])

  return (
    <div className="gw-wrap">
      <div className="gw-top">
        <div>
          <h2 className="gw-h2">Roteamento de gateways</h2>
          <p className="gw-sub">Saúde em tempo real. O melhor gateway é escolhido por score; falhas caem para o próximo automaticamente.</p>
        </div>
        <button type="button" className="btn btn-primary gw-refresh" onClick={refreshNow} disabled={refreshing}>
          <Icon name="pulse" />{refreshing ? 'Checando…' : 'Atualizar agora'}
        </button>
      </div>

      {err && <div className="ck-error"><Icon name="close" />{err}</div>}

      {empty && (
        <div className="gw-empty">
          <Icon name="store" />
          <b>Sem leituras ainda</b>
          <span>Clique em “Atualizar agora” para rodar o primeiro health-check. Configure <code>GATEWAY_IDS</code> e as URLs de ping nas variáveis de ambiente.</span>
        </div>
      )}

      <div className="gw-grid">
        {groups.map(({ id, latest, history }) => {
          const st = STATUS[latest.status] || STATUS.ok
          return (
            <div key={id} className={`card gw-card ${st.cls}`}>
              <div className="gw-card-head">
                <b className="gw-name">{id}</b>
                <span className={`gw-badge ${st.cls}`}>{st.label}</span>
              </div>
              <div className="gw-metrics">
                <div className="gw-metric">
                  <span className="gw-metric-lbl">Aprovação (1h)</span>
                  <b className="gw-metric-val num">{Number(latest.taxa_aprovacao_1h).toFixed(1)}%</b>
                </div>
                <div className="gw-metric">
                  <span className="gw-metric-lbl">Latência</span>
                  <b className="gw-metric-val num">{latest.latencia_media_ms} ms</b>
                </div>
              </div>
              <Sparkline values={history} />
              <div className="gw-foot">
                <Icon name="pulse" /> Último check {relTime(latest.checked_at)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
