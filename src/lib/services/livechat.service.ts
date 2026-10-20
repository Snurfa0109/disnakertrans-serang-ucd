/**
 * Live Chat Service — Disnakertrans Kabupaten Serang
 * Real-time citizen support desk with working hours intelligence,
 * session management, and admin dispatcher.
 */

import sql from '@/lib/db';

export interface LiveChatSession {
  id: number;
  session_id: string;
  citizen_name: string;
  citizen_contact: string;
  topic: string;
  status: 'waiting' | 'active' | 'closed';
  assigned_petugas: string | null;
  rating: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface LiveChatMessage {
  id: number;
  session_id: string;
  sender_type: 'citizen' | 'petugas' | 'system';
  sender_name: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface OfficeHoursStatus {
  isOpen: boolean;
  statusText: string;
  badgeColor: string;
  currentTimeWIB: string;
  nextOpenText: string;
  schedule: {
    weekday: string;
    friday: string;
    weekend: string;
  };
}

/**
 * Check if Disnakertrans Service Desk is currently open (WIB / UTC+7).
 * Senin – Kamis: 08:00 – 16:00 WIB
 * Jumat: 08:00 – 16:30 WIB
 * Sabtu & Minggu: Tutup
 */
export function getOfficeHoursStatus(): OfficeHoursStatus {
  // Get current time in Jakarta timezone (UTC+7)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wibTime = new Date(utc + 7 * 3600000);

  const day = wibTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  const hours = wibTime.getHours();
  const minutes = wibTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} WIB`;

  let isOpen = false;
  let statusText = 'Di Luar Jam Operasional';
  let badgeColor = 'amber';
  let nextOpenText = 'Layanan dibuka kembali besok pukul 08:00 WIB';

  // Senin (1) s/d Kamis (4): 08:00 (480) - 16:00 (960)
  if (day >= 1 && day <= 4) {
    if (totalMinutes >= 480 && totalMinutes <= 960) {
      isOpen = true;
      statusText = 'Petugas Piket Siaga (Online)';
      badgeColor = 'emerald';
      nextOpenText = 'Buka hingga pukul 16:00 WIB';
    } else if (totalMinutes < 480) {
      nextOpenText = 'Layanan dibuka hari ini pukul 08:00 WIB';
    } else {
      nextOpenText = day === 4 ? 'Layanan dibuka kembali besok Jumat pukul 08:00 WIB' : 'Layanan dibuka kembali besok pukul 08:00 WIB';
    }
  } 
  // Jumat (5): 08:00 (480) - 16:30 (990)
  else if (day === 5) {
    if (totalMinutes >= 480 && totalMinutes <= 990) {
      isOpen = true;
      statusText = 'Petugas Piket Siaga (Online)';
      badgeColor = 'emerald';
      nextOpenText = 'Buka hingga pukul 16:30 WIB';
    } else if (totalMinutes < 480) {
      nextOpenText = 'Layanan dibuka hari ini pukul 08:00 WIB';
    } else {
      nextOpenText = 'Layanan dibuka kembali hari Senin pukul 08:00 WIB';
    }
  }
  // Sabtu (6) & Minggu (0): Libur akhir pekan
  else {
    statusText = 'Libur Akhir Pekan (Offline)';
    badgeColor = 'gray';
    nextOpenText = 'Layanan dibuka kembali hari Senin pukul 08:00 WIB';
  }

  return {
    isOpen,
    statusText,
    badgeColor,
    currentTimeWIB: timeStr,
    nextOpenText,
    schedule: {
      weekday: 'Senin – Kamis: 08.00 – 16.00 WIB',
      friday: 'Jumat: 08.00 – 16.30 WIB',
      weekend: 'Sabtu, Minggu & Hari Libur: Tutup',
    },
  };
}

/**
 * Create a new citizen live chat session.
 */
export async function createSession(data: {
  citizen_name: string;
  citizen_contact?: string;
  topic?: string;
  initial_message: string;
}): Promise<{ session: LiveChatSession; messages: LiveChatMessage[] }> {
  const sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const topic = data.topic?.trim() || 'Informasi Umum';
  const citizenName = data.citizen_name.trim();
  const citizenContact = data.citizen_contact?.trim() || '';
  const initialMessage = data.initial_message.trim();

  // Ensure tables exist
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS livechat_sessions (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        session_id       VARCHAR(64) NOT NULL UNIQUE,
        citizen_name     VARCHAR(120) NOT NULL,
        citizen_contact  VARCHAR(120) DEFAULT '',
        topic            VARCHAR(100) DEFAULT 'Umum',
        status           VARCHAR(30) DEFAULT 'waiting',
        assigned_petugas VARCHAR(120) DEFAULT NULL,
        rating           INT DEFAULT NULL,
        feedback         TEXT DEFAULT NULL,
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        closed_at        DATETIME DEFAULT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS livechat_messages (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        session_id  VARCHAR(64) NOT NULL,
        sender_type VARCHAR(20) NOT NULL,
        sender_name VARCHAR(120) NOT NULL,
        message     LONGTEXT NOT NULL,
        is_read     TINYINT(1) DEFAULT 0,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } catch (err) {
    console.error('[LiveChat Service] Table check error:', err);
  }

  // Insert session
  await sql`
    INSERT INTO livechat_sessions (session_id, citizen_name, citizen_contact, topic, status)
    VALUES (${sessionId}, ${citizenName}, ${citizenContact}, ${topic}, 'waiting')
  `;

  // Insert initial citizen message
  await sql`
    INSERT INTO livechat_messages (session_id, sender_type, sender_name, message)
    VALUES (${sessionId}, 'citizen', ${citizenName}, ${initialMessage})
  `;

  // Insert automated welcome / system response
  const hours = getOfficeHoursStatus();
  let systemMsg = '';
  if (hours.isOpen) {
    systemMsg = `Halo Bapak/Ibu ${citizenName}, terima kasih telah menghubungi Disnakertrans Kabupaten Serang. Pesan Anda telah diteruskan ke antrian Petugas Piket Pelayanan Terpadu. Mohon menunggu sebentar, petugas kami sedang bersiap merespons chat Anda.`;
  } else {
    systemMsg = `Halo Bapak/Ibu ${citizenName}, pesan Anda telah tersimpan di antrian resmi Disnakertrans Kabupaten Serang. Saat ini sedang berada di luar jam operasional pelayanan (08.00 - 16.00 WIB). Petugas piket kami akan langsung membalas chat ini saat jam kerja kembali dimulai. Anda juga dapat bertanya ke asisten 24 jam Kang Satria atau membuat pengaduan resmi.`;
  }

  await sql`
    INSERT INTO livechat_messages (session_id, sender_type, sender_name, message)
    VALUES (${sessionId}, 'system', 'Sistem Disnakertrans', ${systemMsg})
  `;

  const sessionRows = await sql`SELECT * FROM livechat_sessions WHERE session_id = ${sessionId}`;
  const messageRows = await sql`SELECT * FROM livechat_messages WHERE session_id = ${sessionId} ORDER BY id ASC`;

  return {
    session: sessionRows[0] as LiveChatSession,
    messages: messageRows as LiveChatMessage[],
  };
}

/**
 * Get session details by sessionId.
 */
export async function getSession(sessionId: string): Promise<LiveChatSession | null> {
  const rows = await sql`SELECT * FROM livechat_sessions WHERE session_id = ${sessionId}`;
  if (!rows || rows.length === 0) return null;
  return rows[0] as LiveChatSession;
}

/**
 * Get all messages for a session, optionally only those after a given ID.
 */
export async function getMessages(sessionId: string, afterId: number = 0): Promise<LiveChatMessage[]> {
  if (afterId > 0) {
    const rows = await sql`
      SELECT * FROM livechat_messages 
      WHERE session_id = ${sessionId} AND id > ${afterId}
      ORDER BY id ASC
    `;
    return rows as LiveChatMessage[];
  }

  const rows = await sql`
    SELECT * FROM livechat_messages 
    WHERE session_id = ${sessionId}
    ORDER BY id ASC
  `;
  return rows as LiveChatMessage[];
}

/**
 * Send a message into a session.
 */
export async function sendMessage(data: {
  sessionId: string;
  senderType: 'citizen' | 'petugas' | 'system';
  senderName: string;
  message: string;
}): Promise<LiveChatMessage> {
  const { sessionId, senderType, senderName, message } = data;

  await sql`
    INSERT INTO livechat_messages (session_id, sender_type, sender_name, message)
    VALUES (${sessionId}, ${senderType}, ${senderName}, ${message})
  `;

  // Update session status and timestamp
  if (senderType === 'petugas') {
    await sql`
      UPDATE livechat_sessions 
      SET status = 'active', assigned_petugas = COALESCE(assigned_petugas, ${senderName}), updated_at = NOW()
      WHERE session_id = ${sessionId}
    `;
  } else if (senderType === 'citizen') {
    await sql`
      UPDATE livechat_sessions 
      SET status = CASE WHEN status = 'closed' THEN 'waiting' ELSE status END, updated_at = NOW()
      WHERE session_id = ${sessionId}
    `;
  }

  const rows = await sql`
    SELECT * FROM livechat_messages 
    WHERE session_id = ${sessionId} 
    ORDER BY id DESC LIMIT 1
  `;
  return rows[0] as LiveChatMessage;
}

/**
 * Close session with optional rating and feedback.
 */
export async function closeSession(sessionId: string, rating?: number, feedback?: string): Promise<boolean> {
  await sql`
    UPDATE livechat_sessions 
    SET status = 'closed', rating = ${rating || null}, feedback = ${feedback || null}, closed_at = NOW()
    WHERE session_id = ${sessionId}
  `;

  await sql`
    INSERT INTO livechat_messages (session_id, sender_type, sender_name, message)
    VALUES (${sessionId}, 'system', 'Sistem Disnakertrans', 'Sesi konsultasi ini telah ditandai selesai. Terima kasih telah menghubungi Disnakertrans Kabupaten Serang.')
  `;

  return true;
}

/**
 * Assign a session to a specific petugas.
 */
export async function assignSession(sessionId: string, petugasName: string): Promise<boolean> {
  await sql`
    UPDATE livechat_sessions 
    SET assigned_petugas = ${petugasName}, status = 'active', updated_at = NOW()
    WHERE session_id = ${sessionId}
  `;
  return true;
}

/**
 * Get all sessions for Admin livechat console with unread counts and last message.
 */
export async function getAdminSessions(filters?: {
  status?: string;
  search?: string;
}): Promise<{
  sessions: (LiveChatSession & { last_message: string; last_message_time: string; message_count: number })[];
  waitingCount: number;
  activeCount: number;
  totalCount: number;
}> {
  try {
    let query = `
      SELECT s.*,
        (SELECT message FROM livechat_messages m WHERE m.session_id = s.session_id ORDER BY m.id DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM livechat_messages m WHERE m.session_id = s.session_id ORDER BY m.id DESC LIMIT 1) AS last_message_time,
        (SELECT COUNT(*) FROM livechat_messages m WHERE m.session_id = s.session_id) AS message_count
      FROM livechat_sessions s
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.status && filters.status !== 'all') {
      query += ` AND s.status = ?`;
      params.push(filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const q = `%${filters.search.trim().toLowerCase()}%`;
      query += ` AND (LOWER(s.citizen_name) LIKE ? OR LOWER(s.topic) LIKE ? OR LOWER(s.citizen_contact) LIKE ?)`;
      params.push(q, q, q);
    }

    query += ` ORDER BY s.updated_at DESC LIMIT 100`;

    const rows: any = await (sql as any).unsafe(query, params);
    const sessions = Array.isArray(rows) ? rows : [];

    // Count badges
    const countRows: any = await (sql as any).unsafe(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END), 0) AS waiting_count,
        COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) AS active_count,
        COUNT(*) AS total_count
      FROM livechat_sessions
    `);

    const countRow = Array.isArray(countRows) && countRows.length > 0 ? countRows[0] : {};

    return {
      sessions,
      waitingCount: Number(countRow.waiting_count || 0),
      activeCount: Number(countRow.active_count || 0),
      totalCount: Number(countRow.total_count || 0),
    };
  } catch (err) {
    console.error('[LiveChat Service] getAdminSessions error:', err);
    return { sessions: [], waitingCount: 0, activeCount: 0, totalCount: 0 };
  }
}
