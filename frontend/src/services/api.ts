import type { Ticker, TickerHistory, PriceAlert } from '@/types';

import { API_URL } from '@/lib/constants';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function fetchTickers(): Promise<Ticker[]> {
  return request<Ticker[]>('/api/tickers');
}

export function fetchTickerHistory(
  symbol: string,
  days = 30,
  intervalMinutes = 0,
): Promise<TickerHistory> {
  const params = new URLSearchParams({ days: String(days) });
  if (intervalMinutes > 0) {
    params.set('interval', String(intervalMinutes));
  }
  return request<TickerHistory>(
    `/api/tickers/${encodeURIComponent(symbol)}/history?${params}`,
  );
}

export function fetchAlerts(): Promise<PriceAlert[]> {
  return request<PriceAlert[]>('/api/alerts');
}

export function createAlert(
  symbol: string,
  targetPrice: number,
  direction: 'above' | 'below',
): Promise<PriceAlert> {
  return request<PriceAlert>('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, targetPrice, direction }),
  });
}

export function deleteAlertApi(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/alerts/${id}`, {
    method: 'DELETE',
  });
}
