import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession, getClientIP } from '@/lib/auth';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/dokumen/[id] — update existing document
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  const { id } = await params;
  const docId = Number(id);

  if (!docId) return NextResponse.json(errorResponse('ID Dokumen tidak valid'), { status: 400 });

  try {
    const existing = await sql`SELECT * FROM dokumen_publik WHERE id = ${docId} LIMIT 1`;
    if (existing.length === 0) {
      return NextResponse.json(errorResponse('Dokumen tidak ditemukan'), { status: 404 });
    }

    const doc = existing[0];
    const contentType = req.headers.get('content-type') || '';

    let title = doc.title;
    let category = doc.category;
    let description = doc.description;
    let file_url = doc.file_url;
    let file_size = doc.file_size;
    let date = doc.date;
    let sort_order = doc.sort_order;
    let is_active = doc.is_active;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      if (formData.has('title')) title = formData.get('title') as string;
      if (formData.has('category')) category = formData.get('category') as string;
      if (formData.has('description')) description = formData.get('description') as string;
      if (formData.has('date')) date = formData.get('date') as string;
      if (formData.has('sort_order')) sort_order = parseInt(formData.get('sort_order') as string);
      if (formData.has('is_active')) is_active = formData.get('is_active') === '0' ? 0 : 1;

      const file = formData.get('file') as File | null;
      const rawUrl = (formData.get('file_url') as string) || '';

      if (file && file.size > 0) {
        if (file.size > 25 * 1024 * 1024) {
          return NextResponse.json(errorResponse('Ukuran file PDF maksimal 25MB'), { status: 400 });
        }

        const ext = file.name.split('.').pop() || 'pdf';
        const unique = crypto.randomBytes(8).toString('hex');
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
        const filename = `doc_${unique}_${safeName}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'dokumen');
        await mkdir(uploadDir, { recursive: true });

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(uploadDir, filename), buffer);

        file_url = `/uploads/dokumen/${filename}`;
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        file_size = file.size >= 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;
      } else if (rawUrl.trim()) {
        file_url = rawUrl.trim();
        if (formData.has('file_size')) file_size = formData.get('file_size') as string;
      }
    } else {
      const body = await req.json();
      if (body.title !== undefined) title = body.title;
      if (body.category !== undefined) category = body.category;
      if (body.description !== undefined) description = body.description;
      if (body.file_url !== undefined) file_url = body.file_url;
      if (body.file_size !== undefined) file_size = body.file_size;
      if (body.date !== undefined) date = body.date;
      if (body.sort_order !== undefined) sort_order = body.sort_order;
      if (body.is_active !== undefined) is_active = body.is_active ? 1 : 0;
    }

    await sql.unsafe(
      `UPDATE dokumen_publik
       SET title = ?, category = ?, description = ?, file_url = ?, file_size = ?, date = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [title, category, description, file_url, file_size, date, sort_order, is_active, docId]
    );

    logAction({
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      action: 'update',
      module: 'dokumen',
      targetId: docId,
      targetDescription: `Dokumen: ${title}`,
      ipAddress: getClientIP(req),
    });

    return NextResponse.json(successResponse({ id: docId, title, is_active }));
  } catch (err: any) {
    console.error('[API] PATCH /api/admin/dokumen/[id] error:', err);
    return NextResponse.json(errorResponse(err.message || 'Gagal memperbarui dokumen'), { status: 500 });
  }
}

/**
 * DELETE /api/admin/dokumen/[id] — delete document
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  const { id } = await params;
  const docId = Number(id);

  if (!docId) return NextResponse.json(errorResponse('ID Dokumen tidak valid'), { status: 400 });

  try {
    const existing = await sql`SELECT * FROM dokumen_publik WHERE id = ${docId} LIMIT 1`;
    if (existing.length === 0) {
      return NextResponse.json(errorResponse('Dokumen tidak ditemukan'), { status: 404 });
    }

    const doc = existing[0];
    await sql`DELETE FROM dokumen_publik WHERE id = ${docId}`;

    logAction({
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      action: 'delete',
      module: 'dokumen',
      targetId: docId,
      targetDescription: `Hapus Dokumen: ${doc.title}`,
      ipAddress: getClientIP(req),
    });

    return NextResponse.json(successResponse({ deleted: true, id: docId }));
  } catch (err: any) {
    console.error('[API] DELETE /api/admin/dokumen/[id] error:', err);
    return NextResponse.json(errorResponse(err.message || 'Gagal menghapus dokumen'), { status: 500 });
  }
}
