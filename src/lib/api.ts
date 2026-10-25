// SIRS API Client Utility
export const API_BASE_URL =
  typeof window !== 'undefined'
    ? (import.meta.env?.VITE_API_URL || '/api')
    : '/api';

export const APP_DOMAIN =
  typeof window !== 'undefined'
    ? (import.meta.env?.VITE_APP_DOMAIN || window.location.origin)
    : 'https://dev.dlh.lumajangkab.go.id';

export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
