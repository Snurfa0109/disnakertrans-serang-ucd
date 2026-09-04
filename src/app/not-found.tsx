import Link from 'next/link';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 pt-16">
      {/* Floating blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#FBBF24]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#1E3A8A]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* 404 big number */}
        <div className="relative mb-6 select-none">
          <p className="text-[160px] md:text-[200px] font-extrabold text-gray-100 leading-none tracking-tighter">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-[#0A192F] rounded-2xl flex items-center justify-center shadow-xl">
              <FileQuestion className="w-10 h-10 text-[#FBBF24]" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8">
          Maaf, halaman yang Anda cari tidak tersedia atau mungkin telah dipindahkan.
          Pastikan URL yang Anda masukkan sudah benar.
        </p>

        {/* Search suggestion */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Mungkin Anda mencari?</p>
          <div className="space-y-2">
            {[
              { label: 'Beranda', href: '/' },
              { label: 'Layanan Publik', href: '/layanan-publik' },
              { label: 'Pengaduan Masyarakat', href: '/pengaduan' },
              { label: 'Informasi Publik & Berita', href: '/informasi-publik' },
              { label: 'Profil Disnakertrans', href: '/profil' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-[#F1F5F9] group transition-colors">
                <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1E3A8A] transition-colors">
                  {link.label}
                </span>
                <ArrowLeft className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#1E3A8A] rotate-180 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Back to home */}
        <Link href="/"
          className="inline-flex items-center gap-2 bg-[#0A192F] hover:bg-black text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm">
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>

      {/* Footer note */}
      <p className="relative z-10 text-center text-xs text-gray-400 mt-10">
        Butuh bantuan? Hubungi kami di{' '}
        <a href="mailto:disnakertrans@serangkab.go.id" className="text-[#1E3A8A] hover:underline">
          disnakertrans@serangkab.go.id
        </a>
      </p>
    </div>
  );
}
