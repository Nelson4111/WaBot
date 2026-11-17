import fs from 'fs'
import similarity from 'similarity'
import { sendGameResult } from './game-result.js'
const threshold = 0.72

const CAKLONTONG_IMAGE = fs.readFileSync(new URL('../../media/games/pMx.jpg', import.meta.url))

function cleanText(str = '') {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

let handler = m => m

handler.before = async function (m) {
    if (!m.text) return false
    if (/^[./#!]\w+/.test(m.text.trim())) return false

    let id = m.chat
    this.caklontong = this.caklontong || {}
    if (!(id in this.caklontong)) return false

    const session = this.caklontong[id]
    if (!session || !session[1]) return false

    const json = session[1]
    const jawab = (json.jawaban || '').trim()
    if (!jawab) return false

    const msgId = session[0]?.key?.id || session[0]?.id
    const isQuotedFromBot = m.quoted && m.quoted.fromMe && (m.quoted.id === msgId || !msgId)

    const isCorrect = cleanText(m.text) === cleanText(jawab)
    const isSimilar = similarity(cleanText(m.text), cleanText(jawab)) >= threshold
    const isSurrender = /^((me)?nyerah|surr?ender)$/i.test(m.text.trim())

    if (isSurrender) {
        clearTimeout(session[3])
        delete this.caklontong[id]
        const usedPrefix = session[5] || '.'
        await sendGameResult(this, {
            chat: m.chat,
            text: `╭─〔 🏳️ MENYERAH 〕\n> Jawabannya: *${jawab}*\n> ${json.deskripsi || ''}\n╰───────────────`,
            image: CAKLONTONG_IMAGE,
            title: '🏁 Cak Lontong Selesai',
            subtitle: 'Coba lagi dengan soal baru!',
            footer: `${global.namebot || 'Avelia'} • Cak Lontong`,
            buttons: [
                ['🔄 Main Lagi', `${usedPrefix}caklontong`],
                ['🏆 Cek Skor', `${usedPrefix}caklontong score`]
            ],
            quoted: m
        })
        return true
    }

    if (isCorrect) {
        const rewardExp = session[2] || 1000
        const usedPrefix = session[5] || '.'
        global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + rewardExp
        global.db.data.users[m.sender].caklontongScore = (Number(global.db.data.users[m.sender].caklontongScore) || 0) + (session[4] || 1)
        global.db.data.users[m.sender].caklontongName = m.pushName || global.db.data.users[m.sender].caklontongName

        clearTimeout(session[3])
        delete this.caklontong[id]
        await sendGameResult(this, {
            chat: m.chat,
            text: `╭─〔 🎉 B E N A R 〕\n> ✧ +${rewardExp} XP\n> ⟡ +${session[4] || 1} poin Cak Lontong\n> ${json.deskripsi || ''}\n╰───────────────\n\n🏆 Skor sekarang: *${global.db.data.users[m.sender].caklontongScore} poin*\nCek dengan *.caklontong score*`,
            image: CAKLONTONG_IMAGE,
            title: '🎉 Cak Lontong Selesai',
            subtitle: 'Jawabanmu benar!',
            footer: `${global.namebot || 'Avelia'} • Cak Lontong`,
            buttons: [
                ['🔄 Main Lagi', `${usedPrefix}caklontong`],
                ['🏆 Cek Skor', `${usedPrefix}caklontong score`]
            ],
            quoted: m
        })
        return true
    } else if (isSimilar) {
        await m.reply('🔍 *Dikit Lagi!*')
        return true
    } else if (isQuotedFromBot) {
        await m.reply('❌ *Salah!*')
        return true
    }

    return false
}

export default handler