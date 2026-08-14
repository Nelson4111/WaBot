import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let secret = ['poseidon', 'flying dutchman', 'aquaman', 'godzilla', 'zeus laut', 'atlas laut', 'kitsune laut', 'leviathan primordial', 'davy jones', 'caylpso', 'ariel little mermaid', 'treasure chest', 'ancient relic', 'pirate gold', 'mermaid tear']; // PAKE SPASI

let handler = async (m, { conn }) => {
  if(!global.owner.includes(m.sender)) return m.reply('❌ Khusus owner')

  const wdb = loadDB()
  let totalUser = 0
  let totalIkan = 0

  // bikin list nama yg mau dihapus: spasi + underscore
  let secretList = []
  secret.forEach(nama => {
    secretList.push(nama) // versi spasi
    secretList.push(nama.replace(/ /g, '_')) // versi underscore
  })

  for(let id in wdb.users){
    let u = wdb.users[id].rpg
    if(!u ||!u.ikan) continue

    let kehapus = 0
    for(let namaIkan in u.ikan){
      if(secretList.includes(namaIkan)){ // cek spasi & underscore
        totalIkan += u.ikan[namaIkan]
        kehapus += u.ikan[namaIkan]
        delete u.ikan[namaIkan]
      }
    }
    if(kehapus > 0) totalUser++
  }

  saveDB(wdb)
  m.reply(`✅ BERES\n🧹 ${totalUser} user dibersihkan\n🐟 ${totalIkan} ikan SECRET dihapus permanen\n\n_Versi spasi & underscore sudah dihapus semua_`)
}
handler.help = ['bersihsecret']
handler.tags = ['owner']
handler.command = /^(bersihsecret)$/i
handler.owner = true
export default handler