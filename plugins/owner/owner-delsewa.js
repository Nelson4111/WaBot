import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let pathSewa = './lib/database/sewa.json'
    if (!fs.existsSync(pathSewa)) return m.reply('Belum ada data sewa.')

    let sewaData = JSON.parse(fs.readFileSync(pathSewa))
    if (sewaData.length === 0) return m.reply('Daftar sewa kosong.')

    if (!text || isNaN(text)) return m.reply(`Masukkan nomor urut dari listsewa!\nContoh: *${usedPrefix + command}* 1`)

    let index = parseInt(text) - 1

    if (!sewaData[index]) return m.reply(`Nomor urut ${text} tidak ditemukan dalam daftar.`)

    let deletedId = sewaData[index].id
    sewaData.splice(index, 1)
    fs.writeFileSync(pathSewa, JSON.stringify(sewaData, null, 2))

    m.reply(`Berhasil menghapus sewa untuk grup:\n${deletedId}`)
}

handler.help = ['delsewa']
handler.tags = ['owner']
handler.command = /^(delsewa)$/i
handler.owner = true

export default handler