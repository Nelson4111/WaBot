import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const wdb = loadDB()
    
    if (!wdb.users[m.sender]) wdb.users[m.sender] = {}
    if (!wdb.users[m.sender].rpg) wdb.users[m.sender].rpg = {}
    
    let userRPG = wdb.users[m.sender].rpg
    
    if (userRPG.lastkerja === undefined) userRPG.lastkerja = 0
    if (userRPG.level === undefined) userRPG.level = 1

    let cooldown = 120000 
    let timers = (cooldown - (new Date() - userRPG.lastkerja))
    if (new Date() - userRPG.lastkerja < cooldown) return m.reply(`👷 Kamu masih lelah! Istirahat dulu selama *${Math.ceil(timers / 1000)} detik* lagi.`)

    let listJobs = [
        { lv: 1, job: "Pembersih Jalan", gaji: 15000 },
        { lv: 2, job: "Driver Ojol", gaji: 35000 },
        { lv: 3, job: "Karyawan Toko", gaji: 60000 },
        { lv: 4, job: "Kasir Minimarket", gaji: 85000 },
        { lv: 5, job: "Security Bank", gaji: 120000 },
        { lv: 6, job: "Guru Privat", gaji: 180000 },
        { lv: 7, job: "Manager", gaji: 250000 },
        { lv: 8, job: "Dokter", gaji: 400000 },
        { lv: 9, job: "Pilot", gaji: 650000 },
        { lv: 10, job: "CEO Perusahaan", gaji: 1000000 }
    ]

    if (!text || isNaN(text)) {
        let caption = `💼 *DAFTAR PEKERJAAN*\n`
        caption += `Level Kamu: *[ Lv.${userRPG.level} ]*\n\n`
        listJobs.forEach((v, i) => {
            // Menghilangkan tanda ceklis/silang, hanya menampilkan info level
            caption += `${i + 1}. *${v.job}* (Min. Lv ${v.lv})\n   Gaji: Rp ${v.gaji.toLocaleString()}\n`
        })
        caption += `\nKetik *${usedPrefix + command} [nomor]* untuk mulai bekerja.`
        return m.reply(caption)
    }

    let jobIdx = parseInt(text) - 1
    let selected = listJobs[jobIdx]

    if (!selected) return m.reply('❌ Nomor pekerjaan tidak tersedia.')
    if (userRPG.level < selected.lv) return m.reply(`❌ Level kamu belum mencukupi! Kamu saat ini *Lv.${userRPG.level}*, butuh minimal *Lv.${selected.lv}* untuk menjadi ${selected.job}.`)

    try {
        wdb.money[m.sender] = (wdb.money[m.sender] || 0) + selected.gaji
        userRPG.lastkerja = new Date() * 1
        
        saveDB(wdb)
        m.reply(`💼 *KERJA BERHASIL*\n\nPekerjaan: *${selected.job}*\nPendapatan: *+Rp ${selected.gaji.toLocaleString()}*\nLevel Anda: *Lv.${userRPG.level}*`)

    } catch (e) {
        console.error(e)
        m.reply('❌ Terjadi kesalahan saat bekerja.')
    }
}

handler.help = ['kerja <nomor>']
handler.tags = ['rpg']
handler.command = /^(kerja|work)$/i
handler.group = true

export default handler