'use strict';

const { createModuleLogger } = require('../../utils/logger');
const { sleep } = require('../../utils/retry');

const log = createModuleLogger('AutoRespawn');

/** Delay sebelum respawn (ms) — cukup waktu untuk melihat death screen */
const RESPAWN_DELAY_MS = 2000;

/** Delay sebelum mulai aktivitas normal lagi setelah respawn (ms) */
const POST_RESPAWN_DELAY_MS = 3000;

/**
 * AutoRespawn secara otomatis me-respawn bot setelah mati.
 * Setelah respawn, memberikan delay singkat sebelum bot melanjutkan aktivitas.
 */
class AutoRespawn {
  /**
   * @param {import('mineflayer').Bot} bot
   */
  constructor(bot, botManager) {
    this.bot = bot;
    this.botManager = botManager;
    this.isActive = false;
    this._deathListener = null;
  }

  /**
   * Aktifkan auto-respawn.
   *
   * @returns {void}
   */
  start() {
    this._deathListener = async () => {
      const deathPos = this.bot.entity?.position ? this.bot.entity.position.clone() : null;
      log.warn(`Bot mati. Respawn dalam ${RESPAWN_DELAY_MS / 1000}s...`);
      await sleep(RESPAWN_DELAY_MS);

      try {
        this.bot.respawn();
        log.success('Bot berhasil respawn');
        await sleep(POST_RESPAWN_DELAY_MS);

        log.info('Mengirim perintah /back otomatis...');
        this.bot.chat('/back');

        // Ambil barang dari Grave (jongkok + klik kanan grave block)
        await this._recoverGrave(deathPos);

        log.info('Bot siap kembali beraktivitas');
      } catch (err) {
        log.error(`Gagal respawn: ${err.message}`);
      }
    };

    this.bot.on('death', this._deathListener);
    this.isActive = true;
    log.info('AutoRespawn aktif');
  }

  /**
   * Mengambil kembali item dari Grave (Gravesx plugin) dengan jongkok + klik kanan.
   * @private
   */
  async _recoverGrave(deathPos) {
    if (!this.bot.entity) return;

    log.info('Mencoba mengambil barang dari Grave (Gravesx)...');
    await sleep(2000); // Jeda setelah /back teleport

    // Jongkok (sneak)
    this.bot.setControlState('sneak', true);
    await sleep(500);

    try {
      // Cari Grave block atau player head / chest / block di sekitar lokasi death
      let graveBlock = this.bot.findBlock({
        matching: (block) => {
          if (!block || !block.name) return false;
          const name = block.name.toLowerCase();
          return name.includes('grave') || name.includes('head') || name.includes('skull') || name.includes('chest');
        },
        maxDistance: 4,
      });

      if (!graveBlock) {
        // Fallback: block di bawah posisi bot saat ini
        graveBlock = this.bot.blockAt(this.bot.entity.position.offset(0, -1, 0)) ||
                     this.bot.blockAt(this.bot.entity.position);
      }

      if (graveBlock) {
        log.info(`Klik kanan Grave block (${graveBlock.name}) sambil jongkok...`);
        await this.bot.lookAt(graveBlock.position, true).catch(() => {});
        await this.bot.activateBlock(graveBlock).catch(() => {});
        await sleep(1000);
      }
    } catch (err) {
      log.warn(`Gagal mengambil grave: ${err.message}`);
    } finally {
      this.bot.setControlState('sneak', false);
      log.success('Proses klaim Grave selesai');
      if (this.botManager && typeof this.botManager.resumeActiveTask === 'function') {
        this.botManager.resumeActiveTask();
      }
    }
  }

  /**
   * Hentikan auto-respawn.
   *
   * @returns {void}
   */
  stop() {
    if (this._deathListener) {
      this.bot.removeListener('death', this._deathListener);
      this._deathListener = null;
    }
    this.isActive = false;
    log.info('AutoRespawn dihentikan');
  }
}

module.exports = AutoRespawn;
