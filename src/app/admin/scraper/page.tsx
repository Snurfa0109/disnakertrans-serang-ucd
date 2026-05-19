"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Clock, AlertCircle, CheckCircle2, Zap, Globe } from "lucide-react";

interface ScraperStatus {
  running: boolean;
  lastRunAt: string | null;
  lastResult: {
    newArticles: number;
    totalScraped: number;
    errors: string[];
  } | null;
  schedule: string;
}

export default function AdminScraperPage() {
  const [status, setStatus] = useState<ScraperStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [pages, setPages] = useState(3);
  const [result, setResult] = useState<{
    newArticles: number;
    totalScraped: number;
    errors: string[];
  } | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/scraper/status");
      const data = await res.json();
      setStatus(data.data || null);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleScrape = async () => {
    setScraping(true);
    setResult(null);
    try {
      const res = await fetch(`/api/scraper/run?pages=${pages}`, { method: "POST" });
      const data = await res.json();
      setResult(data.data || null);
      fetchStatus();
    } catch (error) {
      console.error(error);
    }
    setScraping(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Info Card */}
      <div className="bg-gradient-to-r from-[#0A192F] to-[#1E3A8A] rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="w-5 h-5 text-[#FBBF24]" />
          <span className="text-[#FBBF24] text-xs font-bold uppercase tracking-widest">News Scraper</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Tarik Berita Otomatis</h2>
        <p className="text-white/60 text-sm leading-relaxed">
          Mengambil berita dari{" "}
          <a
            href="https://disnakertrans.serangkab.go.id/berita"
            target="_blank"
            className="text-[#FBBF24] underline"
          >
            disnakertrans.serangkab.go.id
          </a>{" "}
          secara otomatis. Berita yang sudah ada tidak akan di-duplikasi.
        </p>
      </div>

      {/* Scheduler Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          Status Scheduler
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className="text-sm font-semibold flex items-center gap-2">
              {status?.running ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-700">Aktif</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-gray-600">Tidak aktif</span>
                </>
              )}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Jadwal</p>
            <p className="text-sm font-semibold text-gray-900">{status?.schedule || "-"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Terakhir Dijalankan</p>
            <p className="text-sm font-semibold text-gray-900">
              {status?.lastRunAt
                ? new Date(status.lastRunAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
                : "Belum pernah"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Hasil Terakhir</p>
            <p className="text-sm font-semibold text-gray-900">
              {status?.lastResult
                ? `${status.lastResult.newArticles} baru dari ${status.lastResult.totalScraped} artikel`
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Manual Trigger */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Jalankan Manual
        </h3>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Jumlah Halaman (1-18)
            </label>
            <input
              type="number"
              min={1}
              max={18}
              value={pages}
              onChange={(e) => setPages(Math.min(18, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1E3A8A]/30"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Semakin banyak halaman, semakin lama prosesnya (~2 detik/artikel)
            </p>
          </div>
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="bg-[#1E3A8A] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${scraping ? "animate-spin" : ""}`} />
            {scraping ? "Scraping..." : "Jalankan Sekarang"}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Hasil Scraping
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-green-700">{result.newArticles}</p>
              <p className="text-xs text-green-600 font-medium">Berita Baru</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-blue-700">{result.totalScraped}</p>
              <p className="text-xs text-blue-600 font-medium">Total Dipindai</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {result.errors.length} Error
              </p>
              <ul className="text-xs text-red-500 space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="truncate">• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
