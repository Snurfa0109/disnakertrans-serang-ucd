"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, AlertCircle, Shield, ChevronDown } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Super Admin", email: "superadmin@disnakertrans.go.id", password: "SuperAdmin123!" },
  { role: "Admin Website", email: "website@disnakertrans.go.id", password: "Website123!" },
  { role: "Admin Sekretariat", email: "sekretariat@disnakertrans.go.id", password: "Sekretariat123!" },
  { role: "Admin Lattas", email: "lattas@disnakertrans.go.id", password: "Lattas123!" },
  { role: "Admin Binapenta", email: "binapenta@disnakertrans.go.id", password: "Binapenta123!" },
  { role: "Admin HI Jamsostek", email: "hijamsostek@disnakertrans.go.id", password: "HIJamsostek123!" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal");
        setIsLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setForm({ email: account.email, password: account.password });
    setShowDemo(false);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A192F] via-[#0F2645] to-[#1a365d] px-4 py-12">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#FBBF24]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 mb-5 shadow-xl">
            <Shield className="w-8 h-8 text-[#FBBF24]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Panel Admin</h1>
          <p className="text-white/50 text-sm">Disnakertrans Kabupaten Serang</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-white/30 outline-none focus:border-[#FBBF24]/50 focus:ring-1 focus:ring-[#FBBF24]/20 transition-all text-sm"
                  placeholder="email@disnakertrans.go.id"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-white/30 outline-none focus:border-[#FBBF24]/50 focus:ring-1 focus:ring-[#FBBF24]/20 transition-all text-sm"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-[#0A192F] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FBBF24]/10 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          {/* Demo credentials toggle */}
          <div className="mt-5 pt-5 border-t border-white/10">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="flex items-center justify-between w-full text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              <span>Demo Akun Tersedia</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDemo ? "rotate-180" : ""}`} />
            </button>
            {showDemo && (
              <div className="mt-3 space-y-1.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => fillDemo(acc)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <p className="text-xs font-semibold text-white/80">{acc.role}</p>
                    <p className="text-[10px] text-white/40">{acc.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          © 2026 Disnakertrans Kab. Serang — Akses terbatas untuk administrator
        </p>
      </div>
    </div>
  );
}
