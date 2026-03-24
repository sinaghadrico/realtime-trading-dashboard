import { TickerItem } from '@/components/TickerItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import type { TickerWithLive } from '@/types';

interface TickerListProps {
  tickers: TickerWithLive[];
  selectedSymbol: string | null;
  onSelect: (symbol: string) => void;
  isLoading?: boolean;
}

export function TickerList({
  tickers,
  selectedSymbol,
  onSelect,
  isLoading = false,
}: TickerListProps) {
  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (tickers.length === 0) {
    return (
      <Typography variant="muted" className="p-4 text-center">
        No tickers available
      </Typography>
    );
  }

  return (
    <div className="space-y-0.5">
      {tickers.map((ticker) => (
        <TickerItem
          key={ticker.symbol}
          symbol={ticker.symbol}
          name={ticker.name}
          price={ticker.price}
          decimals={ticker.decimals}
          change={ticker.change}
          changePercent={ticker.changePercent}
          isSelected={ticker.symbol === selectedSymbol}
          onSelect={() => onSelect(ticker.symbol)}
        />
      ))}
    </div>
  );
}
