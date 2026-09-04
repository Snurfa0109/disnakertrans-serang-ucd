"use client";

import React, { useState } from 'react';
import { FileText, Download, Eye, X, ExternalLink, ArrowRight, CheckCircle2, ChevronRight, FileCheck, BookOpen, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Link from 'next/link';

export interface DokumenItem {
  id: number;
  title: string;
  category: string;
  description: string;
  file_url: string;
  file_size?: string;
  date: string;
}

interface DokumenPublikSectionProps {
  documents: DokumenItem[];
}

export default function DokumenPublikSection({ documents }: DokumenPublikSectionProps) {
  const [previewDoc, setPreviewDoc] = useState<DokumenItem | null>(null);

  const displayedDocs = documents.slice(0, 4);

  const getCategoryBadgeColor = (category: string) => {
    const cat = category.toUpperCase();
    if (cat.includes('REGULASI') || cat.includes('KEPUTUSAN')) {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    }
    if (cat.includes('EDARAN')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
    }
    if (cat.includes('PANDUAN')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (cat.includes('SURVEI') || cat.includes('KEPUASAN')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    }
    return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
  };

  return (
    <section id="dokumen-publik" className="py-16 bg-white dark:bg-[#0B1120] border-t border-gray-100 dark:border-gray-800 scroll-mt-24">
      <div className="container mx-auto px-4 xl:px-12">
        {/* ── Section Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-[#D97706] dark:text-[#FBBF24] border border-[#FBBF24]/40 mb-3">
              <FileText className="w-3.5 h-3.5 text-[#FBBF24]" />
              DOKUMEN RESMI
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Dokumen & Regulasi Publik
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1.5 max-w-xl">
              Unduh berkas resmi, edaran bupati, dan laporan transparansi publik.
            </p>
          </div>

          <Link
            href="/dokumen"
            className="text-[#1E3A8A] dark:text-[#93C5FD] font-bold text-sm flex items-center gap-1.5 hover:underline cursor-pointer transition-colors shrink-0 group"
          >
            Lihat Semua Dokumen <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* ── Document Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayedDocs.map((doc) => (
            <div
              key={`doc-${doc.id}`}
              className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                {/* Top Row: Category badge & File size */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getCategoryBadgeColor(doc.category)}`}>
                    {doc.category}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 shrink-0">
                    {doc.file_size || 'PDF'}
                  </span>
                </div>

                {/* Document Title */}
                <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#1E3A8A] dark:group-hover:text-[#93C5FD] transition-colors mb-2">
                  {doc.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-5">
                  {doc.description || 'Dokumen publik resmi Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang.'}
                </p>
              </div>

              {/* Bottom Row: Date & Action Buttons (Lihat & Unduh) */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                  {doc.date}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Button 1: Preview without download */}
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    title="Lihat dokumen langsung tanpa download"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-[#93C5FD]" />
                    <span>Lihat</span>
                  </button>

                  {/* Button 2: Direct download */}
                  <a
                    href={doc.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Unduh dokumen langsung"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#1E3A8A] dark:text-white bg-blue-50 hover:bg-[#1E3A8A] hover:text-white dark:bg-blue-900/30 dark:hover:bg-blue-800 transition-all border border-blue-200 dark:border-blue-700/50 cursor-pointer"
                  >
                    <span>Unduh</span>
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Document Preview Modal (Baca Tanpa Harus Download) ── */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md pt-20 sm:pt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] max-h-[850px] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 relative z-10"
            >
              {/* Modal Header */}
              <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4 bg-gray-50 dark:bg-[#0F172A] shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getCategoryBadgeColor(previewDoc.category)}`}>
                      {previewDoc.category}
                    </span>
                    <span className="text-xs text-gray-400">• {previewDoc.date}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                    {previewDoc.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={previewDoc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors"
                  >
                    Tab Baru <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={previewDoc.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white transition-colors shadow-sm"
                  >
                    Unduh Dokumen <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    aria-label="Tutup pratinjau"
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Embedded PDF Viewer with Fallback Helper */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-2 sm:p-4 overflow-hidden relative flex flex-col">
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2 mb-2 flex items-center justify-between gap-3 text-xs text-blue-800 dark:text-blue-200 shrink-0">
                  <span className="truncate">
                    📄 Pratinjau Dokumen Resmi • Jika berkas belum tampil, klik tombol di sebelah kanan.
                  </span>
                  <a
                    href={previewDoc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline hover:text-blue-900 dark:hover:text-white shrink-0"
                  >
                    Buka Langsung ↗
                  </a>
                </div>

                <div className="flex-1 w-full h-full relative rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <iframe
                    src={previewDoc.file_url}
                    title={previewDoc.title}
                    className="w-full h-full border-0"
                    allow="autoplay"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
