import { loadDB, saveDB, getUserRPG, initLadang, sendRpgMsg, getEquipmentName } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

let handler = async (m, { conn }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  initLadang(user)
  if(!user.inventory) user.inventory = {}

  let isChanged = false

  // MIGRASI DATA LAMA: hasilKebun -> inventory biar sinkron sama kebun.js
  const itemKebun = ['padi','jagung','semangka','jeruk','mangga','apel_merah','apel_hijau','apel','durian','emas','berlian','diamond']
  if(user.hasilKebun){
    for(let item in user.hasilKebun){
      if(user.hasilKebun[item] > 0){
        let key = item.replace(/ /g, '_')
        if(key === 'apel') key = 'apel_merah' // apel lama = apel_merah
        if(key === 'diamond') key = 'berlian' // diamond kebun lama = berlian
        if(itemKebun.includes(key)){
          user.inventory[key] = (user.inventory[key] || 0) + user.hasilKebun[item]
          isChanged = true
        }
      }
    }
    delete user.hasilKebun // hapus biar gak dobel
  }

  // Migrasi khusus item panen diamond di inventory menjadi berlian
  if(user.inventory.diamond && user.inventory.diamond > 0) {
    user.inventory.berlian = (user.inventory.berlian || 0) + user.inventory.diamond
    delete user.inventory.diamond
    isChanged = true
  }

  if(isChanged) saveDB(wdb)

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
  cap += `🗡️ *Weapon:* ${user.sword ? getEquipmentName('sword', user.sword) : 'Tidak Ada'}\n`
  cap += `🛡️ *Armor:* ${user.armor ? getEquipmentName('armor', user.armor) : 'Tidak Ada'}\n`
  cap += `⛏️ *Pickaxe:* ${user.pickaxe ? getEquipmentName('pickaxe', user.pickaxe) : 'Tidak Ada'}\n`
  cap += `🎣 *Rod:* ${user.fishingrod ? getEquipmentName('fishingrod', user.fishingrod) : 'Tidak Ada'}\n`
  cap += `🐾 *Pet:* ${petTertinggi ? `${petTertinggi.tipe.toUpperCase()} (Lv.${petTertinggi.level})` : 'Tidak Ada'}\n\n`

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

  // GARDEN HARVEST: AMBIL DARI INVENTORY KHUSUS ITEM KEBUN
  let totalKebun = 0
  const cek = {
    padi: user.inventory.padi || 0,
    jagung: user.inventory.jagung || 0,
    semangka: user.inventory.semangka || 0,
    jeruk: user.inventory.jeruk || 0,
    mangga: user.inventory.mangga || 0,
    apel: (user.inventory.apel_merah || 0) + (user.inventory.apel_hijau || 0), // apel digabung
    durian: user.inventory.durian || 0,
    emas: user.inventory.emas || 0,
    berlian: user.inventory.berlian || 0
  }
  for(let i in cek) totalKebun += cek[i]

  if (totalKebun > 0) {
    cap += `*───「 GARDEN HARVEST 」───*\n`
    cap += `🌾 Padi: ${cek.padi.toLocaleString()}\n`
    cap += `🌽 Jagung: ${cek.jagung.toLocaleString()}\n`
    cap += `🍉 Semangka: ${cek.semangka.toLocaleString()}\n`
    cap += `🍊 Jeruk: ${cek.jeruk.toLocaleString()}\n`
    cap += `🥭 Mangga: ${cek.mangga.toLocaleString()}\n`
    cap += `🍎 Apel: ${cek.apel.toLocaleString()}\n`
    cap += `🌳 Durian: ${cek.durian.toLocaleString()}\n`
    cap += `⚜️ Emas: ${cek.emas.toLocaleString()}\n`
    if (cek.berlian > 0) cap += `💠 Berlian: ${cek.berlian.toLocaleString()}\n`
    cap += `_Lihat lengkap: *.kebun*_\n\n`
  }

  cap += `*───「 INVENTORY LAINNYA 」───*\n`
  cap += `📦 Cek Semua: *.gudang*\n`
  cap += `⛏️ Cek Material: *.tas*\n`
  cap += `🍖 Cek Makanan: *.kulkas*\n`
  cap += `🐾 Cek Peliharaan: *.pet*\n`
  cap += `🐠 Cek Aquarium: *.aquarium*\n`
  cap += `🌾 Cek Kebun: *.kebun*`

  return sendRpgMsg(conn, m, cap, pp)
}

handler.help = ['inventory']
handler.tags = ['rpg']
handler.command = /^(inv|inventory)$/i
export default handler