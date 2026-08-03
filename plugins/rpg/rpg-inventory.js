import { loadDB, saveDB, getUserRPG, initLadang, sendRpgMsg } from '../../lib/waifuHelper.js'

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)

  let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
  let threshold = user.level * 500
  let armorLvl = user.armor || 0
  let maxHP = 100 + (armorLvl * 20) 

  let cap = `*───「 RPG INVENTORY 」───*\n\n`
  cap += `👤 *Pemain:* ${m.pushName}\n`
  cap += `🆙 *Level:* ${user.level} (${user.exp}/${threshold} XP)\n`
  cap += `❤️ *Darah:* ${user.darah}/${maxHP}\n`
  cap += `💰 *Saldo:* Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n\n`

  cap += `*───「 EQUIPMENT 」───*\n`
  cap += `🗡️ Sword: Lv.${user.sword || 0}\n`
  cap += `🛡️ Armor: Lv.${user.armor || 0}\n`
  cap += `⛏️ Pickaxe: Lv.${user.pickaxe || 0}\n`
  cap += `🎣 Fishingrod: Lv.${user.fishingrod || 0}\n`
  cap += `🐾 Pet: ${user.pet?.tipe !== 'none' ? `${user.pet?.tipe?.toUpperCase()} (Lv.${user.pet?.level})` : 'Tidak ada'}\n\n`

  cap += `*───「 STORAGE 」───*\n`
  cap += `💎 *Diamond: ${user.diamond || 0}*\n`
  cap += `⛓️ Iron: ${user.iron || 0}  |  ✨ Gold: ${user.gold || 0}\n`
  cap += `🪵 Wood: ${user.wood || 0}  |  🪨 Stone: ${user.stone || 0}\n\n`

  if (user.ikan) {
    cap += `*───「 FISH TANK 」───*\n`
    cap += `🐟 Lele: ${user.ikan.lele || 0}  |  🐠 Nila: ${user.ikan.nila || 0}\n`
    cap += `🦈 Hiu: ${user.ikan.hiu || 0}  |  🐡 Bawal: ${user.ikan.bawal || 0}\n\n`
  }

  if (user.hasilKebun) {
    cap += `*───「 GARDEN HARVEST 」───*\n`
    cap += `🌾 Padi: ${user.hasilKebun.padi || 0}  |  🌽 Jagung: ${user.hasilKebun.jagung || 0}\n`
    cap += `🍉 Semangka: ${user.hasilKebun.semangka || 0}  |  🍊 Jeruk: ${user.hasilKebun.jeruk || 0}\n`
    cap += `🥭 Mangga: ${user.hasilKebun.mangga || 0}  |  🍎 Apel: ${user.hasilKebun.apel || 0}\n`
    cap += `🌳 Durian: ${user.hasilKebun.durian || 0}  |  ⚜️ Emas: ${user.hasilKebun.emas || 0}\n\n`
  }

  cap += `_Ketik .jual [item] untuk menukar barang dengan uang._`

  return sendRpgMsg(conn, m, cap, pp)
}

handler.help = ['inventory']
handler.tags = ['rpg']
handler.command = /^(inv|inventory)$/i

export default handler