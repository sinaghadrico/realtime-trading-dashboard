import { createContext } from 'react';
import type { User } from '@/services/auth';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: { email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  loginPending: boolean;
  loginError: string | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
