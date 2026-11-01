import { formatFunCheck } from '../../lib/funCheck.js'

let toM = a => '@' + a.split('@')[0]

async function handler(m, { conn }) {
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    
    let persentase = Math.floor(Math.random() * 100) + 1
    let status = ""
    
    if (persentase >= 90) status = "Ganteng Maksimal, Idaman Para Ukhti! 🌟"
    else if (persentase >= 75) status = "Ganteng Banget, Hampir Mirip Artis! ✨"
    else if (persentase >= 50) status = "Lumayan Ganteng, Masih Bisa Diadu. 😎"
    else if (persentase >= 25) status = "Pas-pasan, Banyakin Skincare. 🧴"
    else status = "Diluar Nalar, Tolong Berhenti Ngaca! 💀"

    let caption = formatFunCheck({
        title: 'GANTENG CHECK',
        user: toM(target),
        score: persentase,
        verdict: status
    })

    await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            mentionedJid: [target]
        }
    }, { quoted: m })
}

handler.help = ['cekganteng']
handler.tags = ['fun']
handler.command = /^(cekganteng|gantengcek)$/i

export default handler