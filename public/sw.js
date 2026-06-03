// Service worker mínimo — habilita "instalar na tela inicial" (PWA).
// Sem cache agressivo (evita servir versão antiga após deploy).
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => { /* rede padrão */ })
