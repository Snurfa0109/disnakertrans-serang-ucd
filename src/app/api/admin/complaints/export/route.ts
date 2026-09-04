import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllComplaintsForExport } from '@/lib/services/complaint.service';
import { errorResponse } from '@/lib/utils';
import { logAction } from '@/lib/services/audit.service';

/** GET /api/admin/complaints/export — export complaints as CSV */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  const { searchParams } = new URL(request.url);
  const data = await getAllComplaintsForExport({
    status: searchParams.get('status') || undefined,
    type: searchParams.get('type') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  });

  const headers = ['No Tiket', 'Nama', 'Email', 'Subjek', 'Jenis', 'Status', 'Tanggal', 'Pesan'];
  const rows = data.map((c: any) => [
    c.ticket_number || `PKD-${String(c.id).padStart(5, '0')}`,
    `"${c.name.replace(/"/g, '""')}"`,
    c.email,
    `"${(c.subject || '').replace(/"/g, '""')}"`,
    c.type === 'hubungan_industrial' ? 'HI' : 'Umum',
    c.status,
    new Date(c.date).toLocaleDateString('id-ID'),
    `"${c.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');

  logAction({
    actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
    action: 'export', module: 'complaints', targetDescription: `Export ${data.length} pengaduan`,
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pengaduan_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
