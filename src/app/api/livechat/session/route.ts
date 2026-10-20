import { NextResponse } from 'next/server';
import { 
  getOfficeHoursStatus, 
  createSession, 
  getSession, 
  getMessages 
} from '@/lib/services/livechat.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const officeHours = getOfficeHoursStatus();

    if (!sessionId) {
      return NextResponse.json({
        success: true,
        officeHours,
      });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Sesi chat tidak ditemukan',
        officeHours,
      }, { status: 404 });
    }

    const messages = await getMessages(sessionId);

    return NextResponse.json({
      success: true,
      session,
      messages,
      officeHours,
    });
  } catch (error) {
    console.error('[API livechat/session GET] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { citizen_name, citizen_contact, topic, initial_message } = body;

    if (!citizen_name || !citizen_name.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Nama wajib diisi untuk memulai chat',
      }, { status: 400 });
    }

    if (!initial_message || !initial_message.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Pesan awal atau pertanyaan wajib diisi',
      }, { status: 400 });
    }

    const result = await createSession({
      citizen_name,
      citizen_contact,
      topic,
      initial_message,
    });

    return NextResponse.json({
      success: true,
      session: result.session,
      messages: result.messages,
      officeHours: getOfficeHoursStatus(),
    });
  } catch (error) {
    console.error('[API livechat/session POST] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
