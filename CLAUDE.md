# AZ Checkout

Plataforma de checkout para infoprodutos / produtos digitais. Front-end em
**Vite + React** (componentizado e acessível), mantendo o design system original.
O protótipo inicial em HTML/CSS/JS puro foi preservado em `legacy/` como referência.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
```

Build: `npm run build` (saída em `dist/`). Preview do build: `npm run preview`.

> Sem Node na máquina? Suba para o GitHub e abra
> `https://stackblitz.com/github/SEU_USUARIO/az-checkout` — roda o Vite no navegador.

## Estrutura

```
az-checkout/
├── index.html            # entrada do Vite (monta <div id="root">)
├── vite.config.js        # Vite + @vitejs/plugin-react
├── src/
│   ├── main.jsx          # bootstrap do React
│   ├── App.jsx           # navegação entre telas + contador ao vivo (estado em React)
│   ├── styles.css        # design system (:root) + seção de acessibilidade
│   ├── data.js           # todos os dados mockados (sem backend)
│   ├── useLiveCount.js   # hook que simula o contador "ao vivo" do Livex
│   ├── components/       # Sidebar, Topbar, KPICard, DataTable, PlanCard, Toggle, Tabs, Icon
│   └── pages/            # Dashboard, Livex, Produtos, Vendas, Config, Planos
├── legacy/               # protótipo original (HTML/CSS/JS puro) — referência
└── CLAUDE.md
```

> Componentes são puramente de apresentação; os dados vivem em `src/data.js`.
> `Icon.jsx` centraliza todos os SVGs inline (decorativos, com `aria-hidden`).

## Design system

Tema **escuro**: preto como cor principal, amarelo como cor de destaque.
Todas as cores vivem em variáveis CSS no topo de `styles.css` (`:root`). **Sempre
use as variáveis, nunca hardcode cor nova** — se precisar de uma cor, adicione à `:root`.

| Variável        | Uso                                  |
|-----------------|--------------------------------------|
| `--bg`          | fundo geral (quase preto)            |
| `--surface`     | cartões / sidebar                    |
| `--surface-2/3` | superfícies elevadas                 |
| `--line`        | bordas                               |
| `--text`        | texto principal                      |
| `--muted`       | texto secundário                     |
| `--yellow`      | destaque principal (`#ffd400`)       |
| `--green/red`   | status (pago / reembolsado)          |

- Fontes: **Bricolage Grotesque** (títulos) + **Manrope** (corpo), via Google Fonts.
- Números usam `font-variant-numeric: tabular-nums` (classe `.num`).
- Raio padrão dos cartões: `--radius` (16px).

## Telas (uma por arquivo em `src/pages/`)

A navegação é por estado no `App.jsx`: o `page` atual decide qual componente de
`src/pages/` é renderizado. A `Sidebar` chama `onSelect(id)` para trocar de tela.

1. **dashboard** (Início) — KPIs, gráfico SVG de faturamento, vendas recentes.
2. **livex** — pessoas ao vivo no checkout: contador em tempo real, sessões ativas, funil.
3. **produtos** — catálogo em grade.
4. **vendas** — tabela de pedidos com filtros (chips) e status.
5. **config** — dados da loja, gateways, aparência, notificações (toggles `.sw`).
6. **planos** — Start (grátis, 2.5%), Prime (R$127, 2%), Elite (R$387, 1.5%).

> Os dados são **mockados** em `src/data.js`. Não há backend nem estado persistente.

## Convenções

- Português do Brasil em toda a UI.
- Componentes reutilizáveis (`KPICard`, `DataTable`, `PlanCard`, `Toggle`, `Tabs`...)
  + classes utilitárias do CSS (`.card`, `.btn`, `.tag`, `.tbl`, `.kpi`...).
- Ícones são SVG inline com `stroke="currentColor"`, centralizados em `Icon.jsx`.
- Acessibilidade: `Toggle` é `role="switch"`, `Tabs` segue o padrão WAI-ARIA
  (setas/Home/End, roving tabindex), foco visível em todos os controles e há
  skip-link + respeito a `prefers-reduced-motion`. **Mantenha esse nível ao evoluir.**
- Sem dependências externas além de React e das fontes do Google.

## Roadmap sugerido (próximos passos)

- [x] Migrar para um framework com build (**Vite + React**) mantendo o design system.
- [x] Componentizar (Sidebar, KPICard, DataTable, PlanCard, Toggle, Tabs).
- [x] Acessibilidade (foco, navegação por teclado, aria nos toggles e tabs).
- [ ] Tela de **checkout do cliente** (a página de pagamento em si) — não existe ainda.
- [ ] Backend / API para produtos, vendas e planos (dados hoje são mockados).
- [ ] Livex de verdade via WebSocket (hoje é um `setInterval` em `useLiveCount.js`).
- [ ] Autenticação e multiusuário.
- [ ] Integração de pagamento (Pix, cartão) — só visual por enquanto.
- [ ] Responsividade fina para mobile.

## Ao trabalhar neste projeto

- Preserve o tema preto/amarelo e o uso das variáveis CSS.
- Se for migrar para framework, faça **incrementalmente** e mantenha o visual idêntico
  como ponto de partida antes de redesenhar.
