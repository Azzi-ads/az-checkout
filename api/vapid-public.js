// Retorna a chave pública VAPID (usada pelo navegador para se inscrever no push).
export default function handler(req, res) {
  res.status(200).json({ key: process.env.VAPID_PUBLIC || '' })
}
