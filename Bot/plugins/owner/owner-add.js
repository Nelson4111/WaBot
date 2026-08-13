import fetch from 'node-fetch'

let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
  let targets = []

  if (m.quoted && m.quoted.sender) targets.push(m.quoted.sender)
  if (m.mentionedJid?.length) targets.push(...m.mentionedJid)
  if (text) {
    let numbers = text.split(/[\s,]+/)
      .map(v => v.replace(/[^0-9]/g, ''))
      .filter(v => v.length >= 7 && v.length <= 15)
      .map(v => v + '@s.whatsapp.net')
    targets.push(...numbers)
  }

  targets = [...new Set(targets)]
  if (!targets.length) return m.reply(`⚠️ Masukkan nomor/tag/reply user untuk ditambahkan!\nContoh: *${usedPrefix + command}* 628123456789`)

  await m.react('⏳')
  let memberJids = participants.map(u => conn.decodeJid(u.id || u.jid))
  let toAdd = targets.filter(u => !memberJids.includes(conn.decodeJid(u)))

  if (!toAdd.length) {
    await m.react('❌')
    return m.reply('❌ User yang dimaksud sudah ada di dalam grup!')
  }

  try {
    let res = await conn.groupParticipantsUpdate(m.chat, toAdd, 'add')
    let added = [], invited = [], failed = []

    if (Array.isArray(res)) {
      for (let r of res) {
        let userJid = r.jid || r.participant || toAdd[0]
        let num = userJid.split('@')[0]
        let status = String(r.status || '')

        if (status === '200') {
          added.push(`@${num}`)
        } else if (status === '403' || r.content?.tag === 'add_request') {
          try {
            let code = r.content?.attrs?.code || await conn.groupInviteCode(m.chat).catch(() => null)
            let groupName = await conn.getName(m.chat)
            let exp = r.content?.attrs?.expiration || (Math.floor(Date.now() / 1000) + (3 * 24 * 3600))
            
            if (typeof conn.sendGroupV4Invite === 'function' && r.content?.attrs?.code) {
              const pp = await conn.profilePictureUrl(m.chat, 'image').catch(() => null)
              const jpegThumbnail = pp ? await (await fetch(pp)).buffer() : Buffer.alloc(0)
              await conn.sendGroupV4Invite(
                m.chat,
                userJid,
                r.content.attrs.code,
                exp,
                groupName,
                'Undangan untuk bergabung ke grup WhatsApp',
                jpegThumbnail
              )
            } else if (code) {
              let inviteMsg = `📩 *UNDANGAN GRUP*\n\nHalo! Kamu diundang untuk bergabung ke grup *${groupName}*.\n\nKlik link di bawah ini untuk bergabung:\nhttps://chat.whatsapp.com/${code}`
              await conn.sendMessage(userJid, { text: inviteMsg })
            }
            invited.push(`@${num} (Privasi aktif - Link undangan dikirim ke PM)`)
          } catch (e) {
            invited.push(`@${num} (Privasi aktif - Gagal kirim PM undangan)`)
          }
        } else {
          failed.push(`@${num} (Status ${status})`)
        }
      }
    } else {
      added.push(toAdd.map(v => `@${v.split('@')[0]}`).join(', '))
    }

    let reportText = `👑 *[OWNER] HASIL PENAMBAHAN ANGGOTA*\n\n`
    if (added.length) reportText += `✅ *Berhasil Ditambahkan:*\n${added.join('\n')}\n\n`
    if (invited.length) reportText += `📩 *Diundang via PM:*\n${invited.join('\n')}\n\n`
    if (failed.length) reportText += `❌ *Gagal:*\n${failed.join('\n')}\n`

    await conn.sendMessage(m.chat, { text: reportText.trim(), mentions: toAdd }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply(`❌ *Gagal:* ${e.message || e}`)
  }
}

handler.help = ['oadd @user/nomor']
handler.tags = ['owner']
handler.command = /^(oadd|o\+)$/i
handler.owner = true
handler.group = true
handler.botAdmin = true

export default handler
