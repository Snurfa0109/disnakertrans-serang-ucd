"use client";

import { useEffect, useState, useRef } from "react";
import { Image as ImageIcon, Upload, Trash2, Search, X, Check, AlertCircle, FileText, Copy, Eye, Plus } from "lucide-react";

const CATEGORIES = ["Umum", "Berita", "Sambutan", "Dokumen", "Infografis", "Kegiatan"] as const;
const FILE_TYPES = ["Semua", "image", "pdf", "document"] as const;

interface MediaItem {
  id: number; filename: string; original_name: string;
  file_type: string; mime_type: string; size_bytes: number;
  category: string; url: string; created_at: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadCat, setUploadCat] = useState("Umum");
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const perPage = 24;

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3000);
  };

  const fetchMedia = async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
    if (typeFilter) params.set("fileType", typeFilter);
    if (catFilter) params.set("category", catFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/media?${params}`);
    const d = await res.json();
    setMedia(d.data || []);
    setTotal(d.meta?.total || 0);
    setIsLoading(false);
  };

  useEffect(() => { fetchMedia(); }, [page, typeFilter, catFilter]);
  useEffect(() => { const t = setTimeout(fetchMedia, 400); return () => clearTimeout(t); }, [search]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", uploadCat);
      try {
        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        if (res.ok) successCount++;
        else { const d = await res.json(); showToast("error", d.message || "Upload gagal"); }
      } catch { showToast("error", "Upload gagal"); }
    }
    if (successCount > 0) { showToast("success", `${successCount} file berhasil diupload`); fetchMedia(); }
    setUploading(false);
  };

  const handleDelete = async (m: MediaItem) => {
    if (!confirm(`Hapus file "${m.original_name}"?`)) return;
    const res = await fetch(`/api/admin/media/${m.id}`, { method: "DELETE" });
    if (res.ok) { showToast("success", "File dihapus"); fetchMedia(); if (preview?.id === m.id) setPreview(null); }
    else showToast("error", "Gagal menghapus");
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    showToast("success", "URL disalin ke clipboard");
  };

  const totalPages = Math.ceil(total / perPage);
  const imageCount = media.filter(m => m.file_type === "image").length;
  const pdfCount = media.filter(m => m.file_type === "pdf" || m.file_type === "document").length;

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
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2"><ImageIcon className="w-6 h-6 text-[#1E3A8A]" />Media Manager</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola gambar dan dokumen PDF untuk website.</p>
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#172554] transition-colors flex items-center gap-2 shadow-sm">
          <Upload className="w-4 h-4" />Upload File
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={e => handleUpload(e.target.files)} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"><p className="text-2xl font-extrabold text-gray-900">{total}</p><p className="text-xs text-gray-500">Total File</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm border-l-4 border-l-blue-400"><p className="text-2xl font-extrabold text-gray-900">{imageCount}</p><p className="text-xs text-blue-600 font-semibold">Gambar</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm border-l-4 border-l-rose-400"><p className="text-2xl font-extrabold text-gray-900">{pdfCount}</p><p className="text-xs text-rose-600 font-semibold">Dokumen</p></div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={e => { e.preventDefault(); setIsDragOver(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragOver ? "border-[#1E3A8A] bg-blue-50" : "border-gray-200 hover:border-[#1E3A8A]/40 hover:bg-gray-50"}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-600">Mengupload...</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-600">Drag & drop file ke sini, atau klik untuk browse</p>
            <p className="text-xs text-gray-400 mt-1">Gambar (JPG, PNG, WebP, GIF) dan PDF — maks. 10MB</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="text-xs text-gray-500">Kategori:</span>
              <select value={uploadCat} onChange={e => { e.stopPropagation(); setUploadCat(e.target.value); }}
                onClick={e => e.stopPropagation()}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#1E3A8A]/30">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Cari nama file..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none">
          <option value="">Semua Tipe</option>
          <option value="image">Gambar</option>
          <option value="pdf">PDF</option>
          <option value="document">Dokumen</option>
        </select>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-3 border-[#1E3A8A] border-t-transparent animate-spin" /></div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center text-gray-400 text-sm">
          <ImageIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          Belum ada media. Upload file untuk memulai.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {media.map(m => (
            <div key={m.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {m.file_type === "image" ? (
                <div className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer" onClick={() => setPreview(m)}>
                  <img src={m.url} alt={m.original_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center cursor-pointer" onClick={() => setPreview(m)}>
                  <FileText className="w-8 h-8 text-red-400" />
                  <span className="text-[10px] font-bold text-red-500 mt-1 uppercase">{m.mime_type.split('/')[1] || 'DOC'}</span>
                </div>
              )}
              <div className="p-2">
                <p className="text-[10px] font-medium text-gray-700 truncate" title={m.original_name}>{m.original_name}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{formatBytes(m.size_bytes)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <button onClick={() => copyUrl(m.url)} title="Salin URL" className="flex-1 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center justify-center gap-1">
                    <Copy className="w-3 h-3" />URL
                  </button>
                  <button onClick={() => handleDelete(m)} title="Hapus" className="p-1 text-red-400 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">← Sebelumnya</button>
          <span className="text-sm text-gray-500">Halaman {page} dari {totalPages} ({total} file)</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30">Selanjutnya →</button>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900 text-sm truncate max-w-sm">{preview.original_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatBytes(preview.size_bytes)} · {preview.category}</p>
              </div>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5">
              {preview.file_type === "image" ? (
                <img src={preview.url} alt={preview.original_name} className="w-full max-h-96 object-contain rounded-xl bg-gray-50" />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl">
                  <FileText className="w-16 h-16 text-red-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700">{preview.original_name}</p>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={() => copyUrl(preview.url)} className="flex-1 bg-[#1E3A8A] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#172554] flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" />Salin URL
                </button>
                <a href={preview.url} target="_blank" rel="noopener noreferrer" className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />Buka
                </a>
                <button onClick={() => handleDelete(preview)} className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />Hapus
                </button>
              </div>
              <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-[10px] text-gray-500 mb-1 font-semibold">URL:</p>
                <p className="text-xs font-mono text-gray-700 break-all">{typeof window !== "undefined" ? window.location.origin : ""}{preview.url}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
