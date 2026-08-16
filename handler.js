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
    const list = suggestions.map(alias => `- ${candidate.usedPrefix}${alias}`).join('\n')
    await conn.reply(m.chat, `Command *${candidate.usedPrefix}${candidate.command}* tidak ditemukan.\n\nMungkin command ini yang kamu maksud:\n${list}`, m)
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
    console.log('[PM START]', new Date().toISOString(), m?.key?.id)
    
    try {
        if (opts['autoread']) await this.readMessages([m.key])
    } catch (err) {
        console.error('[AUTOREAD GAGAL]', err?.message)
    }

    if (!m) return  
    
    // Deduplikasi dipindah ke bawah setelah validasi m.mtype selesai

    if (global.db.data == null) await global.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m) return
        
        // Cek langsung ke raw message object untuk menghindari bug getter mtype
        if (m.message && (m.message.protocolMessage || m.message.senderKeyDistributionMessage)) return
        if (m.mtype === 'protocolMessage' || m.mtype === 'senderKeyDistributionMessage' || !m.mtype) return
        
        // JANGAN cache pesan yang belum terdekripsi (m.mtype kosong)
        // Cache hanya jika pesan valid, agar mekanisme retry dari Baileys tetap berjalan
        if (isDuplicateMessage(m.key.id)) {
            console.log('[SKIP DUPLIKAT]', m.key.id)
            return
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
                if (!('welcome' in chat)) chat.welcome = false
                if (!('detect' in chat)) chat.detect = false
                if (!('sWelcome' in chat)) chat.sWelcome = ''
                if (!('sBye' in chat)) chat.sBye = ''
                if (!('sPromote' in chat)) chat.sPromote = ''
                if (!('sDemote' in chat)) chat.sDemote = ''
                if (!('antiLink' in chat)) chat.antiLink = false
                if (!('antispam' in chat)) chat.antispam = false 
                if (!('viewonce' in chat)) chat.viewonce = false
                if (!('antiToxic' in chat)) chat.antiToxic = false
                if (!('simi' in chat)) chat.simi = false
                if (!('autogpt' in chat)) chat.autogpt = false
                if (!('autoSticker' in chat)) chat.autoSticker = false
                if (!('premium' in chat)) chat.premium = false
                if (!('premiumTime' in chat)) chat.premiumTime = false
                if (!('nsfw' in chat)) chat.nsfw = false
                if (!('menu' in chat)) chat.menu = false
                if (!('onlyadmin' in chat)) chat.onlyadmin = false
                if (!isNumber(chat.expired)) chat.expired = 0
            } else {
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    welcome: true,
                    detect: false,
                    sWelcome: '',
                    sBye: '',
                    sPromote: '',
                    sDemote: '',
                    antiLink: false,
                    antispam: false, 
                    viewonce: false,
                    simi: false,
                    autogpt: false,
                    expired: 0,
                    autoSticker: false,
                    premium: false,
                    premiumTime: false,
                    nsfw: false,
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
        m.text = m.text.trim()

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

        // Options Check
        if (opts['nyimak']) return
        if (opts['pconly'] && m.chat.endsWith('g.us') && !isOwner) return
        if (opts['gconly'] && !m.chat.endsWith('g.us') && !isOwner) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return
        if (!isOwner && !m.fromMe && opts['self']) return

        const commandCandidate = getCommandCandidate(m.text, conn.prefix ? conn.prefix : global.prefix)

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
            
            let caption = `✨ *WELCOME BACK!*\n\nUser @${m.sender.split('@')[0]} telah kembali dari AFK!\n⏱️ *Lama AFK:* ${timeStr}\n📝 *Alasan Sebelumnya:* _${userAFK.afkReason || 'Tanpa Alasan'}_`.trim()
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
        // ANTI SPAM LOGIC
        let chat = global.db.data.chats[m.chat]
        if (chat && chat.antispam && !isOwner && !m.fromMe) {
            this.spam = this.spam ? this.spam : {}
            let userSpam = m.sender
            let now = Date.now()
            let cooldown = 5000 
            if (userSpam in this.spam && now - this.spam[userSpam] < cooldown) return false
            this.spam[userSpam] = now
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
                    this.reply(m.chat, '❌ Fitur chat pribadi bot saat ini hanya khusus user *PREMIUM*.\n\nSilakan gunakan bot di dalam grup atau hubungi owner untuk upgrade premium.', m)
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
                    this.reply(m.chat, `[❗] Limit harian kamu sudah habis. Silakan tunggu reset limit besok, atau ketik *.buylimit* untuk membeli limit.`, m).catch((err) => console.error('[GAGAL KIRIM PESAN LIMIT HABIS]', err.message))
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
                        let text = format(e)
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                        if (e.name)
                            for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
                                let data = (await conn.onWhatsApp(jid))[0] || {}
                                if (data.exists)
                                    m.reply(`*🗂️ Plugin:* ${m.plugin}\n*👤 Sender:* ${m.sender}\n*💬 Chat:* ${m.chat}\n*💻 Command:* ${usedPrefix}${command} ${args.join(' ')}\n📄 *Error Logs:*\n\n\`\`\`${text}\`\`\``.trim(), data.jid)
                            }
                        
                        if (String(e).includes('rate-overlimit') || String(e).includes('Rate Overlimit')) {
                            m.reply('⚠️ Sistem sedang sibuk (Rate Limit Server WhatsApp). Silakan ulangi perintahmu dalam beberapa detik. 🙏')
                        } else {
                            m.reply('❌ Terjadi kesalahan pada fitur ini, silakan coba lagi nanti atau laporkan ke owner.')
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
        let groupMetadata = await this.groupMetadata(id).catch(_ => ({})) || (conn.chats[id] || {}).metadata
        for (let user of participants) {
            let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
            let ppgc = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
            try {
                pp = await this.profilePictureUrl(user, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
                ppgc = await this.profilePictureUrl(id, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')          
                let dbName = global.db.data.users[user]?.name
                let waName = await this.getName(user)
                let username = dbName || waName || user.split('@')[0]
                let gcname = await this.getName(id)
                let memberCount = groupMetadata.participants ? groupMetadata.participants.length : '0'
                let text = (chat.sWelcome || this.welcome || conn.welcome || 'Welcome, @user!').replace('@subject', gcname).replace('@desc', groupMetadata.desc?.toString() || 'no description').replace('@user', '@' + user.split('@')[0])               
                let cardBuf
                try {
                    cardBuf = await generateWelcomeCard({ avatarUrl: pp, username, groupName: gcname, memberCount })
                } catch (e) {
                    console.error('[WelcomeCard] Error generating card:', e.message)
                }

                if (cardBuf) {
                    await this.sendMessage(id, { image: cardBuf, caption: text, mentions: [user] })
                } else {
                    let canvasUrl = `https://api.siputzx.my.id/api/canvas/welcomev1?username=${encodeURIComponent(username)}&guildName=${encodeURIComponent(gcname)}&guildIcon=${encodeURIComponent(ppgc)}&memberCount=${memberCount}&avatar=${encodeURIComponent(pp)}&background=https://api.deline.web.id/8wNQoavbJ6.jpg&quality=80`
                    await this.sendFile(id, canvasUrl, 'welcome.jpg', text, null, false, { mentions: [user] }).catch(e => {  
                        this.sendMessage(id, { text, mentions: [user] })  
                    })  
                }
            } catch (e) {  
                console.error(e)  
            }  
        }  
    }  
    break
    case 'remove':
    if (chat.leave) {
        let groupMetadata = await this.groupMetadata(id).catch(_ => ({})) || (conn.chats[id] || {}).metadata
        for (let user of participants) {
            let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
            let gcIcon = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'          
            try {
                pp = await this.profilePictureUrl(user, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
                gcIcon = await this.profilePictureUrl(id, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png') 
                let dbName = global.db.data.users[user]?.name
                let waName = await this.getName(user)
                let username = dbName || waName || user.split('@')[0]       
                let gcname = await this.getName(id)
                let memberCount = groupMetadata.participants ? groupMetadata.participants.length : '0'
                let text = (chat.sBye || this.bye || conn.bye || 'Bye, @user!').replace('@user', '@' + user.split('@')[0])           
                let cardBuf
                try {
                    cardBuf = await generateGoodbyeCard({ avatarUrl: pp, username, groupName: gcname, memberCount })
                } catch (e) {
                    console.error('[GoodbyeCard] Error generating card:', e.message)
                }

                if (cardBuf) {
                    await this.sendMessage(id, { image: cardBuf, caption: text, mentions: [user] })
                } else {
                    let canvasUrl = `https://api.siputzx.my.id/api/canvas/goodbyev1?username=${encodeURIComponent(username)}&guildName=${encodeURIComponent(gcname)}&guildIcon=${encodeURIComponent(gcIcon)}&memberCount=${memberCount}&avatar=${encodeURIComponent(pp)}&background=https://api.deline.web.id/49irsGbWmB.jpg&quality=80`
                    await this.sendFile(id, canvasUrl, 'goodbye.jpg', text, null, false, { mentions: [user] }).catch(e => {  
                        this.sendMessage(id, { text, mentions: [user] })  
                    })  
                }
            } catch (e) {
                console.error(e)
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
        rowner: '*ᴏɴʟʏ ᴅᴇᴠᴇʟᴏᴘᴇʀ*\nᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴅᴇᴠᴇʟᴏᴘᴇʀ ʙᴏᴛ',
        owner: '*ᴏɴʟʏ ᴏᴡɴᴇʀ*\nᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴏᴡɴᴇʀ ʙᴏᴛ',
        mods: '*ᴏɴʟʏ ᴍᴏᴅᴇʀᴀᴛᴏʀ*\nᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴍᴏᴅᴇʀᴀᴛᴏʀ ʙᴏᴛ',
        premium: '*ᴏɴʟʏ ᴘʀᴇᴍɪᴜᴍ*\nᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ',
        group: '*ɢʀᴏᴜᴘ ᴄʜᴀᴛ*\nᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ʙɪsᴀ ᴅɪᴘᴀᴋᴀɪ ᴅɪᴅᴀʟᴀᴍ ɢʀᴏᴜᴘ',
        private: '*ᴘʀɪᴠᴀᴇ ᴄʜᴀᴛ*\nᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ʙɪsᴀ ᴅɪᴘᴀᴋᴀɪ ᴅɪᴘʀɪᴠᴀᴛ ᴄʜᴀᴛ',
        admin: '*ᴏɴʟʏ ᴀᴅᴍɪɴ*\nᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴀᴅᴍɪɴ ɢʀᴏᴜᴘ',
        botAdmin: '*ᴏɴʟʏ ʙᴏᴛ ᴀᴅᴍɪɴ*\nᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ʙɪsᴀ ᴅɪɢᴜɴᴀᴋᴀɴ ᴋᴇᴛɪᴋᴀ ʙᴏᴛ ᴍᴇɴᴊᴀᴅɪ ᴀᴅᴍɪɴ',
        unreg: `*Kamu belum terdaftar!*\n\nSilakan daftar terlebih dahulu dengan cara klik link di bawah ini, lalu kirim pesannya ke bot:\n\nwa.me/${global.nomorbot}?text=.daftar+namamu,umurmu\n\n_Contoh: wa.me/${global.nomorbot}?text=.daftar+nenel,18_`,
        restrict: '*ʀᴇsᴛʀɪᴄᴛ*\nʀᴇsᴛʀɪᴄᴛ ʙᴇʟᴜᴍ ᴅɪɴʏᴀʟᴀᴋᴀɴ ᴅɪᴄʜᴀᴛ ɪɴɪ',
        disable: '*ᴅɪsᴀʙʟᴇᴅ*\nᴄᴍᴅ ɪɴɪ ᴛᴇʟᴀʜ ᴅɪᴍᴀᴛɪᴋᴀɴ ᴏʟᴇʜ ᴏᴡɴᴇʀ',
    }[type]
    if (msg) return conn.reply(m.chat, msg, m)
}


let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})
