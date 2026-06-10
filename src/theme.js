// Temas do SITE (painel admin) — só do painel, não do checkout.
// O tema é aplicado como variáveis CSS inline no contêiner .app, então não
// vaza para o checkout/login (que usam o tema padrão do :root).

export const ACCENTS = [
  { key: 'amarelo', label: 'Amarelo', color: '#ffd400' },
  { key: 'roxo', label: 'Roxo', color: '#8b5cf6' },
  { key: 'verde', label: 'Verde', color: '#3ddc91' },
  { key: 'azul', label: 'Azul', color: '#3b82f6' },
  { key: 'rosa', label: 'Rosa', color: '#f472b6' },
  { key: 'laranja', label: 'Laranja', color: '#fb923c' },
  { key: 'ciano', label: 'Ciano', color: '#22d3ee' },
  { key: 'vermelho', label: 'Vermelho', color: '#ff5d5d' },
  { key: 'lima', label: 'Lima', color: '#a3e635' },
  { key: 'teal', label: 'Teal', color: '#14b8a6' },
  { key: 'indigo', label: 'Índigo', color: '#6366f1' },
  { key: 'ambar', label: 'Âmbar', color: '#f59e0b' },
]

// padrões de fundo (raio / cifrão) como SVG inline
const pat = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
const BOLT = pat("<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><path d='M44 8 26 44h14l-4 28 22-40H44l4-24z' fill='rgba(168,85,247,0.07)'/></svg>")
const DOLLAR = pat("<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><text x='40' y='54' font-size='40' text-anchor='middle' fill='rgba(61,220,145,0.07)' font-family='Arial'>$</text></svg>")

export const MODES = [
  { key: 'dark', label: 'Escuro' },
  { key: 'light', label: 'Claro' },
]

export const DEFAULT_THEME = { accent: '#a855f7', mode: 'dark', preset: 'pingufy', bg: '' }

// Temas prontos do SITE (painel): fundo + cor + modo.
export const SITE_THEMES = [
  { key: 'pingufy', label: 'PinguFy', bg: '', accent: '#a855f7', mode: 'dark' },
  { key: 'grafite', label: 'Grafite', bg: 'linear-gradient(160deg,#101116,#0a0a0d)', accent: '#a855f7', mode: 'dark' },
  { key: 'aurora', label: 'Aurora', bg: 'radial-gradient(1000px 600px at 15% -10%, rgba(91,42,134,.5), transparent 60%), radial-gradient(900px 600px at 120% 10%, rgba(31,111,139,.4), transparent 55%), #0a0a12', accent: '#22d3ee', mode: 'dark' },
  { key: 'neon', label: 'Neon', bg: 'radial-gradient(820px 600px at 85% -5%, rgba(139,92,246,.4), transparent 60%), #07070d', accent: '#a78bfa', mode: 'dark' },
  { key: 'oceano', label: 'Oceano', bg: 'linear-gradient(160deg,#08233a,#06121d)', accent: '#3b82f6', mode: 'dark' },
  { key: 'floresta', label: 'Floresta', bg: 'linear-gradient(160deg,#07251c,#05130e)', accent: '#3ddc91', mode: 'dark' },
  { key: 'rose', label: 'Rosé', bg: 'linear-gradient(160deg,#2a0f1c,#150810)', accent: '#f472b6', mode: 'dark' },
  { key: 'raio', label: 'Raio ⚡', bg: `${BOLT}, #060608`, accent: '#a855f7', mode: 'dark' },
  { key: 'cifrao', label: 'Cifrão $', bg: `${DOLLAR}, #05080a`, accent: '#3ddc91', mode: 'dark' },
  { key: 'clean', label: 'Clean', bg: 'linear-gradient(160deg,#f6f7fa,#eceef3)', accent: '#7c3aed', mode: 'light' },
]

const LIGHT = {
  '--bg': '#f4f4f6',
  '--surface': '#ffffff',
  '--surface-2': '#f1f1f4',
  '--surface-3': '#e8e8ee',
  '--line': '#e4e4ea',
  '--line-2': '#d5d5dd',
  '--text': '#15151b',
  '--muted': '#5b5b66',
  '--muted-2': '#8a8a95',
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
function darken(hex, amt = 14) {
  const { r, g, b } = hexToRgb(hex)
  const d = (v) => Math.max(0, Math.round(v * (1 - amt / 100)))
  return `#${[d(r), d(g), d(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
// preto ou branco — o que tiver melhor contraste sobre a cor de destaque
function onAccent(hex) {
  const { r, g, b } = hexToRgb(hex)
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return L > 0.6 ? '#000' : '#fff'
}

// Retorna um objeto de variáveis CSS para aplicar como `style` no .app.
export function themeVars(theme = DEFAULT_THEME) {
  const accent = theme.accent || '#a855f7'
  const { r, g, b } = hexToRgb(accent)
  const vars = {
    '--yellow': accent,
    '--yellow-dim': darken(accent, 12),
    '--yellow-soft': `rgba(${r},${g},${b},.12)`,
    '--on-accent': onAccent(accent),
  }
  if (theme.mode === 'light') Object.assign(vars, LIGHT)
  return vars
}
