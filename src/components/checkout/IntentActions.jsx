// Ações automáticas por faixa de Intent Score (cada uma dispara no máx. 1x/sessão):
//   score < 30 && exit-intent  → bottom sheet de retenção (texto configurável)
//   30–49                      → banner fixo no topo com cupom relâmpago + countdown
//   50–79                      → bottom sheet de suporte com link do WhatsApp
//   >= 80                      → nada (o usuário já está convertendo)
// Mobile-first: bottom sheets em vez de modal centralizado (não brigam com o
// teclado virtual); banner fixo no topo em vez de toast que some.
import { useEffect, useState } from 'react'
import Icon from '../Icon.jsx'

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

/**
 * @typedef {Object} DiscountConfig
 * @property {string} label
 * @property {string} couponCode
 * @property {number} expiresInMinutes
 */

export default function IntentActions({
  score,
  isExitIntent,
  checkoutId,
  discountConfig,
  whatsapp = '',
  exitText = 'Espera! Antes de sair, garanta sua condição especial agora.',
}) {
  // cada ação: marcada como exibida uma única vez por sessão
  const [shownExit, setShownExit] = useState(false)
  const [shownBanner, setShownBanner] = useState(false)
  const [shownWa, setShownWa] = useState(false)
  const [closed, setClosed] = useState({})

  useEffect(() => {
    if (score < 30 && isExitIntent) setShownExit(true)
    else if (score >= 30 && score <= 49) setShownBanner(true)
    else if (score >= 50 && score <= 79) setShownWa(true)
    // score >= 80 → nenhuma ação
  }, [score, isExitIntent])

  const cfg = discountConfig || { label: 'Desconto relâmpago', couponCode: 'PINGU10', expiresInMinutes: 10 }
  const [secs, setSecs] = useState((cfg.expiresInMinutes || 10) * 60)
  useEffect(() => {
    if (!shownBanner) return
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [shownBanner])

  const waDigits = String(whatsapp || '').replace(/\D/g, '')
  const waHref = waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent('Oi! Tenho uma dúvida no checkout e quero finalizar.')}` : null

  const close = (k) => setClosed((c) => ({ ...c, [k]: true }))

  return (
    <div data-checkout={checkoutId || undefined}>
      {/* 30–49 — banner fixo no topo (cupom visível enquanto preenche o form) */}
      {shownBanner && !closed.banner && (
        <div className="intent-banner" role="status">
          <Icon name="revenue" />
          <span className="intent-banner-txt"><b>{cfg.label}:</b> use o cupom <b>{cfg.couponCode}</b></span>
          <span className="intent-banner-time num" aria-label="Tempo restante">{fmt(secs)}</span>
          <button type="button" className="intent-x" aria-label="Fechar aviso" onClick={() => close('banner')}>×</button>
        </div>
      )}

      {/* <30 + exit-intent — bottom sheet de retenção */}
      {shownExit && !closed.exit && (
        <BottomSheet title="Não vá embora ainda 👋" onClose={() => close('exit')}>
          <p className="intent-p">{exitText}</p>
          <div className="intent-coupon"><span>Seu cupom</span><b>{cfg.couponCode}</b></div>
          <button type="button" className="btn btn-primary intent-cta" onClick={() => close('exit')}>
            <Icon name="check" /> Continuar minha compra
          </button>
        </BottomSheet>
      )}

      {/* 50–79 — bottom sheet de suporte via WhatsApp */}
      {shownWa && !closed.wa && (
        <BottomSheet title="Precisa de ajuda pra finalizar?" onClose={() => close('wa')}>
          <p className="intent-p">Fale com a gente agora — respondemos na hora pra você concluir com segurança.</p>
          {waHref ? (
            <a className="btn btn-primary intent-cta" href={waHref} target="_blank" rel="noreferrer">
              <Icon name="phone" /> Chamar no WhatsApp
            </a>
          ) : (
            <button type="button" className="btn btn-primary intent-cta" onClick={() => close('wa')}>Continuar</button>
          )}
        </BottomSheet>
      )}
    </div>
  )
}

function BottomSheet({ title, children, onClose }) {
  return (
    <div className="intent-sheet-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="intent-sheet-backdrop" aria-label="Fechar" onClick={onClose} />
      <div className="intent-sheet">
        <span className="intent-sheet-grip" aria-hidden="true" />
        <div className="intent-sheet-head">
          <h3>{title}</h3>
          <button type="button" className="intent-x" aria-label="Fechar" onClick={onClose}>×</button>
        </div>
        <div className="intent-sheet-body">{children}</div>
      </div>
    </div>
  )
}
