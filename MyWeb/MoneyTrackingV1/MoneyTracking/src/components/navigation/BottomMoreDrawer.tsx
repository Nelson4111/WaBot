import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Tag, PieChart, Users, Receipt, BarChart2, Heart, Settings, HelpCircle, User, ShieldCheck, LogOut } from 'lucide-react';
import { useWorkspace } from '../../features/workspace/WorkspaceContext';
import { useAuth } from '../../features/auth/AuthContext';

interface BottomMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BottomMoreDrawer({ isOpen, onClose }: BottomMoreDrawerProps) {
  const { currentWorkspace } = useWorkspace();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const menuItems = [
    { to: '/categories', icon: Tag, label: 'Kategori' },
    { to: '/budget', icon: PieChart, label: 'Budget' },
    ...(currentWorkspace?.type === 'business' ? [
      { to: '/customers', icon: Users, label: 'Pelanggan' },
      { to: '/payments', icon: Receipt, label: 'Pembayaran' }
    ] : []),
    { to: '/reports', icon: BarChart2, label: 'Laporan' },
    { to: '/donations', icon: Heart, label: 'Donasi' },
    { to: '/settings', icon: Settings, label: 'Pengaturan' },
    ...(user?.role === 'admin' ? [{ to: '/admin', icon: ShieldCheck, label: 'Admin Center' }] : []),
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5F5E8] border-t-2 border-black rounded-t-3xl shadow-[0_-4px_0_0_#111] transform transition-transform animate-in slide-in-from-bottom-full pb-safe">
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <h3 className="font-extrabold text-lg">Menu Lainnya</h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border-2 border-black rounded-xl bg-white shadow-[2px_2px_0px_#111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 p-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="flex flex-col items-center justify-center gap-2 p-3 border-2 border-black rounded-2xl bg-white shadow-[2px_2px_0px_#111] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-[#AADD00] border-2 border-black rounded-xl">
                <item.icon size={20} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-bold text-center">{item.label}</span>
            </NavLink>
          ))}
          {/* Quick Help/Logout Actions could go here, but kept separate to match old app */}
        </div>
      </div>
    </>
  );
}
