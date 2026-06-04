import { useEffect, useState } from 'react'
import { getLiveSessions } from './liveTracker.js'
import { watchCheckoutPresence } from './livePresence.js'
import { hasBackend } from './supabase.js'
import { getUser } from './auth.js'

// Contagem + sessões ao vivo do checkout.
// Com backend: presença real (cross-device) do próprio vendedor.
// Sem backend: fallback por localStorage (mesma máquina).
export default function useLiveCount() {
  const [data, setData] = useState({ atCheckout: 0, atPayment: 0, sessions: [] })

  useEffect(() => {
    const uid = getUser()?.id
    if (hasBackend && uid) {
      return watchCheckoutPresence(uid, (list) => {
        setData({
          atCheckout: list.length,
          atPayment: list.filter((x) => x.step === 'Pagamento').length,
          sessions: list,
        })
      })
    }
    const tick = () => {
      const s = getLiveSessions()
      setData({ atCheckout: s.length, atPayment: s.filter((x) => x.step === 'Pagamento').length, sessions: s })
    }
    tick()
    const id = setInterval(tick, 2000)
    window.addEventListener('storage', tick)
    return () => { clearInterval(id); window.removeEventListener('storage', tick) }
  }, [])

  return data
}
