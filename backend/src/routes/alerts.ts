import { Router } from 'express';
import {
  createAlert,
  deleteAlert,
  getAlerts,
} from '../services/alertService.js';
import { TICKERS } from '../services/marketData.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(getAlerts());
});

router.post('/', (req, res) => {
  const { symbol, targetPrice, direction } = req.body as {
    symbol?: string;
    targetPrice?: number;
    direction?: string;
  };

  if (!symbol || !targetPrice || !direction) {
    res
      .status(400)
      .json({ error: 'symbol, targetPrice, and direction are required' });
    return;
  }

  if (direction !== 'above' && direction !== 'below') {
    res.status(400).json({ error: 'direction must be "above" or "below"' });
    return;
  }

  const ticker = TICKERS.find(
    (t) => t.symbol.toLowerCase() === symbol.toLowerCase(),
  );

  if (!ticker) {
    res.status(404).json({ error: `Ticker '${symbol}' not found` });
    return;
  }

  const alert = createAlert(ticker.symbol, targetPrice, direction);
  res.status(201).json(alert);
});

router.delete('/:id', (req, res) => {
  const deleted = deleteAlert(req.params.id);

  if (!deleted) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  res.json({ message: 'Alert deleted' });
});

export default router;
