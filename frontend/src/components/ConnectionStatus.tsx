import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ConnectionStatus as Status } from '@/hooks/useWebSocket';

interface ConnectionStatusProps {
  status: Status;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 text-xs',
        status === 'connected' && 'border-green-500 text-green-500',
        status === 'connecting' && 'border-yellow-500 text-yellow-500',
        status === 'disconnected' && 'border-red-500 text-red-500',
      )}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          status === 'connected' && 'bg-green-500',
          status === 'connecting' && 'animate-pulse bg-yellow-500',
          status === 'disconnected' && 'bg-red-500',
        )}
      />
      {status === 'connected' && 'Connected'}
      {status === 'connecting' && 'Connecting...'}
      {status === 'disconnected' && 'Disconnected'}
    </Badge>
  );
}
