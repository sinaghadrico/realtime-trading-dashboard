import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { OHLC, PriceUpdate } from '@/types';
import type { TimeRange } from '@/components/TimeRangeSelector';
import { fetchTickerHistory } from '@/services/api';

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

function queryKey(symbol: string, range: TimeRange) {
  return ['tickerHistory', symbol, range] as const;
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
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKey(symbol ?? '', range),
    queryFn: async () => {
      if (!symbol) return [];

      const { days, intervalMinutes, filterHours } = RANGE_CONFIG[range];
      const result = await fetchTickerHistory(symbol, days, intervalMinutes);

      let filtered = result.data;
      if (filterHours) {
        const cutoff = Date.now() - filterHours * 60 * 60 * 1000;
        filtered = filtered.filter((d) => d.timestamp >= cutoff);
      }

      return filtered;
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateLivePrice = useCallback(
    (update: PriceUpdate) => {
      if (!symbol || update.symbol !== symbol) return;

      queryClient.setQueryData<OHLC[]>(queryKey(symbol, range), (prev) => {
        if (!prev || prev.length === 0) return prev;

        const next = [...prev];
        const last = { ...next[next.length - 1] };

        last.close = update.price;
        last.high = Math.max(last.high, update.price);
        last.low = Math.min(last.low, update.price);

        next[next.length - 1] = last;
        return next;
      });
    },
    [symbol, range, queryClient],
  );

  return {
    data: data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    updateLivePrice,
  };
}

// Pre-fetch history for a symbol (called on initial load)
export function prefetchTickerHistory(
  queryClient: ReturnType<typeof useQueryClient>,
  symbol: string,
  range: TimeRange = '1M',
) {
  const { days, intervalMinutes } = RANGE_CONFIG[range];
  return queryClient.prefetchQuery({
    queryKey: queryKey(symbol, range),
    queryFn: () =>
      fetchTickerHistory(symbol, days, intervalMinutes).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
