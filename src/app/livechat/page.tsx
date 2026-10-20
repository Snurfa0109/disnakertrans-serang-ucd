"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  MessageSquare, Send, User, Bot, Clock, ShieldCheck, 
  CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Volume2, 
  VolumeX, Star, HelpCircle, PhoneCall, Sparkles, Building2
} from "lucide-react";
import clsx from "clsx";

interface LiveChatSession {
  id: number;
  session_id: string;
  citizen_name: string;
  citizen_contact: string;
  topic: string;
  status: 'waiting' | 'active' | 'closed';
  assigned_petugas: string | null;
  rating: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

interface LiveChatMessage {
  id: number;
  session_id: string;
  sender_type: 'citizen' | 'petugas' | 'system';
  sender_name: string;
  message: string;
  is_read: number;
  created_at: string;
}

interface OfficeHours {
  isOpen: boolean;
  statusText: string;
  badgeColor: string;
  currentTimeWIB: string;
  nextOpenText: string;
  schedule: {
    weekday: string;
    friday: string;
    weekend: string;
  };
}

const TOPICS = [
  "Pembuatan Kartu AK-1 (Kartu Kuning)",
  "Info Lowongan Kerja & Karir",
  "Pendaftaran Pelatihan Kerja BLK",
  "Konsultasi Sengketa Gaji / PHK / Mediasi",
  "Perizinan & Wajib Lapor Ketenagakerjaan",
  "Informasi Umum & Layanan Lainnya",
];

const CITIZEN_PROMPTS = [
  "Bagaimana cara membuat Kartu Kuning online?",
  "Kapan jadwal pelatihan BLK terbaru dibuka?",
  "Apakah pembuatan AK-1 dipungut biaya?",
  "Bagaimana prosedur konsultasi sengketa kerja?",
];

// Simple chime synthesizer using Web Audio API (zero external asset dependency)
function playChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export default function LiveChatPage() {
  const [session, setSession] = useState<LiveChatSession | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [officeHours, setOfficeHours] = useState<OfficeHours | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [initialMessage, setInitialMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Chat room states
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isEndingChat, setIsEndingChat] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  // 1. Initial Load: Check active session from localStorage & check Office Hours
  useEffect(() => {
    async function initChat() {
      setIsLoadingSession(true);
      try {
        const storedSessionId = localStorage.getItem("disnakertrans_livechat_session_id");
        const url = storedSessionId 
          ? `/api/livechat/session?sessionId=${encodeURIComponent(storedSessionId)}` 
          : `/api/livechat/session`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          if (data.officeHours) setOfficeHours(data.officeHours);
          if (data.session) {
            setSession(data.session);
            setMessages(data.messages || []);
            lastMessageCountRef.current = (data.messages || []).length;
          } else if (storedSessionId) {
            // Expired or invalid session
            localStorage.removeItem("disnakertrans_livechat_session_id");
          }
        }
      } catch (err) {
        console.error("[LiveChat Init Error]:", err);
      } finally {
        setIsLoadingSession(false);
      }
    }

    initChat();
  }, []);

  // 2. Poll for new messages every 3 seconds if session is active or waiting
  useEffect(() => {
    if (!session || session.status === "closed") return;

    const interval = setInterval(async () => {
      try {
        const lastId = messages.length > 0 ? messages[messages.length - 1].id : 0;
        const res = await fetch(`/api/livechat/messages?sessionId=${session.session_id}&afterId=${lastId}`);
        const data = await res.json();

        if (data.success && data.messages && data.messages.length > 0) {
          setMessages((prev) => [...prev, ...data.messages]);
          if (data.session) setSession(data.session);

          // If new message from petugas, trigger chime
          const hasPetugasMsg = data.messages.some((m: LiveChatMessage) => m.sender_type === "petugas");
          if (hasPetugasMsg && soundEnabled) {
            playChime();
          }
        }
      } catch (err) {
        console.warn("[LiveChat Polling Warning]:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [session, messages, soundEnabled]);

  // 3. Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Handle Starting New Chat Session
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Silakan masukkan nama lengkap Anda");
      return;
    }
    if (!initialMessage.trim()) {
      setFormError("Silakan tulis pertanyaan atau keperluan konsultasi Anda");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/livechat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizen_name: name,
          citizen_contact: contact,
          topic,
          initial_message: initialMessage,
        }),
      });

      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setMessages(data.messages || []);
        localStorage.setItem("disnakertrans_livechat_session_id", data.session.session_id);
        lastMessageCountRef.current = (data.messages || []).length;
      } else {
        setFormError(data.message || "Gagal memulai sesi chat. Silakan coba lagi.");
      }
    } catch {
      setFormError("Koneksi gagal. Pastikan jaringan internet Anda aktif.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Handle Send Message from Citizen
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || newMessage).trim();
    if (!text || !session || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/livechat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.session_id,
          senderType: "citizen",
          senderName: session.citizen_name,
          message: text,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        if (data.session) setSession(data.session);
        setNewMessage("");
      }
    } catch (err) {
      console.error("[Send Message Error]:", err);
    } finally {
      setIsSending(false);
    }
  };

  // 6. Handle Close / Finish Chat
  const handleFinishChat = async () => {
    if (!session) return;
    setIsEndingChat(true);
    try {
      const res = await fetch("/api/livechat/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.session_id,
          rating,
          feedback,
        }),
      });

      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setShowRatingModal(false);
      }
    } catch (err) {
      console.error("[Finish Chat Error]:", err);
    } finally {
      setIsEndingChat(false);
    }
  };

  // 7. Start completely fresh chat
  const handleStartFresh = () => {
    localStorage.removeItem("disnakertrans_livechat_session_id");
    setSession(null);
    setMessages([]);
    setName("");
    setContact("");
    setInitialMessage("");
    setShowRatingModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B132B] pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#1E3A8A] dark:hover:text-[#FBBF24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          {/* Working Hours Badge */}
          {officeHours && (
            <div className={clsx(
              "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs transition-all",
              officeHours.isOpen
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
            )}>
              <span className="relative flex h-2.5 w-2.5">
                {officeHours.isOpen && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={clsx("relative inline-flex rounded-full h-2.5 w-2.5", officeHours.isOpen ? "bg-emerald-500" : "bg-amber-500")}></span>
              </span>
              <span>{officeHours.statusText}</span>
              <span className="text-[11px] font-normal opacity-80 hidden sm:inline">({officeHours.currentTimeWIB})</span>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {isLoadingSession && (
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-xl">
            <RefreshCw className="w-8 h-8 text-[#1E3A8A] dark:text-[#93C5FD] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Menghubungkan ke layanan live chat petugas...</p>
          </div>
        )}

        {/* MODE 1: NEW CHAT INITIATION FORM */}
        {!isLoadingSession && !session && (
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#0A192F] via-[#1E3A8A] to-[#2563EB] text-white p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full pointer-events-none blur-2xl" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold mb-2.5 backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Layanan Terpadu Satu Pintu
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Live Chat Petugas Piket
                  </h1>
                  <p className="text-blue-100 text-sm mt-1 max-w-xl">
                    Konsultasi langsung dengan petugas Disnakertrans Kabupaten Serang seputar Kartu AK-1, lowongan kerja, pelatihan BLK, atau sengketa ketenagakerjaan.
                  </p>
                </div>

                <div className="shrink-0 bg-white/10 dark:bg-black/20 p-4 rounded-2xl border border-white/20 backdrop-blur-xs text-xs">
                  <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    Jam Pelayanan Resmi:
                  </p>
                  <p className="text-blue-100">Senin – Kamis: 08.00 – 16.00 WIB</p>
                  <p className="text-blue-100">Jumat: 08.00 – 16.30 WIB</p>
                  <p className="text-blue-200/80 text-[11px] mt-1">*Tetap bisa kirim pesan 24 jam</p>
                </div>
              </div>
            </div>

            {/* Offline Notice if outside hours */}
            {officeHours && !officeHours.isOpen && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 p-4 px-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold text-sm">Saat ini di luar jam operasional pelayanan (08.00 - 16.00 WIB)</p>
                  <p className="mt-0.5">
                    Anda tetap dapat mengisi formulir dan mengirim pertanyaan. Pesan Anda akan masuk ke antrian resmi dan langsung dijawab oleh petugas piket saat jam kerja dimulai.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleStartChat} className="p-6 sm:p-8 space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzi"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none transition-all"
                  />
                </div>

                {/* Nomor Kontak / WhatsApp (Opsional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp / HP <span className="text-gray-400 text-[10px] font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="08xxxxxxxxxx (agar bisa dihubungi balik jika terputus)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Topik Konsultasi */}
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-1.5">
                  Topik Layanan / Kategori Pertanyaan <span className="text-red-500">*</span>
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none transition-all"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pertanyaan Awal */}
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-1.5">
                  Pertanyaan atau Pesan Anda <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Tuliskan secara jelas apa yang ingin Anda tanyakan atau konsultasikan dengan petugas kami..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none transition-all resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Percakapan resmi tercatat di sistem pelayanan Disnakertrans Serang</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-all hover:shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Memulai Chat...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Mulai Chat dengan Petugas
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Alternatif Bantuan 24 Jam */}
            <div className="bg-gray-50 dark:bg-[#0F172A] p-6 border-t border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-[#93C5FD] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Butuh jawaban instan 24 jam nonstop?</p>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400">Gunakan Kang Satria, asisten virtual Disnakertrans yang selalu aktif</p>
                </div>
              </div>
              <Link
                href="/pengaduan"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1E293B] transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Buat Pengaduan Resmi
              </Link>
            </div>
          </div>
        )}

        {/* MODE 2: ACTIVE LIVE CHAT ROOM */}
        {!isLoadingSession && session && (
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[75vh] max-h-[800px]">
            
            {/* Chat Room Top Bar */}
            <div className="bg-[#0A192F] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-sm border-2 border-white/20">
                    <Building2 className="w-5 h-5 text-amber-300" />
                  </div>
                  <span className={clsx(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0A192F]",
                    session.status === "active" ? "bg-emerald-500" : session.status === "waiting" ? "bg-amber-400 animate-pulse" : "bg-gray-400"
                  )} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">
                      {session.assigned_petugas || "Petugas Piket Disnakertrans"}
                    </h2>
                    <span className={clsx(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                      session.status === "active" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : session.status === "waiting" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-gray-700 text-gray-300"
                    )}>
                      {session.status === "active" ? "Terhubung" : session.status === "waiting" ? "Menunggu Petugas" : "Selesai"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 truncate max-w-xs sm:max-w-md">
                    Topik: {session.topic} • {session.citizen_name}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  title={soundEnabled ? "Nonaktifkan suara notifikasi" : "Aktifkan suara notifikasi"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                </button>

                {session.status !== "closed" ? (
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-bold transition-colors"
                  >
                    Selesai Chat
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartFresh}
                    className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Mulai Chat Baru
                  </button>
                )}
              </div>
            </div>

            {/* Closed Banner if completed */}
            {session.status === "closed" && (
              <div className="bg-gray-100 dark:bg-gray-800/80 px-5 py-2.5 border-b border-gray-200 dark:border-gray-700 text-xs text-center text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Sesi konsultasi ini telah selesai. Anda dapat membaca riwayat atau memulai percakapan baru.</span>
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/50 dark:bg-[#0B132B]/50" style={{ scrollbarWidth: 'thin' }}>
              {messages.map((msg) => {
                const isCitizen = msg.sender_type === "citizen";
                const isSystem = msg.sender_type === "system";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <div className="max-w-lg bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 text-xs px-4 py-2.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 shadow-xs text-center leading-relaxed">
                        <span className="font-semibold">{msg.message}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={clsx("flex flex-col", isCitizen ? "items-end" : "items-start")}
                  >
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 px-1 font-semibold">
                      {isCitizen ? "Anda" : `${msg.sender_name} (Petugas)`}
                    </span>
                    <div
                      className={clsx(
                        "max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs",
                        isCitizen
                          ? "bg-[#1E3A8A] text-white rounded-tr-xs"
                          : "bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-tl-xs"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <span className={clsx(
                        "text-[9px] block text-right mt-1.5 opacity-70",
                        isCitizen ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                      )}>
                        {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {session.status !== "closed" && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-[#0F172A] border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <span className="text-[11px] font-bold text-gray-400 shrink-0">Pertanyaan cepat:</span>
                {CITIZEN_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[11px] bg-white dark:bg-[#1E293B] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Message Input Bar */}
            {session.status !== "closed" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 sm:p-4 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik balasan Anda ke petugas di sini..."
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder:text-gray-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="p-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-all disabled:opacity-40 shrink-0 shadow-sm"
                  title="Kirim pesan"
                >
                  {isSending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-700 text-center">
                <button
                  type="button"
                  onClick={handleStartFresh}
                  className="px-6 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold text-xs shadow-md transition-all"
                >
                  Mulai Konsultasi Baru
                </button>
              </div>
            )}
          </div>
        )}

        {/* Rating & Feedback Modal */}
        {showRatingModal && session && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                Selesai Konsultasi Live Chat
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 text-center mt-1">
                Bagaimana kualitas pelayanan petugas Disnakertrans Serang hari ini?
              </p>

              {/* Star Rating */}
              <div className="flex items-center justify-center gap-2 my-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-110"
                  >
                    <Star
                      className={clsx(
                        "w-7 h-7",
                        star <= rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback Comment */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Kritik & Saran untuk Petugas (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Pelayanan sangat ramah dan jelas..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#0F172A] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isEndingChat}
                  onClick={handleFinishChat}
                  className="flex-1 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-xs font-bold text-white shadow-md transition-colors"
                >
                  {isEndingChat ? "Menyimpan..." : "Kirim & Tutup Sesi"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
