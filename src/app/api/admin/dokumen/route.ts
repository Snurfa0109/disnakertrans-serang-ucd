import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getSession, getClientIP } from '@/lib/auth';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/dokumen — list documents with search, category, pagination
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim() || '';
  const category = searchParams.get('category')?.trim() || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('perPage') || '20')));
  const offset = (page - 1) * perPage;

  try {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ? OR category LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category && category !== 'ALL') {
      conditions.push('category = ?');
      params.push(category);
    }

    const whereClause = conditions.join(' AND ');

    // Total count
    const [countRow] = await sql.unsafe(
      `SELECT COUNT(*) AS total FROM dokumen_publik WHERE ${whereClause}`,
      params
    );
    const total = Number(countRow?.total || 0);

    // Items
    const items = await sql.unsafe(
      `SELECT * FROM dokumen_publik WHERE ${whereClause} ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    // Get all categories & stats
    const catRows = await sql`SELECT DISTINCT category FROM dokumen_publik WHERE category IS NOT NULL AND category != '' ORDER BY category ASC`;
    const [statActive] = await sql`SELECT COUNT(*) AS c FROM dokumen_publik WHERE is_active = 1`;

    return NextResponse.json(
      successResponse(items, {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
        categories: catRows.map((r: any) => r.category),
        activeCount: Number(statActive?.c || 0),
      })
    );
  } catch (err: any) {
    console.error('[API] GET /api/admin/dokumen error:', err);
    return NextResponse.json(errorResponse(err.message || 'Gagal memuat daftar dokumen'), { status: 500 });
  }
}

/**
 * POST /api/admin/dokumen — create new document (supports JSON or FormData upload)
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  try {
    const contentType = req.headers.get('content-type') || '';
    let title = '';
    let category = 'LAPORAN KINERJA';
    let description = '';
    let file_url = '';
    let file_size = 'PDF';
    let date = new Date().getFullYear().toString();
    let sort_order = 0;
    let is_active = 1;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = (formData.get('title') as string) || '';
      category = (formData.get('category') as string) || 'LAPORAN KINERJA';
      description = (formData.get('description') as string) || '';
      date = (formData.get('date') as string) || new Date().getFullYear().toString();
      sort_order = parseInt((formData.get('sort_order') as string) || '0');
      is_active = formData.get('is_active') === '0' ? 0 : 1;

      const file = formData.get('file') as File | null;
      const rawUrl = (formData.get('file_url') as string) || '';

      if (file && file.size > 0) {
        // Validate size (max 25MB)
        if (file.size > 25 * 1024 * 1024) {
          return NextResponse.json(errorResponse('Ukuran file PDF maksimal 25MB'), { status: 400 });
        }

        // Validate file extension whitelist
        const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
        const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
        if (!allowedExtensions.includes(rawExt)) {
          return NextResponse.json(
            errorResponse('Format file tidak didukung. Hanya file PDF, Word, atau Excel yang diizinkan.'),
            { status: 400 }
          );
        }

        const ext = rawExt;
        const unique = crypto.randomBytes(8).toString('hex');
        const safeBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        const filename = `doc_${unique}_${safeBaseName}.${ext}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'dokumen');
        await mkdir(uploadDir, { recursive: true });

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(uploadDir, filename), buffer);

        file_url = `/uploads/dokumen/${filename}`;

        // Format file size
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        file_size = file.size >= 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;
      } else if (rawUrl.trim()) {
        file_url = rawUrl.trim();
        file_size = (formData.get('file_size') as string) || 'PDF';
      }
    } else {
      const body = await req.json();
      title = body.title || '';
      category = body.category || 'LAPORAN KINERJA';
      description = body.description || '';
      file_url = body.file_url || '';
      file_size = body.file_size || 'PDF';
      date = body.date || new Date().getFullYear().toString();
      sort_order = body.sort_order || 0;
      is_active = body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1;
    }

    if (!title.trim()) {
      return NextResponse.json(errorResponse('Judul dokumen wajib diisi'), { status: 400 });
    }

    if (!file_url.trim()) {
      return NextResponse.json(errorResponse('Berkas file PDF atau tautan URL wajib disediakan'), { status: 400 });
    }

    const [res] = await sql.unsafe(
      `INSERT INTO dokumen_publik (title, category, description, file_url, file_size, date, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), category.trim(), description.trim(), file_url.trim(), file_size.trim(), date.trim(), sort_order, is_active]
    );

    const insertId = res?.insertId || 0;

    logAction({
      actorId: session.user.id,
      actorName: session.user.name,
      actorRole: session.user.role,
      action: 'create',
      module: 'dokumen',
      targetId: insertId,
      targetDescription: `Dokumen: ${title}`,
      ipAddress: getClientIP(req),
    });

    return NextResponse.json(successResponse({ id: insertId, title, file_url }), { status: 201 });
  } catch (err: any) {
    console.error('[API] POST /api/admin/dokumen error:', err);
    return NextResponse.json(errorResponse(err.message || 'Gagal menambahkan dokumen'), { status: 500 });
  }
}
