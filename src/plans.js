// Planos e taxas. A % é cobrada da venda do vendedor (modelo pós-pago via cartão).
export const PLAN_RATES = { start: 0.025, prime: 0.02, elite: 0.015 }
export const PLAN_NAMES = { start: 'Plano Start', prime: 'Plano Prime', elite: 'Plano Elite' }

export function planRate(plan) { return PLAN_RATES[plan] ?? PLAN_RATES.start }
export function planName(plan) { return PLAN_NAMES[plan] || PLAN_NAMES.start }
export function ratePct(plan) { return `${(planRate(plan) * 100).toString().replace('.', ',')}%` }
