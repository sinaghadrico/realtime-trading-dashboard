import { ThemeToggle } from '@/components/ThemeToggle';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
        <Typography variant="h4" as="h1">
          Trading Dashboard
        </Typography>
        <div className="flex items-center gap-2">
          {user && (
            <Typography variant="muted" className="hidden text-xs md:block">
              {user.email}
            </Typography>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <Dashboard />
    </div>
  );
}
