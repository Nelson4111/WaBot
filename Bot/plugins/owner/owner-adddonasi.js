let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 0. Izin Akses: Owner ATAU Nomor Bot Sendiri (m.fromMe / conn.user.jid)
    let botNum = conn.user.jid.split(':')[0].split('@')[0]
    let senderNum = m.sender.split('@')[0]
    let owners = (global.owner || []).map(v => (Array.isArray(v) ? v[0] : v).replace(/\D/g, ''))
    
    let isOwner = m.fromMe || senderNum === botNum || owners.includes(senderNum)
    if (!isOwner) return m.reply('❌ Fitur ini hanya dapat digunakan oleh Owner atau dari Nomor Bot sendiri!')

    let args = text.trim().split(/\s+/).filter(Boolean)
    let isDel = /^(deldonasi|hapusdonasi|deletedonasi|rmdonasi)$/i.test(command)
    let isReset = /^(resetdonasi|cleardonasi)$/i.test(command)
    let isSet = /^setdonasi$/i.test(command)

    let users = global.db.data.users || {}

    if (!global.db.data.settings) global.db.data.settings = {}
    if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {}
    let settings = global.db.data.settings[conn.user.jid]

    // 1. Reset Total Donasi Global & Seluruh Donatur
    if (isReset) {
        for (let jid of Object.keys(users)) {
            if (users[jid].totalDonasi) delete users[jid].totalDonasi
        }
        settings.totalDonasi = 0

        if (global.db && typeof global.db.write === 'function') {
            await global.db.write().catch(() => {})
        }

        return m.reply('🧹 *BERHASIL!* Seluruh data donasi dan papan peringkat donatur telah dibersihkan.')
    }

    // Ambil daftar donatur aktif saat ini (diurutkan terbesar ke terkecil)
    let sortedDonors = Object.entries(users)
        .filter(([_, data]) => data.totalDonasi > 0)
        .sort((a, b) => b[1].totalDonasi - a[1].totalDonasi)

    // 2. Pencarian Target User (Dukungan Posisi Top 1/2/3, Tag, Reply, & Nomor HP)
    let targetJids = new Set()

    // Cek jika argumen berupa nomor urut Top Peringkat (misal: .hapusdonasi 1 atau .hapusdonasi 2)
    let rankNum = args.find(a => /^\d{1,2}$/.test(a) && parseInt(a) >= 1 && parseInt(a) <= 50)
    if (isDel && rankNum && sortedDonors.length > 0) {
        let index = parseInt(rankNum) - 1
        if (sortedDonors[index]) {
            let targetJid = sortedDonors[index][0]
            targetJids.add(targetJid)

            // Tambahkan JID sekunder yang berhubungan jika ada
            let cleanNum = targetJid.split('@')[0]
            for (let [jid, u] of Object.entries(users)) {
                if (jid.includes(cleanNum) || (u.jid && u.jid.includes(cleanNum))) {
                    targetJids.add(jid)
                }
            }
        }
    }

    if (targetJids.size === 0) {
        if (m.mentionedJid && m.mentionedJid.length) {
            m.mentionedJid.forEach(j => targetJids.add(j))
        }
        if (m.quoted) {
            targetJids.add(m.quoted.sender)
        }

        let inputNum = args.find(a => /^\d{8,16}$/.test(a.replace(/[^0-9]/g, '')))
        if (inputNum) {
            let clean = inputNum.replace(/[^0-9]/g, '')
            if (clean.startsWith('0')) clean = '62' + clean.slice(1)
            
            targetJids.add(clean + '@s.whatsapp.net')

            for (let [jid, u] of Object.entries(users)) {
                if (jid.includes(clean) || (u.jid && u.jid.includes(clean))) {
                    targetJids.add(jid)
                }
            }
        }
    }

    const jidList = Array.from(targetJids)

    if (jidList.length === 0) {
        let helpTeks = `❌ *Target tidak ditemukan!*\n\n`
        helpTeks += `Bisa ketik urutan top (1, 2, 3), tag (@user), reply pesan, atau nomor HP.\n\n`
        helpTeks += `*Contoh Hapus Urutan Top:* ${usedPrefix}hapusdonasi 1 (menghapus Top 1)\n`
        helpTeks += `*Contoh Hapus via Nomor HP:* ${usedPrefix}hapusdonasi 6281241100804\n`
        helpTeks += `*Contoh Tambah:* ${usedPrefix}adddonasi 6281241100804 50000\n`
        helpTeks += `*Contoh Reset Semua:* ${usedPrefix}resetdonasi`
        return m.reply(helpTeks)
    }

    // 3. Proses Hapus Donasi
    if (isDel) {
        let deletedAmount = 0
        for (let jid of jidList) {
            if (users[jid] && users[jid].totalDonasi) {
                deletedAmount += users[jid].totalDonasi
                delete users[jid].totalDonasi
            }
        }

        // Recalculate total global
        let totalGlobal = Object.values(users).reduce((acc, curr) => acc + (curr.totalDonasi || 0), 0)
        settings.totalDonasi = totalGlobal

        if (global.db && typeof global.db.write === 'function') {
            await global.db.write().catch(() => {})
        }

        let mainJid = jidList[0]
        let teks = `🗑️ *DONASI BERHASIL DIHAPUS!*\n\n`
        teks += `👤 Donatur: @${mainJid.split('@')[0]}\n`
        teks += `📉 Nominal Dihapus: *Rp ${deletedAmount.toLocaleString('id-ID')}*\n`
        teks += `🌐 Total Donasi Global Bot: *Rp ${(settings.totalDonasi || 0).toLocaleString('id-ID')}*`

        return conn.sendMessage(m.chat, { text: teks, mentions: [mainJid] }, { quoted: m })
    }

    // 4. Proses Tambah / Set Donasi User
    let amountStr = args.find(a => /^\d+$/.test(a) && !jidList.some(j => a.includes(j.split('@')[0])))
    if (!amountStr) {
        return m.reply(`Masukkan jumlah nominal donasi!\n\n*Contoh:* ${usedPrefix + command} 6281241100804 50000`)
    }

    let amount = parseInt(amountStr)
    if (isNaN(amount) || amount <= 0) return m.reply('Nominal donasi harus berupa angka positif!')

    let primaryJid = jidList[0]
    if (!users[primaryJid]) users[primaryJid] = {}

    if (isSet) {
        for (let jid of jidList) {
            if (users[jid]) delete users[jid].totalDonasi
        }
        users[primaryJid].totalDonasi = amount
    } else {
        users[primaryJid].totalDonasi = (users[primaryJid].totalDonasi || 0) + amount
    }

    // Recalculate total global
    let totalGlobal = Object.values(users).reduce((acc, curr) => acc + (curr.totalDonasi || 0), 0)
    settings.totalDonasi = totalGlobal

    if (global.db && typeof global.db.write === 'function') {
        await global.db.write().catch(() => {})
    }

    let teks = `🎉 *DONASI BERHASIL DICATAT!* 🎉\n\n`
    teks += `👤 Donatur: @${primaryJid.split('@')[0]}\n`
    teks += `💰 Nominal ${isSet ? 'Set' : 'Tambahan'}: *Rp ${amount.toLocaleString('id-ID')}*\n`
    teks += `📊 Total Donasi User: *Rp ${users[primaryJid].totalDonasi.toLocaleString('id-ID')}*\n`
    teks += `🌐 Total Donasi Global Bot: *Rp ${(settings.totalDonasi || 0).toLocaleString('id-ID')}*`

    conn.sendMessage(m.chat, { text: teks, mentions: [primaryJid] }, { quoted: m })
}

handler.help = ['adddonasi', 'setdonasi', 'hapusdonasi', 'resetdonasi']
handler.tags = ['owner']
handler.command = /^(adddonasi|tambahdonasi|setdonasi|deldonasi|hapusdonasi|deletedonasi|rmdonasi|resetdonasi|cleardonasi)$/i
handler.owner = false

export default handler
