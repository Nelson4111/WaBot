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
    autoAssignCustomRoles,
    voteResult,
    clearAllVote,
    getWinner,
    win,
    voteStart,
    voteDone,
    buildRoleCodeMap,
    generateVoteCodeMap,
    absorbWardenAttack,
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
import { Button } from '@rexxhayanasi/elaina-baileys'
import { toSmallNum, status } from '../../lib/style.js'
import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { compareRpgMoney, subtractRpgMoney } from '../../lib/rpgMoney.js'
import { GAME_CATEGORIES, ROLE_DATA, WARGA_AI_MESSAGES, validateCustomRoles, getGameCategory, isAntagonistRole, normalizeGameCategory } from '../../lib/werewolfData.js'
import { getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'
import { sendDualGroupMessage, sendMultiParticipantGroupStanza } from '../../lib/dual-group-message.js'

const thumbNight = "https://user-images.githubusercontent.com/72728486/235316834-f9f84ba0-8df3-4444-81d8-db5270995e6d.jpg"
const thumbMorning = "https://user-images.githubusercontent.com/72728486/235344562-4677d2ad-48ee-419d-883f-e0ca9ba1c7b8.jpg"
const thumbVoting = "https://user-images.githubusercontent.com/72728486/235344861-acdba7d1-8fce-41b8-adf6-337c818cda2b.jpg"
const thumbExecution = "https://user-images.githubusercontent.com/72728486/235354619-6ad1cabd-216c-4c7c-b7c2-3a564836653a.jpg"

const sendGameRolesMenu = (conn, chat, usedPrefix, m) => {
    const menuText = `*━━━〔 🎭 GAME ROLES 〕━━━*

> Game Roles adalah permainan deduksi sosial di grup. Setiap pemain mendapat identitas rahasia dengan kemampuan berbeda. Di antara kalian ada antagonis yang menyamar; cari tahu siapa mereka sebelum terlambat.

*🌙 MALAM*
> Pemain menjalankan kemampuan role secara rahasia. Antagonis memilih target, sementara role lain bisa menyelidiki, melindungi, atau memakai kemampuan khusus.

*☀️ SIANG*
> Semua pemain berdiskusi lalu voting untuk menentukan siapa yang akan dieksekusi. Role yang gugur akan terungkap.

*🏆 TUJUAN PERMAINAN*
> Warga menang dengan menemukan semua antagonis. Antagonis menang saat jumlah mereka menyamai atau melebihi warga. Beberapa role punya kondisi kemenangan sendiri.

*🕹️ MULAI BERMAIN*
> Pilih game dan role lewat tombol di bawah untuk melihat pilihan serta panduannya. Permainan berlangsung di grup bersama pemain lain.

*━━━━━━━━━━━━━━*
> Pilih tombol di bawah untuk menjelajahi game dan role yang tersedia.`
    const menuButtons = [
        ['🎮 Daftar Game', `${usedPrefix}gr list`],
        ['🎭 Daftar Role', `${usedPrefix}gr role`],
        ['📖 Panduan Bermain', `${usedPrefix}gr guide`]
    ]
    return conn.sendButton(chat, menuText, 'Avelia • Game Roles', thumbNight, menuButtons, m)
}

const roleEmojis = Object.fromEntries(Object.entries(ROLE_DATA).map(([role, data]) => [role, data.emoji]))
const roleTitles = Object.fromEntries(Object.entries(ROLE_DATA).map(([role, data]) => [
    role,
    data.title
]))
const roleEffects = Object.fromEntries(Object.entries(ROLE_DATA).map(([role, data]) => [role, data.effect]))
const formatRoleTitle = (role) => roleTitles[role] || String(role || 'Warga').toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase())

const getRoleShortEffect = (role, game) => {
    if (role === game.antagonist) {
        return ['werewolf', 'mafia'].includes(role)
            ? `Pilih satu korban tiap malam bersama kelompok ${game.antagonistName}.`
            : `Pilih satu pemain untuk diserang tiap malam sebagai ${game.antagonistName}.`
    }
    const shortEffects = {
        warga: 'Ikut voting untuk menentukan pemain yang dieksekusi.',
        seer: 'Sekali per game, periksa role satu pemain pada malam hari.',
        guardian: 'Sekali per game, lindungi satu pemain dari serangan antagonis malam hari.',
        sorcerer: 'Tiap malam, racuni satu pemain, bangkitkan pemain mati, atau lewati.',
        hunter: 'Saat gugur, tembak satu pemain hidup sebelum fase berlanjut.',
        mayor: 'Suara voting bernilai dua.',
        jester: 'Menang sendiri jika dieksekusi melalui voting.',
        warden: 'Armor menahan satu serangan antagonis malam hari; voting tetap dapat mengeksekusinya.',
        cipher: 'Menang bersama tim yang menang jika masih hidup; wajib bicara dengan sandi angka.',
        fixer: 'Menang sendiri jika target kontrak gugur saat Fixer masih hidup.'
    }
    return shortEffects[role] || roleEffects[role] || 'Tidak memiliki aksi khusus.'
}

const formatRoleDetails = (role, game) => {
    const data = ROLE_DATA[role]
    if (!data) return null
    const title = role === game.antagonist ? game.antagonistName : data.title
    const details = [
        `*${data.emoji} ${title}*`,
        `> ${data.description}`,
        `> *Efek dalam game:* ${roleEffects[role]}`
    ]
    if (role === 'sorcerer') {
        details.push('> Jika ada antagonis lain, racun membuat Sorcerer berpihak kepada antagonis, revive membuatnya berpihak kepada warga, dan melewati aksi membuatnya tetap netral.')
    }
    if (role === 'cipher') {
        details.push('> Sandi huruf: A=4, I=1, E=3, O=0, B=8, L=7, S=5, Q=9, G=6. Pesan biasa harus mengandung angka dan tidak boleh memuat huruf-huruf tersebut.')
    }
    return details.join('\n\n')
}

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
    return room.player.filter((p) => !p?.isDummy && !p?.isAiCitizen).length
}

const getTotalPlayerCount = (room) => room?.player?.length || 0
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)]

const getAiNightActionCode = (player, actionType) => {
    const actions = Object.entries(player.secretCodes || {})
        .filter(([, choice]) => choice.type === actionType)
        .map(([code]) => code)
    if (actions.length) return getRandomItem(actions)
    const availableCodes = Object.keys(player.secretCodes || {})
    const activeCodes = availableCodes.filter((code) => player.secretCodes[code].type !== 'skip')
    return getRandomItem(activeCodes.length ? activeCodes : availableCodes)
}

const getAiDiscussionMessage = (room, player, conn) => {
    const message = getRandomItem(WARGA_AI_MESSAGES)
    if (!message?.includes('{target}')) return message
    const targets = room.player.filter((entry) => entry.id !== player.id && !entry.isDummy)
    const target = getRandomItem(targets)
    return target
        ? message.replace('{target}', getDisplayPlayerLabel(target, conn))
        : 'Ada yang melihat gerak-gerik mencurigakan semalam?'
}

const formatAiCitizenMessage = (player, message) => `> ${player.displayName} :\n> ↳ ${message}`

const getPrivatePlayerName = (player, conn) => player.isAiCitizen
    ? getDisplayPlayerLabel(player, conn)
    : String(player.displayName || conn?.getName?.(player.id) || getDisplayPlayerLabel(player, conn)).replace(/^@/, '').trim()

const sendAiCitizenStanzaStyleMessage = async (conn, chat, player) => {
    await conn.sendMessage(chat, {
        text: `> 🔒 _Detail aksi rahasia hanya terlihat oleh pemain terkait, ${getPrivatePlayerName(player, conn)}._`
    })
}

const getDisplayPlayerLabel = (player, conn) => {
    if (!player) return '—'
    if (player.isDummy) return `Warga ${toSmallNum(player.number)}`
    const rawName = player.displayName || conn?.getName?.(player.id) || ''
    const name = String(rawName).replace(/^@/, '').trim()
    return name && !/^[+\d\s().-]+$/.test(name) ? name : `Pemain ${toSmallNum(player.number)}`
}

const getPlayerMentionLabel = (player, conn) => {
    if (!player) return '—'
    if (player.isDummy || player.isAiCitizen) return getDisplayPlayerLabel(player, conn)
    const mentionId = String(player.id || '').split('@')[0].split(':')[0]
    return mentionId ? `@${mentionId}` : getDisplayPlayerLabel(player, conn)
}

const getPlayerMentions = (players) => [...new Set(
    (players || []).filter((player) => player && !player.isDummy && !player.isAiCitizen && player.id).map((player) => player.id)
)]

const describeNightChoice = (code, choice, room, conn) => {
    const target = choice?.targetNumber
        ? room.player.find((player) => player.number === choice.targetNumber)
        : null
    const targetName = target ? getDisplayPlayerLabel(target, conn) : null
    const descriptions = {
        kill: `Serang ${targetName || 'target'}`,
        check: `Ramalkan role ${targetName || 'target'}`,
        guard: `Lindungi ${targetName || 'target'}`,
        poison: `Racuni ${targetName || 'target'}`,
        revive: `Hidupkan ${targetName || 'target'}`,
        hunter: `Tembak ${targetName || 'target'}`,
        dummy: choice?.label || 'Bersembunyi',
        patrol: choice?.label || 'Berkeliling',
        skip: choice?.label || 'Lewati Malam'
    }
    return `> 🔒 *${code}* — ${descriptions[choice?.type] || 'Aksi malam'}`
}

const createWargaPlayer = (room, order, nickname) => ({
    id: `warga-${String(room?.room || 'room')}-${order}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@dummy`,
    number: order,
    sesi: room?.room || '',
    status: false,
    role: 'warga',
    effect: [],
    vote: 0,
    isdead: false,
    isvote: false,
    isDummy: false,
    isAiCitizen: true,
    displayName: String(nickname || `Warga ${order}`).trim()
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

const sendPrivateGroupText = (conn, groupJid, playerJid, text) => {
    const player = conn.werewolf?.[groupJid]?.player?.find((entry) => entry.id === playerJid)
    const playerName = player
        ? getPrivatePlayerName(player, conn)
        : String(conn?.getName?.(playerJid) || getDisplayPlayerLabel({ id: playerJid }, conn)).replace(/^@/, '').trim()
    return sendDualGroupMessage(
        conn,
        groupJid,
        playerJid,
        { extendedTextMessage: { text } },
        `> 🔒 _Detail aksi rahasia hanya terlihat oleh pemain terkait, ${playerName}._`
    )
}

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
    room.nightTarget = null
    room.poisonTarget = null
    room.reviveTarget = null
    room.hunterTarget = null

    const alivePlayers = room.player.filter((p) => !p.isdead && !p.isDummy)
    const cipherIntroPlayers = []
    const fixerContractPlayers = []
    const playerMessages = new Map()
    for (const p of alivePlayers) {
        const role = p.role || 'warga'
        const rEmoji = roleEmojis[role] || '🎭'
        const rTitle = roleTitles[role] || formatRoleTitle(role === game.antagonist ? game.antagonistName : role)
        const rEffect = getRoleShortEffect(role, game)

        const secretCodes = p.secretCodes || {}
        const actionRows = Object.keys(secretCodes).map((code) => ({
            title: `🔐 ${code}`,
            id: `${room.commandBase || '.ww'} action ${chat} ${code}`
        }))
        const actionDescriptions = Object.entries(secretCodes)
            .map(([code, choice]) => describeNightChoice(code, choice, room, conn))
            .join('\n')
        const cipherAntagonists = role === 'cipher'
            ? room.player.filter((player) => !player.isdead && !player.isDummy && isAntagonistRole(room.category, player.role))
            : []
        const cipherIntro = role === 'cipher' && !p.cipherIntroSent
            ? `\n\n*━━━〔 🔎 ɪᴅᴇɴᴛɪᴛᴀꜱ ᴀɴᴛᴀɢᴏɴɪꜱ 〕━━━*\n${cipherAntagonists.length
                ? cipherAntagonists.map((player) => `> (${toSmallNum(player.number)}) ${getPlayerMentionLabel(player, conn)} — ${formatRoleTitle(player.role)}`).join('\n')
                : '> Tidak ada antagonis yang ditugaskan di room ini.'}`
            : ''
        if (role === 'cipher' && !p.cipherIntroSent) cipherIntroPlayers.push(p)
        const fixerTarget = role === 'fixer' && !p.fixerContractShown
            ? room.player.find((player) => player.id === p.contractTargetId)
            : null
        const fixerContract = fixerTarget
            ? `\n\n*━━━〔 🕵️ ᴋᴏɴᴛʀᴀᴋ ʀᴀʜᴀꜱɪᴀ 〕━━━*\n> Target: *${getPlayerMentionLabel(fixerTarget, conn)}*\n> Menangkan kontrak jika target gugur saat kamu masih hidup.`
            : ''
        if (fixerTarget) fixerContractPlayers.push(p)
        if (p.isAiCitizen) {
            continue
        }
        const bodyCard = `*━━━〔 🌙 FASE MALAM TIBA 〕━━━*
> 🌙 _Bulan purnama bersinar terang di atas langit desa..._

*━━━〔 ${rEmoji} ʀᴏʟᴇ: ${rTitle} 〕━━━*
> ⟡ Pemain : *${getDisplayPlayerLabel(p, conn)}*
> ⟡ Nomor : *${toSmallNum(p.number)}*
> ⟡ Efek : *${rEffect}*
*━━━━━━━━━━━━━━*

*━━━〔 🔐 ᴋᴏᴅᴇ ᴀᴋsɪ ʀᴀʜᴀsɪᴀ 〕━━━*
${actionDescriptions}
${cipherIntro}
${fixerContract}
*━━━━━━━━━━━━━━*

*━━━〔 ✦ ɪɴꜱᴛʀᴜᴋꜱɪ ᴀᴋsɪ 〕━━━*
> ⟡ Tekan tombol 🔐 berkode di bawah untuk bertindak.
> ⟡ Kode dan artinya hanya terlihat olehmu.
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> 🔒 _Pilihanmu menentukan keselamatan desa saat fajar._`

        const btn = new Button(conn)
        btn.setBody(bodyCard)
        const privateMentions = [...cipherAntagonists, ...(fixerTarget ? [fixerTarget] : [])]
        if (privateMentions.length) {
            btn.setContextInfo({ mentionedJid: getPlayerMentions(privateMentions) })
        }
        btn.setFooter(`Avelia • ${game.name} Secret Night Phase`)
        for (const action of actionRows) {
            btn.addButton('quick_reply', JSON.stringify({
                display_text: action.title,
                id: action.id
            }))
        }
        const built = await btn.build(chat)
        playerMessages.set(p.id, built.message)
    }

    const spectatorText = `*━━━〔 ${game.name.toUpperCase()} · FASE MALAM 〕━━━*
> 🌙 _Bulan purnama bersinar terang di atas langit desa..._

*━━━〔 ✦ ꜱᴜᴀꜱᴀɴᴀ ᴍᴀʟᴀᴍ 〕━━━*
> ⟡ Status : *Warga terlelap di kediaman masing-masing*
> ⟡ Waktu Aksi : *𝟿𝟶 Detik*
> ⟡ Suasana : *Mencekam & sunyi senyap*
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> 🔒 _[Fase Malam Berlangsung — Aksi rahasia hanya dapat diakses oleh pemain yang masih hidup]_`

    await sendMultiParticipantGroupStanza(conn, chat, playerMessages, spectatorText)
    cipherIntroPlayers.forEach((player) => {
        player.cipherIntroSent = true
    })
    fixerContractPlayers.forEach((player) => {
        player.fixerContractShown = true
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
    void runAiCitizenNightActions(conn, chat, room).catch((error) => {
        console.error('[werewolf AI night action error]', error)
    })
}

const runAiCitizenNightActions = async (conn, chat, room) => {
    for (const player of room.player.filter((entry) => entry.isAiCitizen && !entry.isdead)) {
        if (conn.werewolf?.[chat] !== room || room.time !== 'malem' || player.nightDone) return
        await wait(650 + Math.floor(Math.random() * 600))
        if (conn.werewolf?.[chat] !== room || room.time !== 'malem' || player.isdead || player.nightDone) return

        const code = getAiNightActionCode(player)
        const result = code
            ? resolveSecretCodeAction(chat, player.id, code, conn.werewolf, 'night')
            : { ok: false, reason: 'no-night-codes' }
        if (!result.ok) {
            console.error(`[werewolf AI night action failed] player=${player.displayName} reason=${result.reason}`)
            continue
        }

        try {
            await sendAiCitizenStanzaStyleMessage(conn, chat, player)
        } catch (error) {
            console.error(`[werewolf AI night acknowledgment failed] player=${player.displayName}`, error)
        }
        const progress = getNightProgress(room)
        if (progress.completed) {
            await resolveNightToMorning(conn, chat, conn.werewolf)
            return
        }
    }
}

const sendMorningAnnouncement = async (conn, chat, room) => {
    const game = getGameCategory(room.category)
    const morningBody = pagii(room)
    const mentions = getPlayerMentions(room.player)
    const morningCard = `*━━━〔 ☀️ FAJAR TELAH TIBA 〕━━━*
> ☀️ _Sinar matahari pagi menembus kabut ${game.location}..._

${morningBody}

━━━━━━━━━━━━━━
> ⚖️ _Sidang dimulai! Warga bersiap menentukan tersangka._`

    await conn.sendMessage(chat, {
        image: { url: thumbMorning },
        caption: morningCard,
        mentions
    })
}

const publishMorning = async (conn, chat, room, ww, announce = true) => {
    const winner = getWinner(chat, ww)
    if (winner.status !== null) return await win(room, 1, conn, ww)
    if (announce) await sendMorningAnnouncement(conn, chat, room)
    await startDayVoting(conn, chat, ww)
}

const openHunterReaction = async (conn, chat, room, hunter, resumePhase) => {
    if (room.phaseTimeout) clearTimeout(room.phaseTimeout)
    room.phaseTimeout = null
    room.pendingHunter = hunter.id
    room.pendingHunterPhase = resumePhase
    hunter.secretCodes = {}
    buildRoleCodeMap(room, hunter)
    const game = getGameCategory(room.category)
    const actionRows = Object.entries(hunter.secretCodes || {}).map(([code, choice]) => ({
        title: `🔐 ${code}`,
        id: `${room.commandBase || '.ww'} action ${chat} ${code}`,
        description: choice.type === 'skip'
            ? 'Tidak menembak siapa pun'
            : `Tembak ${getDisplayPlayerLabel(
                room.player.find((player) => player.number === choice.targetNumber),
                conn
            )}`
    }))
    if (hunter.isAiCitizen) {
        await wait(600 + Math.floor(Math.random() * 500))
        const code = getAiNightActionCode(hunter, 'hunter')
        const result = code
            ? resolveSecretCodeAction(chat, hunter.id, code, conn.werewolf, 'hunter')
            : { ok: false, reason: 'no-hunter-actions' }
        const target = result.ok && result.action === 'hunter-shoot'
            ? room.player.find((player) => player.number === result.targetNumber)
            : null
        if (!result.ok) console.error(`[werewolf AI hunter action failed] player=${hunter.displayName} reason=${result.reason}`)
        await finishHunterReaction(conn, chat, room, hunter, target, conn.werewolf)
        return
    }
    const hunterCard = `*━━━〔 🏹 TEMBAKAN TERAKHIR 〕━━━*
> 🏹 _Hunter masih memiliki satu kesempatan sebelum benar-benar gugur._

*━━━〔 🏹 ᴘɪʟɪʜ ᴀᴋsɪ ʜᴜɴᴛᴇʀ 〕━━━*
> ⟡ Pemain : *${getDisplayPlayerLabel(hunter, conn)}*
> ⟡ Pilih kode rahasia pada tombol atau ketik *${room.commandBase || '.ww'} <kode>*
*━━━━━━━━━━━━━━*
 
*━━━〔 🔐 ᴋᴏᴅᴇ ᴀᴋsɪ ʀᴀʜᴀsɪᴀ 〕━━━*
${actionRows.map((row) => `> 🔒 *${row.title.slice(3)}* — ${row.description}`).join('\n')}
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> _Tembak salah satu pemain atau pilih untuk tidak menembak. Nasib ${game.name} ada di tanganmu._`
    const btn = new Button(conn)
    btn.setBody(hunterCard)
    btn.setFooter(`Avelia • ${game.name} Hunter Reaction`)
    btn.setImage(thumbExecution)
    for (const action of actionRows) {
        btn.addButton('quick_reply', JSON.stringify({
            display_text: action.title,
            id: action.id
        }))
    }
    const built = await btn.build(chat)
    await sendDualGroupMessage(
        conn,
        chat,
        hunter.id,
        built.message,
        '> 🔒 _Kesempatan tembakan Hunter hanya terlihat oleh pemain yang bersangkutan._'
    )
    room.phaseTimeout = setTimeout(async () => {
        try {
            if (conn.werewolf?.[chat] !== room || room.pendingHunter !== hunter.id) return
            await finishHunterReaction(conn, chat, room, hunter, null, conn.werewolf)
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

const finishHunterReaction = async (conn, chat, room, hunter, targetPlayer, ww) => {
    const resumePhase = room.pendingHunterPhase
    hunter.pendingHunter = false
    hunter.hunterUsed = true
    room.pendingHunter = null
    room.pendingHunterPhase = null
    if (room.phaseTimeout) {
        clearTimeout(room.phaseTimeout)
        room.phaseTimeout = null
    }

    if (targetPlayer) {
        const armorBlocked = absorbWardenAttack(targetPlayer)
        if (!armorBlocked) {
            targetPlayer.isdead = true
            targetPlayer.deathNoticeSent = false
            if (targetPlayer.role === 'hunter') {
                targetPlayer.pendingHunter = true
                targetPlayer.canShoot = true
            }
        }
        const targetRole = formatRoleTitle(targetPlayer.role)
        const resultCard = `*━━━〔 🎯 HASIL TEMBAKAN HUNTER 〕━━━*
> 🏹 _Sang Hunter telah melakukan aksi terakhirnya._

*━━━〔 🎯 ᴛᴀʀɢᴇᴛ ᴛᴇᴍʙᴀᴋᴀɴ 〕━━━*
> ⟡ Hunter : *${getDisplayPlayerLabel(hunter, conn)}*
> ⟡ Target : *${getDisplayPlayerLabel(targetPlayer, conn)}*
> ⟡ Nomor : *${toSmallNum(targetPlayer.number)}*
${armorBlocked
        ? '> ⟡ Hasil : *Tembakan tertahan oleh armor Warden sekali pakai; target tetap hidup.*'
        : `> ⟡ Gugur : *${targetRole} ${roleEmojis[targetPlayer.role] || '🎭'}*`}
*━━━━━━━━━━━━━━*
${!armorBlocked && targetPlayer.role === 'hunter' ? '\n> 🏹 Hunter yang tertembak juga mendapat kesempatan membalas.' : ''}`
        await conn.sendMessage(chat, {
            image: { url: thumbExecution },
            caption: resultCard,
            mentions: getPlayerMentions([hunter, targetPlayer])
        })
    }
    if (hunter.pendingExecution) {
        hunter.pendingExecution = false
        hunter.canShoot = false
        await conn.sendMessage(chat, {
            image: { url: thumbExecution },
            caption: `*━━━〔 ☠️ EKSEKUSI HUNTER 〕━━━*\n> 🏹 ${getDisplayPlayerLabel(hunter, conn)} telah menggunakan kesempatan terakhirnya.\n\n> ⟡ Role : *Hunter ${roleEmojis.hunter}*`,
            mentions: getPlayerMentions([hunter])
        })
    }

    if (targetPlayer?.pendingHunter) {
            await openHunterReaction(conn, chat, room, targetPlayer, resumePhase)
            return
    }

    if (getWinner(chat, ww).status === 'fixer') return await win(room, 1, conn, ww)

    if (resumePhase === 'morning') {
        room.pendingHunterMorningAnnounced = false
        await publishMorning(conn, chat, room, ww, false)
    } else {
        await resumeAfterHunterVote(conn, chat, room, ww)
    }
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

    if (getWinner(chat, ww).status === 'fixer') {
        return await win(room, 1, conn, ww)
    }

    const pendingHunter = room.player.find((player) => player.pendingHunter)
    if (pendingHunter) {
        await sendMorningAnnouncement(conn, chat, room)
        room.pendingHunterMorningAnnounced = true
        await openHunterReaction(conn, chat, room, pendingHunter, 'morning')
        return
    }

    await publishMorning(conn, chat, room, ww)
}

/**
 * Mulai voting dengan kode dan pilihan yang hanya diketahui masing-masing pemain
 */
const startDayVoting = async (conn, chat, ww) => {
    const room = sesi(chat, ww)
    if (!room || !room.status) return

    room.time = 'voting'
    voteStart(chat, ww)
    resetVote(chat, ww)
    clearAllVote(chat, ww)

    const livingPlayers = room.player.filter((p) => !p.isdead)
    let playerListText = ''
    livingPlayers.forEach((p) => {
        const pLabel = getPlayerMentionLabel(p, conn)
        playerListText += `> (${toSmallNum(p.number)}) ⟡ ${pLabel}\n`
    })

    const game = getGameCategory(room.category)
    const votingCard = `*━━━〔 ${game.name.toUpperCase()} · SIDANG 〕━━━*
> ⚖️ _Matahari tepat di atas kepala, warga berkumpul menentukan takdir..._

*━━━〔 ✦ ᴅᴀꜰᴛᴀʀ ᴡᴀʀɢᴀ ʜɪᴅᴜᴘ 〕━━━*
${playerListText.trim()}
*━━━━━━━━━━━━━━*

*━━━〔 ✦ ɪɴꜰᴏ ᴠᴏᴛɪɴɢ 〕━━━*
> ⟡ Waktu : *𝟿𝟶 Detik*
> ⟡ Pilihan dan kode voting bersifat rahasia untuk setiap pemain.
> ⟡ Gunakan tombol 🔐 yang hanya terlihat olehmu.
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> _Pilihlah dengan bijak, jangan biarkan ${game.antagonistName} memperdaya kalian!_`

    const playerMessages = new Map()
    const usedVoteCodes = new Set()
    for (const player of livingPlayers.filter((entry) => !entry.isDummy)) {
        const voteCodes = generateVoteCodeMap(room, player, usedVoteCodes)
        const voteRows = Object.entries(voteCodes).map(([code, choice]) => {
            const target = choice.targetNumber
                ? room.player.find((entry) => entry.number === choice.targetNumber)
                : null
            return {
                code,
                label: target
                    ? `> 🔒 ${code} — Vote ${getDisplayPlayerLabel(target, conn)}`
                    : `> 🔒 ${code} — Lewati voting`,
                id: `${room.commandBase || '.ww'} ${code}`
            }
        })
        if (player.isAiCitizen) continue
        const privateVotingCard = `${votingCard}\n\n*━━━〔 🔐 KODE VOTING RAHASIA 〕━━━*\n${voteRows.map((row) => row.label).join('\n')}`
        const button = new Button(conn)
        button.setBody(privateVotingCard)
        button.setFooter(`Avelia • ${game.name} Secret Voting`)
        button.setImage(thumbVoting)
        button.setContextInfo({ mentionedJid: getPlayerMentions(livingPlayers) })
        voteRows.forEach((row) => {
            button.addButton('quick_reply', JSON.stringify({
                display_text: `🔐 ${row.code}`,
                id: row.id
            }))
        })
        const built = await button.build(chat)
        playerMessages.set(player.id, built.message)
    }

    const spectatorText = `*━━━〔 ${game.name.toUpperCase()} · SIDANG 〕━━━*
> ⚖️ _Voting rahasia sedang berlangsung._
> 🔒 Setiap pemain menerima tombol dan kode voting yang berbeda.
> ⏳ Waktu voting: *𝟿𝟶 Detik*`
    await sendMultiParticipantGroupStanza(conn, chat, playerMessages, spectatorText)
    void runAiCitizenVotes(conn, chat, room).catch((error) => {
        console.error('[werewolf AI voting error]', error)
    })

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

const runAiCitizenVotes = async (conn, chat, room) => {
    for (const player of room.player.filter((entry) => entry.isAiCitizen && !entry.isdead)) {
        if (conn.werewolf?.[chat] !== room || room.time !== 'voting' || player.isvote) return
        await wait(650 + Math.floor(Math.random() * 600))
        if (conn.werewolf?.[chat] !== room || room.time !== 'voting' || player.isdead || player.isvote) return

        try {
            await conn.sendMessage(chat, {
                text: formatAiCitizenMessage(player, getAiDiscussionMessage(room, player, conn))
            })
        } catch (error) {
            console.error(`[werewolf AI discussion message failed] player=${player.displayName}`, error)
        }
        await wait(250 + Math.floor(Math.random() * 350))
        const codes = Object.keys(player.voteCodes || {})
        const code = getRandomItem(codes)
        const result = code
            ? resolveSecretCodeAction(chat, player.id, code, conn.werewolf, 'vote')
            : { ok: false, reason: 'no-vote-codes' }
        if (!result.ok) {
            console.error(`[werewolf AI vote failed] player=${player.displayName} reason=${result.reason}`)
            continue
        }
        const allVoted = room.player
            .filter((entry) => !entry.isdead && !entry.isDummy)
            .every((entry) => entry.isvote)
        if (allVoted) {
            await resolveDayVoting(conn, chat, conn.werewolf)
            return
        }
    }
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
    const voteTally = room.player
        .filter((player) => !player.isdead && (Number(player.voteCount) || 0) > 0)
        .sort((left, right) => (Number(right.vote) || 0) - (Number(left.vote) || 0))
    const voteTallyText = voteTally.length
        ? `\n\n*━━━〔 📊 HASIL SUARA 〕━━━*\n${voteTally.map((player) =>
            `> ${getDisplayPlayerLabel(player, conn)} — *${Number(player.voteCount) || 0} pemain* (${Number(player.vote) || 0} poin)`
        ).join('\n')}\n*━━━━━━━━━━━━━━*`
        : ''

    if (hasil_vote === 0) {
        const text = `*━━━〔 ⚖️ SIDANG DESA BERAKHIR 〕━━━*\n> ⚖️ _Terlalu bimbang menentukan pilihan..._\n\nWarga desa tidak dapat mencapai kesepakatan dan pulang ke rumah masing-masing. Tidak ada yang dieksekusi hari ini.${voteTallyText}\n\n━━━━━━━━━━━━━━\n> 🌙 _Malam kembali tiba menyelimuti desa..._`
        await conn.sendMessage(chat, {
            image: { url: thumbNight },
            caption: text
        })
    } else if (hasil_vote === 1) {
        const text = `*━━━〔 ⚖️ SIDANG DESA BERAKHIR 〕━━━*\n> ⚖️ _Hasil pemungutan suara berimbang!_\n\nSuara terbanyak diperoleh oleh lebih dari satu orang dengan jumlah yang sama. Eksekusi dibatalkan demi keadilan.${voteTallyText}\n\n━━━━━━━━━━━━━━\n> 🌙 _Warga kembali ke kediaman masing-masing..._`
        await conn.sendMessage(chat, {
            image: { url: thumbNight },
            caption: text
        })
    } else if (hasil_vote && typeof hasil_vote === 'object') {
        const killed = voteKill(chat, ww)
        const kRole = killed.role || 'warga'
        const kEmoji = roleEmojis[kRole] || '👱‍♂️'
        const kTitle = roleTitles[kRole] || formatRoleTitle(kRole)
        const killedName = getPlayerMentionLabel(killed, conn)

        const execText = killed.pendingExecution
            ? `*━━━〔 ⚖️ SIDANG DESA 〕━━━*
> ⚖️ _Warga desa telah memilih Hunter untuk dieksekusi._

*━━━〔 🏹 TEMBAKAN TERAKHIR 〕━━━*
> ⟡ Nama : *${killedName}*
> ⟡ Role : *Hunter ${kEmoji}*
> ⟡ Hunter akan menembak sebelum eksekusi diselesaikan.
*━━━━━━━━━━━━━━*${voteTallyText}
━━━━━━━━━━━━━━
> 🏹 _Kesempatan terakhir Hunter dimulai sekarang._`
            : `*━━━〔 ☠️ KEPUTUSAN EKSEKUSI 〕━━━*
> ⚖️ _Warga desa telah sepakat menjatuhkan hukuman gantung!_

*━━━〔 ☠️ ᴡᴀʀɢᴀ ʏᴀɴɢ ᴅɪᴇᴋꜱᴇᴋᴜꜱɪ 〕━━━*
> ⟡ Nama : *${killedName}*
> ⟡ Nomor : *${toSmallNum(killed.number)}*
> ⟡ Identitas Asli : *${kTitle} ${kEmoji}*
*━━━━━━━━━━━━━━*${voteTallyText}
━━━━━━━━━━━━━━
> 🌙 _Senja telah usai. Bersiaplah menghadapi malam yang mencekam..._`

        await conn.sendMessage(chat, {
            image: { url: thumbExecution },
            caption: execText,
            mentions: getPlayerMentions([killed])
        })

        if (killed.pendingExecution && killed.role === 'hunter') {
            await openHunterReaction(conn, chat, room, killed, 'voting')
            return
        }
        if (getWinner(chat, ww).status === 'fixer') {
            return await win(room, 1, conn, ww)
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
    const isGameRolesCommand = ['gr', 'rg', 'gameroles'].includes(String(command || '').toLowerCase())
    if (isGameRolesCommand && args.length === 1 && normalizeGameCategory(args[0])) args = []
    const directGameCategory = !isGameRolesCommand ? normalizeGameCategory(command) : null
    let gameCategory = directGameCategory || getGameCategory('ww')
    const routedGameCategory = isGameRolesCommand && Boolean(normalizeGameCategory(args[0]))
    if (routedGameCategory) {
        gameCategory = getGameCategory(args[0])
        args = args.slice(1)
    }
    const gameCommandBase = `${usedPrefix || '.'}${isGameRolesCommand ? `gr ${gameCategory.id}` : directGameCategory ? directGameCategory.aliases[0] : 'ww'}`
    const standardCommands = ["test", "create", "join", "start", "vote", "exit", "delete", "player", "room", "lobby", "info", "role", "guide", "add", "del", "shoot", "action", "autorole", "list"]
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
            .replace(/^[.\/#!]gr\s+(?:ww|werewolf|mafia|killer|assassin|assasin|impostor|imposter|alien|parasite|custom)\s*/i, "")
            .replace(/^[.\/#!]ww\s*/i, "")
            .trim()
        if (/^[A-Z0-9]{4,5}$/i.test(textRaw) && !standardCommands.includes(textRaw.toLowerCase())) {
            detectedSecretCode = textRaw.toUpperCase()
        }
    }
    const actionRoomId = ['action', 'shoot'].includes(normalizedValue) && args[1]?.endsWith('@g.us') ? args[1] : chat
    const currentRoomPlayer = ww[actionRoomId]?.player?.find((player) => player.id === sender) || null
    if (normalizedValue === 'action') {
        const actionCode = /^[A-Z0-9]{4}$/i.test(String(args[2] || ''))
            ? String(args[2]).toUpperCase()
            : null
        if (actionCode) detectedSecretCode = actionCode
        if (!actionCode) {
            return sendPrivateGroupText(conn, actionRoomId, sender, 'Pilihan aksi tidak valid atau sudah kedaluwarsa. Tunggu tombol aksi malam berikutnya.')
        }
    }
    const isSecretCode = Boolean(detectedSecretCode)
    const isDeadInRoom = !!(currentRoomPlayer && currentRoomPlayer.isdead)
    const allowedDeadCommands = ["delete", "info", "role", "player", "room", "lobby", "create", "join", "start", "exit", "guide", "shoot"]
    if ((!isGameRolesCommand || routedGameCategory) && ww[chat] && value !== 'delete' && ww[chat].category && ww[chat].category !== gameCategory.id &&
        !['info', 'guide', 'role', 'player', 'room', 'lobby'].includes(normalizedValue)) {
        return m.reply(status.warning(`Room ini memakai kategori ${getGameCategory(ww[chat].category).name}. Gunakan *.gr ${ww[chat].category} ${normalizedValue}*.`))
    }

    conn.werewolfTest = conn.werewolfTest || {}
    const testState = conn.werewolfTest[chat]

    if (isGameRolesCommand && !routedGameCategory) {
        const action = String(value || '').toLowerCase()
        if (!action) {
            return sendGameRolesMenu(conn, chat, usedPrefix, m)
        }
        if (action === 'list' || action === 'category' || action === 'kategori') {
            const categories = Object.values(GAME_CATEGORIES)
                .map((entry) => `> ${entry.antagonistEmoji} *${entry.name}*\n>   ${entry.description}\n>   Buat room: *${usedPrefix}${entry.aliases[0]} create*${entry.id === 'custom' ? `\n>   Atur role: *${usedPrefix}custom role @pemain <role/nomor>* · autorole · list` : ''}`)
                .join('\n')
            return conn.sendButton(chat, `*━━━〔 🎮 PILIH GAME 〕━━━*\n\n${categories}\n\n*━━━━━━━━━━━━━━*\n> Pilih kategori untuk melihat detail atau langsung buat room.`, 'Avelia • Pilihan Game', thumbNight, [
                ['📖 Panduan', `${usedPrefix}gr guide`],
                ['🎭 Daftar Role', `${usedPrefix}gr role`],
                ['🏠 Menu Utama', `${usedPrefix}gr`]
            ], m)
        }
        if (action === 'info') {
            const category = normalizeGameCategory(args[1])
            if (!category) return m.reply(status.warning(`Pilih kategori: ${Object.values(GAME_CATEGORIES).map((entry) => entry.id).join(', ')}. Contoh: *${usedPrefix}gr info mafia*`))
            const infoText = `*━━━〔 ${category.antagonistEmoji} INFO ${category.name.toUpperCase()} 〕━━━*

> 📝 ${category.description}

> 🌙 Malam: pemain menjalankan aksi sesuai peran.
> ⚖️ Siang: diskusi dan voting menentukan tersangka.
> 🏆 Menang dengan mencapai kondisi kemenangan tim atau role masing-masing.

> Mulai room: *${usedPrefix}${category.aliases[0]} create [taruhan]*`
            return m.reply(infoText)
        }
        if (action === 'role') {
            const requestedRole = args.slice(1).join(' ')
            if (requestedRole) {
                const selectedRole = resolveRoleChoice(requestedRole)
                if (!selectedRole) return m.reply(status.warning('Role tidak ditemukan. Gunakan nama role yang tercantum di *.gr role*.'))
                const details = formatRoleDetails(selectedRole, gameCategory)
                return m.reply(`*━━━〔 ✦ DETAIL ROLE ${formatRoleTitle(selectedRole).toUpperCase()} ✦ 〕━━━*\n\n${details}`)
            }
            const roleSections = Object.entries(ROLE_DATA)
                .map(([role, data], index) => {
                    const roleName = role === gameCategory.antagonist ? gameCategory.antagonistName : data.title
                    return `> *${index + 1}.* ${data.emoji} *${roleName}* — ${getRoleShortEffect(role, gameCategory)}`
                })
                .join('\n\n')
            return conn.sendButton(chat, `*━━━〔 🎭 ROLE & EFEK 〕━━━*\n\n${roleSections}\n\n*━━━━━━━━━━━━━━*\n> Efek di atas adalah ringkasan kemampuan saat bermain.\n> Untuk membaca latar karakter dan penjelasan lengkap, ketik *.gr role <nama role>*.\n> Contoh: *.gr role seer* atau *.gr role cipher*.\n\n> Mode Custom dapat memilih role dengan nama atau nomor, contoh: *.custom role @pemain 2*.`, 'Avelia • Daftar Role', thumbNight, [
                ['🎮 Daftar Game', `${usedPrefix}gr list`],
                ['📖 Panduan', `${usedPrefix}gr guide`],
                ['🏠 Menu Utama', `${usedPrefix}gr`]
            ], m)
        }
        if (action === 'guide') {
            return m.reply(`*━━━〔 ✧ PANDUAN GAME ROLES ✧ 〕━━━*\n\n> 1. Pilih tema lewat *.gr list*, misalnya Werewolf, Alien, atau Custom Role.\n> 2. Buat room dengan command tema, contoh *.mafia create 10k*.\n> 3. Mode Custom: bagikan role otomatis dengan *.custom autorole*, atur manual dengan *.custom role @pemain <role/nomor>*, dan periksa pembagian dengan *.custom list*. Hanya satu jenis antagonis utama dan tiap role khusus hanya untuk satu pemain.\n> 4. Peserta masuk memakai *.mafia join*; taruhan ditahan langsung saat bergabung.\n> 5. Owner room memulai dengan *.mafia start*.\n> 6. Kartu aksi dan balasan pribadi (termasuk konfirmasi sukses/gagal serta hasil ramalan) dikirim di grup melalui dual-stanza tanpa reply. Pemain terkait melihat detailnya; anggota lain hanya melihat teks pengunci. Pilihan Hunter dapat dilakukan lewat tombol atau perintah yang tercantum di pesan.\n> 7. Keluar dari room bertaruhan perlu konfirmasi; taruhan tetap di pot. Jika room dihapus, taruhan dikembalikan.\n> 8. Gunakan *.gr me*, *.gr history*, dan *.gr top* untuk statistik.`)
        }
        if (['command', 'commands', 'cmd'].includes(action)) {
            const commandText = Object.values(GAME_CATEGORIES)
                .map((entry) => `*${entry.antagonistEmoji} ${entry.name}*\n> ${usedPrefix}${entry.aliases[0]} create [taruhan] · join · start · vote · player · info · role · guide · exit · delete${entry.id === 'custom' ? `\n> ${usedPrefix}custom role @pemain <role/nomor> · autorole · list` : ''}`)
                .join('\n\n')
            return m.reply(`*━━━〔 ✧ COMMAND GAME ROLES ✧ 〕━━━*\n\n${commandText}\n\n*━━━〔 Statistik & Info 〕━━━*\n> ${usedPrefix}gr role\n> ${usedPrefix}gr info <kategori>\n> ${usedPrefix}gr top\n> ${usedPrefix}gr me\n> ${usedPrefix}gr history [halaman]`)
        }
        if (action === 'me' || action === 'stats' || action === 'stat') {
            const user = loadDB().users[sender] || {}
            const stats = user.werewolfStats || {}
            return m.reply(`*━━━〔 ✧ STATISTIK GAME ROLES ✧ 〕━━━*\n\n> Skor antagonis: *${Number(stats.score) || 0}*\n> Menang antagonis: *${Number(stats.antagonistWins) || 0}x*\n> Menang protagonis: *${Number(stats.protagonistWins) || 0}x*\n> Menang netral: *${Number(stats.neutralWins) || 0}x*`)
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
                return `*${(page - 1) * pageSize + index + 1}. ${game.name} · ${date}*\n> Role: ${formatRoleTitle(entry.role)}\n> Hasil: ${entry.result === 'win' ? 'Menang' : 'Kalah'} · Jumlah pemain: ${entry.players}\n> Skor didapat: ${entry.score}`
            }).join('\n\n') : 'Belum ada riwayat permainan.'
            const buttons = []
            if (page > 1) buttons.push(['📜 Riwayat Sebelumnya', `${usedPrefix}gr history ${page - 1}`])
            if (page < pageCount) buttons.push(['Riwayat Berikutnya 📜', `${usedPrefix}gr history ${page + 1}`])
            const caption = `*━━━〔 ✧ RIWAYAT GAME ROLES · ${page}/${pageCount} ✧ 〕━━━*\n\n${text}`
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
                caption: `*━━━〔 ✧ TOP 10 GAME ROLES ✧ 〕━━━*\n\n${lines.join('\n\n') || 'Belum ada skor yang tercatat.'}`,
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

    if (isDeadInRoom && normalizedValue && !allowedDeadCommands.includes(normalizedValue) &&
        !(ww[chat] && ww[chat].status && isSecretCode) &&
        !(normalizedValue === 'action' && currentRoomPlayer?.pendingHunter)) {
        return m.reply(status.warning("Kamu sudah gugur dalam permainan ini. Tunggu hingga permainan selesai untuk bermain kembali."))
    }

    // Penanganan Klik Tombol Kode Rahasia (.ww <KODE>)
    if (ww[actionRoomId] && ww[actionRoomId].status && isSecretCode) {
        const room = ww[actionRoomId]
        const phase = room.pendingHunter === sender
            ? "hunter"
            : room.time === "voting" ? "vote" : "night"
        const result = resolveSecretCodeAction(actionRoomId, sender, detectedSecretCode || value, ww, phase)

        if (result.ok) {
            const targetPlayer = result.targetNumber
                ? room.player.find((entry) => entry.number === result.targetNumber)
                : null
            const targetLabel = targetPlayer ? getDisplayPlayerLabel(targetPlayer, conn) : ''
            let privateText = ''

            if (phase === 'night' && result.action === 'check') {
                const category = getGameCategory(room.category)
                const targetRole = targetPlayer?.role || 'warga'
                const roleTitle = roleTitles[targetRole] || formatRoleTitle(targetRole === category.antagonist
                    ? category.antagonistName
                    : targetRole)
                privateText = `> 🔮 Penerawangan berhasil.\n> 🎯 Target: *${targetLabel || `Pemain #${result.targetNumber}`}*\n> 🪪 Role: *${roleTitle} ${roleEmojis[targetRole] || '🎭'}*`
            } else {
                const actionMessages = {
                    kill: `> ✅ Target serangan berhasil dipilih: *${targetLabel}*.`,
                    guard: `> 🛡️ Berhasil melindungi *${targetLabel}* dari serangan antagonis malam ini.`,
                    poison: `> ☠️ Berhasil memilih *${targetLabel}* untuk diracuni.`,
                    revive: `> ✨ Berhasil memilih *${targetLabel}* untuk dihidupkan kembali.`,
                    hunter: `> 🏹 Berhasil memilih *${targetLabel}* sebagai sasaran tembakan.`,
                    'hunter-shoot': `> 🏹 Kode tembakan diterima. Target: *${targetLabel}*.`,
                    'hunter-skip': '> 🏹 Kamu memilih tidak menembak siapa pun.',
                    dummy: `> 🌙 Kamu memilih *${result.choices?.label || 'aktivitas malam'}* untuk menghindari ${getGameCategory(room.category).antagonistName}.`,
                    patrol: `> 🚶 Kamu memilih *${result.choices?.label || 'berkeliling'}* malam ini.`,
                    skip: `> ⏩ Aksi berhasil dilewati. Kemampuanmu tetap bisa digunakan pada ronde berikutnya.`,
                    vote: `> 🗳️ Suaramu berhasil diberikan${targetLabel ? ` kepada *${targetLabel}*` : ''}.`,
                    'vote-skip': '> ⏩ Kamu memilih melewati voting.'
                }
                privateText = actionMessages[result.action] || '> ✅ Aksimu berhasil dicatat.'
            }

            await sendPrivateGroupText(conn, actionRoomId, sender, privateText)

            if (phase === 'hunter') {
                const hunter = room.player.find((player) => player.id === sender)
                const target = result.action === 'hunter-shoot'
                    ? room.player.find((player) => player.number === result.targetNumber)
                    : null
                await finishHunterReaction(conn, actionRoomId, room, hunter, target, ww)
                return
            }

            if (phase === 'vote') {
                if (room.testMode) {
                    room.player.filter((entry) => entry.id !== sender && !entry.isdead).forEach((entry) => {
                        entry.isvote = true
                    })
                }
                const allVoted = room.player
                    .filter((entry) => !entry.isdead && !entry.isDummy)
                    .every((entry) => entry.isvote)
                if (allVoted) await resolveDayVoting(conn, actionRoomId, ww)
                return
            }

            // Simulasi instan untuk testMode
            if (room.testMode && phase === "night") {
                room.player.filter((p) => p.id !== sender).forEach((p) => {
                    p.nightDone = true
                    p.lastNightAction = { type: "skip", label: "Simulasi" }
                })
            }

            // Cek apakah seluruh pemain hidup telah beraksi
            const progress = getNightProgress(room)
            if (progress.completed) {
                await resolveNightToMorning(conn, actionRoomId, ww)
            }
            return
        }

        await sendPrivateGroupText(conn, actionRoomId, sender, 'Aksi tidak dapat diproses. Pastikan giliranmu masih aktif dan gunakan tombol terbaru.')
        return
    }

    if (normalizedValue === 'shoot') {
        const hunterRoomId = target?.endsWith('@g.us') ? target : chat
        const room = ww[hunterRoomId]
        const hunter = room?.player?.find((player) => player.id === sender && player.pendingHunter)
        if (!room?.status || room.pendingHunter !== sender || !hunter) {
            return sendPrivateGroupText(conn, hunterRoomId, sender, 'Kamu tidak sedang memiliki kesempatan tembakan Hunter.')
        }
        const targetInput = target?.endsWith('@g.us') ? args[2] : target
        if (['skip', 'none', 'no', '0', 'tidak'].includes(String(targetInput || '').toLowerCase())) {
            await sendPrivateGroupText(conn, hunterRoomId, sender, '> 🏹 Kamu memilih tidak menembak siapa pun.')
            return finishHunterReaction(conn, hunterRoomId, room, hunter, null, ww)
        }
        const targetNumber = Number.parseInt(targetInput, 10)
        const targetPlayer = room.player.find((player) => player.number === targetNumber && !player.isdead && !player.isDummy)
        if (!targetPlayer || targetPlayer.id === sender) {
            return sendPrivateGroupText(conn, hunterRoomId, sender, `Target tidak valid. Gunakan tombol target atau *${gameCommandBase} shoot <nomor>*.`)
        }
        await sendPrivateGroupText(conn, hunterRoomId, sender, `> 🏹 Kode tembakan diterima. Target: *${getDisplayPlayerLabel(targetPlayer, conn)}*.`)
        return finishHunterReaction(conn, hunterRoomId, room, hunter, targetPlayer, ww)
    }

    if (gameCategory.id === 'custom' && value === 'list') {
        const room = ww[chat]
        if (room?.category !== 'custom' && room) {
            return m.reply(status.warning('Room yang sedang berjalan bukan mode Custom.'))
        }
        if (room?.status) {
            return m.reply(status.warning('Daftar role disembunyikan selama permainan berlangsung.'))
        }
        const assignmentMap = new Map(Object.entries(
            room?.customRoles || conn.werewolfCustomRoles?.[chat] || {}
        ))
        room?.player.filter((player) => !player.isDummy).forEach((player) => {
            assignmentMap.set(player.id, room.customRoles?.[player.id] || player.role || null)
        })
        const assignments = [...assignmentMap].map(([id, role], index) => ({ id, role, index }))
        const entries = assignments.map(({ id, role, index }) => {
            const player = room?.player.find((entry) => entry.id === id) || {
                id,
                number: index + 1,
                displayName: conn.getName(id)
            }
            return `> ${getPlayerMentionLabel(player, conn)} — *${role ? formatRoleTitle(role) : 'Belum diatur'}* ${roleEmojis[role] || ''}`
        })
        return conn.sendMessage(chat, {
            text: `*━━━〔 ✧ DAFTAR ROLE CUSTOM ✧ 〕━━━*\n\n${entries.join('\n') || '> Belum ada role yang diatur.'}\n\n> Lihat role pemain dengan *${gameCommandBase} list*.`,
            mentions: [...assignmentMap.keys()].filter((id) => !String(id).endsWith('@dummy'))
        })
    }

    if (gameCategory.id === 'custom' && value === 'autorole') {
        const room = ww[chat]
        if (!room || room.category !== 'custom') return m.reply(status.error('Buat room Custom terlebih dahulu dengan *.custom create*.'))
        if (room.status) return m.reply(status.warning('Role otomatis hanya bisa dibagikan sebelum game dimulai.'))
        if (room.owner !== sender && !hasRpgPanelAccess(sender)) {
            return m.reply(status.error('Hanya owner room atau moderator yang dapat membagikan role otomatis.'))
        }
        const playerCount = getRealPlayerCount(room)
        if (playerCount < 5 || playerCount > 15) {
            return m.reply(status.warning(`Role otomatis membutuhkan 5–15 pemain (saat ini: ${playerCount}).`))
        }
        if (!autoAssignCustomRoles(chat, ww)) {
            return m.reply(status.error('Role otomatis gagal dibagikan. Pastikan jumlah pemain dan room masih valid.'))
        }
        return m.reply(status.success(`Role otomatis selesai. Role yang sudah ditetapkan tidak diubah; hanya satu jenis antagonis utama yang digunakan. Cek dengan *${gameCommandBase} list*.`))
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
        const proposedRoles = Object.entries(customRoles)
            .filter(([id]) => id !== targetPlayerId)
            .map(([, role]) => role)
        proposedRoles.push(selectedRole)
        const validation = validateCustomRoles(proposedRoles)
        if (!validation.valid) {
            if (validation.reason === 'multiple-antagonists') {
                return m.reply(status.warning('Mode Custom hanya boleh memakai satu jenis antagonis utama. Hapus atau ganti role antagonis yang berbeda terlebih dahulu.'))
            }
            if (validation.reason === 'duplicate-role') {
                return m.reply(status.warning(`Role ${roleTitles[validation.role] || validation.role} hanya boleh diberikan kepada satu pemain.`))
            }
            return m.reply(status.warning('Kombinasi role Custom tidak valid.'))
        }
        customRoles[targetPlayerId] = selectedRole
        if (room) {
            const player = room.player.find((entry) => entry.id === targetPlayerId)
            if (player) player.role = selectedRole
        }
        const roleData = ROLE_DATA[selectedRole]
        const rolePlayer = room?.player.find((player) => player.id === targetPlayerId) || {
            id: targetPlayerId,
            number: 1,
            displayName: conn.getName(targetPlayerId)
        }
        return conn.sendMessage(chat, {
            text: status.success(`Role ${roleData.emoji} *${roleData.title}* berhasil ditetapkan untuk *${getPlayerMentionLabel(rolePlayer, conn)}* di mode Custom.`),
            mentions: [targetPlayerId]
        })

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
        const createCard = `*━━━〔 ${gameCategory.name.toUpperCase()} ROOM CREATED 〕━━━*
> 🏰 _Room ${gameCategory.name} telah dibuka untuk petualangan baru..._

*━━━〔 ✦ ɪɴꜰᴏ ʀᴏᴏᴍ 〕━━━*
> ⟡ Pemilik : *@${sender.split('@')[0]}*
> ⟡ Minimal : *𝟻 Pemain*
> ⟡ Maksimal : *𝟷𝟻 Pemain*
${wagerInfo}*━━━━━━━━━━━━━━*
${gameCategory.id === 'custom' ? `\n> 🎭 Atur role dengan *${gameCommandBase} role @pemain <role/nomor>*, bagikan otomatis dengan *${gameCommandBase} autorole*, atau cek dengan *${gameCommandBase} list*.` : ''}
━━━━━━━━━━━━━━
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
        if (getTotalPlayerCount(ww[chat]) >= 15) return m.reply(status.warning("Kapasitas room telah penuh (maksimal 15 pemain)."))
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

        let rosterText = ''
        ww[chat].player.forEach((p) => {
            rosterText += `> (${toSmallNum(p.number)}) ⟡ ${getPlayerMentionLabel(p, conn)}\n`
        })

        const totalPlayers = getTotalPlayerCount(ww[chat])
        const isReadyToStart = totalPlayers >= 5

        const joinCard = `*━━━〔 ${gameCategory.name.toUpperCase()} ROSTER 〕━━━*
> ⚔️ _Warga desa mulai berkumpul di balai pertemuan..._

*━━━〔 ✦ ᴅᴀꜰᴛᴀʀ ᴘᴇꜱᴇʀᴛᴀ (${toSmallNum(totalPlayers)}/𝟷𝟻) 〕━━━*
${rosterText.trim()}
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> 💰 Taruhan: *${ww[chat].wager > 0 ? `Rp ${ww[chat].wager.toLocaleString('id-ID')} ditahan sejak join` : 'Tanpa taruhan'}*
━━━━━━━━━━━━━━
> _Syarat bermain: Minimal 𝟻 pemain & maksimal 𝟷𝟻 pemain._`

        const joinButtons = []
        if (isReadyToStart) {
            joinButtons.push(['🚀 Mulai Game', `${ww[chat].commandBase || gameCommandBase} start`])
        }
        joinButtons.push(['⚔️ Gabung Lagi', `${ww[chat].commandBase || gameCommandBase} join`])

        await conn.sendButton(chat, joinCard, `Avelia • ${gameCategory.name} Game`, null, joinButtons, m, {
            contextInfo: { mentionedJid: getPlayerMentions(ww[chat].player) }
        })

    } else if (value === "add" && (target === "warga" || target === "dummy" || target === "dummies")) {
        if (!ww[chat]) return m.reply(status.error("Belum ada sesi permainan."))
        if (ww[chat].status === true) return m.reply(status.warning("Sesi permainan sudah dimulai."))
        const countInput = args[2]
        const requestedCount = Number(countInput)
        const hasCount = countInput !== undefined && /^\d+$/.test(String(countInput))
        const nameInput = args.slice(hasCount ? 3 : 2).join(' ').trim()
        const listedNames = !hasCount && nameInput
            ? nameInput.split(/[,;|]/).map((name) => name.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
            : []
        const addCount = listedNames.length > 1
            ? listedNames.length
            : hasCount && requestedCount > 0 ? requestedCount : 1
        const nickname = hasCount ? nameInput : listedNames.length === 1 ? listedNames[0] : ''
        if (getTotalPlayerCount(ww[chat]) + addCount > 15) {
            return m.reply(status.warning("Kapasitas room maksimal 15 pemain. Kurangi jumlah warga AI yang ditambahkan."))
        }
        const totalBefore = ww[chat].player.length
        for (let i = 0; i < addCount; i++) {
            const order = totalBefore + i + 1
            const displayName = listedNames.length > 1
                ? listedNames[i]
                : nickname ? (hasCount && addCount > 1 ? `${nickname} ${i + 1}` : nickname) : undefined
            ww[chat].player.push(createWargaPlayer(ww[chat], order, displayName))
        }
        ww[chat].player.forEach((player, index) => {
            player.number = index + 1
        })
        const addedNames = listedNames.length > 1 ? ` Nama: ${listedNames.join(', ')}.` : nickname ? ` Nama julukan: ${nickname}.` : ''
        m.reply(status.success(`Berhasil menambahkan ${toSmallNum(addCount)} warga AI ke room.${addedNames}`))

    } else if (value === "del" && (target === "warga" || target === "dummy" || target === "dummies")) {
        if (!ww[chat]) return m.reply(status.error("Belum ada sesi permainan."))
        const wargaPlayers = ww[chat].player.filter((player) => player.isAiCitizen || player.isDummy)
        if (!wargaPlayers.length) return m.reply(status.warning("Tidak ada warga simulasi di room ini."))
        ww[chat].player = ww[chat].player.filter((player) => !player.isAiCitizen && !player.isDummy)
        ww[chat].player.forEach((player, index) => {
            player.number = index + 1
        })
        m.reply(status.success(`Berhasil menghapus ${toSmallNum(wargaPlayers.length)} warga simulasi.`))

    } else if (value === "start") {
        if (!ww[chat]) return m.reply(status.error("Belum ada sesi permainan."))
        if (args[1] !== undefined) return m.reply(status.warning(`Taruhan ditentukan saat membuat room. Gunakan *${gameCommandBase} create <taruhan>*; tanpa taruhan cukup *${gameCommandBase} create*.`))
        if (getRealPlayerCount(ww[chat]) < 1) return m.reply(status.error("Minimal 1 pemain asli untuk memulai game."))
        if (getTotalPlayerCount(ww[chat]) < 5) return m.reply(status.warning(`Pemain belum mencukupi! Minimal 𝟻 pemain (saat ini: ${toSmallNum(getTotalPlayerCount(ww[chat]))}). Gunakan *${gameCommandBase} add warga* jika ingin menambah warga AI.`))
        if (ww[chat].status === true) return m.reply(status.warning("Permainan sudah berjalan."))
        if (ww[chat].owner !== sender && !hasRpgPanelAccess(sender)) {
            return conn.sendMessage(chat, {
                text: status.error(`Hanya owner room (@${ww[chat].owner.split('@')[0]}) yang dapat memulai permainan.`),
                mentions: [ww[chat].owner]
            })
        }

        const wager = ww[chat].wager === undefined ? 0 : Number(ww[chat].wager)
        if (ww[chat].testMode && wager > 0) return m.reply(status.warning("Taruhan tidak tersedia dalam mode test."))
        const wagerPlayers = ww[chat].player.filter((player) => !player.isDummy && !player.isAiCitizen)
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
                !player.isDummy && !player.isAiCitizen && !validRoleName(ww[chat].customRoles?.[player.id] || player.role)
            )
            if (unassignedPlayers.length) {
                const names = unassignedPlayers.map(getDisplayPlayerLabel).join(', ')
                return m.reply(status.warning(`Role custom belum diatur untuk: ${names}.\nAtur dengan *${gameCommandBase} role @pemain <role/nomor>* sebelum memulai.`))
            }
            const customRoles = ww[chat].player.filter((player) => !player.isDummy && !player.isAiCitizen)
                .map((player) => ww[chat].customRoles?.[player.id] || player.role)
            const validation = validateCustomRoles(customRoles, { requireAntagonist: true })
            if (!validation.valid) {
                const reason = validation.reason === 'multiple-antagonists'
                    ? 'Hanya boleh ada satu jenis antagonis utama dalam satu game Custom.'
                    : validation.reason === 'duplicate-role'
                        ? `Role ${roleTitles[validation.role] || validation.role} hanya boleh dimiliki satu pemain.`
                        : validation.reason === 'missing-antagonist'
                            ? 'Tetapkan minimal satu antagonis utama (Werewolf/Mafia/Killer/Assassin/Impostor/Alien).'
                            : 'Kombinasi role Custom tidak valid.'
                return m.reply(status.warning(reason))
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
        return sendPrivateGroupText(
            conn,
            chat,
            sender,
            voter.isvote
                ? '> ⚠️ Kamu sudah memberikan suara pada sidang hari ini.'
                : '> 🔐 Gunakan tombol kode voting rahasia yang dikirim khusus untukmu. Vote dengan nomor tidak lagi digunakan agar pilihanmu tetap rahasia.'
        )

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
                const title = formatRoleTitle(player.role)
                return `> (${toSmallNum(player.number)}) ${getPlayerMentionLabel(player, conn)} — *${title}*`
            }).join('\n')
            try {
                await conn.sendMessage(chat, {
                    image: { url: thumbExecution },
                    caption: `*━━━〔 ✧ ROOM ${roomGame.name.toUpperCase()} DIHAPUS ✧ 〕━━━*\n\nPermainan dihentikan oleh owner room. Berikut role yang dibagikan:\n\n${roster}${refundNotice}`,
                    mentions: getPlayerMentions(players)
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

    } else if (["player", "room", "lobby"].includes(value)) {
        if (!ww[chat]) return m.reply(status.warning(`Tidak ada sesi permainan ${gameCategory.name} aktif.`))
        const game = getGameCategory(ww[chat].category)
        let text = `*━━━〔 ${game.name.toUpperCase()} ROOM 〕━━━*\n> 📋 _Daftar status pemain saat ini:_\n\n*━━━〔 ✦ STATUS PEMAIN 〕━━━*\n`
        ww[chat].player.forEach((p, index) => {
            p.number = index + 1
            const pLabel = getPlayerMentionLabel(p, conn)
            const playerStatus = p.isdead ? '🔴' : '🟢'
            text += `> (${toSmallNum(p.number)}) ${pLabel} ${playerStatus}\n`
        })
        text += `*━━━━━━━━━━━━━━*\n\n🟢 Hidup  ·  🔴 Mati\n> _Pemain gugur tidak dapat beraksi._`

        await conn.sendMessage(chat, {
            image: { url: thumbNight },
            caption: text.trim(),
            mentions: getPlayerMentions(ww[chat].player)
        })

    } else if (value === "info") {
        const game = getGameCategory(ww[chat]?.category === gameCategory.id ? ww[chat].category : gameCategory.id)
        const infoText = `*━━━〔 ${game.name.toUpperCase()} GAME INFO 〕━━━*
> ${game.antagonistEmoji} _Permainan deduksi sosial, strategi, dan intrik._

*━━━〔 ✦ ꜱɪꜱᴛᴇᴍ 𝟷𝟶𝟶% ɪɴ-ɢʀᴏᴜᴘ 〕━━━*
> ⟡ Kartu role dan tombol malam dikirim di grup melalui dual-stanza, tanpa reply.
> ⟡ Hanya pemain yang bersangkutan dapat melihat aksi dan hasil pribadi.
> ⟡ Voting dan hasil permainan tetap ditampilkan di grup.
*━━━━━━━━━━━━━━*

*━━━〔 ✦ ᴀʟᴜʀ ᴘᴇʀᴍᴀɪɴᴀɴ 〕━━━*
> 🌙 *Malam*: Pemain hidup memilih aksi rahasia lewat tombol.
> ☀️ *Fajar*: Pengumuman korban dan hasil perlindungan.
> ⚖️ *Siang*: Diskusi dan voting untuk mencari ${game.antagonistName}.
> 🔁 Siklus berulang hingga salah satu pihak menang.
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> _Ketik *${gameCommandBase} guide* untuk panduan lengkap atau *${gameCommandBase} role* untuk daftar peran._`
        m.reply(infoText)

    } else if (value === "guide") {
        const game = getGameCategory(ww[chat]?.category === gameCategory.id ? ww[chat].category : gameCategory.id)
        const guideText = `*━━━〔 ✧ PANDUAN ${game.name.toUpperCase()} ✧ 〕━━━*
> 📖 _Langkah-langkah memulai dan memainkan ${game.name}:_

*━━━〔 ✦ 𝟷. ᴍᴇᴍʙᴜᴀᴛ ʀᴏᴏᴍ 〕━━━*
> Ketik *${gameCommandBase} create* untuk tanpa taruhan, atau *${gameCommandBase} create <taruhan>* (contoh: *${gameCommandBase} create 1jt*).
${game.id === 'custom' ? `> Atur role dengan *${gameCommandBase} role @pemain <role/nomor>*, bagikan otomatis dengan *${gameCommandBase} autorole*, dan cek dengan *${gameCommandBase} list*.` : ''}
> Pemain lain ketik *${gameCommandBase} join* (Minimal 𝟻, Maksimal 𝟷𝟻).
*━━━━━━━━━━━━━━*

*━━━〔 ✦ 𝟸. ᴍᴇᴍᴜʟᴀɪ ɢᴀᴍᴇ 〕━━━*
> Owner room mengetik *${gameCommandBase} start*.
> Bot otomatis mengirimkan pesan terenkripsi ke grup.
> Hanya kamu yang bisa melihat role & tombol tokomu!
> Jika room memakai taruhan, saldo dicek dan taruhan ditahan langsung saat join. Keluar dari room membuat taruhan tetap di pot; menghapus room mengembalikan taruhan.
> Tim pemenang membagi pot; Cipher yang masih hidup ikut menang dan mendapat bagian. Jester yang menang mengambil seluruh pot. Jika Jester kalah, taruhannya dikembalikan.
*━━━━━━━━━━━━━━*

*━━━〔 ✦ 𝟹. ꜰᴀꜱᴇ ᴍᴀʟᴀᴍ 〕━━━*
> Tekan salah satu tombol aksi di bawah gelembung pesanmu.
> Chat tombol otomatis disamarkan agar rahasiamu aman.
*━━━━━━━━━━━━━━*

*━━━〔 ✦ 𝟺. ꜰᴀꜱᴇ ᴠᴏᴛɪɴɢ 〕━━━*
> Gunakan tombol kode voting rahasia yang dikirim khusus untukmu.
> Suara terbanyak akan dieksekusi di balai desa.
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> _Jaga kerahasiaan identitasmu dan bawa timmu menuju kemenangan!_`
        m.reply(guideText)

    } else if (value === "role") {
        const game = getGameCategory(ww[chat]?.category === gameCategory.id ? ww[chat].category : gameCategory.id)
        if (target) {
            const selectedRole = resolveRoleChoice(args.slice(1).join(' '))
            if (!selectedRole) return m.reply(status.warning('Role tidak ditemukan. Gunakan nama role yang tercantum di daftar role.'))
            const details = formatRoleDetails(selectedRole, game)
            return m.reply(`*━━━〔 ✦ DETAIL ROLE ${formatRoleTitle(selectedRole).toUpperCase()} ✦ 〕━━━*\n\n${details}`)
        }
        const roleSections = Object.entries(ROLE_DATA)
            .map(([role, data]) => {
                const roleName = role === game.antagonist ? game.antagonistName : data.title
                return `> ${data.emoji} *${roleName}* — ${getRoleShortEffect(role, game)}`
            })
            .join('\n')
        m.reply(`*━━━〔 ✦ ROLE & EFEK ${game.name.toUpperCase()} ✦ 〕━━━*\n\n${roleSections}\n\n> Detail karakter: *${gameCommandBase} role <nama role>*. Contoh: *${gameCommandBase} role seer*.`)

    } else if (isGameRolesCommand) {
        return sendGameRolesMenu(conn, chat, usedPrefix, m)
    } else {
        const menuText = `*━━━〔 ${gameCategory.name.toUpperCase()} COMMANDS 〕━━━*
> ${gameCategory.antagonistEmoji} _Perintah yang tersedia untuk permainan ${gameCategory.name}:_

*━━━〔 ✦ ᴄᴏᴍᴍᴀɴᴅ ᴜᴛᴀᴍᴀ 〕━━━*
> ⟡ *${gameCommandBase} create [taruhan]* : Buat room (contoh taruhan: 1jt)
> ⟡ *${gameCommandBase} join* : Gabung ke room
> ⟡ *${gameCommandBase} start* : Mulai game (Owner)
> ⟡ *${gameCommandBase} room* : Lihat daftar pemain & status (alias: lobby/player)
> ⟡ *${gameCommandBase} exit* : Keluar sebelum mulai (taruhan hangus)
> ⟡ *${gameCommandBase} delete* : Hapus room (taruhan dikembalikan)
*━━━━━━━━━━━━━━*

*━━━〔 ✦ ɪɴꜰᴏʀᴍᴀꜱɪ & ʙᴀɴᴛᴜᴀɴ 〕━━━*
> ⟡ *${gameCommandBase} info* : Ringkasan sistem in-group
> ⟡ *${gameCommandBase} guide* : Panduan cara bermain
> ⟡ *${gameCommandBase} role* : Daftar lengkap peran
> ⟡ *${gameCommandBase} add warga <n> [julukan]* : Tambah warga AI dengan jumlah
> ⟡ *${gameCommandBase} add warga <nama1, nama2>* : Tambah beberapa warga AI dengan julukan
> ⟡ *${gameCommandBase} del warga* : Hapus semua warga AI
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> _Permainan berlangsung di grup; detail aksi rahasia dikirim privat kepada pemainnya._`
        m.reply(menuText)
    }
}

handler.help = ['ww', 'mafia', 'killer', 'assassin', 'impostor', 'alien', 'parasite', 'custom', 'gr', 'rg']
handler.tags = ['game']
handler.command = [...new Set([
    'gr',
    'rg',
    'gameroles',
    ...Object.values(GAME_CATEGORIES).flatMap((category) => category.aliases)
])]
handler.group = true

export default handler