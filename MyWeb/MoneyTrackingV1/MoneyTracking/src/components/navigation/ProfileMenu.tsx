import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Shield, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement | null; // Used for positioning if needed
}

export function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute right-4 top-16 w-64 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#111] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
        {/* User Info Header */}
        <div className="p-4 border-b-2 border-black bg-[#F5F5E8]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#AADD00] border-2 border-black rounded-xl flex items-center justify-center font-extrabold text-lg text-black shadow-[2px_2px_0px_#111]">
              {user?.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-[#111] truncate">{user?.name}</p>
              <p className="text-[11px] font-medium text-[#666] truncate">{user?.email}</p>
              <div className="mt-1 inline-block px-2 py-0.5 bg-[#FF4D8D] border border-black rounded text-[9px] font-bold text-white uppercase tracking-wider">
                {user?.role === 'admin' ? 'Admin' : 'Pro Member'}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F5E8] transition-colors"
          >
            <User size={18} className="text-[#555]" />
            <span className="font-bold text-sm">Informasi Akun</span>
          </NavLink>
          <NavLink
            to="/security"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F5E8] transition-colors"
          >
            <Shield size={18} className="text-[#555]" />
            <span className="font-bold text-sm">Keamanan</span>
          </NavLink>
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F5E8] transition-colors"
          >
            <Settings size={18} className="text-[#555]" />
            <span className="font-bold text-sm">Pengaturan</span>
          </NavLink>
          <div className="h-px bg-black/10 my-1 mx-4" />
          <a
            href="https://wa.me/6281241100804"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F5E8] transition-colors"
          >
            <HelpCircle size={18} className="text-[#555]" />
            <span className="font-bold text-sm">Bantuan Admin</span>
          </a>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#FF4D8D]/10 text-[#FF4D8D] transition-colors text-left"
          >
            <LogOut size={18} />
            <span className="font-bold text-sm">Keluar</span>
          </button>
        </div>
      </div>
    </>
  );
}
