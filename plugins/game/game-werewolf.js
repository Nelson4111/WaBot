import fs from 'node:fs'
import {
    emoji_role,
    sesi,
    playerOnGame,
    playerOnRoom,
    playerExit,
    dataPlayer,
    getPlayerById,
    killww,
    collapseZombieVampireInfections,
    roleGenerator,
    roleAmount,
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
    recordGameActivity,
    refundWerewolfWager,
    clearAll,
    clearAllSTATUS,
    shortPlayer,
    resetVote,
    voteKill,
    changeDay,
    pagii
} from '../../lib/werewolf.js'
import { toSmallNum, status } from '../../lib/style.js'
import { buildGameRolesHeaderMessage, sendGameRolesHeader } from '../../lib/game-roles-message.js'
import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { compareRpgMoney, subtractRpgMoney } from '../../lib/rpgMoney.js'
import { CIPHER_AI_MESSAGES, CUSTOM_ANTAGONIST_ROLES, encodeCipherMessage, GAME_CATEGORIES, GHOST_AI_MESSAGES, ROLE_DATA, ROLE_GUIDES, WARGA_AI_MESSAGES, isValidCipherMessage, validateCustomRoles, getGameCategory, getRoleFaction, getRoleImage, getRoleImagePaths, getSceneImage, getSceneImagePaths, isAntagonistRole, normalizeGameCategory } from '../../lib/werewolfData.js'
import { getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'
import { sendDualGroupMessage, sendMultiParticipantGroupStanza } from '../../lib/dual-group-message.js'

const thumbNight = getSceneImage('aksi-malam')
const thumbMorning = getSceneImage('fajar')
const thumbVoting = getSceneImage('vote')
const thumbExecution = getSceneImage('eksekusi benar')
const sendGameThumbnail = sendGameRolesHeader
const sendGameRolesMenu = (conn, chat, usedPrefix, m) => {
    const menuText = `*━━━〔 🎭 GAME ROLES 〕━━━*

> Game Roles adalah permainan deduksi sosial di grup. Setiap pemain mendapat identitas rahasia dengan kemampuan berbeda. Di antara kalian ada Villain yang menyamar; cari tahu siapa mereka sebelum terlambat.

*🌙 MALAM*
> Pemain menjalankan kemampuan role secara rahasia. Villain memilih target, sementara role lain bisa menyelidiki, melindungi, atau memakai kemampuan khusus.

*☀️ SIANG*
> Semua pemain berdiskusi lalu voting untuk menentukan siapa yang akan dieksekusi. Role yang gugur akan terungkap.

*🏆 TUJUAN PERMAINAN*
> Citizen menang dengan menemukan semua Villain. Villain menang saat jumlah mereka menyamai atau melebihi Citizen. Beberapa role punya kondisi kemenangan sendiri.

*🕹️ MULAI BERMAIN*
> Pilih game dan role lewat tombol di bawah untuk melihat pilihan serta panduannya. Permainan berlangsung di grup bersama pemain lain.

*━━━━━━━━━━━━━━*
> Pilih tombol di bawah untuk menjelajahi game dan role yang tersedia.`
    const menuButtons = [
        ['🎮 Daftar Game', `${usedPrefix}gr list`],
        ['🎭 Daftar Role', `${usedPrefix}gr role`],
        ['📖 Panduan Bermain', `${usedPrefix}gr guide`]
    ]
    return sendGameThumbnail(conn, chat, menuText, thumbNight, m, {
        buttons: menuButtons,
        title: 'GAME ROLES'
    })
}

const roleEmojis = Object.fromEntries(Object.entries(ROLE_DATA).map(([role, data]) => [role, data.emoji]))
const roleTitles = Object.fromEntries(Object.entries(ROLE_DATA).map(([role, data]) => [
    role,
    data.title
]))
const roleEffects = Object.fromEntries(Object.entries(ROLE_DATA).map(([role, data]) => [role, data.effect]))
const formatRoleTitle = (role) => roleTitles[role] || String(role || 'Warga').toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase())

const getPhaseParticipantName = (game) => {
    if (game?.id === 'vigilante') return 'Para Villain'
    if (game?.id === 'impostor' || game?.id === 'alien') return 'Para Crewmate'
    return game?.protagonistName ? `Para ${game.protagonistName}` : 'Para warga'
}

const getPhaseSedentaryName = (game) => {
    if (game?.id === 'vigilante') return 'markas rahasia'
    if (game?.id === 'impostor' || game?.id === 'alien') return 'kabin pesawat'
    if (game?.id === 'mayhem') return 'tempat persembunyian masing-masing'
    return 'kediaman masing-masing'
}

const getPlayerRolePresentation = (player, category) => {
    const infectedType = player?.infectionType && ['zombie', 'vampire'].includes(player.infectionType)
        ? player.infectionType
        : null
    const isInfected = Boolean(infectedType && (['zombie', 'vampire'].includes(category) || ['mayhem', 'custom', 'vigilante'].includes(category)))
    const originalRole = isInfected ? player?.infectionOriginalRole || player?.role : player?.role
    const role = originalRole || 'warga'
    return {
        title: isInfected ? `${formatRoleTitle(role)} (Infected)` : formatRoleTitle(role),
        emoji: isInfected
            ? ({ zombie: '☣️', vampire: '🩸' }[infectedType] || roleEmojis[role] || '🎭')
            : (roleEmojis[role] || '🎭')
    }
}

const getRoleShortEffect = (role, game) => {
    if (isAntagonistRole(game.id, role)) {
        if (role === game.id && ['zombie', 'vampire'].includes(game.id)) {
            return `Tularkan ${game.name} kepada satu pemain hidup setiap malam. Pemain yang tertular tetap hidup dan bisa voting, tetapi pada malam hari hanya dapat bersembunyi.`
        }
        return ['werewolf', 'mafia'].includes(role) && !['mayhem', 'vigilante'].includes(game.id)
            ? `Pilih satu korban tiap malam bersama kelompok ${game.antagonistName}.`
            : `Pilih satu pemain hidup untuk diserang tiap malam; Villain bergerak sendiri.`
    }
    const shortEffects = {
        warga: 'Ikut voting untuk menentukan pemain yang dieksekusi.',
        seer: 'Sekali per game, periksa role satu pemain pada malam hari.',
        guardian: 'Sekali per game, lindungi satu pemain dari serangan Villain malam hari.',
        sorcerer: 'Tiap malam, racuni satu pemain, bangkitkan pemain mati, atau lewati.',
        hunter: 'Saat gugur, tembak satu pemain hidup sebelum fase berlanjut.',
        mayor: 'Suara voting bernilai dua.',
        jester: 'Menang sendiri jika dieksekusi melalui voting.',
        warden: 'Armor menahan satu serangan Villain malam hari; voting tetap dapat mengeksekusinya.',
        cipher: 'Menang bersama tim yang menang jika masih hidup; wajib bicara dengan sandi angka.',
        fixer: 'Menang sendiri jika target kontrak gugur saat Fixer masih hidup.',
        vigilante: game.id === 'mayhem'
            ? 'Citizen independen; pilih satu pemain untuk ditangkap setiap malam.'
            : 'Tangkap Villain tiap malam; para Vigilante menang jika seluruh Villain tertangkap atau gugur.',
        ghost: 'Saat masih hidup, rasuki satu pemain agar tidak dapat voting pada ronde berikutnya.'
    }
    return shortEffects[role] || roleEffects[role] || 'Tidak memiliki aksi khusus.'
}

const formatRoleDetails = (role, game) => {
    const data = ROLE_DATA[role]
    if (!data) return null
    const title = role === game.antagonist ? game.antagonistName : data.title
    const effect = role === 'vigilante' && game.id === 'mayhem'
        ? 'Pilih satu pemain hidup untuk ditangkap setiap malam; tetap berpihak kepada Citizen dan menang jika Citizen menang.'
        : role === 'vigilante' && game.id === 'vigilante'
            ? 'Pilih satu Villain hidup untuk ditangkap setiap malam. Jumlah Vigilante maksimal 4, bergantung pada jumlah peserta.'
            : ['mayhem', 'vigilante'].includes(game.id) && isAntagonistRole(game.id, role)
            ? 'Pilih satu pemain hidup untuk diserang setiap malam. Setiap Villain bertindak sendiri dan dapat menyerang Villain lain.'
            : role === game.id && ['zombie', 'vampire'].includes(game.id)
                ? `Tularkan ${game.name} kepada satu pemain hidup pada malam hari. Yang tertular tetap hidup dan bisa voting, tetapi kemampuan role lamanya dinonaktifkan dan ia hanya dapat bersembunyi saat malam. Kemenangan ditentukan ketika jumlah ${game.name} menyamai atau melebihi pemain lain.`
                : role !== game.id && ['zombie', 'vampire'].includes(role) && game.id === 'custom'
                    ? 'Dalam mode Custom, pilih satu pemain hidup untuk diserang setiap malam seperti Villain lain.'
                : roleEffects[role]
    const details = [
        `*${data.emoji} ${title}*`,
        `> ${data.description}`,
        `> *Efek dalam game:* ${effect}`
    ]
    if (role === 'sorcerer') {
        details.push('> Jika ada Villain lain, racun membuat Sorcerer berpihak kepada Villain, revive membuatnya berpihak kepada Citizen, dan melewati aksi membuatnya tetap netral.')
    }
    if (role === 'vigilante') {
        details.push(game.id === 'mayhem'
            ? '> Pada mode Mayhem, Vigilante tetap berpihak kepada Citizen tetapi tidak mengetahui siapa Villain-nya; pilih pemain yang dicurigai untuk ditangkap.'
            : '> Jumlah Vigilante maksimal 4. Para Vigilante menang jika seluruh Villain tertangkap atau gugur; Villain menang jika semua Vigilante gugur.')
    }
    if (role === 'ghost') {
        details.push('> Saat hidup, Ghost dapat merasuki pemain yang belum pernah dirasuki agar pemain itu tidak dapat voting pada ronde berikutnya. Setelah mati, Ghost hanya dapat mengirim pesan.')
    }
    if (role === 'cipher') {
        details.push('> Sandi huruf: A=4, I=1, E=3, O=0, B=8, L=7, S=5, Q=9, G=6. Pesan biasa harus mengandung angka dan tidak boleh memuat huruf-huruf tersebut.')
    }
    return details.join('\n\n')
}

const formatRoleGuide = (role, game, usedPrefix) => {
    const guide = ROLE_GUIDES[role] || []
    const details = guide.map((paragraph) => `> ${paragraph}`)
    details.push(
        `> Game yang sedang dipilih: *${game.name}*. Efek dan target yang tersedia mengikuti mode ini serta kartu aksi yang kamu terima.`,
        '> Baca kartu yang dikirim khusus kepadamu pada setiap fase. Jika role-mu memiliki aksi, gunakan tombol/kode rahasia yang tersedia; jangan bagikan kode aksi di chat umum.',
        `> Untuk melihat ringkasan efek role ini, ketik *${usedPrefix}gr role ${role}*.`
    )

    if (role === 'vigilante' && game.id === 'mayhem') {
        details.push('> Pada Mayhem, Vigilante tetap anggota Citizen; tugasnya menangkap pemain yang dicurigai, bukan mencari satu jenis Villain tertentu.')
    } else if (role === 'vigilante' && game.id !== 'vigilante') {
        details.push('> Aturan jumlah Vigilante dan kemenangan menangkap semua Villain berlaku khusus pada kategori Vigilante. Di kategori lain, ikuti kondisi faksi pada kartu game.')
    }

    if (role === 'cipher') {
        details.push(`> Contoh command panduan ini: *${usedPrefix}gr role cipher guide*.`)
    }

    return `*━━━〔 📖 PANDUAN ${formatRoleTitle(role).toUpperCase()} 〕━━━*\n\n${details.join('\n\n')}`
}

const validRoleName = (value) => {
    const role = String(value || '').toLowerCase()
    return Object.hasOwn(ROLE_DATA, role) ? role : null
}

const normalizeRoleFactionFilter = (value) => {
    const filter = String(value || '').trim().toLowerCase()
    if (['villain', 'antagonis', 'antagonist', 'antagonists'].includes(filter)) return 'antagonist'
    if (['citizen', 'protagonis', 'protagonist', 'protagonists'].includes(filter)) return 'protagonist'
    if (['netral', 'neutral', 'neutrals'].includes(filter)) return 'neutral'
    return null
}

const formatRoleList = (game, factionFilter = null) => {
    return Object.entries(ROLE_DATA)
        .map(([role, data], index) => ({ role, data, index }))
        .filter(({ role }) => !factionFilter || getRoleFaction(role) === factionFilter)
        .map(({ role, data, index }) => {
            const roleName = role === game.antagonist ? game.antagonistName : data.title
            return `> *${index + 1}.* ${data.emoji} *${roleName}* — ${getRoleShortEffect(role, game)}`
        })
        .join('\n\n')
}

const formatGameCategoryInfo = (game, usedPrefix) => {
    let objective
    if (game.id === 'vigilante') {
        objective = 'Para Vigilante menang jika seluruh Villain tertangkap; Villain menang jika semua Vigilante gugur.'
    } else if (['zombie', 'vampire'].includes(game.id)) {
        objective = `${game.antagonistName} menang jika semua pemain hidup selain ${game.antagonistName} asli sudah tertular. Jika seluruh ${game.antagonistName} asli tersingkir, pemain tertular ikut gugur dan Citizen menang.`
    } else if (game.id === 'mayhem') {
        objective = 'Beragam Villain dapat muncul dan menyerang sendiri, termasuk satu sama lain; Villain lain tidak diketahui. Tiap tim mengikuti kondisi menang faksinya.'
    } else if (game.id === 'custom') {
        objective = 'Pemain memakai role yang ditentukan untuk room. Kondisi menang mengikuti faksi dan kemampuan role yang dipilih.'
    } else {
        objective = `Citizen berusaha menemukan semua ${game.antagonistName}; Villain menang saat jumlahnya menyamai atau melebihi Citizen.`
    }
    return `*━━━〔 ${game.antagonistEmoji} INFO ${game.name.toUpperCase()} 〕━━━*

> ${game.description}
> Lokasi permainan: *${game.location}*.

*━━━〔 ✦ TUJUAN PERMAINAN 〕━━━*
> ${objective}
> Role netral dapat memiliki kondisi kemenangan tersendiri.

*━━━〔 ✦ ALUR SINGKAT 〕━━━*
> 🌙 Malam: pemain menjalankan aksi sesuai role.
> ☀️ Siang: pemain berdiskusi dan melakukan voting.
> 📜 Riwayat aktivitas dapat dilihat dengan *${usedPrefix}${game.aliases[0]} log*.

> Buat room: *${usedPrefix}${game.aliases[0]} create [taruhan]*`
}

const getGameCategoryImage = (game) => {
    const role = game.id === 'vigilante'
        ? 'vigilante'
        : game.id === 'mayhem'
            ? 'ghost'
            : game.id === 'custom'
                ? 'warga'
                : game.antagonist
    return getRoleImage(role, game.location) || thumbNight
}

const buildGameCategoryList = (usedPrefix, requestedPage = 1) => {
    const categories = Object.values(GAME_CATEGORIES)
    const pageSize = 4
    const pageCount = Math.max(1, Math.ceil(categories.length / pageSize))
    const page = Math.min(pageCount, Math.max(1, Number.parseInt(requestedPage, 10) || 1))
    const entries = categories.slice((page - 1) * pageSize, page * pageSize)
        .map((game, index) => {
            const number = (page - 1) * pageSize + index + 1
            return `*${String(number).padStart(2, '0')} · ${game.antagonistEmoji} ${game.name}*\n> ${game.description}\n> 📍 ${game.location}  ·  📖 *${usedPrefix}gr info ${game.id}*\n> 🚪 Buat room: *${usedPrefix}${game.aliases[0]} create*`
        })
    const text = `*━━━〔 🎮 PILIH GAME · ${page}/${pageCount} 〕━━━*\n\n${entries.join('\n\n━━━━━━━━━━━━━━\n\n')}\n\n━━━━━━━━━━━━━━\n> Buka detail kategori atau langsung buat room dengan command yang tertera.`
    const buttons = []
    if (page > 1) buttons.push(['⬅️ Sebelumnya', `${usedPrefix}gr list ${page - 1}`])
    if (page < pageCount) buttons.push(['Selanjutnya ➡️', `${usedPrefix}gr list ${page + 1}`])
    buttons.push(['🎭 Daftar Role', `${usedPrefix}gr role`])
    buttons.push(['🏠 Menu Utama', `${usedPrefix}gr`])
    return { text, buttons, page, pageCount }
}

const roleFactionButtons = (gameCommandBase) => [
    ['🔴 Villain', `${gameCommandBase} role villain`],
    ['🔵 Citizen', `${gameCommandBase} role citizen`],
    ['🟡 Netral', `${gameCommandBase} role netral`]
]

const resolveRoleChoice = (value) => {
    const input = String(value || '').trim()
    const resolveSingleChoice = (choice) => {
        if (/^\d+$/.test(choice)) return Object.keys(ROLE_DATA)[Number(choice) - 1] || null
        const normalized = choice.toLowerCase().replace(/[^a-z0-9]/g, '')
        return Object.entries(ROLE_DATA).find(([role, data]) =>
            role.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized ||
            data.title.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
        )?.[0] || null
    }

    const parts = input.split('/').map((part) => part.trim()).filter(Boolean)
    for (const part of parts) {
        const resolved = resolveSingleChoice(part)
        if (resolved) return resolved
    }
    return resolveSingleChoice(input.replace(/\/+/g, '').trim())
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

const getAiDiscussionMessage = (room, player, conn, eligibleTargetNumbers = null) => {
    const isCipher = player.role === 'cipher' && !player.infectionType
    const roleMessages = isCipher
        ? CIPHER_AI_MESSAGES
        : player.role === 'ghost'
            ? GHOST_AI_MESSAGES
            : null
    if (roleMessages) {
        const targets = room.player.filter((entry) =>
            entry.id !== player.id && !entry.isDummy && !entry.isdead
        ).filter((entry) =>
            !Array.isArray(eligibleTargetNumbers) || eligibleTargetNumbers.includes(Number(entry.number))
        )
        const useTargetMessage = targets.length > 0 && Math.random() < 0.5
        const template = getRandomItem(useTargetMessage ? roleMessages.target : roleMessages.general)
        const targetName = useTargetMessage
            ? getDisplayPlayerLabel(getRandomItem(targets), conn)
            : null
        const encodedTargetName = isCipher && targetName
            ? encodeCipherMessage(targetName).replace(/^[A-Z]/, (letter) => letter.toLowerCase())
            : targetName
        const formattedMessage = useTargetMessage
            ? template.replace('{target}', encodedTargetName)
            : template
        if (isCipher && !isValidCipherMessage(formattedMessage)) {
            throw new Error(`Invalid Cipher AI message: ${formattedMessage}`)
        }
        return formattedMessage
    }

    const message = getRandomItem(WARGA_AI_MESSAGES)
    if (!message?.includes('{target}')) return message
    const targets = room.player.filter((entry) => entry.id !== player.id && !entry.isDummy)
        .filter((entry) => !entry.isdead)
        .filter((entry) =>
            !Array.isArray(eligibleTargetNumbers) || eligibleTargetNumbers.includes(Number(entry.number))
        )
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
        infect: `Tularkan wabah kepada ${targetName || 'target'}`,
        capture: `Tangkap ${targetName || 'target'}`,
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
        p.voteBlockedThisRound = false
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
        const role = p.infectionType === room.category ? p.infectionType : p.role || 'warga'
        const rEmoji = roleEmojis[role] || '🎭'
        const rTitle = getPlayerRolePresentation(p, room.category).title
        const rEffect = p.infectionType === room.category
            ? `Kamu telah tertular dan menjadi ${game.name}. Kemampuan role sebelumnya tidak berlaku; pada malam hari kamu hanya dapat bersembunyi. Kamu tetap dapat memberikan suara.`
            : getRoleShortEffect(role, game)

        const secretCodes = p.secretCodes || {}
        const actionRows = Object.entries(secretCodes).map(([code, choice]) => ({
            title: `🔐 ${code}`,
            description: describeNightChoice(code, choice, room, conn).replace(/^> 🔒 \*[^*]+\* — /, ''),
            id: `${room.commandBase || '.ww'} action ${chat} ${code}`
        }))
        const cipherAntagonists = role === 'cipher' && room.category !== 'mayhem'
            ? room.player.filter((player) => !player.isdead && !player.isDummy && isAntagonistRole(room.category, player.role))
            : []
        const cipherIntro = role === 'cipher' && room.category !== 'mayhem' && !p.cipherIntroSent
            ? `\n\n*━━━〔 🔎 ɪᴅᴇɴᴛɪᴛᴀꜱ VILLAIN 〕━━━*\n${cipherAntagonists.length
                ? cipherAntagonists.map((player) => `> (${toSmallNum(player.number)}) ${getPlayerMentionLabel(player, conn)} — ${formatRoleTitle(player.role)}`).join('\n')
                : '> Tidak ada Villain yang ditugaskan di room ini.'}`
            : ''
        if (role === 'cipher' && room.category !== 'mayhem' && !p.cipherIntroSent) cipherIntroPlayers.push(p)
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
> 🌙 _Malam tiba di ${game.location}..._

*━━━〔 ${rEmoji} ʀᴏʟᴇ: ${rTitle} 〕━━━*
> ⟡ Pemain : *${getDisplayPlayerLabel(p, conn)}*
> ⟡ Nomor : *${toSmallNum(p.number)}*
> ⟡ Efek : *${rEffect}*
*━━━━━━━━━━━━━━*

*━━━〔 🔐 ᴋᴏᴅᴇ ᴀᴋsɪ ʀᴀʜᴀsɪᴀ 〕━━━*
> Pilih aksi melalui daftar tombol di bawah.
${cipherIntro}
${fixerContract}
*━━━━━━━━━━━━━━*

*━━━〔 ✦ ɪɴꜱᴛʀᴜᴋꜱɪ ᴀᴋsɪ 〕━━━*
> ⟡ Tekan daftar 🔐 di bawah, lalu pilih aksi dan target yang sesuai.
> ⟡ Kode dan artinya hanya terlihat olehmu.
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> 🔒 _Pilihanmu menentukan keselamatan ${game.protagonistName || 'pemain'} saat fajar._`

        const roleImage = getRoleImage(role, game.location)
        const privateMentions = [...cipherAntagonists, ...(fixerTarget ? [fixerTarget] : [])]
        const built = await buildGameRolesHeaderMessage(conn, chat, bodyCard, roleImage, {
            title: `${game.name} • ${rTitle}`,
            subtitle: 'Secret Night Phase',
            footer: `Avelia • ${game.name} Secret Night Phase`,
            mentions: getPlayerMentions(privateMentions),
            listButton: {
                id: 'game_roles_night_action',
                label: '🔐 Pilih Aksi Malam',
                title: 'PILIH AKSI MALAM',
                sections: [{
                    title: 'Aksi yang tersedia',
                    rows: actionRows.map((action) => ({
                        title: action.title,
                        description: action.description,
                        id: action.id
                    }))
                }]
            }
        })
        playerMessages.set(p.id, built.message)
    }

    const spectatorText = `*━━━〔 ${game.name.toUpperCase()} · FASE MALAM 〕━━━*
> 🌙 _Bulan purnama bersinar terang di atas ${game.location}..._

*━━━〔 ✦ ꜱᴜᴀꜱᴀɴᴀ ᴍᴀʟᴀᴍ 〕━━━*
> ⟡ Status : *${getPhaseParticipantName(game)} terlelap di ${getPhaseSedentaryName(game)}*
> ⟡ Waktu Aksi : *𝟿𝟶 Detik*
> ⟡ Suasana : *Mencekam & sunyi senyap*
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> 🔒 _[Fase Malam Berlangsung — Aksi rahasia hanya dapat diakses oleh pemain yang masih hidup]_`

    const spectatorMessage = await buildGameRolesHeaderMessage(conn, chat, spectatorText, thumbNight, {
        title: `${game.name} • FASE MALAM`,
        subtitle: 'Aksi rahasia hanya terlihat oleh pemain'
    })
    await sendMultiParticipantGroupStanza(conn, chat, playerMessages, spectatorMessage.message)
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
> ⚖️ _Sidang dimulai! ${getPhaseParticipantName(game)} bersiap menentukan tersangka._`

    await sendGameThumbnail(conn, chat, morningCard, thumbMorning, null, { mentions })
}

const publishMorning = async (conn, chat, room, ww, announce = true) => {
    if (announce) await sendMorningAnnouncement(conn, chat, room)
    const winner = getWinner(chat, ww)
    if (winner.status !== null) return await win(room, 1, conn, ww)
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
> ⟡ Pilih target dari daftar tombol atau ketik *${room.commandBase || '.ww'} <kode>*
*━━━━━━━━━━━━━━*
 
*━━━〔 🔐 ᴋᴏᴅᴇ ᴀᴋsɪ ʀᴀʜᴀsɪᴀ 〕━━━*
> Pilih kode dan target melalui daftar tombol di bawah.
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> _Tembak salah satu pemain atau pilih untuk tidak menembak. Nasib ${game.name} ada di tanganmu._`
    const built = await buildGameRolesHeaderMessage(conn, chat, hunterCard, thumbExecution, {
        title: `${game.name} • HUNTER`,
        subtitle: 'Tembakan terakhir',
        footer: `Avelia • ${game.name} Hunter Reaction`,
        listButton: {
            id: 'game_roles_hunter_action',
            label: '🏹 Pilih Aksi Hunter',
            title: 'AKSI TERAKHIR HUNTER',
            sections: [{
                title: 'Pilihan tembakan',
                rows: actionRows.map((action) => ({
                    title: action.title,
                    description: action.description,
                    id: action.id
                }))
            }]
        }
    })
    const spectatorMessage = await buildGameRolesHeaderMessage(
        conn,
        chat,
        '> 🔒 _Kesempatan tembakan Hunter hanya terlihat oleh pemain yang bersangkutan._',
        thumbExecution,
        { title: `${game.name} • HUNTER`, subtitle: 'Aksi rahasia' }
    )
    await sendDualGroupMessage(
        conn,
        chat,
        hunter.id,
        built.message,
        spectatorMessage.message
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
        recordGameActivity(room, {
            action: 'hunter-shot',
            actorId: hunter.id,
            targetId: targetPlayer.id,
            result: armorBlocked ? 'Tembakan tertahan armor Warden' : 'Target gugur'
        })
        if (!armorBlocked) {
            targetPlayer.isdead = true
            targetPlayer.deathNoticeSent = false
            collapseZombieVampireInfections(room)
            if (targetPlayer.role === 'hunter' && targetPlayer.infectionType !== room.category) {
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
${!armorBlocked && targetPlayer.role === 'hunter' && targetPlayer.infectionType !== room.category ? '\n> 🏹 Hunter yang tertembak juga mendapat kesempatan membalas.' : ''}`
        await sendGameThumbnail(conn, chat, resultCard, thumbExecution, null, {
            mentions: getPlayerMentions([hunter, targetPlayer])
        })
    }
    if (hunter.pendingExecution) {
        hunter.pendingExecution = false
        hunter.canShoot = false
        await sendGameThumbnail(conn, chat, `*━━━〔 ☠️ EKSEKUSI HUNTER 〕━━━*\n> 🏹 ${getDisplayPlayerLabel(hunter, conn)} telah menggunakan kesempatan terakhirnya.\n\n> ⟡ Role : *Hunter ${roleEmojis.hunter}*`, thumbExecution, null, {
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
    const runoffCandidateNumbers = Array.isArray(room.runoffCandidateNumbers)
        ? room.runoffCandidateNumbers
        : null

    room.time = 'voting'
    voteStart(chat, ww)
    resetVote(chat, ww)
    clearAllVote(chat, ww)

    const livingPlayers = room.player.filter((p) => !p.isdead)

    const game = getGameCategory(room.category)
    const runoffNotice = runoffCandidateNumbers
        ? '> ⚖️ Ini pemungutan suara ulang. Pilihan hanya pemain yang seri; tidak ada opsi untuk melewati voting.\n'
        : ''
    const votingCard = `*━━━〔 ${game.name.toUpperCase()} · SIDANG 〕━━━*
> ⚖️ _Matahari tepat di atas kepala, warga berkumpul menentukan takdir..._

${runoffNotice}
*━━━〔 ✦ ɪɴꜰᴏ ᴠᴏᴛɪɴɢ 〕━━━*
> ⟡ Waktu : *𝟿𝟶 Detik*
> ⟡ Pilihan dan kode voting bersifat rahasia untuk setiap pemain.
> ⟡ Gunakan tombol 🔐 yang hanya terlihat olehmu.
> ⟡ Jika tombol bermasalah, ketik *${room.commandBase || '.ww'} <kode>* di chat (contoh: *${room.commandBase || '.ww'} K7Z4*).
*━━━━━━━━━━━━━━*
━━━━━━━━━━━━━━
> _Pilihlah dengan bijak, jangan biarkan ${game.antagonistName} memperdaya kalian!_`

    const playerMessages = new Map()
    const usedVoteCodes = new Set()
    for (const player of livingPlayers.filter((entry) => !entry.isDummy)) {
        const voteCodes = generateVoteCodeMap(room, player, usedVoteCodes, runoffCandidateNumbers)
        const voteRows = Object.entries(voteCodes).map(([code, choice]) => {
            const target = choice.targetNumber
                ? room.player.find((entry) => entry.number === choice.targetNumber)
                : null
            return {
                code,
                title: target ? `Pemain ${toSmallNum(target.number)}` : 'Lewati voting',
                description: target
                    ? `${getDisplayPlayerLabel(target, conn)} · Kode ${code}`
                    : `Kode ${code}`,
                id: `${room.commandBase || '.ww'} ${code}`
            }
        })
        if (player.isAiCitizen) continue
        const privateVotingCard = `${votingCard}\n\n*━━━〔 🔐 PILIHAN VOTING 〕━━━*\n> Gunakan daftar di bawah untuk melihat semua kandidat dan kode rahasia.\n> Kode tetap bisa diketik: *${room.commandBase || '.ww'} <kode>*`
        const built = await buildGameRolesHeaderMessage(conn, chat, privateVotingCard, thumbVoting, {
            title: `${game.name} • VOTING`,
            subtitle: 'Kode voting rahasia',
            footer: `Avelia • ${game.name} Secret Voting`,
            mentions: getPlayerMentions(livingPlayers),
            listButton: {
                id: 'game_roles_vote',
                label: '🔐 Pilih Vote',
                title: 'PILIH TARGET VOTING',
                sections: [{
                    title: 'Kandidat dan kode',
                    rows: voteRows.map((row) => ({
                        title: row.title,
                        description: row.description,
                        id: row.id
                    }))
                }]
            }
        })
        playerMessages.set(player.id, built.message)
    }

    const spectatorText = `*━━━〔 ${game.name.toUpperCase()} · SIDANG 〕━━━*
> ⚖️ _Voting rahasia sedang berlangsung._
> 🔒 Setiap pemain menerima tombol dan kode voting yang berbeda.
> ⏳ Waktu voting: *𝟿𝟶 Detik*`
    const spectatorMessage = await buildGameRolesHeaderMessage(conn, chat, spectatorText, thumbVoting, {
        title: `${game.name} • SIDANG`,
        subtitle: 'Voting rahasia sedang berlangsung'
    })
    await sendMultiParticipantGroupStanza(conn, chat, playerMessages, spectatorMessage.message)
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
    const discussants = room.player.filter((entry) =>
        entry.isAiCitizen && (!entry.isdead || entry.role === 'ghost')
    )
    for (const player of discussants) {
        if (conn.werewolf?.[chat] !== room || room.time !== 'voting' || player.isvote) return
        await wait(650 + Math.floor(Math.random() * 600))
        if (conn.werewolf?.[chat] !== room || room.time !== 'voting' ||
            (player.isdead && player.role !== 'ghost') || player.isvote) return

        try {
            await conn.sendMessage(chat, {
                text: formatAiCitizenMessage(player, getAiDiscussionMessage(
                    room,
                    player,
                    conn,
                    Array.isArray(room.runoffCandidateNumbers) ? room.runoffCandidateNumbers : null
                ))
            })
        } catch (error) {
            console.error(`[werewolf AI discussion message failed] player=${player.displayName}`, error)
        }
        if (player.isdead) continue

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
    const game = getGameCategory(room.category)
    const participants = getPhaseParticipantName(game)

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
    if (hasil_vote !== 1) room.runoffCandidateNumbers = null

    if (hasil_vote === 0) {
        const text = `*━━━〔 ⚖️ SIDANG BERAKHIR 〕━━━*\n> ⚖️ _Terlalu bimbang menentukan pilihan..._\n\n${participants} tidak dapat mencapai kesepakatan dan kembali ke ${getPhaseSedentaryName(game)}. Tidak ada yang dieksekusi hari ini.${voteTallyText}\n\n━━━━━━━━━━━━━━\n> 🌙 _Malam kembali tiba menyelimuti ${game.location}..._`
        await sendGameThumbnail(conn, chat, text, thumbNight)
    } else if (hasil_vote === 1) {
        const highestVote = Math.max(0, ...voteTally.map((player) => Number(player.vote) || 0))
        const tiedCandidates = voteTally.filter((player) =>
            (Number(player.vote) || 0) === highestVote
        )
        if (tiedCandidates.length > 1) {
            const candidateList = tiedCandidates.map((player) =>
                `> ${getDisplayPlayerLabel(player, conn)}`
            ).join('\n')
            const text = `*━━━〔 ⚖️ HASIL VOTING SERI 〕━━━*\n> ⚖️ _Voting ulang dimulai sekarang._\n\nPilihan hanya tersedia untuk pemain yang memperoleh suara tertinggi dan seri:\n${candidateList}${voteTallyText}\n\n━━━━━━━━━━━━━━\n> 🔁 _Pilih salah satu kandidat di atas; pilihan lain tidak tersedia._`
            await sendGameThumbnail(conn, chat, text, thumbVoting, null, {
                mentions: getPlayerMentions(tiedCandidates)
            })
            room.runoffCandidateNumbers = tiedCandidates.map((player) => player.number)
            await startDayVoting(conn, chat, ww)
            return
        }

        const text = `*━━━〔 ⚖️ SIDANG BERAKHIR 〕━━━*\n> ⚖️ _Hasil pemungutan suara berimbang!_\n\nSuara terbanyak diperoleh oleh lebih dari satu orang dengan jumlah yang sama. Eksekusi dibatalkan demi keadilan.${voteTallyText}\n\n━━━━━━━━━━━━━━\n> 🌙 _${participants} kembali ke ${getPhaseSedentaryName(game)}..._`
        await sendGameThumbnail(conn, chat, text, thumbNight)
    } else if (hasil_vote && typeof hasil_vote === 'object') {
        const killed = voteKill(chat, ww)
        const killedRole = getPlayerRolePresentation(killed, room.category)
        const kEmoji = killedRole.emoji || '👱‍♂️'
        const kTitle = killedRole.title
        const killedName = getPlayerMentionLabel(killed, conn)

        const execText = killed.pendingExecution
            ? `*━━━〔 ⚖️ SIDANG 〕━━━*
> ⚖️ _${participants} telah memilih Hunter untuk dieksekusi._

*━━━〔 🏹 TEMBAKAN TERAKHIR 〕━━━*
> ⟡ Nama : *${killedName}*
> ⟡ Role : *Hunter ${kEmoji}*
> ⟡ Hunter akan menembak sebelum eksekusi diselesaikan.
*━━━━━━━━━━━━━━*${voteTallyText}
━━━━━━━━━━━━━━
> 🏹 _Kesempatan terakhir Hunter dimulai sekarang._`
            : `*━━━〔 ☠️ KEPUTUSAN EKSEKUSI 〕━━━*
> ⚖️ _${participants} telah sepakat menjatuhkan hukuman gantung!_

*━━━〔 ☠️ ᴡᴀʀɢᴀ ʏᴀɴɢ ᴅɪᴇᴋꜱᴇᴋᴜꜱɪ 〕━━━*
> ⟡ Nama : *${killedName}*
> ⟡ Nomor : *${toSmallNum(killed.number)}*
> ⟡ Identitas Asli : *${kTitle} ${kEmoji}*
*━━━━━━━━━━━━━━*${voteTallyText}
━━━━━━━━━━━━━━
> 🌙 _Senja telah usai. Bersiaplah menghadapi malam yang mencekam..._`

        const executionScene = !killed.pendingExecution && isAntagonistRole(room.category, killed.role)
            ? getSceneImage('eksekusi benar')
            : getSceneImage('eksekusi salah')
        await sendGameThumbnail(conn, chat, execText, executionScene || thumbExecution, null, {
            mentions: getPlayerMentions([killed])
        })

        if (killed.pendingExecution && killed.role === 'hunter' && killed.infectionType !== room.category) {
            await openHunterReaction(conn, chat, room, killed, 'voting')
            return
        }
        if (getWinner(chat, ww).status === 'fixer') {
            return await win(room, 1, conn, ww)
        }
        if ((killed.role === 'jester' && killed.infectionType !== room.category) || room.jesterWin) {
            return await win(room, 1, conn, ww)
        }
    }

    voteDone(chat, ww)
    resetVote(chat, ww)
    clearAllVote(chat, ww)
    clearAll(chat, ww)
    clearAllSTATUS(chat, ww)
    room.runoffCandidateNumbers = null

    const winner = getWinner(chat, ww)
    if (winner.status !== null) {
        return await win(room, 1, conn, ww)
    }

    await sendNightPhaseStanza(conn, chat, room)
}

let handler = async (m, { conn, command, usedPrefix, args }) => {
    const { sender, chat } = m
    const normalizedCommand = String(command || '').toLowerCase().replace(/[/.!?]+$/, '')
    if (normalizedCommand === 'gr') {
        const pictAction = args?.[0]?.toLowerCase()
        const hasOwnerOrCoOwnerAccess = () => {
            const senderPhone = normalizePhone(sender)
            const ownerPhone = String(global.nomorown || '').replace(/\D/g, '')
            const coOwnerPhone = String(global.nomorcoown || '').replace(/\D/g, '')
            const hasOwnerPhone = senderPhone && [ownerPhone, coOwnerPhone].some((phone) => phone && senderPhone.endsWith(phone))
            const hasCoOwnerDatabase = Boolean(global.db?.data?.users?.[sender]?.isCoOwner)
            return Boolean(hasOwnerPhone || hasCoOwnerDatabase)
        }
        if (pictAction === 'pict') {
            if (!hasOwnerOrCoOwnerAccess()) return

            const imagePaths = [...new Set(getRoleImagePaths())]
            for (let index = 0; index < imagePaths.length; index++) {
                try {
                    await conn.sendMessage(chat, { image: { url: imagePaths[index] } })
                } catch (error) {
                    console.warn(`[Game Roles] Failed to send asset picture ${index + 1}/${imagePaths.length}: ${error.message}`)
                }
                if (index < imagePaths.length - 1) await wait(3000)
            }
            return
        }
        if (pictAction === 'scene') {
            if (!hasOwnerOrCoOwnerAccess()) return

            const scenePaths = getSceneImagePaths()
            for (let index = 0; index < scenePaths.length; index++) {
                try {
                    await conn.sendMessage(chat, { image: { url: scenePaths[index] } })
                } catch (error) {
                    console.warn(`[Game Roles] Failed to send scene picture ${index + 1}/${scenePaths.length}: ${error.message}`)
                }
                if (index < scenePaths.length - 1) await wait(3000)
            }
            return
        }
    }
    conn.werewolf = conn.werewolf ? conn.werewolf : {}
    const ww = conn.werewolf
    const isGameRolesCommand = ['gr', 'rg', 'gameroles'].includes(normalizedCommand)
    if (isGameRolesCommand && args.length === 1 && normalizeGameCategory(args[0])) args = []
    const directGameCategory = !isGameRolesCommand ? normalizeGameCategory(normalizedCommand) : null
    let gameCategory = directGameCategory || getGameCategory('ww')
    const routedGameCategory = isGameRolesCommand && Boolean(normalizeGameCategory(args[0]))
    if (routedGameCategory) {
        gameCategory = getGameCategory(args[0])
        args = args.slice(1)
    }
    const gameCommandBase = `${usedPrefix || '.'}${isGameRolesCommand ? `gr ${gameCategory.id}` : directGameCategory ? directGameCategory.aliases[0] : 'ww'}`
    const standardCommands = ["test", "create", "join", "start", "vote", "exit", "delete", "player", "room", "lobby", "log", "info", "role", "guide", "add", "del", "shoot", "action", "autorole", "list", "rate", "spawnrate", "sr"]
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
            .replace(/^[.\/#!]gr\s+(?:ww|werewolf|mafia|killer|assassin|assasin|impostor|imposter|alien|parasite|zombie|vampire|vigilante|mayhem|custom)\s*/i, "")
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
    const allowedDeadCommands = ["delete", "info", "role", "player", "room", "lobby", "log", "create", "join", "start", "exit", "guide", "shoot"]
    if ((!isGameRolesCommand || routedGameCategory) && ww[chat] && value !== 'delete' && ww[chat].category && ww[chat].category !== gameCategory.id &&
        !['info', 'guide', 'role', 'player', 'room', 'lobby', 'log'].includes(normalizedValue)) {
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
            const gameList = buildGameCategoryList(usedPrefix, args[1])
            return sendGameThumbnail(conn, chat, gameList.text, thumbNight, m, {
                title: `PILIHAN GAME ${gameList.page}/${gameList.pageCount}`,
                buttons: gameList.buttons
            })
        }
        if (action === 'info') {
            const category = normalizeGameCategory(args[1])
            if (!category) {
                const categoryList = Object.values(GAME_CATEGORIES)
                    .map((entry, index) => `> ${String(index + 1).padStart(2, '0')} · ${entry.antagonistEmoji} *${entry.name}* — *${usedPrefix}gr info ${entry.id}*`)
                    .join('\n━━━━━━━━━━━━━━\n')
                return m.reply(`*━━━〔 🎮 DAFTAR KATEGORI 〕━━━*\n\n${categoryList}\n\n━━━━━━━━━━━━━━\n> Ketik *.gr list* untuk deskripsi game dan tombol navigasi.`)
            }
            return sendGameThumbnail(conn, chat, formatGameCategoryInfo(category, usedPrefix), getGameCategoryImage(category), m)
        }
        if (['rate', 'spawnrate', 'sr'].includes(action)) {
            const requestedCount = Number.parseInt(args[1], 10)
            const playerCount = Number.isInteger(requestedCount) && requestedCount > 0
                ? Math.min(requestedCount, 15)
                : (ww[chat]?.player || []).filter((player) => !player.isDummy).length || 5
            const category = gameCategory
            const lines = [(() => {
                const room = {
                    category: category.id,
                    player: Array.from({ length: playerCount }, (_, index) => ({ id: `rate-${index}`, number: index + 1, isDummy: false }))
                }
                const sampleRooms = { rate: room }
                const samples = 2000
                const totals = Object.create(null)
                let villainTotal = 0
                for (let sample = 0; sample < samples; sample++) {
                    const distribution = roleAmount('rate', sampleRooms, undefined, playerCount)
                    if (!distribution) continue
                    for (const [role, amount] of Object.entries(distribution)) {
                        totals[role] = (totals[role] || 0) + amount
                    }
                    villainTotal += Object.entries(distribution)
                        .filter(([role]) => CUSTOM_ANTAGONIST_ROLES.includes(role))
                        .reduce((total, [, amount]) => total + amount, 0)
                }
                const roles = Object.entries(totals)
                    .sort(([roleA], [roleB]) => formatRoleTitle(roleA).localeCompare(formatRoleTitle(roleB)))
                    .map(([role, amount]) => {
                        const chance = amount / (samples * playerCount) * 100
                        return `> ${formatRoleTitle(role)} ${roleEmojis[role] || '🎭'} · *${chance.toFixed(1)}%*`
                    }).join('\n')
                return `*${category.name}*\n> Pemain: *${playerCount}*\n> Villain: ~${(villainTotal / samples).toFixed(1)} pemain\n${roles}`
            })()]
            return m.reply(`*━━━〔 🎲 SPAWN RATE ROLE 〕━━━*\n\n${lines.join('\n\n━━━━━━━━━━━━━━\n\n')}\n\n> Angka dihitung dari ${2000} simulasi acak.`)
        }
        if (action === 'role') {
            const requestedRole = args.slice(1).join(' ').trim()
            const showRoleGuide = /\s+(?:guide|panduan)$/i.test(requestedRole)
            const roleInput = showRoleGuide
                ? requestedRole.replace(/\s+(?:guide|panduan)$/i, '').trim()
                : requestedRole
            const factionFilter = normalizeRoleFactionFilter(requestedRole)
            if (roleInput && !factionFilter) {
                const selectedRole = resolveRoleChoice(roleInput)
                if (!selectedRole) return m.reply(status.warning('Role tidak ditemukan. Gunakan nama role yang tercantum di *.gr role*.'))
                const details = formatRoleDetails(selectedRole, gameCategory)
                const guide = showRoleGuide
                    ? `\n\n${formatRoleGuide(selectedRole, gameCategory, usedPrefix || '.')}`
                    : ''
                const roleImage = getRoleImage(selectedRole, gameCategory.location)
                const detailCaption = `*━━━〔 ✦ DETAIL ROLE ${formatRoleTitle(selectedRole).toUpperCase()} ✦ 〕━━━*\n\n${details}${guide}`
                return sendGameThumbnail(conn, chat, detailCaption, roleImage || thumbNight, m, {
                    title: `✦ ${formatRoleTitle(selectedRole).toUpperCase()} ✦`,
                    subtitle: gameCategory.name,
                    buttons: [
                        ['🎭 Daftar Role', `${usedPrefix}gr role`],
                        ['📖 Panduan Game Roles', `${usedPrefix}gr guide`]
                    ]
                })
            }
            const roleSections = formatRoleList(gameCategory, factionFilter)
            const factionTitle = factionFilter
                ? ` · ${factionFilter === 'antagonist' ? 'VILLAIN' : factionFilter === 'protagonist' ? 'CITIZEN' : 'NETRAL'}`
                : ''
            return sendGameThumbnail(conn, chat, `*━━━〔 🎭 ROLE & EFEK${factionTitle} 〕━━━*\n\n${roleSections}\n\n*━━━━━━━━━━━━━━*\n> Detail role: *${usedPrefix}gr role <nama/nomor>*\n> Tambahkan *guide* untuk panduan lengkap, contoh: *${usedPrefix}gr role sorcerer guide*\n\n            > Filter: *${usedPrefix}gr role villain*, *citizen*, atau *netral*\n> Custom: *${usedPrefix}custom role @pemain <nama/nomor>*\n> Warga AI: *${usedPrefix}custom role <nomor pemain> <nama/nomor>*`, thumbNight, m, {
                title: 'DAFTAR ROLE',
                footer: 'Avelia • Daftar Role',
                buttons: roleFactionButtons(`${usedPrefix}gr`)
            })
        }
        if (action === 'guide') {
            return m.reply(`*━━━〔 ✧ PANDUAN GAME ROLES ✧ 〕━━━*\n\n> 1. Pilih tema lewat *${usedPrefix}gr list*, misalnya Werewolf, Alien, Vigilante, atau Mayhem.\n\n> 2. Buat room dengan command tema, contoh *${usedPrefix}mafia create 10k*.\n\n> 3. Mode Custom: *${usedPrefix}custom autorole* untuk role acak, *${usedPrefix}custom role @pemain <role/nomor>* untuk pemain manusia, dan *${usedPrefix}custom role <nomor pemain> <role/nomor>* untuk warga AI. Periksa pilihan dengan *${usedPrefix}custom list*. Hanya satu jenis Villain utama dan tiap role khusus hanya untuk satu pemain.\n\n> 4. Peserta masuk memakai *${usedPrefix}mafia join*; taruhan ditahan saat bergabung.\n\n> 5. Owner room memulai dengan *${usedPrefix}mafia start*.\n\n> 6. Kartu aksi dan informasi rahasia dikirim hanya kepada pemain terkait. Anggota lain hanya melihat teks pengunci.\n\n> 7. Lihat riwayat dengan *${usedPrefix}mafia log*. Voting dan aksi skip atau sembunyi tidak dicatat.\n\n> 8. Keluar dari room bertaruhan perlu konfirmasi dan taruhan tetap di pot. Menghapus room mengembalikan taruhan.\n\n> 9. Gunakan *${usedPrefix}gr me*, *${usedPrefix}gr history*, dan *${usedPrefix}gr top* untuk statistik.`)
        }
        if (['command', 'commands', 'cmd'].includes(action)) {
            const commandText = Object.values(GAME_CATEGORIES)
                .map((entry) => `*${entry.antagonistEmoji} ${entry.name}*\n> ${usedPrefix}${entry.aliases[0]} create [taruhan] · join · start · vote · player/room/lobby · log · info · role · guide · exit · delete${entry.id === 'custom' ? `\n> ${usedPrefix}custom role @pemain <role/nomor> atau <nomor pemain> <role/nomor> · autorole · list` : ''}`)
                .join('\n\n')
            return m.reply(`*━━━〔 ✧ COMMAND GAME ROLES ✧ 〕━━━*\n\n${commandText}\n\n*━━━〔 Statistik & Info 〕━━━*\n> ${usedPrefix}gr role\n> ${usedPrefix}gr info <kategori>\n> ${usedPrefix}gr top\n> ${usedPrefix}gr me\n> ${usedPrefix}gr history [halaman]`)
        }
        if (action === 'me' || action === 'stats' || action === 'stat') {
            const user = loadDB().users[sender] || {}
            const stats = user.werewolfStats || {}
            return m.reply(`*━━━〔 ✧ STATISTIK GAME ROLES ✧ 〕━━━*\n\n> Skor Villain: *${Number(stats.score) || 0}*\n> Menang Villain: *${Number(stats.antagonistWins) || 0}x*\n> Menang Citizen: *${Number(stats.protagonistWins) || 0}x*\n> Menang netral: *${Number(stats.neutralWins) || 0}x*`)
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
            if (buttons.length) return sendGameThumbnail(conn, chat, caption, thumbNight, m, {
                title: 'GAME ROLES',
                buttons
            })
            return sendGameThumbnail(conn, chat, caption, thumbNight, m)
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
                return `> *${index + 1}.* ${identity.display}\n> Skor: *${Number(stats.score) || 0}* · Villain: *${Number(stats.antagonistWins) || 0}x* · Citizen: *${Number(stats.protagonistWins) || 0}x* · Netral: *${Number(stats.neutralWins) || 0}x*`
            })
            return sendGameThumbnail(conn, chat, `*━━━〔 ✧ TOP 10 GAME ROLES ✧ 〕━━━*\n\n${lines.join('\n\n') || 'Belum ada skor yang tercatat.'}`, thumbVoting, null, { mentions })
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

    if (normalizedValue === 'log') {
        const activeRoom = ww[chat]?.status ? ww[chat] : null
        const logData = activeRoom
            ? {
                category: activeRoom.category,
                activities: activeRoom.activityLog || [],
                players: activeRoom.player
            }
            : conn.werewolfLastLogs?.[chat]
        if (!logData) return m.reply(status.warning('Belum ada riwayat permainan terakhir di grup ini.'))

        const players = logData.players || []
        const game = getGameCategory(logData.category)
        const labelFor = (id, name) => {
            const player = players.find((entry) => entry.id === id)
            return name || (player ? getDisplayPlayerLabel(player, conn) : 'Pemain')
        }
        const actionText = {
            kill: (entry) => `${labelFor(entry.actorId, entry.actorName)} menyerang ${labelFor(entry.targetId, entry.targetName)}`,
            infect: (entry) => `${labelFor(entry.actorId, entry.actorName)} menularkan ${game.name} kepada ${labelFor(entry.targetId, entry.targetName)}`,
            guard: (entry) => `${labelFor(entry.actorId, entry.actorName)} melindungi ${labelFor(entry.targetId, entry.targetName)}`,
            check: (entry) => `${labelFor(entry.actorId, entry.actorName)} memeriksa ${labelFor(entry.targetId, entry.targetName)}${entry.result ? ` (${entry.result})` : ''}`,
            poison: (entry) => `${labelFor(entry.actorId, entry.actorName)} meracuni ${labelFor(entry.targetId, entry.targetName)}`,
            revive: (entry) => `${labelFor(entry.actorId, entry.actorName)} membangkitkan ${labelFor(entry.targetId, entry.targetName)}`,
            'hunter-shot': (entry) => `${labelFor(entry.actorId, entry.actorName)} menembak ${labelFor(entry.targetId, entry.targetName)}${entry.result ? ` — ${entry.result}` : ''}`,
            capture: (entry) => `${labelFor(entry.actorId, entry.actorName)} menangkap ${labelFor(entry.targetId, entry.targetName)}`,
            'guardian-block': (entry) => `${labelFor(entry.actorId, entry.actorName)} terlindungi Guardian dari serangan ${labelFor(entry.targetId, entry.targetName)}`,
            'warden-block': (entry) => `${labelFor(entry.actorId, entry.actorName)} menahan serangan ${labelFor(entry.targetId, entry.targetName)} dengan armor Warden`
        }
        const lines = (logData.activities || []).filter((entry) =>
            !(activeRoom && entry.action === 'infect')
        ).map((entry, index) => {
            const describe = actionText[entry.action]
            return describe ? `> ${index + 1}. Hari ${toSmallNum(entry.day)} — ${describe(entry)}` : null
        }).filter(Boolean)
        const content = lines.length
            ? lines.join('\n')
            : '> Belum ada aktivitas yang tercatat.'
        return conn.sendMessage(chat, {
            text: `*━━━〔 📜 LOG ${game.name.toUpperCase()} 〕━━━*\n> Riwayat aktivitas selama permainan. Voting dan aksi skip/bersembunyi tidak dicatat.\n\n${content}\n*━━━━━━━━━━━━━━*`
        })
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
                    capture: `> ⛓️ Target berhasil dipilih untuk ditangkap: *${targetLabel}*.`,
                    possess: `> 👻 Target berhasil dipilih untuk dirasuki: *${targetLabel}*.`,
                    guard: `> 🛡️ Berhasil melindungi *${targetLabel}* dari serangan Villain malam ini.`,
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
        const playerCount = room.player.filter((player) => !player.isDummy).length
        if (playerCount < 5 || playerCount > 15) {
            return m.reply(status.warning(`Role otomatis membutuhkan 5–15 pemain (saat ini: ${playerCount}).`))
        }
        if (!autoAssignCustomRoles(chat, ww)) {
            return m.reply(status.error('Role otomatis gagal dibagikan. Pastikan jumlah pemain dan room masih valid.'))
        }
        return m.reply(status.success(`Role otomatis selesai. Role yang sudah ditetapkan tidak diubah; hanya satu jenis Villain utama yang digunakan. Cek dengan *${gameCommandBase} list*.`))
    }

    if (value === "role" && gameCategory.id === 'custom') {
        const room = ww[chat]
        if (room && (room.category !== 'custom' || room.status)) {
            return m.reply(status.warning("Role custom hanya bisa diatur sebelum game custom dimulai."))
        }
        if (room && room.owner !== sender && !hasRpgPanelAccess(sender)) {
            return m.reply(status.error("Hanya owner room atau moderator yang dapat mengatur role custom."))
        }

        let targetPlayerId = m.mentionedJid?.[0] || m.quoted?.sender
        let roleArgs = args.slice(1)
        if (!targetPlayerId && room && args.length >= 3) {
            const targetNumber = Number(args[1])
            const targetPlayer = room.player.find((player) =>
                player.isAiCitizen && !player.isDummy && player.number === targetNumber
            )
            if (targetPlayer) {
                targetPlayerId = targetPlayer.id
                roleArgs = args.slice(2)
            }
        }
        if (!targetPlayerId) {
            return m.reply(status.warning(`Tag pemain atau pilih nomor warga AI. Contoh: *${gameCommandBase} role @pemain seer* atau *${gameCommandBase} role 3 mafia*.`))
        }
        const roleInput = roleArgs.filter((arg) => !String(arg).startsWith('@')).join(' ')
        const selectedRole = resolveRoleChoice(roleInput)
        if (!selectedRole) {
            return m.reply(status.warning(`Role tidak valid. Gunakan nama role atau nomor dari *.gr role*.`))
        }

        conn.werewolfCustomRoles = conn.werewolfCustomRoles || {}
        const customRoles = room
            ? (room.customRoles || (room.customRoles = {}))
            : (conn.werewolfCustomRoles[chat] || (conn.werewolfCustomRoles[chat] = {}))
        const proposedRoles = Object.entries(customRoles)
            .filter(([id]) => id !== targetPlayerId)
            .map(([, role]) => role)
        proposedRoles.push(selectedRole)
        const validation = validateCustomRoles(proposedRoles)
        if (!validation.valid) {
            if (validation.reason === 'multiple-antagonists') {
                return m.reply(status.warning('Mode Custom hanya boleh memakai satu jenis Villain utama. Hapus atau ganti Villain yang berbeda terlebih dahulu.'))
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
            mentions: rolePlayer.isAiCitizen ? [] : [targetPlayerId]
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
${gameCategory.id === 'custom' ? `\n> 🎭 Atur role dengan *${gameCommandBase} role @pemain <role/nomor>* atau *${gameCommandBase} role <nomor pemain> <role/nomor>* untuk warga AI; bagikan otomatis dengan *${gameCommandBase} autorole*, atau cek dengan *${gameCommandBase} list*.` : ''}
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
            if (!ww[chat].wagerPlayers) ww[chat].wagerPlayers = []
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
            const addedPlayer = createWargaPlayer(ww[chat], order, displayName)
            ww[chat].player.push(addedPlayer)
            if (ww[chat].category === 'custom') {
                ww[chat].customRoles ||= {}
                ww[chat].customRoles[addedPlayer.id] = 'warga'
            }
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
        wargaPlayers.forEach((player) => {
            if (ww[chat].customRoles) delete ww[chat].customRoles[player.id]
        })
        ww[chat].player = ww[chat].player.filter((player) => !player.isAiCitizen && !player.isDummy)
        ww[chat].player.forEach((player, index) => {
            player.number = index + 1
        })
        m.reply(status.success(`Berhasil menghapus ${toSmallNum(wargaPlayers.length)} warga simulasi.`))

    } else if (value === "start") {
        if (!ww[chat]) return m.reply(status.error("Belum ada sesi permainan."))
        if (args[1] !== undefined) return m.reply(status.warning(`Taruhan ditentukan saat membuat room. Gunakan *${gameCommandBase} create <taruhan>*; tanpa taruhan cukup *${gameCommandBase} create*.`))
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
                !player.isDummy && !validRoleName(
                    ww[chat].customRoles?.[player.id] || (player.isAiCitizen ? null : player.role)
                )
            )
            if (unassignedPlayers.length) {
                const names = unassignedPlayers.map(getDisplayPlayerLabel).join(', ')
                return m.reply(status.warning(`Role custom belum diatur untuk: ${names}.\nAtur dengan *${gameCommandBase} role @pemain <role/nomor>* atau pilih AI memakai *${gameCommandBase} role <nomor pemain> <role/nomor>* sebelum memulai.`))
            }
            const customRoles = ww[chat].player.filter((player) => !player.isDummy)
                .map((player) => ww[chat].customRoles?.[player.id] || (player.isAiCitizen ? null : player.role))
            const validation = validateCustomRoles(customRoles, { requireAntagonist: true })
            if (!validation.valid) {
                const reason = validation.reason === 'multiple-antagonists'
                    ? 'Hanya boleh ada satu jenis Villain utama dalam satu game Custom.'
                    : validation.reason === 'duplicate-role'
                        ? `Role ${roleTitles[validation.role] || validation.role} hanya boleh dimiliki satu pemain.`
                        : validation.reason === 'missing-antagonist'
                            ? 'Tetapkan minimal satu Villain utama (Werewolf/Mafia/Killer/Assassin/Impostor/Alien/Parasite/Zombie/Vampire).'
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
        const manualInput = String(args[1] || '').trim().toLowerCase()
        if (['skip', 'lewati', 'none', '-'].includes(manualInput)) {
            if (voter.isvote) {
                return m.reply(status.warning("Kamu sudah memberikan suara pada sidang hari ini."))
            }
            const voteCode = Object.entries(voter.voteCodes && Object.keys(voter.voteCodes).length
                ? voter.voteCodes
                : generateVoteCodeMap(ww[chat], voter)).find(([, choice]) => choice.type === 'vote-skip')?.[0]
            if (!voteCode) {
                return m.reply(status.error("Pilihan melewati voting tidak tersedia."))
            }
            const result = resolveSecretCodeAction(chat, sender, voteCode, ww, 'vote')
            if (!result.ok) {
                return m.reply(status.error("Pilihan voting gagal dicatat."))
            }
            await m.reply(status.success("Kamu memilih melewati voting hari ini."))
            if (ww[chat].player.filter((player) => !player.isdead && !player.isDummy).every((player) => player.isvote)) {
                await resolveDayVoting(conn, chat, ww)
            }
            return
        }
        const manualTarget = Number.parseInt(manualInput, 10)
        if (Number.isInteger(manualTarget)) {
            if (voter.isvote) {
                return m.reply(status.warning("Kamu sudah memberikan suara pada sidang hari ini."))
            }
            const voteCodes = voter.voteCodes && Object.keys(voter.voteCodes).length
                ? voter.voteCodes
                : generateVoteCodeMap(ww[chat], voter)
            const voteCode = Object.entries(voteCodes).find(([, choice]) =>
                choice.type === 'vote' && Number(choice.targetNumber) === manualTarget
            )?.[0]
            if (!voteCode) {
                return m.reply(status.error("Nomor target voting tidak valid atau pemain sudah gugur."))
            }
            const result = resolveSecretCodeAction(chat, sender, voteCode, ww, 'vote')
            if (!result.ok) {
                return m.reply(status.error("Suara gagal dicatat. Coba lagi dengan tombol voting atau kode rahasia."))
            }
            const target = ww[chat].player.find((player) => player.number === manualTarget)
            await m.reply(status.success(`Suaramu berhasil diberikan kepada ${getDisplayPlayerLabel(target, conn)}.`))
            if (ww[chat].player.filter((player) => !player.isdead && !player.isDummy).every((player) => player.isvote)) {
                await resolveDayVoting(conn, chat, ww)
            }
            return
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
        if (!conn.werewolfExitConfirmations) conn.werewolfExitConfirmations = {}
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

        if (!conn.werewolfDeleteConfirmations) conn.werewolfDeleteConfirmations = {}
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
                const role = getPlayerRolePresentation(player, room.category)
                return `> (${toSmallNum(player.number)}) ${getPlayerMentionLabel(player, conn)}\n> Role: *${role.title} ${role.emoji}*`
            }).join('\n')
            try {
                await sendGameThumbnail(conn, chat, `*━━━〔 ✧ ROOM ${roomGame.name.toUpperCase()} DIHAPUS ✧ 〕━━━*\n\nPermainan dihentikan oleh owner room. Berikut role yang dibagikan:\n\n${roster}${refundNotice}`, thumbExecution, null, {
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

        await sendGameThumbnail(conn, chat, text.trim(), thumbNight, null, {
            mentions: getPlayerMentions(ww[chat].player)
        })

    } else if (value === "info") {
        const game = getGameCategory(ww[chat]?.category === gameCategory.id ? ww[chat].category : gameCategory.id)
        const infoText = `${formatGameCategoryInfo(game, usedPrefix)}

*━━━〔 ✦ PRIVASI AKSI 〕━━━*
> Kartu role dan tombol malam dikirim di grup melalui dual-stanza.
> Aksi dan hasil pribadi hanya terlihat oleh pemain terkait.`
        return sendGameThumbnail(conn, chat, infoText, getGameCategoryImage(game), m)

    } else if (value === "guide") {
        const game = getGameCategory(ww[chat]?.category === gameCategory.id ? ww[chat].category : gameCategory.id)
        const guideText = `*━━━〔 ✧ PANDUAN ${game.name.toUpperCase()} ✧ 〕━━━*
> 📖 _Langkah-langkah memulai dan memainkan ${game.name}:_

*━━━〔 ✦ 𝟷. ᴍᴇᴍʙᴜᴀᴛ ʀᴏᴏᴍ 〕━━━*
> Ketik *${gameCommandBase} create* untuk tanpa taruhan, atau *${gameCommandBase} create <taruhan>* (contoh: *${gameCommandBase} create 1jt*).
${game.id === 'custom' ? `> Atur role dengan *${gameCommandBase} role @pemain <role/nomor>* atau *${gameCommandBase} role <nomor pemain> <role/nomor>* untuk warga AI; bagikan otomatis dengan *${gameCommandBase} autorole*, dan cek dengan *${gameCommandBase} list*.` : ''}
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
        const requestedRole = args.slice(1).join(' ').trim()
        const showRoleGuide = /\s+(?:guide|panduan)$/i.test(requestedRole)
        const roleInput = showRoleGuide
            ? requestedRole.replace(/\s+(?:guide|panduan)$/i, '').trim()
            : requestedRole
        const factionFilter = normalizeRoleFactionFilter(requestedRole)
        if (target && !factionFilter) {
            const selectedRole = resolveRoleChoice(roleInput)
            if (!selectedRole) return m.reply(status.warning('Role tidak ditemukan. Gunakan nama role yang tercantum di daftar role.'))
            const details = formatRoleDetails(selectedRole, game)
            const guide = showRoleGuide
                ? `\n\n${formatRoleGuide(selectedRole, game, usedPrefix || '.')}`
                : ''
            const roleImage = getRoleImage(selectedRole, game.location)
            const detailCaption = `*━━━〔 ✦ DETAIL ROLE ${formatRoleTitle(selectedRole).toUpperCase()} ✦ 〕━━━*\n\n${details}${guide}`
            return sendGameThumbnail(conn, chat, detailCaption, roleImage || thumbNight, m, {
                title: `✦ ${formatRoleTitle(selectedRole).toUpperCase()} ✦`,
                subtitle: game.name,
                buttons: [
                    ['🎭 Daftar Role', `${gameCommandBase} role`],
                    ['📖 Panduan Game Roles', `${gameCommandBase} guide`]
                ]
            })
        }
        const roleSections = formatRoleList(game, factionFilter)
        const factionTitle = factionFilter
            ? ` · ${factionFilter === 'antagonist' ? 'VILLAIN' : factionFilter === 'protagonist' ? 'CITIZEN' : 'NETRAL'}`
            : ''
        return sendGameThumbnail(conn, chat, `*━━━〔 ✦ ROLE & EFEK ${game.name.toUpperCase()}${factionTitle} ✦ 〕━━━*\n\n${roleSections}\n\n*━━━━━━━━━━━━━━*\n> Detail role: *${gameCommandBase} role <nama/nomor>*\n> Tambahkan *guide* untuk panduan lengkap.\n\n        > Filter: *${gameCommandBase} role villain*, *citizen*, atau *netral*`, thumbNight, m, {
            title: `${game.name} ROLE`,
            footer: `Avelia • ${game.name} Role`,
            buttons: roleFactionButtons(gameCommandBase)
        })

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
> ⟡ *${gameCommandBase} log* : Lihat aktivitas game terakhir
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

handler.help = ['ww', 'mafia', 'killer', 'assassin', 'impostor', 'alien', 'parasite', 'zombie', 'vampire', 'custom', 'gr', 'rg']
handler.tags = ['game']
const gameRoleCommands = [...new Set([
    'gr',
    'rg',
    'gameroles',
    ...Object.values(GAME_CATEGORIES).flatMap((category) => category.aliases)
])]
handler.command = gameRoleCommands
handler.group = true

export default handler