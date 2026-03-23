# Real-Time Trading Dashboard

A real-time cryptocurrency and stock trading dashboard with live price streaming, interactive charts, and price alerts. Built with React, TypeScript, Node.js, WebSocket, Recharts, and shadcn/ui.

## Tech Stack

| Layer              | Technology                   | Version                |
| ------------------ | ---------------------------- | ---------------------- |
| Backend Runtime    | Node.js + Express            | Node 22 LTS, Express 5 |
| WebSocket          | ws                           | 8.x                    |
| Backend Testing    | Jest + supertest             | Jest 30, supertest 7   |
| Frontend Framework | React + TypeScript           | React 19, TS 5.7       |
| Build Tool         | Vite                         | 6.x                    |
| UI Components      | shadcn/ui + Radix UI         | latest                 |
| Charting           | Recharts                     | 2.x                    |
| State/Cache        | TanStack Query (React Query) | v5                     |
| Styling            | Tailwind CSS                 | v4                     |
| Containerization   | Docker + docker-compose      | latest                 |

## Getting Started

### Prerequisites

- Node.js >= 22
- npm >= 10

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3075`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5178`

### Running Tests

```bash
cd backend
npm test
```

## Project Structure

```
├── backend/           # Node.js + Express + WebSocket server
│   ├── src/
│   │   ├── routes/    # REST API endpoints
│   │   ├── services/  # Market data generator, WebSocket logic
│   │   └── types/     # Shared TypeScript types
│   └── tests/         # Jest + supertest tests
├── frontend/          # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── components/  # UI and feature components
│   │   ├── hooks/       # Custom hooks (WebSocket, data fetching)
│   │   ├── services/    # API service layer
│   │   ├── providers/   # Theme, Auth, Query providers
│   │   └── types/       # Frontend TypeScript types
│   └── tests/           # Vitest + RTL tests
└── k8s/               # Kubernetes manifests
```

## API Reference

### REST Endpoints

| Method | Endpoint                     | Description          |
| ------ | ---------------------------- | -------------------- |
| GET    | /api/health                  | Health check         |
| GET    | /api/tickers                 | List all tickers     |
| GET    | /api/tickers/:symbol/history | Historical OHLC data |

#### GET /api/tickers

Returns all available tickers with current prices.

```json
[
  { "symbol": "BTC-USD", "name": "Bitcoin", "price": 64500, "decimals": 8 },
  { "symbol": "ETH-USD", "name": "Ethereum", "price": 3420, "decimals": 6 }
]
```

#### GET /api/tickers/:symbol/history?days=30

Returns historical OHLC data. `days` is optional (default: 30, max: 365). Symbol is case-insensitive.

```json
{
  "symbol": "BTC-USD",
  "name": "Bitcoin",
  "days": 30,
  "data": [
    {
      "timestamp": 1773861769664,
      "open": 60649.88,
      "high": 62737.99,
      "low": 59990.07,
      "close": 61546.19,
      "volume": 41278779
    }
  ]
}
```

### WebSocket

- **URL:** `ws://localhost:3075/ws`
- **Subscribe:** `{ "type": "subscribe", "symbol": "BTC-USD" }`
- **Unsubscribe:** `{ "type": "unsubscribe", "symbol": "BTC-USD" }`
- **Server sends:** `{ "type": "price_update", "data": { "symbol": "BTC-USD", "price": 64532.12, "change": -63.7, "changePercent": -0.099, "timestamp": 1774293968980 } }`
