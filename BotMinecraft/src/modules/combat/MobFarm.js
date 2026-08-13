'use strict';

const { createModuleLogger } = require('../../utils/logger');
const config = require('../../config');
const { getWaypoint } = require('../../services/DataService');
const { incrementStat } = require('../../services/DataService');
const { sleep } = require('../../utils/retry');

const log = createModuleLogger('MobFarm');

/**
 * MobFarm mengautomasi proses di mob grinder:
 * 1. Pergi ke waypoint 'farm' (atau waypoint custom)
 * 2. Aktifkan guard mode untuk membunuh mob
 * 3. Secara periodik kumpulkan item/loot di sekitar
 * 4. Cek inventory, jika penuh atau capai limit pearl, lakukan autosell.
 *
 * Alur:
 * start() → goto farm waypoint → activate guard → collect loot loop + autosell
 */
class MobFarm {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('./Pathfinder')} pathfinder
   * @param {import('./GuardMode')} guardMode
   * @param {import('./chat/ChatQueue')} chatQueue
   */
  constructor(bot, pathfinder, guardMode, chatQueue, botManager = null) {
    this.bot = bot;
    this.pathfinder = pathfinder;
    this.guardMode = guardMode;
    this.chatQueue = chatQueue;
    this.botManager = botManager;
    this.isActive = false;
    this.isSelling = false;
    this._lootInterval = null;
    this._farmPosition = null;
    this.activeWaypointName = null;
  }

  /**
   * Mulai mode farming.
   * Bot akan pergi ke waypoint farm, lalu mulai guard + loot collection + auto sell.
   *
   * @param {string|null} customWaypointName - Nama waypoint opsional (misal: 'farmenderman')
   * @returns {Promise<boolean>}
   */
  async start(customWaypointName = null) {
    if (this.isActive) {
      log.warn('Farm mode sudah aktif');
      return true;
    }

    const { getWaypoint, getWaypoints } = require('../../services/DataService');

    let targetName = customWaypointName || config.farm.waypointName || 'farm';
    let waypoint = await getWaypoint(targetName);

    // Auto-detect: Jika waypoint 'farm' tidak ada, cari waypoint yang mengandung 'farm' (misal: 'farmenderman')
    if (!waypoint && !customWaypointName) {
      const allWaypoints = await getWaypoints();
      const match = Object.keys(allWaypoints).find((k) => k.includes('farm'));
      if (match) {
        targetName = match;
        waypoint = allWaypoints[match];
        log.info(`Otomatis mendeteksi waypoint '${targetName}' untuk farming.`);
      }
    }

    if (!waypoint) {
      log.warn(`Waypoint '${targetName}' tidak ditemukan.`);
      return false;
    }

    this.isActive = true;
    this.isSelling = false;
    this._farmPosition = waypoint;
    this.activeWaypointName = targetName;

    log.success(
      `Farm mode dimulai. Menuju waypoint '${targetName}' di X:${waypoint.x} Y:${waypoint.y} Z:${waypoint.z}`
    );
    if (this.chatQueue) this.chatQueue.send(`Farming dimulai. Menuju waypoint '${targetName}'.`);

    try {
      // Navigasi ke farm
      await this.pathfinder.goto(waypoint.x, waypoint.z, waypoint.y);
      log.success(`Sampai di '${targetName}'. Mengaktifkan guard mode & auto sell...`);

      // Aktifkan guard
      this.guardMode.start();

      // Mulai loot collection
      this._startLootCollection();

      log.success('Farm mode berjalan. Guard + loot collection + auto sell aktif.');
      return true;
    } catch (err) {
      log.error(`Gagal navigasi ke farm: ${err.message}`);
      if (this.chatQueue) this.chatQueue.send(`Gagal ke farm: ${err.message}`);
      this.stop();
      return false;
    }
  }

  /**
   * Hentikan mode farming.
   *
   * @returns {void}
   */
  stop() {
    if (!this.isActive) return;

    this.isActive = false;
    this._stopLootCollection();

    // Stop guard mode jika sedang aktif karena farm
    if (this.guardMode.isActive) {
      this.guardMode.stop();
    }

    // Stop navigasi jika sedang berjalan
    if (this.pathfinder.isMoving) {
      this.pathfinder.stop();
    }

    this._farmPosition = null;
    this.activeWaypointName = null;
    this.isSelling = false;
    log.info('Farm mode dihentikan');
  }

  /**
   * Toggle farm mode.
   *
   * @param {string|null} customWaypointName
   * @returns {Promise<boolean>} Status baru (true if active)
   */
  async toggle(customWaypointName = null) {
    if (this.isActive) {
      this.stop();
      return false;
    } else {
      return await this.start(customWaypointName);
    }
  }

  /**
   * Mulai loop pengumpulan loot.
   * Setiap N ms, bot akan bergerak ke item di dekatnya dan memungutnya.
   *
   * @private
   */
  _startLootCollection() {
    this._lootInterval = setInterval(async () => {
      if (!this.isActive || this.isSelling) return;
      await this._collectNearbyItems().catch((err) => {
        log.debug(`Error saat collect loot: ${err.message}`);
      });
    }, config.farm.lootIntervalMs);
  }

  /**
   * Hentikan loop pengumpulan loot.
   *
   * @private
   */
  _stopLootCollection() {
    if (this._lootInterval) {
      clearInterval(this._lootInterval);
      this._lootInterval = null;
    }
  }

  /**
   * Cek inventory dan lakukan sell jika memenuhi syarat.
   */
  async _checkInventoryAndSell() {
    if (!config.farm.autoSell?.enabled) return;
    if (!this.bot.inventory) return;

    const items = this.bot.inventory.items();
    const isFull = items.length >= 36; // Default MC inventory is 36 (hotbar + main)

    // Hitung Ender Pearl
    const pearls = items.filter((item) => item.name === 'ender_pearl');
    let totalPearls = 0;
    for (const p of pearls) {
      totalPearls += p.count;
    }
    const pearlStacks = Math.floor(totalPearls / 16);

    const triggerFull = config.farm.autoSell.triggerOnFullInventory && isFull;
    const triggerStacks = pearlStacks >= config.farm.autoSell.triggerAtStacks;

    // Tambahkan cooldown 10 detik agar tidak spam sell jika inventory penuh dengan item yang tidak bisa dijual
    const now = Date.now();
    if (!this._lastSellTime) this._lastSellTime = 0;

    if ((triggerFull || triggerStacks) && (now - this._lastSellTime > 10000)) {
      log.info(`AutoSell Triggered. Full: ${isFull}, Pearl Stacks: ${pearlStacks}`);
      this.isSelling = true;
      this._lastSellTime = now;

      // 1. Pause Guard mode
      if (this.guardMode.isActive) this.guardMode.stop();
      if (this.pathfinder.isMoving) this.pathfinder.stop();

      // 2. Jalankan command sell
      const sellCommand = config.farm.autoSell.command || '/sellall ENDER_PEARL';
      this.bot.chat(sellCommand);
      
      // Tunggu server memproses sell
      await sleep(2000);

      // 3. Verifikasi
      const newPearls = this.bot.inventory.items().filter((item) => item.name === 'ender_pearl');
      let newTotalPearls = 0;
      for (const p of newPearls) {
        newTotalPearls += p.count;
      }

      if (newTotalPearls < totalPearls) {
        log.success('Auto Sell berhasil.');
        if (this.chatQueue) this.chatQueue.send('Auto Sell berhasil.');
      } else {
        log.warn('Auto Sell dijalankan tetapi jumlah pearl tidak berkurang.');
      }

      // 4. Kembali ke farm pos jika melenceng jauh
      if (this._farmPosition && this.bot.entity) {
        const dist = this.bot.entity.position.distanceTo({
          x: this._farmPosition.x,
          y: this._farmPosition.y,
          z: this._farmPosition.z
        });
        if (dist > 3) {
            log.info('Kembali ke farm waypoint...');
            await this.pathfinder.goto(this._farmPosition.x, this._farmPosition.z, this._farmPosition.y).catch(() => {});
        }
      }

      // 5. Resume
      this.isSelling = false;
      if (this.isActive) {
        this.guardMode.start();
      }
    }
  }

  /**
   * Kumpulkan item yang ada di dekat bot.
   * Bot tidak perlu berjalan jauh — hanya item dalam radius kecil.
   *
   * @private
   */
  async _collectNearbyItems() {
    if (!this.bot.entity) return;
    
    // Cek inventory sebelum mengumpulkan loot lagi
    await this._checkInventoryAndSell();
    if (this.isSelling) return; // Jika lagi sell, stop collecting

    // Cek jika ada buku enchant di inventory saat MobFarm (farm1) yang perlu disimpan ke Shulker Box
    const autoEnchant = this.botManager?.getModules()?.autoEnchantManager;
    if (autoEnchant && typeof autoEnchant._depositToNearestShulker === 'function') {
      const items = this.bot.inventory.items();
      const hasBooks = items.some(i => {
        if (!i || !i.name) return false;
        const n = i.name.toLowerCase();
        const customName = (i.customName ? JSON.stringify(i.customName) : '').toLowerCase();
        const nbtData = (i.nbt ? JSON.stringify(i.nbt) : '').toLowerCase();
        return n.includes('book') || n.includes('paper') || customName.includes('enchant') || nbtData.includes('enchant');
      });

      if (hasBooks && !autoEnchant.isProcessing) {
        log.info('Ditemukan buku enchant di inventory saat MobFarm (farm1). Menyiapkan penyerahan ke Shulker Box...');
        if (this.guardMode.isActive) this.guardMode.stop();
        if (this.pathfinder.isMoving) this.pathfinder.stop();

        await sleep(1000);
        await autoEnchant._depositToNearestShulker().catch(() => {});
        await sleep(1000);

        if (this.isActive && !this.guardMode.isActive) this.guardMode.start();
      }
    }

    const lootRadius = config.farm.lootRadius || 5;
    const nearbyItems = Object.values(this.bot.entities).filter((entity) => {
      if (!entity || !entity.position) return false;
      const mobName = (entity.name || entity.displayName || '').toLowerCase();
      const isItem = mobName.includes('item') || entity.type === 'item' || entity.type === 'object';
      if (!isItem) return false;

      const dist = entity.position.distanceTo(this.bot.entity.position);
      return dist <= lootRadius;
    });

    if (nearbyItems.length === 0) return;

    log.debug(`Ditemukan ${nearbyItems.length} item di sekitar, mengumpulkan...`);
    let moved = false;

    for (const item of nearbyItems.slice(0, 3)) {
      if (!this.isActive || this.isSelling) break;

      try {
        if (item.position && this._farmPosition) {
          const distFromFarm = item.position.distanceTo({
            x: this._farmPosition.x,
            y: this._farmPosition.y,
            z: this._farmPosition.z,
          });

          if (distFromFarm > lootRadius * 1.5) continue;
        }

        const distToItem = item.position.distanceTo(this.bot.entity.position);
        if (distToItem > 1.5 && !this.pathfinder.isMoving) {
          // Berjalan mendekati item hanya jika belum sedang berjalan
          moved = true;
          await this.pathfinder.goto(item.position.x, item.position.z, item.position.y, 1).catch(() => {});
        }

        await incrementStat('totalItemsLooted').catch(() => {});
        await sleep(200);
      } catch (_err) {
        // Silent — loot collection tidak perlu crash
      }
    }

    // Jika bot sempat berpindah posisi untuk mengambil item, kembalikan ke farm waypoint dengan aman
    if (moved && this._farmPosition && this.isActive && !this.isSelling) {
      const distToFarm = this.bot.entity.position.distanceTo({
        x: this._farmPosition.x,
        y: this._farmPosition.y,
        z: this._farmPosition.z,
      });

      if (distToFarm > 2.5 && !this.pathfinder.isMoving) {
        await this.pathfinder.goto(this._farmPosition.x, this._farmPosition.z, this._farmPosition.y, 1).catch(() => {});
      }
    }
  }
}

module.exports = MobFarm;
