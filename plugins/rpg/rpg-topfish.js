import { loadDB, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'
import { filterRpgPanelUsers, isValidRpgUserId } from '../../lib/rpgLeaderboard.js'
import { filterLeaderboardUsers, getLeaderboardUserIdentity } from '../../lib/leaderboardPrivacy.js'
import { ensureFishDetails, getAllFishRecords, migrateAllFishDetails } from '../../lib/rpg-fishSizes.js'
import { ikanEmoji } from '../../lib/rpg-fishCatalog.js'

const formatNama = name => String(name || '')
  .replace(/^ikan[_\s]+/i, '')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, letter => letter.toUpperCase())

let handler = async (m, { conn, groupMetadata }) => {
  const wdb = loadDB()
  let migrated = false
  if (!wdb.data.fishSizeMigrationV1) {
    migrated = migrateAllFishDetails(wdb)
    wdb.data.fishSizeMigrationV1 = Date.now()
    migrated = true
  }
  const users = filterLeaderboardUsers(
    filterRpgPanelUsers(Object.keys(wdb.users).filter(id => wdb.users[id]?.rpg)),
    conn
  ).filter(isValidRpgUserId)
  let best = null
  for (const id of users) {
    const user = wdb.users[id].rpg
    if (ensureFishDetails(user)) migrated = true
    for (const fish of getAllFishRecords(user)) {
      if (!best || fish.weight > best.fish.weight) best = { id, fish }
    }
  }
  if (migrated) await saveDB(wdb)
  if (!best) return m.reply('Belum ada ikan berukuran yang tercatat di aquarium pemain.')

  const identity = getLeaderboardUserIdentity(best.id, {
    conn,
    groupMetadata,
    name: conn.getName(best.id)
  })
  const fish = best.fish
  const emoji = ikanEmoji[fish.name] || ikanEmoji[`ikan_${fish.name}`] || '🐟'
  const caption =
    `╭─❏「 🏆 TOP FISH AVELIA 」❏\n` +
    `│ 🌊 Pemilik ikan terbesar\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `🥇 *${identity.display}*\n` +
    `> ↳ ${emoji} *${formatNama(fish.name)}*\n` +
    `> ↳ Ukuran: *${fish.size.toUpperCase()} · ${fish.weight.toFixed(2)} Kg*\n\n` +
    `─━━━━━━━━━━━━━━─\n` +
    `🐠 Rawat koleksi dan pamerkan ikan terbesarmu di aquarium!`
  return sendRpgMsg(conn, m, caption, 'https://files.cloudkuimages.guru/images/e0684787315c.jpeg')
}

handler.help = ['topfish']
handler.tags = ['rpg']
handler.command = /^(topfish)$/i
handler.group = true
export default handler
