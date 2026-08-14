let isiHatiResponses = [
    "💘 90% Suka sama kamu, tapi gengsi mau ngomong!",
    "😳 85% Salting kalau kamu bales chatnya cepet!",
    "🥺 70% Pengen diajak jalan tapi nunggu kamu yang peka.",
    "🫠 95% Sering ngeliatin foto profil kamu diem-diem!",
    "🤔 50% Masih bingung antara suka atau cuma kesepian.",
    "💀 10% Dianggep temen biasa (Friendzone alert!).",
    "💌 100% Fix naksir berat sama kamu dari pertama kali ketemu!",
    "👀 60% Suka, tapi takut kamu udah punya pasangan.",
    "🤣 30% Dianggep pelawak grup doang."
]

const getRamalanByScore = (score) => {
    if (score >= 85) return "🔥 Pasangan takdir dari surga! Sangat serasi dan saling melengkapi!"
    if (score >= 65) return "⚡ Cocok banget! Asal jangan sering rebutan makanan aja."
    if (score >= 45) return "🌧️ Cukup cocok, banyak drama tapi makin drama makin kangen."
    if (score >= 25) return "💥 Sering berantem hal sepele, tapi ujung-ujungnya tetep baikan."
    return "💔 Hati-hati terjebak HTS (Hubungan Tanpa Status) atau friendzone."
}

let kataBucin = [
    "Aku gak pernah minta banyak sama Tuhan, cukup kamu aja yang ada di setiap doaku. ❤️",
    "Kalau rindu itu hujan, mungkin rumahku udah kebanjiran sejak mengenalmu. 🌧️💕",
    "Bukan karena gak ada yang lain, tapi karena hatiku cuma mau kamu. 🔒💘",
    "Bisa gak kamu stop jadi lucu? Nanti orang lain ikutan suka kan repot. 🥺✨",
    "Kamu itu kaya kopi di pagi hari, selalu berhasil bikin hariku makin bersemangat. ☕💗"
]

let handler = async (m, { conn, usedPrefix, command, text, participants }) => {
    let inputCmd = command.toLowerCase()

    // 1. CEK ISI HATI
    if (inputCmd === 'cekisihati') {
        let target = m.mentionedJid?.[0]
        if (!target) return m.reply(` Tag orang yang ingin kamu cek isi hatinya!\n*Contoh:* ${usedPrefix}cekisihati @tag`)

        let res = isiHatiResponses[Math.floor(Math.random() * isiHatiResponses.length)]
        let txt = `💖 *HASIL CEK ISI HATI* 💖\n\n`
        txt += `👤 *Target:* @${target.split('@')[0]}\n`
        txt += `💭 *Isi Hati:* ${res}`

        return conn.sendMessage(m.chat, { text: txt, mentions: [target] }, { quoted: m })
    }

    // 2. JODOHKU / JODOH (TAG RANDOM MEMBER GRUP)
    if (['jodoh', 'jodohku'].includes(inputCmd)) {
        if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa digunakan di dalam grup!')

        let members = participants.map(u => conn.decodeJid(u.id || u.jid)).filter(v => v !== m.sender && v !== conn.user.jid)
        if (members.length === 0) return m.reply('❌ Anggota grup terlalu sedikit!')

        let randomJodoh = members[Math.floor(Math.random() * members.length)]
        let score = Math.floor(Math.random() * 85) + 15
        let ramalan = getRamalanByScore(score)

        let txt = `💘 *RAMALAN JODOH RAHASIA HARI INI* 💘\n\n`
        txt += `✨ @${m.sender.split('@')[0]} Jodoh takdirmu di grup ini adalah...\n`
        txt += `👉 @${randomJodoh.split('@')[0]} 👩‍❤️‍👨\n\n`
        txt += `📊 *Tingkat Kecocokan:* *${score}%*\n`
        txt += `📜 *Ramalan:* ${ramalan}\n\n`
        txt += `_Cobalah sapa jodohmu dengan *.lamar @tag*! 😉_`

        return conn.sendMessage(m.chat, { text: txt, mentions: [m.sender, randomJodoh] }, { quoted: m })
    }

    // 3. JODOHIN / CEKJODOH (2 ORANG)
    if (['jodohin', 'cekjodoh'].includes(inputCmd)) {
        let targets = m.mentionedJid || []
        if (targets.length < 2) return m.reply(` Tag 2 orang untuk diisi ramalan jodohnya!\n*Contoh:* ${usedPrefix}jodohin @user1 @user2`)

        let user1 = targets[0]
        let user2 = targets[1]
        let score = Math.floor(Math.random() * 85) + 15
        let ramalan = getRamalanByScore(score)

        let txt = `👩‍❤️‍👨 *ANALISIS KECOCOKAN JODOH* 👩‍❤️‍👨\n\n`
        txt += `👤 @${user1.split('@')[0]} 💕 @${user2.split('@')[0]}\n\n`
        txt += `📊 *Skor Kecocokan:* *${score}%*\n`
        txt += `📜 *Analisis:* ${ramalan}`

        return conn.sendMessage(m.chat, { text: txt, mentions: [user1, user2] }, { quoted: m })
    }

    // 4. SELINGKUH
    if (inputCmd === 'selingkuh') {
        let target = m.mentionedJid?.[0]
        if (!target) return m.reply(` Tag orang yang ingin diajak selingkuh rahasia!\n*Contoh:* ${usedPrefix}selingkuh @tag`)

        let statusList = [
            '🔥 Berhasil selingkuh diam-diam tanpa ketahuan pasangan sah!',
            '😱 Ketahuan pasangan sah! Kamu dilempar sandal swallow!',
            '🫣 Selingkuhanmu ternyata sepupu dari pasangan sahmu! Canggung parah!',
            '💔 Ketahuan dan langsung digugat cerai saat itu juga!'
        ]
        let status = statusList[Math.floor(Math.random() * statusList.length)]

        let txt = `🤫 *DRAMA SELINGKUH RAHASIA* 🤫\n\n`
        txt += `@${m.sender.split('@')[0]} mencoba selingkuh dengan @${target.split('@')[0]}...\n\n`
        txt += `📌 *Hasil:* ${status}`

        return conn.sendMessage(m.chat, { text: txt, mentions: [m.sender, target] }, { quoted: m })
    }

    // 5. PELET
    if (inputCmd === 'pelet') {
        let target = m.mentionedJid?.[0]
        if (!target) return m.reply(` Tag orang yang ingin kamu pelet!\n*Contoh:* ${usedPrefix}pelet @tag`)

        let chance = Math.floor(Math.random() * 100)
        let isSuccess = chance > 40

        let txt = `🔮 *RITUAL PELET CINTA* 🔮\n\n`
        txt += `Dukun Bot membacakan mantra untuk @${target.split('@')[0]}...\n\n`
        if (isSuccess) {
            txt += `✅ *BERHASIL!* (${chance}%)\n@${target.split('@')[0]} sekarang langsung bayangin kamu terus setiap malam!`
        } else {
            txt += `❌ *GAGAL!* (${chance}%)\nTarget punya ilmu kebal! Mantra pelet membal menyengat dirimu sendiri!`
        }

        return conn.sendMessage(m.chat, { text: txt, mentions: [target] }, { quoted: m })
    }

    // 6. BUCIN
    if (inputCmd === 'bucin') {
        let kata = kataBucin[Math.floor(Math.random() * kataBucin.length)]
        return m.reply(`💬 *KATA-KATA BUCIN HARIAN*\n\n"${kata}"`)
    }
}

handler.help = ['cekisihati @user', 'jodoh', 'jodohku', 'jodohin @u1 @u2', 'selingkuh @user', 'pelet @user', 'bucin']
handler.tags = ['pasangan', 'fun']
handler.command = /^(cekisihati|jodoh|jodohku|jodohin|cekjodoh|selingkuh|pelet|bucin)$/i

export default handler
