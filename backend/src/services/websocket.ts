import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { WSClientMessage, WSServerMessage } from '../types/index.js';
import { TICKERS, getNextPrice } from './marketData.js';

const BROADCAST_INTERVAL = 1000;

interface ClientState {
  subscriptions: Set<string>;
  isAlive: boolean;
}

const clients = new Map<WebSocket, ClientState>();
let broadcastTimer: ReturnType<typeof setInterval> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

function send(ws: WebSocket, message: WSServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function handleMessage(ws: WebSocket, raw: string): void {
  const state = clients.get(ws);
  if (!state) return;

  let message: WSClientMessage;
  try {
    message = JSON.parse(raw) as WSClientMessage;
  } catch {
    send(ws, { type: 'error', message: 'Invalid JSON' });
    return;
  }

  if (!message.type || !message.symbol) {
    send(ws, { type: 'error', message: 'Missing type or symbol' });
    return;
  }

  const validSymbol = TICKERS.some(
    (t) => t.symbol.toLowerCase() === message.symbol.toLowerCase(),
  );

  if (!validSymbol) {
    send(ws, {
      type: 'error',
      message: `Unknown symbol: ${message.symbol}`,
    });
    return;
  }

  const symbol = TICKERS.find(
    (t) => t.symbol.toLowerCase() === message.symbol.toLowerCase(),
  )!.symbol;

  switch (message.type) {
    case 'subscribe':
      state.subscriptions.add(symbol);
      send(ws, { type: 'subscribed', symbol });
      break;

    case 'unsubscribe':
      state.subscriptions.delete(symbol);
      send(ws, { type: 'unsubscribed', symbol });
      break;

    default:
      send(ws, { type: 'error', message: `Unknown message type` });
  }
}

function broadcastPrices(): void {
  const activeSymbols = new Set<string>();

  for (const [, state] of clients) {
    for (const symbol of state.subscriptions) {
      activeSymbols.add(symbol);
    }
  }

  for (const symbol of activeSymbols) {
    const priceUpdate = getNextPrice(symbol);
    if (!priceUpdate) continue;

    const message: WSServerMessage = {
      type: 'price_update',
      data: priceUpdate,
    };

    for (const [ws, state] of clients) {
      if (state.subscriptions.has(symbol)) {
        send(ws, message);
      }
    }
  }
}

function startHeartbeat(wss: WebSocketServer): void {
  heartbeatTimer = setInterval(() => {
    for (const [ws, state] of clients) {
      if (!state.isAlive) {
        ws.terminate();
        clients.delete(ws);
        continue;
      }
      state.isAlive = false;
      ws.ping();
    }
  }, 30000);

  wss.on('close', () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  });
}

export function setupWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    clients.set(ws, {
      subscriptions: new Set(),
      isAlive: true,
    });

    ws.on('pong', () => {
      const state = clients.get(ws);
      if (state) state.isAlive = true;
    });

    ws.on('message', (data) => {
      handleMessage(ws, data.toString());
    });

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  broadcastTimer = setInterval(broadcastPrices, BROADCAST_INTERVAL);

  wss.on('close', () => {
    if (broadcastTimer) clearInterval(broadcastTimer);
  });

  startHeartbeat(wss);

  return wss;
}
