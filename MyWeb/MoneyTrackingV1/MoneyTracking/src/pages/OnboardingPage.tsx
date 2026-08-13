import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import type { WorkspaceType } from '../lib/types';

type WorkspaceMode = 'personal' | 'business' | 'both';

const steps = ['Selamat Datang', 'Pilih Mode', 'Konfigurasi', 'Selesai'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<WorkspaceMode | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [businessName, setBusinessName] = useState('');

  const next = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else navigate('/dashboard');
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <div className="min-h-screen bg-[#F5F5E8] flex flex-col items-center justify-center px-5 py-12"
      style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
    >
      {/* Progress indicator */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex items-center gap-2 mb-2">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex-none w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-xs font-extrabold transition-all ${
                i < step ? 'bg-[#AADD00]' : i === step ? 'bg-black text-white' : 'bg-white text-[#888]'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < step ? 'bg-[#AADD00] border border-black' : 'bg-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs font-bold text-[#666]">Langkah {step + 1} dari {steps.length}: <span className="text-[#111]">{steps[step]}</span></p>
      </div>

      {/* Card */}
      <div className="brutal-card-lg p-6 w-full max-w-sm animate-slide-up">

        {/* STEP 0: Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="text-5xl mb-4">👋</div>
            <h1 className="text-2xl font-extrabold text-[#111] mb-3">
              Selamat Datang di <br />
              <span className="bg-[#AADD00] px-2 rounded border border-black">MoneyTracking!</span>
            </h1>
            <p className="text-sm text-[#555] leading-relaxed mb-6">
              Aplikasi pencatatan keuangan pribadi dan bisnis yang simpel, cepat, dan aman.
              Mari setup akun kamu dalam 3 langkah mudah.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: '⚡', text: 'Catat transaksi cepat' },
                { icon: '📊', text: 'Laporan otomatis' },
                { icon: '🎯', text: 'Budget monitoring' },
                { icon: '🔒', text: 'Data aman & privat' },
              ].map((item) => (
                <div key={item.text} className="brutal-card-sm p-2.5 flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-semibold text-[#444]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Mode */}
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-[#111] mb-2">Pilih Mode Penggunaan</h2>
              <p className="text-sm text-[#666]">Kamu bisa mengubah ini kapan saja di Pengaturan.</p>
            </div>
            <div className="space-y-3">
              {[
                { mode: 'personal' as WorkspaceMode, icon: '🏠', title: 'Pribadi', desc: 'Catat keuangan sehari-hari, budget, dan tabungan pribadi.' },
                { mode: 'business' as WorkspaceMode, icon: '💼', title: 'Bisnis', desc: 'Kelola keuangan usaha, pelanggan, dan laporan bisnis.' },
                { mode: 'both' as WorkspaceMode, icon: '🏠💼', title: 'Keduanya', desc: 'Workspace terpisah untuk pribadi dan bisnis dalam satu akun.' },
              ].map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => setMode(opt.mode)}
                  className={`w-full text-left p-4 rounded-xl border-2 border-black transition-all ${
                    mode === opt.mode
                      ? 'bg-[#AADD00] shadow-[3px_3px_0px_#111]'
                      : 'bg-white hover:bg-gray-50 shadow-[2px_2px_0px_#111]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-[#111]">{opt.title}</p>
                      <p className="text-xs text-[#555] mt-0.5">{opt.desc}</p>
                    </div>
                    {mode === opt.mode && (
                      <CheckCircle2 size={18} className="text-black flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Config */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-[#111] mb-2">Konfigurasi Awal</h2>
              <p className="text-sm text-[#666]">Beri nama workspace kamu.</p>
            </div>
            <div className="space-y-4">
              {(mode === 'personal' || mode === 'both') && (
                <div>
                  <label className="block text-sm font-bold text-[#111] mb-1.5">🏠 Nama Workspace Pribadi</label>
                  <input
                    className="brutal-input"
                    placeholder="cth. Keuangan Budi"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>
              )}
              {(mode === 'business' || mode === 'both') && (
                <div>
                  <label className="block text-sm font-bold text-[#111] mb-1.5">💼 Nama Usaha</label>
                  <input
                    className="brutal-input"
                    placeholder="cth. Warung Makan Budi"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-[#111] mb-1.5">💱 Mata Uang</label>
                <select className="brutal-input">
                  <option value="IDR">🇮🇩 Rupiah (IDR)</option>
                  <option value="USD">🇺🇸 US Dollar (USD)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Done */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#AADD00] border-3 border-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#111]" style={{ borderWidth: '3px' }}>
              <CheckCircle2 size={28} className="text-black" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#111] mb-3">
              Setup Selesai! 🎉
            </h2>
            <p className="text-sm text-[#555] leading-relaxed mb-6">
              Akun kamu sudah siap. Sekarang mulai catat transaksi pertamamu!
            </p>
            <div className="brutal-card-sm p-3 text-left space-y-2 mb-6">
              <p className="text-xs font-bold text-[#666] uppercase">Ringkasan Setup</p>
              <div className="flex justify-between text-sm">
                <span className="text-[#666]">Mode</span>
                <span className="font-bold">{mode === 'personal' ? '🏠 Pribadi' : mode === 'business' ? '💼 Bisnis' : '🏠💼 Keduanya'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#666]">Mata Uang</span>
                <span className="font-bold">🇮🇩 IDR</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={back} className="brutal-btn brutal-btn-outline flex-none">
              <ArrowLeft size={16} />
            </button>
          )}
          <button
            onClick={next}
            disabled={step === 1 && !mode}
            className={`brutal-btn brutal-btn-primary flex-1 ${step === 1 && !mode ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {step === steps.length - 1 ? 'Mulai Gunakan ✨' : 'Lanjut'}
            {step < steps.length - 1 && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
