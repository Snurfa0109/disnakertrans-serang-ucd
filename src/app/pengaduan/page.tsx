"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, UploadCloud, Mail, Shield, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function PengaduanPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [ticketId, setTicketId] = useState<string>('');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqs = [
        {
            q: "Apakah identitas saya akan dirahasiakan?",
            a: "Ya, kami menjamin kerahasiaan identitas pelapor. Anda juga dapat memilih opsi 'Anonim' jika diperlukan, namun kami menyarankan menyertakan data valid untuk kemudahan koordinasi."
        },
        {
            q: "Berapa lama laporan saya akan diproses?",
            a: "Laporan yang masuk akan diverifikasi dalam waktu maksimal 3x24 jam hari kerja. Tindak lanjut setelah verifikasi tergantung pada kompleksitas masalah yang dilaporkan."
        },
        {
            q: "Jenis pengaduan apa saja yang dilayani?",
            a: "Kami melayani pengaduan terkait pelanggaran hak pekerja, masalah hubungan industrial, sengketa ketenagakerjaan, K3 (Keselamatan dan Kesehatan Kerja), serta keluhan atas layanan publik kami."
        },
        {
            q: "Bagaimana cara memantau status laporan?",
            a: "Anda akan menerima email konfirmasi beserta nomor tiket saat laporan berhasil dikirim. Anda dapat membalas email tersebut untuk menanyakan progres tindak lanjut dari laporan Anda."
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/pengaduan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                }),
            });

            if (!res.ok) throw new Error('Failed to submit');

            const data = await res.json();
            setTicketId(`#PKD-${String(data.id).padStart(5, '0')}`);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC]">
            
            {/* Hero Section */}
            <section className="bg-[#0A192F] pt-32 pb-48 lg:pt-40 lg:pb-56 text-white relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-[#FBBF24] rounded-full blur-[120px]" />
                    <div className="absolute bottom-10 left-10 w-56 h-56 bg-blue-500 rounded-full blur-[100px]" />
                </div>
                
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        
                        <div className="inline-flex items-center rounded-full bg-[#FBBF24] px-4 py-1.5 text-xs font-extrabold text-[#0A192F] tracking-widest uppercase mb-8 shadow-sm">
                            Layanan Aspirasi
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                            Sampaikan Pengaduan <br/> 
                            Anda dengan Aman
                        </h1>
                        <p className="text-white/80 max-w-xl text-sm md:text-base leading-relaxed mb-10">
                            Kami berkomitmen untuk memberikan pelayanan publik yang transparan dan akuntabel. Setiap laporan Anda adalah langkah menuju Serang yang lebih baik.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                                <div className="w-10 h-10 bg-[#FBBF24]/20 rounded-lg flex items-center justify-center mb-3">
                                    <Mail className="w-5 h-5 text-[#FBBF24]" />
                                </div>
                                <h4 className="font-bold text-white text-sm mb-1">Kirim via Email</h4>
                                <p className="text-white/60 text-[11px] leading-relaxed">Pengaduan langsung dikirim ke email resmi Disnakertrans.</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                                <div className="w-10 h-10 bg-[#FBBF24]/20 rounded-lg flex items-center justify-center mb-3">
                                    <Shield className="w-5 h-5 text-[#FBBF24]" />
                                </div>
                                <h4 className="font-bold text-white text-sm mb-1">Data Terlindungi</h4>
                                <p className="text-white/60 text-[11px] leading-relaxed">Identitas dan data Anda dijamin kerahasiaannya.</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                                <div className="w-10 h-10 bg-[#FBBF24]/20 rounded-lg flex items-center justify-center mb-3">
                                    <Clock className="w-5 h-5 text-[#FBBF24]" />
                                </div>
                                <h4 className="font-bold text-white text-sm mb-1">Respon 3×24 Jam</h4>
                                <p className="text-white/60 text-[11px] leading-relaxed">Balasan resmi dikirim ke email Anda dalam 3 hari kerja.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Formulir Section (Overlap) */}
            <section className="relative z-20 container mx-auto px-4 xl:px-12 -mt-32 max-w-4xl pb-24">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Formulir Pengaduan Online</h2>
                        <p className="text-gray-500 text-sm">Pengaduan Anda akan dikirim langsung ke email resmi Disnakertrans Kab. Serang</p>
                    </div>

                    {status === 'success' ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-100">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Pengaduan Berhasil Dikirim!</h3>
                            {ticketId && (
                                <div className="inline-flex items-center bg-gray-100 rounded-full px-5 py-2 mb-4">
                                    <span className="text-sm text-gray-500 mr-2">Nomor Tiket:</span>
                                    <span className="font-bold text-[#0A192F]">{ticketId}</span>
                                </div>
                            )}
                            <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm leading-relaxed">
                                Pengaduan Anda telah dikirim ke email resmi <strong>disnakertrans@serangkab.go.id</strong> dan akan diproses dalam waktu <strong>3×24 jam</strong> hari kerja.
                            </p>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 max-w-md mx-auto mb-8">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                    <p className="text-sm text-blue-800 text-left leading-relaxed">
                                        <strong>Balasan akan dikirim ke email Anda.</strong> Silakan cek kotak masuk dan folder spam secara berkala. Simpan nomor tiket untuk referensi.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setStatus('idle')}
                                className="bg-[#0A192F] hover:bg-black text-white px-8 py-3 rounded-lg font-bold transition-colors"
                            >
                                Kirim Laporan Lain
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === 'error' && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <p className="text-xs font-semibold">Gagal mengirim pengaduan. Silakan coba lagi nanti.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-700">Nama Lengkap <span className="text-red-400">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#E2E8F0]/30 border border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 focus:border-[#0A192F]/30 transition-all text-sm"
                                        placeholder="Masukkan nama sesuai KTP"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-700">Alamat Email <span className="text-red-400">*</span></label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-[#E2E8F0]/30 border border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 focus:border-[#0A192F]/30 transition-all text-sm"
                                        placeholder="contoh@gmail.com"
                                    />
                                    <p className="text-[10px] text-gray-400">Balasan pengaduan akan dikirim ke email ini</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700">Subjek Pengaduan <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-[#E2E8F0]/30 border border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 focus:border-[#0A192F]/30 transition-all text-sm"
                                    placeholder="Judul singkat laporan Anda"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700">Isi Laporan <span className="text-red-400">*</span></label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-[#E2E8F0]/30 border border-gray-200 rounded-lg px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 focus:border-[#0A192F]/30 transition-all text-sm resize-none"
                                    placeholder="Ceritakan detail kejadian atau keluhan Anda secara lengkap..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-[#0A192F] text-white px-8 py-4 rounded-lg font-bold hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {status === 'loading' ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Mengirim Pengaduan...
                                    </span>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" /> Kirim Pengaduan ke Email Disnakertrans
                                    </>
                                )}
                            </button>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                    <div className="text-[11px] text-amber-800 leading-relaxed">
                                        <strong>Informasi Penting:</strong> Pengaduan Anda akan dikirim langsung ke email resmi Disnakertrans Kab. Serang. Balasan resmi akan dikirimkan ke alamat email yang Anda masukkan di atas. Pastikan email Anda valid dan aktif.
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4 xl:px-12 max-w-6xl">
                    <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
                        
                        {/* FAQ Header */}
                        <div className="w-full md:w-5/12 sticky top-24">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0A192F] mb-4 leading-tight">
                                Pertanyaan yang Sering Diajukan
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-sm">
                                Punya pertanyaan seputar proses pengaduan? Temukan jawabannya di sini.
                            </p>

                            <div className="bg-[#0A192F] rounded-xl p-6 text-white">
                                <h3 className="font-bold text-sm mb-2">📧 Kontak Langsung</h3>
                                <p className="text-white/70 text-xs leading-relaxed mb-3">
                                    Anda juga bisa mengirim pengaduan langsung melalui email.
                                </p>
                                <a href="mailto:disnakertrans@serangkab.go.id" className="text-[#FBBF24] font-bold text-xs hover:underline">
                                    disnakertrans@serangkab.go.id
                                </a>
                            </div>
                        </div>

                        {/* Accordion */}
                        <div className="w-full md:w-7/12 flex flex-col gap-3">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-gray-300 transition-colors">
                                    <button 
                                        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none bg-white"
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    >
                                        <span className="font-bold text-sm text-gray-900">{faq.q}</span>
                                        {openFaq === idx ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                                        )}
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === idx && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden bg-gray-50 border-t border-gray-100"
                                            >
                                                <div className="px-6 py-5">
                                                    <p className="text-xs text-gray-600 leading-relaxed">
                                                        {faq.a}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
