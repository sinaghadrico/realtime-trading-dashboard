import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import tickerRoutes from './routes/tickers.js';
import alertRoutes from './routes/alerts.js';
import { setupWebSocket } from './services/websocket.js';

const app = express();
const PORT = process.env.PORT || 3075;

app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5178',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/tickers', tickerRoutes);
app.use('/api/alerts', alertRoutes);

const server = createServer(app);
setupWebSocket(server);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
});

export default app;
