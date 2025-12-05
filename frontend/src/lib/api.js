// Prefer explicit backend URL; fall back to localhost during local dev only.
// Avoid using window.location.origin so deployed frontends don't accidentally call themselves.
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'


export function apiUrl(path = '') {
  if (!path.startsWith('/')) path = '/' + path
  return `${API_BASE}/api${path}`
}

export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), options)
}
