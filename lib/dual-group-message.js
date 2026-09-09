import {
    encodeWAMessage,
    jidDecode,
    jidEncode,
    jidNormalizedUser,
    generateMessageIDV2,
    encodeSignedDeviceIdentity,
    areJidsSameUser,
    generateWAMessageContent,
    proto
} from '@whiskeysockets/baileys'

/**
 * Mengirim pesan grup dual-visibility menggunakan Targeted LID Participant Pre-Seeding:
 * - Langkah 1: Kirim interactiveMessage (tombol) ke room grup DITARGETKAN ke LID Pemain (participant: playerLid).
 *   Jika server WhatsApp meneruskan ke HP Pemain, HP Pemain mengunci ID ini sebagai Tombol!
 * - Langkah 2: Kirim extendedTextMessage (teks gembok) broadcast ke seluruh room grup dengan ID yang sama.
 *   HP Penonton yang belum menerima ID ini akan mengunci Gembok, sedangkan HP Pemain membuangnya karena duplikat!
 * 
 * @param {Object} conn - Instance socket Baileys
 * @param {string} groupJid - JID grup tujuan (contoh: '120363xxx@g.us')
 * @param {string} targetJid - JID pemain target (contoh: '6281241100804@s.whatsapp.net')
 * @param {Object} playerMessage - Objek proto.IMessage untuk pemain (mengandung interactiveMessage)
 * @param {string} spectatorText - Teks gembok untuk penonton grup
 * @param {Object} [options] - Opsi tambahan (quoted, contextInfo, messageId, delay, dll)
 * @returns {Promise<Object>} Metadata pesan yang terkirim
 */
export async function sendDualGroupMessage(conn, groupJid, targetJid, playerMessage, spectatorText, options = {}) {
    if (!conn) throw new Error('Parameter conn (socket) diperlukan!')
    if (!groupJid) throw new Error('Parameter groupJid diperlukan!')
    if (!targetJid) throw new Error('Parameter targetJid diperlukan!')

    const isGroup = groupJid.endsWith('@g.us')
    
    // Fallback jika dipanggil di DM: kirim tombol biasa
    if (!isGroup) {
        return await conn.relayMessage(groupJid, playerMessage, {
            messageId: options.messageId || generateMessageIDV2(conn.user?.id),
            ...options
        })
    }

    const meId = conn.authState?.creds?.me?.id || conn.user?.id
    if (!meId) throw new Error('Bot belum terautentikasi (meId tidak ditemukan)')

    const cleanTargetJid = jidNormalizedUser(targetJid)
    const targetDigits = cleanTargetJid.split('@')[0].split(':')[0].replace(/\D/g, '')
    const msgId = options.messageId || generateMessageIDV2(meId)

    const meDigits = meId.split('@')[0].split(':')[0].replace(/\D/g, '')
    const meLid = conn.authState?.creds?.me?.lid || null
    const meLidDigits = meLid ? meLid.split('@')[0].split(':')[0].replace(/\D/g, '') : null

    // 1. Resolusi Metadata Grup, Addressing Mode & LID Pemain
    let groupMeta = null
    let addressingMode = 'pn'
    let resolvedParticipantJid = cleanTargetJid
    let foundPlayer = null

    // Helper untuk mencocokkan user baik via LID, PN, maupun digit nomor
    const isMatchingUser = (p, checkJid, checkDigits) => {
        if (!p) return false
        const id = p.id || ''
        const jid = p.jid || ''
        const lid = p.lid || ''
        if (checkJid && (id === checkJid || jid === checkJid || lid === checkJid)) return true
        const idDigits = id.split('@')[0].split(':')[0].replace(/\D/g, '')
        const jidDigits = jid.split('@')[0].split(':')[0].replace(/\D/g, '')
        const lidDigits = lid.split('@')[0].split(':')[0].replace(/\D/g, '')
        const phoneDigits = String(p.phoneNumber || p.phone || p.pn || '').replace(/\D/g, '')
        if (checkDigits && (idDigits === checkDigits || jidDigits === checkDigits || lidDigits === checkDigits || phoneDigits === checkDigits)) return true
        return false
    }

    try {
        groupMeta = await conn.groupMetadata(groupJid).catch(() => null)
        addressingMode = groupMeta?.addressingMode || 'pn'
        
        foundPlayer = groupMeta?.participants?.find(p => isMatchingUser(p, cleanTargetJid, targetDigits))

        if (foundPlayer) {
            resolvedParticipantJid = (addressingMode === 'lid' && foundPlayer.lid) 
                ? foundPlayer.lid 
                : (foundPlayer.id || cleanTargetJid)
        }
    } catch (e) {
        console.warn('[DUAL-GROUP] Gagal ambil groupMetadata:', e?.message)
    }

    const isLidGroup = addressingMode === 'lid'
    console.log(`[DUAL-GROUP] 🔍 Target: ${cleanTargetJid} (Digits: ${targetDigits}) -> Resolved: ${resolvedParticipantJid} (Mode: ${addressingMode})`)

    // 2. Siapkan Objek Pesan Penonton (Teks Gembok / Pesan Interaktif)
    let spectatorMsg
    if (typeof spectatorText === 'string') {
        spectatorMsg = {
            extendedTextMessage: {
                text: spectatorText,
                ...(options.contextInfo ? { contextInfo: options.contextInfo } : {})
            }
        }
    } else if (spectatorText && typeof spectatorText === 'object') {
        spectatorMsg = spectatorText.message || spectatorText
        if (options.contextInfo) {
            const mtype = Object.keys(spectatorMsg)[0]
            if (mtype && spectatorMsg[mtype]) {
                spectatorMsg[mtype].contextInfo = {
                    ...(spectatorMsg[mtype].contextInfo || {}),
                    ...options.contextInfo
                }
            }
        }
    }

    let playerMsg = playerMessage?.message || playerMessage

    // 3. Node interaktif biz WhatsApp untuk Native Flow Buttons
    const bizNode = {
        tag: 'biz',
        attrs: {},
        content: [
            {
                tag: 'interactive',
                attrs: { type: 'native_flow', v: '1' },
                content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
            }
        ]
    }

    let shouldIncludeDeviceIdentity = false
    const binaryNodeContent = []

    await conn.authState.keys.transaction(async () => {
        // A. Kumpulkan perangkat Pemain yang valid
        const playerJids = new Set()
        const primaryPlayerJid = (isLidGroup && foundPlayer?.lid) ? foundPlayer.lid : resolvedParticipantJid
        const isPlayerLid = primaryPlayerJid.endsWith('@lid')
        const playerDomain = isPlayerLid ? 'lid' : 's.whatsapp.net'

        const { user: pu, device: pd } = jidDecode(primaryPlayerJid)
        if (pu) {
            playerJids.add(jidEncode(pu, playerDomain, pd || 0))
        }

        try {
            if (typeof conn.getUSyncDevices === 'function') {
                const rawDevices = await conn.getUSyncDevices([primaryPlayerJid], false, false)
                if (Array.isArray(rawDevices)) {
                    for (const { user, device } of rawDevices) {
                        playerJids.add(jidEncode(user, playerDomain, device || 0))
                    }
                }
            }
        } catch (devErr) {
            console.warn('[DUAL-GROUP] Warning getUSyncDevices player:', devErr?.message)
        }

        const playerJidsList = Array.from(playerJids)

        // B. Kumpulkan perangkat seluruh Penonton di grup (kecuali bot dan pemain)
        const spectatorParticipantJids = []
        const spectatorJids = new Set()
        const spectatorDomainMap = new Map()

        if (groupMeta?.participants && Array.isArray(groupMeta.participants)) {
            for (const p of groupMeta.participants) {
                if (!p) continue
                // Lewati bot sendiri
                const isBot = isMatchingUser(p, meId, meDigits) || (meLid && isMatchingUser(p, meLid, meLidDigits))
                if (isBot) continue

                // Lewati pemain
                const isPlayer = isMatchingUser(p, cleanTargetJid, targetDigits) || 
                                 isMatchingUser(p, primaryPlayerJid, null) ||
                                 (foundPlayer && isMatchingUser(p, foundPlayer.id, null))
                if (isPlayer) continue

                const specJid = (isLidGroup && p.lid) ? p.lid : (p.id || p.jid)
                if (!specJid) continue
                spectatorParticipantJids.push(specJid)

                const isSpecLid = specJid.endsWith('@lid')
                const domain = isSpecLid ? 'lid' : 's.whatsapp.net'
                const { user: su, device: sd } = jidDecode(specJid)
                if (su) {
                    spectatorDomainMap.set(su, domain)
                    spectatorJids.add(jidEncode(su, domain, sd || 0))
                }
            }

            // Sync multi-device untuk para penonton
            if (spectatorParticipantJids.length > 0 && typeof conn.getUSyncDevices === 'function') {
                try {
                    const rawSpecDevices = await conn.getUSyncDevices(spectatorParticipantJids, false, false)
                    if (Array.isArray(rawSpecDevices)) {
                        for (const { user, device } of rawSpecDevices) {
                            const domain = spectatorDomainMap.get(user) || (isLidGroup ? 'lid' : 's.whatsapp.net')
                            spectatorJids.add(jidEncode(user, domain, device || 0))
                        }
                    }
                } catch (specDevErr) {
                    console.warn('[DUAL-GROUP] Warning getUSyncDevices spectators:', specDevErr?.message)
                }
            }
        }

        const spectatorJidsList = Array.from(spectatorJids)

        try {
            const fs = await import('fs')
            fs.writeFileSync('./lib/database/last_dual_debug.json', JSON.stringify({
                time: new Date().toISOString(),
                groupJid,
                addressingMode,
                meId,
                meLid,
                cleanTargetJid,
                targetDigits,
                foundPlayer,
                primaryPlayerJid,
                playerJidsList,
                spectatorParticipantJids,
                spectatorJidsList
            }, null, 2))
        } catch (e) {}

        console.log(`[DUAL-GROUP] 🎯 Pemain (${playerJidsList.length} dev):`, playerJidsList)
        console.log(`[DUAL-GROUP] 👥 Penonton (${spectatorJidsList.length} dev):`, spectatorJidsList)

        // C. Assert Sessions untuk seluruh perangkat (Pemain + Penonton)
        const allDeviceJids = [...playerJidsList, ...spectatorJidsList]
        if (typeof conn.assertSessions === 'function' && allDeviceJids.length > 0) {
            await conn.assertSessions(allDeviceJids, false).catch(err => {
                console.warn('[DUAL-GROUP] assertSessions warning:', err?.message)
            })
        }

        // D. Buat Isolated Sender Key khusus untuk Penonton
        const libsignal = await import('libsignal')
        const {
            keyhelper,
            SenderKeyRecord,
            SenderKeyName,
            GroupCipher,
            SenderKeyDistributionMessage
        } = await import('@whiskeysockets/baileys/lib/Signal/Group/index.js')

        const keyId = keyhelper.generateSenderKeyId()
        const senderKey = keyhelper.generateSenderKey()
        const signingKey = keyhelper.generateSenderSigningKey()
        const isolatedRecord = new SenderKeyRecord()
        isolatedRecord.setSenderKeyState(keyId, 0, senderKey, signingKey)

        const state = isolatedRecord.getSenderKeyState()
        const distMsg = new SenderKeyDistributionMessage(keyId, 0, state.getSenderChainKey().getSeed(), signingKey.public)

        const { user: meUser, device: meDevice } = jidDecode(meId)
        const protoAddr = new libsignal.ProtocolAddress(meUser, meDevice || 0)
        const senderName = new SenderKeyName(groupJid, protoAddr)

        const isolatedStore = {
            loadSenderKey: async () => isolatedRecord,
            storeSenderKey: async () => {}
        }
        const groupCipher = new GroupCipher(isolatedStore, senderName)
        const spectatorBytes = encodeWAMessage(spectatorMsg)
        const spectatorCiphertext = await groupCipher.encrypt(spectatorBytes)

        // E. Distribusikan via Pairwise Nodes:
        // - Pemain menerima pairwise pkmsg berisi playerMessage
        // - Penonton menerima pairwise pkmsg berisi SenderKeyDistributionMessage untuk isolated keyId
        const spectatorKeyDistMsg = {
            senderKeyDistributionMessage: {
                axolotlSenderKeyDistributionMessage: distMsg.serialize(),
                groupId: groupJid
            }
        }

        const [playerResult, spectatorResult] = await Promise.all([
            playerJidsList.length > 0
                ? conn.createParticipantNodes(playerJidsList, playerMsg, {})
                : Promise.resolve({ nodes: [], shouldIncludeDeviceIdentity: false }),
            spectatorJidsList.length > 0
                ? conn.createParticipantNodes(spectatorJidsList, spectatorKeyDistMsg, {})
                : Promise.resolve({ nodes: [], shouldIncludeDeviceIdentity: false })
        ])

        shouldIncludeDeviceIdentity = Boolean(playerResult?.shouldIncludeDeviceIdentity || spectatorResult?.shouldIncludeDeviceIdentity)

        const allParticipantNodes = [
            ...(playerResult?.nodes || []),
            ...(spectatorResult?.nodes || [])
        ].filter(node => node && node.tag === 'to' && node.attrs?.jid && Array.isArray(node.content) && node.content.length > 0)

        if (allParticipantNodes.length > 0) {
            binaryNodeContent.push({
                tag: 'participants',
                attrs: {},
                content: allParticipantNodes
            })
        }

        // F. Masukkan skmsg ke dalam stanza (WAJIB agar Chatd meneruskan ke room grup!)
        binaryNodeContent.push({
            tag: 'enc',
            attrs: { v: '2', type: 'skmsg' },
            content: spectatorCiphertext
        })

        if (shouldIncludeDeviceIdentity && conn.authState?.creds?.account) {
            binaryNodeContent.push({
                tag: 'device-identity',
                attrs: {},
                content: encodeSignedDeviceIdentity(conn.authState.creds.account, true)
            })
        }

        // G. Tambahkan node biz interaktif jika pesan pemain atau penonton interaktif
        const isInteractive = Boolean(
            playerMsg?.interactiveMessage || 
            playerMsg?.viewOnceMessage?.message?.interactiveMessage ||
            spectatorMsg?.interactiveMessage ||
            spectatorMsg?.viewOnceMessage?.message?.interactiveMessage
        )
        if (isInteractive) {
            binaryNodeContent.push(bizNode)
        }

        // H. Susun dan Kirim 1 Stanza Tunggal ke Grup (Hanya 1 Pesan yang Masuk ke Chat!)
        const stanza = {
            tag: 'message',
            attrs: {
                to: groupJid,
                id: msgId,
                type: 'text',
                addressing_mode: addressingMode
            },
            content: binaryNodeContent
        }

        console.log(`[DUAL-GROUP] 📤 Mengirim Pure Pairwise Group Stanza (${allParticipantNodes.length} nodes, ID: ${msgId}) ke Chatd Server...`)
        await conn.sendNode(stanza)
        console.log(`[DUAL-GROUP] ✅ 1 Pesan Dual-Visibility berhasil terkirim ke ${groupJid}!`)
    })

    return {
        key: {
            remoteJid: groupJid,
            fromMe: true,
            id: msgId,
            participant: conn.user?.jid || conn.user?.id
        },
        status: 2
    }
}

/**
 * Mengirim pengumuman grup terpersonalisasi (Personalized Ghost Tagall ala tesbutton 7):
 * - Setiap member grup di HP-nya HANYA melihat pesan dengan mention dirinya sendiri (@userN).
 * - Tidak ada tampilan daftar ratusan nomor HP.
 * - Menggunakan arsitektur pairwise signal encryption fanout dalam satu room grup.
 * 
 * @param {Object} conn - Instance socket Baileys
 * @param {string} groupJid - JID grup tujuan
 * @param {Array} rawParticipants - Daftar participant grup (dari handler atau groupMetadata)
 * @param {string} messageText - Isi teks pengumuman
 * @param {Object} [options] - Opsi tambahan
 */
export async function sendPersonalizedGroupTagall(conn, groupJid, rawParticipants, messageText = '', options = {}) {
    if (!conn) throw new Error('Parameter conn diperlukan!')
    if (!groupJid) throw new Error('Parameter groupJid diperlukan!')

    const isGroup = groupJid.endsWith('@g.us')
    if (!isGroup) {
        return await conn.sendMessage(groupJid, { text: messageText }, options)
    }

    const meId = conn.authState?.creds?.me?.id || conn.user?.id
    if (!meId) throw new Error('Bot belum terautentikasi (meId tidak ditemukan)')

    const meDigits = meId.split('@')[0].split(':')[0].replace(/\D/g, '')
    const meLid = conn.authState?.creds?.me?.lid || null
    const meLidDigits = meLid ? meLid.split('@')[0].split(':')[0].replace(/\D/g, '') : null

    // 1. Resolusi Metadata Grup & Addressing Mode
    let groupMeta = null
    let addressingMode = 'pn'
    let participants = rawParticipants || []

    try {
        groupMeta = await conn.groupMetadata(groupJid)
        addressingMode = groupMeta?.addressingMode || 'pn'
        if (groupMeta?.participants && groupMeta.participants.length > 0) {
            participants = groupMeta.participants
        }
    } catch (e) {
        console.warn('[PERSONALIZED-TAGALL] Gagal ambil groupMetadata:', e?.message)
    }

    const isLidGroup = addressingMode === 'lid'

    // Helper identifikasi kecocokan user
    const isMatchingUser = (p, checkJid, checkDigits) => {
        if (!p) return false
        const id = p.id || ''
        const jid = p.jid || ''
        const lid = p.lid || ''
        if (checkJid && (id === checkJid || jid === checkJid || lid === checkJid)) return true
        const idDigits = id.split('@')[0].split(':')[0].replace(/\D/g, '')
        const jidDigits = jid.split('@')[0].split(':')[0].replace(/\D/g, '')
        const lidDigits = lid.split('@')[0].split(':')[0].replace(/\D/g, '')
        if (checkDigits && (idDigits === checkDigits || jidDigits === checkDigits || lidDigits === checkDigits)) return true
        return false
    }

    // Filter seluruh member selain bot
    const validMembers = []
    for (const p of participants) {
        const isBot = isMatchingUser(p, meId, meDigits) || (meLid && isMatchingUser(p, meLid, meLidDigits))
        if (isBot) continue

        let phoneJid = ''
        let lidJid = ''

        if (typeof p === 'string') {
            if (p.endsWith('@s.whatsapp.net')) phoneJid = jidNormalizedUser(p)
            else if (p.endsWith('@lid')) lidJid = jidNormalizedUser(p)
            else {
                const clean = p.split('@')[0].split(':')[0].replace(/\D/g, '')
                if (clean) phoneJid = `${clean}@s.whatsapp.net`
            }
        } else if (typeof p === 'object') {
            if (p.jid && p.jid.endsWith('@s.whatsapp.net')) phoneJid = jidNormalizedUser(p.jid)
            else if (p.id && p.id.endsWith('@s.whatsapp.net')) phoneJid = jidNormalizedUser(p.id)
            else if (p.phoneNumber || p.phone || p.pn) {
                const clean = String(p.phoneNumber || p.phone || p.pn).replace(/\D/g, '')
                if (clean) phoneJid = `${clean}@s.whatsapp.net`
            }

            if (p.lid && p.lid.endsWith('@lid')) lidJid = jidNormalizedUser(p.lid)
            else if (p.id && p.id.endsWith('@lid')) lidJid = jidNormalizedUser(p.id)
        }

        const lidDigits = lidJid ? lidJid.split('@')[0].split(':')[0].replace(/\D/g, '') : ''

        // Coba resolusi phoneJid jika belum ada tapi lidJid ada
        if (!phoneJid && lidJid) {
            if (typeof conn.decodeJid === 'function') {
                const dec = conn.decodeJid(lidJid)
                if (dec && dec.endsWith('@s.whatsapp.net')) phoneJid = jidNormalizedUser(dec)
            }
            if (!phoneJid && global.lids?.[lidJid]) phoneJid = jidNormalizedUser(global.lids[lidJid])
            if (!phoneJid && global.db?.data?.lids?.[lidJid]) phoneJid = jidNormalizedUser(global.db.data.lids[lidJid])
            if (!phoneJid && conn.contacts?.[lidJid]?.jid) phoneJid = jidNormalizedUser(conn.contacts[lidJid].jid)
            if (!phoneJid && global.db?.data?.users) {
                for (const [uJid, uData] of Object.entries(global.db.data.users)) {
                    if ((uData?.lid === lidJid || uData?.lid === lidDigits) && uJid.endsWith('@s.whatsapp.net')) {
                        phoneJid = jidNormalizedUser(uJid)
                        break
                    }
                }
            }
        }

        const phoneDigits = phoneJid ? phoneJid.split('@')[0].split(':')[0].replace(/\D/g, '') : ''

        // Primary JID untuk enkripsi stanza (mengikuti addressingMode grup)
        const primaryJid = (isLidGroup && lidJid) ? lidJid : (phoneJid || lidJid || (typeof p === 'string' ? p : (p.id || p.jid)))
        if (!primaryJid) continue

        // Resolusi Nama Pengguna (Prioritas: Database Bot -> PushName / Kontak WhatsApp -> Nomor HP)
        let resolvedName = null
        const dbUser = (phoneJid && global.db?.data?.users?.[phoneJid]) || (lidJid && global.db?.data?.users?.[lidJid])
        if (dbUser?.name && typeof dbUser.name === 'string') {
            const n = dbUser.name.trim()
            if (n && !n.includes('@lid') && n !== phoneDigits && n !== `+${phoneDigits}`) {
                resolvedName = n
            }
        }

        if (!resolvedName && typeof p === 'object') {
            const pName = p.name || p.notify || p.displayName
            if (pName && typeof pName === 'string') {
                const n = pName.trim()
                if (n && !n.includes('@lid') && n !== phoneDigits) {
                    resolvedName = n
                }
            }
        }

        if (!resolvedName && typeof conn.getName === 'function' && (phoneJid || primaryJid)) {
            try {
                const nm = conn.getName(phoneJid || primaryJid)
                if (typeof nm === 'string') {
                    const n = nm.trim()
                    if (n && !n.includes('@lid') && n !== phoneDigits && n !== `+${phoneDigits}`) {
                        resolvedName = n
                    }
                }
            } catch (e) {}
        }

        // Tag label: Utamakan Nama jika ada, atau Nomor HP asli (BUKAN nomor LID)
        const userTag = resolvedName || phoneDigits || 'member'

        validMembers.push({
            raw: p,
            phoneJid,
            phoneDigits,
            lidJid,
            lidDigits,
            primaryJid,
            userTag,
            name: resolvedName
        })
    }

    if (validMembers.length === 0) {
        throw new Error('Tidak ada anggota yang dapat di-tag.')
    }

    console.log(`[PERSONALIZED-TAGALL] 👥 Menyiapkan pengumuman untuk ${validMembers.length} member di ${groupJid}...`)

    // 2. Chunking / Batching (Maksimal 30 member per stanza agar tidak melebihi batas 64 KB Chatd)
    const BATCH_SIZE = 30
    const batches = []
    for (let i = 0; i < validMembers.length; i += BATCH_SIZE) {
        batches.push(validMembers.slice(i, i + BATCH_SIZE))
    }

    const libsignal = await import('libsignal')
    const {
        keyhelper,
        SenderKeyRecord,
        SenderKeyName,
        GroupCipher
    } = await import('@whiskeysockets/baileys/lib/Signal/Group/index.js')

    const cleanPesan = (messageText || '').trim() || 'Perhatian untuk seluruh anggota grup.'

    let lastResult = null

    for (let bIndex = 0; bIndex < batches.length; bIndex++) {
        const currentBatch = batches[bIndex]
        const msgId = options.messageId ? `${options.messageId}_${bIndex}` : generateMessageIDV2(meId)

        await conn.authState.keys.transaction(async () => {
            // A. Ambil foto profil masing-masing member di batch ini secara paralel (prioritas phoneJid)
            const avatarPromises = currentBatch.map(async (member) => {
                let url = null
                try {
                    if (typeof conn.profilePictureUrl === 'function') {
                        if (member.phoneJid) {
                            url = await conn.profilePictureUrl(member.phoneJid, 'image').catch(() => null)
                        }
                        if (!url && member.primaryJid && member.primaryJid !== member.phoneJid) {
                            url = await conn.profilePictureUrl(member.primaryJid, 'image').catch(() => null)
                        }
                        if (!url && member.lidJid && member.lidJid !== member.primaryJid) {
                            url = await conn.profilePictureUrl(member.lidJid, 'image').catch(() => null)
                        }
                    }
                } catch (e) {}
                return { primaryJid: member.primaryJid, url }
            })
            const avatarResults = await Promise.all(avatarPromises)
            const avatarMap = new Map(avatarResults.map(a => [a.primaryJid, a.url]))

            // B. Kumpulkan perangkat dan pesan terpersonalisasi untuk setiap member di batch ini
            const participantNodesList = []
            const allBatchDeviceJids = []

            for (const member of currentBatch) {
                const memberDeviceJids = new Set()
                const { user: mu, device: md } = jidDecode(member.primaryJid)
                memberDeviceJids.add(jidEncode(mu, isLidGroup ? 'lid' : 's.whatsapp.net', md || 0))

                // Ambil daftar perangkat multi-device jika tersedia
                try {
                    if (typeof conn.getUSyncDevices === 'function') {
                        const rawDevs = await conn.getUSyncDevices([member.primaryJid], false, false)
                        if (Array.isArray(rawDevs)) {
                            for (const { user, device } of rawDevs) {
                                memberDeviceJids.add(jidEncode(user, isLidGroup ? 'lid' : 's.whatsapp.net', device || 0))
                            }
                        }
                    }
                } catch (e) {}

                const devList = Array.from(memberDeviceJids)
                allBatchDeviceJids.push(...devList)

                // Penerjemahan LID -> Nomor / Phone JID agar tag berwarna biru (@${who.split('@')[0]})
                const whoJid = member.phoneJid || (member.phoneDigits ? `${member.phoneDigits}@s.whatsapp.net` : member.primaryJid)
                const whoNumber = whoJid.split('@')[0].split(':')[0].replace(/\D/g, '') || member.phoneDigits

                // Susun Teks Personalisasi Khusus untuk Member Ini (1 User 1 Tag Mandiri ala tesbutton 7)
                const memberCaption = `*──  ୨୧ ✧ PENGUMUMAN GRUP ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> Pesan panggilan penting untukmu @${whoNumber} ♡
> ${cleanPesan}`.trim()

                // Pastikan mentionedJid HANYA berisi phone JID (@s.whatsapp.net) yang cocok dengan @${whoNumber}
                // Ini WAJIB agar tag di aplikasi WhatsApp berubah menjadi link biru aktif (berwarna)!
                const mentionedList = [whoJid.endsWith('@s.whatsapp.net') ? whoJid : `${whoNumber}@s.whatsapp.net`]

                const memberAvatar = avatarMap.get(member.primaryJid)
                let memberMsg = null

                // Jika member memiliki foto profil, pasang PP member tersebut di pesannya
                if (memberAvatar && conn.waUploadToServer) {
                    try {
                        memberMsg = await generateWAMessageContent({
                            image: { url: memberAvatar },
                            caption: memberCaption,
                            contextInfo: {
                                mentionedJid: mentionedList
                            }
                        }, { upload: conn.waUploadToServer })
                    } catch (imgErr) {
                        console.warn(`[PERSONALIZED-TAGALL] Gagal upload PP @${member.userTag}, fallback ke teks:`, imgErr?.message)
                    }
                }

                // Fallback ke pesan teks jika member tidak memasang PP atau upload gagal
                if (!memberMsg) {
                    memberMsg = {
                        extendedTextMessage: {
                            text: memberCaption,
                            contextInfo: {
                                mentionedJid: mentionedList
                            }
                        }
                    }
                }

                // Enkripsi pairwise node khusus untuk perangkat member ini
                try {
                    const nodeRes = await conn.createParticipantNodes(devList, memberMsg, {})
                    if (nodeRes?.nodes && nodeRes.nodes.length > 0) {
                        participantNodesList.push(...nodeRes.nodes)
                    }
                } catch (nodeErr) {
                    console.warn(`[PERSONALIZED-TAGALL] Warning enkripsi node @${member.userTag}:`, nodeErr?.message)
                }
            }

            // B. Assert Sessions jika ada
            if (typeof conn.assertSessions === 'function' && allBatchDeviceJids.length > 0) {
                await conn.assertSessions(allBatchDeviceJids, false).catch(() => {})
            }

            // C. Buat Isolated Sender Key sebagai fallback penonton / server routing skmsg
            const fallbackCaption = `*──  ୨୧ ✧ PENGUMUMAN GRUP ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> Pesan panggilan penting untuk seluruh anggota ♡
> ${cleanPesan}`.trim()

            const fallbackMessage = {
                extendedTextMessage: {
                    text: fallbackCaption,
                    ...(options.contextInfo ? { contextInfo: options.contextInfo } : {})
                }
            }

            const keyId = keyhelper.generateSenderKeyId()
            const senderKey = keyhelper.generateSenderKey()
            const signingKey = keyhelper.generateSenderSigningKey()
            const isolatedRecord = new SenderKeyRecord()
            isolatedRecord.setSenderKeyState(keyId, 0, senderKey, signingKey)

            const { user: meUser, device: meDevice } = jidDecode(meId)
            const protoAddr = new libsignal.ProtocolAddress(meUser, meDevice || 0)
            const senderName = new SenderKeyName(groupJid, protoAddr)

            const isolatedStore = {
                loadSenderKey: async () => isolatedRecord,
                storeSenderKey: async () => {}
            }
            const groupCipher = new GroupCipher(isolatedStore, senderName)
            const fallbackBytes = encodeWAMessage(fallbackMessage)
            const fallbackCiphertext = await groupCipher.encrypt(fallbackBytes)

            // D. Susun Binary Node Content
            const binaryNodeContent = []

            const filteredNodes = participantNodesList.filter(
                node => node && node.tag === 'to' && node.attrs?.jid && Array.isArray(node.content) && node.content.length > 0
            )

            if (filteredNodes.length > 0) {
                binaryNodeContent.push({
                    tag: 'participants',
                    attrs: {},
                    content: filteredNodes
                })
            }

            // Tambahkan skmsg agar Chatd server menganggap ini pesan obrolan grup resmi
            binaryNodeContent.push({
                tag: 'enc',
                attrs: { v: '2', type: 'skmsg' },
                content: fallbackCiphertext
            })

            // Tambahkan device-identity jika dibutuhkan
            if (conn.authState?.creds?.account) {
                binaryNodeContent.push({
                    tag: 'device-identity',
                    attrs: {},
                    content: encodeSignedDeviceIdentity(conn.authState.creds.account, true)
                })
            }

            // E. Susun Stanza Utama
            const stanza = {
                tag: 'message',
                attrs: {
                    to: groupJid,
                    id: msgId,
                    type: 'text',
                    addressing_mode: addressingMode
                },
                content: binaryNodeContent
            }

            console.log(`[PERSONALIZED-TAGALL] 📤 Mengirim Stanza Batch ${bIndex + 1}/${batches.length} (${filteredNodes.length} nodes) ke ${groupJid}...`)
            await conn.sendNode(stanza)
            console.log(`[PERSONALIZED-TAGALL] ✅ Stanza Batch ${bIndex + 1} terkirim!`)

            lastResult = {
                key: {
                    remoteJid: groupJid,
                    fromMe: true,
                    id: msgId,
                    participant: meId
                },
                status: 2
            }
        })

        // Jeda aman antar batch jika ada beberapa batch
        if (bIndex < batches.length - 1) {
            await new Promise(r => setTimeout(r, 1000))
        }
    }

    return lastResult
}

/**
 * Mengirim pesan ke dalam grup yang HANYA ditargetkan dan diterima oleh 1 participant spesifik
 * (Bukan PC/DM, pesan tetap berada di dalam room grup).
 */
export async function sendTargetedGroupMessage(conn, groupJid, targetJid, messageContent, options = {}) {
    if (!conn) throw new Error('Parameter conn diperlukan!')
    if (!groupJid) throw new Error('Parameter groupJid diperlukan!')
    if (!targetJid) throw new Error('Parameter targetJid diperlukan!')

    const isGroup = groupJid.endsWith('@g.us')
    if (!isGroup) {
        return await conn.sendMessage(groupJid, typeof messageContent === 'string' ? { text: messageContent } : messageContent, options)
    }

    const cleanTargetJid = jidNormalizedUser(targetJid)
    const targetDigits = cleanTargetJid.split('@')[0].split(':')[0].replace(/\D/g, '')

    let groupMeta = null
    let addressingMode = 'pn'
    let resolvedParticipantJid = cleanTargetJid

    try {
        groupMeta = await conn.groupMetadata(groupJid)
        addressingMode = groupMeta?.addressingMode || 'pn'
        const found = groupMeta?.participants?.find(p => {
            const pDigits = (p.id || '').split('@')[0].split(':')[0].replace(/\D/g, '')
            const pLidDigits = (p.lid || '').split('@')[0].split(':')[0].replace(/\D/g, '')
            return pDigits === targetDigits || pLidDigits === targetDigits || p.id === cleanTargetJid
        })
        if (found) {
            resolvedParticipantJid = (addressingMode === 'lid' && found.lid) ? found.lid : (found.id || cleanTargetJid)
        }
    } catch (e) {
        console.warn('[TARGETED-GROUP] GroupMeta error:', e?.message)
    }

    const msgId = options.messageId || generateMessageIDV2(conn.user?.id)

    let msgObj = messageContent
    if (typeof messageContent === 'string') {
        msgObj = { extendedTextMessage: { text: messageContent } }
    } else if (messageContent.text && !messageContent.extendedTextMessage) {
        msgObj = { extendedTextMessage: { text: messageContent.text, mentions: messageContent.mentions } }
    }

    return await conn.relayMessage(groupJid, msgObj, {
        messageId: msgId,
        participant: { jid: resolvedParticipantJid },
        additionalAttributes: {
            addressing_mode: addressingMode
        },
        ...options
    })
}

export default {
    sendDualGroupMessage,
    sendPersonalizedGroupTagall,
    sendTargetedGroupMessage
}
