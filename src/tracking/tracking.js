// TrackingManager — injeta pixels e dispara eventos padronizados.
// Nunca quebra o checkout em caso de falha (tudo em try/catch). Scripts async.
let CFG = {}
const safe = (fn) => { try { fn() } catch { /* tracking nunca interrompe o checkout */ } }

function metaBoot(id) {
  if (window.fbq) return
  safe(() => {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    /* eslint-enable */
    window.fbq('init', id)
  })
}
function tiktokBoot(id) {
  if (window.ttq) return
  safe(() => {
    /* eslint-disable */
    !function (w, d, t) { w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent']; ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e }; ttq.load = function (e, n) { var r = 'https://analytics.tiktok.com/i18n/pixel/events.js', o = n && n.partner; ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r; ttq._t = ttq._t || {}; ttq._t[e] = +new Date; ttq._o = ttq._o || {}; ttq._o[e] = n || {}; n = d.createElement('script'); n.type = 'text/javascript'; n.async = !0; n.src = r + '?sdkid=' + e + '&lib=' + t; e = d.getElementsByTagName('script')[0]; e.parentNode.insertBefore(n, e) }; ttq.load(id); ttq.page() }(window, document, 'ttq')
    /* eslint-enable */
  })
}
function kwaiBoot(id) {
  if (window.kwaiq) return
  safe(() => {
    window.kwaiq = window.kwaiq || { q: [], track(...a) { this.q.push(['track', ...a]) }, page(...a) { this.q.push(['page', ...a]) }, load(...a) { this.q.push(['load', ...a]) } }
    const s = document.createElement('script'); s.async = true; s.src = 'https://s1-11187.kwimgs.com/kos/nlav11187/pixel/events.js'
    s.onload = () => safe(() => { window.kwaiq.load(id); window.kwaiq.page() })
    document.head.appendChild(s)
  })
}
function gtagBoot(id) {
  if (window.gtag && window.__azGtag) return
  safe(() => {
    const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`; document.head.appendChild(s)
    window.dataLayer = window.dataLayer || []; window.gtag = window.gtag || function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date()); window.gtag('config', id); window.__azGtag = true
  })
}

export function initTracking(cfg) {
  CFG = cfg || {}
  if (CFG.metaPixel) metaBoot(CFG.metaPixel)
  if (CFG.tiktokPixel) tiktokBoot(CFG.tiktokPixel)
  if (CFG.kwaiPixel) kwaiBoot(CFG.kwaiPixel)
  if (CFG.googleAdsId) gtagBoot(CFG.googleAdsId)
}

// event: page_view | initiated | payment_method_selected | purchase
export function trackEvent(event, data = {}) {
  const v = { value: Number(data.value) || 0, currency: 'BRL', product: data.product || '', tx: data.transactionId || '' }
  safe(() => {
    if (CFG.metaPixel && window.fbq) {
      const m = { page_view: 'PageView', initiated: 'InitiateCheckout', payment_method_selected: 'AddPaymentInfo', purchase: 'Purchase' }[event]
      if (m) window.fbq('track', m, event === 'purchase' ? { value: v.value, currency: v.currency, content_name: v.product } : {})
    }
  })
  safe(() => {
    if (CFG.tiktokPixel && window.ttq) {
      const m = { initiated: 'InitiateCheckout', purchase: 'CompletePayment' }[event]
      if (m) window.ttq.track(m, { value: v.value, currency: v.currency, content_name: v.product })
    }
  })
  safe(() => {
    if (CFG.kwaiPixel && window.kwaiq) {
      const m = { initiated: 'initiatedCheckout', purchase: 'purchase' }[event]
      if (m) window.kwaiq.track(m, { value: v.value, currency: v.currency })
    }
  })
  safe(() => {
    if (event === 'purchase' && CFG.googleAdsId && CFG.googleAdsLabel && window.gtag) {
      window.gtag('event', 'conversion', { send_to: `${CFG.googleAdsId}/${CFG.googleAdsLabel}`, value: v.value, currency: v.currency, transaction_id: v.tx })
    }
  })
}
