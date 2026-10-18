import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendDualGroupMessage } from '../../lib/dual-group-message.js';
import { status, toSmallNum, shintoDivider } from '../../lib/style.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BOARD_IMAGE_PATH = path.resolve(__dirname, '../../media/ulartangga_board.jpg');

// Konfigurasi Tangga & Ular
const SNAKES_AND_LADDERS = [
    // 🪜 Tangga (Naik)
    { start: 15, end: 37, type: 'ladder' },
    { start: 23, end: 41, type: 'ladder' },
    { start: 49, end: 86, type: 'ladder' },
    { start: 67, end: 87, type: 'ladder' },
    { start: 74, end: 95, type: 'ladder' },

    // 🐍 Ular (Turun)
    { start: 18, end: 7, type: 'snake' },
    { start: 24, end: 12, type: 'snake' },
    { start: 72, end: 36, type: 'snake' },
    { start: 75, end: 64, type: 'snake' },
    { start: 90, end: 56, type: 'snake' },
    { start: 91, end: 72, type: 'snake' },
    { start: 97, end: 78, type: 'snake' }
];

// Helper: Ambil kelas Button dari conn atau package elaina-baileys
async function getButtonClass(conn) {
    if (conn.Button) return conn.Button;
    try {
        const elaina = await import('@rexxhayanasi/elaina-baileys');
        return elaina.Button;
    } catch {
        return null;
    }
}

// Render Papan Ular Tangga menggunakan @napi-rs/canvas (dengan fallback Jimp jika diperlukan)
async function renderBoard(room) {
    try {
        const { createCanvas, loadImage } = await import('@napi-rs/canvas');
        let bgImg;
        if (fs.existsSync(BOARD_IMAGE_PATH)) {
            bgImg = await loadImage(BOARD_IMAGE_PATH);
        } else {
            bgImg = await loadImage('https://i.pinimg.com/originals/2f/68/a7/2f68a7e1eee18556b055418f7305b3c0.jpg');
        }

        const size = 500;
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // Gambar papan latar belakang
        ctx.drawImage(bgImg, 0, 0, size, size);

        // Grid kalkulasi kotak (1 - 100)
        const margin = 12;
        const gridW = size - (margin * 2);
        const gridH = size - (margin * 2);
        const cellW = gridW / 10;
        const cellH = gridH / 10;

        const p1 = room.players[0];
        const p2 = room.players[1];
        const pos1 = room.positions[p1] || 1;
        const pos2 = room.positions[p2] || 1;
        const sameCell = pos1 === pos2;

        const getCellCenter = (pos, playerIdx) => {
            const row = 9 - Math.floor((pos - 1) / 10);
            const col = (pos - 1) % 10;
            let cx = margin + (col + 0.5) * cellW;
            let cy = margin + (row + 0.5) * cellH;

            // Offset jika berada di kotak yang sama
            if (sameCell) {
                cx += (playerIdx === 0 ? -cellW * 0.22 : cellW * 0.22);
            }
            return { cx, cy };
        };

        const drawPawn = (cx, cy, color, strokeColor, label) => {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx, cy, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.lineWidth = 3;
            ctx.strokeStyle = strokeColor;
            ctx.beginPath();
            ctx.arc(cx, cy, 14, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, cx, cy);
        };

        const c1 = getCellCenter(pos1, 0);
        drawPawn(c1.cx, c1.cy, '#e63946', '#ffffff', 'P1');

        if (p2) {
            const c2 = getCellCenter(pos2, 1);
            drawPawn(c2.cx, c2.cy, '#1d3557', '#ffffff', 'P2');
        }

        return await canvas.encode('png');
    } catch (err) {
        console.warn('[ULAR TANGGA] Canvas render error, fallback to Jimp:', err?.message);
        const Jimp = (await import('jimp')).default;
        let boardImg;
        if (fs.existsSync(BOARD_IMAGE_PATH)) {
            boardImg = await Jimp.read(BOARD_IMAGE_PATH);
        } else {
            boardImg = await Jimp.read('https://i.pinimg.com/originals/2f/68/a7/2f68a7e1eee18556b055418f7305b3c0.jpg');
        }
        boardImg.resize(420, 420);
        return await boardImg.getBufferAsync(Jimp.MIME_PNG);
    }
}

// Reset AFK Timer (90 detik)
function resetAfkTimeout(conn, chatId) {
    const room = conn.ulartangga?.[chatId];
    if (!room) return;
    if (room.timeout) clearTimeout(room.timeout);

    room.timeout = setTimeout(async () => {
        if (!conn.ulartangga?.[chatId]) return;
        const currentP = room.players[room.turn];
        const isBot = currentP === 'BOT';
        const pName = isBot ? 'Bot AI' : currentP.split('@')[0];

        const timeoutMsg = `*──  ୨୧ ✧ ULAR TANGGA ✧ ୨୧  ──*\n\n` +
            `*╭  〔 ⏱ ᴡ ᴀ ᴋ ᴛ ᴜ  ʜ ᴀ ʙ ɪ ꜱ 〕*\n` +
            `> Pemain @${pName} tidak merespons selama ${toSmallNum(90)} detik.\n` +
            `> Sesi permainan otomatis dihentikan agar ruang obrolan kembali bersih.\n` +
            `*╰───────────────*\n\n` +
            `> ｡˚ ⊹ *ᴋᴇᴛɪᴋ .ᴜʟᴀʀ ꜱᴛᴀʀᴛ ᴜɴᴛᴜᴋ ʙᴇʀᴍᴀɪɴ ʟᴀɢɪ* ⊹ ˚ ｡`;

        await conn.sendMessage(chatId, {
            text: timeoutMsg,
            mentions: [currentP].filter(p => p !== 'BOT')
        });
        delete conn.ulartangga[chatId];
    }, 90000);
}

// Mengirim pesan giliran dengan arsitektur Dual-Message & format Zen Shinto
async function sendTurnMessage(conn, m, room, promptText = '') {
    const currentPlayer = room.players[room.turn];
    const isBot = currentPlayer === 'BOT';
    const playerNumber = currentPlayer.split('@')[0];
    const p1Number = room.players[0].split('@')[0];
    const p2Number = room.players[1] === 'BOT' ? 'Bot AI' : room.players[1].split('@')[0];
    const p1Pos = room.positions[room.players[0]] || 1;
    const p2Pos = room.positions[room.players[1]] || 1;

    let baseCard = `*──  ୨୧ ✧ ULAR TANGGA ✧ ୨୧  ──*\n\n`;
    if (promptText) {
        baseCard += `> ${promptText}\n\n`;
    }
    baseCard += `*╭  〔 𝜚 ᴘ ᴏ ꜱ ɪ ꜱ ɪ  ᴘ ᴇ ᴍ ᴀ ɪ ɴ 〕*\n`;
    baseCard += `*┆* ⟡ ᴘ𝟷 ʀᴇᴅ   : @${p1Number} (Kotak *${toSmallNum(p1Pos)}*)\n`;
    baseCard += `*┆* ✧ ᴘ𝟸 ʙʟᴜᴇ  : ${room.players[1] === 'BOT' ? '🤖 Bot AI' : '@' + p2Number} (Kotak *${toSmallNum(p2Pos)}*)\n`;
    baseCard += `*┆* ✦ ɢɪʟɪʀᴀɴ   : ${isBot ? '🤖 *Bot AI*' : `@${playerNumber} ㋡`}\n`;
    baseCard += `*┆* ⏱ ᴛɪᴍᴇᴏᴜᴛ  : *${toSmallNum(90)} ᴅᴇᴛɪᴋ*\n`;
    baseCard += `*╰───────────────*`;

    // Jika giliran Bot AI: Otomatis melempar setelah jeda 1.5 detik
    if (isBot) {
        const botTurnText = `${baseCard}\n\n> 🤖 _Bot AI sedang memutar dadu keberuntungan..._`;
        await conn.sendMessage(m.chat, {
            text: botTurnText,
            mentions: room.players.filter(p => p !== 'BOT')
        });
        setTimeout(() => {
            if (conn.ulartangga?.[m.chat] && conn.ulartangga[m.chat].players[conn.ulartangga[m.chat].turn] === 'BOT') {
                processRoll(conn, m, 'BOT');
            }
        }, 1500);
        return;
    }

    // Untuk pemain manusia: Susun Pesan Dual-Visibility berstandar Zen Shinto
    const bodyText = `${baseCard}\n\n` +
        `> ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ ᴜɴᴛᴜᴋ ᴍᴇɴɢᴏᴄᴏᴋ ᴅᴀᴅᴜ* ⊹ ˚ ｡\n` +
        `> _Atau ketik \`roll\` / \`r\` pada kolom chat._`;

    const spectatorText = `${baseCard}\n\n` +
        `> ⏳ _Menunggu @${playerNumber} mengocok dadu..._\n` +
        `> 🔒 _(Tombol dadu hanya muncul dan aktif di layar @${playerNumber})_`;

    try {
        const ButtonClass = await getButtonClass(conn);
        if (ButtonClass) {
            const btn = new ButtonClass(conn);
            btn.setBody(bodyText);
            btn.setFooter('Avelia • Ular Tangga Celestial');
            btn.addReply('🎲 Kocok Dadu', `.ular roll`);
            btn.addReply('🏳️ Menyerah', `.ular nyerah`);
            const built = await btn.build(m.chat);

            await sendDualGroupMessage(conn, m.chat, currentPlayer, built.message, spectatorText, {
                contextInfo: {
                    mentionedJid: room.players.filter(p => p !== 'BOT')
                }
            });
        } else {
            await conn.sendMessage(m.chat, {
                text: bodyText,
                mentions: room.players.filter(p => p !== 'BOT')
            });
        }
    } catch (err) {
        console.warn('[ULAR TANGGA] Dual message failed, fallback to standard text:', err?.message);
        await conn.sendMessage(m.chat, {
            text: bodyText,
            mentions: room.players.filter(p => p !== 'BOT')
        });
    }

    resetAfkTimeout(conn, m.chat);
}

// Proses lemparan dadu dan pergerakan bidak
async function processRoll(conn, m, sender) {
    const room = conn.ulartangga?.[m.chat];
    if (!room || room.state !== 'PLAYING') {
        return m.reply(status.warning('Tidak ada sesi permainan aktif. Ketik `.ular start` untuk memulai!'));
    }

    const currentPlayer = room.players[room.turn];
    if (sender !== currentPlayer) {
        return m.reply(status.warning(`Bukan giliranmu! Saat ini giliran @${currentPlayer.split('@')[0]} untuk melangkah.`), null, {
            mentions: [currentPlayer].filter(p => p !== 'BOT')
        });
    }

    if (room.timeout) clearTimeout(room.timeout);

    // Lempar Dadu (1 - 6)
    const dice = Math.floor(Math.random() * 6) + 1;
    const currentPos = room.positions[currentPlayer] || 1;
    let newPos = currentPos + dice;
    const isBot = currentPlayer === 'BOT';
    const playerTag = isBot ? '🤖 *Bot AI*' : `@${currentPlayer.split('@')[0]}`;

    let eventDetail = '';

    // Aturan Pantulan (Bounce) jika melebihi kotak 100
    if (newPos > 100) {
        const overshoot = newPos - 100;
        newPos = 100 - overshoot;
        eventDetail = `> 🔄 *Memantul!* Melewati kotak 𝟷𝟶𝟶 sebanyak ${overshoot} langkah, berbalik ke kotak *${toSmallNum(newPos)}*.`;
    }

    // Pengecekan Tangga atau Ular
    const jump = SNAKES_AND_LADDERS.find(s => s.start === newPos);
    if (jump) {
        if (jump.type === 'ladder') {
            eventDetail = `> 🪜 *Hore!* Mendarat di tangga kotak ${toSmallNum(jump.start)}, naik melesat ke kotak *${toSmallNum(jump.end)}*! ♡`;
        } else {
            eventDetail = `> 🐍 *Awas!* Terkena patukan ular di kotak ${toSmallNum(jump.start)}, meluncur turun ke kotak *${toSmallNum(jump.end)}*! (つд⊂)`;
        }
        newPos = jump.end;
    }

    // Simpan posisi terbaru
    room.positions[currentPlayer] = newPos;

    // Susun Kartu Hasil Giliran Sesuai STYLE_GUIDE
    let resultCard = `*──  ୨୧ ✧ HASIL LEMPARAN DADU ✧ ୨୧  ──*\n\n` +
        `*╭  〔 🎲 ʜ ᴀ ꜱ ɪ ʟ  ɢ ɪ ʟ ɪ ʀ ᴀ ɴ 〕*\n` +
        `*┆* ⟡ ᴘᴇᴍᴀɪɴ  : ${playerTag}\n` +
        `*┆* ✧ ᴅᴀᴅᴜ    : *${toSmallNum(dice)}*\n` +
        `*┆* ✦ ʟᴀɴɢᴋᴀʜ : Kotak *${toSmallNum(currentPos)}* › *${toSmallNum(newPos)}*\n`;

    if (eventDetail) {
        resultCard += `${eventDetail}\n`;
    }
    resultCard += `*╰───────────────*`;

    // Render Gambar Papan Terbaru
    const boardBuffer = await renderBoard(room);

    // Kirim gambar papan terbaru beserta status lemparan
    await conn.sendMessage(m.chat, {
        image: boardBuffer,
        caption: resultCard,
        mentions: [currentPlayer].filter(p => p !== 'BOT')
    });

    // Pengecekan Kemenangan (Tepat di Kotak 100)
    if (newPos === 100) {
        const winner = currentPlayer;
        const winRewardExp = 5000;
        const isBotWin = winner === 'BOT';

        if (!isBotWin) {
            global.db = global.db || { data: { users: {} } };
            global.db.data = global.db.data || { users: {} };
            global.db.data.users = global.db.data.users || {};
            if (global.db.data.users[winner]) {
                global.db.data.users[winner].exp = (global.db.data.users[winner].exp || 0) + winRewardExp;
            }
        }

        const winMsg = `*──  ୨୧ ✧ ULAR TANGGA SELESAI ✧ ୨୧  ──*\n\n` +
            `*╭  〔 🏆 ᴘ ᴇ ᴍ ᴇ ɴ ᴀ ɴ ɢ 〕*\n` +
            `*┆* ⟡ ᴊᴜᴀʀᴀ    : ${isBotWin ? '🤖 *Bot AI*' : `@${winner.split('@')[0]} 👑`}\n` +
            `*┆* ✧ ᴋᴏᴛᴀᴋ    : *${toSmallNum(100)} (ꜰɪɴɪꜱʜ)*\n` +
            `*┆* ❖ ʜᴀᴅɪᴀʜ   : *+${toSmallNum(winRewardExp)} ᴇxᴘ*\n` +
            `> Selamat kepada pemenang! Berhasil menaklukkan papan Ular Tangga dengan gemilang ♡\n` +
            `*╰───────────────*\n\n` +
            `> ｡˚ ⊹ *ᴋᴇᴛɪᴋ .ᴜʟᴀʀ ꜱᴛᴀʀᴛ ᴜɴᴛᴜᴋ ʙᴇʀᴍᴀɪɴ ʟᴀɢɪ* ⊹ ˚ ｡`;

        await conn.sendMessage(m.chat, {
            text: winMsg,
            mentions: room.players.filter(p => p !== 'BOT')
        });

        if (room.timeout) clearTimeout(room.timeout);
        delete conn.ulartangga[m.chat];
        return;
    }

    // Aturan Dadu 6: Bonus Giliran
    if (dice === 6) {
        await sendTurnMessage(
            conn,
            m,
            room,
            `*おめでとう!* (ʙᴏɴᴜꜱ ᴅᴀᴅᴜ 𝟼!)\n> ${playerTag} berhak melempar dadu satu kali lagi ♡`
        );
        return;
    }

    // Ganti giliran ke pemain lawan
    room.turn = 1 - room.turn;
    await sendTurnMessage(conn, m, room);
}

// Handler utama plugin
const handler = async (m, { conn, args, usedPrefix, command }) => {
    conn.ulartangga = conn.ulartangga || {};
    const chatId = m.chat;
    let room = conn.ulartangga[chatId];
    const action = (args[0] || '').toLowerCase();

    switch (action) {
        case 'start':
        case 'create': {
            if (room) {
                if (room.state === 'PLAYING') {
                    return m.reply(status.warning('Sesi permainan sedang berlangsung. Ketik `.ular reset` jika ingin membatalkan.'));
                }
                if (room.state === 'WAITING') {
                    return m.reply(`*╭  〔 𝜚 ɪ ɴ ꜰ ᴏ  ꜱ ᴇ ꜱ ɪ 〕*\n> Sesi sudah dibuka oleh @${room.players[0].split('@')[0]}.\n> Ketik \`${usedPrefix + command} join\` untuk bergabung atau \`${usedPrefix + command} bot\` untuk lawan AI.\n*╰───────────────*`, null, {
                        mentions: [room.players[0]]
                    });
                }
            }

            conn.ulartangga[chatId] = {
                id: chatId,
                state: 'WAITING',
                players: [m.sender],
                positions: { [m.sender]: 1 },
                turn: 0,
                timeout: null
            };

            const joinCard = `*──  ୨୧ ✧ ULAR TANGGA CELESTIAL ✧ ୨୧  ──*\n\n` +
                `> *こんにちわ!* (ʜᴇʟʟᴏ!)\n` +
                `> Sesi permainan baru telah dibuka oleh @${m.sender.split('@')[0]} ♡\n\n` +
                `*╭  〔 𝜚 ɪ ɴ ꜰ ᴏ  ꜱ ᴇ ꜱ ɪ 〕*\n` +
                `*┆* ⟡ ᴘ𝟷 ʀᴇᴅ   : @${m.sender.split('@')[0]} ㋡\n` +
                `*┆* ✧ ᴘ𝟸 ʙʟᴜᴇ  : _Menunggu partner..._\n` +
                `*┆* ◈ ᴛᴀʀɢᴇᴛ   : *Kotak ${toSmallNum(100)}*\n` +
                `*┆* ⏱ ᴛɪᴍᴇᴏᴜᴛ  : *${toSmallNum(90)} ᴅᴇᴛɪᴋ*\n` +
                `*╰───────────────*\n\n` +
                `> ｡˚ ⊹ *ᴘɪʟɪʜᴀɴ ᴍᴏᴅᴇ ʙᴇʀᴍᴀɪɴ* ⊹ ˚ ｡\n` +
                `> › *${usedPrefix + command} join* (Main berdua bareng teman)\n` +
                `> › *${usedPrefix + command} bot* (Main solo langsung lawan AI)`;

            await conn.sendMessage(chatId, {
                text: joinCard,
                mentions: [m.sender]
            });
            break;
        }

        case 'join': {
            if (!room || room.state !== 'WAITING') {
                return m.reply(status.info(`Tidak ada sesi yang menunggu pemain.\nKetik \`${usedPrefix + command} start\` untuk membuka arena baru.`));
            }

            if (room.players.includes(m.sender)) {
                return m.reply(status.warning('Kamu sudah terdaftar di sesi ini. Tunggu partner bergabung atau ketik `.ular bot`!'));
            }

            room.players.push(m.sender);
            room.positions[m.sender] = 1;
            room.state = 'PLAYING';
            room.turn = 0;

            const startCard = `*──  ୨୧ ✧ ARENA ULAR TANGGA ✧ ୨୧  ──*\n\n` +
                `> @${m.sender.split('@')[0]} telah bergabung sebagai *Pemain 2 (🔵 Biru)*!\n\n` +
                `*╭  〔 ✦ ᴍ ᴀ ᴛ ᴄ ʜ  ꜱ ᴛ ᴀ ʀ ᴛ 〕*\n` +
                `*┆* ⟡ ᴘ𝟷 ʀᴇᴅ   : @${room.players[0].split('@')[0]}\n` +
                `*┆* ✧ ᴘ𝟸 ʙʟᴜᴇ  : @${room.players[1].split('@')[0]}\n` +
                `*┆* ◈ ᴛᴀʀɢᴇᴛ   : *Kotak ${toSmallNum(100)}*\n` +
                `*╰───────────────*\n\n` +
                `> ｡˚ ⊹ *ᴘᴇʀᴍᴀɪɴᴀɴ ʀᴇꜱᴍɪ ᴅɪᴍᴜʟᴀɪ! ꜱᴇʟᴀᴍᴀᴛ ʙᴇʀᴛᴀɴᴅɪɴɢ* ⊹ ˚ ｡`;

            await conn.sendMessage(chatId, {
                text: startCard,
                mentions: room.players.filter(p => p !== 'BOT')
            });

            // Render dan kirim papan awal
            const boardBuf = await renderBoard(room);
            await conn.sendMessage(chatId, {
                image: boardBuf,
                caption: `*──  ୨୧ ✧ PAPAN PERMAINAN ✧ ୨୧  ──*\n\n> Bidak telah ditempatkan pada garis awal kotak ${toSmallNum(1)}.\n> Bersiaplah untuk melempar dadu pertama!`,
                mentions: room.players.filter(p => p !== 'BOT')
            });

            // Kirim giliran pertama via Dual-Message
            await sendTurnMessage(conn, m, room);
            break;
        }

        case 'bot':
        case 'ai': {
            if (room && room.state === 'PLAYING') {
                return m.reply(status.warning('Sesi permainan sedang berlangsung.'));
            }

            conn.ulartangga[chatId] = {
                id: chatId,
                state: 'PLAYING',
                players: [m.sender, 'BOT'],
                positions: { [m.sender]: 1, 'BOT': 1 },
                turn: 0,
                timeout: null
            };
            room = conn.ulartangga[chatId];

            const botCard = `*──  ୨୧ ✧ MODE SOLO VS BOT AI ✧ ୨୧  ──*\n\n` +
                `*╭  〔 🤖 ꜱ ᴏ ʟ ᴏ  ᴍ ᴀ ᴛ ᴄ ʜ 〕*\n` +
                `*┆* ⟡ ᴘ𝟷 ʀᴇᴅ   : @${m.sender.split('@')[0]} ㋡\n` +
                `*┆* ✧ ᴘ𝟸 ʙʟᴜᴇ  : 🤖 Bot AI\n` +
                `*┆* ◈ ᴛᴀʀɢᴇᴛ   : *Kotak ${toSmallNum(100)}*\n` +
                `*╰───────────────*\n\n` +
                `> ｡˚ ⊹ *ꜱᴇʟᴀᴍᴀᴛ ʙᴇʀᴍᴀɪɴ ᴅᴀɴ ꜱᴇᴍᴏɢᴀ ʙᴇʀᴜɴᴛᴜɴɢ!* ⊹ ˚ ｡`;

            await conn.sendMessage(chatId, {
                text: botCard,
                mentions: [m.sender]
            });

            const boardBuf = await renderBoard(room);
            await conn.sendMessage(chatId, {
                image: boardBuf,
                caption: `*──  ୨୧ ✧ PAPAN PERMAINAN ✧ ୨୧  ──*\n\n> Pertandingan solo telah dimulai! Giliran pertama ada pada dirimu ♡`,
                mentions: [m.sender]
            });

            await sendTurnMessage(conn, m, room);
            break;
        }

        case 'roll':
        case 'kocok':
        case 'dadu':
        case 'r': {
            await processRoll(conn, m, m.sender);
            break;
        }

        case 'nyerah':
        case 'surrender': {
            if (!room || room.state !== 'PLAYING') {
                return m.reply(status.warning('Tidak ada permainan aktif.'));
            }

            if (!room.players.includes(m.sender)) {
                return m.reply(status.error('Kamu bukan salah satu pemain di sesi pertandingan ini.'));
            }

            const surrenderPlayer = m.sender;
            const winner = room.players.find(p => p !== surrenderPlayer) || 'BOT';

            if (room.timeout) clearTimeout(room.timeout);
            delete conn.ulartangga[chatId];

            const surrenderCard = `*──  ୨୧ ✧ ULAR TANGGA SELESAI ✧ ୨୧  ──*\n\n` +
                `*╭  〔 🏳️ ᴍ ᴇ ɴ ʏ ᴇ ʀ ᴀ ʜ 〕*\n` +
                `*┆* ⟡ ᴘᴇᴍᴀɪɴ  : @${surrenderPlayer.split('@')[0]}\n` +
                `*┆* 🏆 ᴘᴇᴍᴇɴᴀɴɢ : ${winner === 'BOT' ? '🤖 Bot AI' : '@' + winner.split('@')[0]}\n` +
                `> Permainan telah diakhiri karena pemain menyerah.\n` +
                `*╰───────────────*`;

            await conn.sendMessage(chatId, {
                text: surrenderCard,
                mentions: [surrenderPlayer, winner].filter(p => p !== 'BOT')
            });
            break;
        }

        case 'reset':
        case 'end':
        case 'stop': {
            if (!room) {
                return m.reply(status.info('Tidak ada sesi permainan Ular Tangga yang aktif di grup ini.'));
            }

            if (room.timeout) clearTimeout(room.timeout);
            delete conn.ulartangga[chatId];
            await m.reply(status.success('Sesi permainan Ular Tangga berhasil dibersihkan tuntas.'));
            break;
        }

        case 'help':
        default: {
            if (action && action !== 'help') {
                m.reply(status.warning(`Perintah tidak valid! Ketik \`${usedPrefix + command} help\` untuk melihat panduan resmi.`));
                return;
            }

            const helpCard = `*──  ୨୧ ✧ PANDUAN ULAR TANGGA ✧ ୨୧  ──*\n\n` +
                `> *こんにちわ!* (ʜᴇʟʟᴏ!)\n` +
                `> Panduan perintah resmi arena permainan Ular Tangga Celestial ♡\n\n` +
                `*╭  〔 📜 ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ᴄ ᴏ ᴍ ᴍ ᴀ ɴ ᴅ 〕*\n` +
                `*┆* ⟡ *${usedPrefix + command} start* : Buka room arena baru\n` +
                `*┆* ✧ *${usedPrefix + command} join*  : Gabung ke room yang menunggu\n` +
                `*┆* ✦ *${usedPrefix + command} bot*   : Main solo langsung lawan AI\n` +
                `*┆* ◈ *${usedPrefix + command} roll*  : Lempar dadu saat giliran\n` +
                `*┆* 🏳 *${usedPrefix + command} nyerah*: Menyerah dari pertandingan\n` +
                `*┆* ✕ *${usedPrefix + command} reset* : Bersihkan sesi yang macet\n` +
                `*╰───────────────*\n\n` +
                `*╭  〔 💡 ꜰ ɪ ᴛ ᴜ ʀ  ᴍ ᴏ ᴅ ᴇ ʀ ɴ 〕*\n` +
                `> ✦ Tombol Dual-Message otomatis aktif di layarmu saat giliran tiba!\n` +
                `> ✧ Bisa langsung ketik \`roll\` atau huruf \`r\` tanpa prefix.\n` +
                `> ⏱ Auto-timeout ${toSmallNum(90)} detik melindungi grup dari pemain AFK.\n` +
                `*╰───────────────*`;

            await m.reply(helpCard);
            break;
        }
    }
};

// Listener pesan otomatis (Bisa langsung ketik 'roll', 'kocok', 'r', 'nyerah' tanpa prefix saat game aktif)
export async function before(m) {
    if (!m.text || !this.ulartangga) return false;
    const room = this.ulartangga[m.chat];
    if (!room || room.state !== 'PLAYING') return false;

    const text = m.text.trim().toLowerCase();

    // Deteksi aksi lempar dadu cepat
    if (/^(roll|kocok|dadu|r)$/i.test(text)) {
        const currentPlayer = room.players[room.turn];
        if (m.sender !== currentPlayer) {
            await this.sendMessage(m.chat, {
                text: status.warning(`Bukan giliranmu! Saat ini giliran @${currentPlayer.split('@')[0]} untuk melangkah.`),
                mentions: [currentPlayer].filter(p => p !== 'BOT')
            });
            return true;
        }
        await processRoll(this, m, m.sender);
        return true;
    }

    // Deteksi menyerah cepat
    if (/^(nyerah|surrender)$/i.test(text)) {
        if (room.players.includes(m.sender)) {
            const winner = room.players.find(p => p !== m.sender) || 'BOT';
            if (room.timeout) clearTimeout(room.timeout);
            delete this.ulartangga[m.chat];

            const surrenderCard = `*──  ୨୧ ✧ ULAR TANGGA SELESAI ✧ ୨୧  ──*\n\n` +
                `*╭  〔 🏳️ ᴍ ᴇ ɴ ʏ ᴇ ʀ ᴀ ʜ 〕*\n` +
                `*┆* ⟡ ᴘᴇᴍᴀɪɴ  : @${m.sender.split('@')[0]}\n` +
                `*┆* 🏆 ᴘᴇᴍᴇɴᴀɴɢ : ${winner === 'BOT' ? '🤖 Bot AI' : '@' + winner.split('@')[0]}\n` +
                `> Permainan telah diakhiri karena pemain menyerah.\n` +
                `*╰───────────────*`;

            await this.sendMessage(m.chat, {
                text: surrenderCard,
                mentions: [m.sender, winner].filter(p => p !== 'BOT')
            });
            return true;
        }
    }

    return false;
}

handler.help = ['ulartangga'];
handler.tags = ['game'];
handler.command = /^(ular(tangga)?|ladders|snak(e)?)$/i;

export default handler;