import type { Ticker, OHLC, PriceUpdate } from '../types/index.js';

export const TICKERS: Ticker[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin', basePrice: 64500, decimals: 8 },
  { symbol: 'ETH-USD', name: 'Ethereum', basePrice: 3420, decimals: 6 },
  { symbol: 'SOL-USD', name: 'Solana', basePrice: 142, decimals: 4 },
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 178, decimals: 2 },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 245, decimals: 2 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 155, decimals: 2 },
];

const currentPrices = new Map<string, number>();
const historyCache = new Map<string, OHLC[]>();

function initializePrices(): void {
  for (const ticker of TICKERS) {
    currentPrices.set(ticker.symbol, ticker.basePrice);
  }
}

export function generatePriceMovement(
  currentPrice: number,
  volatility = 0.002,
): number {
  const change = currentPrice * volatility * (Math.random() * 2 - 1);
  return Math.max(currentPrice + change, 0.01);
}

export function getNextPrice(symbol: string): PriceUpdate | null {
  const ticker = TICKERS.find((t) => t.symbol === symbol);
  if (!ticker) return null;

  const oldPrice = currentPrices.get(symbol) ?? ticker.basePrice;
  const volatility = symbol.includes('BTC') ? 0.003 : 0.002;
  const newPrice = generatePriceMovement(oldPrice, volatility);
  const roundedPrice =
    Math.round(newPrice * Math.pow(10, ticker.decimals)) /
    Math.pow(10, ticker.decimals);

  currentPrices.set(symbol, roundedPrice);

  const change = roundedPrice - oldPrice;
  const changePercent = (change / oldPrice) * 100;

  return {
    symbol,
    price: roundedPrice,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 1000) / 1000,
    timestamp: Date.now(),
  };
}

export function getCurrentPrice(symbol: string): number | null {
  return currentPrices.get(symbol) ?? null;
}

export function generateHistoricalData(
  symbol: string,
  days = 30,
): OHLC[] | null {
  const ticker = TICKERS.find((t) => t.symbol === symbol);
  if (!ticker) return null;

  const cached = historyCache.get(symbol);
  if (cached) return cached;

  const data: OHLC[] = [];
  let price = ticker.basePrice * (0.9 + Math.random() * 0.2);
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * msPerDay;
    const open = price;
    const volatility = symbol.includes('BTC') ? 0.04 : 0.02;
    const dayChange = price * volatility * (Math.random() * 2 - 1);
    const close = Math.max(price + dayChange, 0.01);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.round(1000000 + Math.random() * 50000000);

    data.push({
      timestamp,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });

    price = close;
  }

  historyCache.set(symbol, data);
  currentPrices.set(symbol, price);

  return data;
}

initializePrices();
