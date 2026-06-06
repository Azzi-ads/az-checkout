// Assistente de IA da AZ — cria funil de produtos e gera resumo do dia.
// Usa a API da Anthropic (Claude). Chave secreta em ANTHROPIC_API_KEY (Vercel).
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'
const AI_MODEL = process.env.AI_MODEL || 'claude-3-5-haiku-latest'

const FUNNEL_SYSTEM = `Você é o assistente da plataforma AZ Checkout (checkout para infoprodutos, pt-BR).
O usuário descreve um produto ou funil em linguagem natural. Responda APENAS com um JSON válido
(sem nenhum texto fora do JSON), neste formato exato:
{
  "message": "frase curta explicando o que você montou",
  "products": [
    {
      "name": "Nome do produto",
      "amount": 97,
      "oldAmount": 197,
      "desc": "descrição curta que aparece no resumo do checkout",
      "accent": "#16a34a",
      "theme": "light",
      "title": "Título do checkout",
      "subtitle": "Subtítulo do checkout",
      "ctaText": "Comprar agora",
      "bump": { "enabled": true, "title": "Oferta adicional", "desc": "...", "amount": 27, "oldAmount": 47 },
      "upsell": { "enabled": true, "title": "Oferta pós-compra", "desc": "...", "price": 67 },
      "downsell": { "enabled": false, "title": "", "desc": "", "price": 19 }
    }
  ]
}
Regras:
- Cores SEMPRE em hex (#rrggbb). Se o usuário citar a cor por nome (verde, azul, roxo...), converta para hex.
- "amount"/"oldAmount"/"price" são números em reais (sem "R$"). Use 0 quando não houver.
- "theme" só pode ser "light" ou "dark". Padrão "light".
- Tudo em português do Brasil. Não invente campos fora do schema.
- Se o usuário pedir vários produtos/etapas de funil, retorne vários itens em "products".`

const SUMMARY_SYSTEM = `Você é o analista da AZ Checkout. Receberá as métricas do dia em JSON.
Escreva um resumo curto e claro em português do Brasil (4 a 6 linhas, markdown leve):
faturamento, pedidos pagos, ticket médio, conversão, pendentes e UMA recomendação prática.
Seja direto e motivador. NÃO invente números além dos fornecidos.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(400).json({ error: 'IA não configurada. Adicione ANTHROPIC_API_KEY no Vercel.' })

  // exige usuário logado (protege os créditos da API)
  try {
    const srv = process.env.SUPABASE_SERVICE_ROLE
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim()
    if (srv && token) {
      const sb = createClient(SB_URL, srv)
      const { data: u } = await sb.auth.getUser(token)
      if (!u?.user) return res.status(401).json({ error: 'Não autorizado.' })
    }
  } catch { /* segue */ }

  try {
    const { mode, prompt, context } = req.body || {}
    const system = mode === 'summary' ? SUMMARY_SYSTEM : FUNNEL_SYSTEM
    const userContent = mode === 'summary'
      ? `Métricas do dia (JSON):\n${JSON.stringify(context || {})}\n\nObservação do usuário: ${prompt || '—'}`
      : `Pedido do usuário: ${prompt}\n\nProdutos que já existem (nomes): ${JSON.stringify(context?.products || [])}`

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: AI_MODEL, max_tokens: 1800, system, messages: [{ role: 'user', content: userContent }] }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || `IA (${r.status})` })

    const text = (data.content || []).map((c) => c.text || '').join('').trim()
    if (mode === 'summary') return res.status(200).json({ text })

    // funil: extrair o JSON da resposta
    let jsonStr = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim()
    let parsed = null
    try { parsed = JSON.parse(jsonStr) } catch { const m = text.match(/\{[\s\S]*\}/); if (m) { try { parsed = JSON.parse(m[0]) } catch { /* */ } } }
    if (!parsed || !Array.isArray(parsed.products)) return res.status(200).json({ text, parseError: true })
    return res.status(200).json({ funnel: parsed })
  } catch {
    return res.status(500).json({ error: 'Erro ao chamar a IA.' })
  }
}
