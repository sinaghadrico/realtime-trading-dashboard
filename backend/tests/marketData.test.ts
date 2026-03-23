import {
  generatePriceMovement,
  getNextPrice,
  generateHistoricalData,
  getCurrentPrice,
  TICKERS,
} from '../src/services/marketData.js';

describe('marketData', () => {
  describe('TICKERS', () => {
    it('should have at least 5 tickers defined', () => {
      expect(TICKERS.length).toBeGreaterThanOrEqual(5);
    });

    it('should have unique symbols', () => {
      const symbols = TICKERS.map((t) => t.symbol);
      expect(new Set(symbols).size).toBe(symbols.length);
    });

    it('should have positive base prices', () => {
      for (const ticker of TICKERS) {
        expect(ticker.basePrice).toBeGreaterThan(0);
      }
    });
  });

  describe('generatePriceMovement', () => {
    it('should return a positive number', () => {
      const result = generatePriceMovement(100);
      expect(result).toBeGreaterThan(0);
    });

    it('should stay within reasonable range of input price', () => {
      const base = 100;
      const results = Array.from({ length: 1000 }, () =>
        generatePriceMovement(base, 0.002),
      );

      for (const price of results) {
        expect(price).toBeGreaterThan(base * 0.95);
        expect(price).toBeLessThan(base * 1.05);
      }
    });

    it('should produce different values (not deterministic)', () => {
      const results = new Set(
        Array.from({ length: 10 }, () => generatePriceMovement(100)),
      );
      expect(results.size).toBeGreaterThan(1);
    });

    it('should respect volatility parameter', () => {
      const lowVol = Array.from({ length: 100 }, () =>
        generatePriceMovement(100, 0.001),
      );
      const highVol = Array.from({ length: 100 }, () =>
        generatePriceMovement(100, 0.01),
      );

      const lowRange = Math.max(...lowVol) - Math.min(...lowVol);
      const highRange = Math.max(...highVol) - Math.min(...highVol);

      expect(highRange).toBeGreaterThan(lowRange);
    });
  });

  describe('getNextPrice', () => {
    it('should return a PriceUpdate for a valid symbol', () => {
      const update = getNextPrice('BTC-USD');

      expect(update).not.toBeNull();
      expect(update!.symbol).toBe('BTC-USD');
      expect(update!.price).toBeGreaterThan(0);
      expect(update!.timestamp).toBeGreaterThan(0);
      expect(typeof update!.change).toBe('number');
      expect(typeof update!.changePercent).toBe('number');
    });

    it('should return null for an invalid symbol', () => {
      const update = getNextPrice('INVALID');
      expect(update).toBeNull();
    });

    it('should produce changing prices on successive calls', () => {
      const prices = Array.from(
        { length: 10 },
        () => getNextPrice('ETH-USD')!.price,
      );
      const unique = new Set(prices);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('getCurrentPrice', () => {
    it('should return current price for valid symbol', () => {
      getNextPrice('BTC-USD');
      const price = getCurrentPrice('BTC-USD');
      expect(price).toBeGreaterThan(0);
    });

    it('should return null for invalid symbol', () => {
      const price = getCurrentPrice('INVALID');
      expect(price).toBeNull();
    });
  });

  describe('generateHistoricalData', () => {
    it('should return OHLC data for a valid symbol', () => {
      const data = generateHistoricalData('BTC-USD', 10);

      expect(data).not.toBeNull();
      expect(data!.length).toBe(11); // 10 days + today
    });

    it('should return null for an invalid symbol', () => {
      const data = generateHistoricalData('INVALID');
      expect(data).toBeNull();
    });

    it('should have valid OHLC values', () => {
      const data = generateHistoricalData('AAPL', 5)!;

      for (const candle of data) {
        expect(candle.high).toBeGreaterThanOrEqual(
          Math.max(candle.open, candle.close),
        );
        expect(candle.low).toBeLessThanOrEqual(
          Math.min(candle.open, candle.close),
        );
        expect(candle.volume).toBeGreaterThan(0);
        expect(candle.timestamp).toBeGreaterThan(0);
      }
    });

    it('should return timestamps in ascending order', () => {
      const data = generateHistoricalData('ETH-USD', 10)!;

      for (let i = 1; i < data.length; i++) {
        expect(data[i].timestamp).toBeGreaterThan(data[i - 1].timestamp);
      }
    });

    it('should return cached data on second call', () => {
      const first = generateHistoricalData('SOL-USD', 10);
      const second = generateHistoricalData('SOL-USD', 10);
      expect(first).toBe(second);
    });
  });
});
