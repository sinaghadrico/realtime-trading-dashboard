import { Router } from 'express';
import { TICKERS, getCurrentPrice } from '../services/marketData.js';

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

export default router;
