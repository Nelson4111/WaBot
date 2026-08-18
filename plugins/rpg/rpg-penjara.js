import { loadDB, saveDB } from '../../lib/waifuHelper.js'

function isDiPenjara(wdb, jid) {
    let userRPG = wdb.users[jid]?.rpg
    if(!userRPG ||!userRPG.penjara) return { status: false }
    if(Date.now() - userRPG.penjara >= userRPG.lamaPenjara) return { status: false }
    let sisa = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
    let jam = Math.floor(sisa / 3600000)
    let menit = Math.floor((sisa % 3600000) / 60000)
    return { status: true, sel: userRPG.sel, sisa: `${jam}j ${menit}m`, tebusan: userRPG.tebusan }
}

function cekPenjaraOtomatis(wdb, conn, m) {
    wdb.penjara = wdb.penjara || []
    let bebas = []
    let now = Date.now()
    for(let i = wdb.penjara.length - 1; i >= 0; i--){
        let jid = wdb.penjara[i]
        let userRPG = wdb.users[jid]?.rpg
        if(!userRPG) { wdb.penjara.splice(i, 1); continue }
        if(userRPG.penjara && now - userRPG.penjara >= userRPG.lamaPenjara) {
            let selLama = userRPG.sel
            userRPG.penjara = null; userRPG.lamaPenjara = 0; userRPG.tebusan = 0; userRPG.sel = 0; userRPG.gagalCopet = 0
            wdb.penjara.splice(i, 1)
            bebas.push({jid, sel: selLama})
        }
    }
    if(bebas.length > 0) {
        saveDB(wdb)
        for(let data of bebas){
            conn.sendMessage(m.chat, { text: `[ 🚔 ]───[ *_PEMBEBASAN_* ]───✦\n╭ 𖥔 @${data.jid.split('@')[0]} bebas dari SEL ${data.sel}\n╰ 𖥔 Masa tahanan habis`, mentions: [data.jid] })
        }
    }
}

function getKasus(tebusan){
    if(tebusan === 1000000) return '🤏 Copet'
    if(tebusan === 5000000) return '🏴‍☠️ Begal / 🔪 Bunuh'
    if(tebusan === 10000000) return '🕵️ Rampok'
    return '👑 Owner Jail'
}

let handler = async (m, { conn, args, command, usedPrefix, isOwner }) => {
    const wdb = loadDB()
    wdb.penjara = wdb.penjara || []
    wdb.users = wdb.users || {}
    wdb.money = wdb.money || {}
    cekPenjaraOtomatis(wdb, conn, m)

    const resolveTarget = (raw) => {
        let jid = m.mentionedJid?.[0] || m.quoted?.sender
        if (!jid && raw) {
            let num = raw.replace(/[^0-9]/g, '')
            if (num.startsWith('08')) num = '628' + num.slice(2)
            if (num.length >= 8) jid = num + '@s.whatsapp.net'
        }
        if (jid && jid.endsWith('@lid')) {
            jid = global.lids?.[jid] || global.db?.data?.lids?.[jid] || jid
        }
        return jid
    }

    // ===== FITUR OWNER: penjarain =====
    if(command === 'penjarain'){
        if(!isOwner) return m.reply('❌ Khusus Owner')
        let who, menit, tebusan
        if(m.quoted){
            who = resolveTarget()
            menit = parseInt(args[0]) || 30
            tebusan = parseInt(args[1]) || 1000000
        } else {
            who = resolveTarget(args[0])
            menit = parseInt(args[1]) || 30
            tebusan = parseInt(args[2]) || 1000000
        }
        if(!who) return m.reply(`*Format:* ${usedPrefix}penjarain @tag <menit> <tebusan>\n*Contoh:* ${usedPrefix}penjarain @628xxx 60 5000000`)
        if(isNaN(menit) || menit < 1) menit = 30
        if(isNaN(tebusan) || tebusan < 0) tebusan = 1000000

        if(!global.db.data.users[who]) global.db.data.users[who] = {}
        if(!global.db.data.users[who].rpg) global.db.data.users[who].rpg = {}
        let userRPG = global.db.data.users[who].rpg

        if(userRPG.penjara) return m.reply('❌ Orang ini sudah di penjara')

        let selBaru = wdb.penjara.length + 1
        userRPG.penjara = Date.now()
        userRPG.lamaPenjara = menit * 60000
        userRPG.tebusan = tebusan
        userRPG.sel = selBaru
        userRPG.gagalCopet = 0
        wdb.penjara.push(who)
        saveDB(wdb)

        return conn.reply(m.chat, `[ 🚔 ]───[ *_OWNER JAIL_* ]───✦\n╭ 𖥔 Target : @${who.split('@')[0]}\n│ 𖥔 SEL : ${selBaru}\n│ 𖥔 Durasi : ${menit} menit\n│ 𖥔 Tebusan : Rp ${tebusan.toLocaleString('id-ID')}\n╰ 𖥔 Dipenjara oleh Owner`, m, { mentions: [who] })
    }

    // ===== FITUR OWNER: BEBASIN =====
    if(command === 'bebasin'){
        if(!isOwner) return m.reply('❌ Khusus Owner')
        let who
        if(m.quoted || m.mentionedJid?.[0]) who = resolveTarget()
        else if(args[0] === 'sel' && args[1]) {
            let sel = parseInt(args[1])
            who = wdb.penjara[sel - 1]
            if(!who) return m.reply(`❌ Sel ${sel} kosong`)
        } else if(args[0] === 'all'){
            if(wdb.penjara.length === 0) return m.reply('🏛️ Penjara kosong')
            let bebas = []
            for(let jid of [...wdb.penjara]){
                let u = wdb.users[jid]?.rpg
                if(u){ u.penjara = null; u.lamaPenjara = 0; u.tebusan = 0; u.sel = 0; u.gagalCopet = 0; bebas.push(`@${jid.split('@')[0]}`) }
            }
            wdb.penjara = []
            saveDB(wdb)
            return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN OWNER_* ]───✦\n╭ 𖥔 Total : ${bebas.length} orang\n│ 𖥔 Bebas : ${bebas.join(', ')}\n╰ 𖥔 Oleh Owner`, m, { mentions: [m.sender] })
        } else if (args[0]) {
            who = resolveTarget(args[0])
        } else {
            return m.reply(`*Format:* ${usedPrefix}bebasin @tag / ${usedPrefix}bebasin sel 2 / ${usedPrefix}bebasin all`)
        }

        let userRPG = wdb.users[who]?.rpg
        if(!userRPG ||!userRPG.penjara) return m.reply('❌ Orang ini tidak di penjara')

        let selLama = userRPG.sel
        userRPG.penjara = null; userRPG.lamaPenjara = 0; userRPG.tebusan = 0; userRPG.sel = 0; userRPG.gagalCopet = 0
        wdb.penjara = wdb.penjara.filter(jid => jid!== who)
        saveDB(wdb)

        return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN OWNER_* ]───✦\n╭ 𖥔 Owner : @${m.sender.split('@')[0]}\n│ 𖥔 Target : @${who.split('@')[0]}\n╰ 𖥔 Bebas dari SEL ${selLama}!`, m, { mentions: [m.sender, who] })
    }

    // ===== TEBUS BIASA =====
    if(command === 'tebus'){
        let who
        if(m.quoted || m.mentionedJid?.[0]) who = resolveTarget()
        else if(args[0] === 'sel' && args[1]) {
            let sel = parseInt(args[1])
            who = wdb.penjara[sel - 1]
            if(!who) return m.reply(`❌ Sel ${sel} kosong`)
        } else if(args[0] === 'all') {
            if(wdb.penjara.length === 0) return m.reply('🏛️ Penjara kosong')
            let total = 0, bebas = []
            for(let jid of wdb.penjara){ if(jid === m.sender) continue; let u = wdb.users[jid]?.rpg; if(u && u.tebusan) total += u.tebusan }
            if((wdb.money[m.sender] || 0) < total) return m.reply(`❌ Uang tidak cukup. Butuh Rp ${total.toLocaleString()}`)
            if(total === 0) return m.reply('❌ Tidak ada orang lain di penjara')
            wdb.money[m.sender] -= total
            for(let jid of [...wdb.penjara]){ if(jid === m.sender) continue; let u = wdb.users[jid]?.rpg; if(u) { u.penjara = null; u.lamaPenjara = 0; u.tebusan = 0; u.sel = 0; u.gagalCopet = 0; bebas.push(`@${jid.split('@')[0]}`) } }
            wdb.penjara = wdb.penjara.filter(jid => jid === m.sender)
            saveDB(wdb)
            return conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN MASSAL_* ]───✦\n╭ 𖥔 Total : Rp ${total.toLocaleString()}\n│ 𖥔 Bebas : ${bebas.join(', ')}\n╰ 𖥔 Berhasil`, m, { mentions: [m.sender] })
        } else if(args[0]) {
            who = resolveTarget(args[0])
        } else {
            return m.reply(`[ 🚔 ]───[ *_GAGAL_* ]───✦\n╭ 𖥔 Kamu tidak bisa tebus diri sendiri\n│ 𖥔 Minta *.tebus @kamu*\n╰ 𖥔 Atau tunggu bebas otomatis`)
        }
        if(who === m.sender) return m.reply(`[ 🚔 ]───[ *_GAGAL_* ]───✦\n╭ 𖥔 Kamu tidak bisa tebus diri sendiri\n│ 𖥔 Minta *.tebus @kamu*\n╰ 𖥔 Atau tunggu bebas otomatis`)
        let userRPG = wdb.users[who]?.rpg
        if(!userRPG) return m.reply('❌ Target tidak punya data RPG')
        if (!userRPG.penjara || Date.now() - userRPG.penjara > userRPG.lamaPenjara) return m.reply('❌ Orang ini tidak di penjara')
        let tebusan = userRPG.tebusan || 1000000
        let uang = wdb.money[m.sender] || 0
        if(uang < tebusan) return m.reply(`❌ Uang tidak cukup. Butuh Rp ${tebusan.toLocaleString()}`)
        wdb.money[m.sender] -= tebusan
        wdb.penjara = wdb.penjara.filter(jid => jid!== who)
        let selLama = userRPG.sel
        userRPG.penjara = null; userRPG.lamaPenjara = 0; userRPG.tebusan = 0; userRPG.sel = 0; userRPG.gagalCopet = 0
        saveDB(wdb)
        conn.reply(m.chat, `[ 🚔 ]───[ *_PEMBEBASAN_* ]───✦\n╭ 𖥔 Dari : @${m.sender.split('@')[0]}\n│ 𖥔 Untuk : @${who.split('@')[0]}\n│ 𖥔 Tebusan : Rp ${tebusan.toLocaleString()}\n╰ 𖥔 Bebas dari SEL ${selLama}!`, m, { mentions: [m.sender, who] })
        return
    }

    if(wdb.penjara.length === 0) return m.reply('[ 🚔 ]───[ *_PENJARA KOTA_* ]───✦\n╭ 𖥔 Status : KOSONG\n╰ 𖥔 Kota aman dan damai')

    let cap = `[ 🚔 ]───[ *_DAFTAR NARAPIDANA_* ]───✦\n`
    cap += `╭ 𖥔 TOTAL : ${wdb.penjara.length} ORANG\n╰──\n\n`
    let mentioned = []
    for(let i = 0; i < wdb.penjara.length; i++){
        let jid = wdb.penjara[i]
        let userRPG = wdb.users[jid]?.rpg
        if(!userRPG ||!userRPG.penjara) continue
        mentioned.push(jid)
        let sisa = userRPG.lamaPenjara - (Date.now() - userRPG.penjara)
        let jam = Math.floor(sisa / 3600000)
        let menit = Math.floor((sisa % 3600000) / 60000)
        if(sisa < 0) { jam = 0; menit = 0 }
        cap += `╭──[ SEL ${i + 1} ]──✦\n│ 𖥔 NAMA : @${jid.split('@')[0]}\n│ 𖥔 SISA : ${jam}j ${menit}m\n│ 𖥔 TEBUS : Rp ${userRPG.tebusan.toLocaleString()}\n│ 𖥔 KASUS : ${getKasus(userRPG.tebusan)}\n╰───────────\n\n`
    }
    cap += `╭──「 *INFO* 」─✦\n│ 𖥔.tebus @tag - Bebasin orang\n│ 𖥔.tebus sel 2 - Bebasin by sel\n│ 𖥔.tebus all - Bebasin semua\n│ 𖥔.penjarain @tag menit tebusan - Owner\n│ 𖥔.bebasin @tag/sel all - Owner\n╰ 𖥔 Gabisa tebus diri sendiri`
    return conn.reply(m.chat, cap, m, { mentions: mentioned })
}

handler.before = async function (m, { conn }) {
    const wdb = loadDB()
    let cek = isDiPenjara(wdb, m.sender)
    if(!cek.status) return true
    let command = (m.body || '').toLowerCase().trim().split(/ +/)[0].replace(/^[\/!#.]/, '')
    if (['tebus', 'penjara'].includes(command)) return true
    let plugin = Object.values(global.plugins || {}).find(p => p.tags && p.tags.includes('rpg') && p.command && (typeof p.command === 'string' ? p.command === command : Array.isArray(p.command) ? p.command.includes(command) : p.command.test ? p.command.test(command) : false))
    if(plugin){
        return m.reply(`[ 🚔 ]───[ *_DI PENJARA_* ]───✦\n╭ 𖥔 SEL : ${cek.sel}\n│ 𖥔 SISA : ${cek.sisa}\n│ 𖥔 TEBUS : Rp ${cek.tebusan.toLocaleString('id-ID')}\n│\n│ 𖥔 ❌ Akses RPG diblokir\n╰ 𖥔 Minta *.tebus @kamu*`)
    }
    return true
}

handler.help = ['penjara', 'tebus (@tag/sel angka/all)', 'penjarain (@tag menit tebusan)', 'bebasin (@tag/sel angka/all)']
handler.tags = ['rpg']
handler.command = /^(penjara|tebus|penjarain|bebasin)$/i
handler.group = true
export default handler