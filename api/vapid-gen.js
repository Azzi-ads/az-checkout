// Gera um par de chaves VAPID (rode UMA vez, copie e configure no Vercel:
// VAPID_PUBLIC, VAPID_PRIVATE e VAPID_SUBJECT=mailto:seu@email.com).
import webpush from 'web-push'

export default async function handler(req, res) {
  const keys = webpush.generateVAPIDKeys()
  res.status(200).json({
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    instrucoes: 'No Vercel: VAPID_PUBLIC=publicKey, VAPID_PRIVATE=privateKey, VAPID_SUBJECT=mailto:seu@email.com. Depois faça Redeploy.',
  })
}
