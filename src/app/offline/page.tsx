'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCcw, Home, Signal, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    await new Promise(r => setTimeout(r, 1200));
    if (navigator.onLine) {
      window.location.href = '/';
    } else {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] flex flex-col items-center justify-center px-4 text-white">
      {/* Background animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#FBBF24]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Signal bars animation */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center ring-1 ring-white/10">
            <WifiOff className="w-12 h-12 text-[#FBBF24]" />
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-3xl border border-[#FBBF24]/20 animate-ping" />
          </div>
        </div>

        {/* Status badge */}
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold mb-6 ${
          isOnline ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          {isOnline ? 'Koneksi Tersedia' : 'Tidak Ada Koneksi Internet'}
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
          {isOnline ? 'Koneksi Pulih!' : 'Anda Sedang Offline'}
        </h1>
        <p className="text-white/60 text-sm leading-relaxed mb-8">
          {isOnline
            ? 'Koneksi internet Anda sudah tersedia kembali. Klik tombol di bawah untuk melanjutkan.'
            : 'Situs web tidak dapat dijangkau karena koneksi internet terputus atau sinyal lemah. Periksa jaringan WiFi atau data seluler Anda.'}
        </p>

        {/* Tips */}
        {!isOnline && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
            <p className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" /> Periksa hal berikut
            </p>
            <ul className="space-y-3">
              {[
                'Pastikan WiFi atau data seluler Anda aktif',
                'Coba pindah ke lokasi dengan sinyal lebih kuat',
                'Restart router atau modem jika menggunakan WiFi',
                'Nonaktifkan VPN jika sedang aktif',
                'Hubungi operator seluler jika masalah berlanjut',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-white/70">
                  <Signal className="w-3.5 h-3.5 text-[#FBBF24] shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0A192F] font-extrabold px-6 py-4 rounded-xl transition-colors text-sm disabled:opacity-70"
          >
            <RefreshCcw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Memeriksa koneksi...' : 'Coba Lagi'}
          </button>

          {isOnline && (
            <Link href="/"
              className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm border border-white/10">
              <Home className="w-4 h-4" />
              Ke Beranda
            </Link>
          )}
        </div>

        {/* Footer */}
        <p className="text-white/30 text-xs mt-10">
          Disnakertrans Kabupaten Serang &mdash; Portal Layanan Digital
        </p>
      </div>
    </div>
  );
}
