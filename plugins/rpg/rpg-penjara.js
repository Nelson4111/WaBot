import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { ensurePrisonCell, EXCLUSIVE_JAIL_BLOCKED_COMMANDS, getRandomPrisonCell, hasExclusiveJailAccess } from '../../lib/prisonHelper.js'
import { isAfk } from '../../lib/afkHelper.js'
import { scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { markPatrolRelease, recordEscapeCrime } from '../../lib/crimeHelper.js'
import { RPG_CRIME_ACTIONS } from '../../lib/rpgCrimeData.js'
import {
    dialogVisitNapi,
    dialogVisitPengunjung,
    getPrisonTitle,
    storyBreakout,
    storyKabur,
    storyRoutine,
    storyTalk
} from '../../lib/prisonStories.js'

const randomItem = (list) => list[Math.floor(Math.random() * list.length)]
const BREAKOUT_ROOM_TTL = 30 * 60 * 1000
const rehabilitationAdvice = '\n\n📌 Jika masih memiliki poin buronan, jalani *.rh mulai* untuk membersihkan catatan buronan dan membangun kembali kepercayaan Avelia.'

function cleanupExpiredBreakouts(wdb, now = Date.now()) {
    let removed = false
    wdb.prisonBreakouts = wdb.prisonBreakouts || {}
    for (const [chat, room] of Object.entries(wdb.prisonBreakouts)) {
        if (now - Number(room.createdAt || 0) < BREAKOUT_ROOM_TTL) continue
        delete wdb.prisonBreakouts[chat]
        removed = true
    }
    return removed
}

const breakoutCleanupTimer = setInterval(() => {
    const wdb = loadDB()
    if (cleanupExpiredBreakouts(wdb)) void saveDB(wdb)
}, 60 * 1000)
breakoutCleanupTimer.unref?.()

const formatTime = (ms) => {
    ms = Math.max(0, ms)
    const jam = Math.floor(ms / 3600000)
    const menit = Math.floor((ms % 3600000) / 60000)
    const detik = Math.floor((ms % 60000) / 1000)
    if(jam > 0) return `${jam}j ${menit}m`
    if(menit > 0) return `${menit}m ${detik}d`
    return `${detik}d`
}

let handler = async (m, { conn, args, command, usedPrefix, isOwner }) => {

    const wdb = loadDB()
    if (!wdb.penjara) wdb.penjara = []
    if (!wdb.money) wdb.money = {}
    if (!wdb.visitCooldown) wdb.visitCooldown = {}
    if (!wdb.kaburCooldown) wdb.kaburCooldown = {}
    if (!wdb.routineCooldown) wdb.routineCooldown = wdb.dailyCooldown || {}
    if (!wdb.talkCooldown) wdb.talkCooldown = {}
    if (!wdb.prisonStats) wdb.prisonStats = {}
    if (!wdb.prisonVisits) wdb.prisonVisits = {}
    if (!wdb.prisonBreakouts) wdb.prisonBreakouts = {}
    if (!wdb.breakoutCooldown) wdb.breakoutCooldown = {}
    if (cleanupExpiredBreakouts(wdb)) saveDB(wdb)

    if (!global.db?.data?.users) return m.reply('❌ Database utama belum siap')

    /* =====================================================
       HELPER
    ===================================================== */

    const resolveJid = (jid) => {
        if (!jid) return null
        jid = String(jid)
        if (jid.endsWith('@s.whatsapp.net')) return jid
        if (jid.endsWith('@lid')) return global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
        if (/^\d+$/.test(jid)) return jid + '@s.whatsapp.net'
        return jid
    }
    const getUser = (jid) => { jid = resolveJid(jid); if (!jid) return null; return global.db.data.users?.[jid] || null }
    const getRPG = (jid) => { const user = getUser(jid); if (!user) return null; return user.rpg || null }
    const getTarget = (raw) => { let jid = m.mentionedJid?.[0] || m.quoted?.sender; if (!jid && raw) { let num = String(raw).replace(/[^0-9]/g, ''); if (num.startsWith('08')) num = '62' + num.slice(1); if (num.length >= 8) jid = num + '@s.whatsapp.net' } return resolveJid(jid) }
    const playerLabel = (jid) => {
        const normalizedJid = resolveJid(jid)
        const nickname = String(getRPG(normalizedJid)?.nickname || '').trim()
        return nickname || `@${normalizedJid.split('@')[0]}`
    }
    const playerMentions = (jids) => [...new Set((Array.isArray(jids) ? jids : [jids])
        .map(resolveJid)
        .filter(jid => jid && !String(getRPG(jid)?.nickname || '').trim()))]
    const kasus = (rpg) => rpg?.kasus || ((Number(rpg?.tebusan) || 0) === 1000000 ? '🤏 Copet' : (Number(rpg?.tebusan) || 0) === 2000000 ? '🏴‍☠️ Begal / 🔪 Bunuh / 🏚️ Jarah' : (Number(rpg?.tebusan) || 0) === 4000000 ? '🕵️ Rampok / 🕶️ Culik' : '👑 Owner Jail')
    const sisaWaktu = (rpg) => { if (!rpg) return 0; return Number(rpg.lamaPenjara || 0) - (Date.now() - Number(rpg.penjara || 0)) }
    const sisaTungguTebus = (rpg) => Math.max(0, 5 * 60 * 1000 - (Date.now() - Number(rpg?.penjara || 0)))
    const formatSisa = (ms) => { ms = Math.max(0, ms); const jam = Math.floor(ms / 3600000); const menit = Math.floor((ms % 3600000) / 60000); return `${jam}j ${menit}m` }
    const findPrisonerByCell = (value) => {
        const requested = String(value || '').toUpperCase()
        const prisoner = wdb.penjara.find(jid => String(getRPG(resolveJid(jid))?.sel || '').toUpperCase() === requested)
        if (prisoner) return resolveJid(prisoner)
        if (/^\d+$/.test(requested)) return resolveJid(wdb.penjara[Number(requested) - 1])
        return null
    }
    const removeFromBreakouts = (jid) => {
        jid = resolveJid(jid)
        let changed = false
        for (const [chat, room] of Object.entries(wdb.prisonBreakouts)) {
            const players = Array.isArray(room.players) ? room.players : []
            const remaining = players.filter(player => resolveJid(player) !== jid)
            if (remaining.length === players.length) continue
            changed = true
            if (!remaining.length) {
                delete wdb.prisonBreakouts[chat]
                continue
            }
            room.players = remaining
            if (resolveJid(room.creator) === jid) room.creator = remaining[0]
        }
        return changed
    }
    const clearKidnapState = (rpg) => {
        if (!rpg) return
        delete rpg.kidnappedBy
        delete rpg.kidnappedAt
        delete rpg.kidnappedUntil
        delete rpg.kidnapRansom
        delete rpg.kidnapLastActivityAt
        delete rpg.kidnapChat
        delete rpg.kidnapEscapeAttempt
        delete rpg.kidnapEscapeCooldownAt
    }
    const removeFromPrison = (jid) => {
        jid = resolveJid(jid)
        clearKidnapState(getRPG(jid))
        for (let i = wdb.penjara.length - 1; i >= 0; i--) {
            if (resolveJid(wdb.penjara[i]) === jid) wdb.penjara.splice(i, 1)
        }
        removeFromBreakouts(jid)
    }
    const recordPrisonRelease = (jid, reason, releasedBy = null, releasedAt = Date.now()) => {
        const rpg = getRPG(jid)
        if (!rpg) return
        rpg.lastPrisonRelease = {
            reason,
            releasedAt,
            ...(releasedBy ? { releasedBy: resolveJid(releasedBy) } : {})
        }
    }
    const getPrisonReleaseReason = (jid) => {
        const release = getRPG(jid)?.lastPrisonRelease
        const reason = release?.reason === 'owner'
            ? 'dibebaskan oleh Owner'
            : release?.reason === 'expired'
                ? 'masa tahanan habis'
                : release?.reason === 'escape'
                    ? 'berhasil kabur sendiri dari penjara'
                    : release?.reason === 'breakout'
                        ? 'berhasil kabur melalui breakout bersama'
                        : release?.reason === 'ransom' && release.releasedBy
                            ? `ditebus oleh ${playerLabel(resolveJid(release.releasedBy))}`
                            : null
        return reason
            ? {
                text: reason,
                mention: release?.reason === 'ransom' && release.releasedBy
                    ? resolveJid(release.releasedBy)
                    : null
            }
            : null
    }
    const replyNotImprisoned = (jid) => {
        const releaseReason = getPrisonReleaseReason(jid)
        const mentions = playerMentions(releaseReason?.mention ? [releaseReason.mention] : [])
        return conn.reply(
            m.chat,
            `❌ Kamu tidak sedang dipenjara.${releaseReason ? `\n> ↳ Karena: ${releaseReason.text}${rehabilitationAdvice}` : ''}`,
            m,
            { mentions }
        )
    }
    const isDiPenjara = (jid) => {
        jid = resolveJid(jid)
        const rpg = getRPG(jid)
        if (rpg?.penjara && sisaWaktu(rpg) < 60 * 1000) {
            const now = Date.now()
            const releasedAt = Math.min(now, (Number(rpg.penjara) || now) + (Number(rpg.lamaPenjara) || 0))
            markPatrolRelease(rpg, releasedAt)
            recordPrisonRelease(jid, 'expired', null, releasedAt)
            rpg.penjara = null
            rpg.lamaPenjara = 0
            rpg.tebusan = 0
            rpg.sel = 0
            rpg.gagalCopet = 0
            removeFromPrison(jid)
            saveDB(wdb)
            return false
        }
        return Boolean(rpg?.penjara && sisaWaktu(rpg) >= 60 * 1000 &&
            wdb.penjara.some(entry => resolveJid(entry) === jid))
    }
    const getStats = (jid) => {
        jid = resolveJid(jid)
        if (!wdb.prisonStats[jid]) wdb.prisonStats[jid] = {routine: 0, talk: 0}
        if (wdb.prisonStats[jid].routine === undefined) {
            wdb.prisonStats[jid].routine = Number(wdb.prisonStats[jid].daily) || 0
            delete wdb.prisonStats[jid].daily
        }
        if (wdb.prisonStats[jid].escapeCount === undefined) wdb.prisonStats[jid].escapeCount = wdb.prisonStats[jid].escaped ? 1 : 0
        return wdb.prisonStats[jid]
    }
    const breakoutAction = command === 'penjara' && args[0]?.toLowerCase() === 'breakout'
    const kidnappedRPG = getRPG(m.sender)
    if (command === 'penjara' && ['nickname', 'nick'].includes(args[0]?.toLowerCase())) {
        const value = args.slice(1).join(' ').trim()
        const rpg = getRPG(m.sender)
        if (!rpg) return m.reply('❌ Kamu belum memiliki data RPG.')
        if (!value || ['hapus', 'reset', 'off'].includes(value.toLowerCase())) {
            delete rpg.nickname
            await saveDB(wdb)
            return m.reply('✅ Julukan RPG dihapus. Nama tag kamu kembali ke nomor WhatsApp.')
        }
        const nickname = value.replace(/@/g, '').replace(/[\r\n]/g, ' ').replace(/\s+/g, ' ').trim()
        if (nickname.length < 2 || nickname.length > 24) {
            return m.reply('❌ Julukan harus terdiri dari 2–24 karakter.')
        }
        rpg.nickname = nickname
        await saveDB(wdb)
        return m.reply(`✅ Julukan RPG kamu sekarang *${nickname}*.\nJulukan akan ditampilkan pada profil dan daftar penjara.\nHapus dengan *.penjara nick hapus*.`)
    }
    if (kidnappedRPG?.kidnappedBy && command === 'penjara' &&
        ['routine', 'talk', 'visit', 'breakout', 'kabur'].includes(args[0]?.toLowerCase())) {
        return m.reply('❌ Tahanan penculikan tidak dapat melakukan aktivitas penjara. Gunakan *.kabur* untuk mencoba melarikan diri.')
    }

    if (command === 'kabur') {
        const rpg = getRPG(m.sender)
        const kidnapperJid = resolveJid(rpg?.kidnappedBy)
        if (!kidnapperJid) {
            return m.reply('❌ Kamu tidak sedang ditahan oleh penculik.')
        }

        const now = Date.now()
        if (now >= Number(rpg.kidnappedUntil)) {
            clearKidnapState(rpg)
            await saveDB(wdb)
            return m.reply('✅ Masa penculikan sudah habis. Kamu bebas.')
        }
        rpg.kidnapLastActivityAt = now
        rpg.kidnappedUntil = now + RPG_CRIME_ACTIONS.culik.kidnapDuration

        const attempt = rpg.kidnapEscapeAttempt
        if (attempt && now >= Number(attempt.expiresAt)) {
            clearKidnapState(rpg)
            await saveDB(wdb)
            return conn.reply(
                m.chat,
                `╭─❏「 🏃 BERHASIL KABUR 」❏\n` +
                `│ 👤 Korban: ${playerLabel(m.sender)}\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `Penculik tidak merespons dalam 5 menit. Kamu berhasil melarikan diri. Kabur dari penculikan tidak menambah poin buronan.`,
                m,
                { mentions: playerMentions([m.sender]) }
            )
        }

        if (attempt) {
            const remaining = Math.max(0, Number(attempt.expiresAt) - now)
            return conn.reply(
                m.chat,
                `⏳ Usaha kabur masih berlangsung. Penculik harus merespons dengan *.tangkap @${m.sender.split('@')[0]}* dalam *${formatTime(remaining)}*; jika tidak, kamu bebas.`,
                m,
                { mentions: playerMentions([kidnapperJid]) }
            )
        }

        const cooldownRemaining = RPG_CRIME_ACTIONS.culik.escapeCooldown - (now - (Number(rpg.kidnapEscapeCooldownAt) || 0))
        if (cooldownRemaining > 0) {
            return m.reply(`⏳ Cooldown kabur masih *${formatTime(cooldownRemaining)}*.`)
        }

        rpg.kidnapEscapeCooldownAt = now
        rpg.kidnapEscapeAttempt = {
            startedAt: now,
            expiresAt: now + RPG_CRIME_ACTIONS.culik.escapeWindow
        }
        await saveDB(wdb)
        const attemptChat = m.chat
        const escapeTimer = setTimeout(async () => {
            const activeRPG = getRPG(m.sender)
            if (Number(activeRPG?.kidnapEscapeAttempt?.startedAt) !== now) return
            clearKidnapState(activeRPG)
            await saveDB(wdb)
            try {
                await conn.reply(
                    attemptChat,
                    `╭─❏「 🏃 BERHASIL KABUR 」❏\n` +
                    `│ 👤 Korban: ${playerLabel(m.sender)}\n` +
                    `╰─━━━━━━━━━━━━━━─\n\n` +
                    `Penculik tidak merespons dalam 5 menit. Kamu berhasil melarikan diri. Kabur dari penculikan tidak menambah poin buronan.`,
                    null,
                    { mentions: playerMentions([m.sender]) }
                )
            } catch (error) {
                console.error('[RPG kidnap escape notification] Failed to notify escaped prisoner:', error)
            }
        }, RPG_CRIME_ACTIONS.culik.escapeWindow)
        escapeTimer.unref?.()
        return conn.reply(
            m.chat,
            `🏃 ${playerLabel(m.sender)} sedang berusaha kabur!\n` +
            `Penculik harus aktif dan merespons dengan *.tangkap @${m.sender.split('@')[0]}* dalam 5 menit. Jika tidak, tahanan berhasil bebas.`,
            m,
            { mentions: playerMentions([m.sender, kidnapperJid]) }
        )
    }

    if (command === 'tangkap') {
        const targetJid = resolveJid(m.mentionedJid?.[0] || m.quoted?.sender)
        if (!targetJid) return m.reply('❌ Tag atau reply tahanan yang sedang berusaha kabur.')
        const targetRPG = getRPG(targetJid)
        if (resolveJid(targetRPG?.kidnappedBy) !== resolveJid(m.sender) ||
            targetRPG?.kasus !== '🕶️ Culik' ||
            !targetRPG.kidnapEscapeAttempt) {
            return m.reply('❌ Target tersebut tidak sedang mencoba kabur dari penculikanmu.')
        }
        if (isAfk(global.db?.data?.users?.[m.sender] || wdb.users?.[m.sender] || {})) {
            return m.reply('❌ Kamu sedang AFK dan tidak bisa merespons usaha kabur.')
        }

        targetRPG.kidnapLastActivityAt = Date.now()
        targetRPG.kidnappedUntil = targetRPG.kidnapLastActivityAt + RPG_CRIME_ACTIONS.culik.kidnapDuration
        const remaining = Number(targetRPG.kidnapEscapeAttempt.expiresAt) - Date.now()
        if (remaining <= 0) {
            return m.reply('⏳ Waktu merespons sudah habis. Tahanan dapat menyelesaikan kaburnya dengan *.kabur*.')
        }

        delete targetRPG.kidnapEscapeAttempt
        await saveDB(wdb)
        return conn.reply(
            m.chat,
            `🚨 ${playerLabel(m.sender)} berhasil menangkap kembali ${playerLabel(targetJid)} sebelum kabur.\nTahanan masih berada di SEL ${targetRPG.sel}.`,
            m,
            { mentions: playerMentions([m.sender, targetJid]) }
        )
    }

if (breakoutAction) {
    if (getRPG(m.sender)?.kidnappedBy) {
        return m.reply('❌ Tahanan penculikan tidak dapat mengikuti breakout. Gunakan *.kabur* dan tunggu respons penculik.')
    }
    const action = args[1]?.toLowerCase()
    const room = wdb.prisonBreakouts[m.chat]
    const mentionName = jid => playerLabel(jid)

    if (action === 'create') {
        if (room) {
            return m.reply(
                `╭─❏「 🚨 PENJARA BREAKOUT 」❏\n` +
                `│ ❌ *ROOM BREAKOUT SUDAH ADA*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `> ↳ Gunakan *${usedPrefix}penjara breakout info*.\n\n` +
                `─━━━━━━━━━━━━━━─`
            )
        }

        if (!isDiPenjara(m.sender)) {
            return replyNotImprisoned(m.sender)
        }

        wdb.prisonBreakouts[m.chat] = {
            creator: resolveJid(m.sender),
            players: [resolveJid(m.sender)],
            createdAt: Date.now()
        }

        saveDB(wdb)

        return conn.reply(
            m.chat,
            `╭─❏「 🚨 ROOM BREAKOUT DIBUAT 」❏\n` +
            `│ 🚨 *ROOM BREAKOUT DIBUAT*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +

            `👥 *INFORMASI ROOM*\n` +
            `> ↳ ${mentionName(m.sender)} otomatis bergabung.\n` +
            `> ↳ Tahanan lain bisa ikut dengan *${usedPrefix}penjara breakout join*.\n` +
            `> ↳ Room akan otomatis dihapus jika tidak dimulai dalam 30 menit.\n\n` +

            `📌 *PERINTAH*\n` +
            `> ↳ Lihat peserta : *${usedPrefix}penjara breakout info*\n` +
            `> ↳ Mulai : *${usedPrefix}penjara breakout start*\n\n` +

            `─━━━━━━━━━━━━━━─`,
            m,
            { mentions: playerMentions([m.sender]) }
        )
    }

    if (action === 'guide') {
        return m.reply(
            `╭─❏「 📖 PENJARA BREAKOUT GUIDE 」❏\n` +
            `│ 🚨 *PANDUAN PENJARA BREAKOUT*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +

            `📌 *CARA BERMAIN*\n` +
            `> ↳ 1. Tahanan membuat room : *${usedPrefix}penjara breakout create*\n` +
            `> ↳ 2. Tahanan lain bergabung : *${usedPrefix}penjara breakout join*\n` +
            `> ↳ 3. Cek peserta : *${usedPrefix}penjara breakout info*\n` +
            `> ↳ 4. Keluar dari room : *${usedPrefix}penjara breakout leave*\n` +
            `> ↳ 5. Pembuat room memulai : *${usedPrefix}penjara breakout start*\n\n` +

            `📋 *KETENTUAN*\n` +
            `> ↳ Minimal 2 tahanan untuk mulai.\n` +
            `> ↳ Room dihapus otomatis jika tidak dimulai dalam 30 menit.\n` +
            `> ↳ Jika gagal, semua peserta mendapat tambahan masa tahanan 2 jam.\n\n` +

            `─━━━━━━━━━━━━━━─`
        )
    }

    if (action === 'join') {
        if (!room) {
            return m.reply(
                `╭─❏「 ❌ PENJARA BREAKOUT 」❏\n` +
                `│ ❌ *BELUM ADA ROOM*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `> ↳ Buat dengan *${usedPrefix}penjara breakout create*.\n\n` +
                `─━━━━━━━━━━━━━━─`
            )
        }

        if (!isDiPenjara(m.sender)) {
            return replyNotImprisoned(m.sender)
        }

        const jid = resolveJid(m.sender)

        if (room.players.some(player => resolveJid(player) === jid)) {
            return m.reply(
                `╭─❏「 ❌ PENJARA BREAKOUT 」❏\n` +
                `│ ❌ *KAMU SUDAH BERGABUNG*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `> ↳ Kamu sudah bergabung di room breakout ini.\n\n` +
                `─━━━━━━━━━━━━━━─`
            )
        }

        room.players.push(jid)
        saveDB(wdb)

        return conn.reply(
            m.chat,
            `╭─❏「 ✅ JOIN BREAKOUT 」❏\n` +
            `│ 👤 *PEMAIN BERGABUNG*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ ${mentionName(jid)} bergabung ke breakout.\n` +
            `> ↳ Total peserta : *${room.players.length}*\n\n` +
            `─━━━━━━━━━━━━━━─`,
            m,
            { mentions: playerMentions([jid]) }
        )
    }

    if (action === 'info') {
        if (!room) {
            return m.reply(
                `╭─❏「 ❌ PENJARA BREAKOUT 」❏\n` +
                `│ ❌ *BELUM ADA ROOM*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `> ↳ Buat dengan *${usedPrefix}penjara breakout create*.\n\n` +
                `─━━━━━━━━━━━━━━─`
            )
        }

        const mentions = playerMentions(room.players)
        const players = mentions
            .map((jid, index) => `> ${index + 1}. ${mentionName(jid)}${jid === resolveJid(room.creator) ? ' (pembuat)' : ''}`)
            .join('\n')

        return conn.reply(
            m.chat,
            `╭─❏「 🚨 INFO ROOM BREAKOUT 」❏\n` +
            `│ 🚨 *INFO ROOM BREAKOUT*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +

            `👤 *PEMBUAT*\n` +
            `> ↳ ${mentionName(room.creator)}\n\n` +

            `👥 *PESERTA (${mentions.length})*\n` +
            `${players}\n\n` +

            `📌 *PERINTAH*\n` +
            `> ↳ Gunakan *${usedPrefix}penjara breakout leave* untuk keluar.\n\n` +

            `─━━━━━━━━━━━━━━─`,
            m,
            { mentions }
        )
    }

    if (action === 'leave') {
        if (!room) {
            return m.reply(
                `╭─❏「 ❌ PENJARA BREAKOUT 」❏\n` +
                `│ ❌ *BELUM ADA ROOM BREAKOUT*\n` +
                `╰─━━━━━━━━━━━━━━─`
            )
        }

        const jid = resolveJid(m.sender)
        const index = room.players.findIndex(player => resolveJid(player) === jid)

        if (index < 0) {
            return m.reply(
                `╭─❏「 ❌ PENJARA BREAKOUT 」❏\n` +
                `│ ❌ *KAMU TIDAK BERGABUNG*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `> ↳ Kamu tidak berada di room ini.\n\n` +
                `─━━━━━━━━━━━━━━─`
            )
        }

        room.players.splice(index, 1)

        if (!room.players.length) {
            delete wdb.prisonBreakouts[m.chat]
        } else if (resolveJid(room.creator) === jid) {
            room.creator = room.players[0]
        }

        saveDB(wdb)

        return m.reply(
            room.players.length
                ? `╭─❏「 🚪 LEAVE BREAKOUT 」❏\n` +
                  `│ 🚪 *KELUAR DARI ROOM*\n` +
                  `╰─━━━━━━━━━━━━━━─\n\n` +
                  `> ↳ Kamu keluar dari room breakout.\n` +
                  `> ↳ Pembuat room : ${mentionName(room.creator)}.\n\n` +
                  `─━━━━━━━━━━━━━━─`
                : `╭─❏「 🚪 BREAKOUT DIBUBARKAN 」❏\n` +
                  `│ 🚪 *ROOM TIDAK MEMILIKI PESERTA*\n` +
                  `╰─━━━━━━━━━━━━━━─\n\n` +
                  `> ↳ Kamu keluar. Room breakout dibubarkan karena tidak ada peserta.\n\n` +
                  `─━━━━━━━━━━━━━━─`
        )
    }

    if (action === 'start') {
        if (!room) {
            return m.reply(
                `╭─❏「 ❌ PENJARA BREAKOUT 」❏\n` +
                `│ ❌ *BELUM ADA ROOM*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `> ↳ Buat dengan *${usedPrefix}penjara breakout create*.\n\n` +
                `─━━━━━━━━━━━━━━─`
            )
        }

        if (resolveJid(room.creator) !== resolveJid(m.sender)) {
            return m.reply(
                `╭─❏「 ❌ AKSES DITOLAK 」❏\n` +
                `│ ❌ *Hanya pembuat room yang bisa memulai breakout.*\n` +
                `╰─━━━━━━━━━━━━━━─`
            )
        }

        if (room.players.length < 2) {
            return m.reply(
                `╭─❏「 ❌ BREAKOUT 」❏\n` +
                `│ ❌ *PEMAIN TIDAK CUKUP*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `> ↳ Breakout membutuhkan minimal 2 tahanan.\n\n` +
                `─━━━━━━━━━━━━━━─`
            )
        }

        const now = Date.now()
        const cooldown = room.players
            .map(resolveJid)
            .find(jid => now - (Number(wdb.breakoutCooldown[jid]) || 0) < 30 * 60 * 1000)

        if (cooldown) {
            return m.reply(
                `╭─❏「 ⏳ BREAKOUT COOLDOWN 」❏\n` +
                `│ ⏳ *MASIH COOLDOWN*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `> ↳ ${mentionName(cooldown)} masih cooldown breakout selama *${formatTime(30 * 60 * 1000 - (now - Number(wdb.breakoutCooldown[cooldown] || 0)))}*.\n\n` +
                `─━━━━━━━━━━━━━━─`
            )
        }

        const players = room.players
            .map(resolveJid)
            .filter((jid, index, list) => jid && list.indexOf(jid) === index)

        const invalid = players.filter(jid => !isDiPenjara(jid) || !getRPG(jid))

        if (invalid.length) {
            const invalidReasons = invalid
                .map(jid => {
                    const releaseReason = getPrisonReleaseReason(jid)
                    return releaseReason ? `> ↳ ${mentionName(jid)}: ${releaseReason.text}` : null
                })
                .filter(Boolean)
            const releaseMentions = invalid
                .map(jid => getPrisonReleaseReason(jid)?.mention)
                .filter(Boolean)
            return conn.reply(
                m.chat,
                `╭─❏「 ❌ BREAKOUT GAGAL 」❏\n` +
                `│ ❌ *PESERTA TIDAK VALID*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `> ↳ Peserta berikut sudah tidak berada di penjara:\n` +
                `> ↳ ${invalid.map(mentionName).join(', ')}\n` +
                `${invalidReasons.length ? `${invalidReasons.join('\n')}\n` : ''}` +
                `> ↳ Mereka harus leave sebelum breakout dimulai.\n\n` +
                `─━━━━━━━━━━━━━━─`,
                m,
                { mentions: playerMentions([...invalid, ...releaseMentions]) }
            )
        }

        const chance = 0.5
        const success = Math.random() < chance
        const story = randomItem(storyBreakout[success ? 'sukses' : 'gagal'])
        const mentions = playerMentions(players)
        const names = players.map(mentionName).join(', ')

        for (const jid of players) {
            wdb.breakoutCooldown[jid] = now
        }

        delete wdb.prisonBreakouts[m.chat]

        if (success) {
            for (const jid of players) {
                const rpg = getRPG(jid)

                markPatrolRelease(rpg)
                recordPrisonRelease(jid, 'breakout', null, now)
                rpg.penjara = null
                rpg.lamaPenjara = 0
                rpg.tebusan = 0
                rpg.sel = 0
                rpg.gagalCopet = 0

                const stats = getStats(jid)
                stats.escaped = true
                recordEscapeCrime(wdb, jid, 'breakout')
                removeFromPrison(jid)
            }

            saveDB(wdb)

            return conn.reply(
                m.chat,
                `╭─❏「 🚨 BREAKOUT BERHASIL 」❏\n` +
                `│ 🚨 *SEMUA PESERTA BERHASIL KABUR!*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +

                `📖 *CERITA PELARIAN*\n` +
                `> ↳ ${story}\n\n` +

                `👥 *PESERTA BERHASIL KABUR*\n` +
                `> ↳ ${names}\n\n` +
                `${rehabilitationAdvice}\n` +

                `─━━━━━━━━━━━━━━─`,
                m,
                { mentions }
            )
        }

        for (const jid of players) {
            getRPG(jid).lamaPenjara += 2 * 60 * 60 * 1000
        }

        saveDB(wdb)

        return conn.reply(
            m.chat,
            `╭─❏「 🚨 BREAKOUT GAGAL 」❏\n` +
            `│ 🚨 *PELARIAN GAGAL*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +

            `📖 *CERITA PELARIAN*\n` +
            `> ↳ ${story}\n\n` +

            `🚔 *HUKUMAN TAMBAHAN*\n` +
            `> ↳ Semua peserta mendapat tambahan hukuman 2 jam.\n` +
            `> ↳ Peserta : ${names}\n\n` +

            `─━━━━━━━━━━━━━━─`,
            m,
            { mentions }
        )
    }

    return m.reply(
        `╭─❏「 🚨 PENJARA BREAKOUT 」❏\n` +
        `│ 🚨 *COMMAND BREAKOUT*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +

        `📌 *PERINTAH*\n` +
        `> ↳ ${usedPrefix}penjara breakout create\n` +
        `> ↳ ${usedPrefix}penjara breakout join\n` +
        `> ↳ ${usedPrefix}penjara breakout info\n` +
        `> ↳ ${usedPrefix}penjara breakout leave\n` +
        `> ↳ ${usedPrefix}penjara breakout start\n\n` +

        `📖 *PANDUAN*\n` +
        `> ↳ ${usedPrefix}penjara guide\n\n` +

        `─━━━━━━━━━━━━━━─`
    )
}

    if (command === 'penjara' && ['guide', 'note'].includes(args[0]?.toLowerCase())) {
    return m.reply(
        `╭─❏「 📖 PANDUAN PENJARA 」❏\n` +
        `│ 📖 *PANDUAN PENJARA*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +

        `📌 *INFORMASI PENJARA*\n` +
        `> ↳ Atur julukan profil: *${usedPrefix}penjara nickname <julukan>*; hapus dengan *${usedPrefix}penjara nick hapus*.\n` +
        `> ↳ Cek status dan progres: *${usedPrefix}penjara info*\n` +
        `> ↳ Lihat daftar tahanan: *${usedPrefix}penjara list*\n` +
        `> ↳ Lihat daftar tahanan per blok: *${usedPrefix}penjara sel <blok>*\n` +
        `> ↳ Lihat cooldown semua tahanan: *${usedPrefix}penjara cd*\n` +
        `> ↳ Lihat catatan kabur berhasil: *${usedPrefix}penjara escord*\n\n` +

        `📈 *PROGRES TAHANAN*\n` +
        `> ↳ Tahanan mengisi progres lewat *${usedPrefix}penjara routine* dan *${usedPrefix}penjara talk*; masing-masing punya cooldown.\n\n` +

        `🚨 *PELARIAN*\n` +
        `> ↳ Coba kabur sendiri: *${usedPrefix}penjara kabur*. Kegagalan menambah hukuman 30 menit.\n` +
        `> ↳ Breakout bersama: pembuat room gunakan *${usedPrefix}penjara breakout create*, tahanan lain *join*, lalu pembuat *start*.\n` +
        `> ↳ Gunakan *info* dan *leave* untuk mengelola room.\n\n` +

        `👥 *KUNJUNGAN & TEBUSAN*\n` +
        `> ↳ Kunjungi tahanan: *${usedPrefix}penjara visit sel <kode>*\n` +
        `> ↳ Tebus tahanan: *${usedPrefix}penjara tebus sel <kode>* atau *${usedPrefix}penjara tebus all*.\n\n` +

        `─━━━━━━━━━━━━━━─`
    )
}

if (command === 'penjara' && args[0]?.toLowerCase() === 'command') {
    return m.reply(
        `╭─❏「 📌 COMMAND PENJARA 」❏\n` +
        `│ 📌 *DAFTAR COMMAND*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +

        `🚔 *PENJARA*\n` +
        `> ↳ ${usedPrefix}penjara\n` +
        `> ↳ ${usedPrefix}penjara info\n` +
        `> ↳ ${usedPrefix}penjara nickname <julukan>\n` +
        `> ↳ ${usedPrefix}penjara nick hapus\n` +
        `> ↳ ${usedPrefix}penjara sel <blok>\n` +
        `> ↳ ${usedPrefix}penjara list\n` +
        `> ↳ ${usedPrefix}penjara cd\n` +
        `> ↳ ${usedPrefix}penjara escord\n` +
        `> ↳ ${usedPrefix}penjara routine\n` +
        `> ↳ ${usedPrefix}penjara talk\n` +
        `> ↳ ${usedPrefix}penjara kabur\n` +
        `> ↳ ${usedPrefix}penjara visit <sel/tag>\n` +
        `> ↳ ${usedPrefix}penjara breakout create\n` +
        `> ↳ ${usedPrefix}penjara breakout join\n` +
        `> ↳ ${usedPrefix}penjara breakout info\n` +
        `> ↳ ${usedPrefix}penjara breakout leave\n` +
        `> ↳ ${usedPrefix}penjara breakout start\n` +
        `> ↳ ${usedPrefix}penjara note\n` +
        `> ↳ ${usedPrefix}penjara guide\n\n` +

        `💰 *TEBUSAN*\n` +
        `> ↳ ${usedPrefix}penjara tebus <sel/tag/all>\n\n` +

        `─━━━━━━━━━━━━━━─`
    )
}

    /* =====================================================
       REBUILD LIST PENJARA DARI DATA USER
    ===================================================== */

    let rebuild = false
    for(let jid in global.db.data.users){
        let rpg = global.db.data.users[jid].rpg
        if(rpg?.penjara && Number(rpg.lamaPenjara) > 0){
            let sisa = Number(rpg.lamaPenjara) - (Date.now() - Number(rpg.penjara))
            if(sisa > 0){
                if(!wdb.penjara.some(x => resolveJid(x) === resolveJid(jid))){
                    wdb.penjara.push(jid)
                    rebuild = true
                }
            }
        }
    }
    if(rebuild) saveDB(wdb)

    /* =====================================================
       BERSIHKAN PENJARA + AUTO BEBAS + URUTIN SEL
    ===================================================== */

    let changed = false
    let valid = []
    let seenPrisoners = new Set()
    for (let i = wdb.penjara.length - 1; i >= 0; i--) {
        const jid = resolveJid(wdb.penjara[i])
        if (!jid || seenPrisoners.has(jid)) { changed = true; continue }
        seenPrisoners.add(jid)
        const rpg = getRPG(jid)
        if (!rpg ||!rpg.penjara) {
            if (removeFromBreakouts(jid)) changed = true
            wdb.penjara.splice(i, 1); changed = true; continue
        }
        if (sisaWaktu(rpg) < 60 * 1000) {
            const releasedAt = Number(rpg.penjara) + (Number(rpg.lamaPenjara) || 0)
            markPatrolRelease(rpg, releasedAt)
            recordPrisonRelease(jid, 'expired', null, releasedAt)
            rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0
            if (removeFromBreakouts(jid)) changed = true
            wdb.penjara.splice(i, 1); changed = true
        } else { valid.unshift(jid) }
    }
    wdb.penjara = valid
    wdb.penjara.forEach((jid) => {
        let rpg = getRPG(jid)
        if (rpg) {
            const previousCell = rpg.sel
            ensurePrisonCell(wdb, jid)
            if (rpg.sel !== previousCell) changed = true
        }
    })
    if (changed) saveDB(wdb)

    if (command === 'penjara' && args[0]?.toLowerCase() === 'cd') {
    const now = Date.now()
    const activePrisoners = wdb.penjara
        .map(jid => resolveJid(jid))
        .filter((jid, index, list) => jid && list.indexOf(jid) === index)
        .map(jid => ({ jid, rpg: getRPG(jid) }))
        .filter(({ rpg }) => rpg?.penjara && sisaWaktu(rpg) >= 60 * 1000)

    if (!activePrisoners.length) {
        return m.reply(
            `╭─❏「 ⏳ COOLDOWN TAHANAN 」❏\n` +
            `│ 📋 *TIDAK ADA TAHANAN AKTIF*\n` +
            `╰─━━━━━━━━━━━━━━─`
        )
    }

    const cooldownRemaining = (map, jid, duration) =>
        Math.max(0, duration - (now - (Number(map[jid]) || 0)))

    const mentions = playerMentions(activePrisoners.map(({ jid }) => jid))

    const list = activePrisoners.map(({ jid, rpg }, index) => {
        const routine = cooldownRemaining(
            wdb.routineCooldown,
            jid,
            scaleDifficultyCooldown(rpg, 2 * 60 * 1000)
        )
        const talk = cooldownRemaining(
            wdb.talkCooldown,
            jid,
            scaleDifficultyCooldown(rpg, 2 * 60 * 1000)
        )
        const escape = cooldownRemaining(
            wdb.kaburCooldown,
            jid,
            scaleDifficultyCooldown(rpg, 5 * 60 * 1000)
        )
        const visit = cooldownRemaining(
            wdb.visitCooldown,
            jid,
            scaleDifficultyCooldown(rpg, 5 * 60 * 1000)
        )
        const breakout = cooldownRemaining(
            wdb.breakoutCooldown,
            jid,
            30 * 60 * 1000
        )

        return `👤 *${index + 1}. SEL ${rpg.sel || '-'}*\n` +
            `> ↳ ${playerLabel(jid)}\n` +
            `> ↳ ⏳ Routine : ${routine ? formatTime(routine) : 'Siap'}\n` +
            `> ↳ 💬 Talk : ${talk ? formatTime(talk) : 'Siap'}\n` +
            `> ↳ 🚪 Kabur : ${escape ? formatTime(escape) : 'Siap'}\n` +
            `> ↳ 👥 Kunjungan : ${visit ? formatTime(visit) : 'Siap'}\n` +
            `> ↳ 🚨 Breakout : ${breakout ? formatTime(breakout) : 'Siap'}`
    }).join('\n\n')

    return conn.reply(
        m.chat,
        `╭─❏「 ⏳ COOLDOWN TAHANAN 」❏\n` +
        `│ ⏳ *STATUS COOLDOWN*\n` +
        `│ Total : ${activePrisoners.length} tahanan\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${list}\n\n` +
        `─━━━━━━━━━━━━━━─`,
        m,
        { mentions }
    )
}

if (command === 'penjara' && args[0]?.toLowerCase() === 'escord') {
    const records = Object.entries(wdb.prisonStats)
        .map(([jid, stats]) => ({
            jid: resolveJid(jid),
            count: Number(stats?.escapeCount) || (stats?.escaped ? 1 : 0)
        }))
        .filter(({ jid, count }) => jid && count > 0)
        .sort((a, b) => b.count - a.count)

    if (!records.length) {
        return m.reply(
            `╭─❏「 🚨 ESCAPE RECORD 」❏\n` +
            `│ 📭 *BELUM ADA CATATAN*\n` +
            `│ Belum ada catatan tahanan yang berhasil kabur.\n` +
            `╰─━━━━━━━━━━━━━━─`
        )
    }

    const mentions = playerMentions(records.map(({ jid }) => jid))

    const list = records
        .map(({ jid, count }, index) =>
            `🚨 *${index + 1}. ${count}x berhasil kabur*\n` +
            `> ↳ ${playerLabel(jid)}`
        )
        .join('\n\n')

    return conn.reply(
        m.chat,
        `╭─❏「 🚨 ESCAPE RECORD 」❏\n` +
        `│ 🚨 *CATATAN PELARIAN*\n` +
        `│ Total : ${records.length} orang\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${list}\n\n` +
        `─━━━━━━━━━━━━━━─`,
        m,
        { mentions }
    )
}

if (command === 'penjara' && ['exs', 'exclusive', 'eks', 'eksklusif'].includes(args[0]?.toLowerCase())) {
  const rpg = getRPG(m.sender)
  if (!rpg) {
    return m.reply(
      `╭─❏「 🔐 AKSES PENJARA EKSKLUSIF 」❏\n` +
      `│ ❌ *DATA RPG TIDAK DITEMUKAN*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Kamu belum memiliki data RPG.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const hasExclusiveAccess = hasExclusiveJailAccess(rpg)
  const jailed = isDiPenjara(m.sender)

  if (hasExclusiveAccess && jailed) {
    const previousCell = rpg.sel
    ensurePrisonCell(wdb, m.sender)
    if (rpg.sel !== previousCell) await saveDB(wdb)
  }

  const accessDescription = hasExclusiveAccess
    ? `✅ *AKSES EKSKLUSIF AKTIF*${jailed ? `\n> ↳ Sel premium kamu: *${rpg.sel}*` : ''}\n> ↳ Saat dipenjara, command RPG di luar daftar blokir tetap bisa digunakan.`
    : `🔒 *AKSES EKSKLUSIF BELUM AKTIF*\n> ↳ Akses sel premium tersedia mulai Cyan Card (Lv.12) melalui *.upgradebank*.\n> ↳ Saat dipenjara, akses RPG selain command penjara diblokir.`

  const blockedCommands = EXCLUSIVE_JAIL_BLOCKED_COMMANDS.map(name => `.${name}`).join(', ')

  const allowedCommands = hasExclusiveAccess
    ? `Semua command RPG selain daftar blokir di bawah, termasuk *.bank*, *.cl*, *.inv*, serta routine, talk, dan kabur.`
    : `*.penjara*, termasuk info, routine, talk, kabur, dan tebus. Command non-RPG tidak terpengaruh.`

  return m.reply(
    `╭─❏「 🔐 AKSES PENJARA EKSKLUSIF 」❏\n` +
    `│ 📋 *STATUS AKSES PENJARA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `${accessDescription}\n\n` +
    `✅ *COMMAND YANG BISA DIAKSES*\n` +
    `> ↳ ${allowedCommands}\n\n` +
    `${hasExclusiveAccess ? '⛔ *TETAP DIBLOKIR DI SEL PREMIUM*' : '⛔ *BLOKIR SAAT DI SEL STANDAR*'}\n` +
    `> ↳ ${blockedCommands}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

/* =====================================================
   BLOKIR COMMAND BUAT YG DIPENJARA
   CUMA BOLEH: penjara, penjara kabur
===================================================== */

if (isDiPenjara(m.sender) && command !== 'penjara') {
    let rpg = getRPG(m.sender)
    let stats = getStats(m.sender)
    let sisa = formatSisa(sisaWaktu(rpg))

    return m.reply(
        `╭─❏「 🚔 DI PENJARA 」❏\n` +
        `│ 🚔 *KAMU SEDANG DI PENJARA*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +

        `📋 *STATUS TAHANAN*\n` +
        `> ↳ 🏷️ Title : ${getPrisonTitle(stats)}\n` +
        `> ↳ 🚪 SEL : ${rpg.sel}\n` +
        `> ↳ ⏳ Sisa : ${sisa}\n\n` +

        `📌 *COMMAND YANG DAPAT DIGUNAKAN*\n` +
        `> ↳ ${usedPrefix}penjara\n` +
        `> ↳ ${usedPrefix}penjara info\n` +
        `> ↳ ${usedPrefix}penjara routine\n` +
        `> ↳ ${usedPrefix}penjara talk\n` +
        `> ↳ ${usedPrefix}penjara kabur\n\n` +

        `─━━━━━━━━━━━━━━─`
    )
}

if (command === 'penjara' && args[0]?.toLowerCase() === 'info') {
    const target = resolveJid(m.mentionedJid?.[0] || m.quoted?.sender || (args[1] ? getTarget(args[1]) : m.sender))
    if (!target) return m.reply(
        `╭─❏「 ❌ FORMAT SALAH 」❏\n` +
        `│ ❌ *Format perintah tidak valid.*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 *CONTOH*\n` +
        `> ↳ ${usedPrefix}penjara info\n` +
        `> ↳ ${usedPrefix}penjara info @tag/reply\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    const stats = wdb.prisonStats[target] || { routine: 0, talk: 0 }
    const rpg = getRPG(target)
    const visits = Array.isArray(wdb.prisonVisits[target]) ? wdb.prisonVisits[target] : []
    const recentVisits = visits.slice(-10).reverse()
    const mentions = playerMentions([target, ...recentVisits.map(entry => resolveJid(entry.visitor)).filter(Boolean)])
    const visitText = recentVisits.length
        ? recentVisits.map((entry, index) => `> ↳ ${index + 1}. ${playerLabel(resolveJid(entry.visitor))} — ${new Date(entry.at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`).join('\n')
        : `> ↳ Belum ada yang mengunjungi.`

    const prisonStatus = rpg?.penjara && sisaWaktu(rpg) >= 60 * 1000
        ? `Di penjara • SEL ${rpg.sel} • Sisa ${formatSisa(sisaWaktu(rpg))}`
        : 'Tidak sedang dipenjara'

    return conn.reply(
        m.chat,
        `╭─❏「 🚔 INFO PENJARA 」❏\n` +
        `│ 👤 *${playerLabel(target)}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +

        `📋 *INFORMASI PENJARA*\n` +
        `> ↳ 🏷️ Title : ${getPrisonTitle(stats)}\n` +
        `> ↳ 📖 Routine : ${Number(stats.routine) || 0}x\n` +
        `> ↳ 💬 Talk : ${Number(stats.talk) || 0}x\n` +
        `> ↳ 🚪 Status : ${prisonStatus}\n\n` +

        `👥 *RIWAYAT KUNJUNGAN* (${visits.length})\n` +
        `${visitText}\n\n` +

        `─━━━━━━━━━━━━━━─`,
        m,
        { mentions: playerMentions(mentions) }
    )
}

   if (command === 'penjara' && args[0]?.toLowerCase() === 'routine') {
       if (!isDiPenjara(m.sender)) return replyNotImprisoned(m.sender)
    let last = Number(wdb.routineCooldown[m.sender]) || 0
    let now = Date.now()
    let CD = scaleDifficultyCooldown(getRPG(m.sender), 2 * 60 * 1000)
    if (now - last < CD) return m.reply(`⏳ Tunggu *${formatTime(CD - (now - last))}* buat routine lagi`)

    wdb.routineCooldown[m.sender] = now
    let stats = getStats(m.sender)
    stats.routine = Number(stats.routine) + (stats.escaped ? 2 : 1)
    saveDB(wdb)

    let story = randomItem(storyRoutine)

    return m.reply(
`[ 📖 ]───[ *_ROUTINE PENJARA_* ]───✦

> ${story}

╭──「 STAT 」─✦
│ 🏷️ Title: ${getPrisonTitle(stats)}
│ 𖥔 Routine: ${stats.routine}x
│ 𖥔 Talk: ${stats.talk}x
╰─━━━━━━━━━━━━━━─`
    )
}


/* =====================================================
   PENJARA TALK - CD 2 MENIT
   ===================================================== */

if (command === 'penjara' && args[0]?.toLowerCase() === 'talk') {
    if (!isDiPenjara(m.sender)) return replyNotImprisoned(m.sender)
    let last = Number(wdb.talkCooldown[m.sender]) || 0
    let now = Date.now()
    let CD = scaleDifficultyCooldown(getRPG(m.sender), 2 * 60 * 1000)
    if (now - last < CD) return m.reply(`⏳ Tunggu *${formatTime(CD - (now - last))}* buat ngobrol lagi`)

    wdb.talkCooldown[m.sender] = now
    let stats = getStats(m.sender)
    stats.talk = Number(stats.talk) + (stats.escaped ? 2 : 1)
    saveDB(wdb)

    let story = randomItem(storyTalk).replace(/\n/g, '\n> ')

    return m.reply(
`[ 💬 ]───[ *_NGOBROL DI PENJARA_* ]───✦

> ${story}

╭──「 STAT 」─✦
│ 🏷️ Title: ${getPrisonTitle(stats)}
│ 𖥔 Routine: ${stats.routine}x
│ 𖥔 Talk: ${stats.talk}x
╰─━━━━━━━━━━━━━━─`
    )
}

    /* =====================================================
       KABUR DARI PENJARA -.penjara kabur
    ===================================================== */

    if (command === 'penjara' && args[0]?.toLowerCase() === 'kabur') {
        if (getRPG(m.sender)?.kidnappedBy) {
            return m.reply('❌ Kamu tidak bisa bebas sendiri dari penculikan. Gunakan *.kabur* lalu tunggu respons penculik.')
        }
        if (!isDiPenjara(m.sender)) return replyNotImprisoned(m.sender)
        let last = Number(wdb.kaburCooldown[m.sender]) || 0
        let now = Date.now()
        let CD = scaleDifficultyCooldown(getRPG(m.sender), 5 * 60 * 1000)
        if (now - last < CD) return m.reply(`⏳ *COOLDOWN KABUR*\n\nTunggu *${formatTime(CD - (now - last))}* lagi`)
        wdb.kaburCooldown[m.sender] = now

        let stats = getStats(m.sender)
        let peluang = 0.01
        const routine = Number(stats.routine) || 0
        const talk = Number(stats.talk) || 0
        const guaranteedEscape = routine >= 25 && talk >= 25 && !stats.guaranteedEscapeUsed
        if (isOwner) {
            peluang = 0.9
        } else if (guaranteedEscape) {
            peluang = 1
            stats.guaranteedEscapeUsed = true
        } else if (routine >= 100 && talk >= 100) {
            peluang = 1
        } else if (routine >= 50 && talk >= 50) {
            peluang = 0.5
        } else if (Number(stats.routine) >= 20 && Number(stats.talk) >= 20) {
            peluang = 0.1
        }

        saveDB(wdb)
        let story = randomItem(storyKabur)
        let berhasil = Math.random() < peluang
        let rpg = getRPG(m.sender)
        let selLama = rpg.sel

        if (berhasil) {
            markPatrolRelease(rpg)
            recordPrisonRelease(m.sender, 'escape', null, now)
            rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0
            stats.escaped = true
            recordEscapeCrime(wdb, resolveJid(m.sender), 'kabur')
            removeFromPrison(m.sender)
            saveDB(wdb)
            return conn.reply(m.chat, `[ 🚨 ]───[ *_KABUR BERHASIL_* ]───✦\n\n${story.sukses}\n\n╭──「 🎉 BEBAS 」─✦\n│ 𖥔 Nama : ${playerLabel(m.sender)}\n│ 𖥔 Dari : SEL ${selLama}\n╰ 𖥔 Selamat! Kamu buronan sekarang.${rehabilitationAdvice}`, m, { mentions: playerMentions([m.sender]) })
        } else {
            rpg.lamaPenjara += 30 * 60 * 1000
            saveDB(wdb)
            return conn.reply(m.chat, `[ 🚨 ]───[ *_KABUR GAGAL_* ]───✦\n\n${story.gagal}\n\n╭──「 💥 GAGAL 」─✦\n│ 𖥔 Nama : ${playerLabel(m.sender)}\n│ 𖥔 SEL : ${selLama}\n╰ 𖥔 Hukuman +30 menit!`, m, { mentions: playerMentions([m.sender]) })
        }
    }

    /* =====================================================
       PENJARA - VISIT
    ===================================================== */

    if (command === 'penjara' && args[0]?.toLowerCase() === 'visit') {
    let last = Number(wdb.visitCooldown[m.sender]) || 0
    let now = Date.now()
    let CD = scaleDifficultyCooldown(getRPG(m.sender), 5 * 60 * 1000)

    if (now - last < CD) {
        return m.reply(
            `╭─❏「 ⏳ COOLDOWN KUNJUNGAN 」❏\n` +
            `│ ⏳ *COOLDOWN KUNJUNGAN*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Tunggu *${formatTime(CD - (now - last))}* lagi\n\n` +
            `─━━━━━━━━━━━━━━─`
        )
    }

    let who = null

    if (args[1]?.toLowerCase() === 'sel' && args[2]) {
        who = findPrisonerByCell(args[2])
        if (!who) return m.reply(
            `╭─❏「 ❌ SEL KOSONG 」❏\n` +
            `│ ❌ *Sel ${args[2].toUpperCase()} kosong*\n` +
            `╰─━━━━━━━━━━━━━━─`
        )
    } else if (/^[A-Z]+[1-9]$/i.test(args[1] || '')) {
        who = findPrisonerByCell(args[1])
        if (!who) return m.reply(
            `╭─❏「 ❌ SEL KOSONG 」❏\n` +
            `│ ❌ *Sel ${args[1].toUpperCase()} kosong*\n` +
            `╰─━━━━━━━━━━━━━━─`
        )
    } else if (args[1] && /^\d+$/.test(args[1])) {
        who = findPrisonerByCell(args[1])
        if (!who) return m.reply(
            `╭─❏「 ❌ SEL KOSONG 」❏\n` +
            `│ ❌ *Sel ${args[1]} kosong*\n` +
            `╰─━━━━━━━━━━━━━━─`
        )
    } else {
        who = getTarget(args[1])
        if (!who) return m.reply(
            `╭─❏「 🚔 KUNJUNGAN PENJARA 」❏\n` +
            `│ 🚔 *FORMAT KUNJUNGAN*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `📌 *CONTOH*\n` +
            `> ↳ ${usedPrefix}penjara visit @tag\n` +
            `> ↳ ${usedPrefix}penjara visit 2\n\n` +
            `─━━━━━━━━━━━━━━─`
        )
    }

    if (who === resolveJid(m.sender)) {
        return m.reply(
            `╭─❏「 ❌ KUNJUNGAN DITOLAK 」❏\n` +
            `│ ❌ *Kamu tidak bisa mengunjungi dirimu sendiri.*\n` +
            `╰─━━━━━━━━━━━━━━─`
        )
    }

    let index = wdb.penjara.findIndex(jid => resolveJid(jid) === who)

    if (index === -1) {
        return m.reply(
            `╭─❏「 ❌ KUNJUNGAN GAGAL 」❏\n` +
            `│ ❌ *Orang tersebut tidak di penjara.*\n` +
            `╰─━━━━━━━━━━━━━━─`
        )
    }

    const rpg = getRPG(who)

    if (!rpg || !rpg.penjara) {
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid) !== who)
        removeFromBreakouts(who)
        saveDB(wdb)

        return m.reply(
            `╭─❏「 ❌ DATA TAHANAN 」❏\n` +
            `│ ❌ *Data tahanan tidak valid.*\n` +
            `╰─━━━━━━━━━━━━━━─`
        )
    }

    if (sisaWaktu(rpg) < 60 * 1000) {
        const selLama = rpg.sel || index + 1
        const releasedAt = Number(rpg.penjara) + (Number(rpg.lamaPenjara) || 0)
        markPatrolRelease(rpg, releasedAt)
        recordPrisonRelease(who, 'expired', null, releasedAt)
        rpg.penjara = null
        rpg.lamaPenjara = 0
        rpg.tebusan = 0
        rpg.sel = 0
        rpg.gagalCopet = 0
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid) !== who)
        removeFromBreakouts(who)
        saveDB(wdb)

        return m.reply(
            `╭─❏「 🚔 TAHANAN BEBAS 」❏\n` +
            `│ 🚔 *${playerLabel(who)} sudah bebas.*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `📋 *STATUS*\n` +
            `> ↳ SEL : ${selLama}\n` +
            `> ↳ Masa tahanan telah habis\n\n` +
            `${rehabilitationAdvice}\n\n` +
            `─━━━━━━━━━━━━━━─`,
            { mentions: playerMentions([who]) }
        )
    }

    wdb.visitCooldown[m.sender] = now
    wdb.prisonVisits[who] = Array.isArray(wdb.prisonVisits[who]) ? wdb.prisonVisits[who] : []
    wdb.prisonVisits[who].push({ visitor: resolveJid(m.sender), at: now })

    if (wdb.prisonVisits[who].length > 50) {
        wdb.prisonVisits[who].splice(0, wdb.prisonVisits[who].length - 50)
    }

    saveDB(wdb)

    const sisa = sisaWaktu(rpg)
    const tebusan = Number(rpg.tebusan) || 0

    let cap = `╭─❏「 🚔 RUANG KUNJUNGAN 」❏\n`
    cap += `│ 🚔 *SEL ${rpg.sel || index + 1}*\n`
    cap += `╰─━━━━━━━━━━━━━━─\n\n`

    cap += `👤 *INFORMASI TAHANAN*\n`
    cap += `> ↳ Nama : ${playerLabel(who)}\n`
    cap += `> ↳ Sisa : ${formatSisa(sisa)}\n`
    cap += `> ↳ Tebusan : Rp ${tebusan.toLocaleString('id-ID')}\n\n`

    cap += `💬 *PERCAKAPAN*\n`
    cap += `> ↳ 👤 Kamu : "${randomItem(dialogVisitPengunjung)}"\n`
    cap += `> ↳ 🚓 Tahanan : "${randomItem(dialogVisitNapi)}"\n\n`

    cap += `📌 *INFO KUNJUNGAN*\n`
    cap += `> ↳ CD Kunjung : 5 menit\n\n`

    cap += `─━━━━━━━━━━━━━━─`

    return conn.reply(m.chat, cap, m, { mentions: playerMentions([m.sender, who]) })
}

    /* =====================================================
       OWNER - PENJARAIN
    ===================================================== */

    if (command === 'penjarain') {
        if (!isOwner) return m.reply('❌ Khusus Owner')
        let who, menit, tebusan
        if (m.quoted || m.mentionedJid?.[0]) { who = getTarget(); menit = parseInt(args[0]); tebusan = parseInt(args[1]) }
        else { who = getTarget(args[0]); menit = parseInt(args[1]); tebusan = parseInt(args[2]) }
        if (!who) return m.reply(`*Format:*\n${usedPrefix}penjarain @tag <menit> <tebusan>`)
        if (isNaN(menit) || menit < 1) menit = 30
        if (isNaN(tebusan) || tebusan < 0) tebusan = 1000000
        let user = getUser(who); if (!user) return m.reply('❌ Data user target tidak ditemukan'); if (!user.rpg) user.rpg = {}
        let rpg = user.rpg
        if (rpg.rehabilitation?.status === 'active') return m.reply('🕊️ Target sedang menjalani rehabilitasi dan tidak bisa dipenjara.')
        if (rpg.penjara && sisaWaktu(rpg) >= 60 * 1000) return m.reply(`❌ Orang ini sudah di penjara.\n\n🚔 SEL : ${rpg.sel || 0}\n⏳ SISA : ${formatSisa(sisaWaktu(rpg))}`)
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
        wdb.penjara.push(who)
        rpg.penjara = Date.now(); rpg.lamaPenjara = menit * 60000; rpg.tebusan = tebusan; rpg.kasus = '👑 Owner Jail'; rpg.sel = getRandomPrisonCell(wdb, who); rpg.gagalCopet = 0
        saveDB(wdb)
        return conn.reply(m.chat, `[ 🚔 ]───[ *_OWNER JAIL_* ]───✦\n╭ 𖥔 Target : ${playerLabel(who)}\n│ 𖥔 SEL : ${rpg.sel}\n│ 𖥔 Durasi : ${menit} menit\n│ 𖥔 Tebusan : Rp ${tebusan.toLocaleString('id-ID')}\n╰ 𖥔 Dipenjara oleh Owner`, m, { mentions: playerMentions([who]) })
    }

    /* =====================================================
       OWNER - BEBASIN
    ===================================================== */

    if (command === 'bebasin') {
        if (!isOwner) return m.reply('❌ Khusus Owner')
        if (args[0] === 'all') {
            if (wdb.penjara.length === 0) return m.reply('🏛️ Penjara kosong')
            let bebas = []
            for (const jidRaw of [...wdb.penjara]) { const jid = resolveJid(jidRaw); if (!isDiPenjara(jid)) continue; const rpg = getRPG(jid); if (!rpg) continue; markPatrolRelease(rpg); recordPrisonRelease(jid, 'owner', m.sender); rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0; clearKidnapState(rpg); removeFromBreakouts(jid); bebas.push(jid) }
            wdb.penjara = []; saveDB(wdb)
            const names = bebas.length? bebas.map(jid => `${playerLabel(jid)}`).join(', ') : '-'
            return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN OWNER_* ]───✦\n╭ 𖥔 Total : ${bebas.length} orang\n│ 𖥔 Bebas : ${names}\n╰ 𖥔 Oleh Owner${rehabilitationAdvice}`, m, { mentions: playerMentions(bebas) })
        }
        let who = null
        if (args[0] === 'sel' && args[1]) { who = findPrisonerByCell(args[1]); if (!who) return m.reply(`❌ Sel ${args[1].toUpperCase()} kosong`) }
        else if (m.quoted || m.mentionedJid?.[0]) { who = getTarget() }
        else if (args[0]) { who = getTarget(args[0]) }
        else { who = resolveJid(m.sender) }
        if (!who) return m.reply('❌ Target tidak ditemukan')
        const rpg = getRPG(who); const index = wdb.penjara.findIndex(jid => resolveJid(jid) === who)
        if (!isDiPenjara(who)) return m.reply('❌ Orang ini tidak di penjara')
        const selLama = rpg?.sel || (index >= 0? index + 1 : 0)
        if (rpg) { markPatrolRelease(rpg); recordPrisonRelease(who, 'owner', m.sender); rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0; clearKidnapState(rpg) }
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who); removeFromBreakouts(who); saveDB(wdb)
        return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN OWNER_* ]───✦\n╭ 𖥔 Owner : ${playerLabel(m.sender)}\n│ 𖥔 Target : ${playerLabel(who)}\n╰ 𖥔 Bebas dari SEL ${selLama}!${rehabilitationAdvice}`, m, { mentions: playerMentions([m.sender, who]) })
    }

    /* =====================================================
       TEBUS
    ===================================================== */

    if (command === 'penjara' && args[0]?.toLowerCase() === 'tebus') {
        args = args.slice(1)
        if (args[0] === 'all') {
            if (wdb.penjara.length === 0) return m.reply('🏛️ Penjara kosong')
            let total = 0; let targets = []; let waiting = []
            for (const jidRaw of [...wdb.penjara]) {
                const jid = resolveJid(jidRaw)
                if (jid === resolveJid(m.sender)) continue
                if (!isDiPenjara(jid)) continue
                const rpg = getRPG(jid)
                if (rpg && rpg.penjara && Number(rpg.tebusan) > 0) {
                    const remaining = sisaTungguTebus(rpg)
                    if (remaining > 0) {
                        waiting.push(remaining)
                        continue
                    }
                    total += Number(rpg.tebusan)
                    targets.push({ jid, rpg })
                }
            }
            if (targets.length === 0) {
                if (waiting.length) return m.reply(`❌ Tahanan baru bisa ditebus setelah 5 menit di penjara.\n⏳ Coba lagi dalam *${formatTime(Math.min(...waiting))}*.`)
                return m.reply('❌ Tidak ada orang lain di penjara')
            }
            const uang = Number(wdb.money[m.sender]) || 0
            if (uang < total) return m.reply(`❌ Uang tidak cukup.\n\n💰 Uang kamu : Rp ${uang.toLocaleString('id-ID')}\n💸 Dibutuhkan : Rp ${total.toLocaleString('id-ID')}`)
            wdb.money[m.sender] = uang - total
            const bebas = []
            for (const data of targets) {
                markPatrolRelease(data.rpg)
                recordPrisonRelease(data.jid, 'ransom', m.sender)
                data.rpg.penjara = null
                data.rpg.lamaPenjara = 0
                data.rpg.tebusan = 0
                data.rpg.sel = 0
                data.rpg.gagalCopet = 0
                clearKidnapState(data.rpg)
                removeFromBreakouts(data.jid)
                bebas.push(data.jid)
            }
            wdb.penjara = wdb.penjara.filter(jid =>!targets.some(target => resolveJid(target.jid) === resolveJid(jid)))
            saveDB(wdb)
            const waitingInfo = waiting.length ? `\n│ 𖥔 ${waiting.length} tahanan belum 5 menit di penjara` : ''
            return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN MASSAL_* ]───✦\n╭ 𖥔 Total : ${bebas.length} orang\n│ 𖥔 Biaya : Rp ${total.toLocaleString('id-ID')}\n│ 𖥔 Bebas : ${bebas.map(jid => `${playerLabel(jid)}`).join(', ')}${waitingInfo}\n╰ 𖥔 Berhasil${rehabilitationAdvice}`, m, { mentions: playerMentions(bebas) })
        }

        let who = null
        if (args[0] === 'sel' && args[1]) {
            who = findPrisonerByCell(args[1])
            if (!who) return m.reply(`❌ Sel ${args[1].toUpperCase()} kosong`)
        } else if (m.quoted || m.mentionedJid?.[0]) {
            who = getTarget()
        } else if (args[0]) {
            who = getTarget(args[0])
        } else {
            return m.reply(`*Format:*\n\n${usedPrefix}penjara tebus @tag\n${usedPrefix}penjara tebus sel 2\n${usedPrefix}penjara tebus all`)
        }

        if (!who) return m.reply('❌ Target tidak ditemukan')
        who = resolveJid(who)
        if (who === resolveJid(m.sender)) return m.reply(`[ 🚔 ]───[ *_GAGAL_* ]───✦\n╭ 𖥔 Kamu tidak bisa tebus diri sendiri\n╰ 𖥔 Tunggu masa tahanan habis`)

        const rpg = getRPG(who)
        if (!rpg ||!rpg.penjara) {
            wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
            removeFromBreakouts(who)
            saveDB(wdb)
            return m.reply('❌ Orang ini tidak di penjara')
        }

        if (sisaWaktu(rpg) < 60 * 1000) {
            const selLama = rpg.sel || 0
            const releasedAt = Number(rpg.penjara) + (Number(rpg.lamaPenjara) || 0)
            markPatrolRelease(rpg, releasedAt)
            recordPrisonRelease(who, 'expired', null, releasedAt)
            rpg.penjara = null
            rpg.lamaPenjara = 0
            rpg.tebusan = 0
            rpg.sel = 0
            rpg.gagalCopet = 0
            clearKidnapState(rpg)
            wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
            removeFromBreakouts(who)
            saveDB(wdb)
            return m.reply(`🚔 Masa tahanan ${playerLabel(who)} sudah habis.\n\n╭ 𖥔 SEL : ${selLama}\n╰ 𖥔 Target sudah bebas otomatis${rehabilitationAdvice}`, { mentions: playerMentions([who]) })
        }

        const sisaTunggu = sisaTungguTebus(rpg)
        if (sisaTunggu > 0) return m.reply(`[ 🚔 ]───[ *_BELUM BISA DITEBUS_* ]───✦\n╭ 𖥔 Tahanan baru bisa ditebus setelah 5 menit di penjara\n╰ 𖥔 Tunggu *${formatTime(sisaTunggu)}* lagi`)

        const tebusan = Number(rpg.tebusan) || 1000000
        const uang = Number(wdb.money[m.sender]) || 0
        if (uang < tebusan) return m.reply(`❌ Uang tidak cukup.\n\n💰 Uang kamu : Rp ${uang.toLocaleString('id-ID')}\n💸 Dibutuhkan : Rp ${tebusan.toLocaleString('id-ID')}`)

        wdb.money[m.sender] = uang - tebusan
        const selLama = rpg.sel || 0
        markPatrolRelease(rpg)
        recordPrisonRelease(who, 'ransom', m.sender)
        rpg.penjara = null
        rpg.lamaPenjara = 0
        rpg.tebusan = 0
        rpg.sel = 0
        rpg.gagalCopet = 0
        clearKidnapState(rpg)
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
        removeFromBreakouts(who)
        saveDB(wdb)

        return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN_* ]───✦\n╭ 𖥔 Dari : ${playerLabel(m.sender)}\n│ 𖥔 Untuk : ${playerLabel(who)}\n│ 𖥔 Tebusan : Rp ${tebusan.toLocaleString('id-ID')}\n╰ 𖥔 Bebas dari SEL ${selLama}!${rehabilitationAdvice}`, m, { mentions: playerMentions([m.sender, who]) })
    }

    /* =====================================================
       PENJARA - PENJELASAN DAN DAFTAR SEL
    ===================================================== */

    if (command === 'penjara' && ['list', 'active'].includes(args[0]?.toLowerCase())) {
        const activePrisoners = wdb.penjara
            .map(jid => resolveJid(jid))
            .filter((jid, index, list) => jid && list.indexOf(jid) === index)
            .map(jid => ({ jid, rpg: getRPG(jid) }))
            .filter(({ rpg }) => rpg?.penjara && sisaWaktu(rpg) >= 60 * 1000)

        if (!activePrisoners.length) return m.reply('🏛️ Tidak ada sel yang sedang aktif.')

        const mentions = playerMentions(activePrisoners.map(({ jid }) => jid))
        const list = activePrisoners
            .map(({ jid, rpg }, index) => `> ${index + 1}. SEL ${rpg.sel || '-'} • Sisa ${formatTime(sisaWaktu(rpg))}\n> ↳ ${playerLabel(jid)}`)
            .join('\n\n')

        return conn.reply(
            m.chat,
            `╭─❏「 🚔 SEL AKTIF 」❏\n` +
            `│ Total: ${activePrisoners.length} tahanan\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            list,
            m,
            { mentions }
        )
    }

    const prisonMode = (args[0] || '').toLowerCase()
    if (prisonMode !== 'sel') {
  return sendRpgMsg(conn, m,
    `╭─❏「 🚔 PENJARA 」❏\n` +
    `│ 🚔 *SISTEM PENJARA*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +

    `📋 *INFORMASI*\n` +
    `> ↳ Penjara berisi pemain yang gagal melakukan kejahatan atau terkena hukuman Owner.\n` +
    `> ↳ Penculikan adalah status terpisah dari penjara; korban tidak masuk sel atau tercatat sebagai tahanan. Korban hanya dapat memakai *.kabur* untuk memulai percobaan kabur; penculik harus merespons dengan *.tangkap @tag* dalam 5 menit. Kabur dari penculikan tidak menambah poin buronan atau statistik kabur penjara.\n` +
    `> ↳ Gunakan *.penjara tebus @tag* atau *.penjara tebus sel <kode>* untuk menebus pemain lain.\n` +
    `> ↳ Kasus penjara dapat berasal dari copet, begal, bunuh, rampok, jarah, culik, fitnah, atau Owner Jail.\n` +
    `> ↳ Routine dan talk menambah progres kabur.\n\n` +

    `─━━━━━━━━━━━━━━─\n\n` +

    `📌 *MENU PENJARA*\n` +
    `> ↳ Lihat blok sel: *${usedPrefix}penjara sel A*\n` +
    `> ↳ Lihat sel aktif: *${usedPrefix}penjara list*\n` +
    `> ↳ Kunjungi napi: *${usedPrefix}penjara visit sel A4*\n` +
    `> ↳ Routine: *${usedPrefix}penjara routine*\n` +
    `> ↳ Talk: *${usedPrefix}penjara talk*\n` +
    `> ↳ Kabur: *${usedPrefix}penjara kabur*\n` +
    `> ↳ Breakout bersama: *${usedPrefix}penjara breakout create*\n` +
    `> ↳ Panduan: *${usedPrefix}penjara guide*\n` +
    `> ↳ Tebus: *${usedPrefix}penjara tebus sel A4*\n\n` +

    `─━━━━━━━━━━━━━━─`)
}

if (!args[1]) {
  let summary = `╭─❏「 🚔 BLOK PENJARA 」❏\n`
  summary += `│ 🚔 *DAFTAR BLOK SEL*\n`
  summary += `╰─━━━━━━━━━━━━━━─\n\n`

  summary += `📋 *INFORMASI*\n`
  summary += `> ↳ Sel premium memiliki blok khusus VIP.\n`
  summary += `> ↳ Pilih blok untuk melihat isinya.\n\n`

  summary += `─━━━━━━━━━━━━━━─\n\n`

  for (let index = 0; index < 26; index++) {
    const letter = String.fromCharCode(65 + index)
    const count = wdb.penjara.filter(jid => {
      const cell = String(getRPG(jid)?.sel || '')
      return cell.startsWith(letter) && !(letter === 'V' && cell.startsWith('VIP'))
    }).length
    summary += `*${letter}. BLOK SEL*\n`
    summary += `> ↳ Tahanan: ${count} orang\n\n`
  }
  const vipCount = wdb.penjara.filter(jid => String(getRPG(jid)?.sel || '').startsWith('VIP')).length
  summary += `*VIP. SEL EKSKLUSIF*\n> ↳ Tahanan: ${vipCount} orang\n\n`

  summary += `─━━━━━━━━━━━━━━─\n\n`
  summary += `📌 *CONTOH*\n`
  summary += `> ↳ *${usedPrefix}penjara sel A*\n\n`
  summary += `─━━━━━━━━━━━━━━─`

  return m.reply(summary)
}

const prisonPage = args[1].toUpperCase()

if (!/^(?:[A-Z]|VIP)$/.test(prisonPage)) {
  return m.reply(
    `╭─❏「 🚔 PENJARA 」❏\n` +
    `│ ❌ *BLOK SEL TIDAK VALID*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Gunakan huruf sel A sampai Z atau VIP untuk sel eksklusif.\n` +
    `> ↳ Contoh: *${usedPrefix}penjara sel A* atau *${usedPrefix}penjara sel VIP*\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

const entries = wdb.penjara.filter(jid => String(getRPG(jid)?.sel || '').startsWith(prisonPage))
const totalPages = Math.max(1, new Set(wdb.penjara.map(jid => String(getRPG(jid)?.sel || '')[0]).filter(Boolean)).size)

if (entries.length === 0) {
  return m.reply(
    `╭─❏「 🚔 SEL ${prisonPage} 」❏\n` +
    `│ 📭 *BLOK SEL KOSONG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Tidak ada tahanan pada blok sel ini.\n` +
    `> ↳ Total blok terisi: ${totalPages}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

let pageText = `╭─❏「 🚔 BLOK SEL ${prisonPage} 」❏\n`
pageText += `│ 🚔 *DAFTAR TAHANAN*\n`
pageText += `╰─━━━━━━━━━━━━━━─\n\n`

pageText += `📋 *INFORMASI SEL*\n`
pageText += `> ↳ Setiap sel memiliki kode unik.\n\n`

pageText += `─━━━━━━━━━━━━━━─\n\n`

const pageMentions = []

entries.forEach((jid, offset) => {
  const rpg = getRPG(jid)
  if (!rpg) return

    const cell = rpg.sel || `${prisonPage}${offset + 1}`
  const tebusan = Number(rpg.tebusan) || 0

  pageMentions.push(jid)

  pageText += `*🧍 SEL ${cell} • Sisa: ${formatSisa(sisaWaktu(rpg))}*\n`
  pageText += `> ↳ ${playerLabel(jid)}\n`
  pageText += `> ↳ 💸 Tebus: Rp ${tebusan.toLocaleString('id-ID')}\n`
  pageText += `> ↳ ⚖️ Kasus: ${kasus(rpg)}\n\n`
})

pageText += `─━━━━━━━━━━━━━━─\n\n`

pageText += `─━━━━━━━━━━━━━━─`

return conn.reply(m.chat, pageText, m, { mentions: playerMentions(pageMentions) })

if (wdb.penjara.length === 0) return m.reply(
  `╭─❏「 🚔 PENJARA KOTA 」❏\n` +
  `│ 📭 *PENJARA KOSONG*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `> ↳ Kota aman dan damai.\n\n` +
  `─━━━━━━━━━━━━━━─`
)

let cap = `╭─❏「 🚔 DAFTAR NARAPIDANA 」❏\n`
cap += `│ 🚔 *DAFTAR NARAPIDANA*\n`
cap += `╰─━━━━━━━━━━━━━━─\n\n`

cap += `📊 *TOTAL TAHANAN*\n`
cap += `> ↳ ${wdb.penjara.length} orang\n\n`

cap += `─━━━━━━━━━━━━━━─\n\n`

const mentioned = []

for (let i = 0; i < wdb.penjara.length; i++) {
  const jid = wdb.penjara[i]
  const rpg = getRPG(jid)
  if (!rpg) continue

  mentioned.push(jid)

  const sisa = sisaWaktu(rpg)
  const tebusan = Number(rpg.tebusan) || 0

  cap += `*${i + 1}. 🧍 SEL ${i + 1} — ${playerLabel(jid)}*\n`
  cap += `> ↳ ⏳ Sisa: ${formatSisa(sisa)}\n`
  cap += `> ↳ 💸 Tebus: Rp ${tebusan.toLocaleString('id-ID')}\n`
  cap += `> ↳ ⚖️ Kasus: ${kasus(tebusan)}\n\n`
}

cap += `─━━━━━━━━━━━━━━─\n\n`

cap += `📌 *INFO UMUM*\n`
cap += `> ↳ ${usedPrefix}penjara visit 2\n`
cap += `> ↳ ${usedPrefix}penjara routine — CD 2m\n`
cap += `> ↳ ${usedPrefix}penjara talk — CD 2m\n`
cap += `> ↳ ${usedPrefix}penjara kabur — 1% / 10%\n`
cap += `> ↳ ${usedPrefix}penjara tebus @tag\n`
cap += `> ↳ ${usedPrefix}penjara tebus sel 2\n`
cap += `> ↳ Lakukan routine + talk untuk meningkatkan peluang kabur\n`

if (isOwner) {
  cap += `\n─━━━━━━━━━━━━━━─\n\n`

  cap += `👑 *INFO OWNER*\n`
  cap += `> ↳ ${usedPrefix}penjarain @tag menit tebusan\n`
  cap += `> ↳ ${usedPrefix}bebasin @tag\n`
  cap += `> ↳ ${usedPrefix}bebasin sel 2\n`
  cap += `> ↳ ${usedPrefix}bebasin all\n`
  cap += `> ↳ Khusus Owner\n`
}

cap += `\n─━━━━━━━━━━━━━━─`

    saveDB(wdb)
    return conn.reply(m.chat, cap, m, { mentions: playerMentions(mentioned) })
}

/* =========================================================
   COMMAND CONFIG
========================================================= */

handler.help = ['penjara', 'penjara exs/exclusive/eks/eksklusif', 'penjara sel <A-Z|VIP>', 'penjara visit <sel/@tag>', 'penjara nickname <julukan>', 'penjara nick hapus', 'penjara routine', 'penjara talk', 'penjara kabur', 'penjara tebus <tag/sel/all>', 'penjara breakout create/join/info/leave/start', 'penjara guide', 'penjarain', 'bebasin', 'kabur', 'tangkap']
handler.tags = ['rpg']
handler.command = /^(penjara|penjarain|bebasin|kabur|tangkap)$/i
handler.group = true

export default handler