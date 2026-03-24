export function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function formatPrice(
  price: number,
  decimals: number = 2,
  maxDecimals: number = 4,
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Math.min(decimals, 2),
    maximumFractionDigits: Math.min(decimals, maxDecimals),
  }).format(price);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatYAxis(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 1000 ? 0 : 2,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
    notation: value >= 100000 ? 'compact' : 'standard',
  }).format(value);
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp));
}

// Compute explicit tick positions to avoid duplicate labels
export function computeChartTicks(
  data: Array<{ timestamp: number }>,
  tickCount = 6,
): number[] {
  if (data.length < 2) return data.map((d) => d.timestamp);

  const ticks: number[] = [];
  const step = Math.max(1, Math.floor(data.length / tickCount));

  for (let i = 0; i < data.length; i += step) {
    ticks.push(data[i].timestamp);
  }

  // Always include last point
  const lastTs = data[data.length - 1].timestamp;
  if (ticks[ticks.length - 1] !== lastTs) {
    ticks.push(lastTs);
  }

  return ticks;
}

export function createChartXFormatter(data: Array<{ timestamp: number }>) {
  if (data.length < 2) return formatDate;

  const timeSpan = data[data.length - 1].timestamp - data[0].timestamp;
  const oneHourMs = 60 * 60 * 1000;
  const oneDayMs = 24 * oneHourMs;

  // 1H: "10:45 AM"
  if (timeSpan <= 2 * oneHourMs) {
    return (timestamp: number) =>
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(timestamp));
  }

  // 24H: "2 AM", "6 PM"
  if (timeSpan <= 2 * oneDayMs) {
    return (timestamp: number) =>
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
      }).format(new Date(timestamp));
  }

  // 1W: "Mon", "Tue", "Wed"
  if (timeSpan <= 10 * oneDayMs) {
    return (timestamp: number) =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
      }).format(new Date(timestamp));
  }

  // 1M: "Mar 5", "Mar 12"
  if (timeSpan <= 60 * oneDayMs) {
    return formatDate;
  }

  // 1Y: "Apr", "May", "Jun"
  return (timestamp: number) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
    }).format(new Date(timestamp));
}
