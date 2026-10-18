import fs from 'fs';
import path from 'path';
import { sendDualGroupMessage } from '../../lib/dual-group-message.js';
import { status, toSmallNum } from '../../lib/style.js';

// Konfigurasi Peta Tangga & Ular Sesuai Papan Ilustrasi HD Asli (media/ulartangga_board.jpg)
const SNAKES_AND_LADDERS = [
    // 🪜 Tangga (Naik)
    { start: 4, end: 25, type: 'ladder' },
    { start: 21, end: 39, type: 'ladder' },
    { start: 29, end: 74, type: 'ladder' },
    { start: 43, end: 76, type: 'ladder' },
    { start: 63, end: 80, type: 'ladder' },
    { start: 71, end: 89, type: 'ladder' },

    // 🐍 Ular (Turun)
    { start: 30, end: 7, type: 'snake' },
    { start: 47, end: 15, type: 'snake' },
    { start: 56, end: 19, type: 'snake' },
    { start: 73, end: 51, type: 'snake' },
    { start: 82, end: 42, type: 'snake' },
    { start: 92, end: 75, type: 'snake' },
    { start: 98, end: 55, type: 'snake' }
];

const LADDER_STARTS = new Set(SNAKES_AND_LADDERS.filter(s => s.type === 'ladder').map(s => s.start));
const SNAKE_STARTS = new Set(SNAKES_AND_LADDERS.filter(s => s.type === 'snake').map(s => s.start));

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

// Helper: Hapus pesan bot sebelumnya agar ruang obrolan bersih & hemat memori HP
async function deletePreviousMessages(conn, chatId, room) {
    if (!room || !Array.isArray(room.lastMsgKeys) || room.lastMsgKeys.length === 0) return;
    const keysToDelete = [...room.lastMsgKeys];
    room.lastMsgKeys = [];
    for (const key of keysToDelete) {
        try {
            if (key) await conn.sendMessage(chatId, { delete: key });
        } catch {
            // Abaikan bila pesan sudah terhapus atau dibersihkan
        }
    }
}

// Render Papan Ular Tangga Realistis (Gambar Latar HD Zig-Zag + Bidak Pion 3D Klasik)
export async function renderBoard(room) {
    try {
        const { createCanvas, loadImage } = await import('@napi-rs/canvas');
        const boardSize = 1000;
        const canvas = createCanvas(boardSize, boardSize);
        const ctx = canvas.getContext('2d');

        // 1. Muat Template Gambar Papan Ilustrasi HD Asli (media/ulartangga_board.jpg)
        const boardImagePath = path.join(process.cwd(), 'media', 'ulartangga_board.jpg');
        if (fs.existsSync(boardImagePath)) {
            const boardImg = await loadImage(boardImagePath);
            ctx.drawImage(boardImg, 0, 0, boardSize, boardSize);
        } else {
            // Fallback latar belakang jika gambar belum tersedia
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, boardSize, boardSize);
        }

        // 2. Kalkulasi Koordinat Grid 10x10 Papan Asli Zig-Zag (100px per petak)
        // Baris 1 (bawah): 1 - 10 (kiri ke kanan)
        // Baris 2: 11 - 20 (kanan ke kiri, 11 di atas 10)
        // Baris 3: 21 - 30 (kiri ke kanan, 21 di atas 20)
        // ...
        // Baris 10 (atas): 91 - 100 (kanan ke kiri, 100 di kiri atas)
        const tileSize = boardSize / 10;
        const getCoords = (pos) => {
            const safePos = Math.max(1, Math.min(100, pos));
            const row = Math.floor((safePos - 1) / 10);
            let col = (safePos - 1) % 10;
            // Baris ganjil berbalik arah (zig-zag / Boustrophedon resmi)
            if (row % 2 === 1) {
                col = 9 - col;
            }
            const x = col * tileSize + tileSize / 2;
            const y = (9 - row) * tileSize + tileSize / 2;
            return { x, y };
        };

        // 3. Gambar Bidak Pion 3D Klasik Asli (Authentic Plastic Board Game Pawn)
        const drawClassicPawn = (pos, pIdx, colorBase, colorLight, colorDark, label, isActive = false) => {
            const c = getCoords(pos);
            const sameCell = room.positions[room.players[0]] === room.positions[room.players[1]];
            const px = c.x + (sameCell ? (pIdx === 0 ? -tileSize * 0.22 : tileSize * 0.22) : (pIdx === 0 ? -12 : 12));
            const py = c.y + 6;
            const size = 78;

            ctx.save();

            // A. Bayangan kontak di lantai petak (ambient occlusion & soft drop shadow)
            ctx.beginPath();
            ctx.ellipse(px + 4, py + size * 0.42, size * 0.38, size * 0.14, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.filter = 'blur(4px)';
            ctx.fill();
            ctx.filter = 'none';

            // B. Lingkaran Aura Cahaya & Tag Giliran jika pemain aktif
            if (isActive) {
                ctx.beginPath();
                ctx.ellipse(px, py + size * 0.36, size * 0.46, size * 0.18, 0, 0, Math.PI * 2);
                ctx.strokeStyle = '#fde047';
                ctx.lineWidth = 3.5;
                ctx.shadowColor = '#fde047';
                ctx.shadowBlur = 12;
                ctx.stroke();

                // Indikator panah giliran melayang ▼
                ctx.fillStyle = '#fde047';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 4;
                const arrowY = py - size * 0.62;
                ctx.beginPath();
                ctx.moveTo(px, arrowY + 8);
                ctx.lineTo(px - 7, arrowY);
                ctx.lineTo(px + 7, arrowY);
                ctx.closePath();
                ctx.fill();

                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText('GILIRAN', px, arrowY - 2);
            }

            // C. Alas Piringan Pedestal
            const baseY = py + size * 0.28;
            const baseW = size * 0.34;
            const baseH = size * 0.13;

            // Ketebalan rim alas
            const rimGrad = ctx.createLinearGradient(px - baseW, baseY, px + baseW, baseY);
            rimGrad.addColorStop(0, colorDark);
            rimGrad.addColorStop(0.3, colorLight);
            rimGrad.addColorStop(0.7, colorBase);
            rimGrad.addColorStop(1, colorDark);

            ctx.beginPath();
            ctx.ellipse(px, baseY + 5, baseW, baseH, 0, 0, Math.PI);
            ctx.lineTo(px - baseW, baseY);
            ctx.ellipse(px, baseY, baseW, baseH, 0, Math.PI, 0, true);
            ctx.closePath();
            ctx.fillStyle = colorDark;
            ctx.fill();

            // Piringan atas alas
            ctx.beginPath();
            ctx.ellipse(px, baseY, baseW, baseH, 0, 0, Math.PI * 2);
            ctx.fillStyle = rimGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // D. Badan Kerucut Menjulang (Flared Cone Body)
            const neckY = py - size * 0.1;
            const neckW = size * 0.11;

            const bodyGrad = ctx.createLinearGradient(px - baseW, py, px + baseW, py);
            bodyGrad.addColorStop(0, colorDark);
            bodyGrad.addColorStop(0.25, colorLight);
            bodyGrad.addColorStop(0.65, colorBase);
            bodyGrad.addColorStop(1, colorDark);

            ctx.beginPath();
            ctx.moveTo(px - neckW, neckY);
            ctx.bezierCurveTo(px - neckW * 0.8, py + size * 0.1, px - baseW * 0.85, baseY - 2, px - baseW * 0.85, baseY);
            ctx.lineTo(px + baseW * 0.85, baseY);
            ctx.bezierCurveTo(px + baseW * 0.85, baseY - 2, px + neckW * 0.8, py + size * 0.1, px + neckW, neckY);
            ctx.closePath();
            ctx.fillStyle = bodyGrad;
            ctx.fill();

            // E. Cincin Leher (Neck Collar Ring)
            const collarGrad = ctx.createLinearGradient(px - neckW * 1.35, neckY, px + neckW * 1.35, neckY);
            collarGrad.addColorStop(0, colorDark);
            collarGrad.addColorStop(0.4, colorLight);
            collarGrad.addColorStop(1, colorDark);

            ctx.beginPath();
            ctx.ellipse(px, neckY, neckW * 1.4, size * 0.048, 0, 0, Math.PI * 2);
            ctx.fillStyle = collarGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // F. Kepala Bola Bulat Mengkilap (Glossy Sphere Head)
            const headY = py - size * 0.32;
            const headR = size * 0.2;

            const headGrad = ctx.createRadialGradient(
                px - headR * 0.35, headY - headR * 0.35, headR * 0.08,
                px, headY, headR
            );
            headGrad.addColorStop(0, '#ffffff'); // Specular highlight glint
            headGrad.addColorStop(0.25, colorLight);
            headGrad.addColorStop(0.7, colorBase);
            headGrad.addColorStop(1, colorDark);

            ctx.beginPath();
            ctx.arc(px, headY, headR, 0, Math.PI * 2);
            ctx.fillStyle = headGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // G. Label Pemain pada Bodi Pion
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold ' + Math.round(size * 0.15) + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillText(label, px, py + size * 0.13);

            ctx.restore();
        };

        const pos1 = room.positions[room.players[0]] || 1;
        const pos2 = room.positions[room.players[1]] || 1;
        const isTurnP1 = room.turn === 0;

        drawClassicPawn(pos1, 0, '#dc2626', '#f87171', '#7f1d1d', 'P1', isTurnP1);
        if (room.players[1]) {
            drawClassicPawn(pos2, 1, '#2563eb', '#60a5fa', '#1e3a8a', 'P2', !isTurnP1);
        }

        return await canvas.encode('png');
    } catch (err) {
        console.warn('[ULAR TANGGA] Board render error:', err?.message);
        throw err;
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

        // Hapus pesan-pesan gambar & tombol sebelumnya
        await deletePreviousMessages(conn, chatId, room);

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
        const sentBot = await conn.sendMessage(m.chat, {
            text: botTurnText,
            mentions: room.players.filter(p => p !== 'BOT')
        });
        if (sentBot?.key) {
            room.lastMsgKeys = room.lastMsgKeys || [];
            room.lastMsgKeys.push(sentBot.key);
        }
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

            const sentDual = await sendDualGroupMessage(conn, m.chat, currentPlayer, built.message, spectatorText, {
                contextInfo: {
                    mentionedJid: room.players.filter(p => p !== 'BOT')
                }
            });
            if (sentDual?.key) {
                room.lastMsgKeys = room.lastMsgKeys || [];
                room.lastMsgKeys.push(sentDual.key);
            }
        } else {
            const sentStandard = await conn.sendMessage(m.chat, {
                text: bodyText,
                mentions: room.players.filter(p => p !== 'BOT')
            });
            if (sentStandard?.key) {
                room.lastMsgKeys = room.lastMsgKeys || [];
                room.lastMsgKeys.push(sentStandard.key);
            }
        }
    } catch (err) {
        console.warn('[ULAR TANGGA] Dual message failed, fallback to standard text:', err?.message);
        const sentFallback = await conn.sendMessage(m.chat, {
            text: bodyText,
            mentions: room.players.filter(p => p !== 'BOT')
        });
        if (sentFallback?.key) {
            room.lastMsgKeys = room.lastMsgKeys || [];
            room.lastMsgKeys.push(sentFallback.key);
        }
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

    // 1. Hapus pesan gambar dan tombol sebelumnya agar chat grup bersih & hemat memori HP
    await deletePreviousMessages(conn, m.chat, room);

    // 2. Render Gambar Papan Terbaru HD Zig-Zag
    const boardBuffer = await renderBoard(room);

    // 3. Kirim gambar papan terbaru beserta status lemparan
    const sentBoard = await conn.sendMessage(m.chat, {
        image: boardBuffer,
        caption: resultCard,
        mentions: [currentPlayer].filter(p => p !== 'BOT')
    });
    if (sentBoard?.key) {
        room.lastMsgKeys = room.lastMsgKeys || [];
        room.lastMsgKeys.push(sentBoard.key);
    }

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
            `> Selamat kepada pemenang! Berhasil menaklukkan arena Ular Tangga dengan gemilang ♡\n` +
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
                timeout: null,
                lastMsgKeys: []
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
            room.lastMsgKeys = [];

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

            // Render dan kirim papan awal HD Zig-Zag
            const boardBuf = await renderBoard(room);
            const sentBoard = await conn.sendMessage(chatId, {
                image: boardBuf,
                caption: `*──  ୨୧ ✧ PAPAN PERMAINAN ✧ ୨୧  ──*\n\n> Bidak telah ditempatkan pada garis awal kotak ${toSmallNum(1)}.\n> Bersiaplah untuk melempar dadu pertama!`,
                mentions: room.players.filter(p => p !== 'BOT')
            });
            if (sentBoard?.key) room.lastMsgKeys.push(sentBoard.key);

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
                timeout: null,
                lastMsgKeys: []
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
            const sentBoard = await conn.sendMessage(chatId, {
                image: boardBuf,
                caption: `*──  ୨୧ ✧ PAPAN PERMAINAN ✧ ୨୧  ──*\n\n> Pertandingan solo telah dimulai! Giliran pertama ada pada dirimu ♡`,
                mentions: [m.sender]
            });
            if (sentBoard?.key) room.lastMsgKeys.push(sentBoard.key);

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
            await deletePreviousMessages(conn, chatId, room);
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
            await deletePreviousMessages(conn, chatId, room);
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
                `> ✦ Desain grafis papan modern HD prosedural dengan efek 3D & bayangan halus.\n` +
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
            await deletePreviousMessages(this, m.chat, room);
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