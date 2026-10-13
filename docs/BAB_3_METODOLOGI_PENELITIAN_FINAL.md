# BAB III METODOLOGI PENELITIAN

## 3.1 Jenis Penelitian
Penelitian ini merupakan penelitian rekayasa perangkat lunak terapan yang berfokus pada perancangan, pembangunan, dan implementasi Sistem Pendukung Keputusan (*Decision Support System* – DSS) berbasis aturan cerdas (*rule-based intelligent system*) untuk menghasilkan rekomendasi sinyal *trading forex* pada pasangan instrumen XAU/USD. Karena penelitian ini bertujuan membangun artefak perangkat lunak yang andal dan terstruktur, pendekatan pengembangan sistem mengadopsi model sekuensial linier *Waterfall*.

![Gambar 3.1 Model Waterfall](Skripsi%20Benji%20(1)_files/image002.png)
*Gambar 3.1 Model Waterfall*

Model *Waterfall* dipilih karena kebutuhan sistem telah didefinisikan secara komprehensif sejak awal penelitian. Tahapan pengembangan dilakukan secara berurutan dan terstruktur, meliputi analisis kebutuhan sistem, perancangan arsitektur dan logika inferensi, implementasi kode program, demonstrasi dan pengujian operasional, hingga dokumentasi dan evaluasi performa sistem.

---

## 3.2 Objek Penelitian
Objek dalam penelitian ini adalah **Sistem Pendukung Keputusan (*Decision Support System* - DSS)** sinyal *trading forex* berbasis aturan cerdas (*rule-based intelligent system*) khusus untuk pasangan mata uang dan komoditas emas terhadap dolar Amerika Serikat (**XAU/USD**). Sistem ini dibangun untuk memberikan rekomendasi keputusan transaksi (*Buy*, *Sell*, atau *No Signal*) yang objektif, terukur, dan transparan, tanpa melakukan eksekusi order otomatis (*non auto-trading*).

Secara operasional, objek penelitian terdiri atas dua entitas utama:
1. **Perangkat Lunak DSS Cerdas (*Software Engine*):**  
   Aplikasi berbasis bahasa pemrograman Python yang mengintegrasikan pustaka analisis data kuantitatif (*Pandas*, *NumPy*, *TA-Lib*) untuk mengolah data pergerakan harga pasar secara *real-time*, melakukan kalkulasi indikator teknikal, mendeteksi pola harga (*price action*), mengevaluasi aturan melalui mesin inferensi berjenjang (*5-gate validation*), menghitung manajemen risiko dinamis (*Stop Loss*, *Take Profit*, dan *Risk-to-Reward Ratio*), serta mendistribusikan sinyal secara otomatis melalui antarmuka Telegram Bot API.
2. **Data Pasar Keuangan (*Market Price Feed*):**  
   Data deret waktu (*time series*) berupa data *candlestick* Open, High, Low, Close, dan Volume (OHLCV) pasangan XAU/USD yang diperoleh secara langsung (*real-time streaming*) dari platform MetaTrader 5 (MT5) melalui pustaka resmi `MetaTrader5` Python API. Data mencakup kerangka waktu multi-skala (*multi-timeframe*), yaitu M5, M15, H1, H4, dan D1.

---

## 3.3 Metode Pengumpulan Data
Metode pengumpulan data yang diterapkan dalam penelitian ini dirancang untuk memastikan keabsahan teoritis dan keandalan data empiris pergerakan pasar, yang terbagi ke dalam dua metode:

### 3.3.1 Studi Literatur (*Secondary Data Collection*)
Pengumpulan landasan teoritis dan kajian pembanding dilakukan dengan menelaah literatur ilmiah yang relevan, mencakup:
1. Jurnal ilmiah terindeks (nasional terakreditasi dan internasional bereputasi) mengenai *Decision Support System* (DSS), *Rule-Based Expert System*, dan integrasi indikator analisis teknikal dalam pasar valuta asing.
2. Buku referensi serta publikasi akademik mengenai konsep *Price Action*, *Multi-Timeframe Analysis* (MTA), *Fibonacci Retracement*, serta manajemen risiko keuangan.
3. Dokumentasi resmi teknologi pengembang, meliputi dokumentasi resmi Python 3.11, MetaTrader 5 API Documentation, dan Telegram Bot API.

### 3.3.2 Pengumpulan Data Pasar (*Primary Data Collection*)
Data primer diperoleh langsung dari server broker pasar keuangan melalui jembatan komunikasi MetaTrader 5 Python API. Karakteristik pengumpulan data primer meliputi:
1. **Instrumen Pengamatan:** XAU/USD (Spot Gold vs US Dollar).
2. **Struktur Data:** Data batang (*bar*) candlestick OHLCV lengkap dengan penanda waktu (*timestamp* zona WIB / GMT+7).
3. **Kuantitas Riwayat Data:** Sistem mengambil riwayat sebanyak 800 bar *candlestick* historis per *timeframe* saat inisialisasi awal. Kuantitas ini dirancang untuk memastikan kestabilan kalkulasi indikator jangka panjang, khususnya Exponential Moving Average periode 200 (EMA 200).
4. **Mekanisme Akuisisi:** Data diperbarui secara berkala pada setiap penutupan batang harga (*candle close*) pada *timeframe* aktif guna mencegah bias perhitungan akibat fluktuasi harga berjalan (*repainting*).

---

## 3.4 Analisis dan Perancangan Sistem

### 3.4.1 Analisis Kebutuhan Sistem
Analisis kebutuhan dilakukan untuk mendefinisikan spesifikasi fungsional dan operasional sistem secara komprehensif.

#### A. Kebutuhan Fungsional (*Functional Requirements*)
1. **Konektivitas Data:** Sistem harus mampu melakukan inisialisasi koneksi otomatis, verifikasi status jaringan, dan penarikan data OHLCV dari terminal MetaTrader 5.
2. **Kalkulasi Indikator Teknikal:** Sistem harus mampu menghitung nilai indikator secara otomatis:
   - *Exponential Moving Average* (EMA periode 20, 50, dan 200).
   - *Relative Strength Index* (RSI periode 14) beserta tren kemiringan (*slope*).
   - *Moving Average Convergence Divergence* (MACD parameter 12, 26, 9) beserta histogram.
   - *Average True Range* (ATR periode 14) untuk dasar volatilitas harga.
3. **Deteksi Struktur Pasar & Konfluensi:**
   - Deteksi pola *candlestick* (*Engulfing*, *Pin Bar / Hammer*, *Inside Bar*).
   - Deteksi level *Support & Resistance* (SNR) horizontal berbasis *swing high/low*.
   - Deteksi zona *Supply & Demand* (SND) berbasis area konsolidasi (*base*).
   - Kalkulasi level rasio *Fibonacci Retracement* (38.2%, 50.0%, 61.8%).
4. **Mesin Pengambilan Keputusan (*Rule-Based Decision Engine*):**
   - Mampu mengevaluasi kondisi pasar menggunakan model validasi bertingkat 5 gerbang (*5-Gate Validation*).
   - Menghitung skor pemicu (*Trigger Score*) dan skor konfluensi (*Confluence Score*).
5. **Kalkulasi Parameter Eksekusi Transaksi:**
   - Menentukan level harga *Entry*, *Stop Loss* (SL), dan tiga target *Take Profit* (TP1, TP2, TP3) secara dinamis berbasis volatilitas ATR dan level struktur pasar.
   - Memastikan rasio *Risk-to-Reward* struktural minimal memenuhi ambang batas (minimal 1:1,0 s.d. 1:1,25).
6. **Notifikasi dan Pelaporan:**
   - Mengirimkan format sinyal transaksi secara instan ke kanal Telegram Bot.
   - Mencatat seluruh riwayat pembentukan sinyal, alasan penolakan (*reject gate*), dan hasil akhir evaluasi ke dalam berkas CSV dan JSON secara *thread-safe*.

#### B. Kebutuhan Non-Fungsional (*Non-Functional Requirements*)
1. **Kinerja & Latensi (*Performance*):** Waktu komputasi evaluasi sinyal sejak terjadinya peristiwa penutupan *candle* (*candle close event*) hingga pengiriman pesan Telegram tidak melebihi 2 detik.
2. **Keandalan & Ketersediaan (*Reliability & Availability*):** Sistem beroperasi secara kontinu selama jam perdagangan aktif pasar forex (24 jam per hari, 5 hari per minggu) pada lingkungan Virtual Private Server (VPS).
3. **Transparansi (*Interpretability*):** Setiap sinyal rekomendasi harus menyertakan argumen teknikal yang mendasari keputusan, rincian skor pemicu, dan skor konfluensi (*explainable decision*).
4. **Integritas Data:** Sistem dilengkapi mekanisme penyaring sesi (*session filter*) dan *cooldown period* untuk mencegah pengiriman sinyal ganda (*duplicate/spam signals*) pada kondisi pasar abnormal.

### 3.4.2 Kerangka Penelitian
Kerangka penelitian disusun untuk menggambarkan alur sistematis pelaksanaan penelitian mulai dari identifikasi permasalahan hingga tahap evaluasi performa sistem.

![Gambar 3.2 Kerangka Alur Penelitian](Skripsi%20Benji%20(1)_files/image003.png)
*Gambar 3.2 Kerangka Alur Penelitian*

Sebagaimana digambarkan pada Gambar 3.2, penelitian berawal dari perumusan latar belakang tingginya volatilitas instrumen XAU/USD dan kelemahan analisis subjektif, dilanjutkan dengan studi kepustakaan, analisis kebutuhan, perancangan arsitektur dan aturan *rule-based*, implementasi modular, pengujian empiris, hingga analisis hasil laporan performa sinyal.

### 3.4.3 Perancangan Alur Kerja Awal Sistem DSS
Perancangan awal sistem DSS dituangkan ke dalam diagram alir (*flowchart*) untuk memetakan logika kerja sistem dari inisialisasi hingga penerbitan sinyal.

![Gambar 3.3 Hasil Perancangan Awal Alur Kerja DSS](Skripsi%20Benji%20(1)_files/image004.png)
*Gambar 3.3 Hasil Perancangan Awal Alur Kerja DSS*

Alur sistem dimulai dari inisialisasi parameter konfigurasi, pemeriksaan status konektivitas ke MetaTrader 5 API, penarikan data OHLCV multi-timeframe, penungguan peristiwa penutupan bar (*candle close*), ekstraksi fitur teknikal, evaluasi aturan *decision engine*, kalkulasi parameter risiko SL/TP, hingga distribusi sinyal ke Telegram Bot dan pencatatan log histori.

### 3.4.4 Arsitektur Sistem Modular DSS
Arsitektur sistem dibangun dengan pendekatan modular 6 lapisan (*multi-tier architecture*), yang memisahkan tanggung jawab penarikan data, komputasi analitik, logika penalaran, dan distribusi pelaporan.

```
+-----------------------------------------------------------------------------------+
|                            TERMINAL METATRADER 5 (MT5)                            |
|                     (Penyedia Data Harga & Umpan Pasar XAU/USD)                   |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 1. LAPISAN PENGAMBILAN DATA & PENJADWALAN (DATA INGESTION & SCHEDULER)            |
|    - mt5/connector.py    : Autentikasi koneksi & pemulihan putus sambung jaringan |
|    - mt5/market_data.py  : Penarikan data bar OHLCV multi-timeframe (M5 - D1)     |
|    - infra/scheduler.py  : Pendeteksi event penutupan bar (candle close event)    |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. LAPISAN EKSTRAKSI FITUR ANALISIS TEKNIKAL (FEATURE EXTRACTION LAYER)           |
|    - features/indicators.py : Kalkulasi EMA (20/50/200), RSI, MACD, dan ATR       |
|    - features/patterns.py   : Pengenalan pola candlestick (Engulfing, Pin Bar)    |
|    - features/zones_snr.py  : Pemetaan level Support & Resistance horizontal      |
|    - features/zones_snd.py  : Identifikasi zona Supply & Demand Base              |
|    - features/fibonacci.py  : Kalkulasi level rasio Fibonacci Retracement         |
|    - features/session.py    : Filter sesi pasar aktif (Asian, London, New York)   |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. MESIN PENALARAN ATURAN CERDAS (RULE-BASED INFERENCE & DECISION ENGINE)         |
|    (engine/anytf_mta_engine.py)                                                   |
|    - Gate 1 : Validasi kecukupan data, kelayakan ATR, sesi, dan cooldown          |
|    - Gate 2 : Penentuan arah tren makro (HTF Bias: H1 / H4 EMA Alignment)         |
|    - Gate 3 : Evaluasi skor pemicu teknikal (Trigger Score >= Threshold)          |
|    - Gate 4 : Kalkulasi level harga dinamis (Dynamic Stop Loss & Multi Take Profit|
|    - Gate 5 : Validasi skor konfluensi terbobot (Confluence Score) & Rasio RR >= 1|
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 4. LAPISAN DISTRIBUSI NOTIFIKASI & PELAPORAN (NOTIFICATION & REPORTING LAYER)     |
|    - notify/telegram.py     : Distribusi sinyal ke bot Telegram secara instan     |
|    - infra/signal_logger.py : Persistensi riwayat sinyal ke format CSV & JSON     |
|    - infra/signal_tracker.py: Pemantauan real-time harga terhadap status TP/SL    |
|    - infra/report/          : Pembuatan laporan performa analitik & kurva ekuitas |
+-----------------------------------------------------------------------------------+
```
*Gambar 3.4 Arsitektur Modular Sistem Pendukung Keputusan Sinyal Trading*

### 3.4.5 Logika Pengambilan Keputusan (Mekanisme *5-Gate Validation*)
Proses evaluasi kondisi pasar menggunakan model validasi bertingkat 5 gerbang (*5-Gate Validation*):

```
       [Input: Data OHLCV Multi-Timeframe Saat Candle Close]
                                   |
                                   v
                         +-------------------+
                         |      GATE 1       | ----(Gagal)----> [Tolak: Log Reject]
                         |   Filter Dasar    |
                         +-------------------+
                                   | (Lolos)
                                   v
                         +-------------------+
                         |      GATE 2       | ----(Gagal)----> [Tolak: Bias Netral]
                         |     HTF Bias      |
                         +-------------------+
                                   | (Lolos: Bullish/Bearish)
                                   v
                         +-------------------+
                         |      GATE 3       | ----(Gagal)----> [Tolak: Skor Pemicu Rendah]
                         |   Trigger Score   |
                         +-------------------+
                                   | (Lolos: Skor >= Threshold)
                                   v
                         +-------------------+
                         |      GATE 4       | ----(Gagal)----> [Tolak: SL/TP Tidak Valid]
                         |  Kalkulasi SL/TP  |
                         +-------------------+
                                   | (Lolos)
                                   v
                         +-------------------+
                         |      GATE 5       | ----(Gagal)----> [Tolak: Konfluensi/RR Rendah]
                         | Konfluensi & RR   |
                         +-------------------+
                                   | (Lolos Seluruh Gate)
                                   v
               [Penerbitan Sinyal Rekomendasi BUY / SELL ke Telegram]
```
*Gambar 3.5 Diagram Alir Mekanisme Inferensi 5-Gate Validation*

#### 1. Gate 1 — Filter Validitas Data, Sesi, dan *Cooldown*
- **Ketersediaan Bar:** Minimal 200 bar historis tersedia utuh.
- **Kondisi ATR:** Nilai volatilitas ATR(14) berada pada batas wajar (tidak nol).
- **Jam Sesi Perdagangan:** Filter sesi aktif (kecualikan pergantian hari server 02:00 - 06:00 WIB).
- ***Cooldown Filter*:** Memastikan jarak sinyal baru dengan sinyal sebelumnya memenuhi batas interval minimal.

#### 2. Gate 2 — Analisis Bias Tren Tingkat Tinggi (*Higher Timeframe Bias*)
- **Bias BULLISH:** Harga penutupan di atas EMA 200, posisi garis EMA 50 di atas EMA 200, dan kemiringan EMA 50 naik (pada H1 & H4).
- **Bias BEARISH:** Harga penutupan di bawah EMA 200, posisi garis EMA 50 di bawah EMA 200, dan kemiringan EMA 50 turun (pada H1 & H4).
- **Bias NETRAL:** Bila kondisi berlawanan, sinyal dibatalkan.

#### 3. Gate 3 — Evaluasi Skor Pemicu (*Trigger Score*)
Sistem menguji konfirmasi teknikal pada timeframe eksekusi (M5 atau M15). Sinyal dinyatakan lolos jika mencapai skor minimal $\ge 3$ (mode *scalping*) atau $\ge 4$ (mode *intraday*).

**Tabel 3.1 Komponen Penilaian Skor Pemicu (Trigger Score)**

| No | Parameter Pengujian | Kondisi Sinyal BUY | Kondisi Sinyal SELL | Bobot Skor |
|:--:|---|---|---|:--:|
| 1 | **EMA 200 (Wajib)** | $Close > EMA_{200} - 0.2 \times ATR$ | $Close < EMA_{200} + 0.2 \times ATR$ | +1 |
| 2 | **EMA 50 Pullback** | Jarak $Close$ ke $EMA_{50} \le 1.5 \times ATR$ | Jarak $Close$ ke $EMA_{50} \le 1.5 \times ATR$ | +1 |
| 3 | **EMA Alignment** | $EMA_{20} > EMA_{50} > EMA_{200}$ | $EMA_{20} < EMA_{50} < EMA_{200}$ | +1 |
| 4 | **RSI Confirmation** | $RSI < 65$ dan tren kemiringan naik | $RSI > 35$ dan tren kemiringan turun | +1 |
| 5 | **MACD Histogram** | Histogram saat ini > histogram sebelumnya | Histogram saat ini < histogram sebelumnya | +1 |
| 6 | **Candle Direction**| $Close > Open$ (*Bullish Candle*) | $Close < Open$ (*Bearish Candle*) | +1 |

#### 4. Gate 4 — Perhitungan Parameter Risiko (*Risk Management Engine*)
- **Entry:** Harga penutupan *candle* validasi saat ini.
- **Stop Loss (SL):**
  $$\text{SL}_{\text{Buy}} = \text{Entry} - \max(\text{SwingLow}_{\text{offset}}, 1.5 \times \text{ATR})$$
  $$\text{SL}_{\text{Sell}} = \text{Entry} + \max(\text{SwingHigh}_{\text{offset}}, 1.5 \times \text{ATR})$$
- **Take Profit (Multi-Target):**
  - $\text{TP1} = \text{Entry} \pm (1.0 \times |\text{Entry} - \text{SL}|)$ — Rasio 1:1,0 (Target Konservatif)
  - $\text{TP2} = \text{Entry} \pm (1.5 \times |\text{Entry} - \text{SL}|)$ — Rasio 1:1,5 (Target Struktural Utama)
  - $\text{TP3} = \text{Entry} \pm (2.0 \times |\text{Entry} - \text{SL}|)$ — Rasio 1:2,0 (Target Ekstensi Tren)

#### 5. Gate 5 — Evaluasi Skor Konfluensi & Ambang Rasio *Risk-to-Reward*
- **Kalkulasi Skor Konfluensi (*Weighted Confluence Score*):**
  $$S_{\text{confluence}} = \sum (W_i \times C_i)$$
  Dengan pembobotan komponen:
  - *Supply & Demand Zone* ($W = 2.0$)
  - *Candlestick Pattern* ($W = 1.5$)
  - *RSI / MACD Divergence* ($W = 1.5$)
  - *Fibonacci Golden Ratio 50%-61.8%* ($W = 1.5$)
  - *Support & Resistance Horizontal Level* ($W = 1.0$)
- **Ambang Rasio Risk-to-Reward (RR):** Nilai rasio struktural menuju TP2 harus memenuhi ambang batas minimal $\text{RR} \ge 1:1.0$ dan tidak terhalang level batas harga penting (*SNR blocked*).

### 3.4.6 Perancangan Antarmuka Pengguna (*Telegram Bot Interface*)
Keluaran sistem didistribusikan kepada pengguna melalui aplikasi pesan instan Telegram:

```text
🚨 [DSS SIGNAL ALERT — XAU/USD] 🚨
--------------------------------------
Arah Transaksi : BUY / LONG
Timeframe      : M15 (Mode: Trend Following)
Waktu Validasi : 2026-08-25 12:00 WIB
--------------------------------------
📌 Level Eksekusi:
- Entry Price  : 2514.50
- Stop Loss    : 2508.50 (Jarak: 60 pips)
- Take Profit 1: 2520.50 (RR 1:1.0)
- Take Profit 2: 2523.50 (RR 1:1.5)
- Take Profit 3: 2526.50 (RR 1:2.0)
--------------------------------------
🔍 Ringkasan Konfluensi Analisis:
- HTF Bias     : BULLISH (H4 & H1 EMA Alignment)
- Trigger      : Bullish Engulfing + RSI Slope Up
- Zone Level   : Demand Zone M15 + Fib 61.8%
- Total Skor   : Trigger: 5/6 | Confluence: 6.5
--------------------------------------
⚠️ Catatan: Gunakan manajemen lot bijak (Maks Risk 1-2%).
```
*Gambar 3.6 Format Antarmuka Notifikasi Sinyal Rekomendasi Telegram Bot*

---

## 3.5 Metode Pengujian dan Evaluasi

### 3.5.1 Pengujian Fungsional (*Black Box Testing*)
Pengujian fungsional bertujuan untuk memastikan bahwa seluruh fungsi dan antarmuka modul perangkat lunak beroperasi sesuai spesifikasi yang dirancang tanpa kegagalan program:
1. **Pengujian Modul Koneksi MT5:** Validasi inisialisasi, autentikasi akun broker, dan penanganan pemutusan koneksi otomatis.
2. **Pengujian Modul Data Feeder:** Validasi integritas struktur array OHLCV dan sinkronisasi 800 bar historis.
3. **Pengujian Modul Fitur Analisis:** Verifikasi ketepatan formula kalkulasi EMA, RSI, MACD, ATR, pola candlestick, dan rasio Fibonacci dengan membandingkan terhadap pembacaan bawaan MT5.
4. **Pengujian Mesin Aturan (*Decision Engine*):** Validasi penyaringan Gate 1 s.d. Gate 5 pada variasi kondisi pasar nyata.
5. **Pengujian Notifikasi Telegram:** Verifikasi pengiriman pesan instan, format parsing pesan, dan penanganan limit API.

### 3.5.2 Pengujian Kinerja Model Keputusan (*Forward Testing & Metrics*)
Kinerja sistem diuji menggunakan metode *Forward Testing* (pengujian langsung secara berjalan pada kondisi pasar *live*). Setiap sinyal yang diterbitkan dipantau hingga mencapai *Take Profit* atau *Stop Loss*. 

Metrik evaluasi yang digunakan meliputi:
1. **Win Rate (Tingkat Kemenangan):**  
   $$\text{Win Rate} = \left( \frac{\sum \text{Sinyal WIN}}{\sum \text{Total Sinyal Dievaluasi}} \right) \times 100\%$$
2. **Rasio Keuntungan Terhadap Risiko (*Realized Risk-to-Reward Ratio*):**  
   $$\text{Average RR} = \frac{1}{N} \sum_{i=1}^{N} \frac{|\text{Outcome Price}_i - \text{Entry}_i|}{|\text{Entry}_i - \text{SL}_i|}$$
3. **Tingkat Akurasi Komponen Analisis Teknikal:**  
   $$\text{Akurasi Komponen} = \left( \frac{\sum \text{Sinyal WIN dengan Komponen}}{\sum \text{Total Sinyal dengan Komponen}} \right) \times 100\%$$
4. **Kurva Ekuitas Kumulatif (*Cumulative Equity Curve*):**  
   Pola pertumbuhan akumulasi hasil transaksi secara berurutan (+1 untuk WIN, -1 untuk LOSS) untuk menilai stabilitas dan konsistensi sistem jangka panjang.

---

## 3.6 Jadwal Penelitian

Penelitian ini dilaksanakan dalam jangka waktu 3 bulan (Oktober s.d. Desember 2025) dengan tahapan pelaksanaan yang disajikan pada Tabel 3.2.

**Tabel 3.2 Jadwal Pelaksanaan Penelitian Tugas Akhir**

| No | Tahapan Kegiatan | Oktober 2025 | November 2025 | Desember 2025 |
|:--:|---|:---:|:---:|:---:|
| 1 | Identifikasi Masalah & Studi Literatur | ████ | | |
| 2 | Pengumpulan Data Pasar & Analisis Kebutuhan | ████ | | |
| 3 | Perancangan Arsitektur & Logika Sistem DSS | | ████ | |
| 4 | Implementasi Perangkat Lunak & Integrasi API | | ████ | |
| 5 | Pengujian Sistem (*Black Box* & *Forward Testing*) | | | ████ |
| 6 | Analisis Hasil Performa & Penyusunan Laporan TA | | | ████ |
