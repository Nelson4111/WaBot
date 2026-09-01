process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

// Filter spam log internal libsignal agar terminal tetap bersih
const _origConsoleLog = console.log;
const _origConsoleInfo = console.info;
const _origConsoleError = console.error;
console.log = function (...args) {
    if (typeof args[0] === 'string' && (args[0].startsWith('Closing session:') || args[0].startsWith('Opening session:'))) return;
    _origConsoleLog.apply(console, args);
};
console.info = function (...args) {
    if (typeof args[0] === 'string' && (args[0].includes('Closing session:') || args[0].includes('Opening session:'))) return;
    _origConsoleInfo.apply(console, args);
};
console.error = function (...args) {
    if (typeof args[0] === 'string' && args[0].includes('Decrypted message with closed session')) return;
    _origConsoleError.apply(console, args);
};

process.on('unhandledRejection', (reason, promise) => {
    if (reason && (reason.code === 'ERR_NON_2XX_3XX_RESPONSE' || (reason.message && reason.message.includes('429')))) {
        console.warn('⚠️ [HTTP Rate Limit 429] API eksternal sedang sibuk (akan otomatis coba lagi nanti).');
        return;
    }
    console.error('[UNHANDLED REJECTION]', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT EXCEPTION]', err);
});
import store from './lib/store.js'

import './config.js'

import path, { join } from 'path'
import { platform } from 'process'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString() }; global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)) }; global.__require = function require(dir = import.meta.url) { return createRequire(dir) }
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  mkdirSync, 
  watch
} from 'fs'

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv

import { spawn } from 'child_process'
import lodash from 'lodash'
import syntaxerror from 'syntax-error'
import chalk from 'chalk'
import { tmpdir } from 'os'
import readline from 'readline'
import { format } from 'util'
import pino from 'pino'
import ws from 'ws'
import { initSewaCheck } from './lib/sewaCheck.js';

const Baileys = await import('@whiskeysockets/baileys')
const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = Baileys

let makeInMemoryStore = Baileys.makeInMemoryStore || Baileys.default?.makeInMemoryStore
if (typeof makeInMemoryStore !== 'function') {
  try {
    const storeModule = await import('@whiskeysockets/baileys/lib/Store/index.js')
    makeInMemoryStore = storeModule.makeInMemoryStore || storeModule.default?.makeInMemoryStore
  } catch {}
}
if (typeof makeInMemoryStore !== 'function') {
  makeInMemoryStore = () => ({
    bind: () => {},
    loadMessages: async () => [],
    writeToFile: () => {},
    readFromFile: () => {},
    chats: new Map(),
    messages: new Map(),
    contacts: {},
    groupMetadata: {}
  })
}
import { Low, JSONFile } from 'lowdb'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import cloudDBAdapter from './lib/cloudDBAdapter.js'
import {
  mongoDB,
  mongoDBV2
} from './lib/mongoDB.js'

const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000
const CUSTOM_PAIRING_CODE = (process.env.PAIRING_CODE || '').trim().toUpperCase()

protoType()
serialize()

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')
// global.Fn = function functionCallBack(fn, ...args) { return fn.call(global.conn, ...args) }
global.timestamp = {
  start: new Date
}

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb(\+srv)?:\/\//i.test(opts['db']) ?
      (opts['mongodbv2'] ? new mongoDBV2(opts['db']) : new mongoDB(opts['db'])) :
      new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
)
global.DATABASE = global.db // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
  if (db.READ) return new Promise((resolve) => setInterval(async function () {
    if (!db.READ) {
      clearInterval(this)
      resolve(db.data == null ? global.loadDatabase() : db.data)
    }
  }, 1 * 1000))
  if (db.data !== null) return
  db.READ = true
  await db.read().catch(console.error)
  db.READ = null
  db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(db.data || {})
  }
  global.db.chain = chain(db.data)

  // Auto-clean & merge any remaining @lid ghost accounts into canonical @s.whatsapp.net accounts
  try {
    if (global.db.data?.lids && global.db.data?.users) {
      for (const [lid, phoneJid] of Object.entries(global.db.data.lids)) {
        if (global.db.data.users[lid] && phoneJid && phoneJid.endsWith('@s.whatsapp.net')) {
          if (!global.db.data.users[phoneJid]) {
            global.db.data.users[phoneJid] = global.db.data.users[lid]
          } else {
            for (const [k, v] of Object.entries(global.db.data.users[lid])) {
              if (typeof v === 'number' && typeof global.db.data.users[phoneJid][k] === 'number') {
                global.db.data.users[phoneJid][k] = Math.max(global.db.data.users[phoneJid][k], v)
              } else if (global.db.data.users[phoneJid][k] === undefined) {
                global.db.data.users[phoneJid][k] = v
              }
            }
          }
          delete global.db.data.users[lid]
          console.log(chalk.green(`🧹 [LID CLEANUP] Merged ghost user ${lid} -> ${phoneJid}`))
        }
      }
    }
  } catch (e) {
    console.error('LID DB Cleanup Error:', e)
  }
}
loadDatabase()
const usePairingCode = global.usePairingCode !== undefined ? global.usePairingCode : !process.argv.includes('--use-pairing-code')
const useMobile = process.argv.includes('--mobile')

var question = function (text) {
  return new Promise(function (resolve) {
    rl.question(text, resolve);
  });
};
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
//const question = (text) => new Promise(resolve => rl.question(text, resolve))

const { version, isLatest } = await fetchLatestBaileysVersion()
const { state, saveCreds } = await useMultiFileAuthState('./sessions')

// Buat memory store asli dari Baileys untuk menyimpan pesan masuk sementara (penting untuk getMessage)
const memoryStore = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

if (!state.creds.me) {
  delete state.creds.pairingCode
  await saveCreds()
}

global.groupMetadataCache = global.groupMetadataCache || new Map();
global.memoryStore = memoryStore;

global.updateGroupMetadataCache = function (jid, metadata) {
  if (!jid || !metadata) return;
  if (!global.groupMetadataCache) global.groupMetadataCache = new Map();
  global.groupMetadataCache.set(jid, { data: metadata, time: Date.now() });
  if (memoryStore && memoryStore.groupMetadata) {
    memoryStore.groupMetadata[jid] = metadata;
  }
  if (global.conn && global.conn.chats) {
    if (!global.conn.chats[jid]) global.conn.chats[jid] = { id: jid };
    global.conn.chats[jid].metadata = metadata;
    if (metadata.subject) global.conn.chats[jid].subject = metadata.subject;
  }

  // Auto-index all participant LIDs to JIDs
  if (Array.isArray(metadata.participants)) {
    if (!global.lids) global.lids = {};
    if (global.db && global.db.data && !global.db.data.lids) global.db.data.lids = {};
    for (const p of metadata.participants) {
      const lid = p.lid || (p.id?.endsWith('@lid') ? p.id : null);
      const phoneJid = p.jid || p.phoneNumber || (p.id?.endsWith('@s.whatsapp.net') ? p.id : null);
      if (lid && lid.endsWith('@lid') && phoneJid && phoneJid.endsWith('@s.whatsapp.net')) {
        const cleanLid = lid.split(':')[0].replace(/@.+/, '') + '@lid';
        const cleanJid = phoneJid.split(':')[0].replace(/@.+/, '') + '@s.whatsapp.net';
        global.lids[cleanLid] = cleanJid;
        global.lids[lid] = cleanJid;
        if (global.db && global.db.data && global.db.data.lids) {
          global.db.data.lids[cleanLid] = cleanJid;
          global.db.data.lids[lid] = cleanJid;
        }
      }
    }
  }
};

// Message retry counter cache (pengganti NodeCache tanpa dependency tambahan)
// Ini krusial agar Baileys bisa retry dekripsi pesan yang gagal di grup
const msgRetryCounterMap = new Map()
const MSG_RETRY_TTL = 60 * 60 * 1000 // 1 jam
const msgRetryCounterCache = {
  get: (key) => {
    const entry = msgRetryCounterMap.get(key)
    if (!entry) return undefined
    if (Date.now() - entry.time > MSG_RETRY_TTL) {
      msgRetryCounterMap.delete(key)
      return undefined
    }
    return entry.value
  },
  set: (key, value) => {
    msgRetryCounterMap.set(key, { value, time: Date.now() })
  },
  del: (key) => {
    msgRetryCounterMap.delete(key)
  }
}

global.groupMetadataQueryHourly = 0;
global.groupMetadataCacheHits = 0;

setInterval(() => {
  console.log(chalk.cyan(`📊 [METADATA STATS 1-JAM] Query Server WA: ${global.groupMetadataQueryHourly || 0} | Cache Hits: ${global.groupMetadataCacheHits || 0}`));
  global.groupMetadataQueryHourly = 0;
  global.groupMetadataCacheHits = 0;
}, 60 * 60 * 1000);

const connectionOptions = {
  version,
  logger: pino({ level: 'silent' }),
  browser: ['Alya Bot', 'Safari', '1.0.0'],
  msgRetryCounterCache,
  cachedGroupMetadata: async (jid) => {
    // 1. Tier 1: Ambil dari memoryStore Baileys
    if (memoryStore && memoryStore.groupMetadata && memoryStore.groupMetadata[jid]) {
      global.groupMetadataCacheHits = (global.groupMetadataCacheHits || 0) + 1;
      return memoryStore.groupMetadata[jid];
    }
    
    // 2. Tier 2: Fallback ke global.groupMetadataCache Map (TTL 15 menit)
    if (global.groupMetadataCache && global.groupMetadataCache.has(jid)) {
      const cached = global.groupMetadataCache.get(jid);
      if (Date.now() - cached.time < 15 * 60 * 1000) {
        global.groupMetadataCacheHits = (global.groupMetadataCacheHits || 0) + 1;
        return cached.data;
      }
    }

    // 3. Tier 3: Fallback ke conn.chats[jid].metadata
    if (global.conn && global.conn.chats && global.conn.chats[jid] && global.conn.chats[jid].metadata) {
      const meta = global.conn.chats[jid].metadata;
      global.updateGroupMetadataCache(jid, meta);
      global.groupMetadataCacheHits = (global.groupMetadataCacheHits || 0) + 1;
      return meta;
    }
    
    // 4. CACHE MISS — fetch sendiri dengan single-flight agar Baileys tidak juga
    //    memanggil groupMetadata(jid) secara paralel (yang menyebabkan rate-overlimit).
    //    cachedGroupMetadata TIDAK BOLEH return undefined untuk group JID.
    global.groupMetadataQueryHourly = (global.groupMetadataQueryHourly || 0) + 1;
    console.log(chalk.yellow(`⚠️ [METADATA QUERY #${global.groupMetadataQueryHourly}] Cache miss ${jid}, fetching inline...`))
    
    if (!global._cachedMetaInFlight) global._cachedMetaInFlight = new Map()
    if (global._cachedMetaInFlight.has(jid)) {
      // Reuse promise yang sedang in-flight untuk JID yang sama
      return global._cachedMetaInFlight.get(jid)
    }

    const promise = (global.conn ? global.conn.groupMetadata(jid) : Promise.reject(new Error('no conn')))
      .then(meta => {
        if (meta && global.updateGroupMetadataCache) global.updateGroupMetadataCache(jid, meta)
        return meta
      })
      .catch(e => {
        console.error(chalk.red(`❌ [cachedGroupMetadata FETCH FAIL] ${jid}: ${e?.message}`));
        // Kembalikan object minimal agar Baileys tidak crash dan tidak ikut fetch lagi.
        // Baileys hanya butuh { id, participants } untuk key distribution.
        return global.conn?.chats?.[jid]?.metadata || { id: jid, participants: [], subject: '' }
      })
      .finally(() => { global._cachedMetaInFlight?.delete(jid) })
    
    global._cachedMetaInFlight.set(jid, promise)
    return promise
  },
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
  },
  getMessage: async key => {
    // 1. Coba ambil dari memoryStore Baileys
    try {
      if (memoryStore) {
        const msg = await memoryStore.loadMessage(key.remoteJid, key.id)
        if (msg) return msg.message || undefined
      }
    } catch {}
    
    // 2. Coba ambil dari global.db.data.msgs (outbound & recent messages)
    try {
      const msgs = global.db?.data?.msgs
      if (msgs && msgs[key.id]) {
        return msgs[key.id].message || undefined
      }
    } catch {}

    // 3. Coba ambil dari store legacy jika ada
    try {
      if (store && typeof store.loadMessage === 'function') {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        if (msg) return msg.message || undefined
      }
    } catch {}

    return undefined
  },
  generateHighQualityLinkPreview: true,
  patchMessageBeforeSending: (message) => {
    const requiresPatch = !!(
      message.buttonsMessage ||
      message.templateMessage ||
      message.listMessage ||
      message.interactiveMessage
    );
    if (requiresPatch) {
      message = {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadataVersion: 2,
              deviceListMetadata: {},
            },
            ...message,
          },
        },
      };
    }
    return message;
  },
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 60000,
  retryRequestDelayMs: 250,
  maxMsgRetryCount: 10,
  syncFullHistory: false,
  markOnlineOnConnect: true
}

function bindSocketStores(sock) {
  if (!sock) return
  try {
    store.bind(sock)
    if (memoryStore && sock.ev) {
      memoryStore.bind(sock.ev)
    }
    console.log(chalk.green('📦 [STORE] Successfully bound memoryStore & store to socket instance.'))
  } catch (e) {
    console.error('❌ [STORE BIND ERROR]', e)
  }
}

global.conn = makeWASocket(connectionOptions)
bindSocketStores(global.conn)
conn.isInit = false

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function waitForSocketOpen(sock, timeoutMs = 60000) {
  if (sock.ws?.isOpen) return Promise.resolve()

  return new Promise((resolve, reject) => {
    let interval
    let timeout
    let settled = false

    const cleanup = () => {
      clearInterval(interval)
      clearTimeout(timeout)
      sock.ev.off('connection.update', onConnectionUpdate)
    }

    const done = (err) => {
      if (settled) return
      settled = true
      cleanup()
      err ? reject(err) : resolve()
    }

    const onConnectionUpdate = ({ connection, lastDisconnect }) => {
      if (sock.ws?.isOpen) return done()
      if (connection === 'close') {
        const message = lastDisconnect?.error?.message || 'Connection closed before pairing code'
        return done(new Error(message))
      }
    }

    interval = setInterval(() => {
      if (sock.ws?.isOpen) done()
    }, 500)

    timeout = setTimeout(() => {
      done(new Error('Timeout waiting for WhatsApp socket to open'))
    }, timeoutMs)

    sock.ev.on('connection.update', onConnectionUpdate)
  })
}

async function requestPairingCodeWithRetry(getSock, phoneNumber, customCode, retries = 3) {
  let lastError

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const sock = getSock()
      await waitForSocketOpen(sock)
      await sleep(1500)
      return await sock.requestPairingCode(phoneNumber, customCode)
    } catch (e) {
      lastError = e
      console.error(chalk.yellow(`Percobaan pairing ${attempt}/${retries} gagal: ${e?.message || e}`))
      if (attempt < retries) await sleep(3000)
    }
  }

  throw lastError
}

let pairingPhoneNumber = ''
let pairingCodeRequested = false
let reconnectTimer = null
let reconnectAttempts = 0
let reconnecting = false

function disconnectReasonName(statusCode) {
  return DisconnectReason[statusCode] || 'unknown'
}

function scheduleReconnect() {
  if (reconnectTimer || reconnecting) return

  const delay = Math.min(30000, 3000 + reconnectAttempts * 2000)
  reconnectAttempts += 1

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null
    reconnecting = true

    try {
      console.log(chalk.redBright(`❌ Koneksi terputus, mencoba ulang dalam ${delay / 1000} detik...`))
      await global.reloadHandler(true)
    } catch (e) {
      console.error(chalk.red('❌ Gagal reconnect:'), e?.message || e)
    } finally {
      reconnecting = false
    }
  }, delay)
}

if (usePairingCode && !conn.authState.creds.me) {
  if (useMobile) throw new Error('Cannot use pairing code with mobile api')

  let phoneNumber = String(argv._[0] || '').trim().replace(/[^0-9]/g, '')

  while (!phoneNumber) {
    phoneNumber = (await question(
      chalk.blueBright('Input nomor WhatsApp yang valid (awali dengan kode negara, contoh: 62812xxxxxx):\n')
    )).trim().replace(/[^0-9]/g, '')
  }

  rl.close()

  pairingPhoneNumber = phoneNumber
}

function startPairingCode(phoneNumber) {
  console.log(chalk.green(`Nomor digunakan: ${phoneNumber}`))
  console.log(chalk.bgWhite(chalk.blue('Generating Pairing Code...')))
  setTimeout(async () => {
    try {
      const rawCode = await requestPairingCodeWithRetry(() => conn, phoneNumber, CUSTOM_PAIRING_CODE || null)
      const code = rawCode?.match(/.{1,4}/g)?.join('-') || rawCode
      pairingCodeRequested = true

      // ASCII Box
      const line = '─'.repeat(code.length + 4)
      console.log(chalk.green(`\n┌${line}┐`))
      console.log(chalk.green(`│  ${chalk.yellow.bold(code)}  │`))
      console.log(chalk.green(`└${line}┘`))
      console.log(chalk.cyan(`\nPairing Code: ${chalk.bold(code)}`))
      console.log(chalk.magenta('📌 Masukkan pairing code ini ke WhatsApp segera!'))
    } catch (e) {
      console.error(chalk.red('❌ Gagal generate pairing code:'), e?.message || e)
      console.log(chalk.yellow('Coba hapus isi folder sessions lalu jalankan ulang jika sesi lama sudah tidak valid.'))
    }
  }, 2000)
}

if (!opts['test']) {
  (await import('./server.js')).default(PORT)
  setInterval(async () => {
    if (global.db && global.db.data) {
      // --- DB SANITIZER: Mencegah Circular Reference Crash ---
      const users = global.db.data.users
      if (users && typeof users === 'object') {
        for (const jid in users) {
          const user = users[jid]
          if (user === global.db.data || user === users) {
            console.log(`[DB SANITIZER] Terdeteksi circular reference pada user ${jid}! Mereset data user...`)
            users[jid] = { jid } // Reset ke object aman
          }
        }
      }
      // -----------------------------------------------------
      await global.db.write().catch(console.error)
    }
    clearTmp()
  }, 60 * 1000)

  // Auto Bio Feature
  setInterval(async () => {
    if (global.opts['autobio']) {
      try {
        let uptime = process.uptime() * 1000
        let h = Math.floor(uptime / 3600000).toString().padStart(2, '0')
        let m = Math.floor((uptime % 3600000) / 60000).toString().padStart(2, '0')
        let status = `I am NelBotz | Aktif Selama ${h} Jam ${m} Menit ⏳`
        await global.conn.updateProfileStatus(status)
      } catch (e) {
        console.error('[AUTOBIO ERROR]', e)
      }
    }
  }, 300000) // Update every 5 minutes to prevent rate limit
}

let isExiting = false;
async function gracefulExit() {
  if (isExiting) return;
  isExiting = true;
  try {
    if (global.opts['autobio'] && global.conn) {
      await global.conn.updateProfileStatus('Bot sedang offline ❌. Akan aktif kembali nanti.')
    }
  } catch (e) {}
  process.exit(0);
}
process.on('SIGINT', gracefulExit)
process.on('SIGTERM', gracefulExit)

function clearTmp() {
  const tmp = [tmpdir(), join(__dirname, './tmp')]
  const filename = []

  tmp.forEach(dirname => {
    // CEK JIKA FOLDER TIDAK ADA, MAKA BUAT FOLDERNYA
    if (!existsSync(dirname)) mkdirSync(dirname, { recursive: true })

    readdirSync(dirname).forEach(file => {
      filename.push(join(dirname, file))
    })
  })

  return filename.map(file => {
    try {
      const stats = statSync(file)

      if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) {
        return unlinkSync(file) // 3 minutes
      }

      return false
    } catch (err) {
      if (err.code === 'EBUSY' || err.code === 'ENOENT' || err.code === 'EPERM') {
        return false
      }

      console.error(err)
      return false
    }
  })
}

async function clearSessions(folder = './sessions') {
  // Proteksi Sesi: Jangan hapus file di folder sessions agar akun WhatsApp tidak ter-logout secara otomatis
  return [];
}

async function connectionUpdate(update) {
  const {
    receivedPendingNotifications,
    connection,
    lastDisconnect,
    isOnline,
    isNewLogin,
    qr
  } = update

  if (connection === 'close') {
      console.log('[CONNECTION CLOSED]', 
          'statusCode:', lastDisconnect?.error?.output?.statusCode,
          'message:', lastDisconnect?.error?.message
      )
  }

  if (qr && !usePairingCode) {
    try {
      const qrcode = (await import('qrcode')).default
      qrcode.toString(qr, { type: 'terminal', small: true }, (err, url) => {
        if (!err) {
          console.log(chalk.cyan('\n📌 SCAN QR CODE DI BAWAH INI DENGAN WHATSAPP BUSINESS:\n'))
          console.log(url)
        }
      })
    } catch (e) {
      console.error('Error rendering QR Code:', e)
    }
  }

  if (isNewLogin) conn.isInit = true

  if (connection === 'open') {
    reconnectAttempts = 0
    pairingCodeRequested = false
    console.log(
      chalk.green(
        '⏱️ Koneksi menyambung & mengaktifkan Bot, mohon tunggu sebentar...'
      )
    )
    global.timestamp.connect = new Date()

    // Pre-fetch semua metadata grup sekaligus (1 IQ query total, bukan 1 per grup).
    setTimeout(async () => {
      try {
        if (!conn.ws?.isOpen) return
        const groups = await conn.groupFetchAllParticipating().catch(_ => null)
        if (groups && Object.keys(groups).length > 0) {
          for (const [id, meta] of Object.entries(groups)) {
            if (global.updateGroupMetadataCache) global.updateGroupMetadataCache(id, meta)
          }
          console.log(chalk.green(`✅ [GROUP PRE-FETCH] Cache pre-populated untuk ${Object.keys(groups).length} grup via groupFetchAllParticipating.`))
        }
      } catch (e) {
        console.error(chalk.red('[GROUP PRE-FETCH ERROR]'), e?.message)
      }
    }, 5000)

    // E2EE Pre-Key Warmup Ping (Sinkronisasi Kunci E2EE Otomatis Pasca Connection)
    try {
      if (conn.ws && conn.ws.isOpen) {
        await conn.sendPresenceUpdate('available')
        await conn.appPatch({ type: 'regular' }).catch(() => {})
        console.log(chalk.green('⚡ [E2EE Pre-Key Warmup] Kunci E2EE grup tersinkronisasi murni!'))
      }
    } catch (e) {
      /* E2EE Warmup skipped */
    }

    if (!conn.sewaInit) {
      initSewaCheck(conn)
      conn.sewaInit = true
    }
  } else if (connection === 'connecting') {
    console.log(chalk.green('⏱️ Koneksi connecting'))
  }

  if (isOnline === true) {
    console.log(chalk.green('⚡ Status Aktif'))
  } else if (isOnline === false) {
    console.log(chalk.redBright('Status Mati'))
  }

  if (receivedPendingNotifications) {
    console.log(chalk.yellow('Menunggu Pesan Baru'))
  }

  if (
    connection === 'close' &&
    conn.ws.readyState !== CONNECTING
  ) {
    const statusCode = lastDisconnect?.error?.output?.statusCode
    const reason = disconnectReasonName(statusCode)
    const message = lastDisconnect?.error?.message || lastDisconnect?.error?.output?.payload?.message || 'Unknown reason'

    console.log(chalk.redBright(`❌ Koneksi close: ${reason} (${statusCode || 'no-code'}) - ${message}`))

    if (statusCode === DisconnectReason.loggedOut) {
      console.log(chalk.yellow('Sesi logout. Hapus folder sessions/creds.json lalu pairing ulang.'))
      return
    }

    if (!conn.authState.creds.registered && pairingCodeRequested) {
      console.log(chalk.yellow('Pairing code sudah dibuat. Masukkan kode di WhatsApp dulu; bot tidak akan reconnect cepat agar kode tidak loop.'))
      return
    }

    scheduleReconnect()
  }
}

  if (global.db.data == null) {
    await global.loadDatabase()
  }
  
  // Persist global options from DB
  if (!global.db.data.settings['bot']) global.db.data.settings['bot'] = {}
  Object.assign(global.opts, global.db.data.settings['bot'])
process.on('uncaughtException', console.error)
// let strQuot = /(["'])(?:(?=(\\?))\2.)*?\1/

let isInit = true
let isReloadingHandler = false
const RELOAD_TIMEOUT_MS = 45000 // 45 detik batas timeout reload
let handler = await import('./handler.js')

global.reloadHandler = async function (restatConn) {
  if (isReloadingHandler) {
    console.log(chalk.yellow('[RELOAD] reloadHandler already in progress, ignoring overlapping invocation.'))
    return false
  }
  isReloadingHandler = true

  let reloadTimer
  const timeoutPromise = new Promise((_, reject) => {
    reloadTimer = setTimeout(() => {
      reject(new Error(`Reload operation timed out after ${RELOAD_TIMEOUT_MS / 1000}s`))
    }, RELOAD_TIMEOUT_MS)
  })

  const executeReload = async () => {
    try {
      const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
      if (Object.keys(Handler || {}).length) handler = Handler
    } catch (e) {
      console.error(e)
    }
    if (restatConn) {
      const oldChats = global.conn.chats
      try { global.conn.ws.close() } catch { }
      conn.ev.removeAllListeners()
      global.conn = makeWASocket(connectionOptions, { chats: oldChats })
      bindSocketStores(global.conn)
      isInit = true
    }
    if (!isInit) {
      if (conn.callHandler) conn.ev.off('call', conn.callHandler)
      conn.ev.off('messages.upsert', conn.handler)
      conn.ev.off('group-participants.update', conn.participantsUpdate)
      conn.ev.off('groups.update', conn.groupsUpdate)
      conn.ev.off('connection.update', conn.connectionUpdate)
      conn.ev.off('creds.update', conn.credsUpdate)
    }

    conn.welcome = '❖━━━〔 ようこそ 〕━━━❖\n\n' +
      '┏━━━━━━━━━━━━━━━\n' +
      '┃ 🌸 @subject\n' +
      '┣━━━━━━━━━━━━━━━\n' +
      '┃ (≧◡≦) ♡ Hai @user\n' +
      '┃ Selamat datang\n' +
      '┣━━━〔 自己紹介 〕━━━\n' +
      '┃ • Nama   : \n' +
      '┃ • Usia   : \n' +
      '┃ • Gender : \n' +
      '┗━━━━━━━━━━━━━━━\n\n' +
      '━━━〔 グループ情報 〕━━━\n' +
      '@desc'
    conn.bye = '❖━━━〔 さようなら 〕━━━❖\n\n' +
      '(｡•́︿•̀｡) @user telah pergi\n' +
      'Semoga kita bertemu lagi 🌙'
    conn.spromote = '@user Sekarang jadi admin!'
    conn.sdemote = '@user Sekarang bukan lagi admin!'
    conn.sDesc = 'Deskripsi telah diubah menjadi \n@desc'
    conn.sSubject = 'Judul grup telah diubah menjadi \n@subject'
    conn.sIcon = 'Icon grup telah diubah!'
    conn.sRevoke = 'Link group telah diubah ke \n@revoke'
    conn.sAnnounceOn = 'Group telah di tutup!\nsekarang hanya admin yang dapat mengirim pesan.'
    conn.sAnnounceOff = 'Group telah di buka!\nsekarang semua peserta dapat mengirim pesan.'
    conn.sRestrictOn = 'Edit Info Grup di ubah ke hanya admin!'
    conn.sRestrictOff = 'Edit Info Grup di ubah ke semua peserta!'

    conn.handler = handler.handler.bind(global.conn)
    conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
    conn.groupsUpdate = handler.groupsUpdate.bind(global.conn)
    conn.connectionUpdate = connectionUpdate.bind(global.conn)
    conn.credsUpdate = saveCreds.bind(global.conn)
    conn.callHandler = async (call) => {
      console.log('Panggilan diterima:', call);
      if (call.status === 'ringing') {
        await conn.rejectCall(call.id);
        console.log('Panggilan ditolak');
      }
    };

    conn.ev.on('call', conn.callHandler)
    conn.ev.on('messages.upsert', conn.handler)
    conn.ev.on('group-participants.update', conn.participantsUpdate)
    conn.ev.on('groups.update', conn.groupsUpdate)
    conn.ev.on('connection.update', conn.connectionUpdate)
    conn.ev.on('creds.update', conn.credsUpdate)
    isInit = false
    return true
  }

  try {
    return await Promise.race([executeReload(), timeoutPromise])
  } catch (err) {
    console.error(chalk.red(`❌ [RELOAD TIMEOUT/ERROR] ${err?.message || err}. Force-unlocking mutex...`))
    if (restatConn) {
      console.log(chalk.yellow('🔄 [RELOAD AUTO-RECOVER] Triggering scheduleReconnect to recover socket state...'))
      scheduleReconnect()
    }
    return false
  } finally {
    clearTimeout(reloadTimer)
    isReloadingHandler = false
  }
}

const pluginFolder = join(__dirname, './plugins')
const pluginFilter = filename => /\.js$/.test(filename)
const normalizePluginPath = filename => filename.split(path.sep).join('/')
const pluginKey = filename => normalizePluginPath(path.relative(pluginFolder, filename))
const pluginFiles = (dir = pluginFolder) => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const fullPath = join(dir, entry.name)
  if (entry.isDirectory()) return pluginFiles(fullPath)
  return pluginFilter(entry.name) ? [fullPath] : []
})
const pluginDirs = (dir = pluginFolder) => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const fullPath = join(dir, entry.name)
  return entry.isDirectory() ? [fullPath, ...pluginDirs(fullPath)] : []
})
let pluginWatchers = []
let pluginWatchRefreshTimeout

function formatPluginModule(module) {
  let loaded = module.default || module
  if (loaded && (typeof loaded === 'function' || typeof loaded === 'object')) {
    for (let key in module) {
      if (key !== 'default' && !(key in loaded)) {
        try { loaded[key] = module[key] } catch {}
      }
    }
  }
  return loaded
}

global.plugins = {}
async function filesInit() {
  for (let filePath of pluginFiles()) {
    const filename = pluginKey(filePath)
    try {
      let file = global.__filename(filePath)
      const module = await import(file)
      global.plugins[filename] = formatPluginModule(module)
    } catch (e) {
      conn.logger.error(e)
      delete global.plugins[filename]
    }
  }
}
filesInit().then(_ => console.log(Object.keys(global.plugins))).catch(console.error)

global.reload = async (_ev, filename) => {
  if (!filename) return filesInit()
  filename = normalizePluginPath(filename)
  if (pluginFilter(filename)) {
    let dir = global.__filename(join(pluginFolder, filename), true)
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`re - require plugin '${filename}'`)
      else {
        conn.logger.warn(`deleted plugin '${filename}'`)
        return delete global.plugins[filename]
      }
    } else conn.logger.info(`requiring new plugin '${filename}'`)
    let err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true
    })
    if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
    else try {
      const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`))
      global.plugins[filename] = formatPluginModule(module)
    } catch (e) {
      conn.logger.error(`error require plugin '${filename}\n${format(e)}'`)
    } finally {
      global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
    }
  }
}
Object.freeze(global.reload)
function watchPluginFolder() {
  for (const watcher of pluginWatchers) watcher.close()
  pluginWatchers = []
  try {
    pluginWatchers.push(watch(pluginFolder, { recursive: true }, global.reload))
  } catch {
    const refreshWatchers = () => {
      clearTimeout(pluginWatchRefreshTimeout)
      pluginWatchRefreshTimeout = setTimeout(watchPluginFolder, 500)
    }
    for (const dir of [pluginFolder, ...pluginDirs()]) {
      pluginWatchers.push(watch(dir, (event, filename) => {
        if (filename) global.reload(event, normalizePluginPath(path.relative(pluginFolder, join(dir, filename))))
        if (event === 'rename') refreshWatchers()
      }))
    }
  }
}
watchPluginFolder()
await global.reloadHandler()
if (pairingPhoneNumber) startPairingCode(pairingPhoneNumber)

// Quick Test

async function _quickTest() {
  let test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version'])
  ].map(p => {
    return Promise.race([
      new Promise(resolve => {
        p.on('close', code => {
          resolve(code !== 127);
        });
      }),
      new Promise(resolve => {
        p.on('error', _ => resolve(false));
      })
    ]);
  }));

  let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  console.log(test);

  let s = global.support = {
    ffmpeg,
    ffprobe,
    ffmpegWebp,
    convert,
    magick,
    gm,
    find
  };

  Object.freeze(global.support);

  if (!s.ffmpeg) {
    conn.logger.warn(`Silahkan install ffmpeg terlebih dahulu agar bisa mengirim video`);
  }

  if (s.ffmpeg && !s.ffmpegWebp) {
    conn.logger.warn('Sticker Mungkin Tidak Beranimasi tanpa libwebp di ffmpeg (--enable-libwebp while compiling ffmpeg)');
  }

  if (!s.convert && !s.magick && !s.gm) {
    conn.logger.warn('Fitur Stiker Mungkin Tidak Bekerja Tanpa imagemagick dan libwebp di ffmpeg belum terinstall (pkg install imagemagick)');
  }
}

_quickTest()
  .then(() => conn.logger.info('☑️ Quick Test Done , nama file session ~> creds.json'))
  .catch(console.error);
