import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/AppShell';
import { AccountCard } from '../components/finance/FinanceCards';
import { EmptyState } from '../components/ui/States';
import { BottomSheet } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/States';
import { mockAccounts } from '../lib/mock-data';
import { formatCurrency } from '../lib/utils';
import type { Account } from '../lib/types';
import { useWorkspace } from '../features/workspace/WorkspaceContext';

const accountTypes = [
  { value: 'bank', label: 'Bank', icon: '🏦' },
  { value: 'cash', label: 'Tunai', icon: '💵' },
  { value: 'ewallet', label: 'E-Wallet', icon: '📱' },
  { value: 'credit_card', label: 'Kartu Kredit', icon: '💳' },
  { value: 'other', label: 'Lainnya', icon: '📦' },
];

export default function AccountsPage() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id || 'ws-personal';
  
  const accounts = mockAccounts.filter((a) => a.workspaceId === workspaceId);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', type: 'bank', balance: '' });

  const totalBalance = accounts.filter((a) => a.isActive).reduce((s, a) => s + a.balance, 0);

  const handleAdd = () => {
    // TODO: Save to Supabase
    setShowAddSheet(false);
    setNewAcc({ name: '', type: 'bank', balance: '' });
  };

  return (
    <AppShell>
      <Header title="Akun" showNotif={false} showAvatar={false} />

      <div className="page-container py-4 space-y-4">
        {/* Total Balance Card */}
        <div className="brutal-card-lg p-5 bg-[#AADD00]">
          <p className="text-xs font-bold text-black/60 uppercase tracking-wide mb-1">Total Saldo Semua Akun</p>
          <p className="text-3xl font-extrabold text-black">{formatCurrency(totalBalance)}</p>
          <p className="text-xs font-semibold text-black/50 mt-2">{accounts.filter((a) => a.isActive).length} akun aktif</p>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddSheet(true)}
          className="brutal-btn brutal-btn-black w-full"
        >
          <Plus size={16} /> Tambah Akun
        </button>

        {/* Account List */}
        {accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((acc) => (
              <AccountCard
                key={acc.id}
                account={acc}
                onClick={() => setSelectedAccount(acc)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🏦"
            title="Belum ada akun"
            description="Tambahkan akun pertamamu untuk mulai mencatat transaksi."
            action={{ label: '+ Tambah Akun', onClick: () => setShowAddSheet(true) }}
          />
        )}
      </div>

      {/* Account Detail/Edit Sheet */}
      <BottomSheet
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        title="Detail Akun"
      >
        {selectedAccount && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl border-2 border-black bg-gray-100 flex items-center justify-center text-3xl mx-auto mb-3">
                {selectedAccount.icon}
              </div>
              <h3 className="font-extrabold text-lg">{selectedAccount.name}</h3>
              <p className="text-2xl font-extrabold text-[#111] mt-1">{formatCurrency(selectedAccount.balance)}</p>
            </div>

            <div className="space-y-2 border-t-2 border-black pt-4">
              {[
                { label: 'Tipe', value: accountTypes.find((t) => t.value === selectedAccount.type)?.label },
                { label: 'Status', value: selectedAccount.isActive ? '✅ Aktif' : '❌ Nonaktif' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-sm text-[#666]">{row.label}</span>
                  <span className="text-sm font-bold">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="brutal-btn brutal-btn-primary flex-1">Edit</button>
              <button
                className="brutal-btn brutal-btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Hapus
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Add Account Sheet */}
      <BottomSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        title="Tambah Akun"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5">Nama Akun</label>
            <input
              className="brutal-input"
              placeholder="cth. BCA Tabungan"
              value={newAcc.name}
              onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">Tipe Akun</label>
            <div className="grid grid-cols-3 gap-2">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setNewAcc({ ...newAcc, type: type.value })}
                  className={`p-3 rounded-xl border-2 border-black text-center transition-all ${
                    newAcc.type === type.value ? 'bg-[#AADD00] shadow-[2px_2px_0px_#111]' : 'bg-white'
                  }`}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <p className="text-[10px] font-bold">{type.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">Saldo Awal</label>
            <input
              className="brutal-input"
              type="number"
              placeholder="0"
              value={newAcc.balance}
              onChange={(e) => setNewAcc({ ...newAcc, balance: e.target.value })}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newAcc.name}
            className="brutal-btn brutal-btn-primary w-full disabled:opacity-40"
          >
            Simpan Akun
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          setSelectedAccount(null);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Hapus Akun?"
        message={`Akun "${selectedAccount?.name}" akan dihapus. Transaksi terkait tidak akan terhapus.`}
        confirmLabel="Hapus"
        danger
      />
    </AppShell>
  );
}
