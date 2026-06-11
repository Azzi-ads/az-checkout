// Purchase Intent Score — pesos dos eventos e cálculo do score (0–100) por sessão.
// Cada evento conta no máximo uma vez por sessão, EXCETO os repetíveis
// (INACTIVE_2MIN e TAB_HIDDEN), cujas penalidades podem acumular.

export const INTENT_EVENTS = {
  PAGE_OPEN: 10,
  SCROLLED_50: 15,
  TIME_30S: 10,
  HOVER_PAY_BUTTON: 20,
  RETURNED_TO_PRICE: 15,
  FIELD_CLICK: 10,
  INACTIVE_2MIN: -10,
  TAB_HIDDEN: -5,
}

// eventos que podem repetir (não entram no Set de "já aplicados")
export const REPEATABLE = new Set(['INACTIVE_2MIN', 'TAB_HIDDEN'])

const clamp = (n) => Math.max(0, Math.min(100, n))

/**
 * @typedef {Object} IntentEvent
 * @property {keyof typeof INTENT_EVENTS} type
 * @property {number} timestamp
 */

/**
 * Calcula o score final 0–100 a partir da lista de eventos.
 * Score começa em 0; clampa a cada passo (mínimo 0, máximo 100).
 * @param {IntentEvent[]} events
 * @returns {number}
 */
export function calculateScore(events) {
  let score = 0
  const applied = new Set()
  for (const ev of events || []) {
    if (!ev || !(ev.type in INTENT_EVENTS)) continue
    if (!REPEATABLE.has(ev.type)) {
      if (applied.has(ev.type)) continue
      applied.add(ev.type)
    }
    score = clamp(score + INTENT_EVENTS[ev.type])
  }
  return score
}
