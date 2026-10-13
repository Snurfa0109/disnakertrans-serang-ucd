import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import newsBackup from '@/data/news-backup.json';
import lowonganBackup from '@/data/lowongan-backup.json';
import pelatihanBackup from '@/data/pelatihan-backup.json';
import eventsBackup from '@/data/events-backup.json';

export interface SearchResultItem {
  id?: string | number;
  title: string;
  description: string;
  href: string;
  category: 'Layanan' | 'Peluang' | 'Agenda' | 'Lowongan' | 'Pelatihan' | 'Berita' | 'Dokumen' | 'Profil' | 'Pengaduan';
  tags?: string[];
  date?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const categoryFilter = searchParams.get('category') || 'all';

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: SearchResultItem[] = [];

    // 1. SEARCH BERITA / NEWS
    try {
      let newsItems: any[] = [];
      try {
        const rows = await sql`
          SELECT id, title, description, summary, category, date
          FROM news
          WHERE LOWER(title) LIKE ${`%${query}%`}
             OR LOWER(description) LIKE ${`%${query}%`}
             OR LOWER(summary) LIKE ${`%${query}%`}
          ORDER BY id DESC
          LIMIT 8
        `;
        if (Array.isArray(rows) && rows.length > 0) newsItems = rows;
      } catch {
        // DB fallback
      }

      if (newsItems.length === 0 && Array.isArray(newsBackup)) {
        newsItems = newsBackup.filter((n: any) =>
          (n.title && n.title.toLowerCase().includes(query)) ||
          (n.description && n.description.toLowerCase().includes(query)) ||
          (n.summary && n.summary.toLowerCase().includes(query)) ||
          (n.category && n.category.toLowerCase().includes(query))
        ).slice(0, 8);
      }

      for (const item of newsItems) {
        results.push({
          id: `news-${item.id}`,
          title: item.title,
          description: item.summary || (item.description ? item.description.slice(0, 120) + '...' : 'Berita Disnakertrans Serang'),
          href: `/berita/${item.id}`,
          category: 'Berita',
          date: item.date,
        });
      }
    } catch (err) {
      console.error('[Search API] News search error:', err);
    }

    // 2. SEARCH LOWONGAN / PELUANG KERJA
    try {
      let lowonganItems: any[] = [];
      const isJobKeyword = query.includes('peluang') || query.includes('loker') || query.includes('kerja') || query.includes('lowongan') || query.includes('karir');

      try {
        const rows = await sql`
          SELECT id, title, company, location, job_type, education, category
          FROM lowongan
          WHERE is_active = 1
            AND (
              LOWER(title) LIKE ${`%${query}%`}
              OR LOWER(company) LIKE ${`%${query}%`}
              OR LOWER(location) LIKE ${`%${query}%`}
            )
          ORDER BY id DESC
          LIMIT 8
        `;
        if (Array.isArray(rows) && rows.length > 0) lowonganItems = rows;
      } catch {
        // DB fallback
      }

      if (lowonganItems.length === 0 && Array.isArray(lowonganBackup)) {
        if (isJobKeyword) {
          lowonganItems = lowonganBackup.slice(0, 6);
        } else {
          lowonganItems = lowonganBackup.filter((l: any) =>
            (l.title && l.title.toLowerCase().includes(query)) ||
            (l.company && l.company.toLowerCase().includes(query)) ||
            (l.location && l.location.toLowerCase().includes(query)) ||
            (l.education && l.education.toLowerCase().includes(query))
          ).slice(0, 6);
        }
      }

      for (const item of lowonganItems) {
        results.push({
          id: `lowongan-${item.id}`,
          title: `${item.title} — ${item.company}`,
          description: `${item.location || 'Kab. Serang'} • ${item.job_type || 'Full Time'} • Pendidikan: ${item.education || 'SMA/SMK'}`,
          href: '/peluang#lowongan',
          category: 'Lowongan',
        });
      }
    } catch (err) {
      console.error('[Search API] Lowongan search error:', err);
    }

    // 3. SEARCH JADWAL PELATIHAN
    try {
      let pelatihanItems: any[] = [];
      const isPelatihanKeyword = query.includes('agenda') || query.includes('jadwal') || query.includes('pelatihan') || query.includes('kursus') || query.includes('diklat') || query.includes('blk');

      try {
        const rows = await sql`
          SELECT id, title, location, date, time_start, time_end
          FROM jadwal_pelatihan
          WHERE is_active = 1
            AND (
              LOWER(title) LIKE ${`%${query}%`}
              OR LOWER(location) LIKE ${`%${query}%`}
            )
          ORDER BY id DESC
          LIMIT 6
        `;
        if (Array.isArray(rows) && rows.length > 0) pelatihanItems = rows;
      } catch {
        // DB fallback
      }

      if (pelatihanItems.length === 0 && Array.isArray(pelatihanBackup)) {
        if (isPelatihanKeyword) {
          pelatihanItems = pelatihanBackup.slice(0, 4);
        } else {
          pelatihanItems = pelatihanBackup.filter((p: any) =>
            (p.title && p.title.toLowerCase().includes(query)) ||
            (p.location && p.location.toLowerCase().includes(query))
          ).slice(0, 4);
        }
      }

      for (const item of pelatihanItems) {
        results.push({
          id: `pelatihan-${item.id}`,
          title: `Pelatihan: ${item.title}`,
          description: `${item.location || 'BLK Kab. Serang'} • Jadwal: ${item.date || 'Tersedia'}`,
          href: '/peluang#agenda',
          category: 'Pelatihan',
        });
      }
    } catch (err) {
      console.error('[Search API] Pelatihan search error:', err);
    }

    // 4. SEARCH EVENTS / AGENDA
    try {
      let eventItems: any[] = [];
      const isAgendaKeyword = query.includes('agenda') || query.includes('event') || query.includes('acara') || query.includes('job fair') || query.includes('kegiatan');

      try {
        const rows = await sql`
          SELECT id, title, location, date, organizer, link_url
          FROM events
          WHERE is_active = 1
            AND (
              LOWER(title) LIKE ${`%${query}%`}
              OR LOWER(location) LIKE ${`%${query}%`}
              OR LOWER(organizer) LIKE ${`%${query}%`}
            )
          ORDER BY id DESC
          LIMIT 6
        `;
        if (Array.isArray(rows) && rows.length > 0) eventItems = rows;
      } catch {
        // DB fallback
      }

      if (eventItems.length === 0 && Array.isArray(eventsBackup)) {
        if (isAgendaKeyword) {
          eventItems = eventsBackup.slice(0, 4);
        } else {
          eventItems = eventsBackup.filter((e: any) =>
            (e.title && e.title.toLowerCase().includes(query)) ||
            (e.location && e.location.toLowerCase().includes(query)) ||
            (e.organizer && e.organizer.toLowerCase().includes(query))
          ).slice(0, 4);
        }
      }

      for (const item of eventItems) {
        results.push({
          id: `event-${item.id}`,
          title: `Agenda: ${item.title}`,
          description: `${item.location || 'Kabupaten Serang'} • Penyelenggara: ${item.organizer || 'Disnakertrans'} • Tanggal: ${item.date}`,
          href: item.link_url && item.link_url.startsWith('http') ? item.link_url : '/peluang#agenda',
          category: 'Agenda',
        });
      }
    } catch (err) {
      console.error('[Search API] Event search error:', err);
    }

    // 5. SEARCH DOKUMEN PUBLIK
    try {
      let docItems: any[] = [];
      try {
        const rows = await sql`
          SELECT id, title, category, description, file_url, file_size
          FROM dokumen_publik
          WHERE is_active = 1
            AND (
              LOWER(title) LIKE ${`%${query}%`}
              OR LOWER(category) LIKE ${`%${query}%`}
              OR LOWER(description) LIKE ${`%${query}%`}
            )
          ORDER BY id DESC
          LIMIT 6
        `;
        if (Array.isArray(rows) && rows.length > 0) docItems = rows;
      } catch {
        // DB fallback
      }

      for (const item of docItems) {
        results.push({
          id: `doc-${item.id}`,
          title: `Dokumen: ${item.title}`,
          description: `Kategori: ${item.category} • Format: ${item.file_size || 'PDF'}`,
          href: item.file_url || '/dokumen',
          category: 'Dokumen',
        });
      }
    } catch (err) {
      console.error('[Search API] Document search error:', err);
    }

    // Filter by category if requested
    const filteredResults = categoryFilter === 'all'
      ? results
      : results.filter(r => r.category.toLowerCase() === categoryFilter.toLowerCase());

    return NextResponse.json({
      success: true,
      total: filteredResults.length,
      results: filteredResults.slice(0, 20),
    });
  } catch (error) {
    console.error('[Search API] Error:', error);
    return NextResponse.json({ success: false, results: [] }, { status: 500 });
  }
}
