import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, DollarSign, Activity, Shield, FileText, Settings, CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { mockAdminStats, mockDonations } from '../lib/mock-data';
import { formatCurrency, formatDate } from '../lib/utils';
import { AppShell } from '../components/layout/AppShell';

const statusConfig = {
  pending: { label: 'Pending', color: 'text-amber-600 bg-amber-100', icon: Clock },
  approved: { label: 'Disetujui', color: 'text-green-700 bg-green-100', icon: CheckCircle2 },
  rejected: { label: 'Ditolak', color: 'text-red-600 bg-red-100', icon: XCircle },
};

function AdminStatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="brutal-card p-4">
      <div className={`w-9 h-9 ${color} border-2 border-black rounded-lg flex items-center justify-center mb-3`}>
        <Icon size={16} />
      </div>
      <p className="text-2xl font-extrabold text-[#111]">{value}</p>
      <p className="text-xs font-semibold text-[#666] mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'overview' | 'donations' | 'users' | 'logs'>('overview');

  const stats = mockAdminStats;

  return (
    <AppShell>
      {/* Admin Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-black border-b-2 border-black">
        <button onClick={() => navigate('/dashboard')} className="w-9 h-9 border-2 border-white/30 rounded-lg bg-white/10 flex items-center justify-center">
          <ArrowLeft size={16} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Shield size={14} className="text-[#AADD00]" />
            Admin Dashboard
          </h1>
          <p className="text-[10px] text-gray-400">MoneyTracking System</p>
        </div>
        <div className="w-8 h-8 bg-[#FF4D8D] border-2 border-white/30 rounded-lg flex items-center justify-center">
          <span className="text-[10px] font-extrabold text-white">ADM</span>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="bg-amber-400 border-b-2 border-black px-4 py-2 flex items-center gap-2">
        <Shield size={14} className="text-black flex-shrink-0" />
        <p className="text-xs font-bold text-black">Area Terbatas — Hanya untuk Admin yang sah</p>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b-2 border-black bg-white overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'donations', label: 'Donasi', icon: DollarSign },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'logs', label: 'Logs', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-r-2 border-black whitespace-nowrap transition-colors ${
              activeSection === tab.id ? 'bg-[#AADD00] text-black' : 'text-[#666] hover:bg-gray-50'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-5 pb-10">

        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
              <AdminStatCard icon={Users} label="Total Users" value={stats.totalUsers.toString()} color="bg-[#AADD00]" />
              <AdminStatCard icon={Activity} label="Aktif" value={stats.activeUsers.toString()} color="bg-blue-100" />
              <AdminStatCard icon={DollarSign} label="Total Donasi" value={formatCurrency(stats.totalDonations, true)} color="bg-[#FF4D8D]" />
              <AdminStatCard icon={Clock} label="Pending Verif." value={stats.pendingDonations.toString()} color="bg-amber-100" />
            </div>

            {/* System Status */}
            <div className="brutal-card p-4">
              <h3 className="font-extrabold text-sm mb-3">🟢 Status Sistem</h3>
              <div className="space-y-2">
                {[
                  { name: 'API Server', status: 'Online', ok: true },
                  { name: 'Database', status: 'Online', ok: true },
                  { name: 'Auth Service', status: 'Online', ok: true },
                  { name: 'Bot Service', status: 'Offline', ok: false },
                ].map((sys) => (
                  <div key={sys.name} className="flex items-center justify-between py-1.5">
                    <span className="text-sm font-semibold text-[#333]">{sys.name}</span>
                    <span className={`brutal-badge text-[10px] ${sys.ok ? 'bg-green-100 text-green-700 border-green-500' : 'bg-red-100 text-red-700 border-red-500'}`}>
                      {sys.ok ? '●' : '●'} {sys.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DONATIONS */}
        {activeSection === 'donations' && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="brutal-card-sm p-3 text-center">
                <p className="text-lg font-extrabold text-green-700">{stats.approvedDonations}</p>
                <p className="text-[10px] font-bold text-[#666]">Disetujui</p>
              </div>
              <div className="brutal-card-sm p-3 text-center">
                <p className="text-lg font-extrabold text-amber-600">{stats.pendingDonations}</p>
                <p className="text-[10px] font-bold text-[#666]">Pending</p>
              </div>
              <div className="brutal-card-sm p-3 text-center">
                <p className="text-lg font-extrabold text-[#111]">{formatCurrency(stats.totalDonations, true)}</p>
                <p className="text-[10px] font-bold text-[#666]">Total</p>
              </div>
            </div>

            <div className="brutal-card overflow-hidden p-0">
              <div className="px-4 py-3 bg-black border-b-2 border-black">
                <p className="text-xs font-extrabold text-white">Daftar Donasi</p>
              </div>
              <div className="divide-y divide-gray-100">
                {mockDonations.map((donation) => {
                  const cfg = statusConfig[donation.status];
                  return (
                    <div key={donation.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{donation.displayName}</p>
                        <p className="text-xs text-[#888]">{formatDate(donation.createdAt)}</p>
                      </div>
                      <p className="font-extrabold text-sm text-[#111]">{formatCurrency(donation.amount, true)}</p>
                      <span className={`brutal-badge text-[10px] ${cfg.color}`}>{cfg.label}</span>
                      {donation.status === 'pending' && (
                        <div className="flex gap-1">
                          <button className="w-7 h-7 bg-green-500 border-2 border-black rounded-md flex items-center justify-center text-white text-xs">✓</button>
                          <button className="w-7 h-7 bg-red-500 border-2 border-black rounded-md flex items-center justify-center text-white text-xs">✕</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* USERS */}
        {activeSection === 'users' && (
          <div className="space-y-3">
            <div className="brutal-card overflow-hidden p-0">
              <div className="px-4 py-3 bg-black border-b-2 border-black">
                <p className="text-xs font-extrabold text-white">Manajemen User</p>
              </div>
              {[
                { name: 'Budi Santoso', email: 'budi@example.com', role: 'user', joined: '2025-01-15', active: true },
                { name: 'Admin MoneyTracking', email: 'admin@moneytracking.app', role: 'admin', joined: '2024-12-01', active: true },
                { name: 'Siti Rahayu', email: 'siti@email.com', role: 'user', joined: '2025-03-10', active: true },
                { name: 'Ahmad Fauzi', email: 'ahmad@email.com', role: 'user', joined: '2025-05-20', active: false },
              ].map((user, i) => (
                <div key={i} className="px-4 py-3 border-b border-gray-100 last:border-b-0 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 border-2 border-black rounded-lg flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-[#888] truncate">{user.email}</p>
                  </div>
                  <span className={`brutal-badge text-[10px] ${user.role === 'admin' ? 'bg-[#AADD00]' : 'bg-white'}`}>{user.role}</span>
                  <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOGS */}
        {activeSection === 'logs' && (
          <div className="space-y-3">
            <div className="brutal-card overflow-hidden p-0">
              <div className="px-4 py-3 bg-black border-b-2 border-black">
                <p className="text-xs font-extrabold text-white">Audit Logs</p>
              </div>
              {[
                { who: 'Admin', what: 'Approve donasi Nelson', when: '2025-08-09 09:00' },
                { who: 'Admin', what: 'Update system config', when: '2025-08-08 14:30' },
                { who: 'System', what: 'User budi@example.com registered', when: '2025-08-01 08:00' },
                { who: 'System', what: 'Scheduled maintenance completed', when: '2025-07-31 02:00' },
              ].map((log, i) => (
                <div key={i} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-extrabold text-[#111]">{log.who}</span>
                    <span className="text-[10px] text-[#888]">{log.when}</span>
                  </div>
                  <p className="text-xs text-[#555]">{log.what}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
