// Função serverless (Vercel) — lista os produtos da conta BravoPay.
// Usada pelo editor para escolher o produto sem digitar o ID na mão.
const BASE = 'https://bravopay.solutions/api/v1'

export default async function handler(req, res) {
  const key = process.env.BRAVOPAY_API_KEY
  if (!key) return res.status(500).json({ error: 'BRAVOPAY_API_KEY não configurada no servidor.' })
  try {
    const r = await fetch(`${BASE}/products`, { headers: { Authorization: `Bearer ${key}` } })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: `BravoPay (${r.status}): ${JSON.stringify(data)}` })
    // a resposta pode vir como array direto ou dentro de data/products/items
    const products = Array.isArray(data) ? data : (data.data || data.products || data.items || [])
    return res.status(200).json({ products })
  } catch (e) {
    return res.status(500).json({ error: 'Falha ao listar produtos do BravoPay.' })
  }
}
