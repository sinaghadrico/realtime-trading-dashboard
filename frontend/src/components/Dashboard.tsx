import { useEffect, useMemo, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { TickerList } from '@/components/TickerList';
import { PriceChart } from '@/components/PriceChart';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Typography } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTickers } from '@/hooks/useTickers';
import {
  useTickerHistory,
  prefetchTickerHistory,
} from '@/hooks/useTickerHistory';
import type { TimeRange } from '@/components/TimeRangeSelector';
import type { PriceUpdate } from '@/types';

export function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const queryClient = useQueryClient();

  const {
    tickers,
    selectedTicker,
    selectedSymbol,
    connectionStatus,
    isLoading: tickersLoading,
    setSelectedSymbol,
    initTickers,
    handlePriceUpdate,
    handleStatusChange,
  } = useTickers();

  const {
    data: chartData,
    isLoading: chartLoading,
    error: chartError,
    updateLivePrice,
  } = useTickerHistory(selectedSymbol, timeRange);

  const onPriceUpdate = useCallback(
    (data: PriceUpdate) => {
      handlePriceUpdate(data);
      updateLivePrice(data);
    },
    [handlePriceUpdate, updateLivePrice],
  );

  const wsOptions = useMemo(
    () => ({
      onPriceUpdate,
      onStatusChange: handleStatusChange,
    }),
    [onPriceUpdate, handleStatusChange],
  );

  const { subscribe } = useWebSocket(wsOptions);

  const handleSelectTicker = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);
      setTimeRange('1M');
    },
    [setSelectedSymbol],
  );

  // Subscribe to WS and pre-fetch histories when tickers load
  useEffect(() => {
    if (tickers.length === 0) return;

    initTickers(tickers);
    tickers.forEach((ticker) => {
      subscribe(ticker.symbol);
      prefetchTickerHistory(queryClient, ticker.symbol, '1M');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickers.length > 0]);

  return (
    <div className="flex h-[calc(100vh-65px)]">
      <aside className="hidden w-72 flex-shrink-0 overflow-y-auto border-r p-4 md:block">
        <div className="mb-3 flex items-center justify-between">
          <Typography variant="h4">Tickers</Typography>
          <ConnectionStatus status={connectionStatus} />
        </div>
        <Separator className="mb-3" />
        <TickerList
          tickers={tickers}
          selectedSymbol={selectedSymbol}
          onSelect={handleSelectTicker}
          isLoading={tickersLoading}
        />
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {selectedSymbol && selectedTicker ? (
          <PriceChart
            data={chartData}
            symbol={selectedSymbol}
            name={selectedTicker.name}
            decimals={selectedTicker.decimals}
            currentPrice={selectedTicker.price}
            changePercent={selectedTicker.changePercent}
            isLoading={chartLoading}
            error={chartError}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Typography variant="muted">
              Select a ticker to view chart
            </Typography>
          </div>
        )}
      </main>
    </div>
  );
}
