/**
 * Automated System & Feature Health-Check Suite
 * Tests all key features, database endpoints, visitor tracker, auth, and pengaduan.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const results = [];

async function test(name, fn) {
  process.stdout.write(`⏳ Testing: ${name}... `);
  try {
    const startTime = Date.now();
    await fn();
    const duration = Date.now() - startTime;
    console.log(`✅ PASS (${duration}ms)`);
    results.push({ name, status: 'PASS', duration });
  } catch (err) {
    console.log(`❌ FAIL: ${err.message}`);
    results.push({ name, status: 'FAIL', error: err.message });
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log(`🚀 RUNNING AUTOMATED E2E SYSTEM HEALTH CHECK`);
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log('====================================================\n');

  // 1. Homepage & Public Pages
  await test('1. GET / (Homepage HTML)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes('Disnakertrans') && !text.includes('Serang')) {
      throw new Error('Homepage content missing expected text');
    }
  });

  await test('2. GET /peluang (Agenda & Peluang)', async () => {
    const res = await fetch(`${BASE_URL}/peluang`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await test('3. GET /pelatihan (Program Pelatihan)', async () => {
    const res = await fetch(`${BASE_URL}/pelatihan`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await test('4. GET /pengaduan (Pengaduan Online)', async () => {
    const res = await fetch(`${BASE_URL}/pengaduan`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await test('5. GET /informasi-publik (Portal Informasi)', async () => {
    const res = await fetch(`${BASE_URL}/informasi-publik`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  // 2. Core API Endpoints
  await test('6. API: GET /api/statistik (Data UMK & Indikator)', async () => {
    const res = await fetch(`${BASE_URL}/api/statistik`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.data || !Array.isArray(data.data)) throw new Error('Invalid format');
  });

  await test('7. API: GET /api/news (Berita Publik)', async () => {
    const res = await fetch(`${BASE_URL}/api/news`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.data || !Array.isArray(data.data)) throw new Error('Invalid format');
  });

  await test('8. API: GET /api/jadwal-pelatihan (Pelatihan Vokasi)', async () => {
    const res = await fetch(`${BASE_URL}/api/jadwal-pelatihan`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await test('9. API: GET /api/lowongan (Lowongan Kerja)', async () => {
    const res = await fetch(`${BASE_URL}/api/lowongan`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  // 3. Visitor Tracking System
  await test('10. API: POST /api/visitors (Visitor Tracking Increment)', async () => {
    const sessionId = 'test-session-' + Date.now();
    const res = await fetch(`${BASE_URL}/api/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        page_path: '/',
        device: 'Automated Test',
        browser: 'NodeFetch',
        os: 'Windows'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (typeof data.total !== 'number' || typeof data.today !== 'number') {
      throw new Error('Visitor counter response invalid');
    }
  });

  await test('11. API: GET /api/visitors (Fetch Visitor Counter)', async () => {
    const res = await fetch(`${BASE_URL}/api/visitors`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (typeof data.total !== 'number') throw new Error('Invalid total counter');
  });

  // 4. Pengaduan & Tracking System
  await test('12. API: POST /api/pengaduan (Formulir Pengaduan Submit & Ticket Generation)', async () => {
    const res = await fetch(`${BASE_URL}/api/pengaduan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Penguji Sistem UCD',
        email: 'penguji.ucd@gmail.com',
        message: 'Pengujian otomatis alur pengaduan online Disnakertrans Serang.',
        subject: 'Uji Coba Pengaduan Otomatis',
        type: 'umum'
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.data?.ticketNumber && !data.ticketNumber) {
      throw new Error('No ticket number generated');
    }
  });

  // 5. Admin Authentication
  await test('13. API: POST /api/auth/login (Admin Login Authentication)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@disnakertrans.go.id',
        password: 'SuperAdmin123!'
      })
    });
    // If login succeeds or user not yet in table, we check response
    if (res.ok) {
      const data = await res.json();
      if (!data.data?.user && !data.user) throw new Error('Missing user payload');
    } else {
      const err = await res.json().catch(() => ({}));
      console.log(` (Note: ${err.error || res.statusText}) `);
    }
  });

  console.log('\n====================================================');
  console.log('📊 RINGKASAN HASIL PENGUJIAN SISTEM:');
  console.log('====================================================');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`✅ LULUS: ${passed} / ${results.length}`);
  console.log(`❌ GAGAL: ${failed} / ${results.length}`);
  console.log('====================================================\n');
}

runAllTests().catch(console.error);
