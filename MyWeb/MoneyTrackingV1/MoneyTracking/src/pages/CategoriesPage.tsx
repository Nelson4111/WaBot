import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/AppShell';
import { Tabs } from '../components/ui/Tabs';
import { CategoryCard } from '../components/finance/FinanceCards';
import { EmptyState } from '../components/ui/States';
import { BottomSheet } from '../components/ui/Modal';
import { mockCategories } from '../lib/mock-data';
import type { Category } from '../lib/types';

const categoryIcons = ['🍜', '🚗', '🛍️', '💊', '🎮', '🧾', '📚', '💆', '📡', '📦', '💵', '🎁', '💻', '📈', '🎀', '🏪', '🏠', '✈️', '🐾', '⚽', '🍕', '☕', '🎵', '💡'];

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [newCat, setNewCat] = useState({ name: '', icon: '📦', type: 'expense' });

  const filtered = mockCategories.filter((c) => c.type === activeTab && c.isActive);

  const tabs = [
    { id: 'expense', label: '📤 Pengeluaran' },
    { id: 'income', label: '📥 Pemasukan' },
  ];

  return (
    <AppShell>
      <Header title="Kategori" showNotif={false} showAvatar={false} />

      <div className="page-container py-4 space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as 'expense' | 'income')} />

        {/* Stats */}
        <div className="flex items-center gap-2">
          <div className="brutal-badge">{filtered.length} Kategori</div>
          <div className="brutal-badge">{filtered.filter((c) => c.isDefault).length} Default</div>
          <div className="brutal-badge">{filtered.filter((c) => !c.isDefault).length} Custom</div>
        </div>

        <button
          onClick={() => setShowAddSheet(true)}
          className="brutal-btn brutal-btn-black w-full"
        >
          <Plus size={16} /> Tambah Kategori
        </button>

        {/* Default categories */}
        <div>
          <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-2">Default</p>
          <div className="grid grid-cols-2 gap-2">
            {filtered.filter((c) => c.isDefault).map((cat) => (
              <CategoryCard key={cat.id} category={cat} onClick={setSelectedCat} onEdit={setSelectedCat} />
            ))}
          </div>
        </div>

        {/* Custom categories */}
        {filtered.filter((c) => !c.isDefault).length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-2">Custom</p>
            <div className="grid grid-cols-2 gap-2">
              {filtered.filter((c) => !c.isDefault).map((cat) => (
                <CategoryCard key={cat.id} category={cat} onClick={setSelectedCat} onEdit={setSelectedCat} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <EmptyState icon="🏷️" title="Belum ada kategori" description="Tambah kategori baru untuk mulai mencatat." />
        )}
      </div>

      {/* Add Sheet */}
      <BottomSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} title="Tambah Kategori">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1.5">Nama Kategori</label>
            <input
              className="brutal-input"
              placeholder="cth. Langganan Netflix"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">Tipe</label>
            <div className="flex gap-2">
              {['expense', 'income'].map((type) => (
                <button
                  key={type}
                  onClick={() => setNewCat({ ...newCat, type })}
                  className={`flex-1 py-2.5 rounded-lg border-2 border-black text-sm font-bold transition-all ${
                    newCat.type === type ? 'bg-[#AADD00]' : 'bg-white'
                  }`}
                >
                  {type === 'expense' ? '📤 Pengeluaran' : '📥 Pemasukan'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5">Pilih Icon</label>
            <div className="grid grid-cols-8 gap-1.5">
              {categoryIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewCat({ ...newCat, icon })}
                  className={`w-9 h-9 rounded-lg border-2 border-black text-lg flex items-center justify-center transition-all ${
                    newCat.icon === icon ? 'bg-[#AADD00] shadow-[2px_2px_0px_#111]' : 'bg-white'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <button
            disabled={!newCat.name}
            className="brutal-btn brutal-btn-primary w-full disabled:opacity-40"
          >
            Simpan Kategori
          </button>
        </div>
      </BottomSheet>

      {/* Edit Sheet */}
      <BottomSheet isOpen={!!selectedCat} onClose={() => setSelectedCat(null)} title="Edit Kategori">
        {selectedCat && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-xl">
              <div className="text-3xl">{selectedCat.icon}</div>
              <div>
                <p className="font-extrabold">{selectedCat.name}</p>
                <p className="text-xs text-[#666]">{selectedCat.isDefault ? 'Kategori Default' : 'Kategori Custom'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!selectedCat.isDefault && (
                <>
                  <button className="brutal-btn brutal-btn-primary flex-1">Edit</button>
                  <button className="brutal-btn brutal-btn-danger">Nonaktifkan</button>
                </>
              )}
              {selectedCat.isDefault && (
                <p className="text-xs text-[#666] text-center w-full py-2">
                  Kategori default tidak dapat diedit atau dihapus.
                </p>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </AppShell>
  );
}
