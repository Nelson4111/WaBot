import { loadDB, saveDB } from '../../lib/waifuHelper.js'

let secret = ['poseidon', 'flying dutchman', 'aquaman', 'godzilla', 'zeus laut', 'atlas laut', 'kitsune laut', 'leviathan primordial', 'davy jones', 'caylpso', 'ariel little mermaid', 'treasure chest', 'ancient relic', 'pirate gold', 'mermaid tear']; // PAKE SPASI

let handler = async (m, { conn }) => {
  // Pengecekan owner sudah dihandle oleh handler.js melalui handler.owner = true
  const wdb = loadDB()
  let totalUser = 0
  let totalIkan = 0

  for(let id in wdb.users){
    let u = wdb.users[id].rpg
    if(!u ||!u.ikan) continue

    let kehapus = 0
    for(let namaIkan in u.ikan){
      if(secret.includes(namaIkan)){ // ini bakal match sama data lama yg spasi
        totalIkan += u.ikan[namaIkan]
        kehapus += u.ikan[namaIkan]
        delete u.ikan[namaIkan]
      }
    }
    if(kehapus > 0) totalUser++
  }

  saveDB(wdb)
  m.reply(`✅ BERES\n🧹 ${totalUser} user dibersihkan\n🐟 ${totalIkan} ikan SECRET dihapus permanen`)
}
handler.help = ['bersihsecret']
handler.tags = ['owner']
handler.command = /^(bersihsecret)$/i
handler.owner = true
export default handler