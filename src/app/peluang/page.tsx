import sql from "@/lib/db";
import AgendaHub from "@/components/AgendaHub";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Peluang & Agenda Ketenagakerjaan | Disnakertrans Serang",
  description: "Akses lengkap program pelatihan kerja gratis, lowongan pekerjaan resmi dari Karir Serang, dan agenda event ketenagakerjaan.",
};

export default async function PeluangPage() {
  let allJadwal: any[] = [];
  let allLowongan: any[] = [];
  let allEvents: any[] = [];

  try {
    allJadwal = await sql`SELECT * FROM jadwal_pelatihan WHERE is_active = TRUE ORDER BY date ASC` as any[];
    allLowongan = await sql`SELECT * FROM lowongan WHERE is_active = TRUE ORDER BY id DESC` as any[];
    allEvents = await sql`SELECT * FROM events WHERE is_active = TRUE ORDER BY id DESC` as any[];
  } catch (err) {
    console.error('[PeluangPage] DB query error:', err);
  }

  return (
    <div className="min-h-screen pb-16 bg-gray-50/60 dark:bg-[#0B1120]">
      {/* ── Clean Hero / Header ── */}
      <section className="bg-[#0A192F] pt-28 pb-16 lg:pt-36 lg:pb-20 text-white relative border-b border-white/10">
        <div className="container mx-auto px-4 xl:px-12 relative z-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Beranda
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-xs font-semibold text-[#D4AF37] tracking-wider uppercase">
                Portal Peluang & Agenda
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white leading-tight">
              Agenda & Peluang Ketenagakerjaan
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              Informasi terintegrasi program pelatihan vokasi kerja gratis, bursa lowongan kerja resmi Dalam & Luar Negeri, serta jadwal kegiatan ketenagakerjaan di Kabupaten Serang.
            </p>
          </div>
        </div>
      </section>

      {/* ── Content Section ── */}
      <section className="py-10 lg:py-14">
        <div className="container mx-auto px-4 xl:px-12">
          <AgendaHub pelatihanList={allJadwal} lowonganList={allLowongan} eventList={allEvents} />
        </div>
      </section>
    </div>
  );
}
