# LAMPIRAN

## Lampiran 1: Kode Program Utama Sistem Pendukung Keputusan

Berikut disajikan implementasi kode sumber utama sistem (*Core Engine Modules*) yang merepresentasikan logika akuisisi data, evaluasi aturan inferensi 5-Gate Validation, dan kalkulasi dinamis Stop Loss / Take Profit berbasis bahasa pemrograman Python 3.11 (mengikuti format penulisan kode sumber pada Lampiran 12 Pedoman Penulisan Tugas Akhir Informatika Untirta 2025 dengan jenis huruf *Courier New* ukuran 10 pt):

### Lampiran 1.1 Titik Masuk Eksekusi Utama (`src/main.py`)

**Lokasi Berkas:** `src/main.py`  
Modul ini berfungsi sebagai titik masuk eksekusi utama (entry point) yang mengorkestrasi siklus hidup sistem, inisialisasi konektivitas MetaTrader 5, penjadwalan pemindaian multi-timeframe berkala, penanganan sinyal interupsi (graceful shutdown), serta peluncuran worker thread pelacak transaksi secara simultan.

```python
"""main.py — Entry point bot trading DSS Forex.

Jalankan: python -m src.main
Loop: candle close → evaluate_any_tf_mta() → sinyal ke Telegram → tracker pantau outcome.
"""
import re
import time
from datetime import datetime

import MetaTrader5 as mt5
import pandas as pd
import pytz
from loguru import logger

from src.config.settings import load_settings
from src.engine.anytf_mta_engine import evaluate_any_tf_mta
from src.features.indicators import add_indicators
from src.features.patterns import add_patterns
from src.infra.logger import setup_logger
from src.infra.reject_tracker import RejectTracker
from src.infra.report.generator import generate_report
from src.infra.scheduler import CandleCloseWatcher
from src.infra.signal_logger import SignalLogger
from src.infra.signal_tracker import SignalTracker
from src.mt5.connector import connect, shutdown
from src.mt5.market_data import ensure_symbol, fetch_ohlc
from src.notify.telegram import send_message
from src.notify.templates import format_signal


# Reject label utilities


def _extract(s: str, open_: str, close_: str) -> str:
    try:
        return s[s.index(open_) + len(open_): s.rindex(close_)]
    except (ValueError, IndexError):
        return ""


def _short_reject(raw: str) -> str:
    """Reject reason satu baris untuk terminal log."""
    if not raw or raw in ("INIT", "OK"):
        return raw
    u = raw.upper()

    if u.startswith("NOT_ENOUGH_BARS"):
        return f"Data kurang: {_extract(raw, '(', ')')} bar"
    if u.startswith("ATR_TOO_LOW_SCALPING"):
        atr  = re.search(r"atr=([0-9.]+)", raw)
        mn   = re.search(r"min=([0-9.]+)", raw)
        a    = atr.group(1) if atr else "?"
        m    = mn.group(1)  if mn  else "?"
        return f"ATR scalping terlalu kecil: {a} (min {m} poin) — pasar terlalu flat"
    if u.startswith("ATR_INVALID"):
        return "ATR tidak valid"
    if u.startswith("ATR_TOO_LOW"):
        return f"ATR terlalu kecil: {_extract(raw, '(', ')')}"
    if u.startswith("COOLDOWN"):
        return f"Cooldown: {_extract(raw, '(', ')')}"
    if u.startswith("OUT_OF_SESSION"):
        return f"Luar sesi: {_extract(raw, '(', ')')}"
    if u.startswith("DAILY_LIMIT"):
        mode = "scalping" if "SCALPING" in u else "intraday"
        count = _extract(raw, "(", ")")
        return f"Batas harian {mode}: {count}"
    if u.startswith("BIAS_FAIL+CT_FAIL"):
        ema  = re.search(r"ema=([A-Z_]+)", raw)
        macd = re.search(r"macd=([A-Z_]+)", raw)
        parts = []
        if ema:  parts.append(f"EMA:{ema.group(1)}")
        if macd: parts.append(f"MACD:{macd.group(1)}")
        return "Bias+CT gagal: " + " | ".join(parts) if parts else "Bias+CT gagal"
    if u.startswith("BIAS_FAIL"):
        detail = _extract(raw, "(", ")")
        parts  = [f"{tf}→{b.lower()}" for item in detail.split()
                  if ":" in item for tf, b in [item.split(":", 1)]]
        return "Bias: " + ", ".join(parts) if parts else f"Bias: {detail[:60]}"
    if u.startswith("TRIGGER_FAIL"):
        sc = re.search(r"score=(\d+)/(\d+)", raw)
        dr = re.search(r"dir=(\w+)", raw)
        if sc:
            skor      = sc.group(1)
            threshold = sc.group(2)
            arah      = dr.group(1) if dr else ""
            return f"Trigger gagal: {skor}/6 (min={threshold}) {arah}".strip()
        return "Trigger gagal"
    if u.startswith("CONFLUENCE_FAIL"):
        sc = re.search(r"conf=(\d+)/(\d+)", raw)
        if sc:
            skor      = sc.group(1)
            threshold = sc.group(2)
            notes = re.search(r"\[(.*?)\]", raw)
            extra = ""
            if notes:
                tags = [n.strip() for n in notes.group(1).split(",")
                        if any(k in n for k in ("Sweep", "FVG"))]
                if tags:
                    extra = " [" + ",".join(tags) + "]"
            return f"Confluence rendah: {skor} (min={threshold}){extra}"
        return "Confluence gagal"
    if u.startswith("SNR_BLOCKED"):
        return "SNR blocked: jalan terblokir"
    if "SNR_WEAK" in u:
        return "SNR lemah: level 2-touch berkontribusi 30% (optimal: 5+ touch)"
    if "MOM_RECOVERY_FAIL" in u:
        detail = re.search(r"MOM_RECOVERY_FAIL:([^\]]+)", raw)
        if detail:
            return f"Momentum Recovery gagal: {detail.group(1)}"
        return "Momentum Recovery: syarat tidak terpenuhi"
    if "MOM_RECOVERY" in u:
        arah   = re.search(r"MOM_RECOVERY:(BULL|BEAR)\(([^)]+)\)", raw)
        if arah:
            dir_label = "BUY" if arah.group(1) == "BULL" else "SELL"
            return f"Momentum Recovery {dir_label}: {arah.group(2)}"
        arah2 = re.search(r"MOM_RECOVERY:(BULL|BEAR)", raw)
        dir_label = ("BUY" if arah2 and arah2.group(1) == "BULL" else "SELL") if arah2 else "?"
        return f"Momentum Recovery: H1 NEUTRAL, impulse lokal → {dir_label}"
    if u.startswith("MARKET_TRANSITION"):
        adx = re.search(r"adx_(\w+)=([0-9.]+)", raw)
        if adx:
            return f"Transisi pasar: ADX {adx.group(1)}={adx.group(2)} (tren melemah, tunda Continuation)"
        return "Transisi pasar: tren di TF penentu melemah"
    if u.startswith("ASIAN_NO_KEY_LEVEL"):
        return "Asian: tidak ada level kunci (wajib SNR/SND)"
    if u.startswith("RR_FAIL"):
        rr  = re.search(r"rr=([0-9.None]+)", raw)
        mn  = re.search(r"min=([0-9.]+)", raw)
        return f"RR terlalu rendah: {rr.group(1) if rr else '?'} (min {mn.group(1) if mn else '?'})"
    if u.startswith("SLTP_NONE"):
        return "SL/TP tidak dapat dihitung"

    return raw.split(":")[0]


def _short_reject_with_df(raw: str, df: pd.DataFrame | None = None) -> str:
    if not raw or raw in ("INIT", "OK"):
        return raw
    u = raw.upper()
    if u.startswith("CT_EMA200_FAIL") or u.startswith("EMA200_WAJIB"):
        # CT_EMA200_FAIL tidak memuat dir= di raw — baca dari df, fallback "CT"
        dir_match = re.search(r"dir=(\w+)", raw)
        if df is not None and len(df) >= 2:
            try:
                last   = df.iloc[-2]
                close  = float(last.get("close", 0))
                ema200 = last.get("ema_200")
                if ema200 is not None and not pd.isna(ema200):
                    ema200    = float(ema200)
                    side      = "di bawah" if close < ema200 else "di atas"
                    dir_label = dir_match.group(1) if dir_match else "CT"
                    return f"EMA200: close={close:.1f} {side} EMA200={ema200:.1f} — {dir_label} ditolak"
            except Exception:
                pass
        dir_label = dir_match.group(1) if dir_match else "CT"
        return f"EMA200 berlawanan — {dir_label} ditolak"
    if u.startswith("LATE_ENTRY"):
        dist = re.search(r"dist=([0-9.]+)", raw)
        mx   = re.search(r"max=([0-9.]+)", raw)
        d    = dist.group(1) if dist else "?"
        m    = mx.group(1)   if mx   else "?"
        return f"Late entry: harga sudah jauh {d} dari trigger (max {m})"
    return _short_reject(raw)


def _fetch_prepare(symbol: str, tf: str, bars: int) -> pd.DataFrame:
    df = fetch_ohlc(symbol, tf, bars).sort_values("time").reset_index(drop=True)
    df = add_indicators(df, tf=tf)
    df = add_patterns(df)
    return df


def _get_mt5_tick(symbol: str) -> tuple[float, float]:
    tick = mt5.symbol_info_tick(symbol)
    return (tick.bid, tick.ask) if tick else (0.0, 0.0)


def _refresh_report(sig_logger: SignalLogger) -> None:
    try:
        generate_report(sig_logger, silent=True)
    except PermissionError:
        logger.debug("Report skip: file sedang dibuka di Excel")
    except Exception as e:
        logger.debug(f"Report refresh gagal: {e}")


def main() -> None:
    setup_logger()
    logger.info("Logger aktif")

    s = load_settings()
    logger.info(
        f"BOT START | symbols={s.symbols} TFs={s.timeframes} "
        f"bars={s.bars} poll={s.poll_seconds}s"
    )
    logger.info(
        f"PARAMS | RR>={s.min_rr} trig>={s.min_trigger_score} "
        f"conf>={s.min_confluence_score} votes>={s.min_confirm_votes} "
        f"cooldown={s.cooldown_bars}bar session={s.session_filter}"
    )
    logger.info(
        f"PARAMS SCALPING | TP={s.scalping_tp1_rr}R/{s.scalping_tp2_rr}R/{s.scalping_tp3_rr}R "
        f"SL<=10pt ATR>=5 OE>={s.scalping_overextend_atr_mult}×ATR "
        f"PB={'ON' if s.scalping_pullback_enabled else 'OFF'} "
        f"Sweep={'ON' if s.scalping_sweep_enabled else 'OFF'} FVG={'ON' if s.scalping_fvg_enabled else 'OFF'} "
        f"trig>={s.scalping_min_trigger_score} conf>={s.scalping_min_confluence_score} "
        f"cooldown M5={s.scalping_cooldown_bars_m5}bar M15={s.scalping_cooldown_bars_m15}bar"
    )
    logger.info(
        f"PARAMS GATES | VETO+FLIP={'ON' if s.ltf_veto_enabled else 'OFF'} "
        f"flip_trig>={s.flip_min_trigger} FLIP_key={'ON' if s.flip_require_key_level else 'OFF'} "
        f"H1_key={'ON' if s.h1_require_key_level else 'OFF'} "
        f"PB_floor={s.scalping_pullback_min_trigger} "
        f"RangeQual_key={'ON' if s.range_quality_key_level else 'OFF'}"
    )

    sig_logger     = SignalLogger()
    reject_tracker = RejectTracker(interval_minutes=30)
    logger.info("SignalLogger aktif → logs/signal_history.csv")

    def _notify(msg: str) -> None:
        try:
            send_message(s.telegram_token, s.telegram_chat_id, msg)
        except Exception as e:
            logger.warning(f"Notify error: {e}")

    tracker = SignalTracker(
        sig_logger        = sig_logger,
        get_price_fn      = _get_mt5_tick,
        send_notify_fn    = _notify,
        refresh_report_fn = lambda: _refresh_report(sig_logger),
    )
    watcher = CandleCloseWatcher()

    try:
        acc = connect(s.mt5_login, s.mt5_password, s.mt5_server, s.mt5_terminal_path)
        logger.info(f"MT5 terhubung | login={acc.login} server={acc.server}")
        tracker.start()

        send_message(
            s.telegram_token, s.telegram_chat_id,
            (
                "<b>BOT TRADING ONLINE</b>\n\n"
                f"Account  : <code>{acc.login}</code>\n"
                f"Server   : <code>{acc.server}</code>\n"
                f"Symbols  : {', '.join(s.symbols)}\n"
                f"TFs      : {', '.join(s.timeframes)}\n\n"
                f"<b>Intraday</b>: RR>={s.min_rr} | Trig>={s.min_trigger_score} "
                f"| Conf>={s.min_confluence_score} "
                f"| D1_anchor={'ON' if s.intraday_require_d1 else 'OFF'} "
                f"| Cooldown={s.cooldown_bars}bar\n"
                f"<b>Scalping</b>: TP={s.scalping_tp1_rr}R/{s.scalping_tp2_rr}R/{s.scalping_tp3_rr}R "
                f"| SL<=10pt | OE>={s.scalping_overextend_atr_mult}×ATR "
                f"| PB={'ON' if s.scalping_pullback_enabled else 'OFF'} "
                f"| Trig>={s.scalping_min_trigger_score} | Conf>={s.scalping_min_confluence_score}\n"
                f"Session  : {'ON' if s.session_filter else 'OFF'}\n"
                f"Tracker  : ON ({tracker.get_active_count()} sinyal pending)"
            ),
        )

        while True:
            for symbol in s.symbols:
                ensure_symbol(symbol)

                data_by_tf: dict[str, pd.DataFrame] = {}
                last_events: dict[str, object]      = {}

                for trigger_tf in s.timeframes:
                    tf_u = trigger_tf.upper()
                    try:
                        df = _fetch_prepare(symbol, tf_u, s.bars)
                        data_by_tf[tf_u] = df
                    except Exception as e:
                        logger.error(f"[FETCH ERROR] {symbol} {tf_u}: {e}")
                        continue
                    event = watcher.check(symbol, tf_u, df)
                    if event is not None:
                        last_events[tf_u] = event

                if not last_events:
                    continue   # tidak ada candle close — lanjut ke symbol berikutnya
                               # TANPA sleep terpisah; satu-satunya sleep ada di bawah while True

                bid, ask = _get_mt5_tick(symbol)
                tfs_closing = ", ".join(last_events.keys())
                logger.info(f"{symbol} | Candle close: {tfs_closing} | bid={bid:.2f} ask={ask:.2f}")
                reject_tracker.record_candle()
                signal_count = 0

                for tf_u in last_events:
                    tf_u_norm = tf_u.upper()
                    enabled_u = [t.upper() for t in s.timeframes]
                    data_norm = {k.upper(): v for k, v in data_by_tf.items()}
                    _sl_cap   = {
                        "M5":  s.max_sl_m5,  "M15": s.max_sl_m15,
                        "H1":  s.max_sl_h1,  "H4":  s.max_sl_h4,
                        "D1":  s.max_sl_d1,
                    }
                    _max_sl = _sl_cap.get(tf_u_norm, s.max_sl_points)

                    try:
                        sig = evaluate_any_tf_mta(
                            data_by_tf           = data_norm,
                            symbol               = symbol,
                            trigger_tf           = tf_u_norm,
                            enabled_tfs          = enabled_u,
                            min_rr               = s.min_rr,
                            min_confirm_votes    = s.min_confirm_votes,
                            min_trigger_score    = s.min_trigger_score,
                            min_confluence_score = s.min_confluence_score,
                            cooldown_bars        = s.cooldown_bars,
                            atr_min_pct          = s.atr_min_pct,
                            sl_atr_mult          = s.sl_atr_mult,
                            tp1_rr               = s.tp1_rr,
                            tp2_rr               = s.tp2_rr,
                            tp3_rr               = s.tp3_rr,
                            max_sl_points        = _max_sl,
                            sl_pips              = s.sl_pips,
                            tp1_pips             = s.tp1_pips,
                            tp2_pips             = s.tp2_pips,
                            tp3_pips             = s.tp3_pips,
                            pip_size             = s.pip_size,
                            session_filter       = s.session_filter,
                            counter_trend_enabled        = s.counter_trend_enabled,
                            min_counter_confluence       = s.min_counter_confluence,
                            counter_trend_min_rr         = s.counter_trend_min_rr,
                            counter_trend_tfs            = s.counter_trend_tfs,
                            scalping_min_trigger_score   = s.scalping_min_trigger_score,
                            scalping_min_confluence_score= s.scalping_min_confluence_score,
                            scalping_atr_min_points      = s.scalping_atr_min_points,
                            scalping_sl_atr_mult         = s.scalping_sl_atr_mult,
                            scalping_cooldown_bars       = s.scalping_cooldown_bars,
                            scalping_cooldown_bars_m5    = s.scalping_cooldown_bars_m5,
                            scalping_cooldown_bars_m15   = s.scalping_cooldown_bars_m15,
                            scalping_tp1_rr              = s.scalping_tp1_rr,
                            scalping_tp2_rr              = s.scalping_tp2_rr,
                            scalping_tp3_rr              = s.scalping_tp3_rr,
                            scalping_tp1_atr_mult        = s.scalping_tp1_atr_mult,
                            scalping_overextend_atr_mult  = s.scalping_overextend_atr_mult,
                            scalping_pullback_enabled  = s.scalping_pullback_enabled,
                            scalping_sweep_enabled   = s.scalping_sweep_enabled,
                            scalping_fvg_enabled     = s.scalping_fvg_enabled,
                            momentum_ema200_tolerance= s.momentum_ema200_tolerance,
                            range_rejection_enabled  = s.range_rejection_enabled,
                            scalping_min_rr              = s.scalping_min_rr,
                            scalping_counter_trend_min_rr= s.scalping_counter_trend_min_rr,
                            market_transition_adx_block  = s.market_transition_adx_block,
                            market_transition_adx_gray   = s.market_transition_adx_gray,
                            scalping_h1_only             = s.scalping_h1_only,
                            intraday_require_d1          = s.intraday_require_d1,
                            ltf_veto_enabled             = s.ltf_veto_enabled,
                            flip_min_trigger             = s.flip_min_trigger,
                            flip_require_key_level       = s.flip_require_key_level,
                            h1_require_key_level         = s.h1_require_key_level,
                            scalping_pullback_min_trigger= s.scalping_pullback_min_trigger,
                            range_quality_key_level       = s.range_quality_key_level,
                        )
                    except Exception as eval_err:
# Exception satu TF/candle jangan mematikan seluruh bot — log, skip, lanjut.
                        logger.error(f"[EVAL ERROR] {symbol} {tf_u_norm}: {eval_err}", exc_info=True)
                        continue

                    if sig is None:
                        raw    = data_norm.get(tf_u_norm, pd.DataFrame()).attrs.get("reject_reason", "UNKNOWN")
                        df_cur = data_norm.get(tf_u_norm)
                        logger.info(f"{symbol} {tf_u_norm:<3} ✗  {_short_reject_with_df(raw, df_cur)}")
                        logger.debug(f"{tf_u_norm} raw: {raw[:200]}")
                        reject_tracker.record_reject(symbol=symbol, tf=tf_u_norm, raw=raw, df=df_cur)
                    else:
                        signal_count += 1
                        signal_id = sig_logger.log_signal(sig)
                        mode_str = "REVERSAL" if sig.signal_mode == "REVERSAL" else sig.trade_mode.upper()
                        logger.info(
                            f"{symbol} {tf_u_norm} 🚀 {sig.direction} [{mode_str}]"
                            f"  entry={sig.entry:.2f}  sl={sig.sl:.2f}  tp1={sig.tp:.2f}"
                            f"  RR={sig.rr:.2f}"
                            f"  trig={sig.trigger_score}/{sig.trigger_max}"
                            f"  conf={sig.confluence_score}"
                        )
                        rec = sig_logger.get_by_id(signal_id)
                        if rec:
                            tracker.add_signal(rec)
                        _refresh_report(sig_logger)
                        send_message(
                            s.telegram_token, s.telegram_chat_id,
                            format_signal(sig, signal_id=signal_id),
                        )

                if signal_count > 0:
                    reject_tracker.record_signal()

            reject_tracker.maybe_print_summary(
                symbol=s.symbols[0] if s.symbols else "XAUUSD"
            )
            time.sleep(s.poll_seconds)

    except KeyboardInterrupt:
        logger.info("Bot dihentikan (Ctrl+C).")
    except Exception:
        logger.exception("FATAL ERROR — bot berhenti tidak terduga")
    finally:
        tracker.stop()
        shutdown()
        logger.info("MT5 disconnected. Bot selesai.")


if __name__ == "__main__":
    main()

```

### Lampiran 1.2 Mesin Inferensi Keputusan (`src/engine/anytf_mta_engine.py`)

**Lokasi Berkas:** `src/engine/anytf_mta_engine.py`  
Modul ini mengimplementasikan mesin inferensi berbasis aturan (Rule-Based Decision Engine) dengan kerangka kerja 5-Gate Validation, mengoordinasikan evaluasi kelayakan teknis, filter bias makro, penilaian pemicu eksekusi, konfluensi struktur, hingga validasi manajemen risiko sebelum menerbitkan sinyal transaksi.

```python
"""anytf_mta_engine.py — Rule-Based Decision Engine (Multi-Timeframe Analysis).

5 gate: Validasi -> HTF Bias -> Trigger Score -> Confluence Score -> SL/TP & RR.
Orchestrator: implementasi tiap gate dipecah ke submodul (bias/state/trigger/confluence/
setup_plan/cooldown/utils). Simbol publik tetap re-export dari sini.
"""
from __future__ import annotations

from datetime import datetime

import pandas as pd
import pytz

from src.engine.bias import _all_tf_bias, _detect_trade_mode, _vote_bias
from src.engine.cooldown import (
    _CONFLICT_WINDOW_SEC,
    _LAST_LIVE_EMIT,
    _LAST_SIGNAL_TIME,
    _save_cooldown_state,
    get_consec_loss_count,
    record_loss,
    reset_consec_loss,
)
from src.engine.confluence import _confluence_score, _is_counter_trend_valid
from src.engine.setup_plan import scan_setup_plan
from src.engine.state import _decisive_adx, _ltf_counter_veto, _market_state, detect_market_condition
from src.engine.structure import structure_holds, structure_trend_start
from src.engine.trigger import _has_key_level, _has_quality_key_level, _range_rejection_setup, _scalp_pullback_setup, _trigger_score
from src.engine.utils import _atr_proxy, _latest_closed, _reject, calc_rr
from src.features.entry_setup import classify_entry_setup
from src.features.session import is_active_session, session_name, session_strictness
from src.models.signal import Signal
from src.risk.sl_tp import dynamic_atr_sltp, fixed_zone_sltp, swing_based_sltp
from src.strategy.multi_timeframe import higher_timeframes


def evaluate_any_tf_mta(
    data_by_tf:           dict[str, pd.DataFrame],
    symbol:               str,
    trigger_tf:           str,
    enabled_tfs:          list[str],
    min_rr:               float = 1.5,
    min_confirm_votes:    int   = 1,
    min_trigger_score:    int   = 4,
    min_confluence_score: int   = 2,
    cooldown_bars:        int   = 3,
    atr_min_pct:          float = 0.0006,
    sl_atr_mult:          float = 1.5,
    tp1_rr:               float = 1.5,
    tp2_rr:               float = 2.5,
    tp3_rr:               float = 4.0,
    max_sl_points:        float = 50.0,
    sl_pips:              float = 50.0,
    tp1_pips:             float = 70.0,
    tp2_pips:             float = 100.0,
    tp3_pips:             float = 140.0,
    pip_size:             float = 0.1,
    session_filter:       bool  = True,
    counter_trend_enabled:         bool             = True,
    min_counter_confluence:        int              = 3,
    counter_trend_min_rr:          float            = 2.0,
    counter_trend_tfs:             list[str] | None = None,
    scalping_min_trigger_score:    int              = 3,
    scalping_min_confluence_score: int              = 2,
    scalping_atr_min_points:       float            = 3.0,
    scalping_sl_atr_mult:          float            = 1.2,
    scalping_cooldown_bars:        int              = 5,
    scalping_cooldown_bars_m5:     int              = 6,
    scalping_cooldown_bars_m15:    int              = 5,
    scalping_tp1_rr:               float            = 1.0,
    scalping_tp2_rr:               float            = 1.6,
    scalping_tp3_rr:               float            = 2.6,
    scalping_tp1_atr_mult:         float            = 0.0,  # >0 → TP1 scalping = ×ATR (off: ladder RR)
    scalping_overextend_atr_mult:   float            = 1.2,  # anti-chase: jarak max entry dari EMA20 (×ATR)
    momentum_ema200_tolerance:      float            = 1.0,  # jalur momentum: band EMA200 (×ATR)
    range_rejection_enabled:        bool             = True, # RANGE lane: rejection di level kunci
    scalping_pullback_enabled:      bool             = False, # mode pullback/rebound scalping (opsional)
    scalping_sweep_enabled:         bool             = False, # liquidity sweep ikut skor scalping (off: logging-only)
    scalping_fvg_enabled:           bool             = False, # FVG ikut skor scalping (off: logging-only)
    scalping_min_rr:               float            = 1.0,
    scalping_counter_trend_min_rr: float            = 1.5,
    market_transition_adx_block:   float            = 15.0,
    market_transition_adx_gray:    float            = 25.0,
    scalping_h1_only:              bool             = True,
    intraday_require_d1:           bool             = True,
    # Tuas keketatan/reaksi (A/B testing tanpa ubah kode).
    ltf_veto_enabled:              bool             = True,  # VETO + FLIP lane menyala
    flip_min_trigger:              int              = 3,     # FLIP wajib trigger >= ini
    flip_require_key_level:        bool             = True,  # FLIP wajib key level
    h1_require_key_level:          bool             = True,  # H1 wajib key level
    scalping_pullback_min_trigger: int              = 2,     # floor trigger jalur PULLBACK
    range_quality_key_level:       bool             = True,  # RANGE/sideways: continuation wajib level berkualitas
) -> Signal | None:
    """Evaluasi sinyal untuk satu (symbol, trigger_tf). Returns Signal jika 5 gate lulus."""
    trigger_tf  = trigger_tf.upper()
    enabled_tfs = [tf.upper() for tf in enabled_tfs]

    if trigger_tf not in data_by_tf:
        return None

    df_t = data_by_tf[trigger_tf]
    _reject(df_t, "INIT")

    # Circuit breaker: counter loss terpisah per mode (key "{symbol}_{mode}") —
    # loss scalping tak memblokir intraday dan sebaliknya.
    today_str   = datetime.now().strftime("%Y-%m-%d")
    _is_scalping_tf = trigger_tf in {"M5", "M15"}
    _cb_key     = f"{symbol}_{'scalping' if _is_scalping_tf else 'intraday'}"
    _cb_mode    = "scalping" if _is_scalping_tf else "intraday"

    # GATE 1 — Validasi teknis
    if len(df_t) < 200:
        _reject(df_t, f"NOT_ENOUGH_BARS({len(df_t)})"); return None

    last          = _latest_closed(df_t)
    close_time_ts = pd.to_datetime(last["time"])
    # Simpan sebagai UTC eksplisit (suffix +00:00) agar iso_to_wib_str() tahu perlu konversi
    close_time    = str(close_time_ts.to_pydatetime().replace(tzinfo=pytz.utc).isoformat())
    price_now     = float(last["close"])
    atr           = _atr_proxy(df_t)

    if atr <= 0:
        _reject(df_t, "ATR_INVALID"); return None
    if atr < price_now * atr_min_pct:
        _reject(df_t, f"ATR_TOO_LOW({atr:.4f})"); return None

    is_scalping = trigger_tf in {"M5", "M15"}

    # ATR absolut khusus scalping: tolak rentang paling sempit supaya SL/TP ATR-based
    # punya ruang; atr_min_pct (relatif) tetap menjaring pasar ultra-flat.
    if is_scalping and scalping_atr_min_points > 0 and atr < scalping_atr_min_points:
        _reject(df_t, f"ATR_TOO_LOW_SCALPING(atr={atr:.2f}/min={scalping_atr_min_points:.1f})")
        return None

    if is_scalping:
        base_trig  = scalping_min_trigger_score
        base_conf  = scalping_min_confluence_score
        # Cooldown per-TF: M5/M15 punya nilai sendiri, TF lain fallback ke umum.
        if trigger_tf == "M5":
            base_cd = scalping_cooldown_bars_m5
        elif trigger_tf == "M15":
            base_cd = scalping_cooldown_bars_m15
        else:
            base_cd = scalping_cooldown_bars
    else:
        base_trig  = min_trigger_score
        base_conf  = min_confluence_score
        base_cd    = cooldown_bars

    market_cond = detect_market_condition(df_t)
    if market_cond == "volatile":
        eff_trig = max(1, base_trig - 1)
        eff_conf = max(1, base_conf - 1)
    elif market_cond == "sideways":
        eff_trig = base_trig + 1
        eff_conf = base_conf + 1
    else:
        eff_trig = base_trig
        eff_conf = base_conf

    _asian_continuation_pending = False
    if is_scalping:
        _asian_continuation_pending = True

    key        = (symbol, trigger_tf)
    last_sig_t = _LAST_SIGNAL_TIME.get(key)
    if last_sig_t is not None:
        tf_min = {"M1":1,"M5":5,"M15":15,"M30":30,"H1":60,"H4":240,"D1":1440}.get(trigger_tf, 5)
        bars_since = (close_time_ts - last_sig_t).total_seconds() / (tf_min * 60)
        if bars_since < base_cd:
            _reject(df_t, f"COOLDOWN({bars_since:.1f}bar)"); return None

    now_utc = close_time_ts.to_pydatetime().replace(tzinfo=pytz.utc) if close_time_ts.tzinfo is None else close_time_ts.to_pydatetime()
    sess    = session_name(now_utc)
    
    # Asian CONTINUATION: +1 trigger & +1 confluence. Bias baru diketahui di GATE 2,
    # maka session dicek di sini; hanya jalur CONTINUATION (REVERSAL/CT tak terpengaruh).
    if _asian_continuation_pending and session_strictness(now_utc, tf=trigger_tf) == "RELAXED":
        eff_trig += 1
        eff_conf += 1

    # H1 hardening: rekam 29th WR 19% + loss gantung 6-10 jam — bar H1 dinaikkan
    # +1 trigger & +1 confluence (sebelum cap), key level diwajibkan di GATE 5.
    if trigger_tf == "H1":
        eff_trig += 1
        eff_conf += 1

    # Cap: sideways(+1) dan asian(+1) bisa numpuk — tanpa cap butuh semua komponen
    # sepakat (nyaris mustahil). Trig cap 5, conf cap 4.
    eff_trig = min(eff_trig, 5)
    eff_conf = min(eff_conf, 4)

    if session_filter and not is_active_session(now_utc, trigger_tf):
        _reject(df_t, f"OUT_OF_SESSION({sess})"); return None

    # GATE 2 — HTF Bias
    confirm_tfs       = higher_timeframes(trigger_tf, enabled_tfs)
    bias, bias_detail = _vote_bias(
        data_by_tf=data_by_tf, confirm_tfs=confirm_tfs,
        trigger_tf=trigger_tf, min_confirm_votes=min_confirm_votes,
        scalping_h1_only=scalping_h1_only,
        intraday_require_d1=intraday_require_d1,
    )

    # GATE 3 — Trigger Score (Market-State Dispatch)
    direction:    str | None = None
    trig_score:   int        = 0
    trig_notes:   str        = ""
    _is_counter:  bool       = False
    _flip_active: bool       = False
    _pb_active:   bool       = False
    _mom_active:  bool       = False
    _range_active: bool      = False

    # Market State Detector (2026-09-24): klasifikasi kondisi pasar → PILIH JALUR entry.
    # State hanya menukar logic aktif, gate/threshold tetap utuh.
    market_state, state_note = _market_state(
        df_t, trigger_tf, data_by_tf,
        market_transition_adx_block, market_transition_adx_gray,
    )

    if bias in ("BULL", "BEAR"):
        dir_try = "BUY" if bias == "BULL" else "SELL"

        # MARKET TRANSITION: tren kehabisan tenaga — continuation diblokir sebelum
        # buang-buang perhitungan (reversal/breakout jalur ketat; reversal off default).
        if market_state == "TRANSITION":
            _reject(df_t, f"MARKET_TRANSITION(state={state_note})")
            return None

        # Jalur 1 — CONTINUATION (trigger standar, gate EMA200 ketat 0.2×ATR).
        ok, sc, nt = _trigger_score(df_t, dir_try, eff_trig)
        if ok:
            direction, trig_score, trig_notes = dir_try, sc, nt
        elif scalping_pullback_enabled and is_scalping:
            # Jalur 2 — PULLBACK (retrace 23-78.6% dlm tren kuat), diprioritaskan sebelum
            # momentum — hanya tanpa pullback, berlanjut ke jalur momentum.
            _pb_ok, _pb_note = _scalp_pullback_setup(df_t, dir_try, atr)
            # Pullback floor: setup tanpa trigger minimal (kasus 0/6 lolos 29th) tak
            # boleh emit — gagal floor jatuh ke jalur momentum seperti pullback gagal.
            _pb_tok, _pb_tsc, _pb_tnt = _trigger_score(df_t, dir_try, min_score=scalping_pullback_min_trigger)
            if _pb_ok and _pb_tok:
                direction, trig_score, trig_notes = dir_try, _pb_tsc, f"PULLBACK[{_pb_note}]"
                _pb_active = True
            else:
                if _pb_ok:
                    _pb_note = f"{_pb_note}+TRIGWEAK({_pb_tnt})"
                # Jalur 3 — MOMENTUM/BREAKOUT (tren kuat TANPA pullback → harga tak
                # kembali ke EMA200): gate EMA200 dilonggarkan via MOMENTUM_EMA200_TOLERANCE.
                if market_state in ("HIGH_MOMENTUM", "TREND_BULL", "TREND_BEAR", "BREAKOUT"):
                    _mok, _msc, _mnt = _trigger_score(
                        df_t, dir_try, eff_trig,
                        ema200_tolerance_mult=momentum_ema200_tolerance,
                    )
                    if _mok:
                        direction, trig_score = dir_try, _msc
                        trig_notes = f"MOMENTUM[{_mnt}]"
                        _mom_active = True
                    else:
                        _reject(df_t, f"TRIGGER_FAIL dir={dir_try} score={sc}/{eff_trig}[{nt}] "
                                      f"+ PULLBACK_FAIL[{_pb_note}] + MOMENTUM_FAIL[{_mnt}] "
                                      f"state={market_state}({state_note})")
                        return None
                else:
                    _reject(df_t, f"TRIGGER_FAIL dir={dir_try} score={sc}/{eff_trig}[{nt}] "
                                  f"+ PULLBACK_FAIL[{_pb_note}] state={market_state}({state_note})")
                    return None
        else:
            _reject(df_t, f"TRIGGER_FAIL dir={dir_try} score={sc}/{eff_trig}[{nt}] "
                          f"cond={market_cond} state={market_state}")
            return None

        # Market Transition Gate (zonasi ADX abu-abu): block..gray → +1 confluence.
        _dec_reason, _dec_bonus = _decisive_adx(
            trigger_tf, data_by_tf, market_transition_adx_block,
            market_transition_adx_gray,
        )
        if _dec_reason:
            _reject(df_t, _dec_reason)
            return None
        eff_conf = min(eff_conf + _dec_bonus, 5)
    else:
        # Bias HTF NEUTRAL → dua pilihan: CT/reversal (off default) atau RANGE lane.
        _ct_tfs = [t.upper() for t in (counter_trend_tfs or ["H1", "H4"])]
        if counter_trend_enabled and trigger_tf in _ct_tfs:
            ct_direction: str | None = None
            ct_detail:    str        = ""
            ct_score:     int        = 0
            for try_dir in ["BUY", "SELL"]:
                ok_ct, det_ct, sc_ct = _is_counter_trend_valid(
                    df=df_t, direction=try_dir, entry=price_now,
                    atr=atr, tf=trigger_tf,
                    min_counter_confluence=min_counter_confluence,
                    is_scalping=is_scalping, data_by_tf=data_by_tf,
                )
                if ok_ct and sc_ct > ct_score:
                    ct_direction, ct_detail, ct_score = try_dir, det_ct, sc_ct

            if ct_direction is None:
                _reject(df_t, f"BIAS_FAIL+CT_FAIL({bias_detail}) state={market_state}")
                return None
            direction   = ct_direction
            _is_counter = True
            ok_trig, trig_score, trig_full = _trigger_score(df_t, direction, min_score=1)
            trig_notes = f"{trig_full} [CT:{ct_detail} score={ct_score}]"
            if "EMA200-" in trig_full:
                _reject(df_t, f"CT_EMA200_FAIL({trig_full})"); return None
        elif range_rejection_enabled and is_scalping and market_state == "RANGE":
            # RANGE lane: sideways ASLI (bias netral + ADX sinyal rendah) → rejection di
            # level kunci. Key level (SnR/SnD) diverifikasi di GATE 5; tanpa level = NO SIGNAL.
            _r_dir, _r_note, _r_sc = _range_rejection_setup(df_t, atr)
            if _r_dir is None:
                _reject(df_t, f"RANGE_NO_REJECTION[{_r_note}] state={market_state}({state_note})")
                return None
            direction, trig_score = _r_dir, _r_sc
            trig_notes = f"RANGE[{_r_note}]"
            _range_active = True
        else:
            _reject(df_t, f"BIAS_FAIL({bias_detail}) state={market_state}({state_note})")
            return None

    # LTF veto + flip lane (simetris dua arah). Veto defensif: blokir sinyal searah
    # bias HTF saat kaki momentum LTF berlawanan masih utuh (kasus 29th: H1 BEAR +
    # rally M5/M15 → SELL diblokir). Anti-flicker: kalau momentum patah tapi struktur
    # swing lawan (higher-low/lower-high) belum patah, veto tetap aktif.
    # Flip ofensif: arah berlawanan dievaluasi dgn gate ketat (trigger ≥3, atau ≥2 bila
    # ada struktur awal tren: swing/base break) + key level di GATE 5; gagal = reject.
    # Hanya lane continuation/momentum — pullback/range/CT punya logika sendiri.
    if direction in ("BUY", "SELL") and not (_pb_active or _range_active or _is_counter) and ltf_veto_enabled:
        _opp = "BUY" if direction == "SELL" else "SELL"
        _vetoed, _veto_note = _ltf_counter_veto(df_t, direction, atr)
        if not _vetoed:
            _hold, _hold_note = structure_holds(df_t, _opp)
            if _hold:
                _vetoed = True
                _veto_note = f"STRUCT_HOLD({_hold_note})"
        if _vetoed:
            _fok, _fsc, _fnt = _trigger_score(df_t, _opp, min_score=2)
            _v2, _v2_note = _ltf_counter_veto(df_t, _opp, atr)
            _tstart, _ts_note = structure_trend_start(df_t, _opp, atr)
            if (_fsc >= flip_min_trigger or (_fsc >= 2 and _tstart)) and not _v2:
                direction, trig_score, trig_notes = _opp, _fsc, f"FLIP[{_fnt}] {_veto_note}"
                if _ts_note:
                    trig_notes += f" STR[{_ts_note}]"
                _flip_active = True
            else:
                _reject(df_t, f"{_veto_note} flip_fail[trig={_fsc} str={_ts_note or '-'} {_v2_note}]")
                return None

    # Anti-chase (fix 1 + fix 4): tolak bila harga sudah menyimpang DARI setup candle
    # cukup untuk membuat zona entry tidak valid lagi. _chase diukur searah target
    # (SELL: setup turun, BUY: setup naik) — lonjakan 1-2 candle terdeteksi, real-time
    # (dist≈0) otomatis lolos. Guard sisi berlawanan (breakout): harga lewat zona atas/bawah.
    _setup_ohlc = df_t.iloc[-2] if len(df_t) >= 2 else df_t.iloc[-1]
    _set_close  = float(_setup_ohlc["close"])
    _set_hi     = float(_setup_ohlc["high"])
    _set_lo     = float(_setup_ohlc["low"])
    _ez_half    = 0.3 * atr   # setengah lebar zona entry (sama dgn _EZ_FRAC di sl_tp)
    _ez_top     = _set_hi + _ez_half
    _ez_bot     = _set_lo - _ez_half
    _chase      = (_set_close - price_now) if direction == "SELL" else (price_now - _set_close)
    _chase_max  = 1.5 * atr
    if _chase > _chase_max:
        _reject(df_t, f"LATE_ENTRY(chase={_chase:.2f}/max={_chase_max:.2f})"); return None
    # Skip-rule jadi gate: SELL tak valid bila harga sudah di atas zona (breakout),
    # BUY tak valid bila harga sudah di bawah zona.
    if direction == "SELL" and price_now > _ez_top:
        _reject(df_t, f"ZONE_PASSED(price={price_now:.2f}>top={_ez_top:.2f})"); return None
    if direction == "BUY" and price_now < _ez_bot:
        _reject(df_t, f"ZONE_PASSED(price={price_now:.2f}<bot={_ez_bot:.2f})"); return None

    # GATE 4 — SL/TP
    # RR berbeda untuk scalping (ambil profit cepat) vs intraday
    eff_tp1_rr = scalping_tp1_rr if is_scalping else tp1_rr
    eff_tp2_rr = scalping_tp2_rr if is_scalping else tp2_rr
    eff_tp3_rr = scalping_tp3_rr if is_scalping else tp3_rr

    if is_scalping:
        plan = swing_based_sltp(
            direction=direction, price_now=price_now, df=df_t, atr=atr,
            is_scalping=True, tp1_rr=eff_tp1_rr, tp2_rr=eff_tp2_rr, tp3_rr=eff_tp3_rr,
            max_sl=max_sl_points, sl_atr_mult_override=scalping_sl_atr_mult,
            tp1_atr_mult_override=scalping_tp1_atr_mult,
        )
        if plan is None:
            plan = dynamic_atr_sltp(
                direction=direction, price_now=price_now, atr=atr,
                is_scalping=True, tp1_rr=eff_tp1_rr, tp2_rr=eff_tp2_rr, tp3_rr=eff_tp3_rr,
                max_sl=max_sl_points, df=df_t, sl_atr_mult_override=scalping_sl_atr_mult,
                tp1_atr_mult_override=scalping_tp1_atr_mult,
            )
        sl_method = "swing" if (plan is not None and "Swing" in (plan.method or "")) else "dynamic_atr"
    else:
        plan = dynamic_atr_sltp(
            direction=direction, price_now=price_now, atr=atr,
            is_scalping=False, tp1_rr=eff_tp1_rr, tp2_rr=eff_tp2_rr, tp3_rr=eff_tp3_rr,
            max_sl=max_sl_points, df=df_t, data_by_tf=data_by_tf,
            sl_atr_mult_override=sl_atr_mult,
        )
        sl_method = "dynamic_atr"
    if plan is None:
        plan = fixed_zone_sltp(
            direction=direction, price_now=price_now,
            entry_zone_pips=30, sl_pips=sl_pips,
            tp1_pips=tp1_pips, tp2_pips=tp2_pips, tp3_pips=tp3_pips,
            pip_size=pip_size,
        )
        sl_method = "fixed"
    if plan is None:
        _reject(df_t, "SLTP_NONE"); return None

    # GATE 5 — Confluence + RR
    conf_score, conf_notes, conf_detail = _confluence_score(
        df=df_t, direction=direction, entry=price_now, atr=atr,
        tf=trigger_tf, is_scalping=is_scalping, sl=float(plan.sl),
        tp1_rr=eff_tp1_rr, data_by_tf=data_by_tf, now_utc=now_utc,
        sweep_enabled=scalping_sweep_enabled, fvg_enabled=scalping_fvg_enabled,
    )
    if conf_score == -99:
        _reject(df_t, f"ASIAN_NO_KEY_LEVEL [{conf_notes}]" if "ASIAN_NO_KEY_LEVEL" in conf_notes else f"SNR_BLOCKED [{conf_notes}]"); return None
    if conf_score < eff_conf:
        _reject(df_t, f"CONFLUENCE_FAIL conf={conf_score}/{eff_conf}[{conf_notes}] cond={market_cond}")
        return None

    # RANGE lane wajib punya key level (SnR/SnD) — rejection di level, bukan di tempat kosong.
    # (Tanpa level, konfluensi bisa lolos via Pattern/Fib — di range itu = noise.)
    if _range_active and not _has_key_level(conf_notes):
        _reject(df_t, f"RANGE_NO_KEY_LEVEL[{conf_notes}]")
        return None

    # H1 hardening: rekam WR 19% + loss gantung 6-10 jam (29th: 3/3 LOSS, semua SNR_FAR).
    # Trigger H1 menahan posisi berjam-jam — tanpa key level = NO SIGNAL.
    if trigger_tf == "H1" and h1_require_key_level and not _has_key_level(conf_notes):
        _reject(df_t, f"H1_NO_KEY_LEVEL[{conf_notes}]")
        return None

    # Flip lane wajib punya key level — entry melawan bias HTF hanya valid di level,
    # bukan di tengah jalan (kontrol risiko ofensif; data reversal mentah WR 18%).
    if _flip_active and flip_require_key_level and not _has_key_level(conf_notes):
        _reject(df_t, f"FLIP_NO_KEY_LEVEL[{conf_notes}]")
        return None

    # Quality key-level gate (2026-09-30): di pasar RANGE/CLEAN atau cond sideways,
    # jalur continuation/momentum wajib level BERKUALITAS — SnR 3-touch (SnR_MED/SnR+)
    # atau FIB_GOLDEN. SnR_WEAK (2-touch) tak dihitung: kasus loss 30/09 12:00 BUY 5/6
    # di RANGE dgn SnR_WEAK disapu 15m padahal arah benar; semua WIN hari itu punya
    # SnR 3-touch + FIB_GOLDEN. Pullback/range/flip/CT punya gerbang sendiri → tak diapply.
    if range_quality_key_level and not (_pb_active or _range_active or _flip_active or _is_counter):
        if market_state in ("RANGE", "CLEAN") or market_cond == "sideways":
            if not _has_quality_key_level(conf_notes):
                _reject(df_t, f"RANGE_QUALITY_NO_KEY_LEVEL[{conf_notes}]")
                return None

    entry_for_rr = plan.entry_high if direction == "BUY" else plan.entry_low
    rr            = calc_rr(direction, entry_for_rr, plan.sl, plan.tp1)
    rr_tp2_actual = calc_rr(direction, entry_for_rr, plan.sl, plan.tp2)
    # Gate anti-chase (pengganti RR gate — TP proporsional SL membuat rr tetap): tolak entry
    # yang "ngejar" — harga lebih jauh dari EMA20 sinyal-TF dari batas (×ATR).
    if is_scalping:
        _closed = df_t.iloc[:-1]
        if len(_closed) >= 30 and "close" in _closed.columns:
            _ema20 = _closed["close"].ewm(span=20, adjust=False).mean().iloc[-1]
            _over  = (price_now - _ema20) if direction == "BUY" else (_ema20 - price_now)
            _oe_max = scalping_overextend_atr_mult * atr
            if _over > _oe_max:
                _reject(df_t, f"OVEREXTENSION(ema20_dist={_over:.2f}/max={_oe_max:.2f})"); return None

    # Normalisasi ke tz-naive sebelum simpan agar konsisten saat load ulang
    ts_to_save = close_time_ts.tz_localize(None) if close_time_ts.tzinfo is not None else close_time_ts
    _LAST_SIGNAL_TIME[key] = ts_to_save
    _save_cooldown_state()
    _reject(df_t, "OK")

    # [8-Strategi — ADITIF] Label setup classifier (display/dedup, tak ubah skor-gate-threshold)
    setup_mode, setup_note = classify_entry_setup(df_t, direction, atr)
    # Mode dasar diambil dr JALUR yang aktif (state-based): momentum lane di atas
    # tren kuat tanpa pullback dilabeli MOMENTUM (atau BREAKOUT kalau state breakout).
    _state_mode: str | None = None
    if _mom_active:
        _state_mode = "BREAKOUT_MOMENTUM" if market_state == "BREAKOUT" else "MOMENTUM"
    elif _range_active:
        _state_mode = "RANGE_REJECT"
    base_mode = "FLIP" if _flip_active else (_state_mode or ("PULLBACK" if _pb_active else ("REVERSAL" if _is_counter else "CONTINUATION")))
    # FLIP dipaksa menang atas classifier agar terpisah di data (evaluasi butuh label murni).
    final_mode = base_mode if _flip_active else (setup_mode if setup_mode else base_mode)
    mkt_tag = f" [{market_cond.upper()}/{market_state}]" if market_cond else ""

    # [Conflict resolver — anti spam "3 sinyal sekaligus"] dedup LINTAS-TF per (symbol, direction):
    # kirim duplikat arah-sama dalam window hanya bila konfluensinya LEBIH TINGGI dr yg terakhir.
    _conf_key   = (symbol, direction)
    _now_ts     = close_time_ts.timestamp()
    _curr_conf  = float(conf_score)
    _prev_emit  = _LAST_LIVE_EMIT.get(_conf_key)
    if _prev_emit and (_now_ts - _prev_emit[0]) <= _CONFLICT_WINDOW_SEC:
        if _curr_conf <= _prev_emit[1]:
            _reject(df_t, f"CONFLICT_SUPPRESS(prev_conf={_prev_emit[1]:.0f}>=now={_curr_conf:.0f})")
            return None
    _LAST_LIVE_EMIT[_conf_key] = (_now_ts, _curr_conf)

    trade_mode, exec_tf = _detect_trade_mode(trigger_tf)
    enter_tag = f" [setup={final_mode}]" if setup_mode else ""
    return Signal(
        symbol=symbol, tf=trigger_tf, direction=direction, close_time=close_time,
        signal_type="LIVE",
        signal_mode=final_mode,
        entry=float(entry_for_rr), entry_low=float(plan.entry_low),
        entry_high=float(plan.entry_high), sl=float(plan.sl),
        tp=float(plan.tp1), tp2=float(plan.tp2), tp3=float(plan.tp3),
        rr=float(rr), rr_tp2_actual=float(rr_tp2_actual or 0.0),
        sl_method=sl_method, atr_value=float(atr),
        tp1_rr=float(eff_tp1_rr), tp2_rr=float(eff_tp2_rr), tp3_rr=float(eff_tp3_rr),
        trigger_score=trig_score, trigger_max=6, confluence_score=conf_score,
        htf_bias=bias_detail, htf_bias_all=_all_tf_bias(data_by_tf),
        trigger_notes=f"{trig_notes}{mkt_tag}",
        confluence_notes=conf_notes,
        pattern_names=conf_detail["pattern_names"],
        fib_detail=conf_detail["fib_detail"], snr_detail=conf_detail["snr_detail"],
        snd_detail=conf_detail["snd_detail"], divergence_detail=conf_detail["div_detail"],
        sweep_detail=conf_detail["sweep_detail"], fvg_detail=conf_detail["fvg_detail"],
        session_name=sess,
        trade_mode=trade_mode, exec_tf=exec_tf, is_setup_plan=False,
    )

```

### Lampiran 1.3 Evaluasi Bias Makro Multi-Timeframe (`src/engine/bias.py`)

**Lokasi Berkas:** `src/engine/bias.py`  
Modul ini bertugas mengevaluasi arah tren makro dan momentum pada kerangka waktu tinggi (H4, H1, dan M30) menggunakan perpaduan EMA 50/200, kemiringan slope, serta algoritma voting terbobot untuk menetapkan bias konsensus pasar (Bullish, Bearish, atau Neutral).

```python
"""─ HTF bias voting & trade-mode classification."""

from __future__ import annotations

import pandas as pd

from src.engine.utils import _atr_proxy, _latest_closed, _safe


def _bias_from_tf(df: pd.DataFrame) -> str | None:
    if len(df) < 200:
        return None

    last   = _latest_closed(df)
    close  = _safe(last, "close")
    ema20  = _safe(last, "ema_20")
    ema50  = _safe(last, "ema_50")
    ema200 = _safe(last, "ema_200")

    if any(v is None for v in [close, ema50, ema200]):
        return None

    is_bull = close > ema50 and close > ema200
    is_bear = close < ema50 and close < ema200  

    if not (is_bull or is_bear):
        return None

    gap_pct = abs(ema50 - ema200) / close  

    idx = df.index.get_loc(last.name) if hasattr(last, "name") and last.name in df.index else -2
    try:
        ema50_recent = df["ema_50"].iloc[max(0, idx - 4): idx + 1].dropna()
    except Exception:
        ema50_recent = df["ema_50"].iloc[-7:-2].dropna()

    slope_ok = False
    if len(ema50_recent) >= 3:
        diffs   = ema50_recent.diff().dropna()
        n_total = len(diffs)
        if is_bull and (diffs > 0).sum() / n_total >= 0.5:
            slope_ok = True
        if is_bear and (diffs < 0).sum() / n_total >= 0.5:
            slope_ok = True
    else:
        slope_ok = True

    if gap_pct >= 0.0005 and slope_ok:
        candidate = "BULL" if is_bull else "BEAR"
    elif atr := _atr_proxy(df):
        if is_bull and close > ema200 + atr:
            candidate = "BULL"
        elif is_bear and close < ema200 - atr:
            candidate = "BEAR"
        else:
            candidate = None
    else:
        candidate = None

    return candidate


def _bias_why_neutral(df: pd.DataFrame) -> str:
    """Diagnostik kenapa _bias_from_tf None — dipakai log vote bias. Hindari '()' di return (pemangkasan main)."""
    if len(df) < 200:
        return "bars_kurang_200"
    last   = _latest_closed(df)
    close  = _safe(last, "close")
    ema50  = _safe(last, "ema_50")
    ema200 = _safe(last, "ema_200")
    if any(v is None for v in [close, ema50, ema200]):
        return "kolom_MA_tidak_lengkap"
    if abs(ema50 - ema200) <= abs(close) * 1e-6:
        return f"ema50_sama_ema200_kode_lama e50={ema50:.2f}"
    is_bull = close > ema50 and close > ema200
    is_bear = close < ema50 and close < ema200
    if not (is_bull or is_bear):
        return f"harga_antara_MA c={close:.0f} e50={ema50:.0f} e200={ema200:.0f}"
    gap_pct = abs(ema50 - ema200) / close
    if gap_pct < 0.0005:
        return f"gap_MA_kecil {gap_pct*100:.3f}pct"
    idx = df.index.get_loc(last.name) if hasattr(last, "name") and last.name in df.index else -2
    try:
        ema50_recent = df["ema_50"].iloc[max(0, idx - 4): idx + 1].dropna()
    except Exception:
        ema50_recent = df["ema_50"].iloc[-7:-2].dropna()
    if len(ema50_recent) >= 3:
        diffs = ema50_recent.diff().dropna()
        n     = float(len(diffs))
        slope_too_weak = (is_bull and (diffs > 0).sum() / n < 0.5) or \
                         (is_bear and (diffs < 0).sum() / n < 0.5)
        if slope_too_weak:
            return f"slope_ema50_lemah {diffs.iloc[-1]:+.2f}/bar"
    return "unknown"


def _momentum_recovery_bias(
    df_scalp: pd.DataFrame,
    df_h1:    pd.DataFrame | None,
) -> tuple[str | None, str]:
    """Deteksi momentum recovery scalping saat H1 NEUTRAL — sistem skor min 3 dari 4
    (slope ≥60%, impulse >1.5×ATR, rsi searah, h1_ok EMA50 H1 tak berlawanan), bukan
    wajib semua. Returns (bias, detail) utk log vote bias."""
    if len(df_scalp) < 30:
        return None, "TOO_FEW_BARS"

    last = _latest_closed(df_scalp)
    prev = df_scalp.iloc[-3] if len(df_scalp) > 3 else last

    close = _safe(last, "close")
    ema20 = _safe(last, "ema_20")
    ema50 = _safe(last, "ema_50")
    rsi   = _safe(last, "rsi_14")
    rsi_p = _safe(prev, "rsi_14")
    atr   = _atr_proxy(df_scalp)

    if any(v is None for v in [close, ema20, ema50, rsi, rsi_p]) or atr <= 0:
        return None, "DATA_INCOMPLETE"

    # Gerbang wajib: arah momentum
    ema20_bull = ema20 > ema50
    ema20_bear = ema20 < ema50
    if not (ema20_bull or ema20_bear):
        return None, "NO_MOMENTUM_DIR"
    is_bull = ema20_bull

    try:
        idx         = df_scalp.index.get_loc(last.name) if hasattr(last, "name") and last.name in df_scalp.index else -2
        ema50_slice = df_scalp["ema_50"].iloc[max(0, idx - 4): idx + 1].dropna()
    except Exception:
        ema50_slice = df_scalp["ema_50"].iloc[-7:-2].dropna()

    slope_ok = False
    if len(ema50_slice) >= 3:
        diffs    = ema50_slice.diff().dropna()
        n        = len(diffs)
        slope_ok = ((diffs > 0).sum() / n >= 0.6) if is_bull else ((diffs < 0).sum() / n >= 0.6)

    low_20  = float(df_scalp["low"].iloc[-22:-2].min())  if len(df_scalp) >= 22 else float(df_scalp["low"].iloc[:-2].min())
    high_20 = float(df_scalp["high"].iloc[-22:-2].max()) if len(df_scalp) >= 22 else float(df_scalp["high"].iloc[:-2].max())
    impulse_ok = (close > low_20 + 1.5 * atr) if is_bull else (close < high_20 - 1.5 * atr)

    rsi_ok = (rsi > 50 and rsi > rsi_p) if is_bull else (rsi < 50 and rsi < rsi_p)

    # H1 tidak boleh aktif berlawanan arah; karena skor 3/4, cukup satu syarat boleh
    # gagal — H1 masih agak turun tapi 3 syarat lain solid tetap lolos.
    h1_ok = True
    if df_h1 is not None and len(df_h1) >= 10:
        try:
            h1_last   = _latest_closed(df_h1)
            h1_idx    = df_h1.index.get_loc(h1_last.name) if hasattr(h1_last, "name") and h1_last.name in df_h1.index else -2
            h1_ema50s = df_h1["ema_50"].iloc[max(0, h1_idx - 4): h1_idx + 1].dropna()
            if len(h1_ema50s) >= 4:
                h1_diffs = h1_ema50s.diff().dropna()
                h1_n     = len(h1_diffs)
                if is_bull  and (h1_diffs < 0).sum() / h1_n >= 0.8:
                    h1_ok = False
                if not is_bull and (h1_diffs > 0).sum() / h1_n >= 0.8:
                    h1_ok = False
        except Exception:
            pass

    checks = {"slope": slope_ok, "impulse": impulse_ok, "rsi": rsi_ok, "h1_ok": h1_ok}
    score  = sum(checks.values())
    detail = ",".join(f"{k}{'+' if v else '-'}" for k, v in checks.items())

    if score >= 3:
        return ("BULL" if is_bull else "BEAR"), detail
    return None, detail


def _vote_bias(
    data_by_tf:        dict[str, pd.DataFrame],
    confirm_tfs:       list[str],
    trigger_tf:        str = "M5",
    min_confirm_votes: int = 1,
    scalping_h1_only:  bool = True,
    intraday_require_d1: bool = True,
) -> tuple[str | None, str]:
    """Vote bias HTF: required_tf (H1 utk M5/M15, H4(+D1) utk intraday) harus punya bias
    jelas + min_confirm_votes sepakat. Scalping cukup H1 saja (data: H4 menekan WR 60%
    vs 72% saat netral). H1 NEUTRAL → coba momentum recovery. Returns (bias, detail)."""
    trigger_up = trigger_tf.upper()
    is_scalping_tf = trigger_up in ("M5", "M15")

    # TF yang wajib punya bias jelas (bukan NEUTRAL) — tanpanya langsung reject
    _required_tf: dict[str, list[str]] = {
        "M5":  ["H1"],
        "M15": ["H1"],
        "H1":  ["H4"],
        "H4":  [],
    }
    if intraday_require_d1:
        _required_tf["H4"] = ["D1"]
        _required_tf["H1"].append("D1")  # intraday: D1 (tren besar) wajib punya bias jelas
    required_tfs = _required_tf.get(trigger_up, [])

    if is_scalping_tf and scalping_h1_only:
        confirm_tfs = [tf for tf in confirm_tfs if tf.upper() == "H1"]

    votes:       dict[str, int] = {"BULL": 0, "BEAR": 0}
    details:     list[str]      = []
    votes_by_tf: dict[str, str] = {}

    for tf in confirm_tfs:
        df = data_by_tf.get(tf)
        if df is None:
            details.append(f"{tf}:MISSING")
            continue
        b = _bias_from_tf(df)
        if b is None:
            details.append(f"{tf}:NEUTRAL({_bias_why_neutral(df)})")
            continue
        details.append(f"{tf}:{b}")
        votes[b]       += 1
        votes_by_tf[tf] = b

    for req in required_tfs:
        if votes_by_tf.get(req) is not None:
            continue
        # Momentum Recovery scalping saat H1 NEUTRAL: EMA200 H1 belum flip, tapi ada
        # impulse lokal kuat M5/M15 → cek dengan kriteria lebih ketat.
        if is_scalping_tf and req == "H1":
            df_scalp = data_by_tf.get(trigger_up)
            df_h1    = data_by_tf.get("H1")
            if df_scalp is not None:
                mom_bias, mom_detail = _momentum_recovery_bias(df_scalp, df_h1)
                if mom_bias is not None:
                    details.append(f"[MOM_RECOVERY:{mom_bias}({mom_detail})]")
                    return mom_bias, " ".join(details)
                else:
                    details.append(f"[MOM_RECOVERY_FAIL:{mom_detail}]")
        return None, " ".join(details) + f" [TF_FAIL:{req}=NEUTRAL]"

    # Minimal votes harus terpenuhi
    if max(votes["BULL"], votes["BEAR"]) < min_confirm_votes:
        return None, " ".join(details)

    if votes["BULL"] == votes["BEAR"]:
        return None, " ".join(details)

    bias = "BULL" if votes["BULL"] > votes["BEAR"] else "BEAR"
    return bias, " ".join(details)


def _all_tf_bias(data_by_tf: dict[str, pd.DataFrame]) -> str:
    """Bias semua TF (D1→M15) untuk tampilan stack sinyal — diagnostik, bukan keputusan gate."""
    parts: list[str] = []
    for tf in ["D1", "H4", "H1", "M15"]:
        df = data_by_tf.get(tf)
        if df is None:
            continue
        b = _bias_from_tf(df)
        if b is None:
            parts.append(f"{tf}:NEUTRAL({_bias_why_neutral(df)})")
        else:
            parts.append(f"{tf}:{b}")
    return " ".join(parts)


def _detect_trade_mode(trigger_tf: str) -> tuple[str, str]:
    tf = trigger_tf.upper()
    if tf in ("M5", "M15"):
        return "scalping", "M5"
    if tf == "H1":
        return "intraday", "M15"
    return "intraday", "H1"

```

### Lampiran 1.4 Evaluasi Skor Pemicu Dinamis (`src/engine/trigger.py`)

**Lokasi Berkas:** `src/engine/trigger.py`  
Modul ini menghitung skor akumulasi pemicu (trigger scoring) pada lilin kerangka waktu eksekusi (M5 atau M15) berdasarkan konfirmasi pola lilin (candlestick), arah kemiringan momentum RSI, histogram MACD, dan kondisi pullback terhadap garis purata bergerak eksponensial.

```python
"""─ Trigger score & setup entry (continuation/pullback/momentum/range)."""

from __future__ import annotations

import pandas as pd

from src.engine.utils import _atr_proxy, _latest_closed, _safe


def _trigger_score(
    df:                 pd.DataFrame,
    direction:          str,
    min_score:          int = 4,
    ema200_tolerance_mult: float = 0.2,
) -> tuple[bool, int, str]:
    """Trigger Score Layer-1 (maks 6): EMA200, EMA50 pullback, EMA alignment, RSI, MACD, Candle.

    ema200_tolerance_mult: lebar band EMA200 (×ATR). Momentum lane memakai nilai lebih
    besar (default 1.0 via MOMENTUM_EMA200_TOLERANCE) agar tren kuat yang TIDAK menarik
    kembali ke EMA200 tetap bisa masuk — anti-chase (OVEREXTENSION & LATE_ENTRY) tetap
    jalan terpisah di gate berikutnya.
    """
    direction = direction.upper()
    notes: list[str] = []
    score = 0

    if len(df) < 30:
        return False, 0, "TOO_FEW_BARS"

    last = _latest_closed(df)
    prev = df.iloc[-3] if len(df) > 3 else last

    close   = _safe(last, "close")
    open_   = _safe(last, "open")
    ema20   = _safe(last, "ema_20")
    ema50   = _safe(last, "ema_50")
    ema200  = _safe(last, "ema_200")
    rsi     = _safe(last, "rsi_14")
    rsi_p   = _safe(prev, "rsi_14")
    mhist   = _safe(last, "macdhist")
    mhist_p = _safe(prev, "macdhist")
    atr     = _atr_proxy(df)

    if close is None:
        return False, 0, "NO_CLOSE"

    # EMA200 — wajib
    if ema200 is not None:
        tolerance = ema200_tolerance_mult * atr if atr > 0 else 0.0
        in_band   = abs(close - ema200) <= tolerance  
        on_side   = (direction == "BUY"  and close > ema200 - tolerance) or \
                    (direction == "SELL" and close < ema200 + tolerance)
        if on_side or in_band:
            score += 1; notes.append("EMA200+")
        else:
            notes.append("EMA200-")
            return False, score, " ".join(notes)
    else:
        notes.append("EMA200_NA")

    # EMA50 pullback (dalam 1.5×ATR)
    if ema50 is not None and atr > 0:
        if abs(close - ema50) <= 1.5 * atr:
            score += 1; notes.append("EMA50+")
        else:
            notes.append("EMA50-")

    # EMA alignment
    if all(v is not None for v in [ema20, ema50, ema200]):
        if (direction == "BUY"  and ema20 > ema50 > ema200) or \
           (direction == "SELL" and ema20 < ema50 < ema200):
            score += 1; notes.append("ALIGN+")
        else:
            notes.append("ALIGN-")

    # RSI
    if rsi is not None and rsi_p is not None:
        if (direction == "BUY"  and rsi < 65 and rsi > rsi_p) or \
           (direction == "SELL" and rsi > 35 and rsi < rsi_p):
            score += 1; notes.append(f"RSI+({rsi:.0f})")
        else:
            notes.append(f"RSI-({rsi:.0f})")

    # MACD histogram
    if mhist is not None and mhist_p is not None:
        if (direction == "BUY"  and mhist > mhist_p) or \
           (direction == "SELL" and mhist < mhist_p):
            score += 1; notes.append("MACD+")
        else:
            notes.append("MACD-")

    # Candle
    if open_ is not None:
        if (direction == "BUY"  and close > open_) or \
           (direction == "SELL" and close < open_):
            score += 1; notes.append("CDL+")
        else:
            notes.append("CDL-")

    return score >= min_score, score, " ".join(notes)


def _scalp_pullback_setup(
    df:        pd.DataFrame,
    direction: str,
    atr:       float,
) -> tuple[bool, str]:
    """Set-up pullback/rebound scalping: pause contra-tren sementara di dalam tren,
    masuk SEARAH tren setelah rebound — bukan "buy the dip".

    Gerbang wajib: trend_tf (bias HTF + EMA20>EMA50 + impuls >=1×ATR), zone (body
    menembus EMA20 dalam 0.8×ATR), deep (retracement 25-70%; >78.6% = reversal),
    structure (body tak menembus swing). Konfirmasi min 2/4: rejection (pin/engulf/
    sweep), rsi, momentum, div. Hanya bar tertutup dipakai."""
    direction = direction.upper()
    if len(df) < 40:
        return False, "TOO_FEW_BARS"

    last  = _latest_closed(df)
    prev  = df.iloc[-3] if len(df) > 3 else last
    close = _safe(last, "close")
    open_ = _safe(last, "open")
    high  = _safe(last, "high")
    low   = _safe(last, "low")
    e20   = _safe(last, "ema_20")
    e50   = _safe(last, "ema_50")
    rsi   = _safe(last, "rsi_14")
    rsi_p = _safe(prev, "rsi_14")
    mhist = _safe(last, "macdhist")
    mp    = _safe(prev, "macdhist")
    e20_prev  = _safe(df.iloc[-3], "ema_20")
    prev_open = _safe(df.iloc[-3], "open")
    if any(v is None for v in [close, open_, high, low, e20, e50, rsi, rsi_p, mhist, mp, e20_prev, prev_open]) or atr <= 0:
        return False, "DATA_INCOMPLETE"

    rng = high - low

    w_imp  = df.iloc[-9:-3]
    w_pb   = df.iloc[-3:-1]
    imp_high = float(w_imp["high"].max())
    imp_low  = float(w_imp["low"].min())
    imp_ext  = imp_high - imp_low
    body_raw = pd.concat([w_pb["open"], w_pb["close"]])
    body_low  = float(body_raw.min())

    if direction == "BUY":
        pb_low     = float(w_pb["low"].min())
        trend_tf   = e20 > e50 and close > e50 and e20 > e20_prev and imp_ext >= atr
        zone       = body_low < e20 and body_low <= e20 + 0.4 * atr and (e20 - body_low) <= 1.0 * atr
        retr       = (imp_high - body_low) / imp_ext if imp_ext > 0 else 0.0
        structure  = body_low > imp_low
        lower_wick = min(open_, close) - low
        sweep      = pb_low < imp_low and body_low >= imp_low and close > imp_low
        c_rej      = sweep or (close > open_ and rng > 0 and (lower_wick >= 0.4 * rng or close > prev_open))
        c_rsi      = rsi > rsi_p and 35 < rsi < 68
        c_mom      = mhist > mp
        c_div      = any(bool(_safe(r, "rsi_bull_div") or False) for _, r in w_pb.iterrows()) or \
                     any(bool(_safe(r, "macd_bull_div") or False) for _, r in w_pb.iterrows())
    else:
        body_high  = float(body_raw.max())
        pb_high    = float(w_pb["high"].max())
        trend_tf   = e20 < e50 and close < e50 and e20 < e20_prev and imp_ext >= atr
        zone       = body_high > e20 and body_high >= e20 - 0.4 * atr and (body_high - e20) <= 1.0 * atr
        retr       = (body_high - imp_low) / imp_ext if imp_ext > 0 else 0.0
        structure  = body_high < imp_high
        upper_wick = high - max(open_, close)
        sweep      = pb_high > imp_high and body_high <= imp_high and close < imp_high
        c_rej      = sweep or (close < open_ and rng > 0 and (upper_wick >= 0.4 * rng or close < prev_open))
        c_rsi      = rsi < rsi_p and 32 < rsi < 65
        c_mom      = mhist < mp
        c_div      = any(bool(_safe(r, "rsi_bear_div") or False) for _, r in w_pb.iterrows()) or \
                     any(bool(_safe(r, "macd_bear_div") or False) for _, r in w_pb.iterrows())

    deep     = 0.23 <= retr <= 0.786   # 2026-09-24: 25-70% -> 23-78.6% (batas fib sebelum reversal)
    rej_gate = ("trend_tf", trend_tf), ("zone", zone), ("deep", deep), ("structure", structure)
    for name, ok in rej_gate:
        if not ok:
            return False, name

    checks = {"rejection": c_rej, "rsi": c_rsi, "momentum": c_mom, "div": c_div}
    score  = sum(checks.values())
    detail = ",".join(f"{k}{'+' if v else '-'}" for k, v in checks.items())
    if score >= 2:
        return True, detail
    return False, f"{detail} score={score}/4"


def _range_rejection_setup(
    df:  pd.DataFrame,
    atr: float,
) -> tuple[str | None, str, int]:
    """RANGE lane (2026-09-24): sideways + rejection, tanpa gate tren.

    Sekadar candle rejection (pin/engulf/sweep) + RSI + momentum di kedua arah — pilih
    arah dgn skor tertinggi, min 2 dari 3. Key level (SnR/SnD) BUKAN di sini tapi di
    GATE 5: tanpa key level, konfluensi tak sampai 2 (dan ASIAN langsung reject).
    Returns (direction|None, note, score)."""
    if df is None or len(df) < 30 or atr <= 0:
        return None, "TOO_FEW_BARS", 0
    need = {"open", "close", "high", "low"}
    if not need.issubset(df.columns):
        return None, "DATA_INCOMPLETE", 0

    last  = _latest_closed(df)
    prev  = df.iloc[-3] if len(df) > 3 else last
    open_ = _safe(last, "open")
    close = _safe(last, "close")
    high  = _safe(last, "high")
    low   = _safe(last, "low")
    rsi   = _safe(last, "rsi_14")
    rsi_p = _safe(prev, "rsi_14")
    mhist = _safe(last, "macdhist")
    mp    = _safe(prev, "macdhist")
    prev_open = _safe(prev, "open")
    if any(v is None for v in [open_, close, high, low, rsi, rsi_p, mhist, mp, prev_open]):
        return None, "DATA_INCOMPLETE", 0

    rng = high - low
    if rng <= 0:
        return None, "ZERO_RANGE", 0
    lower_wick = min(open_, close) - low
    upper_wick = high - max(open_, close)

    def _score_dir(d: str) -> int:
        if d == "BUY":
            c_rej = close > open_ and (lower_wick >= 0.4 * rng or close > prev_open)
            c_rsi = 30 <= rsi <= 68 and rsi > rsi_p
        else:
            c_rej = close < open_ and (upper_wick >= 0.4 * rng or close < prev_open)
            c_rsi = 32 <= rsi <= 70 and rsi < rsi_p
        c_mom = (mhist > mp) if d == "BUY" else (mhist < mp)
        return sum([c_rej, c_rsi, c_mom])

    sc_b, sc_s = _score_dir("BUY"), _score_dir("SELL")
    if sc_b >= sc_s and sc_b >= 2:
        return "BUY", f"rej_ok score={sc_b}/3", sc_b
    if sc_s >= 2:
        return "SELL", f"rej_ok score={sc_s}/3", sc_s
    return None, f"score_buy={sc_b},score_sell={sc_s}/3", 0


def _has_key_level(conf_notes: str) -> bool:
    """True jika ada SnR/SnD positif di notes konfluensi (varian WEAK/MED/OK)."""
    return any(k in conf_notes for k in ("SnR+", "SnR_WEAK", "SnR_MED", "SnD+"))


def _has_quality_key_level(conf_notes: str) -> bool:
    """True jika ada key level BERKUALITAS: SnR 3-touch+ (SnR_MED/SnR+) atau FIB_GOLDEN.

    SnR_WEAK (2-touch, akurasi historis ~31.6%) TIDAK dihitung — level lemah adalah
    kandidat stop-hunt (kasus loss 30/09 12:00: BUY 5/6 di RANGE dgn SnR_WEAK, SL
    disapu lalu harga lanjut naik; semua WIN hari itu punya SnR 3-touch + FIB_GOLDEN)."""
    return any(k in conf_notes for k in ("SnR_MED", "SnR+", "FIB_GOLDEN"))


def _get_active_patterns(direction: str, last_row: pd.Series) -> list[str]:
    from src.features.patterns import PATTERN_FUNCS
    names: list[str] = []
    for name in PATTERN_FUNCS:
        val = _safe(last_row, name)
        if val is None:
            continue
        if direction == "BUY"  and val >= 100:
            names.append(name.replace("CDL", ""))
        elif direction == "SELL" and val <= -100:
            names.append(name.replace("CDL", ""))
    return names

```

### Lampiran 1.5 Evaluasi Konfluensi Multi-Level (`src/engine/confluence.py`)

**Lokasi Berkas:** `src/engine/confluence.py`  
Modul ini mengukur tingkat konfluensi struktural pasar melalui pengujian keselarasan harga terhadap zona Support & Resistance (SNR), zona Supply & Demand (SND), serta rasio keemasan Fibonacci Retracement guna memastikan posisi masuk memiliki probabilitas tinggi dan terhindar dari hambatan level kunci (snr blocking).

```python
"""─ Confluence score & counter-trend validation."""

from __future__ import annotations

import re

import pandas as pd

from src.engine.bias import _bias_from_tf
from src.engine.trigger import _get_active_patterns
from src.engine.utils import _latest_closed, _safe
from src.features.fair_value_gap import fvg_confluence_score
from src.features.fibonacci import fib_confluence_score
from src.features.liquidity_sweep import liquidity_sweep_score
from src.features.session import session_strictness
from src.features.zones_snd import snd_confluence_score
from src.features.zones_snr import snr_confluence_score


def _confluence_score(
    df:          pd.DataFrame,
    direction:   str,
    entry:       float,
    atr:         float,
    tf:          str  = "",
    is_scalping: bool = False,
    sl:          float = 0.0,
    tp1_rr:      float = 1.5,
    data_by_tf:  dict[str, pd.DataFrame] | None = None,
    now_utc:     datetime | None = None,   # untuk cek Asian session strictness
    sweep_enabled: bool = False,  # skalprik: liquidity sweep ikut skor (off → logging-only)
    fvg_enabled:   bool = False,  # skalprik: FVG ikut skor (off → logging-only)
) -> tuple[int, str, dict]:
    """Confluence Score Layer-2 — berbobot sesuai akurasi historis komponen.

    Bobot: Pattern/Fib/Div 1.5, SND 2.0, SNR weighted (0.3x/0.6x/1.0x), Sweep+FVG
    gabungan 1.0 (scalping saja, OFF → logging-only). Alignment 3+ TF +1.0. Skor
    float dibulatkan ke int di akhir; minimal threshold dikalibrasi utk skala ini.
    """
    # Bobot komponen — 2026-09-24 rekalibrasi dari component_accuracy:
    # Pattern 56.2% / Fib 53.0% / RSI(+) tetap dipertahankan; SND 38.5%
    # & SNR 46.7% (di bawah tebakan random) diturunkan drastis agar skor
    # confluence kembali proksimat akurasi riil komponen.
    _W_PATTERN   = 1.5   
    _W_FIB       = 1.5   
    _W_DIV       = 1.5   
    _W_SNR       = 0.5   # turun dr 1.0: akurasi 46.7% < random
    _W_SND       = 1.0   # turun dr 2.0: akurasi 38.5% justru penekan WR   
    # Bonus SWEEP+FVG gabungan: max total 1.0, share dibagi rata (+0.5 masing-masing);
    # belum divalidasi, default logging-only.
    _W_SWEEP_FVG = 1.0   
    direction = direction.upper()
    score: float = 0.0   # float untuk akumulasi bobot, dibulatkan ke int di akhir
    notes: list[str] = []
    detail: dict = {
        "pattern_names": "",
        "fib_detail":    "",
        "snr_detail":    "",
        "snd_detail":    "",
        "div_detail":    "",
        "sweep_detail":  "",
        "fvg_detail":    "",
    }
    last = _latest_closed(df)

    # Pattern — bobot 1.5 (akurasi tertinggi)
    bull_count = int(_safe(last, "pattern_bull_count") or 0)
    bear_count = int(_safe(last, "pattern_bear_count") or 0)
    count = bull_count if direction == "BUY" else bear_count
    if count >= 2:
        score += 2 * _W_PATTERN; notes.append("Pattern++")
    elif count >= 1:
        score += 1 * _W_PATTERN; notes.append("Pattern+")
    else:
        notes.append("Pattern-")
    # Fallback: kalau kolom pattern kosong padahal count>0, scan ulang dari PATTERN_FUNCS
    # agar pattern_names selalu konsisten dengan skor.
    pattern_names = _get_active_patterns(direction, last)
    if not pattern_names and count > 0:
        from src.features.patterns import PATTERN_FUNCS
        for pname in PATTERN_FUNCS:
            val = _safe(last, pname)
            if val is None:
                continue
            if direction == "BUY" and val > 0:
                pattern_names.append(pname.replace("CDL", ""))
            elif direction == "SELL" and val < 0:
                pattern_names.append(pname.replace("CDL", ""))
    detail["pattern_names"] = ", ".join(pattern_names[:3]) if pattern_names else ""

    # Divergence — bobot 1.5
    div_keys = {
        "BUY":  [("rsi_bull_div", "RSI"), ("macd_bull_div", "MACD")],
        "SELL": [("rsi_bear_div", "RSI"), ("macd_bear_div", "MACD")],
    }
    div_parts: list[str] = []
    for col, label in div_keys.get(direction, []):
        if bool(_safe(last, col) or False):
            div_parts.append(label)
    if div_parts:
        score += 1 * _W_DIV; notes.append("Div+")
    else:
        notes.append("Div-")
    detail["div_detail"] = "+".join(div_parts)

    # Fibonacci — bobot 1.5 (akurasi tertinggi bersama Pattern)
    if atr > 0:
        fib_sc, fib_note = fib_confluence_score(
            direction=direction, entry_price=entry, df=df, atr=atr,
            is_scalping=is_scalping, data_by_tf=data_by_tf,
        )
        score += fib_sc * _W_FIB
        notes.append(f"Fib+({fib_note})" if fib_sc > 0 else "Fib-")
        detail["fib_detail"] = fib_note if fib_sc > 0 else ""
    else:
        notes.append("Fib_SKIP")

    # SNR — Bug #1+#2 fix: pass tf + data_by_tf
    if atr > 0:
        snr_sc, snr_note = snr_confluence_score(
            direction=direction, entry_price=entry,
            df=df, atr=atr, sl=sl, tp1_rr=tp1_rr,
            tf=tf, is_scalping=is_scalping,
            data_by_tf=data_by_tf,
        )
        # Bug #4 fix: SNR_BLOCKED jadi hard-reject di semua mode, bukan cuma scalping
        if "SNR_BLOCKED" in snr_note:
            detail["snr_detail"] = snr_note
            notes.append("SnR_BLOCKED")
            return -99, " ".join(notes), detail

        # SNR weighted: str<35 (2-touch)→30%, 35-49 (3-4 touch)→60%, >=50 (5+ touch)→100%;
        # biarkan level lemah berkontribusi kecil, tetap prioritaskan level kuat.
        if snr_sc > 0:
            _str_match = re.search(r"str=(\d+)", snr_note)
            _snr_strength = int(_str_match.group(1)) if _str_match else 99
            if _snr_strength < 35:
                snr_sc = snr_sc * 0.3  # 30% weight untuk 2-touch
                snr_note = snr_note.replace("SNR_OK", "SNR_WEAK")
                notes.append("SnR_WEAK(0.3x)")
            elif _snr_strength < 50:
                snr_sc = snr_sc * 0.6  # 60% weight untuk 3-4 touch
                notes.append("SnR_MED(0.6x)")
            else:
                notes.append("SnR+")  # 100% weight untuk 5+ touch
        else:
            notes.append("SnR-")

        score += snr_sc * _W_SNR
        detail["snr_detail"] = snr_note
    else:
        notes.append("SnR_SKIP")

    # SND — bobot 1.0
    if atr > 0:
        snd_sc, snd_note = snd_confluence_score(
            direction=direction, entry_price=entry,
            df=df, atr=atr, tf=tf, is_scalping=is_scalping,
            data_by_tf=data_by_tf,
        )
        score += snd_sc * _W_SND
        notes.append("SnD+" if snd_sc > 0 else "SnD-")
        detail["snd_detail"] = snd_note if snd_sc > 0 else ""
    else:
        notes.append("SnD_SKIP")

    # Sweep + FVG: konfluensi scalping (entry-timing); intraday skip. Default logging-only —
    # detail dicatat utk validasi, skor tak berubah sampai flag diaktifkan.
    if is_scalping and atr > 0:
        sweep_sc, sweep_note = liquidity_sweep_score(
            direction=direction, entry=entry, df=df, atr=atr,
            tf=tf, is_scalping=is_scalping, data_by_tf=data_by_tf,
        )
        fvg_sc, fvg_note = fvg_confluence_score(
            direction=direction, entry_price=entry, df=df, atr=atr,
            is_scalping=is_scalping, data_by_tf=data_by_tf,
        )
        detail["sweep_detail"] = sweep_note if sweep_sc > 0 else ""
        detail["fvg_detail"]   = fvg_note  if fvg_sc  > 0 else ""
        notes.append(sweep_note if sweep_sc > 0 else "SWEEP-")
        notes.append(fvg_note if fvg_sc > 0 else "FVG-")
        # Bonus gabungan: total max +1.0; jika keduanya hadir, share dibagi rata.
        # Hanya dibayarkan kalau ada key level (SNR/SND). Tanpa level, detail tetap
        # dicatat utk validasi tapi skor tidak berubah — Sweep/FVG pelengkap, bukan
        # pengganti S/R (kasus loss 22/09: Sweep+1.0x tanpa SnR/SnD).
        _has_key_level = (snr_sc > 0) or (snd_sc > 0)
        _detected = [
            name
            for name, flagged, present in (
                ("Sweep", sweep_enabled, sweep_sc > 0),
                ("FVG",   fvg_enabled,   fvg_sc  > 0),
            )
            if flagged and present
        ]
        if _detected and _has_key_level:
            _share = _W_SWEEP_FVG / len(_detected)
            for _name in _detected:
                score += _share
                notes.append(f"{_name}+{_share:.1f}x")
        elif _detected:
            notes.append("SWEEP_FVG_NO_KEY_LEVEL")
    else:
        notes.append("SWEEP_SKIP")
        notes.append("FVG_SKIP")

    # Asian (06:00-14:00 WIB) volatilitas rendah, fake breakout dominan: CONTINUATION
    # butuh +1 confluence & +1 trigger; sinyal tanpa key level (SNR/SND) direject.
    # Cek variabel skor, bukan string notes. now_utc dari close_time candle.
    asian_session = session_strictness(now_utc, tf=tf) == "RELAXED"
    
    if is_scalping and asian_session:
        has_key_level = (snr_sc > 0) or (snd_sc > 0)
        if not has_key_level:
            notes.append("ASIAN_NO_KEY_LEVEL")
            detail["snr_detail"] = detail.get("snr_detail", "") or "ASIAN_REJECT"
            return -99, " ".join(notes), detail
        
        # Asian CONTINUATION butuh score lebih tinggi (handled by caller via threshold adjustment)
        notes.append("ASIAN_SESSION")

    # Multi-TF alignment: 3+ TF setuju satu arah → +1.0. H1 signal + align H4+D1
    # → +0.5 (kompensasi H1 underperform: butuh backing HTF).
    if data_by_tf and len(data_by_tf) >= 3:
        aligned_count = 0
        h4_aligned = False
        d1_aligned = False
        
        for other_tf, other_df in data_by_tf.items():
            if other_tf == tf or len(other_df) < 200:
                continue
            other_bias = _bias_from_tf(other_df)
            expected_bias = "BULL" if direction == "BUY" else "BEAR"
            
            if other_bias == expected_bias:
                aligned_count += 1
                if other_tf == "H4":
                    h4_aligned = True
                elif other_tf == "D1":
                    d1_aligned = True
        
        if aligned_count >= 3:
            score += 1.0
            notes.append(f"MTF_ALIGN({aligned_count})")
        
        if tf == "H1" and h4_aligned and d1_aligned:
            score += 0.5
            notes.append("H1_HTF_BACKED")

    # Bonus golden ratio (0.618) — level psikologis/teknikal terkuat
    if "fib_detail" in detail and detail["fib_detail"]:
        fib_detail_str = detail["fib_detail"]
        if "0.618" in fib_detail_str or "61.8" in fib_detail_str:
            score += 0.5
            notes.append("FIB_GOLDEN")

    # Floor ke int — threshold tetap integer, tanpa "kredit lebih" dari bobot
    return int(score), " ".join(notes), detail


def _is_counter_trend_valid(
    df:                     pd.DataFrame,
    direction:              str,
    entry:                  float,
    atr:                    float,
    tf:                     str  = "",
    min_counter_confluence: int  = 3,
    is_scalping:            bool = True,
    data_by_tf:             dict[str, pd.DataFrame] | None = None,
) -> tuple[bool, str, int]:
    """Validasi counter trend: Divergence wajib (primary reversal signal), lalu Fib, SND, SNR."""
    score = 0
    notes: list[str] = []
    last  = df.iloc[-2] if len(df) >= 2 else df.iloc[-1]

    # Divergence (MANDATORY untuk counter-trend - primary reversal signal)
    if direction == "BUY":
        rsi_div  = bool(_safe(last, "rsi_bull_div")  or False)
        macd_div = bool(_safe(last, "macd_bull_div") or False)
    else:
        rsi_div  = bool(_safe(last, "rsi_bear_div")  or False)
        macd_div = bool(_safe(last, "macd_bear_div") or False)

    if not (rsi_div or macd_div):
        return False, "NO_DIVERGENCE", 0

    if rsi_div and macd_div:
        score += 2; notes.append("DIV_BOTH+")
    elif rsi_div or macd_div:
        score += 1; notes.append("RSI_DIV+" if rsi_div else "MACD_DIV+")
    else:
        notes.append("DIV-")

    # Fibonacci — Bug #1+#3 fix: pass is_scalping + data_by_tf
    fib_sc, fib_note = fib_confluence_score(
        direction=direction, entry_price=entry, df=df, atr=atr,
        is_scalping=is_scalping, data_by_tf=data_by_tf,
    )
    if fib_sc >= 2:
        score += 2; notes.append(f"FIB_GOLD+({fib_note})")
    elif fib_sc == 1:
        score += 1; notes.append(f"FIB_NEAR+({fib_note})")
    else:
        notes.append(f"FIB-({fib_note})")

    # SND — Bug #1 fix: pass tf + data_by_tf
    snd_sc, snd_note = snd_confluence_score(
        direction=direction, entry_price=entry,
        df=df, atr=atr, tf=tf, is_scalping=is_scalping,
        data_by_tf=data_by_tf,
    )
    if snd_sc >= 1:
        score += 1; notes.append(f"SND+({snd_note})")
    else:
        notes.append(f"SND-({snd_note})")

    snr_sc, snr_note = snr_confluence_score(
        direction=direction, entry_price=entry,
        df=df, atr=atr, tf=tf, is_scalping=is_scalping,
        data_by_tf=data_by_tf,
    )
    if snr_sc >= 1:
        score += 1; notes.append(f"SNR+({snr_note})")
    else:
        notes.append(f"SNR-({snr_note})")

    return score >= min_counter_confluence, " ".join(notes), score

```

### Lampiran 1.6 Kalkulasi Manajemen Risiko SL/TP Dinamis (`src/risk/sl_tp.py`)

**Lokasi Berkas:** `src/risk/sl_tp.py`  
Modul ini menghitung batasan risiko Stop Loss (SL) adaptif berbasis volatilitas Average True Range (ATR) dan titik struktur swing, memetakan target keuntungan bertingkat (Take Profit 1, 2, dan 3), serta memastikan kepatuhan rasio Risk-to-Reward minimum 1:1.0 atau 1:1.5.

```python
"""sl_tp.py — Stop Loss & Take Profit: Structural + ATR-based.

SL = swing point terdekat + 0.5×ATR buffer (anti stop-hunt), fallback atr_mult×ATR
(scalping 1.2×, intraday 1.5×). Entry zone 0.3×ATR. SL di-cap per TF.

TP: scalping ladder proporsional 0.7/1.0/1.3R, intraday 1.5/2.5/4.0R.
Gate RR dicabut (TP proporsional SL) → penggantinya OVEREXTENSION guard di engine.
"""
import math
from dataclasses import dataclass, field

import pandas as pd

from src.features.swing_utils import pivot_highs, pivot_lows


# Config

@dataclass(frozen=True)
class _SlConfig:
    atr_mult:    float   # SL fallback = atr_mult × ATR
    min_sl_pts:  float   # batas bawah absolut
    max_sl_pts:  float   # batas atas absolut (di-override oleh max_sl dari settings)
    lookback:    int     # lookback untuk swing SL


@dataclass(frozen=True)
class _TpConfig:
    tp1_rr:       float
    tp2_rr:       float
    tp3_rr:       float
    tp1_atr_mult: float = 0.0   # >0 → TP1 = tp1_atr_mult × ATR (independen SL)


_SL_SCALPING = _SlConfig(atr_mult=1.2, min_sl_pts=5.0,  max_sl_pts=10.0, lookback=20)
_SL_INTRADAY = _SlConfig(atr_mult=1.5, min_sl_pts=10.0, max_sl_pts=60.0, lookback=40)
# Scalping: ladder proporsional SL 0.7/1.0/1.3R (vs intraday 1.5/2.5/4.0R) — TP lebih sering tersentuh.
_TP_SCALPING = _TpConfig(tp1_rr=0.7, tp2_rr=1.0, tp3_rr=1.3, tp1_atr_mult=0.0)
_TP_INTRADAY = _TpConfig(tp1_rr=1.5, tp2_rr=2.5, tp3_rr=4.0)

# Entry zone fraction — 0.3×ATR dari close
_EZ_FRAC = 0.3
# Structural SL buffer — 0.5×ATR di luar swing point (naik dari 0.3, anti zona stop-hunt)
_STRUCT_BUFFER_FRAC = 0.5


def get_sl_config(is_scalping: bool) -> _SlConfig:
    return _SL_SCALPING if is_scalping else _SL_INTRADAY


def get_tp_config(is_scalping: bool) -> _TpConfig:
    return _TP_SCALPING if is_scalping else _TP_INTRADAY


# Data class

@dataclass
class SLTPlan:
    entry_low:    float
    entry_high:   float
    sl:           float
    tp1:          float
    tp2:          float
    tp3:          float
    method:       str
    atr_used:     float = field(default=0.0)
    sl_dist:      float = field(default=0.0)
    rr_tp1:       float = field(default=0.0)
    rr_tp2:       float = field(default=0.0)
    rr_tp3:       float = field(default=0.0)
    sl_source:    str   = field(default="")
    obstacle_tp1: float = field(default=0.0)


# Helpers

def _valid(*values: float) -> bool:
    return all(math.isfinite(v) and v > 0 for v in values)


def _swing_sl(
    direction: str,
    price_now: float,
    df:        pd.DataFrame,
    buffer:    float,
    lookback:  int,
    max_dist:  float,
) -> float | None:
    """Cari SL struktural — di luar pivot high/low terdekat + buffer.

    Pilih swing point terdekat yang masih dalam batas max_dist dari harga sekarang.
    """
    if len(df) < lookback + 10:
        return None
    recent = df.iloc[-(lookback + 2):-1].reset_index(drop=True)

    if direction == "BUY":
        # SL di bawah pivot low terdekat
        cands = sorted(
            [v for _, v in pivot_lows(recent, window=3) if v < price_now],
            reverse=True,  # nearest first
        )
        for raw in cands:
            sl = raw - buffer
            dist = abs(price_now - sl)
            if 0 < dist <= max_dist:
                return sl
    else:
        # SL di atas pivot high terdekat
        cands = sorted(
            [v for _, v in pivot_highs(recent, window=3) if v > price_now]
        )
        for raw in cands:
            sl = raw + buffer
            dist = abs(price_now - sl)
            if 0 < dist <= max_dist:
                return sl
    return None


def _find_tp_obstacle(
    direction: str,
    entry:     float,
    tp_target: float,
    atr:       float,
    df:        pd.DataFrame,
) -> float | None:
    """Cari level S/R antara entry dan TP yang bisa menghalangi."""
    if len(df) < 20:
        return None
    recent = df.iloc[-32:-1].reset_index(drop=True)
    if direction == "BUY":
        cands = [v for _, v in pivot_highs(recent, window=3)
                 if entry < v < tp_target - 0.5 * atr]
        return min(cands) if cands else None
    else:
        cands = [v for _, v in pivot_lows(recent, window=3)
                 if tp_target + 0.5 * atr < v < entry]
        return max(cands) if cands else None


def _adjust_tp_for_obstacle(
    direction: str,
    entry:     float,
    tp:        float,
    atr:       float,
    sl_dist:   float,
    df:        pd.DataFrame,
    min_rr:    float = 0.8,
) -> float:
    """Geser TP ke sebelum obstacle jika RR masih terjaga."""
    obstacle = _find_tp_obstacle(direction, entry, tp, atr, df)
    if obstacle is None:
        return tp
    margin   = 0.2 * atr
    adjusted = (obstacle - margin) if direction == "BUY" else (obstacle + margin)
    if sl_dist > 0 and abs(adjusted - entry) / sl_dist >= min_rr:
        return adjusted
    return tp


def _build_plan(
    d:          str,
    p:          float,
    a:          float,
    sl_raw:     float,
    sl_source:  str,
    r1:         float,
    r2:         float,
    r3:         float,
    df:         pd.DataFrame | None,
    is_scalping: bool,
    tp1_atr_mult: float = 0.0,
) -> SLTPlan | None:
    """Bangun SLTPlan dari titik SL yang sudah ditentukan.

    tp1_atr_mult > 0 → TP1 = ref_entry ± tp1_atr_mult×ATR (independen SL).
    tp1_atr_mult == 0 → TP1 = ref_entry ± sl_dist×r1 (legacy, proporsional SL).
    """
    ez = _EZ_FRAC * a

    if d == "BUY":
        entry_high = p
        entry_low  = round(p - ez, 5)
        # Pastikan SL di bawah entry_low
        if sl_raw >= entry_low:
            sl_raw = entry_low - _STRUCT_BUFFER_FRAC * a
        sl         = round(sl_raw, 5)
        sl_dist    = entry_high - sl
        ref_entry  = entry_high
        sign       = 1
        ok         = sl < entry_low < entry_high
    else:
        entry_low  = p
        entry_high = round(p + ez, 5)
        # Pastikan SL di atas entry_high
        if sl_raw <= entry_high:
            sl_raw = entry_high + _STRUCT_BUFFER_FRAC * a
        sl         = round(sl_raw, 5)
        sl_dist    = sl - entry_low
        ref_entry  = entry_low
        sign       = -1
        ok         = entry_low < entry_high < sl

    if not ok or sl_dist <= 0:
        return None

    if tp1_atr_mult > 0:
        # TP1 ATR-based — kunci profit cepat, tidak ikut lebar saat SL lebar.
        tp1 = round(ref_entry + sign * tp1_atr_mult * a, 5)
    else:
        tp1 = round(ref_entry + sign * sl_dist * r1, 5)
    tp2 = round(ref_entry + sign * sl_dist * r2, 5)
    tp3 = round(ref_entry + sign * sl_dist * r3, 5)

    if df is not None and len(df) >= 20:
        # TP1 tetap digeser lewat obstacle adjust selama RR terjaga >= 0.8.
        tp1 = round(_adjust_tp_for_obstacle(d, ref_entry, tp1, a, sl_dist, df, min_rr=0.8), 5)
        tp2 = round(_adjust_tp_for_obstacle(d, ref_entry, tp2, a, sl_dist, df, min_rr=1.5), 5)

    # Sanity check arah TP
    if d == "BUY" and not (sl < entry_low < entry_high < tp1):
        return None
    if d == "SELL" and not (tp1 < entry_low < entry_high < sl):
        return None

    rr1 = abs(tp1 - ref_entry) / sl_dist
    rr2 = abs(tp2 - ref_entry) / sl_dist
    rr3 = abs(tp3 - ref_entry) / sl_dist

    return SLTPlan(
        entry_low=entry_low, entry_high=entry_high,
        sl=sl, tp1=tp1, tp2=tp2, tp3=tp3,
        method=f"{'SCAL' if is_scalping else 'INTRA'} {d} | src={sl_source} sl={sl_dist:.1f}pt atr={a:.1f}",
        atr_used=a, sl_dist=sl_dist,
        rr_tp1=round(rr1, 2), rr_tp2=round(rr2, 2), rr_tp3=round(rr3, 2),
        sl_source=sl_source,
    )


# Fungsi utama

def calc_sltp(
    direction:   str,
    price_now:   float,
    atr:         float,
    is_scalping: bool  = False,
    tp1_rr:      float = 0.0,
    tp2_rr:      float = 0.0,
    tp3_rr:      float = 0.0,
    max_sl:      float = 0.0,
    df:          pd.DataFrame | None = None,
    max_sl_points:       float = 0.0,
    sl_atr_mult_override: float = 0.0,   # >0 → override sl_cfg.atr_mult (wire dari .env)
    tp1_atr_mult_override: float = 0.0,  # >0 → TP1 = ATR-based (wire dari .env, scalping)
    **_kwargs,
) -> "SLTPlan | None":
    """Hitung SL/TP: structural SL (swing ± 0.5×ATR) dulu, fallback atr_mult×ATR.

    safe_cap = hard_cap - ez (murni, bukan max() dgn min_sl_pts); jika < min_sl_pts
    → reject. Invariant: sl_dist + ez <= hard_cap di semua kondisi termasuk ATR tinggi.
    """
    try:
        p, a = float(price_now), float(atr)
        d    = direction.upper().strip()
    except Exception:
        return None
    if not _valid(p, a) or d not in ("BUY", "SELL"):
        return None

    sl_cfg = get_sl_config(is_scalping)
    tp_cfg = get_tp_config(is_scalping)

    # Override atr_mult dari luar (wire .env): >0 = pakai nilai eksternal.
    eff_atr_mult = sl_atr_mult_override if sl_atr_mult_override > 0 else sl_cfg.atr_mult

    r1 = tp1_rr if tp1_rr > 0 else tp_cfg.tp1_rr
    r2 = tp2_rr if tp2_rr > 0 else tp_cfg.tp2_rr
    r3 = tp3_rr if tp3_rr > 0 else tp_cfg.tp3_rr

    eff_tp1_atr = tp1_atr_mult_override if tp1_atr_mult_override > 0 else tp_cfg.tp1_atr_mult

    hard_cap = max_sl if max_sl > 0 else (max_sl_points if max_sl_points > 0 else sl_cfg.max_sl_pts)
    ez       = _EZ_FRAC * a
    buffer   = _STRUCT_BUFFER_FRAC * a

    # Scalping: SL cap 10pt dari entry reference; floor 0.8×ATR mencegah terlalu rapat (anti stop-hunt).
    if is_scalping:
        hard_cap = min(hard_cap, max(sl_cfg.max_sl_pts, 0.8 * a))
        safe_cap = hard_cap
    else:
        # safe_cap = ruang bersih utk sl_dist setelah entry zone (sl_dist <= hard_cap - ez).
        # Dua batas beda arah tak bisa di-max(): atas hard_cap-ez, bawah min_sl_pts;
        # bawah > atas → tidak ada SL valid yang muat → reject.
        safe_cap = hard_cap - ez
    if safe_cap < sl_cfg.min_sl_pts:
        # ATR sangat besar: entry zone "memakan" hard_cap, tak ada ruang utk SL minimum valid.
        return None

    # Coba structural SL dulu (swing point + buffer)
    struct_sl = _swing_sl(d, p, df if df is not None else pd.DataFrame(),
                          buffer, sl_cfg.lookback, safe_cap) if df is not None else None

    if struct_sl is not None:
        plan = _build_plan(d, p, a, struct_sl, "swing", r1, r2, r3, df, is_scalping,
                           tp1_atr_mult=eff_tp1_atr)
        # Cap scalping: swing valid secara struktural bisa terlalu jauh relatif ATR (contoh SL=2×ATR)
        # → sl_dist <= 1.5×ATR; kalau terlalu jauh, skip ke fallback 1.2×ATR. Intraday tak di-cap.
        _atr_cap_ok = (plan.sl_dist <= 1.5 * a) if (is_scalping and plan is not None) else True
        if plan is not None and sl_cfg.min_sl_pts <= plan.sl_dist <= safe_cap and _atr_cap_ok:
            return plan

    # Fallback: ATR flat
    if is_scalping:
        # Cap scalping dari entry reference (sl_dist di _build_plan sudah termasuk ez) → ruang SL = safe_cap - ez.
        sl_dist = eff_atr_mult * a
        sl_dist = min(sl_dist, safe_cap - ez)
        sl_dist = max(sl_dist, 0.0)
    else:
        sl_dist = eff_atr_mult * a
        sl_dist = max(sl_dist, sl_cfg.min_sl_pts)
        sl_dist = min(sl_dist, safe_cap)

    if sl_dist <= 0:
        return None

    if d == "BUY":
        atr_sl = p - ez - sl_dist   # = entry_low - sl_dist
    else:
        atr_sl = p + ez + sl_dist   # = entry_high + sl_dist

    plan = _build_plan(d, p, a, atr_sl, "atr_fallback", r1, r2, r3, df, is_scalping,
                       tp1_atr_mult=eff_tp1_atr)
    if plan is not None and sl_cfg.min_sl_pts <= plan.sl_dist <= safe_cap:
        return plan

    return None


# Alias untuk kompatibilitas engine

def swing_based_sltp(
    direction:           str,
    price_now:           float,
    df:                  pd.DataFrame,
    atr:                 float,
    is_scalping:         bool  = False,
    data_by_tf:          dict[str, pd.DataFrame] | None = None,
    tp1_rr:              float = 0.0,
    tp2_rr:              float = 0.0,
    tp3_rr:              float = 0.0,
    entry_atr_frac:      float = 0.3,
    max_sl:              float = 0.0,
    sl_atr_mult_override: float = 0.0,
    tp1_atr_mult_override: float = 0.0,
    **_kwargs,
) -> "SLTPlan | None":
    """SL pivot struktural (PRD §19): _swing_sl → swing ± 0.5×ATR; tanpa pivot valid,
    fallback atr_mult×ATR (scalping 1.2×, intraday 1.5×, override via sl_atr_mult_override).
    df wajib — tanpa df langsung fallback ATR.
    """
    return calc_sltp(
        direction=direction, price_now=price_now, atr=atr,
        is_scalping=is_scalping, tp1_rr=tp1_rr, tp2_rr=tp2_rr, tp3_rr=tp3_rr,
        max_sl=max_sl, df=df, sl_atr_mult_override=sl_atr_mult_override,
        tp1_atr_mult_override=tp1_atr_mult_override,
    )


def dynamic_atr_sltp(
    direction:           str,
    price_now:           float,
    atr:                 float,
    is_scalping:         bool  = False,
    tp1_rr:              float = 0.0,
    tp2_rr:              float = 0.0,
    tp3_rr:              float = 0.0,
    entry_atr_frac:      float = 0.3,
    max_sl:              float = 0.0,
    data_by_tf:          dict[str, pd.DataFrame] | None = None,
    df:                  pd.DataFrame | None = None,
    sl_atr_mult_override: float = 0.0,
    tp1_atr_mult_override: float = 0.0,
    **_kwargs,
) -> "SLTPlan | None":
    """ATR-based SL — langsung ke fallback path tanpa coba swing."""
    return calc_sltp(
        direction=direction, price_now=price_now, atr=atr,
        is_scalping=is_scalping, tp1_rr=tp1_rr, tp2_rr=tp2_rr, tp3_rr=tp3_rr,
        max_sl=max_sl, df=df, sl_atr_mult_override=sl_atr_mult_override,
        tp1_atr_mult_override=tp1_atr_mult_override,
    )


def fixed_zone_sltp(
    direction:       str,
    price_now:       float,
    entry_zone_pips: float = 30.0,
    sl_pips:         float = 50.0,
    tp1_pips:        float = 70.0,
    tp2_pips:        float = 90.0,
    tp3_pips:        float = 120.0,
    pip_size:        float = 0.1,
) -> "SLTPlan | None":
    """Fixed pip fallback — dipakai hanya jika calc_sltp gagal."""
    try:
        p    = float(price_now)
        ez   = float(entry_zone_pips) * float(pip_size)
        sl_v = float(sl_pips)  * float(pip_size)
        t1   = float(tp1_pips) * float(pip_size)
        t2   = float(tp2_pips) * float(pip_size)
        t3   = float(tp3_pips) * float(pip_size)
    except Exception:
        return None

    d = direction.upper().strip()

    if d == "BUY":
        entry_high, entry_low = p, round(p - ez, 5)
        sl = round(entry_low - sl_v, 5)
        if not (sl < entry_low < entry_high):
            return None
        sl_dist = entry_high - sl
        return SLTPlan(
            entry_low=entry_low, entry_high=entry_high, sl=sl,
            tp1=round(entry_high + t1, 5), tp2=round(entry_high + t2, 5),
            tp3=round(entry_high + t3, 5),
            method=f"Fixed BUY sl={sl_pips}p",
            sl_dist=sl_dist,
            rr_tp1=round(t1/sl_dist, 2) if sl_dist > 0 else 0,
            rr_tp2=round(t2/sl_dist, 2) if sl_dist > 0 else 0,
            rr_tp3=round(t3/sl_dist, 2) if sl_dist > 0 else 0,
        )
    if d == "SELL":
        entry_low, entry_high = p, round(p + ez, 5)
        sl = round(entry_high + sl_v, 5)
        if not (entry_low < entry_high < sl):
            return None
        sl_dist = sl - entry_low
        return SLTPlan(
            entry_low=entry_low, entry_high=entry_high, sl=sl,
            tp1=round(entry_low - t1, 5), tp2=round(entry_low - t2, 5),
            tp3=round(entry_low - t3, 5),
            method=f"Fixed SELL sl={sl_pips}p",
            sl_dist=sl_dist,
            rr_tp1=round(t1/sl_dist, 2) if sl_dist > 0 else 0,
            rr_tp2=round(t2/sl_dist, 2) if sl_dist > 0 else 0,
            rr_tp3=round(t3/sl_dist, 2) if sl_dist > 0 else 0,
        )
    return None

```

### Lampiran 1.7 Ekstraksi Pola Candlestick Rejection (`src/features/patterns.py`)

**Lokasi Berkas:** `src/features/patterns.py`  
Modul ini mengekstraksi dan mengidentifikasi formasi lilin pembalikan arah (rejection patterns) seperti Pin Bar, Hammer, Shooting Star, serta Bullish/Bearish Engulfing berdasarkan perbandingan proporsi badan terhadap sumbu (wick/shadow) lilin.

```python
import numpy as np
import pandas as pd
import talib

PATTERN_FUNCS: dict[str, object] = {
    "CDLHAMMER":         talib.CDLHAMMER,
    "CDLINVERTEDHAMMER": talib.CDLINVERTEDHAMMER,
    "CDLENGULFING":      talib.CDLENGULFING,
    "CDLMORNINGSTAR":    talib.CDLMORNINGSTAR,
    "CDLEVENINGSTAR":    talib.CDLEVENINGSTAR,
    "CDLSHOOTINGSTAR":   talib.CDLSHOOTINGSTAR,
    "CDLDOJI":           talib.CDLDOJI,
    "CDLPIERCING":       talib.CDLPIERCING,
    "CDLDARKCLOUDCOVER": talib.CDLDARKCLOUDCOVER,
    "CDLHARAMI":         talib.CDLHARAMI,
    "CDL3WHITESOLDIERS": talib.CDL3WHITESOLDIERS,
    "CDL3BLACKCROWS":    talib.CDL3BLACKCROWS,
    "CDLMARUBOZU":       talib.CDLMARUBOZU,
    "CDLSPINNINGTOP":    talib.CDLSPINNINGTOP,
}

PATTERN_NEUTRAL = {"CDLDOJI", "CDLSPINNINGTOP"}
# Filter body-size
_MIN_BODY_RATIO   = 0.40   
_BODY_LOOKBACK    = 10    
_SKIP_BODY_FILTER = {"CDLDOJI", "CDLSPINNINGTOP"} 


def _body_size_ok(o: np.ndarray, c: np.ndarray) -> np.ndarray:
    body     = np.abs(c - o)
    avg_body = (
        pd.Series(body)
        .rolling(_BODY_LOOKBACK, min_periods=1)
        .mean()
        .shift(1)
        .to_numpy()
    )
    with np.errstate(invalid="ignore"):
        ok = body >= (_MIN_BODY_RATIO * avg_body)
    ok = np.where(np.isnan(avg_body), True, ok)
    return ok

def add_patterns(df: pd.DataFrame) -> pd.DataFrame:
    o = df["open"].to_numpy(dtype=float)
    h = df["high"].to_numpy(dtype=float)
    l = df["low"].to_numpy(dtype=float)
    c = df["close"].to_numpy(dtype=float)

    body_ok    = _body_size_ok(o, c)
    bull_count = 0
    bear_count = 0

    for name, func in PATTERN_FUNCS.items():
        result = func(o, h, l, c)

        if name not in _SKIP_BODY_FILTER:
            result = np.where(body_ok, result, 0)

        df[name] = result

        if name not in PATTERN_NEUTRAL:
            bull_count += (result > 0).astype(int)
            bear_count += (result < 0).astype(int)

    df["pattern_bull_count"] = bull_count
    df["pattern_bear_count"] = bear_count
    return df

```

### Lampiran 1.8 Ekstraksi Fibonacci Retracement (`src/features/fibonacci.py`)

**Lokasi Berkas:** `src/features/fibonacci.py`  
Modul ini mendeteksi ayunan harga signifikan (swing high dan swing low) secara otomatis dan mengkalkulasi level-level rasio koreksi kritis Fibonacci Retracement (23.6%, 38.2%, 50.0%, 61.8%, dan 78.6%) sebagai area potensial titik pantulan harga.

```python
"""fibonacci.py — Fibonacci Retracement untuk XAU/USD."""
from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from src.features.swing_utils import pivot_highs, pivot_lows


@dataclass(frozen=True)
class FibConfig:
    fib_tf:          str
    pivot_length:    int
    lookback:        int
    min_impulse_atr: float
    zone_tolerance:  float
    strong_levels:   frozenset[float]

FIB_SCALPING_AREA = FibConfig(
    fib_tf="M15", pivot_length=3, lookback=400,
    min_impulse_atr=1.5, zone_tolerance=0.50,
    strong_levels=frozenset({0.382, 0.5, 0.618}),
)
FIB_INTRADAY_AREA = FibConfig(
    fib_tf="H1", pivot_length=4, lookback=500,
    min_impulse_atr=2.0, zone_tolerance=0.60,
    strong_levels=frozenset({0.382, 0.5, 0.618, 0.786}),
)

FIB_H4_CONF = FibConfig(
    fib_tf="H4", pivot_length=5, lookback=300,
    min_impulse_atr=4.0, zone_tolerance=0.30,
    strong_levels=frozenset({0.382, 0.5, 0.618, 0.786}),
)
FIB_H1_CONF = FibConfig(
    fib_tf="H1", pivot_length=4, lookback=300,
    min_impulse_atr=2.5, zone_tolerance=0.40,
    strong_levels=frozenset({0.382, 0.5, 0.618}),
)
FIB_D1_CONF = FibConfig(
    fib_tf="D1", pivot_length=5, lookback=200,
    min_impulse_atr=5.0, zone_tolerance=0.50,
    strong_levels=frozenset({0.382, 0.5, 0.618, 0.786}),
)

_CONF_TFS_SCALPING: tuple[str, ...] = ("H4", "H1")
_CONF_TFS_INTRADAY: tuple[str, ...] = ("D1", "H4")

_CONF_CFG: dict[str, FibConfig] = {
    "H4": FIB_H4_CONF,
    "H1": FIB_H1_CONF,
    "D1": FIB_D1_CONF,
}

_ALL_LEVELS = [0.236, 0.382, 0.5, 0.618, 0.786]
_WEAK_LEVEL = 0.236


def _get_area_config(is_scalping: bool) -> FibConfig:
    return FIB_SCALPING_AREA if is_scalping else FIB_INTRADAY_AREA


def _resolve_fib_df(
    df:         pd.DataFrame,
    target_tf:  str,
    data_by_tf: dict[str, pd.DataFrame] | None,
) -> tuple[pd.DataFrame, float]:
    """Ambil DataFrame TF target dari data_by_tf. Fallback ke df argumen."""
    src_df = df
    if data_by_tf:
        candidate = data_by_tf.get(target_tf.upper())
        if candidate is not None and len(candidate) >= 30:
            src_df = candidate
    atr = 0.0
    if "atr_14" in src_df.columns:
        v = src_df["atr_14"].iloc[-2]
        if pd.notna(v) and float(v) > 0:
            atr = float(v)
    return src_df, atr


def _check_fib_confluence(
    conf_tf:     str,
    conf_cfg:    FibConfig,
    direction:   str,
    entry_price: float,
    data_by_tf:  dict[str, pd.DataFrame],
    fallback_atr: float,
) -> bool:
    """Cek apakah entry_price dekat level fib di conf_tf."""
    df_conf = data_by_tf.get(conf_tf)
    if df_conf is None or len(df_conf) < 30:
        return False

    conf_atr = fallback_atr
    if "atr_14" in df_conf.columns:
        v = df_conf["atr_14"].iloc[-2]
        if pd.notna(v) and float(v) > 0:
            conf_atr = float(v)

    min_imp = conf_cfg.min_impulse_atr * conf_atr
    sw = last_swing(df_conf, conf_cfg.lookback, direction, conf_cfg.pivot_length, min_imp)
    if sw is None:
        return False

    levels = fib_levels(*sw[:2], sw[2])
    near   = nearest_fib(entry_price, levels)
    if near is None:
        return False

    _, px     = near
    tolerance = conf_cfg.zone_tolerance * conf_atr
    return abs(entry_price - px) <= tolerance


def last_swing(
    df:           pd.DataFrame,
    lookback:     int,
    direction:    str,
    pivot_length: int   = 3,
    min_impulse:  float = 0.0,
) -> tuple[float, float, str] | None:
    if len(df) < lookback + 5:
        return None

    direction = direction.upper()
    w = df.iloc[-lookback:].reset_index(drop=True)

    p_highs = pivot_highs(w, window=pivot_length)
    p_lows  = pivot_lows(w,  window=pivot_length)

    # Fallback pivot_length lebih kecil jika tidak ada pivot
    if (not p_highs or not p_lows) and pivot_length > 3:
        p_highs = pivot_highs(w, window=3)
        p_lows  = pivot_lows(w,  window=3)

    # Fallback min/max absolut jika masih tidak ada pivot
    if not p_highs or not p_lows:
        w2     = df.iloc[-min(lookback, 50):].copy()
        idx_hi = w2["high"].idxmax()
        idx_lo = w2["low"].idxmin()
        s_lo   = float(w2.loc[idx_lo, "low"])
        s_hi   = float(w2.loc[idx_hi, "high"])
        s_dir  = "UP" if idx_lo < idx_hi else "DOWN"
        if direction == "BUY"  and s_dir != "UP":   return None
        if direction == "SELL" and s_dir != "DOWN":  return None
        if min_impulse > 0 and (s_hi - s_lo) < min_impulse:
            return None
        return s_lo, s_hi, s_dir

    if direction == "BUY":
        for lo_idx, lo_val in reversed(p_lows):
            highs_after = [(i, v) for i, v in p_highs if i > lo_idx]
            if not highs_after:
                continue
            _, hi_val = max(highs_after, key=lambda x: x[1])
            if min_impulse > 0 and (hi_val - lo_val) < min_impulse:
                continue
            return lo_val, hi_val, "UP"

    elif direction == "SELL":
        for hi_idx, hi_val in reversed(p_highs):
            lows_after = [(i, v) for i, v in p_lows if i > hi_idx]
            if not lows_after:
                continue
            _, lo_val = min(lows_after, key=lambda x: x[1])
            if min_impulse > 0 and (hi_val - lo_val) < min_impulse:
                continue
            return lo_val, hi_val, "DOWN"

    return None


def recent_swings(
    df:           pd.DataFrame,
    lookback:     int,
    direction:    str,
    pivot_length: int   = 3,
    min_impulse:  float = 0.0,
    max_results:  int   = 3,
) -> list[tuple[float, float, str]]:
    """Cari beberapa swing terakhir, diurutkan dari yang TERBARU.

    Identik dengan last_swing tapi lanjut mencari hingga max_results ditemukan
    atau pivot habis. Dipakai fib_confluence_score sebagai fallback swing lama.
    """
    if len(df) < lookback + 5:
        return []

    direction = direction.upper()
    w = df.iloc[-lookback:].reset_index(drop=True)

    p_highs = pivot_highs(w, window=pivot_length)
    p_lows  = pivot_lows(w,  window=pivot_length)

    if (not p_highs or not p_lows) and pivot_length > 3:
        p_highs = pivot_highs(w, window=3)
        p_lows  = pivot_lows(w,  window=3)

    # Jika tidak ada pivot sama sekali, fallback ke last_swing biasa
    if not p_highs or not p_lows:
        sw = last_swing(df, lookback, direction, pivot_length, min_impulse)
        return [sw] if sw is not None else []

    results: list[tuple[float, float, str]] = []

    if direction == "BUY":
        for lo_idx, lo_val in reversed(p_lows):
            if len(results) >= max_results:
                break
            highs_after = [(i, v) for i, v in p_highs if i > lo_idx]
            if not highs_after:
                continue
            _, hi_val = max(highs_after, key=lambda x: x[1])
            if min_impulse > 0 and (hi_val - lo_val) < min_impulse:
                continue
            sw = (lo_val, hi_val, "UP")
            # Hindari duplikat (swing yang sangat mirip)
            if not any(abs(r[0] - sw[0]) < 0.01 and abs(r[1] - sw[1]) < 0.01 for r in results):
                results.append(sw)

    elif direction == "SELL":
        for hi_idx, hi_val in reversed(p_highs):
            if len(results) >= max_results:
                break
            lows_after = [(i, v) for i, v in p_lows if i > hi_idx]
            if not lows_after:
                continue
            _, lo_val = min(lows_after, key=lambda x: x[1])
            if min_impulse > 0 and (hi_val - lo_val) < min_impulse:
                continue
            sw = (lo_val, hi_val, "DOWN")
            if not any(abs(r[0] - sw[0]) < 0.01 and abs(r[1] - sw[1]) < 0.01 for r in results):
                results.append(sw)

    return results


def fib_levels(
    swing_low:  float,
    swing_high: float,
    direction:  str,
) -> dict[str, float]:
    diff = swing_high - swing_low
    if diff <= 0:
        return {}
    levels: dict[str, float] = {}
    if direction == "UP":
        for lv in _ALL_LEVELS:
            levels[f"fib_{lv}"] = swing_high - diff * lv
        levels["fib_0"] = swing_high
        levels["fib_1"] = swing_low
    else:
        for lv in _ALL_LEVELS:
            levels[f"fib_{lv}"] = swing_low + diff * lv
        levels["fib_0"] = swing_low
        levels["fib_1"] = swing_high
    return levels


def nearest_fib(
    price:  float,
    levels: dict[str, float],
) -> tuple[str, float] | None:
    if not levels:
        return None
    key = min(levels.keys(), key=lambda k: abs(levels[k] - price))
    return key, float(levels[key])


def _score_level(name: str, px: float, strong_levels: frozenset[float]) -> tuple[int, str]:
    try:
        lv_num = float(name.replace("fib_", ""))
    except ValueError:
        return 1, f"FIB_NEAR({name}={px:.2f})"
    if lv_num in {0.0, 1.0}:    return 0, f"FIB_ENDPOINT({name}={px:.2f})"
    if lv_num == _WEAK_LEVEL:   return 0, f"FIB_WEAK({name}={px:.2f})"
    if lv_num in strong_levels: return 2, f"FIB_STRONG({name}={px:.2f})"
    return 1, f"FIB_NEAR({name}={px:.2f})"


def fib_confluence_score(
    direction:   str,
    entry_price: float,
    df:          pd.DataFrame,
    atr:         float,
    tf:          str  = "",
    is_scalping: bool = False,
    data_by_tf:  dict[str, pd.DataFrame] | None = None,
) -> tuple[int, str]:
    """Skor konfluensi Fibonacci: 0, 1, atau 2+bonus.

    Fallback ke swing lama (rank-1/2) jika level swing terbaru terlalu jauh dari entry.
    Tag: FRESH (rank-0) atau FALLBACK_SWING2/3. Confluence set konsisten SNR/SND:
    Scalping = H4+H1; Intraday = D1+H4.
    """
    if atr <= 0:
        return 0, "FIB_SKIP"

    direction = direction.upper()
    cfg       = _get_area_config(is_scalping)

    src_df, src_atr = _resolve_fib_df(df, cfg.fib_tf, data_by_tf)
    eff_atr = src_atr if src_atr > 0 else atr
    min_imp = cfg.min_impulse_atr * eff_atr

    # Coba beberapa swing, dari yang terbaru ke yang lama
    swings = recent_swings(src_df, cfg.lookback, direction, cfg.pivot_length, min_imp, max_results=3)
    if not swings:
        return 0, f"FIB_NO_SWING(min={min_imp:.1f})"

    tolerance = cfg.zone_tolerance * eff_atr
    base_score, base_label, swing_tag = 0, "", "FRESH"

    for rank, sw in enumerate(swings):
        levels = fib_levels(*sw[:2], sw[2])
        if not levels:
            continue

        near = nearest_fib(entry_price, levels)
        if near is None:
            continue

        name, px = near
        if abs(entry_price - px) > tolerance:
            continue   # swing ini levelnya jauh, coba swing berikutnya

        sc, lbl = _score_level(name, px, cfg.strong_levels)
        if sc > 0:
            base_score = sc
            base_label = lbl
            swing_tag  = "FRESH" if rank == 0 else f"FALLBACK_SWING{rank + 1}"
            break

    if base_score == 0:
        return 0, f"FIB_FAR(no_swing_near tol={tolerance:.1f})"

    # Multi-TF confluence bonus — konsisten dengan SNR/SND
    conf_tfs  = _CONF_TFS_SCALPING if is_scalping else _CONF_TFS_INTRADAY
    bonus     = 0
    bonus_tfs: list[str] = []

    if data_by_tf is not None:
        for conf_tf in conf_tfs:
            if conf_tf == cfg.fib_tf.upper():
                continue
            conf_cfg = _CONF_CFG.get(conf_tf)
            if conf_cfg is None:
                continue
            if _check_fib_confluence(conf_tf, conf_cfg, direction,
                                     entry_price, data_by_tf, atr):
                bonus += 1
                bonus_tfs.append(conf_tf)

    bonus_tag = ("+" + "+".join(bonus_tfs)) if bonus_tfs else ""
    return base_score + bonus, f"{base_label}{bonus_tag}|{swing_tag}"


def fib_lookback_for_tf(tf: str) -> int:
    return {"M5": 200, "M15": 200, "H1": 300, "H4": 300, "D1": 200}.get(tf.upper(), 200)

```

### Lampiran 1.9 Ekstraksi Support & Resistance Horizontal (`src/features/zones_snr.py`)

**Lokasi Berkas:** `src/features/zones_snr.py`  
Modul ini mengidentifikasi zona batas harga horisontal (Support & Resistance) melalui klasterisasi level-level harga ekstrem historis dan pengujian frekuensi pantulan (touches) harga untuk menentukan tingkat kekuatan key level.

```python
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from src.features.swing_utils import (
    swing_high_idx_prices,
    swing_high_prices,
    swing_low_idx_prices,
    swing_low_prices,
)


@dataclass(frozen=True)
class _TFConfig:
    pivot_length:  int
    lookback:      int
    atr_tolerance: float
    min_touches:   int
    min_strength:  int


# min_strength=20 konsisten dengan _touch_score(): 2 touch=20, 3 touch=35, 4+ touch=25 (exhaustion)
_TF_CONFIG: dict[str, _TFConfig] = {
    "M15": _TFConfig(pivot_length=3, lookback=300, atr_tolerance=0.50, min_touches=2, min_strength=20),
    "H1":  _TFConfig(pivot_length=4, lookback=400, atr_tolerance=0.60, min_touches=2, min_strength=20),
    "H4":  _TFConfig(pivot_length=5, lookback=400, atr_tolerance=0.70, min_touches=2, min_strength=20),
    "D1":  _TFConfig(pivot_length=5, lookback=300, atr_tolerance=0.80, min_touches=2, min_strength=20),
}
_TF_CONFIG_DEFAULT = _TFConfig(pivot_length=3, lookback=300, atr_tolerance=0.50, min_touches=2, min_strength=20)
_CONFLUENCE_TFS_SCALPING = ("H4", "H1", "M15")
_CONFLUENCE_TFS_INTRADAY = ("D1", "H4", "H1")


@dataclass
class SnrZone:
    zone_type:  str
    center:     float
    lower:      float
    upper:      float
    touches:    int
    strength:   float
    timeframes: list[str]     = field(default_factory=list)
    confluence: bool          = False
    age_bars:   int           = 0     
    freshness:  str           = ""    

def _cluster(levels: list[float], tolerance: float) -> list[list[float]]:
    if not levels:
        return []
    sorted_lvl = sorted(levels)
    clusters: list[list[float]] = [[sorted_lvl[0]]]
    for lv in sorted_lvl[1:]:
        last = clusters[-1]
        cluster_width = lv - last[0]
        if lv - last[-1] <= tolerance and cluster_width <= 1.5 * tolerance:
            last.append(lv)
        else:
            clusters.append([lv])
    return clusters


def _cluster_with_idx(
    idx_price_pairs: list[tuple[int, float]],
    tolerance: float,
) -> list[list[tuple[int, float]]]:
    """Cluster (idx, price) berdasarkan harga. Pertahankan idx untuk age_bars."""
    if not idx_price_pairs:
        return []
    sorted_pairs = sorted(idx_price_pairs, key=lambda x: x[1])
    clusters: list[list[tuple[int, float]]] = [[sorted_pairs[0]]]
    for pair in sorted_pairs[1:]:
        last = clusters[-1]
        cluster_width = pair[1] - last[0][1]
        if pair[1] - last[-1][1] <= tolerance and cluster_width <= 1.5 * tolerance:
            last.append(pair)
        else:
            clusters.append([pair])
    return clusters


def _touch_score(touches: int) -> float:
    if touches >= 4: return 25.0
    if touches == 3: return 35.0
    if touches == 2: return 20.0
    return 0.0


def _build_zones(df: pd.DataFrame, tf: str, atr: float) -> list[SnrZone]:
    cfg       = _TF_CONFIG.get(tf.upper(), _TF_CONFIG_DEFAULT)
    recent    = df.iloc[-cfg.lookback:] if len(df) > cfg.lookback else df
    n         = len(recent)
    tolerance = atr * cfg.atr_tolerance
    zones: list[SnrZone] = []

    hi_idx_px = swing_high_idx_prices(recent, left=cfg.pivot_length, right=cfg.pivot_length)
    lo_idx_px = swing_low_idx_prices(recent,  left=cfg.pivot_length, right=cfg.pivot_length)

    for zone_type, idx_px_list in [("RESISTANCE", hi_idx_px), ("SUPPORT", lo_idx_px)]:
        clusters_with_idx = _cluster_with_idx(idx_px_list, tolerance)
        for cluster_pairs in clusters_with_idx:
            touches  = len(cluster_pairs)
            strength = _touch_score(touches)
            if strength < cfg.min_strength:
                continue

            prices   = [p for _, p in cluster_pairs]
            indices  = [i for i, _ in cluster_pairs]
            center   = float(np.mean(prices))
            half     = max(tolerance / 2, atr * 0.15)

            newest_touch_idx = max(indices)
            age_bars         = n - 1 - newest_touch_idx
            freshness        = "FRESH" if age_bars <= cfg.lookback / 3 else "AGED"

            zones.append(SnrZone(
                zone_type=zone_type, center=center,
                lower=center - half, upper=center + half,
                touches=touches, strength=strength,
                timeframes=[tf.upper()],
                age_bars=age_bars, freshness=freshness,
            ))
    return zones


def _merge_confluence(zones_by_tf: dict[str, list[SnrZone]]) -> list[SnrZone]:
    all_zones: list[SnrZone] = []
    for tf_zones in zones_by_tf.values():
        all_zones.extend(tf_zones)

    merged: list[SnrZone] = []
    used   = set()

    for i, z1 in enumerate(all_zones):
        if i in used:
            continue
        combined = SnrZone(
            zone_type=z1.zone_type, center=z1.center, lower=z1.lower,
            upper=z1.upper, touches=z1.touches, strength=z1.strength,
            timeframes=list(z1.timeframes), confluence=False,
            age_bars=z1.age_bars, freshness=z1.freshness,
        )
        for j, z2 in enumerate(all_zones):
            if j <= i or j in used:
                continue
            if z2.zone_type != z1.zone_type:
                continue
            if not (z1.lower <= z2.upper and z2.lower <= z1.upper):
                continue
            if set(z1.timeframes) & set(z2.timeframes):
                continue
            combined.lower      = max(combined.lower, z2.lower)
            combined.upper      = min(combined.upper, z2.upper)
            combined.center     = (combined.lower + combined.upper) / 2
            combined.touches   += z2.touches
            combined.strength   = min(100.0, combined.strength + z2.strength + 30.0)
            combined.timeframes = list(set(combined.timeframes) | set(z2.timeframes))
            combined.confluence = True
            # Freshness gabungan: pakai yang lebih baru (age_bars lebih kecil = lebih fresh)
            if z2.age_bars < combined.age_bars:
                combined.age_bars  = z2.age_bars
                combined.freshness = z2.freshness
            used.add(j)

        used.add(i)
        merged.append(combined)
    return merged


def _has_clear_road(
    direction:    str,
    entry:        float,
    sl:           float,
    tp1_rr:       float,
    zones:        list[SnrZone],
    atr:          float,
    block_factor: float = 0.7,
) -> bool:
    """Cek jalur ke TP bebas hambatan. Cek SEMUA zona (FRESH+AGED) tanpa pembedaan.
    Level lama tetap bisa jadi penghalang efektif — tidak dilemahkan oleh fallback logic.
    """
    if sl <= 0 or atr <= 0:
        return True
    sl_dist    = abs(entry - sl)
    block_dist = block_factor * sl_dist * tp1_rr
    min_dist   = 0.3 * atr

    if direction == "BUY":
        return not any(
            z.zone_type == "RESISTANCE"
            and entry + min_dist < z.center <= entry + block_dist
            for z in zones
        )
    return not any(
        z.zone_type == "SUPPORT"
        and entry - block_dist <= z.center < entry - min_dist
        for z in zones
    )


def build_snr_zones(
    df:          pd.DataFrame,
    tf:          str,
    atr:         float,
    data_by_tf:  dict[str, pd.DataFrame] | None = None,
    is_scalping: bool = True,
) -> list[SnrZone]:
    """Bangun SnrZone dengan multi-TF confluence.

    is_scalping=True  → confluence set: H4+H1+M15
    is_scalping=False → confluence set: D1+H4+H1
    """
    if atr <= 0:
        return []
    tf_upper      = tf.upper()
    conf_tfs      = _CONFLUENCE_TFS_SCALPING if is_scalping else _CONFLUENCE_TFS_INTRADAY

    if data_by_tf is None:
        return _build_zones(df, tf_upper, atr)

    zones_by_tf: dict[str, list[SnrZone]] = {}
    for conf_tf in conf_tfs:
        src_df = data_by_tf.get(conf_tf)
        if src_df is None or len(src_df) < 30:
            continue
        tf_atr = atr
        if "atr_14" in src_df.columns:
            v = src_df["atr_14"].iloc[-2]
            if pd.notna(v) and float(v) > 0:
                tf_atr = float(v)
        zones_by_tf[conf_tf] = _build_zones(src_df, conf_tf, tf_atr)

    if tf_upper not in zones_by_tf:
        zones_by_tf[tf_upper] = _build_zones(df, tf_upper, atr)

    return _merge_confluence(zones_by_tf)


def snr_confluence_score(
    direction:   str,
    entry_price: float,
    df:          pd.DataFrame,
    atr:         float,
    sl:          float = 0.0,
    tp1_rr:      float = 1.5,
    data_by_tf:  dict[str, pd.DataFrame] | None = None,
    tf:          str   = "",
    near_factor: float = 1.2,   # Dinaikkan dari 0.8: radius "dekat zona valid" lebih longgar
    is_scalping: bool  = True,
) -> tuple[int, str]:
    """Skor konfluensi S/R: 0 atau 1.

    Search: FRESH (near_factor ketat) dulu, lalu AGED (longgar +0.3×ATR) → tag AGED_FALLBACK.
    Obstacle check (_has_clear_road) tetap cek SEMUA zona.
    """
    if atr <= 0:
        return 0, "SNR_SKIP"

    direction = direction.upper()
    tf_upper  = tf.upper() if tf else ""
    zones     = build_snr_zones(df, tf_upper or "M15", atr, data_by_tf, is_scalping=is_scalping)
    if not zones:
        return 0, "SNR_NO_ZONE"

    near_thr_fresh = near_factor * atr
    near_thr_aged  = (near_factor + 0.3) * atr   # lebih longgar untuk level lama yang lebih "mayor"

    # Fix 3: level harus JAUH di sisi entry (masih aktif), bukan sudah "membasar"-nya.
    # Entry yang nyaris menempel/melampaui level = konfirmasi tidak valid (level rawan pecah).
    level_margin = 0.15 * atr
    if direction == "BUY":
        same_type = [z for z in zones
                     if z.zone_type == "SUPPORT"
                     and z.center <= entry_price - level_margin]
    else:
        same_type = [z for z in zones
                     if z.zone_type == "RESISTANCE"
                     and z.center >= entry_price + level_margin]

    if not same_type:
        all_same = [z for z in zones
                    if z.zone_type == ("SUPPORT" if direction == "BUY" else "RESISTANCE")]
        if all_same:
            nearest = min(all_same, key=lambda z: abs(z.center - entry_price))
            return 0, f"SNR_FAR(nearest={nearest.center:.2f} t={nearest.touches})"
        return 0, "SNR_FAR(no_zone)"

    fresh_cands = [z for z in same_type
                   if z.freshness == "FRESH"
                   and abs(entry_price - z.center) <= near_thr_fresh]
    aged_cands  = [z for z in same_type
                   if abs(entry_price - z.center) <= near_thr_aged]

    if fresh_cands:
        best = max(fresh_cands, key=lambda z: z.strength)
        tag  = "FRESH"
    elif aged_cands:
        best = max(aged_cands, key=lambda z: z.strength)
        tag  = "AGED_FALLBACK"
    else:
        nearest = min(same_type, key=lambda z: abs(z.center - entry_price))
        return 0, f"SNR_FAR(nearest={nearest.center:.2f} t={nearest.touches} {nearest.freshness})"

    if sl > 0 and not _has_clear_road(direction, entry_price, sl, tp1_rr, zones, atr):
        return 0, f"SNR_BLOCKED(clear_road {best.zone_type[:3]}={best.center:.2f})"

    tfs_str  = "+".join(sorted(best.timeframes))
    conf_tag = " MTF" if best.confluence else ""
    age_tag  = f" age={best.age_bars}b"
    return 1, (f"SNR_OK({best.zone_type[:3]}={best.center:.2f}"
               f" t={best.touches} str={best.strength:.0f}"
               f" tf={tfs_str}{conf_tag} {tag}{age_tag})")

```

### Lampiran 1.10 Ekstraksi Zona Supply & Demand (`src/features/zones_snd.py`)

**Lokasi Berkas:** `src/features/zones_snd.py`  
Modul ini mendeteksi zona ketidakseimbangan likuiditas institusional (Supply & Demand) berbasis formasi Drop-Base-Rally (DBR), Rally-Base-Drop (RBD), Rally-Base-Rally (RBR), dan Drop-Base-Drop (DBD) dengan memverifikasi impulsivitas pergerakan lilin pemicu.

```python
"""zones_snd.py — Deteksi zona Supply & Demand berbasis historical impulse."""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class _SndConfig:
    lookback:         int
    impulse_body_atr: float
    base_max_range:   float
    min_impulse_dist: float


_TF_CONFIG: dict[str, _SndConfig] = {
    "M5":  _SndConfig(lookback=150, impulse_body_atr=1.2, base_max_range=0.9, min_impulse_dist=1.2),
    "M15": _SndConfig(lookback=250, impulse_body_atr=1.2, base_max_range=0.9, min_impulse_dist=1.2),
    "H1":  _SndConfig(lookback=300, impulse_body_atr=1.5, base_max_range=0.8, min_impulse_dist=1.5),
    "H4":  _SndConfig(lookback=300, impulse_body_atr=2.0, base_max_range=0.7, min_impulse_dist=2.0),
    "D1":  _SndConfig(lookback=250, impulse_body_atr=2.0, base_max_range=0.7, min_impulse_dist=2.0),
}
_TF_CONFIG_DEFAULT = _SndConfig(lookback=200, impulse_body_atr=1.2, base_max_range=0.9, min_impulse_dist=1.2)

# Confluence set per mode (sama pola seperti SNR):
#   Scalping: H4+H1; Intraday: D1+H4 (D1 untuk validasi zona major intraday)
_CONFLUENCE_TFS_SCALPING = ("H4", "H1")
_CONFLUENCE_TFS_INTRADAY = ("D1", "H4")

_BASE_WINDOW    = 6
_NEAR_ENTRY_ATR = 1.2   # Radius "dekat zona valid"; dinaikkan 1.0→1.2 agar lebih banyak sinyal lolos confluence


def _get_atr(df: pd.DataFrame) -> float:
    if "atr_14" in df.columns:
        v = df["atr_14"].dropna()
        if len(v) > 0:
            val = float(v.iloc[-2] if len(v) >= 2 else v.iloc[-1])
            if val > 0:
                return val
    trs = (df.tail(15)["high"] - df.tail(15)["low"]).abs()
    return float(trs.mean()) if len(trs) > 0 else 0.0


def _count_zone_touches(
    after:     pd.DataFrame,
    zone_low:  float,
    zone_high: float,
    bullish:   bool,
) -> tuple[int, bool]:
    """Hitung touch zona secara vectorized (numpy).

    Returns (touch_count: 0=fresh, 1=retest, 2+=exhausted; zone_held: False jika ada
    close yang menembus sisi seberang). Candle break terakhir ikut dihitung touch.
    """
    if len(after) == 0:
        return 0, True

    lows   = after["low"].to_numpy(dtype=float)
    highs  = after["high"].to_numpy(dtype=float)
    closes = after["close"].to_numpy(dtype=float)

    if bullish:
        broken = closes < zone_low
    else:
        broken = closes > zone_high

    break_idx = int(np.argmax(broken)) if broken.any() else len(after)

    # Hanya hitung touch sebelum (atau sampai) break point
    lows_pre  = lows[:break_idx]
    highs_pre = highs[:break_idx]

    # Touch = candle overlap zona (cek dua sisi)
    if bullish:
        entered = (lows_pre <= zone_high) & (highs_pre >= zone_low)
    else:
        entered = (highs_pre >= zone_low) & (lows_pre <= zone_high)

    touch_count = int(entered.sum())

    if broken.any():
        return touch_count + 1, False   # candle break dihitung touch terakhir
    return touch_count, True


def _find_zones(
    df:      pd.DataFrame,
    atr:     float,
    cfg:     _SndConfig,
    bullish: bool,
) -> list[dict]:
    zones: list[dict] = []
    if atr <= 0 or len(df) < cfg.lookback + 5:
        return zones

    data = df.iloc[-(cfg.lookback + 2):-1].reset_index(drop=True)
    n    = len(data)

    for i in range(_BASE_WINDOW, n - 2):
        c      = data.iloc[i]
        c_open  = float(c.get("open",  0))
        c_close = float(c.get("close", 0))

        body = (c_close - c_open) if bullish else (c_open - c_close)
        if body < cfg.impulse_body_atr * atr:
            continue

        base_slice = data.iloc[max(0, i - _BASE_WINDOW):i]
        if len(base_slice) < 2:
            continue

        base_high  = float(base_slice["high"].max())
        base_low   = float(base_slice["low"].min())
        base_range = base_high - base_low

        if base_range > cfg.base_max_range * atr:
            continue

        impulse_dist = (c_close - base_high) if bullish else (base_low - c_close)
        if impulse_dist < cfg.min_impulse_dist * atr:
            continue

        after = data.iloc[i + 1:]
        if len(after) > 0:
            touch_count, zone_held = _count_zone_touches(after, base_low, base_high, bullish)
            if touch_count >= 2:
                continue   # exhausted — terlalu sering disentuh
            if touch_count == 1 and not zone_held:
                continue   # close menembus zona = rusak
            # touch_count == 0: fresh (strength penuh)
            # touch_count == 1 + held: valid retest, strength dikurangi 1
        else:
            touch_count = 0

        # Freshness dari umur formasi — independen dari touch_count (zona baru ≠ zona lama)
        age_bars  = n - i
        freshness = "FRESH" if age_bars <= cfg.lookback / 3 else "AGED"

        strength = 1
        if impulse_dist >= cfg.min_impulse_dist * atr * 2: strength += 1
        if base_range   <= 0.4 * atr:                      strength += 1
        if touch_count  == 1:                              strength  = max(1, strength - 1)

        zones.append({
            "type":         "DEMAND" if bullish else "SUPPLY",
            "zone_low":     base_low,
            "zone_high":    base_high,
            "mid":          (base_low + base_high) / 2,
            "zone_mid":     (base_low + base_high) / 2,
            "impulse_dist": impulse_dist,
            "strength":     strength,
            "touch_count":  touch_count,
            "age_bars":     age_bars,
            "freshness":    freshness,
            "timeframes":   [],
        })
    return zones


def _apply_mtf_confluence(zones: list[dict], atr: float, tf_zones: list[dict], tf_name: str) -> None:
    for z in zones:
        for tz in tf_zones:
            if tz["type"] != z["type"]:
                continue
            if z["zone_low"] <= tz["zone_high"] and tz["zone_low"] <= z["zone_high"]:
                z["strength"] = min(100, z["strength"] + 20)
                if tf_name not in z["timeframes"]:
                    z["timeframes"].append(tf_name)
                break


def _best_zone_near_entry(
    zones:       list[dict],
    entry_price: float,
    near_thr:    float,
    atr:         float,
) -> dict | None:
    """Pilih zona terbaik dekat entry: FRESH (ketat near_thr) dulu, lalu AGED
    fallback (longgar near_thr+0.3×ATR). Dalam kategori: utamakan (touch_count==1,
    strength) lebih tinggi.
    """
    near_thr_aged = near_thr + 0.3 * atr

    def _composite(z: dict) -> tuple:
        """Key sorting: (is_fresh, has_retest, strength, -dist)."""
        dist      = min(abs(entry_price - z["zone_low"]), abs(entry_price - z["zone_high"]))
        is_fresh  = 1 if z.get("freshness") == "FRESH" else 0
        has_retest = 1 if z.get("touch_count", 0) == 1 else 0
        return (is_fresh, has_retest, z["strength"], -dist)

    # FRESH — near_thr ketat
    fresh_cands = [
        z for z in zones
        if z.get("freshness") == "FRESH"
        and min(abs(entry_price - z["mid"]),
                abs(entry_price - z["zone_low"]),
                abs(entry_price - z["zone_high"])) <= near_thr
    ]
    if fresh_cands:
        return max(fresh_cands, key=_composite)

    # AGED fallback — near_thr lebih longgar
    aged_cands = [
        z for z in zones
        if min(abs(entry_price - z["mid"]),
               abs(entry_price - z["zone_low"]),
               abs(entry_price - z["zone_high"])) <= near_thr_aged
    ]
    return max(aged_cands, key=_composite) if aged_cands else None


def snd_confluence_score(
    direction:   str,
    entry_price: float,
    df:          pd.DataFrame,
    atr:         float,
    tf:          str  = "",
    near_factor: float = _NEAR_ENTRY_ATR,
    data_by_tf:  dict[str, pd.DataFrame] | None = None,
    is_scalping: bool = True,
) -> tuple[int, str]:
    """
    Skor konfluensi Supply & Demand: 0 atau 1.

    Confluence set: True → H4+H1; False → D1+H4 (D1 untuk zona major intraday).
    """
    if atr <= 0:
        return 0, "SND_SKIP"

    direction = direction.upper()
    tf_upper  = tf.upper() if tf else ""
    cfg       = _TF_CONFIG.get(tf_upper, _TF_CONFIG_DEFAULT)
    bullish   = direction == "BUY"
    zone_type = "DEMAND" if bullish else "SUPPLY"
    conf_tfs  = _CONFLUENCE_TFS_SCALPING if is_scalping else _CONFLUENCE_TFS_INTRADAY

    zones = _find_zones(df, atr, cfg, bullish)
    if not zones:
        return 0, f"SND_NO_ZONE({zone_type})"

    if data_by_tf is not None:
        for conf_tf in conf_tfs:
            if conf_tf == tf_upper:
                continue
            src_df = data_by_tf.get(conf_tf)
            if src_df is None or len(src_df) < 30:
                continue
            conf_atr = atr
            if "atr_14" in src_df.columns:
                v = src_df["atr_14"].iloc[-2]
                if pd.notna(v) and float(v) > 0:
                    conf_atr = float(v)
            conf_cfg   = _TF_CONFIG.get(conf_tf, _TF_CONFIG_DEFAULT)
            conf_zones = _find_zones(src_df, conf_atr, conf_cfg, bullish)
            if conf_zones:
                _apply_mtf_confluence(zones, atr, conf_zones, conf_tf)

    best_zone = _best_zone_near_entry(zones, entry_price, near_factor * atr, atr)
    if best_zone is None:
        closest = min(zones, key=lambda z: abs(entry_price - z["mid"]))
        return 0, (f"SND_FAR({zone_type} "
                   f"{closest['zone_low']:.2f}-{closest['zone_high']:.2f} "
                   f"dist={abs(entry_price - closest['mid']):.1f})")

    z         = best_zone
    tf_tag    = "+" + "+".join(z["timeframes"]) if z["timeframes"] else ""
    touch_tag = f" t={z['touch_count']}" if z.get("touch_count", 0) > 0 else ""
    fresh_tag = f" {z.get('freshness', '')}" if z.get("freshness") else ""
    age_tag   = f" age={z.get('age_bars', 0)}b"
    return 1, (f"SND_{zone_type}({z['zone_low']:.2f}-{z['zone_high']:.2f}"
               f" str={z['strength']}{tf_tag}{touch_tag}{fresh_tag}{age_tag}"
               f" imp={z['impulse_dist']:.1f})")

```

### Lampiran 1.11 Konektor MetaTrader 5 (`src/mt5/connector.py`)

**Lokasi Berkas:** `src/mt5/connector.py`  
Modul ini mengelola inisialisasi sesi antarmuka pemrograman aplikasi (API) MetaTrader 5 secara terisolasi (portable mode), memvalidasi parameter otentikasi akun perdagangan, dan memelihara status konektivitas terminal secara andal.

```python
﻿"""connector.py — Koneksi ke terminal MetaTrader 5.

Path terminal dikonfigurasi via env MT5_TERMINAL_PATH (default: C:\\Program Files\\MetaTrader 5\\terminal64.exe).
"""

import os

import MetaTrader5 as mt5


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

def shutdown() -> None:
    """Tutup koneksi MT5 dengan aman."""
    try:
        mt5.shutdown()
    except Exception:
        pass

```

### Lampiran 1.12 Notifikasi Telegram Bot API (`src/notify/telegram.py`)

**Lokasi Berkas:** `src/notify/telegram.py`  
Modul ini menangani pengiriman pesan sinyal rekomendasi transaksi, diagram visual, dan peringatan pembaruan hasil secara real-time ke kanal komunikasi Telegram melalui protokol HTTP POST berbasis RESTful API dengan penanganan kesalahan jaringan.

```python
"""telegram.py — Kirim pesan HTML ke Telegram Bot API."""

import html
import re

import requests
from loguru import logger


def _sanitize_html(text: str) -> str:
    """Escape karakter < > & yang bukan bagian dari tag HTML valid Telegram."""
    _ALLOWED_TAGS = re.compile(
        r'<(/?)(?:b|i|u|s|code|pre|a|tg-spoiler)(?:\s[^>]*)?>',
        re.IGNORECASE,
    )
    result   = []
    last_end = 0
    for m in _ALLOWED_TAGS.finditer(text):
        segment = text[last_end:m.start()]
        segment = segment.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        result.append(segment)
        result.append(m.group(0))
        last_end = m.end()
    tail = text[last_end:]
    tail = tail.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    result.append(tail)
    return "".join(result)


def send_message(token: str, chat_id: str, text: str) -> None:
    """
    Kirim pesan HTML ke chat_id. Tidak melempar exception; fallback plain text jika parse HTML gagal (400).
    """
    url       = f"https://api.telegram.org/bot{token}/sendMessage"
    safe_text = _sanitize_html(text)

    try:
        resp = requests.post(
            url,
            json={"chat_id": chat_id, "text": safe_text, "parse_mode": "HTML"},
            timeout=10,
        )
        if resp.ok:
            return
        if resp.status_code == 400:
            logger.warning(f"Telegram HTML parse error, retry plain: {resp.text[:120]}")
            resp2 = requests.post(
                url,
                json={"chat_id": chat_id, "text": html.unescape(safe_text)},
                timeout=10,
            )
            if not resp2.ok:
                logger.warning(f"Telegram plain text gagal {resp2.status_code}: {resp2.text[:80]}")
        else:
            logger.warning(f"Telegram error {resp.status_code}: {resp.text[:120]}")
    except requests.exceptions.Timeout:
        logger.warning("Telegram timeout")
    except requests.exceptions.ConnectionError:
        logger.warning("Telegram connection error")
    except Exception as e:
        logger.warning(f"Telegram error: {e}")

```

### Lampiran 1.13 Pelacak Status Transaksi Real-Time (`src/infra/signal_tracker.py`)

**Lokasi Berkas:** `src/infra/signal_tracker.py`  
Modul ini menjalankan pemantauan harga pasar secara real-time berbasis background thread untuk melacak status transaksi aktif terhadap level Stop Loss maupun Take Profit 1-3, mencatat durasi serta realized outcome, dan memicu notifikasi pembaruan secara otomatis.

```python
﻿"""signal_tracker.py — Background thread monitoring TP/SL real-time."""

import threading
from dataclasses import dataclass
from datetime import datetime
from typing import Callable

import pandas as pd
from loguru import logger


from src.utils.time_utils import TZ_WIB, parse_dt_safe
from src.engine.anytf_mta_engine import record_loss, reset_consec_loss

POLL_INTERVAL  = 10
MAX_DURATION_H = 48


@dataclass
class TrackedSignal:
    signal_id:  str
    symbol:     str
    direction:  str
    entry:      float
    entry_low:  float
    entry_high: float
    sl:         float
    tp1:        float
    tp2:        float | None
    tp3:        float | None
    start_time: datetime
    atr_value:      float = 0.0
    is_setup_plan:  bool  = False
    entry_zone_hit: bool  = False
    tp1_hit:    bool = False
    tp2_hit:    bool = False
    tp3_hit:    bool = False
    resolved:   bool = False
    breakeven_sl: float | None = None  # SL digeser ke breakeven setelah TP1 kena


class SignalTracker:
    """Monitor sinyal PENDING dan auto-update outcome saat TP/SL tersentuh."""

    def __init__(
        self,
        sig_logger,
        get_price_fn:       Callable[[str], tuple[float, float]],
        send_notify_fn:     Callable[[str], None] | None = None,
        refresh_report_fn:  Callable[[], None] | None    = None,
        poll_interval:  int = POLL_INTERVAL,
        max_duration_h: int = MAX_DURATION_H,
    ) -> None:
        self._logger         = sig_logger
        self._get_price      = get_price_fn
        self._notify         = send_notify_fn
        self._refresh_report = refresh_report_fn
        self._poll_interval  = poll_interval
        self._max_hours      = max_duration_h
        self._active: dict[str, TrackedSignal] = {}
        self._lock   = threading.Lock()
        self._stop   = threading.Event()
        self._thread: threading.Thread | None = None
        # Sinyal yang di-load saat startup — tidak kirim notif Telegram untuk ini
        self._startup_signal_ids: set[str] = set()

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._load_pending_from_logger()
        self._thread = threading.Thread(target=self._run, name="SignalTracker", daemon=True)
        self._thread.start()
        logger.info(f"SignalTracker started | poll={self._poll_interval}s | tracking={len(self._active)} sinyal pending")

    def stop(self) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=15)
        logger.info("SignalTracker stopped.")

    def add_signal(self, rec: dict) -> None:
        sid = rec.get("signal_id", "")
        if not sid or float(rec.get("sl", 0) or 0) == 0:
            return
        is_setup   = str(rec.get("is_setup_plan", "False")).lower() in ("true", "1", "yes")
        entry      = float(rec.get("entry",      0) or 0)
        entry_low  = float(rec.get("entry_low",  0) or 0) or entry
        entry_high = float(rec.get("entry_high", 0) or 0) or entry
        atr_value  = float(rec.get("atr_value",  0) or 0)
        direction  = rec.get("direction", "BUY")

        # Non-setup: entry_zone_hit selalu True — harga bisa sudah bergerak jauh
        # dari zona saat bot restart, kalau menunggu zona TP/SL tak pernah dimonitor.
        if is_setup:
            entry_zone_hit = False
        else:
            entry_zone_hit = True

        ts = TrackedSignal(
            signal_id   = sid,
            symbol      = rec.get("symbol", "XAUUSD"),
            direction   = direction,
            entry       = entry,
            entry_low   = entry_low,
            entry_high  = entry_high,
            sl          = float(rec.get("sl",    0) or 0),
            tp1         = float(rec.get("tp1",   0) or 0),
            tp2         = float(rec.get("tp2",   0) or 0) or None,
            tp3         = float(rec.get("tp3",   0) or 0) or None,
            start_time  = parse_dt_safe(rec.get("timestamp", "")),
            atr_value   = atr_value,
            is_setup_plan   = is_setup,
            entry_zone_hit  = entry_zone_hit,
        )
        with self._lock:
            self._active[sid] = ts
        logger.debug(f"SignalTracker.add | {sid} | {ts.direction} @ {ts.entry} | setup={is_setup} atr={atr_value:.4f}")

    def get_active_count(self) -> int:
        with self._lock:
            return len(self._active)

    def _load_pending_from_logger(self) -> None:
        """Load sinyal PENDING dari logger saat startup; sinyal > 2 jam masuk
        _startup_signal_ids (notif Telegram diblokir, dianggap sinyal lama).
        """
        now = datetime.now(tz=TZ_WIB)
        suppress_threshold_hours = 2
        try:
            for rec in self._logger.get_trackable():
                self.add_signal(rec)
                sid = rec.get("signal_id", "")
                if not sid:
                    continue
                ts_str   = rec.get("timestamp", "")
                sig_time = parse_dt_safe(ts_str)
                age_hours = (now - sig_time).total_seconds() / 3600
                if age_hours > suppress_threshold_hours:
                    self._startup_signal_ids.add(sid)
                    logger.debug(f"SignalTracker startup: suppress notif {sid} (usia {age_hours:.1f}j)")
                else:
                    logger.debug(f"SignalTracker startup: keep notif {sid} (usia {age_hours:.1f}j)")
        except Exception as e:
            logger.warning(f"SignalTracker: gagal load pending: {e}")

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                next_interval = self._check_all()
            except Exception as e:
                logger.error(f"SignalTracker error: {e}")
                next_interval = self._poll_interval
            self._stop.wait(timeout=next_interval)

    def _check_all(self) -> float:
        """Check semua sinyal aktif. Returns interval poll berikutnya (adaptive)."""
        with self._lock:
            ids = list(self._active.keys())

        min_interval = self._poll_interval  # default 10 detik
        prices_cache: dict[str, tuple[float, float]] = {}

        for sid in ids:
            with self._lock:
                ts = self._active.get(sid)
            if ts is None or ts.resolved:
                continue

            # Cache harga per symbol agar tidak double-call MT5
            sym = ts.symbol
            if sym not in prices_cache:
                try:
                    bid, ask = self._get_price(sym)
                    if bid > 0 and ask > 0:
                        prices_cache[sym] = (bid, ask)
                except Exception:
                    continue

            bid, ask = prices_cache.get(sym, (0.0, 0.0))
            if bid <= 0 or ask <= 0:
                continue

            self._evaluate(ts, bid, ask)

            # Adaptive interval: cek seberapa dekat harga ke TP1 atau SL
            if not ts.resolved:
                check_price = bid if ts.direction == "BUY" else ask
                atr_est = ts.atr_value if hasattr(ts, "atr_value") and ts.atr_value > 0 else 5.0
                dist_tp = abs(check_price - ts.tp1) if ts.tp1 > 0 else 999
                dist_sl = abs(check_price - ts.sl)
                min_dist = min(dist_tp, dist_sl)

                if min_dist <= atr_est * 0.5:
                    min_interval = min(min_interval, 1)   # sangat dekat → 1 detik
                elif min_dist <= atr_est * 1.5:
                    min_interval = min(min_interval, 3)   # agak dekat → 3 detik
                else:
                    min_interval = min(min_interval, 10)  # masih jauh → 10 detik

        with self._lock:
            self._active = {k: v for k, v in self._active.items() if not v.resolved}

        return max(1, min_interval)  # minimum 1 detik

    def _evaluate(self, ts: TrackedSignal, bid: float, ask: float) -> None:
        now        = datetime.now(tz=TZ_WIB)
        is_buy     = ts.direction == "BUY"
        check_price = bid if is_buy else ask

        # Setup plan: tunggu harga masuk entry zone (entry_low–entry_high) dulu
        if not ts.entry_zone_hit:
            price_mid = (bid + ask) / 2
            in_zone = ts.entry_low <= price_mid <= ts.entry_high
            if in_zone:
                ts.entry_zone_hit = True
                logger.info(f"[TRACKER] Entry zone hit | {ts.signal_id} | price={price_mid:.2f} zone={ts.entry_low:.2f}-{ts.entry_high:.2f}")
            else:
                # Belum masuk zona — cek apakah SL sudah tersentuh sebelum zona (sinyal batal)
                sl_before_entry = (is_buy and check_price <= ts.sl) or (not is_buy and check_price >= ts.sl)
                if sl_before_entry:
                    self._resolve(ts, "CANCELLED", check_price, now, "SL_BEFORE_ENTRY")
                return  # belum masuk zona, belum monitor TP

        # SL efektif = breakeven_sl jika aktif (TP1 sudah kena), else SL awal
        effective_sl = ts.breakeven_sl if ts.breakeven_sl is not None else ts.sl
        sl_hit = (is_buy and check_price <= effective_sl) or \
                 (not is_buy and check_price >= effective_sl)

        if sl_hit and not ts.tp1_hit:
            self._resolve(ts, "LOSS", check_price, now)
            return

        if not ts.tp1_hit and ts.tp1 > 0:
            if (is_buy and check_price >= ts.tp1) or (not is_buy and check_price <= ts.tp1):
                ts.tp1_hit = True
                self._logger.update_hit_time(ts.signal_id, "tp1", now.strftime("%Y-%m-%dT%H:%M:%S"))
                self._send_tp_notify("🎯 <b>TP1 TERCAPAI</b>", ts.signal_id, check_price)

                # SL breakeven = entry price — posisi sisa tak bisa rugi meski harga balik
                ts.breakeven_sl = ts.entry
                logger.info(
                    f"[TRACKER] Breakeven aktif | {ts.signal_id} | "
                    f"SL lama={ts.sl:.2f} → SL baru={ts.breakeven_sl:.2f} (entry)"
                )

                if not ts.tp2:
                    self._resolve(ts, "WIN_TP1", check_price, now)
                    return

        if ts.tp1_hit and not ts.tp2_hit and ts.tp2:
            if (is_buy and check_price >= ts.tp2) or (not is_buy and check_price <= ts.tp2):
                ts.tp2_hit = True
                self._logger.update_hit_time(ts.signal_id, "tp2", now.strftime("%Y-%m-%dT%H:%M:%S"))
                self._send_tp_notify("🎯🎯 <b>TP2 TERCAPAI</b>", ts.signal_id, check_price)
                if not ts.tp3:
                    self._resolve(ts, "WIN_TP2", check_price, now)
                    return

        if ts.tp2_hit and not ts.tp3_hit and ts.tp3:
            if (is_buy and check_price >= ts.tp3) or (not is_buy and check_price <= ts.tp3):
                ts.tp3_hit = True
                self._logger.update_hit_time(ts.signal_id, "tp3", now.strftime("%Y-%m-%dT%H:%M:%S"))
                self._send_tp_notify("🎯🎯🎯 <b>TP3 TERCAPAI — FULL TARGET!</b>", ts.signal_id, check_price)
                self._resolve(ts, "WIN_TP3", check_price, now)
                return

        if ts.tp1_hit and not ts.tp2_hit and sl_hit:
            self._resolve(ts, "WIN_TP1", check_price, now)
        elif ts.tp2_hit and not ts.tp3_hit and sl_hit:
            self._resolve(ts, "WIN_TP2", check_price, now)

    def _send_tp_notify(self, header: str, signal_id: str, price: float) -> None:
        """Kirim notif TP hanya untuk sinyal baru (bukan dari startup), langsung tanpa blocking."""
        if self._notify and signal_id not in self._startup_signal_ids:
            msg = f"{header}\nID: <code>{signal_id}</code>\nHarga: <code>{price:.2f}</code>"
            threading.Thread(
                target=self._notify, args=(msg,), name="TrackerNotify", daemon=True
            ).start()

    def _resolve(self, ts: TrackedSignal, outcome: str, price: float, now: datetime, reason: str = "") -> None:
        ts.resolved  = True
        duration_m   = int((now - ts.start_time).total_seconds() / 60)
        emoji  = {"WIN_TP1": "✅", "WIN_TP2": "✅✅", "WIN_TP3": "✅✅✅", "LOSS": "❌", "CANCELLED": "⚠️"}.get(outcome, "")
        is_new = ts.signal_id not in self._startup_signal_ids

        logger.success(f"[TRACKER] {outcome} | {ts.signal_id} | price={price:.2f} | duration={duration_m}m")

        # Consecutive loss/win tracker — key per mode agar scalping/intraday tak saling blokir
        _tf_from_id = ts.signal_id.split("_")[1] if "_" in ts.signal_id else ""
        _is_scal    = _tf_from_id.upper() in {"M5", "M15"}
        _cb_key     = f"{ts.symbol}_{'scalping' if _is_scal else 'intraday'}"
        if outcome == "LOSS":
            record_loss(_cb_key)
        elif outcome.startswith("WIN"):
            reset_consec_loss(_cb_key)

        # Kirim Telegram dulu — notif tak tertahan operasi file I/O
        if self._notify and outcome != "CANCELLED" and is_new:
            try:
                self._notify(
                    f"{emoji} <b>{outcome}</b>\n"
                    f"ID: <code>{ts.signal_id}</code>\n"
                    f"Harga: <code>{price:.2f}</code>\n"
                    f"Durasi: <code>{duration_m} menit</code>\n"
                    f"Pips: <code>{abs(price - ts.entry):.1f}</code>"
                )
            except Exception as e:
                logger.warning(f"Tracker notify error: {e}")

        # Simpan ke file (JSON + CSV) di thread terpisah agar I/O tak memblokir polling
        def _save_async() -> None:
            try:
                self._logger.update_outcome(
                    ts.signal_id, outcome,
                    price=price, notes=reason or "Auto-detected by SignalTracker", duration_m=duration_m,
                )
            except Exception as e:
                logger.warning(f"Tracker save error: {e}")
            if self._refresh_report:
                try:
                    self._refresh_report()
                except PermissionError:
                    logger.debug("Tracker report skip: file dibuka di Excel")
                except Exception as e:
                    logger.debug(f"Tracker report refresh error: {e}")

        threading.Thread(target=_save_async, name="TrackerSave", daemon=True).start()

```

## Lampiran 2: Rekapitulasi Sampel Log Sinyal Perdagangan Hasil Forward Testing

Tabel berikut menyajikan cuplikan 25 sampel log pembentukan sinyal rekomendasi riil dari total 170 transaksi pada berkas basis data `docs/laporan_trading.xlsx` yang tercatat selama masa pengujian berjalan (*forward testing*) periode Agustus–September 2026:

**Tabel L.1 Sampel Log Riwayat Transaksi Sinyal Live XAU/USD**

| No. | Waktu Validasi (WIB) | TF | Arah | Entry Price | Stop Loss | TP1 | TP2 | TP3 | Outcome Hasil | Durasi (mnt) | Realized RR |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 19/08/2026 22:30 | M5 | BUY | 4483.60 | 4478.60 | 4491.10 | 4493.60 | 4496.10 | **WIN_TP3** | 30 | 2.00 |
| 2 | 20/08/2026 00:35 | M5 | BUY | 4488.18 | 4483.18 | 4495.68 | 4498.18 | 4500.68 | **WIN_TP1** | 42 | 1.00 |
| 3 | 20/08/2026 01:45 | M5 | BUY | 4490.39 | 4485.39 | 4497.89 | 4500.39 | 4502.89 | **WIN_TP3** | 23 | 2.00 |
| 4 | 21/08/2026 09:40 | M5 | BUY | 4531.21 | 4526.21 | 4538.71 | 4541.21 | 4543.71 | **WIN_TP3** | 233 | 2.00 |
| 5 | 21/08/2026 10:35 | M5 | BUY | 4535.43 | 4530.43 | 4542.93 | 4545.43 | 4547.93 | **LOSS** | 3 | -1.00 |
| 6 | 21/08/2026 14:35 | M5 | BUY | 4562.10 | 4557.10 | 4569.60 | 4572.10 | 4574.60 | **WIN_TP3** | 46 | 2.00 |
| 7 | 21/08/2026 16:40 | M5 | BUY | 4585.27 | 4580.27 | 4592.77 | 4595.27 | 4597.77 | **WIN_TP3** | 125 | 2.00 |
| 8 | 21/08/2026 19:50 | M5 | BUY | 4579.29 | 4574.29 | 4586.79 | 4589.29 | 4591.79 | **WIN_TP1** | 44 | 1.00 |
| 9 | 21/08/2026 20:00 | M15 | BUY | 4577.89 | 4572.89 | 4585.39 | 4587.89 | 4590.39 | **WIN_TP3** | 38 | 2.00 |
| 10 | 21/08/2026 20:40 | M5 | BUY | 4587.23 | 4582.23 | 4594.73 | 4597.23 | 4599.73 | **LOSS** | 12 | -1.00 |
| 11 | 21/08/2026 21:45 | M5 | BUY | 4582.36 | 4577.36 | 4589.86 | 4592.36 | 4594.86 | **WIN_TP3** | 6 | 2.00 |
| 12 | 24/08/2026 21:10 | M5 | BUY | 4670.52 | 4665.52 | 4678.02 | 4680.52 | 4683.02 | **LOSS** | 1 | -1.00 |
| 13 | 24/08/2026 22:00 | M5 | BUY | 4670.30 | 4665.30 | 4677.80 | 4680.30 | 4682.80 | **WIN_TP1** | 39 | 1.00 |
| 14 | 24/08/2026 23:05 | M5 | BUY | 4658.88 | 4653.88 | 4666.38 | 4668.88 | 4671.38 | **LOSS** | 4 | -1.00 |
| 15 | 24/08/2026 23:15 | M15 | BUY | 4657.42 | 4652.42 | 4664.92 | 4667.42 | 4669.92 | **LOSS** | 37 | -1.00 |
| 16 | 25/08/2026 06:15 | M15 | BUY | 4672.13 | 4667.13 | 4679.63 | 4682.13 | 4684.63 | **WIN_TP3** | 45 | 2.00 |
| 17 | 25/08/2026 12:00 | M15 | BUY | 4625.86 | 4620.86 | 4633.36 | 4635.86 | 4638.36 | **WIN_TP3** | 7 | 2.00 |
| 18 | 25/08/2026 16:00 | H1 | BUY | 4630.28 | 4615.28 | 4652.78 | 4667.78 | 4690.28 | **LOSS** | 262 | -1.00 |
| 19 | 25/08/2026 18:15 | M15 | BUY | 4642.86 | 4637.86 | 4650.36 | 4652.86 | 4655.36 | **LOSS** | 47 | -1.00 |
| 20 | 25/08/2026 19:00 | H1 | BUY | 4642.36 | 4627.36 | 4664.86 | 4679.86 | 4702.36 | **LOSS** | 74 | -1.00 |
| 21 | 25/08/2026 21:45 | M15 | BUY | 4637.11 | 4632.11 | 4644.61 | 4647.11 | 4649.61 | **LOSS** | 18 | -1.00 |
| 22 | 25/08/2026 22:00 | H1 | BUY | 4635.50 | 4620.50 | 4658.00 | 4673.00 | 4695.50 | **LOSS** | 1289 | -1.00 |
| 23 | 26/08/2026 00:45 | M15 | BUY | 4642.86 | 4637.86 | 4650.36 | 4652.86 | 4655.36 | **WIN_TP3** | 75 | 2.00 |
| 24 | 26/08/2026 00:50 | M5 | BUY | 4645.90 | 4640.90 | 4653.40 | 4655.90 | 4658.40 | **WIN_TP3** | 77 | 2.00 |
| 25 | 26/08/2026 01:00 | H1 | BUY | 4648.34 | 4633.34 | 4670.84 | 4685.84 | 4708.34 | **LOSS** | 239 | -1.00 |

*Catatan: Seluruh data lengkap 170 sinyal tersimpan dalam arsip digital berkas laporan_trading.xlsx dan logs/signal_history.csv.*

## Lampiran 3: Format Pesan dan Bukti Komunikasi Antarmuka Telegram Bot API

Sistem menggunakan protokol komunikasi HTTP REST Telegram Bot API untuk mendistribusikan notifikasi sinyal serta pembaruan hasil secara nir-hambatan. Berikut struktur format pesan rekomendasi sinyal baru (*New Signal Alert*) dan pesan pembaruan hasil pencapaian target (*Update Alert*):

### Lampiran 3.1 Format Notifikasi Sinyal Baru (*New Signal Alert*)

```text
🚨 [DSS SIGNAL ALERT — XAU/USD] 🚨
--------------------------------------
Arah Transaksi : SELL / SHORT
Timeframe      : M15 (Mode: Trend Following)
Waktu Validasi : 2026-09-02 14:15 WIB
--------------------------------------
📌 Level Eksekusi:
- Entry Price  : 2498.20
- Stop Loss    : 2504.20 (Jarak: 60 pips)
- Take Profit 1: 2492.20 (RR 1:1.0)
- Take Profit 2: 2489.20 (RR 1:1.5)
- Take Profit 3: 2486.20 (RR 1:2.0)
--------------------------------------
🔍 Ringkasan Konfluensi Analisis:
- HTF Bias     : BEARISH (H4 & H1 EMA Alignment)
- Trigger      : Bearish Engulfing + RSI Slope Down
- Zone Level   : Resistance Zone M15 + Fib 50.0%
- Total Skor   : Trigger: 6/6 | Confluence: 7.0
--------------------------------------
⚠️ Catatan: Disiplin gunakan SL dan manajemen lot 1-2% modal.
```

### Lampiran 3.2 Format Notifikasi Pembaruan Status Transaksi (*Trade Outcome Alert*)

```text
✅ [SIGNAL UPDATE — TARGET TERCAPAI] ✅
--------------------------------------
ID Sinyal      : #042
Instrumen      : XAU/USD (M15 SELL)
Status Hasil   : WIN TAKE PROFIT 3 (TP3)
Harga Target   : 2486.20 (Realisasi RR: 1:2.0R)
Durasi Aktif   : 85 Menit (~1,4 Jam)
--------------------------------------
📈 Keterangan  : Tren impulsif berlanjut hingga target maksimal.
```

## Lampiran 4: Spesifikasi Parameter Gerbang Inferensi (5-Gate Validation Framework)

**Tabel L.2 Matriks Spesifikasi Aturan Validasi 5-Gate**

| Gerbang | Nama Gerbang | Parameter & Komponen yang Dievaluasi | Kondisi Lolos (Pass) | Status Jika Gagal |
| :---: | :--- | :--- | :--- | :--- |
| Gate 1 | Validasi Teknis Dasar | Integritas bar data OHLCV, filter sesi aktif (bukan rollover), dan ambang batas ATR minimum. | Data utuh, sesi aktif, ATR > threshold. | `SESSION_OFF`, `DATA_INVALID` |
| Gate 2 | Higher Timeframe Bias | Kelurusan tren H4 & H1 (EMA 50 vs EMA 200) serta kemiringan slope MA. | Arah tren makro selaras (Bull/Bear) atau mode counter-trend valid. | `BIAS_NEUTRAL`, `BIAS_CONFLICT` |
| Gate 3 | Trigger Scoring | Skor pemicu lilin eksekusi: Pola Candlestick, RSI Slope, MACD Histogram, EMA Pullback. | Skor pemicu $\ge 4$ (Mode Trend) atau $\ge 3$ (Mode Scalping). | `TRIGGER_SCORE_LOW` |
| Gate 4 | Confluence Scoring | Skor pendukung struktur: Zona SNR horisontal, Zona SND, dan rasio Fibonacci (38.2%, 50%, 61.8%). | Skor konfluensi $\ge 2.0$ dan tidak terhalang level kunci terdekat. | `CONFLUENCE_LOW`, `SNR_BLOCKED` |
| Gate 5 | Manajemen Risiko & RR | Penentuan harga Entry, ATR-based SL, multi-target TP1–3, dan validasi rasio Risk-to-Reward. | $\Delta_{\text{chase}} \le 1.5\times\text{ATR}$, dan rasio $RR \ge 1:1.0$. | `RR_LOW`, `LATE_ENTRY`, `ZONE_PASSED` |

