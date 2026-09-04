import { Target, CheckCircle2, GraduationCap, Briefcase, FileText, Users, Search, Handshake, Compass, Download, Building2, ClipboardList } from "lucide-react";
import { getSiteContentByKey } from "@/lib/services/content.service";

export const revalidate = 120;

export const metadata = {
    title: "Profil Instansi & Struktur Organisasi",
    description: "Visi, misi, tugas pokok, fungsi, dan struktur organisasi Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang.",
    openGraph: {
        title: "Profil Instansi | Disnakertrans Kab. Serang",
        description: "Visi, misi, struktur organisasi, dan tugas fungsi Disnakertrans Pemerintah Kabupaten Serang.",
    },
};

async function getProfilData() {
    return {
        visi: [
            "Terwujudnya Kondisi Tenaga Kerja Dan Transmigrasi Yang Sejahtera."
        ],
    
        misi: [
            { id: 1, title: "Meningkatkan kualitas SDM ketenagakerjaan", desc: "Meningkatkan kualitas sumber daya manusia di bidang ketenagakerjaan secara menyeluruh dan berkelanjutan.", icon: GraduationCap },
            { id: 2, title: "Pelatihan dan Sertifikasi", desc: "Meningkatkan kualitas tenaga kerja melalui pelatihan dan sertifikasi yang terstandar secara nasional.", icon: CheckCircle2 },
            { id: 3, title: "Perluasan Kesempatan Kerja", desc: "Mendorong perluasan kesempatan kerja bagi seluruh masyarakat Kabupaten Serang.", icon: Briefcase },
            { id: 4, title: "Hubungan Industrial Harmonis", desc: "Mewujudkan hubungan industrial yang harmonis antara pekerja dan pemberi kerja.", icon: Handshake },
            { id: 5, title: "Pengawasan Ketenagakerjaan", desc: "Memperkuat pengawasan ketenagakerjaan demi perlindungan hak-hak pekerja.", icon: FileText },
            { id: 6, title: "Layanan Penempatan Kerja", desc: "Meningkatkan layanan penempatan kerja yang transparan dan merata.", icon: Search },
            { id: 7, title: "Kolaborasi Dunia Usaha & Industri", desc: "Mendorong kolaborasi dunia usaha dan industri untuk menciptakan ekosistem ketenagakerjaan yang sehat.", icon: Users },
            { id: 8, title: "Transmigrasi Berkelanjutan", desc: "Memfasilitasi transmigrasi yang layak dan berkelanjutan bagi warga yang membutuhkan.", icon: Compass },
        ],
        bidang: [
            {
                id: 1,
                title: "SEKRETARIAT",
                desc: "Mempunyai tugas pokok memimpin, merencanakan, melaksanakan dan mengawasi penyelenggaraan tugas pemerintah Daerah bidang program dan evaluasi, umum dan kepegawaian dan keuangan.",
                icon: Building2
            },
            {
                id: 2,
                title: "BINAPENTA",
                desc: "Bidang Pembinaan dan Penempatan Tenaga Kerja, mempunyai tugas pokok memimpin, merencanakan, melaksanakan, dan mengawasi penyelenggaraan tugas bidang penempatan tenaga kerja dalam negeri, luar negeri, transmigrasi dan perluasan tenaga kerja.",
                icon: Search
            },
            {
                id: 3,
                title: "LATTAS",
                desc: "Bidang Pelatihan dan Produktivitas Tenaga Kerja, mempunyai tugas pokok memimpin, merencanakan, melaksanakan, dan mengawasi penyelenggaraan tugas di bidang pelatihan tenaga kerja, bina kelembagaan pelatihan, serta produktivitas tenaga kerja.",
                icon: GraduationCap
            },
            {
                id: 4,
                title: "HI & JAMSOSTEK",
                desc: "Bidang Hubungan Industrial dan Jaminan Sosial Tenaga Kerja, mempunyai tugas pokok memimpin, merencanakan, melaksanakan dan mengawasi penyelenggaraan tugas bidang Pengupahan dan Jaminan Sosial Tenaga Kerja, syarat-syarat kerja, penyelesaian perselisihan hubungan industrial.",
                icon: Handshake
            },
        ]
    };
}

export default async function ProfilPage() {
    const data = await getProfilData();

    // Fetch CMS content for dynamic sections
    const [
        sambutanNama,
        sambutanJabatan,
        sambutanTeks,
        sambutanFoto,
    ] = await Promise.all([
        getSiteContentByKey('sambutan_name'),
        getSiteContentByKey('sambutan_title'),
        getSiteContentByKey('sambutan_text'),
        getSiteContentByKey('sambutan_photo'),
    ]);

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-white dark:bg-[#0B1120]">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-[#0A192F] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="/images/banner-pamarayan.jpg" alt="Bendung Pamarayan Lama Kabupaten Serang" className="w-full h-full object-cover opacity-35 mix-blend-luminosity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/85 to-transparent"></div>
                </div>
                
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight text-white">
                            Membangun Pilar <br className="hidden md:block"/>
                            Ketenagakerjaan yang <br className="hidden md:block"/>
                            Mandiri
                        </h1>
                        <p className="text-base md:text-lg text-white/80 max-w-xl leading-relaxed">
                           Mengenal visi, misi, struktur organisasi, dan peran Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang sebagai penggerak ekonomi daerah.
                        </p>
                    </div>
                </div>
            </section>

            {/* Sambutan Kepala Dinas */}
            <section className="py-20 bg-white dark:bg-[#111827]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Image Side */}
                        <div className="relative w-full lg:w-5/12 max-w-sm mx-auto lg:max-w-none">
                            <div className="bg-[#FDE68A] absolute inset-0 -ml-4 -mt-4 rounded-xl min-h-full aspect-[3/4]"></div>
                            <div className="relative z-10 bg-white rounded-xl overflow-hidden shadow-xl aspect-[3/4]">
                                <img src={sambutanFoto || "/images/kepala-dinas.png"} alt="Kepala Dinas" className="w-full h-full object-cover object-top" />
                            </div>
                        </div>
                        {/* Text Side */}
                        <div className="w-full lg:w-7/12">
                            <div className="w-10 h-1 bg-[#FBBF24] mb-6 rounded-full"></div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">Sambutan Kepala Dinas</h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg italic mb-8 leading-relaxed">
                                &ldquo;{sambutanTeks || 'Selamat datang di portal resmi Disnakertrans Kabupaten Serang. Kami berkomitmen untuk terus berinovasi dalam memberikan layanan terbaik bagi seluruh pencari kerja dan pemberi kerja.'}&rdquo;
                            </p>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{sambutanNama || 'Kepala Dinas'}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{sambutanJabatan || 'Kepala Dinas Tenaga Kerja dan Transmigrasi Kab. Serang'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visi & Misi Section */}
            <section className="py-20 bg-[#F8FAFC] dark:bg-[#0B1120]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                        
                        {/* Visi */}
                        <div className="w-full lg:w-5/12">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-0.5 bg-[#B45309]"></div>
                                <span className="text-[#B45309] dark:text-[#FBBF24] font-bold text-xs tracking-widest uppercase">Strategi & Arah</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Visi Instansi</h2>
                            
                            <div className="relative bg-white dark:bg-[#1E293B] p-8 lg:p-10 shadow-sm border-y border-r border-[#E2E8F0] dark:border-gray-700 border-l-4 border-l-[#B45309]">
                                <ul className="space-y-3">
                                    {data.visi.map((v, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="mt-1.5 w-2 h-2 rounded-full bg-[#B45309] shrink-0"></span>
                                            <p className="text-lg lg:text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed italic">
                                                "{v}"
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Misi */}
                        <div className="w-full lg:w-7/12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 lg:mt-[52px]">Misi Utama</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {data.misi.map((m) => (
                                    <div key={m.id} className="bg-gray-50/80 dark:bg-[#0F172A] hover:bg-white dark:hover:bg-[#1E293B] p-5 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-4 transition-colors shadow-sm">
                                        <div className="w-10 h-10 bg-[#0A192F] text-[#FBBF24] rounded-lg flex items-center justify-center shrink-0">
                                            <m.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{m.title}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xs">{m.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                    </div>
                </div>
            </section>

            {/* Tugas & Fungsi Pokok Section */}
            <section className="py-24 bg-[#0A192F] text-white">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="max-w-2xl mb-4">
                        <p className="text-[#FBBF24] text-xs font-bold tracking-widest uppercase mb-3">Berdasarkan Perbup Kab. Serang No. 93 Tahun 2022</p>
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tugas & Fungsi Pokok</h2>
                        <p className="text-white/70 leading-relaxed">
                            Tentang Struktur Organisasi dan Tata Kerja Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        {/* Tugas Pokok */}
                        <div className="p-8 lg:p-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-[#FBBF24] font-bold text-3xl opacity-80">A</span>
                                <h3 className="text-xl font-bold">Tugas Pokok</h3>
                            </div>
                            <ul className="space-y-4 text-white/70 text-sm lg:text-base leading-relaxed">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0"></span>
                                    <span>Unsur penunjang Pemerintahan Daerah di bidang pembinaan dan penempatan tenaga kerja, pelatihan dan produktivitas tenaga kerja, hubungan industrial dan jaminan sosial tenaga kerja.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0"></span>
                                    <span>Melaksanakan tugas lain yang diberikan oleh Bupati sesuai bidang tugasnya.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Fungsi */}
                        <div className="p-8 lg:p-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-[#FBBF24] font-bold text-3xl opacity-80">B</span>
                                <h3 className="text-xl font-bold">Fungsi</h3>
                            </div>
                            <ul className="space-y-3 text-white/70 text-sm lg:text-base leading-relaxed">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0"></span>
                                    <span>Perencanaan program kegiatan pembinaan dan penempatan tenaga kerja, pelatihan dan produktivitas tenaga kerja, hubungan industrial dan jaminan sosial tenaga kerja.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0"></span>
                                    <span>Pengoordinasian dengan pemangku kepentingan (stakeholder) dalam kegiatan pembinaan dan penempatan tenaga kerja.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0"></span>
                                    <span>Pelaksanaan administrasi dan teknis operasional di bidang pembinaan, pelatihan, dan produktivitas tenaga kerja.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0"></span>
                                    <span>Pengelolaan data dan pelaporan pelaksanaan kegiatan di bidang ketenagakerjaan.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FBBF24] shrink-0"></span>
                                    <span>Pelaksanaan tugas tambahan.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Struktur Bidang */}
            <section className="py-20 bg-[#F8FAFC] dark:bg-[#0B1120]">
                <div className="container mx-auto px-4 xl:px-12 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Struktur Bidang</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                        Unit kerja fungsional yang menangani spesifikasi urusan ketenagakerjaan berdasarkan Perbup Kab. Serang No. 93 Tahun 2022.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        {data.bidang.map(b => (
                            <div key={b.id} className="bg-white dark:bg-[#1E293B] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-md transition-shadow">
                                <div className="mb-6 text-[#92400E]">
                                    <b.icon className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#0A192F] dark:group-hover:text-[#93C5FD] transition-colors">
                                    {b.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {b.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Struktur Organisasi */}
            <section className="py-20 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Struktur Organisasi dan Tata Kerja</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-2xl p-8 lg:p-12 border border-gray-100 overflow-x-auto">
                        <div className="text-center mb-8">
                            <h3 className="text-xl lg:text-2xl font-extrabold text-[#0A192F] leading-tight">STRUKTUR ORGANISASI DAN TATA KERJA</h3>
                            <p className="text-sm font-bold text-[#0A192F] mt-1">DINAS TENAGA KERJA DAN TRANSMIGRASI KABUPATEN SERANG</p>
                        </div>
                        
                        <div className="relative min-w-[1000px]" style={{ height: '720px' }}>
                            {/* SVG Lines Layer */}
                            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                                {/* Kepala Dinas to center junction */}
                                <line x1="50%" y1="60" x2="50%" y2="100" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Center junction horizontal line (Kepala to left KJF and right Sekretaris) */}
                                <line x1="15%" y1="100" x2="75%" y2="100" stroke="#94A3B8" strokeWidth="2" strokeDasharray="8,5" />
                                
                                {/* Down to Kelompok Jabatan Fungsional (left) */}
                                <line x1="15%" y1="100" x2="15%" y2="120" stroke="#94A3B8" strokeWidth="2" strokeDasharray="8,5" />
                                
                                {/* Down to Sekretaris (right) */}
                                <line x1="75%" y1="100" x2="75%" y2="120" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Sekretaris down to junction for sub-units */}
                                <line x1="75%" y1="175" x2="75%" y2="210" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Horizontal line under Sekretaris for 3 sub-units */}
                                <line x1="52%" y1="210" x2="94%" y2="210" stroke="#94A3B8" strokeWidth="2" strokeDasharray="8,5" />
                                
                                {/* Down to KJF under Sekretaris */}
                                <line x1="52%" y1="210" x2="52%" y2="230" stroke="#94A3B8" strokeWidth="2" strokeDasharray="8,5" />
                                
                                {/* Down to Sub Bidang Umum */}
                                <line x1="73%" y1="210" x2="73%" y2="230" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Down to Sub Bagian Program */}
                                <line x1="94%" y1="210" x2="94%" y2="230" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Kepala Dinas down to Bidang junction - vertical from center */}
                                <line x1="50%" y1="100" x2="50%" y2="340" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Horizontal line connecting 3 Bidang */}
                                <line x1="16%" y1="340" x2="84%" y2="340" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Down to Bidang 1 */}
                                <line x1="16%" y1="340" x2="16%" y2="360" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Down to Bidang 2 */}
                                <line x1="50%" y1="340" x2="50%" y2="360" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Down to Bidang 3 */}
                                <line x1="84%" y1="340" x2="84%" y2="360" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Bidang 1 down to KJF */}
                                <line x1="16%" y1="430" x2="16%" y2="455" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Bidang 2 down to KJF */}
                                <line x1="50%" y1="430" x2="50%" y2="455" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Bidang 3 down to KJF */}
                                <line x1="84%" y1="430" x2="84%" y2="455" stroke="#94A3B8" strokeWidth="2" />
                                
                                {/* Center vertical down to UPTD */}
                                <line x1="50%" y1="520" x2="50%" y2="580" stroke="#94A3B8" strokeWidth="2" />
                            </svg>
                            
                            {/* Nodes Layer */}
                            <div className="relative" style={{ zIndex: 1 }}>
                                
                                {/* Kepala Dinas */}
                                <div className="absolute" style={{ top: '0px', left: '50%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-r from-[#0E7490] to-[#0891B2] text-white px-6 py-4 rounded-lg text-center shadow-lg w-[280px]">
                                        <p className="text-[10px] tracking-widest uppercase font-bold text-cyan-100 mb-1">Kepala Dinas</p>
                                        <h4 className="font-bold text-xs leading-tight">Tenaga Kerja dan Transmigrasi</h4>
                                    </div>
                                </div>
                                
                                {/* Kelompok Jabatan Fungsional (Left - dashed) */}
                                <div className="absolute" style={{ top: '120px', left: '15%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-white text-gray-700 px-4 py-3 rounded-lg text-center w-[185px] shadow-sm border-2 border-gray-300">
                                        <p className="text-[9px] tracking-widest uppercase font-bold text-gray-500 mb-0.5">Kelompok Jabatan</p>
                                        <h4 className="font-bold text-[11px]">Fungsional</h4>
                                    </div>
                                </div>
                                
                                {/* Sekretaris (Right) */}
                                <div className="absolute" style={{ top: '120px', left: '75%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-r from-[#0E7490] to-[#06B6D4] text-white px-5 py-4 rounded-lg text-center w-[185px] shadow-md">
                                        <p className="text-[10px] tracking-widest uppercase font-bold text-cyan-100">Sekretaris</p>
                                    </div>
                                </div>
                                
                                {/* KJF under Sekretaris */}
                                <div className="absolute" style={{ top: '230px', left: '52%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-r from-[#0E7490] to-[#0891B2] text-white px-3 py-2.5 rounded-lg text-center w-[170px] shadow-sm">
                                        <p className="text-[8px] tracking-widest uppercase font-bold text-cyan-100 mb-0.5">Kelompok Jabatan</p>
                                        <h4 className="font-bold text-[10px]">Fungsional</h4>
                                    </div>
                                </div>
                                
                                {/* Sub Bidang Umum dan Kepegawaian */}
                                <div className="absolute" style={{ top: '230px', left: '73%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] text-white px-3 py-2.5 rounded-lg text-center w-[170px] shadow-sm">
                                        <p className="text-[8px] tracking-widest uppercase font-bold text-cyan-100 mb-0.5">Sub Bidang</p>
                                        <h4 className="font-bold text-[10px]">Umum dan Kepegawaian</h4>
                                    </div>
                                </div>
                                
                                {/* Sub Bagian Program dan Evaluasi */}
                                <div className="absolute" style={{ top: '230px', left: '94%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] text-white px-3 py-2.5 rounded-lg text-center w-[170px] shadow-sm">
                                        <p className="text-[8px] tracking-widest uppercase font-bold text-cyan-100 mb-0.5">Sub Bagian</p>
                                        <h4 className="font-bold text-[10px]">Program dan Evaluasi</h4>
                                    </div>
                                </div>
                                
                                {/* Bidang 1: Pembinaan dan Penempatan Tenaga Kerja */}
                                <div className="absolute" style={{ top: '360px', left: '16%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-b from-[#0E7490] to-[#0891B2] text-white p-4 rounded-lg text-center w-[220px] shadow-md">
                                        <p className="text-[8px] tracking-widest uppercase font-bold text-cyan-100 mb-1">Bidang</p>
                                        <h4 className="font-bold text-[10px] leading-tight">Pembinaan dan Penempatan Tenaga Kerja</h4>
                                    </div>
                                </div>
                                
                                {/* Bidang 2: Pelatihan dan Produktivitas Tenaga Kerja */}
                                <div className="absolute" style={{ top: '360px', left: '50%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-b from-[#0E7490] to-[#0891B2] text-white p-4 rounded-lg text-center w-[220px] shadow-md">
                                        <p className="text-[8px] tracking-widest uppercase font-bold text-cyan-100 mb-1">Bidang</p>
                                        <h4 className="font-bold text-[10px] leading-tight">Pelatihan dan Produktivitas Tenaga Kerja</h4>
                                    </div>
                                </div>
                                
                                {/* Bidang 3: Hubungan Industrial dan Layanan Sosial */}
                                <div className="absolute" style={{ top: '360px', left: '84%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-b from-[#0E7490] to-[#0891B2] text-white p-4 rounded-lg text-center w-[220px] shadow-md">
                                        <p className="text-[8px] tracking-widest uppercase font-bold text-cyan-100 mb-1">Bidang</p>
                                        <h4 className="font-bold text-[10px] leading-tight">Hubungan Industrial dan Layanan Sosial Tenaga Kerja</h4>
                                    </div>
                                </div>
                                
                                {/* KJF under Bidang 1 */}
                                <div className="absolute" style={{ top: '455px', left: '16%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] text-white px-3 py-2.5 rounded-lg text-center w-[200px] shadow-sm">
                                        <p className="text-[8px] tracking-widest uppercase font-bold text-cyan-100 mb-0.5">Kelompok Jabatan</p>
                                        <h4 className="font-bold text-[10px]">Fungsional</h4>
                                    </div>
                                </div>
                                
                                {/* KJF under Bidang 2 */}
                                <div className="absolute" style={{ top: '455px', left: '50%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] text-white px-3 py-2.5 rounded-lg text-center w-[200px] shadow-sm">
                                        <p className="text-[8px] tracking-widest uppercase font-bold text-cyan-100 mb-0.5">Kelompok Jabatan</p>
                                        <h4 className="font-bold text-[10px]">Fungsional</h4>
                                    </div>
                                </div>
                                
                                {/* KJF under Bidang 3 */}
                                <div className="absolute" style={{ top: '455px', left: '84%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] text-white px-3 py-2.5 rounded-lg text-center w-[200px] shadow-sm">
                                        <p className="text-[8px] tracking-widest uppercase font-bold text-cyan-100 mb-0.5">Kelompok Jabatan</p>
                                        <h4 className="font-bold text-[10px]">Fungsional</h4>
                                    </div>
                                </div>
                                
                                {/* UPTD Dinas */}
                                <div className="absolute" style={{ top: '580px', left: '50%', transform: 'translateX(-50%)' }}>
                                    <div className="bg-gradient-to-r from-[#0E7490] to-[#0891B2] text-white px-6 py-3.5 rounded-lg text-center w-[220px] shadow-md">
                                        <p className="text-[9px] tracking-widest uppercase font-bold text-cyan-100 mb-0.5">Unit Pelaksana Teknis</p>
                                        <h4 className="font-bold text-sm">UPTD DINAS</h4>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}