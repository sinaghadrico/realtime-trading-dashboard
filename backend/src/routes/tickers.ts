import { Router } from 'express';
import {
  TICKERS,
  getCurrentPrice,
  generateHistoricalData,
} from '../services/marketData.js';

const router = Router();

router.get('/', (_req, res) => {
  const tickers = TICKERS.map((ticker) => {
    const currentPrice = getCurrentPrice(ticker.symbol);
    return {
      symbol: ticker.symbol,
      name: ticker.name,
      price: currentPrice ?? ticker.basePrice,
      decimals: ticker.decimals,
    };
  });

  res.json(tickers);
});

// Pre-serialized cache for history responses
const responseCache = new Map<string, string>();

router.get('/:symbol/history', (req, res) => {
  const { symbol } = req.params;
  const days = Math.min(Number(req.query.days) || 30, 365);
  const interval = Number(req.query.interval) || 0;

  const ticker = TICKERS.find(
    (t) => t.symbol.toLowerCase() === symbol.toLowerCase(),
  );

  if (!ticker) {
    res.status(404).json({ error: `Ticker '${symbol}' not found` });
    return;
  }

  // Check pre-serialized response cache
  const cacheKey = `${ticker.symbol}_${days}_${interval}`;
  const cached = responseCache.get(cacheKey);

  if (cached) {
    res.set('Cache-Control', 'public, max-age=300');
    res.set('Content-Type', 'application/json');
    res.send(cached);
    return;
  }

  const history = generateHistoricalData(ticker.symbol, days, interval);
  const body = JSON.stringify({
    symbol: ticker.symbol,
    name: ticker.name,
    days,
    interval,
    data: history,
  });

  // Cache the serialized response
  responseCache.set(cacheKey, body);

  res.set('Cache-Control', 'public, max-age=300');
  res.set('Content-Type', 'application/json');
  res.send(body);
});

export default router;
