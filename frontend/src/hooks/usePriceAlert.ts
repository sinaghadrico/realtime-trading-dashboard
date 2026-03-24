import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createAlert } from '@/services/api';

export function usePriceAlert(symbol: string, currentPrice: number) {
  const [open, setOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice.toFixed(2));
  const [direction, setDirection] = useState<'above' | 'below'>('above');

  const mutation = useMutation({
    mutationFn: () => {
      const price = parseFloat(targetPrice);
      return createAlert(symbol, price, direction);
    },
    onSuccess: () => {
      const price = parseFloat(targetPrice);
      toast.success(
        `Alert set: ${symbol} ${direction} $${price.toLocaleString()}`,
      );
      setOpen(false);
    },
    onError: () => {
      toast.error('Failed to create alert');
    },
  });

  const handleSubmit = () => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    mutation.mutate();
  };

  return {
    open,
    setOpen,
    targetPrice,
    setTargetPrice,
    direction,
    setDirection,
    isPending: mutation.isPending,
    handleSubmit,
  };
}
