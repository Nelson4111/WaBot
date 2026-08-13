import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Check, CheckCheck } from 'lucide-react';
import { mockNotifications } from '../lib/mock-data';
import { formatRelativeDate } from '../lib/utils';
import type { Notification } from '../lib/types';

const typeConfig = {
  info: { icon: 'ℹ️', bg: 'bg-blue-50', border: 'border-blue-300', label: 'Info' },
  warning: { icon: '⚠️', bg: 'bg-amber-50', border: 'border-amber-400', label: 'Peringatan' },
  success: { icon: '✅', bg: 'bg-green-50', border: 'border-green-400', label: 'Sukses' },
  announcement: { icon: '📢', bg: 'bg-[#F5F5E8]', border: 'border-black', label: 'Pengumuman' },
  donation_reminder: { icon: '❤️', bg: 'bg-pink-50', border: 'border-pink-400', label: 'Donasi' },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="min-h-screen bg-[#F5F5E8]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#F5F5E8] border-b-2 border-black sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_#111]">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <h1 className="font-extrabold text-base">Notifikasi</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-extrabold bg-[#FF4D8D] text-white border border-black rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-bold text-[#555] hover:text-[#111]">
            <CheckCheck size={14} /> Tandai semua
          </button>
        )}
      </header>

      <div className="page-container py-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Bell size={48} className="text-gray-300 mb-3" />
            <p className="font-bold text-[#666]">Tidak ada notifikasi</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const cfg = typeConfig[notif.type];
            return (
              <div
                key={notif.id}
                className={`brutal-card p-4 ${!notif.isRead ? 'border-l-4' : ''} ${cfg.border} cursor-pointer`}
                style={!notif.isRead ? { borderLeftColor: 'var(--color-primary)' } : {}}
                onClick={() => markRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-extrabold text-sm text-[#111]">{notif.title}</p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-[#FF4D8D] rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#555] leading-relaxed">{notif.body}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-[#888]">{formatRelativeDate(notif.createdAt)}</span>
                      <span className="brutal-badge text-[10px]">{cfg.label}</span>
                    </div>
                  </div>
                  {notif.isRead && <Check size={14} className="text-gray-400 flex-shrink-0" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
