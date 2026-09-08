import { startJadibot, stopJadibot, getJadibotList, resolveWaUser } from '../../lib/jadibot.js'

// In-Memory map untuk menyimpan pending input nomor telepon
global.jadibotPending = global.jadibotPending || new Map()

function formatUptime(ms) {
  let s = Math.floor(ms / 1000)
  let d = Math.floor(s / 86400)
  s %= 86400
  let h = Math.floor(s / 3600)
  s %= 3600
  let m = Math.floor(s / 60)
  s %= 60
  return [d ? `${d}h` : '', h ? `${h}j` : '', m ? `${m}m` : '', `${s}d`].filter(Boolean).join(' ') || '0d'
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  // Cegah pemanggilan jadibot secara rekursif dari sub-bot
  if (conn.isJadibot) {
    return m.reply('❌ Perintah *Jadibot* hanya dapat dijalankan melalui *Bot Utama*.')
  }

  const cmd = command.toLowerCase()

  // 1. COMMAND: LIST JADIBOT
  if (cmd === 'listjadibot' || cmd === 'jadibotlist') {
    const list = getJadibotList()
    if (!list || list.length === 0) {
      return m.reply('ℹ️ Saat ini belum ada sub-bot Jadibot yang sedang aktif.')
    }

    let caption = `🤖 *DAFTAR SUB-BOT JADIBOT AKTIF* 🤖\n\n`
    caption += `📊 *Total Aktif:* ${list.length} Sub-Bot\n`
    caption += `────────────────────────────\n`

    const mentions = []
    list.forEach((bot, index) => {
      const statusIcon = bot.status === 'open' ? '🟢 Online' : '🟡 Reconnecting'
      const ownerNum = bot.userJid.split('@')[0]
      caption += `\n*${index + 1}. +${bot.phoneNumber}*\n`
      caption += `   • Status : ${statusIcon}\n`
      caption += `   • Uptime : ${formatUptime(bot.uptime)}\n`
      caption += `   • Owner  : @${ownerNum}\n`
      mentions.push(bot.userJid)
      if (bot.phoneNumber && `${bot.phoneNumber}@s.whatsapp.net` !== bot.userJid) {
        mentions.push(`${bot.phoneNumber}@s.whatsapp.net`)
      }
    })

    caption += `\n────────────────────────────\n`
    caption += `_Gunakan ${usedPrefix}stopjadibot untuk menghentikan bot._`

    return conn.sendMessage(m.chat, {
      text: caption,
      mentions: [...new Set(mentions)]
    }, { quoted: m })
  }

  // 2. COMMAND: STOP JADIBOT
  if (cmd === 'stopjadibot' || cmd === 'delsesi' || cmd === 'stopbot') {
    let rawInput = args[0]
    if (!rawInput && m.quoted && m.quoted.sender) {
      rawInput = m.quoted.sender
    } else if (!rawInput && Array.isArray(m.mentionedJid) && m.mentionedJid.length > 0) {
      rawInput = m.mentionedJid[0]
    } else if (!rawInput) {
      rawInput = 'me'
    }

    const resolved = await resolveWaUser(conn, rawInput, m)
    let targetPhone = resolved.phoneNumber || (rawInput && !rawInput.includes('@') ? rawInput.replace(/[^0-9]/g, '') : '')

    if (!targetPhone) {
      return m.reply(`❌ Nomor atau sesi Jadibot tidak valid.\n\n📋 *Contoh Penggunaan:*\n• ${usedPrefix + command} 628123456789\n• ${usedPrefix + command} (untuk mematikan bot milik Anda sendiri)\n• Reply pesan bot dengan *${usedPrefix + command}*`)
    }

    const activeList = getJadibotList()
    const found = activeList.find(b => b.phoneNumber === targetPhone)

    // Jika bukan owner bot utama, hanya boleh stop bot miliknya sendiri
    if (!isOwner) {
      const senderUser = await resolveWaUser(conn, 'me', m)
      const senderPhone = senderUser.phoneNumber
      const senderJid = senderUser.phoneJid || m.sender

      const isMatch = (found && (found.userJid === senderJid || found.phoneNumber === senderPhone)) ||
                      (targetPhone === senderPhone)

      if (!isMatch) {
        return m.reply('❌ Anda hanya memiliki izin untuk menghentikan sesi Jadibot milik Anda sendiri!')
      }
    }

    await m.reply(`⏳ Menghentikan dan menghapus sesi Jadibot untuk nomor *+${targetPhone}*...`)
    await stopJadibot(targetPhone, false)
    return m.reply(`✅ Sesi Jadibot *+${targetPhone}* berhasil dimatikan dan dihapus dari sistem.`)
  }

  // 3. COMMAND: JADIBOT (START / PAIRING)
  let rawTarget = args[0]
  if (!rawTarget && m.quoted && m.quoted.sender) {
    rawTarget = m.quoted.sender
  } else if (!rawTarget && Array.isArray(m.mentionedJid) && m.mentionedJid.length > 0) {
    rawTarget = m.mentionedJid[0]
  }

  // Jika user tidak memasukkan target apa pun -> tampilkan panduan dan simpan pending state
  if (!rawTarget) {
    global.jadibotPending.set(m.sender, {
      chat: m.chat,
      time: Date.now()
    })

    const senderUser = await resolveWaUser(conn, 'me', m)
    const senderDisplay = senderUser.phoneNumber ? `+${senderUser.phoneNumber}` : 'Nomor WhatsApp Anda'

    const guideText = `🤖 *JADIBOT - CLONE BOT WHATSAPP* 🤖\n\n` +
      `Fitur ini memungkinkan nomor WhatsApp Anda menjadi *Sub-Bot* aktif yang menjalankan semua fitur Avelia tanpa perlu scan QR code!\n\n` +
      `📋 *Cara Penggunaan:*` +
      `\n• Ketik: *${usedPrefix + command} 628123456789* (nomor internasional)` +
      `\n• Ketik: *${usedPrefix + command} 08123456789* (nomor lokal Indonesia)` +
      `\n• Ketik: *${usedPrefix + command} me* (gunakan nomor Anda saat ini: ${senderDisplay})` +
      `\n• Tag user: *${usedPrefix + command} @user*` +
      `\n• Reply pesan seseorang lalu ketik: *${usedPrefix + command}*\n\n` +
      `💬 *Atau langsung balas (reply) pesan ini dengan nomor WhatsApp yang ingin dijadikan bot!*`

    return m.reply(guideText)
  }

  // Terjemahkan target melalui resolveWaUser (mendeteksi LID, JID, nomor, 'me', tag, quoted)
  const resolvedTarget = await resolveWaUser(conn, rawTarget, m)

  // Jika target teridentifikasi sebagai akun LID yang tidak dapat dipetakan ke nomor HP
  if (resolvedTarget.isLid && !resolvedTarget.phoneNumber) {
    return m.reply(`❌ *Akun WhatsApp terdeteksi sebagai WhatsApp Web / LID.*\nNomor HP asli belum terindeks oleh bot di sesi ini.\n\n💡 *Solusi:* Silakan masukkan nomor telepon WhatsApp secara langsung, contoh:\n*${usedPrefix + command} 628123456789* atau *${usedPrefix + command} 08123456789*`)
  }

  const targetNumber = resolvedTarget.phoneNumber
  if (!targetNumber || targetNumber.length < 10) {
    return m.reply('❌ Nomor tidak valid. Pastikan nomor minimal 10 digit dan diawali dengan kode negara (contoh: 628123456789 atau 08123456789).')
  }

  // Cek apakah sudah aktif
  if (global.jadibots && global.jadibots.has(targetNumber)) {
    const existing = global.jadibots.get(targetNumber)
    if (existing.status === 'open') {
      return m.reply(`❌ Nomor *+${targetNumber}* sudah aktif sebagai Jadibot!\nKetik *${usedPrefix}stopjadibot ${targetNumber}* jika ingin mematikannya terlebih dahulu.`)
    }
  }

  // Terjemahkan pemohon (requester) agar pengiriman kode ke Private Chat (PC) selalu valid
  const senderUser = await resolveWaUser(conn, 'me', m)
  const requesterPhoneJid = senderUser.phoneJid || m.sender

  await m.reply(`⏳ *Menyiapkan sesi dan meminta Pairing Code untuk nomor +${targetNumber}...*\n_Mohon tunggu sebentar (5-15 detik)..._`)

  try {
    const result = await startJadibot(targetNumber, requesterPhoneJid, m, false)

    if (result.alreadyActive) {
      return m.reply(`❌ ${result.message}`)
    }

    if (result.code) {
      const code = result.code

      const stepMessage = `🔑 *KODE PAIRING JADIBOT* 🤖\n\n` +
        `📱 Nomor Target: *+${targetNumber}*\n` +
        `🔐 Kode Pairing: *${code}*\n\n` +
        `📋 *Langkah Menautkan WhatsApp:*\n` +
        `1. Buka aplikasi WhatsApp di HP target (*+${targetNumber}*).\n` +
        `2. Ketuk ikon titik tiga (⋮) di pojok kanan atas (Android) atau menu *Pengaturan* (iOS).\n` +
        `3. Pilih menu *Perangkat Tertaut* (Linked Devices).\n` +
        `4. Ketuk *Tautkan Perangkat* (Link a Device).\n` +
        `5. Pilih *Tautkan dengan nomor telepon saja* (Link with phone number instead) di bagian bawah layar.\n` +
        `6. Masukkan kode di bawah ini.\n\n` +
        `_⚠️ Kode pairing akan kedaluwarsa dalam 120 detik. Jangan spam!_`

      // Jika dijalankan di dalam grup, kirim kode ke Private Chat (PC) demi keamanan privasi
      if (m.isGroup) {
        const mentionsGroup = [m.sender, requesterPhoneJid].filter(Boolean)
        const senderTag = m.sender.split('@')[0]
        await conn.sendMessage(m.chat, {
          text: `📩 *KODE PAIRING BERHASIL DIBUAT!*\n\nHalo @${senderTag}, demi privasi dan keamanan Anda, kode pairing telah dikirimkan ke *Chat Pribadi (PC)* Anda.\nSilakan cek pesan masuk dari bot.`,
          mentions: mentionsGroup
        }, { quoted: m })

        // Kirim panduan & kode terpisah ke PC
        let sentPc = false
        try {
          await conn.sendMessage(requesterPhoneJid, { text: stepMessage })
          await conn.sendMessage(requesterPhoneJid, { text: code })
          sentPc = true
        } catch (e) {
          console.error('[JADIBOT SEND PC FAIL]', e?.message || e)
        }

        // Fallback kirim ke m.sender jika requesterPhoneJid berbeda dan tadi gagal
        if (!sentPc && m.sender !== requesterPhoneJid) {
          try {
            await conn.sendMessage(m.sender, { text: stepMessage })
            await conn.sendMessage(m.sender, { text: code })
          } catch {}
        }
      } else {
        // Jika dijalankan di PC, langsung kirim di chat ini
        await conn.sendMessage(m.chat, { text: stepMessage }, { quoted: m })
        await conn.sendMessage(m.chat, { text: code })
      }
    }
  } catch (err) {
    console.error('[JADIBOT PLUGIN ERROR]', err)
    return m.reply(`❌ Gagal memulai Jadibot:\n${err.message || err}`)
  }
}

// Hook 'before' untuk menangani user yang me-reply prompt Jadibot dengan nomor teleponnya
handler.before = async (m, { conn, usedPrefix }) => {
  if (!global.jadibotPending || !global.jadibotPending.has(m.sender)) return
  if (m.isBaileys || !m.text) return

  const pending = global.jadibotPending.get(m.sender)
  // Expire pending setelah 3 menit
  if (Date.now() - pending.time > 180000) {
    global.jadibotPending.delete(m.sender)
    return
  }

  const text = m.text.trim()
  if (text.startsWith('.') || text.startsWith('!') || text.startsWith('/')) return

  // Gunakan resolveWaUser untuk menerjemahkan input user (bisa nomor 08..., +62..., 'me', JID, LID, tag)
  const resolved = await resolveWaUser(conn, text, m)
  if (resolved && resolved.phoneNumber && resolved.phoneNumber.length >= 10) {
    global.jadibotPending.delete(m.sender)

    // Trigger jadibot dengan nomor yang berhasil diterjemahkan
    return handler(m, {
      conn,
      args: [resolved.phoneNumber],
      usedPrefix: usedPrefix || '.',
      command: 'jadibot',
      isOwner: false
    })
  }
}

handler.help = ['jadibot <nomor/me>', 'stopjadibot [nomor]', 'listjadibot']
handler.tags = ['tools']
handler.command = /^(jadibot|subbot|clonebot|stopjadibot|delsesi|stopbot|listjadibot|jadibotlist)$/i

export default handler
