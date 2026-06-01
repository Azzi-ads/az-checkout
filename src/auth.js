// Autenticação mockada (front-end). Sem backend ainda — guarda os dados do
// usuário informado no login/cadastro no localStorage.
// TODO(roadmap): trocar por API/JWT de verdade.
const KEY = 'az_user'

export function getUser() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
export function isAuthed() {
  return !!getUser()
}
export function login(user) {
  try { localStorage.setItem(KEY, JSON.stringify(user)) } catch { /* ignore */ }
}
export function logout() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
