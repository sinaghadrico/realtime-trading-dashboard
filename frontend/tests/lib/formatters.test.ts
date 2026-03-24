import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatYAxis,
  formatTime,
  computeChartTicks,
} from '@/lib/formatters';

describe('formatPrice', () => {
  it('formats with default 2 decimals', () => {
    expect(formatPrice(1234.56)).toBe('$1,234.56');
  });

  it('formats with custom decimals', () => {
    expect(formatPrice(178.3, 2, 2)).toBe('$178.30');
  });

  it('handles large crypto prices', () => {
    const result = formatPrice(64500.1234, 8, 4);
    expect(result).toContain('$64,500');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });
});

describe('formatYAxis', () => {
  it('formats large numbers without decimals', () => {
    const result = formatYAxis(64500);
    expect(result).toBe('$64,500');
  });

  it('formats small numbers with decimals', () => {
    const result = formatYAxis(142.55);
    expect(result).toBe('$142.55');
  });

  it('uses compact notation for very large numbers', () => {
    const result = formatYAxis(150000);
    expect(result).toContain('K');
  });
});

describe('formatTime', () => {
  it('formats timestamp to readable date', () => {
    const ts = new Date('2026-03-24T10:30:00').getTime();
    const result = formatTime(ts);
    expect(result).toContain('Mar');
    expect(result).toContain('24');
  });
});

describe('computeChartTicks', () => {
  it('returns correct number of ticks', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      timestamp: 1000 + i * 1000,
    }));

    const ticks = computeChartTicks(data, 6);
    expect(ticks.length).toBeLessThanOrEqual(8);
    expect(ticks.length).toBeGreaterThanOrEqual(6);
  });

  it('always includes last timestamp', () => {
    const data = [
      { timestamp: 1000 },
      { timestamp: 2000 },
      { timestamp: 3000 },
    ];

    const ticks = computeChartTicks(data, 2);
    expect(ticks[ticks.length - 1]).toBe(3000);
  });

  it('handles single data point', () => {
    const data = [{ timestamp: 1000 }];
    const ticks = computeChartTicks(data, 6);
    expect(ticks).toEqual([1000]);
  });
});
