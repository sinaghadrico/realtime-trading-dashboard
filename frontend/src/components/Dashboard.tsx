import { useEffect, useMemo } from 'react';
import { TickerList } from '@/components/TickerList';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Typography } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTickers } from '@/hooks/useTickers';
import { fetchTickers } from '@/services/api';

export function Dashboard() {
  const {
    tickers,
    selectedSymbol,
    connectionStatus,
    setSelectedSymbol,
    initTickers,
    handlePriceUpdate,
    handleStatusChange,
  } = useTickers();

  const wsOptions = useMemo(
    () => ({
      onPriceUpdate: handlePriceUpdate,
      onStatusChange: handleStatusChange,
    }),
    [handlePriceUpdate, handleStatusChange],
  );

  const { subscribe, unsubscribe } = useWebSocket(wsOptions);

  useEffect(() => {
    fetchTickers().then((data) => {
      initTickers(data);
      data.forEach((ticker) => subscribe(ticker.symbol));
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
          onSelect={setSelectedSymbol}
          isLoading={tickers.length === 0}
        />
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Typography variant="muted">
          {selectedSymbol
            ? `Chart for ${selectedSymbol} coming soon...`
            : 'Select a ticker'}
        </Typography>
      </main>
    </div>
  );
}
