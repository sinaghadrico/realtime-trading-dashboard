import { API_URL } from '@/lib/constants';

export interface User {
  userId: string;
  email: string;
  name: string;
}

async function authRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(body.error ?? `Auth error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function login(email: string, password: string): Promise<User> {
  return authRequest<User>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<{ message: string }> {
  return authRequest<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  });
}

export function getMe(): Promise<User> {
  return authRequest<User>('/api/auth/me');
}
