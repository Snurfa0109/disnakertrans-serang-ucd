import { Suspense } from "react";
import ComplaintTracker from "@/components/ComplaintTracker";
import { Search, Shield, Clock, MessageSquareReply, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Lacak Status Pengaduan & Surat | Disnakertrans Kab. Serang",
  description: "Layanan pelacakan status pengaduan dan surat online Disnakertrans Kabupaten Serang berbasis nomor tiket, nomor telepon/WhatsApp, atau NIK.",
};

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120]">
      {/* Hero Header */}
      <section className="relative pt-[104px] pb-14 sm:pt-28 sm:pb-16 lg:pt-30 lg:pb-20 bg-[#0A192F] text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/90 to-[#0A192F]/60" />
          <div className="absolute top-10 right-10 w-80 h-80 bg-[#FBBF24] rounded-full blur-[140px] opacity-15" />
          <div className="absolute bottom-5 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[140px] opacity-20" />
        </div>

        <div className="container mx-auto px-4 xl:px-12 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FBBF24] px-3 py-1 text-[10px] sm:text-xs font-extrabold text-[#0A192F] tracking-wider uppercase mb-2.5 sm:mb-3.5 shadow-sm whitespace-nowrap">
            <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Lacak Status Terpadu
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3 leading-tight">
            Pelacakan Status Pengaduan & Surat
          </h1>
          <p className="text-white/80 text-[11px] sm:text-xs md:text-sm leading-relaxed mb-3 sm:mb-5 max-w-2xl mx-auto line-clamp-2 sm:line-clamp-none">
            Pantau status peninjauan dan baca tanggapan resmi dari Disnakertrans Kabupaten Serang hanya dengan memasukkan Nomor Tiket, Nomor Telepon, atau NIK Anda.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/pengaduan" className="hover:text-white transition-colors">Pengaduan</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#FBBF24] font-bold">Lacak Status</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 xl:px-12 -mt-6 sm:-mt-10 relative z-20 pb-24 max-w-5xl">
        <Suspense fallback={
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl p-12 text-center">
            <div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Memuat modul pelacakan...</p>
          </div>
        }>
          <ComplaintTracker />
        </Suspense>

        {/* Bantuan Footer */}
        <div className="mt-12 bg-white dark:bg-[#1E293B] rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-bold text-gray-900 dark:text-white text-base">Belum mengajukan pengaduan?</h4>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              Sampaikan aspirasi, keluhan ketenagakerjaan, atau konsultasi hubungan industrial secara resmi.
            </p>
          </div>
          <Link
            href="/pengaduan"
            className="bg-[#0A192F] hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors shrink-0 shadow-sm"
          >
            Formulir Pengaduan Baru →
          </Link>
        </div>
      </main>
    </div>
  );
}
