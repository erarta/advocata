import React from 'react';
import { cn } from '@/lib/utils';
import { Container } from './container';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerSize?: 'sm' | 'md' | 'lg' | 'full';
  noPadding?: boolean;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, containerSize = 'lg', noPadding = false, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          {
            'py-16 sm:py-20 lg:py-24': !noPadding,
          },
          className
        )}
        {...props}
      >
        <Container size={containerSize}>{children}</Container>
      </section>
    );
  }
);

Section.displayName = 'Section';
