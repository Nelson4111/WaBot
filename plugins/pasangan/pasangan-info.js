import { toSmallNum } from '../../lib/style.js'
import { saveDB } from '../../lib/waifuHelper.js'
import { sendDualGroupMessage } from '../../lib/dual-group-message.js'
import { formatDuration, formatPasanganAlias, getIntimacyRank, getRingIcon, HUBUNGAN_ALIASES, isPasanganHidden, getPasanganHiddenNotice, migrateLegacyRingData, normalizeRingName } from '../../lib/pasanganHelper.js'

/**
 * Status Pernikahan Plugin
 * Menampilkan rincian status pernikahan, keintiman, dan cincin pasangan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, args, command }) => {
  const users = migrateLegacyRingData(global.db.data.users || {})
  const sender = conn.decodeJid(m.sender)
  const who = conn.decodeJid(m.mentionedJid?.[0] || m.quoted?.sender || sender)
  const whoNum = who.split('@')[0].replace(/\D/g, '')
  const isSelf = who === sender
  const currentCommand = (command || '').toLowerCase()
  const action = (args[0] || '').toLowerCase()

  if (currentCommand === 'hubungan') {
    if (action === 'alias') {
      const alias = args.slice(1).join(' ').trim().toLowerCase()
      if (!HUBUNGAN_ALIASES.includes(alias)) return m.reply(`Alias tidak valid. Pilih: *${HUBUNGAN_ALIASES.join(', ')}*`)
      users[sender] = users[sender] || {}
      users[sender].pasanganAlias = alias
      saveDB(global.db)
      const aliasMessage = `Tampilan hubungan diperbarui menjadi *${formatPasanganAlias(alias)}*.`
      return isPasanganHidden(users[sender])
        ? replyPasanganPrivately(conn, m, aliasMessage)
        : m.reply(aliasMessage)
    }

    const user = users[sender] || {}
    const partners = Array.isArray(user.pasangan) ? user.pasangan : []
    const virtualPartner = global.db.data.couples?.[sender]
    const virtualLabel = virtualPartner?.isHusbu ? 'Husbu' : 'Waifu'
    const relationshipStatus = partners.length && virtualPartner
      ? `Menikah dan memiliki ${virtualLabel} virtual`
      : partners.length
        ? 'Menikah'
        : virtualPartner
          ? `Memiliki ${virtualLabel} virtual`
          : 'Single'
    const summary = `*──  ୨୧ ✧ STATUS HUBUNGAN ✧ ୨୧  ──*\n\n` +
      `> Status: *${relationshipStatus}*\n` +
      `> Jumlah pasangan: *${partners.length}*\n` +
      `> ${virtualLabel}: *${virtualPartner?.charName || 'Tidak ada'}*`

    if (isPasanganHidden(user) && (m.isGroup || m.chat?.endsWith('@g.us'))) {
      try {
        return await sendDualGroupMessage(
          conn,
          m.chat,
          sender,
          { extendedTextMessage: { text: summary } },
          '🔒 Informasi hubungan ini disembunyikan oleh pemiliknya.'
        )
      } catch {
        return conn.sendMessage(sender, { text: summary })
      }
    }
    return conn.sendMessage(m.chat, { text: summary }, { quoted: m })
  }

  if (action === 'hide') {
    users[sender] = users[sender] || {}
    users[sender].pasanganHidden = true
    saveDB(global.db)
    return replyPasanganPrivately(conn, m, getPasanganHiddenNotice(whoNum, true))
  }

  if (action === 'unhide') {
    users[sender] = users[sender] || {}
    users[sender].pasanganHidden = false
    saveDB(global.db)
    return m.reply(`*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Status pasanganmu sudah dibuka kembali.\n> Ketik *.pasangan* untuk melihat profil pernikahanmu.\n*╰───────────────*`)
  }

  const hidden = isPasanganHidden(users[who] || {})
  const pList = [...(users[who]?.pasangan || [])].sort((a, b) => (Number(a.nikahTime) || 0) - (Number(b.nikahTime) || 0))
  const aliasDisplay = formatPasanganAlias(users[who]?.pasanganAlias || 'pasangan')

  if (hidden && !isSelf) {
    return replyPasanganPrivately(conn, m, getPasanganHiddenNotice(whoNum, isSelf))
  }

  const sendPasanganResult = async (text, mentions = []) => {
    if (hidden && isSelf && (m.isGroup || m.chat?.endsWith('@g.us'))) {
      try {
        return await sendDualGroupMessage(
          conn,
          m.chat,
          sender,
          { extendedTextMessage: { text, contextInfo: { mentionedJid: mentions } } },
          '🔒 Informasi hubungan ini disembunyikan oleh pemiliknya.'
        )
      } catch {
        return conn.sendMessage(sender, { text, mentions })
      }
    }
    return conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
  }

  if (pList.length === 0) {
    const waifu = global.db?.data?.couples?.[who]
    let notMarriedText = ''
    if (waifu) {
      notMarriedText = isSelf
        ? `*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu belum memiliki pasangan di dunia nyata (WhatsApp).\n> Namun, kamu saat ini telah memiliki *Waifu Virtual*: *${waifu.charName}* ♡\n> _Gunakan perintah *.lamar @user* jika ingin menikah di WhatsApp._\n*╰───────────────*`
        : `*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> @${whoNum} belum memiliki pasangan di WhatsApp, namun telah menjalin hubungan dengan *Waifu Virtual*: *${waifu.charName}* ♡\n*╰───────────────*`
    } else {
      notMarriedText = isSelf
        ? `*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu saat ini berstatus single (Jomblo).\n> Gunakan perintah *.lamar @user* untuk mencari pasangan!\n*╰───────────────*`
        : `*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> @${whoNum} saat ini belum memiliki pasangan (Jomblo).\n*╰───────────────*`
    }

    return sendPasanganResult(notMarriedText, [who])
  }

  let cards = []
  pList.forEach((p, i) => {
    const partnerNum = p.jid.split('@')[0].replace(/\D/g, '')
    const dur = formatDuration(Date.now() - p.nikahTime)
    const dateStr = new Date(p.nikahTime).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    })
    const rank = getIntimacyRank(p.poinBucin || 0)

    let card = `*╭  〔 ᰔ ${aliasDisplay} ${toSmallNum(i + 1)} 〕*
*┆* ⟡ ${aliasDisplay} : @${partnerNum}
*┆* ✧ ᴛᴀɴɢɢᴀʟ    : *${dateStr}*
*┆* ✦ ᴅᴜʀᴀꜱɪ     : *${dur}*
*┆* ᰔ ᴘᴏɪɴ ʙᴜᴄɪɴ : *${toSmallNum(p.poinBucin || 0)} Poin*
*┆* ◈ ᴛɪɴɢᴋᴀᴛ    : *${rank.title}*
*┆* ✧ ʙᴜꜰꜰ       : *${rank.buff}*
*┆* ❖ ᴄɪɴᴄɪɴ     : *${getRingIcon(p.cincin)} ${normalizeRingName(p.cincin || 'Silver Ring')}*
*╰───────────────*`
    cards.push(card)
  })

  const fullText = `*──  ୨୧ ✧ STATUS IKATAN RESMI ✧ ୨୧  ──*

> *おしらせ!* (ᴘʀᴏꜰɪʟ ʜᴜʙᴜɴɢᴀɴ)
> Informasi ikatan ${aliasDisplay} untuk @${whoNum} ♡

${cards.join('\n\n')}

> ｡˚ ⊹ _Ketik .kencan atau .loveclaim untuk meningkatkan keharmonisan!_ ⊹ ˚ ｡`.trim()

  return sendPasanganResult(fullText, [who, ...pList.map(p => p.jid)])
}

handler.help = ['pasangan [@user]', 'ceknikah [@user]', 'istri', 'suami', 'pasangan hide', 'pasangan unhide', 'hubungan', 'hubungan alias <jenis>']
handler.tags = ['pasangan']
handler.command = /^(pasangan|hubungan|ceknikah|istri|suami|pasangan\s+(hide|unhide))$/i

export default handler
