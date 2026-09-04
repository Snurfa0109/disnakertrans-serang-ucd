import Link from "next/link";
import { ArrowRight, Building2, Briefcase, FileText, ExternalLink, CheckCircle2, Zap, Shield, Globe, Eye, ChevronDown } from "lucide-react";

export const revalidate = 120;

export const metadata = {
    title: "Layanan Publik & Panduan AK-1 Online",
    description: "Panduan lengkap pembuatan Kartu Kuning (AK-1), mediasi sengketa ketenagakerjaan, serta informasi layanan publik resmi Disnakertrans Kabupaten Serang.",
    openGraph: {
        title: "Layanan Publik | Disnakertrans Kab. Serang",
        description: "Panduan resmi pembuatan Kartu Kuning (AK-1), bursa kerja, dan layanan ketenagakerjaan Kabupaten Serang.",
    },
};

async function getLayananData() {
    return {
        karirData: {
            lowongan: "117.4k+",
            perusahaan: "33.0k+"
        }
    };
}

const faqItems = [
    {
        q: "Bagaimana cara mendaftar Kartu Kuning (AK-1) secara online?",
        a: "Unduh aplikasi Serang Bahagia di Play Store atau App Store. Buat akun, lalu pilih menu 'AK.1 (Kartu Kuning)'. Isi data diri, unggah dokumen persyaratan (KTP, ijazah, pas foto), lalu submit. Petugas akan memverifikasi dalam 1–3 hari kerja dan Anda dapat mengunduh kartu digital."
    },
    {
        q: "Berapa biaya pembuatan Kartu Kuning (AK-1)?",
        a: "Pembuatan Kartu Kuning (AK-1) tidak dipungut biaya apapun alias GRATIS. Layanan ini merupakan layanan publik yang disediakan oleh Disnakertrans Kabupaten Serang untuk membantu masyarakat pencari kerja."
    },
    {
        q: "Berapa lama proses verifikasi dokumen online?",
        a: "Proses verifikasi dokumen umumnya membutuhkan waktu 1–3 hari kerja setelah semua dokumen dinyatakan lengkap. Anda akan mendapat notifikasi melalui aplikasi Serang Bahagia ketika kartu sudah siap diunduh."
    },
    {
        q: "Apakah saya harus datang ke kantor setelah daftar online?",
        a: "Tidak perlu! Kartu Kuning AK-1 yang dibuat secara online sudah berlaku secara resmi dan dapat digunakan untuk melamar pekerjaan. Anda cukup mengunduh kartu digital dari aplikasi Serang Bahagia tanpa perlu datang ke kantor Disnakertrans."
    },
    {
        q: "Fupa email atau kata sandi akun Sisnaker?",
        a: "Gunakan fitur \"Lupa Password\" pada halaman login portal Sisnaker Kemnaker. Jika masih mengalami kendala, silakan datang ke pusat layanan Disnakertrans Kabupaten Serang dengan membawa KTP asli untuk bantuan pemulihan akun."
    },
];

export default async function LayananPublikPage() {
    const data = await getLayananData();

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-[#0A192F] overflow-hidden text-white">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/banner-layanan.jpg"
                        alt="Hamparan Padi dan Kearifan Lokal Kabupaten Serang"
                        className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/85 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center rounded-full border border-[#FBBF24]/40 px-4 py-1.5 text-xs font-bold text-[#FBBF24]/80 tracking-widest uppercase mb-6 bg-[#FBBF24]/5">
                            Pilar Pelayanan Digital
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15] text-white">
                            Pilar Digital Pelayanan
                            <span className="text-[#FBBF24]"> Ketenagakerjaan.</span>
                        </h1>
                        <p className="text-base md:text-lg text-white/65 mb-10 max-w-xl leading-relaxed">
                            Akses transparan, cepat, dan modern untuk seluruh warga Kabupaten Serang dalam mengelola kebutuhan tenaga kerja dan transmigrasi.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="#layanan-unggulan" className="bg-[#FBBF24] text-[#0A192F] hover:bg-[#FCD34D] px-8 py-3.5 rounded-lg font-bold transition-colors text-center shadow-lg shadow-yellow-500/20">
                                Jelajahi Layanan
                            </a>
                            <Link href="/layanan-publik/tutorial-ak1" className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-8 py-3.5 rounded-lg font-bold transition-all text-center backdrop-blur-sm">
                                Tutorial AK-1 Online
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F8FAFC] dark:from-[#0B1120] to-transparent" />
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
                                {/* Link langsung ke halaman tutorial */}
                                <Link href="/layanan-publik/tutorial-ak1" className="text-[#0A192F] font-bold text-xs text-center hover:underline inline-flex items-center justify-center gap-1">
                                    Lihat Tutorial Lengkap <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>

                        {/* Karir Serang (cols 1-7, left of OSS RBA) */}
                        <div className="lg:col-span-7 bg-[#0A192F] dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 lg:p-10 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#FBBF24] rounded-full blur-[90px] opacity-10 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center text-[#FBBF24] shrink-0">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-white">Karir Serang</h3>
                                        <span className="inline-block mt-1 bg-[#FBBF24] text-[#0A192F] text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                                            PORTAL BURSA KERJA DAERAH
                                        </span>
                                    </div>
                                </div>
                                <p className="text-white/70 text-sm leading-relaxed mb-6">
                                    Platform resmi bursa kerja online Kabupaten Serang (<code className="text-[#FBBF24] bg-white/5 px-1 py-0.5 rounded font-mono text-xs">karir.serangkab.go.id</code>). Memudahkan pencari kerja lokal menemukan lowongan terverifikasi serta membantu perusahaan mempublikasikan rekrutmen daerah.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3 text-xs sm:text-sm text-white/80 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-[#FBBF24] shrink-0" /> Pendaftaran &amp; Informasi Loker Wilayah Kab. Serang
                                    </li>
                                    <li className="flex items-center gap-3 text-xs sm:text-sm text-white/80 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-[#FBBF24] shrink-0" /> Layanan Bursa Kerja (Job Fair) &amp; Rekrutmen Perusahaan
                                    </li>
                                    <li className="flex items-center gap-3 text-xs sm:text-sm text-white/80 font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-[#FBBF24] shrink-0" /> Sistem Terintegrasi Resmi Pemkab Serang
                                    </li>
                                </ul>
                            </div>
                            <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <span className="text-white/40 text-xs font-mono font-medium tracking-wide">karir.serangkab.go.id</span>
                                <a
                                    href="https://karir.serangkab.go.id/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#FBBF24] hover:bg-[#FCD34D] text-[#0A192F] font-bold px-6 py-3 rounded-xl transition-all shadow-md inline-flex items-center gap-2 text-sm text-center"
                                >
                                    Buka Karir Serang <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* OSS RBA (cols 8-12, right of Karir Serang) */}
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

                        {/* Karir Hub (cols 1-12) */}
                        <div className="lg:col-span-12 bg-[#0A192F] rounded-2xl shadow-lg border border-[#1E293B] p-8 lg:p-10 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
                            <div className="relative z-10 max-w-xl">
                                <h3 className="text-2xl font-extrabold text-white mb-3">KarirHub Kemnaker</h3>
                                <p className="text-white/70 text-sm leading-relaxed mb-4">
                                    Platform resmi Kementerian Ketenagakerjaan yang menghubungkan pencari kerja dengan perusahaan-perusahaan terpercaya di seluruh Indonesia.
                                </p>
                                <ul className="flex flex-wrap gap-x-6 gap-y-2 mb-2">
                                    <li className="flex items-center gap-2 text-xs text-white/60 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FBBF24]" /> Lowongan kerja terverifikasi
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-white/60 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FBBF24]" /> Profil pencari kerja online
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-white/60 font-medium">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FBBF24]" /> Pelatihan &amp; sertifikasi
                                    </li>
                                </ul>
                            </div>
                            <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto shrink-0 justify-end">
                                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex-1 sm:flex-initial min-w-[120px] text-center">
                                    <h4 className="text-white font-extrabold text-lg sm:text-xl mb-1">{data.karirData.lowongan}</h4>
                                    <p className="text-[9px] sm:text-[10px] text-white/50 tracking-wider uppercase font-bold">Lowongan Aktif</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex-1 sm:flex-initial min-w-[120px] text-center">
                                    <h4 className="text-white font-extrabold text-lg sm:text-xl mb-1">{data.karirData.perusahaan}</h4>
                                    <p className="text-[9px] sm:text-[10px] text-white/50 tracking-wider uppercase font-bold">Perusahaan Mitra</p>
                                </div>
                                <a
                                    href="https://karirhub.kemnaker.go.id/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#B45309] hover:bg-[#92400E] text-white h-16 px-5 shrink-0 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors shadow-lg"
                                >
                                    <span>KarirHub</span> <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══ KEUNGGULAN DIGITAL ═══ */}
            <section className="py-20 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="text-center mb-14">
                        <span className="text-[#B45309] dark:text-[#FBBF24] font-bold text-xs tracking-widest uppercase mb-3 inline-block">Keunggulan Digital</span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Mengapa Menggunakan Layanan Digital?
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
                            Layanan digital dirancang untuk memberikan kemudahan, efisiensi, dan transparansi bagi masyarakat Kabupaten Serang.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Zap,
                                title: "Cepat",
                                desc: "Proses administrasi yang jauh lebih singkat dibanding layanan konvensional tatap muka.",
                                color: "bg-[#FEF3C7] text-[#92400E]",
                            },
                            {
                                icon: Shield,
                                title: "Aman",
                                desc: "Data pribadi dilindungi dengan protokol keamanan digital standar pemerintahan.",
                                color: "bg-[#DCFCE7] text-[#166534]",
                            },
                            {
                                icon: Globe,
                                title: "Akses Fleksibel",
                                desc: "Dapat diakses kapan saja dan di mana saja melalui perangkat smartphone atau laptop Anda.",
                                color: "bg-[#DBEAFE] text-[#1E40AF]",
                            },
                            {
                                icon: Eye,
                                title: "Transparan",
                                desc: "Pantau status pengajuan layanan Anda secara real-time tanpa perantara.",
                                color: "bg-[#F3E8FF] text-[#7E22CE]",
                            },
                        ].map((item) => (
                            <div key={item.title} className="bg-[#F8FAFC] dark:bg-[#1E293B] rounded-2xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA BANNER ═══ */}
            <section className="relative overflow-hidden">
                {/* Background: deep navy gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A192F] via-[#0F2850] to-[#0A192F]" />

                {/* Geometric decoration */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                    {/* Gold dot pattern */}
                    <div className="absolute inset-0 opacity-[0.06]"
                        style={{ backgroundImage: 'radial-gradient(#FBBF24 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    />
                    {/* Glowing orbs */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1E3A8A] rounded-full blur-[100px] opacity-40" />
                    <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-[#FBBF24] rounded-full blur-[120px] opacity-10" />
                    {/* Vertical light strip */}
                    <div className="absolute top-0 bottom-0 right-1/3 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    {/* Horizontal accent */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FBBF24]/20 to-transparent" />
                    {/* Corner decorative squares */}
                    <div className="absolute top-8 right-8 w-16 h-16 border border-[#FBBF24]/10 rounded-xl rotate-12" />
                    <div className="absolute top-12 right-12 w-8 h-8 border border-[#FBBF24]/15 rounded-lg rotate-12" />
                    <div className="absolute bottom-6 left-8 w-10 h-10 border border-white/10 rounded-lg -rotate-6" />
                </div>

                <div className="container mx-auto px-4 xl:px-12 py-16 md:py-20 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

                        {/* Left: Text content */}
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-full px-4 py-1.5 mb-5">
                                <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse" />
                                <span className="text-[#FBBF24] text-[10px] font-bold tracking-widest uppercase">Layanan Aktif 24/7</span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
                                Butuh Bantuan Layanan
                                <span className="text-[#FBBF24]"> Ketenagakerjaan?</span>
                            </h2>
                            <p className="text-white/60 text-sm leading-relaxed mb-0">
                                Tim Disnakertrans Kabupaten Serang siap membantu Anda dalam proses pendaftaran, konsultasi ketenagakerjaan, dan informasi pelatihan kerja.
                            </p>
                        </div>

                        {/* Right: Action cards */}
                        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
                            {/* Card 1: Pengaduan */}
                            <Link href="/pengaduan"
                                className="group flex flex-col bg-white/10 hover:bg-white/15 border border-white/10 hover:border-[#FBBF24]/40 rounded-2xl p-6 transition-all duration-300 min-w-[180px]">
                                <div className="w-10 h-10 bg-[#FBBF24]/15 group-hover:bg-[#FBBF24]/25 rounded-xl flex items-center justify-center mb-4 transition-colors">
                                    <svg className="w-5 h-5 text-[#FBBF24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-white font-bold text-sm mb-1">Konsultasi & Pengaduan</h3>
                                <p className="text-white/50 text-[11px] leading-relaxed mb-4">Sampaikan pertanyaan atau pengaduan Anda</p>
                                <span className="mt-auto text-[#FBBF24] text-[11px] font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Buka Formulir <ArrowRight className="w-3 h-3" />
                                </span>
                            </Link>

                            {/* Card 2: Tutorial AK-1 */}
                            <Link href="/layanan-publik/tutorial-ak1"
                                className="group flex flex-col bg-[#FBBF24] hover:bg-[#FCD34D] rounded-2xl p-6 transition-all duration-300 min-w-[180px] shadow-lg shadow-yellow-500/20">
                                <div className="w-10 h-10 bg-[#0A192F]/20 rounded-xl flex items-center justify-center mb-4">
                                    <svg className="w-5 h-5 text-[#0A192F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-[#0A192F] font-bold text-sm mb-1">Tutorial Kartu Kuning</h3>
                                <p className="text-[#0A192F]/60 text-[11px] leading-relaxed mb-4">Panduan lengkap daftar AK-1 secara online</p>
                                <span className="mt-auto text-[#0A192F] text-[11px] font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Lihat Panduan <ArrowRight className="w-3 h-3" />
                                </span>
                            </Link>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══ FAQ ═══ */}
            <section className="py-20 bg-[#F8FAFC] dark:bg-[#0B1120] border-t border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

                        {/* Left: heading + contact box */}
                        <div className="lg:col-span-1">
                            <span className="text-[#B45309] dark:text-[#FBBF24] font-bold text-xs tracking-widest uppercase mb-3 inline-block">Pusat Bantuan</span>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-snug">
                                Pertanyaan yang Sering Diajukan
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                                Temukan jawaban atas pertanyaan yang sering ditanyakan terkait layanan digital Disnakertrans Kabupaten Serang.
                            </p>
                            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                                <p className="font-bold text-gray-900 dark:text-white text-sm mb-2">Belum menemukan jawaban?</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4">
                                    Hubungi tim support kami melalui tombol chat di pojok kanan bawah halaman ini.
                                </p>
                                <a
                                    href="/pengaduan"
                                    className="text-[#B45309] dark:text-[#FBBF24] text-xs font-bold inline-flex items-center gap-1 hover:underline"
                                >
                                    Bantuan Langsung <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        {/* Right: FAQ accordion */}
                        <div className="lg:col-span-2 space-y-3">
                            {faqItems.map((item, i) => (
                                <details key={i} className="group bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none font-semibold text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#243147] transition-colors">
                                        {item.q}
                                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
