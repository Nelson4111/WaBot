import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Chess } from 'chess.js';
import { sendChessBoard } from '../../lib/chess/chess-board-sender.js';
import * as Elaina from '@rexxhayanasi/elaina-baileys';
import * as Baileys from '@whiskeysockets/baileys';

const proto = Elaina.proto || Baileys.proto;
const generateWAMessageFromContent = Elaina.generateWAMessageFromContent || Baileys.generateWAMessageFromContent;
const generateMessageIDV2 = Elaina.generateMessageIDV2 || Baileys.generateMessageIDV2;
const lockHeight = Elaina.lockHeight;

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

    // 5. Perintah HTML MINI APP (In-Bubble WebView Meta AI dengan Lobby, Solo Bot & Mabar Multiplayer)
    if (args[0] === 'html' || args[0] === 'app' || args[0] === 'mabar' || args[0] === 'lobby' || args[0] === 'online') {
        const chessHtmlPath = path.resolve(__dirname, '../../lib/chess/chess-inbubble-app.html');
        if (fs.existsSync(chessHtmlPath)) {
            const rawHtml = fs.readFileSync(chessHtmlPath, 'utf8');

            const rawGroupId = (m.isGroup ? m.chat.split('@')[0] : m.sender.split('@')[0]).replace(/[^a-z0-9_-]/g, '');
            const groupId = rawGroupId.substring(0, 18) || 'global';
            const playerName = (m.pushName || 'Pemain').substring(0, 15).replace(/[<>"']/g, '');

            // Exact WebSocket URL from working arcade-tesproto.js (PieSocket free.blr2 channel 1)
            const WS_URL = 'wss://free.blr2.piesocket.com/v3/1?api_key=OZhgMu47NmZgmMWMIzXUY3NXL26NWHABe3zJGQCF&notify_self=1';

            const finalHtml = rawHtml
                .replace(/\{\{GROUP_ID\}\}/g, groupId)
                .replace(/\{\{PLAYER_NAME\}\}/g, playerName)
                .replace(/\{\{WS_URL\}\}/g, WS_URL);

            // Lock height to 440px to prevent clipping / cutoff on WhatsApp Android
            const wrappedPayload = (typeof lockHeight === 'function' ? lockHeight(440) : '') + finalHtml;

            await conn.reply(m.chat, '⏳ *Membuka Chess Lobby & Mabar di bubble WhatsApp...*', m);

            const sources = [
                {
                    source_type: 'THIRD_PARTY',
                    source_display_name: 'WebSocket Server',
                    source_subtitle: 'Realtime Stream',
                    source_url: WS_URL,
                    favicon: {
                        url: 'https://mmg.whatsapp.net/o1/v/t24/f2/m239/CONTOH?ccb=9-4&oh=x&oe=y&_nc_sid=z&mms3=true',
                        mime_type: 'image/jpeg',
                        width: 16,
                        height: 16
                    }
                }
            ];

            const subMessageType = proto.AIRichResponseSubMessageType?.AI_RICH_RESPONSE_TEXT || 2;

            const isi = {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                    botMetadata: {
                        messageDisclaimerText: 'Avelia Chess Multiplayer',
                        richResponseSourcesMetadata: {
                            sources
                        }
                    }
                },
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1,
                            submessages: [
                                {
                                    messageType: subMessageType,
                                    messageText: '♟️ Avelia Chess Lobby & Multiplayer'
                                }
                            ],
                            unifiedResponse: {
                                data: Buffer.from(
                                    JSON.stringify({
                                        response_id: generateMessageIDV2 ? generateMessageIDV2() : 'RES_' + Date.now(),
                                        sections: [
                                            {
                                                view_model: {
                                                    primitive: {
                                                        __typename: 'GenAIaeacdsnwHtmlPrimitive',
                                                        payload: wrappedPayload,
                                                        trusted_sources: sources.map(x => x.source_url)
                                                    },
                                                    __typename: 'GenAISingleLayoutViewModel'
                                                }
                                            }
                                        ]
                                    })
                                ).toString('base64')
                            },
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedAiBotMessageInfo: {
                                    botJid: '0@bot'
                                },
                                forwardOrigin: 4
                            }
                        }
                    }
                }
            };

            try {
                const msg = generateWAMessageFromContent(
                    m.chat,
                    isi,
                    {
                        messageId: generateMessageIDV2 ? generateMessageIDV2() : undefined
                    }
                );

                await conn.relayMessage(
                    m.chat,
                    msg.message,
                    {
                        messageId: msg.key.id
                    }
                );
                return;
            } catch (err) {
                console.error('[CHESS PROTO ERROR]:', err);
                // Fallback to sendHtmlApp if relayMessage fails
                try {
                    return await conn.sendHtmlApp(m.chat, finalHtml, {
                        title: '♟️ AVELIA CHESS • LOBBY & MULTIPLAYER',
                        label: '🎮 Buka Lobby Catur (Solo / Mabar)',
                        height: 380,
                        trustedSources: [WS_URL, 'piesocket.com', `${PIESOCKET_CLUSTER}.piesocket.com`, 'nixel.dev']
                    });
                } catch (e2) {
                    return m.reply(`⚠️ Gagal memuat in-bubble app: ${err?.message || err}`);
                }
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
    help += `• *${usedPrefix + command} html* ➔ Buka Lobby Catur (Solo Bot & Mabar Multiplayer Online)\n`;
    help += `• *${usedPrefix + command} bot* ➔ Main catur teks klasik melawan Bot AI\n`;
    help += `• *${usedPrefix + command} <nomor>* ➔ Tantang teman main catur teks di grup\n`;
    help += `• *${usedPrefix + command} link* ➔ Dapatkan link papan catur HTML5 web browser\n`;
    help += `• *${usedPrefix + command} nyerah* ➔ Menyerah dari pertandingan\n`;
    help += `• *${usedPrefix + command} end* ➔ Hapus sesi permainan saat ini\n\n`;
    help += `_Fitur ini dilengkapi Mini App in-bubble dengan pilihan mode Solo Bot, Room Multiplayer otomatis, dan Mode Penonton live!_`;

    let buttons = [
        ['🎮 Buka Chess Lobby & Mabar', `${usedPrefix + command} html`],
        ['🤖 Main Lawan Bot (Teks)', `${usedPrefix + command} bot`]
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