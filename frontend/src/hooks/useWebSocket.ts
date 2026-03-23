import { useEffect, useRef, useCallback } from 'react';
import type { WSServerMessage, WSClientMessage, PriceUpdate } from '@/types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3075';
const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface UseWebSocketReturn {
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
}

interface UseWebSocketOptions {
  onPriceUpdate?: (data: PriceUpdate) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onAlert?: (alert: WSServerMessage) => void;
}

export function useWebSocket(
  options: UseWebSocketOptions = {},
): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscriptionsRef = useRef(new Set<string>());
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const send = useCallback((message: WSClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const subscribe = useCallback(
    (symbol: string) => {
      subscriptionsRef.current.add(symbol);
      send({ type: 'subscribe', symbol });
    },
    [send],
  );

  const unsubscribe = useCallback(
    (symbol: string) => {
      subscriptionsRef.current.delete(symbol);
      send({ type: 'unsubscribe', symbol });
    },
    [send],
  );

  useEffect(() => {
    let disposed = false;

    function connect() {
      if (disposed) return;

      optionsRef.current.onStatusChange?.('connecting');
      const ws = new WebSocket(`${WS_URL}/ws`);

      ws.onopen = () => {
        if (disposed) {
          ws.close(1000);
          return;
        }
        optionsRef.current.onStatusChange?.('connected');
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;

        Array.from(subscriptionsRef.current).forEach((symbol) => {
          ws.send(JSON.stringify({ type: 'subscribe', symbol }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string) as WSServerMessage;

          if (message.type === 'price_update') {
            optionsRef.current.onPriceUpdate?.(message.data);
          } else if (message.type === 'alert_triggered') {
            optionsRef.current.onAlert?.(message);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = (event) => {
        optionsRef.current.onStatusChange?.('disconnected');
        wsRef.current = null;

        if (!disposed && event.code !== 1000) {
          const delay = reconnectDelayRef.current;
          reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
          reconnectTimerRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, []);

  return { subscribe, unsubscribe };
}
