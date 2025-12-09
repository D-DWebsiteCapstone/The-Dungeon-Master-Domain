// Determine if we are running locally
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const API_BASE = isLocal
  ? "http://localhost:3000"
  : import.meta.env.VITE_BACKEND_URL;

// Build full request URL
export function apiUrl(path = "") {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  if (!isLocal && !path.startsWith("/api")) {
    path = "/api" + path;
  }
  return API_BASE + path;
}

// Wrapper for fetch
export function apiFetch(path, options = {}) {
  return fetch(apiUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
}
