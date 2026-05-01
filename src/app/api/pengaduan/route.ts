import { NextResponse } from 'next/server';
import db from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;
        const date = new Date().toISOString();

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Save to database
        const stmt = db.prepare(`
      INSERT INTO pengaduan (name, email, message, date)
      VALUES (?, ?, ?, ?)
    `);
        const info = stmt.run(name, email, message, date);

        // Send email to Disnakertrans
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER || 'disnakertrans@serangkab.go.id',
                    pass: process.env.EMAIL_PASS || '',
                },
            });

            // Email to Disnakertrans (receiving the complaint)
            await transporter.sendMail({
                from: `"Pengaduan Online Disnakertrans" <${process.env.EMAIL_USER || 'disnakertrans@serangkab.go.id'}>`,
                to: 'disnakertrans@serangkab.go.id',
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
                            <p style="font-size: 12px; color: #666;">Diterima pada: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</p>
                        </div>
                    </div>
                `,
            });

            // Confirmation email to the sender
            await transporter.sendMail({
                from: `"Disnakertrans Kab. Serang" <${process.env.EMAIL_USER || 'disnakertrans@serangkab.go.id'}>`,
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
                                <p style="margin: 0;"><strong>Nomor Tiket:</strong> #PKD-${String(info.lastInsertRowid).padStart(5, '0')}</p>
                            </div>
                            <p>Pengaduan Anda akan kami proses dalam waktu <strong>3x24 jam</strong> hari kerja. Balasan resmi akan dikirimkan ke alamat email ini.</p>
                            <p>Jika Anda memiliki pertanyaan lebih lanjut, silakan balas email ini dengan menyertakan nomor tiket di atas.</p>
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                            <p style="font-size: 12px; color: #666;">Dinas Tenaga Kerja dan Transmigrasi Kabupaten Serang<br/>Jl. Kawasan Puspemkab Serang No.B1, Kaserangan, Kec. Ciruas, Kabupaten Serang, Banten<br/>Telp: (0254) 200234</p>
                        </div>
                    </div>
                `,
            });
        } catch (emailError) {
            // Log email error but don't fail the request - the data is saved
            console.error('Email sending failed:', emailError);
        }

        return NextResponse.json({ id: info.lastInsertRowid, success: true }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }
}
