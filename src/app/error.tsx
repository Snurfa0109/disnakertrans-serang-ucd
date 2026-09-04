'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 pt-16">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 w-80 h-80 bg-red-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-orange-400/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Error icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center shadow-lg ring-8 ring-red-100">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
          Terjadi Kesalahan
        </h1>
        <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6">
          Maaf, terjadi kesalahan teknis pada halaman ini. Tim kami akan segera memperbaikinya.
        </p>

        {/* Error detail */}
        {error?.message && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Detail Error</p>
            <p className="text-xs text-red-700 font-mono break-all leading-relaxed">{error.message}</p>
            {error.digest && (
              <p className="text-[10px] text-red-400 mt-1">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        {/* Steps to try */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Langkah yang bisa dicoba</p>
          <ol className="space-y-3">
            {[
              'Klik tombol "Coba Lagi" di bawah untuk memuat ulang halaman',
              'Periksa koneksi internet Anda dan pastikan stabil',
              'Bersihkan cache browser (Ctrl+Shift+Delete)',
              'Jika masih bermasalah, laporkan melalui halaman Pengaduan',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-gray-600 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0A192F] hover:bg-black text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm">
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Report link */}
        <p className="text-xs text-gray-400 mt-6">
          Masalah berlanjut?{' '}
          <Link href="/pengaduan" className="text-[#1E3A8A] hover:underline font-semibold">
            Laporkan masalah ini
          </Link>
        </p>
      </div>
    </div>
  );
}
