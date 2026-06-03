// Service worker — PWA + Web Push.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => { /* rede padrão */ })

// Push (notificação com o app fechado)
self.addEventListener('push', (e) => {
  let d = {}
  try { d = e.data.json() } catch { d = { title: 'AZ Checkout', body: e.data?.text?.() || '' } }
  e.waitUntil(self.registration.showNotification(d.title || 'AZ Checkout', {
    body: d.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: d.url || '/app',
    vibrate: [80, 40, 80],
  }))
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data || '/app'
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    for (const c of cs) { if ('focus' in c) { c.navigate?.(url); return c.focus() } }
    return self.clients.openWindow(url)
  }))
})
