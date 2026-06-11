// Motor de roteamento de gateways PIX: pontua a saúde de cada gateway, escolhe
// a melhor fila (do melhor ao pior) e processa com fallback automático.

export class NoGatewayAvailableError extends Error {
  constructor(message = 'Nenhum gateway disponível no momento') {
    super(message)
    this.name = 'NoGatewayAvailableError'
  }
}

/**
 * @typedef {Object} GatewayHealth
 * @property {string} gateway_id
 * @property {number} taxa_aprovacao_1h
 * @property {number} latencia_media_ms
 * @property {'ok'|'degraded'|'down'} status
 * @property {string} checked_at
 */

/**
 * Score 0–100 de um gateway. `down` → 0.
 * score = (taxa_aprovacao_1h * 0.7) + ((1 - latencia_media_ms / 3000) * 100 * 0.3)
 * @param {GatewayHealth} health
 * @returns {number}
 */
export function scoreGateway(health) {
  if (!health || health.status === 'down') return 0
  const approval = Number(health.taxa_aprovacao_1h) || 0
  const latency = Number(health.latencia_media_ms) || 0
  const score = (approval * 0.7) + ((1 - latency / 3000) * 100 * 0.3)
  return Math.max(0, Math.round(score * 100) / 100)
}

// Pega o registro mais recente de cada gateway em gateway_health.
async function latestHealthByGateway(sb) {
  const { data } = await sb.from('gateway_health')
    .select('*')
    .order('checked_at', { ascending: false })
    .limit(1000)
  const latest = {}
  for (const row of data || []) {
    if (!latest[row.gateway_id]) latest[row.gateway_id] = row
  }
  return Object.values(latest)
}

/**
 * Fila ordenada de gateways utilizáveis (melhor → pior), descartando os `down`.
 * Sem nenhum disponível → lança NoGatewayAvailableError.
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @returns {Promise<string[]>}
 */
export async function selectGateway(sb) {
  const rows = await latestHealthByGateway(sb)
  const usable = rows
    .filter((h) => h.status !== 'down')
    .map((h) => ({ id: h.gateway_id, score: scoreGateway(h) }))
    .sort((a, b) => b.score - a.score)
  if (!usable.length) throw new NoGatewayAvailableError()
  return usable.map((g) => g.id)
}

// Corre uma promise contra um timeout (rejeita se estourar).
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('gateway timeout')), ms)
    promise.then(
      (v) => { clearTimeout(t); resolve(v) },
      (e) => { clearTimeout(t); reject(e) },
    )
  })
}

/**
 * Processa um pagamento percorrendo a fila de gateways com fallback automático.
 * Cada tentativa tem timeout (exceto a ÚLTIMA da fila, que aguarda — não há
 * para onde cair, então abortar só perderia um pagamento bom).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} sb
 * @param {Object} pixPayload
 * @param {(gatewayId: string, payload: Object) => Promise<any>} processOne
 * @returns {Promise<{success:boolean, transactionId:string|null, gatewayUsed:string, usedFallback:boolean, result:any}>}
 */
export async function processWithFallback(sb, pixPayload, processOne) {
  const queue = await selectGateway(sb) // pode lançar NoGatewayAvailableError
  const timeout = Number(process.env.GATEWAY_TIMEOUT_MS) || 3000
  let lastErr
  for (let i = 0; i < queue.length; i++) {
    const gatewayId = queue[i]
    const isLast = i === queue.length - 1
    try {
      const result = isLast
        ? await processOne(gatewayId, pixPayload)
        : await withTimeout(processOne(gatewayId, pixPayload), timeout)
      return {
        success: true,
        transactionId: result?.transactionId || result?.id || result?.data?.id || null,
        gatewayUsed: gatewayId,
        usedFallback: i > 0,
        result,
      }
    } catch (e) {
      lastErr = e
      // erro "de negócio" do gateway (HTTP do provedor): não adianta cair p/ outro
      if (e?.httpStatus) throw e
    }
  }
  throw lastErr || new NoGatewayAvailableError()
}
