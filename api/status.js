// Função serverless (Vercel) — consulta o status de uma transação no BravoPay.
// Usada pelo polling do checkout (a cada 3s).
const BASE = 'https://bravopay.solutions/api/v1'

export default async function handler(req, res) {
  const key = process.env.BRAVOPAY_API_KEY
  if (!key) return res.status(500).json({ error: 'BRAVOPAY_API_KEY não configurada no servidor.' })

  const id = req.query.id
  if (!id) return res.status(400).json({ error: 'id da transação é obrigatório.' })

  try {
    const r = await fetch(`${BASE}/transactions/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: 'Erro ao consultar transação.', detail: data })
    return res.status(200).json({ status: data.status, id: data.id })
  } catch (e) {
    return res.status(500).json({ error: 'Falha na consulta ao gateway.' })
  }
}
