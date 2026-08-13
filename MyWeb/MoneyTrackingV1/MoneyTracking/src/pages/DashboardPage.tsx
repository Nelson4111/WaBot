import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronRight, Heart } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/AppShell';
import { WorkspaceSwitcher } from '../components/layout/AppShell';
import { StatCard } from '../components/finance/StatCard';
import { TransactionList } from '../components/finance/TransactionItem';
import { BudgetCard } from '../components/finance/FinanceCards';
import { SimpleBarChart } from '../components/finance/Charts';
import { useWorkspace } from '../features/workspace/WorkspaceContext';
import { mockTransactions, mockBudgets, mockChartData, mockFinancialSummary } from '../lib/mock-data';
import { formatCurrency, getGreeting } from '../lib/utils';
import type { Transaction } from '../lib/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const summary = currentWorkspace?.type === 'business'
    ? mockFinancialSummary.business
    : mockFinancialSummary.personal;

  const recentTx = mockTransactions
    .filter((tx) => tx.workspaceId === (currentWorkspace?.id || 'ws-personal'))
    .slice(0, 5);

  const topBudgets = mockBudgets.slice(0, 3);

  return (
    <AppShell>
      {/* Header */}
      <Header showGreeting showNotif showAvatar />

      <div className="page-container py-4 pb-6">

        {/* Workspace Switcher (mobile) */}
        <div className="lg:hidden mb-5">
          <WorkspaceSwitcher />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* === LEFT COLUMN === */}
          <div className="lg:col-span-8 space-y-5">
            {/* === BALANCE HERO CARD === */}
            <section className="brutal-card p-4 bg-black text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Saldo</p>
                <span className="text-[10px] font-bold bg-white/15 text-white rounded-full px-2 py-1">
                  {currentWorkspace?.type === 'business' ? '💼 Bisnis' : '🏠 Pribadi'}
                </span>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-4">
                {formatCurrency(summary.totalBalance)}
              </h2>

              <div className="flex gap-2">
                <div className="flex-1 bg-[#AADD00] rounded-xl p-3 text-black border border-black/20 relative overflow-hidden">
                  <div className="flex items-center gap-1 mb-1">
                    <ArrowDownLeft size={14} strokeWidth={3} />
                    <p className="text-[10px] font-extrabold uppercase opacity-80">Pemasukan</p>
                  </div>
                  <p className="font-extrabold text-sm relative z-10">{formatCurrency(summary.income)}</p>
                  {/* decorative */}
                  <ArrowDownLeft size={48} className="absolute -right-2 -bottom-2 opacity-10" />
                </div>
                <div className="flex-1 bg-[#FF4D8D] rounded-xl p-3 text-white border border-black/20 relative overflow-hidden">
                  <div className="flex items-center gap-1 mb-1">
                    <ArrowUpRight size={14} strokeWidth={3} />
                    <p className="text-[10px] font-extrabold uppercase opacity-90">Pengeluaran</p>
                  </div>
                  <p className="font-extrabold text-sm relative z-10">{formatCurrency(summary.expense)}</p>
                  {/* decorative */}
                  <ArrowUpRight size={48} className="absolute -right-2 -bottom-2 opacity-10" />
                </div>
              </div>
            </section>

            {/* === QUICK ACTIONS === */}
            <section>
              <div className="flex gap-3">
                {[
                  { label: 'Pemasukan', icon: <ArrowDownLeft size={22} strokeWidth={2.5} />, color: 'bg-[#AADD00] text-black', type: 'income' },
                  { label: 'Pengeluaran', icon: <ArrowUpRight size={22} strokeWidth={2.5} />, color: 'bg-[#FF4D8D] text-white', type: 'expense' },
                  { label: 'Transfer', icon: <ArrowLeftRight size={22} strokeWidth={2.5} />, color: 'bg-white text-black', type: 'transfer' },
                ].map((action) => (
                  <button
                    key={action.type}
                    onClick={() => navigate(`/add-transaction?type=${action.type}`)}
                    className={`brutal-card flex-1 p-3 flex flex-col items-center justify-center gap-2 touch-target active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${action.color}`}
                  >
                    {action.icon}
                    <span className="text-[11px] font-bold tracking-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* === INCOME VS EXPENSE CHART === */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-extrabold text-[#111] uppercase tracking-wide">Tren 6 Bulan</h2>
                <button onClick={() => navigate('/reports')} className="text-xs font-bold text-[#555]">
                  Laporan →
                </button>
              </div>
              <div className="brutal-card p-4">
                <SimpleBarChart data={mockChartData} height={160} />
              </div>
            </section>
          </div>

          {/* === RIGHT COLUMN === */}
          <div className="lg:col-span-4 space-y-5">
            {/* === RECENT TRANSACTIONS === */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-extrabold text-[#111] uppercase tracking-wide">Transaksi Terbaru</h2>
                <button
                  onClick={() => navigate('/transactions')}
                  className="flex items-center gap-1 text-xs font-bold text-[#555] hover:text-[#111] transition-colors"
                >
                  Lihat semua <ChevronRight size={12} />
                </button>
              </div>
              {recentTx.length > 0 ? (
                <TransactionList transactions={recentTx} onItemClick={setSelectedTx} grouped={false} />
              ) : (
                <div className="brutal-card p-6 text-center">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="font-bold text-sm text-[#666]">Belum ada transaksi</p>
                  <button onClick={() => navigate('/add-transaction')} className="brutal-btn brutal-btn-primary brutal-btn-sm mt-3">
                    + Tambah Transaksi
                  </button>
                </div>
              )}
            </section>

            {/* === BUDGET SUMMARY === */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-extrabold text-[#111] uppercase tracking-wide">Budget Agustus</h2>
                <button
                  onClick={() => navigate('/budget')}
                  className="flex items-center gap-1 text-xs font-bold text-[#555] hover:text-[#111] transition-colors"
                >
                  Semua <ChevronRight size={12} />
                </button>
              </div>
              <div className="space-y-3">
                {topBudgets.map((budget) => (
                  <BudgetCard key={budget.id} budget={budget} onClick={() => navigate('/budget')} />
                ))}
              </div>
            </section>

            {/* === DONATION BANNER === */}
            <section>
              <div className="brutal-card p-4 bg-[#FF4D8D] flex items-center gap-4">
                <Heart size={28} className="text-white fill-white flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-white">Dukung MoneyTracking</p>
                  <p className="text-[11px] text-white/80 mt-0.5">Aplikasi gratis. Dukung kami!</p>
                </div>
                <button
                  onClick={() => navigate('/donations')}
                  className="brutal-btn bg-white text-[#FF4D8D] border-black brutal-btn-sm flex-shrink-0"
                >
                  Donasi
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Transaction Detail Sheet */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelectedTx(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg mx-auto bg-[#F5F5E8] border-t-2 border-black rounded-t-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-400 rounded-full mx-auto mb-4" />
            <h3 className="font-extrabold text-base mb-4">Detail Transaksi</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Kategori</span>
                <span className="font-bold text-sm">{selectedTx.category.icon} {selectedTx.category.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Akun</span>
                <span className="font-bold text-sm">{selectedTx.account.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">Tanggal</span>
                <span className="font-bold text-sm">{new Date(selectedTx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              {selectedTx.note && (
                <div className="flex justify-between">
                  <span className="text-sm text-[#666]">Catatan</span>
                  <span className="font-bold text-sm">{selectedTx.note}</span>
                </div>
              )}
              <div className="h-px bg-black/10 my-2" />
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm">Total</span>
                <span className={`text-xl font-extrabold ${selectedTx.type === 'income' ? 'text-green-700' : selectedTx.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                  {selectedTx.type === 'income' ? '+' : selectedTx.type === 'expense' ? '-' : '↔'}{formatCurrency(selectedTx.amount)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setSelectedTx(null)} className="brutal-btn brutal-btn-outline flex-1">Tutup</button>
              <button className="brutal-btn brutal-btn-danger flex-1" onClick={() => setSelectedTx(null)}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
