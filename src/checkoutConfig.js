// Configuração do checkout por produto (modelo, layout, widgets, cores…).
// Salvo dentro do produto (product.checkout) no store por usuário.

export const CHECKOUT_LAYOUTS = [
  { key: 'classico', label: 'Clássico', desc: 'Formulário e resumo lado a lado.' },
  { key: 'centralizado', label: 'Centralizado', desc: 'Coluna única e focada.' },
  { key: 'resumo-topo', label: 'Resumo em destaque', desc: 'Resumo no topo, depois o formulário.' },
]

// Modelos (nomes adaptados — inspirados em builders do mercado).
export const CHECKOUT_MODELS = [
  { key: 'padrao', label: 'Padrão', desc: 'Completo e equilibrado.', icon: 'bag' },
  { key: 'renda-extra', label: 'Renda Extra', desc: 'Foco em oferta e order bump.', icon: 'revenue' },
  { key: 'pix-na-hora', label: 'Pix na Hora', desc: 'Só Pix, aprovação imediata.', icon: 'pix' },
  { key: 'drop', label: 'Drop / Físico', desc: 'Produto físico com entrega.', icon: 'produtos' },
  { key: 'venda-rapida', label: 'Venda Rápida', desc: 'Poucos campos, alta conversão.', icon: 'bolt' },
  { key: 'venda-rapida-drop', label: 'Venda Rápida Drop', desc: 'Rápido + entrega física.', icon: 'produtos' },
  { key: 'vision', label: 'Vision', desc: 'Premium com depoimentos.', icon: 'chart' },
  { key: 'valor-livre', label: 'Valor Livre', desc: 'Cliente escolhe quanto pagar.', icon: 'lines' },
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

export const CHECKOUT_THEMES = [
  { key: 'branco', label: 'Branco', bg: '', accent: '#16a34a', mode: 'light' },
  { key: 'branco-azul', label: 'Branco Azul', bg: '', accent: '#2563eb', mode: 'light' },
  { key: 'branco-roxo', label: 'Branco Roxo', bg: '', accent: '#7c3aed', mode: 'light' },
  { key: 'escuro', label: 'Escuro', bg: '', accent: '#ffd400', mode: 'dark' },
  { key: 'aurora', label: 'Aurora', bg: 'radial-gradient(900px 520px at 18% -10%, #5b2a86, transparent 60%), radial-gradient(820px 600px at 120% 15%, #1f6f8b, transparent 55%), #0a0a12', accent: '#22d3ee', mode: 'dark' },
  { key: 'sunset', label: 'Sunset', bg: 'linear-gradient(160deg, #2a1020, #4a1d2e 52%, #160a10)', accent: '#fb923c', mode: 'dark' },
  { key: 'neon', label: 'Neon', bg: 'radial-gradient(720px 520px at 82% -5%, rgba(139,92,246,.55), transparent 60%), radial-gradient(600px 500px at 0% 110%, rgba(34,211,238,.25), transparent 60%), #07070d', accent: '#a78bfa', mode: 'dark' },
  { key: 'floresta', label: 'Floresta', bg: 'linear-gradient(160deg, #07251c, #0a3a2a 58%, #05140f)', accent: '#3ddc91', mode: 'dark' },
  { key: 'oceano', label: 'Oceano', bg: 'linear-gradient(160deg, #08233a, #0a3354 55%, #05131f)', accent: '#3b82f6', mode: 'dark' },
  { key: 'rose', label: 'Rosé', bg: 'linear-gradient(160deg, #2a0f1c, #3d1526 60%, #150810)', accent: '#f472b6', mode: 'dark' },
  { key: 'grafite', label: 'Grafite', bg: 'linear-gradient(160deg, #14151a, #1c1d24 60%, #0c0d11)', accent: '#ffd400', mode: 'dark' },
  { key: 'clean', label: 'Clean', bg: 'linear-gradient(160deg, #ffffff, #eceef3)', accent: '#7c3aed', mode: 'light' },
]

// Comportamento + textos por modelo.
const PRESETS = {
  'padrao': { layout: 'classico', fields: { phone: true, cpf: true, address: false }, methods: { pix: true, card: true, boleto: true }, bump: true, timer: true, valorLivre: false, testimonials: false, frete: false, title: 'Finalize sua compra', subtitle: 'Preencha seus dados para liberar o acesso na hora.', ctaText: 'Pagar agora' },
  'renda-extra': { layout: 'classico', fields: { phone: true, cpf: false, address: false }, methods: { pix: true, card: true, boleto: true }, bump: true, timer: true, valorLivre: false, testimonials: false, frete: false, title: 'Garanta sua vaga', subtitle: 'Oferta especial — aproveite antes que acabe.', ctaText: 'Quero agora' },
  'pix-na-hora': { layout: 'centralizado', fields: { phone: false, cpf: true, address: false }, methods: { pix: true, card: false, boleto: false }, bump: false, timer: true, valorLivre: false, testimonials: false, frete: false, title: 'Pague com Pix', subtitle: 'Aprovação na hora, acesso imediato.', ctaText: 'Gerar Pix' },
  'drop': { layout: 'classico', fields: { phone: true, cpf: true, address: true }, methods: { pix: true, card: true, boleto: true }, bump: true, timer: true, valorLivre: false, testimonials: false, frete: true, title: 'Finalize seu pedido', subtitle: 'Preencha seus dados e o endereço de entrega.', ctaText: 'Comprar agora' },
  'venda-rapida': { layout: 'centralizado', fields: { phone: false, cpf: false, address: false }, methods: { pix: true, card: true, boleto: false }, bump: false, timer: false, valorLivre: false, testimonials: false, frete: false, title: 'Compre em segundos', subtitle: 'Só o essencial para finalizar.', ctaText: 'Finalizar' },
  'venda-rapida-drop': { layout: 'centralizado', fields: { phone: false, cpf: false, address: true }, methods: { pix: true, card: true, boleto: false }, bump: false, timer: false, valorLivre: false, testimonials: false, frete: true, title: 'Compre em segundos', subtitle: 'Dados de entrega e pronto.', ctaText: 'Finalizar pedido' },
  'vision': { layout: 'classico', fields: { phone: true, cpf: true, address: false }, methods: { pix: true, card: true, boleto: true }, bump: true, timer: true, valorLivre: false, testimonials: true, frete: false, title: 'Falta pouco!', subtitle: 'Junte-se a milhares de alunos satisfeitos.', ctaText: 'Comprar agora' },
  'valor-livre': { layout: 'centralizado', fields: { phone: false, cpf: true, address: false }, methods: { pix: true, card: false, boleto: false }, bump: false, timer: false, valorLivre: true, testimonials: false, frete: false, title: 'Contribua com o valor que quiser', subtitle: 'Escolha quanto deseja pagar.', ctaText: 'Pagar' },
}

const SAMPLE_TESTIMONIALS = [
  { name: 'Ana S.', text: 'Melhor compra que fiz! Conteúdo direto ao ponto.' },
  { name: 'Rafael P.', text: 'Acesso na hora e suporte rápido. Recomendo demais.' },
]

export const DEFAULT_FIELD_ORDER = ['name', 'email', 'phone', 'cpf']
export const DEFAULT_FIELD_LABELS = { name: 'Nome completo', email: 'E-mail', phone: 'Celular / WhatsApp', cpf: 'CPF' }

export function defaultCheckout(model = 'padrao') {
  const p = PRESETS[model] || PRESETS['padrao']
  return {
    model,
    layout: p.layout,
    steps: 1, // 1 = página única, 2 = dados→pagamento, 3 = dados→endereço→pagamento
    accent: '#16a34a',
    theme: 'light',
    bg: '',
    logo: '',
    bannerTop: '',
    bannerBottom: '',
    title: p.title,
    subtitle: p.subtitle,
    ctaText: p.ctaText,
    guarantee: 'Garantia de 7 dias',
    fields: { ...p.fields },
    fieldOrder: [...DEFAULT_FIELD_ORDER],
    fieldLabels: { ...DEFAULT_FIELD_LABELS },
    methods: { ...p.methods },
    bump: { enabled: p.bump, title: 'Pack de Templates Bônus', desc: 'Leve 50+ templates prontos por um preço único.', amount: 27, oldAmount: 89 },
    timer: p.timer,
    valorLivre: p.valorLivre,
    quantity: { enabled: false, max: 10 },
    shipping: { enabled: p.frete, options: [{ label: 'Padrão', price: 0 }] },
    headline: { enabled: false, text: '🔥 Oferta por tempo limitado — aproveite!' },
    whatsapp: { enabled: false, number: '', text: 'Precisa de ajuda? Fale no WhatsApp' },
    testimonials: p.testimonials ? SAMPLE_TESTIMONIALS.map((t) => ({ ...t })) : [],
    backRedirect: '',
    upsell: { enabled: false, title: 'Leve também: Mentoria Express', desc: 'Acelere seus resultados com 4 aulas extras.', price: 97 },
    downsell: { enabled: false, title: 'Última chance: E-book bônus', desc: 'Por um valor simbólico, leve o material complementar.', price: 19 },
  }
}

// Troca o modelo preservando cores/marca/textos personalizados.
export function applyModel(cfg, model) {
  const p = PRESETS[model] || PRESETS['padrao']
  return {
    ...cfg,
    model,
    layout: p.layout,
    title: p.title,
    subtitle: p.subtitle,
    ctaText: p.ctaText,
    fields: { ...p.fields },
    methods: { ...p.methods },
    timer: p.timer,
    valorLivre: p.valorLivre,
    bump: { ...cfg.bump, enabled: p.bump },
    shipping: { ...(cfg.shipping || { options: [{ label: 'Padrão', price: 0 }] }), enabled: p.frete },
    testimonials: p.testimonials && (!cfg.testimonials || cfg.testimonials.length === 0) ? SAMPLE_TESTIMONIALS.map((t) => ({ ...t })) : (cfg.testimonials || []),
  }
}

// Garante que um produto antigo tenha um checkout completo e válido.
export function ensureCheckout(product) {
  const base = defaultCheckout('padrao')
  const c = product?.checkout
  if (!c) return base
  return {
    ...base,
    ...c,
    fields: { ...base.fields, ...c.fields },
    fieldOrder: c.fieldOrder && c.fieldOrder.length ? c.fieldOrder : base.fieldOrder,
    fieldLabels: { ...base.fieldLabels, ...c.fieldLabels },
    methods: { ...base.methods, ...c.methods },
    bump: { ...base.bump, ...c.bump },
    quantity: { ...base.quantity, ...c.quantity },
    shipping: { ...base.shipping, ...c.shipping, options: (c.shipping?.options?.length ? c.shipping.options : base.shipping.options) },
    headline: { ...base.headline, ...(c.headline || c.banner) },
    whatsapp: { ...base.whatsapp, ...c.whatsapp },
    upsell: { ...base.upsell, ...c.upsell },
    downsell: { ...base.downsell, ...c.downsell },
    testimonials: c.testimonials || [],
  }
}
