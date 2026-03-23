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

router.get('/:symbol/history', (req, res) => {
  const { symbol } = req.params;
  const days = Math.min(Number(req.query.days) || 30, 365);

  const ticker = TICKERS.find(
    (t) => t.symbol.toLowerCase() === symbol.toLowerCase(),
  );

  if (!ticker) {
    res.status(404).json({ error: `Ticker '${symbol}' not found` });
    return;
  }

  const history = generateHistoricalData(ticker.symbol, days);
  res.json({
    symbol: ticker.symbol,
    name: ticker.name,
    days,
    data: history,
  });
});

export default router;
