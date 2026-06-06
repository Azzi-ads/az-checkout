// Retorna os IDs de pixel (públicos) do dono do produto, para o checkout injetar.
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://wgzihgfavsboezhrgqck.supabase.co'

export default async function handler(req, res) {
  const slug = req.query?.slug
  const srv = process.env.SUPABASE_SERVICE_ROLE
  if (!slug || !srv) return res.status(200).json({})
  const sb = createClient(SB_URL, srv)
  try {
    const { data: prod } = await sb.from('products').select('owner').eq('slug', slug).limit(1)
    const owner = prod?.[0]?.owner
    if (!owner) return res.status(200).json({})
    const { data: prof } = await sb.from('profiles').select('tracking').eq('id', owner).maybeSingle()
    const t = prof?.tracking || {}
    // só IDs públicos — nunca o token do Utmify
    return res.status(200).json({
      metaPixel: t.metaPixel || '', tiktokPixel: t.tiktokPixel || '', kwaiPixel: t.kwaiPixel || '',
      googleAdsId: t.googleAdsId || '', googleAdsLabel: t.googleAdsLabel || '',
    })
  } catch { return res.status(200).json({}) }
}
