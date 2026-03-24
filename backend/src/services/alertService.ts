import type { PriceAlert } from '../types/index.js';

const alerts = new Map<string, PriceAlert>();
let idCounter = 0;

export function createAlert(
  symbol: string,
  targetPrice: number,
  direction: 'above' | 'below',
): PriceAlert {
  const id = `alert_${++idCounter}`;
  const alert: PriceAlert = {
    id,
    symbol,
    targetPrice,
    direction,
    createdAt: Date.now(),
  };
  alerts.set(id, alert);
  return alert;
}

export function deleteAlert(id: string): boolean {
  return alerts.delete(id);
}

export function getAlerts(): PriceAlert[] {
  return Array.from(alerts.values());
}

export function getAlertsBySymbol(symbol: string): PriceAlert[] {
  return Array.from(alerts.values()).filter((a) => a.symbol === symbol);
}

export function checkAlerts(
  symbol: string,
  currentPrice: number,
): PriceAlert[] {
  const triggered: PriceAlert[] = [];

  for (const alert of alerts.values()) {
    if (alert.symbol !== symbol) continue;

    const isTriggered =
      (alert.direction === 'above' && currentPrice >= alert.targetPrice) ||
      (alert.direction === 'below' && currentPrice <= alert.targetPrice);

    if (isTriggered) {
      triggered.push(alert);
      alerts.delete(alert.id);
    }
  }

  return triggered;
}
