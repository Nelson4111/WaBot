let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!global.db.data.thanks) global.db.data.thanks = []
  let thanksList = global.db.data.thanks

  const isDel = /^(delthanks|hapusthanks|deletethanks|rmthanks)$/i.test(command)
  const isList = /^(listthanks|daftarthanks)$/i.test(command)

  // 1. Perintah Melihat Daftar Custom Kontributor
  if (isList) {
    if (thanksList.length === 0) {
      return m.reply(`*──  ୨୧ ✧ ᴅᴀꜰᴛᴀʀ ᴋᴏɴᴛʀɪʙᴜᴛᴏʀ ✧ ୨୧  ──*

> *おしらせ!* (ɪɴꜰᴏʀᴍᴀꜱɪ)
> _Belum ada kontributor kustom tambahan di database._
> Gunakan perintah: *${usedPrefix}addthanks Nama | Peran*`)
    }

    let teks = `*──  ୨୧ ✧ ᴅᴀꜰᴛᴀʀ ᴋᴏɴᴛʀɪʙᴜᴛᴏʀ ✧ ୨୧  ──*\n\n`
    teks += `> *おしらせ!* (ᴋᴏɴᴛʀɪʙᴜᴛᴏʀ ᴋᴜꜱᴛᴏᴍ)\n`
    teks += `> _Total tercatat: *${thanksList.length} Nama*_\n\n`
    teks += `*╭  〔 ❖ ᴅᴀꜰᴛᴀʀ ᴛʜᴀɴᴋꜱ ᴛᴏ 〕*\n`
    thanksList.forEach((item, i) => {
      teks += `*┆* ⟡ *${i + 1}.* ${item.name} : _${item.role}_\n`
    })
    teks += `*╰──────────────────────*\n\n`
    teks += `> _Gunakan *${usedPrefix}delthanks <nomor/nama>* untuk menghapus._`
    return m.reply(teks.trim())
  }

  // 2. Perintah Hapus Kontributor
  if (isDel) {
    if (!text) {
      return m.reply(`⟡ Masukkan nama atau nomor urut kontributor yang ingin dihapus!\n\n*Contoh:* ${usedPrefix + command} 1\n*Atau:* ${usedPrefix + command} NamaKontributor`)
    }

    let targetIndex = -1
    const cleanText = text.trim()

    // Cek jika nomor urutan
    if (/^\d+$/.test(cleanText)) {
      const idx = parseInt(cleanText) - 1
      if (idx >= 0 && idx < thanksList.length) {
        targetIndex = idx
      }
    } else {
      // Cari berdasarkan kesamaan nama
      targetIndex = thanksList.findIndex(t => t.name.toLowerCase() === cleanText.toLowerCase())
    }

    if (targetIndex === -1) {
      return m.reply(`⟡ Kontributor *"${cleanText}"* tidak ditemukan di daftar.\nKetik *${usedPrefix}listthanks* untuk melihat daftar aktif.`)
    }

    const removed = thanksList.splice(targetIndex, 1)[0]
    if (global.db && typeof global.db.write === 'function') {
      await global.db.write().catch(() => {})
    }

    return m.reply(`*──  ୨୧ ✧ ᴋᴏɴᴛʀɪʙᴜᴛᴏʀ ᴅɪʜᴀᴘᴜꜱ ✧ ୨୧  ──*

> *おしらせ!* (ꜱᴜᴄᴄᴇꜱꜱ!)
> Data kontributor berhasil dihapus dari daftar Thanks To.

*╭  〔 ❖ ᴅᴇᴛᴀɪʟ ʜᴀᴘᴜꜱ 〕*
*┆* ⟡ ɴᴀᴍᴀ   : *${removed.name}*
*┆* ✧ ᴘᴇʀᴀɴ  : *${removed.role}*
*╰──────────────────────*`)
  }

  // 3. Perintah Tambah Kontributor
  if (!text) {
    return m.reply(`*──  ୨୧ ✧ ᴘᴀɴᴅᴜᴀɴ ᴀᴅᴅ ᴛʜᴀɴᴋꜱ ✧ ୨୧  ──*

> *Format:* *${usedPrefix + command} Nama | Peran*
> *Contoh:* *${usedPrefix + command} Rian | Beta Tester*
> *Contoh:* *${usedPrefix + command} Kazuha | Donatur Server*

_Ketik *${usedPrefix}listthanks* untuk melihat daftar yang sudah ada._`)
  }

  let [namePart, ...rolePart] = text.split('|')
  let name = namePart ? namePart.trim() : ''
  let role = rolePart.length ? rolePart.join('|').trim() : 'Kontributor'

  if (!name) {
    return m.reply('⟡ Nama kontributor tidak boleh kosong!')
  }

  // Cek apakah sudah ada (update peran jika sudah ada)
  let existingIndex = thanksList.findIndex(t => t.name.toLowerCase() === name.toLowerCase())
  if (existingIndex !== -1) {
    thanksList[existingIndex].role = role
    thanksList[existingIndex].updatedAt = Date.now()
  } else {
    thanksList.push({
      name,
      role,
      addedAt: Date.now()
    })
  }

  if (global.db && typeof global.db.write === 'function') {
    await global.db.write().catch(() => {})
  }

  return m.reply(`*──  ୨୧ ✧ ᴋᴏɴᴛʀɪʙᴜᴛᴏʀ ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ ✧ ୨୧  ──*

> *おしらせ!* (ꜱᴜᴄᴄᴇꜱꜱ!)
> Data kontributor berhasil dicatat ke daftar Thanks To.

*╭  〔 ❖ ᴅᴇᴛᴀɪʟ ᴋᴏɴᴛʀɪʙᴜᴛᴏʀ 〕*
*┆* ⟡ ɴᴀᴍᴀ   : *${name}*
*┆* ✧ ᴘᴇʀᴀɴ  : *${role}*
*╰──────────────────────*

> _Data akan otomatis tampil di menu *${usedPrefix}thanksto*._`)
}

handler.help = ['addthanks <nama> | <peran>', 'delthanks <nama/urutan>', 'listthanks']
handler.tags = ['owner']
handler.command = /^(addthanks|tambahthanks|delthanks|hapusthanks|deletethanks|rmthanks|listthanks|daftarthanks)$/i
handler.owner = true

export default handler
