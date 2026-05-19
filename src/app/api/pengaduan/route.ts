import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import {
  createComplaint,
  getComplaints,
} from '@/lib/services/complaint.service';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * GET /api/pengaduan
 * 
 * Backward-compatible alias for /api/complaints.
 * Lists all complaints.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'processed' | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);

    const result = getComplaints({
      status: status || undefined,
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
    return NextResponse.json(errorResponse('Failed to fetch complaints'), { status: 500 });
  }
}

/**
 * POST /api/pengaduan
 * 
 * Backward-compatible — submits complaint and sends email.
 * The existing frontend POSTs to /api/pengaduan, so this route stays active.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, type } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const complaintType = type && ['umum', 'hubungan_industrial'].includes(type) ? type : 'umum';

    // Save via the service
    const { id, ticketNumber } = createComplaint({
      name,
      email,
      subject: subject || '',
      message,
      type: complaintType,
    });

    // Send email notifications (non-blocking)
    try {
      const emailUser = process.env.EMAIL_USER || 'disnakertrans@serangkab.go.id';
      const emailPass = process.env.EMAIL_PASS || '';

      if (emailPass) {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          secure: false,
          auth: { user: emailUser, pass: emailPass },
        });

        const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

        // Email to Disnakertrans
        await transporter.sendMail({
          from: `"Pengaduan Online Disnakertrans" <${emailUser}>`,
          to: process.env.ADMIN_EMAIL || 'disnakertrans@serangkab.go.id',
          subject: `[Pengaduan Online] ${subject || 'Tanpa Subjek'} - dari ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0A192F; padding: 24px; border-radius: 8px 8px 0 0;">
                <h2 style="color: #FBBF24; margin: 0;">Pengaduan Baru Masuk</h2>
              </div>
              <div style="padding: 24px; background: #f8f9fa; border: 1px solid #e2e8f0;">
                <p><strong>Nama:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subjek:</strong> ${subject || '-'}</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                <p><strong>Isi Laporan:</strong></p>
                <p style="white-space: pre-wrap; background: white; padding: 16px; border-radius: 4px; border: 1px solid #e2e8f0;">${message}</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                <p style="font-size: 12px; color: #666;">Diterima pada: ${timestamp}</p>
              </div>
            </div>
          `,
        });

        // Confirmation email to sender
        await transporter.sendMail({
          from: `"Disnakertrans Kab. Serang" <${emailUser}>`,
          to: email,
          subject: `Konfirmasi Pengaduan Anda - Disnakertrans Kab. Serang`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #0A192F; padding: 24px; border-radius: 8px 8px 0 0;">
                <h2 style="color: #FBBF24; margin: 0;">Pengaduan Anda Telah Diterima</h2>
              </div>
              <div style="padding: 24px; background: #f8f9fa; border: 1px solid #e2e8f0;">
                <p>Yth. <strong>${name}</strong>,</p>
                <p>Terima kasih telah menyampaikan pengaduan Anda kepada Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang.</p>
                <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 16px 0;">
                  <p style="margin: 0 0 8px 0;"><strong>Subjek:</strong> ${subject || '-'}</p>
                  <p style="margin: 0;"><strong>Nomor Tiket:</strong> ${ticketNumber}</p>
                </div>
                <p>Pengaduan Anda akan kami proses dalam waktu <strong>3x24 jam</strong> hari kerja.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                <p style="font-size: 12px; color: #666;">Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang<br/>Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kabupaten Serang, Banten<br/>Telp: (0254) 200234</p>
              </div>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return NextResponse.json({ id, ticketNumber, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
