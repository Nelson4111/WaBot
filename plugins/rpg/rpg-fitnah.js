import { loadDB, saveDB } from '../../lib/waifuHelper.js'

/* =========================================================
   KONFIGURASI
========================================================= */

const DEFAULT_DURATION = 1 * 60 * 60 * 1000 // 1 jam
const MED_DURATION = 2 * 60 * 60 * 1000 // 2 jam
const HIGH_DURATION = 5 * 60 * 60 * 1000 // 5 jam

const COOLDOWN_FITNAH = 5 * 60 * 1000 // cooldown normal 5 menit
const COOLDOWN_HUKUMAN = 30 * 60 * 1000 // cooldown hukuman 30 menit kalau ga bisa bayar denda
const DENDA_GAGAL = 1000000 // denda 1jt

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
   BERSIHKAN PENJARA
========================================================= */

function normalizePrisonList(wdb) {
    wdb.penjara = Array.isArray(wdb.penjara)? wdb.penjara : []
    let result = []
    let seen = new Set()
    for (let rawJid of wdb.penjara) {
        let jid = resolveJid(rawJid)
        if (!jid) continue
        if (seen.has(jid)) continue
        let rpg = global.db?.data?.users?.[jid]?.rpg
        if (!rpg ||!rpg.penjara) continue
        let mulai = Number(rpg.penjara) || 0
        let lama = Number(rpg.lamaPenjara) || 0
        if (!mulai ||!lama) continue
        if (Date.now() - mulai >= lama) continue
        seen.add(jid)
        result.push(jid)
    }
    wdb.penjara = result
    for (let i = 0; i < wdb.penjara.length; i++) {
        let jid = wdb.penjara[i]
        let rpg = getUserRPG(jid)
        if (rpg) rpg.sel = i + 1
    }
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
    wdb.fitnah = wdb.fitnah || {}
    wdb.fitnahHukuman = wdb.fitnahHukuman || {} // cooldown hukuman

    if (!global.db?.data) return m.reply('❌ Database utama belum siap.')
    if (!global.db.data.users) global.db.data.users = {}

    /* =====================================================
       CEK APAKAH CUMA KETIK.fitnah
    ===================================================== */

    if (!args[0] &&!m.mentionedJid?.[0] &&!m.quoted) {
        return m.reply(`[ 🤥 ]───[ *_FITNAH_* ]───✦

Fitnah orang biar masuk penjara.

*Cara:* ${usedPrefix}fitnah @tag <uang>
*Contoh:* ${usedPrefix}fitnah @628 100000000
*Contoh:* ${usedPrefix}fitnah @628 0

💰 Tebusan = 50% dari uang yg kamu keluarin
⚠️ Gagal = Denda Rp 1.000.000
⏳ CD Normal : 5 menit
⏳ CD Hukuman : 30 menit jika ga bisa bayar denda`)
    }

    /* =====================================================
       TARGET
    ===================================================== */

    let who = m.mentionedJid?.[0] || m.quoted?.sender
    if (!who && args[0]) {
        let num = args[0].replace(/[^0-9]/g, '')
        if (num.startsWith('08')) num = '628' + num.slice(2)
        if (num.length >= 8) who = num + '@s.whatsapp.net'
    }
    who = resolveJid(who)

    let uangTaruhan = parseInt(args[1]) || 0

    if (!who) {
        return m.reply(`❌ Tag target dulu\nContoh: ${usedPrefix}fitnah @tag 100000000`)
    }

    let sender = resolveJid(m.sender)

    if (who === sender) return m.reply('❌ Kamu tidak bisa memfitnah diri sendiri.')
    if (cekPenjara(wdb, who)) return m.reply(`❌ @${who.split('@')[0]} sudah di penjara.`, { mentions: [who] })

    /* =====================================================
       HITUNG PELUANG & DURASI BERDASAR UANG
       0 = 1%, 1 - 9.999.999 = 10%, 10jt - 99.999.999 = 50%, 100jt+ = 100%
    ===================================================== */

    let peluang = 0.01 // default 1%
    let durasiPenjara = DEFAULT_DURATION
    let tebusan = 0

    if (uangTaruhan >= 100000) { // 100jt keatas = 100%
        peluang = 1.0
        durasiPenjara = HIGH_DURATION // 5 jam
        tebusan = Math.floor(uangTaruhan / 2)
    } else if (uangTaruhan >= 10000000) { // 10jt - 99.999.999 = 50%
        peluang = 0.5
        durasiPenjara = MED_DURATION // 2 jam
        tebusan = Math.floor(uangTaruhan / 2)
    } else if (uangTaruhan > 0) { // 1 - 9.999.999 = 10%
        peluang = 0.1
        durasiPenjara = DEFAULT_DURATION // 1 jam
        tebusan = Math.floor(uangTaruhan / 2)
    } else { // 0 = 1%
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
    if (now - lastNormal < COOLDOWN_FITNAH) {
        let sisa = COOLDOWN_FITNAH - (now - lastNormal)
        return m.reply(`⏳ *COOLDOWN*\n\nTunggu *${formatTime(sisa)}* lagi`)
    }

    wdb.fitnah[sender] = now
    wdb.money[sender] = uangSender - uangTaruhan // potong modal dulu
    saveDB(wdb)

    /* =====================================================
       STORY & HASIL
    ===================================================== */

    let story = randomStory()
    let berhasil = Math.random() < peluang

    /* =====================================================
       GAGAL + DENDA 1JT
       KALO GA BISA BAYAR = COOLDOWN 30 MENIT
    ===================================================== */

    if (!berhasil) {
        let uangSetelahModal = Number(wdb.money[sender]) || 0
        let kenaHukuman = false

        if (uangSetelahModal >= DENDA_GAGAL) {
            wdb.money[sender] = uangSetelahModal - DENDA_GAGAL
        } else {
            wdb.money[sender] = 0 // ludesin
            wdb.fitnahHukuman[sender] = now // set cooldown hukuman
            kenaHukuman = true
        }
        saveDB(wdb)

        let dendaText = kenaHukuman
           ? `│ 𖥔 Denda : Rp ${formatMoney(DENDA_GAGAL)} - GAGAL BAYAR\n│ 𖥔 Hukuman : CD 30 menit`
            : `│ 𖥔 Denda : Rp ${formatMoney(DENDA_GAGAL)} - LUNAS`

        return conn.reply(m.chat, `[ 🤥 ]───[ *_FITNAH GAGAL_* ]───✦

${story.gagal}

╭──「 💥 GAGAL 」─✦
│ 𖥔 Target : @${who.split('@')[0]}
│ 𖥔 Pengeluaran : Rp ${formatMoney(uangTaruhan)}
${dendaText}
│ 𖥔 Uang Hangus
╰ 𖥔 Polisi malah mencurigaimu.`, m, { mentions: [sender, who] })
    }

    /* =====================================================
       BERHASIL
    ===================================================== */

    let targetRPG = getUserRPG(who)
    if (!targetRPG) return m.reply('❌ Data RPG target tidak tersedia.')

    wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
    wdb.penjara.push(who)
    normalizePrisonList(wdb)

    let index = wdb.penjara.findIndex(jid => resolveJid(jid) === who)
    let sel = index + 1

    targetRPG.penjara = Date.now()
    targetRPG.lamaPenjara = durasiPenjara
    targetRPG.tebusan = tebusan
    targetRPG.sel = sel
    targetRPG.gagalCopet = 0

    saveDB(wdb)

    return conn.reply(m.chat, `[ 🤥 ]───[ *_FITNAH BERHASIL_* ]───✦

${story.sukses}

╭──「 🚔 HASIL 」─✦
│ 𖥔 Pelaku : @${sender.split('@')[0]}
│ 𖥔 Korban : @${who.split('@')[0]}
│ 𖥔 SEL : ${sel}
│ 𖥔 Durasi : ${durasiPenjara / 3600000} jam
│ 𖥔 Keluarin : Rp ${formatMoney(uangTaruhan)}
│ 𖥔 Tebusan : Rp ${formatMoney(tebusan)}
╰ 𖥔 Masuk penjara!`, m, { mentions: [sender, who] })
}

/* =========================================================
   CONFIG
========================================================= */

handler.help = ['fitnah @tag <uang>']
handler.tags = ['rpg']
handler.command = /^(fitnah|nipu|menipu)$/i
handler.group = true

export default handler