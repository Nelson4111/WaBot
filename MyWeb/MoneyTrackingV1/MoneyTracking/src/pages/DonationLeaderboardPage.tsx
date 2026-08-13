import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { mockDonations } from '../lib/mock-data';
import { formatCurrency } from '../lib/utils';

const approvedDonations = mockDonations
  .filter((d) => d.status === 'approved')
  .sort((a, b) => b.amount - a.amount);

const medals = ['🥇', '🥈', '🥉'];

export default function DonationLeaderboardPage() {
  const navigate = useNavigate();

  const totalRaised = approvedDonations.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="min-h-screen bg-[#F5F5E8]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#F5F5E8] border-b-2 border-black">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center border-2 border-black rounded-lg bg-white shadow-[2px_2px_0px_#111]">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-extrabold text-base flex-1">🏆 Top Supporters</h1>
      </header>

      <div className="page-container py-5 space-y-5 pb-10">
        {/* Hero */}
        <div className="brutal-card-lg p-5 bg-[#FF4D8D] text-white text-center">
          <Heart size={28} className="mx-auto mb-2 fill-white" />
          <h2 className="font-extrabold text-xl mb-1">Para Pahlawan MoneyTracking</h2>
          <p className="text-sm text-white/80 mb-3">
            Terima kasih kepada semua yang telah mendukung proyek ini ❤️
          </p>
          <div className="bg-white/20 rounded-xl p-3 inline-block">
            <p className="text-xs text-white/70">Total Terkumpul</p>
            <p className="text-2xl font-extrabold">{formatCurrency(totalRaised)}</p>
          </div>
        </div>

        {/* Top 3 Podium */}
        {approvedDonations.length >= 3 && (
          <div className="grid grid-cols-3 gap-2">
            {/* 2nd */}
            <div className="brutal-card p-3 text-center mt-4">
              <div className="text-2xl mb-1">🥈</div>
              <div className="w-10 h-10 bg-gray-100 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-1 text-sm font-extrabold">
                {approvedDonations[1].isAnonymous ? '?' : approvedDonations[1].displayName.slice(0, 1)}
              </div>
              <p className="text-xs font-extrabold truncate">{approvedDonations[1].displayName}</p>
              <p className="text-xs font-bold text-[#666] mt-1">{formatCurrency(approvedDonations[1].amount, true)}</p>
            </div>
            {/* 1st */}
            <div className="brutal-card-lg p-3 text-center bg-[#AADD00]">
              <div className="text-2xl mb-1">🥇</div>
              <div className="w-12 h-12 bg-black/10 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-1 font-extrabold text-sm">
                {approvedDonations[0].isAnonymous ? '?' : approvedDonations[0].displayName.slice(0, 1)}
              </div>
              <p className="text-xs font-extrabold truncate">{approvedDonations[0].displayName}</p>
              <p className="text-sm font-extrabold mt-1">{formatCurrency(approvedDonations[0].amount, true)}</p>
            </div>
            {/* 3rd */}
            <div className="brutal-card p-3 text-center mt-6">
              <div className="text-2xl mb-1">🥉</div>
              <div className="w-10 h-10 bg-amber-100 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-1 text-sm font-extrabold">
                {approvedDonations[2].isAnonymous ? '?' : approvedDonations[2].displayName.slice(0, 1)}
              </div>
              <p className="text-xs font-extrabold truncate">{approvedDonations[2].displayName}</p>
              <p className="text-xs font-bold text-[#666] mt-1">{formatCurrency(approvedDonations[2].amount, true)}</p>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="brutal-card overflow-hidden p-0">
          <div className="px-4 py-3 border-b-2 border-black bg-black">
            <h3 className="font-extrabold text-sm text-white">📋 Semua Donatur</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {approvedDonations.map((donation, index) => (
              <div key={donation.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-8 text-center flex-shrink-0">
                  {index < 3 ? (
                    <span className="text-lg">{medals[index]}</span>
                  ) : (
                    <span className="font-extrabold text-sm text-[#888]">#{index + 1}</span>
                  )}
                </div>
                <div className="w-9 h-9 bg-[#FF4D8D]/20 border-2 border-black rounded-lg flex items-center justify-center font-extrabold text-sm text-[#FF4D8D] flex-shrink-0">
                  {donation.isAnonymous ? '?' : donation.displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm truncate">{donation.displayName}</p>
                  {donation.message && (
                    <p className="text-xs text-[#888] truncate italic">"{donation.message}"</p>
                  )}
                </div>
                <p className="font-extrabold text-sm text-[#111]">{formatCurrency(donation.amount, true)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-[#666] mb-3">Ingin nama kamu ada di sini?</p>
          <button onClick={() => navigate('/donations')} className="brutal-btn brutal-btn-secondary">
            ❤️ Donasi Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
