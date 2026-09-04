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
      <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-24 bg-[#0A192F] overflow-hidden text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Background Dokumen Publik"
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/80 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 xl:px-12 relative z-10">
          <div className="max-w-3xl">
            {/* Breadcrumb navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold text-white/60 mb-5">
              <Link href="/" className="hover:text-white transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              <Link href="/informasi-publik" className="hover:text-white transition-colors">
                Informasi Publik
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[#FBBF24]">Dokumen & Regulasi</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/40 px-3.5 py-1 text-xs font-extrabold text-[#FBBF24] tracking-widest uppercase mb-4 bg-[#FBBF24]/10">
              <FileText className="w-3.5 h-3.5 text-[#FBBF24]" />
              Transparansi Kinerja & Regulasi
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Dokumen & <span className="text-[#FBBF24]">Regulasi Publik</span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-2xl">
              Akses dan unduh berkas resmi, surat keputusan upah minimum, petunjuk teknis layanan, rencana kerja tahunan, dan laporan akuntabilitas kinerja Disnakertrans Kabupaten Serang.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 xl:px-12 -mt-8 relative z-20">
        <DokumenExplorer initialDocuments={documents} />
      </section>
    </main>
  );
}
