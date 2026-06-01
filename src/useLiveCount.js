import { useEffect, useState } from 'react'

// Simula o contador "ao vivo" do Livex (hoje sem backend).
// Retorna { atCheckout, atPayment }, atualizando a cada 2,6s — equivalente ao
// setInterval do protótipo original, mas com cleanup gerenciado pelo React.
// TODO(roadmap): trocar por WebSocket quando houver backend.
export default function useLiveCount() {
  const [counts, setCounts] = useState({ atCheckout: 12, atPayment: 4 })

  useEffect(() => {
    const id = setInterval(() => {
      const n = 8 + Math.floor(Math.random() * 9)
      const p = Math.max(2, Math.floor(n / 3))
      setCounts({ atCheckout: n, atPayment: p })
    }, 2600)
    return () => clearInterval(id)
  }, [])

  return counts
}
