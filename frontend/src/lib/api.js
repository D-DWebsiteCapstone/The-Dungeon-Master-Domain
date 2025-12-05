// Prefer explicit backend URL; fall back to localhost during local dev only.
// If your backend is mounted under a path (e.g., https://example.com/api), include that path in VITE_BACKEND_URL.
// Example:
//   local: VITE_BACKEND_URL=http://localhost:3000
//   prod : VITE_BACKEND_URL=https://your-backend.example.com/api
const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '')

export function apiUrl(path = '') {
  if (!path.startsWith('/')) path = '/' + path
  return `${API_BASE}${path}`
}

export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), options)
}
