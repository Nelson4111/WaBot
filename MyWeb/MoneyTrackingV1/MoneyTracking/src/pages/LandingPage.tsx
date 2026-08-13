import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BarChart2, Users, Heart, Star, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5E8]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      {/* ===== NAVBAR ===== */}
      <nav className="flex items-center justify-between px-5 py-4 border-b-2 border-black bg-[#F5F5E8] sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#AADD00] border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_#111]">
            <span className="font-extrabold text-xs text-black">MT</span>
          </div>
          <span className="font-extrabold text-base text-[#111]">MoneyTracking</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="brutal-btn brutal-btn-outline brutal-btn-sm"
          >
            Masuk
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="brutal-btn brutal-btn-primary brutal-btn-sm"
          >
            Mulai Gratis
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="px-5 pt-12 pb-10 max-w-2xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white border-2 border-black rounded-full px-4 py-1.5 shadow-[2px_2px_0px_#111] mb-6">
          <div className="w-2 h-2 bg-[#AADD00] rounded-full animate-pulse" />
          <span className="text-xs font-bold text-[#111]">Free & Open Source · v1.0</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111] leading-tight mb-4">
          Catat Keuangan{' '}
          <span className="inline-block bg-[#AADD00] border-2 border-black px-2 rounded-lg shadow-[3px_3px_0px_#111]">
            Pribadi
          </span>{' '}
          &{' '}
          <span className="inline-block bg-[#FF4D8D] border-2 border-black px-2 rounded-lg shadow-[3px_3px_0px_#111] text-white">
            Bisnis
          </span>
          <br />dalam Satu Aplikasi
        </h1>

        <p className="text-base text-[#555] max-w-md mx-auto leading-relaxed mb-8">
          MoneyTracking membantu kamu mencatat pemasukan, pengeluaran, dan mengelola keuangan
          dengan cepat, mudah, dan tetap privasi terjaga.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/onboarding')}
            className="brutal-btn brutal-btn-primary brutal-btn-lg w-full sm:w-auto"
          >
            Mulai Sekarang <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="brutal-btn brutal-btn-outline brutal-btn-lg w-full sm:w-auto"
          >
            Sudah punya akun? Masuk
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 mt-8 text-xs text-[#666] font-semibold">
          <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-600" /> Gratis selamanya</span>
          <span className="flex items-center gap-1"><Shield size={12} className="text-blue-600" /> Data aman</span>
          <span className="flex items-center gap-1"><Zap size={12} className="text-amber-600" /> Cepat & ringan</span>
        </div>
      </section>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <section className="px-5 max-w-sm mx-auto mb-12">
        <div className="brutal-card-lg overflow-hidden p-0">
          {/* Fake phone frame */}
          <div className="bg-[#AADD00] border-b-2 border-black px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-black" />
            <div className="w-2 h-2 rounded-full bg-black/40" />
            <div className="w-2 h-2 rounded-full bg-black/40" />
            <span className="ml-2 text-xs font-bold text-black">MoneyTracking — Dashboard</span>
          </div>
          <div className="p-4 space-y-3">
            {/* Balance card */}
            <div className="bg-black rounded-xl p-4 text-white">
              <p className="text-xs text-gray-400 mb-1">Total Saldo</p>
              <p className="text-2xl font-extrabold">Rp9.475.000</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-white/10 rounded-lg p-2.5">
                  <p className="text-[10px] text-gray-400">Pemasukan</p>
                  <p className="text-sm font-bold text-[#AADD00]">+Rp5,5jt</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2.5">
                  <p className="text-[10px] text-gray-400">Pengeluaran</p>
                  <p className="text-sm font-bold text-[#FF4D8D]">-Rp1,7jt</p>
                </div>
              </div>
            </div>
            {/* Quick tx */}
            {[
              { icon: '🍜', name: 'Makan Siang', cat: 'Makanan', amt: '-Rp45.000', color: 'text-red-500' },
              { icon: '💵', name: 'Gaji Agustus', cat: 'Pemasukan', amt: '+Rp5.000.000', color: 'text-green-600' },
              { icon: '🚗', name: 'Bensin', cat: 'Transportasi', amt: '-Rp50.000', color: 'text-red-500' },
            ].map((tx, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-base">{tx.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-[#111] truncate">{tx.name}</p>
                  <p className="text-[10px] text-[#888]">{tx.cat}</p>
                </div>
                <p className={`text-[11px] font-extrabold ${tx.color}`}>{tx.amt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="px-5 max-w-2xl mx-auto mb-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-[#111] mb-2">
            Semua yang kamu butuhkan,{' '}
            <span className="bg-[#AADD00] px-1 rounded">dalam satu tempat</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: '⚡', title: 'Catat Cepat', desc: 'Tambah transaksi dalam hitungan detik. Desain yang efisien untuk penggunaan sehari-hari.' },
            { icon: '📊', title: 'Laporan Visual', desc: 'Lihat ringkasan keuangan dengan chart yang mudah dibaca di layar kecil sekalipun.' },
            { icon: '🎯', title: 'Budget & Target', desc: 'Set budget per kategori dan pantau penggunaan agar tidak over budget.' },
            { icon: '🏦', title: 'Multi Akun', desc: 'Kelola semua akun: Bank, E-Wallet, Cash, Kartu Kredit dalam satu dashboard.' },
            { icon: '💼', title: 'Mode Bisnis', desc: 'Kelola pelanggan, catat piutang, dan pisahkan keuangan bisnis dari pribadi.' },
            { icon: '🔒', title: 'Data Kamu, Kontrol Kamu', desc: 'Data tersimpan aman dengan Row Level Security. Tidak ada iklan, tidak ada tracking.' },
          ].map((f, i) => (
            <div key={i} className="brutal-card p-4">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-extrabold text-sm text-[#111] mb-1.5">{f.title}</h3>
              <p className="text-xs text-[#666] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PERSONAL VS BUSINESS ===== */}
      <section className="px-5 max-w-2xl mx-auto mb-14">
        <h2 className="text-2xl font-extrabold text-[#111] mb-6 text-center">
          Untuk Pribadi <span className="text-[#888]">&</span> Bisnis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Personal */}
          <div className="brutal-card-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏠</span>
              <h3 className="font-extrabold text-base">Pribadi</h3>
            </div>
            <ul className="space-y-2">
              {['Dashboard ringkasan', 'Transaksi harian', 'Budget bulanan', 'Laporan pengeluaran', 'Multi akun (BCA, DANA, OVO)'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#444]">
                  <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          {/* Business */}
          <div className="brutal-card-lg p-5 bg-[#AADD00]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💼</span>
              <h3 className="font-extrabold text-base">Bisnis</h3>
            </div>
            <ul className="space-y-2">
              {['Semua fitur Pribadi', 'Manajemen pelanggan', 'Catatan piutang', 'Laporan bisnis', 'Workspace terpisah'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#111]">
                  <CheckCircle2 size={14} className="text-black flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== SECURITY ===== */}
      <section className="px-5 max-w-2xl mx-auto mb-14">
        <div className="brutal-card p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 bg-[#AADD00] border-2 border-black rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_#111]">
            <Shield size={28} className="text-black" />
          </div>
          <div>
            <h3 className="font-extrabold text-base mb-2">Keamanan & Privasi</h3>
            <p className="text-sm text-[#555] leading-relaxed">
              Data kamu diproteksi dengan Row Level Security (RLS). Login menggunakan Google — tanpa password yang perlu diingat.
              Kamu sepenuhnya mengontrol data kamu.
            </p>
          </div>
        </div>
      </section>

      {/* ===== DONATION ===== */}
      <section className="px-5 max-w-2xl mx-auto mb-14">
        <div className="brutal-card-lg p-6 bg-[#FF4D8D] text-white text-center">
          <Heart size={32} className="mx-auto mb-3 fill-white" />
          <h2 className="text-xl font-extrabold mb-2">Dukung MoneyTracking</h2>
          <p className="text-sm text-white/80 mb-5 leading-relaxed max-w-sm mx-auto">
            MoneyTracking sepenuhnya gratis. Jika aplikasi ini membantu, pertimbangkan untuk berdonasi
            agar pengembangan bisa terus berlanjut.
          </p>
          <button
            onClick={() => navigate('/donations')}
            className="brutal-btn bg-white text-[#FF4D8D] border-black"
          >
            ❤️ Berdonasi Sekarang
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t-2 border-black px-5 py-8 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#AADD00] border-2 border-black rounded-lg flex items-center justify-center">
              <span className="font-extrabold text-[10px] text-black">MT</span>
            </div>
            <span className="font-extrabold text-sm text-[#111]">MoneyTracking</span>
          </div>
          <p className="text-xs text-[#666]">
            Dibuat dengan ❤️ · Gratis & Open Source · 2025
          </p>
          <div className="flex gap-4 text-xs font-semibold text-[#666]">
            <button onClick={() => navigate('/settings')} className="hover:text-[#111]">Privasi</button>
            <button onClick={() => navigate('/donations')} className="hover:text-[#111]">Donasi</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
