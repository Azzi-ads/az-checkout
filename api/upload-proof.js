// Sobe o comprovante (imagem) pro Supabase Storage e grava a URL na venda.
// Mantém o banco leve (antes a imagem ia embutida como base64 na coluna proof).
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'
const BUCKET = 'comprovantes'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })
  const srv = process.env.SUPABASE_SERVICE_ROLE
  if (!srv) return res.status(500).json({ error: 'Backend não configurado.' })
  const sb = createClient(SB_URL, srv)
  try {
    const { saleId, dataUrl } = req.body || {}
    if (!saleId || !dataUrl) return res.status(400).json({ error: 'saleId e dataUrl obrigatórios' })
    const m = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(dataUrl)
    if (!m) return res.status(400).json({ error: 'Imagem inválida.' })
    const contentType = m[1]
    const ext = (contentType.split('/')[1] || 'jpg').replace('+', '').replace('jpeg', 'jpg')
    const buffer = Buffer.from(m[2], 'base64')
    const path = `${saleId}/${Date.now()}.${ext}`

    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buffer, { contentType, upsert: true })
    if (upErr) return res.status(500).json({ error: 'Storage: ' + upErr.message })

    const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path)
    const url = pub?.publicUrl || ''
    await sb.from('sales').update({ proof: url }).eq('id', saleId)
    return res.status(200).json({ ok: true, url })
  } catch {
    return res.status(500).json({ error: 'Falha no upload do comprovante.' })
  }
}
