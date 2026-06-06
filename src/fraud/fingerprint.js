// Captura leve de device + fingerprint (sem libs externas).
export function deviceInfo() {
  if (typeof navigator === 'undefined') return {}
  const ua = navigator.userAgent || ''
  const browser = /edg/i.test(ua) ? 'Edge' : /opr|opera/i.test(ua) ? 'Opera' : /chrome|crios/i.test(ua) ? 'Chrome' : /firefox|fxios/i.test(ua) ? 'Firefox' : /safari/i.test(ua) ? 'Safari' : 'Outro'
  const os = /windows/i.test(ua) ? 'Windows' : /android/i.test(ua) ? 'Android' : /iphone|ipad|ipod/i.test(ua) ? 'iOS' : /mac os/i.test(ua) ? 'macOS' : /linux/i.test(ua) ? 'Linux' : 'Outro'
  let timezone = ''
  try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } catch { /* ignore */ }
  const sw = typeof screen !== 'undefined' ? screen.width : 0
  const sh = typeof screen !== 'undefined' ? screen.height : 0
  return { user_agent: ua, browser, os, timezone, language: navigator.language || '', screen_resolution: `${sw}x${sh}` }
}

export function getFingerprint() {
  const d = deviceInfo()
  const raw = [d.user_agent, d.language, d.timezone, d.screen_resolution, navigator.hardwareConcurrency || '', navigator.platform || ''].join('|')
  let h = 5381
  for (let i = 0; i < raw.length; i++) h = ((h << 5) + h + raw.charCodeAt(i)) >>> 0
  return { fingerprint: 'fp_' + h.toString(16), device: d }
}
