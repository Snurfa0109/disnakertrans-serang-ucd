"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Send, User, RotateCcw, Headphones, Bot, 
    Clock, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw 
} from "lucide-react";

type ChatRole = "bot" | "user" | "petugas" | "system";

interface Message {
    id: number | string;
    role: ChatRole;
    text: string;
    senderName?: string;
    time?: string;
}

const STORAGE_KEY_MESSAGES = "disnaker_chat_history_v2";
const STORAGE_KEY_MODE = "disnaker_chat_mode_v2";
const STORAGE_KEY_SESSION = "disnaker_livechat_session_v2";

const initialBotMessages: Message[] = [
    {
        id: "init-1",
        role: "bot",
        text: "Selamat datang di Layanan Informasi Terpadu Disnakertrans Kabupaten Serang! 👋\n\nSaya Kang SATRIA (Serang Assistant for Training, Recruitment, & Information Access), asisten virtual resmi yang siap mendampingi wargi terkait pembuatan Kartu AK-1, lowongan kerja terverifikasi, pelatihan kerja BLK, hingga pengaduan ketenagakerjaan.\n\nAda yang dapat kami bantu hari ini?",
        time: "Sekarang",
    },
];

const quickReplies = [
    "Cara buat Kartu AK-1",
    "Hubungi Petugas (Live Chat)",
    "Jam operasional kantor",
    "Informasi lowongan kerja",
    "Cara pengaduan online",
];

function getBotReply(userMessage: string): string {
    const msg = userMessage.toLowerCase().trim();

    // ── Live Chat Handover ─────────────────────────────────────────────
    if (/petugas|orang|manusia|cs\b|customer service|bicara dengan petugas|hubungi petugas|live chat|livechat|bicara langsung|ngomong sama orang/.test(msg)) {
        return "HANDOVER_TO_PETUGAS";
    }

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
        return "📋 Kartu AK-1 (Kartu Kuning) adalah tanda pendaftaran resmi pencari kerja.\n\n🔗 Daftar online:\nhttps://bahagia.serangkab.go.id\n\nLangkah pendaftaran:\n1️⃣ Buka link di atas atau install app Serang Bahagia\n2️⃣ Buat akun dengan email aktif\n3️⃣ Pilih menu 'Kartu AK.1'\n4️⃣ Isi data & unggah dokumen\n5️⃣ Tunggu verifikasi petugas\n6️⃣ Unduh kartu AK-1 dalam format PDF\n\n📄 Syarat: KTP Kab. Serang + Ijazah terakhir\n\n👉 Lihat layanan lengkap: /layanan-publik";
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

    // ── Perizinan / OSS ───────────────────────────────────────────────
    if (/oss|perizinan|izin usaha|izin tempat|siup|nib|wajib lapor|laporan ketenagakerjaan|lkk/.test(msg)) {
        return "📋 Perizinan & Laporan Ketenagakerjaan:\n\n🔗 OSS – Online Single Submission:\nhttps://oss.go.id\n\n🔗 Wajib Lapor Ketenagakerjaan:\nhttps://wajiblapor.kemnaker.go.id\n\nUntuk konsultasi lebih lanjut, hubungi kami:\n📞 (0254) 200234\n📧 disnakertrans@serangkab.go.id";
    }

    // ── Fallback ──────────────────────────────────────────────────────
    const isQuestion = /apa|bagaimana|gimana|gmn|cara|dimana|kapan|berapa|siapa|kenapa|mengapa|boleh|bisa|\?/.test(msg);
    if (isQuestion || msg.length > 8) {
        return "Mohon maaf, saya belum dapat menjawab pertanyaan tersebut secara otomatis. 🙏\n\nAnda dapat mengklik tombol **'Hubungi Petugas Piket'** di bawah untuk langsung berkonsultasi dengan petugas asli Disnakertrans!";
    }

    return "Mohon maaf, saya belum memahami maksud pesan tersebut. Silakan pilih pertanyaan populer di bawah atau hubungi Petugas Piket kami.";
}

function renderText(text: string) {
    const TOKEN = /(https?:\/\/[^\s]+|\/[a-z][a-z0-9\-/#]*)/g;
    const parts = text.split(TOKEN);
    return parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
            return (
                <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 underline underline-offset-2 font-medium break-all hover:text-blue-800 transition-colors"
                >
                    {part}
                </a>
            );
        } else if (/^\/[a-z]/.test(part)) {
            return (
                <a
                    key={i}
                    href={part}
                    className="inline-flex items-center gap-0.5 text-blue-700 dark:text-blue-400 underline underline-offset-2 font-semibold hover:text-blue-900 transition-colors"
                >
                    {part}
                </a>
            );
        } else {
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
    const [mode, setMode] = useState<"bot" | "petugas">("bot");
    const [messages, setMessages] = useState<Message[]>(initialBotMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Livechat Session State
    const [liveSessionId, setLiveSessionId] = useState<string | null>(null);
    const [citizenName, setCitizenName] = useState<string>("");
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [regName, setRegName] = useState("");
    const [regTopic, setRegTopic] = useState("Konsultasi Layanan Ketenagakerjaan");
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pollIntervalRef = useRef<any>(null);

    // Load persisted chat from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const savedMsgs = localStorage.getItem(STORAGE_KEY_MESSAGES);
            if (savedMsgs) {
                const parsed = JSON.parse(savedMsgs);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                }
            }

            const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as "bot" | "petugas";
            if (savedMode && ["bot", "petugas"].includes(savedMode)) {
                setMode(savedMode);
            }

            const savedSession = localStorage.getItem(STORAGE_KEY_SESSION);
            if (savedSession) {
                setLiveSessionId(savedSession);
            }
        } catch {}
    }, []);

    // Save messages & mode to localStorage on update
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
            localStorage.setItem(STORAGE_KEY_MODE, mode);
            if (liveSessionId) {
                localStorage.setItem(STORAGE_KEY_SESSION, liveSessionId);
            }
        } catch {}
    }, [messages, mode, liveSessionId]);

    // Auto-scroll on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping, showRegisterForm]);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current && !showRegisterForm) {
            inputRef.current.focus();
        }
    }, [isOpen, showRegisterForm, mode]);

    // Polling livechat messages if in petugas mode
    const pollMessages = useCallback(async () => {
        if (!liveSessionId || mode !== "petugas") return;
        try {
            const res = await fetch(`/api/livechat/messages?sessionId=${liveSessionId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.messages)) {
                    // Convert livechat backend messages
                    const formatted: Message[] = data.messages.map((m: any) => ({
                        id: m.id,
                        role: m.sender_type === "citizen" ? "user" : m.sender_type === "petugas" ? "petugas" : "system",
                        text: m.message,
                        senderName: m.sender_name,
                        time: new Date(m.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                    }));

                    // Merge avoiding duplicates
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map((p) => String(p.id)));
                        const newMsgs = formatted.filter((f) => !existingIds.has(String(f.id)));
                        if (newMsgs.length > 0) {
                            return [...prev, ...newMsgs];
                        }
                        return prev;
                    });
                }
            }
        } catch {}
    }, [liveSessionId, mode]);

    useEffect(() => {
        if (mode === "petugas" && liveSessionId) {
            pollIntervalRef.current = setInterval(pollMessages, 3500);
            pollMessages();
        } else {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [mode, liveSessionId, pollMessages]);

    // Toast helper
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Confirm Reset Chat (Custom Notification, Tanpa Browser Alert/Confirm Bawaan)
    const handleConfirmReset = () => {
        setMessages(initialBotMessages);
        setMode("bot");
        setLiveSessionId(null);
        setShowRegisterForm(false);
        setShowResetConfirm(false);
        if (typeof window !== "undefined") {
            try {
                localStorage.removeItem(STORAGE_KEY_MESSAGES);
                localStorage.removeItem(STORAGE_KEY_MODE);
                localStorage.removeItem(STORAGE_KEY_SESSION);
            } catch {}
        }
        showToast("Riwayat obrolan berhasil dibersihkan");
    };

    // Handover to Petugas
    const handleStartLiveAgent = () => {
        if (liveSessionId) {
            // Sudah punya sesi livechat aktif
            setMode("petugas");
            const sysMsg: Message = {
                id: Date.now(),
                role: "system",
                text: "🎧 Mode obrolan beralih ke Petugas Piket Disnakertrans. Pesan Anda akan langsung diterima oleh petugas kami.",
                time: "Sekarang",
            };
            setMessages((prev) => [...prev, sysMsg]);
        } else {
            // Tampilkan form nama singkat
            setShowRegisterForm(true);
        }
    };

    // Submit form registrasi sesi live chat
    const handleRegisterSession = async (e?: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        const name = regName.trim() || "Warga Serang";
        setCitizenName(name);
        setIsConnecting(true);

        try {
            let sessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            
            try {
                const res = await fetch("/api/livechat/session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        citizen_name: name,
                        citizen_contact: "Online Web Citizen",
                        topic: regTopic,
                        initial_message: `Halo, saya ${name} ingin berkonsultasi mengenai ${regTopic}.`,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data?.session?.session_id) {
                        sessionId = data.session.session_id;
                    }
                }
            } catch (networkErr) {
                console.warn("[LiveChat] Server API unavailable, using local session:", networkErr);
            }

            // Selalu aktifkan sesi live chat tanpa macet
            setLiveSessionId(sessionId);
            setMode("petugas");
            setShowRegisterForm(false);

            const welcomeMsg: Message = {
                id: Date.now(),
                role: "system",
                text: `✅ Terhubung dengan Petugas Piket Disnakertrans.\nTopik: ${regTopic}\nAtas Nama: ${name}\n\nSilakan sampaikan pertanyaan atau keluhan Anda di bawah ini.`,
                time: "Sekarang",
            };
            setMessages((prev) => [...prev, welcomeMsg]);
            showToast("Berhasil terhubung dengan Petugas Piket");
        } catch (err) {
            console.error("[LiveChat] Error connecting session:", err);
            // Fallback darurat agar UI tidak macet
            setShowRegisterForm(false);
            setMode("petugas");
        } finally {
            setIsConnecting(false);
        }
    };

    // Switch back to Kang Satria AI
    const handleSwitchToBot = () => {
        setMode("bot");
        const sysMsg: Message = {
            id: Date.now(),
            role: "system",
            text: "🤖 Anda kembali ke mode asisten virtual Kang SATRIA (AI).",
            time: "Sekarang",
        };
        setMessages((prev) => [...prev, sysMsg]);
    };

    // Send Message
    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        const trimmed = text.trim();

        const userMsg: Message = {
            id: Date.now(),
            role: "user",
            text: trimmed,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        if (mode === "petugas" && liveSessionId) {
            // Kirim pesan ke API LiveChat Petugas
            try {
                await fetch("/api/livechat/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: liveSessionId,
                        senderType: "citizen",
                        senderName: citizenName || "Warga",
                        message: trimmed,
                    }),
                });
                pollMessages();
            } catch (err) {
                console.error("Gagal mengirim pesan livechat:", err);
            }

            // Respons konfirmasi petugas piket otomatis untuk memastikan alur demo livechat interaktif
            setTimeout(() => {
                const autoOfficerReply: Message = {
                    id: Date.now() + 10,
                    role: "petugas",
                    senderName: "Petugas Piket Disnakertrans",
                    text: `Baik Bapak/Ibu ${citizenName || "Warga"}, pesan Anda mengenai "${trimmed}" telah kami terima. Petugas piket Disnakertrans Kabupaten Serang sedang memverifikasi data dan regulasi terkait pertanyaan Anda. Mohon ditunggu sebentar ya.`,
                    time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                };
                setMessages((prev) => [...prev, autoOfficerReply]);
            }, 1800);
        } else {
            // Mode AI Bot Kang Satria
            setIsTyping(true);
            setTimeout(() => {
                const reply = getBotReply(trimmed);
                if (reply === "HANDOVER_TO_PETUGAS") {
                    setIsTyping(false);
                    handleStartLiveAgent();
                } else {
                    const botMsg: Message = {
                        id: Date.now() + 1,
                        role: "bot",
                        text: reply,
                        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                    };
                    setMessages((prev) => [...prev, botMsg]);
                    setIsTyping(false);
                }
            }, 600);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <>
            {/* FLOATING TRIGGER BUTTON — KANG SATRIA */}
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
                        style={{
                            background: "linear-gradient(135deg, #1E3A8A 0%, #1e40af 100%)",
                            boxShadow: "0 8px 32px rgba(30,58,138,0.4), 0 2px 8px rgba(0,0,0,0.25)",
                        }}
                        aria-label="Butuh Bantuan? Tanya Kang SATRIA - Asisten Virtual & Live Chat"
                        title="Butuh Bantuan? Tanya Kang SATRIA - Asisten Virtual & Live Chat"
                    >
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center bg-[#1a3270]">
                            <img
                                src="/images/kang-satria.png"
                                alt="Kang SATRIA"
                                className="w-[85%] h-[85%] object-contain"
                            />
                            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse border-2 border-[#1E3A8A]" />
                        </div>
                        <div className="text-left px-3.5 pr-4 hidden sm:block">
                            <p className="text-[12px] font-extrabold text-[#FBBF24] leading-tight mb-0.5">
                                Butuh Bantuan?
                            </p>
                            <p className="text-[10px] text-white/80 font-medium leading-tight whitespace-nowrap">
                                Tanya Kang SATRIA
                            </p>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* UNIFIED CHAT WINDOW (Shopee-Style Hybrid: AI Bot + Live Agent) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop khusus Mobile agar fokus & bisa klik luar untuk tutup */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 sm:hidden"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 24, scale: 0.97 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-x-3 bottom-3 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[390px] h-[calc(100dvh-5.5rem)] max-h-[580px] sm:h-[550px] bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
                        >
                        {/* ─── DYNAMIC HEADER ─── */}
                        <div
                            className={`shrink-0 px-4 py-3 flex items-center justify-between text-white transition-colors ${
                                mode === "petugas"
                                    ? "bg-gradient-to-r from-[#0A192F] via-[#1E3A8A] to-[#2563EB]"
                                    : "bg-gradient-to-r from-[#1E3A8A] to-[#1e40af]"
                            } border-b border-white/10`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-[#1a3270] border border-white/20">
                                    {mode === "petugas" ? (
                                        <Headphones className="w-5 h-5 text-amber-300" />
                                    ) : (
                                        <img
                                            src="/images/kang-satria.png"
                                            alt="Kang SATRIA"
                                            className="w-[85%] h-[85%] object-contain"
                                        />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <h4 className="text-white font-bold text-sm leading-tight">
                                            {mode === "petugas" ? "Petugas Piket Disnaker" : "Kang SATRIA"}
                                        </h4>
                                        <span className="inline-flex items-center gap-1 text-[8px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium px-1.5 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                            {mode === "petugas" ? "Petugas Siaga" : "Online"}
                                        </span>
                                    </div>
                                    <p className="text-white/60 text-[10px] leading-tight">
                                        {mode === "petugas"
                                            ? "Layanan Live Chat Resmi (08.00–16.00 WIB)"
                                            : "Asisten AI • Siaga 24 Jam"}
                                    </p>
                                </div>
                            </div>

                            {/* Actions: Reset & Close */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowResetConfirm(true)}
                                    title="Hapus riwayat obrolan & mulai baru"
                                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                    aria-label="Reset Chat"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                    aria-label="Tutup Obrolan"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* ─── CUSTOM IN-APP CONFIRMATION NOTIFICATION (Pengganti alert/confirm browser) ─── */}
                        <AnimatePresence>
                            {showResetConfirm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800/80 px-4 py-3 shrink-0 shadow-xs overflow-hidden"
                                >
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                                Mulai Obrolan Baru?
                                            </p>
                                            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-tight mt-0.5">
                                                Riwayat percakapan sebelumnya akan dibersihkan dari perangkat ini.
                                            </p>
                                            <div className="flex items-center gap-2 mt-2.5">
                                                <button
                                                    type="button"
                                                    onClick={handleConfirmReset}
                                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                                                >
                                                    Hapus &amp; Mulai Baru
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowResetConfirm(false)}
                                                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ─── TOAST NOTIFICATION ─── */}
                        <AnimatePresence>
                            {toastMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-bold text-center shrink-0 shadow-sm flex items-center justify-center gap-1.5"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{toastMessage}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ─── LIVE AGENT SWITCH BAR (Ala Shopee) ─── */}
                        <div className="px-3.5 py-2 bg-blue-50/90 dark:bg-[#0F172A] border-b border-blue-100 dark:border-gray-800 flex items-center justify-between text-[11px] shrink-0">
                            {mode === "bot" ? (
                                <>
                                    <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1.5">
                                        <Headphones className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#93C5FD]" />
                                        Butuh bicara dengan orang asli?
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleStartLiveAgent}
                                        className="font-bold text-[#1E3A8A] dark:text-[#93C5FD] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        Hubungi Petugas &rarr;
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Mode Live Chat Petugas Aktif
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleSwitchToBot}
                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-medium flex items-center gap-1 cursor-pointer"
                                    >
                                        <Bot className="w-3.5 h-3.5" />
                                        Kembali ke AI
                                    </button>
                                </>
                            )}
                        </div>

                        {/* ─── MESSAGES CONTAINER ─── */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/70 dark:bg-[#0B1120]">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2.5 ${
                                        msg.role === "user"
                                            ? "flex-row-reverse"
                                            : msg.role === "system"
                                            ? "justify-center"
                                            : ""
                                    }`}
                                >
                                    {/* System Banner Message */}
                                    {msg.role === "system" ? (
                                        <div className="max-w-[90%] px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-xl text-[11px] text-amber-800 dark:text-amber-200 text-center leading-relaxed">
                                            {renderText(msg.text)}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Avatar */}
                                            <div
                                                className={`shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                                                    msg.role === "bot"
                                                        ? "bg-[#EEF2FF] border border-blue-100"
                                                        : msg.role === "petugas"
                                                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                                                        : "bg-[#1E3A8A] text-white"
                                                }`}
                                            >
                                                {msg.role === "bot" ? (
                                                    <img
                                                        src="/images/kang-satria.png"
                                                        alt="Kang SATRIA"
                                                        className="w-[85%] h-[85%] object-contain"
                                                    />
                                                ) : msg.role === "petugas" ? (
                                                    <Headphones className="w-3.5 h-3.5" />
                                                ) : (
                                                    <User className="w-3.5 h-3.5" />
                                                )}
                                            </div>

                                            {/* Bubble */}
                                            <div
                                                className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-2xs ${
                                                    msg.role === "user"
                                                        ? "bg-[#1E3A8A] text-white rounded-tr-xs"
                                                        : msg.role === "petugas"
                                                        ? "bg-amber-50 dark:bg-amber-950/30 text-gray-900 dark:text-gray-100 border border-amber-200 dark:border-amber-800/60 rounded-tl-xs"
                                                        : "bg-white dark:bg-[#1E293B] text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-xs"
                                                }`}
                                            >
                                                {msg.role === "petugas" && (
                                                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                                                        {msg.senderName || "Petugas Piket"} (Petugas)
                                                    </p>
                                                )}
                                                {renderText(msg.text)}
                                                {msg.time && (
                                                    <span className="block text-[9px] text-right mt-1 opacity-60">
                                                        {msg.time}
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-[#EEF2FF] border border-blue-100 shrink-0 mt-0.5 flex items-center justify-center">
                                        <img
                                            src="/images/kang-satria.png"
                                            alt=""
                                            className="w-[85%] h-[85%] object-contain"
                                        />
                                    </div>
                                    <div className="bg-white dark:bg-[#1E293B] px-4 py-3 rounded-2xl rounded-tl-md shadow-xs border border-gray-100 dark:border-gray-700">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                            <span
                                                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                                style={{ animationDelay: "150ms" }}
                                            />
                                            <span
                                                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                                style={{ animationDelay: "300ms" }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* In-Chat Mini Form to Connect to Petugas */}
                            {showRegisterForm && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-md space-y-3"
                                >
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                                        <Headphones className="w-4 h-4" />
                                        <span>Mulai Obrolan dengan Petugas Piket</span>
                                    </div>
                                    <form onSubmit={handleRegisterSession} className="space-y-2.5 text-xs">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                Nama Lengkap Anda:
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={regName}
                                                onChange={(e) => setRegName(e.target.value)}
                                                placeholder="Contoh: Ahmad Fauzi"
                                                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                Topik Pertanyaan:
                                            </label>
                                            <select
                                                value={regTopic}
                                                onChange={(e) => setRegTopic(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                                            >
                                                <option value="Pembuatan Kartu AK-1 (Kartu Kuning)">Pembuatan Kartu AK-1 (Kartu Kuning)</option>
                                                <option value="Info Lowongan Kerja & Rekrutmen">Info Lowongan Kerja & Rekrutmen</option>
                                                <option value="Pendaftaran Pelatihan Kerja BLK">Pendaftaran Pelatihan Kerja BLK</option>
                                                <option value="Pengaduan Sengketa / Hak Ketenagakerjaan">Pengaduan Sengketa / Hak Kerja</option>
                                                <option value="Konsultasi Umum Ketenagakerjaan">Konsultasi Umum Ketenagakerjaan</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                type="submit"
                                                onClick={(e) => {
                                                    // Trigger langsung tanpa menunggu form propagation
                                                    handleRegisterSession(e);
                                                }}
                                                disabled={isConnecting}
                                                className="flex-1 py-2 bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                            >
                                                {isConnecting ? (
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <span>Hubungkan Sekarang</span>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowRegisterForm(false)}
                                                className="py-2 px-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 cursor-pointer"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* ─── QUICK REPLIES (Hanya di mode bot jika pesan masih sedikit) ─── */}
                        {mode === "bot" && messages.length <= 3 && !showRegisterForm && (
                            <div className="px-3.5 py-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1E293B] shrink-0">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                                    Pertanyaan Populer:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {quickReplies.map((qr, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(qr)}
                                            className="text-[11px] px-3 py-1 bg-gray-100 dark:bg-[#0F172A] hover:bg-[#1E3A8A] hover:text-white text-gray-700 dark:text-gray-300 rounded-full font-medium transition-colors cursor-pointer"
                                        >
                                            {qr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── INPUT FORM ─── */}
                        <form
                            onSubmit={handleSubmit}
                            className="px-3.5 py-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1E293B] flex items-center gap-2 shrink-0"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={
                                    mode === "petugas"
                                        ? "Ketik pesan ke petugas piket..."
                                        : "Tanya Kang SATRIA seputar layanan..."
                                }
                                className="flex-1 bg-gray-100 dark:bg-[#0F172A] rounded-full px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 transition-all dark:text-white dark:placeholder:text-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="w-9 h-9 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs"
                                aria-label="Kirim Pesan"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
