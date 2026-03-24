import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { login as loginApi, logout as logoutApi, getMe } from '@/services/auth';
import { AuthContext } from '@/types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{
    userId: string;
    email: string;
    name: string;
  } | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    getMe()
      .then((data) => {
        setUser(data);
        setStatus('authenticated');
      })
      .catch(() => {
        setStatus('unauthenticated');
      });
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      setUser(data);
      setStatus('authenticated');
    },
  });

  const handleLogout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: status === 'authenticated',
        isLoading: status === 'loading',
        login: loginMutation.mutateAsync,
        logout: handleLogout,
        loginPending: loginMutation.isPending,
        loginError: loginMutation.error
          ? (loginMutation.error as Error).message
          : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
