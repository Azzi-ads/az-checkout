// Regras de score + interface de provider (troca regra ↔ IA sem mexer no resto).

export const SCORE = {
  page_open: 10, scroll25: 5, scroll50: 15, scroll75: 10,
  stay30: 10, stay60: 10, hover_pay: 20, click_pay: 25, field_focus: 10,
  fill_name: 10, fill_email: 10, fill_phone: 10,
  price_view: 15, price_review: 15, testimonials_view: 10, guarantee_view: 10, faq: 10,
  inactive_2m: -10, inactive_5m: -20, tab_change: -5, minimize: -5,
  try_close: -15, back: -20, return: -10,
}

export const clamp = (n) => Math.max(0, Math.min(100, n))

export function tierOf(score) {
  if (score >= 80) return 'quente'      // COMPRADOR QUENTE — não interromper
  if (score >= 50) return 'hesitando'   // suporte/WhatsApp
  if (score >= 30) return 'interessado' // desconto relâmpago
  return 'abandono'                     // exit intent
}

// Interface IntentScoringProvider: .delta(event) -> número
export class RuleBasedProvider {
  delta(event) { return SCORE[event] || 0 }
}
// Stub para futura troca por IA (ex.: pesos aprendidos por modelo).
export class AIProvider {
  delta(event) { return SCORE[event] || 0 }
}
