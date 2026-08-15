import { loadDB, saveDB, getUserRPG } from '../../lib/waifuHelper.js'
import { hewanList, dapatkanHasil, listHybrid, getHewan } from '../../lib/rpg-libternakData.js'

let handler = async (m, { args }) => {
  const wdb = loadDB()
  let user = getUserRPG(wdb, m.sender).rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')
  if(!user.ternak) user.ternak = {}
  if(!user.inventory) user.inventory = {}

  // AUTO MIGRASI KEY LOWERCASE BUAT DATA LAMA
  let needSave = false
  for(let key in user.ternak){
    let keyLower = key.toLowerCase()
    if(key!== keyLower){
      user.ternak[keyLower] = (user.ternak[keyLower] || 0) + user.ternak[key]
      delete user.ternak[key]
      needSave = true
    }
  }
  if(needSave) saveDB(wdb) // save 1x pas migrasi

  let [sub, hewan1, jml] = args
  hewan1 = hewan1?.toLowerCase()
  jml = parseInt(jml) || 1

  if(!sub || sub === 'kandang') {
    if(Object.keys(user.ternak).length === 0) return m.reply('┌───❏「 🏡 KANDANG KOSONG 」❏\n│\n│ Belum punya ternak\n│.ternak beli\n└───────────────────')
    let txt = '┌───❏「 🏡 KANDANG 」❏\n│\n'
    for(let h in user.ternak) {
      let data = getHewan(h)
      if(data) txt += `│ ${data.emoji} ${data.nama} [E${data.evolusi}]: ${user.ternak[h]}\n`
    }
    txt += `│\n│ 💵 Uang: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n│ ✨ Exp: ${user.exp || 0}\n│\n│.ternak beli | ambil | sembelih | jual | list | hybrid\n└───────────────────`
    return m.reply(txt)
  }

  //... sisanya sama kayak file yg tadi aku kirim
  if(sub === 'list') {
    let txt = '┌───❏「 🛒 PASAR TERNAK 」❏\n│\n'
    for(let k in hewanList) {
      let h = hewanList[k]
      let harga = h.hargaBibit === 0? 'Hasil Kawin' : `Rp ${h.hargaBibit.toLocaleString()}`
      txt += `│ ${h.emoji} ${h.nama} [E${h.evolusi}]\n│ Bibit: ${harga}\n│\n`
    }
    return m.reply(txt + '│.kawin [hewan1] [hewan2]\n└───────────────────')
  }
  if(sub === 'hybrid') return m.reply(listHybrid())
  if(sub === 'beli') {
    let h = getHewan(hewan1)
    if(!h) return m.reply('❌ Hewan tidak ada')
    if(h.hargaBibit === 0) return m.reply('❌ Hewan ini hanya bisa didapat dari kawin')
    let total = h.hargaBibit * jml
    if((wdb.money[m.sender] || 0) < total) return m.reply(`❌ Uang kurang: Rp ${total.toLocaleString()}`)
    wdb.money[m.sender] -= total
    let key = h.nama.toLowerCase()
    user.ternak[key] = (user.ternak[key] || 0) + jml
    saveDB(wdb)
    return m.reply(`┌───❏「 🛒 PEMBELIAN BERHASIL 」❏\n│\n│ ${h.emoji} ${h.nama} x${jml}\n│ 💰 Harga: Rp ${total.toLocaleString()}\n│\n│ 💵 Saldo: Rp ${(wdb.money[m.sender] || 0).toLocaleString()}\n└───────────────────`)
  }
  if(sub === 'ambil') {
    let h = getHewan(hewan1)
    if(!h ||!user.ternak[hewan1]) return m.reply('❌ Kamu tidak punya hewan itu')
    let hasil = dapatkanHasil(h).ambil
    user.inventory[hasil] = (user.inventory[hasil] || 0) + user.ternak[hewan1]
    let exp = h.exp * user.ternak[hewan1]
    user.exp += exp
    saveDB(wdb)
    return m.reply(`┌───❏「 🌾 HASIL PANEN 」❏\n│\n│ ${h.emoji} ${h.nama} x${user.ternak[hewan1]}\n│ 🎁 ${hasil} x${user.ternak[hewan1]}\n│ ✨ +${exp} Exp\n│ 💚 Hewan tetap hidup\n└───────────────────`)
  }
  if(sub === 'sembelih') {
    let h = getHewan(hewan1)
    if(!h ||!user.ternak[hewan1]) return m.reply('❌ Kamu tidak punya hewan itu')
    let punya = user.ternak[hewan1]
    let sembelih = Math.min(jml, punya)
    let hasil = dapatkanHasil(h).sembelih
    user.inventory[hasil] = (user.inventory[hasil] || 0) + sembelih
    user.ternak[hewan1] -= sembelih
    if(user.ternak[hewan1] <= 0) delete user.ternak[hewan1]
    saveDB(wdb)
    return m.reply(`┌───❏「 🔪 PENYEMBELIHAN 」❏\n│\n│ ${h.emoji} ${h.nama} x${sembelih}\n│ 🍖 ${hasil} x${sembelih}\n└───────────────────`)
  }
  if(sub === 'jual') {
    let item = hewan1
    if(!user.inventory[item]) return m.reply('❌ Item tidak ada di inventory')
    let hargaItem = 1000
    let total = hargaItem * jml
    user.inventory[item] -= jml
    if(user.inventory[item] <= 0) delete user.inventory[item]
    wdb.money[m.sender] += total
    saveDB(wdb)
    return m.reply(`┌───❏「 💰 PENJUALAN 」❏\n│\n│ ${item} x${jml}\n│ 💵 +Rp ${total.toLocaleString()}\n└───────────────────`)
  }
}
handler.help = ['ternak']
handler.tags = ['rpg']
handler.command = /^(ternak)$/i
handler.group = true
export default handler