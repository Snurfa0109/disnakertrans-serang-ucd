import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getComplaintById, updateComplaintStatus } from '@/lib/services/complaint.service';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * POST /api/complaints/[id]/reply
 * 
 * Send a reply email to the complainant and mark as processed.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json(errorResponse('Invalid complaint ID'), { status: 400 });
    }

    const body = await request.json();
    const { replyMessage, replyTitle } = body;

    if (!replyMessage || !replyMessage.trim()) {
      return NextResponse.json(errorResponse('Isi balasan harus diisi'), { status: 400 });
    }

    // Get the complaint
    const complaint = await getComplaintById(id);
    if (!complaint) {
      return NextResponse.json(errorResponse('Pengaduan tidak ditemukan'), { status: 404 });
    }

    // Send reply email
    const emailUser = process.env.EMAIL_USER || 'disnakertrans@serangkab.go.id';
    const emailPass = process.env.EMAIL_PASS || '';

    if (!emailPass) {
      // Still mark as processed even if email isn't configured
      await updateComplaintStatus(id, 'processed');
      return NextResponse.json(
        successResponse({
          message: 'Status diperbarui, tetapi email tidak terkirim (SMTP belum dikonfigurasi)',
          emailSent: false,
        })
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false,
      auth: { user: emailUser, pass: emailPass },
    });

    const ticketNumber = `#PKD-${String(id).padStart(5, '0')}`;
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    await transporter.sendMail({
      from: `"Disnakertrans Kab. Serang" <${emailUser}>`,
      to: complaint.email,
      subject: `${replyTitle ? replyTitle + ' - ' : ''}Balasan Pengaduan ${ticketNumber} - Disnakertrans Kab. Serang`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A192F; padding: 24px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #FBBF24; margin: 0;">${replyTitle || 'Balasan Pengaduan Anda'}</h2>
            <p style="color: #94A3B8; margin: 8px 0 0; font-size: 13px;">Tiket: ${ticketNumber}</p>
          </div>
          <div style="padding: 24px; background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
            <p>Yth. <strong>${complaint.name}</strong>,</p>
            <p>Terima kasih atas pengaduan yang Anda sampaikan. Berikut ini balasan resmi dari Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang:</p>
            
            <div style="background: #EFF6FF; padding: 16px; border-radius: 8px; border-left: 4px solid #1E3A8A; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B;"><strong>Pengaduan Anda:</strong></p>
              <p style="margin: 0; font-size: 13px; color: #334155;">${complaint.subject || '-'}</p>
            </div>

            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 16px 0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B;"><strong>Balasan Resmi:</strong></p>
              <p style="margin: 0; white-space: pre-wrap; font-size: 14px; color: #1E293B; line-height: 1.6;">${replyMessage.trim()}</p>
            </div>

            <p style="font-size: 13px; color: #475569;">Jika Anda memiliki pertanyaan lebih lanjut, silakan balas email ini atau hubungi kami di <strong>(0254) 200234</strong>.</p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 11px; color: #94A3B8;">
              Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang<br/>
              Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas<br/>
              Dikirim pada: ${timestamp}
            </p>
          </div>
        </div>
      `,
    });

    // Mark as processed
    await updateComplaintStatus(id, 'processed');

    console.log(`[Email] Reply sent for ticket ${ticketNumber} to ${complaint.email}`);

    return NextResponse.json(
      successResponse({
        message: 'Balasan berhasil dikirim ke email pengadu',
        emailSent: true,
        ticketNumber,
      })
    );
  } catch (error) {
    console.error('[API] POST /api/complaints/[id]/reply error:', error);
    return NextResponse.json(errorResponse('Gagal mengirim balasan'), { status: 500 });
  }
}
