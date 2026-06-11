// Job recorrente de health-check dos gateways.
//
// IMPORTANTE (stack real): este projeto roda em Vercel (Hobby) — funções
// serverless SEM processo vivo. O `setInterval` de startHealthCheckJob() só
// funciona se houver um servidor Node persistente (ex.: você migrar de plano
// ou rodar um worker). No Hobby, dispare runHealthCheckOnce() de duas formas:
//   1) botão "Atualizar agora" no painel /Admin → Gateways (via /api/admin)
//   2) um cron externo (ou Vercel cron, se sair do Hobby) batendo no endpoint
// Mantemos a API do spec (startHealthCheckJob) pronta para quando houver server.
import { createClient } from '@supabase/supabase-js'
import { updateGatewayHealth } from '../lib/gatewayHealth.js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

export const gatewayIds = () => (process.env.GATEWAY_IDS || 'bravopay')
  .split(',').map((s) => s.trim()).filter(Boolean)

function client(sb) {
  if (sb) return sb
  const key = process.env.SUPABASE_SERVICE_ROLE
  return key ? createClient(SB_URL, key) : null
}

// Um ciclo de health-check (todos os gateways em paralelo).
export async function runHealthCheckOnce(sb) {
  const c = client(sb)
  if (!c) { console.warn('[healthCheck] SUPABASE_SERVICE_ROLE ausente — ciclo ignorado'); return }
  await Promise.all(gatewayIds().map((id) => updateGatewayHealth(c, id)))
}

// Limpa histórico de gateway_health com mais de 24h.
export async function cleanupOldHealth(sb) {
  const c = client(sb)
  if (!c) return
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  try { await c.from('gateway_health').delete().lt('checked_at', cutoff) } catch { /* ignora */ }
}

let started = false
// Inicia o loop (2min health-check + 5min limpeza). Apenas server-side.
export function startHealthCheckJob() {
  if (typeof window !== 'undefined' || started) return
  const c = client()
  if (!c) { console.warn('[healthCheck] job não iniciado (sem service_role)'); return }
  started = true
  runHealthCheckOnce(c).catch(() => {})
  setInterval(() => runHealthCheckOnce(c).catch(() => {}), 2 * 60 * 1000)
  setInterval(() => cleanupOldHealth(c).catch(() => {}), 5 * 60 * 1000)
  console.log('[healthCheck] job iniciado:', gatewayIds().join(', '))
}
