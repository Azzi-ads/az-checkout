// Hook de Purchase Intent Score: rastreia o comportamento na sessão de checkout,
// mantém um score 0–100 ao vivo, detecta exit-intent e salva o resultado final
// no Supabase ao desmontar. Mobile-first (toque, viewport virtual, back-gesture).
import { useCallback, useEffect, useRef, useState } from 'react'
import { calculateScore, INTENT_EVENTS, REPEATABLE } from '../lib/intentScore.js'
import { supabase, hasBackend } from '../supabase.js'

const uuid = () => (globalThis.crypto?.randomUUID
  ? crypto.randomUUID()
  : `sess-${Math.random().toString(36).slice(2)}-${Math.floor(performance.now())}`)

// dispositivo de toque — por capacidade do ponteiro, não por userAgent
const isTouchDevice = () => typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(pointer: coarse)').matches

export function useIntentScore({ checkoutId } = {}) {
  const [score, setScore] = useState(0)
  const [isExitIntent, setIsExitIntent] = useState(false)
  const sessionIdRef = useRef(uuid())
  const eventsRef = useRef([])
  const appliedRef = useRef(new Set())
  const savedRef = useRef(false)
  const convertedRef = useRef(false)

  // registra um evento (respeitando 1x por sessão p/ não-repetíveis) e recalcula
  const add = useCallback((type) => {
    if (!(type in INTENT_EVENTS)) return
    if (!REPEATABLE.has(type)) {
      if (appliedRef.current.has(type)) return
      appliedRef.current.add(type)
    }
    eventsRef.current.push({ type, timestamp: Date.now() })
    setScore(calculateScore(eventsRef.current))
  }, [])

  // marca conversão (chamar quando o pagamento é confirmado) antes do save
  const markConverted = useCallback(() => { convertedRef.current = true }, [])

  // persiste o score final (insert direto via anon + RLS, sem função serverless)
  const saveScore = useCallback(async () => {
    if (savedRef.current || !hasBackend) return
    savedRef.current = true
    try {
      await supabase.from('intent_scores').insert({
        session_id: sessionIdRef.current,
        checkout_id: checkoutId || null,
        final_score: calculateScore(eventsRef.current),
        events: eventsRef.current,
        converteu: convertedRef.current,
      })
    } catch { /* silencioso: analytics não pode quebrar o checkout */ }
  }, [checkoutId])

  // trackers manuais expostos ao checkout
  const trackHoverPayButton = useCallback(() => add('HOVER_PAY_BUTTON'), [add])
  const trackReturnToPrice = useCallback(() => add('RETURNED_TO_PRICE'), [add])
  const trackFieldClick = useCallback(() => add('FIELD_CLICK'), [add])

  useEffect(() => {
    add('PAGE_OPEN')
    const touch = isTouchDevice()

    let inactivityTimer
    const resetInactivity = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => add('INACTIVE_2MIN'), 2 * 60 * 1000)
    }

    // SCROLLED_50: usa visualViewport.height (compensa o teclado virtual no mobile)
    const onScroll = () => {
      const vh = window.visualViewport?.height || window.innerHeight
      const total = document.body.scrollHeight || 1
      if ((window.scrollY + vh) / total >= 0.5) add('SCROLLED_50')
    }

    const onVisibility = () => { if (document.hidden) add('TAB_HIDDEN') }

    // exit-intent desktop: o mouse sai pela borda superior da viewport
    const onMouseOut = (e) => { if (!touch && (e.clientY <= 0 || !e.relatedTarget)) { if (e.clientY <= 0) setIsExitIntent(true) } }

    // exit-intent mobile: toque na borda superior (gesto de fechar/voltar)
    const onTouchStart = (e) => {
      resetInactivity()
      const t = e.touches?.[0]
      if (t && t.clientY < 50) setIsExitIntent(true)
    }
    const onTouchEnd = (e) => {
      resetInactivity()
      const t = e.changedTouches?.[0]
      if (t && t.clientY < 50) setIsExitIntent(true)
    }
    const onMove = () => resetInactivity()
    const onKey = () => resetInactivity()

    // back-gesture (mobile) como exit-intent: empilha um estado e captura o 1º "voltar"
    const onPopState = () => setIsExitIntent(true)
    if (touch) { try { history.pushState({ pinguIntent: true }, '') } catch { /* */ } }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('mouseout', onMouseOut)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPopState)

    const t30 = setTimeout(() => add('TIME_30S'), 30 * 1000)
    resetInactivity()

    const onHide = () => { saveScore() }
    window.addEventListener('pagehide', onHide)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('mouseout', onMouseOut)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('pagehide', onHide)
      clearTimeout(t30)
      clearTimeout(inactivityTimer)
      saveScore()
    }
  }, [add, saveScore])

  return {
    score,
    sessionId: sessionIdRef.current,
    isExitIntent,
    trackHoverPayButton,
    trackReturnToPrice,
    trackFieldClick,
    markConverted,
  }
}
