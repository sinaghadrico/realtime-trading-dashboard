import type { Ticker, TickerHistory } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3075';

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
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
