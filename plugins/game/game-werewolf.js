import {
    emoji_role,
    sesi,
    playerOnGame,
    playerOnRoom,
    playerExit,
    dataPlayer,
    getPlayerById,
    killww,
    roleGenerator,
    addTimer,
    startGame,
    vote,
    voteResult,
    clearAllVote,
    getWinner,
    win,
    voteStart,
    voteDone,
    buildRoleCodeMap,
    resolveSecretCodeAction,
    getNightProgress,
    resolveNightActions,
    refundWerewolfWager,
    clearAll,
    clearAllSTATUS,
    shortPlayer,
    resetVote,
    voteKill,
    changeDay,
    pagii
} from '../../lib/werewolf.js'
import { sendDualGroupMessage, sendMultiParticipantGroupStanza } from '../../lib/dual-group-message.js'
import { Button } from '@rexxhayanasi/elaina-baileys'
import { toSmallNum, status } from '../../lib/style.js'
import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { compareRpgMoney, subtractRpgMoney } from '../../lib/rpgMoney.js'
import { GAME_CATEGORIES, ROLE_DATA, getGameCategory, isAntagonistRole, normalizeGameCategory } from '../../lib/werewolfData.js'
import { getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'

const thumbNight = "https://user-images.githubusercontent.com/72728486/235316834-f9f84ba0-8df3-4444-81d8-db5270995e6d.jpg"
const thumbMorning = "https://user-images.githubusercontent.com/72728486/235344562-4677d2ad-48ee-419d-883f-e0ca9ba1c7b8.jpg"
const thumbVoting = "https://user-images.githubusercontent.com/72728486/235344861-acdba7d1-8fce-41b8-adf6-337c818cda2b.jpg"
const thumbExecution = "https://user-images.githubusercontent.com/72728486/235354619-6ad1cabd-216c-4c7c-b7c2-3a564836653a.jpg"

const roleEmojis = Object.fromEntries(Object.entries(ROLE_DATA).map(([role, data]) => [role, data.emoji]))
const roleTitles = Object.fromEntries(Object.entries(ROLE_DATA).map(([role, data]) => [role, data.title]))
const roleDescriptions = Object.fromEntries(Object.entries(ROLE_DATA).map(([role, data]) => [role, data.description]))

const validRoleName = (value) => {
    const role = String(value || '').toLowerCase()
    return Object.hasOwn(ROLE_DATA, role) ? role : null
}

const resolveRoleChoice = (value) => {
    const input = String(value || '').trim()
    if (/^\d+$/.test(input)) return Object.keys(ROLE_DATA)[Number(input) - 1] || null
    const normalized = input.toLowerCase().replace(/[^a-z0-9]/g, '')
    return Object.entries(ROLE_DATA).find(([role, data]) =>
        role.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized ||
        data.title.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
    )?.[0] || null
}

const getRealPlayerCount = (room) => {
    if (!room || !Array.isArray(room.player)) return 0
    return room.player.filter((p) => !p?.isDummy).length
}

const getDisplayPlayerLabel = (player) => {
    if (!player) return '—'
    if (player.isDummy) return `Warga ${toSmallNum(player.number)}`
    return `@${player.id.replace(/@s\.whatsapp\.net$/, '')}`
}

const createWargaPlayer = (room, order) => ({
    id: `warga-${String(room?.room || 'room')}-${order}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@dummy`,
    number: order,
    sesi: room?.room || '',
    status: false,
    role: 'warga',
    effect: [],
    vote: 0,
    isdead: false,
    isvote: false,
    isDummy: true,
    displayName: `Warga ${order}`
})

const normalizePhone = (value = '') => String(value || '').replace(/[^0-9]/g, '')

const parseWager = (value) => {
    const input = String(value || '').trim().toLowerCase()
    if (!input) return 0
    const match = input.match(/^(\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta|m)?$/)
    if (!match) return null

    const amount = Number(match[1].replace(',', '.'))
    const multiplier = ['k', 'rb', 'ribu'].includes(match[2]) ? 1_000
        : ['jt', 'juta', 'm'].includes(match[2]) ? 1_000_000
            : 1
    const wager = amount * multiplier
    return Number.isSafeInteger(wager) && wager > 0 ? wager : null
}

const hasRpgPanelAccess = (sender = '') => {
    const senderPhone = normalizePhone(sender)
    const senderJid = String(sender || '').toLowerCase()
    const ownerList = Array.isArray(global.owner) ? global.owner : []
    const hasOwnerAccess = ownerList.some((entry) => {
        const ownerId = Array.isArray(entry) ? entry[0] : entry
        const ownerPhone = normalizePhone(ownerId)
        return ownerPhone === senderPhone || String(ownerId).toLowerCase() === senderJid || (senderPhone && ownerPhone && senderPhone.endsWith(ownerPhone))
    })
    if (hasOwnerAccess) return true

    const coOwner = global.db?.data?.users?.[sender]?.isCoOwner || global.db?.data?.users?.[String(sender).replace(/@s\.whatsapp\.net$/, '') + '@s.whatsapp.net']?.isCoOwner || false
    if (coOwner) return true

    const accessList = global.rpgPanelUsers || global.rpgPanelVoiceAccess || []
    if (Array.isArray(accessList)) {
        return accessList.some((item) => normalizePhone(item) === senderPhone || String(item).toLowerCase() === senderJid)
    }
    if (accessList && typeof accessList === 'object') {
        return Object.keys(accessList).some((key) => normalizePhone(key) === senderPhone || String(key).toLowerCase() === senderJid)
    }
    return false
}

/**
 * Mengirim 1 Stanza Grup untuk Fase Malam:
 * - Setiap pemain hidup menerima tombol Native Flow rahasia berisi kode unik.
 * - Penonton dan pemain mati menerima teks gembok murni tanpa tombol.
 */
const sendNightPhaseStanza = async (conn, chat, room) => {
    if (!room || !Array.isArray(room.player)) return
    const game = getGameCategory(room.category)

    room.time = 'malem'
    room.voting = false
    room.player.forEach((p) => {
        p.nightDone = false
        p.lastNightAction = null
        p.secretCodes = {}
        p.voteCodes = {}
        buildRoleCodeMap(room, p)
    })
    room.nightActions = {}
    room.guardianTarget = null
    room.guardianVoteTarget = null
    room.nightTarget = null
    room.poisonTarget = null
    room.reviveTarget = null
    room.hunterTarget = null

    const alivePlayers = room.player.filter((p) => !p.isdead && !p.isDummy)
    const aliveJids = alivePlayers.map((p) => p.id)
    const playerMessagesMap = {}

    for (const p of alivePlayers) {
        const role = p.role || 'warga'
        const rEmoji = roleEmojis[role] || '🎭'
        const rTitle = roleTitles[role] || (role === game.antagonist ? game.antagonistName.toUpperCase() : role.toUpperCase())
        const rDesc = roleDescriptions[role] || 'Pilihlah tindakan malammu dengan bijak.'

        const secretCodes = p.secretCodes || {}
        const actionRows = []
        const cheatSheetLines = []
        for (const [code, action] of Object.entries(secretCodes)) {
            let actionEmoji = '✦'
            let actionText = ''
            let actionHeader = '🌙 Aksi malam'
            if (action.type === 'kill') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                actionEmoji = game.antagonistEmoji
                actionText = `Serang (${toSmallNum(action.targetNumber)}) ${tName}`
                actionHeader = '⚔️ Serangan'
            } else if (action.type === 'check') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                actionEmoji = '🔮'
                actionText = `Terawang (${toSmallNum(action.targetNumber)}) ${tName}`
                actionHeader = '🔮 Penerawangan'
            } else if (action.type === 'guard') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                actionEmoji = '🛡️'
                actionText = `Lindungi (${toSmallNum(action.targetNumber)}) ${tName}`
                actionHeader = '🛡️ Perlindungan'
            } else if (action.type === 'poison') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                actionEmoji = '☠️'
                actionText = `Racuni (${toSmallNum(action.targetNumber)}) ${tName}`
                actionHeader = '☠️ Ramuan'
            } else if (action.type === 'revive') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                actionEmoji = '⚰️'
                actionText = `Hidupkan (${toSmallNum(action.targetNumber)}) ${tName}`
                actionHeader = '✨ Ramuan'
            } else if (action.type === 'hunter') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                actionEmoji = '🏹'
                actionText = `Tembak (${toSmallNum(action.targetNumber)}) ${tName}`
                actionHeader = '🏹 Tembakan'
            } else if (action.type === 'skip') {
                actionEmoji = '⏩'
                actionText = action.label || 'Lewati Malam'
            } else if (action.type === 'dummy') {
                actionEmoji = '🌙'
                actionText = action.label || 'Aktivitas Malam'
            } else {
                actionText = action.label || 'Pilihan'
            }

            actionRows.push({
                header: actionHeader,
                title: Array.from(`${actionEmoji} ${actionText}`).slice(0, 24).join(''),
                description: actionText,
                id: `${room.commandBase || '.ww'} ${code}`
            })
            cheatSheetLines.push(`> 🔒 *${code}* — ${actionText}`)
        }

        const cheatSheetSection = cheatSheetLines.length
            ? `*╭  〔 🔐 ᴋᴏᴅᴇ ᴀᴋsɪ ʀᴀʜᴀsɪᴀ 〕*\n${cheatSheetLines.join('\n')}\n*╰───────────────*\n\n`
            : ''
        const bodyCard = `*──  ୨୧ ✧ FASE MALAM TIBA ✧ ୨୧  ──*
> 🌙 _Bulan purnama bersinar terang di atas langit desa..._

*╭  〔 ${rEmoji} ʀᴏʟᴇ: ${rTitle} 〕*
> ⟡ Pemain : *${p.displayName || `@${p.id.split('@')[0]}`}*
> ⟡ Nomor : *${toSmallNum(p.number)}*
> ⟡ Petunjuk : *${rDesc}*
*╰───────────────*

${cheatSheetSection}*╭  〔 ✦ ɪɴꜱᴛʀᴜᴋꜱɪ ᴀᴋsɪ 〕*
> ⟡ Tekan tombol kode di bawah untuk bertindak.
> ⟡ Kode acak menjamin kerahasiaan aksi malam-mu.
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> 🔒 _Pilihanmu menentukan keselamatan desa saat fajar._`

        const btn = new Button(conn)
        btn.setBody(bodyCard)
        btn.setFooter(`Avelia • ${game.name} Secret Night Phase`)
        btn.addButton('single_select', JSON.stringify({
            title: '🔒 PILIH KODE AKSI',
            sections: [{
                title: '🔐 KODE AKSI TERSEDIA',
                rows: actionRows
            }]
        }))

        btn.setContextInfo({ mentionedJid: aliveJids })
        const built = await btn.build(chat, {})
        playerMessagesMap[p.id] = built.message
    }

    const spectatorText = `*──  ୨୧ ✧ ${game.name.toUpperCase()} · FASE MALAM ✧ ୨୧  ──*
> 🌙 _Bulan purnama bersinar terang di atas langit desa..._

*╭  〔 ✦ ꜱᴜᴀꜱᴀɴᴀ ᴍᴀʟᴀᴍ 〕*
> ⟡ Status : *Warga terlelap di kediaman masing-masing*
> ⟡ Waktu Aksi : *𝟿𝟶 Detik*
> ⟡ Suasana : *Mencekam & sunyi senyap*
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> 🔒 _[Fase Malam Berlangsung — Aksi rahasia hanya dapat diakses oleh pemain yang masih hidup]_`

    await sendMultiParticipantGroupStanza(conn, chat, playerMessagesMap, spectatorText, {
        contextInfo: { mentionedJid: aliveJids }
    })

    // Pasang timer 90 detik untuk auto-advance jika ada pemain lambat
    if (room.phaseTimeout) clearTimeout(room.phaseTimeout)
    room.phaseTimeout = setTimeout(async () => {
        try {
            if (!conn.werewolf?.[chat] || !conn.werewolf[chat].status || conn.werewolf[chat].time !== 'malem') return
            const currentAlive = room.player.filter((p) => !p.isdead && !p.isDummy)
            for (const p of currentAlive) {
                if (!p.nightDone) {
                    p.nightDone = true
                    p.lastNightAction = { type: 'skip', label: 'Waktu Habis' }
                }
            }
            await resolveNightToMorning(conn, chat, conn.werewolf)
        } catch (err) {
            console.error('[werewolf night timeout error]', err)
        }
    }, 90000)
}

const publishMorning = async (conn, chat, room, ww) => {
    const winner = getWinner(chat, ww)
    if (winner.status !== null) return await win(room, 1, conn, ww)
    const game = getGameCategory(room.category)
    const morningBody = pagii(room)
    const mentions = room.player.filter((p) => !p.isDummy).map((p) => p.id)
    const morningCard = `*──  ୨୧ ✧ FAJAR TELAH TIBA ✧ ୨୧  ──*
> ☀️ _Sinar matahari pagi menembus kabut ${game.location}..._

${morningBody}

· · ─ ─ ✦ ─ ─ · ·
> ⚖️ _Sidang dimulai! Warga bersiap menentukan tersangka._`

    await conn.sendMessage(chat, {
        image: { url: thumbMorning },
        caption: morningCard,
        mentions
    })
    await startDayVoting(conn, chat, ww)
}

const openHunterReaction = async (conn, chat, room, hunter, resumePhase) => {
    room.pendingHunter = hunter.id
    room.pendingHunterPhase = resumePhase
    const living = room.player.filter((player) => !player.isdead && !player.isDummy && player.id !== hunter.id)
    const targetLines = living.map((player) => `> (${toSmallNum(player.number)}) ${getDisplayPlayerLabel(player)}`).join('\n')
    await conn.sendMessage(chat, {
        text: `🏹 *HUNTER MASIH PUNYA SATU TEMBAKAN!*\n\n@${hunter.id.split('@')[0]}, sebelum kematianmu menjadi pasti, pilih satu target dengan *${room.commandBase || '.ww'} shoot <nomor>*:\n${targetLines || '> Tidak ada target yang tersisa.'}`,
        mentions: [hunter.id, ...living.map((player) => player.id)]
    })
    if (room.phaseTimeout) clearTimeout(room.phaseTimeout)
    room.phaseTimeout = setTimeout(async () => {
        try {
            if (conn.werewolf?.[chat] !== room || room.pendingHunter !== hunter.id) return
            hunter.pendingHunter = false
            room.pendingHunter = null
            const phase = room.pendingHunterPhase
            room.pendingHunterPhase = null
            if (phase === 'morning') await publishMorning(conn, chat, room, conn.werewolf)
            else await resumeAfterHunterVote(conn, chat, room, conn.werewolf)
        } catch (error) {
            console.error('[werewolf hunter timeout error]', error)
        }
    }, 90000)
}

const resumeAfterHunterVote = async (conn, chat, room, ww) => {
    room.pendingHunter = null
    room.pendingHunterPhase = null
    voteDone(chat, ww)
    resetVote(chat, ww)
    clearAllVote(chat, ww)
    clearAll(chat, ww)
    clearAllSTATUS(chat, ww)
    const winner = getWinner(chat, ww)
    if (winner.status !== null) return await win(room, 1, conn, ww)
    await sendNightPhaseStanza(conn, chat, room)
}

/**
 * Transisi Malam ke Pagi: Proses aksi malam, umumkan korban, dan buka voting siang
 */
const resolveNightToMorning = async (conn, chat, ww) => {
    const room = sesi(chat, ww)
    if (!room || !room.status) return

    if (room.phaseTimeout) {
        clearTimeout(room.phaseTimeout)
        room.phaseTimeout = null
    }

    resolveNightActions(chat, ww)
    shortPlayer(chat, ww)
    killww(chat, room.dead, ww)
    changeDay(chat, ww)

    const pendingHunter = room.player.find((player) => player.pendingHunter)
    if (pendingHunter) {
        await openHunterReaction(conn, chat, room, pendingHunter, 'morning')
        return
    }

    await publishMorning(conn, chat, room, ww)
}

/**
 * Mulai Fase Voting Siang dengan Tombol Interaktif Publik di Grup
 */
const startDayVoting = async (conn, chat, ww) => {
    const room = sesi(chat, ww)
    if (!room || !room.status) return

    room.time = 'voting'
    voteStart(chat, ww)
    resetVote(chat, ww)
    clearAllVote(chat, ww)

    const livingPlayers = room.player.filter((p) => !p.isdead)
    const mentions = livingPlayers.filter((p) => !p.isDummy).map((p) => p.id)

    let playerListText = ''
    livingPlayers.forEach((p) => {
        const pLabel = p.displayName || `@${p.id.split('@')[0]}`
        const protection = p.number === room.guardianVoteTarget ? ' 🛡️ *Dilindungi Guardian dari voting*' : ''
        playerListText += `> (${toSmallNum(p.number)}) ⟡ ${pLabel}${protection}\n`
    })

    const game = getGameCategory(room.category)
    const votingCard = `*──  ୨୧ ✧ ${game.name.toUpperCase()} · SIDANG ✧ ୨୧  ──*
> ⚖️ _Matahari tepat di atas kepala, warga berkumpul menentukan takdir..._

*╭  〔 ✦ ᴅᴀꜰᴛᴀʀ ᴡᴀʀɢᴀ ʜɪᴅᴜᴘ 〕*
${playerListText.trim()}
*╰───────────────*

*╭  〔 ✦ ɪɴꜰᴏ ᴠᴏᴛɪɴɢ 〕*
> ⟡ Waktu : *𝟿𝟶 Detik*
> ⟡ Tekan tombol di bawah untuk memilih
> ⟡ Atau ketik: *${room.commandBase || '.ww'} vote <nomor>*
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Pilihlah dengan bijak, jangan biarkan ${game.antagonistName} memperdaya kalian!_`

    const btn = new Button(conn)
    btn.setBody(votingCard)
    btn.setFooter(`Avelia • ${game.name} Day Voting`)
    btn.setImage(thumbVoting)

    const voteRows = livingPlayers.filter((p) => p.number !== room.guardianVoteTarget).map((p) => {
        const pName = p.displayName || `@${p.id.split('@')[0]}`
        return {
            header: `Warga Nomor (${toSmallNum(p.number)})`,
            title: `Vote ${pName}`.slice(0, 24),
            description: `Tuduh & eksekusi warga nomor (${toSmallNum(p.number)})`,
            id: `${room.commandBase || '.ww'} vote ${p.number}`
        }
    })

    voteRows.push({
        header: 'Opsi Khusus',
        title: '⏩ Lewati Voting',
        description: 'Tidak memilih siapa pun pada sidang hari ini',
        id: `${room.commandBase || '.ww'} vote skip`
    })

    btn.addButton('single_select', JSON.stringify({
        title: '✦ PILIH TERSANGKA SIDANG',
        sections: [{
            title: '✦ DAFTAR WARGA HIDUP',
            rows: voteRows
        }]
    }))

    btn.setContextInfo({ mentionedJid: mentions })
    await btn.send(chat)

    if (room.phaseTimeout) clearTimeout(room.phaseTimeout)
    room.phaseTimeout = setTimeout(async () => {
        try {
            if (!conn.werewolf?.[chat] || !conn.werewolf[chat].status || conn.werewolf[chat].time !== 'voting') return
            await resolveDayVoting(conn, chat, conn.werewolf)
        } catch (err) {
            console.error('[werewolf voting timeout error]', err)
        }
    }, 90000)
}

/**
 * Proses Hasil Voting Siang: Eksekusi gantung, cek Jester/Hunter, dan lanjut ke malam berikutnya
 */
const resolveDayVoting = async (conn, chat, ww) => {
    const room = sesi(chat, ww)
    if (!room || !room.status) return

    if (room.phaseTimeout) {
        clearTimeout(room.phaseTimeout)
        room.phaseTimeout = null
    }

    const hasil_vote = voteResult(chat, ww)

    if (hasil_vote === 0) {
        const text = `*──  ୨୧ ✧ SIDANG DESA BERAKHIR ✧ ୨୧  ──*\n> ⚖️ _Terlalu bimbang menentukan pilihan..._\n\nWarga desa tidak dapat mencapai kesepakatan dan pulang ke rumah masing-masing. Tidak ada yang dieksekusi hari ini.\n\n· · ─ ─ ✦ ─ ─ · ·\n> 🌙 _Malam kembali tiba menyelimuti desa..._`
        await conn.sendMessage(chat, {
            image: { url: thumbNight },
            caption: text
        })
    } else if (hasil_vote === 1) {
        const text = `*──  ୨୧ ✧ SIDANG DESA BERAKHIR ✧ ୨୧  ──*\n> ⚖️ _Hasil pemungutan suara berimbang!_\n\nSuara terbanyak diperoleh oleh lebih dari satu orang dengan jumlah yang sama. Eksekusi dibatalkan demi keadilan.\n\n· · ─ ─ ✦ ─ ─ · ·\n> 🌙 _Warga kembali ke kediaman masing-masing..._`
        await conn.sendMessage(chat, {
            image: { url: thumbNight },
            caption: text
        })
    } else if (hasil_vote && typeof hasil_vote === 'object') {
        const killed = voteKill(chat, ww)
        const kRole = killed.role || 'warga'
        const kEmoji = roleEmojis[kRole] || '👱‍♂️'
        const kTitle = roleTitles[kRole] || kRole.toUpperCase()
        const kTag = `@${killed.id.split('@')[0]}`

        const execText = `*──  ୨୧ ✧ KEPUTUSAN EKSEKUSI ✧ ୨୧  ──*
> ⚖️ _Warga desa telah sepakat menjatuhkan hukuman gantung!_

*╭  〔 ☠️ ᴡᴀʀɢᴀ ʏᴀɴɢ ᴅɪᴇᴋꜱᴇᴋᴜꜱɪ 〕*
> ⟡ Nama : *${kTag}*
> ⟡ Nomor : *${toSmallNum(killed.number)}*
> ⟡ Identitas Asli : *${kTitle} ${kEmoji}*
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> 🌙 _Senja telah usai. Bersiaplah menghadapi malam yang mencekam..._`

        await conn.sendMessage(chat, {
            image: { url: thumbExecution },
            caption: execText,
            mentions: [killed.id]
        })

        if (killed.role === 'hunter') {
            await openHunterReaction(conn, chat, room, killed, 'voting')
            return
        }
        if (killed.role === 'jester' || room.jesterWin) {
            return await win(room, 1, conn, ww)
        }
    }

    voteDone(chat, ww)
    resetVote(chat, ww)
    clearAllVote(chat, ww)
    clearAll(chat, ww)
    clearAllSTATUS(chat, ww)

    const winner = getWinner(chat, ww)
    if (winner.status !== null) {
        return await win(room, 1, conn, ww)
    }

    await sendNightPhaseStanza(conn, chat, room)
}

let handler = async (m, { conn, command, usedPrefix, args }) => {
    const { sender, chat } = m
    conn.werewolf = conn.werewolf ? conn.werewolf : {}
    const ww = conn.werewolf
    const isGameRolesCommand = ['gr', 'gameroles'].includes(String(command || '').toLowerCase())
    const directGameCategory = !isGameRolesCommand ? normalizeGameCategory(command) : null
    let gameCategory = directGameCategory || getGameCategory('ww')
    const routedGameCategory = isGameRolesCommand && Boolean(normalizeGameCategory(args[0]))
    if (routedGameCategory) {
        gameCategory = getGameCategory(args[0])
        args = args.slice(1)
    }
    const gameCommandBase = `${usedPrefix || '.'}${isGameRolesCommand ? `gr ${gameCategory.id}` : directGameCategory ? directGameCategory.aliases[0] : 'ww'}`
    const standardCommands = ["test", "create", "join", "start", "vote", "exit", "delete", "player", "info", "role", "guide", "add", "del", "shoot"]
    let value = args[0]
    const target = args[1]
    const normalizedValue = String(value || "").toLowerCase()

    let detectedSecretCode = null
    if (/^[A-Z0-9]{4,5}$/i.test(String(value || "")) && !standardCommands.includes(normalizedValue)) {
        detectedSecretCode = String(value).toUpperCase()
    } else if (target && /^[A-Z0-9]{4,5}$/i.test(String(target || "")) && !standardCommands.includes(String(target).toLowerCase())) {
        detectedSecretCode = String(target).toUpperCase()
    } else {
        const textRaw = String(m.text || "")
            .replace(/^[.\/#!]gr\s+(?:ww|werewolf|mafia|killer|assassin|assasin|impostor|imposter|alien|custom)\s*/i, "")
            .replace(/^[.\/#!]ww\s*/i, "")
            .trim()
        if (/^[A-Z0-9]{4,5}$/i.test(textRaw) && !standardCommands.includes(textRaw.toLowerCase())) {
            detectedSecretCode = textRaw.toUpperCase()
        }
    }
    const isSecretCode = Boolean(detectedSecretCode)
    const currentRoomPlayer = ww[chat]?.player?.find((player) => player.id === sender) || null
    const isDeadInRoom = !!(currentRoomPlayer && currentRoomPlayer.isdead)
    const allowedDeadCommands = ["delete", "info", "role", "player", "create", "join", "start", "exit", "guide", "shoot"]
    if ((!isGameRolesCommand || routedGameCategory) && ww[chat] && value !== 'delete' && ww[chat].category && ww[chat].category !== gameCategory.id &&
        !['info', 'guide', 'role', 'player'].includes(normalizedValue)) {
        return m.reply(status.warning(`Room ini memakai kategori ${getGameCategory(ww[chat].category).name}. Gunakan *.gr ${ww[chat].category} ${normalizedValue}*.`))
    }

    conn.werewolfTest = conn.werewolfTest || {}
    const testState = conn.werewolfTest[chat]

    if (isGameRolesCommand && !routedGameCategory) {
        const action = String(value || '').toLowerCase()
        if (!action) {
            const menuText = `*── ୨୧ ✧ GAME ROLES ✧ ୨୧ ──*

🎭 *Game Roles* adalah kumpulan permainan peran dan deduksi sosial di grup.`
            const menuButtons = [
                ['📖 Panduan Bermain', `${usedPrefix}gr guide`],
                ['🧭 Jelajahi Perintah', `${usedPrefix}gr command`]
            ]
            return conn.sendButton(chat, menuText, 'Avelia • Game Roles', thumbNight, menuButtons, m)
        }
        if (action === 'list' || action === 'category' || action === 'kategori') {
            const categories = Object.values(GAME_CATEGORIES)
                .map((entry) => `> ${entry.antagonistEmoji} *${entry.name}*\n>   Buat room: *${usedPrefix}${entry.aliases[0]} create*${entry.id === 'custom' ? `\n>   Atur role: *${usedPrefix}custom role @pemain <role/nomor>*` : ''}`)
                .join('\n')
            return m.reply(`*── ୨୧ ✧ PILIH TEMA GAME ROLES ✧ ୨୧ ──*\n\n${categories}\n\n📖 Panduan: *${usedPrefix}gr guide*\n🧭 Perintah: *${usedPrefix}gr command*\n🏆 Papan skor: *${usedPrefix}gr top*`)
        }
        if (action === 'info') {
            const category = normalizeGameCategory(args[1])
            if (!category) return m.reply(status.warning(`Pilih kategori: ${Object.values(GAME_CATEGORIES).map((entry) => entry.id).join(', ')}. Contoh: *${usedPrefix}gr info mafia*`))
            const infoText = `*── ${category.antagonistEmoji} INFO ${category.name.toUpperCase()} ──*

📝 ${category.description}

🌙 Malam: pemain menjalankan aksi sesuai peran.
⚖️ Siang: diskusi dan voting menentukan tersangka.
🏆 Menang dengan mencapai kondisi kemenangan tim atau role masing-masing.

Mulai room: *${usedPrefix}${category.aliases[0]} create [taruhan]*`
            return m.reply(infoText)
        }
        if (action === 'role') {
            const roleSections = Object.entries(ROLE_DATA)
                .map(([role, data], index) => {
                    const roleName = GAME_CATEGORIES[role]?.antagonistName || data.title
                    const description = role === 'sorcerer'
                        ? 'Pilih racun untuk berpihak sebagai antagonis, revive untuk berpihak ke warga, atau lewati aksi untuk tetap netral. Jika tidak ada antagonis lain, Sorcerer tidak bisa menjadi pihak warga.'
                        : data.description
                    return `> *${index + 1}.* ${data.emoji} *${roleName}*\n> ${description}`
                })
                .join('\n\n')
            return m.reply(`*── 🎭 DAFTAR SEMUA ROLE GAME ROLES ──*\n\n${roleSections}\n\n> Mode Custom dapat memilih role dengan nama atau nomor, contoh: *.custom role @pemain 2*`)
        }
        if (action === 'guide') {
            return m.reply(`*── ✧ PANDUAN GAME ROLES ✧ ──*\n\n> 1. Pilih tema lewat *.gr list*, misalnya Werewolf, Alien, atau Custom Role.\n> 2. Buat room dengan command tema, contoh *.mafia create 10k*.\n> 3. Untuk simulasi, atur role pemain dengan *.custom role @pemain <role/nomor>* sebelum membuat room.\n> 4. Peserta masuk memakai *.mafia join*; taruhan ditahan langsung saat bergabung.\n> 5. Owner room memulai dengan *.mafia start*.\n> 6. Gunakan kode aksi rahasia yang bot kirim di grup. Detail aksi hanya terlihat oleh pemain yang bertindak.\n> 7. Keluar dari room bertaruhan perlu konfirmasi; taruhan tetap di pot. Jika room dihapus, taruhan dikembalikan.\n> 8. Gunakan *.gr me*, *.gr history*, dan *.gr top* untuk statistik.`)
        }
        if (['command', 'commands', 'cmd'].includes(action)) {
            const commandText = Object.values(GAME_CATEGORIES)
                .map((entry) => `*${entry.antagonistEmoji} ${entry.name}*\n> ${usedPrefix}${entry.aliases[0]} create [taruhan] · join · start · vote · player · info · role · guide · exit · delete${entry.id === 'custom' ? `\n> ${usedPrefix}custom role @pemain <role/nomor>` : ''}`)
                .join('\n\n')
            return m.reply(`*── ✧ COMMAND GAME ROLES ✧ ──*\n\n${commandText}\n\n*Statistik & Info*\n> ${usedPrefix}gr role\n> ${usedPrefix}gr info <kategori>\n> ${usedPrefix}gr top\n> ${usedPrefix}gr me\n> ${usedPrefix}gr history [halaman]`)
        }
        if (action === 'me' || action === 'stats' || action === 'stat') {
            const user = loadDB().users[sender] || {}
            const stats = user.werewolfStats || {}
            return m.reply(`*── ✧ STATISTIK GAME ROLES ✧ ──*\n\n> Skor antagonis: *${Number(stats.score) || 0}*\n> Menang antagonis: *${Number(stats.antagonistWins) || 0}x*\n> Menang protagonis: *${Number(stats.protagonistWins) || 0}x*\n> Menang netral: *${Number(stats.neutralWins) || 0}x*`)
        }
        if (action === 'history' || action === 'riwayat') {
            const user = loadDB().users[sender] || {}
            const history = user.werewolfStats?.history || []
            const page = Math.max(1, Number.parseInt(args[1], 10) || 1)
            const pageSize = 5
            const pageCount = Math.max(1, Math.ceil(history.length / pageSize))
            if (page > pageCount) return m.reply(status.warning(`Halaman tersedia: 1-${pageCount}.`))
            const rows = history.slice((page - 1) * pageSize, page * pageSize)
            const text = rows.length ? rows.map((entry, index) => {
                const game = getGameCategory(entry.category)
                const date = new Date(entry.playedAt).toLocaleString('id-ID')
                return `*${(page - 1) * pageSize + index + 1}. ${game.name} · ${date}*\n> Role: ${roleTitles[entry.role] || entry.role}\n> Hasil: ${entry.result === 'win' ? 'Menang' : 'Kalah'} · Jumlah pemain: ${entry.players}\n> Skor didapat: ${entry.score}`
            }).join('\n\n') : 'Belum ada riwayat permainan.'
            const buttons = []
            if (page > 1) buttons.push(['📜 Riwayat Sebelumnya', `${usedPrefix}gr history ${page - 1}`])
            if (page < pageCount) buttons.push(['Riwayat Berikutnya 📜', `${usedPrefix}gr history ${page + 1}`])
            const caption = `*── ✧ RIWAYAT GAME ROLES · ${page}/${pageCount} ✧ ──*\n\n${text}`
            if (buttons.length) return conn.sendButton(chat, caption, 'Avelia • Game Roles', thumbNight, buttons, m)
            return conn.sendMessage(chat, { image: { url: thumbNight }, caption }, { quoted: m })
        }
        if (action === 'top' || action === 'leaderboard') {
            const data = loadDB().data
            const entries = Object.entries(data.users || {})
                .map(([jid, user]) => ({ jid, stats: user?.werewolfStats || {} }))
                .filter(({ stats }) => Number(stats.score) > 0)
                .sort((a, b) => Number(b.stats.score) - Number(a.stats.score) || Number(b.stats.antagonistWins) - Number(a.stats.antagonistWins))
                .slice(0, 10)
            let metadata = null
            try {
                metadata = await conn.groupMetadata(chat)
            } catch (error) {
                console.error('[werewolf leaderboard metadata error]', error?.message)
            }
            const mentions = []
            const lines = entries.map(({ jid, stats }, index) => {
                const identity = getLeaderboardUserIdentity(jid, { conn, groupMetadata: metadata })
                if (identity.mention) mentions.push(identity.mention)
                return `> *${index + 1}.* ${identity.display}\n> Skor: *${Number(stats.score) || 0}* · Antagonis: *${Number(stats.antagonistWins) || 0}x* · Protagonis: *${Number(stats.protagonistWins) || 0}x* · Netral: *${Number(stats.neutralWins) || 0}x*`
            })
            return conn.sendMessage(chat, {
                image: { url: thumbVoting },
                caption: `*── ✧ TOP 10 GAME ROLES ✧ ──*\n\n${lines.join('\n\n') || 'Belum ada skor yang tercatat.'}`,
                mentions
            })
        }
        return m.reply(status.warning(`Kategori/aksi tidak dikenal. Ketik *.gr* atau *.gr guide*.`))
    }

    if (normalizedValue === "test") {
        if (!hasRpgPanelAccess(sender)) return m.reply(status.error("Command test hanya bisa digunakan owner bot."))
        if (ww[chat]) return m.reply(status.warning(`Grup masih dalam sesi permainan ${getGameCategory(ww[chat].category).name} aktif.`))
        const testPlayers = [sender, ...[2, 3, 4, 5].map((number) => `ww-test-${number}@s.whatsapp.net`)]
        ww[chat] = {
            room: chat,
            owner: sender,
            category: gameCategory.id,
            commandBase: gameCommandBase,
            status: false,
            iswin: null,
            cooldown: null,
            day: 0,
            time: "malem",
            player: testPlayers.map((id, index) => ({
                id,
                number: index + 1,
                sesi: chat,
                status: false,
                role: false,
                effect: [],
                vote: 0,
                isdead: false,
                isvote: false,
                isDummy: id !== sender,
                displayName: id === sender ? conn.getName(sender) : `Simulasi ${index + 1}`
            })),
            dead: [],
            voting: false,
            seer: false,
            guardian: [],
            testMode: true,
            phaseTimeout: null
        }
        conn.werewolfTest[chat] = {
            owner: sender,
            phase: "night"
        }
        value = "start"
    }

    if (testState && testState.owner === sender) {
        if (!ww[chat]) delete conn.werewolfTest[chat]
    }

    if (isDeadInRoom && normalizedValue && !allowedDeadCommands.includes(normalizedValue) && !(ww[chat] && ww[chat].status && isSecretCode)) {
        return m.reply(status.warning("Kamu sudah gugur dalam permainan ini. Tunggu hingga permainan selesai untuk bermain kembali."))
    }

    // Penanganan Klik Tombol Kode Rahasia (.ww <KODE>)
    if (ww[chat] && ww[chat].status && isSecretCode && !standardCommands.includes(normalizedValue)) {
        const phase = ww[chat].time === "voting" ? "vote" : "night"
        const result = resolveSecretCodeAction(chat, sender, detectedSecretCode || value, ww, phase)

        if (result.ok) {
            await m.react('✅')

            const targetPlayer = result.targetNumber
                ? ww[chat].player.find((entry) => entry.number === result.targetNumber)
                : null
            const targetLabel = targetPlayer ? getDisplayPlayerLabel(targetPlayer) : ''
            let privateText = ''

            if (phase === 'night' && result.action === 'check') {
                const category = getGameCategory(ww[chat].category)
                const targetRole = targetPlayer?.role || 'warga'
                const roleTitle = roleTitles[targetRole] || (targetRole === category.antagonist
                    ? category.antagonistName.toUpperCase()
                    : targetRole.toUpperCase())
                privateText = `> 🔮 Penerawangan berhasil.\n> 🎯 Target: *${targetLabel || `Pemain #${result.targetNumber}`}*\n> 🪪 Role: *${roleTitle} ${roleEmojis[targetRole] || '🎭'}*`
            } else {
                const actionMessages = {
                    kill: `> ✅ Target serangan berhasil dipilih: *${targetLabel}*.`,
                    guard: `> 🛡️ Berhasil melindungi *${targetLabel}* dari serangan dan voting.`,
                    poison: `> ☠️ Berhasil memilih *${targetLabel}* untuk diracuni.`,
                    revive: `> ✨ Berhasil memilih *${targetLabel}* untuk dihidupkan kembali.`,
                    hunter: `> 🏹 Berhasil memilih *${targetLabel}* sebagai sasaran tembakan.`,
                    dummy: `> 🌙 Kamu memilih *${result.choices?.label || 'aktivitas malam'}* untuk menghindari ${getGameCategory(ww[chat].category).antagonistName}.`,
                    skip: `> ⏩ Aksi berhasil dilewati. Kemampuanmu tetap bisa digunakan pada ronde berikutnya.`,
                    vote: `> 🗳️ Suaramu berhasil diberikan${targetLabel ? ` kepada *${targetLabel}*` : ''}.`
                }
                privateText = actionMessages[result.action] || '> ✅ Aksimu berhasil dicatat.'
            }

            await sendDualGroupMessage(
                conn,
                chat,
                sender,
                { text: privateText },
                '> 🔒 Aksi pemain telah dicatat. Pemain lain tidak dapat melihat detailnya.'
            )

            // Simulasi instan untuk testMode
            if (ww[chat].testMode && phase === "night") {
                ww[chat].player.filter((p) => p.id !== sender).forEach((p) => {
                    p.nightDone = true
                    p.lastNightAction = { type: "skip", label: "Simulasi" }
                })
            }

            // Cek apakah seluruh pemain hidup telah beraksi
            const progress = getNightProgress(ww[chat])
            if (progress.completed) {
                await resolveNightToMorning(conn, chat, ww)
            }
            return
        }

        await m.react('❌')
        return
    }

    if (normalizedValue === 'shoot') {
        const room = ww[chat]
        const hunter = room?.player?.find((player) => player.id === sender && player.pendingHunter)
        if (!room?.status || room.pendingHunter !== sender || !hunter) {
            return m.reply(status.warning('Kamu tidak sedang memiliki kesempatan tembakan Hunter.'))
        }
        const targetNumber = Number.parseInt(target, 10)
        const targetPlayer = room.player.find((player) => player.number === targetNumber && !player.isdead && !player.isDummy)
        if (!targetPlayer || targetPlayer.id === sender) {
            return m.reply(status.error(`Target tidak valid. Gunakan *${gameCommandBase} shoot <nomor pemain hidup>*.`))
        }
        const resumePhase = room.pendingHunterPhase
        targetPlayer.isdead = true
        targetPlayer.deathNoticeSent = false
        if (targetPlayer.role === 'hunter') {
            targetPlayer.pendingHunter = true
            targetPlayer.canShoot = true
        }
        hunter.pendingHunter = false
        hunter.hunterUsed = true
        room.pendingHunter = null
        room.pendingHunterPhase = null
        if (room.phaseTimeout) {
            clearTimeout(room.phaseTimeout)
            room.phaseTimeout = null
        }
        await conn.sendMessage(chat, {
            text: `🏹 *TEMBAKAN TERAKHIR*\n\n@${hunter.id.split('@')[0]} menembak @${targetPlayer.id.split('@')[0]}! Sang Hunter akhirnya gugur setelah melakukan aksi terakhirnya.${targetPlayer.role === 'hunter' ? '\n\nHunter yang tertembak juga mendapat kesempatan membalas.' : ''}`,
            mentions: [hunter.id, targetPlayer.id]
        })
        if (targetPlayer.pendingHunter) {
            await openHunterReaction(conn, chat, room, targetPlayer, resumePhase)
        } else if (resumePhase === 'morning') {
            await publishMorning(conn, chat, room, ww)
        } else {
            await resumeAfterHunterVote(conn, chat, room, ww)
        }
        return
    }

    if (value === "role" && gameCategory.id === 'custom') {
        const room = ww[chat]
        if (room && (room.category !== 'custom' || room.status)) {
            return m.reply(status.warning("Role custom hanya bisa diatur sebelum game custom dimulai."))
        }
        if (room && room.owner !== sender && !hasRpgPanelAccess(sender)) {
            return m.reply(status.error("Hanya owner room atau moderator yang dapat mengatur role custom."))
        }

        const targetPlayerId = m.mentionedJid?.[0] || m.quoted?.sender
        if (!targetPlayerId) {
            return m.reply(status.warning(`Tag pemain atau reply pesannya. Contoh: *${gameCommandBase} role @pemain seer*`))
        }
        const roleInput = args.slice(1).filter((arg) => !String(arg).startsWith('@')).join(' ')
        const selectedRole = resolveRoleChoice(roleInput)
        if (!selectedRole) {
            return m.reply(status.warning(`Role tidak valid. Gunakan nama role atau nomor dari *.gr role*.`))
        }

        conn.werewolfCustomRoles ||= {}
        const customRoles = room
            ? (room.customRoles ||= {})
            : (conn.werewolfCustomRoles[chat] ||= {})
        customRoles[targetPlayerId] = selectedRole
        if (room) {
            const player = room.player.find((entry) => entry.id === targetPlayerId)
            if (player) player.role = selectedRole
        }
        const roleData = ROLE_DATA[selectedRole]
        return m.reply(status.success(`Role ${roleData.emoji} *${roleData.title}* berhasil ditetapkan untuk @${targetPlayerId.split('@')[0]} di mode Custom.`))

    } else if (value === "create") {
        if (chat in ww) return m.reply(status.warning(`Grup masih dalam sesi permainan ${gameCategory.name}.`))
        if (playerOnGame(sender, ww) === true) {
            const activeRoom = Object.values(ww).find((room) => room?.player?.some((player) => player.id === sender))
            return m.reply(status.warning(`Kamu masih terdaftar dalam sesi game ${getGameCategory(activeRoom?.category).name} lain.`))
        }
        const wager = parseWager(args[1])
        if (wager === null) return m.reply(status.error(`Nominal taruhan tidak valid. Gunakan angka seperti *${gameCommandBase} create 1000000* atau *${gameCommandBase} create 1jt*.`))

        ww[chat] = {
            room: chat,
            owner: sender,
            category: gameCategory.id,
            commandBase: gameCommandBase,
            customRoles: gameCategory.id === 'custom'
                ? { ...(conn.werewolfCustomRoles?.[chat] || {}) }
                : undefined,
            status: false,
            iswin: null,
            cooldown: null,
            day: 0,
            time: "malem",
            player: [],
            dead: [],
            voting: false,
            seer: false,
            guardian: [],
            wager,
            wagerPlayers: [],
            phaseTimeout: null
        }
        if (gameCategory.id === 'custom' && conn.werewolfCustomRoles) {
            delete conn.werewolfCustomRoles[chat]
        }

        const wagerInfo = wager > 0
            ? `> ⟡ Taruhan : *Rp ${wager.toLocaleString('id-ID')} per pemain (ditahan saat join)*\n`
            : `> ⟡ Taruhan : *Tanpa taruhan*\n`
        const createCard = `*──  ୨୧ ✧ ${gameCategory.name.toUpperCase()} ROOM CREATED ✧ ୨୧  ──*
> 🏰 _Room ${gameCategory.name} telah dibuka untuk petualangan baru..._

*╭  〔 ✦ ɪɴꜰᴏ ʀᴏᴏᴍ 〕*
> ⟡ Pemilik : *@${sender.split('@')[0]}*
> ⟡ Minimal : *𝟻 Pemain*
> ⟡ Maksimal : *𝟷𝟻 Pemain*
${wagerInfo}*╰───────────────*
${gameCategory.id === 'custom' ? `\n> 🎭 Atur role pemain dengan *${gameCommandBase} role @pemain <role/nomor>* sebelum memulai.` : ''}
· · ─ ─ ✦ ─ ─ · ·
> _Tekan tombol di bawah atau ketik *${gameCommandBase} join* untuk bergabung._`

        const createButtons = [
            ['⚔️ Gabung Room', `${gameCommandBase} join`]
        ]

        await conn.sendButton(chat, createCard, `Avelia • ${gameCategory.name} Game`, null, createButtons, m, {
            contextInfo: { mentionedJid: [sender] }
        })

    } else if (value === "join") {
        if (!ww[chat]) return m.reply(status.error(`Belum ada sesi permainan ${gameCategory.name} di grup ini. Buat dengan *${gameCommandBase} create*.`))
        if (ww[chat].status === true) return m.reply(status.warning("Sesi permainan sudah dimulai."))
        if (getRealPlayerCount(ww[chat]) >= 15) return m.reply(status.warning("Kapasitas room telah penuh (maksimal 15 pemain)."))
        if (playerOnRoom(sender, chat, ww) === true) return m.reply(status.warning("Kamu sudah bergabung dalam room ini."))
        if (playerOnGame(sender, ww) === true) return m.reply(status.warning("Kamu masih terdaftar dalam sesi room lain."))

        ww[chat].player.forEach((player, index) => {
            player.number = index + 1
        })

        const newPlayer = {
            id: sender,
            number: ww[chat].player.length + 1,
            sesi: chat,
            status: false,
            role: ww[chat].category === 'custom' ? ww[chat].customRoles?.[sender] || false : false,
            effect: [],
            vote: 0,
            isdead: false,
            isvote: false,
            isDummy: false,
            displayName: conn.getName(sender)
        }
        const wager = Number(ww[chat].wager) || 0
        if (wager > 0) {
            const wdb = loadDB()
            if (compareRpgMoney(wdb.money[sender], wager) < 0) {
                return m.reply(status.error(`Saldo tidak cukup untuk join. Taruhan Rp ${wager.toLocaleString('id-ID')} langsung ditahan saat bergabung.`))
            }
            wdb.money[sender] = subtractRpgMoney(wdb.money[sender], wager)
            ww[chat].wagerPlayers ||= []
            ww[chat].wagerPlayers.push(sender)
            await saveDB(wdb)
        }
        ww[chat].player.push(newPlayer)

        const jids = ww[chat].player.filter((p) => !p.isDummy).map((p) => p.id)
        let rosterText = ''
        ww[chat].player.forEach((p) => {
            rosterText += `> (${toSmallNum(p.number)}) ⟡ ${getDisplayPlayerLabel(p)}\n`
        })

        const totalPlayers = ww[chat].player.length
        const isReadyToStart = totalPlayers >= 5

        const joinCard = `*──  ୨୧ ✧ ${gameCategory.name.toUpperCase()} ROSTER ✧ ୨୧  ──*
> ⚔️ _Warga desa mulai berkumpul di balai pertemuan..._

*╭  〔 ✦ ᴅᴀꜰᴛᴀʀ ᴘᴇꜱᴇʀᴛᴀ (${toSmallNum(totalPlayers)}/𝟷𝟻) 〕*
${rosterText.trim()}
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> 💰 Taruhan: *${ww[chat].wager > 0 ? `Rp ${ww[chat].wager.toLocaleString('id-ID')} ditahan sejak join` : 'Tanpa taruhan'}*
· · ─ ─ ✦ ─ ─ · ·
> _Syarat bermain: Minimal 𝟻 pemain & maksimal 𝟷𝟻 pemain._`

        const joinButtons = []
        if (isReadyToStart) {
            joinButtons.push(['🚀 Mulai Game', `${ww[chat].commandBase || gameCommandBase} start`])
        }
        joinButtons.push(['⚔️ Gabung Lagi', `${ww[chat].commandBase || gameCommandBase} join`])

        await conn.sendButton(chat, joinCard, `Avelia • ${gameCategory.name} Game`, null, joinButtons, m, {
            contextInfo: { mentionedJid: jids }
        })

    } else if (value === "add" && (target === "warga" || target === "dummy" || target === "dummies")) {
        if (!ww[chat]) return m.reply(status.error("Belum ada sesi permainan."))
        if (ww[chat].status === true) return m.reply(status.warning("Sesi permainan sudah dimulai."))
        const requestedCount = Number(args[2] ?? args[1] ?? 1)
        const addCount = Number.isFinite(requestedCount) && requestedCount > 0 ? Math.floor(requestedCount) : 1
        const totalBefore = ww[chat].player.length
        for (let i = 0; i < addCount; i++) {
            const order = totalBefore + i + 1
            ww[chat].player.push(createWargaPlayer(ww[chat], order))
        }
        ww[chat].player.forEach((player, index) => {
            player.number = index + 1
        })
        m.reply(status.success(`Berhasil menambahkan ${toSmallNum(addCount)} warga simulasi ke room.`))

    } else if (value === "del" && (target === "warga" || target === "dummy" || target === "dummies")) {
        if (!ww[chat]) return m.reply(status.error("Belum ada sesi permainan."))
        const wargaPlayers = ww[chat].player.filter((player) => player.isDummy)
        if (!wargaPlayers.length) return m.reply(status.warning("Tidak ada warga simulasi di room ini."))
        ww[chat].player = ww[chat].player.filter((player) => !player.isDummy)
        ww[chat].player.forEach((player, index) => {
            player.number = index + 1
        })
        m.reply(status.success(`Berhasil menghapus ${toSmallNum(wargaPlayers.length)} warga simulasi.`))

    } else if (value === "start") {
        if (!ww[chat]) return m.reply(status.error("Belum ada sesi permainan."))
        if (args[1] !== undefined) return m.reply(status.warning(`Taruhan ditentukan saat membuat room. Gunakan *${gameCommandBase} create <taruhan>*; tanpa taruhan cukup *${gameCommandBase} create*.`))
        if (getRealPlayerCount(ww[chat]) < 1) return m.reply(status.error("Minimal 1 pemain asli untuk memulai game."))
        if (ww[chat].player.length < 5) return m.reply(status.warning(`Pemain belum mencukupi! Minimal 𝟻 pemain (saat ini: ${toSmallNum(ww[chat].player.length)}). Gunakan *${gameCommandBase} add warga* jika ingin menambah simulasi.`))
        if (ww[chat].status === true) return m.reply(status.warning("Permainan sudah berjalan."))
        if (ww[chat].owner !== sender && !hasRpgPanelAccess(sender)) return m.reply(status.error(`Hanya owner room (@${ww[chat].owner.split('@')[0]}) yang dapat memulai permainan.`))

        const wager = ww[chat].wager === undefined ? 0 : Number(ww[chat].wager)
        if (ww[chat].testMode && wager > 0) return m.reply(status.warning("Taruhan tidak tersedia dalam mode test."))
        const wagerPlayers = ww[chat].player.filter((player) => !player.isDummy)
        const wagerEscrowCount = (ww[chat].wagerPlayers || []).length
        if (!Number.isSafeInteger(wager) || wager < 0) return m.reply(status.error("Nominal taruhan room tidak valid. Buat ulang room tanpa taruhan atau dengan nominal yang benar."))
        if (!Number.isSafeInteger(wager * (wager > 0 ? wagerEscrowCount : wagerPlayers.length))) return m.reply(status.error("Total pot taruhan terlalu besar."))
        const escrowedPlayers = new Set(ww[chat].wagerPlayers || [])
        const unescrowedPlayers = wagerPlayers.filter((player) => wager > 0 && !escrowedPlayers.has(player.id))
        if (unescrowedPlayers.length) {
            const playerNames = unescrowedPlayers.map(getDisplayPlayerLabel).join(', ')
            return m.reply(status.error(`Taruhan belum ditahan untuk: ${playerNames}. Mereka harus keluar lalu join kembali setelah saldo mencukupi.`))
        }

        if (ww[chat].category === 'custom') {
            const unassignedPlayers = ww[chat].player.filter((player) =>
                !player.isDummy && !validRoleName(ww[chat].customRoles?.[player.id] || player.role)
            )
            if (unassignedPlayers.length) {
                const names = unassignedPlayers.map(getDisplayPlayerLabel).join(', ')
                return m.reply(status.warning(`Role custom belum diatur untuk: ${names}.\nAtur dengan *${gameCommandBase} role @pemain <role/nomor>* sebelum memulai.`))
            }
        }

        if (!roleGenerator(chat, ww)) {
            return m.reply(status.error(ww[chat].category === 'custom'
                ? "Gagal menyiapkan role custom. Pastikan setiap pemain sudah mendapat role yang valid."
                : "Gagal mendistribusikan role. Pastikan room valid."))
        }
        if (ww[chat].player.some((player) => !validRoleName(player.role))) {
            return m.reply(status.error("Terdapat pemain yang belum memperoleh role. Game dibatalkan."))
        }

        if (wager > 0) {
            ww[chat].wager = wager
            ww[chat].wagerSettled = false
        }

        addTimer(chat, ww)
        startGame(chat, ww)
        const wagerNotice = wager > 0 ? ` Taruhan Rp ${wager.toLocaleString('id-ID')} per pemain sudah ditahan saat join.` : ""
        await m.reply(status.success(`${ww[chat].category === 'custom' ? 'Role custom' : `Role rahasia ${gameCategory.name}`} berhasil dibagikan di grup dengan tampilan khusus untuk setiap pemain.${wagerNotice}`))

        // Luncurkan Stanza Multi-Partisipan untuk Malam Pertama
        await sendNightPhaseStanza(conn, chat, ww[chat])

    } else if (value === "vote") {
        if (!ww[chat] || ww[chat].status === false || ww[chat].time !== "voting") {
            return m.reply(status.warning("Sesi voting siang belum dibuka."))
        }
        const voter = ww[chat].player.find((p) => p.id === sender)
        if (!voter || voter.isdead || voter.isDummy) {
            return m.reply(status.error("Hanya pemain yang masih hidup yang memiliki hak suara."))
        }
        if (voter.isvote) {
            return m.reply(status.warning("Kamu sudah memberikan suara pada sidang hari ini."))
        }

        if (target === "skip" || target === "0") {
            voter.isvote = true
            await m.react('✅')

            const allVoted = ww[chat].player.filter((p) => !p.isdead && !p.isDummy).every((p) => p.isvote)
            if (allVoted) {
                await resolveDayVoting(conn, chat, ww)
            }
            return
        }

        if (!target || isNaN(target)) return m.reply(status.warning("Masukkan nomor pemain yang valid atau pilih tombol vote."))

        const targetNum = parseInt(target)
        const targetPlayer = ww[chat].player.find((p) => p.number === targetNum)
        if (!targetPlayer || targetPlayer.isdead) {
            return m.reply(status.error("Pemain target tidak ditemukan atau sudah gugur."))
        }
        if (ww[chat].guardianVoteTarget === targetNum) {
            return m.reply(status.warning("Target ini sedang dilindungi Guardian dari voting hari ini."))
        }

        if (!vote(chat, targetNum, sender, ww)) return m.reply(status.error("Vote tidak berhasil dicatat. Periksa kembali target yang dipilih."))
        await m.react('✅')

        if (ww[chat].testMode) {
            const room = ww[chat]
            room.player.filter((p) => p.id !== sender && !p.isdead).forEach((p) => {
                p.isvote = true
            })
        }

        const allVoted = ww[chat].player.filter((p) => !p.isdead && !p.isDummy).every((p) => p.isvote)
        if (allVoted) {
            await resolveDayVoting(conn, chat, ww)
        }

    } else if (value === "exit") {
        if (!ww[chat] || ww[chat].status) return m.reply(status.warning("Tidak dapat keluar saat permainan sedang berlangsung."))
        const room = ww[chat]
        if (!room.player.some((player) => player.id === sender)) return m.reply(status.error("Kamu belum terdaftar di room ini."))
        conn.werewolfExitConfirmations ||= {}
        const confirmationKey = `${chat}:${sender}`
        const confirmation = conn.werewolfExitConfirmations[confirmationKey]
        const confirmAction = String(target || '').toLowerCase()
        if (['cancel', 'batal', 'no', 'tidak'].includes(confirmAction)) {
            delete conn.werewolfExitConfirmations[confirmationKey]
            return m.reply(status.success('Keluar room dibatalkan.'))
        }

        const forfeitedStake = Number(room.wager) > 0 && (room.wagerPlayers || []).includes(sender)
        if (forfeitedStake && confirmAction !== 'confirm' && confirmAction !== 'yes' && confirmAction !== 'ya') {
            conn.werewolfExitConfirmations[confirmationKey] = Date.now() + 60_000
            const buttons = [
                ['✅ Ya, Keluar', `${gameCommandBase} exit confirm`],
                ['↩️ Batal', `${gameCommandBase} exit cancel`]
            ]
            return conn.sendButton(
                chat,
                `*⚠️ KONFIRMASI KELUAR ROOM*\n\nTaruhanmu sebesar *Rp ${Number(room.wager).toLocaleString('id-ID')}* tidak dikembalikan jika kamu keluar. Uang hanya dikembalikan jika room dihapus.\n\nYakin ingin keluar?`,
                `Avelia • ${getGameCategory(room.category).name}`,
                null,
                buttons,
                m
            )
        }

        if (forfeitedStake && (!confirmation || confirmation < Date.now())) {
            delete conn.werewolfExitConfirmations[confirmationKey]
            return m.reply(status.warning(`Konfirmasi kedaluwarsa. Ketik *${gameCommandBase} exit* untuk meminta konfirmasi lagi.`))
        }
        if (!playerExit(chat, sender, ww)) return m.reply(status.error("Kamu belum terdaftar di room ini."))
        delete conn.werewolfExitConfirmations[confirmationKey]
        m.reply(status.success(`Berhasil keluar dari room ${getGameCategory(room.category).name}.${forfeitedStake ? " Taruhan tetap berada di pot room dan hanya dikembalikan jika room dihapus." : ""}`))

    } else if (value === "delete") {
        if (!ww[chat]) return m.reply(status.warning(`Tidak ada room ${gameCategory.name} aktif di grup ini.`))
        const room = ww[chat]
        const roomGame = getGameCategory(room.category)
        const roomCommandBase = room.commandBase || gameCommandBase
        const canDelete = room.owner === sender || hasRpgPanelAccess(sender)
        if (!canDelete) return m.reply(status.error("Hanya owner room atau moderator yang dapat menghapus room."))

        conn.werewolfDeleteConfirmations ||= {}
        const confirmationKey = `${chat}:${sender}`
        const confirmation = conn.werewolfDeleteConfirmations[confirmationKey]
        const confirmAction = String(target || '').toLowerCase()
        if (['cancel', 'batal', 'no', 'tidak'].includes(confirmAction)) {
            delete conn.werewolfDeleteConfirmations[confirmationKey]
            return m.reply(status.success(`Penghapusan room ${roomGame.name} dibatalkan.`))
        }
        if (confirmAction !== 'confirm' && confirmAction !== 'yes' && confirmAction !== 'ya') {
            conn.werewolfDeleteConfirmations[confirmationKey] = {
                room,
                expiresAt: Date.now() + 60_000
            }
            const confirmButtons = [
                [`🗑️ Hapus Room ${roomGame.name}`, `${roomCommandBase} delete confirm`],
                ['↩️ Jangan Hapus', `${roomCommandBase} delete cancel`]
            ]
            return conn.sendButton(
                chat,
                `*⚠️ KONFIRMASI HAPUS ROOM ${roomGame.name.toUpperCase()}*\n\n${room.status ? 'Permainan yang sedang berjalan akan dihentikan dan seluruh role akan ditampilkan.' : 'Room yang belum dimulai akan ditutup.'}\n\n💰 Taruhan semua pemain yang pernah join akan dikembalikan.\n\nLanjutkan menghapus room ini?`,
                `Avelia • ${roomGame.name}`,
                null,
                confirmButtons,
                m
            )
        }
        if (
            !confirmation ||
            confirmation.expiresAt < Date.now() ||
            confirmation.room !== room
        ) {
            delete conn.werewolfDeleteConfirmations[confirmationKey]
            return m.reply(status.warning(`Konfirmasi kedaluwarsa. Ketik *${roomCommandBase} delete* untuk meminta konfirmasi lagi.`))
        }
        delete conn.werewolfDeleteConfirmations[confirmationKey]
        if (ww[chat].phaseTimeout) {
            clearTimeout(ww[chat].phaseTimeout)
            ww[chat].phaseTimeout = null
        }

        let refundNotice = ''
        if (await refundWerewolfWager(room)) {
            refundNotice = '\n\n💰 Taruhan room dikembalikan kepada seluruh pemain yang pernah join.'
        }
        if (room.status) {
            const players = room.player.filter((player) => !player.isDummy)
            const roster = room.player.map((player) => {
                const title = roleTitles[player.role] || player.role
                return `> (${toSmallNum(player.number)}) ${getDisplayPlayerLabel(player)} — *${title}*`
            }).join('\n')
            try {
                await conn.sendMessage(chat, {
                    image: { url: thumbExecution },
                    caption: `*── ✧ ROOM ${roomGame.name.toUpperCase()} DIHAPUS ✧ ──*\n\nPermainan dihentikan oleh owner room. Berikut role yang dibagikan:\n\n${roster}${refundNotice}`,
                    mentions: players.map((player) => player.id)
                })
            } catch (error) {
                console.error('[werewolf room delete role reveal failed]', error?.message)
            }
        }
        delete ww[chat]
        for (const key of Object.keys(conn.werewolfExitConfirmations || {})) {
            if (key.startsWith(`${chat}:`)) delete conn.werewolfExitConfirmations[key]
        }
        for (const key of Object.keys(conn.werewolfDeleteConfirmations || {})) {
            if (key.startsWith(`${chat}:`)) delete conn.werewolfDeleteConfirmations[key]
        }
        await m.reply(status.success(`Room ${roomGame.name} berhasil dihapus.${refundNotice}`))

    } else if (value === "player") {
        if (!ww[chat]) return m.reply(status.warning(`Tidak ada sesi permainan ${gameCategory.name} aktif.`))
        const game = getGameCategory(ww[chat].category)
        const jids = ww[chat].player.filter((p) => !p.isDummy).map((p) => p.id)
        let text = `*── ୨୧ ✧ ${game.name.toUpperCase()} PLAYER LIST ✧ ୨୧ ──*\n> 📋 _Daftar status pemain saat ini:_\n\n*╭ 〔 ✦ STATUS PEMAIN 〕*\n`
        ww[chat].player.forEach((p, index) => {
            p.number = index + 1
            const pLabel = getDisplayPlayerLabel(p)
            const playerStatus = p.isdead ? '🔴' : '🟢'
            text += `> (${toSmallNum(p.number)}) ${pLabel} ${playerStatus}\n`
        })
        text += `*╰───────────────*\n\n🟢 Hidup  ·  🔴 Mati\n> _Pemain gugur tidak dapat beraksi._`

        await conn.sendMessage(chat, {
            image: { url: thumbNight },
            caption: text.trim(),
            mentions: jids
        }, { quoted: m })

    } else if (value === "info") {
        const game = getGameCategory(ww[chat]?.category === gameCategory.id ? ww[chat].category : gameCategory.id)
        const infoText = `*── ୨୧ ✧ ${game.name.toUpperCase()} GAME INFO ✧ ୨୧ ──*
> ${game.antagonistEmoji} _Permainan deduksi sosial, strategi, dan intrik._

*╭  〔 ✦ ꜱɪꜱᴛᴇᴍ 𝟷𝟶𝟶% ɪɴ-ɢʀᴏᴜᴘ 〕*
> ⟡ Detail aksi dikirim di grup, tetapi hanya terlihat oleh pemain yang bertindak.
> ⟡ Semua role & tombol dikirim via 1 Dual Stanza grup
> ⟡ Tombol aksi malam menggunakan tombol cepat Native Flow
> ⟡ Penonton grup TIDAK menerima tombol apapun
> ⟡ Aksi Seer langsung terungkap via Dual Message
*╰───────────────*

*╭  〔 ✦ ᴀʟᴜʀ ᴘᴇʀᴍᴀɪɴᴀɴ 〕*
> 🌙 *Malam*: Pemain hidup memilih aksi rahasia lewat tombol.
> ☀️ *Fajar*: Pengumuman korban dan hasil perlindungan.
> ⚖️ *Siang*: Diskusi dan voting untuk mencari ${game.antagonistName}.
> 🔁 Siklus berulang hingga salah satu pihak menang.
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Ketik *${gameCommandBase} guide* untuk panduan lengkap atau *${gameCommandBase} role* untuk daftar peran._`
        m.reply(infoText)

    } else if (value === "guide") {
        const game = getGameCategory(ww[chat]?.category === gameCategory.id ? ww[chat].category : gameCategory.id)
        const guideText = `*── ୨୧ ✧ PANDUAN ${game.name.toUpperCase()} ✧ ୨୧ ──*
> 📖 _Langkah-langkah memulai dan memainkan ${game.name}:_

*╭  〔 ✦ 𝟷. ᴍᴇᴍʙᴜᴀᴛ ʀᴏᴏᴍ 〕*
> Ketik *${gameCommandBase} create* untuk tanpa taruhan, atau *${gameCommandBase} create <taruhan>* (contoh: *${gameCommandBase} create 1jt*).
${game.id === 'custom' ? `> Atur role dengan *${gameCommandBase} role @pemain <role/nomor>* berdasarkan daftar *.gr role*.` : ''}
> Pemain lain ketik *${gameCommandBase} join* (Minimal 𝟻, Maksimal 𝟷𝟻).
*╰───────────────*

*╭  〔 ✦ 𝟸. ᴍᴇᴍᴜʟᴀɪ ɢᴀᴍᴇ 〕*
> Owner room mengetik *${gameCommandBase} start*.
> Bot otomatis mengirimkan pesan terenkripsi ke grup.
> Hanya kamu yang bisa melihat role & tombol tokomu!
> Jika room memakai taruhan, saldo dicek dan taruhan ditahan langsung saat join. Keluar dari room membuat taruhan tetap di pot; menghapus room mengembalikan taruhan.
> Tim pemenang membagi pot, sedangkan Jester yang menang mengambil seluruh pot. Jika Jester kalah, taruhannya dikembalikan.
*╰───────────────*

*╭  〔 ✦ 𝟹. ꜰᴀꜱᴇ ᴍᴀʟᴀᴍ 〕*
> Tekan salah satu tombol aksi di bawah gelembung pesanmu.
> Chat tombol otomatis disamarkan agar rahasiamu aman.
*╰───────────────*

*╭  〔 ✦ 𝟺. ꜰᴀꜱᴇ ᴠᴏᴛɪɴɢ 〕*
> Tekan tombol vote di grup atau ketik *${gameCommandBase} vote <nomor>*.
> Suara terbanyak akan dieksekusi di balai desa.
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Jaga kerahasiaan identitasmu dan bawa timmu menuju kemenangan!_`
        m.reply(guideText)

    } else if (value === "role") {
        const game = getGameCategory(ww[chat]?.category === gameCategory.id ? ww[chat].category : gameCategory.id)
        const roleText = `*── ୨୧ ✧ DAFTAR ROLE ${game.name.toUpperCase()} ✧ ୨୧ ──*
> 🎭 _Kenali setiap peran dan kekuatannya:_

*╭ 〔 ✦ ᴛɪᴍ ${game.antagonistName.toUpperCase()} 〕*
> ${game.antagonistEmoji} *${game.antagonistName}* : Memilih mangsa setiap malam.
> 🔮 *Sorcerer* : Membantu tim ${game.antagonistName} dengan racun dan revive.
*╰───────────────*

*╭  〔 ✦ ᴛɪᴍ ᴡᴀʀɢᴀ ᴅᴇꜱᴀ 〕*
> 👱‍♂️ *Warga* : Menemukan & mengeksekusi ${game.antagonistName}.
> 👳 *Seer* : Menerawang identitas asli pemain setiap malam.
> 👼 *Guardian* : Melindungi 1 pemain dari terkaman dan voting; boleh melindungi diri sendiri.
> 🏹 *Hunter* : Menembak 1 target jika dirinya gugur.
> 👑 *Mayor* : Suara voting bernilai ganda (x𝟸).
> ⚒️ *Blacksmith* : Memiliki armor penahan 𝟷 kali serangan.
*╰───────────────*

*╭  〔 ✦ ɪɴᴅᴇᴘᴇɴᴅᴇɴ 〕*
> 🃏 *Jester* : Menang tunggal jika berhasil digantung warga.
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Setiap peran memiliki peran krusial dalam menentukan nasib desa!_`
        m.reply(roleText)

    } else {
        const menuText = `*──  ୨୧ ✧ ${gameCategory.name.toUpperCase()} COMMANDS ✧ ୨୧  ──*
> ${gameCategory.antagonistEmoji} _Perintah yang tersedia untuk permainan ${gameCategory.name}:_

*╭  〔 ✦ ᴄᴏᴍᴍᴀɴᴅ ᴜᴛᴀᴍᴀ 〕*
> ⟡ *${gameCommandBase} create [taruhan]* : Buat room (contoh taruhan: 1jt)
> ⟡ *${gameCommandBase} join* : Gabung ke room
> ⟡ *${gameCommandBase} start* : Mulai game (Owner)
> ⟡ *${gameCommandBase} player* : Lihat daftar pemain & status
> ⟡ *${gameCommandBase} exit* : Keluar sebelum mulai (taruhan hangus)
> ⟡ *${gameCommandBase} delete* : Hapus room (taruhan dikembalikan)
*╰───────────────*

*╭  〔 ✦ ɪɴꜰᴏʀᴍᴀꜱɪ & ʙᴀɴᴛᴜᴀɴ 〕*
> ⟡ *${gameCommandBase} info* : Ringkasan sistem in-group
> ⟡ *${gameCommandBase} guide* : Panduan cara bermain
> ⟡ *${gameCommandBase} role* : Daftar lengkap peran
> ⟡ *${gameCommandBase} add warga <n>* : Tambah simulasi
> ⟡ *${gameCommandBase} del warga* : Hapus simulasi
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Permainan berlangsung di grup; detail aksi rahasia dikirim privat kepada pemainnya._`
        m.reply(menuText)
    }
}

handler.help = ['ww', 'mafia', 'killer', 'assassin', 'impostor', 'alien', 'custom', 'gr']
handler.tags = ['game']
handler.command = [...new Set([
    'gr',
    'gameroles',
    ...Object.values(GAME_CATEGORIES).flatMap((category) => category.aliases)
])]
handler.group = true

export default handler