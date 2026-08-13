'use strict';

const Vec3 = require('vec3').Vec3;
const { createModuleLogger } = require('../../utils/logger');
const { sleep } = require('../../utils/retry');

const log = createModuleLogger('StoneFarm');

/**
 * StoneFarm (Farm3) — Dedicated AFK Stone & Cobblestone Generator Miner.
 * - Menambang khusus 'stone' & 'cobblestone' di depan generator.
 * - Non-blocking digging: Tidak membatalkan animasi mengayunkan pickaxe.
 * - Perlindungan Durabilitas: Berhenti / ganti pickaxe saat sisa durabilitas <= 6.
 * - Deposit Otomatis: Menaruh stone/cobblestone ke chest terdekat saat inventory penuh.
 */
class StoneFarm {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../movement/Pathfinder')} pathfinder
   * @param {import('../chat/ChatQueue')} chatQueue
   * @param {import('../../core/BotManager')} [botManager]
   */
  constructor(bot, pathfinder, chatQueue, botManager = null) {
    this.bot = bot;
    this.pathfinder = pathfinder;
    this.chatQueue = chatQueue;
    this.botManager = botManager;
    this.isActive = false;
    this.isProcessing = false;
    this._loopInterval = null;
    this._lastDurabilityWarnTime = 0;
  }

  /**
   * Mulai mode Farm3 (AFK Stone Miner)
   */
  start() {
    if (this.isActive) return;
    this.isActive = true;

    // Matikan modul GuardMode dan Farm lain agar tidak membajak bot saat menambang batu
    if (this.botManager) {
      const { guardMode, mobFarm, cropFarm } = this.botManager.getModules();
      if (guardMode) guardMode.stop();
      if (mobFarm) mobFarm.stop();
      if (cropFarm) cropFarm.stop();
    }

    log.success('StoneFarm (Farm3: AFK Stone/Cobblestone Miner) aktif');
    if (this.chatQueue) this.chatQueue.send('⛏️ StoneFarm (Farm3: AFK Stone Generator) dimulai!');

    this._loopInterval = setInterval(() => {
      this._mineLoop().catch((err) => {
        log.debug(`StoneFarm loop error: ${err.message}`);
      });
    }, 250);
  }

  /**
   * Hentikan mode Farm3
   */
  stop() {
    if (!this.isActive) return;
    this.isActive = false;
    if (this._loopInterval) {
      clearInterval(this._loopInterval);
      this._loopInterval = null;
    }
    if (this.bot.targetDigBlock) {
      this.bot.stopDigging().catch(() => {});
    }
    log.info('StoneFarm (Farm3) dihentikan');
  }

  /**
   * Loop penambangan Stone & Cobblestone
   * @private
   */
  async _mineLoop() {
    if (!this.isActive || this.isProcessing || !this.bot.entity) return;
    if (this.botManager && this.botManager.isBusy) return;

    // Jika bot sedang dalam proses menambang (targetDigBlock aktif), biarkan dig berjalan hingga hancur
    if (this.bot.targetDigBlock) return;

    // 1. Cek jika inventory penuh / banyak membawa batu, deposit ke chest
    if (this._shouldDepositInventory()) {
      await this._depositStoneToChest();
      return;
    }

    this.isProcessing = true;

    try {
      // 2. Equip Pickaxe yang aman (Durabilitas > 6)
      const equipped = await this._equipBestSafePickaxe();
      if (!equipped) {
        const now = Date.now();
        if (now - this._lastDurabilityWarnTime > 30000) {
          this._lastDurabilityWarnTime = now;
          log.warn(`[StoneFarm Durability Safety] Tidak ada Pickaxe layak (sisa durabilitas <= 6). Menghentikan penambangan.`);
          if (this.chatQueue) this.chatQueue.send(`⚠️ ${this.bot.username}: Pickaxe ketahanan kritis/habis! Menambang dihentikan untuk mencegah pickaxe patah.`);
        }
        this.stop();
        return;
      }

      // 3. Cari blok stone / cobblestone generator di depan bot
      const targetBlock = this._findTargetStoneBlock();

      if (targetBlock && targetBlock.position) {
        const currentBlock = this.bot.blockAt(targetBlock.position);
        if (currentBlock && (currentBlock.name === 'stone' || currentBlock.name === 'cobblestone')) {
          // Menengok lurus ke tengah blok generator
          const targetCenter = targetBlock.position.offset(0.5, 0.5, 0.5);
          await this.bot.lookAt(targetCenter).catch(() => {});

          if (this.bot.canDigBlock(currentBlock)) {
            log.info(`[StoneFarm] Menambang ${currentBlock.name} di ${currentBlock.position}...`);
            await this.bot.dig(currentBlock).catch((err) => {
              log.debug(`Dig error: ${err.message}`);
            });
            await sleep(50);
          } else {
            this.bot.swingArm('hand');
          }
        }
      }
    } catch (err) {
      log.debug(`StoneFarm loop warning: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Cari khusus blok Stone / Cobblestone generator yang berada DI DEPAN atau SEPARUH DADA BOT (Jarak <= 4m).
   * EXCLUDE total blok di bawah kaki bot agar bot tidak menambang lantai pijakannya sendiri!
   * @private
   * @returns {import('prismarine-block').Block|null}
   */
  _findTargetStoneBlock() {
    if (!this.bot.entity || !this.bot.entity.position) return null;

    const botPos = this.bot.entity.position;
    const feetY = Math.floor(botPos.y);

    return this.bot.findBlock({
      matching: (block) => {
        if (!block || !block.position || !block.name) return false;
        const name = block.name.toLowerCase();
        if (name !== 'stone' && name !== 'cobblestone') return false;

        // Safely check block.position.y
        if (typeof block.position.y !== 'number') return false;

        // PROTEKSI PIJAKAN: Abaikan semua blok yang berada di bawah lantai pijakan kaki bot
        if (block.position.y < feetY) return false;

        // Abaikan blok tempat bot berdiri persis (kaki/badan)
        if (Math.floor(block.position.x) === Math.floor(botPos.x) &&
            Math.floor(block.position.z) === Math.floor(botPos.z) &&
            Math.floor(block.position.y) <= feetY) {
          return false;
        }

        return true;
      },
      maxDistance: 4
    });
  }

  /**
   * Equip pickaxe terbaik dengan sisa durabilitas aman (> 6) dari inventory.
   * @private
   * @returns {Promise<boolean>} True jika pickaxe aman berhasil di-equip
   */
  async _equipBestSafePickaxe() {
    const items = this.bot.inventory.items();
    const pickaxes = items.filter(i => {
      if (!i || !i.name || !i.name.includes('pickaxe')) return false;

      const regItem = this.bot.registry?.itemsByName?.[i.name] || this.bot.registry?.items?.[i.type];
      const maxDurability = (regItem && typeof regItem.maxDurability === 'number')
        ? regItem.maxDurability
        : (typeof i.maxDurability === 'number' ? i.maxDurability : 156);

      const durabilityUsed = (typeof i.durabilityUsed === 'number' && i.durabilityUsed >= 0)
        ? i.durabilityUsed
        : (i.nbt?.value?.Damage?.value || 0);

      const remaining = maxDurability - durabilityUsed;
      return remaining > 6;
    });

    if (pickaxes.length === 0) return false;

    const priority = ['netherite', 'diamond', 'iron', 'stone', 'wooden'];
    pickaxes.sort((a, b) => {
      const pA = priority.findIndex(p => a.name.includes(p));
      const pB = priority.findIndex(p => b.name.includes(p));
      return (pA === -1 ? 99 : pA) - (pB === -1 ? 99 : pB);
    });

    const bestPickaxe = pickaxes[0];
    const currentHeld = this.bot.heldItem;
    if (!currentHeld || currentHeld.name !== bestPickaxe.name) {
      await this.bot.equip(bestPickaxe, 'hand').catch(() => {});
    }
    return true;
  }

  /**
   * Cek apakah inventory bot sudah terisi banyak batu
   * @private
   */
  _shouldDepositInventory() {
    const items = this.bot.inventory.items();
    if (items.length >= 32) return true;

    let stoneCount = 0;
    for (const item of items) {
      if (item && (item.name === 'stone' || item.name === 'cobblestone')) {
        stoneCount += item.count;
      }
    }
    return stoneCount >= 128;
  }

  /**
   * Deposit hasil tambang batu ke chest/barrel terdekat
   * @private
   */
  async _depositStoneToChest() {
    let chestBlock = null;

    try {
      const { getSavedChests } = require('../../services/DataService');
      const savedChests = await getSavedChests();
      for (const c of savedChests) {
        const pos = new Vec3(c.x, c.y, c.z);
        const blk = this.bot.blockAt(pos);
        if (blk && (blk.name.includes('chest') || blk.name.includes('barrel'))) {
          chestBlock = blk;
          break;
        }
      }
    } catch (_e) {}

    if (!chestBlock && this.bot.entity) {
      chestBlock = this.bot.findBlock({
        matching: (block) => block && block.name && (block.name.includes('chest') || block.name.includes('barrel')),
        maxDistance: 5
      });
    }

    if (!chestBlock) return;

    log.info(`[StoneFarm Deposit] Menyimpan hasil tambang batu ke chest di ${chestBlock.position}...`);
    if (this.botManager) this.botManager.setBusy(true);

    try {
      const container = await this.bot.openContainer(chestBlock);
      await sleep(800);

      const startSlot = container.inventoryStart || 27;
      const endSlot = container.inventoryEnd || 63;
      let deposited = 0;

      for (let slot = startSlot; slot < endSlot; slot++) {
        const item = container.slots[slot];
        if (!item) continue;
        if (item.name === 'stone' || item.name === 'cobblestone') {
          const count = item.count;
          try {
            await this.bot.clickWindow(slot, 0, 1);
            await sleep(350);
            deposited += count;
          } catch (_e) {}
        }
      }

      container.close();
      log.success(`Deposit batu selesai (Total: ${deposited} item).`);
      if (this.chatQueue) this.chatQueue.send(`📦 ${this.bot.username}: Berhasil menyimpan ${deposited}x stone/cobblestone ke chest.`);
    } catch (err) {
      log.warn(`Gagal deposit batu ke chest: ${err.message}`);
    } finally {
      if (this.botManager) this.botManager.setBusy(false);
    }
  }
}

module.exports = StoneFarm;
