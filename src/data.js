// Todos os dados são mockados (sem backend). Centralizados aqui para que os
// componentes fiquem puramente de apresentação.

export const navMenu = [
  { id: 'dashboard', label: 'Início', icon: 'dashboard' },
  { id: 'livex', label: 'Livex', icon: 'livex', live: true },
  { id: 'produtos', label: 'Produtos', icon: 'produtos' },
  { id: 'vendas', label: 'Vendas', icon: 'vendas' },
  { id: 'config', label: 'Configurações', icon: 'config' },
]

export const navAccount = [
  { id: 'planos', label: 'Planos', icon: 'planos' },
]

export const pageTitles = {
  dashboard: ['Dashboard', 'Visão geral da sua operação'],
  ia: ['PinguFy IA', 'Crie funis e analise sua operação com inteligência artificial'],
  analises: ['Análises', 'Métricas e jornada do checkout'],
  custos: ['Custos', 'Lucro real da sua operação'],
  livex: ['Livex', 'Pessoas ao vivo no checkout'],
  produtos: ['Produtos', 'Gerencie seu catálogo'],
  vendas: ['Vendas', 'Histórico de pedidos'],
  config: ['Configurações', 'Ajustes da sua conta e checkout'],
  planos: ['Planos', 'Escolha o melhor para o seu momento'],
  cobrancas: ['Cobranças', 'Taxa do plano e cobrança no cartão'],
  perfil: ['Perfil', 'Sua identidade na plataforma'],
  aparencia: ['Aparência', 'Personalize as cores e o tema do painel'],
  integracoes: ['Integrações', 'Conecte seu gateway de pagamento'],
  checkout: ['Checkout', 'Personalize o checkout dos seus produtos'],
  security: ['PinguFy Security', 'Proteção do checkout e dos dados'],
  admin: ['Admin', 'Painel do dono — contas e faturamento'],
}

export const dashboardKpis = [
  { icon: 'revenue', label: 'Faturamento hoje', value: 'R$ 0,00' },
  { icon: 'bag', label: 'Pedidos pagos', value: '0' },
  { icon: 'lines', label: 'Ticket médio', value: 'R$ 0,00' },
  { icon: 'chart', label: 'Taxa de conversão', value: '0%' },
]

// Conta nova: ainda sem vendas.
export const recentSales = []

// Gráfico de faturamento (7 dias). Conta nova = linha zerada na base.
export const revenueChart = {
  total: 'R$ 0,00 no período',
  area: 'M0,200 L640,200 L640,200 L0,200 Z',
  line: 'M0,200 L640,200',
  dot: { cx: 640, cy: 200 },
  labels: [
    { x: 0, t: 'Seg' }, { x: 100, t: 'Ter' }, { x: 207, t: 'Qua' },
    { x: 314, t: 'Qui' }, { x: 420, t: 'Sex' }, { x: 527, t: 'Sáb' }, { x: 612, t: 'Dom' },
  ],
}

export const livexKpis = [
  { label: 'No checkout', value: '0', id: 'noCheckout' },
  { label: 'Em pagamento', value: '0', id: 'emPagamento' },
  { label: 'Abandonos (1h)', value: '0' },
  { label: 'Conversão ao vivo', value: '0%' },
]

export const livexSessions = {
  columns: [
    { key: 'visitor', label: 'Visitante' },
    { key: 'product', label: 'Produto' },
    { key: 'step', label: 'Etapa' },
    { key: 'time', label: 'Tempo', num: true },
    { key: 'value', label: 'Valor', num: true },
  ],
  rows: [],
}

export const livexFunnel = [
  { name: 'Entrou no checkout', width: 0, value: 0 },
  { name: 'Preencheu dados', width: 0, value: 0 },
  { name: 'Foi p/ pagamento', width: 0, value: 0 },
  { name: 'Compra aprovada', width: 0, value: 0 },
]

export const products = [
  { icon: 'p-video', slug: 'curso-de-trafego-pago', name: 'Curso de Tráfego Pago', price: 'R$ 297,00', amount: 297, oldAmount: 497, tone: 'pago', status: 'Ativo', meta: '0 vendas' },
  { icon: 'p-doc', slug: 'e-book-financas', name: 'E-book Finanças', price: 'R$ 47,00', amount: 47, oldAmount: 97, tone: 'pago', status: 'Ativo', meta: '0 vendas' },
  { icon: 'p-user', slug: 'mentoria-premium', name: 'Mentoria Premium', price: 'R$ 1.997,00', amount: 1997, oldAmount: 2997, tone: 'pago', status: 'Ativo', meta: '0 vendas' },
  { icon: 'p-grid', slug: 'pack-de-templates', name: 'Pack de Templates', price: 'R$ 89,00', amount: 89, oldAmount: 149, tone: 'pend', status: 'Rascunho', meta: '0 vendas' },
  { icon: 'p-layers', slug: 'comunidade-vip', name: 'Comunidade VIP', price: 'R$ 39,90', amount: 39.9, priceSuffix: '/mês', tone: 'pago', status: 'Ativo', meta: '0 assinantes' },
  { icon: 'p-plus', name: 'Novo produto', priceText: 'Criar agora', meta: 'Configure em minutos', isNew: true },
]

// ===== Checkout do cliente =====

// Subtítulo/descrição por produto exibido no resumo do pedido.
export const checkoutDescriptions = {
  'curso-de-trafego-pago': 'Curso completo • acesso vitalício + atualizações',
  'e-book-financas': 'E-book em PDF • download imediato',
  'mentoria-premium': 'Mentoria em grupo • 12 encontros ao vivo',
  'pack-de-templates': 'Pacote de templates editáveis • acesso imediato',
  'comunidade-vip': 'Assinatura mensal • cancele quando quiser',
}

// Order bump: oferta extra com 1 clique (clássico de checkout de infoproduto).
export const orderBump = {
  title: 'Pack de Templates Bônus',
  desc: 'Leve agora 50+ templates prontos de criativos e páginas por um preço único.',
  amount: 27,
  oldAmount: 89,
  badge: 'OFERTA ÚNICA',
}

// Parcelas no cartão (até 12x, sem juros no exemplo).
export function installments(amount, max = 12) {
  return Array.from({ length: max }, (_, i) => {
    const n = i + 1
    const value = amount / n
    return { n, value, label: `${n}x de ${formatBRL(value)}${n === 1 ? ' à vista' : ' sem juros'}` }
  })
}

export function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const checkoutTrust = [
  { icon: 'shield', title: 'Compra 100% segura', desc: 'Seus dados são criptografados.' },
  { icon: 'refresh', title: 'Garantia de 7 dias', desc: 'Não gostou? Devolvemos seu dinheiro.' },
  { icon: 'bolt', title: 'Acesso imediato', desc: 'Liberação automática após o pagamento.' },
]

export const paymentMethods = [
  { key: 'pix', label: 'Pix', icon: 'pix', note: 'Aprovação na hora' },
  { key: 'card', label: 'Cartão', icon: 'card', note: 'Em até 12x' },
  { key: 'boleto', label: 'Boleto', icon: 'barcode', note: '1-2 dias úteis' },
]

export const orders = {
  columns: [
    { key: 'id', label: 'Pedido' },
    { key: 'client', label: 'Cliente' },
    { key: 'product', label: 'Produto' },
    { key: 'value', label: 'Valor', num: true },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Data' },
  ],
  rows: [],
}

export const orderFilters = [
  { key: 'todas', label: 'Todas' },
  { key: 'pagas', label: 'Pagas' },
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'reembolsadas', label: 'Reembolsadas' },
]

export const storeFields = [
  { label: 'Nome da loja', value: 'PinguFy' },
  { label: 'E-mail de suporte', value: 'suporte@azcheckout.com' },
]

export const currencyOptions = ['Real (BRL) — R$', 'Dólar (USD) — $']

export const appearanceFields = [
  { label: 'Cor principal', value: '#0a0a0e — Preto' },
  { label: 'Cor de destaque', value: '#a855f7 — Roxo PinguFy' },
]

export const gatewayToggles = [
  { id: 'pix', title: 'Pix', desc: 'Aprovação instantânea', on: true },
  { id: 'card', title: 'Cartão de crédito', desc: 'Em até 12x', on: true },
  { id: 'boleto', title: 'Boleto', desc: 'Compensa em 1-2 dias úteis', on: false },
]

export const appearanceToggle = { id: 'seal', title: 'Mostrar selo de segurança', desc: 'Aumenta a confiança no pagamento', on: true }

export const notificationToggles = [
  { id: 'approved', title: 'Venda aprovada', desc: 'Receba no e-mail e no app', on: true },
  { id: 'abandoned', title: 'Carrinho abandonado', desc: 'Alerta após 30 min', on: true },
  { id: 'summary', title: 'Resumo diário', desc: 'Todo dia às 9h', on: false },
]

export const plans = [
  {
    variant: 'normal', tagtop: 'Entrada essencial', name: 'Plano Start',
    desc: 'Base essencial para iniciar a operação com a PinguFy sem mensalidade fixa.',
    price: 'Gratuito',
    fee: { rate: '2.5%', note: 'Sem mensalidade fixa.' },
    benefits: ['Checkout PinguFy pronto para uso', 'Personalização completa dos temas', 'Integrações com gateways externos', 'Suporte via chat'],
    cta: { label: 'Começar grátis', variant: 'ghost' },
  },
  {
    variant: 'feat', recommend: 'Recomendado', tagtop: 'Escolha inteligente', name: 'Plano Prime',
    desc: 'Melhor equilíbrio entre mensalidade, taxa e recursos para crescer com previsibilidade.',
    price: 'R$ 127,00', priceSuffix: '/mês',
    fee: { rate: '2%', note: 'Mais eficiência operacional.' },
    benefits: ['Tudo do plano Start', '60 dias de histórico de carrinhos', 'Mais opções de integrações', 'Suporte prioritário via chat'],
    cta: { label: 'Assinar o Prime', variant: 'primary' },
  },
  {
    variant: 'normal', tagtop: 'Performance máxima', name: 'Plano Elite',
    desc: 'Estrutura premium para operações que exigem mais suporte, flexibilidade e performance.',
    price: 'R$ 387,00', priceSuffix: '/mês',
    fee: { rate: '1.5%', note: 'Mais estrutura e performance.' },
    benefits: ['Tudo do plano Prime', '90 dias de histórico de carrinhos', 'Integrações ilimitadas', 'Acesso antecipado a novos recursos'],
    cta: { label: 'Assinar o Elite', variant: 'ghost' },
  },
]

// ===== Painel: Análises =====
export const analyticsPeriods = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'ontem', label: 'Ontem' },
  { key: '7d', label: 'Últimos 7 dias' },
  { key: 'mes', label: 'Mês atual' },
  { key: 'ano', label: 'Ano atual' },
]

export const analyticsKpis = [
  { key: 'vendas', label: 'Vendas Geradas', value: 'R$ 0,00', sub: '0 pedidos', highlight: true },
  { key: 'receita', label: 'Receita Confirmada', value: 'R$ 0,00', sub: '0 pagos' },
  { key: 'ticket', label: 'Ticket Médio', value: 'R$ 0,00' },
  { key: 'convcheckout', label: 'Conversão Checkout', value: '0%', sub: '0 criados' },
  { key: 'abandono', label: 'Carrinhos Abandonados', value: '0', sub: '0% abandono' },
]

// Série carrinhos abandonados vs finalizados (7 dias). Conta nova = tudo zero.
export const abandonedSeries = {
  labels: ['26/05', '27/05', '28/05', '29/05', '30/05', '31/05', '01/06'],
  finalizados: [0, 0, 0, 0, 0, 0, 0],
  abandonados: [0, 0, 0, 0, 0, 0, 0],
}

export const checkoutJourney = [
  { step: 'Dados pessoais', value: 0, pct: 0 },
  { step: 'Entrega', value: 0, pct: 0 },
  { step: 'Pagamento', value: 0, pct: 0 },
  { step: 'Compra aprovada', value: 0, pct: 0 },
]

export const operationHealth = [
  { label: 'Conversão Checkout', value: '0%', trend: 'up', delta: '0%' },
  { label: 'Conversão Pagamento', value: '0%', trend: 'up', delta: '0%' },
  { label: 'Reembolso', value: '0%', trend: 'down', delta: '0%' },
  { label: 'Cancelamento', value: '0%', trend: 'down', delta: '0%' },
]

// ===== Painel: Custos / Lucro real =====
// Base "automática" (viria do gateway). O componente soma os custos manuais.
// Conta nova: tudo zerado.
export const costsBase = {
  pedidos: 0,
  faturamento: 0, // receita confirmada no período
  checkoutRate: 0.025, // taxa do checkout (2,5% — plano Start)
}
export const costsDefaults = { ads: 0, gateway: 0, outros: 0 }

// ===== Início: Mural de novidades + Alcance geográfico =====
// Mural vazio por padrão — só mostra anúncios reais (tabela announcements).
export const newsWall = []

// Conta nova: ainda sem visitantes.
export const geoReach = []

// Jornada de premiação (0 → 100k). current vem zerado (conta nova).
export const rewardJourney = {
  goal: 100000,
  current: 0,
  milestones: [
    { value: 10000, label: 'R$ 10k', prize: 'Selo Bronze' },
    { value: 25000, label: 'R$ 25k', prize: 'Selo Prata' },
    { value: 50000, label: 'R$ 50k', prize: 'Selo Ouro' },
    { value: 100000, label: 'R$ 100k', prize: 'Placa 100K' },
  ],
}
