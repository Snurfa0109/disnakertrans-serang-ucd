# BAB V KESIMPULAN DAN SARAN

## 5.1 Kesimpulan

Berdasarkan hasil perancangan, implementasi, dan pengujian sistem pada periode 19 Agustus hingga 30 September 2026, berikut simpulan atas tiga rumusan masalah penelitian:

1. **[RM-1] Sistem DSS sinyal trading XAU/USD berhasil dirancang dan diimplementasikan** menggunakan Python 3.11 dengan arsitektur enam modul modular terintegrasi (koneksi MT5, akuisisi data OHLCV multi-timeframe, penjadwal anti-repainting, mesin inferensi, notifikasi Telegram, dan pelacak transaksi). Pengujian *Black Box Testing* pada 10 skenario fungsional menunjukkan tingkat kelulusan **100%** dengan latensi sinyal **0,8–1,2 detik**.

2. **[RM-2] Mekanisme 5-Gate Validation terbukti efektif menyaring sinyal** dengan mengombinasikan *Multi-Timeframe Analysis* (MTA), deteksi pola *candlestick*, *Fibonacci Retracement*, zona *Support & Resistance*, dan *Supply & Demand*. Komponen *Fair Value Gap* (80,0%) dan filter badan *candlestick* (71,2%) menjadi kontributor akurasi tertinggi, sementara proteksi `SNR_BLOCKED` dan `ANTI-CHASE` berhasil menekan *loss rate* hingga **33,1%**.

3. **[RM-3] Sistem menghasilkan keunggulan statistik yang terukur** pada *forward testing* 170 sinyal riil: *Overall Win Rate* **66,9%** (dengan M15 73,4% dan M5 71,4%), *Average Realized RR* **1,72**, dan *Mathematical Expectancy* **+0,820R per sinyal**. Sinyal SELL dominan dengan Win Rate 73,6% (vs BUY 52,8%), membuktikan akurasi penyelarasan tren makro sistem secara konsisten.

## 5.2 Saran

Berdasarkan keterbatasan dan temuan selama pengujian, berikut saran pengembangan bagi peneliti berikutnya:

1. **Integrasi Filter Kalender Berita Ekonomi (*Economic Calendar API*):** Mengintegrasikan API kalender ekonomi (misal ForexFactory atau FXStreet) untuk menonaktifkan penerbitan sinyal secara otomatis 30 menit sebelum dan sesudah rilis berita berdampak tinggi (NFP, CPI, FOMC), guna menghindari lonjakan *spread* dan *slippage* yang menjadi salah satu penyebab utama *Hit Stop Loss*.

2. **Optimasi Pembobotan Dinamis Berbasis *Machine Learning*:** Mengeksplorasi integrasi algoritma *Reinforcement Learning* (misalnya Q-Learning atau XGBoost) untuk menggantikan ambang batas skor yang saat ini bersifat konstan (*static threshold*), sehingga sistem mampu beradaptasi dengan perubahan rezim pasar secara dinamis.

3. **Eksekusi Semi-Otomatis dan Pengujian Multi-Instrumen:** Menambahkan tombol *Telegram Inline Keyboard* untuk eksekusi order langsung ke MT5 (*one-click execution* dengan kalkulasi lot otomatis berbasis risiko 1% modal), serta menguji kemampuan generalisasi arsitektur 5-Gate Validation pada instrumen lain seperti EUR/USD, GBP/USD, atau indeks NASDAQ.

