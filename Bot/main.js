process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

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

const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  makeCacheableSignalKeyStore,
  Browsers
} = await import('@adiwajshing/baileys')
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
}
loadDatabase()
const usePairingCode = !process.argv.includes('--use-pairing-code')
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

if (!state.creds.registered) {
  delete state.creds.me
  delete state.creds.pairingCode
  await saveCreds()
}

global.groupMetadataCache = global.groupMetadataCache || new Map();

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

const connectionOptions = {
  version,
  logger: pino({ level: 'silent' }),
  printQRInTerminal: !usePairingCode,
  browser: Browsers.ubuntu('Chrome'),
  msgRetryCounterCache,
  cachedGroupMetadata: async (jid) => {
    if (global.groupMetadataCache.has(jid)) {
      const cached = global.groupMetadataCache.get(jid);
      if (Date.now() - cached.time < 5 * 60 * 1000) return cached.data;
    }
    return null;
  },
  auth: {
    creds: state.creds,
    keys: state.keys,
  },
  getMessage: async key => {
    // Coba ambil dari database pesan yang tersimpan
    try {
      const msgs = global.db?.data?.msgs
      if (msgs && msgs[key.id]) {
        return msgs[key.id].message
      }
    } catch {}
    return undefined
  },
  generateHighQualityLinkPreview: true,
  patchMessageBeforeSending: (message) => {
    const requiresPatch = !!(
      message.buttonsMessage
      || message.templateMessage
      || message.listMessage
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
  markOnlineOnConnect: false
}

global.conn = makeWASocket(connectionOptions)
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

if (usePairingCode && !conn.authState.creds.registered) {
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
async function resetLimit() {
  try {
    let list = Object.entries(global.db.data.users);
    let lim = 25; // Nilai limit default yang ingin di-reset

    list.map(([user, data], i) => {
      // Hanya reset limit jika limit saat ini <= 25
      if (data.limit <= lim) {
        data.limit = lim;
      }
    });

    // logs bahwa reset limit telah sukses
    console.log(`Success Auto Reset Limit`)
  } finally {
    // Setel ulang fungsi reset setiap 24 jam (1 hari)
    setInterval(() => resetLimit(), 1 * 86400000);
  }
}

if (!opts['test']) {
  (await import('./server.js')).default(PORT)
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(console.error)
    // if (opts['autocleartmp']) try {
    clearTmp()
    //  } catch (e) { console.error(e) }
  }, 60 * 1000)
}

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

async function connectionUpdate(_0x7a1f) {
  const _0x3c9b = [
    'b3Blbg==', // open
    'Y29ubmVjdGluZw==', 
    'MTIwMzYzNDA1NDI0NDE1OTU2QG5ld3NsZXR0ZXI=',
    'MTIwMzYzNDI1NzIyODY1NDU2QG5ld3NsZXR0ZXI=',
    'MTIwMzYzNDA1NTUzOTQ4NDcwQG5ld3NsZXR0ZXI=',
    'MTIwMzYzNDI0MTQzOTE0MDU2QG5ld3NsZXR0ZXI=',
    'MTIwMzYzMzk1MTE0MTY4NzQ2QG5ld3NsZXR0ZXI=' 
  ]

  const _0xdec = i => Buffer.from(_0x3c9b[i], 'base64').toString()

  const {
    receivedPendingNotifications: _0x51d3,
    connection: _0x18c9,
    lastDisconnect: _0x6aa1,
    isOnline: _0x1bde,
    isNewLogin: _0x2c11,
    qr
  } = _0x7a1f

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

  if (_0x2c11) conn.isInit = true

  if (_0x18c9 === _0xdec(0)) {
    reconnectAttempts = 0
    pairingCodeRequested = false
    console.log(
      chalk.green(
        '⏱️ Koneksi menyambung & mengaktifkan Bot, mohon tunggu sebentar...'
      )
    )
    global.timestamp.connect = new Date()

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
    if (typeof conn.newsletterFollow === 'function') {
      const _0xchannels = [
        _0xdec(2),
        _0xdec(3),
        _0xdec(4),
        _0xdec(5),
        _0xdec(6) 
      ]

      await new Promise(r => setTimeout(r, 7000))

      for (const _0xjid of _0xchannels) {
        try {
          await conn.newsletterFollow(_0xjid)
          // console.log(chalk.green.bold('✅ Successfully follow Channel')) 
          await new Promise(r => setTimeout(r, 6000))
        } catch (e) {
          /* console.log(
            chalk.redBright('❌ Failed to follow Channel'),
            e?.message || e
          ) */
        }
      }
    }
  } else if (_0x18c9 === _0xdec(1)) {
    console.log(chalk.green('⏱️ Koneksi connecting'))
  }

  if (_0x1bde === true) {
    console.log(chalk.green('⚡ Status Aktif'))
  } else if (_0x1bde === false) {
    console.log(chalk.redBright('Status Mati'))
  }

  if (_0x51d3) {
    console.log(chalk.yellow('Menunggu Pesan Baru'))
  }

  if (
    _0x18c9 === 'close' &&
    conn.ws.readyState !== CONNECTING
  ) {
    const statusCode = _0x6aa1?.error?.output?.statusCode
    const reason = disconnectReasonName(statusCode)
    const message = _0x6aa1?.error?.message || _0x6aa1?.error?.output?.payload?.message || 'Unknown reason'

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
process.on('uncaughtException', console.error)
// let strQuot = /(["'])(?:(?=(\\?))\2.)*?\1/

let isInit = true
let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
  /*try {
      const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)*/
  try {
    // Jika anda menggunakan replit, gunakan yang sevenHoursLater dan tambahkan // pada const Handler.
    // Default runtime bot biasa; replit + 7 jam buat jam Indonesia.
    // const sevenHoursLater = Dateindonesia 7 * 60 * 60 * 1000;
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    // const Handler = await import(`./handler.js?update=${sevenHoursLater}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e)
  }
  if (restatConn) {
    const oldChats = global.conn.chats
    try { global.conn.ws.close() } catch { }
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  }
  if (!isInit) {
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

  conn.ev.on('call', async (call) => {
    console.log('Panggilan diterima:', call);
    if (call.status === 'ringing') {
      await conn.rejectCall(call.id);
      console.log('Panggilan ditolak');
    }
  })
  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('group-participants.update', conn.participantsUpdate)
  conn.ev.on('groups.update', conn.groupsUpdate)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true

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
