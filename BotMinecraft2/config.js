'use strict';
require('dotenv').config();

/**
 * config.js — Single Source of Truth untuk seluruh parameter BotMinecraft2.
 * JANGAN hardcode nilai di dalam modul logika — baca selalu dari sini.
 */
const config = {
  // ─── Server ───────────────────────────────────────────────────────────────
  server: {
    host: process.env.SERVER_HOST || 'rhsmp.mc.hrkm.my.id',
    port: parseInt(process.env.SERVER_PORT || '25565', 10),
    version: '1.21.6',
    auth: 'offline', // cracked server
  },

  // ─── Bot Instances ────────────────────────────────────────────────────────
  bots: [
    {
      username: 'bot1',
      password: '',
      role: 'primary', // full AI pipeline + chat AI
    },
    /*
    {
      username: 'bot2',
      password: '',
      role: 'farm', // passive farm only
    },
    */
  ],

  // ─── Chat / Command ───────────────────────────────────────────────────────
  chat: {
    commandPrefix: '!',
    // Bot hanya dengar private message (/msg botname !cmd)
    // untuk mencegah bentrok antar bot di chat publik
    usePrivateMessage: true,
    privateMessageCommand: '/msg',

    // Trigger AI: kata-kata yang memicu respons AI (case-insensitive)
    aiTriggerWords: ['bot', 'nenel'],
    // Bot punya window 10 detik untuk menjawab setelah pesan masuk
    aiResponseWindowMs: 10000,

    // Delay antar pesan chat (anti-spam / anti-ban)
    sendDelayMinMs: 1700,
    sendDelayMaxMs: 3200,
    // Panjang maksimum satu pesan sebelum dipecah
    maxMessageLength: 230,
    // Delay antar segmen pesan panjang yang dipecah
    segmentDelayMs: 2000,
    // Maksimum antrian respons AI yang diproses bersamaan
    maxQueueConcurrent: 1,
  },

  // ─── AI (Groq) ────────────────────────────────────────────────────────────
  ai: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: 'llama-3.3-70b-versatile',
    maxTokens: 300,
    temperature: 0.7,
    // Persona bot untuk system prompt
    botPersona: 'Nenel',
    // Konteks server untuk AI
    serverContext: 'Server survival Minecraft rhsmp.mc.hrkm.my.id dengan plugin ekonomi, enchanting, dan farm.',
  },

  // ─── Reconnect ────────────────────────────────────────────────────────────
  reconnect: {
    enabled: true,
    initialDelayMs: 15000,
    maxDelayMs: 300000,
    multiplier: 2,
  },

  // ─── Auth Plugin (untuk server dengan /login atau /register) ─────────────
  auth: {
    enabled: true,
    loginTriggerWords: [
      'please log in', 'please login', 'register or login',
      'you need to log in', '/login', 'login to play',
      'silahkan login', 'gunakan /login',
    ],
    loginDelayMs: 2000,
    loginTimeoutMs: 30000,
    loginCommand: '/login',
    registerCommand: '/register',
  },

  // ─── World Scanner ────────────────────────────────────────────────────────
  scanner: {
    // Radius default scan entitas & blok (dapat di-override per bot)
    entityRadius: 24,
    blockRadius: 16,
    chestRadius: 24,
    itemDropRadius: 12,
    // Frekuensi full re-scan (ms)
    fullScanIntervalMs: 5000,
    // Budget maksimum per tick untuk scanner (ms)
    tickBudgetMs: 8,
  },

  // ─── Farm Zones ───────────────────────────────────────────────────────────
  // Zone disimpan di Blackboard.world.zones, bisa di-set via command !setzone
  // Format: { center: {x,y,z}, radius: number }
  // TIDAK ada koordinat hardcode di sini — zones didapat dari command runtime
  farm: {
    // Radius default saat zone baru di-set via command
    defaultMobZoneRadius: 20,
    defaultCropZoneRadius: 30,
    defaultChestZoneRadius: 40,
    // Ambang prediktif deposit (% inventory penuh sebelum deposit)
    depositTriggerPercent: 0.75,
    // Ambang sell (jumlah stack item sell-able)
    sellTriggerStacks: 2,
    // Item yang TIDAK di-auto-sell (barang langka)
    protectedItems: [
      'diamond', 'netherite_ingot', 'netherite_scrap',
      'totem_of_undying', 'elytra', 'nether_star',
      'sword', 'pickaxe', 'axe', 'shovel', 'hoe',
      'helmet', 'chestplate', 'leggings', 'boots',
    ],
    // Item prioritas tinggi untuk sell (mendapat bonus utility score)
    highValueItems: ['ender_pearl', 'blaze_rod', 'ghast_tear'],
    // Command sell
    sellCommand: '/sellgui',
    // Durasi tunggu konfirmasi setelah sell (ms)
    sellConfirmWaitMs: 3000,
  },

  // ─── Mob Farm ─────────────────────────────────────────────────────────────
  mobFarm: {
    // Mob yang valid sebagai target
    targetMobs: [
      'zombie', 'skeleton', 'creeper', 'spider', 'cave_spider',
      'enderman', 'witch', 'pillager', 'vindicator', 'blaze',
      'ghast', 'slime', 'magma_cube', 'drowned', 'husk', 'stray',
      'phantom', 'wither_skeleton',
    ],
    // Mob yang TIDAK boleh diserang
    excludedMobs: ['villager', 'wandering_trader', 'iron_golem', 'snow_golem'],
    // Jangan serang mob dengan custom name (biasanya pet/named)
    skipNamedMobs: true,
    // Jarak max ke target (4.2 blok cocok untuk grinder/farm berdiri)
    attackRange: 4.2,
    // Waktu tunggu antar serangan (ms) — dikombinasikan dengan humanizer
    attackCooldownMs: 620,
    // Batas durability tool sebelum ganti (1–100 persen)
    toolDurabilityMinPercent: 10,
    // Batas food sebelum pause farming
    foodThresholdStop: 6,
  },

  // ─── Crop Farm ────────────────────────────────────────────────────────────
  cropFarm: {
    // Tanaman yang didukung dengan seeds-nya
    crops: {
      wheat: { seedItem: 'wheat_seeds', matureAge: 7 },
      carrots: { seedItem: 'carrot', matureAge: 7 },
      potatoes: { seedItem: 'potato', matureAge: 7 },
      beetroots: { seedItem: 'beetroot_seeds', matureAge: 3 },
      melon: { seedItem: 'melon_seeds', matureAge: null }, // cek block type
      pumpkin: { seedItem: 'pumpkin_seeds', matureAge: null },
      nether_wart: { seedItem: 'nether_wart', matureAge: 3 },
    },
    // Jumlah minimum bibit sebelum dianggap "kritis"
    minSeedStock: 10,
    // Jarak cluster (blok) untuk nearest-neighbor grouping
    clusterRadius: 8,
  },

  // ─── Chest Deposit ────────────────────────────────────────────────────────
  chestDeposit: {
    // Berapa slot yang dianggap "hampir penuh" untuk trigger deposit
    inventoryFreeSlotMin: 6,
    // Lama menunggu chest terbuka (ms)
    openTimeoutMs: 1500,
    // Max retry buka chest
    openMaxRetries: 2,
    // Waktu backoff awal untuk retry (ms)
    retryBackoffMs: 800,
    // Threshold keandalan chest — di bawah ini skip & cari alternatif
    reliabilityThreshold: 0.3,
  },

  // ─── Safety System ────────────────────────────────────────────────────────
  safety: {
    // HP di bawah ini → flee/heal
    hpCritical: 6,
    // Food di bawah ini → paksa makan / pause
    foodCritical: 8,
    // Jarak bebahaya untuk fall (blok ke bawah)
    fallDangerBlocks: 5,
    // Jarak player bermusuhan yang trigger flee (0 = nonaktifkan di server friendly/SMP)
    hostilePlayerRadius: 0,
    // Nama block yang dianggap berbahaya
    dangerBlocks: ['lava', 'flowing_lava', 'fire', 'soul_fire', 'magma_block'],
    // Durability armor minimal (persen)
    armorDurabilityMin: 8,
  },

  // ─── Recovery System ──────────────────────────────────────────────────────
  recovery: {
    // Max retry sebelum eskalasi ke strategi alternatif
    maxRetries: 3,
    // Backoff awal (ms)
    backoffBaseMs: 1000,
    // Backoff maksimum (ms)
    backoffMaxMs: 30000,
    // Multiplier exponential
    backoffMultiplier: 2,
    // Waktu idle sebelum dianggap "stuck" (ms)
    stuckTimeoutMs: 60000,
  },

  // ─── Humanization ────────────────────────────────────────────────────────
  humanization: {
    // Delay antar aksi (ms)
    actionDelayMinMs: 80,
    actionDelayMaxMs: 300,
    // Kecepatan interpolasi rotasi kamera (0-1, semakin kecil semakin lambat)
    rotationSpeed: 0.15,
    // Overshoot-koreksi kamera (radians)
    rotationOvershoot: 0.05,
    // Probabilitas per tick untuk sisipkan idle behavior (0-1)
    idleChancePer100Ticks: 3, // 3% per 100 ticks
    // Noise pada utility score (tambah/kurang random %)
    utilityScoreNoisePct: 8,
    // Target efisiensi (persen dari maksimum teoritis)
    efficiencyTargetPct: 80,
    // Variasi durasi task per siklus (persen)
    taskDurationVariancePct: 15,
    // Variasi cost-function pathfinding (persen)
    pathCostVariancePct: 10,
  },

  // ─── Inventory Manager ────────────────────────────────────────────────────
  inventory: {
    // Item yang tidak boleh di-drop
    protectedItems: [
      'sword', 'axe', 'pickaxe', 'shovel', 'hoe',
      'helmet', 'chestplate', 'leggings', 'boots',
      'totem_of_undying', 'ender_pearl', 'golden_apple',
      'enchanted_golden_apple',
    ],
    // Food priority (paling disukai pertama)
    foodPriority: [
      'golden_carrot', 'cooked_beef', 'cooked_porkchop',
      'cooked_chicken', 'bread', 'cooked_mutton',
    ],
    // Item yang bisa di-trash jika inventory penuh
    trashItems: ['rotten_flesh', 'bone', 'spider_eye', 'string'],
    // Auto-eat mulai di bawah food points ini
    autoEatThreshold: 14,
  },

  // ─── Tick Scheduler ──────────────────────────────────────────────────────
  tick: {
    // Interval tick utama (ms) — Minecraft default 50ms
    intervalMs: 50,
    // Budget waktu per modul per tick (ms)
    budget: {
      safetySystem: 2,
      worldScanner: 8,
      environmentAnalyzer: 5,
      decisionEngine: 5,
      taskPlanner: 5,
      movementPlanner: 4,
      actionExecutor: 5,
      monitor: 2,
    },
  },

  // ─── Monitor / Logging ────────────────────────────────────────────────────
  monitor: {
    logDir: './logs',
    anomalyStuckMs: 90000, // bot diam lebih dari ini → anomali
    metricsIntervalMs: 60000, // cetak ringkasan metrik tiap N ms
    maxLogFileSizeMb: 10,
    maxLogFiles: 5,
  },

  // ─── Auto CE (CrazyEnchantments) ─────────────────────────────────────────
  autoCE: {
    // Item yang akan di-enchant secara prioritas
    enchantTargets: ['sword', 'bow', 'helmet', 'chestplate', 'leggings', 'boots'],
    // Token/currency untuk enchant (tergantung plugin)
    currencyItem: 'experience_bottle',
    // Batas token sebelum enchant
    minTokens: 5,
    // GUI title keyword untuk CrazyEnchantments
    guiTitleKeyword: 'enchant',
    openTimeoutMs: 5000,
  },
};

module.exports = config;
