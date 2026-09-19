let handler = async (m, { conn, text, usedPrefix, command }) => {
    let sewaData = Array.isArray(global.db?.data?.sewa) ? global.db.data.sewa : (Array.isArray(global.db?.data?.aux_sewa) ? global.db.data.aux_sewa : [])
    if (sewaData.length === 0) return m.reply('Daftar sewa kosong.')

    if (!text || isNaN(text)) return m.reply(`Masukkan nomor urut dari listsewa!\nContoh: *${usedPrefix + command}* 1`)

    let index = parseInt(text) - 1

    if (!sewaData[index]) return m.reply(`Nomor urut ${text} tidak ditemukan dalam daftar.`)

    let deletedId = sewaData[index].id
    sewaData.splice(index, 1)
    global.db.data.sewa = sewaData
    await global.db.write().catch(err => console.error('[DELSEWA SYNC ERROR]', err))

    m.reply(`Berhasil menghapus sewa untuk grup:\n${deletedId}`)
}

handler.help = ['delsewa']
handler.tags = ['owner']
handler.command = /^(delsewa)$/i
handler.owner = true

export default handler