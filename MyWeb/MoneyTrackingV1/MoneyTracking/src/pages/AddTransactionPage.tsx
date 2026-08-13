import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';
import { mockCategories, mockAccounts } from '../lib/mock-data';
import { formatInputAmount, parseAmount } from '../lib/utils';
import type { TransactionType } from '../lib/types';

const typeConfig = {
  income: { label: 'Pemasukan', color: 'bg-[#AADD00]', textColor: 'text-black', sign: '+', emoji: '📥' },
  expense: { label: 'Pengeluaran', color: 'bg-[#FF4D8D]', textColor: 'text-white', sign: '-', emoji: '📤' },
  transfer: { label: 'Transfer', color: 'bg-[#111]', textColor: 'text-white', sign: '↔', emoji: '🔄' },
};

const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

export default function AddTransactionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as TransactionType) || 'expense';

  const [txType, setTxType] = useState<TransactionType>(initialType);
  const [rawAmount, setRawAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(mockAccounts[0]?.id || '');
  const [selectedToAccountId, setSelectedToAccountId] = useState(mockAccounts[1]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const cfg = typeConfig[txType];
  const amount = parseAmount(rawAmount);

  const filteredCategories = mockCategories.filter(
    (c) => c.type === (txType === 'income' ? 'income' : 'expense') && c.isActive
  );

  const handleNumpad = (key: string) => {
    if (key === '⌫') {
      setRawAmount((prev) => prev.slice(0, -1));
    } else if (key === '.') {
      if (!rawAmount.includes('.')) setRawAmount((prev) => prev + '.');
    } else {
      if (rawAmount.replace('.', '').length >= 12) return;
      setRawAmount((prev) => prev + key);
    }
  };

  const handleSubmit = () => {
    if (!amount || !selectedCategoryId) return;
    // TODO: Save to Supabase
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/dashboard');
    }, 1500);
  };

  const displayAmount = rawAmount
    ? parseInt(rawAmount.replace(/\D/g, '') || '0').toLocaleString('id-ID')
    : '0';

  const selectedCategory = mockCategories.find((c) => c.id === selectedCategoryId);
  const selectedAccount = mockAccounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="min-h-screen bg-[#F5F5E8] flex flex-col">
      {/* Header */}
      <header className={`${cfg.color} border-b-2 border-black page-container py-3 flex items-center gap-3`}>
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 border-2 border-black rounded-lg bg-white/20 flex items-center justify-center"
        >
          <X size={18} className={txType === 'income' ? 'text-black' : 'text-white'} />
        </button>
        <h1 className={`text-base font-extrabold flex-1 ${cfg.textColor}`}>
          {cfg.emoji} Tambah {cfg.label}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Type Selector */}
        <div className="flex border-b-2 border-black">
          {(Object.keys(typeConfig) as TransactionType[]).map((type) => (
            <button
              key={type}
              onClick={() => { setTxType(type); setSelectedCategoryId(''); }}
              className={`flex-1 py-3 text-xs font-extrabold border-r-2 border-black last:border-r-0 transition-colors ${
                txType === type ? typeConfig[type].color + ' ' + typeConfig[type].textColor : 'bg-white text-[#555]'
              }`}
            >
              {typeConfig[type].label}
            </button>
          ))}
        </div>

        {/* Amount Display */}
        <div className="page-container py-6 text-center border-b-2 border-black bg-white">
          <p className="text-xs font-bold text-[#888] mb-1 uppercase">Nominal</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-extrabold text-[#444]">Rp</span>
            <span className={`text-4xl font-extrabold leading-none ${amount > 0 ? 'text-[#111]' : 'text-[#ccc]'}`}>
              {displayAmount}
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="page-container py-4 space-y-3 border-b-2 border-black">
          {/* Category */}
          <div>
            <p className="text-xs font-bold text-[#666] mb-2 uppercase">Kategori</p>
            <div className="grid grid-cols-4 gap-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 border-black transition-all ${
                    selectedCategoryId === cat.id
                      ? 'bg-[#AADD00] shadow-[2px_2px_0px_#111]'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[10px] font-semibold text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-bold text-[#666] mb-2 uppercase">
              {txType === 'transfer' ? 'Dari Akun' : 'Akun'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {mockAccounts.slice(0, 4).map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 border-black text-sm font-semibold transition-all ${
                    selectedAccountId === acc.id ? 'bg-black text-white' : 'bg-white'
                  }`}
                >
                  <span>{acc.icon}</span>
                  <span className="truncate">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* To Account (Transfer only) */}
          {txType === 'transfer' && (
            <div>
              <p className="text-xs font-bold text-[#666] mb-2 uppercase">Ke Akun</p>
              <div className="grid grid-cols-2 gap-2">
                {mockAccounts.filter((a) => a.id !== selectedAccountId).slice(0, 4).map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedToAccountId(acc.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 border-black text-sm font-semibold transition-all ${
                      selectedToAccountId === acc.id ? 'bg-black text-white' : 'bg-white'
                    }`}
                  >
                    <span>{acc.icon}</span>
                    <span className="truncate">{acc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date & Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-[#666] mb-1.5 uppercase">Tanggal</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="brutal-input text-sm"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-[#666] mb-1.5 uppercase">Catatan</p>
              <input
                type="text"
                placeholder="Opsional..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="brutal-input text-sm"
              />
            </div>
          </div>
        </div>

        {/* NUMPAD */}
        <div className="page-container py-4">
          <div className="grid grid-cols-3 gap-2">
            {numpadKeys.map((key) => (
              <button
                key={key}
                onClick={() => handleNumpad(key)}
                className={`h-14 rounded-xl border-2 border-black font-extrabold text-lg transition-all active:translate-x-[1px] active:translate-y-[1px] ${
                  key === '⌫'
                    ? 'bg-[#FF4D8D] text-white shadow-[2px_2px_0px_#111]'
                    : 'bg-white shadow-[2px_2px_0px_#111]'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="page-container py-4 border-t-2 border-black bg-[#F5F5E8] safe-bottom">
        <button
          onClick={handleSubmit}
          disabled={!amount || (!selectedCategoryId && txType !== 'transfer')}
          className={`brutal-btn brutal-btn-lg w-full ${cfg.color} ${cfg.textColor} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {cfg.emoji} Simpan {cfg.label}
        </button>
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="brutal-card-lg p-8 text-center bg-[#AADD00] animate-slide-up">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-extrabold text-xl text-black">Tersimpan!</p>
            <p className="text-sm text-black/60 mt-1">Transaksi berhasil dicatat</p>
          </div>
        </div>
      )}
    </div>
  );
}
