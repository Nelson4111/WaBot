import {
  addSecurityBlacklist,
  addSecurityReview,
  getSecurityState,
  securityJid,
  verifySecurityMember
} from '../../lib/securityProtocol.js'

function targetFromMessage(m, text, conn) {
  const targets = []
  if (m.quoted?.sender) targets.push(m.quoted.sender)
  if (m.mentionedJid?.length) targets.push(...m.mentionedJid)
  for (const value of String(text || '').split(/[\s,]+/)) {
    const digits = value.replace(/\D/g, '')
    if (digits.length >= 7 && digits.length <= 15) targets.push(`${digits}@s.whatsapp.net`)
  }
  return [...new Set(targets.map(jid => securityJid(jid, conn)).filter(Boolean))][0]
}

function mention(jid) {
  return `@${jid.split('@')[0]}`
}

function checkText(state, conn, usedPrefix) {
  const unverified = state.unverified.map((jid, index) => `${String(index + 1).padStart(2, '0')}. ${mention(jid)}`).join('\n') || 'Belum ada member.'
  const blacklist = state.blacklist.map((jid, index) => `${String(index + 1).padStart(2, '0')}. ${mention(jid)}`).join('\n') || 'Belum ada member.'
  return `╭─❏「 🔐 SECURITY CHECK 」❏
│
│ Status : ${state.active ? 'Protocol Active' : 'Standby'}
│
│ 🟡 UNVERIFIED
│
│ ${unverified.replace(/\n/g, '\n│ ')}
│
│ 🔴 BLACKLIST
│
│ ${blacklist.replace(/\n/g, '\n│ ')}
│
╰─━━━━━━━━━━━━━━─
> Member di atas masih dalam masa pemeriksaan.
> Gunakan ${usedPrefix}security verify untuk menyelesaikan verifikasi.`
}

let handler = async (m, { conn, command, text, isAdmin, isOwner, usedPrefix }) => {
  if (!m.isGroup) return m.reply('Perintah ini hanya dapat digunakan di grup.')
  const state = getSecurityState(m.chat)
  const action = String(text || '').trim().split(/\s+/)[0].toLowerCase()
  if (action === 'check') {
    const targets = [...state.unverified, ...state.blacklist]
    return conn.sendMessage(m.chat, { text: checkText(state, conn, usedPrefix), mentions: targets }, { quoted: m })
  }
  if (action === 'guide') {
return m.reply(
  `╭─❏「 🔐 SECURITY GUIDE 」❏\n` +
  `│ 🔐 *SISTEM SECURITY*\n` +
  `│ Sistem memeriksa member baru\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +

  `📌 *ALUR OTOMATIS*\n` +
  `> ↳ 1. Admin : ${usedPrefix}security protocol\n` +
  `> ↳ 2. Member baru otomatis masuk Unverified\n` +
  `> ↳ 3. Member memperkenalkan diri di grup\n` +
  `> ↳ 4. Admin : ${usedPrefix}security verify @user\n\n` +

  `⚙️ *PERINTAH ADMIN*\n` +
  `> ↳ ${usedPrefix}security protocol\n` +
  `>   Mengaktifkan pencatatan member baru.\n` +
  `> ↳ ${usedPrefix}security check\n` +
  `>   Melihat daftar Unverified dan Blacklist.\n` +
  `> ↳ ${usedPrefix}security review @user\n` +
  `>   Memasukkan member lama secara manual.\n` +
  `> ↳ ${usedPrefix}security verify @user\n` +
  `>   Mengeluarkan member dari daftar pemeriksaan.\n` +
  `> ↳ ${usedPrefix}security standby\n` +
  `>   Menghentikan pencatatan otomatis tanpa menghapus daftar.\n\n` +

  `🎯 *CARA MENENTUKAN TARGET*\n` +
  `> ↳ Balas pesan member\n` +
  `> ↳ Tag @user\n\n` +

  `📌 *CATATAN*\n` +
  `> ↳ Member Unverified yang keluar atau dikeluarkan sebelum diverifikasi otomatis masuk Blacklist.\n` +
  `> ↳ Member Unverified yang mengirim pesan akan menerima pengingat untuk memperkenalkan diri.\n\n` +

  `─━━━━━━━━━━━━━━─`
)
  }
  if (!isAdmin && !isOwner) return m.reply('Perintah security hanya dapat digunakan admin grup.')
  if (action === 'protocol') {
    state.active = true
    await import('../../lib/waifuHelper.js').then(({ saveDB }) => saveDB())
    return m.reply('╭─❏「 🔐 SECURITY PROTOCOL 」❏\n│\n│ Status : Protocol Active\n│ Automatic Detection : Active\n│\n╰─━━━━━━━━━━━━━━─\n> Deteksi otomatis member baru telah diaktifkan.')
  }
  if (action === 'standby') {
    state.active = false
    await import('../../lib/waifuHelper.js').then(({ saveDB }) => saveDB())
    return m.reply('╭─❏「 🔐 SECURITY STANDBY 」❏\n│\n│ Automatic Detection : Standby\n│ Manual Review       : Available\n│\n╰─━━━━━━━━━━━━━━─\n> Pemantauan member baru telah stand by.\n> Daftar pemeriksaan yang ada tetap dipertahankan.')
  }
  const target = targetFromMessage(m, String(text || '').replace(/^\S+/, ''), conn)
  if (action === 'blacklist' || action === 'review' || action === 'verify') {
    if (!target) return m.reply(`Balas pesan, tag member, atau masukkan nomor target. Contoh: ${usedPrefix}security ${action} @user`)
    const changed = action === 'blacklist'
      ? await addSecurityBlacklist(m.chat, target, conn)
      : action === 'review'
        ? await addSecurityReview(m.chat, target, conn)
        : await verifySecurityMember(m.chat, target, conn)
    if (!changed) return m.reply(action === 'blacklist'
      ? 'Target sudah berada di daftar Blacklist.'
      : action === 'review' ? 'Target sudah berada dalam daftar Unverified.' : 'Target tidak berada dalam daftar Unverified.')
    const title = action === 'blacklist' ? 'SECURITY BLACKLIST' : action === 'review' ? 'SECURITY REVIEW' : 'SECURITY VERIFIED'
    const status = action === 'blacklist' ? 'Blacklisted' : action === 'review' ? 'Under Review' : 'Verified'
    const result = action === 'blacklist' ? 'berhasil ditambahkan ke Blacklist dan akan langsung dikeluarkan jika bergabung.' : action === 'review' ? 'berhasil ditambahkan ke dalam daftar pemeriksaan.' : 'telah berhasil diverifikasi dan dikeluarkan dari daftar pemeriksaan.'
    return conn.sendMessage(m.chat, { text: `╭─❏「 🔐 ${title} 」❏\n│\n│ Target : ${mention(target)}\n│ Status : ${status}\n│\n╰─━━━━━━━━━━━━━━─\n> ${mention(target)} ${result}`, mentions: [target] }, { quoted: m })
  }
  return m.reply(`╭─❏「 🔐 SECURITY PROTOCOL 」❏\n│\n│ Sistem Inspeksi Member\n│\n╰─━━━━━━━━━━━━━━─\n\n📡 ${usedPrefix}security protocol\n> Mengaktifkan deteksi otomatis member baru.\n🔎 ${usedPrefix}security check\n> Menampilkan member yang masih Unverified.\n📝 ${usedPrefix}security review <tag/reply>\n> Menambahkan member ke daftar pemeriksaan.\n✅ ${usedPrefix}security verify <tag/reply>\n> Memverifikasi member.\n⏸️ ${usedPrefix}security standby\n> Protocol deteksi otomatis stand by.`)
}

handler.help = ['security']
handler.tags = ['group']
handler.command = /^security$/i
handler.group = true

export default handler