import Link from "next/link";
import { FileText, CheckCircle2, ArrowRight, ExternalLink, ClipboardList, Users, Building2, Clock } from "lucide-react";

export const metadata = {
    title: "Kartu Kuning (AK-1) | Disnakertrans Serang",
    description: "Informasi dan pendaftaran Kartu Kuning (AK-1) online Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang."
};

export default function AK1Page() {
    const persyaratan = [
        "Fotokopi KTP yang masih berlaku",
        "Fotokopi ijazah terakhir (legalisir)",
        "Pas foto 3x4 berwarna (2 lembar)",
        "Fotokopi SKCK yang masih berlaku",
        "Surat keterangan sehat dari dokter",
        "Fotokopi sertifikat keterampilan (jika ada)",
    ];

    const alurPendaftaran = [
        { step: "1", title: "Siapkan Dokumen", desc: "Lengkapi semua persyaratan yang dibutuhkan" },
        { step: "2", title: "Kunjungi Kantor / Daftar Online", desc: "Datang ke Disnakertrans atau daftar via portal online" },
        { step: "3", title: "Verifikasi Data", desc: "Petugas memverifikasi kelengkapan dokumen Anda" },
        { step: "4", title: "Kartu Terbit", desc: "Kartu AK-1 diterbitkan dan siap diambil" },
    ];

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Hero */}
            <section className="bg-[#0A192F] pt-32 pb-24 lg:pt-40 lg:pb-32 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-[#FBBF24] rounded-full blur-[120px]" />
                </div>
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center rounded-full border border-[#FBBF24] px-4 py-1.5 text-xs font-bold text-[#FBBF24] tracking-widest uppercase mb-6">
                            Layanan Publik
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                            Kartu Kuning <br className="hidden md:block" />
                            <span className="text-[#FBBF24]">(AK-1)</span>
                        </h1>
                        <p className="text-base md:text-xl text-white/80 max-w-2xl leading-relaxed mb-8">
                            Kartu Tanda Pencari Kerja (AK-1) adalah dokumen resmi yang wajib dimiliki pencari kerja sebagai syarat melamar pekerjaan di wilayah Kabupaten Serang.
                        </p>
                        <a
                            href="https://karirhub.kemnaker.go.id"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#FBBF24] text-[#0A192F] px-8 py-4 rounded-xl font-bold hover:bg-[#FCD34D] transition-all shadow-lg shadow-yellow-500/20"
                        >
                            Daftar AK-1 Online <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>

            {/* Apa itu AK-1 */}
            <section className="py-20 bg-[#F8FAFC] dark:bg-[#0B1120]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Apa itu Kartu AK-1?</h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                                <p>
                                    Kartu Kuning atau <strong>Kartu Tanda Pencari Kerja (AK-1)</strong> adalah kartu identitas resmi yang diterbitkan oleh Dinas Tenaga Kerja dan Transmigrasi bagi warga yang sedang mencari pekerjaan.
                                </p>
                                <p>
                                    Kartu ini berlaku sebagai bukti bahwa pemegangnya terdaftar sebagai pencari kerja aktif di wilayah Kabupaten Serang dan dapat digunakan sebagai syarat administrasi dalam melamar pekerjaan di instansi pemerintah maupun swasta.
                                </p>
                                <p>
                                    Kartu AK-1 berlaku selama <strong>2 (dua) tahun</strong> sejak tanggal diterbitkan dan dapat diperpanjang.
                                </p>
                            </div>

                            {/* Info boxes */}
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <Clock className="w-5 h-5 text-[#1E3A8A] mb-2" />
                                    <p className="font-bold text-gray-900 text-sm">Masa Berlaku</p>
                                    <p className="text-xs text-gray-500 mt-1">2 Tahun (dapat diperpanjang)</p>
                                </div>
                                <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <Building2 className="w-5 h-5 text-[#1E3A8A] mb-2" />
                                    <p className="font-bold text-gray-900 text-sm">Lokasi Pengurusan</p>
                                    <p className="text-xs text-gray-500 mt-1">Kantor Disnakertrans Kab. Serang</p>
                                </div>
                            </div>
                        </div>

                        {/* Persyaratan */}
                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                                    <ClipboardList className="w-5 h-5 text-[#1E3A8A]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Persyaratan</h3>
                            </div>
                            <ul className="space-y-4">
                                {persyaratan.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Alur Pendaftaran */}
            <section className="py-20 bg-white dark:bg-[#111827]">
                <div className="container mx-auto px-4 xl:px-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Alur Pendaftaran</h2>
                        <p className="text-gray-600 dark:text-gray-400">Proses pengurusan Kartu AK-1 yang mudah dan cepat</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {alurPendaftaran.map((item) => (
                            <div key={item.step} className="relative bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center group hover:-translate-y-1 transition-all">
                                <div className="w-12 h-12 bg-[#1E3A8A] text-white rounded-xl flex items-center justify-center text-lg font-extrabold mx-auto mb-4 group-hover:bg-[#FBBF24] group-hover:text-[#0A192F] transition-colors">
                                    {item.step}
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-[#1E3A8A]">
                <div className="container mx-auto px-4 xl:px-12 text-center">
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">Siap Mendaftar?</h2>
                    <p className="text-white/70 mb-8 max-w-xl mx-auto">
                        Daftar AK-1 secara online melalui portal KarirHub Kemnaker atau kunjungi langsung kantor Disnakertrans Kab. Serang.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="https://karirhub.kemnaker.go.id"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-[#FBBF24] text-[#0A192F] px-8 py-4 rounded-xl font-bold hover:bg-[#FCD34D] transition-all shadow-lg"
                        >
                            Daftar AK-1 Online <ExternalLink className="w-4 h-4" />
                        </a>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
