import React, { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/AppShell';
import { BudgetCard } from '../components/finance/FinanceCards';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/States';
import { BottomSheet } from '../components/ui/Modal';
import { mockBudgets, mockCategories } from '../lib/mock-data';
import { formatCurrency, getBudgetPercentage } from '../lib/utils';
import type { Budget } from '../lib/types';
import { useWorkspace } from '../features/workspace/WorkspaceContext';

export default function BudgetPage() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id || 'ws-personal';

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [newBudget, setNewBudget] = useState({ categoryId: '', amount: '' });

  const filteredBudgets = mockBudgets.filter(b => b.workspaceId === workspaceId);

  const totalBudget = filteredBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = filteredBudgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPct = getBudgetPercentage(totalSpent, totalBudget);

  const overBudgetCount = filteredBudgets.filter((b) => b.spent > b.amount).length;
  const warningCount = filteredBudgets.filter((b) => {
    const pct = getBudgetPercentage(b.spent, b.amount);
    return pct >= 80 && pct < 100;
  }).length;

  const expenseCategories = mockCategories.filter((c) => c.type === 'expense' && c.isActive);

  return (
    <AppShell>
      <Header title="Budget" showNotif={false} showAvatar={false} />

      <div className="page-container py-4 space-y-5">
        {/* Overview Card */}
        <div className="brutal-card-lg p-5 bg-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-[#666] uppercase">Budget Agustus 2025</p>
            {overBudgetCount > 0 && (
              <div className="flex items-center gap-1 bg-red-100 border border-red-400 rounded-full px-2.5 py-1">
                <AlertTriangle size={12} className="text-red-600" />
                <span className="text-[10px] font-bold text-red-700">{overBudgetCount} over!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-[10px] text-[#666] font-semibold">Total Budget</p>
              <p className="font-extrabold text-sm text-[#111]">{formatCurrency(totalBudget, true)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#666] font-semibold">Terpakai</p>
              <p className="font-extrabold text-sm text-red-600">{formatCurrency(totalSpent, true)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#666] font-semibold">Sisa</p>
              <p className={`font-extrabold text-sm ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalRemaining, true)}
              </p>
            </div>
          </div>

          <ProgressBar value={overallPct} colorByValue size="lg" showLabel />
          <p className="text-xs text-[#666] mt-1.5 text-center">
            {overallPct}% dari total budget bulan ini digunakan
          </p>
        </div>

        {/* Warning notices */}
        {(overBudgetCount > 0 || warningCount > 0) && (
          <div className="space-y-2">
            {overBudgetCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-400 rounded-xl">
                <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                <p className="text-xs font-bold text-red-700">{overBudgetCount} kategori telah melewati budget!</p>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border-2 border-amber-400 rounded-xl">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs font-bold text-amber-700">{warningCount} kategori hampir mencapai budget.</p>
              </div>
            )}
          </div>
        )}

        {/* Add Budget */}
        <button onClick={() => setShowAddSheet(true)} className="brutal-btn brutal-btn-black w-full">
          <Plus size={16} /> Tambah Budget
        </button>

        {/* Budget List */}
        {filteredBudgets.length > 0 ? (
          <div className="space-y-3">
            {filteredBudgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} onClick={setSelectedBudget} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🎯"
            title="Belum ada budget"
            description="Set budget per kategori agar pengeluaran lebih terkontrol."
            action={{ label: '+ Set Budget', onClick: () => setShowAddSheet(true) }}
          />
        )}
      </div>

      {/* Add Sheet */}
      <BottomSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} title="Set Budget">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5">Kategori</label>
            <select
              className="brutal-input"
              value={newBudget.categoryId}
              onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
            >
              <option value="">Pilih Kategori...</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">Batas Budget (Rp)</label>
            <input
              className="brutal-input"
              type="number"
              placeholder="cth. 500000"
              value={newBudget.amount}
              onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
            />
          </div>
          <button
            disabled={!newBudget.categoryId || !newBudget.amount}
            className="brutal-btn brutal-btn-primary w-full disabled:opacity-40"
          >
            Simpan Budget
          </button>
        </div>
      </BottomSheet>

      {/* Detail Sheet */}
      <BottomSheet isOpen={!!selectedBudget} onClose={() => setSelectedBudget(null)} title="Detail Budget">
        {selectedBudget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{selectedBudget.category.icon}</div>
              <div>
                <h3 className="font-extrabold">{selectedBudget.category.name}</h3>
                <p className="text-xs text-[#666]">Budget {selectedBudget.period}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Budget</span>
                <span className="font-extrabold text-sm">{formatCurrency(selectedBudget.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Terpakai</span>
                <span className="font-extrabold text-sm text-red-600">{formatCurrency(selectedBudget.spent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Sisa</span>
                <span className={`font-extrabold text-sm ${selectedBudget.amount - selectedBudget.spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(selectedBudget.amount - selectedBudget.spent)}
                </span>
              </div>
            </div>
            <ProgressBar value={getBudgetPercentage(selectedBudget.spent, selectedBudget.amount)} colorByValue size="lg" showLabel />
            <div className="flex gap-2">
              <button className="brutal-btn brutal-btn-primary flex-1">Edit</button>
              <button className="brutal-btn brutal-btn-danger">Hapus</button>
            </div>
          </div>
        )}
      </BottomSheet>
    </AppShell>
  );
}
