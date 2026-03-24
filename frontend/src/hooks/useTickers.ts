import { useState, useCallback } from 'react';
import type { PriceUpdate, Ticker } from '@/types';
import type { ConnectionStatus } from '@/hooks/useWebSocket';

interface TickerWithLive extends Ticker {
  change: number;
  changePercent: number;
  lastUpdate: number;
}

export function useTickers() {
  const [tickers, setTickers] = useState<Map<string, TickerWithLive>>(
    new Map(),
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');

  const initTickers = useCallback((tickerList: Ticker[]) => {
    setTickers((prev) => {
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

    setSelectedSymbol((prev) => {
      if (prev) return prev;
      return tickerList[0]?.symbol ?? null;
    });
  }, []);

  const handlePriceUpdate = useCallback((data: PriceUpdate) => {
    setTickers((prev) => {
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

  const tickerList = Array.from(tickers.values());
  const selectedTicker = selectedSymbol
    ? (tickers.get(selectedSymbol) ?? null)
    : null;

  return {
    tickers: tickerList,
    selectedTicker,
    selectedSymbol,
    connectionStatus,
    setSelectedSymbol,
    initTickers,
    handlePriceUpdate,
    handleStatusChange,
  };
}
