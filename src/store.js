// Dados por usuário (produtos, perfil, tema) no localStorage.
// Sem backend ainda — cada conta (e-mail) tem seu próprio "store".
// TODO(roadmap): migrar para API/banco de verdade.
import { products as seedProducts } from './data.js'
import { getUser } from './auth.js'

const keyFor = () => `az_store_${getUser()?.email || 'anon'}`

function read() {
  try { return JSON.parse(localStorage.getItem(keyFor()) || 'null') } catch { return null }
}
function write(data) {
  try { localStorage.setItem(keyFor(), JSON.stringify(data)) } catch { /* ignore */ }
}

function defaults() {
  return {
    // começa com os produtos de exemplo (o usuário pode apagar e criar os seus)
    products: seedProducts.filter((p) => p.slug),
    profile: { name: getUser()?.name || '', avatar: '' },
    theme: { accent: '#ffd400', mode: 'dark', preset: 'amarelo' },
  }
}

export function getStore() {
  const saved = read()
  if (!saved) {
    const d = defaults()
    write(d)
    return d
  }
  // garante que todas as chaves existam mesmo em stores antigos
  return { ...defaults(), ...saved }
}

export function getProducts() { return getStore().products }
export function saveProducts(products) {
  const d = getStore(); d.products = products; write(d)
}

export function getProfile() { return getStore().profile }
export function saveProfile(profile) {
  const d = getStore(); d.profile = { ...d.profile, ...profile }; write(d); return d.profile
}

export function getTheme() { return getStore().theme }
export function saveTheme(theme) {
  const d = getStore(); d.theme = { ...d.theme, ...theme }; write(d); return d.theme
}
