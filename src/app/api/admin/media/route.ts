import { NextResponse } from 'next/server';
import { getSession, getClientIP } from '@/lib/auth';
import { listMedia, saveMedia } from '@/lib/services/media.service';
import { logAction } from '@/lib/services/audit.service';
import { successResponse, errorResponse } from '@/lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  const { searchParams } = new URL(request.url);
  const result = listMedia({
    fileType: (searchParams.get('fileType') as any) || undefined,
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    perPage: parseInt(searchParams.get('perPage') || '24'),
  });

  return NextResponse.json(successResponse(result.items, {
    total: result.total, page: result.page, perPage: result.perPage,
    totalPages: Math.ceil(result.total / result.perPage),
  }));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'Umum';

    if (!file) return NextResponse.json(errorResponse('File tidak ditemukan'), { status: 400 });

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(errorResponse('Ukuran file maksimal 10MB'), { status: 400 });
    }

    // Determine file type
    const mime = file.type;
    let fileType: 'image' | 'pdf' | 'document' = 'document';
    if (mime.startsWith('image/')) fileType = 'image';
    else if (mime === 'application/pdf') fileType = 'pdf';

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'bin';
    const unique = crypto.randomBytes(12).toString('hex');
    const filename = `${unique}.${ext}`;

    // Save to /public/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;
    const id = saveMedia({
      filename,
      original_name: file.name,
      file_type: fileType,
      mime_type: mime,
      size_bytes: file.size,
      category,
      url,
      uploaded_by: session.user.id,
    });

    logAction({
      actorId: session.user.id, actorName: session.user.name, actorRole: session.user.role,
      action: 'upload', module: 'media', targetId: id, targetDescription: file.name,
      ipAddress: getClientIP(request),
    });

    return NextResponse.json(successResponse({ id, url, filename }), { status: 201 });
  } catch (error) {
    console.error('[API] POST /api/admin/media error:', error);
    return NextResponse.json(errorResponse('Gagal mengupload file'), { status: 500 });
  }
}
