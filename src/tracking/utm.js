// Captura e persiste UTMs até a conclusão da compra.
const KEY = 'az_utms'
const FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

export function getUtms() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
export function captureUtms() {
  if (typeof window === 'undefined') return {}
  try {
    const p = new URLSearchParams(window.location.search)
    const found = {}
    FIELDS.forEach((k) => { const v = p.get(k); if (v) found[k] = v })
    const merged = { ...getUtms(), ...found }
    if (Object.keys(found).length) localStorage.setItem(KEY, JSON.stringify(merged))
    return merged
  } catch { return getUtms() }
}
