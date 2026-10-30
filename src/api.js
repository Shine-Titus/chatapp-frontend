import { API } from "./config";

// Thin wrapper around fetch: always sends cookies, JSON-encodes `body` when given.
// It returns the raw Response so each caller decides how to treat 401/403/404/409.
export function request(path, { method = "GET", body, signal } = {}) {
  const hasBody = body !== undefined;

  return fetch(`${API}${path}`, {
    method,
    credentials: "include",
    signal,
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  });
}
