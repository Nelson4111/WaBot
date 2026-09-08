import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'fs'
import path, { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pino from 'pino'
import chalk from 'chalk'
import { makeWASocket, resolveLid } from './simple.js'
import store from './store.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const JADIBOT_DIR = join(__dirname, '../jadibot')

// Pastikan direktori root jadibot tersedia
if (!existsSync(JADIBOT_DIR)) {
  mkdirSync(JADIBOT_DIR, { recursive: true })
}

// In-Memory Jadibot Map
global.jadibots = global.jadibots || new Map()

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Menerjemahkan input (nomor HP, JID, LID, 'me', mention, quoted)
 * menjadi objek identitas terstruktur:
 * { phoneNumber, phoneJid, lid, isLid, unresolved, invalid, rawInput }
 *
 * @param {object} [conn] Baileys connection instance
 * @param {string|null} [input] Target input (bisa string nomor, JID, LID, atau 'me')
 * @param {object} [m] Context message Baileys
 * @returns {Promise<{ phoneNumber: string|null, phoneJid: string|null, lid: string|null, isLid: boolean, unresolved?: boolean, invalid?: boolean, rawInput: string }>}
 */
export async function resolveWaUser(conn, input, m = null) {
  let raw = ''
  if (typeof input === 'string') {
    raw = input.trim()
  }

  // Jika input adalah keyword 'me' / 'saya' / 'self'
  if (/^(me|saya|self)$/i.test(raw)) {
    raw = m?.sender || ''
  }

  // Jika raw kosong, coba ekstrak dari context message
  if (!raw && m) {
    if (m.quoted && m.quoted.sender) {
      raw = m.quoted.sender
    } else if (Array.isArray(m.mentionedJid) && m.mentionedJid.length > 0) {
      raw = m.mentionedJid[0]
    }
  }

  if (!raw) {
    return {
      phoneNumber: null,
      phoneJid: null,
      lid: null,
      isLid: false,
      rawInput: ''
    }
  }

  // 1. Cek langsung senderPn dari m.key (jika raw mengacu pada m.sender)
  if (m && m.sender && (raw === m.sender || raw === m.sender.split('@')[0]) && m.key?.senderPn) {
    const pnJid = m.key.senderPn.split(':')[0].replace(/@.+/, '') + '@s.whatsapp.net'
    const pn = pnJid.split('@')[0]
    if (m.sender.endsWith('@lid')) {
      if (!global.lids) global.lids = {}
      global.lids[m.sender] = pnJid
      if (global.db?.data) {
        if (!global.db.data.lids) global.db.data.lids = {}
        global.db.data.lids[m.sender] = pnJid
      }
    }
    return {
      phoneNumber: pn,
      phoneJid: pnJid,
      lid: m.sender.endsWith('@lid') ? m.sender : null,
      isLid: m.sender.endsWith('@lid'),
      rawInput: raw
    }
  }

  // 2. Cek quoted senderPn jika target adalah m.quoted.sender
  if (m?.quoted && (raw === m.quoted.sender || raw === m.quoted.sender?.split('@')[0])) {
    const quotedPn = m.quoted.fakeObj?.key?.senderPn || m.quoted.vM?.key?.senderPn
    if (quotedPn && quotedPn.endsWith('@s.whatsapp.net')) {
      const pnJid = quotedPn.split(':')[0].replace(/@.+/, '') + '@s.whatsapp.net'
      const pn = pnJid.split('@')[0]
      const qSender = m.quoted.sender
      if (qSender && qSender.endsWith('@lid')) {
        if (!global.lids) global.lids = {}
        global.lids[qSender] = pnJid
        if (global.db?.data) {
          if (!global.db.data.lids) global.db.data.lids = {}
          global.db.data.lids[qSender] = pnJid
        }
      }
      return {
        phoneNumber: pn,
        phoneJid: pnJid,
        lid: qSender?.endsWith('@lid') ? qSender : null,
        isLid: qSender?.endsWith('@lid') || false,
        rawInput: raw
      }
    }
  }

  // Hapus karakter '@' di awal jika ada
  if (raw.startsWith('@')) raw = raw.slice(1).trim()

  // Cek apakah raw berakhiran atau berformat LID
  let isLid = raw.endsWith('@lid') || /:\d+@lid$/i.test(raw)
  let cleanLid = null

  if (isLid) {
    cleanLid = raw.split('@')[0].split(':')[0] + '@lid'
  } else {
    // Periksa apakah angka murni ini sebenarnya adalah nomor LID yang ada di cache/database
    const digitsOnly = raw.replace(/[^0-9]/g, '')
    if (digitsOnly.length >= 13) {
      const candidateLid = `${digitsOnly}@lid`
      if (
        global.lids?.[candidateLid] ||
        global.db?.data?.lids?.[candidateLid] ||
        (global.groupMetadataCache && Array.from(global.groupMetadataCache.values()).some(e => e?.data?.participants?.some(p => (p.lid || p.id) === candidateLid)))
      ) {
        isLid = true
        cleanLid = candidateLid
      }
    }
  }

  // Jika input teridentifikasi sebagai LID
  if (isLid && cleanLid) {
    // 1. Cek synchronous resolver (global.lids, db.lids, cache grup, conn.chats, users db)
    let resolved = typeof resolveLid === 'function' ? resolveLid(cleanLid) : (global.lids?.[cleanLid] || global.db?.data?.lids?.[cleanLid])
    if (resolved && resolved.endsWith('@s.whatsapp.net')) {
      const phoneDigits = resolved.split('@')[0]
      return {
        phoneNumber: phoneDigits,
        phoneJid: resolved,
        lid: cleanLid,
        isLid: true,
        rawInput: raw
      }
    }

    // 2. Jika pesan berasal dari grup dan metadata peserta belum lengkap, coba fetch metadata
    const activeConn = conn || global.conn
    if (m?.chat?.endsWith('@g.us') && activeConn?.groupMetadata) {
      try {
        const meta = await activeConn.groupMetadata(m.chat).catch(() => null)
        if (meta?.participants) {
          for (const p of meta.participants) {
            const pLid = p.lid || (p.id?.endsWith('@lid') ? p.id : null)
            const cleanPLid = pLid ? pLid.split(':')[0].replace(/@.+/, '') + '@lid' : null
            if (pLid === cleanLid || cleanPLid === cleanLid || p.id === cleanLid) {
              const pJid = p.jid || p.phoneNumber || (p.id?.endsWith('@s.whatsapp.net') ? p.id : null)
              if (pJid && pJid.endsWith('@s.whatsapp.net')) {
                const cleanPhoneJid = pJid.split(':')[0].replace(/@.+/, '') + '@s.whatsapp.net'
                const phoneDigits = cleanPhoneJid.split('@')[0]
                if (!global.lids) global.lids = {}
                global.lids[cleanLid] = cleanPhoneJid
                if (global.db?.data) {
                  if (!global.db.data.lids) global.db.data.lids = {}
                  global.db.data.lids[cleanLid] = cleanPhoneJid
                }
                return {
                  phoneNumber: phoneDigits,
                  phoneJid: cleanPhoneJid,
                  lid: cleanLid,
                  isLid: true,
                  rawInput: raw
                }
              }
            }
          }
        }
      } catch {}
    }

    // 3. Cek database global.db.data.users
    if (global.db?.data?.users) {
      for (const [realJid, uData] of Object.entries(global.db.data.users)) {
        if ((uData?.lid === cleanLid || uData?.lid === raw) && realJid.endsWith('@s.whatsapp.net')) {
          const cleanPhoneJid = realJid.split(':')[0].replace(/@.+/, '') + '@s.whatsapp.net'
          const phoneDigits = cleanPhoneJid.split('@')[0]
          if (!global.lids) global.lids = {}
          global.lids[cleanLid] = cleanPhoneJid
          if (global.db?.data) {
            if (!global.db.data.lids) global.db.data.lids = {}
            global.db.data.lids[cleanLid] = cleanPhoneJid
          }
          return {
            phoneNumber: phoneDigits,
            phoneJid: cleanPhoneJid,
            lid: cleanLid,
            isLid: true,
            rawInput: raw
          }
        }
      }
    }

    // 4. Query onWhatsApp jika socket aktif
    if (activeConn?.onWhatsApp) {
      try {
        const check = await activeConn.onWhatsApp(cleanLid).catch(() => null)
        if (check?.[0]?.jid && check[0].jid.endsWith('@s.whatsapp.net')) {
          const cleanPhoneJid = check[0].jid.split(':')[0].replace(/@.+/, '') + '@s.whatsapp.net'
          const phoneDigits = cleanPhoneJid.split('@')[0]
          if (!global.lids) global.lids = {}
          global.lids[cleanLid] = cleanPhoneJid
          if (global.db?.data) {
            if (!global.db.data.lids) global.db.data.lids = {}
            global.db.data.lids[cleanLid] = cleanPhoneJid
          }
          return {
            phoneNumber: phoneDigits,
            phoneJid: cleanPhoneJid,
            lid: cleanLid,
            isLid: true,
            rawInput: raw
          }
        }
      } catch {}
    }

    // LID tidak dapat dipetakan ke nomor telepon asli
    return {
      phoneNumber: null,
      phoneJid: null,
      lid: cleanLid,
      isLid: true,
      unresolved: true,
      rawInput: raw
    }
  }

  // Input bukan LID (berupa nomor telepon / JID biasa)
  let cleanDigits = raw.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

  // Normalisasi nomor lokal Indonesia (08... -> 628... atau 8... -> 628...)
  if (cleanDigits.startsWith('08')) {
    cleanDigits = '628' + cleanDigits.slice(2)
  } else if (cleanDigits.startsWith('8') && cleanDigits.length >= 9 && cleanDigits.length <= 13) {
    cleanDigits = '628' + cleanDigits.slice(1)
  } else if (cleanDigits.startsWith('0') && cleanDigits.length >= 10) {
    cleanDigits = cleanDigits.replace(/^0+/, '')
  }

  // Validasi panjang nomor telepon internasional (10 - 16 digit)
  if (cleanDigits.length < 10 || cleanDigits.length > 16) {
    return {
      phoneNumber: null,
      phoneJid: null,
      lid: null,
      isLid: false,
      invalid: true,
      rawInput: raw
    }
  }

  const phoneJid = `${cleanDigits}@s.whatsapp.net`

  // Cari apakah ada LID yang berelasi di cache
  let knownLid = null
  if (global.lids) {
    for (const [lidKey, mappedJid] of Object.entries(global.lids)) {
      if (mappedJid === phoneJid) {
        knownLid = lidKey
        break
      }
    }
  }

  return {
    phoneNumber: cleanDigits,
    phoneJid,
    lid: knownLid,
    isLid: false,
    rawInput: raw
  }
}

/**
 * Tunggu hingga socket WhatsApp terbuka
 */
function waitForSocketOpen(sock, timeoutMs = 60000) {
  if (sock.ws?.isOpen) return Promise.resolve()

  return new Promise((resolve, reject) => {
    let interval
    let timeout
    let settled = false

    const cleanup = () => {
      clearInterval(interval)
      clearTimeout(timeout)
      sock.ev?.off('connection.update', onConnectionUpdate)
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
        const message = lastDisconnect?.error?.message || 'Koneksi ditutup sebelum pairing'
        return done(new Error(message))
      }
    }

    interval = setInterval(() => {
      if (sock.ws?.isOpen) done()
    }, 500)

    timeout = setTimeout(() => {
      done(new Error('Timeout menunggu socket WhatsApp terbuka'))
    }, timeoutMs)

    sock.ev?.on('connection.update', onConnectionUpdate)
  })
}

/**
 * Minta Pairing Code dengan mekanisme retry
 */
async function requestPairingCodeWithRetry(sock, phoneNumber, retries = 3) {
  let lastError
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await waitForSocketOpen(sock)
      await sleep(1500)
      return await sock.requestPairingCode(phoneNumber)
    } catch (e) {
      lastError = e
      console.error(chalk.yellow(`[JADIBOT] Percobaan pairing ${attempt}/${retries} untuk +${phoneNumber} gagal: ${e?.message || e}`))
      if (attempt < retries) await sleep(3000)
    }
  }
  throw lastError
}

/**
 * Simpan metadata sesi (userJid requester, createdAt, dll)
 */
function saveMetadata(sessionDir, data) {
  try {
    const metaPath = join(sessionDir, 'metadata.json')
    writeFileSync(metaPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[JADIBOT] Gagal menyimpan metadata:', e.message)
  }
}

/**
 * Baca metadata sesi
 */
function readMetadata(sessionDir) {
  try {
    const metaPath = join(sessionDir, 'metadata.json')
    if (existsSync(metaPath)) {
      return JSON.parse(readFileSync(metaPath, 'utf-8'))
    }
  } catch {}
  return null
}

/**
 * Pasang template teks default pada sub-bot
 */
function attachBotProperties(sock) {
  sock.isJadibot = true
  sock.welcome = '❖━━━〔 ようこそ 〕━━━❖\n\n' +
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
  sock.bye = '❖━━━〔 さようなら 〕━━━❖\n\n' +
    '(｡•́︿•̀｡) @user telah pergi\n' +
    'Semoga kita bertemu lagi 🌙'
  sock.spromote = '@user Sekarang jadi admin!'
  sock.sdemote = '@user Sekarang bukan lagi admin!'
  sock.sDesc = 'Deskripsi telah diubah menjadi \n@desc'
  sock.sSubject = 'Judul grup telah diubah menjadi \n@subject'
  sock.sIcon = 'Icon grup telah diubah!'
  sock.sRevoke = 'Link group telah diubah ke \n@revoke'
  sock.sAnnounceOn = 'Group telah di tutup!\nsekarang hanya admin yang dapat mengirim pesan.'
  sock.sAnnounceOff = 'Group telah di buka!\nsekarang semua peserta dapat mengirim pesan.'
  sock.sRestrictOn = 'Edit Info Grup di ubah ke hanya admin!'
  sock.sRestrictOff = 'Edit Info Grup di ubah ke semua peserta!'
}

/**
 * Hapus folder sesi dan kirim pesan notifikasi ke user
 */
export async function deleteSessionAndNotify(phoneNumber, userJid, reason) {
  const cleanPhone = String(phoneNumber).replace(/[^0-9]/g, '')
  const record = global.jadibots.get(cleanPhone)

  if (record) {
    record.isStopping = true
    try { record.sock?.ws?.close() } catch {}
    try { record.sock?.ev?.removeAllListeners() } catch {}
    global.jadibots.delete(cleanPhone)
  }

  const sessionDir = join(JADIBOT_DIR, cleanPhone)
  if (existsSync(sessionDir)) {
    try {
      rmSync(sessionDir, { recursive: true, force: true })
      console.log(chalk.green(`🗑️ [JADIBOT] Sesi ./jadibot/${cleanPhone} berhasil dihapus.`))
    } catch (e) {
      console.error(`❌ [JADIBOT] Gagal menghapus folder sesi ${cleanPhone}:`, e.message)
    }
  }

  // Pastikan userJid diterjemahkan ke Phone JID agar sampai ke WhatsApp user
  let targetNotifyJid = userJid
  if (targetNotifyJid && targetNotifyJid.endsWith('@lid')) {
    const res = typeof resolveLid === 'function' ? resolveLid(targetNotifyJid) : null
    if (res && res.endsWith('@s.whatsapp.net')) targetNotifyJid = res
  }

  // Kirim notifikasi ke targetNotifyJid melalui bot utama
  if (targetNotifyJid && global.conn && global.conn.ws?.isOpen) {
    try {
      const text = `*╭  〔 ⚠ ᴘ ᴇ ᴍ ʙ ᴇ ʀ ɪ ᴛ ᴀ ʜ ᴜ ᴀ ɴ  ᴊ ᴀ ᴅ ɪ ʙ ᴏ ᴛ 〕*\n` +
        `> Halo kak, sesi Jadibot untuk nomor *+${cleanPhone}* telah dihapus otomatis dari sistem.\n\n` +
        `*╭  〔 ✦ ᴋ ᴇ ᴛ ᴇ ʀ ᴀ ɴ ɢ ᴀ ɴ 〕*\n` +
        `*┆* ⟡ ᴀʟᴀꜱᴀɴ : *${reason}*\n` +
        `*╰───────────────*\n\n` +
        `> _Ketik *.jadibot* untuk melakukan pairing ulang kapan saja._`

      await global.conn.sendMessage(targetNotifyJid, { text })
    } catch (e) {
      console.error(`[JADIBOT NOTIFY FAIL] +${cleanPhone}:`, e.message)
    }
  }
}

/**
 * Hentikan sub-bot dan hapus sesi (perintah .stopjadibot)
 */
export async function stopJadibot(phoneNumber, notify = true, requesterJid = null) {
  const cleanPhone = String(phoneNumber).replace(/[^0-9]/g, '')
  const record = global.jadibots.get(cleanPhone)
  let targetUserJid = requesterJid || record?.userJid

  if (targetUserJid && targetUserJid.endsWith('@lid')) {
    const res = typeof resolveLid === 'function' ? resolveLid(targetUserJid) : null
    if (res && res.endsWith('@s.whatsapp.net')) targetUserJid = res
  }

  if (record) {
    record.isStopping = true
    try { record.sock?.ws?.close() } catch {}
    try { record.sock?.ev?.removeAllListeners() } catch {}
    global.jadibots.delete(cleanPhone)
  }

  const sessionDir = join(JADIBOT_DIR, cleanPhone)
  if (existsSync(sessionDir)) {
    try {
      rmSync(sessionDir, { recursive: true, force: true })
    } catch (e) {
      console.error(`❌ [JADIBOT] Gagal menghapus folder sesi ${cleanPhone}:`, e.message)
    }
  }

  if (notify && targetUserJid && global.conn && global.conn.ws?.isOpen) {
    try {
      await global.conn.sendMessage(targetUserJid, {
        text: `*╭  〔 ✦ ᴊ ᴀ ᴅ ɪ ʙ ᴏ ᴛ  ᴅ ɪ ʜ ᴇ ɴ ᴛ ɪ ᴋ ᴀ ɴ 〕*\n> Sesi Jadibot untuk nomor *+${cleanPhone}* berhasil dihentikan dan dihapus dari sistem.\n*╰───────────────*`
      })
    } catch {}
  }

  return true
}

/**
 * Inisialisasi dan jalankan sesi Jadibot
 * @param {string} phoneNumber Nomor tujuan (digit)
 * @param {string} userJid JID pengguna yang meminta jadibot
 * @param {object} m Objek pesan (opsional)
 * @param {boolean} isRestart Apakah dipanggil saat auto-reconnect startup
 */
export async function startJadibot(phoneNumber, userJid, m = null, isRestart = false) {
  // Normalisasi nomor telepon dan userJid melalui resolveWaUser
  const resolvedTarget = await resolveWaUser(global.conn || null, phoneNumber, m)
  const cleanPhone = resolvedTarget.phoneNumber || String(phoneNumber).replace(/[^0-9]/g, '')
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error('Nomor telepon tidak valid. Minimal 10 digit angka.')
  }

  const sessionDir = join(JADIBOT_DIR, cleanPhone)
  if (!existsSync(sessionDir)) {
    mkdirSync(sessionDir, { recursive: true })
  }

  // Jika sudah ada record berjalan, bersihkan socket lama terlebih dahulu
  if (global.jadibots.has(cleanPhone)) {
    const existing = global.jadibots.get(cleanPhone)
    if (existing.status === 'open' && !isRestart) {
      return {
        alreadyActive: true,
        message: `Nomor +${cleanPhone} sudah aktif sebagai Jadibot.`
      }
    }
    existing.isStopping = true
    try { existing.sock?.ws?.close() } catch {}
    try { existing.sock?.ev?.removeAllListeners() } catch {}
    global.jadibots.delete(cleanPhone)
  }

  const prevMeta = readMetadata(sessionDir) || {}
  const resolvedUser = userJid ? await resolveWaUser(global.conn || null, userJid, m) : null
  const targetUserJid = resolvedUser?.phoneJid || (userJid && userJid.endsWith('@s.whatsapp.net') ? userJid : `${cleanPhone}@s.whatsapp.net`)
  const targetUserLid = resolvedUser?.lid || resolvedTarget?.lid || prevMeta.userLid || null

  const metadata = {
    phoneNumber: cleanPhone,
    userJid: targetUserJid,
    userLid: targetUserLid,
    createdAt: prevMeta.createdAt || Date.now(),
    lastConnected: Date.now()
  }
  saveMetadata(sessionDir, metadata)

  // Load modul Baileys & Handler
  const Baileys = await import('@whiskeysockets/baileys')
  const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
  } = Baileys

  let state, saveCreds
  try {
    const auth = await useMultiFileAuthState(sessionDir)
    state = auth.state
    saveCreds = auth.saveCreds
  } catch (err) {
    console.error(`[JADIBOT] Auth error for ${cleanPhone}:`, err.message)
    await deleteSessionAndNotify(cleanPhone, metadata.userJid, 'File kredensial sesi rusak (corrupted).')
    return { success: false, error: err.message }
  }

  let version
  try {
    const v = await fetchLatestBaileysVersion()
    version = v.version
  } catch {
    version = [2, 3000, 1017531287]
  }

  const connectionOptions = {
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    msgRetryCounterCache: {
      get: () => undefined,
      set: () => {},
      del: () => {}
    },
    getMessage: async (key) => {
      try {
        if (store && typeof store.loadMessage === 'function') {
          const msg = await store.loadMessage(key.remoteJid, key.id)
          if (msg) return msg.message || undefined
        }
      } catch {}
      return undefined
    },
    generateHighQualityLinkPreview: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    retryRequestDelayMs: 250,
    maxMsgRetryCount: 10,
    syncFullHistory: false,
    markOnlineOnConnect: true
  }

  const sock = makeWASocket(connectionOptions)
  attachBotProperties(sock)

  try {
    if (store) store.bind(sock)
  } catch {}

  const handler = await import('../handler.js')

  sock.handler = handler.handler.bind(sock)
  sock.participantsUpdate = handler.participantsUpdate.bind(sock)
  sock.groupsUpdate = handler.groupsUpdate.bind(sock)
  sock.credsUpdate = saveCreds.bind(sock)
  sock.callHandler = async (call) => {
    if (call.status === 'ringing') {
      await sock.rejectCall(call.id).catch(() => {})
    }
  }

  sock.ev.on('messages.upsert', sock.handler)
  sock.ev.on('group-participants.update', sock.participantsUpdate)
  sock.ev.on('groups.update', sock.groupsUpdate)
  sock.ev.on('call', sock.callHandler)
  sock.ev.on('creds.update', sock.credsUpdate)

  const record = {
    sock,
    phoneNumber: cleanPhone,
    userJid: metadata.userJid,
    sessionDir,
    startedAt: Date.now(),
    retryCount: 0,
    status: 'connecting',
    isStopping: false
  }
  global.jadibots.set(cleanPhone, record)

  // Event Connection Update
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, isNewLogin } = update
    if (record.isStopping) return

    if (connection === 'open') {
      record.status = 'open'
      record.retryCount = 0
      console.log(chalk.green(`🎉 [JADIBOT] +${cleanPhone} BERHASIL TERHUBUNG SEBAGAI SUB-BOT!`))

      metadata.lastConnected = Date.now()
      saveMetadata(sessionDir, metadata)

      // Kirim pesan sambutan & sukses ke userJid
      if (isNewLogin || !isRestart) {
        const successMsg = `*──  ୨୧ ✧ JADIBOT AKTIF ✧ ୨୧  ──*\n\n` +
          `*╭  〔 🤖 ꜱ ᴜ ʙ - ʙ ᴏ ᴛ  ᴛ ᴇ ʀ ʜ ᴜ ʙ ᴜ ɴ ɢ 〕*\n` +
          `*┆* ⟡ ɴᴏᴍᴏʀ  : *+${cleanPhone}*\n` +
          `*┆* ✦ ꜱᴛᴀᴛᴜꜱ : *Terhubung (Online) ㋡*\n` +
          `*┆* ⚙ ꜱʏꜱᴛᴇᴍ : *${global.namebot}*\n` +
          `*╰───────────────*\n\n` +
          `> ⟡ Nomor Anda kini merespons semua perintah bot.\n` +
          `> ⟡ Coba ketik *.menu* di chat pribadi atau grup.\n` +
          `> ⟡ Ketik *.stopjadibot* kapan saja untuk menghentikan bot.\n` +
          `> _Selamat menikmati fitur bot di akun Anda sendiri!_`

        try {
          await sock.sendMessage(metadata.userJid, { text: successMsg }).catch(async () => {
            if (global.conn?.ws?.isOpen) {
              await global.conn.sendMessage(metadata.userJid, { text: successMsg })
            }
          })
        } catch {}
      }
    }

    if (connection === 'close') {
      record.status = 'close'
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const errorMsg = lastDisconnect?.error?.message || 'Unknown disconnect reason'
      console.log(chalk.red(`⚠️ [JADIBOT] +${cleanPhone} Terputus: code=${statusCode}, pesan=${errorMsg}`))

      const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403

      if (isLoggedOut) {
        console.log(chalk.yellow(`[JADIBOT] +${cleanPhone} Terdeteksi Logout/Banned. Menghapus sesi...`))
        await deleteSessionAndNotify(
          cleanPhone,
          metadata.userJid,
          'Akun telah Logout dari WhatsApp atau tautan perangkat dicabut dari aplikasi WhatsApp Anda.'
        )
        return
      }

      // Reconnect sementara
      record.retryCount = (record.retryCount || 0) + 1
      console.log(chalk.yellow(`[JADIBOT] +${cleanPhone} Percobaan reconnect ${record.retryCount}/5...`))

      if (record.retryCount >= 5) {
        console.log(chalk.red(`[JADIBOT] +${cleanPhone} Gagal reconnect 5x berturut-turut. Menghapus sesi...`))
        await deleteSessionAndNotify(
          cleanPhone,
          metadata.userJid,
          'Terputus dari server WhatsApp secara berulang kali (gagal terhubung kembali setelah 5 kali percobaan) atau koneksi nomor tidak stabil.'
        )
        return
      }

      const delay = Math.min(30000, 3000 + record.retryCount * 3000)
      setTimeout(async () => {
        if (record.isStopping) return
        try {
          await startJadibot(cleanPhone, metadata.userJid, null, true)
        } catch (e) {
          console.error(`[JADIBOT] Error reconnecting +${cleanPhone}:`, e.message)
        }
      }, delay)
    }
  })

  // Jika sesi belum terdaftar dan bukan startup restart -> minta pairing code
  if (!sock.authState.creds.registered) {
    if (isRestart) {
      // Sesi belum selesai pairing saat bot restart, bersihkan
      await stopJadibot(cleanPhone, false)
      return { success: false, error: 'Sesi belum terdaftar saat restart' }
    }

    try {
      const rawCode = await requestPairingCodeWithRetry(sock, cleanPhone)
      const code = rawCode?.match(/.{1,4}/g)?.join('-') || rawCode

      // Set timeout pembatalan otomatis jika user tidak memasukkan kode dalam 2 menit
      setTimeout(() => {
        const cur = global.jadibots.get(cleanPhone)
        if (cur && cur.status !== 'open' && !cur.sock?.authState?.creds?.registered) {
          console.log(chalk.yellow(`[JADIBOT] Timeout pairing 2 menit untuk +${cleanPhone}. Membersihkan sesi...`))
          stopJadibot(cleanPhone, false)
        }
      }, 120000)

      return {
        success: true,
        code,
        phoneNumber: cleanPhone
      }
    } catch (err) {
      await stopJadibot(cleanPhone, false)
      throw new Error(`Gagal meminta kode pairing: ${err.message}`)
    }
  }

  return {
    success: true,
    alreadyRegistered: true,
    phoneNumber: cleanPhone
  }
}

/**
 * Scan seluruh folder jadibot dan auto-reconnect semua sesi saat bot restart
 */
export async function initAllJadibots(mainConn) {
  if (!existsSync(JADIBOT_DIR)) return

  const folders = readdirSync(JADIBOT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /^[0-9]+$/.test(name))

  if (folders.length === 0) {
    console.log(chalk.cyan('ℹ️ [JADIBOT] Tidak ada sesi Jadibot yang tersimpan.'))
    return
  }

  console.log(chalk.cyan(`🔄 [JADIBOT] Ditemukan ${folders.length} sesi Jadibot tersimpan, memulai auto-reconnect...`))

  for (const phone of folders) {
    const sessionDir = join(JADIBOT_DIR, phone)
    const credsPath = join(sessionDir, 'creds.json')

    // Jika tidak ada creds.json, berarti belum pernah berhasil pairing, hapus foldernya
    if (!existsSync(credsPath)) {
      try {
        rmSync(sessionDir, { recursive: true, force: true })
        console.log(chalk.gray(`[JADIBOT] Membersihkan sesi kosong/batal: ${phone}`))
      } catch {}
      continue
    }

    const metadata = readMetadata(sessionDir) || {}
    const userJid = metadata.userJid || `${phone}@s.whatsapp.net`

    try {
      console.log(chalk.cyan(`[JADIBOT] Menyambungkan kembali sub-bot: +${phone}...`))
      await startJadibot(phone, userJid, null, true)
      // Jeda 2 detik antar sub-bot agar tidak membebani koneksi bersamaan
      await sleep(2000)
    } catch (e) {
      console.error(`❌ [JADIBOT] Gagal auto-reconnect +${phone}:`, e.message)
    }
  }
}

/**
 * Ambil daftar semua Jadibot yang aktif
 */
export function getJadibotList() {
  const list = []
  for (const [phone, record] of global.jadibots.entries()) {
    list.push({
      phoneNumber: phone,
      userJid: record.userJid,
      status: record.status,
      startedAt: record.startedAt,
      uptime: Date.now() - (record.startedAt || Date.now())
    })
  }
  return list
}
