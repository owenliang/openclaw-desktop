const DEFAULT_URL = 'http://localhost:8000';

export function getBaseUrl(): string {
  return localStorage.getItem('server_url') || DEFAULT_URL;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${getBaseUrl()}${path}`;

  // Build plain headers object
  const headers: Record<string, string> = {};

  // Copy caller-provided headers
  const src = options?.headers;
  if (src) {
    if (src instanceof Headers) {
      src.forEach((v, k) => { headers[k] = v; });
    } else if (Array.isArray(src)) {
      src.forEach(([k, v]) => { headers[k] = v; });
    } else {
      Object.assign(headers, src);
    }
  }

  // Attach Bearer token if enabled
  if (localStorage.getItem('token_auth_enabled') === 'true') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: options?.method,
    body: options?.body,
    headers,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await apiFetch(path);
  return response.json();
}
