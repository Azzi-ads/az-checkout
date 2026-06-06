import { useState } from 'react'
import Icon from '../components/Icon.jsx'

// Ações por faixa de intenção (exit-intent, desconto relâmpago, suporte).
export default function IntentActions({ intent, whatsapp }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('az_intent_dismiss') || '{}') } catch { return {} }
  })
  const close = (k) => {
    const n = { ...dismissed, [k]: 1 }; setDismissed(n)
    try { sessionStorage.setItem('az_intent_dismiss', JSON.stringify(n)) } catch { /* ignore */ }
    if (k === 'exit') intent.setExitArmed(false)
  }
  const { tier, exitArmed, discountActive, discountPct } = intent
  const showExit = exitArmed && tier === 'abandono' && !discountActive && !dismissed.exit
  const showDiscount = tier === 'interessado' && !discountActive && !dismissed.discount
  const showSupport = tier === 'hesitando' && !dismissed.support
  const wa = whatsapp?.number ? `https://wa.me/${String(whatsapp.number).replace(/\D/g, '')}` : null

  return (
    <>
      {showExit && (
        <div className="intent-overlay" onClick={() => close('exit')}>
          <div className="intent-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <span className="intent-badge">ESPERA!</span>
            <h3>Não vá embora ainda 👀</h3>
            <p>Garanta <b>{discountPct}% de desconto</b> agora — só pra você que está finalizando.</p>
            <button type="button" className="btn btn-primary" onClick={() => { intent.acceptDiscount(); close('exit') }}>Quero o desconto</button>
            <button type="button" className="intent-link" onClick={() => close('exit')}>Não, obrigado</button>
          </div>
        </div>
      )}

      {showDiscount && (
        <div className="intent-banner">
          <Icon name="bolt" />
          <span>Oferta relâmpago: <b>{discountPct}% OFF</b> por tempo limitado.</span>
          <button type="button" className="btn btn-primary" onClick={intent.acceptDiscount}>Aplicar</button>
          <button type="button" className="intent-x" onClick={() => close('discount')} aria-label="Fechar"><Icon name="close" /></button>
        </div>
      )}

      {showSupport && (
        <div className="intent-support">
          <button type="button" className="intent-x" onClick={() => close('support')} aria-label="Fechar"><Icon name="close" /></button>
          <div className="intent-support-h"><Icon name="phone" />Posso ajudar?</div>
          <p>Tem alguma dúvida antes de finalizar? Estou por aqui.</p>
          {wa && <a className="btn btn-primary" href={wa} target="_blank" rel="noreferrer"><Icon name="phone" />Falar no WhatsApp</a>}
        </div>
      )}
    </>
  )
}
