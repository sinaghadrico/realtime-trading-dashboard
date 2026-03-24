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

// Gaussian random using Box-Muller transform
function gaussianRandom(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

// Geometric Brownian Motion step
function gbmStep(price: number, sigma: number, mu: number = 0.0001): number {
  const dt = 1;
  const drift = (mu - (sigma * sigma) / 2) * dt;
  const diffusion = sigma * Math.sqrt(dt) * gaussianRandom();
  return price * Math.exp(drift + diffusion);
}

// Generate intermediate ticks for realistic OHLC
function generateCandle(startPrice: number, sigma: number, ticks = 6): OHLC {
  const prices = [startPrice];
  let p = startPrice;
  for (let i = 0; i < ticks; i++) {
    p = gbmStep(p, sigma);
    prices.push(p);
  }

  return {
    timestamp: 0,
    open: prices[0],
    high: Math.max(...prices),
    low: Math.min(...prices),
    close: prices[prices.length - 1],
    volume: Math.round(100000 + Math.random() * 10000000),
  };
}

function roundPrice(price: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(price * factor) / factor;
}

function initializePrices(): void {
  for (const ticker of TICKERS) {
    currentPrices.set(ticker.symbol, ticker.basePrice);
  }
}

export function generatePriceMovement(
  currentPrice: number,
  volatility = 0.002,
): number {
  return gbmStep(currentPrice, volatility);
}

export function getNextPrice(symbol: string): PriceUpdate | null {
  const ticker = TICKERS.find((t) => t.symbol === symbol);
  if (!ticker) return null;

  const oldPrice = currentPrices.get(symbol) ?? ticker.basePrice;
  const volatility = symbol.includes('BTC')
    ? 0.003
    : symbol.includes('ETH')
      ? 0.0025
      : 0.002;
  const newPrice = generatePriceMovement(oldPrice, volatility);
  const roundedPrice = roundPrice(newPrice, ticker.decimals);

  currentPrices.set(symbol, roundedPrice);

  const change = roundedPrice - oldPrice;
  const changePercent = (change / oldPrice) * 100;

  return {
    symbol,
    price: roundedPrice,
    change: roundPrice(change, 4),
    changePercent: roundPrice(changePercent, 4),
    timestamp: Date.now(),
  };
}

export function getCurrentPrice(symbol: string): number | null {
  return currentPrices.get(symbol) ?? null;
}

export function generateHistoricalData(
  symbol: string,
  days = 30,
  intervalMinutes = 0,
): OHLC[] | null {
  const ticker = TICKERS.find((t) => t.symbol === symbol);
  if (!ticker) return null;

  const cacheKey =
    intervalMinutes > 0
      ? `${symbol}_${days}d_${intervalMinutes}m`
      : `${symbol}_${days}d`;
  const cached = historyCache.get(cacheKey);
  if (cached) return cached;

  const data: OHLC[] = [];
  const now = Date.now();
  const isCrypto = symbol.includes('-');

  if (intervalMinutes > 0) {
    // Minute-level candles (for 1H, 24H, 1W, 1M)
    const totalMinutes = days * 24 * 60;
    const totalCandles = Math.floor(totalMinutes / intervalMinutes);
    const msPerInterval = intervalMinutes * 60 * 1000;

    // Volatility scales with interval size
    const sigma = isCrypto
      ? 0.001 * Math.sqrt(intervalMinutes)
      : 0.0005 * Math.sqrt(intervalMinutes);

    let price = ticker.basePrice * (0.85 + Math.random() * 0.3);

    for (let i = 0; i < totalCandles; i++) {
      const timestamp = now - (totalCandles - i) * msPerInterval;
      const candle = generateCandle(price, sigma);
      candle.timestamp = timestamp;

      // Round all prices
      candle.open = roundPrice(candle.open, 2);
      candle.high = roundPrice(candle.high, 2);
      candle.low = roundPrice(candle.low, 2);
      candle.close = roundPrice(candle.close, 2);

      data.push(candle);
      price = candle.close;
    }

    currentPrices.set(symbol, price);
  } else {
    // Daily candles with mean reversion
    const sigma = isCrypto ? 0.02 : 0.012;
    let price = ticker.basePrice * (0.9 + Math.random() * 0.2);
    const msPerDay = 24 * 60 * 60 * 1000;
    const meanPrice = ticker.basePrice;
    const meanReversionStrength = 0.005;

    for (let i = days; i >= 0; i--) {
      const timestamp = now - i * msPerDay;
      // Mean reversion: pull price toward base price
      const reversion = meanReversionStrength * Math.log(meanPrice / price);
      const candle = generateCandle(price, sigma, 6);
      candle.timestamp = timestamp;

      // Apply mean reversion to close
      candle.close = candle.close * (1 + reversion);

      candle.open = roundPrice(candle.open, 2);
      candle.high = roundPrice(Math.max(candle.high, candle.close), 2);
      candle.low = roundPrice(Math.min(candle.low, candle.close), 2);
      candle.close = roundPrice(candle.close, 2);

      data.push(candle);
      price = candle.close;
    }

    currentPrices.set(symbol, price);
  }

  historyCache.set(cacheKey, data);
  return data;
}

function initializeAll(): void {
  initializePrices();
  for (const ticker of TICKERS) {
    generateHistoricalData(ticker.symbol, 30);
  }
}

initializeAll();
