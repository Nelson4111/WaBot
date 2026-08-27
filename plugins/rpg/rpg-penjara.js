import { loadDB, saveDB } from '../../lib/waifuHelper.js'

/* =========================================================
   DIALOG VISIT 20x20
========================================================= */

const dialogVisitNapi = [
    '“Akhirnya ada juga yang datang menjengukku...”','“Kau datang jauh-jauh cuma buat lihat aku di balik jeruji?”','“Aku baik-baik saja... cuma bosan dengan tembok ini.”','“Jangan khawatir. Aku masih kuat bertahan di sini.”','“Kunjunganmu benar-benar membuat waktuku terasa lebih cepat.”',
    '“Aku nggak menyangka masih ada yang mau datang menjenguk.”','“Di sini dingin dan sepi. Lumayan ada teman ngobrol.”','“Kalau kau punya kabar dari luar, ceritakan semuanya.”','“Aku sudah mulai hafal bentuk setiap sudut ruangan ini.”','“Terima kasih sudah datang. Setidaknya hari ini tidak terasa terlalu panjang.”',
    '“Bang tolong dong... kasih makan 😭”','“Aku dijebak bang, sumpah demi Tuhan”','“Udah 3 hari makan roti doang”','“Besok aku bebas kan bang? Tolong ya”','“Makasih udah mau nengok... sepi banget disini”',
    '“Lu juga hati2 bang, polisi lagi nyari2”','“Titip salam buat keluarga ya bang”','“Aku kapok bang, ga bakal ngulang lagi”','“Ada rokok ga bang? Bosen banget”','“Doain aku cepet bebas ya bang 🙏”'
]

const dialogVisitPengunjung = [
    '“Aku datang menjengukmu. Gimana keadaanmu di sini?”','“Ternyata benar-benar dikurung di sini, ya...”','“Aku cuma mau memastikan kamu masih baik-baik saja.”','“Sabar ya. Semoga masa tahanannya cepat selesai.”','“Aku bawa kabar dari luar. Kota masih ramai seperti biasa.”',
    '“Jangan terlalu dipikirkan. Anggap saja ini liburan yang salah tempat.”','“Aku penasaran, bagaimana rasanya menghabiskan waktu di sini?”','“Kalau butuh sesuatu, bilang saja selama masih bisa dibantu.”','“Aku sempat khawatir setelah dengar kamu masuk penjara.”','“Aku pamit dulu. Semoga kita ketemu lagi di luar jeruji.”',
    '“Sabar ya, ini ada uang buat jajan”','“Gimana ceritanya bisa masuk sini?”','“Tenang, lawyer udah gue urus”','“Jangan ngulangin lagi ya, malu”','“Mau nitip apa? Gue beliin”',
    '“Keluarga nungguin lu di luar”','“Udah tobat belum di dalem?”','“Ini selnya dingin banget sih”','“Kuat2 ya, bentar lagi juga keluar”','“Hati2 sama napi lain, jangan berantem”'
]

/* =========================================================
   STORY KABUR 20 VARIASI - PELUANG 1%
========================================================= */

const storyKabur = [
    { sukses: `🪟 Kamu congkel jeruji pakai sendok semalaman. Pas sipir lengah, langsung loncat keluar!`, gagal: `🪟 Sendoknya patah ditengah jalan. Ketahuan sipir dan dihajar.` },
    { sukses: `🚽 Kamu kabur lewat saluran pembuangan. Becek, bau, tapi bebas!`, gagal: `🚽 Nyangkut di pipa. Malah disemprot air kotoran.` },
    { sukses: `🎭 Kamu tukar baju sama pengunjung. Jalan keluar santai sambil lambaikan tangan.`, gagal: `🎭 Sipir ngeh ada 2 orang kembaran. Langsung diborgol lagi.` },
    { sukses: `🍰 Kamu sembunyi di dalam kue ultah kiriman. Truk sampah buang kamu ke luar.`, gagal: `🍰 Kuenya kemakan duluan sama sipir rakus. Kamu ketahuan.` },
    { sukses: `💣 Kamu buat ledakan kecil dari bedak + korek. Pas rame, kamu kabur!`, gagal: `💣 Koreknya basah. Malah kamu yg kena ledakan.` },
    { sukses: `👨‍⚕️ Pura2 sakit jantung. Pas di RS penjara kamu kabur lewat jendela.`, gagal: `👨‍⚕️ Dokternya curiga. Kamu malah diikat di ranjang.` },
    { sukses: `📦 Kamu masukin diri ke kardus pengiriman makanan. Lolos!`, gagal: `📦 Kardusnya ketiban 10 kardus lain. Pingsan 3 jam.` },
    { sukses: `🕳️ Gali terowongan 2 minggu pakai sendok. Akhirnya tembus ke selokan!`, gagal: `🕳️ Nemu pipa air. 1 penjara banjir, kamu kena hukuman.` },
    { sukses: `🚁 Tiba2 ada heli nyelametin. Tali diturunin, kamu naik!`, gagal: `🚁 Helinya salah alamat. Malah nembak ke bawah.` },
    { sukses: `🔑 Duplikat kunci dari sabun. Pintu kebuka pelan2.`, gagal: `🔑 Sabunnya meleleh. Kunci patah di dalem.` },
    { sukses: `🧹 Nyamar jadi petugas kebersihan. Dorong gerobak keluar aja.`, gagal: `🧹 Ditanya ID. Pas dicek, fotonya beda.` },
    { sukses: `⚡ Matiin sekring. Pas gelap kamu panjat tembok.`, gagal: `⚡ Genset nyala 3 detik kemudian. Ketahuan.` },
    { sukses: `🐀 Ikutin tikus yg sering keluar masuk. Ternyata ada lubang.`, gagal: `🐀 Tikusnya balik lagi ke sel. Kamu kejebak.` },
    { sukses: `🚛 Sembunyi di kolong truk sampah. Dibuang ke TPA.`, gagal: `🚛 Kepergok di TPA. Ditangkap ulang.` },
    { sukses: `🎂 Suap sipir pake kue + uang. Dia pura2 tidur.`, gagal: `🎂 Sipirnya lapor. Kue + uang disita.` },
    { sukses: `📞 Hack telepon penjara. Buka pintu elektronik dari dalem.`, gagal: `📞 Malah nyambung ke kantor polisi.` },
    { sukses: `🧨 Ledakin tembok belakang pas jam olahraga rame2.`, gagal: `🧨 Sumbu nya basah. Ga nyala2.` },
    { sukses: `👔 Tukar identitas sama napi yg mau bebas besok.`, gagal: `👔 Sidik jarinya ga cocok. Ketahuan.` },
    { sukses: `🌧️ Pas hujan badai + mati lampu. Panjat tembok ga ada yg liat.`, gagal: `🌧️ Licin. Jatuh. Kaki patah.` },
    { sukses: `🤡 Tipu sipir baru yg masih magang. Bilang disuruh atasannya.`, gagal: `🤡 Ternyata dia intel. Langsung diborgol.` }
]

/* =========================================================
   STORY DAILY 20 VARIASI
========================================================= */

const storyDaily = [
    `📖 *Hari ini:* Bangun jam 5, sholat di pojokan sel. Makan roti keras + air putih. Siangnya nyapu 1 jam. Malam baca koran bekas sampe ketiduran.`,
    `📖 *Hari ini:* Ikut kerja bakti bersihin halaman penjara. Keringetan banget. Dapet bonus es teh. Tidur di kasur tipis sambil mikir keluarga.`,
    `📖 *Hari ini:* Bertengkar sama napi sebelah gara2 rebutan sabun. Didamaikan sipir. Sorenya olahraga lari 3x keliling lapangan.`,
    `📖 *Hari ini:* Diajarin tukang kayu bikin kursi. Jari ketusuk paku. Tapi lumayan dapet skill baru.`,
    `📖 *Hari ini:* Kirim surat ke rumah. Nunggu 2 jam buat dpt giliran nelpon. Cuma 5 menit, kangen banget.`,
    `📖 *Hari ini:* Ikut pengajian. Ustadnya ceramah tentang tobat. Nangis di dalem hati.`,
    `📖 *Hari ini:* Masak nasi buat 50 orang. Ketumpahan. Disuruh cuci piring seharian.`,
    `📖 *Hari ini:* Sakit perut. Ke klinik, dikasih obat generik. Tiduran seharian.`,
    `📖 *Hari ini:* Main catur sama napi seumur. Kalah 5x berturut2. Harga diri anjlok.`,
    `📖 *Hari ini:* Dapet kiriman dari rumah: baju, mie, rokok. Bagi2 ke temen sel.`,
    `📖 *Hari ini:* Disuruh cat tembok. Catnya kena muka. Mirip badut.`,
    `📖 *Hari ini:* Hujan bocor ke sel. Tidur basah2an. Mimpi indah tentang kebebasan.`,
    `📖 *Hari ini:* Nonton TV bareng. Cuma ada sinetron. Berantem remote.`,
    `📖 *Hari ini:* Dipanggil kepala penjara. Dikasih nasehat 1 jam. Kuping panas.`,
    `📖 *Hari ini:* Ikut lomba kebersihan antar sel. Juara 3. Dapet sabun.`,
    `📖 *Hari ini:* Mimpi kabur. Bangun2 masih di jeruji. Nafas panjang.`,
    `📖 *Hari ini:* Belajar baca tulis sama relawan. Dari ga bisa jadi bisa nulis nama.`,
    `📖 *Hari ini:* Berantem di dapur. Piring pecah. Dihukum ga makan malam.`,
    `📖 *Hari ini:* Duduk di pojokan, ngitung hari. Udah hari ke sekian.`,
    `📖 *Hari ini:* Sepi banget. Ngobrol sama tembok. Temboknya diem aja.`
]

/* =========================================================
   STORY TALK 20 VARIASI
========================================================= */

const storyTalk = [
    `💬 Kamu: 'Gimana cara cepet keluar?'\n👤 Napi A: 'Tunggu aja bang, 3 bulan lagi gue bebas. Sabar.'`,
    `💬 Kamu: 'Lu kasus apa?'\n👤 Napi B: 'Copet bang. Gara2 lapar. Lu?'\nKamu: '...'`,
    `💬 Kamu: 'Bosen ga?'\n👤 Napi C: 'Bosen lah. Makanya gue bikin radio dari kaleng.'`,
    `💬 Kamu: 'Sipir galak ga?'\n👤 Napi D: 'Tergantung. Kasih rokok, baik.'`,
    `💬 Kamu: 'Pernah kabur?'\n👤 Napi E: 'Pernah. 2 jam ketangkap. Capek.'`,
    `💬 Kamu: 'Makanan enak ga?'\n👤 Napi F: 'Enak kalau gratis bang. Ini bayar pake keringet.'`,
    `💬 Kamu: 'Kangen rumah?'\n👤 Napi G: 'Banget. Anak gue udah SD sekarang.'`,
    `💬 Kamu: 'Ada wifi ga?'\n👤 Napi H: 'Ada. Namanya: Tembok. Password: Sabar.'`,
    `💬 Kamu: 'Lu nyesel?'\n👤 Napi I: 'Nyesel. Tapi udah terlanjur.'`,
    `💬 Kamu: 'Gimana biar ga gila?'\n👤 Napi J: 'Ngobrol. Kayak gini.'`,
    `💬 Kamu: 'Ada preman sini?'\n👤 Napi K: 'Ada. Tapi gue udah bayar pake mie.'`,
    `💬 Kamu: 'Tidur nyenyak ga?'\n👤 Napi L: 'Nyenyak. Mimpi bebas tiap malem.'`,
    `💬 Kamu: 'Kapan terakhir nengok?'\n👤 Napi M: 'Setahun lalu. Keluarga sibuk.'`,
    `💬 Kamu: 'Kerja apa di sini?'\n👤 Napi N: 'Tukang cuci. 1 baju 2rb.'`,
    `💬 Kamu: 'Takut ga?'\n👤 Napi O: 'Awal2 iya. Lama2 biasa.'`,
    `💬 Kamu: 'Ada yg baik ga di sini?'\n👤 Napi P: 'Ada. Sipir yg ngasih rokok.'`,
    `💬 Kamu: 'Rencana abis keluar?'\n👤 Napi Q: 'Buka warung. Halal.'`,
    `💬 Kamu: 'Pernah dipukulin?'\n👤 Napi R: 'Pernah. Gara2 ngelawan.'`,
    `💬 Kamu: 'Doain gue ya'\n👤 Napi S: 'Aamiin. Semoga kita cepet keluar.'`,
    `💬 Kamu: 'Ini penjara atau hotel?'\n👤 Napi T: 'Hotel bintang 0. Fasilitas: jeruji.'`
]

const randomItem = (list) => list[Math.floor(Math.random() * list.length)]
const formatTime = (ms) => {
    ms = Math.max(0, ms)
    const jam = Math.floor(ms / 3600000)
    const menit = Math.floor((ms % 3600000) / 60000)
    const detik = Math.floor((ms % 60000) / 1000)
    if(jam > 0) return `${jam}j ${menit}m`
    if(menit > 0) return `${menit}m ${detik}d`
    return `${detik}d`
}

let handler = async (m, { conn, args, command, usedPrefix, isOwner }) => {

    const wdb = loadDB()
    if (!wdb.penjara) wdb.penjara = []
    if (!wdb.money) wdb.money = {}
    if (!wdb.visitCooldown) wdb.visitCooldown = {}
    if (!wdb.kaburCooldown) wdb.kaburCooldown = {}
    if (!wdb.dailyCooldown) wdb.dailyCooldown = {}
    if (!wdb.talkCooldown) wdb.talkCooldown = {}
    if (!wdb.prisonStats) wdb.prisonStats = {}

    if (!global.db?.data?.users) return m.reply('❌ Database utama belum siap')

    /* =====================================================
       HELPER
    ===================================================== */

    const resolveJid = (jid) => {
        if (!jid) return null
        jid = String(jid)
        if (jid.endsWith('@s.whatsapp.net')) return jid
        if (jid.endsWith('@lid')) return global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
        if (/^\d+$/.test(jid)) return jid + '@s.whatsapp.net'
        return jid
    }
    const getUser = (jid) => { jid = resolveJid(jid); if (!jid) return null; return global.db.data.users?.[jid] || null }
    const getRPG = (jid) => { const user = getUser(jid); if (!user) return null; return user.rpg || null }
    const getTarget = (raw) => { let jid = m.mentionedJid?.[0] || m.quoted?.sender; if (!jid && raw) { let num = String(raw).replace(/[^0-9]/g, ''); if (num.startsWith('08')) num = '62' + num.slice(1); if (num.length >= 8) jid = num + '@s.whatsapp.net' } return resolveJid(jid) }
    const kasus = (tebusan) => { tebusan = Number(tebusan) || 0; if (tebusan === 1000000) return '🤏 Copet'; if (tebusan === 5000000) return '🏴‍☠️ Begal / 🔪 Bunuh'; if (tebusan === 10000000) return '🕵️ Rampok'; return '👑 Owner Jail' }
    const sisaWaktu = (rpg) => { if (!rpg) return 0; return Number(rpg.lamaPenjara || 0) - (Date.now() - Number(rpg.penjara || 0)) }
    const formatSisa = (ms) => { ms = Math.max(0, ms); const jam = Math.floor(ms / 3600000); const menit = Math.floor((ms % 3600000) / 60000); return `${jam}j ${menit}m` }
    const isDiPenjara = (jid) => { jid = resolveJid(jid); return wdb.penjara.some(x => resolveJid(x) === jid) }
    const getStats = (jid) => { jid = resolveJid(jid); if (!wdb.prisonStats[jid]) wdb.prisonStats[jid] = {daily: 0, talk: 0}; return wdb.prisonStats[jid] }

    /* =====================================================
       REBUILD LIST PENJARA DARI DATA USER
    ===================================================== */

    let rebuild = false
    for(let jid in global.db.data.users){
        let rpg = global.db.data.users[jid].rpg
        if(rpg?.penjara && Number(rpg.lamaPenjara) > 0){
            let sisa = Number(rpg.lamaPenjara) - (Date.now() - Number(rpg.penjara))
            if(sisa > 0){
                if(!wdb.penjara.some(x => resolveJid(x) === resolveJid(jid))){
                    wdb.penjara.push(jid)
                    rebuild = true
                }
            }
        }
    }
    if(rebuild) saveDB(wdb)

    /* =====================================================
       BERSIHKAN PENJARA + AUTO BEBAS + URUTIN SEL
    ===================================================== */

    let changed = false
    let valid = []
    for (let i = wdb.penjara.length - 1; i >= 0; i--) {
        const jid = resolveJid(wdb.penjara[i])
        const rpg = getRPG(jid)
        if (!rpg ||!rpg.penjara) { wdb.penjara.splice(i, 1); changed = true; continue }
        if (sisaWaktu(rpg) <= 0) {
            rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0
            delete wdb.prisonStats[jid] // hapus stat pas bebas
            wdb.penjara.splice(i, 1); changed = true
        } else { valid.unshift(jid) }
    }
    wdb.penjara = valid
    wdb.penjara.forEach((jid, i) => { let rpg = getRPG(jid); if (rpg) rpg.sel = i + 1 })
    if (changed) saveDB(wdb)

    /* =====================================================
       BLOKIR COMMAND BUAT YG DIPENJARA
       CUMA BOLEH: penjara, penjara kabur
    ===================================================== */

    if (isDiPenjara(m.sender) && command!== 'penjara') {
        let rpg = getRPG(m.sender)
        let sisa = formatSisa(sisaWaktu(rpg))
        return m.reply(`[ 🚔 ]───[ *_DI PENJARA_* ]───✦\n\nKamu di SEL ${rpg.sel}\n⏳ Sisa: ${sisa}\n\nCommand:\n•${usedPrefix}penjara\n•${usedPrefix}penjara daily\n•${usedPrefix}penjara talk\n•${usedPrefix}penjara kabur`)
    }

    /* =====================================================
       PENJARA DAILY - CD 2 MENIT
    ===================================================== */

    if (command === 'penjara' && args[0]?.toLowerCase() === 'daily') {
        if (!isDiPenjara(m.sender)) return m.reply('❌ Kamu tidak di penjara.')
        let last = Number(wdb.dailyCooldown[m.sender]) || 0
        let now = Date.now()
        let CD = 2 * 60 * 1000
        if (now - last < CD) return m.reply(`⏳ Tunggu *${formatTime(CD - (now - last))}* buat daily lagi`)
        wdb.dailyCooldown[m.sender] = now
        let stats = getStats(m.sender)
        stats.daily = Number(stats.daily) + 1 // pastiin number
        saveDB(wdb)
        let story = randomItem(storyDaily)
        return m.reply(`[ 📖 ]───[ *_KESEHARIAN PENJARA_* ]───✦\n\n${story}\n\n╭──「 STAT 」─✦\n│ 𖥔 Daily: ${stats.daily}x\n│ 𖥔 Talk: ${stats.talk}x\n╰ 𖥔 Lakukan 20x daily + 20x talk`)
    }

    /* =====================================================
       PENJARA TALK - CD 2 MENIT
    ===================================================== */

    if (command === 'penjara' && args[0]?.toLowerCase() === 'talk') {
        if (!isDiPenjara(m.sender)) return m.reply('❌ Kamu tidak di penjara.')
        let last = Number(wdb.talkCooldown[m.sender]) || 0
        let now = Date.now()
        let CD = 2 * 60 * 1000
        if (now - last < CD) return m.reply(`⏳ Tunggu *${formatTime(CD - (now - last))}* buat ngobrol lagi`)
        wdb.talkCooldown[m.sender] = now
        let stats = getStats(m.sender)
        stats.talk = Number(stats.talk) + 1 // pastiin number
        saveDB(wdb)
        let story = randomItem(storyTalk)
        return m.reply(`[ 💬 ]───[ *_NGOBROL DI PENJARA_* ]───✦\n\n${story}\n\n╭──「 STAT 」─✦\n│ 𖥔 Daily: ${stats.daily}x\n│ 𖥔 Talk: ${stats.talk}x\n╰ 𖥔 Lakukan 20x daily + 20x talk`)
    }

    /* =====================================================
       KABUR DARI PENJARA -.penjara kabur
    ===================================================== */

    if (command === 'penjara' && args[0]?.toLowerCase() === 'kabur') {
        if (!isDiPenjara(m.sender)) return m.reply('❌ Kamu tidak di penjara.')
        let last = Number(wdb.kaburCooldown[m.sender]) || 0
        let now = Date.now()
        let CD = 5 * 60 * 1000
        if (now - last < CD) return m.reply(`⏳ *COOLDOWN KABUR*\n\nTunggu *${formatTime(CD - (now - last))}* lagi`)
        wdb.kaburCooldown[m.sender] = now

        let stats = getStats(m.sender)
        let peluang = 0.01
        let buff = false
        if (Number(stats.daily) >= 20 && Number(stats.talk) >= 20) {
            peluang = 0.1
            buff = true
            stats.daily = 0
            stats.talk = 0
        }

        saveDB(wdb)
        let story = randomItem(storyKabur)
        let berhasil = Math.random() < peluang
        let rpg = getRPG(m.sender)
        let selLama = rpg.sel

        if (berhasil) {
            rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0
            delete wdb.prisonStats[m.sender]
            wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== resolveJid(m.sender))
            saveDB(wdb)
            return conn.reply(m.chat, `[ 🚨 ]───[ *_KABUR BERHASIL_* ]───✦\n\n${story.sukses}\n\n╭──「 🎉 BEBAS 」─✦\n│ 𖥔 Nama : @${m.sender.split('@')[0]}\n│ 𖥔 Dari : SEL ${selLama}\n│ 𖥔 Buff : ${buff? 'AKTIF 10%' : 'TIDAK'}\n╰ 𖥔 Selamat! Kamu buronan sekarang.`, m, { mentions: [m.sender] })
        } else {
            rpg.lamaPenjara += 30 * 60 * 1000
            saveDB(wdb)
            return conn.reply(m.chat, `[ 🚨 ]───[ *_KABUR GAGAL_* ]───✦\n\n${story.gagal}\n\n╭──「 💥 GAGAL 」─✦\n│ 𖥔 Nama : @${m.sender.split('@')[0]}\n│ 𖥔 SEL : ${selLama}\n│ 𖥔 Buff : ${buff? 'AKTIF 10%' : 'TIDAK'}\n╰ 𖥔 Hukuman +30 menit!`, m, { mentions: [m.sender] })
        }
    }

    /* =====================================================
       PENJARA - VISIT
    ===================================================== */

    if (command === 'penjara' && args[0]?.toLowerCase() === 'visit') {
        let last = Number(wdb.visitCooldown[m.sender]) || 0
        let now = Date.now()
        let CD = 5 * 60 * 1000
        if (now - last < CD) return m.reply(`⏳ *COOLDOWN KUNJUNGAN*\n\nTunggu *${formatTime(CD - (now - last))}* lagi`)
        let who = null
        if (args[1]?.toLowerCase() === 'sel' && args[2]) {
            const sel = parseInt(args[2]); if (isNaN(sel) || sel < 1) return m.reply('❌ Nomor sel tidak valid'); if (!wdb.penjara[sel - 1]) return m.reply(`❌ SEL ${sel} kosong`); who = resolveJid(wdb.penjara[sel - 1])
        } else if (args[1] && /^\d+$/.test(args[1])) {
            const sel = parseInt(args[1]); if (isNaN(sel) || sel < 1) return m.reply('❌ Nomor sel tidak valid'); if (!wdb.penjara[sel - 1]) return m.reply(`❌ SEL ${sel} kosong`); who = resolveJid(wdb.penjara[sel - 1])
        } else { who = getTarget(args[1]); if (!who) return m.reply(`[ 🚔 ]───[ *_KUNJUNGAN PENJARA_* ]───✦\n\nFormat:\n${usedPrefix}penjara visit @tag\n${usedPrefix}penjara visit 2`) }
        if (who === resolveJid(m.sender)) return m.reply('❌ Kamu tidak bisa mengunjungi dirimu sendiri.')
        let index = wdb.penjara.findIndex(jid => resolveJid(jid) === who)
        if (index === -1) return m.reply('❌ Orang tersebut tidak di penjara.')
        const rpg = getRPG(who)
        if (!rpg ||!rpg.penjara) { wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who); saveDB(wdb); return m.reply('❌ Data tahanan tidak valid.') }
        if (sisaWaktu(rpg) <= 0) { const selLama = Number(rpg.sel) || index + 1; rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0; delete wdb.prisonStats[who]; wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who); saveDB(wdb); return m.reply(`🚔 @${who.split('@')[0]} sudah bebas.\n\n╭ 𖥔 SEL : ${selLama}\n╰ 𖥔 Masa tahanan telah habis`, { mentions: [who] }) }
        wdb.visitCooldown[m.sender] = now; saveDB(wdb)
        const sisa = sisaWaktu(rpg); const tebusan = Number(rpg.tebusan) || 0
        let cap = `[ 🚔 ]───[ *_RUANG KUNJUNGAN_* ]───✦\n╭──[ SEL ${index + 1} ]──✦\n│ 𖥔 Nama : @${who.split('@')[0]}\n│ 𖥔 Sisa : ${formatSisa(sisa)}\n│ 𖥔 Tebusan : Rp ${tebusan.toLocaleString('id-ID')}\n╰───────────\n\n*─── PERCAKAPAN ───*\n👤 Kamu : "${randomItem(dialogVisitPengunjung)}"\n🚓 Tahanan : "${randomItem(dialogVisitNapi)}"\n\n╭──「 *INFO* 」─✦\n│ 𖥔 CD Kunjung: 5 menit\n│ 𖥔 ${usedPrefix}penjara daily / talk / kabur\n╰ 𖥔 Lakukan 20x daily + 20x talk`
        return conn.reply(m.chat, cap, m, { mentions: [m.sender, who] })
    }

    /* =====================================================
       OWNER - PENJARAIN
    ===================================================== */

    if (command === 'penjarain') {
        if (!isOwner) return m.reply('❌ Khusus Owner')
        let who, menit, tebusan
        if (m.quoted || m.mentionedJid?.[0]) { who = getTarget(); menit = parseInt(args[0]); tebusan = parseInt(args[1]) }
        else { who = getTarget(args[0]); menit = parseInt(args[1]); tebusan = parseInt(args[2]) }
        if (!who) return m.reply(`*Format:*\n${usedPrefix}penjarain @tag <menit> <tebusan>`)
        if (isNaN(menit) || menit < 1) menit = 30
        if (isNaN(tebusan) || tebusan < 0) tebusan = 1000000
        let user = getUser(who); if (!user) return m.reply('❌ Data user target tidak ditemukan'); if (!user.rpg) user.rpg = {}
        let rpg = user.rpg
        if (rpg.penjara && sisaWaktu(rpg) > 0) return m.reply(`❌ Orang ini sudah di penjara.\n\n🚔 SEL : ${Number(rpg.sel) || 0}\n⏳ SISA : ${formatSisa(sisaWaktu(rpg))}`)
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
        wdb.penjara.push(who)
        rpg.penjara = Date.now(); rpg.lamaPenjara = menit * 60000; rpg.tebusan = tebusan; rpg.sel = wdb.penjara.length; rpg.gagalCopet = 0
        saveDB(wdb)
        return conn.reply(m.chat, `[ 🚔 ]───[ *_OWNER JAIL_* ]───✦\n╭ 𖥔 Target : @${who.split('@')[0]}\n│ 𖥔 SEL : ${rpg.sel}\n│ 𖥔 Durasi : ${menit} menit\n│ 𖥔 Tebusan : Rp ${tebusan.toLocaleString('id-ID')}\n╰ 𖥔 Dipenjara oleh Owner`, m, { mentions: [who] })
    }

    /* =====================================================
       OWNER - BEBASIN
    ===================================================== */

    if (command === 'bebasin') {
        if (!isOwner) return m.reply('❌ Khusus Owner')
        if (args[0] === 'all') {
            if (wdb.penjara.length === 0) return m.reply('🏛️ Penjara kosong')
            let bebas = []
            for (const jidRaw of wdb.penjara) { const jid = resolveJid(jidRaw); const rpg = getRPG(jid); if (!rpg) continue; rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0; delete wdb.prisonStats[jid]; bebas.push(jid) }
            wdb.penjara = []; saveDB(wdb)
            const names = bebas.length? bebas.map(jid => `@${jid.split('@')[0]}`).join(', ') : '-'
            return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN OWNER_* ]───✦\n╭ 𖥔 Total : ${bebas.length} orang\n│ 𖥔 Bebas : ${names}\n╰ 𖥔 Oleh Owner`, m, { mentions: bebas })
        }
        let who = null
        if (args[0] === 'sel' && args[1]) { const sel = parseInt(args[1]); if (isNaN(sel) || sel < 1) return m.reply('❌ Nomor sel tidak valid'); if (!wdb.penjara[sel - 1]) return m.reply(`❌ Sel ${sel} kosong`); who = resolveJid(wdb.penjara[sel - 1]) }
        else if (m.quoted || m.mentionedJid?.[0]) { who = getTarget() }
        else if (args[0]) { who = getTarget(args[0]) }
        else { return m.reply(`*Format:*\n\n${usedPrefix}bebasin @tag\n${usedPrefix}bebasin sel 2\n${usedPrefix}bebasin all`) }
        if (!who) return m.reply('❌ Target tidak ditemukan')
        const rpg = getRPG(who); const index = wdb.penjara.findIndex(jid => resolveJid(jid) === who)
        if ((!rpg ||!rpg.penjara) && index === -1) return m.reply('❌ Orang ini tidak di penjara')
        const selLama = Number(rpg?.sel) || (index >= 0? index + 1 : 0)
        if (rpg) { rpg.penjara = null; rpg.lamaPenjara = 0; rpg.tebusan = 0; rpg.sel = 0; rpg.gagalCopet = 0; delete wdb.prisonStats[who] }
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who); saveDB(wdb)
        return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN OWNER_* ]───✦\n╭ 𖥔 Owner : @${m.sender.split('@')[0]}\n│ 𖥔 Target : @${who.split('@')[0]}\n╰ 𖥔 Bebas dari SEL ${selLama}!`, m, { mentions: [m.sender, who] })
    }

    /* =====================================================
       TEBUS
    ===================================================== */

    if (command === 'tebus') {
        if (args[0] === 'all') {
            if (wdb.penjara.length === 0) return m.reply('🏛️ Penjara kosong')
            let total = 0; let targets = []
            for (const jidRaw of wdb.penjara) {
                const jid = resolveJid(jidRaw)
                if (jid === resolveJid(m.sender)) continue
                const rpg = getRPG(jid)
                if (rpg && rpg.penjara && Number(rpg.tebusan) > 0) {
                    total += Number(rpg.tebusan)
                    targets.push({ jid, rpg })
                }
            }
            if (targets.length === 0) return m.reply('❌ Tidak ada orang lain di penjara')
            const uang = Number(wdb.money[m.sender]) || 0
            if (uang < total) return m.reply(`❌ Uang tidak cukup.\n\n💰 Uang kamu : Rp ${uang.toLocaleString('id-ID')}\n💸 Dibutuhkan : Rp ${total.toLocaleString('id-ID')}`)
            wdb.money[m.sender] = uang - total
            const bebas = []
            for (const data of targets) {
                data.rpg.penjara = null
                data.rpg.lamaPenjara = 0
                data.rpg.tebusan = 0
                data.rpg.sel = 0
                data.rpg.gagalCopet = 0
                delete wdb.prisonStats[data.jid]
                bebas.push(data.jid)
            }
            wdb.penjara = wdb.penjara.filter(jid =>!targets.some(target => resolveJid(target.jid) === resolveJid(jid)))
            saveDB(wdb)
            return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN MASSAL_* ]───✦\n╭ 𖥔 Total : ${bebas.length} orang\n│ 𖥔 Biaya : Rp ${total.toLocaleString('id-ID')}\n│ 𖥔 Bebas : ${bebas.map(jid => `@${jid.split('@')[0]}`).join(', ')}\n╰ 𖥔 Berhasil`, m, { mentions: bebas })
        }

        let who = null
        if (args[0] === 'sel' && args[1]) {
            const sel = parseInt(args[1])
            if (isNaN(sel) || sel < 1) return m.reply('❌ Nomor sel tidak valid')
            if (!wdb.penjara[sel - 1]) return m.reply(`❌ Sel ${sel} kosong`)
            who = resolveJid(wdb.penjara[sel - 1])
        } else if (m.quoted || m.mentionedJid?.[0]) {
            who = getTarget()
        } else if (args[0]) {
            who = getTarget(args[0])
        } else {
            return m.reply(`*Format:*\n\n${usedPrefix}tebus @tag\n${usedPrefix}tebus sel 2\n${usedPrefix}tebus all`)
        }

        if (!who) return m.reply('❌ Target tidak ditemukan')
        who = resolveJid(who)
        if (who === resolveJid(m.sender)) return m.reply(`[ 🚔 ]───[ *_GAGAL_* ]───✦\n╭ 𖥔 Kamu tidak bisa tebus diri sendiri\n╰ 𖥔 Tunggu masa tahanan habis`)

        const rpg = getRPG(who)
        if (!rpg ||!rpg.penjara) {
            wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
            saveDB(wdb)
            return m.reply('❌ Orang ini tidak di penjara')
        }

        if (sisaWaktu(rpg) <= 0) {
            const selLama = Number(rpg.sel) || 0
            rpg.penjara = null
            rpg.lamaPenjara = 0
            rpg.tebusan = 0
            rpg.sel = 0
            rpg.gagalCopet = 0
            delete wdb.prisonStats[who]
            wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
            saveDB(wdb)
            return m.reply(`🚔 Masa tahanan @${who.split('@')[0]} sudah habis.\n\n╭ 𖥔 SEL : ${selLama}\n╰ 𖥔 Target sudah bebas otomatis`, { mentions: [who] })
        }

        const tebusan = Number(rpg.tebusan) || 1000000
        const uang = Number(wdb.money[m.sender]) || 0
        if (uang < tebusan) return m.reply(`❌ Uang tidak cukup.\n\n💰 Uang kamu : Rp ${uang.toLocaleString('id-ID')}\n💸 Dibutuhkan : Rp ${tebusan.toLocaleString('id-ID')}`)

        wdb.money[m.sender] = uang - tebusan
        const selLama = Number(rpg.sel) || 0
        rpg.penjara = null
        rpg.lamaPenjara = 0
        rpg.tebusan = 0
        rpg.sel = 0
        rpg.gagalCopet = 0
        delete wdb.prisonStats[who]
        wdb.penjara = wdb.penjara.filter(jid => resolveJid(jid)!== who)
        saveDB(wdb)

        return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN_* ]───✦\n╭ 𖥔 Dari : @${m.sender.split('@')[0]}\n│ 𖥔 Untuk : @${who.split('@')[0]}\n│ 𖥔 Tebusan : Rp ${tebusan.toLocaleString('id-ID')}\n╰ 𖥔 Bebas dari SEL ${selLama}!`, m, { mentions: [m.sender, who] })
    }

    /* =====================================================
       PENJARA - LIST
    ===================================================== */

    if (wdb.penjara.length === 0) return m.reply(`[ 🚔 ]───[ *_PENJARA KOTA_* ]───✦\n╭ 𖥔 Status : KOSONG\n╰ 𖥔 Kota aman dan damai`)

    let cap = `[ 🚔 ]───[ *_DAFTAR NARAPIDANA_* ]───✦\n╭ 𖥔 TOTAL : ${wdb.penjara.length} ORANG\n╰──\n\n`
    const mentioned = []

    for (let i = 0; i < wdb.penjara.length; i++) {
        const jid = wdb.penjara[i]
        const rpg = getRPG(jid)
        if (!rpg) continue
        mentioned.push(jid)
        const sisa = sisaWaktu(rpg)
        const tebusan = Number(rpg.tebusan) || 0
        cap += `╭──[ SEL ${i + 1} ]──✦\n│ 𖥔 NAMA : @${jid.split('@')[0]}\n│ 𖥔 SISA : ${formatSisa(sisa)}\n│ 𖥔 TEBUS : Rp ${tebusan.toLocaleString('id-ID')}\n│ 𖥔 KASUS : ${kasus(tebusan)}\n╰───────────\n\n`
    }

    cap += `╭──「 *INFO UMUM* 」─✦\n│ 𖥔 ${usedPrefix}penjara visit 2\n│ 𖥔 ${usedPrefix}penjara daily - CD 2m\n│ 𖥔 ${usedPrefix}penjara talk - CD 2m\n│ 𖥔 ${usedPrefix}penjara kabur - 1% / 10%\n│ 𖥔 ${usedPrefix}tebus @tag / sel 2\n╰ 𖥔 Lakukan 20x daily + 20x talk`

    if(isOwner){
        cap += `\n\n╭──「 *INFO OWNER* 」─✦\n│ 𖥔 ${usedPrefix}penjarain @tag menit tebusan\n│ 𖥔 ${usedPrefix}bebasin @tag / sel 2 / all\n╰ 𖥔 Khusus Owner`
    }

    saveDB(wdb)
    return conn.reply(m.chat, cap, m, { mentions: mentioned })
}

/* =========================================================
   COMMAND CONFIG
========================================================= */

handler.help = ['penjara', 'penjara visit <sel/@tag>', 'penjara daily', 'penjara talk', 'penjara kabur', 'tebus', 'penjarain', 'bebasin']
handler.tags = ['rpg']
handler.command = /^(penjara|tebus|penjarain|bebasin)$/i
handler.group = true

export default handler