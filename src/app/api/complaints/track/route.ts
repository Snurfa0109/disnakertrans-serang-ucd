import { NextRequest, NextResponse } from 'next/server';
import { trackComplaints, Complaint } from '@/lib/services/complaint.service';
import { successResponse, errorResponse } from '@/lib/utils';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

function maskName(name: string): string {
  if (!name) return 'Masyarakat';
  const parts = name.trim().split(' ');
  return parts
    .map(p => (p.length > 2 ? p[0] + '*'.repeat(p.length - 2) + p[p.length - 1] : p[0] + '*'))
    .join(' ');
}

function maskPhone(phone?: string): string {
  if (!phone) return '-';
  const clean = phone.trim();
  if (clean.length <= 4) return clean;
  return clean.slice(0, 4) + '****' + clean.slice(-3);
}

function maskNik(nik?: string): string {
  if (!nik) return '-';
  const clean = nik.trim();
  if (clean.length <= 6) return clean;
  return clean.slice(0, 6) + '******' + clean.slice(-4);
}

function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return '-';
  const [user, domain] = email.split('@');
  const maskedUser = user.length > 2 ? user[0] + '*'.repeat(user.length - 2) + user.slice(-1) : user[0] + '*';
  return `${maskedUser}@${domain}`;
}

/**
 * GET /api/complaints/track?q=<ticket_or_phone_or_nik>
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit: 30 requests per minute per IP to prevent scraping
    const rateLimitResult = checkRateLimit(request, {
      prefix: 'complaints_track',
      limit: 30,
      windowSeconds: 60,
    });

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetSeconds);
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      return NextResponse.json(
        errorResponse('Parameter pencarian (nomor tiket, nomor telepon, atau NIK) diperlukan'),
        { status: 400 }
      );
    }

    const items = await trackComplaints(q);

    // Format output with privacy-safe complainant info and parsed timeline
    const sanitized = items.map((c: Complaint) => {
      let timeline = [];
      try {
        timeline = c.timeline ? JSON.parse(c.timeline) : [];
      } catch {
        timeline = [];
      }

      // If no stored timeline exists, generate a synthetic one from date + status + admin_reply
      if (!Array.isArray(timeline) || timeline.length === 0) {
        timeline = [
          {
            status: 'Baru',
            title: 'Pengaduan Berhasil Diajukan',
            note: 'Pengaduan telah tercatat dalam sistem Disnakertrans Kab. Serang.',
            time: c.date || c.created_at,
          }
        ];
        if (c.status !== 'Baru') {
          timeline.push({
            status: c.status,
            title: c.status === 'Diproses' ? 'Sedang Ditinjau Petugas' : `Status: ${c.status}`,
            note: c.status === 'Diproses' ? 'Laporan sedang dalam verifikasi dan penelaahan tim teknis.' : 'Status pengaduan diperbarui.',
            time: c.updated_at || c.date,
          });
        }
        if (c.admin_reply) {
          timeline.push({
            status: 'Selesai',
            title: c.admin_reply_title || 'Tanggapan Resmi Disnakertrans',
            note: c.admin_reply,
            time: c.admin_reply_at || c.updated_at,
          });
        }
      }

      const isConfidential = Boolean(c.is_confidential);

      return {
        id: c.id,
        ticket_number: c.ticket_number || `PKD-${String(c.id).padStart(5, '0')}`,
        name_masked: isConfidential ? 'Pelapor Terlindungi (Mode Rahasia)' : maskName(c.name),
        email_masked: isConfidential ? 'rahasia@disnaker.serangkab.go.id' : maskEmail(c.email),
        phone_masked: maskPhone(c.phone),
        nik_masked: maskNik(c.nik),
        type: c.type || 'umum',
        subject: c.subject || 'Tanpa Subjek',
        message: c.message,
        status: c.status || 'Baru',
        is_confidential: isConfidential,
        date: c.date || c.created_at,
        created_at: c.created_at,
        updated_at: c.updated_at,
        admin_reply: c.admin_reply || null,
        admin_reply_title: c.admin_reply_title || 'Tanggapan Resmi Disnakertrans Kab. Serang',
        admin_reply_at: c.admin_reply_at || null,
        admin_reply_by: c.admin_reply_by || 'Disnakertrans Kab. Serang',
        disposisi_bidang: c.disposisi_bidang || null,
        timeline,
      };
    });

    return NextResponse.json(
      successResponse(sanitized, {
        total: sanitized.length,
        page: 1,
        perPage: sanitized.length || 1,
        totalPages: 1,
        query: q.trim(),
      })
    );
  } catch (err: any) {
    console.error('[API] GET /api/complaints/track error:', err);
    return NextResponse.json(errorResponse('Gagal melacak data pengaduan'), { status: 500 });
  }
}
