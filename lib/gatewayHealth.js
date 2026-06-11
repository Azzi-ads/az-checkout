// Saúde dos gateways PIX: ping (latência) + taxa de aprovação da última 1h.
// As URLs de ping vêm de env GATEWAY_<ID>_PING_URL. Sem URL → warn e pula (-1).
// Observação de stack: este projeto registra vendas na tabela `sales`
// (não `transactions`), então a taxa de aprovação é calculada sobre `sales`.

const TIMEOUT = Number(process.env.GATEWAY_TIMEOUT_MS) || 3000
const PAID = ['paid', 'approved', 'completed', 'confirmed', 'success', 'succeeded', 'pago', 'aprovado']

const envUrl = (gatewayId) => process.env[`GATEWAY_${String(gatewayId).toUpperCase()}_PING_URL`]

/**
 * Faz um GET leve no endpoint de health do gateway, medindo o tempo em ms.
 * Timeout de GATEWAY_TIMEOUT_MS (3s). Não responder / erro → retorna -1.
 * @param {string} gatewayId
 * @returns {Promise<number>} latência em ms, ou -1
 */
export async function pingGateway(gatewayId) {
  const url = envUrl(gatewayId)
  if (!url) {
    console.warn(`[gatewayHealth] GATEWAY_${String(gatewayId).toUpperCase()}_PING_URL ausente — pulando ping de "${gatewayId}"`)
    return -1
  }
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT)
  const started = Date.now()
  try {
    await fetch(url, { method: 'GET', signal: ctrl.signal })
    return Date.now() - started
  } catch {
    return -1
  } finally {
    clearTimeout(t)
  }
}

/**
 * Taxa de aprovação (%) das transações do gateway na última 1h.
 * Sem transações ainda → 100 (benefício da dúvida).
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {string} gatewayId
 * @returns {Promise<number>}
 */
export async function getApprovalRate(sb, gatewayId) {
  if (!sb) return 100
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  try {
    const { data } = await sb.from('sales').select('status').eq('gateway_id', gatewayId).gte('created_at', since)
    const rows = data || []
    if (!rows.length) return 100
    const ok = rows.filter((r) => PAID.includes(String(r.status || '').toLowerCase())).length
    return Math.round((ok / rows.length) * 10000) / 100
  } catch {
    return 100
  }
}

/**
 * Calcula ping + taxa em paralelo, determina o status e grava em gateway_health.
 *   down      → latência === -1 (não respondeu)
 *   degraded  → taxa < 80% OU latência > 2000ms
 *   ok        → caso contrário
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {string} gatewayId
 */
export async function updateGatewayHealth(sb, gatewayId) {
  const [latency, approval] = await Promise.all([pingGateway(gatewayId), getApprovalRate(sb, gatewayId)])
  let status = 'ok'
  if (latency === -1) status = 'down'
  else if (approval < 80 || latency > 2000) status = 'degraded'

  if (!sb) return
  try {
    await sb.from('gateway_health').insert({
      gateway_id: gatewayId,
      taxa_aprovacao_1h: approval,
      latencia_media_ms: latency === -1 ? TIMEOUT : latency,
      status,
    })
  } catch (e) {
    console.warn(`[gatewayHealth] falha ao gravar saúde de ${gatewayId}:`, e?.message)
  }
}
