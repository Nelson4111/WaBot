import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

// Dynamic 64-bar acoustic waveform extracted from media/voice-notes/avelia.ogg (range 0-100)
const aveliaWaveform = Uint8Array.from([
    63, 65, 29, 8, 50, 53, 21, 51, 47, 47, 28, 52, 68, 46, 44, 59,
    58, 60, 33, 41, 72, 41, 41, 22, 43, 31, 45, 53, 41, 100, 53, 74,
    21, 60, 52, 50, 26, 34, 21, 63, 54, 58, 20, 75, 69, 56, 43, 39,
    33, 30, 71, 72, 42, 32, 38, 21, 24, 47, 19, 48, 42, 43, 46, 7
])

// Deduplication map to prevent double-greeting (e.g. invite link + participant update)
const introCooldowns = new Map()

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Sends Avelia's official group intro card & voice note greeting with anti-spam presence animations.
 * Dilengkapi proses pematangan koneksi grup & reset sender-key agar tidak terjadi "Menunggu pesan ini".
 * @param {object} conn - Baileys WASocket connection instance
 * @param {string} groupJid - Target group JID (e.g. 120363xxx@g.us)
 */
export async function sendBotGroupIntro(conn, groupJid) {
    if (!conn || !groupJid) return
    const cleanJid = groupJid.endsWith('@g.us') ? groupJid : `${groupJid.split('@')[0]}@g.us`

    // 1. Cooldown check (120 seconds TTL per group)
    const now = Date.now()
    const lastSent = introCooldowns.get(cleanJid) || 0
    if (now - lastSent < 120_000) {
        console.log(chalk.gray(`[bot-intro] Skip sapaan untuk ${cleanJid} (dalam cooldown)`))
        return
    }
    introCooldowns.set(cleanJid, now)

    // Memory maintenance
    if (introCooldowns.size > 100) {
        for (const [key, timestamp] of introCooldowns.entries()) {
            if (now - timestamp > 300_000) introCooldowns.delete(key)
        }
    }

    console.log(chalk.cyan(`[bot-intro] ⏳ Memulai proses pematangan koneksi grup untuk ${cleanJid}...`))

    try {
        const introImgPath = path.resolve('./media/avelia_intro.jpg')
        const introAudioPath = path.resolve('./media/voice-notes/avelia.ogg')

        // 2. PROSES PEMATANGAN GRUP (Group Warmup & Metadata Sync Loop)
        // Tunggu socket handshake dan coba ambil metadata grup sampai berhasil (hingga 5 attempts)
        let metadata = null
        for (let attempt = 1; attempt <= 5; attempt++) {
            await sleep(attempt === 1 ? 3000 : 2000)
            try {
                if (typeof conn.groupMetadata === 'function') {
                    metadata = await conn.groupMetadata(cleanJid, true).catch(() => null)
                    if (metadata && Array.isArray(metadata.participants) && metadata.participants.length > 0) {
                        console.log(chalk.green(`[bot-intro] ✅ Metadata grup matang pada attempt ${attempt} (${metadata.participants.length} peserta)`))
                        break
                    }
                }
            } catch (errMeta) {
                console.warn(chalk.yellow(`[bot-intro] Attempt ${attempt} fetch metadata ${cleanJid} gagal: ${errMeta?.message || errMeta}`))
            }
        }

        if (!metadata) {
            metadata = global.memoryStore?.groupMetadata?.[cleanJid] || conn.chats?.[cleanJid]?.metadata
        }

        // Cache metadata grup agar cachedGroupMetadata Baileys membaca daftar anggota lengkap
        if (metadata) {
            if (!conn.chats[cleanJid]) conn.chats[cleanJid] = { id: cleanJid }
            conn.chats[cleanJid].metadata = metadata
            conn.chats[cleanJid].isChats = true
            if (global.memoryStore?.groupMetadata) global.memoryStore.groupMetadata[cleanJid] = metadata
            if (global.updateGroupMetadataCache) global.updateGroupMetadataCache(cleanJid, metadata)
        }

        // 3. RESET SENDER-KEY MEMORY (Mencegah "Menunggu pesan ini / Waiting for this message")
        // Mengosongkan sender-key-memory memaksa Baileys menyiarkan axolotlSenderKeyDistributionMessage
        // kepada setiap perangkat anggota grup pada pesan pertama ini
        try {
            if (conn.authState?.keys?.set) {
                await conn.authState.keys.set({ 'sender-key-memory': { [cleanJid]: {} } })
                console.log(chalk.green(`[bot-intro] ⚡ sender-key-memory untuk ${cleanJid} berhasil di-reset`))
            }
        } catch (errSk) {
            console.warn(chalk.yellow(`[bot-intro] Reset sender-key-memory gagal: ${errSk?.message}`))
        }

        // 4. Natural entrance delay & Composing (typing) animation
        if (typeof conn.sendPresenceUpdate === 'function') {
            await conn.sendPresenceUpdate('composing', cleanJid).catch(() => {})
        }
        await sleep(2500)

        // 5. Format clean Zen Shinto intro text (Clean & Concise, NOT crowded)
        const introText = [
            `*──  ୨୧ ✧ AVELIA ✧ ୨୧  ──*`,
            ``,
            `> *こんにちわ!* (ʜᴇʟʟᴏ!)`,
            `> _Halo semuanya! Salam kenal, aku Avelia ♡_`,
            ``,
            `*╭  〔 𝜚 ɪ ɴ ꜰ ᴏ 〕*`,
            `> ⟡ ɴᴀᴍᴀ   : *Avelia*`,
            `> ✧ ᴘᴇʀᴀɴ  : *Celestial Assistant*`,
            `> ✦ ꜱᴛᴀᴛᴜꜱ : *Online & Siap Menemani*`,
            `*╰───────────────*`,
            ``,
            `> ｡˚ ⊹ *Dengarkan pesan suara perkenalan di bawah ya!* ⊹ ˚ ｡`,
            `> _Ketik *.menu* atau tekan tombol di bawah untuk melihat daftar fitur._`
        ].join('\n')

        const footerText = 'Avelia • Celestial Shinto Assistant'
        const buttons = [['📜 Buka Menu', '.menu']]

        // 6. Send Intro Card (Banner image + button)
        let imgBuffer = null
        if (fs.existsSync(introImgPath)) {
            imgBuffer = fs.readFileSync(introImgPath)
        }

        let cardSent = false
        if (typeof conn.sendButton === 'function' && imgBuffer) {
            try {
                await conn.sendButton(cleanJid, introText, footerText, imgBuffer, buttons)
                cardSent = true
                console.log(chalk.green(`[bot-intro] ✅ Kartu intro berhasil terkirim ke ${cleanJid}`))
            } catch (errBtn) {
                console.warn(chalk.yellow(`[bot-intro] sendButton gagal, fallback ke sendMessage: ${errBtn?.message || errBtn}`))
            }
        }

        if (!cardSent) {
            if (imgBuffer) {
                await conn.sendMessage(cleanJid, {
                    image: imgBuffer,
                    caption: `${introText}\n\n${footerText}\n\n• 📜 Buka Menu ➔ *.menu*`
                }).catch(e => console.error('[bot-intro] Fallback image gagal:', e?.message))
            } else {
                await conn.sendMessage(cleanJid, {
                    text: `${introText}\n\n${footerText}\n\n• 📜 Buka Menu ➔ *.menu*`
                }).catch(e => console.error('[bot-intro] Fallback text gagal:', e?.message))
            }
            console.log(chalk.green(`[bot-intro] ✅ Pesan fallback intro terkirim ke ${cleanJid}`))
        }

        if (typeof conn.sendPresenceUpdate === 'function') {
            await conn.sendPresenceUpdate('paused', cleanJid).catch(() => {})
        }

        // 7. Recording animation before Voice Note
        await sleep(2000)
        if (typeof conn.sendPresenceUpdate === 'function') {
            await conn.sendPresenceUpdate('recording', cleanJid).catch(() => {})
        }
        await sleep(2500)

        // 8. Send Voice Note with acoustic dynamic waveform
        if (fs.existsSync(introAudioPath)) {
            const audioBuffer = fs.readFileSync(introAudioPath)
            let vnSent = false

            // Primary: Direct Baileys media preparation with explicit waveform injection into Protobuf
            try {
                if (typeof conn.waUploadToServer === 'function') {
                    const mediaContent = await prepareWAMessageMedia({
                        audio: audioBuffer,
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true,
                        seconds: 58
                    }, { upload: conn.waUploadToServer })

                    if (mediaContent?.audioMessage) {
                        mediaContent.audioMessage.waveform = aveliaWaveform
                        const fullMsg = generateWAMessageFromContent(cleanJid, mediaContent, {
                            userJid: conn.user?.id
                        })
                        await conn.relayMessage(cleanJid, fullMsg.message, {
                            messageId: fullMsg.key.id
                        })
                        vnSent = true
                        console.log(chalk.green(`[bot-intro] ✅ Voice note intro (direct waveform injection) berhasil terkirim ke ${cleanJid}`))
                    }
                }
            } catch (errDirect) {
                console.warn(chalk.yellow(`[bot-intro] Direct waveform relay gagal: ${errDirect?.message || errDirect}`))
            }

            // Fallback: conn.sendMessage with waveform and seconds parameters
            if (!vnSent) {
                await conn.sendMessage(cleanJid, {
                    audio: audioBuffer,
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    waveform: aveliaWaveform,
                    seconds: 58
                }).then(() => {
                    console.log(chalk.green(`[bot-intro] ✅ Voice note intro (sendMessage) berhasil terkirim ke ${cleanJid}`))
                }).catch(e => {
                    console.error('[bot-intro] Kirim audio fallback gagal:', e?.message)
                })
            }
        }

        if (typeof conn.sendPresenceUpdate === 'function') {
            await conn.sendPresenceUpdate('paused', cleanJid).catch(() => {})
        }

        console.log(chalk.green(`[bot-intro] 🎉 Seluruh rangkaian sapaan selesai untuk grup ${cleanJid}`))

    } catch (err) {
        console.error('[bot-intro] Error mengeksekusi sendBotGroupIntro:', err)
    }
}
