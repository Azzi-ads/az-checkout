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
  dashboard: ['Início', 'Visão geral da sua operação'],
  livex: ['Livex', 'Pessoas ao vivo no checkout'],
  produtos: ['Produtos', 'Gerencie seu catálogo'],
  vendas: ['Vendas', 'Histórico de pedidos'],
  config: ['Configurações', 'Ajustes da sua conta e checkout'],
  planos: ['Planos', 'Escolha o melhor para o seu momento'],
}

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
  { icon: 'p-video', name: 'Curso de Tráfego Pago', price: 'R$ 297,00', tone: 'pago', status: 'Ativo', meta: '1.204 vendas' },
  { icon: 'p-doc', name: 'E-book Finanças', price: 'R$ 47,00', tone: 'pago', status: 'Ativo', meta: '3.890 vendas' },
  { icon: 'p-user', name: 'Mentoria Premium', price: 'R$ 1.997,00', tone: 'pago', status: 'Ativo', meta: '86 vendas' },
  { icon: 'p-grid', name: 'Pack de Templates', price: 'R$ 89,00', tone: 'pend', status: 'Rascunho', meta: '540 vendas' },
  { icon: 'p-layers', name: 'Comunidade VIP', price: 'R$ 39,90', priceSuffix: '/mês', tone: 'pago', status: 'Ativo', meta: '412 assinantes' },
  { icon: 'p-plus', name: 'Novo produto', priceText: 'Criar agora', meta: 'Configure em minutos', isNew: true },
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
