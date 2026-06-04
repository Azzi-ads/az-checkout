import { useEffect, useState } from 'react'
import { supabase, hasBackend } from './supabase.js'
import { getSales } from './sales.js'

const tsOf = (s) => {
  if (s.ts) return s.ts
  if (s.created_at) { const t = new Date(s.created_at).getTime(); return Number.isFinite(t) ? t : 0 }
  return 0
}

// Hook: carrega as vendas do vendedor (banco com RLS, ou localStorage) e atualiza sozinho.
export function useSales() {
  const [sales, setSales] = useState([])
  useEffect(() => {
    let alive = true
    const load = async () => {
      if (hasBackend) {
        const { data } = await supabase.from('sales').select('id,total,status,created_at,items,customer,fee_charged')
        if (alive) setSales(data || [])
      } else {
        setSales(getSales())
      }
    }
    load()
    const id = setInterval(load, 5000)
    window.addEventListener('storage', load)
    return () => { alive = false; clearInterval(id); window.removeEventListener('storage', load) }
  }, [])
  return sales
}

// Calcula métricas de uma janela (ms). windowMs = null → tudo.
export function computeMetrics(sales, windowMs = null) {
  const cut = windowMs ? Date.now() - windowMs : 0
  const within = sales.filter((s) => !windowMs || tsOf(s) >= cut)
  const pagos = within.filter((s) => s.status === 'pago')
  const receita = pagos.reduce((a, s) => a + Number(s.total || 0), 0)
  const ticket = pagos.length ? receita / pagos.length : 0
  const conv = within.length ? Math.round((pagos.length / within.length) * 100) : 0
  return {
    total: within.length,
    pagos: pagos.length,
    abandonos: within.length - pagos.length,
    receita,
    ticket,
    conv,
  }
}

export const DAY = 864e5
