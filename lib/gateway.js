// Resolve a chave do gateway (BravoPay) de cada vendedor.
// A chave fica em gateway_credentials (somente service_role). Nunca volta ao cliente.
export async function keyByOwner(sb, owner) {
  if (!owner) return null
  try {
    const { data } = await sb.from('gateway_credentials').select('api_key').eq('owner', owner).maybeSingle()
    return data?.api_key || null
  } catch { return null }
}
export async function keyBySlug(sb, slug) {
  if (!slug) return null
  try {
    const { data } = await sb.from('products').select('owner').eq('slug', slug).limit(1)
    return keyByOwner(sb, data?.[0]?.owner)
  } catch { return null }
}
export async function keyByTx(sb, txId) {
  if (!txId) return null
  try {
    const { data } = await sb.from('sales').select('owner').eq('tx_id', txId).limit(1)
    return keyByOwner(sb, data?.[0]?.owner)
  } catch { return null }
}
