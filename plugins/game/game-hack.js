import { shintoHeader, shintoCard, status, toSmallNum } from '../../lib/style.js'

const COOLDOWN_MS = 5 * 60 * 1000

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = items => items[Math.floor(Math.random() * items.length)]
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const passwordSymbols = '!@#$%_'

function ensureUserHack(user) {
    if (!user.hack || typeof user.hack !== 'object') {
        user.hack = { exp: 0, attempts: 0, successes: 0, cooldown: 0, current: null, history: [] }
    }
    if (!Array.isArray(user.hack.history)) user.hack.history = []
    return user.hack
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return [hours, minutes, secs].map(value => String(value).padStart(2, '0')).join(':')
}

function formatRemaining(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000))
    const minutes = Math.floor(seconds / 60)
    return minutes > 0 ? `${minutes}m ${seconds % 60}d` : `${seconds}d`
}

function randomString(length, source = alphanumeric) {
    let result = ''
    for (let index = 0; index < length; index++) result += source[randomInt(0, source.length - 1)]
    return result
}

function randomPassword() {
    const core = randomString(9, alphanumeric)
    return `${randomString(2, letters)}${core}${randomInt(10, 99)}${pick(passwordSymbols)}`
}

function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''
}

function randomFullName() {
    const syllables = [
        'ael', 'ava', 'aze', 'bel', 'cal', 'dara', 'el', 'eve',
        'fay', 'gia', 'har', 'ira', 'jin', 'kai', 'lve', 'lyra',
        'mira', 'noa', 'ora', 're', 'sora', 'the', 'vane', 'zel'
    ]
    return `${capitalize(pick(syllables))} ${capitalize(pick(syllables))} ${capitalize(pick(syllables))}`
}

function randomBirthday() {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const month = randomInt(0, months.length - 1)
    const daysInMonth = new Date(2000, month + 1, 0).getDate()
    return `${randomInt(1, daysInMonth)} ${months[month]} ${randomInt(1988, 2005)}`
}

async function syntheticTarget(m, mentionedJid, conn) {
    const raw = mentionedJid?.[0] || m.quoted?.sender
    if (!raw) return null
    const number = raw.split('@')[0].replace(/\D/g, '')
    const users = global.db?.data?.users || {}
    const storedName = users[raw]?.name || users[number]?.name
    let resolvedName = storedName
    try {
        resolvedName = resolvedName || await conn.getName(raw)
    } catch {}
    const username = String(resolvedName || m.pushName || number || 'player')
        .replace(/[^a-zA-Z0-9_.-]/g, '')
        .replace(/^[/_.*]+/, '') || number
    return { jid: raw, number, username }
}

function randomSimulation(target) {
    const outcomes = [
        ['Successful Hack', 42],
        ['Partial Access', 18],
        ['Firewall Blocked', 12],
        ['Trace Detected', 10],
        ['System Crashed', 9],
        ['Counter Hack', 9]
    ]
    let roll = randomInt(1, 100)
    let outcome = outcomes[outcomes.length - 1][0]
    for (const [name, chance] of outcomes) {
        if (roll <= chance) {
            outcome = name
            break
        }
        roll -= chance
    }

    const base = target ? target.username : randomString(randomInt(4, 8), letters)
    const email = `${randomString(randomInt(5, 8), letters).toLowerCase()}${randomInt(100, 999)}@mail.fake`
    const phone = target?.number
        ? `+${target.number.slice(0, 2)} ${target.number.slice(2, 6)}-${target.number.slice(6, 10)}-${target.number.slice(10)}`
        : `+62 8${randomInt(10, 99)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`
    const ip = `192.0.2.${randomInt(1, 254)}`
    return {
        outcome,
        target: base,
        email,
        password: randomPassword(),
        phone,
        ip,
        fullName: randomFullName(),
        birthday: randomBirthday(),
        balance: randomInt(100000, 245000000000),
        bank: pick(['Avelia Bank', 'Nexus Bank', 'Zenith Bank', 'Moon Bank', 'Sakura Bank']),
        duration: randomInt(38, 167)
    }
}

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    const user = global.db?.data?.users?.[m.sender]
    if (!user) return m.reply(status.error('Data pemain belum tersedia.'))

    const hack = ensureUserHack(user)
    const action = String(args?.[0] || text || '').trim().toLowerCase()

    if (action === 'status') {
        if (!hack.current) {
            return m.reply(`${shintoHeader('ʜᴀᴄᴋ ᴇꜱᴛᴀᴛᴜꜱ')}\n\n${shintoCard('ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ', {
                'ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ': 'Idle',
                'ᴘ ᴏ ᴜ ᴋ': `${toSmallNum(hack.exp || 0)} EXP`
            })}`)
        }
        const active = hack.current
        return m.reply(`${shintoHeader('ʜᴀᴄᴋ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ')}\n\n${shintoCard('ᴘ ʀ ᴏ ꜱ ᴇ ꜱ', {
            'ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ': active.state || 'Processing',
            'ᴛ ᴀ ʀ ɢ ᴇ ᴛ': active.target,
            'ᴛ ᴀ ʜ ᴀ ᴘ': `${toSmallNum(active.step || 1)} / ${toSmallNum(5)}`
        })}`)
    }

    if (action === 'history') {
        if (!hack.history.length) {
            return m.reply(status.info('Belum ada riwayat simulasi hacking.'))
        }
        const lines = hack.history.slice(0, 8).map((item, index) =>
            `${index + 1}. ${item.outcome} — ${item.target} · +${item.exp} EXP`
        )
        return m.reply(`${shintoHeader('ʜᴀᴄᴋ ʜɪꜱᴛᴏʀʏ')}\n\n${shintoCard('₈ ᴀ ᴋ ᴛ ɪ ᴠ ɪ ᴛ ᴀ ꜱ', {
            'ʀɪᴡᴀʏᴀᴛ': lines.join('\n')
        })}`)
    }

    const now = Date.now()
    if (hack.cooldown && now < hack.cooldown) {
        return m.reply(status.warning(`Cooldown aktif. Coba lagi dalam *${formatRemaining(hack.cooldown - now)}*.`))
    }
    if (hack.current?.state === 'Running') {
        return m.reply(status.warning('Proses hacking sebelumnya masih berjalan. Gunakan `.hack status`.'))
    }

    const target = await syntheticTarget(m, m.mentionedJid, conn)
    const targetName = target?.username || randomString(randomInt(5, 9), letters)
    hack.current = { state: 'Running', target: targetName, step: 1, startedAt: now }
    hack.cooldown = now + COOLDOWN_MS

    const initial = `${shintoHeader('ʜᴀᴄᴋɪɴɢ ᴛᴇʀᴍɪɴᴀʟ')}

> _SIMULATION_
> INITIALIZING CONNECTION...

[01] Scanning target network...
[02] Searching security vulnerabilities...
[03] Bypassing firewall...
[04] Decrypting credentials...
[05] Accessing database...`
    await m.reply(initial)
    await sleep(900)

    const stages = [
        '[01] Target network mapped... OK',
        '[02] Vulnerability vector found... OK',
        '[03] Firewall bypass route secured... OK',
        '[04] Credentials decryption started...',
        '[05] Database handshake established...'
    ]
    for (let index = 0; index < stages.length; index++) {
        hack.current.step = index + 1
        await m.reply(`> ${stages[index]}`)
        await sleep(index === 3 ? 1100 : 650)
    }

    const data = randomSimulation({ username: targetName, number: target?.number })
    let resultTitle = 'ᴀᴄᴄᴇꜱꜱ ɢʀᴀɴᴛᴇᴅ'
    let resultLines = `👤 Username    : ${targetName}\n🪪 Full Name   : ${data.fullName}\n🎂 Birthday    : ${data.birthday}\n📧 Email       : ${data.email}\n🔑 Password    : ${data.password}\n📱 Phone       : ${data.phone}\n🌐 IP Address  : ${data.ip}\n💳 Bank        : ${data.bank}\n💰 Balance     : ${data.balance.toLocaleString('id-ID')}`

    if (data.outcome === 'Partial Access') {
        resultLines = `👤 Username    : ${targetName}\n🪪 Full Name   : ${data.fullName}\n🎂 Birthday    : ${data.birthday}\n📧 Email       : ${data.email}\n🔑 Password    : ${randomString(randomInt(10, 14), '*')}\n📱 Phone       : ${data.phone}\n🌐 IP Address  : ${data.ip}`
    } else if (data.outcome !== 'Successful Hack') {
        resultTitle = data.outcome.toUpperCase()
        resultLines = `> Sistem simulasi tidak menghasilkan ekstraksi lengkap.`
    }

    const exp = data.outcome === 'Successful Hack' ? 150 : data.outcome === 'Partial Access' ? 90 : 35
    user.exp = (user.exp || 0) + exp
    hack.exp = (hack.exp || 0) + exp
    hack.attempts = (hack.attempts || 0) + 1
    if (data.outcome === 'Successful Hack' || data.outcome === 'Partial Access') {
        hack.successes = (hack.successes || 0) + 1
    }

    hack.history.unshift({
        outcome: data.outcome,
        target: data.target,
        exp,
        at: Date.now()
    })
    hack.history = hack.history.slice(0, 10)
    hack.current = { state: 'Completed', target: data.target, step: 5, outcome: data.outcome }

    const mentions = target?.jid ? [target.jid] : []
    const result = `╭─❏「 💻 HACKING RESULT 」❏
│ SIMULATED DATA EXTRACTION
╰─━━━━━━━━━━━━━━─

🎯 Target : @${targetName}
🔓 Status : ${data.outcome === 'Successful Hack' ? 'Access Granted' : data.outcome}
⏱️ Durasi : ${formatDuration(data.duration)}

─━━━━━━━━━━━━━━─

📂 EXTRACTED DATA

${resultLines}

─━━━━━━━━━━━━━━─

⚠️ SIMULATION ONLY
> ↳ Seluruh data non-identitas dihasilkan secara acak.
> ↳ Tidak ada akun atau informasi asli yang diakses.
> ↳ Gunakan ${usedPrefix + command} history untuk melihat riwayat.`

    await conn.sendMessage(m.chat, { text: result, mentions }, { quoted: m })
}

handler.help = ['hack [@user|status|history]']
handler.tags = ['game']
handler.command = /^hack$/i
handler.register = true
handler.limit = false

export default handler
