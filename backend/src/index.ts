import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import tickerRoutes from './routes/tickers.js';

const app = express();
const PORT = process.env.PORT || 3075;

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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
