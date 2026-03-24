import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PriceUpdate, Ticker } from '@/types';
import type { ConnectionStatus } from '@/hooks/useWebSocket';
import { fetchTickers } from '@/services/api';

interface TickerWithLive extends Ticker {
  change: number;
  changePercent: number;
  lastUpdate: number;
}

export function useTickers() {
  const [livePrices, setLivePrices] = useState<Map<string, TickerWithLive>>(
    new Map(),
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');

  const { data: initialTickers = [], isLoading } = useQuery({
    queryKey: ['tickers'],
    queryFn: fetchTickers,
    staleTime: 60 * 1000,
  });

  // Merge initial tickers with live prices
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

  // Use first ticker as fallback if nothing selected
  const activeSymbol = selectedSymbol ?? initialTickers[0]?.symbol ?? null;

  const selectedTicker = activeSymbol
    ? (tickers.find((t) => t.symbol === activeSymbol) ?? null)
    : null;

  const handlePriceUpdate = useCallback((data: PriceUpdate) => {
    setLivePrices((prev) => {
      const existing = prev.get(data.symbol);
      if (!existing) return prev;

      const next = new Map(prev);
      next.set(data.symbol, {
        ...existing,
        price: data.price,
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

  const initTickers = useCallback((tickerList: Ticker[]) => {
    setLivePrices((prev) => {
      const next = new Map(prev);
      for (const ticker of tickerList) {
        if (!next.has(ticker.symbol)) {
          next.set(ticker.symbol, {
            ...ticker,
            change: 0,
            changePercent: 0,
            lastUpdate: Date.now(),
          });
        }
      }
      return next;
    });
  }, []);

  return {
    tickers,
    selectedTicker,
    selectedSymbol: activeSymbol,
    connectionStatus,
    isLoading,
    setSelectedSymbol,
    initTickers,
    handlePriceUpdate,
    handleStatusChange,
  };
}
