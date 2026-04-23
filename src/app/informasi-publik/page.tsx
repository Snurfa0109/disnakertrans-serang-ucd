import Link from "next/link";
import { ArrowRight, Download, BarChart2, Briefcase, Users, FileCheck, CheckCircle2, FileText, CalendarDays } from "lucide-react";

export const metadata = {
    title: "Informasi Publik | Disnakertrans Serang"
};

// Simulated mock fetch functions
async function getWarta() {
    return {
        utama: {
            title: "Perluasan Lapangan Kerja Melalui Program Inkubasi Bisnis Mandiri 2024",
            desc: "Pemerintah Kabupaten Serang meluncurkan inisiatif baru untuk menekan angka pengangguran melalui pemberdayaan UMKM...",
            date: "20 Okt 2023",
            author: "Admin Disnaker",
            tag: "UTAMA",
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=800"
        },
        sekunder: [
            {
                id: 1,
                tag: "STATISTIK",
                title: "Tren Penurunan Angka Pengangguran Terbuka di Kabupaten Serang",
                desc: "Data terbaru menunjukkan penurunan signifikam sebesar 2.4% dalam periode semester pertama.",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600"
            }
        ],
        tersier: [
            { id: 1, tag: "PELATIHAN", title: "Pendaftaran Pelatihan Vokasi Batch IV Dibuka", desc: "Tersedia kuota untuk pelatihan pengelasan, otomotif, dan desain grafis." },
            { id: 2, tag: "INTERNAL", title: "Rapat Koordinasi Lintas Sektoral Penempatan Tenaga Kerja", desc: "Sinergi antara pemerintah dan sektor industri untuk penyerapan tenaga lokal." }
        ]
    };
}

async function getStats() {
    return [
        { id: 1, label: "Pencari Kerja Terdaftar", value: "12,402", icon: Briefcase },
        { id: 2, label: "Peserta Pelatihan (2023)", value: "3,150", icon: GraduationCapIcon },
        { id: 3, label: "Perusahaan Terverifikasi", value: "892", icon: FileCheck },
        { id: 4, label: "Indeks Kepuasan Masyarakat", value: "92%", icon: Users },
    ];
}

async function getJadwal() {
    return [
        { id: 1, date: "12", month: "NOV", title: "Teknik Las SMAW 3G", info: "BLK Kab. Serang • 08:00 - Selesai", color: "bg-green-500" },
        { id: 2, date: "15", month: "NOV", title: "Digital Marketing & SEO", info: "Online Webinar • 13:00 - 15:00", color: "bg-[#B45309]" },
        { id: 3, date: "20", month: "NOV", title: "Manajemen Administrasi Perkantoran", info: "Gedung Disnaker • 09:00 - 12:00", color: "bg-[#0A192F]" },
    ];
}

async function getDownloads() {
    return [
        { id: 1, title: "Laporan Tahunan 2023", desc: "Ringkasan eksekutif capaian kinerja dan penggunaan anggaran tahun 2023.", size: "4.2 MB", ext: "PDF", iconColor: "text-red-500 bg-red-50" },
        { id: 2, title: "Formulir Kartu Kuning (AK-1)", desc: "Blangko isian resmi untuk pendaftaran pencari kerja di wilayah Kab. Serang.", size: "1.1 MB", ext: "DOCX", iconColor: "text-blue-500 bg-blue-50" },
        { id: 3, title: "Data Perusahaan Aktif 2024", desc: "Dataset perusahaan yang telah melaporkan WLKP secara rutin di Kabupaten Serang.", size: "2.8 MB", ext: "XLSX", iconColor: "text-green-500 bg-green-50" },
    ];
}

function GraduationCapIcon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.42 10.922a2 2 0 0 1-.019 3.018l-8.5 8.5a2 2 0 0 1-2.802 0l-8.5-8.5a2 2 0 0 1-.019-3.018l8.5-8.5a2 2 0 0 1 2.803 0l8.5 8.5z" /><path d="M12 2v20" /><path d="m4.929 4.929 14.142 14.142" /><path d="m4.929 19.071 14.142-14.142" /></svg> // simple placeholder
}


export default async function InformasiPublikPage() {
    const warta = await getWarta();
    const stats = await getStats();
    const jadwal = await getJadwal();
    const downloads = await getDownloads();

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC]">
            {/* Hero Section */}
            <section className="bg-[#0A192F] pt-32 pb-24 lg:pt-40 lg:pb-32 text-white">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center rounded-full border border-[#FBBF24] px-4 py-1.5 text-xs font-bold text-[#FBBF24] tracking-widest uppercase mb-6">
                            Transparansi Informasi
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Gerbang Informasi <br className="hidden md:block"/>
                            <span className="text-[#FBBF24]">Ketenagakerjaan</span> Serang.
                        </h1>
                        <p className="text-base md:text-xl text-white/80 max-w-2xl leading-relaxed">
                            Akses data real-time, berita terbaru, dan dokumen publik resmi dari Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang dalam satu platform terpadu.
                        </p>
                    </div>
                </div>
            </section>

            {/* Warta Ketenagakerjaan */}
            <section className="py-20 bg-[#F8FAFC]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Warta Ketenagakerjaan</h2>
                            <p className="text-gray-600">Update terkini kebijakan, event, dan capaian kinerja Disnakertrans.</p>
                        </div>
                        <Link href="/berita" className="text-[#0A192F] font-bold text-sm flex items-center gap-2 hover:underline">
                            Lihat Semua Berita <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Warta Utama */}
                        <div className="w-full lg:w-7/12 relative rounded-2xl overflow-hidden group shadow-sm bg-white cursor-pointer h-[400px] lg:h-[500px]">
                            <img src={warta.utama.image} alt={warta.utama.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-[#0A192F]/60 to-transparent"></div>
                            
                            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10 flex flex-col items-start text-white">
                                <span className="bg-[#FBBF24] text-[#0A192F] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-4">
                                    {warta.utama.tag}
                                </span>
                                <h3 className="text-2xl lg:text-3xl font-bold mb-3 leading-snug group-hover:text-[#FBBF24] transition-colors">{warta.utama.title}</h3>
                                <p className="text-white/80 line-clamp-2 mb-6 hidden md:block text-sm lg:text-base">{warta.utama.desc}</p>
                                <div className="flex items-center gap-4 text-xs font-medium text-white/70">
                                    <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {warta.utama.date}</span>
                                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {warta.utama.author}</span>
                                </div>
                            </div>
                        </div>

                        {/* Warta Kanan */}
                        <div className="w-full lg:w-5/12 flex flex-col gap-6">
                            {/* Card with Image */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow cursor-pointer flex-1">
                                <div className="w-full sm:w-1/3 rounded-xl overflow-hidden bg-gray-100 shrink-0 h-32 sm:h-auto">
                                    <img src={warta.sekunder[0].image} alt="Chart" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">{warta.sekunder[0].tag}</span>
                                    <h4 className="text-base font-bold text-gray-900 mb-2 leading-snug">{warta.sekunder[0].title}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{warta.sekunder[0].desc}</p>
                                </div>
                            </div>

                            {/* Dua Card Kecil Bawah */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                                {warta.tersier.map(item => (
                                    <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-[#B45309] tracking-wider mb-3">{item.tag}</span>
                                        <h4 className="text-sm font-bold text-gray-900 mb-2 leading-snug">{item.title}</h4>
                                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistik & Kinerja + Jadwal */}
            <section className="py-20 bg-[#F1F5F9]">
                <div className="container mx-auto px-4 xl:px-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Statistik Kiri */}
                    <div className="w-full lg:w-7/12">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Statistik & Kinerja</h2>
                            <p className="text-gray-600 text-sm">Transparansi data operasional dan capaian target Dinas Tenaga Kerja dan Transmigrasi secara periodik.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {stats.map(s => (
                                <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                                    <div className="absolute -right-4 -bottom-4 text-gray-100 opacity-50 group-hover:scale-110 transition-transform">
                                        <s.icon className="w-24 h-24" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-4xl font-extrabold text-gray-900 mb-1">{s.value}</h3>
                                        <p className="text-xs font-semibold text-gray-500">{s.label}</p>
                                        <div className="mt-4 w-1/3 h-1 bg-[#0A192F] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Jadwal Pelatihan Kanan */}
                    <div className="w-full lg:w-5/12">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full border-l-4 border-l-[#B45309] flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold text-gray-900">Jadwal Pelatihan Aktif</h3>
                                <span className="bg-[#0A192F] text-[#FBBF24] text-[10px] px-2 py-1 rounded font-bold">LIVE</span>
                            </div>

                            <div className="flex-1 space-y-6">
                                {jadwal.map(j => (
                                    <div key={j.id} className="flex gap-4 items-start">
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center min-w-[56px] shrink-0">
                                            <p className="text-[10px] font-bold text-gray-500 tracking-widest">{j.month}</p>
                                            <p className="text-lg font-bold text-gray-900 -mt-1">{j.date}</p>
                                        </div>
                                        <div className="pt-1 flex-1">
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">{j.title}</h4>
                                            <p className="text-xs text-gray-500 inline-flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${j.color}`}></span>{j.info}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full bg-[#0A192F] hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors text-sm mt-8">
                                Daftar Pelatihan
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Download Center */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Download Center</h2>
                        <p className="text-gray-600">Unduh regulasi, formulir, dan dokumen publik secara resmi.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {downloads.map(dl => (
                            <div key={dl.id} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shrink-0 ${dl.iconColor}`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{dl.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-8">{dl.desc}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-500">{dl.size} • {dl.ext}</span>
                                    <button className="text-[#0A192F] font-bold text-sm flex items-center gap-1.5 group-hover:text-amber-600 transition-colors">
                                        Download <Download className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
