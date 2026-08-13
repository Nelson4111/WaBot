'use strict';

const { createModuleLogger } = require('../../utils/logger');
const { sleep } = require('../../utils/retry');
const Vec3 = require('vec3').Vec3;
const log = createModuleLogger('CropFarm');

/**
 * CropFarm (Farm2) mengotomatisasi pemanenan tanaman (wheat, carrots, potatoes, beetroots),
 * mengumpulkan item jatuh di ladang agar tidak berserakan,
 * membela diri dari mob termasuk Phantom di malam hari,
 * dan menyimpan hasil panen ke chest penampungan (!addchest) dengan teknik bottom-fill & auto-sortir.
 */
class CropFarm {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../movement/Pathfinder')} pathfinder
   * @param {import('./GuardMode')} guardMode
   * @param {import('../chat/ChatQueue')} chatQueue
   * @param {import('../../core/BotManager')} [botManager]
   */
  constructor(bot, pathfinder, guardMode, chatQueue, botManager = null) {
    this.bot = bot;
    this.pathfinder = pathfinder;
    this.guardMode = guardMode;
    this.chatQueue = chatQueue;
    this.botManager = botManager;
    this.isActive = false;
    this.chestPositions = []; // Daftar posisi Vec3 chest hasil panen
    this._loopInterval = null;
    this.isProcessing = false;
    this._lastChestWarnTime = 0;
  }

  /**
   * Registrasi posisi chest penampungan hasil panen.
   * @param {import('vec3').Vec3} pos
   * @returns {boolean}
   */
  addChest(pos) {
    if (!pos) return false;
    const exists = this.chestPositions.some(p => p.x === pos.x && p.y === pos.y && p.z === pos.z);
    if (!exists) {
      this.chestPositions.push(pos);
      log.info(`Chest penampungan panen ditambahkan: ${pos}`);
      const { saveChestLocation } = require('../../services/DataService');
      saveChestLocation(pos).catch(() => {});
      return true;
    }
    return false;
  }

  /**
   * Mulai mode farm (Panen & Tanam Tanaman Otomatis)
   */
  async start() {
    if (this.isActive) return;
    this.isActive = true;

    // Load chest terdaftar dari data/chests.json
    try {
      const { getSavedChests } = require('../../services/DataService');
      const savedChests = await getSavedChests();
      for (const c of savedChests) {
        const pos = new Vec3(c.x, c.y, c.z);
        if (!this.chestPositions.some(p => p.x === pos.x && p.y === pos.y && p.z === pos.z)) {
          this.chestPositions.push(pos);
        }
      }
    } catch (_e) {}

    log.success('CropFarm (Panen & Tanam Otomatis) aktif');
    if (this.chatQueue) this.chatQueue.send('CropFarm (Panen & Tanam Tanaman) dimulai!');

    this._loopInterval = setInterval(() => {
      this._farmLoop().catch((err) => {
        log.debug(`CropFarm loop error: ${err.message}`);
      });
    }, 1200);
  }

  /**
   * Hentikan mode farm2
   */
  stop() {
    if (!this.isActive) return;
    this.isActive = false;
    if (this._loopInterval) {
      clearInterval(this._loopInterval);
      this._loopInterval = null;
    }
    log.info('CropFarm (Farm2) dihentikan');
  }

  /**
   * Loop utama pemanenan tanaman matang secara batch queue sekuensial (Hyper-Responsive)
   * @private
   */
  async _farmLoop() {
    if (!this.isActive || this.isProcessing || !this.bot.entity) return;
    if (this.botManager && this.botManager.isBusy) return;

    // 1. Cek pertahanan terhadap Phantom / Mob Terbang di malam hari
    await this._checkAndDefendPhantoms();

    // 2. Cek jika inventory penuh (34+ slot terisi), lakukan deposit ke chest terdaftar
    if (this._isInventoryFull()) {
      await this._depositCropsToChests();
      return;
    }

    this.isProcessing = true;

    try {
      // 3. Batch Queue Pemanenan Tanaman Matang
      const matureCrops = this._findAllMatureCrops();

      if (matureCrops.length > 0) {
        log.info(`[Crop Queue] Ditemukan antrean ${matureCrops.length} tanaman matang! Memproses panen sekuensial...`);

        // Proses antrean panen hingga 8 tanaman per batch cycle tanpa jeda berat
        for (const cropBlock of matureCrops.slice(0, 8)) {
          if (!this.isActive || !this.bot.entity) break;

          const currentBlock = this.bot.blockAt(cropBlock.position);
          if (!currentBlock || (!currentBlock.name.includes('wheat') && !currentBlock.name.includes('carrot') && !currentBlock.name.includes('potato') && !currentBlock.name.includes('beetroot'))) {
            continue;
          }

          const dist = this.bot.entity.position.distanceTo(cropBlock.position);

          // Jika jarak dekat (<= 2.5m), panen LANGSUNG tanpa panggil pathfinder A* (Hyper-Responsive)
          if (dist > 2.5) {
            await this.pathfinder.goto(cropBlock.position.x, cropBlock.position.z, cropBlock.position.y, 1.5).catch(() => {});
            await sleep(150);
          } else {
            // Cukup menengok ke tanaman
            await this.bot.lookAt(cropBlock.position.offset(0.5, 0.5, 0.5), true).catch(() => {});
          }

          // Dig & Replant
          await this.bot.dig(currentBlock).catch(() => {});
          await sleep(200);
          await this._replantSeed(cropBlock.position, currentBlock.name);
          await sleep(150);
        }

        // Pungut hasil panen yang jatuh setelah batch panen selesai
        await this._collectCropItemsInField();
      } else {
        // 4. Jika tidak ada tanaman matang, cek apakah ada lahan farmland kosong yang bisa ditanami benih
        const emptyFarmland = this._findEmptyFarmland();
        if (emptyFarmland && this._hasSeedsInInventory()) {
          log.info(`Ditemukan lahan farmland kosong di ${emptyFarmland.position}, menanam benih...`);
          const targetPos = emptyFarmland.position.offset(0, 1, 0);
          const dist = this.bot.entity.position.distanceTo(targetPos);
          if (dist > 2.5) {
            await this.pathfinder.goto(targetPos.x, targetPos.z, targetPos.y, 1.5).catch(() => {});
            await sleep(150);
          }
          await this._replantSeed(targetPos, 'wheat');
          await sleep(200);
        } else if (this._hasCropsInInventory() && this.chestPositions.length > 0) {
          // 5. Deposit hasil panen ke chest terdaftar
          await this._depositCropsToChests();
        } else {
          // 6. Sapu bersih item panen jatuh yang tersisa di ladang
          await this._collectCropItemsInField();
        }
      }
    } catch (err) {
      log.warn(`CropFarm loop warning: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Pungut hasil panen yang jatuh di lantai sekitar agar ladang tetap bersih
   * @private
   */
  async _collectCropItemsInField() {
    if (!this.bot.entity) return;
    const cropKeywords = ['wheat', 'carrot', 'potato', 'beetroot', 'seed'];

    const droppedItems = Object.values(this.bot.entities).filter(entity => {
      if (!entity || !entity.position) return false;
      const isItem = entity.type === 'item' || entity.type === 'object' || (entity.name && entity.name.toLowerCase().includes('item'));
      if (!isItem) return false;

      const dist = entity.position.distanceTo(this.bot.entity.position);
      return dist <= 6;
    });

    for (const itemEntity of droppedItems.slice(0, 3)) {
      if (!this.isActive) break;
      const dist = itemEntity.position.distanceTo(this.bot.entity.position);
      if (dist > 1.2 && !this.pathfinder.isMoving) {
        await this.pathfinder.goto(itemEntity.position.x, itemEntity.position.z, itemEntity.position.y, 0.8).catch(() => {});
        await sleep(300);
      }
    }
  }

  /**
   * Deteksi dan lawan Phantom / Mob Terbang di malam hari jika masuk jangkauan serangan
   * @private
   */
  async _checkAndDefendPhantoms() {
    if (!this.bot.entity || !this.bot.pvp) return;

    const nearbyPhantoms = Object.values(this.bot.entities).filter(entity => {
      if (!entity || !entity.position) return false;
      const name = (entity.name || entity.displayName || '').toLowerCase();
      if (!name.includes('phantom')) return false;

      const dist = entity.position.distanceTo(this.bot.entity.position);
      return dist <= 5; // Jangkauan menukik Phantom
    });

    if (nearbyPhantoms.length > 0) {
      const phantom = nearbyPhantoms[0];
      log.warn(`Phantom terdeteksi di atas bot (jarak: ${phantom.position.distanceTo(this.bot.entity.position).toFixed(1)}m)! Membela diri...`);
      try {
        await this.bot.lookAt(phantom.position.offset(0, 1.6, 0), true);
        const bestSword = this.bot.inventory.items().find(i => i && i.name.includes('sword'));
        if (bestSword) await this.bot.equip(bestSword, 'hand').catch(() => {});
        this.bot.attack(phantom);
        await sleep(500);
      } catch (_e) {}
    }
  }

  /**
   * Cari SELURUH tanaman matang di sekitar bot dalam radius 16 blok,
   * lalu diurutkan berdasarkan jarak terdekat dari posisi bot.
   * @private
   * @returns {Array<import('prismarine-block').Block>}
   */
  _findAllMatureCrops() {
    if (!this.bot.entity) return [];
    
    const crops = this.bot.findBlocks({
      matching: (block) => {
        if (!block || !block.name) return false;
        const name = block.name.toLowerCase();

        let age = -1;
        if (block._properties && block._properties.age !== undefined) {
          age = parseInt(block._properties.age, 10);
        } else if (typeof block.getProperties === 'function') {
          const props = block.getProperties();
          if (props && props.age !== undefined) age = parseInt(props.age, 10);
        }
        if (isNaN(age) || age === -1) {
          if (typeof block.metadata === 'number' && block.metadata >= 0 && block.metadata <= 7) {
            age = block.metadata;
          }
        }

        if (name === 'wheat' && age === 7) return true;
        if ((name === 'carrots' || name === 'carrot') && age === 7) return true;
        if ((name === 'potatoes' || name === 'potato') && age === 7) return true;
        if ((name === 'beetroots' || name === 'beetroot') && age === 3) return true;
        return false;
      },
      maxDistance: 16,
      count: 32
    });

    const botPos = this.bot.entity.position;
    return crops
      .map(pos => this.bot.blockAt(pos))
      .filter(b => b)
      .sort((a, b) => a.position.distanceTo(botPos) - b.position.distanceTo(botPos));
  }

  /**
   * Alias kompatibilitas
   */
  _findMatureCrop() {
    const crops = this._findAllMatureCrops();
    return crops.length > 0 ? crops[0] : null;
  }

  /**
   * Temukan lahan farmland kosong untuk ditanami benih
   * @private
   */
  _findEmptyFarmland() {
    return this.bot.findBlock({
      matching: (block) => {
        if (!block || !block.name || !block.name.toLowerCase().includes('farmland')) return false;
        const aboveBlock = this.bot.blockAt(block.position.offset(0, 1, 0));
        return aboveBlock && (aboveBlock.name === 'air' || aboveBlock.name === 'cave_air');
      },
      maxDistance: 24
    });
  }

  _hasSeedsInInventory() {
    const seedKeywords = ['wheat_seeds', 'seeds', 'carrot', 'potato', 'beetroot_seeds'];
    return this.bot.inventory.items().some(i => i && seedKeywords.some(kw => i.name.toLowerCase().includes(kw)));
  }

  /**
   * Tanam kembali benih di lahan farmland
   * @private
   */
  async _replantSeed(pos, cropName) {
    const seedMap = {
      'wheat': ['wheat_seeds', 'seeds'],
      'carrots': ['carrot', 'carrots'],
      'carrot': ['carrot', 'carrots'],
      'potatoes': ['potato', 'potatoes'],
      'potato': ['potato', 'potatoes'],
      'beetroots': ['beetroot_seeds', 'beetroot'],
      'beetroot': ['beetroot_seeds', 'beetroot']
    };

    const targetSeedNames = seedMap[cropName] || ['wheat_seeds', 'carrot', 'potato', 'beetroot_seeds'];
    const items = this.bot.inventory.items();
    const seedItem = items.find(i => i && targetSeedNames.some(s => i.name.toLowerCase().includes(s)));

    if (!seedItem) {
      log.warn(`Tidak ada benih untuk ${cropName} di inventory`);
      return;
    }

    let farmland = this.bot.blockAt(pos.offset(0, -1, 0));
    if (!farmland || !farmland.name.includes('farmland')) {
      farmland = this.bot.blockAt(pos);
    }
    if (!farmland || !farmland.name.includes('farmland')) return;

    try {
      await this.bot.equip(seedItem, 'hand');
      await this.bot.placeBlock(farmland, new Vec3(0, 1, 0)).catch(() => {});
      log.debug(`Berhasil menanam kembali ${seedItem.name} di ${pos}`);
    } catch (_e) {}
  }

  /**
   * Cek apakah inventory bot penuh
   * @private
   */
  _isInventoryFull() {
    return this.bot.inventory.items().length >= 34;
  }

  /**
   * Cek apakah ada hasil panen di inventory
   * @private
   */
  _hasCropsInInventory() {
    const cropKeywords = ['wheat', 'carrot', 'potato', 'beetroot', 'seeds'];
    return this.bot.inventory.items().some(i => i && cropKeywords.some(kw => i.name.toLowerCase().includes(kw)));
  }

  /**
   * Deposit hasil panen ke chest penampungan terdaftar (Bottom-Fill & Auto-Sortir, TANPA DIJUAL)
   * @private
   */
  async _depositCropsToChests() {
    if (this.chestPositions.length === 0) {
      const now = Date.now();
      if (now - this._lastChestWarnTime > 60000) {
        this._lastChestWarnTime = now;
        log.warn('Belum ada chest terdaftar (berdiri di dekat chest lalu ketik !addchest)');
      }
      return;
    }

    if (this.botManager) this.botManager.setBusy(true);

    try {
      for (const chestPos of this.chestPositions) {
        const block = this.bot.blockAt(chestPos);
        if (!block || !block.name.includes('chest')) continue;

        log.info(`Menuju chest penampungan panen di ${chestPos}...`);
        await this.pathfinder.goto(chestPos.x, chestPos.z, chestPos.y, 1.5).catch(() => {});
        await sleep(600);

        try {
          const container = await this.bot.openContainer(block);
          await sleep(1000);

          const cropKeywords = ['wheat', 'carrot', 'potato', 'beetroot', 'seeds'];
          let depositedCount = 0;

          // Shift-click item panen dari inventory ke container
          const startSlot = container.inventoryStart || 27;
          const endSlot = container.inventoryEnd || 63;

          for (let slot = startSlot; slot < endSlot; slot++) {
            const itemInSlot = container.slots[slot];
            if (!itemInSlot) continue;
            const isCrop = cropKeywords.some(kw => itemInSlot.name.toLowerCase().includes(kw));
            if (!isCrop) continue;

            const countBefore = itemInSlot.count;
            try {
              await this.bot.clickWindow(slot, 0, 1);
              await sleep(400);

              const itemAfter = container.slots[slot];
              if (!itemAfter || itemAfter.count < countBefore) {
                const moved = countBefore - (itemAfter ? itemAfter.count : 0);
                depositedCount += moved;
              }
            } catch (_err) {}
          }

          container.close();
          log.success(`Deposit hasil panen ke chest ${chestPos} selesai (Total: ${depositedCount} item).`);
          if (this.chatQueue) this.chatQueue.send(`Berhasil menaruh hasil panen ke chest ${chestPos.x}, ${chestPos.y}, ${chestPos.z}.`);
          break; // Selesai deposit 1 chest
        } catch (err) {
          log.warn(`Gagal buka chest ${chestPos}: ${err.message}`);
        }
      }
    } finally {
      if (this.botManager) this.botManager.setBusy(false);
    }
  }
}

module.exports = CropFarm;
