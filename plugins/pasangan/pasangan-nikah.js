import { createCanvas, loadImage } from 'canvas'
import PhoneNumber from 'awesome-phonenumber'

// Helper untuk format durasi menikah
const formatDuration = (ms) => {
    let seconds = Math.floor(ms / 1000)
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60)
    let days = Math.floor(hours / 24)

    hours %= 24
    minutes %= 60

    let res = []
    if (days > 0) res.push(`${days} hari`)
    if (hours > 0) res.push(`${hours} jam`)
    if (minutes > 0 && days === 0) res.push(`${minutes} menit`)
    if (res.length === 0) return 'baru saja'
    return res.join(', ')
}

const CINCIN_SHOP = {
    'perak': { name: '💍 Cincin Perak', price: 100, bonus: 1.1 },
    'emas': { name: '👑 Cincin Emas', price: 500, bonus: 1.3 },
    'diamond': { name: '💎 Cincin Berlian', price: 2000, bonus: 1.5 }
}

let proposals = {}

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
    let inputCmd = command || m.text.toLowerCase().trim()
    let users = global.db.data.users
    let sender = conn.decodeJid(m.sender)

    if (!users[sender]) users[sender] = {}
    if (!users[sender].pasangan) users[sender].pasangan = []

    // 1. LAMAR / NIKAH
    if (['lamar', 'nikah', 'tembak'].includes(inputCmd)) {
        let target = m.mentionedJid?.[0]
        if (!target) return m.reply(` Tag orang yang mau kamu lamar!\nContoh: *${usedPrefix}lamar @tag*`)
        if (target === sender) return m.reply('❌ Kamu mau nikah sama diri sendiri? 😭')
        if (target === conn.user.jid) return m.reply('❌ Aku ini bot, masa kamu mau nikah sama bot... 🤖💔')

        if (!users[target]) users[target] = {}
        if (!users[target].pasangan) users[target].pasangan = []

        // Cek apakah sudah menikah dengan target yang sama
        let alreadyMarried = users[sender].pasangan.some(p => p.jid === target)
        if (alreadyMarried) {
            return m.reply(`❤️ Kamu sudah sah menjadi pasangan dari @${target.split('@')[0]}!`, null, { mentions: [target] })
        }

        let proposals = global.db.data.proposals = global.db.data.proposals || {}
        proposals[target] = {
            from: sender,
            time: Date.now()
        }

        let msg = `💍 *LAMARAN PERNIKAHAN* 💍\n\n`
        msg += `Hai @${target.split('@')[0]},\n`
        msg += `@${sender.split('@')[0]} ingin melamarmu menjadi pasangannya! 💕\n\n`
        msg += `Ketik *.terima* atau balas pesan ini dengan tulisan *terima* untuk menerima lamaran.\n`
        msg += `Atau ketik *.tolak* untuk menolak lamaran.\n\n`
        msg += `⏱️ _Lamaran ini berlaku selama 60 detik._`

        return conn.sendMessage(m.chat, {
            text: msg,
            mentions: [sender, target]
        }, { quoted: m })
    }

    // 2. TERIMA LAMARAN SEBAGAI COMMAND
    if (['terima', 'accept'].includes(inputCmd)) {
        let proposals = global.db.data.proposals = global.db.data.proposals || {}
        let prop = proposals[sender]
        if (!prop || (Date.now() - prop.time > 60000)) {
            delete proposals[sender]
            return m.reply('❌ Tidak ada lamaran yang ditujukan padamu atau lamaran sudah kedaluwarsa.')
        }

        let fromJid = prop.from
        delete proposals[sender]

        if (!users[fromJid]) users[fromJid] = {}
        if (!users[fromJid].pasangan) users[fromJid].pasangan = []
        if (!users[sender]) users[sender] = {}
        if (!users[sender].pasangan) users[sender].pasangan = []

        let now = Date.now()
        let newRecordFrom = { jid: sender, nikahTime: now, poinBucin: 10, cincin: 'Cincin Perak' }
        let newRecordTarget = { jid: fromJid, nikahTime: now, poinBucin: 10, cincin: 'Cincin Perak' }

        users[fromJid].pasangan.push(newRecordFrom)
        users[sender].pasangan.push(newRecordTarget)

        let ann = `🎉 *SELAMAT! PERNIKAHAN SAH!* 🎉\n\n`
        ann += `@${fromJid.split('@')[0]} 💞 @${sender.split('@')[0]}\n`
        ann += `Telah resmi menjadi pasangan suami & istri! 💍✨\n\n`
        ann += `Ketik *.pasangan* untuk melihat info status pernikahan kalian!\n`
        ann += `Ketik *.kartunikah* untuk melihat Kartu Nikah Digital!`

        return conn.sendMessage(m.chat, {
            text: ann,
            mentions: [fromJid, sender]
        }, { quoted: m })
    }

    // 3. TOLAK LAMARAN SEBAGAI COMMAND
    if (['tolak', 'reject'].includes(inputCmd)) {
        let proposals = global.db.data.proposals = global.db.data.proposals || {}
        let prop = proposals[sender]
        if (!prop) {
            return m.reply('❌ Tidak ada lamaran yang ditujukan padamu.')
        }
        let fromJid = prop.from
        delete proposals[sender]

        return conn.sendMessage(m.chat, {
            text: `💔 @${sender.split('@')[0]} menolak lamaran dari @${fromJid.split('@')[0]}. Sabar ya, mungkin belum jodoh... 🥺`,
            mentions: [sender, fromJid]
        }, { quoted: m })
    }

    // 4. CERAI (SEPIHAK)
    if (inputCmd === 'cerai') {
        let target = m.mentionedJid?.[0]
        let senderPasangan = users[sender].pasangan || []

        if (senderPasangan.length === 0) return m.reply('💔 Kamu saat ini statusnya Jomblo, tidak punya pasangan untuk dicerai!')

        if (!target) {
            if (senderPasangan.length === 1) {
                target = senderPasangan[0].jid
            } else {
                let listP = senderPasangan.map((p, i) => `${i + 1}. @${p.jid.split('@')[0]}`).join('\n')
                return m.reply(` Tag pasangan yang ingin kamu cerai!\n\n*Daftar Pasanganmu:*\n${listP}`)
            }
        }

        let pIndex = senderPasangan.findIndex(p => p.jid === target)
        if (pIndex === -1) return m.reply(`❌ @${target.split('@')[0]} bukan merupakan pasanganmu!`, null, { mentions: [target] })

        // Hapus hubungan dari kedua belah pihak
        users[sender].pasangan.splice(pIndex, 1)

        if (users[target] && users[target].pasangan) {
            let tIndex = users[target].pasangan.findIndex(p => p.jid === sender)
            if (tIndex > -1) users[target].pasangan.splice(tIndex, 1)
        }

        return conn.sendMessage(m.chat, {
            text: `💔 *PERCERAIAN RESMI*\n\nHubungan pernikahan antara @${sender.split('@')[0]} dan @${target.split('@')[0]} telah resmi berakhir secara sepihak.`,
            mentions: [sender, target]
        }, { quoted: m })
    }

    function getIntimacyRank(bucin = 0) {
        if (bucin >= 1000) return { title: '✨ Soulmate Abadi', buff: '+15% EXP & Dungeon Loot' }
        if (bucin >= 500) return { title: '👑 Pengantin Bahagia', buff: '+10% EXP Kencan' }
        if (bucin >= 200) return { title: '💍 Tunangan Romantis', buff: '+5% EXP Kencan' }
        if (bucin >= 50) return { title: '💖 Pacaran Mesra', buff: 'Harmonis' }
        return { title: '🌸 Pasangan Baru (PDKT)', buff: 'Awal Perjalanan' }
    }

    // 5. PASANGAN / CEKNIKAH
    if (['pasangan', 'ceknikah', 'istri', 'suami'].includes(inputCmd)) {
        let who = conn.decodeJid(m.mentionedJid?.[0] || m.quoted?.sender || sender)
        let pList = users[who]?.pasangan || []

        if (pList.length === 0) {
            let isSelf = who === sender
            return m.reply(isSelf ? '💔 Kamu saat ini masih *Jomblo*.\nGunakan *.lamar @user* untuk mencari pasangan!' : `💔 @${who.split('@')[0]} saat ini statusnya *Jomblo*.`, null, { mentions: [who] })
        }

        let txt = `💍 *STATUS PERNIKAHAN @${who.split('@')[0]}*\n\n`
        pList.forEach((p, i) => {
            let dur = formatDuration(Date.now() - p.nikahTime)
            let dateStr = new Date(p.nikahTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
            let rank = getIntimacyRank(p.poinBucin || 0)
            txt += `*${i + 1}. Pasangan:* @${p.jid.split('@')[0]}\n`
            txt += `   📅 *Tanggal Nikah:* ${dateStr}\n`
            txt += `   ⏳ *Lama Menikah:* ${dur}\n`
            txt += `   💖 *Poin Bucin:* ${p.poinBucin || 0} Poin\n`
            txt += `   🏆 *Tingkat Hubungan:* ${rank.title}\n`
            txt += `   ✨ *Buff Spesial:* ${rank.buff}\n`
            txt += `   💍 *Cincin:* ${p.cincin || 'Cincin Perak'}\n\n`
        })
        txt += `_Ketik *.kencan* atau *.loveclaim* untuk mempererat hubunganmu!_`

        return conn.sendMessage(m.chat, {
            text: txt,
            mentions: [who, ...pList.map(p => p.jid)]
        }, { quoted: m })
    }

    // 6. KENCAN HARIAN
    if (inputCmd === 'kencan') {
        let pList = users[sender]?.pasangan || []
        if (pList.length === 0) return m.reply('💔 Kamu tidak memiliki pasangan untuk diajak kencan. Lamar seseorang dulu dengan *.lamar @user*!')

        let lastKencan = users[sender].lastKencan || 0
        let cooldown = 3600000 // 1 jam
        if (Date.now() - lastKencan < cooldown) {
            let remaining = formatDuration(cooldown - (Date.now() - lastKencan))
            return m.reply(`⏳ Kamu dan pasanganmu masih lelah setelah kencan sebelumnya.\nTunggu *${remaining}* lagi untuk kencan berikutnya! 💕`)
        }

        users[sender].lastKencan = Date.now()
        let expBonus = Math.floor(Math.random() * 500) + 300
        let bucinBonus = Math.floor(Math.random() * 15) + 5

        // Tambahkan bonus poin bucin ke semua pasangan
        pList.forEach(p => {
            p.poinBucin = (p.poinBucin || 0) + bucinBonus
            // Tambahkan juga ke sisi pasangan
            if (users[p.jid] && users[p.jid].pasangan) {
                let rec = users[p.jid].pasangan.find(x => x.jid === sender)
                if (rec) rec.poinBucin = (rec.poinBucin || 0) + bucinBonus
            }
        })

        users[sender].exp = (users[sender].exp || 0) + expBonus

        let places = ['Restoran Mewah 🍷', 'Bioskop XXI 🍿', 'Taman Bunga 🌸', 'Pantai Sunset 🌅', 'Kafe Kopi Romantis ☕', 'Piknik Bukit Bintang ✨', 'Kapal Pesiar Sunset 🚢']
        let place = places[Math.floor(Math.random() * places.length)]

        let resText = `👩‍❤️‍👨 *KENCAN ROMANTIS BERHASIL!* 👩‍❤️‍👨\n\n`
        resText += `Kamu baru saja mengajak pasanganmu kencan di *${place}*!\n\n`
        resText += `🎁 *Bonus Pasangan:*\n`
        resText += `• +${expBonus} EXP\n`
        resText += `• +${bucinBonus} Poin Kemesraan Bucin 💕`

        return m.reply(resText)
    }

    // 6B. DAILY LOVE CLAIM (BERKAH NIKAH)
    if (['loveclaim', 'berkahnikah', 'hadiahpasangan'].includes(inputCmd)) {
        let pList = users[sender]?.pasangan || []
        if (pList.length === 0) return m.reply('💔 Kamu belum memiliki pasangan untuk mengklaim Berkah Nikah!')

        let lastClaim = users[sender].lastLoveClaim || 0
        let cooldown = 86400000 // 24 jam
        if (Date.now() - lastClaim < cooldown) {
            let remaining = formatDuration(cooldown - (Date.now() - lastClaim))
            return m.reply(`⏳ Kamu sudah mengklaim Berkah Nikah hari ini.\nTunggu *${remaining}* lagi untuk klaim harian berikutnya! ✨`)
        }

        users[sender].lastLoveClaim = Date.now()
        let moneyBonus = 50000
        let bucinBonus = 10
        let expBonus = 200

        users[sender].exp = (users[sender].exp || 0) + expBonus
        if (global.db?.data?.money) {
            global.db.data.money[sender] = (global.db.data.money[sender] || 0) + moneyBonus
        }

        pList.forEach(p => {
            p.poinBucin = (p.poinBucin || 0) + bucinBonus
            if (users[p.jid] && users[p.jid].pasangan) {
                let rec = users[p.jid].pasangan.find(x => x.jid === sender)
                if (rec) rec.poinBucin = (rec.poinBucin || 0) + bucinBonus
                if (global.db?.data?.money) {
                    global.db.data.money[p.jid] = (global.db.data.money[p.jid] || 0) + moneyBonus
                }
            }
        })

        let capClaim = `*╭───「 🎁 BERKAH NIKAH HARIAN 」───╮*\n`
        capClaim += `│ Selamat! Kamu dan pasanganmu mendapatkan\n`
        capClaim += `│ tunjangan kebahagiaan harian:\n`
        capClaim += `*╰─────────────────────────────────╯*\n\n`
        capClaim += `💰 *Bonus Uang:* +Rp ${moneyBonus.toLocaleString()} (Masing-masing)\n`
        capClaim += `💖 *Poin Bucin:* +${bucinBonus} Poin\n`
        capClaim += `✨ *Bonus EXP:* +${expBonus} EXP`

        return m.reply(capClaim)
    }

    // 7. BELI CINCIN
    if (['belicincin', 'cincin'].includes(inputCmd)) {
        let pList = users[sender]?.pasangan || []
        if (pList.length === 0) return m.reply('💔 Kamu belum punya pasangan untuk dibelikan cincin!')

        let arg = (args[0] || '').toLowerCase()
        if (!arg || !CINCIN_SHOP[arg]) {
            let shopTxt = `🛒 *TOKO CINCIN NIKAH* 🛒\n\n`
            for (let key in CINCIN_SHOP) {
                let item = CINCIN_SHOP[key]
                shopTxt += `• *${item.name}* (Ketik: *${usedPrefix}belicincin ${key}*)\n`
                shopTxt += `  Harga: ${item.price} Limit\n\n`
            }
            return m.reply(shopTxt)
        }

        let item = CINCIN_SHOP[arg]
        let userLimit = users[sender].limit || 0
        if (userLimit < item.price) return m.reply(`❌ Limit kamu tidak cukup! Harga ${item.name} adalah *${item.price} Limit*, limit kamu: ${userLimit}.`)

        users[sender].limit -= item.price

        // Pasang cincin ke semua pasangan
        pList.forEach(p => {
            p.cincin = item.name
            if (users[p.jid] && users[p.jid].pasangan) {
                let rec = users[p.jid].pasangan.find(x => x.jid === sender)
                if (rec) rec.cincin = item.name
            }
        })

        return m.reply(`🎉 *BERHASIL MEMBELI ${item.name.toUpperCase()}!*\n\nCincin pernikahanmu dan pasanganmu kini telah diperbarui menjadi *${item.name}*! 💍✨`)
    }

    // 8. HADIAH PASANGAN (TRANSFER LIMIT/EXP/MONEY/ATM/BERLIAN)
    if (inputCmd === 'hadiah') {
        let pList = users[sender]?.pasangan || []
        if (pList.length === 0) return m.reply('💔 Kamu tidak memiliki pasangan untuk diberi hadiah!')

        let target = m.mentionedJid?.[0] || pList[0]?.jid
        let type = (args[0] || '').toLowerCase()
        let count = parseInt(args[1] || args[0])

        if (m.mentionedJid?.[0]) {
            type = (args[1] || '').toLowerCase()
            count = parseInt(args[2])
        }

        const validTypes = ['limit', 'exp', 'money', 'atm', 'berlian']
        if (!validTypes.includes(type) || isNaN(count) || count <= 0) {
            return m.reply(`🎁 *FORMAT HADIAH PASANGAN:*\n*${usedPrefix}hadiah limit <jumlah>*\n*${usedPrefix}hadiah exp <jumlah>*\n*${usedPrefix}hadiah money <jumlah>*\n*${usedPrefix}hadiah atm <jumlah>*\n*${usedPrefix}hadiah berlian <jumlah>*\n\n_Bisa hadiahkan ke pasangan tanpa biaya potongan!_`)
        }

        if (type === 'money') {
            let moneySrc = global.db?.data?.money?.[sender] || 0
            if (moneySrc < count) return m.reply(`❌ Uang kamu tidak cukup! Kamu hanya punya Rp ${moneySrc.toLocaleString()}.`)
            global.db.data.money[sender] -= count
            global.db.data.money[target] = (global.db.data.money[target] || 0) + count
        } else if (type === 'atm') {
            let bankSrc = global.db?.data?.bank?.[sender] || 0
            if (bankSrc < count) return m.reply(`❌ Saldo Bank kamu tidak cukup! Kamu hanya punya Rp ${bankSrc.toLocaleString()}.`)
            global.db.data.bank[sender] -= count
            global.db.data.bank[target] = (global.db.data.bank[target] || 0) + count
        } else if (type === 'berlian') {
            if (!users[sender].inventory) users[sender].inventory = {}
            let berSrc = users[sender].inventory.berlian || 0
            if (berSrc < count) return m.reply(`❌ Berlian kebun kamu tidak cukup! Kamu punya ${berSrc} Berlian.`)
            users[sender].inventory.berlian -= count
            if (!users[target].inventory) users[target].inventory = {}
            users[target].inventory.berlian = (users[target].inventory.berlian || 0) + count
        } else {
            let userVal = users[sender][type] || 0
            if (userVal < count) return m.reply(`❌ ${type.toUpperCase()} kamu tidak cukup! Kamu hanya punya ${userVal} ${type}.`)
            users[sender][type] -= count
            if (!users[target]) users[target] = {}
            users[target][type] = (users[target][type] || 0) + count
        }

        return conn.sendMessage(m.chat, {
            text: `🎁 *HADIAH UNTUK PASANGAN*\n\n@${sender.split('@')[0]} memberikan hadiah *${count.toLocaleString()} ${type.toUpperCase()}* kepada pasangannya @${target.split('@')[0]}! 💕`,
            mentions: [sender, target]
        }, { quoted: m })
    }

    // 9. KARTU NIKAH DIGITAL (CANVAS ELEGANT ROYAL BLUE)
    if (['kartunikah', 'bukunikah'].includes(inputCmd)) {
        let who = conn.decodeJid(m.mentionedJid?.[0] || m.quoted?.sender || sender)
        let pList = users[who]?.pasangan || []

        if (pList.length === 0) {
            return m.reply('💔 Kamu saat ini belum memiliki pasangan untuk mencetak Kartu Nikah Digital.')
        }

        let partnerJid = pList[0].jid

        let pp1 = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
        let pp2 = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'

        try { pp1 = await conn.profilePictureUrl(who, 'image') } catch {}
        try { pp2 = await conn.profilePictureUrl(partnerJid, 'image') } catch {}

        try {
            const canvas = createCanvas(850, 520)
            const ctx = canvas.getContext('2d')

            // Background Deep Royal Blue Elegant Gradient
            const grad = ctx.createLinearGradient(0, 0, 850, 520)
            grad.addColorStop(0, '#0a192f')
            grad.addColorStop(0.5, '#1e3e62')
            grad.addColorStop(1, '#020c1b')
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, 850, 520)

            // Inner Gold Frame Border
            ctx.strokeStyle = '#d4af37'
            ctx.lineWidth = 5
            ctx.strokeRect(20, 20, 810, 480)

            ctx.strokeStyle = '#ffffff22'
            ctx.lineWidth = 1
            ctx.strokeRect(28, 28, 794, 464)

            // Header Text
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 28px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('KARTU NIKAH DIGITAL', 425, 65)

            ctx.fillStyle = '#38bdf8'
            ctx.font = '16px sans-serif'
            ctx.fillText('REPUBLIK BOT WHATSAPP OFFICIAL', 425, 92)

            // Line Separator
            ctx.strokeStyle = '#d4af37'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(150, 105)
            ctx.lineTo(700, 105)
            ctx.stroke()

            // Avatar 1 (User / Suami)
            let img1 = await loadImage(pp1)
            ctx.save()
            ctx.beginPath()
            ctx.arc(220, 220, 75, 0, Math.PI * 2, true)
            ctx.closePath()
            ctx.clip()
            ctx.drawImage(img1, 145, 145, 150, 150)
            ctx.restore()

            ctx.strokeStyle = '#d4af37'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.arc(220, 220, 75, 0, Math.PI * 2, true)
            ctx.stroke()

            // Avatar 2 (Pasangan / Istri)
            let img2 = await loadImage(pp2)
            ctx.save()
            ctx.beginPath()
            ctx.arc(630, 220, 75, 0, Math.PI * 2, true)
            ctx.closePath()
            ctx.clip()
            ctx.drawImage(img2, 555, 145, 150, 150)
            ctx.restore()

            ctx.strokeStyle = '#d4af37'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.arc(630, 220, 75, 0, Math.PI * 2, true)
            ctx.stroke()

            // Center Heart / Ring Icon Text
            ctx.fillStyle = '#ef4444'
            ctx.font = 'bold 45px sans-serif'
            ctx.fillText('💞', 425, 230)

            // Names Below Avatars
            let name1 = conn.getName(who)
            let name2 = conn.getName(partnerJid)

            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 20px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText(name1.length > 15 ? name1.substring(0, 15) + '...' : name1, 220, 345)
            ctx.fillText(name2.length > 15 ? name2.substring(0, 15) + '...' : name2, 630, 345)

            // Marriage Details Card Info
            let durStr = formatDuration(Date.now() - pList[0].nikahTime)
            let dateStr = new Date(pList[0].nikahTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

            ctx.fillStyle = '#f8fafc'
            ctx.font = '16px sans-serif'
            ctx.fillText(`📅 Tanggal Pernikahan : ${dateStr}`, 425, 395)
            ctx.fillText(`⏳ Durasi Menikah : ${durStr}`, 425, 425)

            ctx.fillStyle = '#f59e0b'
            ctx.font = 'bold 16px sans-serif'
            ctx.fillText(`STATUS: OFFICIAL & SAH (${pList[0].cincin || 'Cincin Perak'})`, 425, 460)

            let buffer = canvas.toBuffer('image/png')
            return conn.sendFile(m.chat, buffer, 'kartu-nikah.png', `💍 *KARTU NIKAH DIGITAL ELEGANT*\n\nPasangan: @${who.split('@')[0]} 💞 @${partnerJid.split('@')[0]}`, m, false, { mentions: [who, partnerJid] })

        } catch (e) {
            console.error('[KARTU NIKAH ERROR]:', e)
            return m.reply('❌ Gagal menggenerasi Kartu Nikah Digital.')
        }
    }
}

handler.help = ['lamar @user', 'terima', 'tolak', 'cerai @user', 'pasangan', 'kencan', 'belicincin', 'hadiah @user <jumlah>', 'kartunikah']
handler.tags = ['pasangan']
handler.command = /^(lamar|nikah|tembak|terima|tolak|cerai|pasangan|ceknikah|istri|suami|kencan|belicincin|cincin|hadiah|kartunikah|bukunikah)$/i

handler.before = async function (m, { conn }) {
    if (!m.text) return
    let txt = m.text.toLowerCase().trim()
    let isLamaranReply = m.quoted && (
        m.quoted.text?.toLowerCase().includes('lamaran') || 
        m.quoted.text?.toLowerCase().includes('melamar') ||
        m.quoted.text?.toLowerCase().includes('pasangannya')
    )
    if (!isLamaranReply && !global.db.data.proposals?.[conn.decodeJid(m.sender)]) return

    let sender = conn.decodeJid(m.sender)
    let proposals = global.db.data.proposals = global.db.data.proposals || {}
    let users = global.db.data.users

    if (txt === 'terima') {
        let prop = proposals[sender]
        if (!prop || (Date.now() - prop.time > 60000)) {
            delete proposals[sender]
            m.reply('❌ Tidak ada lamaran yang ditujukan padamu atau lamaran sudah kedaluwarsa.')
            return true
        }

        let fromJid = prop.from
        delete proposals[sender]

        if (!users[fromJid]) users[fromJid] = {}
        if (!users[fromJid].pasangan) users[fromJid].pasangan = []

        let now = Date.now()
        let newRecordFrom = { jid: sender, nikahTime: now, poinBucin: 10, cincin: 'Cincin Perak' }
        let newRecordTarget = { jid: fromJid, nikahTime: now, poinBucin: 10, cincin: 'Cincin Perak' }

        users[fromJid].pasangan.push(newRecordFrom)
        users[sender].pasangan.push(newRecordTarget)

        let ann = `🎉 *SELAMAT! PERNIKAHAN SAH!* 🎉\n\n`
        ann += `@${fromJid.split('@')[0]} 💞 @${sender.split('@')[0]}\n`
        ann += `Telah resmi menjadi pasangan suami & istri! 💍✨\n\n`
        ann += `Ketik *.pasangan* untuk melihat info status pernikahan kalian!\n`
        ann += `Ketik *.kartunikah* untuk melihat Kartu Nikah Digital!`

        conn.sendMessage(m.chat, {
            text: ann,
            mentions: [fromJid, sender]
        }, { quoted: m })
        return true
    }

    if (txt === 'tolak') {
        let prop = proposals[sender]
        if (!prop) {
            m.reply('❌ Tidak ada lamaran yang ditujukan padamu.')
            return true
        }
        let fromJid = prop.from
        delete proposals[sender]

        conn.sendMessage(m.chat, {
            text: `💔 @${sender.split('@')[0]} menolak lamaran dari @${fromJid.split('@')[0]}. Sabar ya, mungkin belum jodoh... 🥺`,
            mentions: [sender, fromJid]
        }, { quoted: m })
        return true
    }
}

handler.help = ['lamar @user', 'terima', 'tolak', 'cerai @user', 'pasangan', 'kencan', 'loveclaim', 'belicincin', 'hadiah <tipe> <jumlah>', 'kartunikah']
handler.tags = ['romansa', 'pasangan']
handler.command = /^(lamar|nikah|tembak|terima|tolak|cerai|pasangan|ceknikah|istri|suami|kencan|loveclaim|berkahnikah|hadiahpasangan|belicincin|cincin|hadiah|kartunikah|bukunikah)$/i

export default handler

