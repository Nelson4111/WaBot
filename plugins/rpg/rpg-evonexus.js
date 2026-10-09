import { loadDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'

let handler = async (m, { usedPrefix }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return m.reply('❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const rpg = account.rpg
  const tier = BANK_TIERS[Number(rpg.bankTier)] || BANK_TIERS[0]
  if (!tier.fasilitas.includes('Evonexus')) {
    return m.reply('❌ Evonexus terbuka setelah mencapai Eternal Card dan memperoleh fasilitas Evonexus.')
  }

  const interstellarItems = Object.entries(rpg.inventory || {})
    .filter(([itemId, quantity]) => itemId !== 'stellar_credit' && Number(quantity) > 0)
    .reduce((total, [, quantity]) => total + Number(quantity), 0)
  const stats = rpg.evonexus || {}
  return m.reply(
    `╭─❏「 🌌 EVONEXUS 」❏\n` +
    `│ 🌌 *STATISTIK INTERSTELLAR*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `Evonexus adalah pusat statistik dan pengembangan karakter lintas bintang. Saat ini panel hanya menampilkan progres dasar; peningkatan statistik akan dikembangkan berikutnya.\n\n` +
    `📊 *DATA PENJELAJAH*\n` +
    `> ↳ Rank Evonexus : ${stats.rank || 'Awak Baru'}\n` +
    `> ↳ Level interstellar : ${Number(stats.level) || 1}\n` +
    `> ↳ Eksplorasi : ${Number(rpg.interstellarExplores) || 0}\n` +
    `> ↳ Stellar Credit : ${Number(rpg.stellarCredit) || 0} 💠\n` +
    `> ↳ Relik antarbintang : ${interstellarItems}\n` +
    `> ↳ Resonansi : ${Number(stats.resonance) || 0}\n` +
    `> ↳ Peringkat statistik : ${Number(stats.statPoints) || 0} poin\n\n` +
    `🔭 *PENGEMBANGAN MENDATANG*\n` +
    `> ↳ Statistik dapat ditingkatkan melampaui batas RPG biasa.\n` +
    `> ↳ Stellar Credit akan digunakan sebagai resource pengembangan.\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `Akses: *${usedPrefix || '.'}evx* • Eternal Card`
  )
}

handler.help = ['evx', 'evo', 'nexus', 'evonexus']
handler.tags = ['rpg']
handler.command = /^(evx|evo|nexus|evonexus)$/i
handler.group = true

export default handler
