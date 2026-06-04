// Dados por usuário (produtos, perfil, tema).
// Leitura síncrona via localStorage (cache); quando há backend, sincroniza com
// o Supabase (produtos e perfil) — hidrata no login e faz push ao salvar.
import { products as seedProducts } from './data.js'
import { getUser } from './auth.js'
import { supabase, hasBackend } from './supabase.js'

const keyFor = () => `az_store_${getUser()?.email || 'anon'}`
const uid = () => getUser()?.id

function read() { try { return JSON.parse(localStorage.getItem(keyFor()) || 'null') } catch { return null } }
function write(data) { try { localStorage.setItem(keyFor(), JSON.stringify(data)) } catch { /* ignore */ } }

function defaults() {
  return {
    products: seedProducts.filter((p) => p.slug),
    profile: { name: getUser()?.name || '', cpf: getUser()?.cpf || '', phone: getUser()?.phone || '', avatar: '', security: false, domain: '', notifPending: true, notifPaid: true, notifMode: 'auto', notifTextPaid: '', notifTextPending: '', notifColor: '' },
    theme: { accent: '#ffd400', mode: 'dark', preset: 'amarelo', bg: '' },
  }
}

export function getStore() {
  const saved = read()
  if (!saved) { const d = defaults(); write(d); return d }
  return { ...defaults(), ...saved }
}

export function getProducts() { return getStore().products }
export function saveProducts(products) {
  const d = getStore(); d.products = products; write(d)
  pushProducts(products)
}
export function getProfile() { return getStore().profile }
export function saveProfile(profile) {
  const d = getStore(); d.profile = { ...d.profile, ...profile }; write(d)
  pushProfile(d.profile)
  return d.profile
}
export function getTheme() { return getStore().theme }
export function saveTheme(theme) { const d = getStore(); d.theme = { ...d.theme, ...theme }; write(d); return d.theme }

// ===== Sincronização com o Supabase =====

// Puxa produtos + perfil do banco para o cache local (no login / boot).
export async function hydrate() {
  if (!hasBackend || !uid()) return
  try {
    const [{ data: prof }, { data: prods }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid()).maybeSingle(),
      supabase.from('products').select('data').eq('owner', uid()),
    ])
    const store = getStore()
    if (prof) store.profile = { ...store.profile, name: prof.name || store.profile.name, cpf: prof.cpf || getUser()?.cpf || '', phone: prof.phone || getUser()?.phone || '', avatar: prof.avatar || '', security: !!prof.security, domain: prof.domain || '', notifPending: prof.notif_pending !== false, notifPaid: prof.notif_paid !== false, notifMode: prof.notif_mode || 'auto', notifTextPaid: prof.notif_text_paid || '', notifTextPending: prof.notif_text_pending || '', notifColor: prof.notif_color || '' }
    if (Array.isArray(prods) && prods.length) store.products = prods.map((r) => r.data).filter(Boolean)
    write(store)
  } catch { /* mantém o cache local */ }
}

async function pushProducts(list) {
  if (!hasBackend || !uid()) return
  try {
    await supabase.from('products').delete().eq('owner', uid())
    if (list.length) {
      await supabase.from('products').insert(list.map((p) => ({
        owner: uid(), slug: p.slug, name: p.name, amount: Number(p.amount) || 0, data: p,
      })))
    }
  } catch { /* segue só local */ }
}
async function pushProfile(profile) {
  if (!hasBackend || !uid()) return
  try {
    await supabase.from('profiles').upsert({
      id: uid(), email: getUser()?.email, name: profile.name, avatar: profile.avatar || '',
      cpf: profile.cpf || '', phone: profile.phone || '',
      security: !!profile.security, domain: profile.domain || '',
      notif_pending: profile.notifPending !== false, notif_paid: profile.notifPaid !== false,
      notif_mode: profile.notifMode || 'auto', notif_text_paid: profile.notifTextPaid || '',
      notif_text_pending: profile.notifTextPending || '', notif_color: profile.notifColor || '',
    })
  } catch { /* segue só local */ }
}

// Busca pública de um produto pelo slug (checkout do comprador, qualquer device).
export async function fetchProductBySlug(slug) {
  if (!hasBackend) return null
  try {
    const { data } = await supabase.from('products').select('data,owner').eq('slug', slug).limit(1)
    const row = data?.[0]
    return row?.data ? { ...row.data, owner: row.owner } : null
  } catch { return null }
}
