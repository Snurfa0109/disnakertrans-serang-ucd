import Link from "next/link";
import db from "@/lib/db";
import { ArrowRight, FileText, GraduationCap, Users, Scale, Calendar, Briefcase, MessageSquare, ExternalLink, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  const latestNews = db.prepare('SELECT * FROM news ORDER BY date DESC LIMIT 4').all() as any[];

  const layananCepat = [
    { title: "Kartu Kuning (AK-1)", desc: "Pendaftaran pencari kerja online", icon: FileText, href: "/layanan-publik#tutorial-ak1", external: false },
    { title: "Cari Lowongan Kerja", desc: "Lowongan kerja terbaru di Kab. Serang", icon: Briefcase, href: "https://www.instagram.com/jobnaker.kabserang", external: true },
    { title: "Pelatihan Kerja", desc: "Program pelatihan dan sertifikasi", icon: GraduationCap, href: "https://karirhub.kemnaker.go.id/", external: true },
    { title: "Hubungan Industrial", desc: "Konsultasi dan mediasi ketenagakerjaan", icon: Scale, href: "/layanan/hubungan-industrial", external: false },
    { title: "Ajukan Pengaduan", desc: "Sampaikan keluhan atau saran Anda", icon: MessageSquare, href: "/pengaduan", external: false },
    { title: "Informasi UMK", desc: "Data UMK dan statistik ketenagakerjaan", icon: DollarSign, href: "/informasi-publik", external: false },
  ];

  const portalTerkait = [
    { title: "PPID Kabupaten Serang", desc: "Pejabat Pengelola Informasi dan Dokumentasi", href: "https://ppid.serangkab.go.id/" },
    { title: "Portal Dokumen Pemerintah", desc: "Dokumen resmi Pemerintah Kabupaten Serang", href: "https://serangkab.go.id/dokumen" },
    { title: "JDIH Kabupaten Serang", desc: "Jaringan Dokumentasi dan Informasi Hukum", href: "https://jdih.serangkab.go.id/" },
    { title: "Website Resmi Kab. Serang", desc: "Portal utama Pemerintah Kabupaten Serang", href: "https://serangkab.go.id/" },
    { title: "BPS Kabupaten Serang", desc: "Badan Pusat Statistik Kabupaten Serang", href: "https://serangkab.bps.go.id/id" },
  ];

  return (
    <div className="flex flex-col w-full pb-0 bg-[#F8FAFC] dark:bg-[#0B1120]">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative pt-24 pb-14 md:pt-28 md:pb-16 bg-[#0A192F] overflow-hidden min-h-[340px] md:min-h-[440px]">
        {/* Mobile: clean background */}
        <div className="absolute inset-0 z-0 md:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#1E3A8A]/15 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#FBBF24]/5 translate-y-1/3 -translate-x-1/4" />
        </div>
        {/* Desktop: banner with strong overlay */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <img src="/images/banner-beranda.png" alt="Pemerintah Kabupaten Serang" className="w-full h-full object-cover object-right-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/80 to-[#0A192F]/20" />
        </div>

        <div className="container mx-auto px-4 xl:px-12 relative z-10">
          <div className="max-w-lg md:max-w-xl lg:max-w-2xl pt-4 md:pt-8">
            <div className="hidden md:inline-flex items-center rounded-full border border-white/20 px-4 py-1.5 text-[10px] font-bold text-white/70 tracking-widest uppercase mb-5 bg-white/5">
              Pemerintah Kabupaten Serang
            </div>
            <h1 className="text-[26px] sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 md:mb-4 leading-[1.2] text-white">
              Dinas Tenaga Kerja <br className="hidden md:block"/>
              dan <span className="text-[#FBBF24]">Transmigrasi</span>
            </h1>
            <p className="text-[13px] sm:text-sm md:text-base text-white/60 mb-7 max-w-sm md:max-w-lg leading-relaxed">
              <span className="md:hidden">Portal layanan ketenagakerjaan Kabupaten Serang.</span>
              <span className="hidden md:inline">Pusat layanan ketenagakerjaan dan transmigrasi Kabupaten Serang yang transparan, modern, dan berorientasi pada kemajuan masyarakat.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/layanan-publik" className="bg-[#FBBF24] text-[#1E3A8A] hover:bg-[#FCD34D] px-6 py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 text-sm">
                Lihat Layanan Kami <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pengaduan" className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center text-sm backdrop-blur-sm">
                Pengaduan Online
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LAYANAN CEPAT ═══ */}
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

      {/* ═══ BERITA TERBARU ═══ */}
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
                    {news.thumbnail ? (
                      <img src={news.thumbnail} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FileText className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-[#FBBF24] text-[10px] uppercase font-bold px-2.5 py-1 rounded-full text-[#1E3A8A] shadow-sm">
                      {news.category || 'Berita'}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center text-[11px] text-gray-400 dark:text-gray-500 mb-2.5 gap-1.5">
                       <Calendar className="w-3.5 h-3.5" />
                       <span>{new Date(news.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors leading-snug">{news.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">{news.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ PORTAL TERKAIT ═══ */}
      <section className="py-14 md:py-20 bg-white dark:bg-[#111827]">
        <div className="container mx-auto px-4 xl:px-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Portal Terkait</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Akses cepat ke portal resmi pemerintah dan lembaga terkait.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {portalTerkait.map((portal) => (
              <a
                key={portal.title}
                href={portal.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F8FAFC] dark:bg-[#1E293B] p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-[#1E3A8A]/30 dark:hover:border-[#93C5FD]/30 hover:shadow-md transition-all group flex flex-col"
              >
                <div className="w-10 h-10 bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 text-[#1E3A8A] dark:text-[#93C5FD] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-tight">{portal.title}</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{portal.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-[#1E3A8A] dark:text-[#93C5FD] text-[11px] font-semibold">
                  Kunjungi <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
