// Autenticação mockada (front-end). Sem backend ainda — guarda só um flag
// no localStorage. TODO(roadmap): trocar por API/JWT de verdade.
const KEY = 'az_auth'

export function isAuthed() {
  try { return localStorage.getItem(KEY) === '1' } catch { return false }
}
export function login() {
  try { localStorage.setItem(KEY, '1') } catch { /* ignore */ }
}
export function logout() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
