import React from 'react';
import { getBudgetStatus } from '../../lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorByValue?: boolean; // auto color based on %
  color?: 'primary' | 'income' | 'expense' | 'warning';
}

const colorMap = {
  primary: 'bg-[#AADD00]',
  income: 'bg-green-500',
  expense: 'bg-red-500',
  warning: 'bg-amber-500',
};

const sizeMap = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  className = '',
  showLabel = false,
  size = 'md',
  colorByValue = false,
  color = 'primary',
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  let fillClass = colorMap[color];
  if (colorByValue) {
    const status = getBudgetStatus(clamped);
    if (status === 'warning') fillClass = 'bg-amber-400';
    if (status === 'danger') fillClass = 'bg-red-500';
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold mb-1">
          <span>{clamped}%</span>
          <span>100%</span>
        </div>
      )}
      <div className={`brutal-progress ${sizeMap[size]}`}>
        <div
          className={`${fillClass} h-full rounded-full transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
