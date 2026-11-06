"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, VolumeX, Eye, ZoomIn, ZoomOut, RotateCcw,
  Play, Pause, Square, Sparkles, Check, X, Sliders, ChevronUp, ChevronDown
} from "lucide-react";

type FontScale = "normal" | "large" | "extra-large";

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [supportedSpeech, setSupportedSpeech] = useState(true);
  const [statusNotice, setStatusNotice] = useState<string>("");

  // Check speech synthesis support and load preferences from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
      setSupportedSpeech(false);
    }

    try {
      const savedScale = localStorage.getItem("disnaker_font_scale") as FontScale;
      if (savedScale && ["normal", "large", "extra-large"].includes(savedScale)) {
        applyFontScale(savedScale);
      }

      const savedContrast = localStorage.getItem("disnaker_high_contrast") === "true";
      if (savedContrast) {
        setHighContrast(true);
        document.documentElement.classList.add("high-contrast");
      }
    } catch {}

    // Listen for custom trigger events from Navbar / Header
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("toggle-accessibility-modal", handleToggle);
    window.addEventListener("open-accessibility-modal", handleOpen);

    // Cleanup speech and listeners on unmount
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      window.removeEventListener("toggle-accessibility-modal", handleToggle);
      window.removeEventListener("open-accessibility-modal", handleOpen);
    };
  }, []);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(""), 3500);
  };

  const applyFontScale = (scale: FontScale) => {
    setFontScale(scale);
    try {
      localStorage.setItem("disnaker_font_scale", scale);
    } catch {}

    if (scale === "normal") {
      document.documentElement.style.fontSize = "16px";
    } else if (scale === "large") {
      document.documentElement.style.fontSize = "18.5px";
    } else if (scale === "extra-large") {
      document.documentElement.style.fontSize = "21px";
    }
  };

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    try {
      localStorage.setItem("disnaker_high_contrast", String(next));
    } catch {}

    if (next) {
      document.documentElement.classList.add("high-contrast");
      showNotice("Mode Kontras Tinggi Diaktifkan");
    } else {
      document.documentElement.classList.remove("high-contrast");
      showNotice("Mode Kontras Standar");
    }
  };

  const resetSettings = () => {
    applyFontScale("normal");
    setHighContrast(false);
    document.documentElement.classList.remove("high-contrast");
    stopSpeaking();
    try {
      localStorage.removeItem("disnaker_font_scale");
      localStorage.removeItem("disnaker_high_contrast");
    } catch {}
    showNotice("Pengaturan aksesibilitas dikembalikan ke default");
  };

  // Text-to-Speech logic
  const getReadableText = (): string => {
    // 1. If user selected any text on screen, read that
    const selection = window.getSelection()?.toString().trim();
    if (selection) return selection;

    // 2. Otherwise extract readable text from main content
    const main = document.querySelector("main") || document.body;
    const headings = Array.from(main.querySelectorAll("h1, h2, h3, p"))
      .map((el) => (el as HTMLElement).innerText?.trim())
      .filter((t) => t && t.length > 10 && !t.includes("©") && !t.includes("All rights reserved"))
      .slice(0, 15);

    return headings.join(". ");
  };

  const speakText = () => {
    if (!supportedSpeech || typeof window === "undefined") return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();

    const textToRead = getReadableText();
    if (!textToRead) {
      showNotice("Tidak ada teks yang dapat dibacakan.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "id-ID";
    utterance.rate = speechRate;

    // Pick Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(
      (v) => v.lang === "id-ID" || v.lang.startsWith("id") || v.name.toLowerCase().includes("indonesia")
    );
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      showNotice("Sedang membacakan konten halaman...");
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return (
    <>
      {/* FLOATING ACCESSIBILITY BUTTON (Tepat di Atas Chatbot Kang SATRIA: bottom-[84px] right-5) */}
      <motion.button
        type="button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[84px] right-5 sm:bottom-[88px] sm:right-5 z-40 flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-2xl sm:rounded-full text-white shadow-xl border border-white/25 hover:border-yellow-400/80 transition-all cursor-pointer group bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] focus:outline-hidden focus:ring-2 focus:ring-yellow-400 print:hidden"
        style={{
          boxShadow: "0 6px 20px rgba(30, 58, 138, 0.45), 0 2px 6px rgba(0,0,0,0.25)"
        }}
        title="Alat Aksesibilitas Web (Ukuran Huruf, Kontras, Pembaca Suara)"
        aria-label="Buka Alat Aksesibilitas Web"
      >
        <span className="text-xl sm:text-2xl leading-none select-none group-hover:scale-110 transition-transform">
          ♿
        </span>

        {/* Hover Tooltip (Desktop) */}
        <span className="absolute right-full mr-2.5 px-2.5 py-1 bg-[#0A192F] text-white text-[11px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md border border-white/10 hidden sm:inline-block">
          Aksesibilitas
        </span>
      </motion.button>

      {/* ACCESSIBILITY MODAL DIALOG */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs print:hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white rounded-3xl max-w-sm sm:max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E3A8A] to-blue-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm">
                    ♿
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base leading-tight">Aksesibilitas Web</h3>
                    <p className="text-[10px] text-blue-200">Sesuaikan tampilan & kenyamanan membaca Anda</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Notice Bar */}
              {statusNotice && (
                <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-800 dark:text-amber-300 text-center animate-fade-in">
                  {statusNotice}
                </div>
              )}

              {/* Tool Controls */}
              <div className="p-5 space-y-5 text-xs">
                {/* 1. Pengaturan Ukuran Teks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#93C5FD]" />
                      Ukuran Teks / Huruf
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {fontScale === "normal" ? "100%" : fontScale === "large" ? "115%" : "130%"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => applyFontScale("normal")}
                      className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                        fontScale === "normal"
                          ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      A Standar
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFontScale("large")}
                      className={`py-2 px-3 rounded-xl border text-center font-extrabold transition-all text-sm ${
                        fontScale === "large"
                          ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      A+ Besar
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFontScale("extra-large")}
                      className={`py-2 px-3 rounded-xl border text-center font-black transition-all text-base ${
                        fontScale === "extra-large"
                          ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      A++ Ekstra
                    </button>
                  </div>
                </div>

                {/* 2. Mode Kontras Tinggi (High Contrast) */}
                <div className="space-y-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#93C5FD]" />
                    Peningkatan Kontras Visual
                  </span>
                  <button
                    type="button"
                    onClick={toggleHighContrast}
                    className={`w-full py-2.5 px-3 rounded-xl border text-center font-bold transition-all flex items-center justify-between ${
                      highContrast
                        ? "bg-black text-yellow-300 border-yellow-400 ring-2 ring-yellow-400/40"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>Mode Kontras Tinggi</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                        highContrast ? "bg-yellow-400 text-black border-yellow-400" : "border-gray-400"
                      }`}
                    >
                      {highContrast ? "✓" : ""}
                    </span>
                  </button>
                </div>

                {/* 3. Text-to-Speech (Pembaca Suara Bahasa Indonesia) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#93C5FD]" />
                      Dengarkan Halaman Ini (Audio)
                    </span>
                    {isSpeaking && (
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 animate-pulse">
                        ● Sedang Membaca
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2.5">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      Dengarkan isi website secara otomatis, atau pilih kalimat tertentu yang ingin dibacakan.
                    </p>

                    <div className="flex items-center gap-2">
                      {!isSpeaking ? (
                        <button
                          type="button"
                          onClick={speakText}
                          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isPaused ? "Lanjutkan Baca" : "Mulai Membaca"}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={pauseSpeaking}
                          className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Pause className="w-3 h-3 fill-current" />
                          <span>Jeda Suara</span>
                        </button>
                      )}

                      {(isSpeaking || isPaused) && (
                        <button
                          type="button"
                          onClick={stopSpeaking}
                          className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors"
                          title="Hentikan Pembacaan"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          <span>Berhenti</span>
                        </button>
                      )}
                    </div>

                    {/* Kecepatan Suara */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-700 text-[10px]">
                      <span className="text-gray-500">Kecepatan:</span>
                      <div className="flex items-center gap-1 font-mono">
                        {[0.8, 1.0, 1.2].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              setSpeechRate(rate);
                              if (isSpeaking) {
                                stopSpeaking();
                                setTimeout(speakText, 100);
                              }
                            }}
                            className={`px-2 py-0.5 rounded ${
                              speechRate === rate
                                ? "bg-[#1E3A8A] text-white font-bold"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset button */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resetSettings}
                    className="text-[11px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Kembalikan Default</span>
                  </button>

                  <span className="text-[10px] text-gray-400">
                    Disnakertrans Inklusif
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
