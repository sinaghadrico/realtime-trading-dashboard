import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const router = Router();
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

// Mock user
const MOCK_USER = {
  userId: 'user_1',
  email: 'admin@trading.com',
  password: 'password123',
  name: 'Admin User',
};

router.post('/login', (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { userId: MOCK_USER.userId, email: MOCK_USER.email },
    config.jwtSecret,
    { expiresIn: '24h' },
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
  });

  res.json({
    userId: MOCK_USER.userId,
    email: MOCK_USER.email,
    name: MOCK_USER.name,
  });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', (req, res) => {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      email: string;
    };
    res.json({
      userId: payload.userId,
      email: payload.email,
      name: MOCK_USER.name,
    });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
