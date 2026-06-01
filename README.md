# AZ Checkout

Plataforma de checkout para infoprodutos (tema preto + amarelo).
Front-end em **Vite + React**, componentizado e acessível, mantendo o design
system original.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
```

Build de produção: `npm run build` (saída em `dist/`).

### Sem Node? Rode no StackBlitz (no navegador, sem instalar nada)

Com o projeto no GitHub, abra:

```
https://stackblitz.com/github/SEU_USUARIO/az-checkout
```

O StackBlitz instala as dependências e roda o Vite direto no navegador.

## Estrutura

```
az-checkout/
├── index.html            # entrada do Vite (monta <div id="root">)
├── vite.config.js
├── src/
│   ├── main.jsx          # bootstrap React
│   ├── App.jsx           # navegação entre telas + contador ao vivo
│   ├── styles.css        # design system (:root) + acessibilidade
│   ├── data.js           # dados mockados (sem backend)
│   ├── useLiveCount.js   # hook do contador "ao vivo" do Livex
│   ├── components/       # Sidebar, Topbar, KPICard, DataTable, PlanCard, Toggle, Tabs, Icon
│   └── pages/            # Dashboard, Livex, Produtos, Vendas, Config, Planos
└── legacy/               # protótipo original em HTML/CSS/JS puro (referência)
```

## Evoluir com Claude Code

Abra o Claude Code dentro desta pasta — ele lê o `CLAUDE.md` automaticamente
para entender estrutura, design system e roadmap.

```bash
cd az-checkout
claude
```
