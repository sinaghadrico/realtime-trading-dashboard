export interface Ticker {
  symbol: string;
  name: string;
  price: number;
  decimals: number;
}

export interface OHLC {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TickerHistory {
  symbol: string;
  name: string;
  days: number;
  data: OHLC[];
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'above' | 'below';
  createdAt: number;
}

export type WSServerMessage =
  | { type: 'price_update'; data: PriceUpdate }
  | { type: 'subscribed'; symbol: string }
  | { type: 'unsubscribed'; symbol: string }
  | { type: 'alert_triggered'; alert: PriceAlert; currentPrice: number }
  | { type: 'error'; message: string };

export type WSClientMessage =
  | { type: 'subscribe'; symbol: string }
  | { type: 'unsubscribe'; symbol: string };
