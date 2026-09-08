import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
import similarity from 'similarity'
import { addChat } from './lib/totalchat.js'
import { generateWelcomeCard, generateGoodbyeCard } from './lib/cardGenerator.js'
import { sendDualGroupMessage } from './lib/dual-group-message.js'
import { toSmallNum } from './lib/style.js'

/**
 * @type {import('@whiskeysockets/baileys')}
 */
const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))
const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

function getPrefixMatch(text, prefix) {
    if (typeof text !== 'string') return null
    let matches = (prefix instanceof RegExp ? [[prefix.exec(text), prefix]] :
        Array.isArray(prefix) ? prefix.map(p => {
            let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
            return [re.exec(text), re]
        }) :
        typeof prefix === 'string' ? [[new RegExp(str2Regex(prefix)).exec(text), new RegExp(str2Regex(prefix))]] :
        [[[], new RegExp]]
    ).find(p => p[0])
    return (matches?.[0] || '')[0] || null
}

function getCommandCandidate(text, prefix) {
    const usedPrefix = getPrefixMatch(text, prefix)
    if (!usedPrefix) return null
    const noPrefix = text.replace(usedPrefix, '').trim()
    const [command] = noPrefix.split(/\s+/).filter(Boolean)
    if (!command) return null
    return { usedPrefix, command: command.toLowerCase() }
}

function aliasesFromRegExp(re) {
    let source = re.source.replace(/^\^/, '').replace(/\$$/, '')
    while (/^\((?:\?:)?[^()]+\)$/.test(source)) source = source.replace(/^\((?:\?:)?/, '').replace(/\)$/, '')
    if (!/^[a-z0-9_|-]+$/i.test(source)) return []
    return source.split('|')
}

function getPluginCommandAliases(plugin) {
    const aliases = []
    const add = value => {
        if (!value) return
        let command = String(value).trim().split(/\s+/)[0].replace(/^[^\w-]+|[<[\]()>]+$/g, '').toLowerCase()
        if (command && /^[a-z0-9_-]+$/i.test(command)) aliases.push(command)
    }

    if (typeof plugin.command === 'string') add(plugin.command)
    else if (Array.isArray(plugin.command)) {
        for (const command of plugin.command) {
            if (command instanceof RegExp) aliasesFromRegExp(command).forEach(add)
            else add(command)
        }
    } else if (plugin.command instanceof RegExp) aliasesFromRegExp(plugin.command).forEach(add)

    if (Array.isArray(plugin.help)) plugin.help.forEach(add)
    else if (typeof plugin.help === 'string') add(plugin.help)

    return aliases
}

function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i])
    for (let j = 1; j <= b.length; j++) matrix[0][j] = j
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            )
        }
    }
    return matrix[a.length][b.length]
}

function findCommandSuggestions(command) {
    if (!command || command.length < 3) return []
    const aliases = [...new Set(Object.values(global.plugins || {})
        .filter(plugin => plugin && !plugin.disabled)
        .flatMap(getPluginCommandAliases))]

    return aliases
        .filter(alias => alias !== command)
        .map(alias => {
            const sim = similarity(command, alias)
            const distance = levenshtein(command, alias)
            const maxDistance = command.length <= 5 ? 2 : command.length <= 9 ? 3 : 4
            const accepted = sim >= 0.55 || (sim >= 0.45 && distance <= maxDistance)
            const score = sim * 100 - distance * 5 + (alias[0] === command[0] ? 5 : 0)
            return { alias, sim, distance, accepted, score }
        })
        .filter(item => item.accepted)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(item => item.alias)
}

async function replyCommandSuggestion(conn, m, candidate) {
    const suggestions = findCommandSuggestions(candidate.command)
    if (!suggestions.length) return
    const list = suggestions.map(alias => `│ › *${candidate.usedPrefix}${alias}*`).join('\n')
    await conn.reply(m.chat, `〔 ✦ *COMMAND TIDAK DITEMUKAN* 〕\n> Perintah *${candidate.usedPrefix}${candidate.command}* tidak ada.\n\n┌──〔 ✦ *REKOMENDASI* 〕\n${list}\n└────────────────────────`, m)
}


const lastPresenceSentAt = new Map()

const processedMessageIds = new Map()
const DEDUP_TTL_MS = 5 * 60 * 1000

function isDuplicateMessage(id) {
    const now = Date.now()
    for (const [key, ts] of processedMessageIds) {
        if (now - ts > DEDUP_TTL_MS) processedMessageIds.delete(key)
    }
    if (processedMessageIds.has(id)) return true
    processedMessageIds.set(id, now)
    return false
}

function withTimeout(promise, ms, label) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`TIMEOUT setelah ${ms}ms: ${label}`)), ms)
        )
    ])
}

const chatQueues = new Map()

export async function handler(chatUpdate) {
    console.log('[EVENT MASUK]', new Date().toISOString(), 
        'jumlah pesan:', chatUpdate?.messages?.length, 
        'type:', chatUpdate?.type)
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate || chatUpdate.type !== 'notify') return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    
    for (const message of chatUpdate.messages) {
        const msgId = message.key?.id
        const jid = message.key?.remoteJid
        
        const prevQueue = chatQueues.get(jid) || Promise.resolve()
        const nextQueue = prevQueue.then(async () => {
            await withTimeout(
                processMessage.call(this, message, chatUpdate),
                15000,
                `processMessage untuk pesan id=${msgId} dari=${jid}`
            ).catch((err) => {
                console.error('[PROCESS MESSAGE GAGAL/TIMEOUT]', err.message)
            })
        }).catch(console.error)
        chatQueues.set(jid, nextQueue)
    }
}

async function processMessage(m, chatUpdate) {
    const conn = this
    console.log('[PM START]', new Date().toISOString(), m?.key?.id)
    
    try {
        if (opts['autoread']) await this.readMessages([m.key])
    } catch (err) {
        console.error('[AUTOREAD GAGAL]', err?.message)
    }

    if (!m) {
        console.log('[PM DROP: !m]')
        return  
    }
    
    // Deduplikasi dipindah ke bawah setelah validasi m.mtype selesai

    if (global.db.data == null) await global.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m) {
            console.log('[PM DROP: !smsg(m)]')
            return
        }
        
        console.log('[PM MSG DETAIL]', {
            id: m.key?.id,
            fromMe: m.fromMe,
            sender: m.sender,
            chat: m.chat,
            mtype: m.mtype,
            text: m.text,
            isGroup: m.isGroup,
            hasMessage: !!m.message
        })

        // ANTIDELETE: Tangkap pesan yang dihapus sebelum protocolMessage di-drop
        if (m.mtype === 'protocolMessage' || m.message?.protocolMessage) {
            let protocolMsg = m.message?.protocolMessage || m.msg
            if (protocolMsg && (protocolMsg.type === 0 || protocolMsg.type === 'REVOKE') && protocolMsg.key) {
                let targetKey = protocolMsg.key
                let targetChat = targetKey.remoteJid || m.chat
                let chatSettings = global.db?.data?.chats?.[targetChat]
                if (chatSettings && chatSettings.delete && !targetKey.fromMe) {
                    try {
                        let chatStore = this.chats?.[targetChat] || conn.chats?.[targetChat]
                        let cachedMsg = chatStore?.messages?.[targetKey.id]
                        if (cachedMsg && cachedMsg.message) {
                            const { handleAntidelete } = await import('./plugins/system/_antidelete.js').catch(() => ({}))
                            if (typeof handleAntidelete === 'function') {
                                await handleAntidelete(this, targetChat, cachedMsg, targetKey).catch(e => console.error('[ANTIDELETE]', e))
                            }
                        }
                    } catch (errDel) {
                        console.error('[ANTIDELETE ERROR]:', errDel?.message)
                    }
                }
            }
        }

        // Cek langsung ke raw message object untuk menghindari bug getter mtype
        if (m.message && (m.message.protocolMessage || m.message.senderKeyDistributionMessage)) {
            console.log('[PM DROP: protocol/senderKey in raw message]')
            return
        }
        if (m.mtype === 'protocolMessage' || m.mtype === 'senderKeyDistributionMessage' || !m.mtype) {
            console.log('[PM DROP: mtype invalid or empty]', m.mtype)
            return
        }
        
        // JANGAN cache pesan yang belum terdekripsi (m.mtype kosong)
        // Cache hanya jika pesan valid, agar mekanisme retry dari Baileys tetap berjalan
        if (isDuplicateMessage(m.key.id)) {
            console.log('[SKIP DUPLIKAT]', m.key.id)
            return
        }
        
        // --- TIMESTAMP FRESHNESS GUARD (Mencegah Stale Replay Burst pasca reconnect) ---
        const rawTimestamp = m.messageTimestamp ? (typeof m.messageTimestamp === 'object' ? (m.messageTimestamp.low || m.messageTimestamp) : m.messageTimestamp) : null
        if (rawTimestamp) {
            const msgAgeSec = Math.floor((Date.now() - (rawTimestamp * 1000)) / 1000)
            if (msgAgeSec > 60) {
                console.log(chalk.yellow(`⏱️ [STALE MSG DROP] Pesan kadaluarsa (${msgAgeSec}s yang lalu), id=${m.key?.id} chat=${m.chat}`))
                return
            }
        }
        
        m.exp = 0
        m.limit = false
        // auto typing & recording
        if (typeof this.sendPresenceUpdate === 'function') {
            const jid = m.chat
            const now = Date.now()
            const lastSent = lastPresenceSentAt.get(jid) || 0
            if (now - lastSent > 4000) { // throttle: maksimal sekali tiap 4 detik per chat
                lastPresenceSentAt.set(jid, now)
                
                if (global.autotyping) {
                    this.sendPresenceUpdate('composing', jid).catch((err) => {
                        console.error('[PRESENCE UPDATE FAILED]', jid, err?.message)
                    })
                } else if (global.autorecording) {
                    this.sendPresenceUpdate('recording', jid).catch((err) => {
                        console.error('[PRESENCE UPDATE FAILED]', jid, err?.message)
                    })
                }
            }
        }
        try {
            // DATABASE USER
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {}
            if (user) {
                if (!isNumber(user.exp)) user.exp = 0
                if (!isNumber(user.limit)) user.limit = 100
                if (user.registered !== true) user.registered = true
                if (!('name' in user) || !user.name) user.name = m.name
                if (!isNumber(user.age)) user.age = -1
                if (!isNumber(user.regTime)) user.regTime = +new Date()
                if (!isNumber(user.afk)) user.afk = -1
                if (!('afkReason' in user)) user.afkReason = ''
                if (!('banned' in user)) user.banned = false
                if (!('banReason' in user)) user.banReason = ''
                if (!('role' in user)) user.role = 'Free user'
                if (!('autolevelup' in user)) user.autolevelup = true
                if (!isNumber(user.balance)) user.balance = 0
            } else {
                global.db.data.users[m.sender] = {
                    exp: 0,
                    limit: 100,
                    balance: 0,
                    totalDonasi: 0,
                    lastclaim: 0,
                    registered: true,
                    name: m.name,
                    age: -1,
                    regTime: +new Date(),
                    afk: -1,
                    afkReason: '',
                    banned: false,
                    banReason: '',
                    warn: 0,
                    level: 0,
                    role: 'Free user',
                    autolevelup: true,
                }
            }

            // DATABASE CHAT
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('isBanned' in chat)) chat.isBanned = false
                if (!('welcome' in chat)) chat.welcome = true
                if (!('leave' in chat)) chat.leave = true
                if (!('detect' in chat)) chat.detect = false
                if (!('sWelcome' in chat)) chat.sWelcome = ''
                if (!('sBye' in chat)) chat.sBye = ''
                if (!('sPromote' in chat)) chat.sPromote = ''
                if (!('sDemote' in chat)) chat.sDemote = ''
                if (!('antiLink' in chat)) chat.antiLink = false
                if (!('antispam' in chat)) chat.antispam = false 
                if (!('viewonce' in chat)) chat.viewonce = false
                if (!('antiToxic' in chat)) chat.antiToxic = false
                if (!('antiImage' in chat)) chat.antiImage = false
                if (!('antiSticker' in chat)) chat.antiSticker = false
                if (!('antiTag' in chat)) chat.antiTag = false
                if (!('delete' in chat)) chat.delete = false
                if (!('autoSticker' in chat)) chat.autoSticker = false
                if (!('premium' in chat)) chat.premium = false
                if (!('premiumTime' in chat)) chat.premiumTime = false
                if (!('menu' in chat)) chat.menu = false
                if (!('onlyadmin' in chat)) chat.onlyadmin = false
                if (!isNumber(chat.expired)) chat.expired = 0
            } else {
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    welcome: true,
                    leave: true,
                    detect: false,
                    sWelcome: '',
                    sBye: '',
                    sPromote: '',
                    sDemote: '',
                    antiLink: false,
                    antispam: false, 
                    viewonce: false,
                    antiToxic: false,
                    antiImage: false,
                    antiSticker: false,
                    antiTag: false,
                    delete: false,
                    expired: 0,
                    autoSticker: false,
                    premium: false,
                    premiumTime: false,
                    menu: true,
                    onlyadmin: false
                }
            }

            // DATABASE SETTINGS
            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('autoread' in settings)) settings.autoread = false
                if (!('restrict' in settings)) settings.restrict = false
                if (!('anticall' in settings)) settings.anticall = true
                if (!('restartDB' in settings)) settings.restartDB = 0
                if (!isNumber(settings.totalDonasi)) settings.totalDonasi = 0
            } else {
                global.db.data.settings[this.user.jid] = {
                    self: false,
                    autoread: false,
                    anticall: true,
                    restartDB: 0,
                    restrict: false,
                    totalDonasi: 0
                }
            }
        } catch (e) {
            console.error(e)
        }
        // Totalchat
        if (m.isGroup && !m.isBaileys) {
            addChat(m.chat, m.sender)
        }
        if (typeof m.text !== 'string') m.text = ''
        const commandCandidate = getCommandCandidate(m.text, conn.prefix ? conn.prefix : global.prefix)

        const senderClean = conn.decodeJid(m.sender || '')
        const ownerRawNumbers = (global.owner || []).map(([num]) => String(num).replace(/[^0-9]/g, '')).filter(Boolean)
        const botUserNum = String(conn.user?.id || conn.user?.jid || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
        if (botUserNum) ownerRawNumbers.push(botUserNum)

        const senderDigits = senderClean.split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
        const rawSenderDigits = String(m.sender || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '')

        const isROwner = m.fromMe || ownerRawNumbers.some(num => num && (senderDigits === num || rawSenderDigits === num))
        const isCoOwner = global.db.data.users[senderClean]?.isCoOwner || global.db.data.users[m.sender]?.isCoOwner || false
        const isOwner = isROwner || m.fromMe || isCoOwner
        const isMods = isOwner || global.mods.map(v => String(v).replace(/[^0-9]/g, '')).some(num => num && (senderDigits === num || rawSenderDigits === num))
        const isPrems = isROwner || (global.db.data.users[senderClean] && global.db.data.users[senderClean].premiumTime > 0) || (global.db.data.users[m.sender] && global.db.data.users[m.sender].premiumTime > 0)

        // Options Check (Owner exempt)
        if (!isOwner) {
            if (opts['nyimak']) { console.log('[PM DROP: opts nyimak]'); return }
            if (opts['pconly'] && m.chat.endsWith('g.us')) { console.log('[PM DROP: opts pconly]'); return }
            if (opts['gconly'] && !m.chat.endsWith('g.us')) { console.log('[PM DROP: opts gconly]'); return }
            if (opts['swonly'] && m.chat !== 'status@broadcast') { console.log('[PM DROP: opts swonly]'); return }
        }

        if (!isOwner && !m.fromMe && opts['self']) { console.log('[PM DROP: opts self]'); return }
        if (!isOwner && !m.fromMe && global.db.data.settings?.[this.user?.jid]?.self) { console.log('[PM DROP: settings self]'); return }

        // Message Queue (Dihapus agar bot langsung membalas tanpa delay)
        /*
        if (m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            let intervalID = setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(intervalID)
                await delay(time)
            }, time)
        }
        */

        // -- AFK CLEAR (Dipindah ke sini agar tidak terblokir oleh isBaileys / WA Mods) --
        let userAFK = global.db.data.users[m.sender]
        if (userAFK && userAFK.afk > -1 && !m.fromMe) {
            let duration = Date.now() - userAFK.afk;
            let seconds = Math.floor(duration / 1000);
            let d = Math.floor(seconds / 86400); seconds %= 86400;
            let h = Math.floor(seconds / 3600); seconds %= 3600;
            let min = Math.floor(seconds / 60); seconds %= 60;
            let timeStr = [d ? `${d} Hari` : '', h ? `${h} Jam` : '', min ? `${min} Menit` : '', seconds ? `${seconds} Detik` : ''].filter(Boolean).join(' ') || 'beberapa detik';
            
            let caption = `〔 ✨ *WELCOME BACK* 〕\n⟡ User @${m.sender.split('@')[0]} telah kembali dari AFK!\n⟡ *Lama AFK* : ${timeStr}\n⟡ *Alasan* : _${userAFK.afkReason || 'Tanpa Alasan'}_`.trim()
            userAFK.afk = -1
            userAFK.afkReason = ''
            conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m }).catch(() => {})
        }

        if (m.isBaileys && !commandCandidate) return

        m.exp += Math.ceil(Math.random() * 10)
        let usedPrefix
        let _user = global.db.data?.users?.[m.sender]
        let groupMetadata = {}
        if (m.isGroup) {
            this.chats = this.chats || {}
            let chat = this.chats[m.chat] || (this.chats[m.chat] = {})
            
            // Cek cache lokal terlebih dahulu sebelum fetch jaringan
            if (!chat.metadata && global.groupMetadataCache?.has(m.chat)) {
                chat.metadata = global.groupMetadataCache.get(m.chat).data
                chat.metadataTime = global.groupMetadataCache.get(m.chat).time
            } else if (!chat.metadata && global.memoryStore?.groupMetadata?.[m.chat]) {
                chat.metadata = global.memoryStore.groupMetadata[m.chat]
                chat.metadataTime = Date.now()
            }

            if (!chat.metadata || Date.now() - (chat.metadataTime || 0) > 900000) {
                try {
                    // Single-flight dedup: reuse in-flight promise jika ada
                    const jid = m.chat
                    const inFlight = conn._groupMetaInFlight
                    if (inFlight && inFlight.has(jid)) {
                        chat.metadata = await inFlight.get(jid)
                    } else {
                        chat.metadata = await conn.groupMetadata(jid)
                        if (global.updateGroupMetadataCache) {
                            global.updateGroupMetadataCache(jid, chat.metadata)
                        }
                    }
                    chat.metadataTime = Date.now()
                } catch (e) {
                    chat.metadataTime = Date.now() + 120000
                    console.error('GroupMetadata Fetch Error (backed off 2 min):', e?.message || e)
                }
            }
            groupMetadata = chat.metadata || {}
        }
        const participants = m.isGroup ? (groupMetadata.participants || []) : []
        const useLid = groupMetadata.addressingMode === 'lid'

        let user = {}
        let bot = {}

        if (m.isGroup) {
            const senderJid = conn.decodeJid(m.sender)
            const botJid = conn.decodeJid(conn.user.id)
            user = participants.find(u => {
                const check = [u.id, u.jid, u.phoneNumber, u.lid].map(v => v ? conn.decodeJid(v) : '')
                return check.includes(senderJid) || [u.id, u.jid, u.phoneNumber, u.lid].includes(senderJid)
            }) || {}
            bot = participants.find(u => {
                const check = [u.id, u.jid, u.phoneNumber, u.lid].map(v => v ? conn.decodeJid(v) : '')
                return check.includes(botJid) || [u.id, u.jid, u.phoneNumber, u.lid].includes(botJid)
            }) || {}
        }

        const isRAdmin = user?.admin === 'superadmin' || user?.isSuperAdmin || false
        const isAdmin = isOwner || isRAdmin || user?.admin === 'admin' || user?.isAdmin || false
        const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin' || bot?.isAdmin || bot?.isSuperAdmin || false
        
        // ONLY ADMIN LOGIC
        if (m.isGroup && global.db.data.chats[m.chat]?.onlyadmin && !isAdmin && !isOwner) {
        return false
        }
        // ANTI SPAM FLOOD LOGIC
        let chat = global.db.data.chats[m.chat]
        if (chat && chat.antispam && !isOwner && !isAdmin && !m.fromMe) {
            this.spam = this.spam ? this.spam : {}
            let userSpam = m.sender
            let now = Date.now()
            if (!this.spam[userSpam]) this.spam[userSpam] = { times: [], warned: 0 }
            let userTrack = this.spam[userSpam]
            userTrack.times = userTrack.times.filter(t => now - t < 3000)
            userTrack.times.push(now)
            // Deteksi jika mengirim lebih dari 5 pesan dalam 3 detik
            if (userTrack.times.length > 5) {
                if (now - userTrack.warned > 10000) {
                    userTrack.warned = now
                    this.reply(m.chat, '*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ꜱ ᴘ ᴀ ᴍ 〕*\n> ⟡ Mohon jangan melakukan spam pesan di grup ini!\n> Beri jeda sejenak sebelum mengirim pesan kembali.\n*╰───────────────*', m)
                }
                if (isBotAdmin) {
                    await this.sendMessage(m.chat, {
                        delete: {
                            remoteJid: m.chat,
                            fromMe: false,
                            id: m.key.id,
                            participant: m.key.participant
                        }
                    }).catch(() => null)
                }
                return false
            }
        }

        // PLUGIN LOADER
        console.log('[PM BEFORE SEND]', new Date().toISOString(), m.key?.id)
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue          
            const __filename = join(___dirname, ...name.split('/'))
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
                } catch (e) {
                    console.error(e)
                }
            }
            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) continue
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => {
                    let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                    return [re.exec(m.text), re]
                }) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                [[[], new RegExp]]
            ).find(p => p[1])

            // plugin.before
            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match, conn: this, participants, groupMetadata, user, bot,
                    isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
                    chatUpdate, __dirname: ___dirname, __filename
                })) continue
            }

            if (typeof plugin !== 'function') continue

                        if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                if (global.opts['pconlyprem'] && !m.isGroup && !isPrems && !isOwner && !m.fromMe) {
                    this.reply(m.chat, `*╭  〔 Ⓟ ᴘ ʀ ᴇ ᴍ ɪ ᴜ ᴍ  ᴏ ɴ ʟ ʏ 〕*\n> Fitur chat pribadi bot saat ini hanya khusus user *PREMIUM*.\n> Silakan gunakan bot di dalam grup atau hubungi owner untuk upgrade premium.\n*╰───────────────*`, m)
                    return false 
                }
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail

                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false

                if (!isAccept) continue

                m.plugin = name
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.sender]
                    const pluginFile = path.basename(name)
                    if (!['owner-unbanchat.js', 'owner-exec.js', 'owner-exec2.js'].includes(pluginFile) && chat?.isBanned) return
                    if (pluginFile != 'owner-unbanuser.js' && user?.banned) return
                }

                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { fail('owner', m, this); continue }
                if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue }
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
                if (plugin.private && m.isGroup) { fail('private', m, this); continue }
                // Game & RPG sekarang bisa dimainkan di private chat maupun grup
                // CEK STATUS PENJARA RPG
                const isRpgPlugin = (plugin.tags && (plugin.tags.includes('rpg') || plugin.tags.includes('pasangan'))) || name.includes('/rpg/') || name.includes('\\rpg\\');
                if (isRpgPlugin && !['penjara', 'tebus', 'bebasin', 'penjarain', 'statuspenjara'].includes(command)) {
                    let userRPG = user?.rpg || global.db?.data?.users?.[m.sender]?.rpg;
                    if (userRPG && userRPG.penjara) {
                        let now = Date.now();
                        if (now - userRPG.penjara < (userRPG.lamaPenjara || 0)) {
                            let sisa = userRPG.lamaPenjara - (now - userRPG.penjara);
                            let jam = Math.floor(sisa / 3600000);
                            let menit = Math.floor((sisa % 3600000) / 60000);
                            this.reply(m.chat, `[ 🚔 ]───[ *_AKSES DITOLAK_* ]───✦\n╭ 𖥔 SEL : ${userRPG.sel || 1}\n│ 𖥔 SISA : ${jam}j ${menit}m\n│ 𖥔 TEBUS : Rp ${(userRPG.tebusan || 1000000).toLocaleString('id-ID')}\n│\n│ 𖥔 ❌ Semua akses RPG diblokir selama di penjara!\n╰ 𖥔 Minta orang lain ketik *.tebus @kamu* atau tunggu bebas otomatis.`, m);
                            continue;
                        } else {
                            // Masa tahanan habis, auto-bebas
                            userRPG.penjara = null;
                            userRPG.lamaPenjara = 0;
                            userRPG.tebusan = 0;
                            userRPG.sel = 0;
                            userRPG.gagalCopet = 0;
                        }
                    }
                }

                // GLOBAL REGISTRATION CHECK
                let isUnreg = !(_user?.registered)
                let allowUnreg = ['daftar', 'unreg', 'verify']
                
                // Jika command membutuhkan unreg (seperti .daftar), atau nama command ada di whitelist
                if (isUnreg && !allowUnreg.includes(command) && !plugin.unreg) {
                    fail('unreg', m, this)
                    continue
                }

                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp > 200) console.log("ngecit -_-");
                else m.exp += xp

                if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
                    console.log('[LIMIT HABIS]', new Date().toISOString(), 
                        'jid:', m.chat, 
                        'limit saat ini:', global.db.data.users[m.sender].limit)
                    this.reply(m.chat, `*╭  〔 ⌬ ʟ ɪ ᴍ ɪ ᴛ  ʜ ᴀ ʙ ɪ ꜱ 〕*\n> Limit harian kamu sudah habis.\n> Tunggu reset limit besok atau ketik *.buylimit* untuk membeli limit.\n*╰───────────────*`, m).catch((err) => console.error('[GAGAL KIRIM PESAN LIMIT HABIS]', err.message))
                    continue
                }

                let extra = {
                    match, usedPrefix, noPrefix, _args, args, command, text, conn: this,
                    participants, groupMetadata, user, bot, isROwner, isOwner,
                    isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename
                }
                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems)
                        m.limit = m.limit || plugin.limit || false
                } catch (e) {
                    // Error occured
                    m.error = e
                    console.error(e)
                    if (e) {
                        const errStr = String(e?.message || e)
                        const isReachoutRestricted = errStr.includes('463') || errStr.includes('reachout') || errStr.includes('account_reachout_restricted')
                        const isRateOverlimit = errStr.includes('rate-overlimit') || errStr.includes('Rate Overlimit')

                        if (isReachoutRestricted) {
                            console.error(chalk.redBright(`🚫 [REACHOUT RESTRICTED / 463] Server menolak pesan ke ${m.chat}. Menghentikan secondary reply untuk mencegah ban loop.`))
                            return
                        }

                        let text = format(e)
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                        if (e.name && !isReachoutRestricted)
                            for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
                                let data = (await conn.onWhatsApp(jid))[0] || {}
                                if (data.exists)
                                    m.reply(`*🗂️ Plugin:* ${m.plugin}\n*👤 Sender:* ${m.sender}\n*💬 Chat:* ${m.chat}\n*💻 Command:* ${usedPrefix}${command} ${args.join(' ')}\n📄 *Error Logs:*\n\n\`\`\`${text}\`\`\``.trim(), data.jid).catch(() => {})
                            }
                        
                        if (isRateOverlimit) {
                            m.reply('*╭  〔 ⚠ ꜱ ɪ ꜱ ᴛ ᴇ ᴍ  ꜱ ɪ ʙ ᴜ ᴋ 〕*\n> Sistem sedang sibuk (Rate Limit Server WhatsApp).\n> Silakan ulangi perintahmu dalam beberapa detik.\n*╰───────────────*').catch(() => {})
                        } else {
                            m.reply('*╭  〔 ✕ ɢ ᴀ ɢ ᴀ ʟ 〕*\n> Terjadi kesalahan pada fitur ini.\n> Silakan coba lagi nanti atau laporkan ke owner.\n*╰───────────────*').catch(() => {})
                        }
                    }
                } finally {
                    // m.reply(util.format(_user))
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }
                break
            }
        }
        if (commandCandidate && !m.plugin) await replyCommandSuggestion(this, m, commandCandidate)
        console.log('[PM AFTER SEND]', new Date().toISOString(), m.key?.id)
    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const queque = this.msgqueque
            const index = queque.indexOf(m.id || m.key.id)
            if (index !== -1) queque.splice(index, 1)
        }
        let user, stats = global.db.data.stats
        if (m) {
            if (m.mtype === 'templateButtonReplyMessage') {
                console.log('[DEBUG BUTTON REPLY RAW]', JSON.stringify(m.message, null, 2))
            }
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.limit -= m.limit * 1
            }

            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total)) stat.total = 1
                    if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last)) stat.last = now
                    if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
                } else {
                    stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        try {
            if (!opts['noprint'] && m.mtype !== 'protocolMessage' && m.mtype !== 'senderKeyDistributionMessage') {
                (await import('./lib/print.js')).default(m, this)
            }
        } catch (e) {
            console.log(m, m.quoted, e)
        }
        console.log('[PM END]', new Date().toISOString(), m.key?.id)
    }
}
/**
 * Handle groups participants update
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['group-participants.update']} groupsUpdate 
 */
export async function participantsUpdate({ id, participants, action }) {
    const conn = this
    if (opts['self'])
        return
    // if (id in conn.chats) return // First login will spam
    if (this.isInit)
        return
    if (global.db.data == null)
        await loadDatabase()
    let chat = global.db.data.chats[id] || {}
    let text = ''
    switch (action) {
    case 'add':
    if (chat.welcome) {
        let groupMetadata = await this.groupMetadata(id, true).catch(_ => ({})) || (conn.chats[id] || {}).metadata
        const defaultAvatar = 'https://i.pinimg.com/originals/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg'
        const welcomeBg = 'https://telegra.ph/file/666ccbfc3201704454ba5.jpg'

        for (let user of participants) {
            try {
                // 1. Penerjemahan LID -> Nomor / Phone JID
                let resolvedPhoneJid = user
                if (resolvedPhoneJid && resolvedPhoneJid.endsWith('@lid')) {
                    if (this.decodeJid) resolvedPhoneJid = this.decodeJid(resolvedPhoneJid)
                    if (resolvedPhoneJid.endsWith('@lid') && global.lids?.[user]) resolvedPhoneJid = global.lids[user]
                    if (resolvedPhoneJid.endsWith('@lid') && global.db?.data?.lids?.[user]) resolvedPhoneJid = global.db.data.lids[user]
                    if (resolvedPhoneJid.endsWith('@lid')) {
                        const found = (groupMetadata?.participants || []).find(p => p.lid === user || p.id === user)
                        if (found?.jid && found.jid.endsWith('@s.whatsapp.net')) resolvedPhoneJid = found.jid
                        else if (found?.phoneNumber || found?.phone || found?.pn) {
                            const clean = String(found.phoneNumber || found.phone || found.pn).replace(/\D/g, '')
                            if (clean) resolvedPhoneJid = `${clean}@s.whatsapp.net`
                        }
                    }
                }
                if (!resolvedPhoneJid || !resolvedPhoneJid.endsWith('@s.whatsapp.net')) {
                    const cleanDigits = (resolvedPhoneJid || user || '').split('@')[0].split(':')[0].replace(/\D/g, '')
                    if (cleanDigits) resolvedPhoneJid = `${cleanDigits}@s.whatsapp.net`
                }
                const userNumber = (resolvedPhoneJid || '').split('@')[0].split(':')[0].replace(/\D/g, '')

                // 2. Avatar & Info Profil
                let pp = await this.profilePictureUrl(user, 'image').catch(() => null)
                if (!pp && resolvedPhoneJid !== user) {
                    pp = await this.profilePictureUrl(resolvedPhoneJid, 'image').catch(() => null)
                }
                if (!pp) pp = defaultAvatar

                let dbName = global.db?.data?.users?.[resolvedPhoneJid]?.name || global.db?.data?.users?.[user]?.name
                let waName = await this.getName(resolvedPhoneJid || user)
                let username = dbName || (waName && !waName.includes('@lid') ? waName : userNumber)
                let gcname = (await this.getName(id)) || 'Grup'
                let memberCount = groupMetadata?.participants ? groupMetadata.participants.length : '1'
                let groupDesc = groupMetadata?.desc?.toString()?.trim() || ''

                // 3. API URL Ryzumi Welcome
                const welcomeUrl = `https://api.ryzumi.net/api/image/welcome?username=${encodeURIComponent(username)}&group=${encodeURIComponent(gcname)}&avatar=${encodeURIComponent(pp)}&bg=${encodeURIComponent(welcomeBg)}&member=${encodeURIComponent(memberCount)}`

                // 4. Caption Zen Shinto (Member Baru)
                const descBlock = groupDesc 
                    ? `*╭  〔 ◈ ᴅ ᴇ ꜱ ᴋ ʀ ɪ ᴘ ꜱ ɪ 〕*\n${groupDesc.split('\n').map(l => `*┆* ${l}`).join('\n')}\n*╰───────────────*`
                    : `*╭  〔 ◈ ᴅ ᴇ ꜱ ᴋ ʀ ɪ ᴘ ꜱ ɪ 〕*\n*┆* _Belum ada deskripsi grup._\n*╰───────────────*`

                const playerCaption = `*──  ୨୧ ✧ WELCOME TO GROUP ✧ ୨୧  ──*

> *ようこそ!* (ᴡᴇʟᴄᴏᴍᴇ!)
> (≧◡≦) ♡ Hai @${userNumber}
> Selamat datang di *${gcname}* ✧

*╭  〔 ❖ ɢ ʀ ᴏ ᴜ ᴘ  ɪ ɴ ꜰ ᴏ 〕*
*┆* ⟡ ɢʀᴜᴘ   : *${gcname}*
*┆* ✧ ᴍᴇᴍʙᴇʀ : *${toSmallNum(memberCount)} Member*
*╰───────────────*

*╭  〔 𝜚 ᴊ ɪ ᴋ ᴏ ꜱ ʜ ᴏ ᴜ ᴋ ᴀ ɪ 〕*
*┆* • ɴᴀᴍᴀ   : 
*┆* • ᴜꜱɪᴀ   : 
*┆* • ɢᴇɴᴅᴇʀ : 
*╰───────────────*

${descBlock}

> ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴍᴇɴᴊᴇʟᴀᴊᴀʜɪ ꜰɪᴛᴜʀ* ⊹ ˚ ｡`.trim()

                // 5. Caption Penonton (Member Grup Lainnya)
                const spectatorCaption = `*──  ୨୧ ✧ MEMBER BARU BERGABUNG ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> Ada member baru @${userNumber} telah bergabung ke grup!
> Silakan beri sambutan hangat untuknya ♡`.trim()

                let dualSent = false
                if (typeof this.Button === 'function') {
                    try {
                        // A. Buat Kartu Sambutan Interaktif untuk Member Baru (Pemain)
                        const btnPlayer = new this.Button(this)
                        btnPlayer.setBody(playerCaption)
                        btnPlayer.setFooter(`${global.namebot || 'Avelia'} • Welcoming Service`)
                        await btnPlayer.setImage(welcomeUrl).catch(() => null)
                        
                        const menuCategories = [
                            { header: 'Utama', title: 'Semua Perintah', description: 'Tampilkan seluruh menu bot', id: '.allmenu' },
                            { header: 'AI', title: 'AI & ChatBot', description: 'Fitur ChatGPT, Claude, AI Edit, dll', id: '.menuai' },
                            { header: 'Anime', title: 'Anime & Wibu', description: 'Fitur Anime, Waifu, Gambar Anime', id: '.menuanime' },
                            { header: 'Audio', title: 'Manipulasi Audio', description: 'Sound effect, convert audio, TTS', id: '.menuaudio' },
                            { header: 'RPG', title: 'Chainsaw Man RPG', description: 'Game RPG Chainsaw Man', id: '.menucsm' },
                            { header: 'Downloader', title: 'Pengunduh Media', description: 'Download TikTok, IG, YT, dll', id: '.menudownload' },
                            { header: 'Hiburan', title: 'Fitur Hiburan', description: 'Fitur seru-seruan & jokes', id: '.menufun' },
                            { header: 'Games', title: 'Mini Games', description: 'Game tebak-tebakan, catur, dll', id: '.menugame' },
                            { header: 'Grup', title: 'Manajemen Grup', description: 'Admin tools & pengaturan grup', id: '.menugroup' },
                            { header: 'Informasi', title: 'Informasi Bot', description: 'Info status sistem & bot', id: '.menuinfo' },
                            { header: 'Internet', title: 'Pencarian Web', description: 'Google, Wikipedia, Cuaca, dll', id: '.menuinternet' },
                            { header: 'Maker', title: 'Pembuat Gambar', description: 'Canvas maker, logo, quotes', id: '.menumaker' },
                            { header: 'Keuangan', title: 'Catatan Keuangan', description: 'Money track & scanner struk', id: '.menumoneytrack' },
                            { header: 'Owner', title: 'Khusus Owner', description: 'Perintah kendali owner', id: '.menuowner' },
                            { header: 'Hubungan', title: 'Fitur Hubungan', description: 'Pernikahan, pasangan, dll', id: '.menupasangan' },
                            { header: 'RPG', title: 'Roleplay Game', description: 'Game RPG petualangan klasik', id: '.menurpg' },
                            { header: 'Pencarian', title: 'Pencarian Data', description: 'Search data & scraper', id: '.menusearch' },
                            { header: 'Stalker', title: 'Stalker Sosmed', description: 'Stalk akun Instagram, TikTok, dll', id: '.menustalker' },
                            { header: 'Stiker', title: 'Pembuat Stiker', description: 'Buat stiker foto, teks, video', id: '.menusticker' },
                            { header: 'Alat', title: 'Alat & Utilitas', description: 'Tools pembantu sehari-hari', id: '.menutools' }
                        ]

                        btnPlayer.addSelection('✦ PILIH KATEGORI')
                        btnPlayer.makeSection('✦ DAFTAR KATEGORI MENU', 'Populer')
                        for (const cat of menuCategories) {
                            btnPlayer.makeRow(cat.header, cat.title, cat.description, cat.id)
                        }

                        btnPlayer.addReply('❖ Info Owner', '.owner')
                        btnPlayer.addReply('⟡ Donasi', '.donasi')
                        btnPlayer.setContextInfo({
                            mentionedJid: [resolvedPhoneJid]
                        })

                        const playerBuilt = await btnPlayer.build(id)

                        // B. Buat Pesan Sapaan Cepat untuk Penonton
                        const btnSpectator = new this.Button(this)
                        btnSpectator.setBody(spectatorCaption)
                        btnSpectator.setFooter(`${global.namebot || 'Avelia'} • Member Sapaan`)
                        btnSpectator.addReply('✦ Sapa Member', `Halo selamat datang @${userNumber}!`)
                        btnSpectator.addReply('❖ Info Owner', '.owner')
                        btnSpectator.setContextInfo({
                            mentionedJid: [resolvedPhoneJid]
                        })

                        const spectatorBuilt = await btnSpectator.build(id)

                        // C. Kirim via Dual-Group-Message (Target menerima kartu sambutan, Penonton menerima tombol sapa)
                        await sendDualGroupMessage(
                            this,
                            id,
                            user,
                            playerBuilt.message,
                            spectatorBuilt.message,
                            { contextInfo: { mentionedJid: [resolvedPhoneJid] } }
                        )
                        dualSent = true
                    } catch (errDual) {
                        console.warn('[WELCOME DUAL] Gagal kirim dual button:', errDual?.message)
                        dualSent = false
                    }
                }

                // Fallback jika Dual Message / Button gagal
                if (!dualSent) {
                    await this.sendMessage(id, {
                        image: { url: welcomeUrl },
                        caption: playerCaption,
                        mentions: [resolvedPhoneJid]
                    }).catch(e => {
                        this.sendMessage(id, { text: playerCaption, mentions: [resolvedPhoneJid] })
                    })
                }
            } catch (e) {
                console.error('[WELCOME ERROR]:', e)
            }
        }
    }
    break
    case 'remove':
    if (chat.welcome || chat.leave) {
        let groupMetadata = await this.groupMetadata(id, true).catch(_ => ({})) || (conn.chats[id] || {}).metadata
        const defaultAvatar = 'https://i.pinimg.com/originals/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg'
        const leaveBg = 'https://telegra.ph/file/0db212539fe8a014017e3.jpg'

        for (let user of participants) {
            try {
                // 1. Penerjemahan LID -> Nomor / Phone JID
                let resolvedPhoneJid = user
                if (resolvedPhoneJid && resolvedPhoneJid.endsWith('@lid')) {
                    if (this.decodeJid) resolvedPhoneJid = this.decodeJid(resolvedPhoneJid)
                    if (resolvedPhoneJid.endsWith('@lid') && global.lids?.[user]) resolvedPhoneJid = global.lids[user]
                    if (resolvedPhoneJid.endsWith('@lid') && global.db?.data?.lids?.[user]) resolvedPhoneJid = global.db.data.lids[user]
                    if (resolvedPhoneJid.endsWith('@lid')) {
                        const found = (groupMetadata?.participants || []).find(p => p.lid === user || p.id === user)
                        if (found?.jid && found.jid.endsWith('@s.whatsapp.net')) resolvedPhoneJid = found.jid
                        else if (found?.phoneNumber || found?.phone || found?.pn) {
                            const clean = String(found.phoneNumber || found.phone || found.pn).replace(/\D/g, '')
                            if (clean) resolvedPhoneJid = `${clean}@s.whatsapp.net`
                        }
                    }
                }
                if (!resolvedPhoneJid || !resolvedPhoneJid.endsWith('@s.whatsapp.net')) {
                    const cleanDigits = (resolvedPhoneJid || user || '').split('@')[0].split(':')[0].replace(/\D/g, '')
                    if (cleanDigits) resolvedPhoneJid = `${cleanDigits}@s.whatsapp.net`
                }
                const userNumber = (resolvedPhoneJid || '').split('@')[0].split(':')[0].replace(/\D/g, '')

                // 2. Avatar & Info Profil
                let pp = await this.profilePictureUrl(user, 'image').catch(() => null)
                if (!pp && resolvedPhoneJid !== user) {
                    pp = await this.profilePictureUrl(resolvedPhoneJid, 'image').catch(() => null)
                }
                if (!pp) pp = defaultAvatar

                let dbName = global.db?.data?.users?.[resolvedPhoneJid]?.name || global.db?.data?.users?.[user]?.name
                let waName = await this.getName(resolvedPhoneJid || user)
                let username = dbName || (waName && !waName.includes('@lid') ? waName : userNumber)
                let gcname = (await this.getName(id)) || 'Grup'
                let memberCount = groupMetadata?.participants ? groupMetadata.participants.length : '0'

                // 3. API URL Ryzumi Leave
                const leaveUrl = `https://api.ryzumi.net/api/image/leave?username=${encodeURIComponent(username)}&group=${encodeURIComponent(gcname)}&avatar=${encodeURIComponent(pp)}&bg=${encodeURIComponent(leaveBg)}&member=${encodeURIComponent(memberCount)}`

                // 4. Caption Zen Shinto (Goodbye)
                const leaveCaption = `*──  ୨୧ ✧ GOODBYE MEMBER ✧ ୨୧  ──*

> *さようなら!* (ɢᴏᴏᴅʙʏᴇ!)
> (｡•́︿•̀｡) @${userNumber} telah meninggalkan grup.
> Semoga kita dapat bertemu kembali di lain waktu ✧

*╭  〔 ❖ ɢ ʀ ᴏ ᴜ ᴘ  ɪ ɴ ꜰ ᴏ 〕*
*┆* ⟡ ɢʀᴜᴘ   : *${gcname}*
*┆* ✧ ꜱɪꜱᴀ   : *${toSmallNum(memberCount)} Member*
*╰───────────────*`.trim()

                let leaveSent = false
                if (typeof this.Button === 'function') {
                    try {
                        const btnLeave = new this.Button(this)
                        btnLeave.setBody(leaveCaption)
                        btnLeave.setFooter(`${global.namebot || 'Avelia'} • Parting Words`)
                        await btnLeave.setImage(leaveUrl).catch(() => null)
                        btnLeave.addReply('✦ Sampai Jumpa', '.ping')
                        btnLeave.addReply('❖ Info Owner', '.owner')
                        btnLeave.setContextInfo({
                            mentionedJid: [resolvedPhoneJid]
                        })
                        await btnLeave.send(id)
                        leaveSent = true
                    } catch (errBtn) {
                        console.warn('[LEAVE BUTTON] Gagal kirim button leave:', errBtn?.message)
                        leaveSent = false
                    }
                }

                // Fallback jika button gagal
                if (!leaveSent) {
                    await this.sendMessage(id, {
                        image: { url: leaveUrl },
                        caption: leaveCaption,
                        mentions: [resolvedPhoneJid]
                    }).catch(e => {
                        this.sendMessage(id, { text: leaveCaption, mentions: [resolvedPhoneJid] })
                    })
                }
            } catch (e) {
                console.error('[LEAVE ERROR]:', e)
            }
        }
    }
    break
    case 'promote':
    case 'demote':
        try {
            let statusText = action === 'promote' ? 
                (chat.sPromote || this.spromote || conn.spromote || '@user ```is now Admin```') :
                (chat.sDemote || this.sdemote || conn.sdemote || '@user ```is no longer Admin```')
            
            let text = statusText.replace('@user', '@' + participants[0].split('@')[0])
            if (chat.detect) await this.sendMessage(id, { text, mentions: this.parseMention(text) })
        } catch (e) {
            console.error(e)
        }
        break
    }
}
/**
 * Handler groups update
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['groups.update']} groupsUpdate 
 */
export async function groupsUpdate(groupsUpdate) {
    const conn = this
    if (opts['self'])
        return
    for (const groupUpdate of groupsUpdate) {
        const id = groupUpdate.id
        if (!id) continue
        let chats = global.db.data.chats[id], text = ''
        if (!chats?.detect) continue
        if (groupUpdate.desc) text = (chats.sDesc || this.sDesc || conn.sDesc || '```Description has been changed to```\n@desc').replace('@desc', groupUpdate.desc)
        if (groupUpdate.subject) text = (chats.sSubject || this.sSubject || conn.sSubject || '```Subject has been changed to```\n@subject').replace('@subject', groupUpdate.subject)
        if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || conn.sIcon || '```Icon has been changed to```').replace('@icon', groupUpdate.icon)
        if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || conn.sRevoke || '```Group link has been changed to```\n@revoke').replace('@revoke', groupUpdate.revoke)
        if (groupUpdate.announce == true) text = (chats.sAnnounceOn || this.sAnnounceOn || conn.sAnnounceOn || '*Group has been closed!*')
        if (groupUpdate.announce == false) text = (chats.sAnnounceOff || this.sAnnounceOff || conn.sAnnounceOff || '*Group has been open!*')
        if (groupUpdate.restrict == true) text = (chats.sRestrictOn || this.sRestrictOn || conn.sRestrictOn || '*Group has been all participants!*')
        if (groupUpdate.restrict == false) text = (chats.sRestrictOff || this.sRestrictOff || conn.sRestrictOff || '*Group has been only admin!*')
        if (!text) continue
        this.reply(id, text.trim(), m)
    }
}

global.dfail = (type, m, conn) => {
    let msg = {
        rowner: '*╭  〔 ⚠ ᴀ ᴋ ꜱ ᴇ ꜱ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Perintah ini khusus untuk *Real Developer Bot*.\n*╰───────────────*',
        owner: '*╭  〔 ⚠ ᴀ ᴋ ꜱ ᴇ ꜱ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Perintah ini hanya dapat digunakan oleh *Owner Bot*.\n*╰───────────────*',
        mods: '*╭  〔 ⚠ ᴍ ᴏ ᴅ ᴇ ʀ ᴀ ᴛ ᴏ ʀ  ᴏ ɴ ʟ ʏ 〕*\n> Perintah ini hanya untuk *Moderator Bot*.\n*╰───────────────*',
        premium: '*╭  〔 Ⓟ ꜰ ɪ ᴛ ᴜ ʀ  ᴘ ʀ ᴇ ᴍ ɪ ᴜ ᴍ 〕*\n> Fitur ini khusus untuk pengguna *Premium*.\n> Ketik *.sewa* atau hubungi owner untuk upgrade.\n*╰───────────────*',
        group: '*╭  〔 ⟡ ɢ ʀ ᴜ ᴘ  ꜱ ᴀ ᴊ ᴀ 〕*\n> Perintah ini hanya dapat digunakan di dalam grup chat.\n*╰───────────────*',
        private: '*╭  〔 𝜚 ᴄ ʜ ᴀ ᴛ  ᴘ ʀ ɪ ʙ ᴀ ᴅ ɪ 〕*\n> Perintah ini hanya dapat digunakan di private chat (PC).\n*╰───────────────*',
        admin: '*╭  〔 ❖ ᴀ ᴅ ᴍ ɪ ɴ  ꜱ ᴀ ᴊ ᴀ 〕*\n> Perintah ini hanya dapat digunakan oleh *Admin Grup*.\n*╰───────────────*',
        botAdmin: '*╭  〔 ⚙ ʙ ᴏ ᴛ  ʜ ᴀ ʀ ᴜ ꜱ  ᴀ ᴅ ᴍ ɪ ɴ 〕*\n> Jadikan bot sebagai *Admin Grup* terlebih dahulu.\n*╰───────────────*',
        unreg: `*╭  〔 ✦ ʙ ᴇ ʟ ᴜ ᴍ  ᴛ ᴇ ʀ ᴅ ᴀ ꜰ ᴛ ᴀ ʀ 〕*\n> Silakan daftar terlebih dahulu untuk menggunakan fitur bot:\n> › wa.me/${global.nomorbot}?text=.daftar+namamu,umurmu\n\n> _Contoh: wa.me/${global.nomorbot}?text=.daftar+nenel,18_\n*╰───────────────*`,
        restrict: '*╭  〔 ⚠ ʀ ᴇ ꜱ ᴛ ʀ ɪ ᴄ ᴛ ᴇ ᴅ 〕*\n> Fitur restrict belum diaktifkan di chat ini.\n*╰───────────────*',
        disable: '*╭  〔 ✕ ꜰ ɪ ᴛ ᴜ ʀ  ᴅ ɪ ɴ ᴏ ɴ ᴀ ᴋ ᴛ ɪ ꜰ ᴋ ᴀ ɴ 〕*\n> Perintah ini telah dimatikan sementara oleh Owner.\n*╰───────────────*',
    }[type]
    if (msg) return conn.reply(m.chat, msg, m)
}


let file = (typeof global.__filename === 'function') ? global.__filename(import.meta.url, true) : fileURLToPath(import.meta.url)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})
