import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface StatCardProps {
  label: string;
  amount: number;
  type?: 'balance' | 'income' | 'expense' | 'neutral';
  compact?: boolean;
  trend?: number; // percentage change
}

export function StatCard({ label, amount, type = 'neutral', compact = false, trend }: StatCardProps) {
  const configs = {
    balance: {
      bg: 'bg-[#AADD00]',
      text: 'text-black',
      subText: 'text-black/60',
      Icon: Wallet,
      iconBg: 'bg-black/10',
    },
    income: {
      bg: 'bg-white',
      text: 'text-green-700',
      subText: 'text-gray-500',
      Icon: TrendingUp,
      iconBg: 'bg-green-100',
    },
    expense: {
      bg: 'bg-white',
      text: 'text-red-600',
      subText: 'text-gray-500',
      Icon: TrendingDown,
      iconBg: 'bg-red-100',
    },
    neutral: {
      bg: 'bg-white',
      text: 'text-[#111]',
      subText: 'text-gray-500',
      Icon: Wallet,
      iconBg: 'bg-gray-100',
    },
  };

  const cfg = configs[type];

  if (compact) {
    return (
      <div className={`brutal-card ${cfg.bg} p-3`}>
        <p className={`text-xs font-semibold ${cfg.subText} mb-1`}>{label}</p>
        <p className={`text-base font-extrabold ${cfg.text}`}>
          {type === 'income' ? '+' : type === 'expense' ? '-' : ''}
          {formatCurrency(Math.abs(amount), true)}
        </p>
      </div>
    );
  }

  return (
    <div className={`brutal-card ${cfg.bg} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-semibold ${cfg.subText} uppercase tracking-wide`}>{label}</p>
        <div className={`${cfg.iconBg} p-2 rounded-lg`}>
          <cfg.Icon size={14} className={cfg.text} />
        </div>
      </div>
      <p className={`text-2xl font-extrabold ${cfg.text} leading-none`}>
        {formatCurrency(Math.abs(amount))}
      </p>
      {trend !== undefined && (
        <p className={`text-xs mt-2 font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% bulan ini
        </p>
      )}
    </div>
  );
}

export default StatCard;
