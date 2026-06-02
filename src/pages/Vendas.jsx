import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { formatBRL } from '../data.js'
import { getSales, getClientes, getComprovantes } from '../sales.js'

const SUBTABS = [
  { k: 'pedidos', l: 'Pedidos' },
  { k: 'clientes', l: 'Clientes' },
  { k: 'comprovantes', l: 'Comprovantes' },
]
const initials = (n = '') => (n.trim().split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join('') || '?').toUpperCase()

export default function Vendas() {
  const [tab, setTab] = useState('pedidos')
  const [, force] = useState(0)
  useEffect(() => {
    const tick = () => force((n) => n + 1)
    const id = setInterval(tick, 2500)
    window.addEventListener('storage', tick)
    return () => { clearInterval(id); window.removeEventListener('storage', tick) }
  }, [])

  const sales = getSales()
  const clientes = getClientes()
  const comps = getComprovantes()

  return (
    <>
      <div className="chips" role="tablist" aria-label="Seções de vendas">
        {SUBTABS.map((t) => (
          <button key={t.k} type="button" role="tab" aria-selected={tab === t.k} className={`chip${tab === t.k ? ' on' : ''}`} onClick={() => setTab(t.k)}>{t.l}</button>
        ))}
      </div>

      {tab === 'pedidos' && (
        <div className="card">
          {sales.length === 0 ? (
            <div className="empty"><Icon name="vendas" /><p>Nenhum pedido ainda</p><span>Os pedidos aparecem aqui quando alguém finalizar um checkout.</span></div>
          ) : (
            <table className="tbl">
              <caption className="sr-only">Pedidos</caption>
              <thead><tr><th>Pedido</th><th>Cliente</th><th>Itens</th><th>Valor</th><th>Status</th><th>Comprovante</th></tr></thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="id">#{s.id}</td>
                    <td>{s.customer?.name || '—'}</td>
                    <td>{(s.items || []).map((i) => i.name).join(', ') || '—'}</td>
                    <td className="num">{formatBRL(s.total || 0)}</td>
                    <td><span className={`tag ${s.status === 'pago' ? 'pago' : 'pend'}`}><span className="d" />{s.status}</span></td>
                    <td>{s.proof
                      ? <span className="tag pago"><span className="d" />Enviado</span>
                      : <span className="tag reemb"><span className="d" />Não enviou</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'clientes' && (
        clientes.length === 0 ? (
          <div className="card empty"><Icon name="user" /><p>Nenhum cliente ainda</p><span>Os dados de quem comprar ficam guardados aqui.</span></div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {clientes.map((c, i) => (
              <div className="card cli-card" key={i}>
                <div className="cli-head">
                  <div className="cli-av">{initials(c.customer.name)}</div>
                  <div><b>{c.customer.name || 'Sem nome'}</b><span>{c.customer.email || '—'}</span></div>
                </div>
                <div className="cli-data">
                  {c.customer.phone && <div><span>Telefone</span><b>{c.customer.phone}</b></div>}
                  {c.customer.cpf && <div><span>CPF</span><b>{c.customer.cpf}</b></div>}
                  {c.customer.address && <div><span>Endereço</span><b>{c.customer.address}</b></div>}
                </div>
                <div className="cli-stats">
                  <div><b>{c.items}</b><span>produtos</span></div>
                  <div><b>{c.sales}</b><span>pedidos</span></div>
                  <div><b className="num">{formatBRL(c.total)}</b><span>pago</span></div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'comprovantes' && (
        comps.length === 0 ? (
          <div className="card empty"><Icon name="camera" /><p>Nenhum comprovante ainda</p><span>Quando um cliente enviar o comprovante no Pix, ele aparece aqui.</span></div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {comps.map((s) => (
              <div className="card comp-card" key={s.id}>
                <a href={s.proof} target="_blank" rel="noreferrer"><img src={s.proof} alt={`Comprovante ${s.id}`} /></a>
                <div className="comp-info">
                  <b>{s.customer?.name || '—'}</b>
                  <span>#{s.id} · {formatBRL(s.total || 0)}</span>
                  <span className={`tag ${s.status === 'pago' ? 'pago' : 'pend'}`}><span className="d" />{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </>
  )
}
