import Link from "next/link";
import db from "@/lib/db";
import { ArrowRight, Briefcase, FileText, GraduationCap, Users, Scale, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Home() {
  const latestNews = db.prepare('SELECT * FROM news ORDER BY date DESC LIMIT 4').all() as any[];

  return (
    <div className="flex flex-col w-full pb-0 bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="bg-[#1E3A8A] text-white pt-32 pb-24 lg:pt-40 lg:pb-32 relative overflow-hidden">
        <div className="container mx-auto px-4 xl:px-12 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Membangun Tenaga <br className="hidden md:block"/>
              Kerja <span className="text-[#FBBF24]">Unggul &</span> <br className="hidden md:block"/>
              <span className="text-[#FBBF24]">Kompetitif</span>
            </h1>
            <p className="text-base md:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed font-light">
              Pusat layanan ketenagakerjaan dan transmigrasi Kabupaten Serang 
              yang transparan, modern, dan berorientasi pada kemajuan masyarakat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/lowongan" className="bg-[#FBBF24] text-[#1E3A8A] hover:bg-[#FCD34D] px-8 py-3.5 rounded-lg font-bold transition-all flex items-center justify-center sm:justify-start gap-2 shadow-lg shadow-yellow-500/20">
                Cari Lowongan Kerja <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/pelatihan" className="bg-white/5 border border-white/20 hover:bg-white/10 text-white px-8 py-3.5 rounded-lg font-semibold transition-all flex items-center justify-center sm:justify-start">
                Informasi Pelatihan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sambutan Section */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 xl:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Image Side */}
            <div className="relative w-full lg:w-5/12 max-w-sm mx-auto lg:max-w-none">
              <div className="bg-[#FDE68A] absolute inset-0 -ml-4 -mt-4 rounded-xl min-h-full aspect-[3/4]"></div>
              <div className="relative z-10 bg-white rounded-xl overflow-hidden shadow-xl aspect-[3/4]">
                 <img src="https://images.unsplash.com/photo-1542385151-efd9000785a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Sambutan Kepala Dinas" className="w-full h-full object-cover object-top grayscale-[20%]" />
                 <div className="absolute bottom-4 right-4 bg-[#1E3A8A] text-[#FBBF24] font-bold text-2xl w-14 h-14 flex items-center justify-center rounded-lg shadow-lg">
                   99
                 </div>
              </div>
            </div>
            {/* Text Side */}
            <div className="w-full lg:w-7/12">
              <div className="w-10 h-1 bg-[#FBBF24] mb-6 rounded-full"></div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Sambutan Kepala Dinas</h2>
              <p className="text-gray-600 text-lg italic mb-8 leading-relaxed">
                "Selamat datang di portal resmi Disnakertrans Kabupaten Serang. Kami berkomitmen untuk terus berinovasi dalam memberikan layanan terbaik bagi seluruh pencari kerja dan pemberi kerja, demi mewujudkan Kabupaten Serang yang lebih sejahtera melalui sektor ketenagakerjaan yang inklusif."
              </p>
              <div>
                <h3 className="text-xl font-bold text-gray-900">H. Muchamad Zubaidi, S.Sos., M.Si.</h3>
                <p className="text-gray-600">Kepala Dinas Nakertrans Kab. Serang</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Cepat Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 xl:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Layanan Cepat</h2>
            <p className="text-gray-600">Akses mudah dan cepat untuk berbagai kebutuhan administrasi Anda.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/layanan/ak1" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-[#EFF6FF] text-[#1E3A8A] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Kartu Kuning (AK-I)</h3>
            </Link>
            <Link href="/layanan/pelatihan" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-[#EFF6FF] text-[#1E3A8A] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Pelatihan Kerja (BLK)</h3>
            </Link>
            <Link href="/layanan/lowongan" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-[#EFF6FF] text-[#1E3A8A] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Info Lowongan</h3>
            </Link>
            <Link href="/layanan/hi" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-[#EFF6FF] text-[#1E3A8A] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Hubungan Industrial</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Berita Terbaru Section */}
      <section className="py-20 bg-[#F1F5F9]">
        <div className="container mx-auto px-4 xl:px-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Berita Terbaru</h2>
              <p className="text-gray-600">Informasi terkini kegiatan dan program Disnakertrans</p>
            </div>
            <Link href="/berita" className="text-[#1E3A8A] font-bold text-sm flex items-center gap-2 hover:underline">
              Lihat Semua Berita <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {latestNews.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
              Belum ada berita yang diterbitkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestNews.map((news) => (
                <Link href={`/berita/${news.id}`} key={news.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group flex flex-col hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {news.thumbnail ? (
                      <img src={news.thumbnail} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FileText className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-[#FBBF24] text-[10px] uppercase font-bold px-3 py-1.5 rounded-full text-[#1E3A8A] shadow-sm">
                      Kegiatan
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center text-xs text-gray-500 mb-3 gap-1.5">
                       <Calendar className="w-3.5 h-3.5" />
                       <span>{new Date(news.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#1E3A8A] transition-colors leading-snug">{news.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-0 leading-relaxed">{news.description}</p>
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

