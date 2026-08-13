import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  padding?: string;
}

export function Card({ children, className = '', size = 'md', onClick, padding }: CardProps) {
  const sizeClass = {
    sm: 'brutal-card-sm',
    md: 'brutal-card',
    lg: 'brutal-card-lg',
  }[size];

  const defaultPadding = padding ?? 'p-4';

  return (
    <div
      className={`${sizeClass} ${defaultPadding} ${onClick ? 'cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Card;
