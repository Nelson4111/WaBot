import React from 'react';
import { ChevronRight, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import type { Transaction } from '../../lib/types';
import { formatCurrency, formatDate, formatDateGroup, groupByDate } from '../../lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: (tx: Transaction) => void;
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const { type, amount, category, account, date, note } = transaction;

  const typeConfig = {
    income: {
      sign: '+',
      textColor: 'text-green-700',
      bgColor: 'bg-green-100',
      TypeIcon: ArrowDownLeft,
      iconColor: 'text-green-600',
    },
    expense: {
      sign: '-',
      textColor: 'text-red-600',
      bgColor: 'bg-red-100',
      TypeIcon: ArrowUpRight,
      iconColor: 'text-red-600',
    },
    transfer: {
      sign: '↔',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      TypeIcon: ArrowLeftRight,
      iconColor: 'text-blue-600',
    },
  };

  const cfg = typeConfig[type];

  return (
    <div
      className={`flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(transaction)}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl ${cfg.bgColor} flex items-center justify-center text-lg flex-shrink-0 border border-black/10`}>
        {category.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#111] truncate">
          {note || category.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-[#666]">{category.name}</span>
          <span className="text-[#bbb]">·</span>
          <span className="text-[11px] text-[#888]">{account.name}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`font-extrabold text-sm ${cfg.textColor}`}>
          {cfg.sign}{formatCurrency(amount)}
        </p>
        <p className="text-[11px] text-[#888] mt-0.5">
          {new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
        </p>
      </div>

      {onClick && <ChevronRight size={14} className="text-[#ccc] flex-shrink-0" />}
    </div>
  );
}

interface TransactionListProps {
  transactions: Transaction[];
  onItemClick?: (tx: Transaction) => void;
  grouped?: boolean;
  limit?: number;
}

export function TransactionList({
  transactions,
  onItemClick,
  grouped = true,
  limit,
}: TransactionListProps) {
  const displayed = limit ? transactions.slice(0, limit) : transactions;

  if (!grouped) {
    return (
      <div className="brutal-card overflow-hidden p-0">
        <div className="divide-y divide-gray-100">
          {displayed.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} onClick={onItemClick} />
          ))}
        </div>
      </div>
    );
  }

  const groups = groupByDate(displayed);
  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => (
        <div key={date}>
          {/* Date Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#666] uppercase tracking-wide">
              {formatDateGroup(date)}
            </span>
            <div className="flex-1 h-px bg-black/10" />
            <span className="text-xs font-semibold text-[#999]">
              {formatCurrency(
                groups[date].reduce((sum, tx) => {
                  if (tx.type === 'income') return sum + tx.amount;
                  if (tx.type === 'expense') return sum - tx.amount;
                  return sum;
                }, 0)
              )}
            </span>
          </div>
          {/* Transactions */}
          <div className="brutal-card overflow-hidden p-0">
            <div className="divide-y divide-gray-100">
              {groups[date].map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} onClick={onItemClick} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionItem;
