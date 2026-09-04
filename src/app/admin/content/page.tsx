"use client";

import { useEffect, useState } from "react";
import { Layout, Save, Check, AlertCircle, Globe, Phone, Mail, MapPin, Clock, Link2, ExternalLink, ChevronDown } from "lucide-react";

interface ContentItem { id: number; key: string; label: string; value: string; type: string; section: string; }

const SECTION_META: Record<string, { label: string; icon: React.ComponentType<{className?: string}>; color: string }> = {
  hero:     { label: "Hero Banner",           icon: Globe,      color: "text-blue-600 bg-blue-50" },
  sambutan: { label: "Sambutan Kepala Dinas", icon: Globe,      color: "text-purple-600 bg-purple-50" },
  profil:   { label: "Profil Instansi",       icon: Globe,      color: "text-green-600 bg-green-50" },
  contact:  { label: "Info Kontak",           icon: Phone,      color: "text-amber-600 bg-amber-50" },
  social:   { label: "Media Sosial",          icon: Link2,      color: "text-rose-600 bg-rose-50" },
  portals:  { label: "Portal Eksternal",      icon: ExternalLink, color: "text-cyan-600 bg-cyan-50" },
};

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ hero: true, sambutan: true, contact: true });

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/admin/content")
      .then(r => r.json())
      .then(d => { setContent(Array.isArray(d.data) ? d.data : []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const getValue = (key: string) => edited[key] ?? content.find(c => c.key === key)?.value ?? "";
  const handleChange = (key: string, val: string) => setEdited(prev => ({ ...prev, [key]: val }));
  const hasChanges = Object.keys(edited).length > 0;

  const handleSave = async () => {
    setSaving(true);
    const items = Object.entries(edited).map(([key, value]) => ({ key, value }));
    try {
      const res = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      if (res.ok) {
        // Merge edits into local state
        setContent(prev => prev.map(c => edited[c.key] !== undefined ? { ...c, value: edited[c.key] } : c));
        setEdited({});
        showToast("success", "Konten berhasil disimpan");
      } else showToast("error", "Gagal menyimpan");
    } catch { showToast("error", "Terjadi kesalahan"); }
    setSaving(false);
  };

  const handleReset = () => setEdited({});

  // Group by section
  const sections = Object.keys(SECTION_META);
  const grouped = sections.reduce<Record<string, ContentItem[]>>((acc, s) => {
    acc[s] = content.filter(c => c.section === s);
    return acc;
  }, {});

  const renderField = (item: ContentItem) => {
    const val = getValue(item.key);
    const isDirty = edited[item.key] !== undefined;
    const baseClass = `w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${isDirty ? "border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/30" : "border-gray-200 focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10"}`;

    if (item.type === "textarea") {
      return <textarea rows={3} value={val} onChange={e => handleChange(item.key, e.target.value)} className={`${baseClass} resize-none`} />;
    }
    if (item.type === "image") {
      return (
        <div className="space-y-2">
          <input type="text" value={val} onChange={e => handleChange(item.key, e.target.value)} className={baseClass} placeholder="URL gambar atau /uploads/..." />
          {val && <img src={val} alt="" className="h-20 rounded-lg object-cover border border-gray-200" onError={e => (e.currentTarget.style.display = "none")} />}
        </div>
      );
    }
    if (item.type === "url") {
      return <input type="url" value={val} onChange={e => handleChange(item.key, e.target.value)} className={baseClass} placeholder="https://..." />;
    }
    return <input type="text" value={val} onChange={e => handleChange(item.key, e.target.value)} className={baseClass} />;
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2"><Layout className="w-6 h-6 text-[#1E3A8A]" />Konten Website</h2>
          <p className="text-sm text-gray-500 mt-1">Edit konten halaman publik tanpa mengubah source code.</p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <button onClick={handleReset} className="px-4 py-2.5 text-gray-600 font-semibold text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Reset
            </button>
          )}
          <button onClick={handleSave} disabled={saving || !hasChanges}
            className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm">
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : hasChanges ? `Simpan (${Object.keys(edited).length} perubahan)` : "Simpan"}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Ada <strong>{Object.keys(edited).length} field</strong> yang belum disimpan. Klik "Simpan" untuk menerapkan perubahan.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {sections.map(sectionKey => {
            const items = grouped[sectionKey] || [];
            if (items.length === 0) return null;
            const meta = SECTION_META[sectionKey];
            const Icon = meta.icon;
            const isExpanded = expanded[sectionKey] !== false;
            const dirtyCount = items.filter(i => edited[i.key] !== undefined).length;

            return (
              <div key={sectionKey} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [sectionKey]: !isExpanded }))}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 text-sm">{meta.label}</p>
                      <p className="text-xs text-gray-400">{items.length} field{dirtyCount > 0 && <span className="ml-2 text-amber-600 font-semibold">• {dirtyCount} diubah</span>}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.key}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <label className="block text-xs font-semibold text-gray-700">{item.label}</label>
                            {edited[item.key] !== undefined && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-md">Diubah</span>
                            )}
                          </div>
                          {renderField(item)}
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
    </div>
  );
}
