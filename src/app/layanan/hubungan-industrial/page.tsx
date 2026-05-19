import Link from "next/link";
import { Scale, MessageSquareWarning, Users, Shield, Handshake, FileText, ArrowRight, Phone, Mail } from "lucide-react";

export const metadata = {
    title: "Hubungan Industrial | Disnakertrans Serang",
    description: "Layanan hubungan industrial Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang — konsultasi, mediasi, dan pengaduan ketenagakerjaan."
};

export default function HubunganIndustrialPage() {
    const layanan = [
        {
            icon: Users,
            title: "Konsultasi Ketenagakerjaan",
            desc: "Konsultasi gratis seputar hak dan kewajiban pekerja, peraturan ketenagakerjaan, pengupahan, dan kontrak kerja.",
            features: ["Konsultasi langsung di kantor", "Konsultasi via telepon/email", "Pendampingan hukum ketenagakerjaan"],
        },
        {
            icon: Handshake,
            title: "Mediasi Perselisihan",
            desc: "Penyelesaian perselisihan hubungan industrial melalui mediasi yang difasilitasi oleh mediator bersertifikat.",
            features: ["Mediasi perselisihan hak", "Mediasi perselisihan kepentingan", "Mediasi PHK"],
        },
        {
            icon: MessageSquareWarning,
            title: "Pengaduan Ketenagakerjaan",
            desc: "Sampaikan pengaduan terkait pelanggaran hak pekerja, kondisi kerja tidak layak, atau masalah hubungan industrial.",
            features: ["Pelaporan pelanggaran hak pekerja", "Pengaduan K3", "Pelaporan pelanggaran upah"],
        },
    ];

    const regulasi = [
        "UU No. 13 Tahun 2003 tentang Ketenagakerjaan",
        "UU No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial",
        "PP No. 36 Tahun 2021 tentang Pengupahan",
        "Permenaker No. 6 Tahun 2016 tentang THR Keagamaan",
    ];

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Hero */}
            <section className="bg-[#0A192F] pt-32 pb-24 lg:pt-40 lg:pb-32 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[140px]" />
                </div>
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center rounded-full border border-[#FBBF24] px-4 py-1.5 text-xs font-bold text-[#FBBF24] tracking-widest uppercase mb-6">
                            Layanan Publik
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Hubungan <br className="hidden md:block" />
                            <span className="text-[#FBBF24]">Industrial</span>
                        </h1>
                        <p className="text-base md:text-xl text-white/80 max-w-2xl leading-relaxed mb-8">
                            Layanan konsultasi, mediasi perselisihan, dan pengaduan ketenagakerjaan untuk mewujudkan hubungan kerja yang harmonis, dinamis, dan berkeadilan.
                        </p>
                        <Link
                            href="/pengaduan?type=hubungan_industrial"
                            className="inline-flex items-center gap-2 bg-[#FBBF24] text-[#0A192F] px-8 py-4 rounded-xl font-bold hover:bg-[#FCD34D] transition-all shadow-lg shadow-yellow-500/20"
                        >
                            <MessageSquareWarning className="w-5 h-5" />
                            Ajukan Pengaduan
                        </Link>
                    </div>
                </div>
            </section>

            {/* Jenis Layanan */}
            <section className="py-20 bg-[#F8FAFC] dark:bg-[#0B1120]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Jenis Layanan</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Bidang Hubungan Industrial & Jaminan Sosial Tenaga Kerja menyediakan layanan berikut untuk masyarakat.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {layanan.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#1E293B] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col group">
                                <div className="w-14 h-14 bg-[#EFF6FF] text-[#1E3A8A] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{item.desc}</p>
                                <ul className="space-y-2.5 mt-auto">
                                    {item.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="w-1.5 h-1.5 bg-[#FBBF24] rounded-full shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Regulasi */}
            <section className="py-20 bg-white dark:bg-[#111827]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dasar Hukum</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Layanan hubungan industrial berlandaskan pada regulasi ketenagakerjaan yang berlaku di Indonesia untuk memastikan perlindungan hak pekerja dan pemberi kerja.
                            </p>
                            <ul className="space-y-4">
                                {regulasi.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-[#0A192F] rounded-2xl p-8 text-white">
                            <h3 className="text-xl font-bold mb-6">Kontak Bidang HI & Jamsostek</h3>
                            <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-[#FBBF24]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50">Telepon</p>
                                        <p className="font-semibold">(0254) 200234</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-[#FBBF24]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/50">Email</p>
                                        <p className="font-semibold">disnakertrans@serangkab.go.id</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 mt-8 pt-8">
                                <p className="text-white/60 text-sm mb-6">
                                    Punya masalah terkait hubungan industrial? Sampaikan pengaduan Anda secara online.
                                </p>
                                <Link
                                    href="/pengaduan?type=hubungan_industrial"
                                    className="w-full inline-flex items-center justify-center gap-2 bg-[#FBBF24] text-[#0A192F] px-6 py-3.5 rounded-xl font-bold hover:bg-[#FCD34D] transition-all"
                                >
                                    Ajukan Pengaduan <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
