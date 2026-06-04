// Autenticação. Usa Supabase Auth quando o backend está ligado; senão, cai no
// localStorage (modo antigo). Mantém uma API síncrona (getUser/isAuthed) lendo
// um cache de sessão atualizado pelo initAuth.
import { supabase, hasBackend } from './supabase.js'

const LS_KEY = 'az_user'
const OWNERS = ['enzoazzi76@gmail.com', 'enzozzi76@gmail.com']

let cached = null // { id, email, name }

function mapSession(session) {
  const u = session?.user
  if (!u) return null
  const md = u.user_metadata || {}
  return {
    id: u.id,
    email: u.email,
    name: md.name || (u.email || '').split('@')[0],
    phone: md.phone || '',
    cpf: md.cpf || '',
    emailConfirmed: !!(u.email_confirmed_at || u.confirmed_at),
  }
}
function lsGet() { try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null } catch { return null } }

export function getUser() { return hasBackend ? cached : lsGet() }
export function isAuthed() { return !!getUser() }
export function isOwner() {
  const e = (getUser()?.email || '').trim().toLowerCase()
  return OWNERS.includes(e)
}
export function planLabel() { return isOwner() ? 'Plano Elite' : 'Plano Start' }

export async function login(email, password) {
  if (!hasBackend) { try { localStorage.setItem(LS_KEY, JSON.stringify({ name: (email || '').split('@')[0], email })) } catch { /* */ } return { error: null } }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (!error) cached = mapSession(data.session)
  return { error }
}
export async function signUp({ name, email, password, phone = '', cpf = '' }) {
  if (!hasBackend) { try { localStorage.setItem(LS_KEY, JSON.stringify({ name, email, phone, cpf })) } catch { /* */ } return { error: null } }
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, phone, cpf } } })
  if (!error && data.session) cached = mapSession(data.session)
  return { error, needsConfirm: !error && !data.session }
}
export async function logout() {
  cached = null
  if (hasBackend) { try { await supabase.auth.signOut() } catch { /* */ } }
  else { try { localStorage.removeItem(LS_KEY) } catch { /* */ } }
}

// Inicializa a sessão e avisa o app quando muda. Retorna função de cleanup.
export function initAuth(onChange) {
  if (!hasBackend) { onChange(); return () => {} }
  supabase.auth.getSession().then(({ data }) => { cached = mapSession(data.session); onChange() })
  const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { cached = mapSession(session); onChange() })
  return () => sub?.subscription?.unsubscribe?.()
}
