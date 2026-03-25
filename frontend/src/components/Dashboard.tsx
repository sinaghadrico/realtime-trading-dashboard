import { useMemo, useCallback } from 'react';
import { useQueryState, parseAsString } from 'nuqs';
import { TickerList } from '@/components/TickerList';
import { TickerBar } from '@/components/TickerBar';
import { PriceChart } from '@/components/PriceChart';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Typography } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTickers } from '@/hooks/useTickers';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useTickerHistory } from '@/hooks/useTickerHistory';
import type { TimeRange } from '@/components/TimeRangeSelector';
import { toast } from 'sonner';
import { PriceAlertButton } from '@/components/PriceAlert';
import type { PriceUpdate, WSServerMessage } from '@/types';

const VALID_RANGES = ['1H', '24H', '1W', '1M', '1Y'] as const;

export function Dashboard() {
  const [timeRangeParam, setTimeRangeParam] = useQueryState(
    'range',
    parseAsString.withDefault('1M'),
  );
  const timeRange = (
    VALID_RANGES.includes(timeRangeParam as TimeRange) ? timeRangeParam : '1M'
  ) as TimeRange;
  const setTimeRange = useCallback(
    (range: TimeRange) => setTimeRangeParam(range),
    [setTimeRangeParam],
  );

  const isDesktop = useIsDesktop();

  const {
    tickers,
    selectedTicker,
    selectedSymbol,
    connectionStatus,
    isLoading: tickersLoading,
    setSelectedSymbol,
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

  const onStatusChange = useCallback(
    (status: Parameters<typeof handleStatusChange>[0]) => {
      handleStatusChange(status);
      if (status === 'disconnected') {
        toast.error('Connection lost. Reconnecting...');
      }
    },
    [handleStatusChange],
  );

  const onAlert = useCallback((message: WSServerMessage) => {
    if (message.type === 'alert_triggered') {
      toast.warning(
        `${message.alert.symbol} crossed ${message.alert.direction} $${message.alert.targetPrice.toLocaleString()} — Current: $${message.currentPrice.toLocaleString()}`,
      );
    }
  }, []);

  // Pass symbols list directly to WS hook
  const symbols = useMemo(() => tickers.map((t) => t.symbol), [tickers]);

  useWebSocket({
    symbols,
    onPriceUpdate,
    onStatusChange,
    onAlert,
  });

  const handleSelectTicker = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol);
      setTimeRange('1M');
    },
    [setSelectedSymbol, setTimeRange],
  );

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col md:flex-row">
      {isDesktop && (
        <aside className="w-72 shrink-0 overflow-y-auto border-r p-4">
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
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {!isDesktop && (
          <div className="mb-4">
            <TickerBar
              tickers={tickers}
              selectedSymbol={selectedSymbol}
              onSelect={handleSelectTicker}
            />
          </div>
        )}

        {selectedSymbol && selectedTicker ? (
          <>
            <div className="mb-2 flex justify-end">
              <PriceAlertButton
                symbol={selectedSymbol}
                currentPrice={selectedTicker.price}
              />
            </div>
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
          </>
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
