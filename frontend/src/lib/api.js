const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '')

export function apiUrl(path = '') {
  if (!path.startsWith('/')) path = '/' + path
  return `${API_BASE}${path}`
}

export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), options)
}
