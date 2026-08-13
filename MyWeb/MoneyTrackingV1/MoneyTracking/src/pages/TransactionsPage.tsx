import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/AppShell';
import { TransactionList } from '../components/finance/TransactionItem';
import { SearchInput } from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/States';
import { mockTransactions } from '../lib/mock-data';
import type { Transaction, TransactionType } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { useWorkspace } from '../features/workspace/WorkspaceContext';

export default function TransactionsPage() {
  const { currentWorkspace } = useWorkspace();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const tabs = [
    { id: 'all', label: 'Semua' },
    { id: 'income', label: 'Pemasukan' },
    { id: 'expense', label: 'Pengeluaran' },
    { id: 'transfer', label: 'Transfer' },
  ];

  const filtered = mockTransactions.filter((tx) => {
    const matchesWorkspace = tx.workspaceId === (currentWorkspace?.id || 'ws-personal');
    const matchesType = activeTab === 'all' || tx.type === activeTab;
    const matchesSearch =
      !search ||
      tx.category.name.toLowerCase().includes(search.toLowerCase()) ||
      (tx.note || '').toLowerCase().includes(search.toLowerCase()) ||
      tx.account.name.toLowerCase().includes(search.toLowerCase());
    return matchesWorkspace && matchesType && matchesSearch;
  });

  const totals = {
    income: filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  };

  return (
    <AppShell>
      <Header title="Transaksi" showNotif={false} showAvatar={false} />

      <div className="page-container py-4 space-y-4">
        {/* Search */}
        <SearchInput
          placeholder="Cari transaksi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
        />

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pill" />

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="brutal-card-sm p-3">
            <p className="text-[10px] font-bold text-[#666] uppercase mb-1">Pemasukan</p>
            <p className="font-extrabold text-sm text-green-700">+{formatCurrency(totals.income)}</p>
          </div>
          <div className="brutal-card-sm p-3">
            <p className="text-[10px] font-bold text-[#666] uppercase mb-1">Pengeluaran</p>
            <p className="font-extrabold text-sm text-red-600">-{formatCurrency(totals.expense)}</p>
          </div>
        </div>

        {/* List & Table */}
        {filtered.length > 0 ? (
          <>
            <div className="lg:hidden">
              <TransactionList transactions={filtered} onItemClick={setSelectedTx} grouped />
            </div>
            
            <div className="hidden lg:block brutal-card overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F5F5E8] border-b-2 border-black">
                  <tr>
                    <th className="py-3 px-4 font-extrabold uppercase text-[10px] text-[#666]">Tanggal</th>
                    <th className="py-3 px-4 font-extrabold uppercase text-[10px] text-[#666]">Kategori</th>
                    <th className="py-3 px-4 font-extrabold uppercase text-[10px] text-[#666]">Catatan</th>
                    <th className="py-3 px-4 font-extrabold uppercase text-[10px] text-[#666]">Akun</th>
                    <th className="py-3 px-4 font-extrabold uppercase text-[10px] text-[#666] text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-100">
                  {filtered.map((tx) => (
                    <tr key={tx.id} onClick={() => setSelectedTx(tx)} className="hover:bg-black/5 cursor-pointer transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">{new Date(tx.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{tx.category.icon}</span>
                          <span className="font-bold">{tx.category.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#555] max-w-[200px] truncate">{tx.note || '-'}</td>
                      <td className="py-3 px-4"><span className="brutal-badge text-[10px]">{tx.account.name}</span></td>
                      <td className={`py-3 px-4 font-extrabold text-right ${
                          tx.type === 'income' ? 'text-green-700' :
                          tx.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '↔'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            icon="🔍"
            title="Tidak ada transaksi"
            description={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada transaksi di periode ini.'}
          />
        )}
      </div>

      {/* Detail Sheet */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelectedTx(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg mx-auto bg-[#F5F5E8] border-t-2 border-black rounded-t-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-400 rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-black flex items-center justify-center text-xl">
                {selectedTx.category.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-base">{selectedTx.note || selectedTx.category.name}</h3>
                <p className="text-xs text-[#666]">{selectedTx.category.name}</p>
              </div>
              <div className="ml-auto text-right">
                <p className={`text-xl font-extrabold ${
                  selectedTx.type === 'income' ? 'text-green-700' :
                  selectedTx.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {selectedTx.type === 'income' ? '+' : selectedTx.type === 'expense' ? '-' : '↔'}
                  {formatCurrency(selectedTx.amount)}
                </p>
              </div>
            </div>
            <div className="space-y-2.5 border-t-2 border-black pt-4">
              {[
                { label: 'Akun', value: selectedTx.account.name },
                { label: 'Tanggal', value: new Date(selectedTx.date).toLocaleDateString('id-ID', { dateStyle: 'long' }) },
                { label: 'Tipe', value: selectedTx.type === 'income' ? 'Pemasukan' : selectedTx.type === 'expense' ? 'Pengeluaran' : 'Transfer' },
                ...(selectedTx.note ? [{ label: 'Catatan', value: selectedTx.note }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-sm text-[#666]">{row.label}</span>
                  <span className="text-sm font-bold text-[#111]">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setSelectedTx(null)} className="brutal-btn brutal-btn-outline flex-1">Tutup</button>
              <button className="brutal-btn brutal-btn-primary flex-1">Edit</button>
              <button className="brutal-btn brutal-btn-danger">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
