import Link from "next/link";
import { ArrowRight, Building2, Briefcase, FileText, ExternalLink, CheckCircle2 } from "lucide-react";

export const metadata = {
    title: "Layanan Publik | Disnakertrans Serang"
};

// Simulated mock data structure for dynamic parts if needed
async function getLayananData() {
    return {
        karirData: {
            lowongan: "1.2k+",
            perusahaan: "450+"
        }
    };
}

export default async function LayananPublikPage() {
    const data = await getLayananData();

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC]">
            {/* Hero Section */}
            <section className="bg-white pt-32 pb-24 lg:pt-40 lg:pb-32 relative overflow-hidden bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15] text-[#0A192F]">
                            Pilar Digital Pelayanan Ketenagakerjaan.
                        </h1>
                        <p className="text-base md:text-lg text-gray-600 mb-10 max-w-xl leading-relaxed">
                            Akses transparan, cepat, dan modern untuk seluruh warga Kabupaten Serang dalam mengelola kebutuhan tenaga kerja dan transmigrasi.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-[#0A192F] text-white hover:bg-black px-8 py-3.5 rounded font-bold transition-colors">
                                Mulai Konsultasi
                            </button>
                            <button className="bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 px-8 py-3.5 rounded font-bold transition-colors shadow-sm">
                                Panduan Pengguna
                            </button>
                        </div>
                    </div>
                </div>
                {/* Fade out bottom of pattern */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>
            </section>

            {/* Layanan Unggulan */}
            <section className="py-20 bg-[#F8FAFC]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex flex-col mb-12">
                        <span className="text-[#B45309] font-bold text-xs tracking-widest uppercase mb-2">Aksesibilitas Publik</span>
                        <div className="flex items-center gap-6">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Layanan Unggulan Kami</h2>
                            <div className="h-0.5 bg-gray-300 flex-1 hidden md:block max-w-[100px] mt-2"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* E-SAKIP (Large Card, cols 1-7) */}
                        <div className="lg:col-span-7 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col sm:flex-row group hover:shadow-md transition-shadow">
                            <div className="p-8 lg:p-10 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 border border-gray-100">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-extrabold text-gray-900">E-SAKIP</h3>
                                            <p className="text-[10px] text-[#B45309] uppercase font-bold tracking-wider">Akuntabilitas Kinerja Instansi</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                        Sistem pemantauan kinerja untuk memastikan transparansi dan efisiensi birokrasi di lingkungan Disnakertrans Kabupaten Serang.
                                    </p>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                            <span className="w-1 h-3 bg-[#B45309] rounded-sm"></span> Laporan Kinerja Tahunan
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                            <span className="w-1 h-3 bg-[#B45309] rounded-sm"></span> Target Indikator Utama
                                        </li>
                                    </ul>
                                </div>
                                <button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#78350F] font-bold px-6 py-3 rounded-lg transition-colors w-[180px] text-sm">
                                    Pantau Kinerja
                                </button>
                            </div>
                            <div className="sm:w-2/5 shrink-0 relative bg-gray-100 min-h-[250px]">
                                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop" alt="Office Analytics" className="absolute inset-0 w-full h-full object-cover grayscale-[20%]" />
                            </div>
                        </div>

                        {/* Kartu Kuning AK-1 (cols 8-12) */}
                        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10 flex flex-col hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center text-[#92400E] mb-6">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 mb-3">Kartu Kuning AK-1</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1">
                                Pendaftaran mandiri bagi pencari kerja untuk mendapatkan akses ke bursa kerja resmi.
                            </p>
                            
                            <div className="mb-8">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-3">Persyaratan Utama:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-gray-900" /> Scan KTP Kabupaten Serang
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-gray-900" /> Ijazah Pendidikan Terakhir
                                    </li>
                                </ul>
                            </div>
                            
                            <button className="bg-[#0A192F] hover:bg-black text-white font-bold py-3.5 px-4 rounded-lg w-full transition-colors text-sm">
                                Daftar Sekarang
                            </button>
                        </div>

                        {/* OSS RBA (cols 1-5) */}
                        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border-y border-r border-[#E2E8F0] border-l-4 border-l-[#B45309] p-8 hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-extrabold text-gray-900">OSS RBA</h3>
                                    <FileText className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                    Perizinan berusaha berbasis risiko. Mempermudah pelaku usaha dalam pengajuan izin transmigrasi & ketenagakerjaan.
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold px-3 py-1.5 rounded-full">Sistem Terintegrasi</span>
                                <Link href="#" className="text-xs font-bold text-gray-900 flex items-center gap-1 hover:underline">
                                    Pelajari Prosedur <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>

                        {/* Karir Hub (cols 6-12) */}
                        <div className="lg:col-span-7 bg-[#0A192F] rounded-2xl shadow-lg border border-[#1E293B] p-8 lg:p-10 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col justify-between">
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-extrabold text-white mb-3">Karir Hub</h3>
                                <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-10">
                                    Portal terpusat yang menghubungkan talenta lokal dengan perusahaan-perusahaan terkemuka di wilayah Banten.
                                </p>
                            </div>
                            
                            <div className="flex items-end gap-3 sm:gap-4 relative z-10 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-5 flex-1 min-w-[120px]">
                                    <h4 className="text-white font-extrabold text-lg sm:text-xl mb-1">{data.karirData.lowongan}</h4>
                                    <p className="text-[9px] sm:text-[10px] text-white/50 tracking-wider uppercase font-bold">Lowongan Aktif</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-5 flex-1 min-w-[120px]">
                                    <h4 className="text-white font-extrabold text-lg sm:text-xl mb-1">{data.karirData.perusahaan}</h4>
                                    <p className="text-[9px] sm:text-[10px] text-white/50 tracking-wider uppercase font-bold">Perusahaan Mitra</p>
                                </div>
                                <button className="bg-[#B45309] hover:bg-[#92400E] text-white w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-lg self-stretch sm:self-auto mb-[2px] sm:mb-0">
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Butuh Bantuan */}
            <section className="py-16 bg-[#F8FAFC]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="bg-[#E2E8F0] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-200">
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="text-2xl font-extrabold text-[#0A192F] mb-3">Butuh Bantuan Lebih Lanjut?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Tim Customer Service kami siap melayani Anda terkait kendala teknis layanan publik setiap hari kerja pukul 08:00 - 16:00 WIB.
                            </p>
                        </div>
                        <button className="bg-white text-[#0A192F] hover:bg-gray-50 border border-gray-200 shadow-sm font-bold px-8 py-4 rounded-xl flex items-center gap-3 transition-colors shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12.01 2.014c-5.46 0-9.914 4.453-9.914 9.914 0 1.763.463 3.42 1.285 4.903l-1.328 4.887 4.98-1.305a9.888 9.888 0 0 0 4.977 1.34h.001c5.457 0 9.912-4.454 9.912-9.916 0-2.646-1.03-5.132-2.902-7.004-1.872-1.87-4.358-2.9-7.003-2.9h-.008zm5.556 14.18c-.226.637-1.31 1.233-1.815 1.298-.44.056-.99.112-2.905-.682-2.308-.956-3.8-3.328-3.916-3.483-.114-.155-.935-1.246-.935-2.375 0-1.13.585-1.688.794-1.921.196-.217.427-.272.571-.272.143 0 .287.001.415.006.133.006.311-.052.485.367.18.435.615 1.5.671 1.616.056.115.093.25.018.4-.075.15-.114.243-.228.358-.114.116-.24.252-.34.35-.11.106-.23.224-.105.44.126.216.56 1.05 1.189 1.61.812.723 1.62.99 1.835 1.096.215.105.342.088.47-.058.127-.145.548-.636.696-.856.148-.22.296-.183.49-.11.195.074 1.235.582 1.446.688.21.106.35.158.4.246.05.088.05.512-.176 1.15z"/></svg>
                            Hubungi via WhatsApp
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
