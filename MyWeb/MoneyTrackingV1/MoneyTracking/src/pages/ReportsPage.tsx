import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/AppShell';
import { SimpleBarChart, SimplePieChart } from '../components/finance/Charts';
import { mockChartData, mockFinancialSummary } from '../lib/mock-data';
import { formatCurrency } from '../lib/utils';
import { useWorkspace } from '../features/workspace/WorkspaceContext';

const periods = [
  { id: 'month', label: 'Bulan Ini' },
  { id: '3months', label: '3 Bulan' },
  { id: 'year', label: '1 Tahun' },
];

const expenseByCategory = [
  { label: 'Makanan', value: 645000, color: '#FF6B35' },
  { label: 'Transportasi', value: 320000, color: '#4ECDC4' },
  { label: 'Belanja', value: 430000, color: '#FFE66D' },
  { label: 'Tagihan', value: 350000, color: '#F4A261' },
  { label: 'Lainnya', value: 24000, color: '#999999' },
];

export default function ReportsPage() {
  const { currentWorkspace } = useWorkspace();
  const [period, setPeriod] = useState('month');
  const summary = currentWorkspace?.type === 'business' ? mockFinancialSummary.business : mockFinancialSummary.personal;

  const netFlow = summary.income - summary.expense;

  return (
    <AppShell>
      <Header title="Laporan" showNotif={false} showAvatar={false} />

      <div className="page-container py-4 space-y-5">
        {/* Period Selector */}
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-2 rounded-lg border-2 border-black text-xs font-bold transition-all ${
                period === p.id ? 'bg-black text-white' : 'bg-white text-[#555]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3">
          <div className="brutal-card-lg p-4 bg-[#AADD00]">
            <p className="text-xs font-bold text-black/60 uppercase">Pemasukan</p>
            <p className="text-3xl font-extrabold text-black mt-1">+{formatCurrency(summary.income)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="brutal-card p-3">
              <p className="text-[10px] font-bold text-[#666] uppercase mb-1">Pengeluaran</p>
              <p className="text-xl font-extrabold text-red-600">-{formatCurrency(summary.expense)}</p>
            </div>
            <div className={`brutal-card p-3 ${netFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-[10px] font-bold text-[#666] uppercase mb-1">Net Cash Flow</p>
              <p className={`text-xl font-extrabold ${netFlow >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {netFlow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netFlow))}
              </p>
            </div>
          </div>
        </div>
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Income vs Expense Chart */}
          <div className="brutal-card p-4">
            <h3 className="font-extrabold text-sm text-[#111] mb-4">Pemasukan vs Pengeluaran</h3>
            <SimpleBarChart data={mockChartData} height={180} />
          </div>

          {/* Expense by Category */}
          <div className="brutal-card p-4">
            <h3 className="font-extrabold text-sm text-[#111] mb-4">Pengeluaran per Kategori</h3>
            <SimplePieChart data={expenseByCategory} size={130} />
            {/* Table */}
            <div className="mt-4 space-y-2">
              {expenseByCategory.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="flex-1 text-xs text-[#444]">{item.label}</span>
                  <span className="text-xs font-bold text-[#111]">{formatCurrency(item.value)}</span>
                  <span className="text-xs text-[#888] w-10 text-right">
                    {Math.round((item.value / expenseByCategory.reduce((s, d) => s + d.value, 0)) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Monthly Overview Table */}
          <div className="lg:col-span-8 brutal-card p-4">
            <h3 className="font-extrabold text-sm text-[#111] mb-3">Rekap Bulanan</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-2 font-extrabold text-[#666] uppercase">Bulan</th>
                  <th className="text-right py-2 font-extrabold text-[#666] uppercase">Masuk</th>
                  <th className="text-right py-2 font-extrabold text-[#666] uppercase">Keluar</th>
                  <th className="text-right py-2 font-extrabold text-[#666] uppercase">Net</th>
                </tr>
              </thead>
              <tbody>
                {mockChartData.map((d, i) => {
                  const net = d.income - d.expense;
                  return (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2.5 font-semibold text-[#111]">{d.label}</td>
                      <td className="py-2.5 text-right font-bold text-green-700">{formatCurrency(d.income, true)}</td>
                      <td className="py-2.5 text-right font-bold text-red-600">{formatCurrency(d.expense, true)}</td>
                      <td className={`py-2.5 text-right font-extrabold ${net >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {net >= 0 ? '+' : ''}{formatCurrency(net, true)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export */}
        <div className="lg:col-span-4 space-y-5">
          <div className="brutal-card p-4 flex items-center gap-3">
            <span className="text-2xl">📁</span>
            <div className="flex-1">
              <p className="font-extrabold text-sm">Export Data</p>
              <p className="text-xs text-[#666]">Download laporan keuanganmu</p>
            </div>
            <button className="brutal-btn brutal-btn-outline brutal-btn-sm">
              CSV
            </button>
          </div>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
