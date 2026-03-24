import { useEffect, useMemo, useCallback, useState } from 'react';
import { TickerList } from '@/components/TickerList';
import { PriceChart } from '@/components/PriceChart';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Typography } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTickers } from '@/hooks/useTickers';
import { useTickerHistory, historyCache } from '@/hooks/useTickerHistory';
import { fetchTickers, fetchTickerHistory } from '@/services/api';
import type { TimeRange } from '@/components/TimeRangeSelector';
import type { PriceUpdate } from '@/types';

export function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');

  const {
    tickers,
    selectedTicker,
    selectedSymbol,
    connectionStatus,
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

  const { subscribe, unsubscribe } = useWebSocket(wsOptions);

  const handleSelectTicker = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);
      setTimeRange('1M');
    },
    [setSelectedSymbol],
  );

  useEffect(() => {
    fetchTickers().then((data) => {
      initTickers(data);
      data.forEach((ticker) => subscribe(ticker.symbol));

      // Pre-fetch default (1M) histories for all tickers
      data.forEach((ticker) => {
        const cacheKey = `${ticker.symbol}_1M_30d_120m`;
        if (!historyCache.has(cacheKey)) {
          fetchTickerHistory(ticker.symbol, 30, 120).then((result) => {
            historyCache.set(cacheKey, result.data);
          });
        }
      });
    });

    return () => {
      tickers.forEach((ticker) => unsubscribe(ticker.symbol));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          isLoading={tickers.length === 0}
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
