import { type ElementType, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight',
  h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  p: 'leading-7',
  lead: 'text-xl text-muted-foreground',
  large: 'text-lg font-semibold',
  small: 'text-sm font-medium leading-none',
  muted: 'text-sm text-muted-foreground',
} as const;

type Variant = keyof typeof variants;

const defaultElements: Record<Variant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'p',
  lead: 'p',
  large: 'div',
  small: 'small',
  muted: 'p',
};

type TypographyProps<T extends ElementType = 'p'> = {
  variant?: Variant;
  as?: T;
  className?: string;
} & ComponentPropsWithoutRef<T>;

export function Typography<T extends ElementType = 'p'>({
  variant = 'p',
  as,
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as ?? defaultElements[variant];

  return <Component className={cn(variants[variant], className)} {...props} />;
}
