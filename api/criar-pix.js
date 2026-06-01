// Função serverless (Vercel) — cria uma transação PIX no BravoPay.
// A chave secreta vive APENAS aqui no servidor, via env var BRAVOPAY_API_KEY.
// O navegador nunca vê a chave.
const BASE = 'https://bravopay.solutions/api/v1'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  const key = process.env.BRAVOPAY_API_KEY
  if (!key) return res.status(500).json({ error: 'BRAVOPAY_API_KEY não configurada no servidor.' })

  try {
    const { product_id, amount_cents, customer, utm, fbclid, ttclid, gclid } = req.body || {}
    if (!product_id) return res.status(400).json({ error: 'Produto sem ID do BravoPay. Configure em Produtos → Editar.' })
    if (!amount_cents || amount_cents < 1) return res.status(400).json({ error: 'Valor inválido.' })

    const r = await fetch(`${BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ product_id, amount_cents, method: 'PIX', customer, utm, fbclid, ttclid, gclid }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) {
      const raw = data && Object.keys(data).length ? JSON.stringify(data) : `HTTP ${r.status}`
      console.error('[BravoPay] erro criar transação', r.status, raw)
      return res.status(r.status).json({ error: `BravoPay (${r.status}): ${raw}`, status: r.status, detail: data })
    }

    // devolve só o necessário para o checkout
    return res.status(200).json({
      id: data.id,
      status: data.status,
      qr_code: data.qr_code,
      qr_code_image: data.qr_code_image,
      expires_at: data.expires_at,
      amount_cents: data.amount_cents,
    })
  } catch (e) {
    return res.status(500).json({ error: 'Falha na comunicação com o gateway.' })
  }
}
