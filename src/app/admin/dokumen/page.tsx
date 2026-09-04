"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  FolderOpen,
  Calendar,
  Layers,
} from "lucide-react";

interface Dokumen {
  id: number;
  title: string;
  category: string;
  description: string;
  file_url: string;
  file_size: string;
  date: string;
  sort_order: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

const CATEGORY_PRESETS = [
  "REGULASI & KEPUTUSAN",
  "EDARAN RESMI",
  "PANDUAN LAYANAN",
  "LAPORAN KINERJA",
  "SURVEI & KEPUASAN",
  "RENCANA KERJA",
  "PERJANJIAN KINERJA",
  "INDIKATOR KINERJA",
];

export default function AdminDokumenPage() {
  const [documents, setDocuments] = useState<Dokumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCount, setActiveCount] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentDoc, setCurrentDoc] = useState<Dokumen | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORY_PRESETS[0]);
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [sourceType, setSourceType] = useState<"upload" | "url">("upload");
  const [formFileUrl, setFormFileUrl] = useState("");
  const [formFileSize, setFormFileSize] = useState("PDF");
  const [formDate, setFormDate] = useState(new Date().getFullYear().toString());
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory && selectedCategory !== "ALL") params.set("category", selectedCategory);
      params.set("perPage", "100");

      const res = await fetch(`/api/admin/dokumen?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setDocuments(json.data || []);
        setCategories(json.meta?.categories || []);
        setActiveCount(json.meta?.activeCount || 0);
      }
    } catch (err) {
      console.error("Fetch dokumen error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const openAddModal = () => {
    setModalMode("add");
    setCurrentDoc(null);
    setFormTitle("");
    setFormCategory(CATEGORY_PRESETS[0]);
    setFormCustomCategory("");
    setFormDescription("");
    setSourceType("upload");
    setFormFileUrl("");
    setFormFileSize("PDF");
    setFormDate(new Date().getFullYear().toString());
    setFormSortOrder(documents.length + 1);
    setFormIsActive(true);
    setSelectedFile(null);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (doc: Dokumen) => {
    setModalMode("edit");
    setCurrentDoc(doc);
    setFormTitle(doc.title);
    if (CATEGORY_PRESETS.includes(doc.category)) {
      setFormCategory(doc.category);
      setFormCustomCategory("");
    } else {
      setFormCategory("CUSTOM");
      setFormCustomCategory(doc.category);
    }
    setFormDescription(doc.description || "");
    setSourceType(doc.file_url.startsWith("http") ? "url" : "upload");
    setFormFileUrl(doc.file_url);
    setFormFileSize(doc.file_size || "PDF");
    setFormDate(doc.date || new Date().getFullYear().toString());
    setFormSortOrder(doc.sort_order || 0);
    setFormIsActive(Boolean(doc.is_active));
    setSelectedFile(null);
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const finalCategory = formCategory === "CUSTOM" ? formCustomCategory.trim() : formCategory;

    if (!formTitle.trim()) {
      setErrorMessage("Judul dokumen wajib diisi");
      setSaving(false);
      return;
    }

    if (!finalCategory) {
      setErrorMessage("Kategori dokumen wajib dipilih");
      setSaving(false);
      return;
    }

    if (sourceType === "url" && !formFileUrl.trim()) {
      setErrorMessage("Tautan URL file wajib diisi");
      setSaving(false);
      return;
    }

    if (sourceType === "upload" && modalMode === "add" && !selectedFile) {
      setErrorMessage("Silakan pilih file PDF yang ingin diunggah");
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", formTitle.trim());
      formData.append("category", finalCategory);
      formData.append("description", formDescription.trim());
      formData.append("date", formDate.trim());
      formData.append("sort_order", formSortOrder.toString());
      formData.append("is_active", formIsActive ? "1" : "0");

      if (sourceType === "upload" && selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("file_url", formFileUrl.trim());
        formData.append("file_size", formFileSize.trim());
      }

      const url = modalMode === "add" ? "/api/admin/dokumen" : `/api/admin/dokumen/${currentDoc?.id}`;
      const method = modalMode === "add" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menyimpan dokumen");
      }

      setSuccessMessage(modalMode === "add" ? "Dokumen berhasil ditambahkan!" : "Dokumen berhasil diperbarui!");
      setIsModalOpen(false);
      fetchDocuments();
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan dokumen");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (doc: Dokumen) => {
    try {
      const res = await fetch(`/api/admin/dokumen/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: doc.is_active ? 0 : 1 }),
      });
      if (res.ok) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, is_active: d.is_active ? 0 : 1 } : d))
        );
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/dokumen/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setDeleteConfirmId(null);
        setSuccessMessage("Dokumen berhasil dihapus.");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Delete dokumen error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-[#93C5FD]">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              Kelola Dokumen & Regulasi Publik
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Tambah, edit, unggah berkas PDF resmi, dan kelola transparansi publik Disnakertrans.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Dokumen Baru
        </button>
      </div>

      {/* ── Notification Banners ── */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1E3A8A] dark:text-[#93C5FD]">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Dokumen</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{documents.length}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Dokumen Aktif</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Kategori</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{categories.length}</h3>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau keterangan..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#1E3A8A]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={fetchDocuments}
            title="Muat Ulang"
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Document Table ── */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-[#0F172A] border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5 w-14 text-center">Urut</th>
                <th className="px-5 py-3.5">Dokumen</th>
                <th className="px-5 py-3.5">Kategori</th>
                <th className="px-5 py-3.5">Tahun</th>
                <th className="px-5 py-3.5">Ukuran</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1E3A8A]" />
                    Memuat dokumen...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    Belum ada dokumen yang sesuai.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/70 dark:hover:bg-[#0F172A]/40 transition-colors">
                    <td className="px-5 py-4 text-center font-bold text-gray-400">{doc.sort_order}</td>
                    <td className="px-5 py-4 max-w-md">
                      <div className="font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                        {doc.title}
                      </div>
                      {doc.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{doc.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {doc.date}
                    </td>
                    <td className="px-5 py-4 text-gray-400 font-medium whitespace-nowrap">
                      {doc.file_size || "PDF"}
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(doc)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          doc.is_active
                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        }`}
                      >
                        {doc.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Buka Dokumen di Tab Baru"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => openEditModal(doc)}
                          title="Edit Dokumen"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(doc.id)}
                          title="Hapus Dokumen"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Add / Edit Dokumen ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto pt-20 sm:pt-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-[#0F172A]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A] dark:text-[#93C5FD]">
                  <FileText className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {modalMode === "add" ? "Tambah Dokumen & Regulasi" : "Edit Dokumen"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Judul Dokumen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Laporan Kinerja Instansi Pemerintah (LKIP) 2025"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Kategori Dokumen <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#1E3A8A]"
                  >
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Kategori Kustom / Lainnya</option>
                  </select>

                  {formCategory === "CUSTOM" && (
                    <input
                      type="text"
                      required
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      placeholder="Masukkan nama kategori..."
                      className="w-full mt-2 px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Tahun / Tanggal Terbit
                  </label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="Contoh: 2026 atau 1 Des 2025"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#1E3A8A]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Keterangan Singkat
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan singkat mengenai substansi atau isi dokumen resmi..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#1E3A8A]"
                />
              </div>

              {/* File Source: Upload File vs URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Sumber Berkas PDF <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setSourceType("upload")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      sourceType === "upload"
                        ? "bg-[#1E3A8A] text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType("url")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      sourceType === "url"
                        ? "bg-[#1E3A8A] text-white shadow-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Tautan URL Eksternal
                  </button>
                </div>

                {sourceType === "upload" ? (
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center bg-gray-50 dark:bg-[#0B1120]">
                    <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <label className="text-xs font-bold text-[#1E3A8A] dark:text-[#93C5FD] cursor-pointer hover:underline">
                      Pilih Berkas PDF dari Komputer
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setSelectedFile(file);
                          if (file) {
                            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                            setFormFileSize(file.size >= 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1">Maksimal 25MB (Format PDF)</p>
                    {selectedFile && (
                      <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ Terpilih: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </div>
                    )}
                    {modalMode === "edit" && formFileUrl && !selectedFile && (
                      <p className="mt-1 text-[11px] text-gray-500 truncate">Berkas saat ini: {formFileUrl}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={formFileUrl}
                      onChange={(e) => setFormFileUrl(e.target.value)}
                      placeholder="https://disnakertrans.serangkab.go.id/storage/media/dokumen.pdf"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#1E3A8A]"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-gray-400 font-semibold">Ukuran Label:</label>
                      <input
                        type="text"
                        value={formFileSize}
                        onChange={(e) => setFormFileSize(e.target.value)}
                        placeholder="Contoh: 1.5 MB atau PDF"
                        className="w-32 px-2.5 py-1 text-xs rounded-lg bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Order & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Semakin kecil, semakin di depan</p>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
                  />
                  <label htmlFor="formIsActive" className="text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer">
                    Publikasikan Dokumen Ini (Aktif)
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : modalMode === "add" ? "Simpan Dokumen" : "Perbarui Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">Hapus Dokumen?</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Dokumen ini akan dihapus dari portal publik dan tidak dapat dikembalikan.
            </p>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
