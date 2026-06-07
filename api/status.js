// Função serverless (Vercel) — consulta o status de uma transação no BravoPay.
// Usada pelo polling do checkout. Usa a chave do PRÓPRIO vendedor (multi-tenant).
import { createClient } from '@supabase/supabase-js'
import { keyByTx } from '../lib/gateway.js'

const BASE = 'https://bravopay.solutions/api/v1'
const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

export default async function handler(req, res) {
  const id = req.query.id
  if (!id) return res.status(400).json({ error: 'id da transação é obrigatório.' })

  const srv = process.env.SUPABASE_SERVICE_ROLE
  const sb = srv ? createClient(SB_URL, srv) : null
  const key = (sb ? await keyByTx(sb, id) : null) || process.env.BRAVOPAY_API_KEY
  if (!key) return res.status(500).json({ error: 'Gateway não conectado.' })

  try {
    const r = await fetch(`${BASE}/transactions/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: 'Erro ao consultar transação.', detail: data })
    // normaliza o status do gateway (pode vir em formatos diferentes)
    const raw = String(data.status || data.transaction?.status || '').toLowerCase()
    const PAID = ['paid', 'approved', 'completed', 'confirmed', 'success', 'succeeded', 'pago', 'aprovado']
    const FAIL = ['expired', 'failed', 'canceled', 'cancelled', 'refused', 'declined', 'chargeback', 'refunded', 'expirado', 'cancelado', 'recusado']
    const status = PAID.includes(raw) ? 'PAID' : FAIL.includes(raw) ? 'FAILED' : 'PENDING'
    return res.status(200).json({ status, raw: data.status, id: data.id })
  } catch (e) {
    return res.status(500).json({ error: 'Falha na consulta ao gateway.' })
  }
}
