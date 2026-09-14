import sql from "@/lib/db";
import AgendaHub from "@/components/AgendaHub";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import lowonganBackup from "@/data/lowongan-backup.json";
import pelatihanBackup from "@/data/pelatihan-backup.json";
import eventsBackup from "@/data/events-backup.json";

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
    const [jadwalRes, lowonganRes, eventsRes] = await Promise.allSettled([
      sql`SELECT * FROM jadwal_pelatihan WHERE is_active = TRUE ORDER BY date ASC`,
      sql`SELECT * FROM lowongan WHERE is_active = TRUE ORDER BY id DESC`,
      sql`SELECT * FROM events WHERE is_active = TRUE ORDER BY id DESC`,
    ]);

    if (jadwalRes.status === 'fulfilled' && Array.isArray(jadwalRes.value) && jadwalRes.value.length > 0) {
      allJadwal = jadwalRes.value;
    }
    if (lowonganRes.status === 'fulfilled' && Array.isArray(lowonganRes.value) && lowonganRes.value.length > 0) {
      allLowongan = lowonganRes.value;
    }
    if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value) && eventsRes.value.length > 0) {
      allEvents = eventsRes.value;
    }
  } catch (err) {
    console.error('[PeluangPage] DB query error:', err);
  }

  // Fallback data lengkap agar di Vercel selalu terisi penuh (Pelatihan: 8, Lowongan: 64, Event: 5)
  if (!allJadwal || allJadwal.length === 0) allJadwal = pelatihanBackup;
  if (!allLowongan || allLowongan.length === 0) allLowongan = lowonganBackup;
  if (!allEvents || allEvents.length === 0) allEvents = eventsBackup;

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
