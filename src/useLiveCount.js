import { useEffect, useState } from 'react'
import { getLiveSessions } from './liveTracker.js'

// Contagem ao vivo do checkout (lê o rastreador). Atualiza a cada 2s e quando
// outra aba mexe no localStorage.
export default function useLiveCount() {
  const [counts, setCounts] = useState({ atCheckout: 0, atPayment: 0 })

  useEffect(() => {
    const tick = () => {
      const s = getLiveSessions()
      setCounts({ atCheckout: s.length, atPayment: s.filter((x) => x.step === 'Pagamento').length })
    }
    tick()
    const id = setInterval(tick, 2000)
    window.addEventListener('storage', tick)
    return () => { clearInterval(id); window.removeEventListener('storage', tick) }
  }, [])

  return counts
}
