import { useState, useEffect, useRef, useCallback } from 'react';
import type { OHLC, PriceUpdate } from '@/types';
import type { TimeRange } from '@/components/TimeRangeSelector';
import { fetchTickerHistory } from '@/services/api';

export const historyCache = new Map<string, OHLC[]>();

interface RangeConfig {
  days: number;
  intervalMinutes: number;
  filterHours?: number;
}

const RANGE_CONFIG: Record<TimeRange, RangeConfig> = {
  '1H': { days: 1, intervalMinutes: 1, filterHours: 1 },
  '24H': { days: 1, intervalMinutes: 5 },
  '1W': { days: 7, intervalMinutes: 30 },
  '1M': { days: 30, intervalMinutes: 120 },
  '1Y': { days: 365, intervalMinutes: 0 },
};

function getCacheKey(symbol: string, range: TimeRange): string {
  const { days, intervalMinutes } = RANGE_CONFIG[range];
  return `${symbol}_${range}_${days}d_${intervalMinutes}m`;
}

interface UseTickerHistoryReturn {
  data: OHLC[];
  isLoading: boolean;
  error: string | null;
  updateLivePrice: (update: PriceUpdate) => void;
}

export function useTickerHistory(
  symbol: string | null,
  range: TimeRange = '1M',
): UseTickerHistoryReturn {
  const [data, setData] = useState<OHLC[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!symbol) {
      queueMicrotask(() => setData([]));
      return;
    }

    const cacheKey = getCacheKey(symbol, range);
    const cached = historyCache.get(cacheKey);

    if (cached) {
      queueMicrotask(() => {
        setData(cached);
        setIsLoading(false);
      });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    fetchTickerHistory(
      symbol,
      RANGE_CONFIG[range].days,
      RANGE_CONFIG[range].intervalMinutes,
    )
      .then((result) => {
        if (controller.signal.aborted) return;

        let filtered = result.data;
        const { filterHours } = RANGE_CONFIG[range];
        if (filterHours) {
          const cutoff = Date.now() - filterHours * 60 * 60 * 1000;
          filtered = filtered.filter((d) => d.timestamp >= cutoff);
        }

        historyCache.set(cacheKey, filtered);
        setData(filtered);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        if (controller.signal.aborted) return;
        setError(err.message);
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [symbol, range]);

  const updateLivePrice = useCallback(
    (update: PriceUpdate) => {
      if (update.symbol !== symbol) return;

      setData((prev) => {
        if (prev.length === 0) return prev;

        const next = [...prev];
        const last = { ...next[next.length - 1] };

        last.close = update.price;
        last.high = Math.max(last.high, update.price);
        last.low = Math.min(last.low, update.price);

        next[next.length - 1] = last;
        return next;
      });
    },
    [symbol],
  );

  return { data, isLoading, error, updateLivePrice };
}
