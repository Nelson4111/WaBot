import {
  addSecurityBlacklist,
  addSecurityReview,
  getSecurityState,
  pruneSecurityUnverified,
  securityJid,
  verifySecurityMember
} from '../../lib/securityProtocol.js'

function targetsFromMessage(m, text, conn) {
  const targets = []
  if (m.quoted?.sender) targets.push(m.quoted.sender)
  if (m.mentionedJid?.length) targets.push(...m.mentionedJid)
  for (const value of String(text || '').split(/[\s,]+/)) {
    const digits = value.replace(/\D/g, '')
    if (digits.length >= 7 && digits.length <= 15) targets.push(`${digits}@s.whatsapp.net`)
  }
  return [...new Set(targets.map(jid => securityJid(jid, conn)).filter(Boolean))]
}

function mention(jid) {
  return `@${jid.split('@')[0]}`
}

const pendingClear = new Map()

function checkText(state, usedPrefix) {
  return `╭─❏「 🔐 SECURITY CHECK 」❏
│
│ Status : ${state.active ? 'Protocol Active' : 'Standby'}
│
│ 🟡 Unverified : *${state.unverified.length} user*
│ 🔴 Blacklist  : *${state.blacklist.length} user*
│
╰─━━━━━━━━━━━━━━─
> Gunakan ${usedPrefix}security check unv untuk melihat daftar Unverified.
> Gunakan ${usedPrefix}security check bl untuk melihat daftar Blacklist.`
}

function detailText(state, type) {
  const label = type === 'unverified' ? 'UNVERIFIED' : 'BLACKLIST'
  const list = state[type].map((jid, index) => `${String(index + 1).padStart(2, '0')}. ${mention(jid)}`).join('\n') || 'Belum ada member.'
  return `╭─❏「 🔐 ${label} 」❏
│
│ Total : *${state[type].length} user*
│
│ ${list.replace(/\n/g, '\n│ ')}
│
╰─━━━━━━━━━━━━━━─`
}

let handler = async (m, { conn, command, text, isAdmin, isOwner, usedPrefix }) => {
  if (!m.isGroup) return m.reply('Perintah ini hanya dapat digunakan di grup.')
  const state = getSecurityState(m.chat)
  const args = String(text || '').trim().split(/\s+/).filter(Boolean).map(value => value.toLowerCase())
  const action = args[0] || ''
  if (action === 'check') {
    const detailType = ['unv', 'unverified'].includes(args[1])
      ? 'unverified'
      : ['bl', 'blacklist'].includes(args[1])
        ? 'blacklist'
        : null
    const removedCount = detailType === 'unverified'
      ? await pruneSecurityUnverified(m.chat, conn)
      : 0
    const text = detailType ? detailText(state, detailType) : checkText(state, usedPrefix)
    const cleanupNotice = removedCount > 0
      ? `\n> ${removedCount} user yang sudah keluar dari grup dihapus dari daftar.`
      : ''
    const outputText = detailType === 'unverified' ? `${text}${cleanupNotice}` : text
    return conn.sendMessage(m.chat, { text: outputText, mentions: detailType ? state[detailType] : [] }, { quoted: m })
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
  `> ↳ 3. Member mengirim link intro\n` +
  `> ↳ 4. Bot otomatis menghapusnya dari Unverified dan men-tag admin\n` +
  `> ↳ 5. Admin dapat memverifikasi manual dengan ${usedPrefix}security verify @user\n\n` +

  `⚙️ *PERINTAH ADMIN*\n` +
  `> ↳ ${usedPrefix}security protocol\n` +
  `>   Mengaktifkan pencatatan member baru.\n` +
  `> ↳ ${usedPrefix}security check\n` +
  `>   Melihat jumlah Unverified dan Blacklist.\n` +
  `> ↳ ${usedPrefix}security check unv/unverified\n` +
  `>   Melihat semua tag Unverified.\n` +
  `> ↳ ${usedPrefix}security check bl/blacklist\n` +
  `>   Melihat semua tag Blacklist.\n` +
  `> ↳ ${usedPrefix}security info <reply/tag>\n` +
  `>   Mengecek status security satu user.\n` +
  `> ↳ ${usedPrefix}security clear unv/bl\n` +
  `>   Meminta konfirmasi untuk menghapus salah satu daftar.\n` +
  `> ↳ ${usedPrefix}sc clear yes/cancel\n` +
  `>   Mengonfirmasi atau membatalkan penghapusan.\n` +
  `> ↳ ${usedPrefix}security review @user\n` +
  `>   Memasukkan satu atau banyak member ke Unverified.\n` +
  `>   Bisa tag banyak user atau sertakan beberapa nomor.\n` +
  `> ↳ ${usedPrefix}security blacklist @user1 @user2\n` +
  `>   Memasukkan banyak member ke Blacklist sekaligus.\n` +
  `> ↳ ${usedPrefix}security verify @user\n` +
  `>   Mengeluarkan member dari daftar pemeriksaan.\n` +
  `> ↳ ${usedPrefix}security standby\n` +
  `>   Menghentikan pencatatan otomatis tanpa menghapus daftar.\n\n` +

  `🎯 *CARA MENENTUKAN TARGET*\n` +
  `> ↳ Balas pesan member atau beberapa tag user\n` +
  `> ↳ Sertakan beberapa nomor WhatsApp dalam satu perintah\n\n` +

  `📌 *CATATAN*\n` +
  `> ↳ Member Unverified yang keluar atau dikeluarkan sebelum diverifikasi otomatis masuk Blacklist.\n` +
  `> ↳ Pesan member Unverified selain intro akan otomatis dihapus.\n` +
  `> ↳ Intro otomatis menghapus member dari Unverified.\n` +
  `> ↳ Bot akan menandai admin grup di bawah notifikasi otomatis.\n\n` +

  `─━━━━━━━━━━━━━━─`
)
  }
  if (!isAdmin && !isOwner) return m.reply('Perintah security hanya dapat digunakan admin grup.')
  if (action === 'clear') {
    const type = ['unv', 'unverified'].includes(args[1])
      ? 'unverified'
      : ['bl', 'blacklist'].includes(args[1])
        ? 'blacklist'
        : null

    if (['yes', 'confirm', 'y'].includes(args[1])) {
      const request = pendingClear.get(m.chat)
      if (!request || request.expiresAt < Date.now()) {
        pendingClear.delete(m.chat)
        return m.reply('❌ Tidak ada permintaan clear yang masih menunggu konfirmasi.')
      }
      const count = state[request.type].length
      state[request.type] = []
      pendingClear.delete(m.chat)
      await import('../../lib/waifuHelper.js').then(({ saveDB }) => saveDB())
      return m.reply(`✅ Daftar ${request.type === 'unverified' ? 'Unverified' : 'Blacklist'} berhasil dibersihkan.\n👤 User dihapus: *${count}*`)
    }

    if (['cancel', 'no', 'n', 'batal'].includes(args[1])) {
      pendingClear.delete(m.chat)
      return m.reply('❎ Clear dibatalkan. Tidak ada data yang dihapus.')
    }

    if (!type) return m.reply(`❌ Format: ${usedPrefix}security clear unv/bl\nLalu konfirmasi: ${usedPrefix}sc clear yes/cancel`)
    const count = state[type].length
    pendingClear.set(m.chat, { type, expiresAt: Date.now() + 2 * 60 * 1000 })
    return m.reply(`⚠️ Konfirmasi penghapusan\nDaftar: *${type === 'unverified' ? 'Unverified' : 'Blacklist'}*\nUser yang akan dihapus: *${count}*\n\nKetik *${usedPrefix}sc clear yes* untuk lanjut atau *${usedPrefix}sc clear cancel* untuk membatalkan.`)
  }
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
  const targets = targetsFromMessage(m, String(text || '').replace(/^\S+/, ''), conn)
  const target = targets[0]
  if (action === 'info') {
    if (!target) return m.reply(`❌ Balas pesan atau tag user. Contoh: ${usedPrefix}security info @user`)
    const status = state.unverified.includes(target)
      ? '🟡 Unverified'
      : state.blacklist.includes(target)
        ? '🔴 Blacklist'
        : '🟢 Terverifikasi'
    return conn.sendMessage(m.chat, {
      text: `╭─❏「 🔐 SECURITY INFO 」❏\n│\n│ User   : ${mention(target)}\n│ Status : *${status}*\n│\n╰─━━━━━━━━━━━━━━─`,
      mentions: [target]
    }, { quoted: m })
  }
  if (action === 'blacklist' || action === 'review' || action === 'verify') {
    if (!target) return m.reply(`Balas pesan, tag member, atau masukkan nomor target. Contoh: ${usedPrefix}security ${action} @user`)
    const selectedTargets = action === 'verify' ? [target] : targets
    const changedTargets = []
    for (const selectedTarget of selectedTargets) {
      const changed = action === 'blacklist'
        ? await addSecurityBlacklist(m.chat, selectedTarget, conn)
        : action === 'review'
          ? await addSecurityReview(m.chat, selectedTarget, conn)
          : await verifySecurityMember(m.chat, selectedTarget, conn)
      if (changed) changedTargets.push(selectedTarget)
    }
    if (!changedTargets.length) return m.reply(action === 'blacklist'
      ? 'Semua target sudah berada di daftar Blacklist.'
      : action === 'review' ? 'Semua target sudah berada dalam daftar Unverified.' : 'Target tidak berada dalam daftar Unverified.')
    const title = action === 'blacklist' ? 'SECURITY BLACKLIST' : action === 'review' ? 'SECURITY REVIEW' : 'SECURITY VERIFIED'
    const status = action === 'blacklist' ? 'Blacklisted' : action === 'review' ? 'Under Review' : 'Verified'
    const result = action === 'blacklist' ? 'berhasil ditambahkan ke Blacklist dan akan langsung dikeluarkan jika bergabung.' : action === 'review' ? 'berhasil ditambahkan ke dalam daftar pemeriksaan.' : 'telah berhasil diverifikasi dan dikeluarkan dari daftar pemeriksaan.'
    const targetText = changedTargets.map(selectedTarget => mention(selectedTarget)).join(', ')
    return conn.sendMessage(m.chat, { text: `╭─❏「 🔐 ${title} 」❏\n│\n│ Target : ${targetText}\n│ Jumlah : ${changedTargets.length} user\n│ Status : ${status}\n│\n╰─━━━━━━━━━━━━━━─\n> ${targetText} ${result}`, mentions: changedTargets }, { quoted: m })
  }
  return m.reply(`╭─❏「 🔐 SECURITY PROTOCOL 」❏\n│\n│ Sistem Inspeksi Member\n│ Alias: ${usedPrefix}security / ${usedPrefix}sc\n│\n╰─━━━━━━━━━━━━━━─\n\n📡 ${usedPrefix}security protocol\n> Mengaktifkan deteksi otomatis member baru.\n🔎 ${usedPrefix}security check\n> Menampilkan jumlah Unverified dan Blacklist.\n📋 ${usedPrefix}security check unv/bl\n> Menampilkan detail daftar dan tag user.\n👤 ${usedPrefix}security info <reply/tag>\n> Mengecek status satu user.\n🧹 ${usedPrefix}security clear unv/bl\n> Meminta konfirmasi penghapusan.\n📝 ${usedPrefix}security review <tag/reply>\n> Menambahkan member ke daftar pemeriksaan.\n✅ ${usedPrefix}security verify <tag/reply>\n> Memverifikasi member secara manual.\n⏸️ ${usedPrefix}security standby\n> Protocol deteksi otomatis stand by.`)
}

handler.help = ['security', 'sc']
handler.tags = ['group']
handler.command = /^(security|sc)$/i
handler.group = true

export default handler