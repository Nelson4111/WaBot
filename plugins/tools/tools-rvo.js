import pkg from '@whiskeysockets/baileys'

const { downloadContentFromMessage } = pkg

let handler = async (m, { conn }) => {
  if (!m.quoted) throw '❌ Reply ke pesan view once!'

  let q = m.quoted
  let mediaType = q.mediaType
  let mediaMessage = mediaType ? q.mediaMessage?.[mediaType] : null
  let mime = mediaMessage?.mimetype || (q.msg || q).mimetype || ''
  if (!mime) throw '❌ Itu bukan pesan media view once!'
  if (!mediaMessage) throw '❌ Data media tidak ditemukan. Reply langsung ke pesan view once aslinya!'
  if (!mediaMessage.mediaKey?.length) {
    throw '❌ Media ini tidak memiliki kunci enkripsi (mediaKey), jadi tidak bisa diunduh. Pastikan kamu membalas pesan view once aslinya, bukan kutipan/forward yang metadata medianya tidak lengkap!'
  }

  let stream = await downloadContentFromMessage(mediaMessage, mediaType.replace(/message/i, ''))
  let chunks = []
  for await (let chunk of stream) chunks.push(chunk)
  let media = Buffer.concat(chunks)
  if (!media.length) throw '❌ Gagal download media!'

  let extension = mime.split('/')[1]?.split(';')[0] || 'bin'
  await conn.sendFile(m.chat, media, 'media.' + extension, q.text || '', m)
}

handler.help = ['rvo']
handler.tags = ['tools']
handler.command = /^rvo$/i
handler.limit = true

export default handler