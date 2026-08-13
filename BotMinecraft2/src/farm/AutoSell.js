'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const TaskPlanner = require('../core/TaskPlanner');
const { MACRO_STATE } = require('../core/DecisionEngine');
const { scoreDistance, scoreItemValue, computeUtility } = require('../utils/UtilityScorer');
const { sleep } = require('../utils/Humanizer');

/**
 * AutoSell.js — Modul Auto Sell via EconomyShopGUI Premium.
 *
 * ASUMSI & BATASAN:
 *   - Bersaing via Utility scoring (bukan trigger terpisah "inventory penuh → jual semua").
 *   - Barang langka (dari config.farm.protectedItems) tidak di-auto-sell.
 *   - Validasi hasil dari saldo aktual (chat saldo atau inventory) setelah transaksi.
 *   - Sell command: /sell all (konfigurabel di config.farm.sellCommand).
 *   - Titik jual: posisi NPC/sign sell (diset via !setsellpoint di runtime).
 */
class AutoSell {
  constructor(bot, blackboard, decisionEngine, taskPlanner, inventoryManager) {
    this.bot = bot;
    this.bb = blackboard;
    this.decision = decisionEngine;
    this.planner = taskPlanner;
    this.inv = inventoryManager;
    this.log = createModuleLogger(blackboard.botName, 'AutoSell');

    this.GOAL_ID = 'auto_sell';
    this._sellPointPos = null; // Set via !setsellpoint command
    this._register();
  }

  _register() {
    this.decision.registerGoal(
      this.GOAL_ID,
      (bb, inv) => this._score(bb, inv),
      { macroState: MACRO_STATE.SELLING },
    );
    this.planner.registerGoal(
      this.GOAL_ID,
      (params, bb, bot, inv) => this._buildPlan(params, bb, bot, inv),
    );
    this.log.info('AutoSell registered');
  }

  /**
   * Set posisi sell point dari runtime command.
   */
  setSellPoint(pos) {
    this._sellPointPos = pos;
    this.log.info('Sell point set', { pos });
  }

  _score(bb, inv) {
    if (!inv.shouldSell()) return 0;

    const distToSell = (this._sellPointPos && bb.self.pos)
      ? this._sellPointPos.distanceTo(bb.self.pos)
      : 0;

    let totalValue = 0;
    for (const [itemName, count] of Object.entries(bb.inventory.counts)) {
      if (inv.isProtected(itemName)) continue;
      if (config.farm.highValueItems.includes(itemName)) totalValue += count * 10;
      else totalValue += count;
    }

    if (totalValue === 0) return 0;

    return computeUtility([
      { score: scoreItemValue(1, totalValue, 300), weight: 0.50 },
      { score: scoreDistance(distToSell, 80), weight: 0.20 },
      { score: inv.getUsedPercent(), weight: 0.30 },
    ]);
  }

  _buildPlan(params, bb, bot, inv) {
    const steps = [];

    if (this._sellPointPos) {
      steps.push(TaskPlanner.stepMoveTo(this._sellPointPos, { range: 3 }));
      steps.push(TaskPlanner.stepLookAt(this._sellPointPos));
      steps.push(TaskPlanner.stepWait(500));
    }

    steps.push(TaskPlanner.stepCommand(config.farm.sellCommand || '/sellgui'));
    steps.push({ type: 'HANDLE_SELL_GUI' });
    steps.push(TaskPlanner.stepWait(config.farm.sellConfirmWaitMs || 2000));
    steps.push({ type: 'VERIFY_SELL' });

    return steps;
  }

  /**
   * Handle interaksi jika command /sellgui membuka GUI container.
   */
  async handleSellGui() {
    await sleep(800);

    const window = this.bot.currentWindow;
    if (!window) {
      this.log.debug('No GUI container opened for /sellgui, assuming instant command sell');
      return { success: true };
    }

    try {
      this.log.info('Sell GUI window opened', { title: window.title, slots: window.slots.length });

      const invStart = window.inventoryStart || 27;
      // Filter item di bagian inventory bot (slot >= invStart)
      const itemsInWindow = window.items().filter((i) => i && i.slot >= invStart);

      let shifted = 0;
      for (const item of itemsInWindow) {
        if (!item || !item.name) continue;
        if (this.inv.isProtected(item.name)) continue;

        try {
          // Shift-click item dari inventory bot ke container /sellgui (mode 1 = shift-click)
          await this.bot.clickWindow(item.slot, 0, 1);
          shifted++;
          await sleep(150);
        } catch (err) {
          this.log.debug('Failed to shift-click item into /sellgui', { item: item.name, error: err.message });
        }
      }

      this.log.info(`Shift-clicked ${shifted} item stacks into /sellgui`);
      await sleep(400);

      // Cari slot tombol confirm/jual jika ada di bagian GUI (slot < invStart)
      const confirmSlot = window.slots.find((slot) => {
        if (!slot || slot.slot >= invStart) return false;
        const name = (slot.name || '').toLowerCase();
        const displayName = (slot.displayName || '').toLowerCase();
        return name.includes('confirm') || displayName.includes('confirm') ||
               displayName.includes('sell') || displayName.includes('jual');
      });

      if (confirmSlot) {
        this.log.info('Clicking confirm button in /sellgui', { slot: confirmSlot.slot });
        await this.bot.clickWindow(confirmSlot.slot, 0, 0);
        await sleep(300);
      }

      // Tutup container GUI
      try { this.bot.closeWindow(window); } catch (_) {}
      return { success: true };
    } catch (err) {
      this.log.warn('Error handling Sell GUI', { error: err.message });
      try { this.bot.closeWindow(window); } catch (_) {}
      return { success: false, error: err.message };
    }
  }

  /**
   * Verifikasi hasil sell dari chat server.
   */
  async verifySell() {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.bot.removeListener('message', onMessage);
        this.log.warn('Sell verification timeout');
        resolve(false);
      }, config.farm.sellConfirmWaitMs);

      const onMessage = (jsonMsg) => {
        const msg = jsonMsg.toString().toLowerCase();
        if (msg.includes('sold') || msg.includes('terjual') || msg.includes('berhasil') || msg.includes('$')) {
          clearTimeout(timeout);
          this.bot.removeListener('message', onMessage);
          this.bb.farm.sell.lastSellTime = Date.now();
          this.bb.farm.sell.sellCount++;
          this.bb.stats.sellsMade++;
          this.log.info('Sell confirmed via chat');
          resolve(true);
        }
      };

      this.bot.on('message', onMessage);
    });
  }
}

module.exports = AutoSell;
