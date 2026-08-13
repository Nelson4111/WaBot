'use strict';

/**
 * Blackboard.js — Layer 3: Shared State untuk seluruh modul BotMinecraft2.
 *
 * KONTRAK:
 *   - Semua modul HANYA berkomunikasi melalui Blackboard (bukan pemanggilan langsung).
 *   - Tidak ada logika bisnis di sini — hanya state + helper getter/setter.
 *   - Tiap bot instance punya Blackboard-nya sendiri.
 *
 * STRUKTUR STATE:
 *   BB.self          → status diri bot (HP, food, posisi, tool, dll)
 *   BB.world         → data dunia (scan mentah, model bermakna, chest DB, zona)
 *   BB.inventory     → slot inventory, stok kritis
 *   BB.tasks         → task aktif, context stack (untuk interupsi bertumpuk)
 *   BB.recovery      → log kegagalan, retry count, state recovery
 *   BB.stats         → metrik sukses/gagal per jenis task
 *   BB.farm          → state spesifik modul farm (target mob, cluster crop, dll)
 *   BB.chat          → antrian pesan, history percakapan AI
 */
class Blackboard {
  constructor(botName) {
    this.botName = botName;

    // ── Self ─────────────────────────────────────────────────────────────────
    this.self = {
      hp: 20,
      maxHp: 20,
      food: 20,
      maxFood: 20,
      pos: null,          // Vec3
      yaw: 0,
      pitch: 0,
      isOnGround: true,
      isSneaking: false,
      isSprinting: false,
      heldItem: null,
      armorDurability: {},  // { slot: durability_pct }
      toolDurability: 100,  // persen
      isDead: false,
      isConnected: false,
    };

    // ── World ─────────────────────────────────────────────────────────────────
    this.world = {
      rawScan: {
        entities: [],      // entity mentah dalam radius
        blocks: [],        // blok mentah dalam radius
        itemDrops: [],     // item drop di tanah
        chestPositions: [], // posisi chest terdeteksi
        lastScanTime: 0,
      },
      model: {
        mobs: [],          // { entity, classification, riskLevel }
        crops: [],         // { pos, type, status: MATURE|GROWING|EMPTY, block }
        players: [],       // { entity, isHostile, distance }
        chestDB: {},       // key: "x,y,z" → { pos, category, capacity, reliability, lastVisited }
        zoneMap: {
          mob: null,       // { center: Vec3, radius: number }
          crop: null,
          chest: null,
        },
        dangerZones: [],   // array Vec3 blok berbahaya
        lastModelTime: 0,
      },
    };

    // ── Inventory ─────────────────────────────────────────────────────────────
    this.inventory = {
      slots: [],           // array slot Mineflayer
      freeSlots: 36,
      totalSlots: 36,
      counts: {},          // { itemName: count }
      criticalStock: {     // item yang stoknya di bawah threshold
        seeds: {},         // { seedName: count }
        food: 0,
        tools: [],
      },
      weight: 0,           // berat estimasi (untuk prioritas deposit)
    };

    // ── Tasks ─────────────────────────────────────────────────────────────────
    this.tasks = {
      current: null,       // { goalId, priority, params, startTime }
      plan: [],            // array langkah konkret dari TaskPlanner
      currentStep: 0,
      contextStack: [],    // stack untuk interupsi bertumpuk (AutoCE, GiveItem, Safety)
      pendingReplants: [], // posisi crop yang perlu replant tapi bibit kurang
      currentPath: null,   // path aktif dari MovementPlanner
      lastProgressTime: Date.now(),
    };

    // ── Recovery ──────────────────────────────────────────────────────────────
    this.recovery = {
      failureLog: [],      // array { time, source, type, error, resolved }
      retryCount: {},      // { taskId: count }
      lastFailure: null,
      isInRecovery: false,
      recoveryStartTime: null,
      consecutiveFailures: 0,
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    this.stats = {
      sessionStart: Date.now(),
      successByType: {},   // { goalId: count }
      failByType: {},      // { goalId: count }
      itemsCollected: {},  // { itemName: count }
      depositsMade: 0,
      sellsMade: 0,
      distanceTraveled: 0,
      ticksActive: 0,
    };

    // ── Farm Module State ─────────────────────────────────────────────────────
    this.farm = {
      mob: {
        targets: [],       // sorted list target mob aktif
        lastKillTime: 0,
        killCount: 0,
      },
      crop: {
        clusters: [],      // { center, crops: [], priority }
        currentCluster: null,
        lastHarvestTime: 0,
        harvestCount: 0,
      },
      chest: {
        depositTarget: null,  // chest yang sedang dituju
        lastDepositTime: 0,
        depositCount: 0,
      },
      sell: {
        lastSellTime: 0,
        sellCount: 0,
        totalEarned: 0,
      },
      enchant: {
        active: false,
        enchantTarget: null,
        lastEnchantTime: 0,
      },
    };

    // ── Chat / AI ─────────────────────────────────────────────────────────────
    this.chat = {
      messageQueue: [],    // antrian pesan untuk dikirim
      pendingQuestions: [], // { username, message, timestamp } belum dijawab
      conversationHistory: [], // history untuk AI context
      lastResponseTime: 0,
      isProcessingChat: false,
    };
  }

  // ── Helper Methods ─────────────────────────────────────────────────────────

  /** Update self state dari bot Mineflayer */
  updateSelf(bot) {
    if (!bot || !bot.entity) return;
    this.self.hp = bot.health || 20;
    this.self.food = bot.food || 20;
    this.self.pos = bot.entity.position.clone();
    this.self.yaw = bot.entity.yaw;
    this.self.pitch = bot.entity.pitch;
    this.self.isOnGround = bot.entity.onGround;
    this.self.heldItem = bot.heldItem;
    this.self.isDead = bot.entity.metadata?.[7] === 0;
    this.self.isConnected = true;
  }

  /** Catat kegagalan ke recovery log */
  logFailure(source, type, error) {
    const entry = {
      time: Date.now(),
      source,
      type, // TRANSIENT | STRUCTURAL | FATAL
      error: error?.message || String(error),
      resolved: false,
    };
    this.recovery.failureLog.push(entry);
    // Jaga log tidak terlalu besar
    if (this.recovery.failureLog.length > 200) {
      this.recovery.failureLog.splice(0, 50);
    }
    this.recovery.lastFailure = entry;
    this.recovery.consecutiveFailures++;
    return entry;
  }

  /** Catat keberhasilan task */
  recordSuccess(goalId) {
    this.stats.successByType[goalId] = (this.stats.successByType[goalId] || 0) + 1;
    this.recovery.consecutiveFailures = 0;
  }

  /** Catat kegagalan task ke stats */
  recordFailure(goalId) {
    this.stats.failByType[goalId] = (this.stats.failByType[goalId] || 0) + 1;
  }

  /** Hitung success rate untuk goalId */
  getSuccessRate(goalId) {
    const s = this.stats.successByType[goalId] || 0;
    const f = this.stats.failByType[goalId] || 0;
    const total = s + f;
    if (total === 0) return 0.5;
    return s / total;
  }

  /** Push context ke stack (interupsi bertumpuk) */
  pushContext(context) {
    this.tasks.contextStack.push({
      ...context,
      pushedAt: Date.now(),
    });
  }

  /** Pop context dari stack */
  popContext() {
    return this.tasks.contextStack.pop() || null;
  }

  /** Apakah inventory hampir penuh */
  isInventoryAlmostFull(freeSlotThreshold) {
    return this.inventory.freeSlots <= freeSlotThreshold;
  }

  /** Update chest DB entry */
  updateChestDB(posKey, updates) {
    if (!this.world.model.chestDB[posKey]) {
      this.world.model.chestDB[posKey] = {
        pos: null,
        category: 'UNKNOWN',
        capacity: 27,
        reliability: 0.8,
        lastVisited: 0,
        successCount: 0,
        failCount: 0,
      };
    }
    Object.assign(this.world.model.chestDB[posKey], updates);
  }

  /** Turunkan reliability chest setelah gagal */
  penalizeChest(posKey, amount = 0.1) {
    const chest = this.world.model.chestDB[posKey];
    if (chest) {
      chest.reliability = Math.max(0, chest.reliability - amount);
      chest.failCount = (chest.failCount || 0) + 1;
    }
  }

  /** Set zona farm (dari command runtime, bukan hardcode) */
  setZone(type, center, radius) {
    this.world.model.zoneMap[type] = { center, radius, setAt: Date.now() };
  }

  /** Ambil zona farm */
  getZone(type) {
    return this.world.model.zoneMap[type] || null;
  }

  /** Reset retry count untuk task */
  resetRetry(taskId) {
    delete this.recovery.retryCount[taskId];
  }

  /** Increment retry count */
  incrementRetry(taskId) {
    this.recovery.retryCount[taskId] = (this.recovery.retryCount[taskId] || 0) + 1;
    return this.recovery.retryCount[taskId];
  }

  /** Cek apakah sudah melebihi max retry */
  isRetryExceeded(taskId, maxRetries) {
    return (this.recovery.retryCount[taskId] || 0) >= maxRetries;
  }
}

module.exports = Blackboard;
