import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command }) => {
    // Deteksi mode stealth (.tes / .cekproto2 / jika dijalankan di dalam grup)
    const isStealth = /^(tes|cekproto2|stealthproto)$/i.test(command) || m.isGroup
    const targetChat = isStealth ? m.sender : m.chat

    // 1. Tentukan target pesan: reply (m.quoted) atau pesan itu sendiri
    const q = m.quoted ? m.quoted : m
    const rawQuoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
                      m.msg?.contextInfo?.quotedMessage ||
                      m.quoted?.messages ||
                      m.quoted?.message ||
                      (m.quoted?.vM ? m.quoted.vM.message : null)

    const targetMsg = m.quoted ? (rawQuoted || m.quoted) : (m.message || m.msg)

    if (!targetMsg || (!m.quoted && !m.message)) {
        const helpText = `🔍 *CARA MENGGUNAKAN INSPECTOR PROTOBUF (STEALTH):*
1. Balas (reply) pesan target (misal: pesan Bot Yuki)
2. Ketik: *${usedPrefix + command}*
3. Hasil bedah protobuf akan dikirim *100% PRIVATE* ke chat pribadi kamu (aman tanpa jejak di grup).`
        
        if (isStealth && m.isGroup) {
            return await conn.sendMessage(m.sender, { text: helpText })
        } else {
            return m.reply(helpText)
        }
    }

    try {
        // Jika bukan stealth di grup, boleh kirim notif proses
        if (!isStealth || !m.isGroup) {
            await m.reply('🔍 *Membedah struktur raw protobuf pesan... Mohon tunggu sebentar.*')
        }

        // 2. Kloning objek agar aman dari circular reference
        const rawJson = JSON.parse(JSON.stringify(targetMsg, (key, value) => {
            if (typeof value === 'bigint') return value.toString()
            if (Buffer.isBuffer(value)) return value.toString('base64')
            return value
        }, 2))

        // 3. Ekstrak bagian penting secara mendalam
        const mtype = Object.keys(rawJson)[0] || q.mtype || 'unknown'
        
        // Cari interactiveMessage, listMessage, atau buttonsMessage di berbagai kedalaman
        let interactive = rawJson.interactiveMessage || 
                          rawJson.viewOnceMessage?.message?.interactiveMessage || 
                          rawJson.viewOnceMessageV2?.message?.interactiveMessage ||
                          rawJson.ephemeralMessage?.message?.interactiveMessage ||
                          null

        let listMsg = rawJson.listMessage ||
                      rawJson.viewOnceMessage?.message?.listMessage ||
                      rawJson.viewOnceMessageV2?.message?.listMessage ||
                      rawJson.ephemeralMessage?.message?.listMessage ||
                      null

        let buttonsMsg = rawJson.buttonsMessage ||
                         rawJson.viewOnceMessage?.message?.buttonsMessage ||
                         rawJson.viewOnceMessageV2?.message?.buttonsMessage ||
                         rawJson.ephemeralMessage?.message?.buttonsMessage ||
                         null

        let nativeFlow = interactive?.nativeFlowMessage || null
        let parsedButtons = []
        let parsedMessageParams = null

        if (nativeFlow) {
            if (Array.isArray(nativeFlow.buttons)) {
                parsedButtons = nativeFlow.buttons.map(b => {
                    let parsedParams = b.buttonParamsJson
                    try {
                        if (typeof parsedParams === 'string') parsedParams = JSON.parse(parsedParams)
                    } catch (e) {}
                    return {
                        name: b.name,
                        params: parsedParams
                    }
                })
            }
            if (nativeFlow.messageParamsJson) {
                try {
                    parsedMessageParams = typeof nativeFlow.messageParamsJson === 'string' 
                        ? JSON.parse(nativeFlow.messageParamsJson) 
                        : nativeFlow.messageParamsJson
                } catch (e) {
                    parsedMessageParams = nativeFlow.messageParamsJson
                }
            }
        }

        const contextInfo = targetMsg[mtype]?.contextInfo || interactive?.contextInfo || listMsg?.contextInfo || buttonsMsg?.contextInfo || q.contextInfo || null

        // 4. Susun ringkasan analisis
        let summary = `🕵️‍♂️ *[STEALTH PROTOBUF INSPECTOR]* 📦\n\n`
        if (m.isGroup) summary += `• *Asal Grup:* \`${m.chat}\`\n`
        summary += `• *MType Utama:* \`${mtype}\`\n`
        summary += `• *Pengirim Asli:* @${(q.sender || '').split('@')[0]}\n`
        summary += `• *ID Pesan:* \`${q.id || q.key?.id || '-'}\`\n\n`

        if (listMsg) {
            summary += `✨ *LIST MESSAGE DETECTED!*\n`
            summary += `• *Button Text:* [${listMsg.buttonText || 'PILIH MENU'}]\n`
            if (listMsg.title) summary += `• *Title:* ${listMsg.title}\n`
            if (listMsg.description) summary += `• *Description:* ${listMsg.description}\n`
            if (listMsg.footerText) summary += `• *Footer:* ${listMsg.footerText}\n`
            if (listMsg.sections?.length) {
                summary += `\n📑 *Sections (${listMsg.sections.length} item):*\n`
                listMsg.sections.forEach((sec, idx) => {
                    summary += `${idx + 1}. *${sec.title || 'Section'}* (${sec.rows?.length || 0} baris)\n`
                })
            }
            summary += `\n`
        }

        if (buttonsMsg) {
            summary += `✨ *BUTTONS MESSAGE DETECTED!*\n`
            summary += `• *Header Type:* ${buttonsMsg.headerType}\n`
            if (buttonsMsg.locationMessage?.name) summary += `• *Location Name:* ${buttonsMsg.locationMessage.name}\n`
            if (buttonsMsg.locationMessage?.address) summary += `• *Location Address:* ${buttonsMsg.locationMessage.address}\n`
            if (buttonsMsg.contentText) summary += `• *Content Text:* ${buttonsMsg.contentText}\n`
            if (buttonsMsg.footerText) summary += `• *Footer:* ${buttonsMsg.footerText}\n`
            if (buttonsMsg.buttons?.length) {
                summary += `\n🔘 *Buttons (${buttonsMsg.buttons.length} item):*\n`
                buttonsMsg.buttons.forEach((b, i) => {
                    summary += `${i + 1}. "${b.buttonText?.displayText || b.buttonId}" (ID: \`${b.buttonId}\`)\n`
                })
            }
            summary += `\n`
        }

        if (interactive) {
            summary += `✨ *INTERACTIVE MESSAGE DETECTED!*\n`
            if (interactive.header?.title) summary += `• *Header:* ${interactive.header.title}\n`
            if (interactive.body?.text) summary += `• *Body:* ${interactive.body.text}\n`
            if (interactive.footer?.text) summary += `• *Footer:* ${interactive.footer.text}\n`
            
            if (parsedMessageParams) {
                summary += `\n⚙️ *Message Params (Global):*\n\`\`\`json\n${JSON.stringify(parsedMessageParams, null, 2)}\n\`\`\`\n`
            }

            if (parsedButtons.length > 0) {
                summary += `\n🔘 *Tombol (${parsedButtons.length} item):*\n`
                parsedButtons.forEach((btn, idx) => {
                    summary += `${idx + 1}. *[${btn.name}]* `
                    if (btn.params?.display_text) summary += `"${btn.params.display_text}" `
                    if (btn.params?.id) summary += `(ID: \`${btn.params.id}\`)`
                    summary += `\n`
                })
            }
        }

        if (contextInfo) {
            summary += `\n📌 *Context Info:*\n`
            if (contextInfo.participant) summary += `• *Participant:* @${contextInfo.participant.split('@')[0]}\n`
            if (contextInfo.mentionedJid?.length) summary += `• *Mentions:* ${contextInfo.mentionedJid.map(j => '@' + j.split('@')[0]).join(', ')}\n`
            if (contextInfo.isForwarded) summary += `• *Forwarded:* Ya (Score: ${contextInfo.forwardingScore || 1})\n`
            if (contextInfo.stanzaId) summary += `• *Quoted StanzaId:* \`${contextInfo.stanzaId}\`\n`
        }

        // 5. Simpan full raw JSON ke file lokal
        const dumpDir = path.join(process.cwd(), 'lib', 'database')
        if (!fs.existsSync(dumpDir)) fs.mkdirSync(dumpDir, { recursive: true })
        const dumpPath = path.join(dumpDir, 'last_inspected_proto.json')
        fs.writeFileSync(dumpPath, JSON.stringify({
            inspectedAt: new Date().toISOString(),
            sender: q.sender,
            chat: m.chat,
            mtype,
            extracted: {
                interactive,
                listMsg,
                buttonsMsg,
                parsedButtons,
                parsedMessageParams,
                contextInfo
            },
            fullRawMessage: rawJson
        }, null, 2))

        console.log('\n================== [INSPECTED PROTO DUMP] ==================')
        console.log(JSON.stringify({ mtype, parsedMessageParams, parsedButtons, contextInfo }, null, 2))
        console.log('============================================================\n')

        // 6. Kirim ringkasan teks EKSKLUSIF ke targetChat (Private DM jika stealth/grup)
        await conn.sendMessage(targetChat, {
            text: summary.trim(),
            mentions: [
                q.sender, 
                ...(contextInfo?.mentionedJid || []),
                ...(contextInfo?.participant ? [contextInfo.participant] : [])
            ].filter(Boolean)
        })

        // 7. Kirim file document JSON lengkapnya EKSKLUSIF ke targetChat (Private DM)
        const jsonBuffer = Buffer.from(JSON.stringify(rawJson, null, 2), 'utf-8')
        await conn.sendMessage(targetChat, {
            document: jsonBuffer,
            fileName: `proto_${q.id || 'dump'}.json`,
            mimetype: 'application/json',
            caption: '📁 *Raw Protobuf JSON Lengkap* (Buka untuk melihat semua field internal)'
        })

    } catch (err) {
        console.error('[INSPECT PROTO ERROR]:', err)
        // Kirim error HANYA ke private chat pengirim, JANGAN ke grup!
        try {
            await conn.sendMessage(m.sender, { text: `❌ Gagal membedah pesan: ${err.message}` })
        } catch {}
    }
}

// Pasang listener otomatis untuk mencatat pesan yang datang dari Bot Yuki / Akinator
handler.before = async function (m) {
    if (!m) return
    const sender = m.sender || ''
    const rawText = m.text || ''
    const isYuki = /85187283845|1989207408747/i.test(sender) || 
                   m.pushName === 'Yuki' ||
                   (m.quoted && /85187283845|1989207408747/i.test(m.quoted.sender || '')) ||
                   /TOMBOL JAWABAN HANYA MUNCUL|Akinator|Memulai Akinator/i.test(rawText)
    
    if (isYuki && (m.message || m.msg)) {
        try {
            console.log('\n🚨 [AUTO-CAPTURED BOT YUKI / AKINATOR MESSAGE] 🚨')
            console.log('Sender:', sender, `(PushName: ${m.pushName || '-'})`)
            console.log('Chat:', m.chat)
            console.log('MType:', m.mtype)
            console.log('Raw Message Payload:', JSON.stringify(m.message, null, 2))
            console.log('-------------------------------------------\n')

            const dumpDir = path.join(process.cwd(), 'lib', 'database')
            if (!fs.existsSync(dumpDir)) fs.mkdirSync(dumpDir, { recursive: true })
            
            const dumpData = {
                timestamp: new Date().toISOString(),
                sender,
                pushName: m.pushName || null,
                chat: m.chat,
                mtype: m.mtype,
                message: m.message
            }
            fs.writeFileSync(path.join(dumpDir, 'last_yuki_message.json'), JSON.stringify(dumpData, null, 2))
        } catch (e) {
            console.warn('[CEKPROTO BEFORE ERROR]:', e?.message)
        }
    }
}

handler.help = ['tes', 'cekproto2', 'cekproto', 'inspectmsg', 'rawproto']
handler.tags = ['tools', 'owner']
handler.command = /^(tes|cekproto2|stealthproto|cekproto|inspectmsg|rawproto|bedahpesan|inspect|dumpmsg)$/i
handler.unreg = true

export default handler
