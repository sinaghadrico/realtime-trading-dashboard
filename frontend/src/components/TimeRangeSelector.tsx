import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type TimeRange = '1H' | '24H' | '1W' | '1M' | '1Y';

const RANGES: TimeRange[] = ['1H', '24H', '1W', '1M', '1Y'];

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
}

export function TimeRangeSelector({
  selected,
  onSelect,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {RANGES.map((range) => (
        <Button
          key={range}
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 px-3 text-xs font-medium',
            selected === range &&
              'bg-background text-foreground shadow-sm hover:bg-background',
          )}
          onClick={() => onSelect(range)}
        >
          {range}
        </Button>
      ))}
    </div>
  );
}
