/**
 * Sistem Lamaran & Pernikahan Plugin
 * Mengelola pengajuan lamaran, penerimaan, dan penolakan pernikahan
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, usedPrefix, command }) => {
  const inputCmd = (command || '').toLowerCase().trim()
  const users = global.db.data.users
  const sender = conn.decodeJid(m.sender)
  const senderNum = sender.split('@')[0].replace(/\D/g, '')

  if (!users[sender]) users[sender] = {}
  if (!users[sender].pasangan) users[sender].pasangan = []

  let proposals = global.db.data.proposals = global.db.data.proposals || {}

  // 1. LAMAR / NIKAH / TEMBAK
  if (['lamar', 'nikah', 'tembak'].includes(inputCmd)) {
    const target = m.mentionedJid?.[0]
    if (!target) {
      return m.reply(`*╭  〔 ᰔ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Tandai orang yang ingin kamu lamar!\n> Contoh: *${usedPrefix}lamar @tag*\n*╰───────────────*`)
    }
    if (target === sender) {
      return m.reply('*╭  〔 ᰔ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Kamu tidak dapat melamar dirimu sendiri.\n*╰───────────────*')
    }
    if (target === conn.user.jid) {
      return m.reply('*╭  〔 ᰔ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n> Bot adalah asisten virtual dan tidak dapat menjadi pasangan hidup.\n*╰───────────────*')
    }

    if (!users[target]) users[target] = {}
    if (!users[target].pasangan) users[target].pasangan = []

    // Cek apakah sudah menikah dengan target yang sama
    const alreadyMarried = users[sender].pasangan.some(p => p.jid === target)
    if (alreadyMarried) {
      const targetNum = target.split('@')[0].replace(/\D/g, '')
      return conn.sendMessage(m.chat, {
        text: `*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Kamu telah berstatus sah menjadi pasangan dari @${targetNum}!\n*╰───────────────*`,
        mentions: [target]
      }, { quoted: m })
    }

    proposals[target] = {
      from: sender,
      time: Date.now()
    }

    const targetNum = target.split('@')[0].replace(/\D/g, '')
    const msg = `*──  ୨୧ ✧ SURAT LAMARAN RESMI ✧ ୨୧  ──*

*╭  〔 ᰔ ʟ ᴀ ᴍ ᴀ ʀ ᴀ ɴ  ɴ ɪ ᴋ ᴀ ʜ 〕*
*┆* ⟡ ᴘᴇʟᴀᴍᴀʀ : @${senderNum}
*┆* ✧ ᴛᴀʀɢᴇᴛ  : @${targetNum}
*┆* ✦ ꜱᴛᴀᴛᴜꜱ  : Menunggu Jawaban
*╰───────────────*

> *Pemberitahuan:*
> @${senderNum} ingin melamarmu menjadi pasangan hidupnya ♡
> Ketik *.terima* untuk menerima lamaran ini.
> Atau ketik *.tolak* jika belum bersedia.
> ⧗ _Surat lamaran berlaku selama 𝟼𝟶 detik._`.trim()

    return conn.sendMessage(m.chat, {
      text: msg,
      mentions: [sender, target]
    }, { quoted: m })
  }

  // 2. TERIMA LAMARAN SEBAGAI PERINTAH
  if (['terima', 'accept'].includes(inputCmd)) {
    const prop = proposals[sender]
    if (!prop || (Date.now() - prop.time > 60000)) {
      delete proposals[sender]
      return m.reply('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Tidak ada surat lamaran yang ditujukan padamu atau waktu telah kedaluwarsa.\n*╰───────────────*')
    }

    const fromJid = prop.from
    const fromNum = fromJid.split('@')[0].replace(/\D/g, '')
    delete proposals[sender]

    if (!users[fromJid]) users[fromJid] = {}
    if (!users[fromJid].pasangan) users[fromJid].pasangan = []
    if (!users[sender]) users[sender] = {}
    if (!users[sender].pasangan) users[sender].pasangan = []

    const now = Date.now()
    users[fromJid].pasangan.push({ jid: sender, nikahTime: now, poinBucin: 10, cincin: 'Silver Ring' })
    users[sender].pasangan.push({ jid: fromJid, nikahTime: now, poinBucin: 10, cincin: 'Silver Ring' })

    const ann = `*──  ୨୧ ✧ PERNIKAHAN RESMI SAH ✧ ୨୧  ──*

*╭  〔 ᰔ ꜱ ᴇ ʟ ᴀ ᴍ ᴀ ᴛ  ɴ ɪ ᴋ ᴀ ʜ 〕*
*┆* ⟡ ᴘᴀꜱᴀɴɢᴀɴ : @${fromNum} ♡ @${senderNum}
*┆* ✧ ꜱᴛᴀᴛᴄꜱ   : Sah Menjadi Suami & Istri
*┆* ✦ ᴄɪɴᴄɪɴ   : Silver Ring (Free)
*╰───────────────*

> ｡˚ ⊹ _Ketik .pasangan untuk cek profil atau .kartunikah untuk kartu digital!_ ⊹ ˚ ｡`.trim()

    return conn.sendMessage(m.chat, {
      text: ann,
      mentions: [fromJid, sender]
    }, { quoted: m })
  }

  // 3. TOLAK LAMARAN SEBAGAI PERINTAH
  if (['tolak', 'reject'].includes(inputCmd)) {
    const prop = proposals[sender]
    if (!prop) {
      return m.reply('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Tidak ada surat lamaran yang ditujukan padamu saat ini.\n*╰───────────────*')
    }
    const fromJid = prop.from
    const fromNum = fromJid.split('@')[0].replace(/\D/g, '')
    delete proposals[sender]

    const txt = `*──  ୨୧ ✧ PEMBERITAHUAN LAMARAN ✧ ୨୧  ──*

*╭  〔 ◈ ʟ ᴀ ᴍ ᴀ ʀ ᴀ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*
*┆* ⟡ ᴘᴇʟᴀᴍᴀʀ : @${fromNum}
*┆* ✧ ᴘᴇɴᴏʟᴀᴋ : @${senderNum}
*┆* ✦ ꜱᴛᴀᴛᴜꜱ  : Belum berjodoh
*╰───────────────*

> Tetap berlapang dada, takdir terbaik menantimu di waktu yang tepat ♡`.trim()

    return conn.sendMessage(m.chat, {
      text: txt,
      mentions: [sender, fromJid]
    }, { quoted: m })
  }
}

handler.help = ['lamar @user', 'terima', 'tolak']
handler.tags = ['pasangan']
handler.command = /^(lamar|nikah|tembak|terima|accept|tolak|reject)$/i

// Respon otomatis saat pengguna membalas teks "terima" atau "tolak"
handler.before = async function (m, { conn }) {
  if (!m.text) return
  const txt = m.text.toLowerCase().trim()
  if (!['terima', 'tolak'].includes(txt)) return

  const sender = conn.decodeJid(m.sender)
  const proposals = global.db.data.proposals = global.db.data.proposals || {}
  const prop = proposals[sender]
  if (!prop) return

  const users = global.db.data.users
  const fromJid = prop.from
  const fromNum = fromJid.split('@')[0].replace(/\D/g, '')
  const senderNum = sender.split('@')[0].replace(/\D/g, '')

  if (txt === 'terima') {
    if (Date.now() - prop.time > 60000) {
      delete proposals[sender]
      m.reply('*╭  〔 ᰔ ɪ ɴ ꜰ ᴏ 〕*\n> Surat lamaran yang ditujukan padamu telah kedaluwarsa.\n*╰───────────────*')
      return true
    }

    delete proposals[sender]
    if (!users[fromJid]) users[fromJid] = {}
    if (!users[fromJid].pasangan) users[fromJid].pasangan = []
    if (!users[sender]) users[sender] = {}
    if (!users[sender].pasangan) users[sender].pasangan = []

    const now = Date.now()
    users[fromJid].pasangan.push({ jid: sender, nikahTime: now, poinBucin: 10, cincin: 'Silver Ring' })
    users[sender].pasangan.push({ jid: fromJid, nikahTime: now, poinBucin: 10, cincin: 'Silver Ring' })

    const ann = `*──  ୨୧ ✧ PERNIKAHAN RESMI SAH ✧ ୨୧  ──*

*╭  〔 ᰔ ꜱ ᴇ ʟ ᴀ ᴍ ᴀ ᴛ  ɴ ɪ ᴋ ᴀ ʜ 〕*
*┆* ⟡ ᴘᴀꜱᴀɴɢᴀɴ : @${fromNum} ♡ @${senderNum}
*┆* ✧ ꜱᴛᴀᴛᴄꜱ   : Sah Menjadi Suami & Istri
*┆* ✦ ᴄɪɴᴄɪɴ   : Silver Ring (Free)
*╰───────────────*

> ｡˚ ⊹ _Ketik .pasangan untuk cek status atau .kartunikah untuk kartu digital!_ ⊹ ˚ ｡`.trim()

    conn.sendMessage(m.chat, {
      text: ann,
      mentions: [fromJid, sender]
    }, { quoted: m })
    return true
  }

  if (txt === 'tolak') {
    delete proposals[sender]
    const rej = `*──  ୨୧ ✧ PEMBERITAHUAN LAMARAN ✧ ୨୧  ──*

*╭  〔 ◈ ʟ ᴀ ᴍ ᴀ ʀ ᴀ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*
*┆* ⟡ ᴘᴇʟᴀᴍᴀʀ : @${fromNum}
*┆* ✧ ᴘᴇɴᴏʟᴀᴋ : @${senderNum}
*┆* ✦ ꜱᴛᴀᴛᴜꜱ  : Belum berjodoh
*╰───────────────*

> Tetap berlapang dada, takdir terbaik menantimu di waktu yang tepat ♡`.trim()

    conn.sendMessage(m.chat, {
      text: rej,
      mentions: [sender, fromJid]
    }, { quoted: m })
    return true
  }
}

export default handler
