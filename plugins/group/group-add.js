import fetch from 'node-fetch'

let handler = async (m, { conn, text, participants, isAdmin, isOwner, usedPrefix, command }) => {
  if (!isAdmin && !isOwner) {
    return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Khusus untuk Administrator grup.\n*╰───────────────*')
  }

  let targets = []

  // 1. Dari Reply
  if (m.quoted && m.quoted.sender) {
    targets.push(m.quoted.sender)
  }

  // 2. Dari Mention
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    targets.push(...m.mentionedJid)
  }

  // 3. Dari Teks (Nomor HP)
  if (text) {
    let numbers = text.split(/[\s,]+/)
      .map(v => v.replace(/[^0-9]/g, ''))
      .filter(v => v.length >= 7 && v.length <= 15)
      .map(v => v + '@s.whatsapp.net')
    targets.push(...numbers)
  }

  targets = [...new Set(targets)]

  if (!targets.length) {
    return m.reply(`*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Masukkan nomor, tandai @tag, atau balas pesan pengguna yang ingin ditambahkan!\n> Contoh: *${usedPrefix + command} 628123456789*\n*╰───────────────*`)
  }

  // Filter user yang sudah ada di grup
  let memberJids = (participants || []).map(u => conn.decodeJid(u.id || u.jid))
  let toAdd = targets.filter(u => !memberJids.includes(conn.decodeJid(u)))

  if (!toAdd.length) {
    return m.reply('*╭  〔 ◈ ɪ ɴ ꜰ ᴏ 〕*\n> Pengguna yang dituju sudah berada di dalam grup ini!\n*╰───────────────*')
  }

  try {
    let res = await conn.groupParticipantsUpdate(m.chat, toAdd, 'add')
    
    let added = []
    let invited = []
    let failed = []

    if (Array.isArray(res)) {
      for (let r of res) {
        let userJid = r.jid || r.participant || toAdd[0]
        let num = userJid.split('@')[0].replace(/\D/g, '')
        let status = String(r.status || '')

        if (status === '200') {
          added.push(`*┆* ⟡ @${num} › *Berhasil Masuk Grup*`)
        } else if (status === '403' || r.content?.tag === 'add_request') {
          // Setting privasi target aktif -> kirim pesan undangan
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
                'Undangan resmi bergabung ke grup WhatsApp',
                jpegThumbnail
              )
            } else if (code) {
              let inviteMsg = `*──  ୨୧ ✧ UNDANGAN RESMI GRUP ✧ ୨୧  ──*\n\n> Halo @${num}! Kamu diundang untuk bergabung ke grup *${groupName}*.\n\n*╭  〔 ⟡ ᴛ ᴀ ᴜ ᴛ ᴀ ɴ 〕*\n> https://chat.whatsapp.com/${code}\n*╰───────────────*`
              await conn.sendMessage(userJid, { text: inviteMsg, mentions: [userJid] })
            }
            invited.push(`*┆* ✧ @${num} › *Privasi Aktif (Tautan Terkirim ke PC)*`)
          } catch (e) {
            invited.push(`*┆* ✧ @${num} › *Privasi Aktif (Gagal Kirim PC)*`)
          }
        } else if (status === '408' || status === '409') {
          failed.push(`*┆* ◈ @${num} › *Baru Saja Keluar / Sudah di Grup*`)
        } else {
          failed.push(`*┆* ◈ @${num} › *Status ${status}*`)
        }
      }
    } else {
      added.push(toAdd.map(v => `*┆* ⟡ @${v.split('@')[0].replace(/\D/g, '')} › *Berhasil Masuk Grup*`).join('\n'))
    }

    let reportCards = []
    if (added.length) {
      reportCards.push(`*╭  〔 ⟡ ʙ ᴇ ʀ ʜ ᴀ ꜱ ɪ ʟ  ᴍ ᴀ ꜱ ᴜ ᴋ 〕*\n${added.join('\n')}\n*╰───────────────*`)
    }
    if (invited.length) {
      reportCards.push(`*╭  〔 ✧ ᴜ ɴ ᴅ ᴀ ɴ ɢ ᴀ ɴ  ᴘ ᴄ 〕*\n${invited.join('\n')}\n*╰───────────────*`)
    }
    if (failed.length) {
      reportCards.push(`*╭  〔 ◈ ᴋ ᴇ ɴ ᴅ ᴀ ʟ ᴀ 〕*\n${failed.join('\n')}\n*╰───────────────*`)
    }

    const reportText = `*──  ୨୧ ✧ HASIL PENAMBAHAN ANGGOTA ✧ ୨୧  ──*\n\n${reportCards.join('\n\n')}\n\n> ｡˚ ⊹ _Selamat datang dan bergabung bersama keluarga besar grup!_ ⊹ ˚ ｡`.trim()

    await conn.sendMessage(m.chat, { text: reportText, mentions: toAdd }, { quoted: m })

  } catch (e) {
    console.error('Group Add Error:', e)
    let errStr = String(e.message || e)
    if (errStr.includes('account_reachout_restricted') || errStr.includes('463')) {
      return m.reply('*╭  〔 ◈ ᴘ ᴇ ᴍ ʙ ᴀ ᴛ ᴀ ꜱ ᴀ ɴ  ᴡ ᴀ 〕*\n> Akun bot sedang dibatasi oleh WhatsApp sehingga tidak bisa menambahkan anggota secara langsung.\n> Silakan bagikan tautan grup kepada target.\n*╰───────────────*')
    }
    m.reply(`*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal menambahkan anggota: ${errStr}\n*╰───────────────*`)
  }
}

handler.help = ['add @user/nomor']
handler.tags = ['group']
handler.command = /^(add|\+)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler