import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Chess } from 'chess.js';
import { sendChessBoard } from '../../lib/chess/chess-board-sender.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

global.chess = global.chess ? global.chess : {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Cari sesi aktif milik pengirim pesan
    let sessionKey = Object.keys(global.chess).find(key => {
        let g = global.chess[key];
        return (g.player1 === m.sender || g.player2 === m.sender);
    });
    let userSession = global.chess[sessionKey];

    // 1. Perintah END
    if (args[0] === 'end') {
        if (!userSession) return m.reply('❌ Sesi tidak ditemukan.');
        delete global.chess[sessionKey];
        return m.reply('✅ Sesi permainan berhasil dihapus.');
    }

    // 2. Perintah NYERAH
    if (args[0] === 'nyerah') {
        if (!userSession || userSession.status !== 'PLAYING') return m.reply('❌ Kamu tidak sedang bertanding.');
        const pecundang = m.sender;
        const pemenang = pecundang === userSession.player1 ? userSession.player2 : userSession.player1;
        let teks = `🏳️ *CATUR BERAKHIR*\n\n`;
        teks += `Pemain @${pecundang.split('@')[0]} menyerah.\n`;
        teks += `🏆 Pemenang: ${pemenang === 'BOT' ? '🤖 Bot AI' : '@' + pemenang.split('@')[0]}`;
        await conn.reply(m.chat, teks, m, { mentions: [pecundang, pemenang].filter(v => v !== 'BOT') });
        delete global.chess[sessionKey];
        return;
    }

    // 3. Perintah TERIMA / TOLAK via tombol
    if (args[0] === 'terima' || args[0] === 'tolak') {
        if (!userSession || userSession.status !== 'WAITING') {
            return m.reply('❌ Tidak ada tantangan catur yang menunggu persetujuanmu.');
        }
        if (m.sender !== userSession.player2) {
            return m.reply('❌ Hanya pemain yang ditantang yang bisa merespons!');
        }

        if (args[0] === 'terima') {
            userSession.status = 'PLAYING';
            await conn.reply(m.chat, `✅ *Tantangan diterima! Game catur dimulai.*`, m);
            await sendChessBoard(conn, m.chat, userSession, sessionKey, m);
            return;
        } else {
            await conn.reply(m.chat, `❌ *Tantangan ditolak.*`, m);
            delete global.chess[sessionKey];
            return;
        }
    }

    // 4. Perintah MAIN LAWAN BOT
    if (args[0] === 'bot') {
        if (userSession) return m.reply('⚠️ Selesaikan game kamu sebelumnya terlebih dahulu! (Ketik *.chess end* untuk reset)');
        const game = new Chess();
        const newSessionKey = `${m.sender}-BOT`;
        global.chess[newSessionKey] = {
            instance: game,
            player1: m.sender,
            player2: 'BOT',
            botMode: true,
            status: 'PLAYING',
            chatId: m.chat
        };
        await sendChessBoard(conn, m.chat, global.chess[newSessionKey], newSessionKey, m);
        return;
    }

    // 5. Perintah HTML MINI APP (In-Bubble WebView Meta AI)
    if (args[0] === 'html' || args[0] === 'app') {
        const chessHtmlPath = path.resolve(__dirname, '../../lib/chess/chess-inbubble-app.html');
        if (fs.existsSync(chessHtmlPath)) {
            const htmlContent = fs.readFileSync(chessHtmlPath, 'utf8');
            await conn.reply(m.chat, '⏳ *Membuka papan catur interaktif di bubble WhatsApp...*', m);
            try {
                return await conn.sendHtmlApp(m.chat, htmlContent, {
                    title: 'AVELIA CHESS IN-BUBBLE APP',
                    label: '♟️ Buka Papan Catur Interaktif',
                    height: 380,
                    trustedSources: ['nixel.dev']
                });
            } catch (err) {
                console.error('[CHESS HTML ERROR]:', err);
                const webBaseUrl = global.serverUrl || `http://localhost:${process.env.PORT || 3000}`;
                const webGameUrl = `${webBaseUrl}/chess/${userSession.id}`;
                return m.reply(`⚠️ In-bubble WebView gagal dimuat (${err?.message || err}).\nKamu tetap bisa membuka via browser:\n🔗 ${webGameUrl}`);
            }
        }
    }

    // 6. Perintah LINK WEB
    if (args[0] === 'link' || args[0] === 'web') {
        if (!userSession) return m.reply('❌ Kamu belum memiliki sesi catur yang aktif.');
        const webBaseUrl = global.serverUrl || `http://localhost:${process.env.PORT || 3000}`;
        const webUrl = `${webBaseUrl}/chess/${encodeURIComponent(sessionKey)}`;
        let buttons = [
            {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: '🎮 Buka Papan Interaktif (HTML5)',
                    url: webUrl,
                    merchant_url: webUrl
                })
            }
        ];
        return await conn.sendButton(
            m.chat,
            `♟️ *LINK PAPAN CATUR INTERAKTIF (HTML5)*\n\nKlik tombol di bawah untuk membuka papan catur langsung di browser WhatsApp kamu.`,
            'Avelia • Mini Game',
            null,
            buttons,
            m
        );
    }

    // 6. Tantang Lawan (@tag atau nomor)
    let lawan;
    if (m.quoted) {
        lawan = m.quoted.sender;
    } else if (args[0]) {
        if (args[0].includes('@')) {
            return m.reply('Ketik nomor saja atau reply langsung pesannya.');
        }
        lawan = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    }

    if (lawan) {
        if (lawan === m.sender) return m.reply('❌ Kamu tidak bisa menantang diri sendiri!');
        if (userSession) return m.reply('⚠️ Selesaikan permainanmu saat ini dulu!');

        let isLawanBusy = Object.values(global.chess).find(g =>
            (g.player1 === lawan || g.player2 === lawan)
        );
        if (isLawanBusy) return m.reply('❌ Orang tersebut sedang bertanding di sesi lain!');

        const newSessionKey = `${m.sender}-${lawan}`;
        const game = new Chess();
        global.chess[newSessionKey] = {
            instance: game,
            player1: m.sender,
            player2: lawan,
            botMode: false,
            status: 'WAITING',
            chatId: m.chat
        };

        let teks = `♟️ *TANTANGAN CATUR*\n\n`;
        teks += `⚪ *Putih:* @${m.sender.split('@')[0]}\n`;
        teks += `⚫ *Hitam:* @${lawan.split('@')[0]}\n\n`;
        teks += `Silakan klik tombol di bawah untuk menerima atau menolak tantangan ini.`;

        let buttons = [
            ['✅ Terima Tantangan', `${usedPrefix + command} terima`],
            ['❌ Tolak Tantangan', `${usedPrefix + command} tolak`]
        ];

        return await conn.sendButton(
            m.chat,
            teks,
            'Avelia • Catur Interaktif',
            null,
            buttons,
            m,
            { mentions: [m.sender, lawan] }
        );
    }

    // Bantuan / Menu
    let help = `♟️ *MENU CATUR INTERAKTIF (HTML5)*\n\n`;
    help += `• *${usedPrefix + command} html* ➔ Buka papan catur di gelembung chat (Mini App)\n`;
    help += `• *${usedPrefix + command} bot* ➔ Main catur melawan Bot AI\n`;
    help += `• *${usedPrefix + command} <nomor>* ➔ Tantang teman main catur\n`;
    help += `• *${usedPrefix + command} link* ➔ Dapatkan link papan catur HTML5\n`;
    help += `• *${usedPrefix + command} nyerah* ➔ Menyerah dari pertandingan\n`;
    help += `• *${usedPrefix + command} end* ➔ Hapus sesi permainan saat ini\n\n`;
    help += `_Fitur ini dilengkapi dengan in-bubble HTML WebView dan papan catur interaktif!_`;

    let buttons = [
        ['🎮 Buka Mini App (In-Bubble)', `${usedPrefix + command} html`],
        ['🤖 Main Lawan Bot', `${usedPrefix + command} bot`]
    ];

    await conn.sendButton(m.chat, help, 'Avelia • Chess Game', null, buttons, m);
};

handler.before = async function (m, { conn }) {
    if (!m.text) return false;
    const budy = m.text.trim();
    const budyLower = budy.toLowerCase();

    let sessionKey = Object.keys(global.chess).find(key => {
        let g = global.chess[key];
        return (g.player1 === m.sender || g.player2 === m.sender);
    });
    if (!sessionKey) return false;
    let gameData = global.chess[sessionKey];

    // Status WAITING (Persetujuan tantangan)
    if (gameData.status === 'WAITING') {
        if (m.sender !== gameData.player2) return false;

        if (budyLower === '1' || budyLower === 'terima' || budyLower.endsWith('terima')) {
            gameData.status = 'PLAYING';
            await conn.reply(m.chat, `✅ *Tantangan diterima! Game catur dimulai.*`, m);
            await sendChessBoard(conn, m.chat, gameData, sessionKey, m);
            return true;
        } else if (budyLower === '2' || budyLower === 'tolak' || budyLower.endsWith('tolak')) {
            await conn.reply(m.chat, `❌ *Tantangan ditolak.*`, m);
            delete global.chess[sessionKey];
            return true;
        }
    }

    // Status PLAYING (Eksekusi langkah)
    if (gameData.status === 'PLAYING') {
        const turn = gameData.instance.turn();
        const currentTurn = turn === 'w' ? gameData.player1 : gameData.player2;
        if (m.sender !== currentTurn) return false;

        let moveResult = null;

        // 1. Coba format koordinat: e2e4 atau e2-e4 atau e2 e4
        const coordMatch = budyLower.replace(/[^a-h1-8]/g, '').match(/^([a-h][1-8])([a-h][1-8])$/);
        if (coordMatch) {
            try {
                moveResult = gameData.instance.move({ from: coordMatch[1], to: coordMatch[2], promotion: 'q' });
            } catch (e) {
                moveResult = null;
            }
        }

        // 2. Coba format SAN: e4, Nf3, exd5, O-O, dll.
        if (!moveResult) {
            try {
                moveResult = gameData.instance.move(budy);
            } catch (e) {
                moveResult = null;
            }
        }

        if (!moveResult) return false; // Bukan langkah catur yang valid, biarkan handler lain memproses teks

        // Jika mode bot dan belum game over, bot otomatis melangkah
        if (gameData.botMode && !gameData.instance.isGameOver()) {
            const moves = gameData.instance.moves();
            if (moves.length > 0) {
                gameData.instance.move(moves[Math.floor(Math.random() * moves.length)]);
            }
        }

        // Cek akhir permainan
        if (gameData.instance.isGameOver()) {
            let res = gameData.instance.isCheckmate() ? '🏁 *SKAKMAT! PERMAINAN SELESAI*' : '🤝 *REMIS (DRAW)! PERMAINAN SELESAI*';
            await conn.reply(m.chat, `♟️ ${res}`, m);
            delete global.chess[sessionKey];
            return true;
        }

        // Kirim papan catur terupdate
        await sendChessBoard(conn, m.chat, gameData, sessionKey, m);
        return true;
    }
};

handler.help = ['catur', 'chess'];
handler.tags = ['game'];
handler.command = /^(catur|chess|ct)$/i;

export default handler;