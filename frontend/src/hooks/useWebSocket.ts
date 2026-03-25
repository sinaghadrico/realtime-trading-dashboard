import { useEffect, useRef, useCallback } from 'react';
import type { WSServerMessage, PriceUpdate } from '@/types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3075';
const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface UseWebSocketOptions {
  symbols: string[];
  onPriceUpdate?: (data: PriceUpdate) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onAlert?: (alert: WSServerMessage) => void;
}

export function useWebSocket({
  symbols,
  onPriceUpdate,
  onStatusChange,
  onAlert,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disposedRef = useRef(false);
  const callbacksRef = useRef({ onPriceUpdate, onStatusChange, onAlert });
  const symbolsRef = useRef(symbols);

  useEffect(() => {
    callbacksRef.current = { onPriceUpdate, onStatusChange, onAlert };
  }, [onPriceUpdate, onStatusChange, onAlert]);

  useEffect(() => {
    symbolsRef.current = symbols;

    // Re-subscribe if WS is already open
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && symbols.length > 0) {
      symbols.forEach((symbol) => {
        ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    }
  }, [symbols]);

  const connect = useCallback(() => {
    if (disposedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    callbacksRef.current.onStatusChange?.('connecting');
    const ws = new WebSocket(`${WS_URL}/ws`);

    ws.onopen = () => {
      if (disposedRef.current) {
        ws.close(1000);
        return;
      }
      callbacksRef.current.onStatusChange?.('connected');
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;

      symbolsRef.current.forEach((symbol) => {
        ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as WSServerMessage;

        if (message.type === 'price_update') {
          callbacksRef.current.onPriceUpdate?.(message.data);
        } else if (message.type === 'alert_triggered') {
          callbacksRef.current.onAlert?.(message);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = (event) => {
      wsRef.current = null;
      callbacksRef.current.onStatusChange?.('disconnected');

      // Only reconnect on unexpected close
      if (!disposedRef.current && event.code !== 1000) {
        const delay = reconnectDelayRef.current;
        reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
        reconnectTimerRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      // onclose will fire after onerror
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    disposedRef.current = false;
    connect();

    return () => {
      disposedRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
    };
  }, [connect]);
}
