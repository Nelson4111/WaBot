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

    let barCount = Math.floor(persentase / 10)
    let bar = "█".repeat(barCount) + "░".repeat(10 - barCount)

    let caption = `
╭〔  *G A N T E N G  C H E C K* 〕
│
│  ◦ *User* : ${toM(target)}
│  ◦ *Skor* : ${persentase}%
│  ◦ *Bar* : [${bar}]
│
├─〔  *V E R D I C T* 〕
│
│  ◦ ${status}
│
╰──────────────────⬣`.trim()

    await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            mentionedJid: [target],
            externalAdReply: {
                title: "Z E T A  S C A N N E R",
                body: "System Scanning Complete",
                thumbnailUrl: "https://files.cloudkuimages.guru/images/1afd7760db2c.jpeg",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.help = ['cekganteng']
handler.tags = ['fun']
handler.command = /^(cekganteng|gantengcek)$/i

export default handler