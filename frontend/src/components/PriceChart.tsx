import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import { ChartTooltip } from '@/components/ChartTooltip';
import {
  TimeRangeSelector,
  type TimeRange,
} from '@/components/TimeRangeSelector';
import {
  formatPrice,
  formatYAxis,
  createChartXFormatter,
  computeChartTicks,
} from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { OHLC } from '@/types';

interface PriceChartProps {
  data: OHLC[];
  symbol: string;
  name?: string;
  decimals?: number;
  currentPrice?: number;
  changePercent?: number;
  isLoading: boolean;
  error: string | null;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function PriceChart({
  data,
  symbol,
  name,
  decimals = 2,
  currentPrice,
  changePercent = 0,
  isLoading,
  error,
  timeRange,
  onTimeRangeChange,
}: PriceChartProps) {
  const isPositive = useMemo(() => {
    if (data.length < 2) return changePercent >= 0;
    return data[data.length - 1].close >= data[0].open;
  }, [data, changePercent]);

  const chartColor = isPositive ? '#22c55e' : '#ef4444';

  const xAxisFormatter = useMemo(
    () => (data.length > 0 ? createChartXFormatter(data) : undefined),
    [data],
  );

  const xTicks = useMemo(
    () => (data.length > 0 ? computeChartTicks(data, 6) : undefined),
    [data],
  );

  const yDomain = useMemo(() => {
    if (data.length === 0) return ['auto', 'auto'] as const;
    const prices = data.map((d) => d.close);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.05;
    return [min - padding, max + padding] as [number, number];
  }, [data]);

  return (
    <div>
      {/* Header: Symbol + Price + Change */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Typography variant="h3">{symbol}</Typography>
          {name && (
            <Typography variant="muted" className="text-sm">
              {name}
            </Typography>
          )}
        </div>
        {currentPrice !== undefined && (
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight">
              {formatPrice(currentPrice, decimals)}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 text-sm font-medium',
                isPositive ? 'text-green-500' : 'text-red-500',
              )}
            >
              {isPositive ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              {changePercent >= 0 ? '+' : ''}
              {changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      {isLoading ? (
        <Skeleton className="h-[400px] w-full rounded-lg" />
      ) : error ? (
        <Card className="flex h-[400px] items-center justify-center">
          <Typography variant="muted" className="text-destructive">
            Failed to load chart: {error}
          </Typography>
        </Card>
      ) : data.length === 0 ? (
        <Card className="flex h-[400px] items-center justify-center">
          <Typography variant="muted">No data available</Typography>
        </Card>
      ) : (
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                  <stop
                    offset="100%"
                    stopColor={chartColor}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.2}
                horizontal
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={xAxisFormatter}
                ticks={xTicks}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                domain={yDomain}
                tickFormatter={formatYAxis}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                orientation="right"
                width={80}
                dx={5}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  stroke: '#94a3b8',
                  strokeDasharray: '4 4',
                  opacity: 0.5,
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={chartColor}
                strokeWidth={1.5}
                fill="url(#priceGradient)"
                animationDuration={300}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: chartColor,
                  stroke: 'var(--background)',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Time Range Selector */}
      <div className="mt-4 flex justify-center">
        <TimeRangeSelector selected={timeRange} onSelect={onTimeRangeChange} />
      </div>
    </div>
  );
}
