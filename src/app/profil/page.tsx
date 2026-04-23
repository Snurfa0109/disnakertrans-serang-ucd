import { Target, CheckCircle2, GraduationCap, Briefcase, FileText, Users, Search, Handshake, Compass, Download } from "lucide-react";

export const metadata = {
    title: "Profil Instansi | Disnakertrans Serang"
};

// Simulated mock fetch
async function getProfilData() {
    return {
        misi: [
            { id: 1, title: "Peningkatan Kompetensi", desc: "Meningkatkan kualitas dan produktivitas tenaga kerja melalui pelatihan berbasis kompetensi dan sertifikasi nasional.", icon: GraduationCap },
            { id: 2, title: "Perluasan Kesempatan Kerja", desc: "Mendorong penciptaan lapangan kerja baru melalui fasilitasi penempatan dan informasi pasar kerja yang transparan.", icon: Briefcase },
            { id: 3, title: "Perlindungan Tenaga Kerja", desc: "Menjamin terciptanya hubungan industrial yang harmonis, dinamis, dan berkeadilan bagi pekerja dan pemberi kerja.", icon: FileText },
        ],
        bidang: [
            { id: 1, title: "Bidang Pelatihan & Produktivitas", desc: "Fokus pada standardisasi kompetensi dan penanganan industri.", icon: Users },
            { id: 2, title: "Bidang Penempatan Tenaga Kerja", desc: "Mengelola bursa kerja online dan penempatan pekerja lokal/migran.", icon: Search },
            { id: 3, title: "Bidang Hubungan Industrial", desc: "Penyelesaian perselisihan dan pengawasan syarat kerja perusahaan.", icon: Handshake },
            { id: 4, title: "Bidang Transmigrasi", desc: "Pengembangan kawasan transmigrasi dan kesejahteraan warga.", icon: Compass },
        ]
    };
}

export default async function ProfilPage() {
    const data = await getProfilData();

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-[#0A192F] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" alt="Building Background" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/80 to-transparent"></div>
                </div>
                
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight text-white">
                            Membangun Pilar <br className="hidden md:block"/>
                            Ketenagakerjaan yang <br className="hidden md:block"/>
                            Mandiri
                        </h1>
                        <p className="text-base md:text-lg text-white/80 max-w-xl leading-relaxed">
                            Profil lengkap Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang sebagai penggerak ekonomi daerah.
                        </p>
                    </div>
                </div>
            </section>

            {/* Visi & Misi Section */}
            <section className="py-20 bg-[#F8FAFC]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                        
                        {/* Visi */}
                        <div className="w-full lg:w-5/12">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-0.5 bg-[#B45309]"></div>
                                <span className="text-[#B45309] font-bold text-xs tracking-widest uppercase">Strategi & Arah</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Visi Instansi</h2>
                            
                            <div className="relative bg-white p-8 lg:p-10 shadow-sm border-y border-r border-[#E2E8F0] border-l-4 border-l-[#B45309]">
                                <p className="text-xl lg:text-2xl font-medium text-gray-800 leading-relaxed italic">
                                    "Terwujudnya Tenaga Kerja yang Kompeten, Produktif, dan Sejahtera menuju Kabupaten Serang yang Berdaya Saing."
                                </p>
                            </div>
                        </div>

                        {/* Misi */}
                        <div className="w-full lg:w-7/12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 lg:mt-[52px]">Misi Utama</h2>
                            <div className="space-y-4">
                                {data.misi.map((m) => (
                                    <div key={m.id} className="bg-gray-50/80 hover:bg-white p-6 rounded-xl border border-gray-100 flex items-start gap-6 transition-colors shadow-sm">
                                        <div className="w-12 h-12 bg-[#0A192F] text-[#FBBF24] rounded-lg flex items-center justify-center shrink-0">
                                            <m.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">{m.title}</h3>
                                            <p className="text-gray-600 leading-relaxed text-sm">{m.desc}</p>
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
                    <div className="max-w-2xl mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tugas & Fungsi Pokok</h2>
                        <p className="text-white/70 leading-relaxed">
                            Berdasarkan peraturan perundang-undangan, Disnakertrans menjalankan peran strategis dalam pembangunan daerah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 lg:p-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-[#FBBF24] font-bold text-3xl opacity-80">01</span>
                                <h3 className="text-xl font-bold">Tugas Pokok</h3>
                            </div>
                            <p className="text-white/70 leading-relaxed text-sm lg:text-base">
                                Melaksanakan urusan pemerintahan di bidang tenaga kerja dan ketransmigrasian yang menjadi kewenangan daerah dan tugas pembantuan yang diberikan kepada Kabupaten.
                            </p>
                        </div>
                        <div className="p-8 lg:p-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-[#FBBF24] font-bold text-3xl opacity-80">02</span>
                                <h3 className="text-xl font-bold">Fungsi Pelayanan</h3>
                            </div>
                            <p className="text-white/70 leading-relaxed text-sm lg:text-base">
                                Perumusan kebijakan teknis, pelaksanaan koordinasi, serta pemantauan, evaluasi dan pelaporan di bidang ketenagakerjaan dan transmigrasi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Struktur Bidang */}
            <section className="py-20 bg-[#F8FAFC]">
                <div className="container mx-auto px-4 xl:px-12 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Struktur Bidang</h2>
                    <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
                        Unit kerja fungsional yang menangani spesifikasi urusan ketenagakerjaan.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        {data.bidang.map(b => (
                            <div key={b.id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                                <div className="mb-6 text-[#92400E]">
                                    <b.icon className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-3 group-hover:text-[#0A192F] transition-colors line-clamp-2">
                                    {b.title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                    {b.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Struktur Organisasi */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Struktur Organisasi</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Hierarki kepemimpinan yang menjamin tata kelola pemerintahan yang transparan dan akuntabel.
                            </p>
                        </div>
                        <button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-[#78350F] font-bold px-6 py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto text-sm shrink-0 shadow-sm">
                            <Download className="w-4 h-4" /> UNDUH PDF
                        </button>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-2xl p-8 lg:p-16 border border-gray-100 flex justify-center overflow-x-auto">
                        <div className="flex flex-col items-center min-w-[800px]">
                            {/* Kepala Dinas */}
                            <div className="bg-[#0A192F] text-white p-5 rounded-lg text-center w-64 shadow-lg relative z-10 border-b-4 border-[#FBBF24]">
                                <p className="text-[10px] tracking-widest uppercase font-bold text-[#FBBF24] mb-2">Kepala Dinas</p>
                                <h4 className="font-bold text-sm">H. Diana Utami, S.Sos., M.Si</h4>
                            </div>
                            
                            {/* Connecting Line Down */}
                            <div className="w-0.5 h-10 bg-gray-300"></div>

                            {/* Horizontal Line connecting branches */}
                            <div className="w-[85%] h-0.5 bg-gray-300"></div>

                            {/* Connecting Lines to children */}
                            <div className="w-[85%] flex justify-between">
                                <div className="w-0.5 h-6 bg-gray-300"></div>
                                <div className="w-0.5 h-6 bg-gray-300"></div>
                                <div className="w-0.5 h-6 bg-gray-300"></div>
                                <div className="w-0.5 h-6 bg-gray-300"></div>
                            </div>

                            {/* Children level */}
                            <div className="w-[85%] flex justify-between gap-4">
                                <div className="bg-gray-200 text-gray-800 p-4 rounded text-center w-48 shadow-sm">
                                    <p className="text-[9px] tracking-widest uppercase font-bold text-gray-500 mb-1">Sekretaris</p>
                                    <h4 className="font-bold text-xs">Drs. Ahmad Jaelani</h4>
                                </div>
                                <div className="bg-gray-200 text-gray-800 p-4 rounded text-center w-48 shadow-sm">
                                    <p className="text-[9px] tracking-widest uppercase font-bold text-gray-500 mb-1">Kepala Bidang Pelatihan</p>
                                    <h4 className="font-bold text-xs">Siti Maisaroh, ST</h4>
                                </div>
                                <div className="bg-gray-200 text-gray-800 p-4 rounded text-center w-48 shadow-sm">
                                    <p className="text-[9px] tracking-widest uppercase font-bold text-gray-500 mb-1">Kepala Bidang Penempatan</p>
                                    <h4 className="font-bold text-xs">Irfan Hakim, M.Ak</h4>
                                </div>
                                <div className="bg-gray-200 text-gray-800 p-4 rounded text-center w-48 shadow-sm">
                                    <p className="text-[9px] tracking-widest uppercase font-bold text-gray-500 mb-1">Kepala Bidang HI</p>
                                    <h4 className="font-bold text-xs">Budi Santoso, SH</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

