import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'income' | 'expense' | 'transfer' | 'primary' | 'secondary' | 'warning' | 'success' | 'danger';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white text-gray-700 border-gray-400',
  income: 'bg-green-100 text-green-700 border-green-500',
  expense: 'bg-red-100 text-red-700 border-red-500',
  transfer: 'bg-blue-100 text-blue-700 border-blue-500',
  primary: 'bg-[#AADD00] text-black border-black',
  secondary: 'bg-[#FF4D8D] text-white border-[#FF4D8D]',
  warning: 'bg-amber-100 text-amber-700 border-amber-500',
  success: 'bg-green-100 text-green-700 border-green-500',
  danger: 'bg-red-100 text-red-700 border-red-500',
};

const dotColors: Record<string, string> = {
  default: 'bg-gray-400',
  income: 'bg-green-500',
  expense: 'bg-red-500',
  transfer: 'bg-blue-500',
  primary: 'bg-black',
  secondary: 'bg-white',
  warning: 'bg-amber-500',
  success: 'bg-green-500',
  danger: 'bg-red-500',
};

export function Badge({ children, variant = 'default', size = 'md', dot = false }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`brutal-badge ${sizeClass} ${variantStyles[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

export default Badge;
