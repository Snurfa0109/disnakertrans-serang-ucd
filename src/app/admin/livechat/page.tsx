"use client";

import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Send, User, Search, RefreshCw, CheckCircle2, 
  Clock, AlertCircle, Shield, Volume2, VolumeX, Sparkles, 
  CornerDownLeft, Building2, UserCheck, Star
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
  last_message?: string;
  last_message_time?: string;
  message_count?: number;
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

const TEMPLATES = [
  {
    label: "Salam Pembuka Ramah",
    text: "Halo Bapak/Ibu, terima kasih telah menghubungi Layanan Live Chat Disnakertrans Kabupaten Serang. Saya dengan senang hati siap mendampingi dan menjawab pertanyaan Anda. Ada yang bisa kami bantu?",
  },
  {
    label: "Syarat Pembuatan Kartu AK-1 (Kartu Kuning)",
    text: "Untuk pembuatan Kartu AK-1 secara online, silakan unduh aplikasi atau akses portal Serang Bahagia di https://bahagia.serangkab.go.id. Siapkan foto KTP Kabupaten Serang, ijazah terakhir, dan pas foto formal. Pembuatan kartu ini 100% GRATIS tanpa dipungut biaya apapun.",
  },
  {
    label: "Info Lowongan Kerja Terverifikasi",
    text: "Daftar lowongan kerja resmi di perusahaan dan kawasan industri Kabupaten Serang dapat dilihat secara berkala melalui menu Peluang di website ini (/peluang) atau portal nasional Kemnaker di https://karirhub.kemnaker.go.id.",
  },
  {
    label: "Pendaftaran Pelatihan Vokasi BLK",
    text: "Pendaftaran pelatihan kerja di Balai Latihan Kerja (BLK) Disnakertrans Serang (Teknik Las, Otomotif, Menjahit, Listrik, Komputer) dibuka secara gratis bersertifikasi BNSP. Informasi gelombang dan jadwal dapat dipantau di halaman /pelatihan.",
  },
  {
    label: "Konsultasi Sengketa Kerja & Mediasi PHK",
    text: "Untuk konsultasi atau pengaduan perselisihan hubungan industrial (PHK sepihak, upah/pesangon tidak dibayarkan, BPJS Ketenagakerjaan), silakan buat laporan resmi di menu Pengaduan (/pengaduan) agar dapat diregister dan diagendakan mediasi resmi oleh mediator Disnakertrans.",
  },
  {
    label: "Salam Penutup Selesai",
    text: "Terima kasih telah berkonsultasi dengan Disnakertrans Kabupaten Serang. Semoga informasi ini bermanfaat. Jika ada pertanyaan lain, jangan ragu untuk menghubungi kami kembali. Selamat beraktivitas!",
  },
];

function playAdminChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.41);
  } catch {}
}

export default function AdminLiveChatPage() {
  const [sessions, setSessions] = useState<LiveChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<LiveChatSession | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  
  // Counts & filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [waitingCount, setWaitingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Loading & interactive
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<number>(0);

  // 1. Fetch Session List
  const fetchSessions = async (showLoading = false) => {
    if (showLoading) setIsLoadingList(true);
    try {
      const url = `/api/admin/livechat?status=${encodeURIComponent(statusFilter)}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setSessions(data.sessions || []);
        setWaitingCount(data.waitingCount || 0);
        setActiveCount(data.activeCount || 0);
        setTotalCount(data.totalCount || 0);
        if (data.currentUser) setCurrentUser(data.currentUser);

        // Auto select first session if none selected and on desktop
        if (!selectedSessionId && data.sessions && data.sessions.length > 0) {
          setSelectedSessionId(data.sessions[0].session_id);
        }
      }
    } catch (err) {
      console.error("[Admin LiveChat fetch error]:", err);
    } finally {
      if (showLoading) setIsLoadingList(false);
    }
  };

  // 2. Fetch Active Session Detail & Messages
  const fetchActiveMessages = async (sessionId: string, isPoll = false) => {
    if (!isPoll) setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/livechat?sessionId=${encodeURIComponent(sessionId)}`);
      const data = await res.json();

      if (data.success) {
        setSelectedSession(data.session);
        const newMsgs = data.messages || [];
        
        // Check for new incoming message from citizen
        if (isPoll && newMsgs.length > messages.length) {
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg.sender_type === "citizen" && soundEnabled) {
            playAdminChime();
          }
        }

        setMessages(newMsgs);
        if (newMsgs.length > 0) {
          lastMessageIdRef.current = newMsgs[newMsgs.length - 1].id;
        }
      }
    } catch (err) {
      console.error("[Admin LiveChat fetch messages error]:", err);
    } finally {
      if (!isPoll) setIsLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSessions(true);
  }, [statusFilter, searchQuery]);

  // When selectedSessionId changes, load its messages
  useEffect(() => {
    if (selectedSessionId) {
      fetchActiveMessages(selectedSessionId);
    }
  }, [selectedSessionId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling loop every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions(false);
      if (selectedSessionId) {
        fetchActiveMessages(selectedSessionId, true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedSessionId, statusFilter, searchQuery, messages.length, soundEnabled]);

  // Handle Send Reply as Petugas
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedSessionId || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/admin/livechat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          message: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        if (data.session) setSelectedSession(data.session);
        setReplyText("");
        fetchSessions(false);
      }
    } catch (err) {
      console.error("[Admin Send Reply error]:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Session Actions: assign, close, reopen
  const handleSessionAction = async (action: 'assign' | 'close' | 'reopen') => {
    if (!selectedSessionId) return;

    try {
      const res = await fetch("/api/admin/livechat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          action,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedSession(data.session);
        setMessages(data.messages || []);
        fetchSessions(false);
      }
    } catch (err) {
      console.error("[Admin Session Action error]:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Live Chat Petugas Piket
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              Pelayanan Langsung
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Meja piket konsultasi warga secara online selama jam kerja operasional (08.00 - 16.00 WIB)
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E293B] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-all shadow-xs"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <span>Notifikasi Suara: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-gray-400" />
                <span>Notifikasi Suara: OFF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => fetchSessions(true)}
            className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all shadow-xs"
            title="Refresh antrian"
          >
            <RefreshCw className={clsx("w-4 h-4", isLoadingList && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main Two-Pane Chat Desk */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[700px] h-[calc(100vh-220px)]">
        
        {/* LEFT PANE: QUEUE / SESSIONS LIST (Cols 4) */}
        <div className="lg:col-span-5 xl:col-span-4 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full bg-slate-50/50 dark:bg-[#0F172A]/50">
          
          {/* Search Box */}
          <div className="p-3.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E293B]">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama warga, kontak, topik..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setStatusFilter("all")}
                className={clsx(
                  "text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap",
                  statusFilter === "all"
                    ? "bg-[#1E3A8A] text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                )}
              >
                Semua ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter("waiting")}
                className={clsx(
                  "text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap flex items-center gap-1",
                  statusFilter === "waiting"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100"
                )}
              >
                <span>Menunggu</span>
                {waitingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {waitingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={clsx(
                  "text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap",
                  statusFilter === "active"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                )}
              >
                Aktif ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter("closed")}
                className={clsx(
                  "text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap",
                  statusFilter === "closed"
                    ? "bg-gray-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                )}
              >
                Selesai
              </button>
            </div>
          </div>

          {/* Sessions List Stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800" style={{ scrollbarWidth: 'thin' }}>
            {sessions.length > 0 ? (
              sessions.map((s) => {
                const isSelected = selectedSessionId === s.session_id;
                return (
                  <button
                    key={s.session_id}
                    type="button"
                    onClick={() => setSelectedSessionId(s.session_id)}
                    className={clsx(
                      "w-full text-left p-3.5 transition-all flex items-start gap-3 relative border-l-4",
                      isSelected
                        ? "bg-white dark:bg-[#1E293B] border-l-[#1E3A8A] dark:border-l-[#FBBF24] shadow-xs"
                        : "hover:bg-gray-100/70 dark:hover:bg-[#1E293B]/50 border-l-transparent"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1E3A8A] dark:text-[#93C5FD] flex items-center justify-center font-bold text-xs">
                        {s.citizen_name.charAt(0).toUpperCase()}
                      </div>
                      <span className={clsx(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0F172A]",
                        s.status === "waiting" ? "bg-amber-500 animate-pulse" : s.status === "active" ? "bg-emerald-500" : "bg-gray-400"
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {s.citizen_name}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                          {s.last_message_time ? new Date(s.last_message_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 truncate max-w-[170px]">
                          {s.topic}
                        </span>
                        {s.assigned_petugas && (
                          <span className="text-[9px] text-gray-400 truncate">
                            • {s.assigned_petugas}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                        {s.last_message || "Belum ada pesan"}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Tidak ada antrian chat</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Belum ada warga yang menghubungi atau filter tidak sesuai</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE CHAT CONSOLE (Cols 7 or 8) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full bg-white dark:bg-[#1E293B]">
          {selectedSession ? (
            <>
              {/* Active Chat Header */}
              <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70 dark:bg-[#0F172A]/70 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-sm">
                    {selectedSession.citizen_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                        {selectedSession.citizen_name}
                      </h2>
                      <span className={clsx(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                        selectedSession.status === "active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : selectedSession.status === "waiting" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}>
                        {selectedSession.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Topik: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedSession.topic}</span>
                      {selectedSession.citizen_contact && (
                        <span> • Kontak: <strong className="text-gray-700 dark:text-gray-300">{selectedSession.citizen_contact}</strong></span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Header Action Controls */}
                <div className="flex items-center gap-2">
                  {!selectedSession.assigned_petugas || selectedSession.assigned_petugas !== currentUser?.name ? (
                    <button
                      type="button"
                      onClick={() => handleSessionAction('assign')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#1E3A8A] dark:text-[#93C5FD] border border-blue-200 dark:border-blue-900 text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Ambil Alih Chat
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2.5 py-1 rounded-lg">
                      Ditangani oleh Anda
                    </span>
                  )}

                  {selectedSession.status !== "closed" ? (
                    <button
                      type="button"
                      onClick={() => handleSessionAction('close')}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold hover:bg-rose-100 transition-colors"
                    >
                      Tandai Selesai
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSessionAction('reopen')}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
                    >
                      Buka Kembali
                    </button>
                  )}
                </div>
              </div>

              {/* Citizen Rating Review Banner if present */}
              {selectedSession.rating && (
                <div className="bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/80 px-5 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Penilaian Warga:</span>
                    <div className="flex text-amber-400">
                      {[...Array(selectedSession.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    {selectedSession.feedback && (
                      <span className="text-[11px] italic text-gray-600 dark:text-gray-300">
                        &quot;{selectedSession.feedback}&quot;
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/40 dark:bg-[#0B132B]/40" style={{ scrollbarWidth: 'thin' }}>
                {isLoadingMessages ? (
                  <div className="p-12 text-center">
                    <RefreshCw className="w-6 h-6 text-[#1E3A8A] animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Memuat percakapan...</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isPetugas = msg.sender_type === "petugas";
                    const isSystem = msg.sender_type === "system";

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-center font-medium">
                            {msg.message}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={clsx("flex flex-col", isPetugas ? "items-end" : "items-start")}
                      >
                        <span className="text-[10px] text-gray-400 mb-1 px-1 font-semibold">
                          {isPetugas ? `${msg.sender_name} (Anda)` : `${msg.sender_name} (Warga)`}
                        </span>
                        <div
                          className={clsx(
                            "max-w-[85%] sm:max-w-lg px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs",
                            isPetugas
                              ? "bg-[#1E3A8A] text-white rounded-tr-xs"
                              : "bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-tl-xs"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          <span className={clsx(
                            "text-[9px] block text-right mt-1 opacity-70",
                            isPetugas ? "text-blue-100" : "text-gray-400"
                          )}>
                            {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Template Quick Answers Dropdown */}
              <div className="px-4 py-2 bg-gray-50 dark:bg-[#0F172A] border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
                <span className="text-[11px] font-bold text-gray-400 shrink-0">Template Balasan Cepat:</span>
                {TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(tpl.text)}
                    className="text-[11px] bg-white dark:bg-[#1E293B] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              {/* Reply Input Bar */}
              <form
                onSubmit={handleSendReply}
                className="p-3 sm:p-4 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 shrink-0"
              >
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  placeholder="Tulis balasan resmi untuk warga di sini... (Tekan Enter untuk kirim)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder:text-gray-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all resize-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="px-5 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all disabled:opacity-40 shrink-0 shadow-md inline-flex items-center gap-1.5"
                >
                  {isSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">Pilih Percakapan Warga</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Pilih salah satu sesi dari antrian di sebelah kiri untuk melihat percakapan dan membalas konsultasi warga.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
