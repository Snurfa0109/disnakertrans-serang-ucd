import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getComplaintById, updateComplaint } from '@/lib/services/complaint.service';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils';

/**
 * POST /api/complaints/[id]/reply
 * 
 * Send a reply email to the complainant and persist the response to the tracking system.
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
    const { replyMessage, replyTitle, status = 'Selesai' } = body;

    if (!replyMessage || !replyMessage.trim()) {
      return NextResponse.json(errorResponse('Isi balasan harus diisi'), { status: 400 });
    }

    // Get current admin session (if logged in)
    const session = await getSession();
    const adminName = session?.user?.name || 'Petugas Disnakertrans Kab. Serang';

    // Get the complaint
    const complaint = await getComplaintById(id);
    if (!complaint) {
      return NextResponse.json(errorResponse('Pengaduan tidak ditemukan'), { status: 404 });
    }

    const titleText = replyTitle?.trim() || 'Tanggapan Resmi Disnakertrans Kab. Serang';

    // 1. Always save response and status to database so it immediately connects to the tracker
    await updateComplaint(id, {
      admin_reply: replyMessage.trim(),
      admin_reply_title: titleText,
      admin_reply_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      admin_reply_by: adminName,
      status: status,
    });

    // 2. Try sending notification email if SMTP credentials are provided
    let emailSent = false;
    const emailUser = process.env.EMAIL_USER || 'disnakertrans@serangkab.go.id';
    const emailPass = process.env.EMAIL_PASS || '';

    if (emailPass && complaint.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587', 10),
          secure: false,
          auth: { user: emailUser, pass: emailPass },
        });

        const ticketNumber = complaint.ticket_number || `#PKD-${String(id).padStart(5, '0')}`;
        const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

        await transporter.sendMail({
          from: `"Disnakertrans Kab. Serang" <${emailUser}>`,
          to: complaint.email,
          subject: `${titleText} - Pengaduan ${ticketNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
              <div style="background: #0A192F; padding: 24px; border-radius: 8px 8px 0 0;">
                <h2 style="color: #FBBF24; margin: 0;">${titleText}</h2>
                <p style="color: #94A3B8; margin: 8px 0 0; font-size: 13px;">Nomor Tiket: ${ticketNumber}</p>
              </div>
              <div style="padding: 24px; background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                <p>Yth. <strong>${complaint.name}</strong>,</p>
                <p>Terima kasih atas laporan/pengaduan yang Anda sampaikan. Berikut ini tanggapan dan tindak lanjut resmi dari Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang:</p>
                
                <div style="background: #EFF6FF; padding: 16px; border-radius: 8px; border-left: 4px solid #1E3A8A; margin: 16px 0;">
                  <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: bold;">Subjek Pengaduan:</p>
                  <p style="margin: 0; font-size: 13px; color: #334155;">${complaint.subject || '-'}</p>
                </div>

                <div style="background: white; padding: 18px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 16px 0;">
                  <p style="margin: 0 0 8px 0; font-size: 11px; color: #166534; font-weight: bold; text-transform: uppercase;">Balasan & Tindak Lanjut Petugas:</p>
                  <p style="margin: 0; white-space: pre-wrap; font-size: 14px; color: #1E293B; line-height: 1.6;">${replyMessage.trim()}</p>
                </div>

                <p style="font-size: 13px; color: #475569;">
                  Anda juga dapat memantau status atau mencetak bukti progres pengaduan Anda kapan saja melalui portal pelacak kami dengan memasukkan nomor tiket, nomor telepon, atau NIK Anda.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                <p style="font-size: 11px; color: #94A3B8;">
                  Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang<br/>
                  Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kab. Serang<br/>
                  Ditanggapi oleh: ${adminName} pada ${timestamp}
                </p>
              </div>
            </div>
          `,
        });
        emailSent = true;
      } catch (err) {
        console.warn('[Email] Failed to send email reply:', err);
      }
    }

    return NextResponse.json(
      successResponse({
        message: 'Balasan resmi berhasil disimpan dan terhubung ke halaman tracking pengaduan' + (emailSent ? ' serta dikirimkan via email.' : '.'),
        emailSent,
        ticketNumber: complaint.ticket_number || `#PKD-${String(id).padStart(5, '0')}`,
      })
    );
  } catch (error) {
    console.error('[API] POST /api/complaints/[id]/reply error:', error);
    return NextResponse.json(errorResponse('Gagal mengirim balasan'), { status: 500 });
  }
}
