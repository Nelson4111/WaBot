'use strict';

const Joi = require('joi');

// ── Schema Validasi Config ──────────────────────────────────────────────────

/**
 * Schema validasi menggunakan Joi.
 * Jika ada field yang salah tipe atau hilang, akan throw error yang jelas
 * sehingga tidak ada crash misterius karena typo di config.json.
 */
const configSchema = Joi.object({
  bot: Joi.object({
    version: Joi.alternatives().try(Joi.string(), Joi.boolean()).default('auto'),
    viewDistance: Joi.string()
      .valid('far', 'normal', 'short', 'tiny')
      .default('tiny'),
    chatLengthLimit: Joi.number().integer().min(1).max(256).default(256),
    physicsEnabled: Joi.boolean().default(true),
  }).required(),

  reconnect: Joi.object({
    enabled: Joi.boolean().default(true),
    initialDelayMs: Joi.number().integer().min(1000).default(5000),
    maxDelayMs: Joi.number().integer().min(5000).default(300000),
    multiplier: Joi.number().min(1).max(10).default(2),
  }).required(),

  auth: Joi.object({
    enabled: Joi.boolean().default(true),
    loginTriggerWords: Joi.array().items(Joi.string()).min(1).required(),
    loginDelayMs: Joi.number().integer().min(0).default(1500),
    loginTimeoutMs: Joi.number().integer().min(5000).default(30000),
  }).required(),

  antiAfk: Joi.object({
    enabled: Joi.boolean().default(true),
    intervalSeconds: Joi.number().integer().min(5).max(300).default(30),
    actions: Joi.array()
      .items(Joi.string().valid('look', 'sneak', 'walk'))
      .default(['look', 'sneak', 'walk']),
  }).required(),

  guard: Joi.object({
    enabled: Joi.boolean().default(false),
    radius: Joi.number().integer().min(1).max(64).default(16),
    attackInterval: Joi.number().integer().min(100).default(500),
    hostileMobs: Joi.array().items(Joi.string()).min(1).required(),
  }).required(),

  farm: Joi.object({
    enabled: Joi.boolean().default(false),
    waypointName: Joi.string().default('farm'),
    lootRadius: Joi.number().integer().min(1).max(32).default(5),
    lootIntervalMs: Joi.number().integer().min(500).default(3000),
    stuckTimeoutMs: Joi.number().integer().min(10000).default(60000),
    autoSell: Joi.object({
      enabled: Joi.boolean().default(true),
      command: Joi.string().default('/sellall ENDER_PEARL'),
      triggerAtStacks: Joi.number().integer().min(1).max(36).default(16),
      triggerOnFullInventory: Joi.boolean().default(true),
    }).default({
      enabled: true,
      command: '/sellall ENDER_PEARL',
      triggerAtStacks: 16,
      triggerOnFullInventory: true,
    }),
  }).required(),

  chat: Joi.object({
    ownerUsername: Joi.string().required(),
    usePrivateMessage: Joi.boolean().default(true),
    privateMessageCommand: Joi.string().default('/msg'),
    delayMinMs: Joi.number().integer().min(500).default(1200),
    delayMaxMs: Joi.number().integer().min(1000).default(2500),
    maxMessagesPerInterval: Joi.number().integer().min(1).default(1),
  }).required(),

  commands: Joi.object({
    prefix: Joi.string().min(1).max(3).default('!'),
  }).required(),

  autoEat: Joi.object({
    priority: Joi.string()
      .valid('foodPoints', 'saturation', 'effectiveQuality')
      .default('foodPoints'),
    startAt: Joi.number().integer().min(1).max(20).default(14),
    bannedFood: Joi.array().items(Joi.string()).default([]),
    checkOnItemPickup: Joi.boolean().default(true),
  }).required(),

  health: Joi.object({
    checkIntervalMinutes: Joi.number().integer().min(1).default(1),
    lowHealthThreshold: Joi.number().integer().min(1).max(20).default(5),
  }).required(),

  stats: Joi.object({
    saveIntervalMinutes: Joi.number().integer().min(1).default(5),
  }).required(),

  web: Joi.object({
    enabled: Joi.boolean().default(false),
    logBufferSize: Joi.number().integer().min(100).max(5000).default(500),
  }).required(),

  inventory: Joi.object({
    trashItems: Joi.array().items(Joi.string()).default([]),
    protectedItems: Joi.array().items(Joi.string()).default([]),
    swordPriority: Joi.array().items(Joi.string()).default([]),
    foodPriority: Joi.array().items(Joi.string()).default([]),
    autoDropIntervalMs: Joi.number().integer().min(1000).default(120000),
  }).required(),

  storage: Joi.object({
    enabled: Joi.boolean().default(false),
    chestWaypoint: Joi.string().default('storage'),
  }).required(),

  movement: Joi.object({
    followDistance: Joi.number().integer().min(1).max(10).default(3),
  }).required(),
});

module.exports = { configSchema };
