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

  // cari pet level tertinggi
  let petTertinggi = null
  if(user.pets && user.pets.length > 0){
    petTertinggi = user.pets.sort((a,b) => b.level - a.level)[0]
  } else if(user.pet && user.pet.tipe!== 'none'){
    petTertinggi = user.pet
  }

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
  cap += `🐾 Pet: ${petTertinggi? `${petTertinggi.tipe.toUpperCase()} (Lv.${petTertinggi.level})` : 'Tidak ada'}\n\n`

  cap += `*───「 STORAGE 」───*\n`
  cap += `💎 Diamond: ${user.diamond || 0}\n`
  cap += `⛓️ Iron: ${user.iron || 0}\n`
  cap += `✨ Gold: ${user.gold || 0}\n`
  cap += `🪵 Wood: ${user.wood || 0}\n`
  cap += `🪨 Stone: ${user.stone || 0}\n`
  cap += `_Lihat lengkap: *.tas*_\n\n`

  if (user.ikan) {
    cap += `*───「 FISH TANK 」───*\n`
    cap += `🐟 Lele: ${user.ikan.lele || 0}\n`
    cap += `🐠 Nila: ${user.ikan.nila || 0}\n`
    cap += `🦈 Hiu: ${user.ikan.hiu || 0}\n`
    cap += `🐡 Bawal: ${user.ikan.bawal || 0}\n`
    cap += `_Lihat lengkap: *.aquarium*_\n\n`
  }

  if (user.hasilKebun) {
    cap += `*───「 GARDEN HARVEST 」───*\n`
    cap += `🌾 Padi: ${user.hasilKebun.padi || 0}\n`
    cap += `🌽 Jagung: ${user.hasilKebun.jagung || 0}\n`
    cap += `🍉 Semangka: ${user.hasilKebun.semangka || 0}\n`
    cap += `🍊 Jeruk: ${user.hasilKebun.jeruk || 0}\n`
    cap += `🥭 Mangga: ${user.hasilKebun.mangga || 0}\n`
    cap += `🍎 Apel: ${user.hasilKebun.apel || 0}\n`
    cap += `🌳 Durian: ${user.hasilKebun.durian || 0}\n`
    cap += `⚜️ Emas: ${user.hasilKebun.emas || 0}\n`
    cap += `_Lihat lengkap: *.kebun*_\n\n`
  }

  cap += `*───「 INVENTORY LAINNYA 」───*\n`
  cap += `📦 Cek Semua: *.gudang*\n`
  cap += `⛏️ Cek Ore: *.tas*\n`
  cap += `🍖 Cek Makanan: *.makan*\n`
  cap += `🐾 Cek Pet: *.pet*\n`
  cap += `🐠 Cek Aquarium: *.aquarium*\n`
  cap += `🌾 Cek Kebun: *.kebun*`

  return sendRpgMsg(conn, m, cap, pp)
}

handler.help = ['inventory']
handler.tags = ['rpg']
handler.command = /^(inv|inventory)$/i
export default handler