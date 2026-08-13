import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, List, Plus, BarChart2, MoreHorizontal, LayoutDashboard, Receipt, CreditCard, Tag, PieChart, Users, Settings, Heart, Bell, User, ShieldCheck } from 'lucide-react';
import type { Workspace } from '../../lib/types';
import { useWorkspace } from '../../features/workspace/WorkspaceContext';
import { useAuth } from '../../features/auth/AuthContext';
import { BottomMoreDrawer } from '../navigation/BottomMoreDrawer';
import { ProfileMenu } from '../navigation/ProfileMenu';

// ============ HEADER ============
interface HeaderProps {
  title?: string;
  showGreeting?: boolean;
  showBack?: boolean;
  showNotif?: boolean;
  showAvatar?: boolean;
  actions?: React.ReactNode;
}

export function Header({
  title,
  showGreeting = false,
  showBack = false,
  showNotif = true,
  showAvatar = true,
  actions,
}: HeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#F5F5E8] border-b-2 border-black sticky top-0 z-30 w-full overflow-hidden">
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_#111] hover:bg-[#AADD00] transition-colors"
          >
            ←
          </button>
        )}
        {showGreeting ? (
          <div className="min-w-0">
            <p className="text-xs text-[#666] font-medium truncate">Selamat datang 👋</p>
            <h1 className="text-base font-extrabold text-[#111] leading-tight truncate">{user?.name || 'Pengguna'}</h1>
          </div>
        ) : (
          <h1 className="text-base font-extrabold text-[#111] truncate">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {showNotif && (
          <NavLink
            to="/notifications"
            className="w-9 h-9 flex items-center justify-center border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_#111] relative hover:bg-[#AADD00] transition-colors"
          >
            <Bell size={16} />
            {/* Unread dot */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4D8D] rounded-full border border-white" />
          </NavLink>
        )}
        {showAvatar && user && (
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center border-2 border-black rounded-lg bg-[#AADD00] shadow-[2px_2px_0px_#111] font-extrabold text-xs text-black hover:bg-[#88bb00] transition-colors active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              {user.name.slice(0, 2).toUpperCase()}
            </button>
            <ProfileMenu 
              isOpen={isProfileMenuOpen} 
              onClose={() => setIsProfileMenuOpen(false)} 
            />
          </div>
        )}
      </div>
    </header>
  );
}

// ============ BOTTOM NAVIGATION ============
export function BottomNavigation() {
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Beranda' },
    { to: '/transactions', icon: List, label: 'Transaksi' },
    { to: '/add-transaction', icon: Plus, label: '', isFab: true },
    { to: '/accounts', icon: CreditCard, label: 'Akun' },
    { to: '#more', icon: MoreHorizontal, label: 'Lainnya', isMore: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#F5F5E8] border-t-2 border-black safe-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-3 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="w-14 h-14 bg-[#AADD00] border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#111] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all -mt-6 relative z-10"
              >
                <Plus size={24} className="text-black" strokeWidth={3} />
              </button>
            );
          }

          if (item.isMore) {
            return (
              <React.Fragment key="more">
                <button
                  onClick={() => setIsMoreOpen(true)}
                  className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all text-[#888] font-medium"
                >
                  <div className="p-1.5 rounded-lg transition-colors">
                    <item.icon size={18} strokeWidth={2} />
                  </div>
                  <span className="text-[10px]">{item.label}</span>
                </button>
                <BottomMoreDrawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
              </React.Fragment>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-black font-bold'
                    : 'text-[#888] font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[#AADD00] border-2 border-black' : ''}`}>
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px]">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

// ============ SIDEBAR (Desktop) ============
export function Sidebar() {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();

  const mainNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: Receipt, label: 'Transaksi' },
    { to: '/accounts', icon: CreditCard, label: 'Akun' },
    { to: '/categories', icon: Tag, label: 'Kategori' },
    { to: '/budget', icon: PieChart, label: 'Budget' },
    ...(currentWorkspace?.type === 'business' ? [{ to: '/customers', icon: Users, label: 'Pelanggan' }] : []),
    { to: '/reports', icon: BarChart2, label: 'Laporan' },
  ];

  const bottomNav = [
    { to: '/donations', icon: Heart, label: 'Donasi' },
    { to: '/notifications', icon: Bell, label: 'Notifikasi' },
    { to: '/settings', icon: Settings, label: 'Pengaturan' },
    ...(user?.role === 'admin' ? [{ to: '/admin', icon: ShieldCheck, label: 'Admin' }] : []),
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#F5F5E8] border-r-2 border-black flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b-2 border-black">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#AADD00] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#111]">
            <span className="font-extrabold text-xs text-black">MT</span>
          </div>
          <div>
            <p className="font-extrabold text-sm text-[#111] leading-none">MoneyTracking</p>
            <p className="text-[10px] text-[#666] font-medium">v1.0</p>
          </div>
        </div>
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher isSidebar />

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isActive
                  ? 'bg-[#AADD00] text-black border-2 border-black shadow-[2px_2px_0px_#111]'
                  : 'text-[#555] hover:bg-black/5'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="p-3 border-t-2 border-black space-y-1">
        {bottomNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isActive
                  ? 'bg-black text-white'
                  : 'text-[#555] hover:bg-black/5'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Profile */}
      <NavLink
        to="/profile"
        className="flex items-center gap-3 p-4 border-t-2 border-black hover:bg-black/5 transition-colors"
      >
        <div className="w-9 h-9 bg-[#AADD00] border-2 border-black rounded-lg flex items-center justify-center font-extrabold text-xs text-black">
          {user?.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-[#111] truncate">{user?.name}</p>
          <p className="text-[10px] text-[#666] truncate">{user?.email}</p>
        </div>
      </NavLink>
    </aside>
  );
}

// ============ WORKSPACE SWITCHER ============
export function WorkspaceSwitcher({ isSidebar = false }: { isSidebar?: boolean }) {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = React.useState(false);

  if (workspaces.length <= 1) return null;

  return (
    <div className={`relative z-20 ${isSidebar ? 'p-3 border-b-2 border-black' : ''}`}>
      {isSidebar && <p className="text-[10px] font-bold text-[#666] uppercase tracking-wide mb-2">Workspace</p>}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#111] text-sm font-bold transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span>{currentWorkspace?.type === 'personal' ? '🏠' : '💼'}</span>
          <span className="truncate">{currentWorkspace?.name}</span>
        </div>
        <span className="text-[10px] text-gray-500">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#111] overflow-hidden">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setCurrentWorkspace(ws);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-3 text-sm font-bold text-left hover:bg-[#F5F5E8] transition-colors border-b-2 border-black last:border-b-0 ${
                  currentWorkspace?.id === ws.id ? 'bg-[#AADD00]' : ''
                }`}
              >
                <span>{ws.type === 'personal' ? '🏠' : '💼'}</span>
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============ APP SHELL ============
interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto mobile-content lg:pb-0 lg:overflow-auto">
          {children}
        </main>
      </div>

      {/* Bottom Nav — mobile only */}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}

export default AppShell;
