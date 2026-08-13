import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Edit2 } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { TransactionList } from '../components/finance/TransactionItem';
import { Badge } from '../components/ui/Badge';
import { mockCustomers, mockTransactions } from '../lib/mock-data';
import { formatCurrency, formatDate } from '../lib/utils';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const customer = mockCustomers.find((c) => c.id === id) || mockCustomers[0];
  const customerTx = mockTransactions.slice(0, 4); // mock: reuse general transactions

  if (!customer) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-full py-20">
          <p className="text-4xl mb-3">👤</p>
          <p className="font-bold text-[#666]">Pelanggan tidak ditemukan</p>
          <button onClick={() => navigate(-1)} className="brutal-btn brutal-btn-outline mt-4">← Kembali</button>
        </div>
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5E8]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#F5F5E8] border-b-2 border-black sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_#111]"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-extrabold text-base">Detail Pelanggan</h1>
        <button className="w-9 h-9 flex items-center justify-center border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_#111]">
          <Edit2 size={16} />
        </button>
      </header>

      <div className="px-4 py-4 space-y-5 pb-24">
        {/* Profile Card */}
        <div className="brutal-card-lg p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#AADD00] border-2 border-black rounded-2xl flex items-center justify-center">
              <span className="font-extrabold text-lg text-black">{customer.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-[#111]">{customer.name}</h2>
                <Badge variant={customer.isActive ? 'success' : 'default'} size="sm" dot>
                  {customer.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Phone size={12} className="text-[#666]" />
                  <p className="text-sm text-[#666]">{customer.phone}</p>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail size={12} className="text-[#666]" />
                  <p className="text-sm text-[#666]">{customer.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="brutal-card p-3 text-center">
            <p className="text-[10px] text-[#666] font-bold uppercase mb-1">Transaksi</p>
            <p className="font-extrabold text-lg text-[#111]">{customer.totalTransactions}</p>
          </div>
          <div className="brutal-card p-3 text-center">
            <p className="text-[10px] text-[#666] font-bold uppercase mb-1">Total</p>
            <p className="font-extrabold text-sm text-[#111]">{formatCurrency(customer.totalAmount, true)}</p>
          </div>
          <div className="brutal-card p-3 text-center bg-[#FF4D8D]">
            <p className="text-[10px] text-white/70 font-bold uppercase mb-1">Piutang</p>
            <p className="font-extrabold text-sm text-white">{formatCurrency(customer.unpaidAmount, true)}</p>
          </div>
        </div>

        {/* Unpaid Warning */}
        {customer.unpaidAmount > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-400 rounded-xl">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-xs font-extrabold text-red-700">Ada piutang belum dibayar</p>
              <p className="text-xs text-red-600">{formatCurrency(customer.unpaidAmount)} belum dilunasi</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="brutal-btn brutal-btn-primary">+ Tambah Transaksi</button>
          {customer.phone && (
            <a
              href={`https://wa.me/62${customer.phone.replace(/^0/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn brutal-btn-outline"
            >
              💬 WhatsApp
            </a>
          )}
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-extrabold text-[#111] uppercase">Histori Transaksi</h3>
            <Badge variant="default">{customerTx.length} total</Badge>
          </div>
          <TransactionList transactions={customerTx} grouped={false} />
        </div>
      </div>
    </div>
  );
}
