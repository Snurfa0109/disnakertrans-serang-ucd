"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User } from "lucide-react";

type Message = {
    id: number;
    role: "bot" | "user";
    text: string;
};

const initialMessages: Message[] = [
    {
        id: 1,
        role: "bot",
        text: "Selamat datang di Layanan Informasi Terpadu Disnakertrans Kabupaten Serang! 👋\n\nSaya Kang SATRIA (Serang Assistant for Training, Recruitment, & Information Access), asisten virtual resmi yang siap mendampingi wargi terkait pembuatan Kartu AK-1, lowongan kerja terverifikasi, pelatihan kerja BLK, hingga pengaduan ketenagakerjaan.\n\nAda yang dapat kami bantu hari ini?",
    },
];

const quickReplies = [
    "Cara buat Kartu AK-1",
    "Jam operasional kantor",
    "Alamat kantor Disnakertrans",
    "Informasi lowongan kerja",
    "Cara pengaduan online",
];

function getBotReply(userMessage: string): string {
    const msg = userMessage.toLowerCase().trim();

    // ── Salam / Greeting ─────────────────────────────────────────────
    if (/halo|hai|hi\b|hey|assalamu|selamat (pagi|siang|sore|malam|datang)|permisi|hei|alo/.test(msg)) {
        return "Halo! 👋 Selamat datang di layanan informasi Disnakertrans Kabupaten Serang.\n\nSilakan tanyakan apa saja seputar layanan ketenagakerjaan kami. Saya siap membantu!";
    }

    // ── Identitas Bot ─────────────────────────────────────────────────
    if (/siapa (kamu|anda|kau|lu|lo)|nama (kamu|bot|asisten|anda)|kang satria|ini siapa|bot apa|tentang bot/.test(msg)) {
        return "Saya Kang SATRIA 🤖 (Serang Assistant for Training, Recruitment, & Information Access)\n\nAsisten virtual resmi Dinas Tenaga Kerja & Transmigrasi Kabupaten Serang.\n\nSaya bisa membantu informasi seputar:\n• 📋 Kartu AK-1\n• 💼 Lowongan kerja\n• 🎓 Pelatihan BLK\n• 📢 Pengaduan ketenagakerjaan\n• Dan layanan lainnya\n\n🌐 Kunjungi website kami untuk info lengkap.";
    }

    // ── AK-1 / Kartu Kuning ───────────────────────────────────────────
    if (/ak-?1|kartu kuning|kartu pencari kerja|ak\.1|buat kartu|daftar pencari kerja|kpk|pencaker/.test(msg)) {
        return "📋 Kartu AK-1 (Kartu Kuning) adalah tanda pendaftaran resmi pencari kerja.\n\n🔗 Daftar online:\nhttps://bahagia.serangkab.go.id\n\nLangkah pendaftaran:\n1️⃣ Buka link di atas atau install app Serang Bahagia\n2️⃣ Buat akun dengan email aktif\n3️⃣ Pilih menu 'Kartu AK.1'\n4️⃣ Isi data & unggah dokumen\n5️⃣ Tunggu verifikasi petugas\n6️⃣ Unduh kartu AK-1 dalam format PDF\n\n📄 Syarat: KTP Kab. Serang + Ijazah terakhir\n\n👉 Lihat layanan lengkap: /layanan";
    }

    // ── Lowongan Kerja ────────────────────────────────────────────────
    if (/lowongan|loker|cari kerja|bursa kerja|job fair|rekrut|hiring|kerja apa|info kerja|pekerjaan|karir|vacancy/.test(msg)) {
        return "💼 Informasi Lowongan Kerja:\n\n🔗 Portal Peluang Disnakertrans Serang:\n/peluang\n\n🔗 KarirHub Kemnaker (nasional):\nhttps://karirhub.kemnaker.go.id\n\nMelalui platform di atas Anda bisa mencari lowongan dari perusahaan terverifikasi, membuat profil pencari kerja, dan mendaftar secara gratis.\n\nAda pertanyaan lain seputar lowongan kerja?";
    }

    // ── Pelatihan / BLK ───────────────────────────────────────────────
    if (/pelatihan|blk|balai latihan|kursus|vokasi|sertifikasi|skill|keahlian|kompetensi|latihan kerja|diklat/.test(msg)) {
        return "🎓 Program Pelatihan Kerja BLK:\n\n🔗 Jadwal & Info Pelatihan:\n/pelatihan\n\n🔗 Pendaftaran via Skillhub Kemnaker:\nhttps://skillhub.kemnaker.go.id/pelatihan\n\nProgram pelatihan vokasi bersertifikat tersedia di Balai Latihan Kerja (BLK) Disnakertrans Kab. Serang. Gratis untuk masyarakat umum!\n\nCek jadwal terbaru dan daftar langsung melalui link di atas.";
    }

    // ── Pengaduan / Laporan ───────────────────────────────────────────
    if (/pengaduan|aduan|lapor|keluhan|komplain|sengketa|masalah kerja|phk|hubungan industrial|kasus tenaga kerja|melapor/.test(msg)) {
        return "📢 Layanan Pengaduan Ketenagakerjaan:\n\n🔗 Form Pengaduan Online:\n/pengaduan\n\n📧 Email: disnakertrans@serangkab.go.id\n📞 Telepon: (0254) 200234\n\nPengaduan akan ditangani dalam 3×24 jam kerja. Untuk sengketa hubungan industrial, Anda juga dapat datang langsung ke kantor Disnakertrans Kab. Serang.";
    }

    // ── Jam Operasional ───────────────────────────────────────────────
    if (/jam (buka|kerja|kantor|pelayanan|operasional)|waktu pelayanan|buka jam|tutup jam|hari kerja|jam berapa/.test(msg)) {
        return "🕐 Jam Pelayanan Disnakertrans Kab. Serang:\n\n📅 Senin – Kamis: 08.00 – 16.00 WIB\n📅 Jumat: 08.00 – 16.30 WIB\n📅 Sabtu & Minggu: Tutup\n\nLayanan online tersedia 24 jam melalui:\n🌐 /layanan-publik";
    }

    // ── Alamat / Lokasi ───────────────────────────────────────────────
    if (/alamat|lokasi|kantor|dimana|di mana|letak|gedung|peta|maps|gmaps|google maps|cara ke|rute/.test(msg)) {
        return "📍 Kantor Disnakertrans Kabupaten Serang:\n\nJl. Kawasan Puspemkab Serang No.B1\nKaserangan, Kec. Ciruas, Kab. Serang, Banten\n\n📞 (0254) 200234\n📧 disnakertrans@serangkab.go.id\n\n🗺️ Buka di Google Maps:\nhttps://maps.app.goo.gl/wTa7unGsbCJjCZdb8";
    }

    // ── Perizinan / OSS / Wajib Lapor ────────────────────────────────
    if (/oss|perizinan|izin usaha|izin tempat|siup|nib|wajib lapor|laporan ketenagakerjaan|lkk/.test(msg)) {
        return "📋 Perizinan & Laporan Ketenagakerjaan:\n\n🔗 OSS – Online Single Submission:\nhttps://oss.go.id\n\n🔗 Wajib Lapor Ketenagakerjaan:\nhttps://wajiblapor.kemnaker.go.id\n\nUntuk konsultasi lebih lanjut, hubungi kami:\n📞 (0254) 200234\n📧 disnakertrans@serangkab.go.id";
    }

    // ── Dokumen Publik / PPID ─────────────────────────────────────────
    if (/dokumen|ppid|informasi publik|laporan (tahunan|kinerja)|data (ketenagakerjaan|naker)|transparansi|statistik/.test(msg)) {
        return "📄 Dokumen & Informasi Publik:\n\n🔗 Halaman Informasi Publik:\n/informasi-publik\n\nTersedia laporan kinerja, data ketenagakerjaan, dan dokumen resmi Disnakertrans Kabupaten Serang yang dapat diunduh secara gratis.";
    }

    // ── Profil / Tentang Dinas ────────────────────────────────────────
    if (/profil|tentang (kami|dinas|disnakertrans)|sejarah dinas|visi misi|struktur organisasi|kepala dinas/.test(msg)) {
        return "🏛️ Profil Disnakertrans Kabupaten Serang:\n\n🔗 Halaman Profil:\n/profil\n\nDinas Tenaga Kerja dan Transmigrasi Kab. Serang menyelenggarakan urusan pemerintahan di bidang ketenagakerjaan & ketransmigrasian untuk kesejahteraan masyarakat Kabupaten Serang.\n\n📞 (0254) 200234\n📧 disnakertrans@serangkab.go.id";
    }

    // ── Berita / Informasi Terbaru ────────────────────────────────────
    if (/berita|informasi terbaru|update|kabar|artikel|pengumuman|info terbaru|agenda/.test(msg)) {
        return "📰 Berita & Informasi Terbaru:\n\n🔗 Halaman Berita:\n/berita\n\n🔗 Agenda & Event:\n/peluang\n\nTemukan pengumuman resmi, artikel ketenagakerjaan, dan agenda terkini seputar program Disnakertrans Kabupaten Serang.";
    }

    // ── Transmigrasi ──────────────────────────────────────────────────
    if (/transmigrasi|transmigran|pindah (daerah|wilayah)|relokasi|daerah baru|program transmigrasi/.test(msg)) {
        return "🏘️ Program Transmigrasi:\n\nDisnakertrans Kab. Serang juga menangani program ketransmigrasian.\n\n🔗 Info Program Transmigrasi Nasional:\nhttps://ketrans.kemnaker.go.id\n\nUntuk konsultasi lebih lanjut:\n📞 (0254) 200234\n📧 disnakertrans@serangkab.go.id\n📍 Kunjungi kantor di Kec. Ciruas, Kab. Serang";
    }

    // ── E-SAKIP ───────────────────────────────────────────────────────
    if (/e-?sakip|kinerja (dinas|pemerintah)|akuntabilitas|lakip/.test(msg)) {
        return "📊 E-SAKIP Kabupaten Serang:\n\n🔗 Akses E-SAKIP:\nhttps://e-sakip.serangkab.go.id\n\nSistem Akuntabilitas Kinerja Instansi Pemerintah untuk memantau kinerja dan transparansi birokrasi Kabupaten Serang.";
    }

    // ── Terima Kasih ──────────────────────────────────────────────────
    if (/terima kasih|makasih|thanks|tq|trims|thx|ok terima|sudah cukup/.test(msg)) {
        return "Sama-sama! 😊 Senang dapat membantu.\n\nJika ada pertanyaan lain seputar layanan Disnakertrans Kab. Serang, jangan ragu untuk bertanya kembali.\n\n📞 (0254) 200234\n📧 disnakertrans@serangkab.go.id";
    }

    // ── Fallback: Pertanyaan tak dikenal ─────────────────────────────
    // Jika input terlihat seperti pertanyaan tapi tidak cocok topik manapun
    const isQuestion = /apa|bagaimana|gimana|gmn|cara|dimana|kapan|berapa|siapa|kenapa|mengapa|boleh|bisa|\?/.test(msg);
    const isLongEnough = msg.replace(/\s/g, "").length > 8;

    if (isQuestion || isLongEnough) {
        return "Mohon maaf, saya belum dapat menjawab pertanyaan tersebut. 🙏\n\nAdakah informasi lain yang ingin ditanyakan? Saya dapat membantu seputar:\n\n• 📋 Kartu AK-1 (Kartu Kuning)\n• 💼 Lowongan kerja\n• 🎓 Pelatihan kerja BLK\n• 📢 Pengaduan ketenagakerjaan\n• 📍 Alamat & jam operasional\n• 📰 Berita & informasi terbaru\n\nAtau hubungi kami:\n📞 (0254) 200234\n📧 disnakertrans@serangkab.go.id";
    }

    // Input random / tidak bermakna
    return "Mohon maaf, saya tidak dapat memahami pesan tersebut. 🙏\n\nAdakah informasi lain yang ingin ditanyakan?\n\nSaya siap membantu seputar layanan Disnakertrans Kabupaten Serang.";
}

// Render pesan dengan link yang bisa diklik
function renderText(text: string) {
    // Regex: URL eksternal ATAU internal path (/xxx)
    const TOKEN = /(https?:\/\/[^\s]+|\/[a-z][a-z0-9\-/#]*)/g;
    const parts = text.split(TOKEN);
    return parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
            // External URL
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 underline underline-offset-2 font-medium break-all hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                    {part}
                </a>
            );
        } else if (/^\/[a-z]/.test(part)) {
            // Internal path
            return (
                <a
                    key={i}
                    href={part}
                    className="inline-flex items-center gap-0.5 text-blue-700 dark:text-blue-400 underline underline-offset-2 font-semibold hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                >
                    {part}
                </a>
            );
        } else {
            // Plain text — split by newline untuk preserve line breaks
            return part.split("\n").map((line, j, arr) => (
                <span key={`${i}-${j}`}>
                    {line}
                    {j < arr.length - 1 && <br />}
                </span>
            ));
        }
    });
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            role: "user",
            text: text.trim(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        setTimeout(() => {
            const botReply = getBotReply(text);
            const botMsg: Message = {
                id: Date.now() + 1,
                role: "bot",
                text: botReply,
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 600);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <>
            {/* Floating Button — Kang SATRIA */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 20 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-5 right-5 z-50 flex items-center text-white rounded-2xl shadow-2xl border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all cursor-pointer overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #1E3A8A 0%, #1e40af 100%)", boxShadow: "0 8px 32px rgba(30,58,138,0.4), 0 2px 8px rgba(0,0,0,0.25)" }}
                        aria-label="Tanya Kang SATRIA - Asisten Virtual Disnakertrans"
                        title="Tanya Kang SATRIA - Asisten Virtual Disnakertrans"
                    >
                        {/* Avatar */}
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center bg-[#1a3270]">
                            <img
                                src="/images/kang-satria.png"
                                alt="Kang SATRIA"
                                className="w-[85%] h-[85%] object-contain"
                            />
                            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border-2 border-[#1E3A8A]" />
                        </div>
                        {/* Label */}
                        <div className="text-left px-3 pr-4 hidden sm:block">
                            <p className="text-[11px] font-extrabold tracking-widest text-[#D4AF37] uppercase mb-0.5">KANG SATRIA</p>
                            <p className="text-[10px] text-white/70 font-medium leading-tight whitespace-nowrap">Asisten Virtual Disnakertrans</p>
                            <p className="text-[9px] text-white/40 leading-tight whitespace-nowrap">Kabupaten Serang</p>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
                        style={{ height: "530px" }}
                    >
                        {/* Header */}
                        <div className="shrink-0 px-4 py-3 flex items-center justify-between bg-[#1E3A8A] border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-[#1a3270] border border-[#D4AF37]/30">
                                    <img
                                        src="/images/kang-satria.png"
                                        alt="Kang SATRIA"
                                        className="w-[85%] h-[85%] object-contain"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className="text-white font-semibold text-sm leading-tight">Kang SATRIA</h4>
                                        <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium px-1.5 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                            Online
                                        </span>
                                    </div>
                                    <p className="text-white/45 text-[10px] leading-tight">Asisten Virtual • Disnakertrans Kab. Serang</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                aria-label="Tutup"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/80 dark:bg-[#0F172A]">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div className={`shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center ${
                                        msg.role === "bot"
                                            ? "bg-[#EEF2FF] border border-blue-100"
                                            : "bg-[#1E3A8A] text-white"
                                    }`}>
                                        {msg.role === "bot" ? (
                                            <img src="/images/kang-satria.png" alt="" className="w-[85%] h-[85%] object-contain" />
                                        ) : (
                                            <User className="w-3.5 h-3.5" />
                                        )}
                                    </div>
                                    <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                                        msg.role === "bot"
                                            ? "bg-white dark:bg-[#1E293B] text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-md"
                                            : "bg-[#0A192F] text-white rounded-tr-md whitespace-pre-wrap"
                                    }`}>
                                        {msg.role === "bot" ? renderText(msg.text) : msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-2.5"
                                >
                                    <div className="w-7 h-7 rounded-full bg-[#EEF2FF] border border-blue-100 shrink-0 mt-0.5 flex items-center justify-center">
                                        <img src="/images/kang-satria.png" alt="" className="w-[85%] h-[85%] object-contain" />
                                    </div>
                                    <div className="bg-white dark:bg-[#1E293B] px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        {messages.length <= 2 && (
                            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1E293B] shrink-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Pertanyaan populer:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {quickReplies.map((qr, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(qr)}
                                            className="text-[11px] px-3 py-1.5 bg-gray-100 dark:bg-[#0F172A] hover:bg-[#0A192F] hover:text-white text-gray-700 dark:text-gray-300 rounded-full font-medium transition-colors"
                                        >
                                            {qr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1E293B] flex items-center gap-2 shrink-0">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ketik pertanyaan Anda..."
                                className="flex-1 bg-gray-100 dark:bg-[#0F172A] rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A192F]/20 transition-all dark:text-white dark:placeholder:text-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="w-9 h-9 bg-[#0A192F] text-white rounded-full flex items-center justify-center hover:bg-[#1E3A8A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
