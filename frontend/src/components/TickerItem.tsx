import { memo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface TickerItemProps {
  symbol: string;
  name: string;
  price: number;
  decimals: number;
  change: number;
  changePercent: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const TickerItem = memo(function TickerItem({
  symbol,
  name,
  price,
  decimals,
  change,
  changePercent,
  isSelected,
  onSelect,
}: TickerItemProps) {
  const isPositive = change >= 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors',
        'hover:bg-accent/50',
        isSelected && 'bg-accent',
      )}
    >
      <div className="min-w-0">
        <Typography variant="small" className="font-semibold">
          {symbol}
        </Typography>
        <Typography variant="muted" className="text-xs">
          {name}
        </Typography>
      </div>
      <div className="text-right">
        <Typography variant="small" className="block font-mono text-sm">
          {formatPrice(price, decimals)}
        </Typography>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-medium',
            isPositive ? 'text-green-500' : 'text-red-500',
          )}
        >
          {isPositive ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {changePercent >= 0 ? '+' : ''}
          {changePercent.toFixed(2)}%
        </span>
      </div>
    </button>
  );
});
