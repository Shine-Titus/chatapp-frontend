import { API } from "./config";

// Thin wrapper around fetch: always sends cookies. Plain objects are sent as JSON,
// FormData (file uploads) is sent as-is. Returns the raw Response.
export function request(path, { method = "GET", body, signal } = {}) {
  const hasBody = body !== undefined;
  const isForm = body instanceof FormData;

  return fetch(`${API}${path}`, {
    method,
    credentials: "include",
    signal,
    headers: hasBody && !isForm ? { "Content-Type": "application/json" } : undefined,
    body: !hasBody ? undefined : isForm ? body : JSON.stringify(body),
  });
}
