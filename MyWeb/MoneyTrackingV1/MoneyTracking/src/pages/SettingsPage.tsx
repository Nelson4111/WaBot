import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, User, Bell, Palette, Globe, Tag, Shield, Info, Lock } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Header } from '../components/layout/AppShell';
import { ConfirmDialog } from '../components/ui/States';
import { useAuth } from '../features/auth/AuthContext';
import { useWorkspace } from '../features/workspace/WorkspaceContext';

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick?: () => void;
  danger?: boolean;
  badge?: string;
}

function SettingItem({ icon, label, subtitle, onClick, danger = false, badge }: SettingItemProps) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-black/5 transition-colors ${danger ? 'text-red-600' : 'text-[#111]'}`}
      onClick={onClick}
    >
      <div className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-100' : 'bg-white'}`}>
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`text-sm font-semibold ${danger ? 'text-red-600' : 'text-[#111]'}`}>{label}</p>
        {subtitle && <p className="text-xs text-[#888] truncate">{subtitle}</p>}
      </div>
      {badge && (
        <span className="text-xs font-bold bg-[#AADD00] border border-black rounded-full px-2 py-0.5">{badge}</span>
      )}
      <ChevronRight size={14} className={danger ? 'text-red-400' : 'text-[#ccc]'} />
    </button>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest px-4 mb-1">{title}</p>
      <div className="brutal-card overflow-hidden p-0 divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentWorkspace, workspaces } = useWorkspace();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppShell>
      <Header title="Pengaturan" showNotif={false} showAvatar={false} />

      <div className="page-container py-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-start">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Profile Quick View */}
            <button
              onClick={() => navigate('/profile')}
              className="brutal-card-lg p-4 flex items-center gap-3 w-full"
            >
              <div className="w-14 h-14 bg-[#AADD00] border-2 border-black rounded-2xl flex items-center justify-center font-extrabold text-lg text-black flex-shrink-0">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <p className="font-extrabold text-base text-[#111]">{user?.name}</p>
                <p className="text-xs text-[#666]">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold bg-[#AADD00] border border-black rounded-full px-2 py-0.5">
                    {currentWorkspace?.type === 'personal' ? '🏠 Pribadi' : '💼 Bisnis'}
                  </span>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#888]" />
            </button>

            {/* Account */}
            <SettingSection title="Akun">
              <SettingItem icon={<User size={14} />} label="Profil" subtitle="Nama, foto, informasi" onClick={() => navigate('/profile')} />
              <SettingItem icon={<Globe size={14} />} label="Workspace" subtitle={`${workspaces.length} workspace aktif`} onClick={() => {}} />
              <SettingItem icon={<Globe size={14} />} label="Mata Uang" subtitle="Rupiah (IDR)" onClick={() => {}} />
            </SettingSection>

            {/* App Settings */}
            <SettingSection title="Aplikasi">
              <SettingItem icon={<Bell size={14} />} label="Notifikasi" subtitle="Pengingat, pengumuman" onClick={() => navigate('/notifications')} />
              <SettingItem icon={<Palette size={14} />} label="Tampilan" subtitle="Tema, ukuran font" onClick={() => {}} />
              <SettingItem icon={<Tag size={14} />} label="Kategori Default" subtitle="Kelola kategori sistem" onClick={() => navigate('/categories')} />
            </SettingSection>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Keamanan */}
            <SettingSection title="Keamanan & Privasi">
              <SettingItem icon={<Shield size={14} />} label="Keamanan" subtitle="Data & akses aplikasi" onClick={() => {}} />
              <SettingItem icon={<Lock size={14} />} label="Kebijakan Privasi" onClick={() => {}} />
            </SettingSection>

            {/* About */}
            <SettingSection title="Tentang">
              <SettingItem icon={<Info size={14} />} label="Tentang MoneyTracking" subtitle="Versi 1.0.0" onClick={() => {}} />
              <SettingItem icon={<span>❤️</span>} label="Donasi" subtitle="Dukung pengembangan app" onClick={() => navigate('/donations')} badge="Free" />
            </SettingSection>

            {/* Logout */}
            <div className="brutal-card overflow-hidden p-0">
              <SettingItem
                icon={<LogOut size={14} />}
                label="Keluar"
                subtitle="Logout dari akun Google"
                onClick={() => setShowLogoutConfirm(true)}
                danger
              />
            </div>

            <p className="text-[10px] text-[#aaa] text-center pt-2">MoneyTracking v1.0.0 · Made with ❤️</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        title="Keluar?"
        message="Kamu akan keluar dari MoneyTracking. Data lokal tidak akan terhapus."
        confirmLabel="Keluar"
        danger
      />
    </AppShell>
  );
}
