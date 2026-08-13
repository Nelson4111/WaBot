import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, LogOut } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/States';
import { useAuth } from '../features/auth/AuthContext';
import { useWorkspace } from '../features/workspace/WorkspaceContext';
import { AppShell, Header } from '../components/layout/AppShell';
import { formatDate } from '../lib/utils';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { workspaces } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <AppShell>
      <Header
        title="Profil"
        showNotif={false}
        showAvatar={false}
        actions={
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-9 h-9 flex items-center justify-center border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_#111]"
          >
            <Edit2 size={16} />
          </button>
        }
      />

      <div className="page-container py-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center lg:items-start brutal-card p-6">
              <div className="w-24 h-24 bg-[#AADD00] border-3 border-black rounded-3xl flex items-center justify-center shadow-[5px_5px_0px_#111] mb-4 mx-auto lg:mx-0" style={{ borderWidth: '3px' }}>
                <span className="font-extrabold text-3xl text-black">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              {isEditing ? (
                <input
                  className="brutal-input text-center lg:text-left text-lg font-extrabold w-full"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              ) : (
                <h2 className="text-xl font-extrabold text-[#111] text-center lg:text-left w-full">{user?.name}</h2>
              )}
              <p className="text-sm text-[#666] mt-1 text-center lg:text-left w-full">{user?.email}</p>
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-3 w-full">
                <span className="brutal-badge">{user?.role === 'admin' ? '🛡️ Admin' : '👤 User'}</span>
              </div>
            </div>

            {/* Actions */}
            {isEditing && (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="brutal-btn brutal-btn-outline flex-1">Batal</button>
                <button onClick={() => setIsEditing(false)} className="brutal-btn brutal-btn-primary flex-1">Simpan</button>
              </div>
            )}

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="brutal-btn brutal-btn-danger w-full"
            >
              <LogOut size={16} /> Keluar dari Akun
            </button>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 space-y-5">
            {/* Info Card */}
            <div>
              <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-2 px-1">Informasi Akun</p>
              <div className="brutal-card p-4 space-y-4">
                {[
                  { label: 'Nama Lengkap', value: user?.name },
                  { label: 'Alamat Email', value: user?.email },
                  { label: 'Tanggal Bergabung', value: formatDate(user?.createdAt || '') },
                  { label: 'Mode Workspace', value: user?.workspaceMode === 'both' ? 'Pribadi & Bisnis' : user?.workspaceMode === 'personal' ? 'Pribadi' : 'Bisnis' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center border-b-2 border-dashed border-gray-200 last:border-0 pb-3 last:pb-0">
                    <span className="text-sm font-semibold text-[#666]">{row.label}</span>
                    <span className="text-sm font-extrabold text-[#111]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workspaces */}
            <div>
              <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-2 px-1">Workspace Aktif</p>
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-3">
                {workspaces.map((ws) => (
                  <div key={ws.id} className="brutal-card p-4 flex items-center gap-3">
                    <span className="text-3xl bg-[#F5F5E8] w-12 h-12 flex items-center justify-center rounded-xl border-2 border-black">{ws.type === 'personal' ? '🏠' : '💼'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-base truncate">{ws.name}</p>
                      <p className="text-xs font-semibold text-[#666]">{ws.type === 'personal' ? 'Pribadi' : 'Bisnis'} · {ws.currency}</p>
                    </div>
                    <span className="brutal-badge text-[10px] bg-[#AADD00]">Aktif</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onConfirm={() => { logout(); navigate('/'); }}
        onCancel={() => setShowLogoutConfirm(false)}
        title="Keluar?"
        message="Kamu akan keluar dari MoneyTracking."
        confirmLabel="Keluar"
        danger
      />
    </AppShell>
  );
}
