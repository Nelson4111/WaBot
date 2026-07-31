let handler = async (m, { conn, groupMetadata, command, usedPrefix, text }) => {
    if (!text) throw `Contoh:\n${usedPrefix + command} 2 karbit`

    let args = text.split(' ')
    let jumlah = parseInt(args[0])
    let judul = args.slice(1).join(' ')

    if (isNaN(jumlah) || jumlah < 1)
        throw 'Jumlah top harus angka!'

    if (!judul)
        throw 'Judul top tidak boleh kosong!'

    if (jumlah > 20)
        throw 'Maksimal top 20 biar ga spam'

    let users = db.data.users
    let members = groupMetadata.participants.map(v => v.id)

    if (jumlah > members.length)
        throw `Member grup cuma ${members.length}`

    let picked = []
    let teks = `*Top ${jumlah} ${judul}*\n\n`

    while (picked.length < jumlah) {
        let id = members.getRandom()
        if (picked.includes(id)) continue
        picked.push(id)

        let name = users?.[id]?.registered
            ? users[id].name
            : conn.getName(id)

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