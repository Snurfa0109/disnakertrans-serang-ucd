"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

type Message = {
    id: number;
    role: "bot" | "user";
    text: string;
};

const initialMessages: Message[] = [
    {
        id: 1,
        role: "bot",
        text: "Halo! 👋 Saya asisten virtual Disnakertrans Kab. Serang. Ada yang bisa saya bantu?",
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
    const msg = userMessage.toLowerCase();

    if (msg.includes("ak-1") || msg.includes("ak1") || msg.includes("kartu kuning")) {
        return "Untuk membuat Kartu AK-1 secara online:\n\n1️⃣ Kunjungi https://bahagia.serangkab.go.id/home atau install aplikasi Serang Bahagia\n2️⃣ Buat akun dengan email aktif\n3️⃣ Pilih menu 'Kartu AK.1' pada layanan tenaga kerja\n4️⃣ Isi dan unggah data dengan lengkap, lalu kirim\n5️⃣ Petugas akan memverifikasi dan ditandatangani secara elektronik\n6️⃣ Kartu AK-1 dapat diunduh dalam format PDF\n\nPersyaratan: KTP Kab. Serang & Ijazah pendidikan terakhir.";
    }

    if (msg.includes("jam") || msg.includes("operasional") || msg.includes("buka")) {
        return "Jam operasional Disnakertrans Kab. Serang:\n\n🕐 Senin - Kamis: 08:00 - 16:00 WIB\n🕐 Jumat: 08:00 - 16:30 WIB\n🕐 Sabtu & Minggu: Tutup\n\nLayanan online tersedia 24 jam melalui website ini.";
    }

    if (msg.includes("alamat") || msg.includes("lokasi") || msg.includes("kantor") || msg.includes("dimana")) {
        return "📍 Alamat kantor kami:\n\nJl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kabupaten Serang, Banten\n\n📞 Telp: (0254) 200234\n📧 Email: disnakertrans@serangkab.go.id\n\n🗺️ Lihat di Google Maps:\nhttps://maps.app.goo.gl/wTa7unGsbCJjCZdb8";
    }

    if (msg.includes("lowongan") || msg.includes("kerja") || msg.includes("karir")) {
        return "Untuk informasi lowongan kerja, Anda bisa mengakses:\n\n🔗 KarirHub Kemnaker: https://karirhub.kemnaker.go.id/\n\nPlatform ini menghubungkan pencari kerja dengan perusahaan terpercaya di seluruh Indonesia. Anda bisa mendaftar dan membuat profil pencari kerja secara gratis.";
    }

    if (msg.includes("pengaduan") || msg.includes("aduan") || msg.includes("lapor") || msg.includes("keluhan")) {
        return "Untuk menyampaikan pengaduan:\n\n1️⃣ Kunjungi halaman 'Layanan Aspirasi' di menu navigasi\n2️⃣ Isi formulir pengaduan dengan data lengkap\n3️⃣ Pengaduan akan dikirim ke email resmi Disnakertrans\n4️⃣ Balasan akan dikirim ke email Anda dalam 3x24 jam\n\nAnda juga bisa langsung mengirim email ke:\n📧 disnakertrans@serangkab.go.id";
    }

    if (msg.includes("oss") || msg.includes("perizinan") || msg.includes("izin usaha")) {
        return "Untuk perizinan berusaha, silakan akses OSS (Online Single Submission):\n\n🔗 https://oss.go.id/id\n\nOSS RBA adalah sistem perizinan berusaha berbasis risiko yang terintegrasi secara nasional.";
    }

    if (msg.includes("e-sakip") || msg.includes("esakip") || msg.includes("sakip")) {
        return "E-SAKIP adalah Sistem Akuntabilitas Kinerja Instansi Pemerintah.\n\n🔗 Akses: https://e-sakip.serangkab.go.id/\n\nSistem ini digunakan untuk memantau kinerja dan transparansi birokrasi di Kabupaten Serang.";
    }

    if (msg.includes("pelatihan") || msg.includes("blk") || msg.includes("sertifikasi")) {
        return "Informasi pelatihan kerja tersedia melalui Bidang Pelatihan dan Produktivitas Tenaga Kerja (LATTAS) kami.\n\nUntuk pendaftaran dan jadwal pelatihan terbaru, silakan hubungi kantor kami atau kunjungi halaman Informasi Publik di website ini.";
    }

    if (msg.includes("terima kasih") || msg.includes("makasih") || msg.includes("thanks")) {
        return "Sama-sama! 😊 Senang bisa membantu. Jika ada pertanyaan lain, jangan ragu untuk bertanya kembali.";
    }

    if (msg.includes("halo") || msg.includes("hi") || msg.includes("hai") || msg.includes("selamat")) {
        return "Halo! 😊 Selamat datang. Ada yang bisa saya bantu terkait layanan ketenagakerjaan?";
    }

    return "Terima kasih atas pertanyaan Anda. Untuk informasi lebih detail, silakan:\n\n📧 Email: disnakertrans@serangkab.go.id\n📞 Telp: (0254) 200234\n📍 Kunjungi kantor kami di Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kabupaten Serang, Banten\n\nAtau sampaikan pertanyaan Anda dengan kata kunci seperti: 'AK-1', 'lowongan kerja', 'pengaduan', 'alamat kantor', atau 'jam operasional'.";
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
            const botReply: Message = {
                id: Date.now() + 1,
                role: "bot",
                text: getBotReply(text),
            };
            setMessages((prev) => [...prev, botReply]);
            setIsTyping(false);
        }, 800 + Math.random() * 600);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#0A192F] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#1E3A8A] transition-colors group"
                        aria-label="Open chatbot"
                    >
                        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FBBF24] rounded-full animate-pulse border-2 border-white" />
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
                        className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
                        style={{ height: "520px" }}
                    >
                        {/* Header */}
                        <div className="bg-[#0A192F] px-5 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#FBBF24] rounded-full flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-[#0A192F]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm leading-tight">Asisten Disnakertrans</h4>
                                    <p className="text-white/60 text-[10px]">Online • Siap membantu</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/70 hover:text-white transition-colors"
                                aria-label="Close chatbot"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/80 dark:bg-[#0F172A]">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                                        msg.role === "bot"
                                            ? "bg-[#0A192F] text-[#FBBF24]"
                                            : "bg-[#E2E8F0] text-gray-600"
                                    }`}>
                                        {msg.role === "bot" ? (
                                            <Bot className="w-3.5 h-3.5" />
                                        ) : (
                                            <User className="w-3.5 h-3.5" />
                                        )}
                                    </div>
                                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                                        msg.role === "bot"
                                            ? "bg-white dark:bg-[#1E293B] text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-md"
                                            : "bg-[#0A192F] text-white rounded-tr-md"
                                    }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-2"
                                >
                                    <div className="w-7 h-7 rounded-full bg-[#0A192F] text-[#FBBF24] flex items-center justify-center shrink-0 mt-1">
                                        <Bot className="w-3.5 h-3.5" />
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
