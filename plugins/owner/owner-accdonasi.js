export async function before(m, { conn, isROwner }) {
    if (!m.quoted || !m.text) return false

    // Pastikan ini adalah Real Owner
    if (!isROwner) return false

    let text = m.text.trim()
    if (text !== '1' && text !== '2') return false

    let quotedText = m.quoted.text || m.quoted.caption || ''
    if (!quotedText.includes('🔔 *KONFIRMASI DONASI* 🔔')) return false

    // Ekstrak data dari teks
    let senderMatch = quotedText.match(/Dari: @(\d+)/)
    let nominalMatch = quotedText.match(/Nominal: Rp ([\d.,]+)/)
    let aliasMatch = quotedText.match(/Tampil Sebagai: (.*?)\n/)

    if (!senderMatch || !nominalMatch) return false

    let targetNumber = senderMatch[1]
    let targetJid = targetNumber + '@s.whatsapp.net'
    
    let nominalStr = nominalMatch[1].replace(/[.,]/g, '')
    let nominal = parseInt(nominalStr)

    let alias = aliasMatch ? aliasMatch[1].trim() : null

    let users = global.db.data.users
    if (!users[targetJid]) users[targetJid] = {}

    if (!global.db.data.settings) global.db.data.settings = {}
    if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {}
    let settings = global.db.data.settings[conn.user.jid]

    if (text === '1') {
        if (typeof global.db.write !== 'function') {
            await m.reply('❌ Database belum siap menyimpan donasi. Donasi belum diverifikasi.')
            return true
        }
        // Terima & Verifikasi
        users[targetJid].totalDonasi = (Number(users[targetJid].totalDonasi) || 0) + nominal
        users[targetJid].premium = true
        users[targetJid].premiumTime = 9999999999999
        users[targetJid].role = 'Premium user'
        if (alias) {
            users[targetJid].namaDonasi = alias
        }

        // Recalculate global
        let totalGlobal = Object.values(users).reduce((acc, curr) => acc + (Number(curr.totalDonasi) || 0), 0)
        settings.totalDonasi = totalGlobal

        await global.db.write()

        m.reply(`✅ *BERHASIL!* Donasi sebesar Rp ${nominal.toLocaleString('id-ID')} dari @${targetNumber} telah diverifikasi dan masuk database.`, null, { mentions: [targetJid] })

        // Kirim japri ke user
        let userTeks = `🎊 *YEAY! DONASI DITERIMA!* 🎊\n\nTerima kasih banyak atas donasi sebesar *Rp ${nominal.toLocaleString('id-ID')}*!\n\nDonasimu sangat berarti bagi kami dan kamu telah mendapatkan *Premium Permanen* untuk saat ini. Akumulasi donasi mulai Rp 10.000 membuka klaim *50 limit setiap 24 jam* dengan *.prem daily*. Cek title dan hadiah melalui *.prem title* dan *.prem reward*. 💖`
        await conn.sendMessage(targetJid, { text: userTeks })
    } else if (text === '2') {
        // Tolak
        m.reply(`❌ *DITOLAK!* Donasi dari @${targetNumber} telah ditolak.`, null, { mentions: [targetJid] })

        let userTeks = `⚠️ *MOHON MAAF*\n\nKonfirmasi donasi kamu sebesar *Rp ${nominal.toLocaleString('id-ID')}* telah ditolak oleh Owner. Silakan pastikan bukti transfer sudah valid atau hubungi Owner untuk info lebih lanjut.`
        await conn.sendMessage(targetJid, { text: userTeks })
    }

    return true
}
