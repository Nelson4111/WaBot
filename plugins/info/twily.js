let handler = async (m, { text = '' }) => {
  if (text.trim().toLowerCase() === 'info') {
    return m.reply(`
★───「 *𝗧𝗪𝗜𝗟𝗬 𝗜𝗡𝗙𝗢* 」───★

╭─❏「 👥 *𝗔𝗥𝗧𝗜 𝗧𝗪𝗜𝗟𝗬* 」❏
│
│ *TWILY* adalah singkatan dari
│ *Two And Family* atau
│ *Keluarga Kedua*
│
│ Kami berusaha menjadi keluarga
│ untuk kalian, tempat untuk saling
│ mengenal, berbagi, dan bertumbuh
│ bersama.
╰─━━━━━━━━━━━━━━─

╭─❏「 ✦ *𝗧𝗘𝗡𝗧𝗔𝗡𝗚 𝗧𝗪𝗜𝗟𝗬* 」❏
│• Berdiri sejak 5 November 2021
│• Founder : *Eza*
│• Rules : *Baca deskripsi grup*
│• Tiktok 
│↳  https://www.tiktok.com/@twily.ofc 
╰─━━━━━━━━━━━━━━─


> Terima kasih sudah menjadi bagian
> dari keluarga kecil TWILY ♡
`.trim())
  }

  const anu = `
★───「 *𝗪𝗲𝗹𝗰𝗼𝗺𝗲* 」 ───★

𝐒𝐢𝐥𝐚𝐡𝐤𝐚𝐧 𝐢𝐧𝐭𝐫𝐨 𝐦𝐞𝐧𝐠𝐠𝐮𝐧𝐚𝐤𝐚𝐧 𝐟𝐨𝐫𝐦𝐚𝐭 𝐢𝐧𝐢 𝐝𝐚𝐧 𝐦𝐞𝐧𝐠𝐢𝐫𝐢𝐦𝐤𝐚𝐧 𝐟𝐨𝐭𝐨 𝐝𝐢𝐫𝐢 𝐬𝐞𝐧𝐝𝐢𝐫𝐢 (𝐨𝐩𝐬𝐢𝐨𝐧𝐚𝐥)

╭─❏「 👤 *𝐈𝐍𝐓𝐑𝐎 𝐂𝐀𝐑𝐃* 」❏
│
│👋 *𝐏𝐞𝐫𝐤𝐞𝐧𝐚𝐥𝐚𝐧 𝐃𝐢𝐫𝐢* ⎯´ˎ˗
├─━━━━━━━━━━━━━━─
│• 𝐍𝐚𝐦𝐚 :
│• 𝐆𝐞𝐧𝐝𝐞𝐫 : -
│• 𝐀𝐬𝐤𝐨𝐭 : -
│• 𝐇𝐨𝐛𝐢 : -
│• 𝐒𝐭𝐚𝐭𝐮𝐬 : 𝐒𝐢𝐧𝐠𝐥𝐞 / 𝐓𝐚𝐤𝐞𝐧
├─━━━━━━━━━━━━━━─
│💬 𝐒𝐚𝐥𝐚𝐦 𝐤𝐞𝐧𝐚𝐥 𝐬𝐞𝐦𝐮𝐚𝐧𝐲𝐚!
│
│𝐆𝐮𝐧𝐚𝐤𝐚𝐧 - 𝐣𝐢𝐤𝐚 𝐩𝐫𝐢𝐯𝐚𝐬𝐢 😊
╰─━━「 *𝐓 𝐖 𝐈 𝐋 𝐘* 」━━─
`

  await m.reply(anu.trim())
}

handler.customPrefix = /^(twily)$/i
handler.command = /^(twily)$/i

export default handler
