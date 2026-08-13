'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');

/**
 * Monitor.js — Layer 10: Logging terstruktur + metrik + deteksi anomali.
 *
 * KONTRAK BLACKBOARD:
 *   Baca : BB.stats, BB.recovery, BB.tasks
 *   Tulis: (tidak ada — hanya membaca untuk monitor)
 */
class Monitor {
  constructor(blackboard) {
    this.bb = blackboard;
    this.log = createModuleLogger(blackboard.botName, 'Monitor');
    this._metricsInterval = null;
    this._lastProgressCheck = Date.now();
    this._lastProgressPos = null;
  }

  /**
   * Mulai interval monitor (metrics reporting).
   */
  start() {
    this._metricsInterval = setInterval(() => {
      this._reportMetrics();
    }, config.monitor.metricsIntervalMs);
    this.log.info('Monitor started');
  }

  /**
   * Hentikan monitor.
   */
  stop() {
    if (this._metricsInterval) {
      clearInterval(this._metricsInterval);
      this._metricsInterval = null;
    }
  }

  /**
   * Cek anomali — dipanggil tiap tick.
   */
  tick(currentPos) {
    this._checkStuckAnomaly(currentPos);
  }

  /**
   * Deteksi bot stuck (diam terlalu lama tanpa progress).
   */
  _checkStuckAnomaly(currentPos) {
    const now = Date.now();
    const stuckTimeout = config.monitor.anomalyStuckMs;

    if (currentPos && this._lastProgressPos) {
      const moved = currentPos.distanceTo(this._lastProgressPos) > 1;
      const taskChanged = this.bb.tasks.lastProgressTime > this._lastProgressCheck;

      if (moved || taskChanged) {
        this._lastProgressPos = currentPos.clone ? currentPos.clone() : { ...currentPos };
        this._lastProgressCheck = now;
        return;
      }
    } else if (currentPos) {
      this._lastProgressPos = currentPos.clone ? currentPos.clone() : { ...currentPos };
      this._lastProgressCheck = now;
      return;
    }

    if (now - this._lastProgressCheck > stuckTimeout) {
      this.log.warn('ANOMALY: Bot appears stuck', {
        duration: Math.round((now - this._lastProgressCheck) / 1000) + 's',
        goalId: this.bb.tasks.current?.goalId,
        macroState: this.bb.tasks.current?.goalId,
      });
      // Reset timer agar tidak spam
      this._lastProgressCheck = now;
    }
  }

  /**
   * Cetak ringkasan metrik ke log.
   */
  _reportMetrics() {
    const stats = this.bb.stats;
    const sessionDurationMin = Math.round((Date.now() - stats.sessionStart) / 60000);

    const successEntries = Object.entries(stats.successByType)
      .map(([k, v]) => `${k}:${v}`).join(', ') || 'none';
    const failEntries = Object.entries(stats.failByType)
      .map(([k, v]) => `${k}:${v}`).join(', ') || 'none';

    this.log.info('=== METRICS REPORT ===', {
      sessionMin: sessionDurationMin,
      success: successEntries,
      failures: failEntries,
      deposits: stats.depositsMade,
      sells: stats.sellsMade,
      consecutiveFailures: this.bb.recovery.consecutiveFailures,
    });

    // Peringatkan jika failure rate tinggi
    for (const [goalId, failCount] of Object.entries(stats.failByType)) {
      const successCount = stats.successByType[goalId] || 0;
      const total = successCount + failCount;
      if (total >= 5 && failCount / total > 0.6) {
        this.log.warn('HIGH FAILURE RATE detected', {
          goalId,
          failRate: `${Math.round(failCount / total * 100)}%`,
        });
      }
    }
  }

  /**
   * Catat event penting (dipanggil oleh modul lain).
   */
  logEvent(event, data = {}) {
    this.log.info(`EVENT: ${event}`, data);
  }
}

module.exports = Monitor;
