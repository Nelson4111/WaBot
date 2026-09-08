let handler = async (m, { text, usedPrefix, command }) => {
  if (text) {
    global.db.data.chats[m.chat].sWelcome = text
    return m.reply(`*──  ୨୧ ✧ PENGATURAN SAMBUTAN ✧ ୨୧  ──*

> Teks sambutan selamat datang (Welcome) berhasil disimpan ✦

*╭  〔 ⟡ ᴠ ᴀ ʀ ɪ ᴀ ʙ ᴇ ʟ  ᴛ ᴇ ʀ ꜱ ᴇ ᴅ ɪ ᴀ 〕*
*┆* › *@user* : Menandai (mention) anggota baru
*┆* › *@subject* : Nama grup
*┆* › *@desc* : Deskripsi grup
*╰───────────────*`)
  } else {
    return m.reply(`*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*
> Masukkan teks sambutan selamat datang!
> Contoh:
> *${usedPrefix + command} Halo @user, selamat datang di grup @subject ♡*
*╰───────────────*`)
  }
}

handler.help = ['setwelcome <teks>']
handler.tags = ['group']
handler.command = /^(setwelcome|setw)$/i
handler.group = true
handler.admin = true

export default handler
