"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, UploadCloud, ClipboardEdit, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function PengaduanPage() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', file: null as File | null });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [openFaq, setOpenFaq] = useState<number | null>(0); // first is open

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
            // Simulated API call including file upload logic
            const formDataObj = new FormData();
            formDataObj.append('name', formData.name);
            formDataObj.append('email', formData.email);
            formDataObj.append('subject', formData.subject);
            formDataObj.append('message', formData.message);
            if (formData.file) formDataObj.append('file', formData.file);

            // Mock fetch (replace with actual endpoint later)
            // const res = await fetch('/api/pengaduan', { method: 'POST', body: formDataObj });
            await new Promise(resolve => setTimeout(resolve, 1500)); // simulate network

            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '', file: null });
        } catch (err) {
            setStatus('error');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC]">
            
            {/* Hero Section */}
            <section className="bg-[#0A192F] pt-32 pb-48 lg:pt-40 lg:pb-56 text-white relative">
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        
                        {/* Text Left */}
                        <div className="w-full lg:w-1/2">
                            <div className="inline-flex items-center rounded-full bg-[#FBBF24] px-4 py-1.5 text-xs font-extrabold text-[#0A192F] tracking-widest uppercase mb-8 shadow-sm">
                                Layanan Aspirasi
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                                Sampaikan Pengaduan <br/> 
                                Anda dengan Aman
                            </h1>
                            <p className="text-white/80 max-w-lg text-sm md:text-base leading-relaxed mb-10">
                                Kami berkomitmen untuk memberikan pelayanan publik yang transparan dan akuntabel. Setiap laporan Anda adalah langkah menuju Serang yang lebih baik.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <ClipboardEdit className="w-5 h-5 text-[#FBBF24]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Tulis Laporan</h4>
                                        <p className="text-white/70 text-[11px] leading-relaxed">Laporan keluhan atau aspirasi Anda dengan data yang lengkap.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5 text-[#FBBF24]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Proses Verifikasi</h4>
                                        <p className="text-white/70 text-[11px] leading-relaxed">Laporan Anda akan diverifikasi dalam waktu maksimal 3x24 jam.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Send className="w-5 h-5 text-[#FBBF24]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Tindak Lanjut</h4>
                                        <p className="text-white/70 text-[11px] leading-relaxed">Instansi terkait akan memberikan jawaban resmi atas aduan Anda.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Right */}
                        <div className="w-full lg:w-1/2">
                            <div className="relative border-4 border-white rounded-xl shadow-2xl overflow-hidden aspect-[16/10] bg-black">
                                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" alt="Admin" className="w-full h-full object-cover opacity-90" />
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
                        <p className="text-gray-500 text-sm">Lengkapi data di bawah ini untuk memulai proses pengaduan</p>
                    </div>

                    {status === 'success' ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Pengaduan Terkirim!</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                                Terima kasih atas laporan Anda. Tim kami akan segera menindaklanjuti dan membalas melalui email yang Anda berikan.
                            </p>
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
                                    <label className="text-[11px] font-bold text-gray-700">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#E2E8F0]/30 border-none rounded-lg px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 transition-all text-sm"
                                        placeholder="Masukkan nama sesuai KTP"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-700">Alamat Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-[#E2E8F0]/30 border-none rounded-lg px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 transition-all text-sm"
                                        placeholder="contoh@gmail.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700">Subjek Pengaduan</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-[#E2E8F0]/30 border-none rounded-lg px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 transition-all text-sm"
                                    placeholder="Judul singkat laporan Anda"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700">Isi Laporan</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-[#E2E8F0]/30 border-none rounded-lg px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 transition-all text-sm resize-none"
                                    placeholder="Ceritakan detail kejadian atau keluhan Anda secara lengkap..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700">Lampiran Pendukung (Foto/PDF)</label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors text-center group cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:text-[#0A192F] mb-3 transition-colors">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-semibold mb-1">Klik atau seret file ke sini untuk mengunggah</p>
                                        <p className="text-[10px] text-gray-400">MAKSIMAL 5MB (JPG, PNG, PDF)</p>
                                        
                                        {formData.file && (
                                            <p className="mt-4 text-[#B45309] font-bold text-xs bg-amber-50 px-3 py-1 rounded">
                                                File terpilih: {formData.file.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-[#0A192F] text-white px-8 py-4 rounded-lg font-bold hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {status === 'loading' ? 'Mengirim...' : (
                                    <>
                                        <Send className="w-4 h-4" /> Kirim Pengaduan Sekarang
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-gray-400 italic mt-4">
                                * Dengan mengirimkan formulir ini, Anda menyetujui syarat dan ketentuan yang berlaku.
                            </p>
                        </form>
                    )}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container mx-auto px-4 xl:px-12 max-w-6xl">
                    <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
                        
                        {/* FAQ Header & Bantuan */}
                        <div className="w-full md:w-5/12 sticky top-24">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0A192F] mb-4 leading-tight">
                                Pertanyaan yang Sering Diajukan
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-sm">
                                Punya pertanyaan seputar proses pengaduan? Temukan jawabannya di sini atau hubungi kami langsung.
                            </p>

                            <div className="bg-[#FEF3C7] rounded-xl p-8 border border-amber-200 shadow-sm">
                                <h3 className="font-extrabold text-gray-900 mb-2">Butuh bantuan cepat?</h3>
                                <p className="text-xs text-gray-700 leading-relaxed mb-4">
                                    Tim kami siap membantu Anda melalui kanal media sosial resmi.
                                </p>
                                <Link href="#" className="text-[#92400E] font-bold text-xs flex items-center gap-1 hover:underline">
                                    Lihat Kontak Kami <ArrowRight className="w-3 h-3" />
                                </Link>
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

