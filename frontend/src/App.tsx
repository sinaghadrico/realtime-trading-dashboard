import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Typography } from '@/components/ui/typography';

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          <header className="flex items-center justify-between border-b px-6 py-4">
            <Typography variant="h3" as="h1">
              Trading Dashboard
            </Typography>
            <ThemeToggle />
          </header>
          <main className="p-6">
            <Typography variant="muted">Main</Typography>
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
