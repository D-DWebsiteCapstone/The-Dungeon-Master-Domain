// Prefer explicit env. Fallback: in production use current origin, otherwise localhost.
const API_BASE = (() => {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin
    if (!origin.includes('localhost')) return origin
  }
  return 'http://localhost:3000'
})()


export function apiUrl(path = '') {
  if (!path.startsWith('/')) return `${API_BASE}/${path}`
  return `${API_BASE}${path}`
}

export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), options)
}
