import { loadDB, getUserRPG, saveDB, sendRpgMsg } from '../../lib/waifuHelper.js'

function formatNama(nama) {
  return nama.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const resepEmoji = {
  'roti_tawar': '🍞','mie_goreng': '🍜','sate_ikan': '🍢','salad_buah': '🥗','sup_ikan': '🍲','taco_ikan': '🌮',
  'udang_goreng': '🍤','jus_durian': '🥛','cumi_goreng': '🦑','wine': '🍷','kepiting_rebus': '🦀','sushi': '🍣',
  'sashimi': '🍣','lobster_bakar': '🦞','tuna_panggang': '🐟','salmon_asap': '🐟','steak_hiu': '🦈','pari_bakar': '🛸',
  'penyu_panggang': '🐢','steak_emas': '🥩','diamond_cake': '🎂','sop_kraken': '🦑','sate_megalodon': '🦈',
  'sup_leviathan': '🐉','sea_dragon_grill': '🐲','hydra_stew': '🐍','kura_titan_soup': '🐢','paus_putih_steak': '🐋',
  'naga_laut_bakar': '🐉','raja_ubur_jelly': '🪼','steak_godzilla': '🦖'
}

let handler = async (m, { conn, usedPrefix }) => {
  const wdb = loadDB()
  let data = getUserRPG(wdb, m.sender)
  let user = data.rpg
  if (!user) return m.reply('❌ Kamu belum memiliki data RPG.')

  user.masakan = user.masakan || {}

  // 1. MIGRASI DATA LAMA: "roti tawar" -> "roti_tawar"
  let isChanged = false
  let masakanBaru = {}
  for(let nama in user.masakan){
    let keyBaru = nama.replace(/ /g, '_')
    if(user.masakan[nama] > 0){
      masakanBaru[keyBaru] = (masakanBaru[keyBaru] || 0) + user.masakan[nama]
      if(keyBaru!== nama) isChanged = true
    }
  }
  if(isChanged){
    user.masakan = masakanBaru
    saveDB(wdb) // simpan hasil migrasi
  }

  let totalItem = 0
  let totalJenis = 0
  let listMasakan = []

  // 2. AMBIL SEMUA DARI user.masakan
  for(let nama in user.masakan){
    if(user.masakan[nama] > 0){
      totalItem += user.masakan[nama]
      totalJenis++
      listMasakan.push({
        nama,
        emoji: resepEmoji[nama] || '🍽️',
        jml: user.masakan[nama]
      })
    }
  }

  if(totalJenis === 0)
    return m.reply('┌───❏「 🧊 KULKAS KOSONG 」❏\n│\n│ _Perut keroncongan... Masak dulu yuk!_\n│\n│ 💡 Masak: *.masak [nama]*\n└───────────────────')

  // URUTIN DARI PALING BANYAK
  listMasakan.sort((a,b) => b.jml - a.jml)

  let cap = `┌───❏「 🧊 KULKAS PRIBADI 」❏\n`
  cap += `│ 👤 Owner : ${m.pushName}\n`
  cap += `│ 📦 Total : ${totalItem.toLocaleString()} Porsi\n`
  cap += `│ 🧬 Jenis : ${totalJenis} Macam\n`
  cap += `└───────────────────\n\n`

  cap += `┌───❏「 🍽️ STOK MAKANAN 」❏\n`
  listMasakan.forEach((v, i) => {
    cap += `│ ${i+1}. ${v.emoji} ${formatNama(v.nama).padEnd(18)} x${v.jml.toLocaleString()}\n`
  })
  cap += `└───────────────────\n\n`

  cap += `😋 *Makan:* ${usedPrefix}makan sushi\n`
  cap += `💞 *Traktir:* ${usedPrefix}makan sushi @tag\n`
  cap += `🍳 *Masak Lagi:* ${usedPrefix}masak [nama]`

  return sendRpgMsg(conn, m, cap, 'https://c.termai.cc/i108/l3q')
}

handler.help = ['kulkas']
handler.tags = ['rpg']
handler.command = /^(kulkas)$/i
handler.group = true
export default handler