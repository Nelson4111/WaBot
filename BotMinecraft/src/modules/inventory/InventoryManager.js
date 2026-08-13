'use strict';

const { createModuleLogger } = require('../../utils/logger');
const config = require('../../config');
const { sleep } = require('../../utils/retry');

const log = createModuleLogger('InventoryManager');

/**
 * InventoryManager menangani:
 * - Auto Equip Weapon terbaik (Netherite > Diamond > Iron ...)
 * - Auto Drop Trash (membuang item yang tidak berguna)
 * - Helper untuk melempar/memberikan item ke owner (Give Pearl, dll)
 * - Helper penghitungan isi inventory
 */
class InventoryManager {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../chat/ChatQueue')} chatQueue
   */
  constructor(bot, chatQueue) {
    this.bot = bot;
    this.chatQueue = chatQueue;
    this._autoDropInterval = null;
    this.isActive = false;
  }

  /**
   * Mulai listener dan interval auto drop.
   */
  start() {
    if (this.isActive) return;
    this.isActive = true;

    // Listen to spawn (login)
    this.bot.on('spawn', this._onSpawn.bind(this));

    // Mulai auto drop interval
    this._autoDropInterval = setInterval(() => {
      this.dropTrash();
    }, config.inventory.autoDropIntervalMs || 120000);

    // Mulai periodic auto-equip armor & weapon interval (setiap 5 detik, tanpa spam)
    this._autoEquipInterval = setInterval(() => {
      if (this.isActive && !this.bot.isEating) {
        this._checkAndEquipEquipment().catch(() => {});
      }
    }, 5000);

    log.info('InventoryManager aktif');
  }

  /**
   * Berhenti.
   */
  stop() {
    this.isActive = false;
    if (this._autoDropInterval) {
      clearInterval(this._autoDropInterval);
      this._autoDropInterval = null;
    }
    if (this._autoEquipInterval) {
      clearInterval(this._autoEquipInterval);
      this._autoEquipInterval = null;
    }
  }

  async _onSpawn() {
    await sleep(2000); // Tunggu inventory sinkron dengan server
    await this._checkAndEquipEquipment();
  }

  /**
   * Cek dan pakai equipment (pedang + armor) terbaik di inventory.
   * @private
   */
  async _checkAndEquipEquipment() {
    await this._checkAndEquipWeapon();
    await this._checkAndEquipArmor();
  }

  /**
   * Cari pedang/senjata terbaik di inventory dan equip ke tangan utama.
   *
   * @private
   */
  async _checkAndEquipWeapon() {
    if (!this.bot.inventory || !this.isActive) return;
    if (this.bot.isEating || (typeof this.bot.usingItem === 'boolean' && this.bot.usingItem)) return;

    // Jika tangan kiri (off-hand / slot 45) memegang pedang, unequip tangan kiri dulu
    const offHandItem = this.bot.inventory.slots[45];
    if (offHandItem && offHandItem.name.toLowerCase().includes('sword')) {
      try {
        await this.bot.unequip('off-hand');
      } catch (_e) {}
    }

    const items = this.bot.inventory.items();
    const priorities = config.inventory.swordPriority || ['netherite_sword', 'diamond_sword', 'iron_sword', 'stone_sword', 'wooden_sword'];

    let bestWeapon = null;
    let bestScore = -1;

    for (const item of items) {
      if (!item) continue;
      const index = priorities.indexOf(item.name);
      if (index !== -1) {
        const score = priorities.length - index;
        if (score > bestScore) {
          bestScore = score;
          bestWeapon = item;
        }
      }
    }

    if (!bestWeapon) return;

    const heldItem = this.bot.heldItem;
    if (!heldItem || heldItem.name !== bestWeapon.name) {
      try {
        await this.bot.equip(bestWeapon, 'hand');
        log.info(`Mengganti Sword: ${bestWeapon.name}`);
      } catch (_err) {
        log.warn(`Gagal equip weapon: ${_err.message}`);
      }
    }
  }

  /**
   * Cari armor terbaik (Helmet, Chestplate, Leggings, Boots) dan pakai otomatis.
   * Prioritas: Netherite > Diamond > Iron > Chainmail > Gold > Leather
   * @private
   */
  async _checkAndEquipArmor() {
    if (!this.bot.inventory || !this.isActive) return;
    if (this.bot.isEating || (typeof this.bot.usingItem === 'boolean' && this.bot.usingItem)) return;

    // Slot armor Mineflayer: 5 (head), 6 (torso), 7 (legs), 8 (feet)
    const armorSlotsMap = {
      helmet: { destination: 'head', slot: 5, keywords: ['helmet', 'cap', 'head', 'skull', 'crown'] },
      torso: { destination: 'torso', slot: 6, keywords: ['chestplate', 'tunic', 'chest', 'elytra'] },
      legs: { destination: 'legs', slot: 7, keywords: ['leggings', 'pants'] },
      feet: { destination: 'feet', slot: 8, keywords: ['boots', 'shoes'] }
    };

    const armorPriority = ['netherite', 'diamond', 'iron', 'chainmail', 'golden', 'gold', 'leather'];

    const getArmorScore = (item) => {
      if (!item || !item.name) return 0;
      const n = item.name.toLowerCase();
      for (let i = 0; i < armorPriority.length; i++) {
        if (n.includes(armorPriority[i])) return armorPriority.length - i;
      }
      return 1;
    };

    const items = this.bot.inventory.items();

    for (const [armorKey, info] of Object.entries(armorSlotsMap)) {
      const keywords = info.keywords;
      const equippedItem = this.bot.inventory.slots[info.slot];
      const currentScore = equippedItem ? getArmorScore(equippedItem) : 0;

      const candidates = items.filter(item => {
        if (!item || !item.name) return false;
        const n = item.name.toLowerCase();
        const customName = (item.customName ? JSON.stringify(item.customName) : '').toLowerCase();
        const displayName = (item.displayName || '').toLowerCase();
        return keywords.some(kw => n.includes(kw) || customName.includes(kw) || displayName.includes(kw));
      });

      if (candidates.length === 0) continue;

      candidates.sort((a, b) => getArmorScore(b) - getArmorScore(a));
      const bestArmor = candidates[0];
      const bestScore = getArmorScore(bestArmor);

      // Hanya memakai jika armor di inventory LEBIH BAIK daripada armor yang sedang dipakai (atau slot kosong)
      if (!equippedItem || bestScore > currentScore) {
        try {
          await this.bot.equip(bestArmor, info.destination);
          log.info(`Auto-Equip Armor (${info.destination}): ${bestArmor.name}`);
        } catch (_err) {
          // Silent
        }
      }
    }
  }

  /**
   * Buang semua item sampah yang ada di konfigurasi trashItems.
   */
  async dropTrash() {
    if (!this.bot.inventory) return;

    const trashNames = config.inventory.trashItems || [];
    if (trashNames.length === 0) return;

    const items = this.bot.inventory.items();
    let droppedCount = 0;

    for (const item of items) {
      if (trashNames.includes(item.name)) {
        try {
          await this.bot.tossStack(item);
          droppedCount += item.count;
          log.info(`Membuang ${item.name} (${item.count}x)`);
          await sleep(500);
        } catch (err) {
          log.warn(`Gagal membuang ${item.name}: ${err.message}`);
        }
      }
    }

    if (droppedCount > 0 && this.chatQueue) {
      this.chatQueue.send(`Berhasil membuang ${droppedCount} item sampah.`);
    }
  }

  /**
   * Buang item spesifik (give to owner/Nelson41111).
   * Mendukung alias (pearl, makanan, pedang, dll) dan pencarian parsial.
   * Menggunakan perulangan dinamis agar SELURUH item/stack yang diminta terlempar penuh!
   * @param {string} searchKeyword 
   * @param {string} [targetPlayerUsername]
   */
  async dropItemByName(searchKeyword, targetPlayerUsername = null) {
    if (!this.bot.inventory) return 0;
    
    const kw = searchKeyword.toLowerCase().trim();
    let totalDropped = 0;

    while (true) {
      const items = this.bot.inventory.items();
      let targetItem = null;

      for (const i of items) {
        if (!i) continue;
        const name = (i.name || '').toLowerCase();
        const customName = (i.customName ? JSON.stringify(i.customName) : '').toLowerCase();
        const displayName = (i.displayName || '').toLowerCase();
        const nbtData = (i.nbt ? JSON.stringify(i.nbt) : '').toLowerCase();

        if (kw === 'pearl' || kw === 'ender_pearl') {
          if (name === 'ender_pearl') { targetItem = i; break; }
        } else if (kw === 'makanan' || kw === 'food' || kw === 'makan') {
          const FOOD_NAMES = ['cooked_beef', 'steak', 'cooked_porkchop', 'cooked_chicken', 'bread', 'baked_potato', 'golden_apple', 'apple', 'golden_carrot'];
          if ((i.foodPoints !== undefined && i.foodPoints > 0) || FOOD_NAMES.includes(name) || name.includes('cooked') || name.includes('bread')) { targetItem = i; break; }
        } else if (kw === 'pedang' || kw === 'sword') {
          if (name.includes('sword')) { targetItem = i; break; }
        } else if (kw === 'buku' || kw === 'book' || kw === 'enchant' || kw === 'enchanted_book' || kw === 'bukunya') {
          if (name.includes('book') || name.includes('enchant') || name.includes('paper') ||
              customName.includes('book') || customName.includes('enchant') || customName.includes('buku') ||
              displayName.includes('book') || displayName.includes('enchant') || displayName.includes('buku') ||
              nbtData.includes('enchant') || nbtData.includes('customenchants')) { targetItem = i; break; }
        } else {
          if (name.includes(kw) || customName.includes(kw) || displayName.includes(kw) || nbtData.includes(kw)) { targetItem = i; break; }
        }
      }

      if (!targetItem) break;

      try {
        const countBefore = targetItem.count;

        // Tatap wajah/tubuh player target sebelum melempar agar barang melayang tepat ke posisi player
        if (targetPlayerUsername && this.bot.entities) {
          const targetEntity = Object.values(this.bot.entities).find(
            e => e && e.type === 'player' && e.username && e.username.toLowerCase() === targetPlayerUsername.toLowerCase()
          );
          if (targetEntity && targetEntity.position) {
            await this.bot.lookAt(targetEntity.position.offset(0, 1.2, 0), true).catch(() => {});
            await sleep(200);
          }
        }

        await this.bot.tossStack(targetItem);
        totalDropped += countBefore;
        await sleep(350);
      } catch (err) {
        log.warn(`Peringatan tossStack ${targetItem.name}: ${err.message}`);
        break;
      }
    }

    return totalDropped;
  }

  /**
   * Drop seluruh item inventory (kosongkan inventory ke owner).
   * Jika ignoreProtection=true, buang SEMUA item termasuk pedang/armor/pearl.
   * @param {boolean} [ignoreProtection=false]
   * @param {string} [targetPlayerUsername]
   */
  async dropAll(ignoreProtection = false, targetPlayerUsername = null) {
    if (!this.bot.inventory) return 0;

    const protectedKeywords = config.inventory.protectedItems || ['sword', 'armor', 'food', 'totem'];
    let totalDropped = 0;

    while (true) {
      const items = this.bot.inventory.items();
      let targetItem = null;

      for (const item of items) {
        if (!item) continue;
        if (!ignoreProtection) {
          const isProtected = protectedKeywords.some(kw => item.name.toLowerCase().includes(kw.toLowerCase()));
          if (isProtected) continue;
        }
        targetItem = item;
        break;
      }

      if (!targetItem) break;

      try {
        const countBefore = targetItem.count;

        if (targetPlayerUsername && this.bot.entities) {
          const targetEntity = Object.values(this.bot.entities).find(
            e => e && e.type === 'player' && e.username && e.username.toLowerCase() === targetPlayerUsername.toLowerCase()
          );
          if (targetEntity && targetEntity.position) {
            await this.bot.lookAt(targetEntity.position.offset(0, 1.2, 0), true).catch(() => {});
            await sleep(200);
          }
        }

        await this.bot.tossStack(targetItem);
        totalDropped += countBefore;
        await sleep(350);
      } catch (err) {
        log.warn(`Peringatan tossAll ${targetItem.name}: ${err.message}`);
        break;
      }
    }

    return totalDropped;
  }

  /**
   * Analisis inventory
   */
  getSummary() {
    if (!this.bot.inventory) return null;

    const items = this.bot.inventory.items();
    let pearlCount = 0;
    let foodCount = 0;
    let swordCount = 0;

    for (const item of items) {
      if (item.name === 'ender_pearl') pearlCount += item.count;
      else if (item.foodPoints) foodCount += item.count;
      else if (item.name.includes('sword')) swordCount += item.count;
    }

    const emptySlots = 36 - items.length; // Perkiraan kasaran slot kosong

    return {
      pearlCount,
      foodCount,
      swordCount,
      emptySlots
    };
  }
}

module.exports = InventoryManager;
