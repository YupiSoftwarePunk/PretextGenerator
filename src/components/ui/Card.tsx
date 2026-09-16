'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', glow = false, interactive = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-xl bg-dark-purple-800 border border-dark-purple-600 p-6';
    const glowStyles = glow ? 'shadow-neon-glow' : '';
    const interactiveStyles = interactive
      ? 'cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-neon-glow hover:border-neon-pink-500/50'
      : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${glowStyles} ${interactiveStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
