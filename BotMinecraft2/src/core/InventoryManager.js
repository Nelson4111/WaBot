'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');

/**
 * InventoryManager.js — Layer 7: Manajemen inventory prediktif.
 *
 * KONTRAK BLACKBOARD:
 *   Baca : BB.inventory (slots, counts)
 *   Tulis: BB.inventory (freeSlots, counts, criticalStock)
 *          BB.tasks constraints (jika stok kritis)
 *
 * Prediktif — tidak menunggu penuh sebelum bertindak.
 */
class InventoryManager {
  constructor(bot, blackboard) {
    this.bot = bot;
    this.bb = blackboard;
    this.log = createModuleLogger(blackboard.botName, 'Inventory');

    this._protectedSet = new Set(config.inventory.protectedItems);
    this._trashSet = new Set(config.inventory.trashItems);
    this._lastManageTime = 0;
  }

  /**
   * Update state inventory dari bot aktual. Dipanggil tiap tick.
   */
  tick() {
    try {
      this._updateInventoryState();
      this._updateCriticalStock();
      this._autoManage();
    } catch (err) {
      this.log.warn('Inventory tick error', { error: err.message });
    }
  }

  /**
   * Auto manage: Equip armor/weapon & Auto-eat.
   */
  _autoManage() {
    const now = Date.now();
    if (now - this._lastManageTime < 1500) return;
    this._lastManageTime = now;

    this.autoEat().catch(() => {});
    this.autoEquipEquipment().catch(() => {});
  }

  /**
   * Baca inventory bot dan update BB.inventory.
   */
  _updateInventoryState() {
    if (!this.bot.inventory) return;

    const items = this.bot.inventory.items();
    const counts = {};
    let usedSlots = 0;

    for (const item of items) {
      if (!item) continue;
      counts[item.name] = (counts[item.name] || 0) + item.count;
      usedSlots++;
    }

    const totalSlots = 36;
    const freeSlots = totalSlots - usedSlots;

    this.bb.inventory.slots = items;
    this.bb.inventory.counts = counts;
    this.bb.inventory.freeSlots = freeSlots;
    this.bb.inventory.totalSlots = totalSlots;
  }

  /**
   * Cek stok kritis (seed, food, tool durability).
   */
  _updateCriticalStock() {
    const counts = this.bb.inventory.counts;
    const critStock = this.bb.inventory.criticalStock;

    critStock.seeds = {};
    for (const [cropName, cropDef] of Object.entries(config.cropFarm.crops)) {
      const seedName = cropDef.seedItem;
      const seedCount = counts[seedName] || 0;
      if (seedCount < config.cropFarm.minSeedStock) {
        critStock.seeds[seedName] = seedCount;
      }
    }

    let totalFood = 0;
    for (const foodName of config.inventory.foodPriority) {
      totalFood += counts[foodName] || 0;
    }
    critStock.food = totalFood;
    critStock.toolCritical = this.bb.self.toolDurability <= config.mobFarm.toolDurabilityMinPercent;

    this._updateToolDurability();
  }

  _updateToolDurability() {
    const heldItem = this.bot.heldItem;
    if (!heldItem) {
      this.bb.self.toolDurability = 100;
      return;
    }
    const maxDurability = heldItem.maxDurability;
    if (!maxDurability || maxDurability <= 0) {
      this.bb.self.toolDurability = 100;
      return;
    }
    const durabilityLeft = maxDurability - (heldItem.durabilityUsed || 0);
    this.bb.self.toolDurability = Math.round((durabilityLeft / maxDurability) * 100);
  }

  shouldDeposit() {
    const usedPercent = 1 - this.bb.inventory.freeSlots / this.bb.inventory.totalSlots;
    return usedPercent >= config.farm.depositTriggerPercent;
  }

  /**
   * Apakah sell seharusnya di-trigger sekarang.
   */
  shouldSell() {
    if (!this.bot || !this.bot.inventory) return false;
    const freeSlots = this.bb.inventory.freeSlots;
    const totalSlots = this.bb.inventory.totalSlots || 36;
    const usedSlots = totalSlots - freeSlots;

    let sellableItemCount = 0;
    let sellableStacks = 0;

    for (const item of this.bot.inventory.items()) {
      if (!item) continue;
      if (this.isProtected(item.name)) continue;
      sellableItemCount += item.count;
      if (item.count >= 16) sellableStacks++;
    }

    if (sellableItemCount === 0) return false;

    return (
      sellableStacks >= (config.farm.sellTriggerStacks || 2) ||
      (freeSlots <= 8 && sellableItemCount > 0) ||
      (usedSlots >= 18 && sellableItemCount >= 32)
    );
  }

  hasSufficientFood() {
    return this.bb.inventory.criticalStock.food >= config.safety.foodCritical;
  }

  hasWorkingTool() {
    return this.bb.self.toolDurability > config.mobFarm.toolDurabilityMinPercent;
  }

  getBestFood() {
    if (!this.bot || !this.bot.inventory) return null;
    for (const foodName of config.inventory.foodPriority) {
      const item = this.bot.inventory.items().find((i) => i && i.name.includes(foodName));
      if (item) return item;
    }
    const commonFoods = ['apple', 'melon_slice', 'sweet_berries', 'cooked_cod', 'cooked_salmon', 'baked_potato', 'carrot'];
    for (const foodName of commonFoods) {
      const item = this.bot.inventory.items().find((i) => i && i.name.includes(foodName));
      if (item) return item;
    }
    return null;
  }

  getBestWeapon() {
    if (!this.bot || !this.bot.inventory) return null;
    const weapons = this.bot.inventory.items()
      .filter((i) => i && i.name && (i.name.includes('sword') || i.name.includes('axe')))
      .sort((a, b) => {
        const tier = { netherite: 5, diamond: 4, iron: 3, stone: 2, wooden: 1, gold: 1 };
        const aTier = Object.entries(tier).find(([k]) => a.name.includes(k))?.[1] || 0;
        const bTier = Object.entries(tier).find(([k]) => b.name.includes(k))?.[1] || 0;
        return bTier - aTier;
      });
    return weapons[0] || null;
  }

  /**
   * Auto-equip armor terbaik (head, torso, legs, feet).
   */
  async autoEquipEquipment() {
    if (!this.bot || !this.bot.inventory) return;

    const armorSlots = [
      { name: 'head', keyword: 'helmet' },
      { name: 'torso', keyword: 'chestplate' },
      { name: 'legs', keyword: 'leggings' },
      { name: 'feet', keyword: 'boots' },
    ];

    const tier = { netherite: 6, diamond: 5, iron: 4, chainmail: 3, golden: 2, leather: 1, turtle: 2, elytra: 5 };

    for (const { name: dest, keyword } of armorSlots) {
      const currentEq = this.bot.inventory.slots[this._getArmorSlotIndex(dest)];
      const candidates = this.bot.inventory.items().filter((i) =>
        i && (i.name.includes(keyword) || (keyword === 'chestplate' && i.name === 'elytra')),
      );

      if (candidates.length === 0) continue;

      candidates.sort((a, b) => {
        const aTier = Object.entries(tier).find(([k]) => a.name.includes(k))?.[1] || 0;
        const bTier = Object.entries(tier).find(([k]) => b.name.includes(k))?.[1] || 0;
        return bTier - aTier;
      });

      const best = candidates[0];
      if (best) {
        const bestTier = Object.entries(tier).find(([k]) => best.name.includes(k))?.[1] || 0;
        const currentTier = currentEq ? (Object.entries(tier).find(([k]) => currentEq.name.includes(k))?.[1] || 0) : 0;
        if (!currentEq || bestTier > currentTier) {
          try {
            await this.bot.equip(best, dest);
            this.log.info('Auto-equipped armor', { armor: best.name, destination: dest });
          } catch (_) {}
        }
      }
    }

    await this.autoEquipWeapon();
  }

  /**
   * Auto-equip senjata terbaik ke main hand.
   */
  async autoEquipWeapon() {
    if (!this.bot || !this.bot.inventory) return;
    const bestWeapon = this.getBestWeapon();
    if (!bestWeapon) return;

    const heldItem = this.bot.heldItem;
    if (!heldItem || heldItem.name !== bestWeapon.name) {
      try {
        await this.bot.equip(bestWeapon, 'hand');
        this.log.info('Auto-equipped weapon', { weapon: bestWeapon.name });
      } catch (_) {}
    }
  }

  /**
   * Auto-eat jika lapar (food < 18).
   */
  async autoEat() {
    if (!this.bot || this.bot.food === undefined) return;
    if (this.bot.food >= 18) return;

    const foodItem = this.getBestFood();
    if (!foodItem) return;

    try {
      this.log.info('Auto-eating food', { food: foodItem.name, foodLevel: this.bot.food });
      await this.bot.equip(foodItem, 'hand');
      this.bot.activateItem();
      await new Promise((r) => setTimeout(r, 1600));
      this.bot.deactivateItem();
      await this.autoEquipWeapon();
    } catch (_) {}
  }

  _getArmorSlotIndex(destination) {
    switch (destination) {
      case 'head': return 5;
      case 'torso': return 6;
      case 'legs': return 7;
      case 'feet': return 8;
      default: return 36;
    }
  }

  async dropTrash() {
    for (const item of this.bot.inventory.items()) {
      if (this._trashSet.has(item.name)) {
        try {
          await this.bot.toss(item.type, null, item.count);
          this.log.debug('Dropped trash', { item: item.name, count: item.count });
        } catch (_) { /* ignore */ }
      }
    }
  }

  getUsedPercent() {
    return 1 - this.bb.inventory.freeSlots / this.bb.inventory.totalSlots;
  }

  isProtected(itemName) {
    if (!itemName) return false;
    if (config.inventory.foodPriority.some((f) => itemName.includes(f))) return true;
    return this._protectedSet.has(itemName) ||
      config.farm.protectedItems.some((p) => itemName.includes(p));
  }
}

module.exports = InventoryManager;
