"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Mail, Shield, Clock, ChevronDown, ChevronUp, Paperclip, X, FileImage, FileVideo, FileText } from 'lucide-react';
import VisualCaptcha from '@/components/VisualCaptcha';

const PENGADUAN_TYPES = [
  { group: 'Layanan Ketenagakerjaan', items: [
    { value: 'kartu_kuning_ak1',   label: 'Kartu Kuning (AK-1) & Pencari Kerja' },
    { value: 'penempatan_kerja',   label: 'Penempatan & Info Lowongan Kerja' },
    { value: 'pelatihan_kerja',    label: 'Pelatihan & Peningkatan Kompetensi' },
    { value: 'bpjs',               label: 'BPJS Ketenagakerjaan' },
  ]},
  { group: 'Hubungan Industrial', items: [
    { value: 'hubungan_industrial', label: 'Hubungan Industrial & Sengketa Kerja' },
    { value: 'pengupahan_umk',      label: 'Pengupahan & UMK (Upah Minimum)' },
    { value: 'phk',                 label: 'Pemutusan Hubungan Kerja (PHK)' },
    { value: 'k3',                  label: 'K3 – Keselamatan & Kesehatan Kerja' },
  ]},
  { group: 'Pengawasan Ketenagakerjaan', items: [
    { value: 'pengawasan',          label: 'Pengawasan Ketenagakerjaan' },
    { value: 'pelanggaran_norma',   label: 'Pelanggaran Norma Kerja' },
  ]},
  { group: 'Transmigrasi', items: [
    { value: 'transmigrasi',        label: 'Program Transmigrasi' },
    { value: 'bantuan_transmigrasi', label: 'Bantuan & Fasilitas Transmigrasi' },
  ]},
  { group: 'Umum & Lainnya', items: [
    { value: 'layanan_administrasi', label: 'Layanan Administrasi & Birokrasi' },
    { value: 'saran_masukan',        label: 'Saran & Masukan' },
    { value: 'umum',                 label: 'Lainnya / Tidak Termasuk di Atas' },
  ]},
];

function PengaduanForm() {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get('type');

    const [formData, setFormData] = useState({
        name: '', email: '', subject: '', message: '',
        type: '' as string,
    });
    const [attachments, setAttachments] = useState<{ name: string; type: string; data: string }[]>([]);
    const [captchaInput, setCaptchaInput] = useState<string>('');
    const [captchaToken, setCaptchaToken] = useState<string>('');
    const [resetCaptchaSignal, setResetCaptchaSignal] = useState<number>(0);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [ticketId, setTicketId] = useState<string>('');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const handleCaptchaVerify = useCallback((val: string, token: string) => {
        setCaptchaInput(val);
        setCaptchaToken(token);
    }, []);

    useEffect(() => {
        if (typeParam) {
            // Accept any valid type from URL param
            const allTypes = PENGADUAN_TYPES.flatMap(g => g.items.map(i => i.value));
            if (allTypes.includes(typeParam)) {
                setFormData(prev => ({ ...prev, type: typeParam }));
            }
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

        if (!captchaInput.trim() || !captchaToken) {
            setErrorMsg('Silakan masukkan 6 kode keamanan CAPTCHA.');
            return;
        }

        setStatus('loading');
        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    type: formData.type,
                    attachments: attachments.map(a => ({ name: a.name, type: a.type, data: a.data })),
                    captchaInput: captchaInput.trim(),
                    captchaToken,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Gagal mengirim pengaduan');
            }

            setTicketId(data.data?.ticketNumber || `#PKD-${String(data.data?.id).padStart(5, '0')}`);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '', type: 'umum' });
            setAttachments([]);
            setCaptchaInput('');
            setResetCaptchaSignal(prev => prev + 1);
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message || 'Gagal mengirim pengaduan. Silakan coba lagi nanti.');
            setResetCaptchaSignal(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen pb-0 w-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120]">
            {/* Hero Section */}
            <section className="relative pt-32 pb-48 lg:pt-40 lg:pb-56 bg-[#0A192F] overflow-hidden text-white">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/banner-pengaduan.jpg"
                        alt="Gerbang Pelindung dan Integritas Pengaduan"
                        className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/85 to-transparent"></div>
                    <div className="absolute top-20 right-20 w-72 h-72 bg-[#FBBF24] rounded-full blur-[140px] opacity-15" />
                    <div className="absolute bottom-10 left-10 w-56 h-56 bg-blue-500 rounded-full blur-[120px] opacity-15" />
                </div>
                <div className="container mx-auto px-4 xl:px-12 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center rounded-full bg-[#FBBF24] px-4 py-1.5 text-xs font-extrabold text-[#0A192F] tracking-widest uppercase mb-8 shadow-sm">
                            {PENGADUAN_TYPES.flatMap(g => g.items).find(i => i.value === formData.type)?.label || 'Layanan Pengaduan & Aspirasi'}
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
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="py-6"
                        >
                            {/* Success icon with ring animation */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center ring-8 ring-green-100">
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </div>
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1] }}
                                        transition={{ repeat: 2, duration: 0.5 }}
                                        className="absolute inset-0 rounded-full border-2 border-green-400 opacity-50"
                                    />
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Pengaduan Berhasil Dikirim! 🎉</h3>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                    Terima kasih. Pengaduan Anda telah kami terima dan akan diproses dalam <strong>3×24 jam kerja</strong>.
                                </p>
                            </div>

                            {/* Ticket number - PROMINENT */}
                            {ticketId && (
                                <div className="bg-[#0A192F] rounded-2xl p-6 mb-6 max-w-md mx-auto text-center">
                                    <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-2">Nomor Tiket Pengaduan Anda</p>
                                    <p className="text-3xl font-extrabold text-[#FBBF24] tracking-wider mb-3 font-mono">{ticketId}</p>
                                    <p className="text-white/60 text-xs mb-4">Simpan nomor ini sebagai referensi untuk menanyakan status pengaduan</p>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(ticketId)}
                                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                                    >
                                        📋 Salin Nomor Tiket
                                    </button>
                                </div>
                            )}

                            {/* Steps info */}
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-6 max-w-md mx-auto">
                                <p className="text-amber-800 font-bold text-sm mb-3">📧 Apa yang terjadi selanjutnya?</p>
                                <ol className="space-y-2">
                                    {[
                                        'Email konfirmasi dikirim ke alamat email Anda',
                                        'Tim kami memverifikasi laporan dalam 1×24 jam',
                                        'Balasan resmi dikirim dalam maksimal 3×24 jam kerja',
                                    ].map((step, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                                            <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">{i + 1}</span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                                <button
                                    onClick={() => { setStatus('idle'); setTicketId(''); }}
                                    className="flex-1 bg-[#0A192F] hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-colors text-sm"
                                >
                                    Kirim Laporan Lain
                                </button>
                                <a href="/" className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors text-sm text-center">
                                    Kembali ke Beranda
                                </a>
                            </div>
                        </motion.div>

                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {(status === 'error' || errorMsg) && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <p className="text-xs font-semibold">{errorMsg || 'Gagal mengirim pengaduan.'}</p>
                                </div>
                            )}

                            {/* Jenis Pengaduan - Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                    Jenis Pengaduan <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className={`w-full bg-[#E2E8F0]/30 dark:bg-[#0F172A] border rounded-lg px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0A192F]/20 focus:border-[#0A192F]/30 transition-all text-sm dark:text-white appearance-none pr-10 ${
                                            formData.type ? 'border-gray-200 dark:border-gray-600 text-gray-900' : 'border-gray-200 dark:border-gray-600 text-gray-400'
                                        }`}
                                    >
                                        <option value="" disabled>-- Pilih kategori pengaduan --</option>
                                        {PENGADUAN_TYPES.map(group => (
                                            <optgroup key={group.group} label={`── ${group.group}`}>
                                                {group.items.map(item => (
                                                    <option key={item.value} value={item.value}>{item.label}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                {formData.type && (
                                    <p className="text-[10px] text-[#1E3A8A] dark:text-[#93C5FD] font-medium flex items-center gap-1">
                                        ✓ Kategori dipilih: <span className="font-bold">{PENGADUAN_TYPES.flatMap(g => g.items).find(i => i.value === formData.type)?.label}</span>
                                    </p>
                                )}
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

                            {/* Visual Security CAPTCHA */}
                            <div className="space-y-2.5 bg-gray-50 dark:bg-[#0B1120] rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-[#1E3A8A] dark:text-[#93C5FD]" />
                                    Verifikasi Kode Keamanan <span className="text-red-500">*</span>
                                </label>
                                <VisualCaptcha
                                    onVerify={handleCaptchaVerify}
                                    resetSignal={resetCaptchaSignal}
                                />
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
