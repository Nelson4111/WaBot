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

const thumbNight = "https://user-images.githubusercontent.com/72728486/235316834-f9f84ba0-8df3-4444-81d8-db5270995e6d.jpg"
const thumbMorning = "https://user-images.githubusercontent.com/72728486/235344562-4677d2ad-48ee-419d-883f-e0ca9ba1c7b8.jpg"
const thumbVoting = "https://user-images.githubusercontent.com/72728486/235344861-acdba7d1-8fce-41b8-adf6-337c818cda2b.jpg"
const thumbExecution = "https://user-images.githubusercontent.com/72728486/235354619-6ad1cabd-216c-4c7c-b7c2-3a564836653a.jpg"

const roleEmojis = {
    werewolf: '🐺',
    warga: '👱‍♂️',
    seer: '👳',
    guardian: '👼',
    sorcerer: '🔮',
    hunter: '🏹',
    mayor: '👑',
    jester: '🃏',
    blacksmith: '⚒️'
}

const roleTitles = {
    werewolf: 'WEREWOLF',
    warga: 'WARGA DESA',
    seer: 'SEER / PENERAWANG',
    guardian: 'GUARDIAN ANGEL',
    sorcerer: 'SORCERER / PENYIHIR',
    hunter: 'HUNTER / PEMBURU',
    mayor: 'MAYOR / WALIKOTA',
    jester: 'JESTER',
    blacksmith: 'BLACKSMITH'
}

const roleDescriptions = {
    werewolf: 'Pilih korban malam ini bersama kawananmu tanpa ketahuan.',
    warga: 'Amati gerak-gerik pemain dan cari tempat berlindung malam ini.',
    seer: 'Terawang satu pemain untuk mengungkap identitas aslinya.',
    guardian: 'Lindungi satu pemain dari terkaman Werewolf malam ini.',
    sorcerer: 'Gunakan racun mematikan atau bangkitkan sekutu dari kematian.',
    hunter: 'Siapkan senapan perakmu untuk membalas jika gugur.',
    mayor: 'Beristirahatlah untuk memimpin sidang desa esok hari.',
    jester: 'Lakukan kekacauan dan pancing warga untuk mengeksekusimu.',
    blacksmith: 'Tempa armormu untuk menahan satu serangan malam.'
}

const validRoleName = (value) => {
    const role = String(value || '').toLowerCase()
    return ['werewolf', 'warga', 'seer', 'guardian', 'sorcerer', 'hunter', 'mayor', 'jester', 'blacksmith'].includes(role) ? role : null
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
    const aliveJids = alivePlayers.map((p) => p.id)
    const playerMessagesMap = {}

    for (const p of alivePlayers) {
        const role = p.role || 'warga'
        const rEmoji = roleEmojis[role] || '🎭'
        const rTitle = roleTitles[role] || role.toUpperCase()
        const rDesc = roleDescriptions[role] || 'Pilihlah tindakan malammu dengan bijak.'

        const bodyCard = `*──  ୨୧ ✧ FASE MALAM TIBA ✧ ୨୧  ──*
> 🌙 _Bulan purnama bersinar terang di atas langit desa..._

*╭  〔 ${rEmoji} ʀᴏʟᴇ: ${rTitle} 〕*
*┆* ⟡ Pemain : *${p.displayName || `@${p.id.split('@')[0]}`}*
*┆* ⟡ Nomor : *${toSmallNum(p.number)}*
*┆* ⟡ Petunjuk : *${rDesc}*
*╰───────────────*

*╭  〔 ✦ ɪɴꜱᴛʀᴜᴋꜱɪ ᴀᴋꜱɪ 〕*
*┆* ⟡ Tekan tombol di bawah untuk beraksi.
*┆* ⟡ Tombol bersifat rahasia & eksklusif.
*┆* ⟡ Chat aksi otomatis disamarkan.
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> 🔒 _Pilihanmu menentukan keselamatan desa saat fajar._`

        const btn = new Button(conn)
        btn.setBody(bodyCard)
        btn.setFooter('Avelia • Werewolf Secret Night Phase')
        btn.addButton('', '{}') // Dummy button untuk kompatibilitas WhatsApp Android

        const secretCodes = p.secretCodes || {}
        for (const [code, action] of Object.entries(secretCodes)) {
            let label = ''
            if (action.type === 'kill') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                label = `🐺 Terkam (${toSmallNum(action.targetNumber)}) ${tName}`
            } else if (action.type === 'check') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                label = `🔮 Terawang (${toSmallNum(action.targetNumber)}) ${tName}`
            } else if (action.type === 'guard') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                label = `🛡️ Lindungi (${toSmallNum(action.targetNumber)}) ${tName}`
            } else if (action.type === 'poison') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                label = `☠️ Racuni (${toSmallNum(action.targetNumber)}) ${tName}`
            } else if (action.type === 'revive') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                label = `⚰️ Hidupkan (${toSmallNum(action.targetNumber)}) ${tName}`
            } else if (action.type === 'hunter') {
                const target = room.player.find((x) => x.number === action.targetNumber)
                const tName = target ? (target.displayName || `@${target.id.split('@')[0]}`) : `#${action.targetNumber}`
                label = `🏹 Tembak (${toSmallNum(action.targetNumber)}) ${tName}`
            } else if (action.type === 'skip') {
                label = `⏩ Lewati Malam`
            } else if (action.type === 'dummy') {
                label = `🌙 ${action.label || 'Aktivitas Malam'}`
            } else {
                label = `✦ ${action.label || 'Pilihan'}`
            }

            if (label.length > 25) {
                label = label.slice(0, 24) + '…'
            }

            btn.addReply(label, `.ww ${code}`)
        }

        btn.setContextInfo({ mentionedJid: aliveJids })
        const built = await btn.build(chat, {})
        playerMessagesMap[p.id] = built.message
    }

    const spectatorText = `*──  ୨୧ ✧ FASE MALAM TIBA ✧ ୨୧  ──*
> 🌙 _Bulan purnama bersinar terang di atas langit desa..._

*╭  〔 ✦ ꜱᴜᴀꜱᴀɴᴀ ᴍᴀʟᴀᴍ 〕*
*┆* ⟡ Status : *Warga terlelap di kediaman masing-masing*
*┆* ⟡ Waktu Aksi : *𝟿𝟶 Detik*
*┆* ⟡ Suasana : *Mencekam & sunyi senyap*
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

    const winner = getWinner(chat, ww)
    if (winner.status !== null) {
        return await win(room, 1, conn, ww)
    }

    const morningBody = pagii(room)
    const mentions = room.player.filter((p) => !p.isDummy).map((p) => p.id)

    const morningCard = `*──  ୨୧ ✧ FAJAR TELAH TIBA ✧ ୨୧  ──*
> ☀️ _Sinar matahari pagi menembus kabut desa..._

${morningBody}

· · ─ ─ ✦ ─ ─ · ·
> ⚖️ _Sidang balai desa dimulai! Warga bersiap menentukan tersangka._`

    await conn.sendMessage(chat, {
        image: { url: thumbMorning },
        caption: morningCard,
        mentions
    })

    await startDayVoting(conn, chat, ww)
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

    const livingPlayers = room.player.filter((p) => !p.isdead && !p.isDummy)
    const mentions = livingPlayers.map((p) => p.id)

    let playerListText = ''
    livingPlayers.forEach((p) => {
        const pLabel = p.displayName || `@${p.id.split('@')[0]}`
        playerListText += `*┆* (${toSmallNum(p.number)}) ⟡ ${pLabel}\n`
    })

    const votingCard = `*──  ୨୧ ✧ SIDANG BALAI DESA ✧ ୨୧  ──*
> ⚖️ _Matahari tepat di atas kepala, warga berkumpul menentukan takdir..._

*╭  〔 ✦ ᴅᴀꜰᴛᴀʀ ᴡᴀʀɢᴀ ʜɪᴅᴜᴘ 〕*
${playerListText.trim()}
*╰───────────────*

*╭  〔 ✦ ɪɴꜰᴏ ᴠᴏᴛɪɴɢ 〕*
*┆* ⟡ Waktu : *𝟿𝟶 Detik*
*┆* ⟡ Tekan tombol di bawah untuk memilih
*┆* ⟡ Atau ketik: *.ww vote <nomor>*
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Pilihlah dengan bijak, jangan biarkan Werewolf memperdaya kalian!_`

    const voteButtons = []
    livingPlayers.forEach((p) => {
        const pName = p.displayName || `@${p.id.split('@')[0]}`
        let label = `🗳️ Vote (${toSmallNum(p.number)}) ${pName}`
        if (label.length > 25) label = label.slice(0, 24) + '…'
        voteButtons.push([label, `.ww vote ${p.number}`])
    })
    voteButtons.push(['⏩ Lewati Voting', '.ww vote skip'])

    await conn.sendButton(chat, votingCard, 'Avelia • Werewolf Day Voting', null, voteButtons, null, {
        contextInfo: { mentionedJid: mentions }
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
*┆* ⟡ Nama : *${kTag}*
*┆* ⟡ Nomor : *${toSmallNum(killed.number)}*
*┆* ⟡ Identitas Asli : *${kTitle} ${kEmoji}*
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> 🌙 _Senja telah usai. Bersiaplah menghadapi malam yang mencekam..._`

        await conn.sendMessage(chat, {
            image: { url: thumbExecution },
            caption: execText,
            mentions: [killed.id]
        })

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
    let value = args[0]
    const target = args[1]
    const normalizedValue = String(value || "").toLowerCase()
    const isSecretCode = /^[A-Z0-9]{4,5}$/i.test(String(value || ""))
    const currentRoomPlayer = ww[chat]?.player?.find((player) => player.id === sender) || null
    const isDeadInRoom = !!(currentRoomPlayer && currentRoomPlayer.isdead)
    const allowedDeadCommands = ["delete", "info", "role", "player", "create", "join", "start", "exit", "guide"]

    conn.werewolfTest = conn.werewolfTest || {}
    const testState = conn.werewolfTest[chat]

    if (normalizedValue === "test") {
        if (!hasRpgPanelAccess(sender)) return m.reply(status.error("Command test hanya bisa digunakan owner bot."))
        if (ww[chat]) return m.reply(status.warning("Group masih dalam sesi permainan Werewolf aktif."))
        const testPlayers = [sender, ...[2, 3, 4, 5].map((number) => `ww-test-${number}@s.whatsapp.net`)]
        ww[chat] = {
            room: chat,
            owner: sender,
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
    if (ww[chat] && ww[chat].status && isSecretCode && !["create", "join", "start", "vote", "exit", "delete", "player", "info", "role", "guide"].includes(normalizedValue)) {
        const phase = ww[chat].time === "voting" ? "vote" : "night"
        const result = resolveSecretCodeAction(chat, sender, value, ww, phase)

        if (result.ok) {
            await m.react('✅')

            // Hapus chat klik tombol pengguna agar chat tetap bersih dan rahasia tidak bocor
            try {
                await conn.sendMessage(chat, { delete: m.key })
            } catch (e) {}

            // Pengiriman Hasil Penerawangan Khusus Seer via Dual Message
            if (phase === "night" && result.action === "check") {
                const targetPlayer = ww[chat].player.find((p) => p.number === result.targetNumber)
                const targetTag = targetPlayer ? `@${targetPlayer.id.split('@')[0]}` : `Pemain #${result.targetNumber}`
                const tRole = targetPlayer?.role || 'warga'
                const tEmoji = roleEmojis[tRole] || '👱‍♂️'
                const tTitle = roleTitles[tRole] || tRole.toUpperCase()

                const seerPrivateText = `*──  ୨୧ ✧ PENERAWANGAN SEER ✧ ୨୧  ──*
> 🔮 _Bola kristal mistis memancarkan aura kebenaran..._

*╭  〔 ✦ ʜᴀꜱɪʟ ᴘᴇɴᴇʀᴀᴡᴀɴɢᴀɴ 〕*
*┆* ⟡ Target : *${targetTag}*
*┆* ⟡ Identitas : *${tTitle} ${tEmoji}*
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> 🔒 _Gunakan informasi ini dengan bijak saat sidang desa besok!_`

                const seerSpectatorLock = `> 🔒 _[Penerawangan Seer telah dicatat oleh semesta desa...]_\n> 🔮 _Kabut malam menyelimuti rahasia yang terungkap._`

                await sendDualGroupMessage(conn, chat, sender, {
                    text: seerPrivateText,
                    mentions: targetPlayer ? [sender, targetPlayer.id] : [sender]
                }, seerSpectatorLock, {
                    contextInfo: {
                        mentionedJid: targetPlayer ? [sender, targetPlayer.id] : [sender]
                    }
                })
            }

            // Simulasi instan untuk testMode
            if (ww[chat].testMode && phase === "night") {
                ww[chat].player.filter((p) => p.id !== sender).forEach((p) => {
                    p.nightDone = true
                    p.lastNightAction = { type: "skip", label: "Simulasi" }
                })
                ww[chat].nightTarget = null
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

    if (value === "create") {
        if (chat in ww) return m.reply(status.warning("Group masih dalam sesi permainan Werewolf."))
        if (playerOnGame(sender, ww) === true) return m.reply(status.warning("Kamu masih terdaftar dalam sesi game Werewolf lain."))

        ww[chat] = {
            room: chat,
            owner: sender,
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
            phaseTimeout: null
        }

        const createCard = `*──  ୨୧ ✧ WEREWOLF ROOM CREATED ✧ ୨୧  ──*
> 🏰 _Balai desa telah dibuka untuk petualangan baru..._

*╭  〔 ✦ ɪɴꜰᴏ ʀᴏᴏᴍ 〕*
*┆* ⟡ Pemilik : *@${sender.split('@')[0]}*
*┆* ⟡ Minimal : *𝟻 Pemain*
*┆* ⟡ Maksimal : *𝟷𝟻 Pemain*
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Tekan tombol di bawah atau ketik *.ww join* untuk bergabung._`

        const createButtons = [
            ['⚔️ Gabung Room (.ww join)', `${usedPrefix || '.'}ww join`]
        ]

        await conn.sendButton(chat, createCard, 'Avelia • Werewolf Game', null, createButtons, m, {
            contextInfo: { mentionedJid: [sender] }
        })

    } else if (value === "join") {
        if (!ww[chat]) return m.reply(status.error("Belum ada sesi permainan Werewolf di grup ini. Buat dengan *.ww create*."))
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
            role: false,
            effect: [],
            vote: 0,
            isdead: false,
            isvote: false,
            isDummy: false,
            displayName: conn.getName(sender)
        }
        ww[chat].player.push(newPlayer)

        const jids = ww[chat].player.filter((p) => !p.isDummy).map((p) => p.id)
        let rosterText = ''
        ww[chat].player.forEach((p) => {
            rosterText += `*┆* (${toSmallNum(p.number)}) ⟡ ${getDisplayPlayerLabel(p)}\n`
        })

        const totalPlayers = ww[chat].player.length
        const isReadyToStart = totalPlayers >= 5

        const joinCard = `*──  ୨୧ ✧ WEREWOLF ROSTER ✧ ୨୧  ──*
> ⚔️ _Warga desa mulai berkumpul di balai pertemuan..._

*╭  〔 ✦ ᴅᴀꜰᴛᴀʀ ᴘᴇꜱᴇʀᴛᴀ (${toSmallNum(totalPlayers)}/𝟷𝟻) 〕*
${rosterText.trim()}
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Syarat bermain: Minimal 𝟻 pemain & maksimal 𝟷𝟻 pemain._`

        const joinButtons = []
        if (isReadyToStart) {
            joinButtons.push(['🚀 Mulai Game (.ww start)', `${usedPrefix || '.'}ww start`])
        }
        joinButtons.push(['⚔️ Gabung Lagi (.ww join)', `${usedPrefix || '.'}ww join`])

        await conn.sendButton(chat, joinCard, 'Avelia • Werewolf Game', null, joinButtons, m, {
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
        if (getRealPlayerCount(ww[chat]) < 1) return m.reply(status.error("Minimal 1 pemain asli untuk memulai game."))
        if (ww[chat].player.length < 5) return m.reply(status.warning(`Pemain belum mencukupi! Minimal 𝟻 pemain (saat ini: ${toSmallNum(ww[chat].player.length)}). Gunakan *.ww add warga* jika ingin menambah simulasi.`))
        if (ww[chat].status === true) return m.reply(status.warning("Permainan sudah berjalan."))
        if (ww[chat].owner !== sender && !hasRpgPanelAccess(sender)) return m.reply(status.error(`Hanya owner room (@${ww[chat].owner.split('@')[0]}) yang dapat memulai permainan.`))

        if (!roleGenerator(chat, ww)) {
            return m.reply(status.error("Gagal mendistribusikan role. Pastikan room valid."))
        }
        if (ww[chat].player.some((player) => !validRoleName(player.role))) {
            return m.reply(status.error("Terdapat pemain yang belum memperoleh role. Game dibatalkan."))
        }

        addTimer(chat, ww)
        startGame(chat, ww)

        await m.reply(status.success("Role rahasia berhasil dibagikan langsung di dalam grup via Dual Stanza! Tidak ada pesan yang dikirim ke PC/DM."))

        // Luncurkan Stanza Multi-Partisipan untuk Malam Pertama
        await sendNightPhaseStanza(conn, chat, ww[chat])

    } else if (value === "vote") {
        if (!ww[chat] || ww[chat].status === false || ww[chat].time !== "voting") {
            return m.reply(status.warning("Sesi voting siang belum dibuka."))
        }
        if (playerOnRoom(sender, chat, ww) === false || dataPlayer(sender, ww)?.isdead) {
            return m.reply(status.error("Hanya pemain yang masih hidup yang memiliki hak suara."))
        }
        if (dataPlayer(sender, ww)?.isvote) {
            return m.reply(status.warning("Kamu sudah memberikan suara pada sidang hari ini."))
        }

        if (target === "skip" || target === "0") {
            const voter = dataPlayer(sender, ww)
            if (voter) voter.isvote = true
            await m.react('✅')

            const allVoted = ww[chat].player.filter((p) => !p.isdead && !p.isDummy).every((p) => p.isvote)
            if (allVoted) {
                await resolveDayVoting(conn, chat, ww)
            }
            return
        }

        if (!target || isNaN(target)) return m.reply(status.warning("Masukkan nomor pemain yang valid atau pilih tombol vote."))

        const targetNum = parseInt(target)
        const targetPlayer = getPlayerById(chat, sender, targetNum, ww)
        if (!targetPlayer || targetPlayer.db.isdead) {
            return m.reply(status.error("Pemain target tidak ditemukan atau sudah gugur."))
        }

        vote(chat, targetNum, sender, ww)
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
        if (!playerExit(chat, sender, ww)) return m.reply(status.error("Kamu belum terdaftar di room ini."))
        m.reply(status.success("Berhasil keluar dari room Werewolf."))

    } else if (value === "delete") {
        if (!ww[chat]) return m.reply(status.warning("Tidak ada room Werewolf aktif di grup ini."))
        const canDelete = ww[chat].owner === sender || hasRpgPanelAccess(sender)
        if (!canDelete) return m.reply(status.error("Hanya owner room atau moderator yang dapat menghapus room."))

        if (ww[chat].phaseTimeout) {
            clearTimeout(ww[chat].phaseTimeout)
            ww[chat].phaseTimeout = null
        }

        delete ww[chat]
        await m.reply(status.success("Room Werewolf berhasil dihapus."))

    } else if (value === "player") {
        if (!ww[chat]) return m.reply(status.warning("Tidak ada sesi permainan Werewolf aktif."))
        const jids = ww[chat].player.filter((p) => !p.isDummy).map((p) => p.id)
        let text = `*──  ୨୧ ✧ WEREWOLF PLAYER LIST ✧ ୨୧  ──*\n> 📋 _Daftar status warga desa saat ini:_\n\n*╭  〔 ✦ ꜱᴛᴀᴛᴜꜱ ᴡᴀʀɢᴀ 〕*\n`
        ww[chat].player.forEach((p, index) => {
            p.number = index + 1
            const pLabel = getDisplayPlayerLabel(p)
            const roleInfo = p.isdead ? `☠️ [${(p.role || '—').toUpperCase()}]` : `💚 Hidup`
            text += `*┆* (${toSmallNum(p.number)}) ⟡ ${pLabel} - ${roleInfo}\n`
        })
        text += `*╰───────────────*\n· · ─ ─ ✦ ─ ─ · ·\n> _Pemain gugur tidak dapat beraksi._`

        await conn.sendMessage(chat, {
            image: { url: thumbNight },
            caption: text.trim(),
            mentions: jids
        }, { quoted: m })

    } else if (value === "info") {
        const infoText = `*──  ୨୧ ✧ WEREWOLF GAME INFO ✧ ୨୧  ──*
> 🐺 _Permainan deduksi sosial, strategi, dan intrik antar warga desa._

*╭  〔 ✦ ꜱɪꜱᴛᴇᴍ 𝟷𝟶𝟶% ɪɴ-ɢʀᴏᴜᴘ 〕*
*┆* ⟡ Tidak ada aksi via PC/DM (.wwpc dihapus)
*┆* ⟡ Semua role & tombol dikirim via 1 Dual Stanza grup
*┆* ⟡ Tombol aksi malam menggunakan tombol cepat Native Flow
*┆* ⟡ Penonton grup TIDAK menerima tombol apapun
*┆* ⟡ Aksi Seer langsung terungkap via Dual Message
*╰───────────────*

*╭  〔 ✦ ᴀʟᴜʀ ᴘᴇʀᴍᴀɪɴᴀɴ 〕*
*┆* 🌙 *Malam*: Pemain hidup memilih aksi rahasia lewat tombol.
*┆* ☀️ *Fajar*: Pengumuman korban dan hasil perlindungan.
*┆* ⚖️ *Siang*: Diskusi dan voting gantung tersangka Werewolf.
*┆* 🔁 Siklus berulang hingga salah satu pihak menang.
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Ketik *.ww guide* untuk panduan lengkap atau *.ww role* untuk daftar peran._`
        m.reply(infoText)

    } else if (value === "guide") {
        const guideText = `*──  ୨୧ ✧ PANDUAN BERMAIN ✧ ୨୧  ──*
> 📖 _Langkah-langkah memulai dan memainkan Werewolf:_

*╭  〔 ✦ 𝟷. ᴍᴇᴍʙᴜᴀᴛ ʀᴏᴏᴍ 〕*
*┆* Ketik *.ww create* untuk membuka room.
*┆* Pemain lain ketik *.ww join* (Minimal 𝟻, Maksimal 𝟷𝟻).
*╰───────────────*

*╭  〔 ✦ 𝟸. ᴍᴇᴍᴜʟᴀɪ ɢᴀᴍᴇ 〕*
*┆* Owner room mengetik *.ww start*.
*┆* Bot otomatis mengirimkan pesan terenkripsi ke grup.
*┆* Hanya kamu yang bisa melihat role & tombol tokomu!
*╰───────────────*

*╭  〔 ✦ 𝟹. ꜰᴀꜱᴇ ᴍᴀʟᴀᴍ 〕*
*┆* Tekan salah satu tombol aksi di bawah gelembung pesanmu.
*┆* Chat tombol otomatis disamarkan agar rahasiamu aman.
*╰───────────────*

*╭  〔 ✦ 𝟺. ꜰᴀꜱᴇ ᴠᴏᴛɪɴɢ 〕*
*┆* Tekan tombol vote di grup atau ketik *.ww vote <nomor>*.
*┆* Suara terbanyak akan dieksekusi di balai desa.
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Jaga kerahasiaan identitasmu dan bawa timmu menuju kemenangan!_`
        m.reply(guideText)

    } else if (value === "role") {
        const roleText = `*──  ୨୧ ✧ DAFTAR ROLE WEREWOLF ✧ ୨୧  ──*
> 🎭 _Kenali setiap peran dan kekuatannya di desa:_

*╭  〔 ✦ ᴛɪᴍ ᴡᴇʀᴇᴡᴏʟꜰ 〕*
*┆* 🐺 *Werewolf* : Memilih mangsa setiap malam.
*┆* 🔮 *Sorcerer* : Membantu Werewolf (racun & revive).
*╰───────────────*

*╭  〔 ✦ ᴛɪᴍ ᴡᴀʀɢᴀ ᴅᴇꜱᴀ 〕*
*┆* 👱‍♂️ *Warga* : Menemukan & mengeksekusi Werewolf.
*┆* 👳 *Seer* : Menerawang identitas asli pemain setiap malam.
*┆* 👼 *Guardian* : Melindungi 1 pemain dari terkaman malam.
*┆* 🏹 *Hunter* : Menembak 1 target jika dirinya gugur.
*┆* 👑 *Mayor* : Suara voting bernilai ganda (x𝟸).
*┆* ⚒️ *Blacksmith* : Memiliki armor penahan 𝟷 kali serangan.
*╰───────────────*

*╭  〔 ✦ ɪɴᴅᴇᴘᴇɴᴅᴇɴ 〕*
*┆* 🃏 *Jester* : Menang tunggal jika berhasil digantung warga.
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Setiap peran memiliki peran krusial dalam menentukan nasib desa!_`
        m.reply(roleText)

    } else {
        const menuText = `*──  ୨୧ ✧ WEREWOLF COMMANDS ✧ ୨୧  ──*
> 🐺 _Perintah yang tersedia untuk permainan Werewolf:_

*╭  〔 ✦ ᴄᴏᴍᴍᴀɴᴅ ᴜᴛᴀᴍᴀ 〕*
*┆* ⟡ *.ww create* : Buat room baru
*┆* ⟡ *.ww join* : Gabung ke room
*┆* ⟡ *.ww start* : Mulai game (Owner)
*┆* ⟡ *.ww player* : Lihat daftar pemain & status
*┆* ⟡ *.ww exit* : Keluar dari room sebelum mulai
*┆* ⟡ *.ww delete* : Hapus room (Owner/Mod)
*╰───────────────*

*╭  〔 ✦ ɪɴꜰᴏʀᴍᴀꜱɪ & ʙᴀɴᴛᴜᴀɴ 〕*
*┆* ⟡ *.ww info* : Ringkasan sistem in-group
*┆* ⟡ *.ww guide* : Panduan cara bermain
*┆* ⟡ *.ww role* : Daftar lengkap peran
*┆* ⟡ *.ww add warga <n>* : Tambah simulasi
*┆* ⟡ *.ww del warga* : Hapus simulasi
*╰───────────────*
· · ─ ─ ✦ ─ ─ · ·
> _Permainan 𝟷𝟶𝟶% di grup tanpa perlu berpindah ke PC/DM._`
        m.reply(menuText)
    }
}

handler.help = ['werewolf']
handler.tags = ['game']
handler.command = ['ww', 'werewolf']
handler.group = true

export default handler