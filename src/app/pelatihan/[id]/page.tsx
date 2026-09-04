import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Users, Calendar, ChevronRight, Home, CheckCircle2, Phone, Mail, ExternalLink, Clock, Award } from 'lucide-react';

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const pelatihanList = [
  {
    id: 1,
    title: 'Pelatihan Teknik Las Listrik (SMAW) – Angkatan III',
    kategori: 'Teknik & Industri',
    statusLabel: 'Pendaftaran Dibuka',
    statusKey: 'buka',
    lokasi: 'BLK Kabupaten Serang, Kramatwatu',
    kuotaTotal: 16,
    kuotaSisa: 4,
    tanggalMulai: '15 Okt 2024',
    tanggalSelesai: '20 Nov 2024',
    batasDaftar: '10 Okt 2024',
    durasi: '160 Jam',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1000&q=80',
    sertifikasi: 'BNSP',
    biaya: 'GRATIS',
    deskripsi: `Program Pelatihan Teknik Las Listrik ini dirancang khusus untuk membekali tenaga kerja dengan kemampuan pengelasan menggunakan metode SMAW (Shielded Metal Arc Welding) yang merupakan salah satu metode las listrik paling umum digunakan di industri manufaktur.\n\nPeserta akan dibimbing oleh instruktur berpengalaman dan bersertifikat untuk menguasai teknik pengelasan dari dasar hingga mahir. Program ini mengacu pada Standar Kompetensi Kerja Nasional Indonesia (SKKNI) serta mengikutsertakan peserta dalam uji sertifikasi resmi oleh Badan Nasional Sertifikasi Profesi (BNSP).\n\nSetelah menyelesaikan pelatihan, peserta diharapkan mampu mengoperasikan peralatan las listrik dengan aman dan benar, sehingga memiliki peluang kerja yang lebih luas di berbagai industri.`,
    tujuan: [
      'Menguasai dan menerapkan teknik pengelasan SMAW sesuai standar nasional',
      'Memahami dan menerapkan Kesehatan & Keselamatan Kerja (K3) dalam pengelasan',
      'Memperoleh sertifikat kompetensi yang diakui oleh Badan Nasional Sertifikasi Profesi (BNSP)',
    ],
    materi: [
      { no: '01', judul: 'Pengenalan Dasar & Teori', isi: 'Pengenalan las listrik, alat, mesin las, dan prosedur keselamatan.' },
      { no: '02', judul: 'Praktik Lapangan Bertahap', isi: 'Latihan pengelasan posisi 1G, 2G, dan 3G pada plat besi.' },
      { no: '03', judul: 'Uji Kompetensi BNSP', isi: 'Evaluasi akhir sesuai skema kompetensi untuk perolehan sertifikasi resmi.' },
    ],
    jadwal: [
      { tahap: 'Tahap 1: Pendaftaran & Seleksi', tanggal: '1 – 10 Okt 2024' },
      { tahap: 'Tahap 2: Persiapan Teori (Online/Offline)', tanggal: '15 Oktober 2024' },
      { tahap: 'Tahap 3: Praktik Intensif & Asesmen', tanggal: '16 Okt – 17 Nov 2024' },
      { tahap: 'Tahap 4: Uji Kompetensi & Pengumuman', tanggal: '18 – 20 Nov 2024' },
    ],
    fasilitas: ['Sertifikasi BNSP', 'Modul Pelatihan', 'Konsumsi (Makan Siang)', 'Seragam Kerja & APD', 'Uang Saku', 'Transportasi'],
    persyaratan: [
      'Warga Kabupaten Serang (KTP Serang)',
      'Pendidikan min. SMP/Sederajat',
      'Usia 17 – 45 tahun',
      'Tidak sedang mengikuti pelatihan lain',
      'Serius mengikuti kegiatan pelatihan',
    ],
  },
  {
    id: 2,
    title: 'Pelatihan Junior Web Developer',
    kategori: 'Teknologi Informasi',
    statusLabel: 'Akan Datang',
    statusKey: 'datang',
    lokasi: 'Pusdiklat IT Serang',
    kuotaTotal: 20,
    kuotaSisa: 20,
    tanggalMulai: '10 Jan 2025',
    tanggalSelesai: '28 Feb 2025',
    batasDaftar: '5 Jan 2025',
    durasi: '240 Jam',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1000&q=80',
    sertifikasi: 'Kompetensi Nasional',
    biaya: 'GRATIS',
    deskripsi: `Program Pelatihan Junior Web Developer ini bertujuan mempersiapkan tenaga kerja muda Kabupaten Serang agar siap bekerja di industri digital. Peserta akan mempelajari teknologi web modern yang banyak digunakan oleh startup dan perusahaan teknologi.\n\nPelatihan ini mencakup pembuatan website dari nol menggunakan HTML, CSS, JavaScript, serta framework populer. Peserta juga akan mendapat bimbingan dalam membuat portofolio digital untuk meningkatkan peluang karir di bidang teknologi informasi.\n\nInstruktur berpengalaman dari industri teknologi akan membimbing peserta dengan metode project-based learning yang mengutamakan praktik nyata.`,
    tujuan: [
      'Menguasai fundamental web development (HTML, CSS, JavaScript)',
      'Membangun aplikasi web sederhana menggunakan framework modern',
      'Memiliki portofolio digital siap kerja yang dapat ditampilkan kepada employer',
    ],
    materi: [
      { no: '01', judul: 'Fundamental Web', isi: 'HTML5, CSS3, Flexbox, Grid, Responsive Design.' },
      { no: '02', judul: 'JavaScript & Framework', isi: 'JavaScript ES6+, DOM manipulation, React.js dasar.' },
      { no: '03', judul: 'Project Akhir', isi: 'Membangun aplikasi web full portfolio siap presentasi.' },
    ],
    jadwal: [
      { tahap: 'Tahap 1: Pendaftaran & Seleksi', tanggal: '15 Des 2024 – 5 Jan 2025' },
      { tahap: 'Tahap 2: Fundamental HTML/CSS/JS', tanggal: '10 – 24 Jan 2025' },
      { tahap: 'Tahap 3: Framework & Proyek', tanggal: '25 Jan – 21 Feb 2025' },
      { tahap: 'Tahap 4: Presentasi & Sertifikasi', tanggal: '22 – 28 Feb 2025' },
    ],
    fasilitas: ['Sertifikat Kompetensi', 'Modul Digital', 'Konsumsi', 'Akses Laptop', 'Uang Saku', 'Mentoring Karir'],
    persyaratan: [
      'Warga Kabupaten Serang (KTP Serang)',
      'Pendidikan min. SMA/SMK/Sederajat',
      'Usia 18 – 35 tahun',
      'Memiliki laptop/komputer pribadi (diutamakan)',
      'Mampu mengoperasikan komputer dasar',
    ],
  },
  {
    id: 3,
    title: 'Pembuatan Roti & Kue (Bakery)',
    kategori: 'Pariwisata & Kuliner',
    statusLabel: 'Pendaftaran Ditutup',
    statusKey: 'tutup',
    lokasi: 'UPTB BLK Kramatwatu',
    kuotaTotal: 16,
    kuotaSisa: 0,
    tanggalMulai: '01 Sep 2024',
    tanggalSelesai: '15 Okt 2024',
    batasDaftar: '30 Ags 2024',
    durasi: '120 Jam',
    image: 'https://images.unsplash.com/photo-1549590143-d5855148a9d5?w=1000&q=80',
    sertifikasi: null,
    biaya: 'GRATIS',
    deskripsi: `Program Pelatihan Pembuatan Roti & Kue (Bakery) ini dirancang untuk membekali peserta dengan keterampilan profesional dalam bidang baking dan pastry. Pelatihan ini cocok bagi yang ingin berwirausaha di bidang kuliner maupun bekerja di industri perhotelan dan restoran.\n\nPeserta akan belajar langsung membuat berbagai jenis roti, kue kering, dan pastry menggunakan teknik dan resep profesional. Modul pelatihan mencakup pengelolaan bahan baku, perhitungan biaya produksi, hingga pengemasan dan pemasaran produk bakery.\n\nDengan bekal keterampilan ini, peserta diharapkan mampu membuka usaha bakery sendiri atau bekerja di industri kuliner dengan standar profesional.`,
    tujuan: [
      'Menguasai teknik pembuatan berbagai jenis roti dan kue secara profesional',
      'Memahami standar higienitas dan keamanan pangan dalam produksi bakery',
      'Mampu mengelola usaha bakery dari produksi hingga pemasaran',
    ],
    materi: [
      { no: '01', judul: 'Dasar Baking & Pastry', isi: 'Pengenalan bahan baku, alat, teknik pengulenan dan fermentasi adonan.' },
      { no: '02', judul: 'Produksi Roti & Kue', isi: 'Pembuatan roti tawar, donat, croissant, dan berbagai kue kering.' },
      { no: '03', judul: 'Kewirausahaan Bakery', isi: 'Perhitungan harga jual, pengemasan menarik, dan strategi pemasaran.' },
    ],
    jadwal: [
      { tahap: 'Tahap 1: Pendaftaran', tanggal: '15 – 30 Ags 2024' },
      { tahap: 'Tahap 2: Teori Dasar Baking', tanggal: '1 – 10 Sep 2024' },
      { tahap: 'Tahap 3: Praktik Produksi', tanggal: '11 Sep – 10 Okt 2024' },
      { tahap: 'Tahap 4: Ujian & Demo Produk', tanggal: '11 – 15 Okt 2024' },
    ],
    fasilitas: ['Modul Pelatihan', 'Bahan Praktik', 'Konsumsi', 'Peralatan Baking', 'Sertifikat Kelulusan', 'Konsultasi Usaha'],
    persyaratan: [
      'Warga Kabupaten Serang (KTP Serang)',
      'Pendidikan min. SMP/Sederajat',
      'Usia 18 – 50 tahun',
      'Tidak sedang mengikuti pelatihan lain',
      'Bersedia mengikuti seluruh rangkaian pelatihan',
    ],
  },
];

const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  buka:   { label: 'Pendaftaran Dibuka', bg: 'bg-green-100',  text: 'text-green-700'  },
  datang: { label: 'Akan Datang',        bg: 'bg-blue-100',   text: 'text-blue-700'   },
  tutup:  { label: 'Ditutup',            bg: 'bg-gray-100',   text: 'text-gray-500'   },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id);
  const item = pelatihanList.find(p => p.id === id);
  if (!item) return { title: 'Tidak Ditemukan' };
  return { title: `${item.title} | Pelatihan – Disnakertrans Serang`, description: item.deskripsi.slice(0, 160) };
}

export default async function PelatihanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id);
  const item = pelatihanList.find(p => p.id === id);
  if (!item) notFound();

  const sm = STATUS_META[item.statusKey];
  const others = pelatihanList.filter(p => p.id !== item.id);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Hero Section ── */}
      <section className="bg-white border-b border-gray-100 pt-20 lg:pt-24">
        {/* Hero image */}
        <div className="w-full h-64 lg:h-80 overflow-hidden bg-gray-200 relative">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Header info */}
        <div className="container mx-auto px-4 xl:px-12 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 flex-wrap">
            <Link href="/" className="hover:text-gray-700 flex items-center gap-1"><Home className="w-3 h-3" />Beranda</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/pelatihan" className="hover:text-gray-700">Pelatihan</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 font-medium truncate max-w-[200px]">Detail Pelatihan</span>
          </nav>

          <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4 ${sm.bg} ${sm.text}`}>
            {sm.label}
          </span>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-5 max-w-3xl">
            {item.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-[#FBBF24]" />{item.kategori}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#FBBF24]" />{item.lokasi}</span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#FBBF24]" />
              Kuota: {item.kuotaTotal} Orang (Sisa {item.kuotaSisa})</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#FBBF24]" />
              {item.tanggalMulai} – {item.tanggalSelesai}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#FBBF24]" />{item.durasi}</span>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            {item.statusKey !== 'tutup' ? (
              <a href="https://bahagia.serangkab.go.id" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0A192F] hover:bg-black text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm">
                Daftar Pelatihan Sekarang <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 bg-gray-200 text-gray-400 font-bold px-7 py-3.5 rounded-xl text-sm cursor-not-allowed">
                Pendaftaran Ditutup
              </span>
            )}
            <a href="/pengaduan"
              className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm">
              Kontak Mitra
            </a>
          </div>

          {/* Sertifikasi badge */}
          {item.sertifikasi && (
            <div className="mt-5 inline-flex items-center gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-2.5">
              <Award className="w-4 h-4 text-[#1E3A8A]" />
              <p className="text-xs font-bold text-[#1E3A8A]">Sertifikasi {item.sertifikasi} – Pengakuan Nasional</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Main Content + Sidebar ── */}
      <div className="container mx-auto px-4 xl:px-12 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT: Main Content ── */}
          <div className="flex-1 min-w-0 space-y-10">

            {/* Deskripsi */}
            <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#FBBF24] rounded-sm inline-block" />
                Deskripsi Pelatihan
              </h2>
              <div className="mt-4 space-y-4">
                {item.deskripsi.split('\n\n').filter(p => p.trim()).map((para, i) => (
                  <p key={i} className="text-gray-600 text-sm leading-relaxed">{para}</p>
                ))}
              </div>
            </section>

            {/* Tujuan */}
            <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#FBBF24] rounded-sm inline-block" />
                Tujuan Pelatihan
              </h2>
              <div className="space-y-3">
                {item.tujuan.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#EFF6FF] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Materi */}
            <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#FBBF24] rounded-sm inline-block" />
                Materi Pembelajaran
              </h2>
              <div className="space-y-5">
                {item.materi.map((m, i) => (
                  <div key={i} className="flex gap-5 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-10 h-10 bg-[#0A192F] text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                      {m.no}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-1">{m.judul}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{m.isi}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Jadwal */}
            <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#FBBF24] rounded-sm inline-block" />
                Jadwal Pelaksanaan
              </h2>
              <div className="space-y-1 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
                {item.jadwal.map((j, i) => (
                  <div key={i} className="flex items-start gap-4 pb-5 last:pb-0">
                    <div className="w-4 h-4 rounded-full border-2 border-[#FBBF24] bg-white shrink-0 mt-0.5 relative z-10" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{j.tahap}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{j.tanggal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Fasilitas */}
            <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#FBBF24] rounded-sm inline-block" />
                Fasilitas Peserta
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {item.fasilitas.map((f, i) => (
                  <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 border border-gray-100 text-center">
                    <div className="w-10 h-10 bg-[#FEF3C7] rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-5 h-5 text-[#92400E]" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 leading-snug">{f}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0 space-y-5 lg:sticky lg:top-28">

            {/* Persyaratan */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">Persyaratan Peserta</p>
              <ul className="space-y-2.5">
                {item.persyaratan.map((p, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 leading-snug">{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Biaya Pelatihan</p>
                <p className="text-xl font-extrabold text-green-600">{item.biaya}</p>
                <p className="text-[10px] text-gray-400">Ditanggung Disnakertrans Kab. Serang</p>
              </div>

              {item.statusKey !== 'tutup' ? (
                <a href="https://bahagia.serangkab.go.id" target="_blank" rel="noopener noreferrer"
                  className="mt-5 block w-full bg-[#0A192F] hover:bg-black text-white font-bold py-3.5 rounded-xl text-center text-sm transition-colors">
                  Daftar Pelatihan
                </a>
              ) : (
                <div className="mt-5 w-full bg-gray-100 text-gray-400 font-bold py-3.5 rounded-xl text-center text-sm cursor-not-allowed">
                  Pendaftaran Ditutup
                </div>
              )}
            </div>

            {/* Informasi Kontak */}
            <div className="bg-[#0A192F] rounded-2xl p-6 text-white">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#FBBF24] mb-4">Informasi Kontak</p>
              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-white/40 mb-0.5">Telepon</p>
                    <p className="text-sm text-white font-medium">+62 (0254) 200513</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-white/40 mb-0.5">Email Pelatihan</p>
                    <p className="text-xs text-white font-medium break-all">disnakertrans@serangkab.go.id</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-white/40 mb-0.5">Alamat BLK</p>
                    <p className="text-xs text-white/80 leading-relaxed">{item.lokasi}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info tanggal */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Info Penting</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Batas Daftar</span>
                  <span className="font-bold text-red-600 text-xs">{item.batasDaftar}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Mulai</span>
                  <span className="font-semibold text-gray-700 text-xs">{item.tanggalMulai}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Selesai</span>
                  <span className="font-semibold text-gray-700 text-xs">{item.tanggalSelesai}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Durasi</span>
                  <span className="font-semibold text-gray-700 text-xs">{item.durasi}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Similar Trainings ── */}
      {others.length > 0 && (
        <section className="bg-white border-t border-gray-100 py-14">
          <div className="container mx-auto px-4 xl:px-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900">Pelatihan Serupa</h2>
              <Link href="/pelatihan" className="text-sm font-semibold text-[#1E3A8A] hover:underline">
                Lihat Semua Pelatihan →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map(p => (
                <Link href={`/pelatihan/${p.id}`} key={p.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-40 overflow-hidden bg-gray-100">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">{p.kategori}</span>
                    <h3 className="font-bold text-gray-900 text-sm mt-1 mb-2 line-clamp-2 leading-snug">{p.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.kuotaTotal} Peserta</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.durasi}</span>
                    </div>
                    <span className="mt-3 inline-block text-xs font-bold text-[#1E3A8A] group-hover:underline">Lihat Detail →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
