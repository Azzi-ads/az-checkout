// SVGs inline com stroke="currentColor". Decorativos por padrão (aria-hidden):
// o significado vem sempre do texto ao lado, conforme o protótipo original.

const PATHS = {
  // navegação
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  livex: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" /></>,
  produtos: <><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" /></>,
  vendas: <><path d="M4 19V5M20 19V11M12 19V8" /><path d="M3 21h18" /></>,
  config: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15H4.5a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 6 8.3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4.6V4.5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.1a2 2 0 1 1 0 4h-.1" /></>,
  planos: <path d="M12 2l2.6 6.3L21 9l-5 4.3L17.5 21 12 17l-5.5 4L8 13.3 3 9l6.4-.7L12 2z" />,

  // topbar
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,

  // kpis
  revenue: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  bag: <><path d="M5 7h14l-1.5 11a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8L5 7z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></>,
  lines: <path d="M3 12h18M3 6h18M3 18h18" />,
  chart: <><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></>,

  // deltas
  up: <path d="M5 15l7-7 7 7" />,
  down: <path d="M19 9l-7 7-7-7" />,

  // benefícios
  check: <path d="M5 13l4 4L19 7" />,

  // checkout
  shield: <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />,
  refresh: <><path d="M21 12a9 9 0 1 1-2.6-6.3" /><path d="M21 4v5h-5" /></>,
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
  lock: <><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  pix: <path d="M12 3.5l3.4 3.4a2 2 0 0 0 2.8 0M12 3.5L8.6 6.9a2 2 0 0 1-2.8 0M3.5 12l3.4-3.4a2 2 0 0 1 0 2.8M3.5 12l3.4 3.4M20.5 12l-3.4-3.4M20.5 12l-3.4 3.4M12 20.5l3.4-3.4a2 2 0 0 0-2.8 0M12 20.5l-3.4-3.4" />,
  card: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 10h18M7 15h4" /></>,
  barcode: <path d="M4 5v14M7 5v14M9.5 5v14M13 5v14M15 5v14M17.5 5v14M20 5v14" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
  phone: <path d="M5 4h4l1.5 4-2 1.5a12 12 0 0 0 6 6L16 13l4 1.5V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>,
  arrowLeft: <path d="M19 12H5M11 18l-6-6 6-6" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  megaphone: <><path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1z" /><path d="M18 9a3 3 0 0 1 0 6" /></>,
  store: <><path d="M4 9l1-5h14l1 5M4 9h16M4 9v10h16V9M9 19v-5h6v5" /></>,
  diagnostic: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3M11 8v6M8 11h6" /></>,
  trash: <><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6" /></>,
  camera: <><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" /><circle cx="12" cy="13" r="3.5" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" /><circle cx="7.5" cy="11.5" r="1.2" /><circle cx="12" cy="8" r="1.2" /><circle cx="16.5" cy="11.5" r="1.2" /></>,
  user: <><circle cx="12" cy="9" r="3.4" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
  close: <path d="M6 6l12 12M18 6L6 18" />,

  // thumbnails de produtos
  'p-video': <><path d="M4 6h16v12H4z" /><path d="M4 10h16" /></>,
  'p-doc': <><path d="M5 4h11l3 3v13H5z" /><path d="M9 9h6M9 13h6" /></>,
  'p-user': <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></>,
  'p-grid': <><path d="M4 4h16v16H4z" /><path d="M4 9h16M9 9v11" /></>,
  'p-layers': <><path d="M3 10l9-6 9 6-9 6-9-6z" /><path d="M3 14l9 6 9-6" /></>,
  'p-plus': <path d="M12 3v18M3 12h18" />,
}

export default function Icon({ name, strokeWidth = 2, ...rest }) {
  const content = PATHS[name]
  if (!content) return null
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...rest}>
      {content}
    </svg>
  )
}
