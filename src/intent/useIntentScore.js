import { useEffect, useRef, useState } from 'react'
import { bus } from './EventBus.js'
import { RuleBasedProvider, clamp, tierOf } from './intentScore.js'

const throttle = (fn, ms) => { let t = 0; return (...a) => { const n = Date.now(); if (n - t >= ms) { t = n; fn(...a) } } }

// Captura comportamento do visitante e calcula a intenção (0-100) em tempo real.
export default function useIntentScore(opts = {}) {
  const { preview, enabled = true, discountPct = 10, provider, sessionId, slug, owner, utm, deviceType } = opts
  const [score, setScore] = useState(0)
  const [tier, setTier] = useState('abandono')
  const [exitArmed, setExitArmed] = useState(false)
  const [discountActive, setDiscountActive] = useState(false)
  const ref = useRef({ score: 0, tier: 'abandono', fired: new Set(), events: [], scrollDepth: 0, start: Date.now(), converted: false, convValue: 0, lastSent: 0, prov: provider || new RuleBasedProvider() })

  const snapshot = () => {
    const st = ref.current
    return {
      sessionId, checkoutSlug: slug, owner, score: st.score, tier: st.tier,
      events: st.events.slice(-100), timeOnPage: Math.round((Date.now() - st.start) / 1000),
      scrollDepth: Math.round(st.scrollDepth), converted: st.converted, conversionValue: st.convValue,
      utm, deviceType,
    }
  }
  const persist = (beacon) => {
    if (preview || !sessionId) return
    try {
      const body = JSON.stringify(snapshot())
      if (beacon && navigator.sendBeacon) navigator.sendBeacon('/api/intent', new Blob([body], { type: 'application/json' }))
      else fetch('/api/intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (preview || !enabled || typeof window === 'undefined') return
    const st = ref.current

    const maybePersist = () => { const n = Date.now(); if (n - st.lastSent > 4000) { st.lastSent = n; persist(false) } }
    const apply = (ev) => {
      const repeatable = ev === 'tab_change' || ev === 'minimize'
      if (!repeatable && st.fired.has(ev)) return
      if (!repeatable) st.fired.add(ev)
      const d = st.prov.delta(ev)
      if (!d) return
      st.events.push({ event: ev, t: Date.now() })
      st.score = clamp(st.score + d)
      setScore(st.score)
      bus.emit('intent:score-updated', { score: st.score, event: ev })
      const t = tierOf(st.score)
      if (t !== st.tier) { st.tier = t; setTier(t); bus.emit('intent:tier-changed', { tier: t, score: st.score }); persist(false); st.lastSent = Date.now() }
      else maybePersist()
    }

    apply('page_open')
    const stay = [setTimeout(() => apply('stay30'), 30000), setTimeout(() => apply('stay60'), 60000)]
    let inact = []
    const arm = () => { inact.forEach(clearTimeout); inact = [setTimeout(() => apply('inactive_2m'), 120000), setTimeout(() => apply('inactive_5m'), 300000)] }
    arm()

    const onScroll = throttle(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      const d = h > 0 ? (window.scrollY / h) * 100 : 100
      if (d > st.scrollDepth) st.scrollDepth = d
      if (d >= 25) apply('scroll25'); if (d >= 50) apply('scroll50'); if (d >= 75) apply('scroll75')
      arm()
    }, 400)
    const onAct = throttle(arm, 1500)
    const onVis = () => { if (document.hidden) { apply('tab_change'); persist(false) } }
    const onLeave = (e) => { if (e.clientY <= 0) { setExitArmed(true); bus.emit('intent:exit-triggered', {}) } }
    const onBefore = () => { apply('try_close'); persist(true) }
    const onPop = () => apply('back')
    const onFocusIn = (e) => { if (e.target.closest?.('.ck-input')) apply('field_focus') }
    const onInput = (e) => { const id = e.target.id; if (id === 'ck-name') apply('fill_name'); else if (id === 'ck-email') apply('fill_email'); else if (id === 'ck-phone') apply('fill_phone') }
    const onOver = (e) => { if (e.target.closest?.('.ck-cta')) apply('hover_pay') }
    const onClick = (e) => { if (e.target.closest?.('.ck-cta')) apply('click_pay') }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onAct, { passive: true })
    window.addEventListener('keydown', onAct, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    document.addEventListener('mouseout', onLeave)
    window.addEventListener('beforeunload', onBefore)
    window.addEventListener('popstate', onPop)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('input', onInput, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })
    document.addEventListener('click', onClick)

    let io
    const tIo = setTimeout(() => {
      io = new IntersectionObserver((ents) => {
        ents.forEach((en) => {
          if (!en.isIntersecting) return
          if (en.target.matches('.ck-summary')) { apply(st.fired.has('price_view') ? 'price_review' : 'price_view') }
          else if (en.target.matches('.ck-tests')) apply('testimonials_view')
          else if (en.target.matches('.ck-trust')) apply('guarantee_view')
        })
      }, { threshold: 0.4 })
      document.querySelectorAll('.ck-summary,.ck-tests,.ck-trust').forEach((el) => io.observe(el))
    }, 900)

    return () => {
      persist(true)
      stay.forEach(clearTimeout); inact.forEach(clearTimeout); clearTimeout(tIo); io?.disconnect()
      window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onAct); window.removeEventListener('keydown', onAct)
      document.removeEventListener('visibilitychange', onVis); document.removeEventListener('mouseout', onLeave)
      window.removeEventListener('beforeunload', onBefore); window.removeEventListener('popstate', onPop)
      document.removeEventListener('focusin', onFocusIn); document.removeEventListener('input', onInput)
      document.removeEventListener('mouseover', onOver); document.removeEventListener('click', onClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, enabled])

  const acceptDiscount = () => { setDiscountActive(true); bus.emit('intent:discount-triggered', { accepted: true }) }
  const markConverted = (value) => { ref.current.converted = true; ref.current.convValue = Number(value) || 0; bus.emit('intent:purchase-completed', { value }); persist(false) }
  return { score, tier, exitArmed, discountActive, discountPct, acceptDiscount, setExitArmed, markConverted }
}
