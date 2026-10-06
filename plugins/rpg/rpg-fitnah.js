import { loadDB, saveDB } from '../../lib/waifuHelper.js'
import { resolvePendingFitnah, restorePendingFitnahTimers, schedulePendingFitnah } from '../../lib/fitnahHelper.js'
import { adjustCrimeSuccessChance, getCrimeRestriction, scaleDifficultyCooldown } from '../../lib/rpgDifficulty.js'
import { tryPremiumProtection } from '../../lib/rpgPremium.js'

/* =========================================================
   KONFIGURASI
========================================================= */

const DEFAULT_DURATION = 1 * 60 * 60 * 1000 // 1 jam
const MED_DURATION = 2 * 60 * 60 * 1000 // 2 jam
const HIGH_DURATION = 5 * 60 * 60 * 1000 // 5 jam

const COOLDOWN_FITNAH = 5 * 60 * 1000 // cooldown normal 5 menit
const COOLDOWN_HUKUMAN = 30 * 60 * 1000
const DELAY_FITNAH = 5 * 60 * 1000

/* =========================================================
   STORY FITNAH
   20 VARIASI
========================================================= */

const story_fitnah = [
    { sukses: `🗣️ Kamu menyogok beberapa warga agar bersaksi palsu. Cerita menyebar dan target langsung ditangkap.`, gagal: `🗣️ Kamu mencoba menyebar fitnah. Sayangnya warga tidak percaya dan malah melaporkannya.` },
    { sukses: `📢 Dengan uang pelicin, rumor tentang target viral dalam sejam. Polisi menangkap target.`, gagal: `📢 Rumor yang kamu sebarkan terlalu dipaksa. Polisi malah curiga padamu.` },
    { sukses: `📰 Kamu bayar media buat memuat berita fitnah. Target dijebloskan ke penjara.`, gagal: `📰 Berita fitnahmu tidak punya bukti. Redaksi membongkar siapa penyebarnya.` },
    { sukses: `👀 Kamu menyewa saksi palsu. Kesaksian meyakinkan membuat target dipenjara.`, gagal: `👀 Saksi palsumu gugup saat diinterogasi. Semuanya terbongkar.` },
    { sukses: `🤫 Kamu sebarkan bisikan di warung + amplop coklat. Laporan resmi masuk.`, gagal: `🤫 Bisikanmu ketahuan. Yang kamu sogok justru melaporkanmu.` },
    { sukses: `📱 Kamu sebar chat palsu + bukti editan. Polisi percaya dan menangkap target.`, gagal: `📱 Bukti editanmu ketahuan. Nomor kamu dilacak polisi.` },
    { sukses: `💬 Kamu bayar orang buat teriak "pencuri" ke target di pasar. Massa langsung amuk.`, gagal: `💬 Orangnya kabur sebelum teriak. Rencanamu gagal.` },
    { sukses: `🕵️ Kamu susun skenario rapi + suap petugas. Target diamankan.`, gagal: `🕵️ Ada 1 detail yang janggal. Petugas menolak suap dan menangkapmu.` },
    { sukses: `🚨 Kamu buat laporan anonim + lampirkan "bukti". Target ditangkap.`, gagal: `🚨 Laporan anonimmu tidak valid. IP dicatat.` },
    { sukses: `📣 Kamu gerakkan ormas bayaran buat demo tuduh target. Polisi ikut angkut.`, gagal: `📣 Ormasnya batal. Uangnya dibawa kabur.` },
    { sukses: `🎭 Kamu bayar aktor buat pura2 jadi korban. Target dianggap bersalah.`, gagal: `🎭 Aktornya lupa naskah. Ketahuan akting.` },
    { sukses: `🗯️ Kamu sebarkan tuduhan + kasih uang ke RT. Target diproses.`, gagal: `🗯️ RT nya jujur. Malah laporin kamu.` },
    { sukses: `🔎 Kamu arahkan polisi ke target dengan "barang bukti" titipan.`, gagal: `🔎 Barang bukti sidik jarinya milikmu.` },
    { sukses: `📜 Kamu buat surat laporan palsu + materai + suap.`, gagal: `📜 Nomor surat tidak terdaftar. Kamu yang dipanggil.` },
    { sukses: `😈 Kamu manfaatkan gosip lama + tambah amplop. Target masuk bui.`, gagal: `😈 Saksi lama membela target. Rencanamu gagal.` },
    { sukses: `🏙️ Kamu bikin isu besar + bayar buzzer. Target jadi tersangka.`, gagal: `🏙️ Buzzernya ga jalan. Tagar sepi.` },
    { sukses: `📸 Kamu edit foto + bayar admin grup. Target ditangkap.`, gagal: `📸 Hasil editannya jelek. Ketahuan.` },
    { sukses: `🤥 Kamu berbohong dengan sangat meyakinkan + kasih uang damai ke saksi.`, gagal: `🤥 Bohongmu ketahuan. Saksi nolak uangnya.` },
    { sukses: `🎤 Kamu sewa orang buat jadi saksi di kantor polisi. Target ditahan.`, gagal: `🎤 Saksimu grogi. Ceritanya berantakan.` },
    { sukses: `⚠️ Kamu buat target jadi tersangka utama lewat jalur "dalam".`, gagal: `⚠️ Jalur dalamnya ketutup. Kamu yang disidik.` }
]

/* =========================================================
   JID / LID
========================================================= */

function resolveJid(jid) {
    if (!jid) return jid
    if (typeof jid!== 'string') return jid
    if (jid.endsWith('@s.whatsapp.net')) return jid
    if (jid.endsWith('@lid')) return global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
    if (/^\d+$/.test(jid)) return jid + '@s.whatsapp.net'
    return jid
}

/* =========================================================
   USER RPG
========================================================= */

function getUserRPG(jid) {
    jid = resolveJid(jid)
    if (!jid) return null
    if (!global.db?.data) return null
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[jid]) global.db.data.users[jid] = {}
    if (!global.db.data.users[jid].rpg) global.db.data.users[jid].rpg = {}
    return global.db.data.users[jid].rpg
}

/* =========================================================
   CEK TARGET PENJARA
========================================================= */

function cekPenjara(wdb, jid) {
    jid = resolveJid(jid)
    let rpg = global.db?.data?.users?.[jid]?.rpg
    if (!rpg ||!rpg.penjara) return false
    let mulai = Number(rpg.penjara) || 0
    let lama = Number(rpg.lamaPenjara) || 0
    if (!mulai ||!lama) return false
    return Date.now() - mulai < lama
}

/* =========================================================
   RANDOM STORY
========================================================= */

function randomStory() {
    return story_fitnah[Math.floor(Math.random() * story_fitnah.length)]
}

function formatMoney(n) {
    return Number(n).toLocaleString('id-ID')
}

function formatTime(ms) {
    let jam = Math.floor(ms / 3600000)
    let menit = Math.floor((ms % 3600000) / 60000)
    let detik = Math.floor((ms % 60000) / 1000)
    if(jam > 0) return `${jam}j ${menit}m`
    if(menit > 0) return `${menit}m ${detik}d`
    return `${detik}d`
}

/* =========================================================
   HANDLER
========================================================= */

let handler = async (m, { conn, args, usedPrefix }) => {

    const wdb = loadDB()
    wdb.penjara = Array.isArray(wdb.penjara)? wdb.penjara : []
    wdb.money = wdb.money || {}
    global.db.data.fitnah = global.db.data.fitnah || {}
    global.db.data.fitnahHukuman = global.db.data.fitnahHukuman || {}
    wdb.fitnah = global.db.data.fitnah
    wdb.fitnahHukuman = global.db.data.fitnahHukuman

    if (!global.db?.data) return m.reply('❌ Database utama belum siap.')
    if (!global.db.data.users) global.db.data.users = {}

    /* =====================================================
       CEK APAKAH CUMA KETIK.fitnah
    ===================================================== */

    if (!args[0] &&!m.mentionedJid?.[0] &&!m.quoted) {
        return m.reply(`╭─❏「 🤥 FITNAH 」❏

Fitnah orang biar masuk penjara.

*Cara:* ${usedPrefix}fitnah @tag <uang>
*Contoh:* ${usedPrefix}fitnah @628 1000000
*Contoh:* ${usedPrefix}fitnah @628 0

💰 Tebusan = 50% dari uang yg kamu keluarin
⏳ Fitnah diproses setelah 5 menit jika target tidak membantah.
🛡️ Target dapat memakai *.bantah <biaya>* untuk mencoba menggagalkan fitnah.
⚠️ Jika gagal, denda 50% biaya fitnah dan peluang 50% masuk penjara.
⏳ CD Normal : 5 menit
⏳ CD Hukuman : 30 menit jika ga bisa bayar denda`)
    }

    /* =====================================================
       TARGET
    ===================================================== */

    const mentionedTarget = m.mentionedJid?.[0]
    const quotedTarget = m.quoted?.sender
    let who = mentionedTarget || quotedTarget
    if (!who && args[0] && args[1] !== undefined) {
        let num = args[0].replace(/[^0-9]/g, '')
        if (num.startsWith('08')) num = '628' + num.slice(2)
        if (num.length >= 8) who = num + '@s.whatsapp.net'
    }
    who = resolveJid(who)

    const rawUang = mentionedTarget || (!quotedTarget && who) ? args[1] : args[0]
    if (rawUang === undefined || !/^\d+$/.test(String(rawUang))) {
        return m.reply(`❌ Masukkan uang yang valid.\nContoh: ${usedPrefix}fitnah @tag 1000000\nAtau reply pesan target: ${usedPrefix}fitnah 1000000`)
    }
    let uangTaruhan = Number(rawUang)

    if (!who) {
        return m.reply(`❌ Tag target dulu\nContoh: ${usedPrefix}fitnah @tag 1000000`)
    }

    global.db.data.fitnahPending = global.db.data.fitnahPending || {}
    const existingPending = global.db.data.fitnahPending[who]
    if (existingPending) {
        if (Date.now() >= Number(existingPending.expiresAt)) {
            await resolvePendingFitnah(conn, existingPending)
        } else {
            return m.reply(`⏳ @${who.split('@')[0]} masih memiliki fitnah yang menunggu proses.`, undefined, { mentions: [who] })
        }
    }

    let sender = resolveJid(m.sender)
    const senderRPG = getUserRPG(sender)
    const actorRestriction = getCrimeRestriction(senderRPG)
    if (actorRestriction) return m.reply(actorRestriction)

    if (who === sender) return m.reply('❌ Kamu tidak bisa memfitnah diri sendiri.')
    const targetRPG = getUserRPG(who)
    const targetRestriction = getCrimeRestriction(targetRPG, { target: true })
    if (targetRestriction) return m.reply(targetRestriction)
    if (cekPenjara(wdb, who)) return m.reply(`❌ @${who.split('@')[0]} sudah di penjara.`, undefined, { mentions: [who] })

    /* =====================================================
       PELUANG & DURASI
    ===================================================== */

    let peluang = 0.01 // default 1%
    let durasiPenjara = DEFAULT_DURATION
    let tebusan = 0

    if (uangTaruhan >= 100000000) {
        peluang = 1.0
        durasiPenjara = HIGH_DURATION // 5 jam
        tebusan = Math.floor(uangTaruhan / 2)
    } else if (uangTaruhan >= 10000000) {
        peluang = 0.25
        durasiPenjara = MED_DURATION // 2 jam
        tebusan = Math.floor(uangTaruhan / 2)
    } else if (uangTaruhan > 0) {
        peluang = 0.05
        durasiPenjara = DEFAULT_DURATION // 1 jam
        tebusan = Math.floor(uangTaruhan / 2)
    } else {
        peluang = 0.01
        durasiPenjara = DEFAULT_DURATION // 1 jam
        tebusan = 0
    }

    /* =====================================================
       CEK UANG
    ===================================================== */

    let uangSender = Number(wdb.money[sender]) || 0
    if (uangSender < uangTaruhan) {
        return m.reply(`❌ Uang tidak cukup.\n💰 Punya: Rp ${formatMoney(uangSender)}\n💸 Butuh: Rp ${formatMoney(uangTaruhan)}`)
    }

    /* =====================================================
       COOLDOWN DIRI SENDIRI
    ===================================================== */

    let lastNormal = Number(wdb.fitnah[sender]) || 0
    let lastHukuman = Number(wdb.fitnahHukuman[sender]) || 0
    let now = Date.now()

    // cek cooldown hukuman dulu, lebih prioritas
    if (now - lastHukuman < COOLDOWN_HUKUMAN) {
        let sisa = COOLDOWN_HUKUMAN - (now - lastHukuman)
        return m.reply(`⛓️ *KAMU SEDANG DIHUKUM*\n\nKarena gagal bayar denda.\nTunggu *${formatTime(sisa)}* lagi`)
    }
    const actionCooldown = scaleDifficultyCooldown(senderRPG, COOLDOWN_FITNAH)
    if (now - lastNormal < actionCooldown) {
        let sisa = actionCooldown - (now - lastNormal)
        return m.reply(`⏳ *COOLDOWN*\n\nTunggu *${formatTime(sisa)}* lagi`)
    }

    if (tryPremiumProtection(who)) {
        await saveDB(wdb)
        return m.reply('🛡️ Premium protection melindungi target dari aksi fitnah. Tidak ada uang yang dipotong.')
    }

    wdb.fitnah[sender] = now
    wdb.money[sender] = uangSender - uangTaruhan // potong modal dulu

    let story = randomStory()
    const pending = {
        id: `${now}-${Math.random().toString(36).slice(2)}`,
        sender,
        target: who,
        chat: m.chat,
        wager: uangTaruhan,
        successChance: adjustCrimeSuccessChance(senderRPG, peluang),
        duration: durasiPenjara,
        bail: tebusan,
        successStory: story.sukses,
        failureStory: story.gagal,
        createdAt: now,
        expiresAt: now + DELAY_FITNAH
    }
    global.db.data.fitnahPending[who] = pending
    await saveDB(wdb)
    schedulePendingFitnah(conn, pending)

    return conn.reply(
        m.chat,
        `╭─❏「 🤥 FITNAH DIMULAI 」❏\n\n> 👤 Pelaku: @${sender.split('@')[0]}\n> 🎯 Target: @${who.split('@')[0]}\n> 💸 Biaya fitnah: Rp ${formatMoney(uangTaruhan)}\n> ⏳ Proses dalam 5 menit\n\nTarget dapat mencoba menggagalkan fitnah dengan *.bantah <biaya>*.\n\n╰─━━━━━━━━━━━━━━─`,
        m,
        { mentions: [sender, who] }
    )
}

/* =========================================================
   CONFIG
========================================================= */

handler.help = ['fitnah @tag <uang>']
handler.tags = ['rpg']
handler.command = /^(fitnah|nipu|menipu)$/i
handler.group = true
handler.all = function () {
    restorePendingFitnahTimers(this)
}

export default handler