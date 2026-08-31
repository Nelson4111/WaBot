/**
 * CSM Picture Gallery Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { GALLERY_PICTURES, EXCLUSIVE_PICTURES } from '../../../lib/rpg-libmyCSM.js'
import { header, headerUnavailable, sendCsmReply, picturesEnabled } from '../lib/utils.js'

export async function handleGallery(ctx) {
  const { m, conn, wdb, args, isPrivileged } = ctx
  const pictureAction = args[1]?.toLowerCase()

  if (['enable', 'disable'].includes(pictureAction)) {
    if (!isPrivileged) return m.reply(headerUnavailable('PICTURE'))
    wdb.csmPicturesEnabled = pictureAction === 'enable'
    saveDB(wdb)
    return m.reply(`${pictureAction === 'enable' ? 'Pengiriman gambar diaktifkan.' : 'Pengiriman gambar dinonaktifkan.'}`)
  }

  if (!picturesEnabled(wdb)) {
    return m.reply(header('CSM PICTURE') + `Gambar sedang dinonaktifkan.\nGunakan *.csm picture enable* atau *.csm gallery enable* untuk mengaktifkan kembali.\n━━━━━━━━━━━`)
  }

  const galleryPictures = GALLERY_PICTURES
  const pictureNumber = Number(pictureAction)
  if (Number.isInteger(pictureNumber) && pictureNumber >= 1 && pictureNumber <= galleryPictures.length) {
    const [name, picture] = galleryPictures[pictureNumber - 1]
    return sendCsmReply(conn, m, wdb, header(`PICTURE ${pictureNumber}`) + `🖼️ ${name}\n━━━━━━━━━━━`, picture)
  }

  let galleryText = header('CSM PICTURE GALLERY') +
    `Koleksi gambar referensi karakter dari berbagai sumber publik.\n` +
    `Gunakan *.csm gallery <nomor>* atau *.csm picture <nomor>* untuk melihat gambar.\n\n`

  const exclusiveNames = new Set(EXCLUSIVE_PICTURES.map(([name]) => name))
  const exclusiveGallery = galleryPictures.filter(([name]) => exclusiveNames.has(name))
  const regularGallery = galleryPictures.filter(([name]) => !exclusiveNames.has(name))

  galleryText += `|━━━━━━━━━━━\n\n`
  galleryText += `⭐ EXCLUSIVE\n`
  exclusiveGallery.forEach((picture, index) => {
    galleryText += `> ${index + 1}. ${picture[0]}\n`
  })

  galleryText += `\n|━━━━━━━━━━━\n\n`
  galleryText += `🖼️ REGULAR\n`
  regularGallery.forEach((picture, index) => {
    galleryText += `> ${exclusiveGallery.length + index + 1}. ${picture[0]}\n`
  })

  galleryText += `\n|━━━━━━━━━━━`
  return m.reply(galleryText)
}
