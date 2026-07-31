let toM = a => '@' + a.split('@')[0]

async function handler(m, { conn, text, usedPrefix, command }) {
    let target;
    
    // Cek mention atau quoted message
    if (m.mentionedJid && m.mentionedJid[0]) {
        target = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        target = m.quoted.sender;
    }

    if (!target) return conn.reply(m.chat, `*Format Salah!*\n\nTag atau balas pesan orang yang ingin kamu cek cintanya.\nContoh: \`${usedPrefix + command} @user\``, m);

    let a = m.sender;
    let b = target;

    if (a === b) return conn.reply(m.chat, `Masa mau cek cinta sama diri sendiri? 🗿`, m);

    // --- Logika Acak ---
    let lovePersentase = Math.floor(Math.random() * 100) + 1;
    let status = "";
    let emoji = "";

    if (lovePersentase >= 85) {
        status = "Sangat Cocok! Segera Pelaminan 💍";
        emoji = "💖";
    } else if (lovePersentase >= 60) {
        status = "Cocok, Tinggal Nunggu Pelet Bereaksi 🧪";
        emoji = "❤️";
    } else if (lovePersentase >= 40) {
        status = "Kurang Cocok, Banyakin Sedekah Biar Jodoh 🤲";
        emoji = "⚠️";
    } else {
        status = "Gak Cocok! Mending Jadi Teman Aja Hahaha 😂";
        emoji = "💔";
    }

    let caption = `
╭──〔  *L O V E  M A T C H* 〕─⬣
│
│  *Pasangan :*
│  ${toM(a)} ${emoji} ${toM(b)}
│
│  *Kecintaan :* ${lovePersentase}%
│  *Status :* ${status}
│
╰───────────────⬣`.trim();

    await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            mentionedJid: [a, b],
            externalAdReply: {
                title: "J A D I A N  C H E C K",
                body: `Cek kecocokan cintamu sekarang!`,
                thumbnailUrl: "https://files.cloudkuimages.guru/images/1afd7760db2c.jpeg", 
                sourceUrl: "",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}

handler.help = ['jadian @tag']
handler.tags = ['fun']
handler.command = ['jadian']
handler.group = true

export default handler