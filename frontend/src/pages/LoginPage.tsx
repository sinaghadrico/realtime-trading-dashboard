import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('admin@trading.com');
  const [password, setPassword] = useState('password123');
  const { login, loginPending, loginError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <Typography variant="h3">Trading Dashboard</Typography>
          <Typography variant="muted" className="mt-2">
            Sign in to your account
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {loginError && (
            <Typography variant="small" className="text-destructive">
              {loginError}
            </Typography>
          )}

          <Button type="submit" className="w-full" disabled={loginPending}>
            {loginPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <Typography variant="muted" className="mt-4 text-center text-xs">
          Demo: admin@trading.com / password123
        </Typography>
      </Card>
    </div>
  );
}
