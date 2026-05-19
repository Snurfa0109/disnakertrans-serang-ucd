"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Mail, Shield, Clock, ChevronDown, ChevronUp, Paperclip, X, FileImage, FileVideo, FileText } from 'lucide-react';

function generateCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { question: `${a} + ${b} = ?`, answer: a + b };
}

function PengaduanForm() {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');

    const [formData, setFormData] = useState({
        name: '', email: '', subject: '', message: '',
        type: 'umum' as 'umum' | 'hubungan_industrial',
    });
    const [attachments, setAttachments] = useState<{ name: string; type: string; data: string }[]>([]);
    const [captcha, setCaptcha] = useState({ question: '? + ? = ?', answer: 0 });
    const [captchaInput, setCaptchaInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [ticketId, setTicketId] = useState<string>('');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    // Generate captcha only on client to avoid hydration mismatch
    useEffect(() => {
        setCaptcha(generateCaptcha());
    }, []);

    useEffect(() => {
        if (typeParam === 'hubungan_industrial') {
            setFormData(prev => ({ ...prev, type: 'hubungan_industrial' }));
        }
    }, [typeParam]);

    const faqs = [
        { q: "Apakah identitas saya akan dirahasiakan?", a: "Ya, kami menjamin kerahasiaan identitas pelapor. Anda juga dapat memilih opsi 'Anonim' jika diperlukan, namun kami menyarankan menyertakan data valid untuk kemudahan koordinasi." },
        { q: "Berapa lama laporan saya akan diproses?", a: "Laporan yang masuk akan diverifikasi dalam waktu maksimal 3x24 jam hari kerja. Tindak lanjut setelah verifikasi tergantung pada kompleksitas masalah yang dilaporkan." },
        { q: "Jenis pengaduan apa saja yang dilayani?", a: "Kami melayani pengaduan umum terkait layanan publik, serta pengaduan khusus hubungan industrial seperti pelanggaran hak pekerja, sengketa ketenagakerjaan, K3, dan masalah pengupahan." },
        { q: "Bagaimana cara memantau status laporan?", a: "Anda akan menerima email konfirmasi beserta nomor tiket saat laporan berhasil dikirim. Anda dapat membalas email tersebut untuk menanyakan progres tindak lanjut dari laporan Anda." },
        { q: "Apakah bisa melampirkan bukti foto atau dokumen?", a: "Ya, Anda dapat melampirkan foto, video, dan dokumen sebagai bukti pendukung laporan pengaduan. Format yang didukung antara lain JPG, PNG, PDF, MP4, dan lainnya." }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(file => {
            if (file.size > 5 * 1024 * 1024) { setErrorMsg('Ukuran file maksimal 5MB per file'); return; }
            if (attachments.length >= 5) { setErrorMsg('Maksimal 5 lampiran'); return; }
            const reader = new FileReader();
            reader.onload = () => {
                setAttachments(prev => [...prev, { name: file.name, type: file.type, data: reader.result as string }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const removeAttachment = (idx: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== idx));
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <FileImage className="w-4 h-4 text-blue-500" />;
        if (type.startsWith('video/')) return <FileVideo className="w-4 h-4 text-purple-500" />;
        return <FileText className="w-4 h-4 text-gray-500" />;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        if (parseInt(captchaInput) !== captcha.answer) {
            setErrorMsg('Jawaban captcha salah. Silakan coba lagi.');
            setCaptcha(generateCaptcha());
            setCaptchaInput('');
            return;
        }
        setStatus('loading');
        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name, email: formData.email, subject: formData.subject,
                    message: formData.message, type: formData.type,
                    attachments: attachments.map(a => ({ name: a.name, type: a.type, data: a.data })),
                }),
            });
            if (!res.ok) throw new Error('Failed to submit');
            const data = await res.json();
            setTicketId(data.data?.ticketNumber || `#PKD-${String(data.data?.id).padStart(5, '0')}`);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '', type: 'umum' });
            setAttachments([]);
            setCaptchaInput('');
            setCaptcha(generateCaptcha());
        } catch {
            setStatus('error');
            setErrorMsg('Gagal mengirim pengaduan. Silakan coba lagi nanti.');
        }
    };

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Hero Section */}
            <section className="bg-[#0A192F] pt-32 pb-48 lg:pt-40 lg:pb-56 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 right-20 w-72 h-72 bg-[#FBBF24] rounded-full blur-[120px]" />
                    <div className="absolute bottom-10 left-10 w-56 h-56 bg-blue-500 rounded-full blur-[100px]" />
                </div>
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center rounded-full bg-[#FBBF24] px-4 py-1.5 text-xs font-extrabold text-[#0A192F] tracking-widest uppercase mb-8 shadow-sm">
                            {formData.type === 'hubungan_industrial' ? 'Pengaduan Hubungan Industrial' : 'Layanan Aspirasi'}
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                            Sampaikan Pengaduan <br/> Anda dengan Aman
                        </h1>
                        <p className="text-white/80 max-w-xl text-sm md:text-base leading-relaxed mb-10">
                            Kami berkomitmen untuk memberikan pelayanan publik yang transparan dan akuntabel.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            {[
                                { icon: Mail, title: "Kirim via Email", desc: "Pengaduan langsung dikirim ke email resmi Disnakertrans." },
                                { icon: Shield, title: "Data Terlindungi", desc: "Identitas dan data Anda dijamin kerahasiaannya." },
                                { icon: Clock, title: "Respon 3×24 Jam", desc: "Balasan resmi dikirim ke email Anda dalam 3 hari kerja." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5">
                                    <div className="w-10 h-10 bg-[#FBBF24]/20 rounded-lg flex items-center justify-center mb-3">
                                        <item.icon className="w-5 h-5 text-[#FBBF24]" />
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                                    <p className="text-white/60 text-[11px] leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Formulir Section */}
            <section className="relative z-20 container mx-auto px-4 xl:px-12 -mt-32 max-w-4xl pb-24">
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 lg:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Formulir Pengaduan Online</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Pengaduan Anda akan dikirim langsung ke email resmi Disnakertrans Kab. Serang</p>
                    </div>

                    {status === 'success' ? (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
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
                                Pengaduan Anda telah dikirim dan akan diproses dalam waktu <strong>3×24 jam</strong> hari kerja.
                            </p>
                            <button onClick={() => setStatus('idle')} className="bg-[#0A192F] hover:bg-black text-white px-8 py-3 rounded-lg font-bold transition-colors">
                                Kirim Laporan Lain
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {(status === 'error' || errorMsg) && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <p className="text-xs font-semibold">{errorMsg || 'Gagal mengirim pengaduan.'}</p>
                                </div>
                            )}

                            {/* Jenis Pengaduan */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Jenis Pengaduan <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'umum' as const, label: 'Pengaduan Umum', desc: 'Layanan publik, administrasi, dll' },
                                        { value: 'hubungan_industrial' as const, label: 'Hubungan Industrial', desc: 'Hak pekerja, sengketa, K3, upah' },
                                    ].map(opt => (
                                        <button key={opt.value} type="button" onClick={() => setFormData({ ...formData, type: opt.value })}
                                            className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${formData.type === opt.value ? 'border-[#1E3A8A] bg-[#EFF6FF] dark:bg-[#1E3A8A]/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}>
                                            <p className={`text-xs sm:text-sm font-bold ${formData.type === opt.value ? 'text-[#1E3A8A] dark:text-[#93C5FD]' : 'text-gray-900 dark:text-white'}`}>{opt.label}</p>
                                            <p className="text-[10px] text-gray-500 mt-1 hidden sm:block">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Nama Lengkap <span className="text-red-400">*</span></label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#E2E8F0]/30 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 focus:border-[#0A192F]/30 transition-all text-sm dark:text-white" placeholder="Masukkan nama sesuai KTP" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-700">Alamat Email <span className="text-red-400">*</span></label>
                                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#E2E8F0]/30 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 focus:border-[#0A192F]/30 transition-all text-sm dark:text-white" placeholder="contoh@gmail.com" />
                                    <p className="text-[10px] text-gray-400">Balasan pengaduan akan dikirim ke email ini</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700">Subjek Pengaduan <span className="text-red-400">*</span></label>
                                <input type="text" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-[#E2E8F0]/30 border border-gray-200 rounded-lg px-4 py-3 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 focus:border-[#0A192F]/30 transition-all text-sm" placeholder="Judul singkat laporan Anda" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700">Isi Laporan <span className="text-red-400">*</span></label>
                                <textarea required rows={6} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-[#E2E8F0]/30 border border-gray-200 rounded-lg px-4 py-3 sm:py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 focus:border-[#0A192F]/30 transition-all text-sm resize-none" placeholder="Ceritakan detail kejadian atau keluhan Anda secara lengkap..." />
                            </div>

                            {/* Lampiran */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700">Lampiran Bukti <span className="text-gray-400 font-normal">(opsional, maks 5 file, 5MB/file)</span></label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 sm:p-6 hover:border-[#1E3A8A]/30 transition-colors bg-gray-50/50">
                                    <label className="cursor-pointer flex flex-col items-center gap-2">
                                        <Paperclip className="w-6 h-6 text-gray-400" />
                                        <span className="text-xs text-gray-500 font-medium text-center">Klik untuk upload foto, video, atau dokumen</span>
                                        <span className="text-[10px] text-gray-400">JPG, PNG, PDF, MP4, DOC — maks 5MB per file</span>
                                        <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                </div>
                                {attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {attachments.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-xs">
                                                {getFileIcon(file.type)}
                                                <span className="truncate max-w-[120px] sm:max-w-[180px] font-medium text-gray-700">{file.name}</span>
                                                <button type="button" onClick={() => removeAttachment(idx)} className="text-gray-400 hover:text-red-500">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Captcha */}
                            <div className="space-y-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <label className="text-[11px] font-bold text-gray-700 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-[#1E3A8A]" /> Verifikasi Keamanan <span className="text-red-400">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#0A192F] text-[#FBBF24] font-bold px-5 py-2.5 rounded-lg text-lg tracking-wider select-none">
                                        {captcha.question}
                                    </div>
                                    <input type="number" required value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
                                        className="w-24 bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 focus:border-[#0A192F]/30 transition-all text-sm text-center font-bold"
                                        placeholder="?" />
                                    <button type="button" onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(''); }}
                                        className="text-xs text-gray-400 hover:text-[#1E3A8A] font-medium">Ganti soal</button>
                                </div>
                            </div>

                            <button type="submit" disabled={status === 'loading'}
                                className="w-full bg-[#0A192F] text-white px-8 py-4 rounded-lg font-bold hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group">
                                {status === 'loading' ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Mengirim Pengaduan...
                                    </span>
                                ) : (
                                    <><Send className="w-4 h-4" /> Kirim Pengaduan</>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* FAQ Section - Fully Responsive */}
            <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-[#111827] border-t border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4 xl:px-12 max-w-6xl">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                        {/* FAQ Header */}
                        <div className="w-full lg:w-5/12 lg:sticky lg:top-24">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A192F] dark:text-white mb-4 leading-tight">
                                Pertanyaan yang Sering Diajukan
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 lg:mb-8">
                                Punya pertanyaan seputar proses pengaduan? Temukan jawabannya di sini.
                            </p>
                            <div className="bg-[#0A192F] rounded-xl p-5 sm:p-6 text-white">
                                <h3 className="font-bold text-sm mb-2">📧 Kontak Langsung</h3>
                                <p className="text-white/70 text-xs leading-relaxed mb-3">Anda juga bisa mengirim pengaduan langsung melalui email.</p>
                                <a href="mailto:disnakertrans@serangkab.go.id" className="text-[#FBBF24] font-bold text-xs hover:underline break-all">
                                    disnakertrans@serangkab.go.id
                                </a>
                            </div>
                        </div>

                        {/* Accordion */}
                        <div className="w-full lg:w-7/12 flex flex-col gap-3">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                    <button
                                        className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-start sm:items-center justify-between text-left focus:outline-none bg-white gap-3"
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    >
                                        <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white flex-1">{faq.q}</span>
                                        {openFaq === idx ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-0.5 sm:mt-0" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-0.5 sm:mt-0" />
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
                                                <div className="px-4 sm:px-6 py-4 sm:py-5">
                                                    <p className="text-xs text-gray-600 leading-relaxed">{faq.a}</p>
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

export default function PengaduanPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" />
            </div>
        }>
            <PengaduanForm />
        </Suspense>
    );
}
