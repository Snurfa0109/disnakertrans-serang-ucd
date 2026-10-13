# HALAMAN JUDUL

<div align='center'>

**PERANCANGAN DAN IMPLEMENTASI SISTEM PENDUKUNG KEPUTUSAN SINYAL TRADING FOREX BERBASIS MULTI ANALISIS DENGAN INTEGRASI METATRADER 5 DAN TELEGRAM**

SKRIPSI

Diajukan Sebagai Salah Satu Syarat untuk Memperoleh Gelar Sarjana Komputer (S.Kom.) pada Program Studi Informatika Fakultas Teknik Universitas Sultan Ageng Tirtayasa

Oleh:

**M DZIKRI ZEN**
**NIM. 3337220109**

**PROGRAM STUDI INFORMATIKA**
**FAKULTAS TEKNIK**
**UNIVERSITAS SULTAN AGENG TIRTAYASA**
**CILEGON – BANTEN**
**2026**

</div>

---

# HALAMAN PERNYATAAN KEASLIAN

Dengan ini saya menyatakan bahwa:

1. Skripsi berjudul **"Perancangan Dan Implementasi Sistem Pendukung Keputusan Sinyal Trading Forex Berbasis Multi Analisis Dengan Integrasi Metatrader 5 Dan Telegram"** ini adalah karya asli saya sendiri dan belum pernah diajukan untuk memperoleh gelar akademik sarjana di perguruan tinggi mana pun.
2. Sepanjang pengetahuan saya, di dalam naskah skripsi ini tidak terdapat karya, gagasan, atau pendapat yang pernah ditulis atau diterbitkan oleh orang lain, kecuali yang secara tertulis disitasi dan dicantumkan secara jelas dalam daftar pustaka sesuai dengan kaidah dan etika ilmiah yang berlaku.
3. Apabila di kemudian hari terbukti atau dapat dibuktikan terdapat unsur penjiplakan (*plagiarisme*) dalam karya ini, maka saya bersedia menerima sanksi akademik yang berlaku di Universitas Sultan Ageng Tirtayasa, termasuk sanksi pembatalan gelar kesarjanaan yang telah saya peroleh.

Demikian surat pernyataan ini saya buat dengan sebenarnya dalam keadaan sadar penuh serta tanpa paksaan dari pihak mana pun.

<div align='right'>

Cilegon, ......................... 2026
Yang membuat pernyataan,



*(Materai Rp10.000)*

**M DZIKRI ZEN**
NIM. 3337220109

</div>

---

# HALAMAN PENGESAHAN

<div align='center'>

**PERANCANGAN DAN IMPLEMENTASI SISTEM PENDUKUNG KEPUTUSAN SINYAL TRADING FOREX BERBASIS MULTI ANALISIS DENGAN INTEGRASI METATRADER 5 DAN TELEGRAM**

Oleh:
**M DZIKRI ZEN**
NIM. 3337220109

Telah dipertahankan di hadapan Tim Penguji Sidang Skripsi
Program Studi Informatika, Fakultas Teknik, Universitas Sultan Ageng Tirtayasa
Pada tanggal: ......................... 2026

</div>

**Menyetujui,**

| Pembimbing I, | Pembimbing II, |
| :--- | :--- |
| <br><br><br>**Nanang Krisdianto, S.T., M.Kom.**<br>NIP. 197504092006041004 | <br><br><br>**Arief Rahman, S.Kom., M.Kom.**<br>NIP. 199304202024061001 |

<div align='center'>

**Mengetahui,**
Ketua Program Studi Informatika
Fakultas Teknik Universitas Sultan Ageng Tirtayasa



**Nanang Krisdianto, S.T., M.Kom.**
NIP. 197504092006041004

</div>

---

# PRAKATA

Puji dan syukur senantiasa Penulis panjatkan ke hadirat Allah SWT atas limpahan rahmat, taufik, dan karunia-Nya, sehingga Penulis dapat menyelesaikan laporan skripsi yang berjudul **"Perancangan Dan Implementasi Sistem Pendukung Keputusan Sinyal Trading Forex Berbasis Multi Analisis Dengan Integrasi Metatrader 5 Dan Telegram"**. Shalawat serta salam semoga senantiasa tercurahkan kepada junjungan Nabi Besar Muhammad SAW, segenap keluarga, sahabat, serta umatnya hingga akhir zaman.

Skripsi ini disusun sebagai salah satu syarat akademik guna menyelesaikan studi tingkat sarjana dan meraih gelar Sarjana Komputer (S.Kom.) pada Program Studi Informatika, Fakultas Teknik, Universitas Sultan Ageng Tirtayasa.

Dalam proses perancangan arsitektur sistem, implementasi kode sumber perangkat lunak, pengujian sinyal perdagangan secara empiris pada kondisi pasar nyata (*forward testing*), hingga perampungan naskah laporan ini, Penulis memperoleh banyak bimbingan, arahan keilmuan, motivasi, serta bantuan berharga dari berbagai pihak. Oleh sebab itu, dengan rasa takzim dan ketulusan hati yang mendalam, Penulis menyampaikan ucapan terima kasih dan penghargaan setinggi-tingginya kepada:

1. **Prof. Dr. Ir. H. Fatah Sulaiman, S.T., M.T.**, selaku Rektor Universitas Sultan Ageng Tirtayasa.
2. **Prof. Dr. Jayanudin, S.T., M.Eng.**, selaku Dekan Fakultas Teknik Universitas Sultan Ageng Tirtayasa.
3. **Nanang Krisdianto, S.T., M.Kom.**, selaku Ketua Program Studi Informatika Fakultas Teknik Universitas Sultan Ageng Tirtayasa, atas segala kebijakan dan fasilitasi akademik yang diberikan.
4. **Nanang Krisdianto, S.T., M.Kom.**, selaku Dosen Pembimbing I, yang senantiasa meluangkan waktu berharga untuk memberikan bimbingan konseptual, transfer wawasan keilmuan yang luas, motivasi, serta kesabaran membimbing Penulis dari awal hingga terselesaikannya skripsi ini.
5. **Arief Rahman, S.Kom., M.Kom.**, selaku Dosen Pembimbing II, yang telah mencurahkan ketelitian analitis, bimbingan teknis rekayasa perangkat lunak, serta saran-saran konstruktif dalam penyempurnaan implementasi sistem dan penulisan naskah penelitian ini.
6. Bapak dan Ibu Dosen serta segenap Staf Akademik Program Studi Informatika Fakultas Teknik Untirta atas bekal ilmu pengetahuan, dedikasi pengajaran, serta pelayanan administrasi yang sangat baik selama masa studi Penulis.
7. Teristimewa dan penuh sembah sujud kepada kedua orang tua tercinta serta segenap keluarga besar, yang tiada henti melangitkan doa tulus, memberikan limpahan kasih sayang yang tak bertepi, pengorbanan moril maupun materiil, serta dorongan semangat hidup yang menjadi kekuatan utama bagi keberhasilan Penulis.
8. Perempuan manis yang senantiasa setia membersamai perjalanan perkuliahan Penulis, memberikan limpahan doa, perhatian tulus, kesabaran, serta menjadi penyokong terbaik yang senantiasa menguatkan langkah Penulis untuk terus berjuang hingga mampu menuntaskan skripsi ini dengan baik.
9. Rekan-rekan mahasiswa Program Studi Informatika angkatan 2022, sahabat-sahabat seperjuangan, serta rekan-rekan komunitas pedagang valuta asing (*trader community*) yang telah bersedia memberikan masukan praktis dan berpartisipasi dalam mengevaluasi keandalan sinyal sistem ini.

Penulis menyadari sepenuhnya bahwa penyusunan skripsi ini masih memiliki keterbatasan. Oleh karena itu, kritik dan saran konstruktif dari pembaca sangat diharapkan demi penyempurnaan karya ilmiah di masa mendatang. Akhir kata, semoga karya ini dapat memberikan manfaat nyata bagi kemajuan ilmu pengetahuan, khususnya di bidang sistem cerdas pendukung keputusan (*decision support system*) dan komputasi finansial.

<div align='right'>

Cilegon, ......................... 2026
Penulis,


**M DZIKRI ZEN**
NIM. 3337220109

</div>

---

# RINGKASAN

<div align='center'>

**PERANCANGAN DAN IMPLEMENTASI SISTEM PENDUKUNG KEPUTUSAN SINYAL TRADING FOREX BERBASIS MULTI ANALISIS DENGAN INTEGRASI METATRADER 5 DAN TELEGRAM**

Oleh: **M DZIKRI ZEN** (NIM. 3337220109)

Pembimbing: 1. Nanang Krisdianto, S.T., M.Kom.
2. Arief Rahman, S.Kom., M.Kom.

</div>

Volatilitas tinggi pasar emas (XAU/USD) kerap menimbulkan subjektivitas analisis dan bias emosional pada pedagang harian. Penelitian ini merancang dan mengimplementasikan Sistem Pendukung Keputusan (*Decision Support System* – DSS) sinyal *trading* berbasis aturan cerdas menggunakan Python 3.11 yang terintegrasi dengan MetaTrader 5 dan Telegram Bot API. Sistem menerapkan arsitektur inferensi bertingkat *5-Gate Validation* yang mengombinasikan *Multi-Timeframe Analysis* (MTA), deteksi pola *candlestick*, *Fibonacci Retracement*, zona *Support & Resistance* (SNR), *Supply & Demand* (SND), serta manajemen risiko dinamis berbasis *Average True Range* (ATR). Pengujian *Black Box Testing* membuktikan kelulusan **100%** dengan latensi sinyal 0,8–1,2 detik. Pada *forward testing* 170 sinyal riil (163 sinyal terevaluasi) selama 19 Agustus – 30 September 2026, sistem mencatatkan *Win Rate* **66,9%**, *Average Realized RR* **1,72**, dan *Mathematical Expectancy* **+0,820R per sinyal**, membuktikan keunggulan statistik jangka panjang yang objektif dan terukur.

**Kata Kunci:** *Decision Support System, 5-Gate Validation, Multi-Timeframe Analysis, XAU/USD, Telegram Bot.*

---

# ABSTRACT

<div align='center'>

*DESIGN AND IMPLEMENTATION OF A MULTI-ANALYSIS RULE-BASED DECISION SUPPORT SYSTEM FOR FOREX TRADING SIGNALS WITH METATRADER 5 AND TELEGRAM INTEGRATION*

By: *M DZIKRI ZEN* (NIM. 3337220109)

Supervisors: 1. Nanang Krisdianto, S.T., M.Kom.
2. Arief Rahman, S.Kom., M.Kom.

</div>

*The high volatility of gold (XAU/USD) trading frequently induces analytical subjectivity and emotional bias among retail traders. This study designs and implements an intelligent rule-based Decision Support System (DSS) for forex trading signals using Python 3.11, integrated with MetaTrader 5 and Telegram Bot API. The system employs a 5-Gate Validation inference architecture combining Multi-Timeframe Analysis (MTA), candlestick pattern recognition, Fibonacci Retracement, Support & Resistance (SNR), Supply & Demand (SND) zones, and dynamic ATR-based risk management. Black Box Testing verified 100% functional validity with a signal latency of 0.8–1.2 seconds. In forward testing across 170 real signals (163 resolved) from August 19 to September 30, 2026, the system achieved an Overall Win Rate of 66.9%, Average Realized RR of 1.72, and a Mathematical Expectancy of +0.820R per trade, validating a robust statistical edge for objective, disciplined trading recommendations.*

**Keywords:** *Decision Support System, 5-Gate Validation, Multi-Timeframe Analysis, XAU/USD, Telegram Bot.*

---

# DAFTAR ISI

```text
HALAMAN JUDUL .......................................................................... i
HALAMAN PERNYATAAN KEASLIAN ............................................................ ii
HALAMAN PENGESAHAN ..................................................................... iii
PRAKATA ................................................................................ iv
RINGKASAN .............................................................................. vi
ABSTRACT ............................................................................... vii
DAFTAR ISI ............................................................................. viii
DAFTAR TABEL ........................................................................... x
DAFTAR GAMBAR .......................................................................... xi
DAFTAR LISTING PROGRAM ................................................................. xii
DAFTAR LAMPIRAN ........................................................................ xiii

BAB I PENDAHULUAN
  1.1 Latar Belakang ................................................................... 1
  1.2 Rumusan Masalah .................................................................. 4
  1.3 Batasan Masalah .................................................................. 4
  1.4 Tujuan Penelitian ................................................................ 5
  1.5 Manfaat Penelitian ............................................................... 5

BAB II TINJAUAN PUSTAKA
  2.1 Karakteristik Pasar Forex dan Instrumen XAU/USD .................................. 7
  2.2 Konsep Decision Support System (DSS) dan Rule-Based System ....................... 10
  2.3 Pendekatan Analisis Teknikal dan Indikator Kuantitatif ........................... 13
  2.4 Price Action, Candlestick Pattern, dan Level Struktur Pasar ...................... 18
  2.5 Multi-Timeframe Analysis (MTA) dan Sinergi Kerangka Waktu ........................ 23
  2.6 Arsitektur MetaTrader 5 API dan Telegram Bot API ................................. 26

BAB III METODOLOGI PENELITIAN
  3.1 Jenis Penelitian ................................................................. 30
  3.2 Objek Penelitian ................................................................. 31
  3.3 Metode Pengumpulan Data .......................................................... 32
  3.4 Analisis dan Perancangan Sistem .................................................. 34
  3.5 Perancangan Logika Inferensi 5-Gate Validation ................................... 41
  3.6 Perancangan Manajemen Risiko dan SL/TP Dinamis ................................... 48

BAB IV HASIL DAN PEMBAHASAN
  4.1 Hasil Implementasi Sistem ........................................................ 54
  4.2 Implementasi Modul Akuisisi Data dan Ekstraksi Fitur ............................. 59
  4.3 Implementasi Rule-Based Decision Engine .......................................... 67
  4.4 Implementasi Penentuan Entry, Stop Loss, Take Profit, dan RR ..................... 75
  4.5 Implementasi Validasi Sinyal (Pencegahan Sinyal Palsu) ........................... 80
  4.6 Implementasi Antarmuka Telegram Bot dan Pelacakan Real-Time ...................... 83
  4.7 Pengujian Sistem (Fungsional dan Integrasi) ...................................... 86
  4.8 Pengujian Kinerja Sinyal Trading (Forward Testing Live XAU/USD) .................. 90
  4.9 Pembahasan (Discussion, Benchmarking, dan Evaluasi Kritis) ....................... 99

BAB V KESIMPULAN DAN SARAN
  5.1 Kesimpulan ....................................................................... 106
  5.2 Saran ............................................................................ 108

DAFTAR PUSTAKA ......................................................................... 110
LAMPIRAN ............................................................................... 114
```

---

# DAFTAR TABEL

```text
Tabel 3.1 Komponen Penilaian Skor Pemicu (Trigger Score) ................................ 44
Tabel 3.2 Jadwal Pelaksanaan Penelitian Tugas Akhir ...................................... 53
Tabel 4.1 Spesifikasi Lingkungan Implementasi Sistem .................................... 55
Tabel 4.2 Deskripsi Modul Fungsional Sistem ............................................. 58
Tabel 4.3 Spesifikasi Kerangka Waktu Data Pasar ......................................... 60
Tabel 4.4 Parameter Konfigurasi Indikator Berdasarkan Kerangka Waktu .................... 63
Tabel 4.5 Matriks Hierarki Timeframe dan Mode Perdagangan ............................... 65
Tabel 4.6 Peran Fungsional Setiap Kerangka Waktu ....................................... 66
Tabel 4.7 Klasifikasi Pola Candlestick dalam Sistem ..................................... 68
Tabel 4.8 Konfigurasi Level Rasio Fibonacci Retracement ................................. 70
Tabel 4.9 Parameter Deteksi Support dan Resistance Horizontal ........................... 71
Tabel 4.10 Parameter Deteksi Zona Supply dan Demand ..................................... 73
Tabel 4.11 Parameter EMA Berdasarkan Kerangka Waktu .................................... 74
Tabel 4.12 Kondisi Validasi MACD dalam Sistem ........................................... 76
Tabel 4.13 Aturan Penggunaan Indikator RSI .............................................. 78
Tabel 4.14 Spesifikasi Logika Gerbang Keputusan Sinyal BUY .............................. 80
Tabel 4.15 Komponen Penilaian Skor Pemicu BUY (Maksimal 6 Poin) ......................... 81
Tabel 4.16 Komponen Penilaian Skor Pemicu SELL (Maksimal 6 Poin) ........................ 83
Tabel 4.17 Taksonomi Label Alasan Penolakan Sinyal (Reject Conditions) ................... 85
Tabel 4.18 Sistem Pembobotan Komponen Konfluensi Analisis ............................... 86
Tabel 4.19 Hasil Pengujian Fungsional Black Box Testing .................................. 88
Tabel 4.20 Rekapitulasi Distribusi Hasil Pengujian Sinyal Live XAU/USD .................. 91
Tabel 4.21 Distribusi Kinerja Sinyal Berdasarkan Kerangka Waktu ......................... 93
Tabel 4.22 Distribusi Kinerja Sinyal Berdasarkan Arah Transaksi ......................... 95
Tabel 4.23 Distribusi Kinerja Sinyal Berdasarkan Mode Strategi .......................... 96
Tabel 4.24 Tingkat Akurasi Komponen Analisis Teknikal dalam Sinyal Menang ............... 97
Tabel 4.25 Perbandingan Kinerja Sistem DSS terhadap Penelitian Terdahulu ................ 100
Tabel L.1  Sampel Log Riwayat Transaksi Sinyal Live XAU/USD ............................. 116
Tabel L.2  Matriks Spesifikasi Aturan Validasi 5-Gate .................................... 119
```

---

# DAFTAR GAMBAR

```text
Gambar 3.1 Model Waterfall ............................................................. 30
Gambar 3.2 Kerangka Alur Penelitian .................................................... 31
Gambar 3.3 Hasil Perancangan Awal Alur Kerja DSS ....................................... 34
Gambar 3.4 Arsitektur Modular Sistem Pendukung Keputusan Sinyal Trading ................. 37
Gambar 3.5 Diagram Alir Mekanisme Inferensi 5-Gate Validation ........................... 42
Gambar 3.6 Format Antarmuka Notifikasi Sinyal Rekomendasi Telegram Bot .................. 50
Gambar 4.1 Inisialisasi Layanan Sistem Bot ............................................. 56
Gambar 4.2 Tampilan Kuotasi XAU/USD pada Terminal MT5 .................................. 57
Gambar 4.3 Lingkungan Operasional Sistem pada VPS ...................................... 57
Gambar 4.4 Alur Sistem Keseluruhan ..................................................... 58
Gambar 4.5 Proses Eksekusi Decision Engine ............................................. 59
Gambar 4.6 Log Terminal Verifikasi Keberhasilan Koneksi MT5 ............................ 61
Gambar 4.7 Format Pesan Notifikasi Rekomendasi Sinyal Trading Telegram ................ 84
```

---

# DAFTAR LISTING PROGRAM

```text
Listing 4.1 Implementasi Kode Modul Koneksi MetaTrader 5 (mt5/connector.py) ............. 60
Listing 4.2 Implementasi Fungsi Pengambilan Data OHLCV MT5 (mt5/market_data.py) ......... 62
Listing 4.3 Konfigurasi Indikator Berdasarkan Kerangka Waktu (features/indicators.py) ... 63
Listing 4.4 Fungsi Kalkulasi Vektorisasi Indikator Teknikal (features/indicators.py) ..... 64
Listing 4.5 Implementasi Logika Pemilihan Kerangka Waktu Konfirmasi (engine/utils.py) ... 66
Listing 4.6 Implementasi Deteksi Pola Candlestick dan Filter Rasio Badan ................ 68
Listing 4.7 Implementasi Konfigurasi Fibonacci Retracement (features/fibonacci.py) ...... 70
Listing 4.8 Implementasi Algoritma Penentuan Zona SNR dan Penilaian Sentuhan ............ 71
Listing 4.9 Algoritma Identifikasi Zona Supply dan Demand Institusional ................. 73
Listing 4.10 Evaluasi Kelurusan Garis EMA Multi-Timeframe (engine/trigger.py) ............ 74
Listing 4.11 Evaluasi Kondisi Histogram MACD pada Mesin Inferensi (engine/trigger.py) .... 76
Listing 4.12 Pengecekan Ambang Batas dan Kemiringan RSI (engine/trigger.py) .............. 78
Listing 4.13 Logika Deteksi Bias Makro dan Evaluasi Skor Pemicu BUY ..................... 81
Listing 4.14 Logika Deteksi Bias Makro dan Evaluasi Skor Pemicu SELL .................... 82
```

---

# DAFTAR LAMPIRAN

```text
Lampiran 1 Kode Program Utama Sistem Pendukung Keputusan ............................. 114
  1.1 Titik Masuk Eksekusi Utama (src/main.py) ....................................... 114
  1.2 Mesin Inferensi Keputusan (src/engine/anytf_mta_engine.py) ..................... 123
  1.3 Evaluasi Bias Makro Multi-Timeframe (src/engine/bias.py) ....................... 134
  1.4 Evaluasi Skor Pemicu Dinamis (src/engine/trigger.py) ........................... 140
  1.5 Evaluasi Konfluensi Multi-Level (src/engine/confluence.py) ..................... 146
  1.6 Kalkulasi Manajemen Risiko SL/TP Dinamis (src/risk/sl_tp.py) ................... 153
  1.7 Ekstraksi Pola Candlestick Rejection (src/features/patterns.py) ................ 162
  1.8 Ekstraksi Fibonacci Retracement (src/features/fibonacci.py) .................... 164
  1.9 Ekstraksi Support & Resistance Horizontal (src/features/zones_snr.py) .......... 171
  1.10 Ekstraksi Zona Supply & Demand (src/features/zones_snd.py) .................... 178
  1.11 Konektor MetaTrader 5 (src/mt5/connector.py) .................................. 184
  1.12 Notifikasi Telegram Bot API (src/notify/telegram.py) .......................... 185
  1.13 Pelacak Status Transaksi Real-Time (src/infra/signal_tracker.py) .............. 187
Lampiran 2 Rekapitulasi Sampel Log Sinyal Perdagangan Hasil Forward Testing .......... 194
Lampiran 3 Format Pesan dan Bukti Komunikasi Antarmuka Telegram Bot API .............. 196
  3.1 Format Notifikasi Sinyal Baru (New Signal Alert) ............................... 196
  3.2 Format Notifikasi Pembaruan Status Transaksi (Trade Outcome Alert) ............. 196
Lampiran 4 Spesifikasi Parameter Gerbang Inferensi (5-Gate Validation Framework) ..... 197
```
