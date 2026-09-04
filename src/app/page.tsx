import Link from "next/link";
import sql from "@/lib/db";
import { getCategoryFallbackImage } from "@/lib/utils";
import { getSiteContentByKey } from "@/lib/services/content.service";
import { ArrowRight, FileText, GraduationCap, Scale, Calendar, Briefcase, MessageSquare, ExternalLink } from "lucide-react";

export const revalidate = 60;

export default async function Home() {
  const [
    latestNews,
    heroTitle,
    heroSubtitle,
    heroCtaText,
    heroCtaLink,
    portalLapor,
    portalSipp,
    portalSisnaker,
    portalLoker,
  ] = await Promise.all([
    sql`SELECT * FROM news ORDER BY date DESC LIMIT 4` as Promise<any[]>,
    getSiteContentByKey('hero_title'),
    getSiteContentByKey('hero_subtitle'),
    getSiteContentByKey('hero_cta_text'),
    getSiteContentByKey('hero_cta_link'),
    getSiteContentByKey('portal_lapor'),
    getSiteContentByKey('portal_sipp'),
    getSiteContentByKey('portal_sisnaker'),
    getSiteContentByKey('portal_loker'),
  ]);

  const layananCepat = [
    { title: "Kartu Kuning (AK-1)", desc: "Pendaftaran pencari kerja online", icon: FileText, href: "/layanan-publik#tutorial-ak1", external: false },
    { title: "Cari Lowongan Kerja", desc: "Lowongan kerja terbaru di Kab. Serang", icon: Briefcase, href: "/peluang?tab=lowongan", external: false },
    { title: "Pelatihan Kerja", desc: "Program pelatihan dan sertifikasi", icon: GraduationCap, href: "/peluang?tab=pelatihan", external: false },
    { title: "Hubungan Industrial", desc: "Konsultasi dan mediasi ketenagakerjaan", icon: Scale, href: "/layanan/hubungan-industrial", external: false },
    { title: "Ajukan Pengaduan", desc: "Sampaikan keluhan atau saran Anda", icon: MessageSquare, href: "/pengaduan", external: false },
    { title: "Dokumen & Regulasi", desc: "Unduh berkas resmi dan laporan publik", icon: FileText, href: "/informasi-publik#dokumen-publik", external: false },
  ];

  const portalTerkait = [
    { title: "Portal LAPOR!", desc: "Layanan Aspirasi dan Pengaduan Online Rakyat", href: portalLapor || "https://lapor.go.id" },
    { title: "Portal SIPP", desc: "Sistem Informasi Pengawasan Ketenagakerjaan", href: portalSipp || "https://sipp.naker.go.id" },
    { title: "SISNAKER", desc: "Sistem Informasi Ketenagakerjaan Nasional", href: portalSisnaker || "https://sisnaker.go.id" },
    { title: "KarirHub Kemnaker", desc: "Portal Lowongan Kerja Kementerian Tenaga Kerja", href: portalLoker || "https://karirhub.kemnaker.go.id" },
    { title: "Website Resmi Kab. Serang", desc: "Portal utama Pemerintah Kabupaten Serang", href: "https://serangkab.go.id/" },
  ];

  return (
    <div className="flex flex-col w-full pb-0 bg-[#F8FAFC] dark:bg-[#0B1120]">
      {/* Hero Banner: Locked 2.45:1 aspect ratio with fluid scaling so it stays identical at any window width */}
      <section className="relative w-full overflow-hidden bg-[#0A192F] min-h-[340px] md:min-h-0 md:aspect-[2.45/1] flex items-center pt-20 pb-12 md:py-0">
        {/* Mobile background */}
        <div className="absolute inset-0 z-0 md:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#1E3A8A]/15 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#FBBF24]/5 translate-y-1/3 -translate-x-1/4" />
        </div>
        {/* Desktop banner */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <img
            src="/images/banner-beranda.png"
            alt="Pemerintah Kabupaten Serang"
            className="w-full h-full object-cover object-[72%_bottom] lg:object-[76%_bottom] xl:object-[80%_bottom]"
          />
          {/* True cubic ease-out scrim: eliminates any visible band or dark wall */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0A192F_0%,#0A192F_28%,rgba(10,25,47,0.88)_40%,rgba(10,25,47,0.6)_52%,rgba(10,25,47,0.3)_64%,rgba(10,25,47,0.08)_76%,transparent_88%)]" />
        </div>

        {/* Content Container: Grand, authoritative typography on desktop, responsive scale for smaller screens */}
        <div className="container mx-auto px-4 xl:px-12 relative z-10 w-full h-full flex items-center md:pt-14 lg:pt-16">
          <div className="max-w-[480px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[640px] flex flex-col justify-center">
            <div className="inline-flex items-center self-start rounded-full border border-white/30 px-3.5 py-1.5 lg:px-4 lg:py-1.5 text-[9.5px] lg:text-[10px] xl:text-[11px] font-bold text-white/90 tracking-widest uppercase mb-3 lg:mb-4 bg-white/10 backdrop-blur-xs">
              Pemerintah Kabupaten Serang
            </div>
            <h1 className="text-xl sm:text-2xl md:text-[clamp(1.5rem,2.5vw,2.25rem)] lg:text-[38px] xl:text-[45px] 2xl:text-[48px] font-extrabold tracking-tight mb-3 lg:mb-4 leading-[1.14] text-white">
              Layanan Terpadu <br className="hidden sm:inline" />
              <span className="whitespace-nowrap">Disnakertrans Kabupaten</span> <br className="hidden sm:inline" />
              Serang
            </h1>
            <p className="text-xs sm:text-sm md:text-sm lg:text-[15px] xl:text-base text-white/85 mb-5 lg:mb-6 max-w-[480px] leading-relaxed">
              {heroSubtitle || 'Pusat layanan ketenagakerjaan dan transmigrasi Kabupaten Serang yang transparan, modern, dan berorientasi pada kemajuan masyarakat.'}
            </p>
            <div className="flex flex-row items-center gap-3">
              <Link
                href={heroCtaLink || '/layanan-publik'}
                className="bg-[#FBBF24] text-[#1E3A8A] hover:bg-[#FCD34D] px-5 py-2.5 lg:px-6 lg:py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 text-xs sm:text-sm whitespace-nowrap"
              >
                {heroCtaText || 'Lihat Layanan'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pengaduan"
                className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-5 py-2.5 lg:px-6 lg:py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center text-xs sm:text-sm backdrop-blur-sm whitespace-nowrap"
              >
                Pengaduan Online
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Seksi Sambutan & Komitmen Pimpinan Daerah (Khusus Selain Desktop) */}
      <section className="md:hidden py-8 bg-white dark:bg-[#0B1120] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#EFF6FF] dark:from-[#1E293B] dark:to-[#0F172A] rounded-2xl p-5 sm:p-7 border border-blue-100/70 dark:border-gray-700/80 shadow-xs">
            {/* Foto Resmi Pimpinan (Sudah ada nama resmi di pita foto) */}
            <div className="flex justify-center mb-5">
              <div className="w-full max-w-[320px] rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-gray-700 bg-white">
                <img
                  src="/images/bupati-mobile.png"
                  alt="Bupati dan Wakil Bupati Serang"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Arah Kebijakan & Komitmen (Tanpa duplikasi nama) */}
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1E3A8A]/10 dark:bg-white/10 px-3 py-0.5 text-[10px] font-bold text-[#1E3A8A] dark:text-[#93C5FD] tracking-wider uppercase mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] dark:bg-[#93C5FD]" />
                Komitmen Pimpinan Daerah
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2.5">
                Mewujudkan Tenaga Kerja Kabupaten Serang yang Unggul, Berdaya Saing & Bahagia
              </h2>
              <blockquote className="border-l-4 border-[#FBBF24] pl-3.5 py-0.5 text-[13px] sm:text-sm text-gray-600 dark:text-gray-300 italic mb-4 leading-relaxed">
                &ldquo;Optimalisasi penyerapan tenaga kerja lokal, penguatan kompetensi vokasi berbasis industri, serta pelayanan perizinan dan hubungan industrial yang harmonis adalah prioritas kami untuk kemakmuran wargi Kabupaten Serang.&rdquo;
              </blockquote>
              
              <Link
                href="/profil"
                className="inline-flex items-center gap-1.5 text-[#1E3A8A] dark:text-[#93C5FD] font-bold text-xs hover:underline"
              >
                Visi & Misi Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

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
