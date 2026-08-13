import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink } from 'lucide-react';

const DONATION_PRESETS = [10_000, 25_000, 50_000, 100_000, 200_000];
const WHATSAPP_NUMBER = '6281234567890'; // TODO: Replace with real admin number

export default function DonationPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  const finalAmount = amount || parseInt(customAmount.replace(/\D/g, '') || '0');
  const finalName = isAnonymous ? 'Anonymous' : (displayName || 'Anonim');

  const handleSubmit = () => {
    if (!finalAmount) return;
    setStep('confirm');
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo Admin MoneyTracking! 👋\n\nSaya ingin berdonasi:\n\n` +
      `💰 Nominal: Rp${finalAmount.toLocaleString('id-ID')}\n` +
      `👤 Nama: ${finalName}\n` +
      (message ? `💬 Pesan: ${message}\n` : '') +
      `\nSaya akan mengirimkan bukti transfer setelah ini.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F5F5E8]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#FF4D8D] border-b-2 border-black">
        <button onClick={() => navigate(-1)} className="w-9 h-9 border-2 border-black rounded-lg bg-white/30 flex items-center justify-center">
          <ArrowLeft size={16} className="text-white" />
        </button>
        <h1 className="font-extrabold text-white text-base flex-1">❤️ Donasi</h1>
      </header>

      {step === 'form' ? (
        <div className="page-container py-5 space-y-5 pb-10">
          {/* Explanation */}
          <div className="brutal-card-lg p-5 bg-[#FF4D8D] text-white">
            <Heart size={24} className="mb-2 fill-white" />
            <h2 className="font-extrabold text-lg mb-2">Dukung MoneyTracking</h2>
            <p className="text-sm text-white/85 leading-relaxed">
              MoneyTracking <strong>sepenuhnya gratis</strong> dan akan terus dikembangkan.
              Donasi kamu membantu kami membayar server, terus berinovasi, dan menjaga aplikasi tetap bebas biaya untuk semua.
            </p>
          </div>

          {/* Amount Selector */}
          <div>
            <p className="text-sm font-bold text-[#111] mb-3">Pilih Nominal Donasi</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {DONATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => { setAmount(preset); setCustomAmount(''); }}
                  className={`py-3 rounded-xl border-2 border-black text-sm font-extrabold transition-all ${
                    amount === preset && !customAmount
                      ? 'bg-[#FF4D8D] text-white shadow-[2px_2px_0px_#111]'
                      : 'bg-white hover:bg-gray-50 shadow-[2px_2px_0px_#111]'
                  }`}
                >
                  Rp{(preset / 1000)}rb
                </button>
              ))}
              <button
                onClick={() => setAmount(null)}
                className={`py-3 rounded-xl border-2 border-black text-sm font-extrabold transition-all ${
                  !amount ? 'bg-black text-white' : 'bg-white'
                } shadow-[2px_2px_0px_#111]`}
              >
                Lainnya
              </button>
            </div>

            {!amount && (
              <div>
                <label className="block text-sm font-bold mb-1.5">Nominal Lain (Rp)</label>
                <input
                  className="brutal-input"
                  type="number"
                  placeholder="cth. 75000"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            )}

            {finalAmount > 0 && (
              <div className="mt-2 p-3 bg-[#AADD00] border-2 border-black rounded-lg text-center">
                <p className="text-xs font-bold text-black/60">Total Donasi</p>
                <p className="text-2xl font-extrabold text-black">Rp{finalAmount.toLocaleString('id-ID')}</p>
              </div>
            )}
          </div>

          {/* Display Name */}
          <div>
            <p className="text-sm font-bold text-[#111] mb-3">Nama di Leaderboard</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border-2 border-black rounded-xl bg-white">
                <input
                  type="checkbox"
                  id="anon"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                <label htmlFor="anon" className="text-sm font-bold cursor-pointer">
                  🕵️ Tampil sebagai Anonymous / Private
                </label>
              </div>

              {!isAnonymous && (
                <div>
                  <label className="block text-sm font-bold mb-1.5">Nama Tampilan</label>
                  <input
                    className="brutal-input"
                    placeholder="Nama asli, samaran, atau kosongkan"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <p className="text-xs text-[#888] mt-1">Biarkan kosong untuk menggunakan nama "Anonim".</p>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold mb-1.5">Pesan (Opsional)</label>
            <textarea
              className="brutal-input resize-none"
              rows={3}
              placeholder="Tulis pesan dukungan..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!finalAmount}
            className="brutal-btn brutal-btn-secondary brutal-btn-lg w-full disabled:opacity-40"
          >
            ❤️ Lanjutkan Donasi
          </button>
        </div>
      ) : (
        /* CONFIRM STEP */
        <div className="page-container py-5 space-y-5 pb-10">
          <div className="brutal-card-lg p-5 text-center">
            <div className="text-4xl mb-3">💝</div>
            <h2 className="font-extrabold text-xl mb-2">Terima Kasih!</h2>
            <p className="text-sm text-[#555] leading-relaxed mb-4">
              Donasi <strong>Rp{finalAmount.toLocaleString('id-ID')}</strong> dari <strong>{finalName}</strong> akan
              sangat berarti bagi perkembangan MoneyTracking.
            </p>
          </div>

          <div className="brutal-card p-4 space-y-3">
            <h3 className="font-extrabold text-sm">📋 Langkah Selanjutnya</h3>
            {[
              '1. Transfer ke rekening yang tertera (hubungi via WhatsApp)',
              '2. Ambil screenshot bukti transfer',
              '3. Kirim ke WhatsApp admin bersama formulir ini',
              '4. Admin akan memverifikasi dan menambahkan ke leaderboard',
            ].map((step) => (
              <p key={step} className="text-xs text-[#555] leading-relaxed">{step}</p>
            ))}
          </div>

          <div className="brutal-card p-4 bg-amber-50 border-amber-400">
            <p className="text-xs font-bold text-amber-700 mb-1">ℹ️ Catatan Privasi</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              Screenshot bukti transfer <strong>tidak disimpan</strong> di database kami.
              Dikirim langsung ke WhatsApp admin untuk verifikasi manual.
            </p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="brutal-btn brutal-btn-primary brutal-btn-lg w-full"
          >
            💬 Kirim ke WhatsApp Admin <ExternalLink size={16} />
          </button>

          <button onClick={() => setStep('form')} className="brutal-btn brutal-btn-outline w-full">
            ← Ubah Donasi
          </button>

          <button onClick={() => navigate('/donations/leaderboard')} className="brutal-btn brutal-btn-ghost w-full text-sm">
            🏆 Lihat Top Supporters
          </button>
        </div>
      )}
    </div>
  );
}
