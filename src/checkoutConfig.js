// Configuração do checkout por produto (modelo, cores, textos, campos…).
// Tudo isto é salvo dentro do produto (product.checkout) no store por usuário.

export const CHECKOUT_MODELS = [
  { key: 'infoproduto', label: 'Infoproduto', desc: 'Produto digital com acesso imediato.', icon: 'bag' },
  { key: 'drop', label: 'Drop / Físico', desc: 'Produto físico com endereço de entrega.', icon: 'produtos' },
  { key: 'rapido', label: 'Checkout rápido (Pix)', desc: 'Vai direto para o QR Code do Pix.', icon: 'bolt' },
]

export const FIELD_DEFS = [
  { key: 'phone', label: 'Celular / WhatsApp' },
  { key: 'cpf', label: 'CPF' },
  { key: 'address', label: 'Endereço de entrega' },
]

export const METHOD_DEFS = [
  { key: 'pix', label: 'Pix' },
  { key: 'card', label: 'Cartão de crédito' },
  { key: 'boleto', label: 'Boleto' },
]

// Comportamento padrão por modelo (campos/pagamentos/bump/timer).
function modelBehavior(model) {
  if (model === 'drop') return {
    fields: { phone: true, cpf: true, address: true },
    methods: { pix: true, card: true, boleto: true },
    bumpEnabled: true, timer: true,
  }
  if (model === 'rapido') return {
    fields: { phone: false, cpf: false, address: false },
    methods: { pix: true, card: false, boleto: false },
    bumpEnabled: false, timer: false,
  }
  return { // infoproduto
    fields: { phone: true, cpf: true, address: false },
    methods: { pix: true, card: true, boleto: true },
    bumpEnabled: true, timer: true,
  }
}

const TEXTS = {
  infoproduto: { title: 'Finalize sua compra', subtitle: 'Preencha seus dados para liberar o acesso na hora.', ctaText: 'Pagar agora' },
  drop: { title: 'Finalize seu pedido', subtitle: 'Preencha seus dados e o endereço de entrega.', ctaText: 'Comprar agora' },
  rapido: { title: 'Pague com Pix', subtitle: 'Rápido e aprovado na hora.', ctaText: 'Gerar Pix' },
}

export function defaultCheckout(model = 'infoproduto') {
  const b = modelBehavior(model)
  const t = TEXTS[model] || TEXTS.infoproduto
  return {
    model,
    accent: '#ffd400',
    theme: 'dark',
    title: t.title,
    subtitle: t.subtitle,
    ctaText: t.ctaText,
    guarantee: 'Garantia de 7 dias',
    fields: b.fields,
    methods: b.methods,
    bump: { enabled: b.bumpEnabled, title: 'Pack de Templates Bônus', desc: 'Leve 50+ templates prontos por um preço único.', amount: 27, oldAmount: 89 },
    timer: b.timer,
  }
}

// Ao trocar o modelo num produto existente: aplica o comportamento do modelo
// mas preserva cores/textos que o usuário já tenha ajustado.
export function applyModel(cfg, model) {
  const b = modelBehavior(model)
  const t = TEXTS[model] || TEXTS.infoproduto
  return {
    ...cfg,
    model,
    title: t.title,
    subtitle: t.subtitle,
    ctaText: t.ctaText,
    fields: b.fields,
    methods: b.methods,
    timer: b.timer,
    bump: { ...cfg.bump, enabled: b.bumpEnabled },
  }
}

// Garante que um produto antigo (sem config) tenha um checkout válido.
export function ensureCheckout(product) {
  return product?.checkout || defaultCheckout('infoproduto')
}
