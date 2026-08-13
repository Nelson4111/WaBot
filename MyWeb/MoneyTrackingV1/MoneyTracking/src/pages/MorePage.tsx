import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Tag, PieChart, Users, Heart, Bell, Settings, User, Trophy, ShieldCheck } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/AppShell';
import { useAuth } from '../features/auth/AuthContext';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  to: string;
  color?: string;
  badge?: string;
}

function MenuItem({ icon, label, sublabel, to, color = 'bg-white', badge }: MenuItemProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`${color} brutal-card p-3.5 flex items-center gap-3 w-full text-left`}
    >
      <div className="w-10 h-10 bg-black/10 border-2 border-black rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm text-[#111]">{label}</p>
        {sublabel && <p className="text-xs text-[#666]">{sublabel}</p>}
      </div>
      {badge && (
        <span className="brutal-badge text-[10px] bg-[#AADD00]">{badge}</span>
      )}
    </button>
  );
}

export default function MorePage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <Header title="Lainnya" showNotif showAvatar />
      <div className="px-4 py-4 space-y-5 pb-8">

        {/* Fitur Utama */}
        <div>
          <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-2">Fitur</p>
          <div className="space-y-2">
            <MenuItem icon={<CreditCard size={18} />} label="Akun" sublabel="Kelola akun keuangan" to="/accounts" />
            <MenuItem icon={<Tag size={18} />} label="Kategori" sublabel="Atur kategori transaksi" to="/categories" />
            <MenuItem icon={<PieChart size={18} />} label="Budget" sublabel="Monitor pengeluaran" to="/budget" />
            <MenuItem icon={<Users size={18} />} label="Pelanggan" sublabel="Fitur bisnis" to="/customers" color="bg-[#AADD00]/30" badge="Bisnis" />
          </div>
        </div>

        {/* Komunitas */}
        <div>
          <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-2">Komunitas</p>
          <div className="space-y-2">
            <MenuItem icon={<Heart size={18} />} label="Donasi" sublabel="Dukung MoneyTracking" to="/donations" color="bg-[#FF4D8D]/10" />
            <MenuItem icon={<Trophy size={18} />} label="Top Supporters" sublabel="Leaderboard donatur" to="/donations/leaderboard" />
          </div>
        </div>

        {/* Akun & Sistem */}
        <div>
          <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-2">Akun</p>
          <div className="space-y-2">
            <MenuItem icon={<Bell size={18} />} label="Notifikasi" sublabel="Pengingat & pengumuman" to="/notifications" />
            <MenuItem icon={<User size={18} />} label="Profil" sublabel={user?.email} to="/profile" />
            <MenuItem icon={<Settings size={18} />} label="Pengaturan" sublabel="Konfigurasi aplikasi" to="/settings" />
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <MenuItem icon={<ShieldCheck size={18} />} label="Admin Panel" sublabel="Manajemen sistem" to="/admin" color="bg-black/5" />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
