import Link from "next/link";
import sql from "@/lib/db";
import { getCategoryFallbackImage } from "@/lib/utils";
import { getSiteContentByKey } from "@/lib/services/content.service";
import newsBackup from "@/data/news-backup.json";
import lowonganBackup from "@/data/lowongan-backup.json";
import pelatihanBackup from "@/data/pelatihan-backup.json";
import eventsBackup from "@/data/events-backup.json";
import { ArrowRight, FileText, GraduationCap, Scale, Calendar, Briefcase, MessageSquare, ExternalLink } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import PeluangSummary from "@/components/PeluangSummary";

export const revalidate = 60;

export default async function Home() {
  let latestNews: any[] = [];
  let allJadwal: any[] = [];
  let allLowongan: any[] = [];
  let allEvents: any[] = [];

  try {
    const [newsRes, jadwalRes, lowonganRes, eventsRes] = await Promise.allSettled([
      sql`SELECT * FROM news ORDER BY date DESC LIMIT 4`,
      sql`SELECT * FROM jadwal_pelatihan WHERE is_active = TRUE ORDER BY date ASC LIMIT 10`,
      sql`SELECT * FROM lowongan WHERE is_active = TRUE ORDER BY id DESC LIMIT 10`,
      sql`SELECT * FROM events WHERE is_active = TRUE ORDER BY id DESC LIMIT 5`,
    ]);

    if (newsRes.status === 'fulfilled' && Array.isArray(newsRes.value) && newsRes.value.length > 0) {
      latestNews = newsRes.value;
    }
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
    console.error('[HomePage] DB error loading data:', err);
  }

  if (!latestNews || latestNews.length === 0) {
    latestNews = newsBackup.slice(0, 4);
  }
  if (!allJadwal || allJadwal.length === 0) {
    allJadwal = pelatihanBackup as any[];
  }
  if (!allLowongan || allLowongan.length === 0) {
    allLowongan = (lowonganBackup as any[]).slice(0, 10);
  }
  if (!allEvents || allEvents.length === 0) {
    allEvents = eventsBackup as any[];
  }

  const [
    heroTitle,
    heroSubtitle,
    heroCtaText,
    heroCtaLink,
  ] = await Promise.all([
    getSiteContentByKey('hero_title'),
    getSiteContentByKey('hero_subtitle'),
    getSiteContentByKey('hero_cta_text'),
    getSiteContentByKey('hero_cta_link'),
  ]);

  const layananCepat = [
    { title: "Kartu Kuning (AK-1)", desc: "Pendaftaran pencari kerja online", icon: FileText, href: "/layanan-publik#tutorial-ak1", external: false },
    { title: "Cari Lowongan Kerja", desc: "Lowongan kerja terbaru di Kab. Serang", icon: Briefcase, href: "/peluang?tab=lowongan", external: false },
    { title: "Pelatihan Kerja", desc: "Program pelatihan dan sertifikasi", icon: GraduationCap, href: "/peluang?tab=pelatihan", external: false },
    { title: "Hubungan Industrial", desc: "Konsultasi dan mediasi ketenagakerjaan", icon: Scale, href: "/layanan/hubungan-industrial", external: false },
    { title: "Ajukan Pengaduan", desc: "Sampaikan keluhan atau saran Anda", icon: MessageSquare, href: "/pengaduan", external: false },
    { title: "Dokumen & Regulasi", desc: "Unduh berkas resmi dan laporan publik", icon: FileText, href: "/informasi-publik#dokumen-publik", external: false },
  ];

  return (
    <div className="flex flex-col w-full pb-0 bg-[#F8FAFC] dark:bg-[#0B1120]">
      {/* Citizen-Centric Smart Search Hero Section & Komitmen Pimpinan */}
      <HeroSection
        heroSubtitle={heroSubtitle}
        heroCtaText={heroCtaText}
        heroCtaLink={heroCtaLink}
      />

      <section className="py-14 md:py-20 bg-white dark:bg-[#111827]">
        <div className="container mx-auto px-4 xl:px-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Layanan Cepat</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Akses langsung ke layanan yang paling sering dibutuhkan.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {layananCepat.map((item) => {
              const Card = item.external ? 'a' : Link;
              const extraProps = item.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Card
                  key={item.title}
                  href={item.href}
                  {...extraProps as any}
                  className="bg-white dark:bg-[#1E293B] p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 text-[#1E3A8A] dark:text-[#93C5FD] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-tight">{item.title}</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">{item.desc}</p>
                  <div className="mt-auto flex items-center gap-1 text-[#1E3A8A] dark:text-[#93C5FD] text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Akses {item.external && <ExternalLink className="w-3 h-3" />} {!item.external && <ArrowRight className="w-3 h-3" />}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agenda & Peluang Ketenagakerjaan Terkini (UCD Task-Oriented Hub) */}
      <section className="py-14 md:py-20 bg-[#0A192F] text-white border-t border-b border-white/10">
        <div className="container mx-auto px-4 xl:px-12">
          <PeluangSummary
            pelatihanList={allJadwal}
            lowonganList={allLowongan}
            eventList={allEvents}
          />
        </div>
      </section>

      <section className="py-14 md:py-20 bg-[#F1F5F9] dark:bg-[#0F172A]">
        <div className="container mx-auto px-4 xl:px-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Berita Terbaru</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Informasi terkini kegiatan dan program Disnakertrans.</p>
            </div>
            <Link href="/informasi-publik" className="bg-[#1E3A8A] text-white hover:bg-[#172554] px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shrink-0">
              Lihat Semua Berita <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {latestNews.length === 0 ? (
            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-12 text-center text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700">
              Belum ada berita yang diterbitkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestNews.map((news) => (
                <Link href={`/berita/${news.id}`} key={news.id} className="bg-white dark:bg-[#1E293B] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group flex flex-col hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="relative aspect-[16/10] bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={news.thumbnail || getCategoryFallbackImage(news.category)}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#FBBF24] text-[10px] uppercase font-bold px-2.5 py-1 rounded-full text-[#1E3A8A] shadow-sm">
                      {news.category || 'Berita'}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center text-[10px] text-gray-400 dark:text-gray-500 mb-2 gap-1.5 font-medium">
                       <Calendar className="w-3 h-3 text-[#FBBF24]" />
                       <span>{new Date(news.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors leading-snug">
                      {news.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {news.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
