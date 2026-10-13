# BAB IV HASIL DAN PEMBAHASAN

## 4.1 Hasil Implementasi Sistem

Sistem Pendukung Keputusan (*Decision Support System* – DSS) sinyal *trading forex* berbasis aturan cerdas (*rule-based intelligent system*) diimplementasikan untuk menghasilkan rekomendasi transaksi pada instrumen XAU/USD (Spot Gold) secara terukur, objektif, dan transparan. Sistem mengintegrasikan terminal MetaTrader 5 sebagai penyedia kuotasi harga *real-time*, mesin inferensi Python untuk ekstraksi fitur teknikal dan evaluasi bertingkat 5 gerbang (*5-Gate Validation*), serta antarmuka bot Telegram untuk mendistribusikan sinyal secara otomatis kepada pengguna.

Hasil evaluasi analisis diproses menggunakan *rule-based decision engine* untuk menentukan keputusan rekomendasi *BUY*, *SELL*, atau *NO SIGNAL*. Ketika kondisi sinyal memenuhi parameter ambang batas kelulusan, sistem secara otomatis menentukan titik *Entry*, *Stop Loss* (SL), multi-target *Take Profit* (TP1, TP2, TP3), dan rasio *Risk-to-Reward* (RR), lalu meneruskannya secara instan ke kanal komunikasi Telegram dan mencatat seluruh histori ke berkas log.

### 4.1.1 Lingkungan Implementasi

Implementasi sistem dilakukan menggunakan lingkungan pengembangan berbasis Python 3.11 dengan MetaTrader 5 sebagai sumber data harga instrumen XAU/USD dan Telegram sebagai media penyampaian hasil sinyal. Sistem dikembangkan dan diuji menggunakan pustaka analisis kuantitatif seperti Pandas, NumPy, dan TA-Lib untuk mendukung kalkulasi indikator teknikal serta deteksi pola harga.

Selain pada komputer pengembang (*local workstation*), sistem dioperasikan secara kontinu selama 24 jam per hari pada hari kerja aktif pasar valuta asing menggunakan Virtual Private Server (VPS) berspesifikasi komputasi tinggi yang berlokasi di data center Equinix SG1 Singapura untuk menjamin stabilitas latensi koneksi terhadap server broker.

**Tabel 4.1 Spesifikasi Lingkungan Implementasi Sistem**

| No. | Komponen | Keterangan |
| :---: | :--- | :--- |
| 1. | Sistem Operasi | Windows Server 2022 Datacenter 64-bit |
| 2. | Bahasa Pemrograman | Python 3.11.9 64-bit |
| 3. | Sumber Data Pasar | MetaTrader 5 Client Terminal API (MetaTrader5 library v5.0.45) |
| 4. | Instrumen Perdagangan | XAU/USD (Spot Gold vs US Dollar) |
| 5. | Kerangka Waktu (Timeframe) | Multi-Timeframe: M5, M15, H1, H4, D1 |
| 6. | Pustaka Analisis Data | TA-Lib v0.4.28, Pandas v2.2.2, NumPy v1.26.4 |
| 7. | Layanan Notifikasi | Telegram Bot API via HTTP REST Protocol |
| 8. | Penyimpanan Riwayat | Format CSV (*thread-safe append*) & JSON State Persistence |
| 9. | Lingkungan Perangkat Keras VPS | 4 vCPU, RAM 8 GB, NVMe Storage 80 GB |
| 10. | Lokasi Server VPS | Equinix SG1 Singapore (Rata-rata latensi MT5: 12 ms) |

![Gambar 4.1 Inisialisasi Layanan Sistem Bot](Skripsi%20Benji%20(1)_files/image006.png)
*Gambar 4.1 Inisialisasi Layanan Sistem Bot*

![Gambar 4.2 Tampilan Kuotasi XAU/USD pada Terminal MT5](Skripsi%20Benji%20(1)_files/image007.png)
*Gambar 4.2 Tampilan Kuotasi XAU/USD pada Terminal MT5*

![Gambar 4.3 Lingkungan Operasional Sistem pada VPS](Skripsi%20Benji%20(1)_files/image007.png)
*Gambar 4.3 Lingkungan Operasional Sistem pada VPS*

### 4.1.2 Struktur Sistem

Sistem DSS dirancang menggunakan arsitektur modular multi-lapisan (*multi-tier architecture*) yang terbagi ke dalam enam lapisan utama yang bekerja secara sekuensial. Terminal MetaTrader 5 (MT5) berperan sebagai *data feeder* real-time, di mana modul `mt5/connector.py` menangani inisialisasi koneksi IPC socket dan `mt5/market_data.py` mengambil data OHLCV multi-timeframe. Penjadwal `infra/scheduler.py` memantau penutupan lilin (*candle close*) secara tepat waktu untuk menghindari sinyal palsu akibat fluktuasi harga berjalan (*repainting*).

Setelah data bar dilengkapi dengan kalkulasi indikator teknikal oleh lapisan ekstraksi fitur, *Decision Engine* (`engine/anytf_mta_engine.py`) mengevaluasi kondisi pasar melalui mekanisme 5 gerbang (*5-Gate Validation*). Jika seluruh gerbang terpenuhi, sinyal dikirim ke kanal Telegram melalui `notify/telegram.py`, dicatat ke berkas log oleh `infra/signal_logger.py`, serta dilacak pergerakan harganya secara otomatis hingga menyentuh target TP atau batas SL oleh `infra/signal_tracker.py`.

![Gambar 4.4 Alur Sistem Keseluruhan](Skripsi%20Benji%20(1)_files/image008.png)
*Gambar 4.4 Alur Sistem Keseluruhan*

![Gambar 4.5 Proses Eksekusi Decision Engine](Skripsi%20Benji%20(1)_files/image009.png)
*Gambar 4.5 Proses Eksekusi Decision Engine*

**Tabel 4.2 Deskripsi Modul Fungsional Sistem**

| Modul | Berkas Kode | Fungsi Utama |
| :--- | :--- | :--- |
| Koneksi MT5 | `mt5/connector.py` | Inisialisasi, autentikasi kredensial, dan pemulihan koneksi socket MT5. |
| Data Pasar | `mt5/market_data.py` | Mengunduh riwayat OHLCV multi-timeframe dan normalisasi offset UTC. |
| Penjadwal | `infra/scheduler.py` | Mendeteksi waktu penutupan lilin (*candle close event*) secara presisi. |
| Indikator Teknikal | `features/indicators.py` | Menghitung nilai EMA (20/50/200), RSI 14, MACD, dan volatilitas ATR 14. |
| Pola Candlestick | `features/patterns.py` | Pengenalan pola harga (*Engulfing, Pin Bar, Morning/Evening Star*). |
| Level SNR | `features/zones_snr.py` | Pemetaan level horizontal *Support & Resistance* serta *Touch Score*. |
| Zona SND | `features/zones_snd.py` | Identifikasi area konsolidasi *Supply & Demand* (*Base Breakdown/Breakout*). |
| Fibonacci | `features/fibonacci.py` | Kalkulasi level rasio retracement dinamis (38.2%, 50.0%, 61.8%). |
| Filter Sesi | `features/session.py` | Membatasi evaluasi hanya pada jam perdagangan likuid (London & New York). |
| Deteksi Bias HTF | `engine/bias.py` | Menentukan arah tren dominan (*Higher Timeframe Bias*: Bullish/Bearish). |
| Skor Pemicu | `engine/trigger.py` | Evaluasi skor sinyal pemicu (*Trigger Score*) pada timeframe eksekusi. |
| Skor Konfluensi | `engine/confluence.py` | Perhitungan bobot konfluensi multi-analisis (*Confluence Score*). |
| State Pasar | `engine/state.py` | Deteksi rezim pasar (*Trending, High Momentum, Ranging, Consolidation*). |
| Decision Engine | `engine/anytf_mta_engine.py` | Orkestrasi alur inferensi bertingkat 5 gerbang (*5-Gate Validation*). |
| Notifikasi Telegram | `notify/telegram.py` | Format dan transmisi sinyal rekomendasi ke Telegram Bot API. |
| Pencatat Sinyal | `infra/signal_logger.py` | Persistensi rekaman histori sinyal dan alasan *reject* ke CSV/JSON. |
| Pelacak Sinyal | `infra/signal_tracker.py` | Pemantauan harga berjalan secara *real-time* terhadap status TP dan SL. |

### 4.1.3 Implementasi Modul Pengambilan Data

Modul pengambilan data bertugas menghubungkan sistem ke terminal MetaTrader 5 secara lokal melalui IPC socket. Modul mengambil sebanyak 800 bar *candlestick* historis per kerangka waktu saat startup. Jumlah 800 bar dipilih secara terukur untuk menjamin kestabilan konvergensi perhitungan Exponential Moving Average periode 200 (EMA 200).

Selain kuantitas bar, modul mengoreksi offset waktu server broker secara otomatis. Karena kuotasi MT5 menggunakan waktu server broker (misalnya UTC+2 atau UTC+3), modul menghitung selisih waktu tick server terhadap jam UTC sebenarnya, sehingga data yang diproses oleh *decision engine* memiliki referensi waktu yang seragam dan selaras dengan jam sesi pasar WIB (GMT+7).

**Tabel 4.3 Spesifikasi Kerangka Waktu Data Pasar**

| Timeframe | Kode MT5 | Jumlah Bar | Peran dalam Sistem |
| :---: | :---: | :---: | :--- |
| M5 | `TIMEFRAME_M5` | 800 | Pemicu eksekusi mode *scalping* dan pemantauan momentum jangka pendek. |
| M15 | `TIMEFRAME_M15` | 800 | Pemicu eksekusi utama mode *intraday trend following* dan *break-retest*. |
| H1 | `TIMEFRAME_H1` | 800 | Konfirmasi tren menengah dan penentuan level struktur *Support/Resistance*. |
| H4 | `TIMEFRAME_H4` | 800 | Penentuan bias arah tren makro (*Higher Timeframe Bias*) dan zona SND utama. |
| D1 | `TIMEFRAME_D1` | 800 | Pemetaan batas volatilitas harian dan garis tren mayor jangka panjang. |

Berikut potongan implementasi inisialisasi koneksi MetaTrader 5 pada modul `mt5/connector.py` disajikan pada Listing 4.1.

```python
# Listing 4.1 Implementasi Kode Modul Koneksi MetaTrader 5 (mt5/connector.py)
def connect(login: int, password: str, server: str, terminal_path: str = "") -> object:
    path = (
        terminal_path
        or os.environ.get("MT5_TERMINAL_PATH", "")
        or r"C:\Program Files\MetaTrader 5\terminal64.exe"
    )
    if not os.path.isfile(path):
        raise RuntimeError(f"MT5 terminal tidak ditemukan: {path}")
    if not mt5.initialize(path=path, portable=True):
        raise RuntimeError(f"MT5 initialize gagal: {mt5.last_error()}")
    if not mt5.login(login=login, password=password, server=server):
        raise RuntimeError(f"MT5 login gagal: {mt5.last_error()}")
    info = mt5.account_info()
    if info is None:
        raise RuntimeError(f"MT5 account_info gagal: {mt5.last_error()}")
    return info
```

Hasil verifikasi eksekusi koneksi ke terminal MT5 dapat diamati melalui log terminal pada Gambar 4.6.

![Gambar 4.6 Log Terminal Verifikasi Keberhasilan Koneksi MT5](Skripsi%20Benji%20(1)_files/image011.png)
*Gambar 4.6 Log Terminal Verifikasi Keberhasilan Koneksi MT5*

Implementasi fungsi pengambilan data batang harga OHLCV disajikan pada Listing 4.2.

```python
# Listing 4.2 Implementasi Fungsi Pengambilan Data OHLCV MT5 (mt5/market_data.py)
def fetch_ohlc(symbol: str, tf: str, n_bars: int = 500) -> pd.DataFrame:
    tf_id = TF_MAP.get(tf.upper())
    if tf_id is None:
        raise ValueError(f"Timeframe tidak dikenal: {tf}")
    rates = mt5.copy_rates_from_pos(symbol, tf_id, 0, n_bars)
    if rates is None or len(rates) == 0:
        raise RuntimeError(f"Tidak ada data MT5 untuk {symbol} {tf}: {mt5.last_error()}")
    df = pd.DataFrame(rates)
    df["time"] = pd.to_datetime(df["time"], unit="s")
    return df
```

### 4.1.4 Implementasi Modul Analisis

Lapisan analisis fitur (`features/indicators.py`) bertugas menghitung serangkaian indikator teknikal secara vektorisasi menggunakan pustaka TA-Lib. Untuk mengakomodasi dinamika pasar emas yang berbeda pada setiap kerangka waktu, sistem menerapkan parameter adaptif: timeframe rendah (M5 dan M15) menggunakan periode indikator yang lebih singkat agar responsif terhadap perubahan momentum, sedangkan timeframe tinggi (H1, H4, D1) menggunakan periode standar untuk menangkap tren struktural secara stabil.

**Tabel 4.4 Parameter Konfigurasi Indikator Berdasarkan Kerangka Waktu**

| Indikator | Parameter M5 | Parameter M15 | Parameter H1 | Parameter H4 | Parameter D1 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Fast EMA | Periode 9 | Periode 12 | Periode 21 | Periode 21 | Periode 50 |
| Mid EMA | Periode 21 | Periode 34 | Periode 50 | Periode 55 | Periode 200 |
| Slow EMA | Periode 55 | Periode 100 | Periode 100 | Periode 200 | Periode 200 |
| MACD Fast | 8 | 8 | 12 | 12 | 12 |
| MACD Slow | 17 | 17 | 26 | 26 | 26 |
| MACD Signal | 9 | 9 | 9 | 9 | 9 |
| RSI Period | 14 | 14 | 14 | 14 | 14 |
| ATR Period | 14 | 14 | 14 | 14 | 14 |

Struktur konfigurasi adaptif per kerangka waktu disajikan pada Listing 4.3.

```python
# Listing 4.3 Konfigurasi Indikator Berdasarkan Kerangka Waktu (features/indicators.py)
_TF_IND_CONFIG: dict[str, tuple[int, int, int, int, int, int]] = {
    "M5":  (9, 21, 55, 8, 17, 9),
    "M15": (12, 34, 100, 8, 17, 9),
    "H1":  (21, 50, 100, 12, 26, 9),
    "H4":  (21, 55, 200, 12, 26, 9),
    "D1":  (50, 200, 200, 12, 26, 9),
}
_DEFAULT_CONFIG: tuple[int, int, int, int, int, int] = (20, 50, 200, 12, 26, 9)
```

Implementasi kalkulasi vektorisasi indikator teknikal disajikan pada Listing 4.4.

```python
# Listing 4.4 Fungsi Kalkulasi Vektorisasi Indikator Teknikal (features/indicators.py)
def add_indicators(df: pd.DataFrame, tf: str = "") -> pd.DataFrame:
    tf_upper = tf.upper() if tf else ""
    fast, mid, slow, mf, ms, msig = _TF_IND_CONFIG.get(tf_upper, _DEFAULT_CONFIG)
    c = df["close"].to_numpy(dtype=float)
    h = df["high"].to_numpy(dtype=float)
    l = df["low"].to_numpy(dtype=float)
    df["ema_20"]  = talib.EMA(c, timeperiod=fast)
    df["ema_50"]  = talib.EMA(c, timeperiod=mid)
    df["ema_200"] = talib.EMA(c, timeperiod=slow)
    df["rsi_14"]  = talib.RSI(c, timeperiod=14)
    df["atr_14"]  = talib.ATR(h, l, c, timeperiod=14)
    df["adx_14"]  = talib.ADX(h, l, c, timeperiod=14)
    macd_line, macd_signal, hist = talib.MACD(c, fastperiod=mf, slowperiod=ms, signalperiod=msig)
    df["macd_line"]   = macd_line
    df["macd_signal"] = macd_signal
    df["macdhist"]    = hist
    return df
```

## 4.2 Implementasi Multi-Analisis Teknikal

Sistem mengintegrasikan kombinasi analisis teknikal multidisiplin yang mencakup *Multi-Timeframe Analysis* (MTA), *Price Action*, *Fibonacci Retracement*, *Support & Resistance* (SNR), *Supply & Demand* (SND), serta indikator momentum dan tren (EMA, MACD, RSI). Integrasi ini bertujuan menciptakan konfluensi analitik (*analytical confluence*) guna memastikan bahwa setiap sinyal yang dihasilkan didukung oleh berbagai perspektif pasar yang saling mengonfirmasi.

### 4.2.1 Multi-Timeframe Analysis

Pendekatan *Multi-Timeframe Analysis* diterapkan untuk mengatasi kelemahan analisis pada satu kerangka waktu tunggal yang rentan terhadap derau pasar (*market noise*). Sistem membedakan secara tegas antara *Trigger Timeframe* (kerangka waktu eksekusi tempat sinyal pemicu dideteksi) dan *Confirmation Timeframe* (*Higher Timeframe* / HTF tempat arah tren dominan ditentukan).

**Tabel 4.5 Matriks Hierarki Timeframe dan Mode Perdagangan**

| Timeframe Pemicu (Trigger) | Timeframe Konfirmasi (HTF) | Mode Perdagangan | Karakteristik Strategi |
| :---: | :---: | :---: | :--- |
| M5 | H1, H4 | *Scalping* | Eksekusi cepat, memanfaatkan momentum jangka pendek searah tren H1. |
| M15 | H1, H4 | *Trend Following* | Menangkap gelombang tren *intraday* utama dengan konfirmasi bias H1 & H4. |
| H1 | H4, D1 | *Swing Trading* | Mengikuti pergeseran siklus tren makro dengan target pip yang lebih lebar. |
| H4 | D1 | *Macro Trend* | Pemetaan arah jangka panjang dan level-level likuiditas institusional. |

**Tabel 4.6 Peran Fungsional Setiap Kerangka Waktu**

| Timeframe | Peran Fungsional dalam Sistem |
| :---: | :--- |
| M5 | Deteksi pemicu *entry* presisi, reaksi pembalikan *pullback*, dan *break-retest* mikro. |
| M15 | Basis pembentukan sinyal *intraday*, deteksi pola *candlestick*, dan kalkulasi SL/TP dinamis. |
| H1 | Penentu bias tren utama (*HTF Trend Gate*), konfirmasi kelurusan EMA (*EMA Alignment*). |
| H4 | Validasi struktur tren makro, pemetaan zona *Supply & Demand* mayor, dan filter pembalikan besar. |
| D1 | Referensi batas batas tertinggi/terendah harian (*daily high/low*) dan filter risiko ekstrem. |

Implementasi logika pemilihan kerangka waktu konfirmasi disajikan pada Listing 4.5.

```python
# Listing 4.5 Implementasi Logika Pemilihan Kerangka Waktu Konfirmasi (engine/utils.py)
TF_ORDER = ["M5", "M15", "H1", "H4", "D1"]
def higher_timeframes(trigger_tf: str, enabled_tfs: list[str]) -> list[str]:
    trigger_tf = trigger_tf.upper()
    enabled_up = [t.upper() for t in enabled_tfs]
    if trigger_tf not in TF_ORDER:
        return enabled_up
    idx = TF_ORDER.index(trigger_tf)
    return [tf for tf in TF_ORDER[idx + 1:] if tf in enabled_up]
```

### 4.2.2 Price Action & Pola Candlestick

Sistem mendeteksi formasi pola lilin (*candlestick pattern*) menggunakan fungsi-fungsi resmi TA-Lib pada modul `features/patterns.py`. Untuk menyaring pola semu (*false patterns*) yang terbentuk pada lilin berbadan kerdil (*indecision candles*), sistem menambahkan algoritma filter ukuran badan (*body size ratio*):

$$\text{Body} = |\text{Close} - \text{Open}| \ge 0.40 \times \text{RollingAverage}_{10}(\text{Body})$$

Pola yang lulus validasi diakui sebagai konfirmasi teknikal berbobot tinggi (+1.5 skor konfluensi).

**Tabel 4.7 Klasifikasi Pola Candlestick dalam Sistem**

| Sinyal | Pola Candlestick | Fungsi TA-Lib | Bobot Konfluensi | Implikasi Perilaku Pasar |
| :---: | :--- | :--- | :---: | :--- |
| BUY | Bullish Engulfing | `CDLENGULFING > 0` | +1.5 | Tekanan beli masif menelan lilin merah sebelumnya. |
| BUY | Hammer / Pin Bar | `CDLHAMMER > 0` | +1.5 | Penolakan harga rendah (*rejection from low*). |
| BUY | Morning Star | `CDLMORNINGSTAR > 0` | +1.5 | Formasi pembalikan 3 lilin dari *bearish* ke *bullish*. |
| BUY | Three White Soldiers | `CDL3WHITESOLDIERS > 0` | +1.5 | Kelanjutan tren beli kuat tanpa penolakan berarti. |
| SELL | Bearish Engulfing | `CDLENGULFING < 0` | +1.5 | Tekanan jual masif menelan lilin hijau sebelumnya. |
| SELL | Shooting Star / Inverted Hammer | `CDLSHOOTINGSTAR < 0` | +1.5 | Penolakan harga tinggi (*rejection from high*). |
| SELL | Evening Star | `CDLEVENINGSTAR < 0` | +1.5 | Formasi pembalikan 3 lilin dari *bullish* ke *bearish*. |
| SELL | Three Black Crows | `CDL3BLACKCROWS < 0` | +1.5 | Tekanan penurunan beruntun dengan badan penuh. |

Implementasi deteksi pola candlestick dan filter rasio badan disajikan pada Listing 4.6.

```python
# Listing 4.6 Implementasi Deteksi Pola Candlestick dan Filter Rasio Badan (features/patterns.py)
PATTERN_FUNCS: dict[str, object] = {
    "CDLHAMMER": talib.CDLHAMMER, "CDLENGULFING": talib.CDLENGULFING,
    "CDLMORNINGSTAR": talib.CDLMORNINGSTAR, "CDLEVENINGSTAR": talib.CDLEVENINGSTAR,
    "CDLSHOOTINGSTAR": talib.CDLSHOOTINGSTAR, "CDL3WHITESOLDIERS": talib.CDL3WHITESOLDIERS,
    "CDL3BLACKCROWS": talib.CDL3BLACKCROWS, "CDLMARUBOZU": talib.CDLMARUBOZU,
}
_MIN_BODY_RATIO = 0.40
_BODY_LOOKBACK = 10

def _body_size_ok(o: np.ndarray, c: np.ndarray) -> np.ndarray:
    body = np.abs(c - o)
    avg_body = pd.Series(body).rolling(_BODY_LOOKBACK, min_periods=1).mean().shift(1).to_numpy()
    with np.errstate(invalid="ignore"):
        ok = body >= (_MIN_BODY_RATIO * avg_body)
    ok = np.where(np.isnan(avg_body), True, ok)
    return ok
```

### 4.2.3 Fibonacci Retracement

Perhitungan level Fibonacci retracement dilakukan pada modul `features/fibonacci.py`. Sistem secara otomatis mengidentifikasi titik tertinggi lokal (*Swing High*) dan titik terendah lokal (*Swing Low*) dalam jendela pengamatan 50 bar. Berdasarkan rentang ayunan harga ($H - L$), level-level retracement dihitung secara dinamis.

**Tabel 4.8 Konfigurasi Level Rasio Fibonacci Retracement**

| Level Rasio | Kategori Zona | Skor Konfluensi | Peran Teknis Posisi BUY | Peran Teknis Posisi SELL |
| :---: | :--- | :---: | :--- | :--- |
| 23.6% | *Shallow Retracement* | +0.5 | *Minor support* pada tren kuat. | *Minor resistance* pada tren kuat. |
| 38.2% | *Moderate Retracement* | +1.0 | Area *pullback* awal tren sehat. | Area *pullback* awal tren turun. |
| 50.0% | *Equilibrium (Golden Zone)* | +1.5 | Area kesetimbangan harga ideal. | Area kesetimbangan harga ideal. |
| 61.8% | *Golden Ratio (Golden Zone)* | +1.5 | Level pantulan utama pembeli. | Level pantulan utama penjual. |
| 78.6% | *Deep Retracement* | +0.5 | Batas akhir pertahanan struktur tren. | Batas akhir pertahanan struktur turun. |

Implementasi konfigurasi dan kalkulasi rasio Fibonacci retracement disajikan pada Listing 4.7.

```python
# Listing 4.7 Implementasi Konfigurasi Fibonacci Retracement (features/fibonacci.py)
class FibConfig:
    def __init__(self, fib_tf: str, pivot_length: int, lookback: int, min_impulse_atr: float, zone_tolerance: float, strong_levels: frozenset[float]):
        self.fib_tf = fib_tf; self.pivot_length = pivot_length; self.lookback = lookback
        self.min_impulse_atr = min_impulse_atr; self.zone_tolerance = zone_tolerance
        self.strong_levels = strong_levels

FIB_SCALPING_AREA = FibConfig("M15", pivot_length=3, lookback=400, min_impulse_atr=1.5, zone_tolerance=0.50, strong_levels=frozenset({0.382, 0.5, 0.618}))
FIB_INTRADAY_AREA = FibConfig("H1",  pivot_length=4, lookback=500, min_impulse_atr=2.0, zone_tolerance=0.60, strong_levels=frozenset({0.382, 0.5, 0.618, 0.786}))
```

### 4.2.4 Support dan Resistance Horizontal (SNR)

Modul `features/zones_snr.py` mendeteksi level-level horizontal harga melalui algoritma *pivot peak/valley detection*. Untuk menilai signifikansi suatu level, sistem menghitung *Touch Score* (berapa kali harga menyentuh level tersebut dalam toleransi $\pm 0.3 \times \text{ATR}$ tanpa menembusnya secara mutlak). Semakin tinggi *Touch Score*, semakin kuat level tersebut menahan harga.

**Tabel 4.9 Parameter Deteksi Support dan Resistance Horizontal**

| Timeframe | Pivot Length | Jendela Lookback | Toleransi ATR | Ambang Touch Valid |
| :---: | :---: | :---: | :---: | :--- |
| M5 | 3 | 50 bar | 0.25 | $\ge 2$ sentuhan |
| M15 | 4 | 70 bar | 0.30 | $\ge 2$ sentuhan |
| H1 | 5 | 100 bar | 0.35 | $\ge 3$ sentuhan |
| H4 | 5 | 150 bar | 0.40 | $\ge 3$ sentuhan |

Implementasi pembentukan zona Support dan Resistance disajikan pada Listing 4.8.

```python
# Listing 4.8 Implementasi Algoritma Penentuan Zona SNR dan Penilaian Sentuhan (features/zones_snr.py)
def _build_zones(df: pd.DataFrame, tf: str, atr: float) -> list[SnrZone]:
    cfg = _TF_CONFIG.get(tf.upper(), _TF_CONFIG_DEFAULT)
    recent = df.iloc[-cfg.lookback:] if len(df) > cfg.lookback else df
    tolerance = atr * cfg.atr_tolerance
    zones: list[SnrZone] = []
    hi_idx_px = swing_high_idx_prices(recent, left=cfg.pivot_length, right=cfg.pivot_length)
    lo_idx_px = swing_low_idx_prices(recent, left=cfg.pivot_length, right=cfg.pivot_length)
    for zone_type, idx_px_list in [("RESISTANCE", hi_idx_px), ("SUPPORT", lo_idx_px)]:
        clusters_with_idx = _cluster_with_idx(idx_px_list, tolerance)
        for cluster_pairs in clusters_with_idx:
            touches = len(cluster_pairs)
            strength = _touch_score(touches)
            if strength < cfg.min_strength: continue
            prices = [p for _, p in cluster_pairs]
            center = float(np.mean(prices))
            half = max(tolerance / 2, atr * 0.15)
            zones.append(SnrZone(zone_type=zone_type, center=center, lower=center - half, upper=center + half, touches=touches, strength=strength))
    return zones

def _touch_score(touches: int) -> float:
    if touches >= 4: return 50.0
    if touches == 3: return 35.0
    if touches == 2: return 20.0
    return 0.0
```

### 4.2.5 Supply dan Demand (SND)

Modul `features/zones_snd.py` mengidentifikasi zona institusional berupa area konsolidasi (*Base*) yang didahului atau diakhiri oleh pergerakan impulsif (*Impulsive Move*). Empat pola struktur yang dideteksi meliputi: *Rally-Base-Rally* (RBR) dan *Drop-Base-Rally* (DBR) sebagai zona *Demand*, serta *Drop-Base-Drop* (DBD) dan *Rally-Base-Drop* (RBD) sebagai zona *Supply*.

**Tabel 4.10 Parameter Deteksi Zona Supply dan Demand**

| Timeframe | Jendela Lookback | Badan Impuls Minimal | Rentang Base Maksimal | Status Zona |
| :---: | :---: | :---: | :---: | :--- |
| M5 | 40 bar | $\ge 1.5 \times \text{ATR}$ | $\le 0.8 \times \text{ATR}$ | *Fresh* (Belum tertembus) |
| M15 | 60 bar | $\ge 1.8 \times \text{ATR}$ | $\le 1.0 \times \text{ATR}$ | *Fresh* (Belum tertembus) |
| H1 | 80 bar | $\ge 2.0 \times \text{ATR}$ | $\le 1.2 \times \text{ATR}$ | *Tested* (Maksimal 1 retest) |
| H4 | 120 bar | $\ge 2.5 \times \text{ATR}$ | $\le 1.5 \times \text{ATR}$ | *Structural Major Zone* |

Implementasi algoritma pemindaian zona Supply dan Demand disajikan pada Listing 4.9.

```python
# Listing 4.9 Algoritma Identifikasi Zona Supply dan Demand Institusional (features/zones_snd.py)
def _find_zones(df: pd.DataFrame, atr: float, cfg: _SndConfig, bullish: bool) -> list[dict]:
    zones: list[dict] = []
    if atr <= 0 or len(df) < cfg.lookback + 5:
        return zones
    data = df.iloc[-(cfg.lookback + 2):-1].reset_index(drop=True)
    n = len(data)
    for i in range(_BASE_WINDOW, n - 2):
        c = data.iloc[i]
        c_open, c_close = float(c.get("open", 0)), float(c.get("close", 0))
        body = (c_close - c_open) if bullish else (c_open - c_close)
        if body < cfg.impulse_body_atr * atr: continue
        base_slice = data.iloc[max(0, i - _BASE_WINDOW):i]
        if len(base_slice) < 2: continue
        base_high, base_low = float(base_slice["high"].max()), float(base_slice["low"].min())
        if (base_high - base_low) > cfg.base_max_range * atr: continue
        impulse_dist = (c_close - base_high) if bullish else (base_low - c_close)
        if impulse_dist < cfg.min_impulse_dist * atr: continue
    return zones
```

### 4.2.6 Exponential Moving Average (EMA)

Sistem menggunakan tiga garis Exponential Moving Average (Fast, Mid, Slow) untuk menentukan kelurusan tren (*EMA Alignment*) serta mendeteksi area pembalikan arah kembali ke rata-rata (*EMA Pullback*). Pada timeframe eksekusi M15, EMA 20, EMA 50, dan EMA 200 membentuk filter dasar yang wajib dipenuhi.

**Tabel 4.11 Parameter EMA Berdasarkan Kerangka Waktu**

| Timeframe | Fast EMA | Mid EMA | Slow EMA | Fungsi Analitik |
| :---: | :---: | :---: | :---: | :--- |
| M5 | EMA 9 | EMA 21 | EMA 55 | Deteksi momentum mikro dan *micro pullback*. |
| M15 | EMA 12 | EMA 34 | EMA 100 | Filter kelurusan tren intraday dan konfirmasi sinyal *trigger*. |
| H1 | EMA 21 | EMA 50 | EMA 200 | Penentu arah tren utama (*Macro Trend Direction*). |
| H4 | EMA 21 | EMA 55 | EMA 200 | Filter sekunder tren institusional. |
| D1 | EMA 50 | EMA 200 | EMA 200 | Indikator rezim tren jangka panjang (*Golden/Death Cross*). |

Logika evaluasi kelurusan garis EMA multi-timeframe disajikan pada Listing 4.10.

```python
# Listing 4.10 Evaluasi Kelurusan Garis EMA Multi-Timeframe (engine/trigger.py)
# EMA alignment
if all(v is not None for v in [ema20, ema50, ema200]):
    if (direction == "BUY" and ema20 > ema50 > ema200) or \
       (direction == "SELL" and ema20 < ema50 < ema200):
        score += 1; notes.append("ALIGN+")
    else:
        notes.append("ALIGN-")
```

### 4.2.7 Moving Average Convergence Divergence (MACD)

Indikator MACD dihitung untuk mengevaluasi akselerasi momentum dan divergensi harga. Pada timeframe M5 dan M15, parameter MACD dipercepat (8, 17, 9) agar dapat menangkap pergeseran momentum secara dini tanpa keterlambatan (*lagging*).

**Tabel 4.12 Kondisi Validasi MACD dalam Sistem**

| Arah Sinyal | Kondisi Histogram MACD | Hubungan Garis MACD & Sinyal | Skor Pemicu |
| :---: | :--- | :--- | :---: |
| BUY | $\text{Hist}_{t} > \text{Hist}_{t-1}$ (Histogram mengembang ke atas) | $\text{MACD Line} > \text{Signal Line}$ | +1 |
| SELL | $\text{Hist}_{t} < \text{Hist}_{t-1}$ (Histogram mengembang ke bawah) | $\text{MACD Line} < \text{Signal Line}$ | +1 |
| DIVERGENCE | Perbedaan arah puncak harga terhadap puncak histogram | Terjadi konvergensi/divergensi teknikal | +1.5 (Konfluensi) |

Evaluasi kondisi histogram MACD pada mesin inferensi disajikan pada Listing 4.11.

```python
# Listing 4.11 Evaluasi Kondisi Histogram MACD pada Mesin Inferensi (engine/trigger.py)
# MACD histogram
if mhist is not None and mhist_p is not None:
    if (direction == "BUY" and mhist > mhist_p) or \
       (direction == "SELL" and mhist < mhist_p):
        score += 1; notes.append("MACD+")
    else:
        notes.append("MACD-")
```

### 4.2.8 Relative Strength Index (RSI)

Indikator RSI (periode 14) digunakan sebagai filter kondisi kejenuhan harga (*Overbought/Oversold*) sekaligus pengukur kemiringan momentum (*Slope*). Pada posisi BUY, sistem mensyaratkan nilai RSI belum jenuh beli ($RSI < 65$) dengan kemiringan naik, sedangkan pada posisi SELL mensyaratkan nilai RSI belum jenuh jual ($RSI > 35$) dengan kemiringan turun.

**Tabel 4.13 Aturan Penggunaan Indikator RSI**

| Nilai RSI (14) | Status Pasar | Aksi Evaluasi Sistem |
| :---: | :--- | :--- |
| $RSI < 30$ | *Oversold* Jenuh Jual | Sinyal SELL diblokir; potensi pembalikan BUY jika ada pola pantulan. |
| $30 \le RSI < 65$ | Area Sehat Bullish | Memenuhi syarat pemicu BUY jika $\text{Slope} > 0$ (+1 skor). |
| $35 < RSI \le 70$ | Area Sehat Bearish | Memenuhi syarat pemicu SELL jika $\text{Slope} < 0$ (+1 skor). |
| $RSI > 70$ | *Overbought* Jenuh Beli | Sinyal BUY diblokir; potensi pembalikan SELL jika ada pola penolakan. |

Implementasi pengecekan ambang batas dan kemiringan RSI disajikan pada Listing 4.12.

```python
# Listing 4.12 Pengecekan Ambang Batas dan Kemiringan RSI (engine/trigger.py)
# RSI
if rsi is not None and rsi_p is not None:
    if (direction == "BUY" and rsi < 65 and rsi > rsi_p) or \
       (direction == "SELL" and rsi > 35 and rsi < rsi_p):
        score += 1; notes.append(f"RSI+({rsi:.0f})")
    else:
        notes.append(f"RSI-({rsi:.0f})")
```

## 4.3 Implementasi Rule-Based Decision Engine

Inti dari sistem pendukung keputusan ini adalah *Rule-Based Decision Engine* (`engine/anytf_mta_engine.py`) yang beroperasi melalui mekanisme validasi 5 gerbang bertingkat (*5-Gate Validation*). Sinyal hanya diterbitkan jika dan hanya jika berhasil melewati kelima gerbang secara berurutan tanpa kegagalan.

### 4.3.1 Aturan Pengambilan Keputusan BUY

Pada posisi beli (*BUY / LONG*), sistem mensyaratkan keselarasan kondisi pasar mulai dari validitas data hingga rasio risiko-keuntungan:

**Tabel 4.14 Spesifikasi Logika Gerbang Keputusan Sinyal BUY**

| Tahapan Gerbang | Komponen Validasi | Kondisi Lolos BUY | Tindakan Jika Gagal |
| :---: | :--- | :--- | :--- |
| **Gate 1** | Filter Dasar & Sesi | Ketersediaan $\ge 200$ bar, ATR $> 0$, di luar rollover, *cooldown* $\ge 3$ bar. | Tolak: `SESSION_OFF` / `COOLDOWN_ACTIVE` |
| **Gate 2** | Bias Tren Makro (HTF) | Close H1/H4 $> EMA_{200}$, $EMA_{50} > EMA_{200}$, kemiringan EMA naik. | Tolak: `BIAS_FAIL(NEUTRAL/BEARISH)` |
| **Gate 3** | Skor Pemicu Teknis | Trigger Score $\ge 3$ (Scalping) atau $\ge 4$ (Intraday). | Tolak: `TRIGGER_FAIL` |
| **Gate 4** | Kalkulasi Risiko SL/TP | Stop Loss di bawah *Swing Low* / Dinamis ATR, TP1/TP2/TP3 valid. | Tolak: `SLTP_NONE` |
| **Gate 5** | Konfluensi & Rasio RR | $RR \ge 1:1.0$ (Scalping $\ge 1.2$) dan tidak terhalang batas SNR kuat. | Tolak: `RR_LOW` / `SNR_BLOCKED` |

**Tabel 4.15 Komponen Penilaian Skor Pemicu BUY (Maksimal 6 Poin)**

| Komponen | Kondisi Valid Posisi BUY | Bobot Skor |
| :--- | :--- | :---: |
| EMA 200 Filter | Harga penutupan berada di atas $EMA_{200} - 0.2 \times \text{ATR}$ | +1 (Wajib) |
| EMA 50 Pullback | Jarak harga penutupan ke garis $EMA_{50} \le 1.5 \times \text{ATR}$ | +1 |
| EMA Alignment | Susunan garis bergerak teratur: $EMA_{20} > EMA_{50} > EMA_{200}$ | +1 |
| RSI Confirmation | Nilai $RSI < 65$ dan tren garis kemiringan naik ($\Delta RSI > 0$) | +1 |
| MACD Momentum | Histogram MACD saat ini lebih tinggi dari histogram sebelumnya | +1 |
| Candle Direction | Lilin pemicu ditutup positif ($Close > Open$ / Bullish Candle) | +1 |

Logika deteksi bias makro tren tingkat tinggi (HTF) dan evaluasi skor pemicu BUY disajikan pada Listing 4.13.

```python
# Listing 4.13 Logika Deteksi Bias Makro dan Evaluasi Skor Pemicu BUY (engine/trigger.py)
def _check_bias_and_buy_trigger(close, ema50, ema200, atr, slope_ok):
    # Evaluasi Bias Tren Makro Bullish (Gate 2)
    is_bull = close > ema200 and ema50 > ema200
    gap_pct = abs(ema50 - ema200) / close
    if gap_pct >= 0.0005 and slope_ok and is_bull:
        bias = "BULL"
    
    # Evaluasi Skor Pemicu BUY (Gate 3)
    score = 0
    if close > (ema200 - 0.2 * atr): score += 1
    if abs(close - ema50) <= 1.5 * atr: score += 1
    return bias, score
```

### 4.3.2 Aturan Pengambilan Keputusan SELL

Kondisi untuk posisi jual (*SELL / SHORT*) merupakan cerminan simetris dari posisi beli dengan penyesuaian arah ambang batas teknikal.

**Tabel 4.16 Komponen Penilaian Skor Pemicu SELL (Maksimal 6 Poin)**

| Komponen | Kondisi Valid Posisi SELL | Bobot Skor |
| :--- | :--- | :---: |
| EMA 200 Filter | Harga penutupan berada di bawah $EMA_{200} + 0.2 \times \text{ATR}$ | +1 (Wajib) |
| EMA 50 Pullback | Jarak harga penutupan ke garis $EMA_{50} \le 1.5 \times \text{ATR}$ | +1 |
| EMA Alignment | Susunan garis bergerak teratur: $EMA_{20} < EMA_{50} < EMA_{200}$ | +1 |
| RSI Confirmation | Nilai $RSI > 35$ dan tren garis kemiringan turun ($\Delta RSI < 0$) | +1 |
| MACD Momentum | Histogram MACD saat ini lebih rendah dari histogram sebelumnya | +1 |
| Candle Direction | Lilin pemicu ditutup negatif ($Close < Open$ / Bearish Candle) | +1 |

Logika deteksi bias makro tren bearish dan evaluasi skor pemicu SELL disajikan pada Listing 4.14.

```python
# Listing 4.14 Logika Deteksi Bias Makro dan Evaluasi Skor Pemicu SELL (engine/trigger.py)
def _check_bias_and_sell_trigger(close, ema50, ema200, atr, slope_ok):
    # Evaluasi Bias Tren Makro Bearish (Gate 2)
    is_bear = close < ema200 and ema50 < ema200
    gap_pct = abs(ema50 - ema200) / close
    if gap_pct >= 0.0005 and slope_ok and is_bear:
        bias = "BEAR"
    
    # Evaluasi Skor Pemicu SELL (Gate 3)
    score = 0
    if close < (ema200 + 0.2 * atr): score += 1
    if abs(close - ema50) <= 1.5 * atr: score += 1
    return bias, score
```

### 4.3.3 Aturan Penolakan Sinyal (Kondisi NO SIGNAL)

Sistem menerapkan kebijakan *defensive filtering* yang ketat. Jika salah satu kondisi gerbang tidak terpenuhi, sistem tidak akan memaksakan penerbitan sinyal, melainkan mengkategorikannya sebagai `NO SIGNAL` disertai pelabelan alasan penolakan secara spesifik ke berkas catatan histori.

**Tabel 4.17 Taksonomi Label Alasan Penolakan Sinyal (Reject Conditions)**

| Label Penolakan | Definisi Kondisi Penolakan | Gerbang Terkait |
| :--- | :--- | :---: |
| `SESSION_OFF` | Waktu berada pada sesi pergantian hari server (02:00–06:00 WIB) dengan spread melebar. | Gate 1 |
| `COOLDOWN_ACTIVE` | Jarak waktu penutupan lilin belum memenuhi jeda minimal 3 bar dari sinyal sebelumnya. | Gate 1 |
| `DATA_INSUFFICIENT` | Kuantitas bar historis yang tersedia kurang dari ambang batas minimal 200 bar. | Gate 1 |
| `ATR_TOO_LOW` | Volatilitas pasar berada pada tingkat sangat rendah (pasar mati/libur). | Gate 1 |
| `BIAS_NEUTRAL` | Arah tren pada timeframe H1 dan H4 tidak selaras atau saling bertentangan. | Gate 2 |
| `TRIGGER_FAIL` | Skor pemicu teknis tidak mencapai batas minimal (skor $< 3$ atau $< 4$). | Gate 3 |
| `LATE_ENTRY` | Harga pasar berjalan telah menjauh melampaui $1.5 \times \text{ATR}$ dari harga penutupan setup. | Gate 4 |
| `ZONE_PASSED` | Harga berjalan telah menembus batas toleransi zona eksekusi ($0.3 \times \text{ATR}$). | Gate 4 |
| `SLTP_NONE` | Algoritma gagal mengidentifikasi titik penempatan Stop Loss struktural yang logis. | Gate 4 |
| `RR_LOW` | Rasio potensi laba terhadap risiko terhitung lebih kecil dari ambang batas ($RR < 1:1.0$). | Gate 5 |
| `SNR_BLOCKED` | Terdapat batas *Support* atau *Resistance* kuat yang menghalangi jalan harga menuju TP1/TP2. | Gate 5 |
| `ASIAN_NO_KEY_LEVEL` | Sinyal terbentuk pada sesi Asia tanpa konfirmasi level kunci horizontal yang valid. | Gate 5 |
| `LTF_COUNTER_VETO` | Terjadi lonjakan momentum berlawanan arah yang masif pada kerangka waktu eksekusi. | Gate 5 |

### 4.3.4 Sistem Pembobotan Konfluensi Analisis

Skor konfluensi (*Confluence Score*) dihitung pada Gate 5 dengan menjumlahkan bobot fitur teknikal independen yang terdeteksi aktif pada area harga yang sama. Konfluensi bertindak sebagai penguat probabilitas sebelum sistem menyetujui penerbitan sinyal ke Telegram.

**Tabel 4.18 Sistem Pembobotan Komponen Konfluensi Analisis**

| Komponen Analisis | Bobot Skor | Kriteria Pemenuhan Fitur |
| :--- | :---: | :--- |
| *Supply & Demand Zone* | +2.0 | Harga berada di dalam area *Base Demand* (BUY) atau *Base Supply* (SELL). |
| *Candlestick Pattern* | +1.5 | Terbentuk pola lilin *Engulfing, Hammer, Star*, atau *Three Soldiers/Crows*. |
| *RSI / MACD Divergence* | +1.5 | Terdeteksi perbedaan arah puncak harga terhadap osilator (*Regular Divergence*). |
| *Fibonacci Golden Zone* | +1.5 | Harga bersentuhan dengan level rasio emas 50.0% atau 61.8% retracement. |
| *Support & Resistance Level* | +1.0 | Harga menguji level horizontal penting dengan *Touch Score* $\ge 2$. |
| *Fair Value Gap (FVG)* | +1.0 | Ketidakseimbangan harga (*imbalance*) 3 lilin terisi kembali (*mitigated*). |
| *Liquidity Sweep* | +1.0 | Pembersihan likuiditas level ekstrem sebelum berbalik arah (*turtle soup*). |

## 4.4 Implementasi Penentuan Entry, Stop Loss, Take Profit, dan Rasio Risk-Reward

Manajemen risiko merupakan pilar paling mendasar dalam perdagangan valuta asing dan komoditas emas (XAU/USD). Sistem ini tidak hanya menentukan arah rekomendasi transaksi, namun secara komputasional menghitung level eksekusi (*Entry Price*), batas pengaman kerugian (*Stop Loss*), target realisasi keuntungan bertingkat (*Multi-Target Take Profit*), serta memvalidasi kelayakan rasio *Risk-to-Reward* (RR) secara matematis pada Gate 4.

### 4.4.1 Penentuan Titik Entry dan Mekanisme Anti-Chase

Titik masuk (*Entry Price*) ditentukan berdasarkan harga penutupan (*close price*) dari lilin pemicu pada kerangka waktu eksekusi (M5 atau M15). Mengingat pergerakan harga emas dapat mengalami lonjakan volatilitas mendadak dalam hitungan detik pasca penutupan lilin, sistem menerapkan mekanisme proteksi keterlambatan harga (*Anti-Chase & Late Entry Guard*) pada berkas `engine/anytf_mta_engine.py`:

$$\Delta_{\text{chase}} = \begin{cases} \text{Close}_{\text{setup}} - \text{Price}_{\text{now}}, & \text{untuk posisi SELL} \\ \text{Price}_{\text{now}} - \text{Close}_{\text{setup}}, & \text{untuk posisi BUY} \end{cases}$$

Jika nilai $\Delta_{\text{chase}} > 1.5 \times \text{ATR}$, harga pasar berjalan dianggap telah bergerak terlalu jauh meninggalkan zona ideal sehingga sinyal otomatis dibatalkan dengan status `LATE_ENTRY`. Selain itu, zona eksekusi dibatasi selebar toleransi $0.3 \times \text{ATR}$. Jika harga telah menembus batas atas zona untuk posisi SELL atau batas bawah zona untuk posisi BUY, sistem menolak sinyal dengan label `ZONE_PASSED` guna mencegah eksekusi posisi pada harga buruk.

### 4.4.2 Penentuan Stop Loss Dinamis dan Berbasis Struktur

Penempatan *Stop Loss* (SL) dirancang adaptif dengan menggabungkan dua metode komplementer:

1. **Pendekatan Berbasis Struktur (*Swing-Based SL*):** SL diletakkan di luar level lembah ayunan (*Swing Low*) terakhir untuk posisi BUY, atau di luar puncak ayunan (*Swing High*) terakhir untuk posisi SELL, ditambah buffer pengaman sebesar $0.3 \times \text{ATR}$ guna menghindari *liquidity stop hunting*.
2. **Pendekatan Volatilitas Dinamis (*Dynamic ATR SL*):** Jika struktur ayunan lokal tidak terdefinisi secara jelas, jarak SL dihitung secara proporsional terhadap volatilitas rata-rata pasar:

$$\text{SL}_{\text{Buy}} = \text{Entry} - \max(\text{SwingLow}_{\text{offset}}, 1.5 \times \text{ATR}_{14})$$

$$\text{SL}_{\text{Sell}} = \text{Entry} + \max(\text{SwingHigh}_{\text{offset}}, 1.5 \times \text{ATR}_{14})$$

Pada mode *scalping* (M5), pengali ATR disesuaikan menjadi $1.2 \times \text{ATR}$ dan dibatasi dengan ambang risiko absolut maksimal 60 pips (600 poin harga emas) untuk menjaga modal dari risiko kerugian besar saat terjadi kejutan pasar (*market shock*).

### 4.4.3 Penentuan Multi-Target Take Profit

Untuk memaksimalkan *profit capture* sekaligus mengunci keuntungan secara bertahap (*partial profit taking*), sistem menerapkan pembagian target realisasi laba ke dalam tiga level terstruktur:

1. **Take Profit 1 (TP1) – Rasio Konservatif 1:1,0 (Mode Scalping: 1:1,4R):**
   $$\text{TP1} = \text{Entry} \pm (1.0 \times |\text{Entry} - \text{SL}|)$$
   Berfungsi sebagai target pengaman modal awal di mana pedagang disarankan memindahkan level SL ke titik masuk (*Break Even Point* / BEP) setelah TP1 tercapai.
2. **Take Profit 2 (TP2) – Rasio Struktural Utama 1:1,5:**
   $$\text{TP2} = \text{Entry} \pm (1.5 \times |\text{Entry} - \text{SL}|)$$
   Merupakan target objektif utama sistem yang diselaraskan dengan batas level *Support/Resistance* atau zona batas *Supply/Demand* berikutnya.
3. **Take Profit 3 (TP3) – Rasio Ekstensi Tren 1:2,0:**
   $$\text{TP3} = \text{Entry} \pm (2.0 \times |\text{Entry} - \text{SL}|)$$
   Target ekspansi yang dirancang untuk menangkap kelanjutan tren panjang (*extended impulsive wave*).

### 4.4.4 Perhitungan dan Validasi Rasio Risk-to-Reward (RR)

Rasio *Risk-to-Reward* dihitung dengan membandingkan jarak titik masuk ke target struktural TP2 terhadap jarak titik masuk ke batas Stop Loss:

$$\text{RR} = \frac{|\text{TP2} - \text{Entry}|}{|\text{Entry} - \text{SL}|}$$

Sistem menetapkan aturan tegas bahwa setiap transaksi harus memiliki rasio struktural minimal $\text{RR} \ge 1:1.0$ untuk mode *trend following* dan $\ge 1:1.2$ hingga $1:1.5$ untuk mode pembalikan (*counter trend*). Jika kalkulasi jarak SL yang terlalu lebar menghasilkan nilai rasio di bawah ambang batas minimal, sinyal secara otomatis dibatalkan dengan status penolakan `RR_LOW`. Kebijakan ini menjamin bahwa sistem hanya mengeksekusi peluang perdagangan yang memiliki ekspektasi matematis positif (*positive mathematical expectancy*).

## 4.5 Implementasi Validasi Sinyal (Pencegahan Sinyal Palsu)

Untuk meminimalkan kerugian akibat gejolak pasar palsu (*whipsaw*), sistem dilengkapi mekanisme validasi komprehensif pada lapisan penjadwal dan inferensi:

### 4.5.1 Deteksi Event Penutupan Lilin (Candle Close Detection)

Salah satu sumber kesalahan fatal pada bot perdagangan otomatis adalah evaluasi sinyal pada lilin yang masih aktif berjalan (*live candle*), yang kerap menyebabkan fenomena *repainting* (kondisi sinyal muncul lalu menghilang saat harga berfluktuasi sebelum lilin ditutup). Modul `infra/scheduler.py` menjamin bahwa pembacaan data OHLCV hanya dieksekusi tepat saat batang harga dinyatakan tutup (*candle close event*). Dengan demikian, seluruh nilai indikator bersifat permanen dan tidak dapat berubah kembali.

### 4.5.2 Filter Jam Sesi Perdagangan dan Masa Tenang (Cooldown Filter)

Likuiditas pasar emas bervariasi secara signifikan sepanjang hari. Sistem menerapkan filter sesi aktif pada `features/session.py` untuk mengeliminasi jam-jam pergantian hari server (*daily rollover* pukul 02:00–06:00 WIB), di mana spread broker melebar hingga 5–10 kali lipat dari kondisi normal. Selain itu, masa tenang (*cooldown period*) minimal 3 bar diberlakukan setelah sinyal diterbitkan untuk menghindari pengiriman sinyal duplikat secara berulang (*overtrading*).

### 4.5.3 Validasi Hambatan Level Kunci (Support/Resistance Obstruction Gate)

Meskipun pola pemicu teknis telah terpenuhi, sinyal BUY akan ditolak jika tepat di depan harga terdapat level *Resistance* horizontal kuat atau batas bawah zona *Supply* yang berjarak lebih dekat daripada target TP1. Sebaliknya, sinyal SELL akan ditolak jika terdapat batas *Support* kuat di depan harga. Mekanisme ini diberi label `SNR_BLOCKED` dan berhasil menyaring lebih dari 18% potensi sinyal jebakan pada pengujian empiris.

### 4.5.4 Validasi Konsistensi Multi-Timeframe dan LTF Counter Veto

Gate 2 mewajibkan keselarasan arah sinyal terhadap tren kerangka waktu yang lebih tinggi (H1 dan H4). Sebagai proteksi ganda, sistem dilengkapi fitur *LTF Counter Veto* (`_ltf_counter_veto`): jika pada kerangka waktu M5/M15 terdeteksi lonjakan volume atau bar impulsif berlawanan arah yang masif, sinyal searah tren makro akan ditahan sementara untuk mengantisipasi aksi *liquidity sweep* institusional.

### 4.5.5 Validasi Asimetri Risiko dan Filter Volatilitas Ekstrem

Sistem menguji nilai volatilitas melalui indikator Average True Range (ATR 14). Jika nilai ATR berada di bawah batas kewajaran (kondisi pasar libur/stagnan), sistem membatalkan evaluasi. Sebaliknya, saat rilis berita ekonomi berkategori tinggi (*High Impact News*), pelebaran jarak SL yang dihasilkan oleh formula ATR akan secara otomatis memicu pembatalan sinyal jika rasio RR tidak lagi memenuhi batas kelayakan.

## 4.6 Implementasi Antarmuka Telegram Bot dan Pelacakan Real-Time

Distribusi keputusan rekomendasi transaksi disampaikan kepada pengguna melalui antarmuka Telegram Bot API (`notify/telegram.py`) yang beroperasi secara nir-hambatan (*non-blocking asynchronous dispatch*).

### 4.6.1 Format Pesan Sinyal Rekomendasi

Pesan notifikasi sinyal diformat secara terstruktur menggunakan penanda visual dan hierarki informasi yang jelas, mencakup arah posisi, kerangka waktu, penanda waktu lokal (WIB), level harga eksekusi, target TP bertingkat, batas risiko SL dalam satuan pips, rincian skor pemicu dan konfluensi, serta pengingat manajemen lot:

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

*Gambar 4.7 Format Pesan Notifikasi Rekomendasi Sinyal Trading Telegram*

### 4.6.2 Mekanisme Pemantauan dan Pelacakan Real-Time (Signal Tracker)

Sistem tidak hanya menerbitkan sinyal di awal, namun secara otonom memantau perkembangan harga pasar terhadap seluruh sinyal aktif melalui modul `infra/signal_tracker.py`. Modul ini berjalan secara paralel di latar belakang (*background worker*) dengan siklus *polling* setiap 10 detik:

1. **Deteksi Level Terpenuhi (*Outcome Detection*):** Setiap kali harga *bid/ask* menyentuh salah satu level target (TP1, TP2, TP3) atau batas SL, pelacak mendeteksi peristiwa tersebut dan langsung mengirimkan notifikasi pembaruan (*Update Alert*) ke kanal Telegram.
2. **Pencatatan Riwayat Terbuka (*Realized Outcome Logging*):** Hasil akhir transaksi, durasi waktu dari pembentukan hingga penutupan (dalam menit), serta realisasi rasio RR dicatat secara otomatis ke dalam berkas `logs/signal_history.csv` dan disinkronkan ke dalam basis data analitik excel (`laporan_trading.xlsx`).

## 4.7 Pengujian Sistem (Fungsional dan Integrasi)

Pengujian sistem dilakukan untuk memverifikasi kebenaran fungsional dari setiap modul perangkat lunak serta memastikan keandalan integrasi antar-komponen (MetaTrader 5, mesin inferensi Python, dan Telegram Bot API) sebelum dilakukan evaluasi perdagangan berjalan secara langsung.

### 4.7.1 Pengujian Fungsional (Black Box Testing)

Pengujian fungsional menerapkan metode *Black Box Testing*, di mana sistem diuji berdasarkan kesesuaian antara masukan (*input*) dan luaran (*output*) tanpa memanipulasi kode internal. Sebanyak 10 skenario pengujian utama dirancang mencakup seluruh siklus hidup pembentukan sinyal.

**Tabel 4.19 Hasil Pengujian Fungsional Black Box Testing**

| No. | Modul / Fitur yang Diuji | Skenario Pengujian | Hasil yang Diharapkan | Hasil Pengamatan | Kesimpulan |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1. | Inisialisasi Koneksi MT5 | Menjalankan fungsi `connect()` dengan kredensial broker valid. | Terminal MT5 terhubung, status akun aktif, dan return info akun broker. | Koneksi sukses, informasi akun dan saldo terdeteksi sempurna. | **Valid** |
| 2. | Penarikan Data Pasar | Mengunduh 800 bar data OHLCV untuk TF M5, M15, H1, H4, D1. | Dataframe terisi 800 bar lengkap tanpa nilai *null* dan offset UTC terkalibrasi. | Struktur array terisi utuh (800 bar) dengan tipe data float teratur. | **Valid** |
| 3. | Kalkulasi Indikator TA-Lib | Menghitung EMA (20/50/200), RSI, MACD, dan ATR pada dataframe. | Kolom indikator terisi nilai numerik yang identik dengan kuotasi grafik MT5. | Selisih nilai indikator terhadap grafik MT5 $< 0.001$ (presisi tinggi). | **Valid** |
| 4. | Deteksi Pola Candlestick | Menguji data historis yang memuat formasi *Engulfing* dan *Pin Bar*. | Fungsi mendeteksi label pola yang sesuai dan mengabaikan lilin kerdil. | Pola valid terdeteksi, lilin berbadan kerdil berhasil disaring filter rasio. | **Valid** |
| 5. | Logika Inferensi Gate 1–3 | Memberikan kondisi pasar tidak tren (*sideways* atau di luar sesi). | Gate menolak evaluasi dan mengembalikan status `NO SIGNAL` dengan label tepat. | Muncul log `BIAS_NEUTRAL` atau `SESSION_OFF`, tidak ada sinyal salah. | **Valid** |
| 6. | Penentuan Dinamis SL/TP | Mengevaluasi setup sinyal valid untuk menghitung level SL dan TP1–3. | SL ditempatkan di luar struktur/ATR, rasio $RR \ge 1:1.0$ terpenuhi. | Titik SL dan TP terbentuk presisi, rasio struktural rata-rata 1.25. | **Valid** |
| 7. | Validasi Anti-Chase & Zona | Mensimulasikan harga pasar telah melompat $> 1.5 \times \text{ATR}$ dari setup. | Sinyal dibatalkan dengan status penolakan `LATE_ENTRY` atau `ZONE_PASSED`. | Sinyal ditolak, mencegah posisi terbuka pada harga buruk. | **Valid** |
| 8. | Transmisi Notifikasi Telegram | Mengirimkan pesan sinyal rekomendasi ke grup Telegram pengguna. | Pesan terkirim instan dalam format terstruktur lengkap dalam waktu $< 2$ detik. | Pesan diterima lengkap di aplikasi Telegram pengguna dalam 0.8–1.2 detik. | **Valid** |
| 9. | Pelacak Real-Time (Tracker) | Mensimulasikan pergerakan harga pasar menyentuh batas TP1 atau SL. | Pelacak mendeteksi sentuhan harga, mengirim alert *update*, dan menutup status. | Notifikasi pencapaian target terkirim otomatis, histori tercatat ke CSV. | **Valid** |
| 10. | Pemulihan Jaringan Otomatis | Memutuskan koneksi internet simulator selama 30 detik lalu menyambungkan kembali. | Sistem mendeteksi *disconnect*, melakukan *retry reconnect* otomatis tanpa crash. | Sistem pulih otomatis (*auto-reconnected*) dalam 5 detik pasca internet aktif. | **Valid** |

### 4.7.2 Pengujian Integrasi Terminal MetaTrader 5

Pengujian integrasi MT5 difokuskan pada kestabilan komunikasi Inter-Process Communication (IPC) antara pustaka Python dan proses `terminal64.exe`. Pengujian dilakukan dengan melakukan *stress testing* penarikan 800 bar pada 5 kerangka waktu sekaligus secara berulang setiap 5 detik selama 24 jam. Hasil pengujian menunjukkan rata-rata latensi penarikan data sebesar 280–350 milidetik dengan tingkat keberhasilan pemanggilan API sebesar 100% tanpa kebocoran memori (*memory leak*).

### 4.7.3 Pengujian Integrasi Notifikasi Telegram Bot API

Pengujian transmisi pesan Telegram Bot bertujuan memvalidasi keandalan pengiriman pesan di bawah batasan *rate limiting* resmi Telegram (maksimal 30 pesan per detik ke kanal yang berbeda atau 1 pesan per detik ke obrolan yang sama). Pengujian dilakukan dengan memicu 20 notifikasi berurutan. Seluruh pesan berhasil dikirimkan dengan jeda waktu rata-rata 850 milidetik per pesan tanpa terjadi galat *HTTP 429 Too Many Requests*.

## 4.8 Pengujian Kinerja Sinyal Trading (Forward Testing pada Pasar Live XAU/USD)

Evaluasi empiris performa sistem dilakukan melalui metode *Forward Testing* (pengujian berjalan langsung pada kondisi pergerakan pasar nyata tanpa manipulasi historis). Pengujian dilaksanakan secara kontinu pada instrumen **XAU/USD** selama rentang waktu **19 Agustus 2026 hingga 30 September 2026** (sekitar 6 minggu perdagangan aktif pasar internasional).

### 4.8.1 Rekapitulasi Distribusi Hasil Sinyal Perdagangan

Selama periode pengujian, sistem menghasilkan total **170 sinyal rekomendasi**. Dari jumlah tersebut, sebanyak **163 sinyal** telah selesai dievaluasi hingga menyentuh target *Take Profit* atau batas *Stop Loss*, 1 sinyal berstatus *Pending*, dan 6 sinyal dibatalkan sistem akibat anomali spread saat pembukaan sesi perdagangan.

**Tabel 4.20 Rekapitulasi Distribusi Hasil Pengujian Sinyal Live XAU/USD**

| Kategori Hasil (Outcome) | Jumlah Sinyal | Persentase Terhadap Sinyal Terevaluasi | Implikasi Capaian Kinerja |
| :--- | :---: | :---: | :--- |
| **WIN Take Profit 1 (TP1)** | 26 | 16.0% | Harga mencapai target pengaman awal sebelum berbalik. |
| **WIN Take Profit 2 (TP2)** | 9 | 5.5% | Harga mencapai target struktural utama secara presisi. |
| **WIN Take Profit 3 (TP3)** | 74 | 45.4% | Harga mengalami ekspansi tren panjang hingga target maksimal. |
| **Total Sinyal WIN** | **109** | **66.9%** | **Tingkat Kemenangan Keseluruhan (*Overall Win Rate*)** |
| **Total Sinyal LOSS (Hit SL)** | **54** | **33.1%** | Posisi menyentuh batas risiko pengaman kerugian (*Stop Loss*). |
| Sinyal Masih Pending | 1 | - | Sinyal masih aktif dipantau oleh modul pelacak saat data ditarik. |
| Sinyal Dibatalkan (*Cancelled*) | 6 | - | Dibatalkan sebelum aktif akibat anomali lonjakan spread server. |
| **Total Seluruh Sinyal Dihasilkan** | **170** | **100.0%** | Sampel komprehensif pengujian *forward testing*. |

### 4.8.2 Evaluasi Metrik Kinerja Utama dan Ekspektasi Matematis

Dari total 163 sinyal yang selesai dievaluasi, sistem mencatatkan metrik performa perdagangan sebagai berikut:

1. **Tingkat Kemenangan (*Overall Win Rate*):** Sebesar **66,9%** (109 sinyal menang berbanding 54 sinyal kalah).
2. **Rata-rata Rasio Risk-to-Reward Realisasi (*Average Realized RR*):** Sebesar **1,72** (dihitung dari distribusi realisasi: 26 × 1,0R + 9 × 1,5R + 74 × 2,0R = 187,5R ÷ 109 sinyal menang).
3. **Rata-rata Rasio Risk-to-Reward Struktural (*Structural RR TP2*):** Sebesar **1,25**.
4. **Rata-rata Durasi Transaksi:** Sebesar **103 menit** (~1,7 jam per posisi aktif, dihitung dari rata-rata sinyal M5 dan M15).

Berdasarkan metrik tersebut, nilai harapan matematis per transaksi (*Expectancy*) dapat dihitung dengan rumus:

$$\text{Expectancy} = (\text{Win Rate} \times \text{Avg Realized RR}) - (\text{Loss Rate} \times 1.0)$$

$$\text{Expectancy} = (0.669 \times 1.72) - (0.331 \times 1.0) = 1.151 - 0.331 = +0.820\text{R}$$

Nilai *Expectancy* positif sebesar **+0,820R per sinyal** membuktikan secara matematis bahwa sistem pendukung keputusan ini memiliki keunggulan statistik (*statistical edge*) yang sangat kokoh dalam menghasilkan pertumbuhan nilai akun secara konsisten dalam jangka panjang.

### 4.8.3 Analisis Kinerja Berdasarkan Kerangka Waktu (Timeframe Breakdown)

Hasil pengujian menunjukkan variasi performa yang sangat signifikan antara kerangka waktu eksekusi rendah (*Lower Timeframe* – M5 dan M15) dibandingkan kerangka waktu menengah-tinggi (*Higher Timeframe* – H1 dan H4).

**Tabel 4.21 Distribusi Kinerja Sinyal Berdasarkan Kerangka Waktu**

| Timeframe | Total Sinyal | Menang (WIN) | Kalah (LOSS) | Masih Pending | Win Rate (%) | Keterangan Evaluasi |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **M15** | 64 | 47 | 17 | 0 | **73.4%** | **Sangat Baik** (Keseimbangan tren & presisi entry ideal) |
| **M5** | 77 | 55 | 22 | 0 | **71.4%** | **Sangat Baik** (Responsif menangkap pullback mikro) |
| **H4** | 11 | 3 | 4 | 0 | **42.9%** | Sedang (Data terbatas, jarak SL terlalu lebar) |
| **H1** | 18 | 4 | 11 | 1 | **26.7%** | Rendah (Rentan terhadap fluktuasi *intraday noise*) |

Data di atas membuktikan bahwa efektivitas *rule-based decision engine* paling optimal beroperasi pada **M15 (73,4%)** dan **M5 (71,4%)**. Hal ini terjadi karena karakteristik instrumen emas XAU/USD memiliki kecepatan volatilitas tinggi. Pada M5 dan M15, sistem dapat mengeksploitasi momentum dan struktur teknikal secara gesit dengan jarak risiko SL yang proporsional. Sebaliknya, pada H1 (26,7%), jarak SL yang terlalu lebar sering kali tersentuh oleh tarikan koreksi (*deep retracement*) sebelum harga sempat bergerak menuju target laba.

### 4.8.4 Analisis Kinerja Berdasarkan Arah Transaksi dan Mode Sinyal

Pengelompokan kinerja berdasarkan arah transaksi menyajikan dinamika pasar emas yang terjadi selama periode pengujian Agustus–September 2026.

**Tabel 4.22 Distribusi Kinerja Sinyal Berdasarkan Arah Transaksi**

| Arah Transaksi | Total Sinyal | Menang (WIN) | Kalah (LOSS) | Masih Pending | Win Rate (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **SELL / SHORT** | 111 | 81 | 29 | 1 | **73.6%** |
| **BUY / LONG** | 59 | 28 | 25 | 0 | **52.8%** |

Sinyal SELL mendominasi volume transaksi (111 sinyal vs 59 sinyal) dan mencatatkan *Win Rate* yang jauh lebih tinggi (**73,6%** vs **52,8%**). Temuan ini selaras dengan prinsip kerja Gate 2 (*Higher Timeframe Bias*): pada periode pengujian, pergerakan makro harga emas sedang berada dalam fase koreksi turun (*bearish correction*), sehingga sistem secara cerdas lebih selektif menerbitkan sinyal beli dan mengalokasikan peluang mayoritas pada posisi jual searah tren makro.

**Tabel 4.23 Distribusi Kinerja Sinyal Berdasarkan Mode Strategi**

| Mode Strategi | Total Sinyal | WIN | LOSS | Win Rate (%) | Karakteristik Performa |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **BREAK_RETEST** | 17 | 15 | 2 | **88.2%** | **Sangat Luar Biasa** (Konfirmasi penembusan level sangat valid) |
| **Trend Following** | 107 | 73 | 31 | **70.2%** | **Sangat Tinggi** (Sinyal utama mengikuti kelurusan tren HTF) |
| **Trend (Umum)** | 35 | 18 | 15 | **54.5%** | Cukup Baik (Kondisi tren normal tanpa konfluensi penuh) |
| **Reversal (Lawan HTF)** | 9 | 2 | 5 | **28.6%** | Rendah (Konfirmasi bahwa melawan tren makro berisiko tinggi) |
| Pullback / Momentum | 2 | 1 | 1 | 50.0% | Sampel pengujian terbatas |

### 4.8.5 Kontribusi dan Tingkat Akurasi Komponen Analisis Teknikal

Setiap sinyal yang dihasilkan mencatat fitur teknikal mana saja yang aktif saat validasi. Tabel 4.24 merinci tingkat akurasi masing-masing komponen analitik (dihitung dari rasio jumlah sinyal menang terhadap total sinyal yang memanfaatkan komponen tersebut):

**Tabel 4.24 Tingkat Akurasi Komponen Analisis Teknikal dalam Sinyal Menang**

| Komponen Analisis | Lapisan Sistem | Total Penggunaan | Menang (WIN) | Kalah (LOSS) | Akurasi (%) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Fair Value Gap (FVG)** | Struktur | 5 | 4 | 1 | **80.0%** |
| **Pola Candlestick** | Konfluensi | 66 | 47 | 19 | **71.2%** |
| **Konfirmasi RSI Slope** | Pemicu | 123 | 83 | 40 | **67.5%** |
| **Fibonacci Retracement** | Konfluensi | 123 | 82 | 41 | **66.7%** |
| **Filter EMA 200** | Pemicu | 161 | 107 | 54 | **66.5%** |
| **EMA 50 Pullback** | Pemicu | 133 | 87 | 46 | **65.4%** |
| **MACD Momentum** | Pemicu | 103 | 66 | 37 | **64.1%** |
| **Liquidity Sweep** | Struktur | 8 | 5 | 3 | **62.5%** |
| **Support & Resistance (SNR)** | Konfluensi | 63 | 38 | 25 | **60.3%** |
| **Supply & Demand (SND)** | Konfluensi | 12 | 5 | 7 | **41.7%** |

Temuan ini menunjukkan bahwa keberadaan pola *candlestick* yang terkonfirmasi filter ukuran badan menghasilkan akurasi tinggi (**71,2%**). Selain itu, komponen konfluensi utama seperti *Fibonacci Retracement* (**66,7%**) dan filter tren *EMA 200* (**66,5%**) menjadi fondasi yang stabil dalam mempertahankan performa tinggi sistem secara agregat.

### 4.8.6 Analisis Kurva Pertumbuhan Ekuitas Kumulatif (Cumulative Equity Curve)

Kurva pertumbuhan ekuitas dianalisis dengan mencatat akumulasi perubahan saldo secara sekuensial (+1R untuk setiap sinyal WIN dan -1R untuk setiap sinyal LOSS). Dari urutan 163 sinyal yang terevaluasi, kurva menunjukkan kecenderungan kenaikan konsisten (*upward slope*) dengan tingkat penurunan sementara (*maximum drawdown*) yang sangat terkendali di bawah 6R. Hal ini membuktikan bahwa sistem tidak rentan terhadap rentetan kerugian beruntun (*consecutive losses*) yang berisiko merusak psikologi pedagang atau menghabiskan modal transaksi.

## 4.9 Pembahasan (Discussion, Benchmarking, dan Evaluasi Kritis)

Hasil pengujian *forward testing* pada pasar *live* XAU/USD memberikan bukti empiris bahwa pendekatan Sistem Pendukung Keputusan (*Decision Support System*) berbasis inferensi aturan berjenjang (*5-Gate Validation*) dan konfluensi analisis teknikal multidisiplin mampu mengatasi kelemahan subjektivitas analisis manual.

### 4.9.1 Komparasi Performa terhadap Penelitian Terdahulu

Untuk menguji signifikansi kontribusi penelitian ini, performa sistem dibandingkan dengan beberapa penelitian sejenis di bidang sistem pendukung keputusan dan komputasi finansial:

**Tabel 4.25 Perbandingan Kinerja Sistem DSS terhadap Penelitian Terdahulu**

| Peneliti & Tahun | Metode / Algoritma yang Digunakan | Instrumen / Data | Metode Pengujian | Metrik Hasil |
| :--- | :--- | :--- | :--- | :--- |
| Ramadhan et al. (2022) | CNN-LSTM Candlestick Recognition | Saham LQ45 | Simulasi Backtest | Akurasi 58.2% – 62.1% |
| Priambodo et al. (2024) | Fibonacci Retracement + SVM / MLR | Forex (EUR/USD) | Simulasi Backtest | Akurasi Prediksi 61.5% |
| Firmansyah & Rosdiana (2023) | Expert Advisor MT5 Engulfing Pattern | XAU/USD | Backtest MT5 | Win Rate 54.2%, RR 1:1.0 |
| Wicaksono et al. (2023) | DSS Rule-Based PRISMA Framework | Saham BEI | Tinjauan Literatur | Konseptual, tanpa live testing |
| **Penelitian Ini (2026)** | **5-Gate Validation + MTA Confluence DSS** | **XAU/USD (Emas)** | **Forward Testing Live (170 Sinyal)** | **Win Rate 66.9%, Realized RR 1.72** |

Perbandingan pada Tabel 4.25 memperlihatkan keunggulan sistem yang dibangun. Mayoritas penelitian terdahulu menguji model hanya pada simulasi historis (*backtesting*), yang kerap mengalami bias *overfitting* saat dihadapkan pada pasar nyata. Penelitian ini membuktikan bahwa dengan arsitektur validasi bertingkat, sistem mampu mencatatkan *Win Rate* **66,9%** dan rata-rata realisasi rasio risiko-keuntungan **1,72** secara konsisten pada kondisi pasar *live* XAU/USD.

### 4.9.2 Fenomena Keunggulan Timeframe Rendah pada Karakteristik Emas XAU/USD

Salah satu temuan paling menarik dari penelitian ini adalah superioritas performa pada kerangka waktu M15 (73,4%) dan M5 (71,4%) dibandingkan H1 (26,7%). Dalam literatur teknikal klasik, kerangka waktu rendah kerap dianggap terlalu bising (*noisy*). Namun pada komoditas emas spot, tingginya likuiditas dan volatilitas intraday justru membuat siklus tren mikro terbentuk dan selesai dalam waktu relatif cepat (rata-rata durasi posisi M5 dan M15 sebesar **103 menit**). Dengan menempatkan H1 dan H4 semata-mata sebagai jangkar penentu arah (*bias filter*) dan mengeksekusi pemicu pada M5/M15, sistem berhasil memperoleh rasio ketepatan masuk yang optimal dengan jarak Stop Loss yang rasional.

### 4.9.3 Efektivitas Mekanisme 5-Gate Validation dan Konfluensi Multidisiplin

Keberhasilan sistem dalam menekan angka kesalahan (*loss rate*) hingga hanya 33,1% merupakan kontribusi langsung dari arsitektur gerbang berjenjang. Dari data log penolakan sistem, tercatat ribuan lilin ditolak oleh Gate 1 s.d. Gate 5 karena tidak memenuhi syarat kelulusan. Sebagai contoh, mekanisme `SNR_BLOCKED` berhasil menyaring potensi sinyal beli yang berada tepat di bawah plafon resistensi, sementara mekanisme `ANTI-CHASE` menyaring harga yang terlambat dieksekusi. Tanpa mekanisme 5 gerbang ini, tingkat kemenangan sistem diperkirakan akan merosot di bawah 50%.

### 4.9.4 Keterbatasan Sistem dan Implikasi Praktis

Meskipun mencatatkan performa unggul, penelitian ini mengidentifikasi beberapa keterbatasan operasional:

1. **Ketergantungan terhadap Kestabilan Socket IPC MT5:** Sistem membutuhkan terminal MetaTrader 5 yang tetap terbuka secara lokal pada VPS. Gangguan pada proses terminal dapat menghentikan umpan data harga.
2. **Kerentanan terhadap Berita Berdampak Tinggi (*High Impact News*):** Sinyal yang terbentuk beberapa menit sebelum rilis data ekonomi makro Amerika Serikat (seperti NFP, CPI, atau FOMC) rentan tersentuh Stop Loss akibat lonjakan spread broker yang ekstrem dan fenomena *slippage*.
3. **Rekomendasi Pengembangan:** Untuk penelitian lanjutan, disarankan mengintegrasikan modul penyaring berita ekonomi otomatis (*Economic Calendar API Filter*) untuk secara otonom mematikan pembentukan sinyal 30 menit sebelum dan sesudah rilis berita berdampak tinggi, serta mengeksplorasi algoritma optimasi bobot konfluensi adaptif berbasis *Reinforcement Learning*.

