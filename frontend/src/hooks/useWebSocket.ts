import { useEffect, useRef } from 'react';
import type { WSServerMessage, PriceUpdate } from '@/types';

import { WS_URL } from '@/lib/constants';
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
  const callbacksRef = useRef({ onPriceUpdate, onStatusChange, onAlert });
  const symbolsRef = useRef(symbols);

  useEffect(() => {
    callbacksRef.current = { onPriceUpdate, onStatusChange, onAlert };
  }, [onPriceUpdate, onStatusChange, onAlert]);

  useEffect(() => {
    symbolsRef.current = symbols;
  }, [symbols]);

  // Single effect: connect + subscribe whenever symbols change
  useEffect(() => {
    if (symbols.length === 0) return;

    let disposed = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = INITIAL_RECONNECT_DELAY;

    function connect() {
      if (disposed) return;

      callbacksRef.current.onStatusChange?.('connecting');
      ws = new WebSocket(`${WS_URL}/ws`);

      ws.onopen = () => {
        if (disposed) {
          ws?.close(1000);
          return;
        }
        callbacksRef.current.onStatusChange?.('connected');
        reconnectDelay = INITIAL_RECONNECT_DELAY;

        symbolsRef.current.forEach((symbol) => {
          ws?.send(JSON.stringify({ type: 'subscribe', symbol }));
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
        ws = null;
        if (disposed) return;
        callbacksRef.current.onStatusChange?.('disconnected');

        if (event.code !== 1000) {
          reconnectTimer = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = () => {
        // onclose will fire after onerror
      };
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.close(1000);
        ws = null;
      }
    };
  }, [symbols.length]);
}
