'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const { sleep } = require('../utils/Humanizer');

/**
 * RecoverySystem.js — Layer 8: Framework generik penanganan kegagalan.
 *
 * KONTRAK BLACKBOARD:
 *   Baca : BB.recovery, BB.tasks.contextStack
 *   Tulis: BB.recovery (failureLog, retryCount, isInRecovery)
 *          BB.stats (failByType)
 *
 * Dipanggil dari SEMUA layer saat kegagalan — tidak ada exception mentah
 * yang boleh keluar dari sistem.
 *
 * Alur:
 *   handle(error, context)
 *     → klasifikasi error (TRANSIENT | STRUCTURAL | FATAL)
 *     → retry dengan exponential backoff (jika TRANSIENT, belum melebihi maxRetries)
 *     → cari strategi alternatif (jika STRUCTURAL)
 *     → fallback ganti goal (jika semua alternatif habis)
 *     → Recovery Mode — disconnect + restart (jika FATAL / sistemik)
 */

const ERROR_TYPE = Object.freeze({
  TRANSIENT: 'TRANSIENT',   // Sesaat: lag, timeout, chest closed
  STRUCTURAL: 'STRUCTURAL', // Struktural: path terblokir permanen, chest penuh
  FATAL: 'FATAL',           // Fatal: disconnect berulang, null bot
});

class RecoverySystem {
  constructor(bot, blackboard, decisionEngineRef) {
    this.bot = bot;
    this.bb = blackboard;
    this.log = createModuleLogger(blackboard.botName, 'Recovery');
    // Referensi ke DecisionEngine untuk trigger re-evaluate setelah recovery
    this._decisionEngine = decisionEngineRef || null;
    this._onFatalCallback = null;
  }

  /** Set callback saat fatal error (biasanya: trigger reconnect) */
  onFatal(cb) {
    this._onFatalCallback = cb;
  }

  /**
   * Entry point utama. Dipanggil dari mana saja.
   * @param {Error|string} error
   * @param {object} context - { source, taskId, goalId, extraInfo }
   * @returns {Promise<{type, action, shouldRetry}>}
   */
  async handle(error, context = {}) {
    const { source = 'unknown', taskId = 'unknown', goalId = 'unknown' } = context;
    const errMsg = error?.message || String(error);

    this.log.warn('Recovery triggered', { source, taskId, goalId, error: errMsg });

    const errorType = this._classify(errMsg, context);
    const entry = this.bb.logFailure(source, errorType, error);
    this.bb.recordFailure(goalId);

    switch (errorType) {
      case ERROR_TYPE.TRANSIENT:
        return await this._handleTransient(context, entry);

      case ERROR_TYPE.STRUCTURAL:
        return await this._handleStructural(context, entry);

      case ERROR_TYPE.FATAL:
        return await this._handleFatal(context, entry);

      default:
        return { type: errorType, action: 'SKIP', shouldRetry: false };
    }
  }

  /**
   * Klasifikasi error berdasarkan pesan dan konteks.
   */
  _classify(errMsg, context) {
    const msg = errMsg.toLowerCase();

    // Fatal: bot null, disconnect berulang
    if (msg.includes('bot is null') || msg.includes('socket closed') ||
        msg.includes('end of stream') || msg.includes('connection reset')) {
      if (this.bb.recovery.consecutiveFailures >= 5) return ERROR_TYPE.FATAL;
      return ERROR_TYPE.TRANSIENT;
    }

    // Fatal: server kick / ban
    if (msg.includes('you have been banned') || msg.includes('kicked') &&
        msg.includes('permanently')) {
      return ERROR_TYPE.FATAL;
    }

    // Structural: path blocked, chest full
    if (msg.includes('path') && (msg.includes('block') || msg.includes('unreachable'))) {
      return ERROR_TYPE.STRUCTURAL;
    }
    if (msg.includes('chest') && msg.includes('full')) {
      return ERROR_TYPE.STRUCTURAL;
    }
    if (msg.includes('claim') || msg.includes('protected') || msg.includes('permission')) {
      return ERROR_TYPE.STRUCTURAL;
    }

    // Transient: timeout, timeout GUI, lag
    if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('lag') ||
        msg.includes('not found') || msg.includes('null') || msg.includes('undefined')) {
      return ERROR_TYPE.TRANSIENT;
    }

    // Default ke transient
    return ERROR_TYPE.TRANSIENT;
  }

  /**
   * Handle error sementara — retry dengan exponential backoff.
   */
  async _handleTransient(context, entry) {
    const { taskId = 'unknown' } = context;
    const maxRetries = config.recovery.maxRetries;
    const retryCount = this.bb.incrementRetry(taskId);

    if (retryCount > maxRetries) {
      this.log.warn('Max retries exceeded, escalating to STRUCTURAL', { taskId, retryCount });
      return await this._handleStructural(context, entry);
    }

    const backoff = Math.min(
      config.recovery.backoffBaseMs * Math.pow(config.recovery.backoffMultiplier, retryCount - 1),
      config.recovery.backoffMaxMs,
    );

    this.log.info(`Retry ${retryCount}/${maxRetries} in ${backoff}ms`, { taskId });
    await sleep(backoff);

    return { type: ERROR_TYPE.TRANSIENT, action: 'RETRY', shouldRetry: true, retryCount };
  }

  /**
   * Handle error struktural — cari alternatif, jika tidak ada ganti goal.
   */
  async _handleStructural(context, entry) {
    const { goalId = 'unknown', alternatives = [] } = context;

    if (alternatives.length > 0) {
      const alt = alternatives[0];
      this.log.info('Trying alternative strategy', { goalId, alternative: alt });
      this.bb.resetRetry(alt);
      return { type: ERROR_TYPE.STRUCTURAL, action: 'ALTERNATIVE', alternative: alt, shouldRetry: false };
    }

    // Tidak ada alternatif — fallback ke goal lain via DecisionEngine
    this.log.warn('No alternatives, falling back goal', { goalId });
    this.bb.recovery.isInRecovery = true;
    this.bb.recovery.recoveryStartTime = Date.now();

    // Reset current task
    this.bb.tasks.current = null;
    this.bb.tasks.plan = [];
    this.bb.tasks.currentStep = 0;
    this.bb.resetRetry(goalId);

    return { type: ERROR_TYPE.STRUCTURAL, action: 'FALLBACK_GOAL', shouldRetry: false };
  }

  /**
   * Handle fatal error — log dan trigger reconnect.
   */
  async _handleFatal(context, entry) {
    this.log.error('FATAL error — triggering reconnect/restart', context);
    this.bb.recovery.isInRecovery = true;

    if (this._onFatalCallback) {
      try {
        await this._onFatalCallback(context, entry);
      } catch (_) { /* ignore */ }
    }

    return { type: ERROR_TYPE.FATAL, action: 'RECONNECT', shouldRetry: false };
  }

  /**
   * Tandai recovery selesai (dipanggil setelah kondisi kembali normal).
   */
  markRecovered(goalId) {
    this.bb.recovery.isInRecovery = false;
    this.bb.recovery.recoveryStartTime = null;
    this.bb.recovery.consecutiveFailures = 0;
    if (goalId) this.bb.resetRetry(goalId);
    this.log.info('Recovery completed', { goalId });
  }
}

module.exports = { RecoverySystem, ERROR_TYPE };
