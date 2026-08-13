'use strict';
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');
const { waitHumanized, lookHumanized, facePositionHumanized, sleep, randBetween } = require('../utils/Humanizer');

/**
 * ActionExecutor.js — Layer 9: Satu-satunya lapisan yang mengirim input ke game.
 *
 * KONTRAK BLACKBOARD:
 *   Baca : BB.tasks.plan, BB.tasks.currentStep
 *   Tulis: BB.self (pos, yaw, pitch)
 *
 * WAJIB: Semua output melalui Humanization Layer sebelum dieksekusi.
 * WAJIB: Semua exception dibungkus sebagai status terstruktur.
 */
class ActionExecutor {
  constructor(bot, blackboard, recoverySystem) {
    this.bot = bot;
    this.bb = blackboard;
    this.recovery = recoverySystem;
    this.log = createModuleLogger(blackboard.botName, 'ActionExecutor');
    this._busy = false;
  }

  /**
   * Eksekusi langkah berikutnya dari plan saat ini.
   * @returns {{ status: 'DONE'|'RUNNING'|'FAILED', error?: string }}
   */
  async executePlanStep() {
    if (this._busy) return { status: 'RUNNING' };
    const plan = this.bb.tasks.plan;
    const step = this.bb.tasks.currentStep;
    if (!plan || step >= plan.length) return { status: 'DONE' };

    const action = plan[step];
    if (!action) return { status: 'DONE' };

    this._busy = true;
    try {
      const result = await this._dispatch(action);
      if (result.status === 'DONE' || result.status === 'FAILED') {
        this.bb.tasks.currentStep++;
        this.bb.tasks.lastProgressTime = Date.now();
      }
      return result;
    } catch (err) {
      this.bb.tasks.currentStep++;
      this.log.warn('Plan step error', { step, action: action.type, error: err.message });
      return { status: 'FAILED', error: err.message };
    } finally {
      this._busy = false;
    }
  }

  /**
   * Dispatch ke handler berdasarkan action.type.
   */
  async _dispatch(action) {
    await waitHumanized(); // delay humanized sebelum SETIAP aksi

    switch (action.type) {
      case 'MOVE_TO':
        return await this.moveTo(action.pos, action.opts);
      case 'LOOK_AT':
        return await this.lookAt(action.pos || action.entity?.position);
      case 'ATTACK':
        return await this.attack(action.entity);
      case 'USE_ITEM':
        return await this.useItem(action.item);
      case 'DIG_BLOCK':
        return await this.digBlock(action.pos);
      case 'PLACE_BLOCK':
        return await this.placeBlock(action.pos, action.item, action.face);
      case 'OPEN_CHEST':
        return await this.openContainer(action.pos);
      case 'CLOSE_CONTAINER':
        return await this.closeContainer();
      case 'DEPOSIT_ITEM':
        return await this.depositItem(action.item, action.container, action.count);
      case 'WITHDRAW_ITEM':
        return await this.withdrawItem(action.item, action.container, action.count);
      case 'SEND_CHAT':
        return await this.sendChat(action.message);
      case 'SEND_COMMAND':
        return await this.sendCommand(action.command);
      case 'EQUIP':
        return await this.equip(action.item, action.destination);
      case 'TOSS_ITEM':
        return await this.tossItem(action.item, action.count);
      case 'WAIT':
        await sleep(action.ms || 500);
        return { status: 'DONE' };
      case 'FAST_CROP_HARVEST':
        return await this.fastCropHarvest(action.crops);
      case 'DEPOSIT_ALL_NON_PROTECTED':
        return await this.depositAllNonProtected();
      case 'IDLE_BEHAVIOR':
        return await this.idleBehavior();
      default:
        this.log.warn('Unknown action type', { type: action.type });
        return { status: 'FAILED', error: `Unknown action: ${action.type}` };
    }
  }

  /**
   * Gerakkan bot ke posisi target via MovementPlanner.
   */
  async moveTo(pos, opts = {}) {
    if (!pos) return { status: 'FAILED', error: 'No target position' };
    try {
      const { pathfinder } = this.bot;
      if (!pathfinder) return { status: 'FAILED', error: 'Pathfinder not loaded' };
      const { goals: { GoalNear } } = require('mineflayer-pathfinder');
      const range = opts.range || 2;
      const goal = new GoalNear(pos.x, pos.y, pos.z, range);
      this.bot.pathfinder.setGoal(goal);
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          try { this.bot.pathfinder.setGoal(null); } catch (_) {}
          reject(new Error('pathfinding timeout'));
        }, opts.timeoutMs || 1500);

        this.bot.once('goal_reached', () => { clearTimeout(timeout); resolve(); });
        this.bot.once('path_update', (r) => {
          if (r.status === 'noPath') {
            clearTimeout(timeout);
            try { this.bot.pathfinder.setGoal(null); } catch (_) {}
            reject(new Error('No path found'));
          }
        });
      });
      return { status: 'DONE' };
    } catch (err) {
      try { this.bot.pathfinder.setGoal(null); } catch (_) {}
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Hadapkan bot ke posisi secara humanized.
   */
  async lookAt(pos) {
    if (!pos) return { status: 'FAILED', error: 'No look position' };
    try {
      await facePositionHumanized(this.bot, pos);
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Serang entity (mob) dengan delay humanized.
   */
  async attack(entity) {
    if (!entity) return { status: 'FAILED', error: 'No entity to attack' };
    try {
      // Hadap dulu ke mob
      await facePositionHumanized(this.bot, entity.position);
      await waitHumanized();
      this.bot.attack(entity);
      // Cooldown humanized setelah attack
      const cooldown = randBetween(
        config.mobFarm.attackCooldownMs * 0.9,
        config.mobFarm.attackCooldownMs * 1.2,
      );
      await sleep(cooldown);
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Gunakan item di tangan.
   */
  async useItem(item) {
    try {
      if (item) await this.bot.equip(item, 'hand');
      await waitHumanized();
      await this.bot.consume();
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Gali blok di posisi tertentu.
   */
  async digBlock(pos) {
    if (!pos) return { status: 'FAILED', error: 'No dig position' };
    try {
      const block = this.bot.blockAt(pos);
      if (!block || block.name === 'air') return { status: 'DONE' };
      await this.bot.dig(block);
      await waitHumanized();
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Tempatkan blok.
   */
  async placeBlock(pos, item, face) {
    if (!pos) return { status: 'FAILED', error: 'No place position' };
    try {
      if (item) await this.bot.equip(item, 'hand');
      const refBlock = this.bot.blockAt(pos.offset(0, -1, 0));
      if (!refBlock) return { status: 'FAILED', error: 'No reference block below' };
      await waitHumanized();
      await this.bot.placeBlock(refBlock, face || { x: 0, y: 1, z: 0 });
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Buka container (chest, barrel, dll).
   */
  async openContainer(pos) {
    if (!pos) return { status: 'FAILED', error: 'No chest position' };
    try {
      const block = this.bot.blockAt(pos);
      if (!block) return { status: 'FAILED', error: 'Block not found at pos' };
      const chest = await Promise.race([
        this.bot.openContainer(block),
        new Promise((_, rej) => setTimeout(() => rej(new Error('open chest timeout')),
          config.chestDeposit.openTimeoutMs)),
      ]);
      this.bb._openContainer = chest;
      return { status: 'DONE', container: chest };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Tutup container yang sedang terbuka.
   */
  async closeContainer() {
    try {
      if (this.bb._openContainer) {
        this.bb._openContainer.close();
        this.bb._openContainer = null;
      }
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'DONE' }; // Ignore close errors
    }
  }

  /**
   * Deposit item ke container yang terbuka.
   */
  async depositItem(item, container, count) {
    if (!item || !container) return { status: 'FAILED', error: 'Missing item or container' };
    try {
      await waitHumanized();
      await container.deposit(item.type, null, count || item.count);
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Ambil item dari container.
   */
  async withdrawItem(item, container, count) {
    if (!item || !container) return { status: 'FAILED', error: 'Missing item or container' };
    try {
      await waitHumanized();
      await container.withdraw(item.type, null, count || item.count);
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Kirim chat publik (dengan humanized delay — gunakan hati-hati).
   */
  async sendChat(message) {
    try {
      await waitHumanized();
      this.bot.chat(message);
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Kirim command ke server.
   */
  async sendCommand(command) {
    try {
      await waitHumanized();
      this.bot.chat(command);
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Equip item ke slot tertentu.
   */
  async equip(item, destination = 'hand') {
    if (!item) return { status: 'FAILED', error: 'No item to equip' };
    try {
      await waitHumanized();
      await this.bot.equip(item, destination);
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Lempar item ke tanah.
   */
  async tossItem(item, count) {
    if (!item) return { status: 'FAILED', error: 'No item to toss' };
    try {
      await waitHumanized();
      await this.bot.toss(item.type, null, count || item.count);
      return { status: 'DONE' };
    } catch (err) {
      return { status: 'FAILED', error: err.message };
    }
  }

  /**
   * Idle behavior: sneak sekejap atau lihat-lihat (humanization filler).
   */
  async idleBehavior() {
    const behaviors = ['look', 'pause'];
    const choice = behaviors[Math.floor(Math.random() * behaviors.length)];

    try {
      switch (choice) {
        case 'look': {
          const randomYaw = (Math.random() - 0.5) * Math.PI;
          const randomPitch = (Math.random() - 0.5) * 0.5;
          await lookHumanized(this.bot,
            this.bot.entity.yaw + randomYaw,
            this.bot.entity.pitch + randomPitch);
          break;
        }
        case 'pause':
          await sleep(randBetween(300, 800));
          break;
      }
    } catch (_) { /* ignore */ }
    return { status: 'DONE' };
  }

  /**
   * Panen & replant crop secara batch ultra-cepat (high-speed farm).
   */
  async fastCropHarvest(crops) {
    if (!crops || crops.length === 0) return { status: 'DONE' };
    const { Vec3 } = require('vec3');

    for (const cropData of crops) {
      if (!cropData || !cropData.pos) continue;

      const block = this.bot.blockAt(cropData.pos);
      if (!block || block.name === 'air') continue;

      // 1. Simpan nama crop SEBELUM digali (sebelum berubah jadi 'air'!)
      const cropName = block.name;
      const cropDef = config.cropFarm.crops[cropName] || config.cropFarm.crops.wheat;
      const seedName = cropDef?.seedItem || 'wheat_seeds';

      // 2. Jika jarak bot ke crop > 3.0 blok, gerakan bot secara cepat & mulus
      const botPos = this.bot.entity?.position;
      if (botPos && cropData.pos.distanceTo(botPos) > 3.0) {
        try {
          await this.bot.lookAt(cropData.pos, true);
          this.bot.setControlState('forward', true);
          await sleep(200);
          this.bot.setControlState('forward', false);
        } catch (_) {}
      }

      try {
        await this.bot.lookAt(cropData.pos, true);

        // 3. Panen/gali crop instan
        await this.bot.dig(block, true);
        await sleep(30);

        // 4. Cari bibit/item tanam yang sesuai (carrot, potato, wheat_seeds, beetroot_seeds, nether_wart)
        const seedItem = this.bot.inventory.items().find(
          (i) => i && (i.name === seedName || i.name.includes(seedName) || seedName.includes(i.name)),
        );

        if (seedItem) {
          if (!this.bot.heldItem || this.bot.heldItem.name !== seedItem.name) {
            await this.bot.equip(seedItem, 'hand');
          }

          const basePos = cropData.pos.offset(0, -1, 0);
          const baseBlock = this.bot.blockAt(basePos);

          if (baseBlock && (baseBlock.name === 'farmland' || baseBlock.name === 'soul_sand')) {
            await this.bot.placeBlock(baseBlock, new Vec3(0, 1, 0));
            await sleep(30);
          }
        }
      } catch (err) {
        this.log.debug('Fast harvest single crop error', { error: err.message });
      }
    }

    return { status: 'DONE' };
  }

  /**
   * Shift-click semua item non-protected dari inventory bot ke container chest terbuka.
   */
  async depositAllNonProtected() {
    const container = this.bot.currentWindow;
    if (!container) return { status: 'FAILED', error: 'No container open' };

    const invStart = container.inventoryStart || 27;
    const itemsInWindow = container.items().filter((i) => i && i.slot >= invStart);

    let count = 0;
    for (const item of itemsInWindow) {
      if (!item || !item.name) continue;

      // Skip item protected (sword, armor, tools, food)
      if (this.bb && this.bb._invManager && this.bb._invManager.isProtected(item.name)) continue;

      try {
        // Mode 1 = Shift-Click item dari inventory bot ke chest container
        await this.bot.clickWindow(item.slot, 0, 1);
        count++;
        await sleep(120);
      } catch (err) {
        this.log.debug('Failed to deposit item to chest', { item: item.name, error: err.message });
      }
    }

    this.log.info(`Deposited ${count} item stacks into chest`);
    return { status: 'DONE' };
  }
}

module.exports = ActionExecutor;
