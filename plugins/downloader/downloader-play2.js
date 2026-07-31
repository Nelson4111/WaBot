/*• Nama Fitur : Play
• Type : Plugin ESM
• Link Channel : https://whatsapp.com/channel/0029VbB8WYS4CrfhJCelw33j
• Author : Agas
*/

import axios from "axios";

const handler = async (m, { conn, usedPrefix, text, command }) => {
  if (!text)
    return m.reply(
      `Ketikkan judul lagu\nContoh: ${usedPrefix + command} kau masih kekasihku`
    );

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const res = await axios.get(
      `https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(text)}`,
      { timeout: 30000 }
    );

    if (!res.data?.status || !res.data?.result)
      throw new Error("Gagal mengambil data dari API.");

    const { url, title, thumbnail, pick, dlink } = res.data.result;

    const caption = `⬣─ 〔 *Y T - A U D I O* 〕 ─⬣
- *Title:* ${title}
- *Quality:* ${pick?.quality || "N/A"}
- *Size:* ${pick?.size || "N/A"}
- *YouTube:* ${url}
⬣────────────────⬣`;

    await conn.sendMessage(
      m.chat,
      {
        text: caption,
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            title,
            body: global.namebot || "Audio Player",
            thumbnailUrl: thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: url,
          },
        },
      },
      { quoted: m }
    );

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: dlink },
        mimetype: "audio/mp4",
        fileName: `${title}.mp3`,
      },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error(err);
    let msg;
    if (err.code === "ECONNABORTED") msg = "Timeout: server terlalu lama merespons.";
    else msg = "Terjadi kesalahan:\n" + err.message;

    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(msg);
  }
};

handler.help = ["play2"];
handler.tags = ["downloader"];
handler.command = ['play2']

export default handler;