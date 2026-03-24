import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Card className="m-6 flex flex-col items-center justify-center gap-4 p-8">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <Typography variant="h4">Something went wrong</Typography>
          <Typography variant="muted">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Typography>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
