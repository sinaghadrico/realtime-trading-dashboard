import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryState, parseAsString } from 'nuqs';
import type { PriceUpdate, TickerWithLive } from '@/types';
import type { ConnectionStatus } from '@/hooks/useWebSocket';
import { fetchTickers } from '@/services/api';

export function useTickers() {
  const [livePrices, setLivePrices] = useState<Map<string, TickerWithLive>>(
    new Map(),
  );
  const [tickerParam, setTickerParam] = useQueryState('ticker', parseAsString);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');

  const { data: initialTickers = [], isLoading } = useQuery({
    queryKey: ['tickers'],
    queryFn: fetchTickers,
    staleTime: 60 * 1000,
  });

  const tickers: TickerWithLive[] = initialTickers.map((ticker) => {
    const live = livePrices.get(ticker.symbol);
    if (live) return live;
    return {
      ...ticker,
      change: 0,
      changePercent: 0,
      lastUpdate: 0,
    };
  });

  const activeSymbol = tickerParam ?? initialTickers[0]?.symbol ?? null;

  const selectedTicker = activeSymbol
    ? (tickers.find((t) => t.symbol === activeSymbol) ?? null)
    : null;

  const setSelectedSymbol = useCallback(
    (symbol: string) => setTickerParam(symbol),
    [setTickerParam],
  );

  const handlePriceUpdate = useCallback((data: PriceUpdate) => {
    setLivePrices((prev) => {
      const next = new Map(prev);
      const existing = prev.get(data.symbol);

      next.set(data.symbol, {
        symbol: data.symbol,
        name: existing?.name ?? data.symbol,
        price: data.price,
        decimals: existing?.decimals ?? 2,
        change: data.change,
        changePercent: data.changePercent,
        lastUpdate: data.timestamp,
      });
      return next;
    });
  }, []);

  const handleStatusChange = useCallback((status: ConnectionStatus) => {
    setConnectionStatus(status);
  }, []);

  return {
    tickers,
    selectedTicker,
    selectedSymbol: activeSymbol,
    connectionStatus,
    isLoading,
    setSelectedSymbol,
    handlePriceUpdate,
    handleStatusChange,
  };
}
