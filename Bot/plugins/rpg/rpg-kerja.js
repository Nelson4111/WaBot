import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const wdb = loadDB()
    
    if (!wdb.users[m.sender]) wdb.users[m.sender] = {}
    if (!wdb.users[m.sender].rpg) wdb.users[m.sender].rpg = {}
    
    let userRPG = wdb.users[m.sender].rpg
    
    if (userRPG.lastkerja === undefined) userRPG.lastkerja = 0
    if (userRPG.level === undefined) userRPG.level = 1
    if (userRPG.exp === undefined) userRPG.exp = 0

    let cooldown = 120000 
    let timers = (cooldown - (Date.now() - userRPG.lastkerja))
    if (Date.now() - userRPG.lastkerja < cooldown) return m.reply(`👷 Kamu masih lelah! Istirahat dulu selama *${Math.ceil(timers / 1000)} detik* lagi.`)

    let listJobs = [
      { lv: 1, job: "Pemulung", gaji: 5000 },
      { lv: 2, job: "Pengamen", gaji: 8000 },
      { lv: 3, job: "Pembersih Jalan", gaji: 12000 },
      { lv: 4, job: "Tukang Parkir Liar", gaji: 18000 },
      { lv: 5, job: "Penjual Tissue", gaji: 25000 },
      { lv: 6, job: "Karyawan Toko", gaji: 45000 },
      { lv: 7, job: "Kasir Minimarket", gaji: 75000 },
      { lv: 8, job: "Kurir", gaji: 112000 },
      { lv: 9, job: "Driver Ojol", gaji: 157000 },
      { lv: 10, job: "Satpam", gaji: 210000 },
      { lv: 11, job: "Barista", gaji: 270000 },
      { lv: 12, job: "Mekanik Bengkel", gaji: 337000 },
      { lv: 13, job: "Badut", gaji: 412000 },
      { lv: 14, job: "Koki", gaji: 495000 },
      { lv: 15, job: "Tukang Cukur", gaji: 585000 },
      { lv: 16, job: "SPG/SPB", gaji: 682000 },
      { lv: 17, job: "Waiter Restoran", gaji: 787000 },
      { lv: 18, job: "Admin Online Shop", gaji: 900000 },
      { lv: 19, job: "Tukang Jahit Kostum", gaji: 1020000 },
      { lv: 20, job: "Tukang Parkir", gaji: 1147000 },
      { lv: 25, job: "Operator Pabrik", gaji: 1320000 },
      { lv: 30, job: "Guru Les Privat", gaji: 1500000 },
      { lv: 35, job: "Petugas Pemadam Kebakaran", gaji: 1687000 },
      { lv: 40, job: "Staff Gudang", gaji: 1882000 },
      { lv: 45, job: "Teller Bank", gaji: 2085000 },
      { lv: 50, job: "Admin Kantor", gaji: 2295000 },
      { lv: 55, job: "Pembawa Berita", gaji: 2520000 },
      { lv: 60, job: "Desainer Grafis", gaji: 2752000 },
      { lv: 65, job: "Video Editor", gaji: 2992000 },
      { lv: 70, job: "Marketing", gaji: 3240000 },
      { lv: 75, job: "Customer Service", gaji: 3495000 },
      { lv: 80, job: "Guru", gaji: 3757000 },
      { lv: 85, job: "Content Creator", gaji: 4027000 },
      { lv: 87, job: "Streamer", gaji: 4140000 },
      { lv: 88, job: "Cosplayer", gaji: 4252000 },
      { lv: 89, job: "VTuber", gaji: 4365000 },
      { lv: 90, job: "HRD Staff", gaji: 4485000 },
      { lv: 95, job: "Digital Marketing", gaji: 4785000 },
      { lv: 100, job: "Supervisor", gaji: 5092000 },
      { lv: 110, job: "Perawat", gaji: 5475000 },
      { lv: 120, job: "Akuntan Junior", gaji: 5865000 },
      { lv: 130, job: "Social Media Specialist", gaji: 6262000 },
      { lv: 140, job: "UI/UX Designer", gaji: 6667000 },
      { lv: 150, job: "Polisi", gaji: 8000000 },
      { lv: 160, job: "Dosen", gaji: 8800000 },
      { lv: 170, job: "Apoteker", gaji: 9650000 },
      { lv: 180, job: "Web Developer", gaji: 10550000 },
      { lv: 190, job: "Project Manager", gaji: 11500000 },
      { lv: 200, job: "Tentara", gaji: 12500000 },
      { lv: 220, job: "Dokter Umum", gaji: 13800000 },
      { lv: 240, job: "Arsitek", gaji: 15200000 },
      { lv: 260, job: "Event Organizer", gaji: 16700000 },
      { lv: 280, job: "Akuntan", gaji: 18300000 },
      { lv: 300, job: "Manager", gaji: 20000000 },
      { lv: 330, job: "Pengacara", gaji: 22000000 },
      { lv: 360, job: "Programmer Senior", gaji: 24100000 },
      { lv: 390, job: "Penari Profesional", gaji: 26300000 },
      { lv: 420, job: "Programmer", gaji: 28600000 },
      { lv: 450, job: "Model Busana", gaji: 31000000 },
      { lv: 480, job: "Konsultan", gaji: 33500000 },
      { lv: 520, job: "Direktur", gaji: 36500000 },
      { lv: 550, job: "Dokter Spesialis", gaji: 39000000 },
      { lv: 600, job: "Pilot", gaji: 42500000 },
      { lv: 650, job: "Hakim", gaji: 46000000 },
      { lv: 700, job: "Selebgram", gaji: 49500000 },
      { lv: 800, job: "Pemilik UMKM", gaji: 55000000 },
      { lv: 900, job: "Youtuber", gaji: 60500000 },
      { lv: 1000, job: "Gamer Profesional", gaji: 66000000 },
      { lv: 1200, job: "Pemilik Franchise", gaji: 75000000 },
      { lv: 1400, job: "Pemilik Pabrik", gaji: 84000000 },
      { lv: 1600, job: "CEO Perusahaan", gaji: 93000000 },
      { lv: 1800, job: "Selebriti TV", gaji: 98000000 },
      { lv: 2000, job: "Gubernur", gaji: 99500000 },
      { lv: 2250, job: "Menteri", gaji: 99800000 },
      { lv: 2500, job: "CEO", gaji: 100000000 }
    ]

    // Auto kasih exp = gaji / 1000
    listJobs = listJobs.map(j => ({...j, exp: Math.floor(j.gaji / 1000) }))

    let args = (text || '').toLowerCase()

    // LIST KERJA
    if (args === 'list' || args === 'l') {
        let caption = `💼 *DAFTAR PEKERJAAN*\n`
        caption += `Level Kamu: *[ Lv.${userRPG.level} ]*\n\n`
        
        let jobBisa = listJobs.filter(j => userRPG.level >= j.lv)
        let jobTerkini = jobBisa[jobBisa.length - 1]
        caption += `⚡ *Job Sekarang*: ${jobTerkini.job} | Rp ${jobTerkini.gaji.toLocaleString()}\n\n`

        listJobs.forEach((v, i) => {
            let bisa = userRPG.level >= v.lv ? '✅' : '🔒'
            caption += `${i + 1}. ${bisa} *${v.job}* Lv.${v.lv}\n`
        })
        caption += `\nKetik *${usedPrefix + command}* untuk kerja otomatis di job tertinggi`
        return m.reply(caption)
    }

    // KERJA OTOMATIS
    let availableJobs = listJobs.filter(j => userRPG.level >= j.lv)
    if (availableJobs.length === 0) return m.reply('❌ Level kamu terlalu rendah untuk bekerja.')

    let selected = availableJobs[availableJobs.length - 1]

    try {
        wdb.money[m.sender] = (wdb.money[m.sender] || 0) + selected.gaji
        userRPG.exp += selected.exp
        userRPG.lastkerja = Date.now()
        
        let naikLevel = false
        if (userRPG.exp >= userRPG.level * 500) { 
          userRPG.level++; 
          userRPG.exp = 0 
          naikLevel = true
        }
        
        saveDB(wdb)
        
        let msg = `💼 *KERJA BERHASIL*\n\n`
        msg += `Pekerjaan: *${selected.job}*\n`
        msg += `Pendapatan: *+Rp ${selected.gaji.toLocaleString()}*\n`
        msg += `XP: *+${selected.exp.toLocaleString()}*\n`
        msg += `Level: *Lv.${userRPG.level}* (${userRPG.exp}/${userRPG.level * 500})`
        if(naikLevel) msg += `\n\n🎉 *LEVEL UP!*`

        m.reply(msg)

    } catch (e) {
        console.error(e)
        m.reply('❌ Terjadi kesalahan saat bekerja.')
    }
}

handler.help = ['kerja', 'kerja list']
handler.tags = ['rpg']
handler.command = /^(kerja|work)$/i
handler.group = true

export default handler
