import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleLogin = () => {
    // TODO: Supabase Google OAuth
    login();
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#F5F5E8] flex flex-col items-center justify-center px-5 py-12"
      style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
    >
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="self-start mb-8 flex items-center gap-2 text-sm font-semibold text-[#555] hover:text-[#111] transition-colors"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      {/* Card */}
      <div className="brutal-card-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#AADD00] border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#111] mx-auto mb-4" style={{ borderWidth: '3px' }}>
            <span className="font-extrabold text-xl text-black">MT</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111]">MoneyTracking</h1>
          <p className="text-sm text-[#666] mt-1">Masuk untuk melanjutkan</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-black/20" />
          <span className="text-xs font-bold text-[#888]">LOGIN DENGAN</span>
          <div className="flex-1 h-px bg-black/20" />
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="brutal-btn brutal-btn-outline brutal-btn-lg w-full flex items-center justify-center gap-3"
        >
          {/* Google Icon SVG */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Lanjut dengan Google
        </button>

        {/* Privacy note */}
        <div className="mt-6 flex items-start gap-2 p-3 bg-[#F5F5E8] border-2 border-black rounded-lg">
          <Shield size={14} className="text-[#555] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#555] leading-relaxed">
            Kami hanya mengambil nama dan email dari akun Google kamu untuk membuat profil.
            Data keuangan kamu <strong>tidak pernah dibagikan</strong> ke pihak ketiga.
          </p>
        </div>
      </div>

      <p className="text-xs text-[#888] mt-6 text-center">
        Dengan masuk, kamu menyetujui{' '}
        <button className="font-bold underline">Kebijakan Privasi</button> kami.
      </p>
    </div>
  );
}
