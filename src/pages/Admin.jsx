import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { formatBRL } from '../data.js'
import { getSales } from '../sales.js'

function listAccounts() {
  const out = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('az_store_')) {
        let data = {}
        try { data = JSON.parse(localStorage.getItem(k) || '{}') } catch { /* ignore */ }
        out.push({
          key: k,
          email: k.slice('az_store_'.length),
          name: data.profile?.name || '',
          products: (data.products || []).length,
          security: !!data.profile?.security,
        })
      }
    }
  } catch { /* ignore */ }
  return out
}

export default function Admin() {
  const [, force] = useState(0)
  const accounts = listAccounts()
  const sales = getSales()
  const pagos = sales.filter((s) => s.status === 'pago')
  const receita = pagos.reduce((a, s) => a + (s.total || 0), 0)

  function del(k, email) {
    if (!window.confirm(`Apagar a conta ${email}? Os dados locais dela serão removidos.`)) return
    try { localStorage.removeItem(k) } catch { /* ignore */ }
    force((n) => n + 1)
  }

  return (
    <>
      <div className="admin-note">
        <Icon name="shield" />
        <span>Painel do dono. Hoje os dados são <b>deste navegador</b> (sem backend). Para ver contas e faturamento de todos os usuários em qualquer lugar, é preciso ligar o banco de dados — próximo passo do roadmap.</span>
      </div>

      <div className="grid metrics">
        <div className="card kpi kpi-hi"><div className="lbl">Contas criadas</div><div className="val num">{accounts.length}</div></div>
        <div className="card kpi"><div className="lbl">Vendas registradas</div><div className="val num">{sales.length}</div></div>
        <div className="card kpi"><div className="lbl">Pedidos pagos</div><div className="val num">{pagos.length}</div></div>
        <div className="card kpi"><div className="lbl">Receita</div><div className="val num">{formatBRL(receita)}</div></div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head"><h3>Contas</h3><span className="pill">{accounts.length}</span></div>
        {accounts.length === 0 ? (
          <div className="empty"><Icon name="user" /><p>Nenhuma conta neste navegador</p><span>Contas criadas no login aparecem aqui.</span></div>
        ) : (
          <table className="tbl">
            <caption className="sr-only">Contas</caption>
            <thead><tr><th>E-mail</th><th>Nome</th><th>Produtos</th><th>AZ Security</th><th>Plano</th><th>Ações</th></tr></thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.key}>
                  <td>{a.email}</td>
                  <td>{a.name || '—'}</td>
                  <td className="num">{a.products}</td>
                  <td>{a.security ? <span className="tag pago"><span className="d" />Ativa</span> : <span className="tag pend"><span className="d" />Inativa</span>}</td>
                  <td>{a.email.includes('enzoazzi76') || a.email.includes('enzozzi76') ? 'Elite (dono)' : 'Start'}</td>
                  <td><button type="button" className="prod-copy" onClick={() => del(a.key, a.email)}><Icon name="trash" />Apagar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
