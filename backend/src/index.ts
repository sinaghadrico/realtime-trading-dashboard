import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import tickerRoutes from './routes/tickers.js';
import alertRoutes from './routes/alerts.js';
import authRoutes from './routes/auth.js';
import { verifyToken } from './middleware/auth.js';
import { setupWebSocket } from './services/websocket.js';

import { config } from './config.js';

const app = express();

app.use(compression());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Public routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/tickers', verifyToken, tickerRoutes);
app.use('/api/alerts', verifyToken, alertRoutes);

const server = createServer(app);
setupWebSocket(server);

server.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${config.port}`);
  // eslint-disable-next-line no-console
  console.log(`WebSocket available at ws://localhost:${config.port}/ws`);
});

export default app;
