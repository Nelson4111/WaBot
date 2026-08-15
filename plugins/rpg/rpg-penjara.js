import { loadDB, saveDB } from '../../lib/waifuHelper.js'

// FUNGSI CEK DAN BERSIHIN PENJARA YG UDAH HABIS
function cekPenjaraOtomatis(wdb, conn, m) {
    wdb.penjara = wdb.penjara || []
    let bebas = []
    let now = Date.now()

    for(let i = wdb.penjara.length - 1; i >= 0; i--){
        let jid = wdb.penjara[i]
        let userRPG = wdb.users[jid]?.rpg
        if(!userRPG) {
            wdb.penjara.splice(i, 1)
            continue
        }

        if(now - userRPG.penjara >= userRPG.lamaPenjara) {
            let selLama = userRPG.sel
            userRPG.penjara = 0
            userRPG.lamaPenjara = 0
            userRPG.tebusan = 0
            userRPG.sel = 0
            wdb.penjara.splice(i, 1)
            bebas.push({jid, sel: selLama})
        }
    }

    if(bebas.length > 0) {
        saveDB(wdb)
        // KIRIM NOTIF BEBAS
        for(let data of bebas){
            conn.sendMessage(m.chat, {
                text: `✅ *PEMBEBASAN OTOMATIS*\n@${data.jid.split('@')[0]} telah bebas dari *SEL ${data.sel}* karena masa tahanan habis`,
                mentions: [data.jid]
            })
        }
    }
}

let handler = async (m, { conn, args, command }) => {
    const wdb = loadDB()
    wdb.penjara = wdb.penjara || []

    // CEK AUTO BEBAS DULU SETIAP ADA YG NGETIK
    cekPenjaraOtomatis(wdb, conn, m)

    // COMMAND:.TEBUS
    if(command === 'tebus'){
        let who
        if(m.quoted) who = m.quoted.sender
        else if(m.mentionedJid[0]) who = m.mentionedJid[0]
        else if(args[0] === 'sel' && args[1]) {
            let sel = parseInt(args[1])
            who = wdb.penjara[sel - 1]
            if(!who) return m.reply(`❌ Sel ${sel} kosong`)
        } else if(args[0] === 'all') {
            if(wdb.penjara.length === 0) return m.reply('❌ Penjara kosong')
            let total = 0
            let bebas = []
            for(let jid of wdb.penjara){
                let u = wdb.users[jid]?.rpg
                if(u && u.tebusan) total += u.tebusan
            }
            if((wdb.money[m.sender] || 0) < total) return m.reply(`❌ Uang kamu tidak cukup. Butuh Rp ${total.toLocaleString()} untuk bebasin semua`)

            wdb.money[m.sender] -= total
            for(let jid of [...wdb.penjara]){
                let u = wdb.users[jid]?.rpg
                if(u) {
                    u.penjara = 0
                    u.lamaPenjara = 0
                    u.tebusan = 0
                    u.sel = 0
                    bebas.push(`@${jid.split('@')[0]}`)
                }
            }
            wdb.penjara = []
            saveDB(wdb)
            return conn.reply(m.chat, `✅ *PEMBEBASAN MASSAL*\nKamu membayar tebusan total *Rp ${total.toLocaleString()}*\n\nBerhasil membebaskan: ${bebas.join(', ')}`, m, { mentions: [m.sender] })
        } else {
            who = m.sender
        }

        let userRPG = wdb.users[who]?.rpg
        if(!userRPG) return m.reply('❌ Target tidak punya data RPG')

        if (!userRPG.penjara || Date.now() - userRPG.penjara > userRPG.lamaPenjara) {
            return m.reply('❌ Orang ini tidak di penjara')
        }

        let tebusan = userRPG.tebusan || 1000000
        let uang = wdb.money[m.sender] || 0
        if(uang < tebusan) return m.reply(`❌ Uang kamu tidak cukup. Butuh Rp ${tebusan.toLocaleString()}`)

        wdb.money[m.sender] -= tebusan
        wdb.penjara = wdb.penjara.filter(jid => jid!== who)

        let selLama = userRPG.sel
        userRPG.penjara = 0
        userRPG.lamaPenjara = 0
        userRPG.tebusan = 0
        userRPG.sel = 0

        saveDB(wdb)

        if(who === m.sender){
            m.reply(`✅ Kamu membayar tebusan Rp ${tebusan.toLocaleString()}\nSelamat kamu bebas dari *SEL ${selLama}*!`)
        } else {
            conn.reply(m.chat, `✅ @${m.sender.split('@')[0]} telah membayar tebusan Rp ${tebusan.toLocaleString()} untuk @${who.split('@')[0]}\nDia sudah bebas dari *SEL ${selLama}*!`, m, { mentions: [m.sender, who] })
        }
        return
    }

    // COMMAND:.PENJARA
    if(wdb.penjara.length === 0) return m.reply('🏛️ *PENJARA KOTA*\n\nPenjara saat ini kosong. Kota aman.')

    let cap = `╭───「 🚔 DAFTAR NARAPIDANA 」───╮\n`
    cap += `│ *TOTAL: ${wdb.penjara.length} ORANG* │\n`
    cap += `╰─────────────────────────╯\n\n`

    let mentioned = []
    for(let i = 0; i < wdb.penjara.length; i++){
        let jid = wdb.penjara[i]
        let userRPG = wdb.users[jid]?.rpg
        if(!userRPG) continue

        mentioned.push(jid)
        let sisa = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
        let jam = Math.floor(sisa / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        if(sisa < 0) { jam = 0; menit = 0 }

        let kasus = 'Lainnya'
        if(userRPG.tebusan === 1000000) kasus = 'Copet'
        else if(userRPG.tebusan === 2000000) kasus = 'Begal/Bunuh'
        else if(userRPG.tebusan === 4000000) kasus = 'Rampok'

        cap += `┌─[ SEL ${i + 1} ]\n`
        cap += `│ 👤 @${jid.split('@')[0]}\n`
        cap += `│ ⏰ Sisa: ${jam}j ${menit}m\n`
        cap += `│ 💰 Tebusan: Rp ${userRPG.tebusan.toLocaleString()}\n`
        cap += `│ 📝 Kasus: ${kasus}\n`
        cap += `└───────────────────\n\n`
    }

    cap += `💡 *CARA BEBASIN*\n`
    cap += `• *.tebus* - Bebasin diri sendiri\n`
    cap += `• *.tebus @tag* - Bebasin orang\n`
    cap += `• *.tebus sel 2* - Bebasin berdasarkan sel\n`
    cap += `• *.tebus all* - Bebasin semua narapidana`

    return conn.reply(m.chat, cap, m, { mentions: mentioned })
}

handler.help = ['penjara', 'tebus (@tag/sel angka/all)']
handler.tags = ['rpg']
handler.command = /^(penjara|tebus)$/i
handler.group = true
export default handler