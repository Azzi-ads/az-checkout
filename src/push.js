// Inscrição em Web Push (notificação com o app fechado).
import { supabase, hasBackend } from './supabase.js'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

// Retorna { ok, reason } para o app conseguir dizer ao usuário o que falhou.
export async function subscribeToPush(uid) {
  if (!hasBackend || !uid) return { ok: false, reason: 'no-backend' }
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return { ok: false, reason: 'unsupported' }
  try {
    const reg = await navigator.serviceWorker.ready
    const { key } = await fetch('/api/vapid-public').then((r) => r.json()).catch(() => ({}))
    if (!key) return { ok: false, reason: 'no-vapid' }
    const existing = await reg.pushManager.getSubscription()
    let sub
    try {
      sub = existing || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) })
    } catch (e) {
      return { ok: false, reason: 'subscribe:' + (e?.name || 'erro') }
    }
    const json = sub.toJSON()
    // garante que esta inscrição (endpoint) está salva pro dono, sem duplicar
    const { data: rows } = await supabase.from('push_subscriptions').select('id,subscription').eq('owner', uid)
    if ((rows || []).some((r) => r.subscription?.endpoint === json.endpoint)) return { ok: true, reason: 'already' }
    const { error } = await supabase.from('push_subscriptions').insert({ owner: uid, subscription: json })
    if (error) return { ok: false, reason: 'db:' + (error.message || error.code || 'erro') }
    return { ok: true }
  } catch (e) {
    return { ok: false, reason: 'erro:' + (e?.name || '?') }
  }
}
