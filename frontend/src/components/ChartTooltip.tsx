import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { formatTime, formatPrice } from '@/lib/formatters';
import type { OHLC } from '@/types';

const TOOLTIP_FIELDS: Array<{
  key: keyof OHLC;
  label: string;
  bold?: boolean;
}> = [
  { key: 'open', label: 'Open' },
  { key: 'high', label: 'High' },
  { key: 'low', label: 'Low' },
  { key: 'close', label: 'Close', bold: true },
];

export function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: OHLC }>;
}) {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;
  return (
    <Card className="p-3">
      <Typography variant="muted" className="mb-1 text-xs">
        {formatTime(data.timestamp)}
      </Typography>
      <div className="space-y-0.5 text-xs">
        {TOOLTIP_FIELDS.map(({ key, label, bold }) => (
          <div key={key} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className={`font-mono ${bold ? 'font-semibold' : ''}`}>
              {formatPrice(data[key] as number, 2, 4)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
