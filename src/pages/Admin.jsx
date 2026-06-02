import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { formatBRL } from '../data.js'
import { supabase, hasBackend } from '../supabase.js'

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('pt-BR') } catch { return '—' }
}

export default function Admin() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(hasBackend)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (!hasBackend) return
    let alive = true
    const load = async () => {
      try {
        const { data: sess } = await supabase.auth.getSession()
        const token = sess?.session?.access_token
        const r = await fetch('/api/admin', { headers: { Authorization: `Bearer ${token || ''}` } })
        const j = await r.json()
        if (!r.ok) throw new Error(j.error || 'Erro ao carregar.')
        if (alive) { setData(j); setErr('') }
      } catch (e) { if (alive) setErr(e.message) } finally { if (alive) setLoading(false) }
    }
    load()
    const id = setInterval(load, 8000)
    return () => { alive = false; clearInterval(id) }
  }, [refresh])

  async function act(action, target, plan) {
    if (action === 'delete' && !window.confirm(`Apagar a conta ${target}? Isso remove o login e os dados dela.`)) return
    try {
      const { data: sess } = await supabase.auth.getSession()
      const token = sess?.session?.access_token
      const r = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` }, body: JSON.stringify({ action, email: target, plan }) })
      const j = await r.json()
      if (!r.ok) { alert(j.error || 'Falha na ação.'); return }
      setRefresh((n) => n + 1)
    } catch { alert('Falha na ação.') }
  }

  if (!hasBackend) {
    return <div className="admin-note"><Icon name="shield" /><span>Backend não conectado. Configure o Supabase para o painel do dono funcionar.</span></div>
  }
  if (loading) return <div className="empty"><span className="boot-spin" /><p style={{ marginTop: 12 }}>Carregando painel…</p></div>
  if (err) return <div className="admin-note" style={{ color: 'var(--red)' }}><Icon name="close" /><span>{err}</span></div>

  const accounts = data?.accounts || []
  return (
    <>
      <div className="grid metrics">
        <div className="card kpi kpi-hi"><div className="lbl">Contas</div><div className="val num">{data.totalContas}</div></div>
        <div className="card kpi"><div className="lbl">Vendas</div><div className="val num">{data.totalVendas}</div></div>
        <div className="card kpi"><div className="lbl">Pedidos pagos</div><div className="val num">{data.pagos}</div></div>
        <div className="card kpi"><div className="lbl">Receita total</div><div className="val num">{formatBRL(data.receita)}</div></div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h3>Contas</h3><span className="pill">{accounts.length}</span></div>
        {accounts.length === 0 ? (
          <div className="empty"><Icon name="user" /><p>Nenhuma conta ainda</p><span>Contas criadas no cadastro aparecem aqui (de todos os dispositivos).</span></div>
        ) : (
          <table className="tbl">
            <caption className="sr-only">Contas</caption>
            <thead><tr><th>E-mail</th><th>Nome</th><th>Plano</th><th>Vendas</th><th>Receita</th><th>Ações</th></tr></thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.email}>
                  <td>{a.email}</td>
                  <td>{a.name || '—'}</td>
                  <td>
                    <select className="adm-plan" value={a.plan || 'start'} onChange={(e) => act('setPlan', a.email, e.target.value)}>
                      <option value="start">Start</option>
                      <option value="prime">Prime</option>
                      <option value="elite">Elite</option>
                    </select>
                  </td>
                  <td className="num">{a.sales}</td>
                  <td className="num">{formatBRL(a.receita)}</td>
                  <td><button type="button" className="prod-copy" onClick={() => act('delete', a.email)}><Icon name="trash" />Apagar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
