import React, { useState } from 'react';
import { Plus, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/AppShell';
import { CustomerCard } from '../components/finance/FinanceCards';
import { SearchInput } from '../components/ui/Input';
import { EmptyState } from '../components/ui/States';
import { BottomSheet } from '../components/ui/Modal';
import { mockCustomers } from '../lib/mock-data';
import { formatCurrency } from '../lib/utils';
import { useWorkspace } from '../features/workspace/WorkspaceContext';

export default function CustomersPage() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [search, setSearch] = useState('');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '', email: '', note: '' });

  const filtered = mockCustomers.filter(
    (c) => c.workspaceId === (currentWorkspace?.id || 'ws-business') &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search))
  );

  const totalUnpaid = filtered.reduce((s, c) => s + c.unpaidAmount, 0);
  const totalRevenue = filtered.reduce((s, c) => s + c.totalAmount, 0);

  if (currentWorkspace?.type !== 'business') {
    return (
      <AppShell>
        <Header title="Pelanggan" showNotif={false} showAvatar={false} />
        <div className="page-container py-4">
          <EmptyState
            icon="💼"
            title="Fitur Bisnis"
            description="Halaman pelanggan hanya tersedia untuk workspace bertipe Bisnis."
            action={{ label: 'Kembali', onClick: () => navigate(-1) }}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header title="Pelanggan" showNotif={false} showAvatar={false} />

      <div className="page-container py-4 space-y-4">
        {/* Business Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#AADD00] border-2 border-black rounded-lg">
          <span>💼</span>
          <p className="text-xs font-bold text-black">Fitur Bisnis — Workspace Usaha Warung</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="brutal-card-sm p-3">
            <p className="text-[10px] text-[#666] font-bold uppercase mb-1">Total Omzet</p>
            <p className="font-extrabold text-sm text-[#111]">{formatCurrency(totalRevenue, true)}</p>
          </div>
          <div className="brutal-card-sm p-3">
            <p className="text-[10px] text-[#666] font-bold uppercase mb-1">Total Piutang</p>
            <p className={`font-extrabold text-sm ${totalUnpaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(totalUnpaid, true)}
            </p>
          </div>
        </div>

        <SearchInput
          placeholder="Cari pelanggan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
        />

        <button onClick={() => setShowAddSheet(true)} className="brutal-btn brutal-btn-black w-full">
          <Plus size={16} /> Tambah Pelanggan
        </button>

        {/* Customer List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => navigate(`/customers/${customer.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="👥"
            title="Belum ada pelanggan"
            description={search ? `Tidak ada hasil untuk "${search}"` : 'Tambahkan pelanggan untuk melacak transaksi bisnis.'}
            action={!search ? { label: '+ Tambah Pelanggan', onClick: () => setShowAddSheet(true) } : undefined}
          />
        )}
      </div>

      {/* Add Sheet */}
      <BottomSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} title="Tambah Pelanggan">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5">Nama Pelanggan *</label>
            <input className="brutal-input" placeholder="Nama lengkap" value={newCust.name} onChange={(e) => setNewCust({ ...newCust, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">Nomor Telepon</label>
            <input className="brutal-input" type="tel" placeholder="08xxxxxxxxxx" value={newCust.phone} onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">Email</label>
            <input className="brutal-input" type="email" placeholder="email@domain.com" value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">Catatan</label>
            <textarea className="brutal-input resize-none" rows={2} placeholder="Catatan opsional..." value={newCust.note} onChange={(e) => setNewCust({ ...newCust, note: e.target.value })} />
          </div>
          <button disabled={!newCust.name} className="brutal-btn brutal-btn-primary w-full disabled:opacity-40">
            Simpan Pelanggan
          </button>
        </div>
      </BottomSheet>
    </AppShell>
  );
}
