import { useState } from 'react'
import Tabs from '../components/Tabs.jsx'
import DataTable from '../components/DataTable.jsx'
import { orders, orderFilters } from '../data.js'

export default function Vendas() {
  const [filter, setFilter] = useState('todas')
  const panelId = 'vendas-panel'

  const rows = filter === 'todas'
    ? orders.rows
    : orders.rows.filter((r) => r.status.key === filter)

  return (
    <>
      <Tabs
        tabs={orderFilters}
        value={filter}
        onChange={setFilter}
        panelId={panelId}
        label="Filtrar pedidos por status"
      />
      <div
        className="card"
        id={panelId}
        role="tabpanel"
        aria-labelledby={`tab-${filter}`}
        tabIndex={0}
      >
        {rows.length > 0 ? (
          <DataTable columns={orders.columns} rows={rows} caption="Histórico de pedidos" />
        ) : (
          <p style={{ color: 'var(--muted)', padding: '8px 4px' }}>Nenhum pedido neste filtro.</p>
        )}
      </div>
    </>
  )
}
