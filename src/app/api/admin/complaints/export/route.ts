import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getComplaintsForExport } from '@/lib/services/complaint.service';
import { errorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status') || undefined;
  const type = searchParams.get('type') || undefined;
  const disposisi_bidang = searchParams.get('disposisi_bidang') || undefined;
  const is_confidential = searchParams.get('is_confidential') || undefined;
  const search = searchParams.get('search') || undefined;

  const items = await getComplaintsForExport({
    status,
    type,
    disposisi_bidang,
    is_confidential,
    search,
  });

  // Helper to escape CSV values
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    'No',
    'Nomor Tiket',
    'Tanggal Masuk',
    'Kategori Layanan',
    'Nama Pelapor',
    'NIK KTP',
    'Nomor WhatsApp/HP',
    'Email',
    'Mode Rahasia (Whistleblower)',
    'Disposisi Bidang (SOTK)',
    'Subjek Pengaduan',
    'Ringkasan Masalah',
    'Status Penanganan',
    'Judul Balasan Resmi',
    'Isi Balasan Resmi',
    'Waktu Balasan',
    'Petugas Pembalas',
  ];

  const rows = items.map((item, idx) => {
    return [
      idx + 1,
      escapeCsv(item.ticket_number),
      escapeCsv(item.date ? new Date(item.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'),
      escapeCsv(item.type ? item.type.replace(/_/g, ' ') : 'Umum'),
      escapeCsv(item.name),
      escapeCsv(item.nik || '-'),
      escapeCsv(item.phone || '-'),
      escapeCsv(item.email || '-'),
      escapeCsv(item.is_confidential ? 'YA (UU PDP)' : 'Tidak'),
      escapeCsv(item.disposisi_bidang || 'Belum Didisposisikan'),
      escapeCsv(item.subject || '-'),
      escapeCsv(item.message || '-'),
      escapeCsv(item.status),
      escapeCsv(item.admin_reply_title || '-'),
      escapeCsv(item.admin_reply || '-'),
      escapeCsv(item.admin_reply_at ? new Date(item.admin_reply_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'),
      escapeCsv(item.admin_reply_by || '-'),
    ].join(';');
  });

  // UTF-8 BOM (\uFEFF) ensures Excel displays Indonesian characters and formatting correctly
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

  const today = new Date().toISOString().slice(0, 10);
  const filename = `rekap-pengaduan-disnakertrans-${today}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
