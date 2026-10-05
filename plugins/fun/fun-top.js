let handler = async (m, { conn, groupMetadata, command, usedPrefix, text }) => {
    const usage = `Format yang benar: *${usedPrefix + command} <jumlah 1-20> <judul>*\nContoh: *${usedPrefix + command} 2 karbit*`
    if (!text?.trim()) return m.reply(usage)

    let args = text.trim().split(/\s+/)
    if (!/^\d+$/.test(args[0])) return m.reply(`❌ Jumlah harus berupa angka.\n${usage}`)
    let jumlah = Number(args[0])
    let judul = args.slice(1).join(' ')

    if (jumlah > 20)
        return m.reply(`❌ Maksimal top 20 agar tidak spam.\n${usage}`)

    if (jumlah < 1)
        return m.reply(`❌ Jumlah minimal 1.\n${usage}`)

    if (!judul)
        return m.reply(`❌ Judul top tidak boleh kosong.\n${usage}`)

    let members = groupMetadata.participants.map(v => v.id)

    if (jumlah > members.length)
        throw `Member grup cuma ${members.length}`

    let picked = []
    let teks = `*Top ${jumlah} ${judul}*\n\n> Ini fitur just for fun; tag dipilih secara acak dari member grup.\n\n`
    while (picked.length < jumlah) {
        let id = members.getRandom()
        if (picked.includes(id)) continue
        picked.push(id)

        teks += `${picked.length}. @${id.split('@')[0]}\n`
    }

    conn.sendMessage(m.chat, {
        text: teks.trim(),
        mentions: picked
    }, { quoted: m })
}

handler.help = ['top <jumlah> <judul>']
handler.tags = ['fun']
handler.command = /^top$/i
handler.group = true

export default handler