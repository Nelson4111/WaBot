import fs from "fs"
import crypto from "crypto"
import axios from "axios"
import FormData from "form-data"
import path from "path"

const baseApi = "https://api.unblurimage.ai"
const TMP_DIR = "./tmp"

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, options)
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    return { __httpError: true, status: res.status, raw: text }
  }
  if (!res.ok) return { __httpError: true, status: res.status, raw: json }
  return json
}

async function upscaleVideo(videoPath) {
  const productSerial = crypto.randomUUID().replace(/-/g, "")
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  const uploadForm = new FormData()
  uploadForm.append("video_file_name", `cli-${Date.now()}.mp4`)

  const uploadResp = await axios
    .post(`${baseApi}/api/upscaler/v1/ai-video-enhancer/upload-video`, uploadForm, {
      headers: uploadForm.getHeaders(),
    })
    .then((r) => r.data)
    .catch((e) => ({
      __httpError: true,
      status: e.response?.status,
      raw: e.response?.data,
    }))

  if (uploadResp.__httpError || uploadResp.code !== 100000)
    throw new Error("Gagal request upload URL")

  const { url: uploadUrl, object_name } = uploadResp.result || {}
  if (!uploadUrl || !object_name)
    throw new Error("Upload URL tidak ditemukan")

  await axios.put(uploadUrl, fs.createReadStream(videoPath), {
    headers: { "content-type": "video/mp4" },
  })

  const cdnUrl = `https://cdn.unblurimage.ai/${object_name}`

  const jobForm = new FormData()
  jobForm.append("original_video_file", cdnUrl)
  jobForm.append("resolution", "2k")
  jobForm.append("is_preview", "false")

  const createJobResp = await axios
    .post(`${baseApi}/api/upscaler/v2/ai-video-enhancer/create-job`, jobForm, {
      headers: {
        ...jobForm.getHeaders(),
        "product-serial": productSerial,
        authorization: "",
      },
    })
    .then((r) => r.data)
    .catch((e) => ({
      __httpError: true,
      status: e.response?.status,
      raw: e.response?.data,
    }))

  if (createJobResp.__httpError || createJobResp.code !== 100000)
    throw new Error("Gagal membuat job")

  const { job_id } = createJobResp.result || {}
  if (!job_id) throw new Error("Job ID tidak ditemukan")

  const startTime = Date.now()
  const maxWait = 5 * 60 * 1000

  while (true) {
    const jobResp = await jsonFetch(
      `${baseApi}/api/upscaler/v2/ai-video-enhancer/get-job/${job_id}`,
      {
        method: "GET",
        headers: {
          "product-serial": productSerial,
          authorization: "",
        },
      }
    )

    if (jobResp?.code === 100000 && jobResp.result?.output_url) {
      return jobResp.result.output_url
    }

    if (Date.now() - startTime > maxWait)
      throw new Error("Timeout menunggu proses video")

    await sleep(10000)
  }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted || m
  const mime = (quoted.msg || quoted).mimetype || ""

  if (!mime.includes("video"))
    return m.reply(
      `❌ Reply / kirim video dengan caption *${usedPrefix + command}*`
    )

  await m.reply("🎥 *HD VIDEO*\n⏳ Mengunggah & memproses...\n⏱️ ±2–5 menit")

  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)

  const inputPath = path.join(TMP_DIR, `${Date.now()}_input.mp4`)
  const outputPath = path.join(TMP_DIR, `${Date.now()}_hd.mp4`)

  try {
    const buffer = await quoted.download()
    fs.writeFileSync(inputPath, buffer)

    const hdUrl = await upscaleVideo(inputPath)

    const stream = await axios.get(hdUrl, {
      responseType: "stream",
    })

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath)
      stream.data.pipe(writer)
      writer.on("finish", resolve)
      writer.on("error", reject)
    })

    await conn.sendMessage(
      m.chat,
      {
        video: fs.readFileSync(outputPath),
        caption: `✨ *HD VIDEO*\n• Resolution: 2K`,
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    m.reply("❌ Gagal memproses video HD")
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
  }
}

handler.help = ['hdvid', 'hdvideo'];
handler.command = ['hdvid', 'hdvideo'];
handler.tags = ['tools'];
handler.limit = true;
handler.premium = true;

export default handler;