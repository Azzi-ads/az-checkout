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
  analises: ['Análises', 'Métricas e jornada do checkout'],
  custos: ['Custos', 'Lucro real da sua operação'],
  livex: ['Livex', 'Pessoas ao vivo no checkout'],
  produtos: ['Produtos', 'Gerencie seu catálogo'],
  vendas: ['Vendas', 'Histórico de pedidos'],
  config: ['Configurações', 'Ajustes da sua conta e checkout'],
  planos: ['Planos', 'Escolha o melhor para o seu momento'],
}

export const storeSwitcher = { name: 'AZ Store', plan: 'Plano Prime' }

export const dashboardKpis = [
  { icon: 'revenue', label: 'Faturamento hoje', value: 'R$ 18.430', delta: '+12,4%', trend: 'up' },
  { icon: 'bag', label: 'Pedidos pagos', value: '312', delta: '+8,1%', trend: 'up' },
  { icon: 'lines', label: 'Ticket médio', value: 'R$ 59,07', delta: '+3,9%', trend: 'up' },
  { icon: 'chart', label: 'Taxa de conversão', value: '4,7%', delta: '-0,6%', trend: 'down' },
]

export const recentSales = [
  { initials: 'JM', who: 'João M.', what: 'Curso de Tráfego Pago · há 2 min', amount: 'R$ 297' },
  { initials: 'AS', who: 'Ana S.', what: 'E-book Finanças · há 9 min', amount: 'R$ 47' },
  { initials: 'RP', who: 'Rafael P.', what: 'Mentoria Premium · há 21 min', amount: 'R$ 1.997' },
  { initials: 'CL', who: 'Carla L.', what: 'Pack Templates · há 38 min', amount: 'R$ 89' },
  { initials: 'DF', who: 'Diego F.', what: 'Curso de Tráfego Pago · há 51 min', amount: 'R$ 297' },
]

// Gráfico de faturamento (7 dias). points em coords do viewBox 640x220.
export const revenueChart = {
  total: 'R$ 112.940 no período',
  area: 'M0,150 L106,120 L213,135 L320,80 L426,95 L533,50 L640,65 L640,200 L0,200 Z',
  line: 'M0,150 L106,120 L213,135 L320,80 L426,95 L533,50 L640,65',
  dot: { cx: 533, cy: 50 },
  labels: [
    { x: 0, t: 'Seg' }, { x: 100, t: 'Ter' }, { x: 207, t: 'Qua' },
    { x: 314, t: 'Qui' }, { x: 420, t: 'Sex' }, { x: 527, t: 'Sáb' }, { x: 612, t: 'Dom' },
  ],
}

export const livexKpis = [
  { label: 'No checkout', value: '12', id: 'noCheckout' },
  { label: 'Em pagamento', value: '4', id: 'emPagamento' },
  { label: 'Abandonos (1h)', value: '37' },
  { label: 'Conversão ao vivo', value: '31%' },
]

export const livexSessions = {
  columns: [
    { key: 'visitor', label: 'Visitante' },
    { key: 'product', label: 'Produto' },
    { key: 'step', label: 'Etapa' },
    { key: 'time', label: 'Tempo', num: true },
    { key: 'value', label: 'Valor', num: true },
  ],
  rows: [
    { visitor: 'Visitante #4821', product: 'Mentoria Premium', step: { label: 'Pagamento', tone: 'pend' }, time: '1m 12s', value: 'R$ 1.997' },
    { visitor: 'Visitante #4822', product: 'Curso de Tráfego', step: { label: 'Dados', tone: 'pago' }, time: '42s', value: 'R$ 297' },
    { visitor: 'Visitante #4823', product: 'E-book Finanças', step: { label: 'Pagamento', tone: 'pend' }, time: '2m 03s', value: 'R$ 47' },
    { visitor: 'Visitante #4824', product: 'Pack Templates', step: { label: 'Carrinho', tone: 'pago' }, time: '18s', value: 'R$ 89' },
    { visitor: 'Visitante #4825', product: 'Curso de Tráfego', step: { label: 'Dados', tone: 'pago' }, time: '1m 30s', value: 'R$ 297' },
  ],
}

export const livexFunnel = [
  { name: 'Entrou no checkout', width: 100, value: 48 },
  { name: 'Preencheu dados', width: 64, value: 31 },
  { name: 'Foi p/ pagamento', width: 33, value: 16 },
  { name: 'Compra aprovada', width: 23, value: 11 },
]

export const products = [
  { icon: 'p-video', slug: 'curso-de-trafego-pago', name: 'Curso de Tráfego Pago', price: 'R$ 297,00', amount: 297, oldAmount: 497, tone: 'pago', status: 'Ativo', meta: '1.204 vendas' },
  { icon: 'p-doc', slug: 'e-book-financas', name: 'E-book Finanças', price: 'R$ 47,00', amount: 47, oldAmount: 97, tone: 'pago', status: 'Ativo', meta: '3.890 vendas' },
  { icon: 'p-user', slug: 'mentoria-premium', name: 'Mentoria Premium', price: 'R$ 1.997,00', amount: 1997, oldAmount: 2997, tone: 'pago', status: 'Ativo', meta: '86 vendas' },
  { icon: 'p-grid', slug: 'pack-de-templates', name: 'Pack de Templates', price: 'R$ 89,00', amount: 89, oldAmount: 149, tone: 'pend', status: 'Rascunho', meta: '540 vendas' },
  { icon: 'p-layers', slug: 'comunidade-vip', name: 'Comunidade VIP', price: 'R$ 39,90', amount: 39.9, priceSuffix: '/mês', tone: 'pago', status: 'Ativo', meta: '412 assinantes' },
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
  rows: [
    { id: '#AZ-10428', client: 'João Martins', product: 'Curso de Tráfego Pago', value: 'R$ 297,00', status: { label: 'Pago', tone: 'pago', key: 'pagas' }, date: '01/06 · 14:32' },
    { id: '#AZ-10427', client: 'Ana Souza', product: 'E-book Finanças', value: 'R$ 47,00', status: { label: 'Pago', tone: 'pago', key: 'pagas' }, date: '01/06 · 14:25' },
    { id: '#AZ-10426', client: 'Rafael Pires', product: 'Mentoria Premium', value: 'R$ 1.997,00', status: { label: 'Pendente', tone: 'pend', key: 'pendentes' }, date: '01/06 · 14:13' },
    { id: '#AZ-10425', client: 'Carla Lima', product: 'Pack de Templates', value: 'R$ 89,00', status: { label: 'Pago', tone: 'pago', key: 'pagas' }, date: '01/06 · 13:56' },
    { id: '#AZ-10424', client: 'Diego Ferreira', product: 'Curso de Tráfego Pago', value: 'R$ 297,00', status: { label: 'Reembolsado', tone: 'reemb', key: 'reembolsadas' }, date: '01/06 · 13:40' },
    { id: '#AZ-10423', client: 'Bruna Alves', product: 'Comunidade VIP', value: 'R$ 39,90', status: { label: 'Pago', tone: 'pago', key: 'pagas' }, date: '01/06 · 13:21' },
    { id: '#AZ-10422', client: 'Marcos Reis', product: 'E-book Finanças', value: 'R$ 47,00', status: { label: 'Pago', tone: 'pago', key: 'pagas' }, date: '01/06 · 12:58' },
  ],
}

export const orderFilters = [
  { key: 'todas', label: 'Todas' },
  { key: 'pagas', label: 'Pagas' },
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'reembolsadas', label: 'Reembolsadas' },
]

export const storeFields = [
  { label: 'Nome da loja', value: 'AZ Checkout' },
  { label: 'E-mail de suporte', value: 'suporte@azcheckout.com' },
]

export const currencyOptions = ['Real (BRL) — R$', 'Dólar (USD) — $']

export const appearanceFields = [
  { label: 'Cor principal', value: '#0a0a0b — Preto' },
  { label: 'Cor de destaque', value: '#ffd400 — Amarelo' },
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
    desc: 'Base essencial para iniciar a operação com a AZ Checkout sem mensalidade fixa.',
    price: 'Gratuito',
    fee: { rate: '2.5%', note: 'Sem mensalidade fixa.' },
    benefits: ['Checkout AZ pronto para uso', 'Personalização completa dos temas', 'Integrações com gateways externos', 'Suporte via chat'],
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

export const currentUser = { initials: 'L', name: 'Lucas', plan: 'Plano Prime' }

// ===== Painel: Análises =====
export const analyticsPeriods = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'ontem', label: 'Ontem' },
  { key: '7d', label: 'Últimos 7 dias' },
  { key: 'mes', label: 'Mês atual' },
  { key: 'ano', label: 'Ano atual' },
]

export const analyticsKpis = [
  { key: 'vendas', label: 'Vendas Geradas', value: 'R$ 48.920', sub: '312 pedidos', highlight: true },
  { key: 'receita', label: 'Receita Confirmada', value: 'R$ 41.730', sub: '276 pagos' },
  { key: 'ticket', label: 'Ticket Médio', value: 'R$ 156,80' },
  { key: 'convcheckout', label: 'Conversão Checkout', value: '31,4%', sub: '994 criados' },
  { key: 'abandono', label: 'Carrinhos Abandonados', value: '682', sub: '68,6% abandono' },
]

// Série carrinhos abandonados vs finalizados (7 dias). O componente desenha o SVG.
export const abandonedSeries = {
  labels: ['26/05', '27/05', '28/05', '29/05', '30/05', '31/05', '01/06'],
  finalizados: [28, 35, 22, 41, 33, 49, 52],
  abandonados: [61, 74, 48, 88, 70, 96, 84],
}

export const checkoutJourney = [
  { step: 'Dados pessoais', value: 994, pct: 100 },
  { step: 'Entrega', value: 712, pct: 72 },
  { step: 'Pagamento', value: 463, pct: 47 },
  { step: 'Compra aprovada', value: 312, pct: 31 },
]

export const operationHealth = [
  { label: 'Conversão Checkout', value: '31,4%', trend: 'up', delta: '+2,1%' },
  { label: 'Conversão Pagamento', value: '66,9%', trend: 'up', delta: '+4,8%' },
  { label: 'Reembolso', value: '1,8%', trend: 'down', delta: '-0,3%' },
  { label: 'Cancelamento', value: '0,9%', trend: 'down', delta: '-0,1%' },
]

// ===== Painel: Custos / Lucro real =====
// Base "automática" (viria do gateway). O componente soma os custos manuais.
export const costsBase = {
  pedidos: 276,
  faturamento: 41730, // receita confirmada no período
  checkoutRate: 0.025, // taxa do checkout (2,5% — plano Prime)
}
export const costsDefaults = { ads: 8200, gateway: 1460, outros: 600 }

// ===== Início: Mural de novidades + Alcance geográfico =====
export const newsWall = [
  { tag: 'Novidade', title: 'Popup de prova social', desc: 'Exiba quem acabou de comprar direto no checkout, configurável no personalizador.', time: 'há 2h' },
  { title: 'Painel de Custos renovado', time: 'há 2h' },
  { title: 'Automação AZ 2.0 disponível', time: 'há 1d' },
  { title: 'Relatório de jornada do checkout', time: 'há 3d' },
]

export const geoReach = [
  { region: 'São Paulo', pct: 42, visitors: '1.204' },
  { region: 'Rio de Janeiro', pct: 23, visitors: '659' },
  { region: 'Minas Gerais', pct: 14, visitors: '401' },
  { region: 'Paraná', pct: 9, visitors: '258' },
  { region: 'Outros estados', pct: 12, visitors: '344' },
]
