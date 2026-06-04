"use client";

import { useEffect, useState } from "react";
import { Bot, MessageSquare, AlertTriangle, TrendingUp, RefreshCw, ChevronDown, ChevronUp, Calendar } from "lucide-react";

interface ChatbotOverview {
  totalSessions: number; totalMessages: number; totalFallbacks: number;
  avgMessagesPerSession: number; fallbackRate: number;
}

interface TopQuery { last_query: string; count: number; }
interface DailyTrend { date: string; sessions: number; fallbacks: number; }
interface RecentConversation { id: number; session_id: string; messages: string; message_count: number; fallback_count: number; last_query: string; created_at: string; updated_at: string; }

export default function AdminChatbotPage() {
  const [overview, setOverview] = useState<ChatbotOverview | null>(null);
  const [topQueries, setTopQueries] = useState<TopQuery[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [recentConvos, setRecentConvos] = useState<RecentConversation[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/chatbot?days=${days}&page=${pagination.page}`);
      const d = await res.json();
      if (d.data) {
        setOverview(d.data.overview);
        setTopQueries(d.data.topQueries || []);
        setDailyTrend(d.data.dailyTrend || []);
        setRecentConvos(d.data.recentConversations || []);
        setPagination(d.data.pagination || { total: 0, page: 1, totalPages: 1 });
      }
    } catch { /* ignore */ }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [days, pagination.page]);

  const parseMessages = (s: string) => { try { return JSON.parse(s); } catch { return []; } };

  const MiniBarChart = ({ data }: { data: DailyTrend[] }) => {
    if (data.length === 0) return <p className="text-xs text-gray-400 text-center py-8">Belum ada data</p>;
    const max = Math.max(...data.map(d => d.sessions), 1);
    return (
      <div className="flex items-end gap-1 h-24">
        {data.slice(-14).map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {d.date}: {d.sessions} sesi
            </div>
            <div className="w-full bg-[#1E3A8A]/20 rounded-sm transition-all hover:bg-[#1E3A8A]/40" style={{ height: `${(d.sessions / max) * 80}px`, minHeight: 2 }} />
          </div>
        ))}
      </div>
    );
  };

  const overviewCards = overview ? [
    { label: "Total Sesi", value: overview.totalSessions, icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
    { label: "Total Pesan", value: overview.totalMessages, icon: MessageSquare, color: "text-green-600 bg-green-50" },
    { label: "Total Fallback", value: overview.totalFallbacks, icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
    { label: "Rata-rata Pesan/Sesi", value: overview.avgMessagesPerSession, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { label: "Fallback Rate", value: `${overview.fallbackRate}%`, icon: AlertTriangle, color: overview.fallbackRate > 30 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2"><Bot className="w-6 h-6 text-[#1E3A8A]" />Chatbot Monitoring</h2>
          <p className="text-sm text-gray-500 mt-1">Pantau performa dan percakapan chatbot website.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#1E3A8A]/30">
            <option value={7}>7 Hari</option>
            <option value={30}>30 Hari</option>
            <option value={90}>90 Hari</option>
          </select>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {overviewCards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Trend Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Tren Sesi Harian</h3>
          <p className="text-xs text-gray-400 mb-4">{days} hari terakhir (14 hari terakhir ditampilkan)</p>
          {isLoading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-3 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <MiniBarChart data={dailyTrend} />
          )}
          {dailyTrend.length > 0 && (
            <div className="flex justify-between text-[10px] text-gray-400 mt-2">
              <span>{dailyTrend[Math.max(0, dailyTrend.length - 14)]?.date}</span>
              <span>{dailyTrend[dailyTrend.length - 1]?.date}</span>
            </div>
          )}
        </div>

        {/* Top Queries */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Pertanyaan Terpopuler</h3>
          {isLoading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-3 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" /></div>
          ) : topQueries.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Belum ada data pertanyaan</p>
          ) : (
            <div className="space-y-2.5">
              {topQueries.map((q, i) => {
                const max = topQueries[0]?.count || 1;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium flex items-center gap-1.5">
                        <span className="w-4 h-4 bg-gray-100 rounded text-[10px] font-bold text-gray-500 flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="truncate max-w-[220px]" title={q.last_query}>{q.last_query}</span>
                      </span>
                      <span className="text-gray-500 shrink-0 ml-2">{q.count}x</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1E3A8A] rounded-full transition-all" style={{ width: `${(q.count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Percakapan Terbaru</h3>
          <span className="text-xs text-gray-500">{pagination.total} total sesi</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-3 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" /></div>
        ) : recentConvos.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <Bot className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            Belum ada percakapan chatbot.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentConvos.map(c => {
              const isExpanded = expandedId === c.id;
              const messages = parseMessages(c.messages);
              return (
                <div key={c.id}>
                  <div className="px-5 py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                    <div className="w-9 h-9 bg-[#1E3A8A]/10 rounded-xl flex items-center justify-center shrink-0">
                      <Bot className="w-4.5 h-4.5 text-[#1E3A8A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[10px] font-mono text-gray-400">{c.session_id.substring(0, 12)}...</span>
                        {c.fallback_count > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />{c.fallback_count} fallback
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{c.last_query || "Tanpa pesan"}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                        <span>{c.message_count} pesan</span>
                        <span>{new Date(c.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </div>

                  {isExpanded && messages.length > 0 && (
                    <div className="px-5 pb-4 ml-0">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 max-h-60 overflow-y-auto">
                        {messages.map((msg: any, idx: number) => (
                          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${msg.role === "user" ? "bg-[#1E3A8A] text-white" : "bg-white border border-gray-200 text-gray-700"}`}>
                              {msg.content || msg.text || String(msg)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">← Sebelumnya</button>
            <span className="text-sm text-gray-500">Halaman {pagination.page} dari {pagination.totalPages}</span>
            <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page === pagination.totalPages} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">Selanjutnya →</button>
          </div>
        )}
      </div>
    </div>
  );
}
