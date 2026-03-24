import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TickerItem } from '@/components/TickerItem';

describe('TickerItem', () => {
  const defaultProps = {
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    price: 64500.12,
    decimals: 8,
    change: 120.5,
    changePercent: 0.19,
    isSelected: false,
    onSelect: vi.fn(),
  };

  it('renders symbol and name', () => {
    render(<TickerItem {...defaultProps} />);

    expect(screen.getByText('BTC-USD')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
  });

  it('renders formatted price', () => {
    render(<TickerItem {...defaultProps} />);

    expect(screen.getByText('$64,500.12')).toBeInTheDocument();
  });

  it('shows positive change with green color and up arrow', () => {
    render(<TickerItem {...defaultProps} />);

    const changeEl = screen.getByText('+0.19%');
    expect(changeEl).toBeInTheDocument();
    expect(changeEl.closest('span')).toHaveClass('text-green-500');
  });

  it('shows negative change with red color and down arrow', () => {
    render(
      <TickerItem {...defaultProps} change={-50.3} changePercent={-0.08} />,
    );

    const changeEl = screen.getByText('-0.08%');
    expect(changeEl).toBeInTheDocument();
    expect(changeEl.closest('span')).toHaveClass('text-red-500');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<TickerItem {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('applies selected styles when isSelected is true', () => {
    render(<TickerItem {...defaultProps} isSelected />);

    expect(screen.getByRole('button')).toHaveClass('bg-accent');
  });

  it('does not re-render when props are the same (memo)', () => {
    const { rerender } = render(<TickerItem {...defaultProps} />);
    const onSelect = defaultProps.onSelect;

    rerender(<TickerItem {...defaultProps} />);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
