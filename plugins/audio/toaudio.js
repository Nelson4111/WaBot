import fs from "fs"
import path from "path"
import ffmpeg from "fluent-ffmpeg"

const TMP_DIR = "./tmp"

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted || m
  const mime = (quoted.msg || quoted).mimetype || ""

  if (!mime.includes("video"))
    return m.reply(
      `❌ Reply video dengan caption:\n*${usedPrefix + command}*`
    )

  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)

  const inputPath = path.join(TMP_DIR, `${Date.now()}_video.mp4`)
  const outputPath = path.join(TMP_DIR, `${Date.now()}_audio.mp3`)

  try {
    await m.reply("🎵 Mengambil audio dari video...")

    // Download video
    const buffer = await quoted.download()
    fs.writeFileSync(inputPath, buffer)

    // Convert video -> audio MP3
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .audioBitrate(128)
        .format("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath)
    })

    // Kirim audio (bukan VN)
    await conn.sendMessage(
      m.chat,
      {
        audio: fs.readFileSync(outputPath),
        mimetype: "audio/mpeg",
        ptt: false,
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.reply("❌ Gagal mengambil audio dari video")
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
  }
}

handler.help = ["toaudio"]
handler.tags = ["tools"]
handler.command = ["toaudio"]
handler.limit = true

export default handler