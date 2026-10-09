import { loadDB, getUserRPG } from '../../lib/waifuHelper.js'
import { BANK_TIERS } from '../../lib/rpg-bankData.js'
import { runRpgVault } from '../../lib/rpgVault.js'

const handler = async (m, { text = '', usedPrefix = '.' }) => {
  const db = loadDB()
  const account = getUserRPG(db, m.sender)
  if (!account?.rpg) return m.reply('❌ Kamu belum memiliki data RPG. Mulai dengan *.adventure*.')

  const tier = BANK_TIERS[Number(account.rpg.bankTier)] || BANK_TIERS[0]
  const args = String(text).trim().split(/\s+/).filter(Boolean)
  return runRpgVault({ m, db, rpg: account.rpg, tier, args, usedPrefix })
}

handler.help = ['vault', 'vault list', 'vault simpan <item> [jumlah]', 'vault ambil <item> [jumlah]']
handler.tags = ['rpg']
handler.command = /^(vault|brankas)$/i
handler.group = true

export default handler
