"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Volume2, ShieldCheck, HelpCircle } from "lucide-react";

interface VisualCaptchaProps {
  onVerify: (value: string, token: string) => void;
  resetSignal?: number;
}

// Chars excluding ambiguous ones (no 0/O, 1/l/I)
const CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";

// Simple client-server hash helper for verification
export function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export default function VisualCaptcha({ onVerify, resetSignal }: VisualCaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Generate random 6-character code
  const generateNewCode = useCallback(() => {
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
    }
    return result;
  }, []);

  // Draw security canvas with distortion, lines, and noise
  const drawCaptcha = useCallback((currentCode: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Background with subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#F8FAFC");
    gradient.addColorStop(0.5, "#EEF2F6");
    gradient.addColorStop(1, "#E2E8F0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Random background noise dots
    for (let i = 0; i < 70; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2 + 0.5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(
        Math.random() * 150
      )}, ${Math.floor(Math.random() * 150)}, ${Math.random() * 0.4 + 0.15})`;
      ctx.fill();
    }

    // 3. Curved strike-through Bezier lines
    const lineColors = ["#94A3B8", "#64748B", "#CBD5E1", "#3B82F6", "#F59E0B"];
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 20, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width * 0.4,
        Math.random() * height,
        Math.random() * width * 0.7,
        Math.random() * height,
        width - Math.random() * 20,
        Math.random() * height
      );
      ctx.strokeStyle = lineColors[i % lineColors.length];
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.stroke();
    }

    // 4. Render distorted characters
    const textColors = [
      "#0A192F",
      "#1E3A8A",
      "#9A3412",
      "#065F46",
      "#5B21B6",
      "#9F1239",
      "#1E293B",
    ];

    const fonts = ["bold 26px sans-serif", "bold 28px monospace", "bold 26px serif", "bold 27px system-ui"];
    const charSpacing = (width - 40) / currentCode.length;

    for (let i = 0; i < currentCode.length; i++) {
      const char = currentCode[i];
      ctx.save();

      const x = 20 + i * charSpacing + Math.random() * 4 - 2;
      const y = height / 2 + Math.random() * 8 - 4;
      const angle = ((Math.random() * 40 - 20) * Math.PI) / 180;

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font = fonts[Math.floor(Math.random() * fonts.length)];
      ctx.fillStyle = textColors[Math.floor(Math.random() * textColors.length)];
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shadow for 3D depth
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // 5. Grid overlay dots for anti-OCR pattern
    ctx.strokeStyle = "rgba(100, 116, 139, 0.15)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }, []);

  const onVerifyRef = useRef(onVerify);
  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  // Refresh captcha
  const refresh = useCallback(() => {
    setIsRotating(true);
    const newCode = generateNewCode();
    setCode(newCode);
    setUserInput("");
    drawCaptcha(newCode);

    // Create verification token
    const token = btoa(
      JSON.stringify({
        h: simpleHash(newCode.toLowerCase()),
        t: Date.now(),
      })
    );
    onVerifyRef.current("", token);

    setTimeout(() => setIsRotating(false), 500);
  }, [generateNewCode, drawCaptcha]);

  // Initial draw once on mount
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset when signal changes
  useEffect(() => {
    if (resetSignal !== undefined && resetSignal > 0) {
      refresh();
    }
  }, [resetSignal, refresh]);

  // Handle user typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);

    const token = btoa(
      JSON.stringify({
        h: simpleHash(code.toLowerCase()),
        t: Date.now(),
      })
    );
    onVerify(val, token);
  };

  // Text-to-speech audio reader
  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setIsSpeaking(true);

    const characters = code.split("").join(", ");
    const utterance = new SpeechSynthesisUtterance(
      `Kode keamanan adalah: ${characters}`
    );
    utterance.lang = "id-ID";
    utterance.rate = 0.85;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-3">
      {/* Visual Canvas Box */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-inner bg-white select-none">
          <canvas
            ref={canvasRef}
            width={210}
            height={56}
            className="block cursor-pointer"
            onClick={refresh}
            title="Klik untuk ganti gambar kode"
          />
        </div>

        {/* Action buttons (Refresh & Audio) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={refresh}
            title="Acak Ulang Kode CAPTCHA"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRotating ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={handleSpeak}
            disabled={isSpeaking}
            title="Dengarkan Suara Kode (Audio)"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? "text-amber-500 animate-pulse" : ""}`} />
          </button>
        </div>
      </div>

      {/* Input box */}
      <div className="flex items-center gap-3">
        <div className="relative w-48">
          <input
            type="text"
            required
            maxLength={6}
            value={userInput}
            onChange={handleInputChange}
            placeholder="Ketik 6 kode"
            className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-center font-mono font-bold tracking-widest text-base uppercase text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all"
          />
        </div>
        <span className="text-[11px] text-gray-400">
          (Huruf besar / kecil tidak dibedakan)
        </span>
      </div>
    </div>
  );
}
