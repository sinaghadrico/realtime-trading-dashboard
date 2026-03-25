import request from 'supertest';
import app from '../src/index.js';

describe('Ticker API', () => {
  let authCookie: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@trading.com',
      password: 'password123',
    });
    const cookies = res.headers['set-cookie'] as unknown as string[];
    authCookie = cookies[0];
  });

  describe('GET /api/health', () => {
    it('should return ok status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/tickers', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/tickers');
      expect(res.status).toBe(401);
    });

    it('should return a list of tickers', async () => {
      const res = await request(app)
        .get('/api/tickers')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should have required fields on each ticker', async () => {
      const res = await request(app)
        .get('/api/tickers')
        .set('Cookie', authCookie);

      for (const ticker of res.body) {
        expect(ticker).toHaveProperty('symbol');
        expect(ticker).toHaveProperty('name');
        expect(ticker).toHaveProperty('price');
        expect(ticker).toHaveProperty('decimals');
        expect(typeof ticker.price).toBe('number');
        expect(ticker.price).toBeGreaterThan(0);
      }
    });

    it('should include BTC-USD', async () => {
      const res = await request(app)
        .get('/api/tickers')
        .set('Cookie', authCookie);

      const btc = res.body.find(
        (t: { symbol: string }) => t.symbol === 'BTC-USD',
      );
      expect(btc).toBeDefined();
      expect(btc.name).toBe('Bitcoin');
    });
  });

  describe('GET /api/tickers/:symbol/history', () => {
    it('should return historical data for a valid symbol', async () => {
      const res = await request(app)
        .get('/api/tickers/BTC-USD/history')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.symbol).toBe('BTC-USD');
      expect(res.body.days).toBe(30);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should support custom days parameter', async () => {
      const res = await request(app)
        .get('/api/tickers/ETH-USD/history?days=7')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.days).toBe(7);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should cap days at 365', async () => {
      const res = await request(app)
        .get('/api/tickers/AAPL/history?days=1000')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.days).toBe(365);
    });

    it('should be case-insensitive for symbol', async () => {
      const res = await request(app)
        .get('/api/tickers/btc-usd/history')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.symbol).toBe('BTC-USD');
    });

    it('should return 404 for invalid symbol', async () => {
      const res = await request(app)
        .get('/api/tickers/INVALID/history')
        .set('Cookie', authCookie);

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('not found');
    });

    it('should have valid OHLC structure', async () => {
      const res = await request(app)
        .get('/api/tickers/TSLA/history?days=3')
        .set('Cookie', authCookie);

      for (const candle of res.body.data) {
        expect(candle).toHaveProperty('timestamp');
        expect(candle).toHaveProperty('open');
        expect(candle).toHaveProperty('high');
        expect(candle).toHaveProperty('low');
        expect(candle).toHaveProperty('close');
        expect(candle).toHaveProperty('volume');
      }
    });
  });
});
