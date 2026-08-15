import { Chess } from 'chess.js'
import axios from 'axios'

global.chess = global.chess ? global.chess : {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Cari sesi aktif milik pengirim pesan
    let sessionKey = Object.keys(global.chess).find(key => {
        let g = global.chess[key]
        return (g.player1 === m.sender || g.player2 === m.sender)
    })
    let userSession = global.chess[sessionKey]

    if (args[0] === 'end') {
        if (!userSession) return m.reply('❌ Sesi tidak ditemukan.')
        delete global.chess[sessionKey]
        return m.reply('✅ Sesi permainan berhasil dihapus.')
    }

    if (args[0] === 'nyerah') {
        if (!userSession || userSession.status !== 'PLAYING') return m.reply('❌ Kamu tidak sedang bertanding.')
        const pecundang = m.sender
        const pemenang = pecundang === userSession.player1 ? userSession.player2 : userSession.player1
        let teks = `🏳️ *CATUR BERAKHIR*\n\n`
        teks += `Pemain @${pecundang.split('@')[0]} menyerah.\n`
        teks += `🏆 Pemenang: @${pemenang === 'BOT' ? 'BOT' : pemenang.split('@')[0]}`
        await conn.reply(m.chat, teks, m, { mentions: [pecundang, pemenang].filter(v => v !== 'BOT') })
        delete global.chess[sessionKey]
        return
    }

    if (args[0] === 'bot') {
        if (userSession) return m.reply('Selesaikan game kamu dulu!')
        const game = new Chess()
        global.chess[m.sender] = {
            instance: game,
            player1: m.sender,
            player2: 'BOT',
            botMode: true,
            status: 'PLAYING',
            chatId: m.chat
        }
        await sendBoard(conn, m, global.chess[m.sender], m.sender)
        return
    }

    let lawan;
    if (m.quoted) {
        lawan = m.quoted.sender 
    } else if (args[0]) {
        if (args[0].includes('@')) {
            return m.reply('Ketik nomor atau reply pesannya.')
        }
        lawan = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }

    if (lawan) {
        if (lawan === m.sender) return m.reply('Gak bisa lawan diri sendiri!')
        if (userSession) return m.reply('Selesaikan permainanmu dulu!')

        // VALIDASI: Cek apakah target (lawan) sedang bermain dengan orang lain
        let isLawanBusy = Object.values(global.chess).find(g => 
            (g.player1 === lawan || g.player2 === lawan)
        )
        if (isLawanBusy) return m.reply('❌ Orang tersebut sedang dalam permainan lain!')

        const newSessionKey = `${m.sender}-${lawan}`
        const game = new Chess()
        global.chess[newSessionKey] = {
            instance: game,
            player1: m.sender,
            player2: lawan,
            botMode: false,
            status: 'WAITING',
            chatId: m.chat
        }
        let teks = `♟️ *TANTANGAN CATUR*\n\n`
        teks += `⚪ Putih: @${m.sender.split('@')[0]}\n`
        teks += `⚫ Hitam: @${lawan.split('@')[0]}\n\n`
        teks += `Ketik *1* untuk terima, *2* untuk tolak.`
        return conn.sendMessage(m.chat, { text: teks, mentions: [m.sender, lawan] }, { quoted: m })
    }

    let help = `♟️ *CHESS MENU*\n\n`
    help += `*${usedPrefix + command} bot*\n`
    help += `*${usedPrefix + command} nomor*\n`
    help += `*${usedPrefix + command} nyerah*\n`
    help += `*${usedPrefix + command} end*\n\n`
    help += `_Note: Tantang user via nomor atau reply pesannya._`
    m.reply(help)
}

handler.before = async function (m, { conn }) {
    if (!m.text) return false
    const budy = m.text.toLowerCase().trim()
    let sessionKey = Object.keys(global.chess).find(key => {
        let g = global.chess[key]
        return (g.player1 === m.sender || g.player2 === m.sender)
    })
    if (!sessionKey) return false
    let gameData = global.chess[sessionKey]

    if (gameData.status === 'WAITING') {
        if (m.sender !== gameData.player2) return false
        if (budy === '1') {
            gameData.status = 'PLAYING'
            await conn.reply(m.chat, `✅ Tantangan diterima, game dimulai!`, m)
            await sendBoard(conn, m, gameData, sessionKey)
            return true
        } else if (budy === '2') {
            await conn.reply(m.chat, `❌ Tantangan ditolak.`, m)
            delete global.chess[sessionKey]
            return true
        }
    }

    if (gameData.status === 'PLAYING') {
        const turn = gameData.instance.turn()
        const currentTurn = turn === 'w' ? gameData.player1 : gameData.player2
        if (m.sender !== currentTurn) return false
        const moveMatch = budy.replace(/\s+/g, '').match(/^([a-h][1-8])([a-h][1-8])$/)
        if (!moveMatch) return false 

        try {
            const move = gameData.instance.move({ from: moveMatch[1], to: moveMatch[2], promotion: 'q' })
            if (!move) return conn.reply(m.chat, `⚠️ Langkah tidak sesuai aturan bidak!`, m)
            if (gameData.botMode && !gameData.instance.isGameOver()) {
                const moves = gameData.instance.moves()
                gameData.instance.move(moves[Math.floor(Math.random() * moves.length)])
            }
            if (gameData.instance.isGameOver()) {
                let res = gameData.instance.isCheckmate() ? 'SKAKMAT! 🏁' : 'DRAW! 🤝'
                await conn.reply(m.chat, `♟️ *GAME OVER* - ${res}`, m)
                delete global.chess[sessionKey]
                return true
            }
            await sendBoard(conn, m, gameData, sessionKey)
            return true
        } catch (e) { return false }
    }
}

async function sendBoard(conn, m, gameData, sessionKey) {
    const fen = encodeURIComponent(gameData.instance.fen())
    const turn = gameData.instance.turn()
    const flip = turn === 'b' ? '&flip=true' : ''
    const url = `https://www.chess.com/dynboard?fen=${fen}&size=3&coordinates=inside${flip}`
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' })
        const next = turn === 'w' ? gameData.player1 : gameData.player2
        let cap = `♟️ *GAME CHESS*\n\n`
        cap += `⚪ P1: @${gameData.player1.split('@')[0]}\n`
        cap += `⚫ P2: @${gameData.player2 === 'BOT' ? 'BOT' : gameData.player2.split('@')[0]}\n`
        cap += `🚩 Giliran: @${next.split('@')[0]} (${turn === 'w' ? 'Putih' : 'Hitam'})\n\n`
        cap += `_Ketik langkah (contoh: e2e4)_`
        await conn.sendMessage(m.chat, { image: Buffer.from(response.data), caption: cap, mentions: [gameData.player1, gameData.player2].filter(v => v !== 'BOT') }, { quoted: m })
        global.chess[sessionKey] = gameData
    } catch (e) {}
}

handler.help = ['catur']
handler.tags = ['game']
handler.command = /^(catur|chess|ct)$/i

export default handler