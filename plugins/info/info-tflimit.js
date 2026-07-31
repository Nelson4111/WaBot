let handler = async (m, { conn, args }) => {
  let who
  let amount

  const usage = `❌ Cara pakai:
• Reply user → .tflimit <jumlah>
• Nomor → .tflimit 628xxx <jumlah>`

  if (m.mentionedJid?.length) throw usage

  if (m.quoted) {
    who = m.quoted.sender
    amount = parseInt(args[0])
  } else if (args.length >= 2) {
    let number = args[0].replace(/[^0-9]/g, '')
    if (number.startsWith('0')) number = '62' + number.slice(1)
    who = number + '@s.whatsapp.net'
    amount = parseInt(args[1])
  } else {
    throw usage
  }

  if (!who) throw usage
  who = await resolveJid(conn, who)

  if (!amount || amount <= 0) throw usage
  if (who === m.sender) throw '❌ Tidak bisa ke diri sendiri!'

  let sender = global.db.data.users[m.sender]
  let target = global.db.data.users[who]

  if (!target || Object.keys(target).length === 0) throw '❌ User tidak ditemukan di database!'
  if (sender.limit < amount) throw '❌ Limit tidak cukup!'

  sender.limit -= amount
  target.limit += amount

  let txt = `
✅ *TRANSFER LIMIT BERHASIL*

Dari : @${m.sender.split('@')[0]}
Ke : @${who.split('@')[0]}
Jumlah : ${amount} Limit

Sisa limit: ${sender.limit}
`.trim()

  conn.sendMessage(m.chat, { 
    text: txt, 
    mentions: [m.sender, who] 
  }, { quoted: m.quoted ? m.quoted : m })
}

handler.help = ['tflimit']
handler.tags = ['info']
handler.command = ['tflimit', 'transferlimit', 'sendlimit']
handler.limit = false

export default handler

async function resolveJid(conn, jid) {
  if (!jid || !jid.endsWith('@lid')) return jid
  try {
    let res = await conn.onWhatsApp(jid)
    if (res?.[0]?.jid) return res[0].jid
  } catch {}
  return jid
}
