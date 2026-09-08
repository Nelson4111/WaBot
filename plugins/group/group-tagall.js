import fs from 'fs'
import { sendPersonalizedGroupTagall } from '../../lib/dual-group-message.js'

let handler = async (m, { conn, text, participants }) => {
    let pesan = text?.trim() || 'Perhatian untuk seluruh anggota grup.'

    try {
        // Kirim tagall terpersonalisasi (1 user 1 tag mandiri ala tesbutton 7)
        await sendPersonalizedGroupTagall(conn, m.chat, participants, pesan, {
            quoted: m
        })
    } catch (err) {
        console.error('[PERSONALIZED TAGALL ERROR, FALLBACK TO STANDARD]:', err)

        // Fallback jika terjadi kendala pada pairwise node:
        // Kirim pesan pengumuman rapi dengan metadata mentions seluruh member (penerjemahan LID -> phone JID / nomor)
        const allMembers = (participants || []).map(u => {
            if (typeof u === 'string') {
                if (u.endsWith('@s.whatsapp.net')) return u
                if (conn.decodeJid) {
                    const dec = conn.decodeJid(u)
                    if (dec && dec.endsWith('@s.whatsapp.net')) return dec
                }
                const digits = u.split('@')[0].replace(/\D/g, '')
                return digits ? `${digits}@s.whatsapp.net` : null
            }
            if (u.jid && u.jid.endsWith('@s.whatsapp.net')) return u.jid
            if (u.id && u.id.endsWith('@s.whatsapp.net')) return u.id
            if (u.phoneNumber || u.phone || u.pn) {
                const clean = String(u.phoneNumber || u.phone || u.pn).replace(/\D/g, '')
                if (clean) return `${clean}@s.whatsapp.net`
            }
            if (u.lid || (u.id && u.id.endsWith('@lid'))) {
                const targetLid = u.lid || u.id
                if (conn.decodeJid) {
                    const dec = conn.decodeJid(targetLid)
                    if (dec && dec.endsWith('@s.whatsapp.net')) return dec
                }
                if (global.lids?.[targetLid]) return global.lids[targetLid]
                if (global.db?.data?.lids?.[targetLid]) return global.db.data.lids[targetLid]
            }
            return (u.id && !u.id.endsWith('@lid')) ? u.id : null
        }).filter(Boolean)

        // Penerjemahan LID -> JID / No telepon agar tag berwarna biru (@${who.split('@')[0]})
        let who = m.sender
        if (who && who.endsWith('@lid')) {
            if (conn.decodeJid) who = conn.decodeJid(who)
            if (who.endsWith('@lid') && global.lids?.[m.sender]) who = global.lids[m.sender]
            if (who.endsWith('@lid') && global.db?.data?.lids?.[m.sender]) who = global.db.data.lids[m.sender]
            if (who.endsWith('@lid')) {
                const found = (participants || []).find(p => p.lid === m.sender || p.id === m.sender)
                if (found?.jid && found.jid.endsWith('@s.whatsapp.net')) who = found.jid
                else if (found?.phoneNumber || found?.phone || found?.pn) {
                    const clean = String(found.phoneNumber || found.phone || found.pn).replace(/\D/g, '')
                    if (clean) who = `${clean}@s.whatsapp.net`
                }
            }
        }
        if (!who || !who.endsWith('@s.whatsapp.net')) {
            const cleanDigits = (who || m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')
            if (cleanDigits) who = `${cleanDigits}@s.whatsapp.net`
        }

        const whoNumber = (who || '').split('@')[0].split(':')[0].replace(/\D/g, '')
        const whoTag = `@${whoNumber}`

        const fallbackCaption = `*──  ୨୧ ✧ PENGUMUMAN GRUP ✧ ୨୧  ──*

> *おしらせ!* (ᴘᴇɴɢᴜᴍᴜᴍᴀɴ!)
> Pesan penting untukmu ${whoTag} ♡

${pesan}`.trim()

        // Pastikan JID yang di-tag ada di array mentions agar teks @${whoNumber} berubah menjadi link biru aktif
        const mentionsList = Array.from(new Set([...allMembers, who].filter(Boolean)))

        await conn.sendMessage(m.chat, {
            text: fallbackCaption,
            mentions: mentionsList
        }, { quoted: m })
    }
}

handler.help = ['tagall <pesan>']
handler.tags = ['group']
handler.command = /^(tagall|tagsemua|everyone|all)$/i
handler.admin = true
handler.group = true

export default handler