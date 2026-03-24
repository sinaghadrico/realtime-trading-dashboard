import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Typography } from '@/components/ui/typography';
import { Dashboard } from '@/components/Dashboard';

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <header className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
              <Typography variant="h4" as="h1">
                Trading Dashboard
              </Typography>
              <ThemeToggle />
            </header>
            <Dashboard />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
