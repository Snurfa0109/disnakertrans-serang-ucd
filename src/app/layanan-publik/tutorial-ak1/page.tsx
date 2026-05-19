import Link from "next/link";
import { ArrowLeft, Smartphone, Download, ExternalLink, CheckCircle2, FileText, Clock } from "lucide-react";

export const metadata = {
    title: "Tutorial Kartu AK-1 Online | Disnakertrans Serang"
};

export default function TutorialAK1Page() {
    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Hero */}
            <section className="bg-[#0A192F] pt-32 pb-24 lg:pt-40 lg:pb-32 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-[#FBBF24] rounded-full blur-[120px]" />
                    <div className="absolute bottom-10 left-10 w-56 h-56 bg-blue-500 rounded-full blur-[100px]" />
                </div>
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <Link href="/layanan-publik" className="inline-flex items-center text-white/60 hover:text-white font-medium text-sm mb-6 gap-1.5 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Layanan Publik
                        </Link>
                        <div className="inline-flex items-center rounded-full border border-[#FBBF24] px-4 py-1.5 text-xs font-bold text-[#FBBF24] tracking-widest uppercase mb-6 ml-4">
                            Panduan Lengkap
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                            Cara Buat Kartu <span className="text-[#FBBF24]">AK-1</span> Secara Online
                        </h1>
                        <p className="text-white/80 max-w-xl text-sm md:text-base leading-relaxed">
                            Cukup instal aplikasi <strong>Serang Bahagia</strong> atau kunjungi website untuk membuat Kartu AK-1 tanpa perlu datang ke kantor.
                        </p>
                    </div>
                </div>
            </section>

            {/* Requirements */}
            <section className="py-16 bg-white dark:bg-[#111827] border-b border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 xl:px-12 max-w-4xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Persyaratan Utama</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { text: "KTP Kabupaten Serang", desc: "KTP elektronik yang masih berlaku" },
                            { text: "Ijazah Pendidikan Terakhir", desc: "Scan/foto ijazah yang jelas" },
                            { text: "Pas Foto Terbaru", desc: "Latar belakang biru, 3x4 atau 4x6" },
                            { text: "Email Aktif", desc: "Untuk menerima notifikasi dan kartu digital" },
                        ].map((req, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-[#0F172A] rounded-xl p-5 border border-gray-100 dark:border-gray-700 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{req.text}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{req.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tutorial Steps */}
            <section className="py-20 bg-[#F8FAFC] dark:bg-[#0B1120]">
                <div className="container mx-auto px-4 xl:px-12 max-w-4xl">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-12">Langkah-Langkah Pembuatan</h2>
                    <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="flex gap-6 items-start group">
                            <div className="w-12 h-12 bg-[#0A192F] text-[#FBBF24] rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md group-hover:scale-110 transition-transform">1</div>
                            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex-1 group-hover:shadow-md transition-shadow shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Buat Akun atau Registrasi</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                    Kunjungi <a href="https://bahagia.serangkab.go.id/home" target="_blank" rel="noopener noreferrer" className="text-[#0A192F] font-bold hover:underline">bahagia.serangkab.go.id</a> atau download aplikasi <strong>Serang Bahagia</strong> di Google Play Store. Buat akun dengan memasukkan email yang aktif dan daftar.
                                </p>
                                <div className="flex items-center gap-3">
                                    <a href="https://bahagia.serangkab.go.id/home" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#0A192F] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition-colors">
                                        <Smartphone className="w-3.5 h-3.5" /> Buka Website
                                    </a>
                                    <span className="text-xs text-gray-400">atau download di Play Store</span>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-6 items-start group">
                            <div className="w-12 h-12 bg-[#0A192F] text-[#FBBF24] rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md group-hover:scale-110 transition-transform">2</div>
                            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex-1 group-hover:shadow-md transition-shadow shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Pilih Menu Kartu AK.1</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Setelah login, pilih menu <strong>&quot;Kartu AK.1&quot;</strong> pada bagian layanan tenaga kerja. Menu ini tersedia di halaman utama aplikasi.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-6 items-start group">
                            <div className="w-12 h-12 bg-[#0A192F] text-[#FBBF24] rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md group-hover:scale-110 transition-transform">3</div>
                            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex-1 group-hover:shadow-md transition-shadow shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Isi dan Unggah Data dengan Lengkap</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Lengkapi formulir dengan data diri sesuai KTP, unggah dokumen persyaratan (KTP, ijazah terakhir, pas foto), kemudian klik <strong>Kirim</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex gap-6 items-start group">
                            <div className="w-12 h-12 bg-[#0A192F] text-[#FBBF24] rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md group-hover:scale-110 transition-transform">4</div>
                            <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex-1 group-hover:shadow-md transition-shadow shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Verifikasi oleh Petugas</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Petugas Dinas Tenaga Kerja akan memverifikasi data dan dokumen Anda. Kartu AK-1 akan ditandatangani secara <strong>elektronik</strong> oleh petugas.
                                </p>
                            </div>
                        </div>

                        {/* Step 5 */}
                        <div className="flex gap-6 items-start group">
                            <div className="w-12 h-12 bg-[#FBBF24] text-[#0A192F] rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0 shadow-md group-hover:scale-110 transition-transform">5</div>
                            <div className="bg-[#FFFBEB] rounded-xl p-6 border border-amber-100 flex-1 group-hover:shadow-md transition-shadow shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Kartu AK-1 Selesai! 🎉</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Penerbitan Kartu AK-1 akan dikirim melalui <strong>notifikasi akun Serang Bahagia</strong>. Anda dapat mengunduh file PDF kartu AK-1 <strong>kapan dan dimana saja</strong>.
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <Download className="w-4 h-4 text-amber-600" />
                                    <span className="text-xs text-amber-700 font-bold">Format: PDF (dapat diunduh langsung)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Estimasi Waktu */}
            <section className="py-16 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 xl:px-12 max-w-4xl">
                    <div className="bg-gray-50 dark:bg-[#0F172A] rounded-2xl p-8 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-14 h-14 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                            <Clock className="w-7 h-7 text-[#1E3A8A]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Estimasi Waktu Proses</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                Pengisian formulir online membutuhkan waktu <strong>5-10 menit</strong>. Verifikasi oleh petugas membutuhkan waktu <strong>1-3 hari kerja</strong>. Setelah diverifikasi, kartu AK-1 digital langsung dapat diunduh.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-[#F8FAFC] dark:bg-[#0B1120]">
                <div className="container mx-auto px-4 xl:px-12 max-w-4xl">
                    <div className="bg-[#0A192F] rounded-2xl p-8 lg:p-10 text-center">
                        <h3 className="text-white font-bold text-xl mb-3">Siap Membuat Kartu AK-1?</h3>
                        <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
                            Proses pembuatan kartu AK-1 online hanya membutuhkan waktu beberapa menit. Mulai sekarang!
                        </p>
                        <a
                            href="https://bahagia.serangkab.go.id/home"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#78350F] font-bold px-8 py-3.5 rounded-lg transition-colors text-sm shadow-lg"
                        >
                            Buka Serang Bahagia <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
