let handler = async (m, { text, usedPrefix, command }) => {
  if (text) {
    global.db.data.chats[m.chat].sBye = text
    return m.reply(`*──  ୨୧ ✧ PENGATURAN PERPISAHAN ✧ ୨୧  ──*

> Teks perpisahan anggota (Bye) berhasil disimpan ✦

*╭  〔 ⟡ ᴠ ᴀ ʀ ɪ ᴀ ʙ ᴇ ʟ  ᴛ ᴇ ʀ ꜱ ᴇ ᴅ ɪ ᴀ 〕*
*┆* › *@user* : Menandai (mention) anggota yang keluar
*╰───────────────*`)
  } else {
    return m.reply(`*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*
> Masukkan teks perpisahan keluar grup!
> Contoh:
> *${usedPrefix + command} Selamat jalan @user, terima kasih atas kebersamaannya ♡*
*╰───────────────*`)
  }
}

handler.help = ['setbye <teks>']
handler.tags = ['group']
handler.command = /^(setbye)$/i
handler.group = true
handler.admin = true

export default handler