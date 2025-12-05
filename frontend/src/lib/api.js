const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export function apiUrl(path = '') {
  if (!path.startsWith('/')) return `${API_BASE}/${path}`
  return `${API_BASE}${path}`
}

export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), options)
}
