import Link from "next/link";
import { ArrowRight, Building2, Briefcase, FileText, ExternalLink, CheckCircle2 } from "lucide-react";

export const metadata = {
    title: "Layanan Publik | Disnakertrans Serang"
};

// Simulated mock data structure for dynamic parts if needed
async function getLayananData() {
    return {
        karirData: {
            lowongan: "117.4k+",
            perusahaan: "33.0k+"
        }
    };
}

export default async function LayananPublikPage() {
    const data = await getLayananData();

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Hero Section */}
            <section className="bg-white dark:bg-[#111827] pt-32 pb-24 lg:pt-40 lg:pb-32 relative overflow-hidden bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] dark:bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15] text-[#0A192F] dark:text-white">
                            Pilar Digital Pelayanan Ketenagakerjaan.
                        </h1>
                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl leading-relaxed">
                            Akses transparan, cepat, dan modern untuk seluruh warga Kabupaten Serang dalam mengelola kebutuhan tenaga kerja dan transmigrasi.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="#layanan-unggulan" className="bg-[#0A192F] text-white hover:bg-black px-8 py-3.5 rounded font-bold transition-colors text-center">
                                Jelajahi Layanan
                            </a>
                            <a href="#tutorial-ak1" className="bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 px-8 py-3.5 rounded font-bold transition-colors shadow-sm text-center">
                                Tutorial AK-1 Online
                            </a>
                        </div>
                    </div>
                </div>
                {/* Fade out bottom of pattern */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8FAFC] dark:from-[#0B1120] to-transparent"></div>
            </section>

            {/* Layanan Unggulan */}
            <section id="layanan-unggulan" className="py-20 bg-[#F8FAFC] dark:bg-[#0B1120]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex flex-col mb-12">
                        <span className="text-[#B45309] dark:text-[#FBBF24] font-bold text-xs tracking-widest uppercase mb-2">Aksesibilitas Publik</span>
                        <div className="flex items-center gap-6">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Layanan Unggulan Kami</h2>
                            <div className="h-0.5 bg-gray-300 flex-1 hidden md:block max-w-[100px] mt-2"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* E-SAKIP (Large Card, cols 1-7) */}
                        <div className="lg:col-span-7 bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row group hover:shadow-md transition-shadow">
                            <div className="p-8 lg:p-10 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 border border-gray-100">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">E-SAKIP</h3>
                                            <p className="text-[10px] text-[#B45309] uppercase font-bold tracking-wider">Akuntabilitas Kinerja Instansi</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                        Sistem Akuntabilitas Kinerja Instansi Pemerintah (E-SAKIP) untuk memantau kinerja dan memastikan transparansi serta efisiensi birokrasi di lingkungan Pemerintah Kabupaten Serang.
                                    </p>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                            <span className="w-1 h-3 bg-[#B45309] rounded-sm"></span> Laporan Kinerja Tahunan
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                            <span className="w-1 h-3 bg-[#B45309] rounded-sm"></span> Target Indikator Utama
                                        </li>
                                        <li className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                            <span className="w-1 h-3 bg-[#B45309] rounded-sm"></span> Evaluasi Capaian Kinerja
                                        </li>
                                    </ul>
                                </div>
                                <a 
                                    href="https://e-sakip.serangkab.go.id/newsakip/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#78350F] font-bold px-6 py-3 rounded-lg transition-colors w-[180px] text-sm inline-flex items-center gap-2"
                                >
                                    Pantau Kinerja <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                            <div className="sm:w-2/5 shrink-0 relative bg-gray-100 min-h-[250px]">
                                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop" alt="Office Analytics" className="absolute inset-0 w-full h-full object-cover grayscale-[20%]" />
                            </div>
                        </div>

                        {/* Kartu Kuning AK-1 (cols 8-12) */}
                        <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 lg:p-10 flex flex-col hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center text-[#92400E] mb-6">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">Kartu Kuning AK-1 Online</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                Pendaftaran Kartu AK-1 (Kartu Kuning) secara online melalui aplikasi Serang Bahagia. Tidak perlu datang ke kantor!
                            </p>
                            
                            <div className="mb-6">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-3">Persyaratan Utama:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> KTP Kabupaten Serang
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Ijazah Pendidikan Terakhir
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Pas Foto Terbaru
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Email Aktif
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="mt-auto flex flex-col gap-3">
                                <a 
                                    href="https://bahagia.serangkab.go.id/home" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-[#0A192F] hover:bg-black text-white font-bold py-3.5 px-4 rounded-lg w-full transition-colors text-sm text-center inline-flex items-center justify-center gap-2"
                                >
                                    Daftar di Serang Bahagia <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <a href="#tutorial-ak1" className="text-[#0A192F] font-bold text-xs text-center hover:underline">
                                    Lihat Tutorial Lengkap ↓
                                </a>
                            </div>
                        </div>

                        {/* OSS RBA (cols 1-5) */}
                        <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border-y border-r border-[#E2E8F0] dark:border-gray-700 border-l-4 border-l-[#B45309] p-8 hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">OSS RBA</h3>
                                    <FileText className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                                    Online Single Submission (OSS) Berbasis Risiko. Platform perizinan berusaha nasional yang mempermudah pelaku usaha dalam pengajuan izin usaha secara online.
                                </p>
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Perizinan Berusaha Berbasis Risiko
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Nomor Induk Berusaha (NIB)
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Terintegrasi K/L Terkait
                                    </li>
                                </ul>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold px-3 py-1.5 rounded-full">Sistem Terintegrasi Nasional</span>
                                <a 
                                    href="https://oss.go.id/id" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-gray-900 flex items-center gap-1 hover:underline"
                                >
                                    Akses OSS <ArrowRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        {/* Karir Hub (cols 6-12) */}
                        <div className="lg:col-span-7 bg-[#0A192F] rounded-2xl shadow-lg border border-[#1E293B] p-8 lg:p-10 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col justify-between">
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-extrabold text-white mb-3">KarirHub Kemnaker</h3>
                                <p className="text-white/70 text-sm leading-relaxed max-w-sm mb-4">
                                    Platform resmi Kementerian Ketenagakerjaan yang menghubungkan pencari kerja dengan perusahaan-perusahaan terpercaya di seluruh Indonesia.
                                </p>
                                <ul className="space-y-2 mb-10">
                                    <li className="flex items-center gap-2 text-xs text-white/60 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FBBF24]" /> Lowongan kerja terverifikasi
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-white/60 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FBBF24]" /> Profil pencari kerja online
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-white/60 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FBBF24]" /> Pelatihan & sertifikasi
                                    </li>
                                </ul>
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
                                <a 
                                    href="https://karirhub.kemnaker.go.id/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-[#B45309] hover:bg-[#92400E] text-white w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-lg self-stretch sm:self-auto mb-[2px] sm:mb-0"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Tutorial AK-1 CTA */}
            <section id="tutorial-ak1" className="py-20 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 xl:px-12 max-w-4xl">
                    <div className="bg-gradient-to-r from-[#0A192F] to-[#1E3A8A] rounded-2xl p-8 lg:p-12 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 text-white">
                            <span className="text-[#FBBF24] font-bold text-xs tracking-widest uppercase mb-3 inline-block">Panduan Lengkap</span>
                            <h2 className="text-2xl lg:text-3xl font-bold mb-3">Cara Buat Kartu AK-1 Secara Online</h2>
                            <p className="text-white/70 text-sm leading-relaxed mb-6">
                                Panduan langkah demi langkah untuk membuat Kartu Kuning AK-1 secara online melalui aplikasi Serang Bahagia. Tidak perlu datang ke kantor!
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/layanan-publik/tutorial-ak1"
                                    className="inline-flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#78350F] font-bold px-6 py-3 rounded-lg transition-colors text-sm shadow-lg"
                                >
                                    Lihat Tutorial Lengkap <ArrowRight className="w-4 h-4" />
                                </Link>
                                <a
                                    href="https://bahagia.serangkab.go.id/home"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-6 py-3 rounded-lg hover:bg-white/20 transition-colors text-sm"
                                >
                                    Langsung Daftar <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 shrink-0">
                            {["Registrasi Akun", "Pilih Menu AK.1", "Isi & Unggah Data", "Verifikasi Petugas", "Unduh Kartu AK-1"].map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${i === 4 ? 'bg-[#FBBF24] text-[#0A192F]' : 'bg-white/10 text-white/80'}`}>
                                        {i + 1}
                                    </div>
                                    <span className={`text-xs font-medium ${i === 4 ? 'text-[#FBBF24]' : 'text-white/60'}`}>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
