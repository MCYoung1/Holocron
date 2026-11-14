export const API_URL = import.meta.env.VITE_API_URL;

export async function api(path, { method = 'GET', body, token, contentType, headers: extraHeaders = {} } = {}) {
  const headers = { ...extraHeaders };
  if (body !== undefined) {
    headers['Content-Type'] = contentType || 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : contentType ? body : JSON.stringify(body),
  });

  if (response.status === 204) {
    return null;
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error || `Request failed with status ${response.status}.`);
  }

  return result;
}
