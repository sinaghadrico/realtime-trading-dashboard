import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 3075,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5178',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
