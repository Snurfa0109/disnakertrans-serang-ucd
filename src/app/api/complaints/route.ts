import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  createComplaint,
  getComplaints,
} from '@/lib/services/complaint.service';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/complaints
 * 
 * List complaints with optional status filter and pagination.
 * Query params: status (pending|processed), page, perPage
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') as 'pending' | 'processed' | null;
    const type = searchParams.get('type') as 'umum' | 'hubungan_industrial' | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);

    // Validate status if provided
    if (status && !['pending', 'processed'].includes(status)) {
      return NextResponse.json(
        errorResponse('Invalid status. Use "pending" or "processed"'),
        { status: 400 }
      );
    }

    const result = getComplaints({
      status: status || undefined,
      type: type || undefined,
      page,
      perPage,
    });

    return NextResponse.json(
      successResponse(result.items, {
        total: result.total,
        page: result.page,
        perPage: result.perPage,
        totalPages: Math.ceil(result.total / result.perPage),
      })
    );
  } catch (error) {
    console.error('[API] GET /api/complaints error:', error);
    return NextResponse.json(errorResponse('Failed to fetch complaints'), { status: 500 });
  }
}

/**
 * POST /api/complaints
 * 
 * Submit a new complaint. Sends email notifications.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, type, attachments } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(errorResponse('Nama lengkap harus diisi'), { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json(errorResponse('Email harus diisi'), { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(errorResponse('Format email tidak valid'), { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json(errorResponse('Isi laporan harus diisi'), { status: 400 });
    }

    // Validate type if provided
    const complaintType = type && ['umum', 'hubungan_industrial'].includes(type) ? type : 'umum';

    // Create complaint in database
    const { id, ticketNumber } = createComplaint({
      name: name.trim(),
      email: email.trim(),
      subject: (subject || '').trim(),
      message: message.trim(),
      type: complaintType,
      attachments: attachments ? JSON.stringify(attachments) : '[]',
    });

    // Send email notifications (non-blocking — don't fail the request)
    sendEmailNotifications({
      id,
      ticketNumber,
      name: name.trim(),
      email: email.trim(),
      subject: (subject || '').trim(),
      message: message.trim(),
    }).catch((err) => {
      console.error('[API] Email notification failed:', err);
    });

    return NextResponse.json(
      successResponse({
        id,
        ticketNumber,
        message: 'Pengaduan berhasil dikirim',
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] POST /api/complaints error:', error);
    return NextResponse.json(errorResponse('Gagal mengirim pengaduan'), { status: 500 });
  }
}

/**
 * Send email notifications for a new complaint.
 * Runs asynchronously — errors are logged but don't fail the API response.
 */
async function sendEmailNotifications(data: {
  id: number;
  ticketNumber: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const emailUser = process.env.EMAIL_USER || 'disnakertrans@serangkab.go.id';
  const emailPass = process.env.EMAIL_PASS || '';

  if (!emailPass) {
    console.warn('[Email] EMAIL_PASS not configured, skipping email notifications');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: { user: emailUser, pass: emailPass },
  });

  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  // Email to admin (Disnakertrans)
  await transporter.sendMail({
    from: `"Pengaduan Online Disnakertrans" <${emailUser}>`,
    to: process.env.ADMIN_EMAIL || 'disnakertrans@serangkab.go.id',
    subject: `[Pengaduan Online] ${data.subject || 'Tanpa Subjek'} - dari ${data.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0A192F; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #FBBF24; margin: 0;">Pengaduan Baru Masuk</h2>
          <p style="color: #94A3B8; margin: 8px 0 0; font-size: 13px;">Tiket: ${data.ticketNumber}</p>
        </div>
        <div style="padding: 24px; background: #f8f9fa; border: 1px solid #e2e8f0;">
          <p><strong>Nama:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Subjek:</strong> ${data.subject || '-'}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p><strong>Isi Laporan:</strong></p>
          <p style="white-space: pre-wrap; background: white; padding: 16px; border-radius: 4px; border: 1px solid #e2e8f0;">${data.message}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="font-size: 12px; color: #666;">Diterima pada: ${timestamp}</p>
        </div>
      </div>
    `,
  });

  // Confirmation email to the complainant
  await transporter.sendMail({
    from: `"Disnakertrans Kab. Serang" <${emailUser}>`,
    to: data.email,
    subject: `Konfirmasi Pengaduan Anda - Disnakertrans Kab. Serang`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0A192F; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #FBBF24; margin: 0;">Pengaduan Anda Telah Diterima</h2>
        </div>
        <div style="padding: 24px; background: #f8f9fa; border: 1px solid #e2e8f0;">
          <p>Yth. <strong>${data.name}</strong>,</p>
          <p>Terima kasih telah menyampaikan pengaduan Anda kepada Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang.</p>
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Subjek:</strong> ${data.subject || '-'}</p>
            <p style="margin: 0;"><strong>Nomor Tiket:</strong> ${data.ticketNumber}</p>
          </div>
          <p>Pengaduan Anda akan kami proses dalam waktu <strong>3x24 jam</strong> hari kerja. Balasan resmi akan dikirimkan ke alamat email ini.</p>
          <p>Jika Anda memiliki pertanyaan lebih lanjut, silakan balas email ini dengan menyertakan nomor tiket di atas.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="font-size: 12px; color: #666;">Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang<br/>Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kabupaten Serang, Banten<br/>Telp: (0254) 200234</p>
        </div>
      </div>
    `,
  });

  console.log(`[Email] Notifications sent for ticket ${data.ticketNumber}`);
}
