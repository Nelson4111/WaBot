import moment from 'moment-timezone'

let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) throw 'KESALAHAN: Perintah ini khusus owner!'

  if (!args[0])
    throw 'KESALAHAN: Masukkan ID grup!\nContoh: .sendgc 1203630xxx@g.us Halo'

  let id = args[0]
  if (!id.endsWith('@g.us'))
    throw 'KESALAHAN: ID grup tidak valid!'

  let pesan = args.slice(1).join(' ')
  let quoted = m.quoted

  let senderName = global.db.data.users?.[m.sender]?.name || m.pushName || 'Owner'

  let thumb
  try {
    thumb = await conn.profilePictureUrl(m.sender, 'image')
  } catch {
    thumb = 'https://files.cloudkuimages.guru/images/4c70abcb66ee.jpeg'
  }

  let contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterName: '「 VESTIA ZETA - MD 」',
      newsletterJid: '120363405424415956@newsletter'
    },
    externalAdReply: {
      title: senderName, 
      body: moment().tz('Asia/Jakarta').format('dddd, MMMM Do YYYY, HH:mm'),
      mediaType: 1,
      previewType: 'PHOTO',
      thumbnailUrl: thumb,
      renderLargerThumbnail: true,
      sourceUrl: ""
    }
  }

  if (quoted?.mimetype) {
    let media = await quoted.download()
    let mime = quoted.mimetype

    if (/image/.test(mime)) {
      await conn.sendMessage(id, { image: media, caption: pesan || '', contextInfo })
    } else if (/video/.test(mime)) {
      await conn.sendMessage(id, { video: media, caption: pesan || '', contextInfo })
    } else if (/audio/.test(mime)) {
      await conn.sendMessage(id, { audio: media, mimetype: mime, ptt: false, contextInfo })
    } else if (/webp/.test(mime)) {
      await conn.sendMessage(id, { sticker: media, contextInfo })
    } else {
      throw 'KESALAHAN: Media tidak didukung!'
    }

    return m.reply('Pesan media berhasil dikirim')
  }

  if (!pesan) throw 'KESALAHAN: Pesan tidak boleh kosong!'

  await conn.sendMessage(id, { text: pesan, contextInfo }, { quoted: m })
  m.reply('Pesan teks berhasil dikirim')
}

handler.help = ['sendgc <idgrup> <pesan>']
handler.tags = ['owner']
handler.command = /^sendgc$/i
handler.owner = true

export default handler