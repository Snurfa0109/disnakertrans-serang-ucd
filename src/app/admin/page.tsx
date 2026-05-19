"use client";

import { useEffect, useState } from "react";
import { Newspaper, MessageSquareWarning, Clock, CheckCircle2, TrendingUp } from "lucide-react";

interface Stats {
  newsTotal: number;
  complaintsTotal: number;
  complaintsPending: number;
  complaintsProcessed: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [newsRes, complaintRes] = await Promise.all([
          fetch("/api/news?perPage=1"),
          fetch("/api/complaints/stats"),
        ]);
        const newsData = await newsRes.json();
        const complaintData = await complaintRes.json();

        setStats({
          newsTotal: newsData.meta?.total || 0,
          complaintsTotal: complaintData.data?.total || 0,
          complaintsPending: complaintData.data?.pending || 0,
          complaintsProcessed: complaintData.data?.processed || 0,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
      setIsLoading(false);
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" />
      </div>
    );
  }

  const cards = [
    {
      label: "Total Berita",
      value: stats?.newsTotal || 0,
      icon: Newspaper,
      color: "bg-blue-50 text-blue-600",
      accent: "border-l-blue-500",
    },
    {
      label: "Total Pengaduan",
      value: stats?.complaintsTotal || 0,
      icon: MessageSquareWarning,
      color: "bg-purple-50 text-purple-600",
      accent: "border-l-purple-500",
    },
    {
      label: "Menunggu Proses",
      value: stats?.complaintsPending || 0,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      accent: "border-l-amber-500",
    },
    {
      label: "Sudah Diproses",
      value: stats?.complaintsProcessed || 0,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
      accent: "border-l-green-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#0A192F] to-[#1E3A8A] rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-[#FBBF24]" />
          <span className="text-[#FBBF24] text-xs font-bold uppercase tracking-widest">Overview</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Selamat Datang, Admin</h2>
        <p className="text-white/60 text-sm">
          Kelola berita, pengaduan, dan data informasi publik website Disnakertrans Kab. Serang.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6 border-l-4 ${card.accent} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-1">{card.value}</h3>
            <p className="text-xs font-medium text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
