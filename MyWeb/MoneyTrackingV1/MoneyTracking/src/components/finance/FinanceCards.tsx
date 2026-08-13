import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { Account, Budget, Category, Customer } from '../../lib/types';
import { formatCurrency, getBudgetPercentage, getBudgetStatus } from '../../lib/utils';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

// ============ ACCOUNT CARD ============
interface AccountCardProps {
  account: Account;
  onClick?: (acc: Account) => void;
}

export function AccountCard({ account, onClick }: AccountCardProps) {
  const typeLabel: Record<string, string> = {
    bank: 'Bank', cash: 'Tunai', ewallet: 'E-Wallet',
    credit_card: 'Kartu Kredit', other: 'Lainnya',
  };

  return (
    <div
      className={`brutal-card p-4 flex items-center gap-3 ${onClick ? 'cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform' : ''}`}
      onClick={() => onClick?.(account)}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 border-black flex-shrink-0"
        style={{ backgroundColor: `${account.color}20` }}
      >
        {account.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-sm text-[#111]">{account.name}</p>
        <Badge variant="default" size="sm">{typeLabel[account.type]}</Badge>
      </div>

      {/* Balance */}
      <div className="text-right">
        <p className="font-extrabold text-sm text-[#111]">{formatCurrency(account.balance)}</p>
        {!account.isActive && (
          <Badge variant="danger" size="sm">Nonaktif</Badge>
        )}
      </div>

      {onClick && <ChevronRight size={14} className="text-[#ccc]" />}
    </div>
  );
}

// ============ BUDGET CARD ============
interface BudgetCardProps {
  budget: Budget;
  onClick?: (budget: Budget) => void;
}

export function BudgetCard({ budget, onClick }: BudgetCardProps) {
  const percentage = getBudgetPercentage(budget.spent, budget.amount);
  const status = getBudgetStatus(percentage);
  const remaining = budget.amount - budget.spent;

  const statusColors = {
    safe: 'text-green-700',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  };

  return (
    <div
      className={`brutal-card p-4 ${onClick ? 'cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform' : ''}`}
      onClick={() => onClick?.(budget)}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 border-2 border-black flex items-center justify-center text-lg flex-shrink-0">
          {budget.category.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[#111]">{budget.category.name}</p>
          <p className="text-xs text-[#666]">
            {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-extrabold ${statusColors[status]}`}>{percentage}%</p>
          {status === 'danger' && (
            <Badge variant="danger" size="sm">Over!</Badge>
          )}
          {status === 'warning' && (
            <Badge variant="warning" size="sm">Hampir</Badge>
          )}
        </div>
      </div>
      <ProgressBar value={percentage} colorByValue size="md" />
      <p className="text-xs text-[#666] mt-2">
        Sisa: <span className={`font-bold ${remaining < 0 ? 'text-red-600' : 'text-[#111]'}`}>
          {formatCurrency(remaining)}
        </span>
      </p>
    </div>
  );
}

// ============ CATEGORY CARD ============
interface CategoryCardProps {
  category: Category;
  onClick?: (cat: Category) => void;
  onEdit?: (cat: Category) => void;
}

export function CategoryCard({ category, onClick, onEdit }: CategoryCardProps) {
  return (
    <div
      className={`brutal-card-sm p-3 flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(category)}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 border-black flex-shrink-0"
        style={{ backgroundColor: `${category.color}20` }}
      >
        {category.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#111] truncate">{category.name}</p>
        {!category.isActive && (
          <Badge variant="default" size="sm">Nonaktif</Badge>
        )}
      </div>
      {category.isDefault && (
        <Badge variant="default" size="sm">Default</Badge>
      )}
      {onEdit && (
        <button
          className="text-[#888] hover:text-[#111] p-1"
          onClick={(e) => { e.stopPropagation(); onEdit(category); }}
        >
          ✎
        </button>
      )}
    </div>
  );
}

// ============ CUSTOMER CARD ============
interface CustomerCardProps {
  customer: Customer;
  onClick?: (c: Customer) => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  return (
    <div
      className={`brutal-card p-4 flex items-center gap-3 ${onClick ? 'cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform' : ''}`}
      onClick={() => onClick?.(customer)}
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-xl bg-[#AADD00] border-2 border-black flex items-center justify-center flex-shrink-0">
        <span className="font-extrabold text-sm text-black">
          {customer.name.slice(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-[#111] truncate">{customer.name}</p>
          {!customer.isActive && <Badge variant="default" size="sm">Nonaktif</Badge>}
        </div>
        <p className="text-xs text-[#666] mt-0.5">{customer.phone || 'Tidak ada nomor'}</p>
      </div>

      {/* Stats */}
      <div className="text-right">
        <p className="font-extrabold text-sm text-[#111]">{formatCurrency(customer.totalAmount, true)}</p>
        {customer.unpaidAmount > 0 && (
          <p className="text-xs text-red-600 font-semibold">
            Hutang: {formatCurrency(customer.unpaidAmount, true)}
          </p>
        )}
      </div>

      {onClick && <ChevronRight size={14} className="text-[#ccc]" />}
    </div>
  );
}
