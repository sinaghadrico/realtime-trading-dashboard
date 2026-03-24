import { memo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface TickerData {
  symbol: string;
  name: string;
  price: number;
  decimals: number;
  change: number;
  changePercent: number;
}

interface TickerBarProps {
  tickers: TickerData[];
  selectedSymbol: string | null;
  onSelect: (symbol: string) => void;
}

const TickerChip = memo(function TickerChip({
  symbol,
  price,
  decimals,
  changePercent,
  isSelected,
  onSelect,
}: {
  symbol: string;
  price: number;
  decimals: number;
  changePercent: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isPositive = changePercent >= 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-shrink-0 items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
        isSelected
          ? 'border-primary bg-accent'
          : 'border-transparent bg-muted/50 hover:bg-muted',
      )}
    >
      <Typography variant="small" className="font-semibold">
        {symbol}
      </Typography>
      <Typography variant="small" className="font-mono text-xs">
        {formatPrice(price, decimals)}
      </Typography>
      <span
        className={cn(
          'inline-flex items-center text-xs font-medium',
          isPositive ? 'text-green-500' : 'text-red-500',
        )}
      >
        {isPositive ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )}
        {changePercent.toFixed(2)}%
      </span>
    </button>
  );
});

export function TickerBar({
  tickers,
  selectedSymbol,
  onSelect,
}: TickerBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {tickers.map((ticker) => (
        <TickerChip
          key={ticker.symbol}
          symbol={ticker.symbol}
          price={ticker.price}
          decimals={ticker.decimals}
          changePercent={ticker.changePercent}
          isSelected={ticker.symbol === selectedSymbol}
          onSelect={() => onSelect(ticker.symbol)}
        />
      ))}
    </div>
  );
}
