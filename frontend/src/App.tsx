import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { useAuth } from '@/hooks/useAuth';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
    );
  }

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}

function App() {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </AuthProvider>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryProvider>
    </NuqsAdapter>
  );
}

export default App;
