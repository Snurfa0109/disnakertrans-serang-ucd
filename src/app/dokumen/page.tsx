import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, ShieldCheck, Download, ExternalLink, ChevronRight } from 'lucide-react';
import sql from '@/lib/db';
import DokumenExplorer from '@/components/DokumenExplorer';
import { DokumenItem } from '@/components/DokumenPublikSection';

export const revalidate = 120;

export const metadata = {
  title: 'Dokumen & Regulasi Publik | Disnakertrans Kabupaten Serang',
  description: 'Unduh berkas resmi, edaran bupati, laporan akuntabilitas kinerja, serta dokumen transparansi publik Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang.',
};

export default async function DokumenPage() {
  let documents: DokumenItem[] = [];

  try {
    const rows = await sql`
      SELECT id, title, category, description, file_url, file_size, date
      FROM dokumen_publik
      WHERE is_active = TRUE
      ORDER BY sort_order ASC
    ` as any[];
    documents = rows;
  } catch (err) {
    console.error('[DokumenPage] DB error:', err);
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] pb-24">
      <section className="relative pt-[104px] pb-8 sm:pt-28 sm:pb-10 lg:pt-30 lg:pb-12 bg-[#0A192F] overflow-hidden text-white border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Background Dokumen Publik"
            className="w-full h-full object-cover opacity-25 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/80 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 xl:px-12 relative z-10">
          <div className="max-w-3xl">
            {/* Breadcrumb navigation */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-white/60 mb-2.5 sm:mb-3">
              <Link href="/" className="hover:text-white transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3 h-3 text-white/40" />
              <Link href="/informasi-publik" className="hover:text-white transition-colors">
                Informasi Publik
              </Link>
              <ChevronRight className="w-3 h-3 text-white/40" />
              <span className="text-[#FBBF24]">Dokumen & Regulasi</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#FBBF24]/40 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-extrabold text-[#FBBF24] tracking-wider uppercase mb-2 sm:mb-3 bg-[#FBBF24]/10 whitespace-nowrap">
              <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FBBF24]" />
              Transparansi Kinerja & Regulasi
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-1.5 sm:mb-2 leading-tight">
              Dokumen & <span className="text-[#FBBF24]">Regulasi Publik</span>
            </h1>

            <p className="text-[11px] sm:text-xs md:text-sm text-white/80 leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">
              Akses dan unduh berkas resmi, surat keputusan upah minimum, petunjuk teknis layanan, rencana kerja tahunan, dan laporan akuntabilitas kinerja Disnakertrans Kabupaten Serang.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 xl:px-12 -mt-4 sm:-mt-6 relative z-20">
        <DokumenExplorer initialDocuments={documents} />
      </section>
    </main>
  );
}
