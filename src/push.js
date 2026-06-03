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

export async function subscribeToPush(uid) {
  if (!hasBackend || !uid) return false
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  try {
    const reg = await navigator.serviceWorker.ready
    const { key } = await fetch('/api/vapid-public').then((r) => r.json())
    if (!key) return false
    const existing = await reg.pushManager.getSubscription()
    const sub = existing || await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    })
    const json = sub.toJSON()
    // evita duplicar a mesma inscrição
    await supabase.from('push_subscriptions').delete().eq('owner', uid).eq('subscription->>endpoint', json.endpoint)
    await supabase.from('push_subscriptions').insert({ owner: uid, subscription: json })
    return true
  } catch { return false }
}
