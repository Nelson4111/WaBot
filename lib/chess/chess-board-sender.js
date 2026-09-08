import axios from 'axios';
import chalk from 'chalk';

/**
 * Sends a rich WhatsApp message containing the visual board,
 * interactive CTA URL button to the HTML5 Mini App,
 * interactive dropdown single_select with legal moves,
 * and quick reply surrender button.
 */
export async function sendChessBoard(conn, chatId, gameData, sessionKey, quoted = null) {
    if (!conn || !chatId || !gameData?.instance) return;

    const game = gameData.instance;
    const fen = encodeURIComponent(game.fen());
    const turn = game.turn();
    const flip = turn === 'b' ? '&flip=true' : '';
    const boardUrl = `https://www.chess.com/dynboard?fen=${fen}&size=3&coordinates=inside${flip}`;

    const p1 = gameData.player1.split('@')[0];
    const p2 = gameData.player2 === 'BOT' ? '🤖 Bot AI' : gameData.player2.split('@')[0];
    const nextJid = turn === 'w' ? gameData.player1 : gameData.player2;
    const nextName = nextJid === 'BOT' ? '🤖 Bot AI' : `@${nextJid.split('@')[0]}`;
    const colorName = turn === 'w' ? 'Putih ⚪' : 'Hitam ⚫';

    let caption = `♟️ *CATUR INTERAKTIF (AVELIA)*\n\n`;
    caption += `⚪ *Putih:* @${p1}\n`;
    caption += `⚫ *Hitam:* ${p2.startsWith('🤖') ? p2 : '@' + p2}\n`;
    caption += `🚩 *Giliran:* ${nextName} (${colorName})\n\n`;

    const inCheck = typeof game.inCheck === 'function' ? game.inCheck() : (typeof game.in_check === 'function' ? game.in_check() : false);
    if (inCheck) {
        caption += `⚠️ *PERINGATAN:* RAJA DALAM POSISI SKAK (CHECK)!\n\n`;
    }

    caption += `💡 _Kalian bisa bermain via Papan Interaktif Web (drag & drop) atau pilih langkah langsung dari menu dropdown di bawah._`;

    const footer = 'Avelia • Mini Game HTML5';

    // 1. Download Board Image
    let imageBuffer = null;
    try {
        const resp = await axios.get(boardUrl, { responseType: 'arraybuffer', timeout: 8000 });
        if (resp.status === 200 && resp.data) {
            imageBuffer = Buffer.from(resp.data);
        }
    } catch (err) {
        console.warn(chalk.yellow(`[ChessBoard] Gagal unduh gambar dynboard, fallback ke teks: ${err.message}`));
    }

    // 2. Prepare Legal Move Rows for Single-Select Dropdown
    const legalMoves = game.moves({ verbose: true }) || [];
    const moveRows = legalMoves.slice(0, 18).map(m => ({
        header: `Bidak: ${m.piece.toUpperCase()}`,
        title: `${m.from} ➔ ${m.to} (${m.san})`,
        description: `Langkah legal catur: ${m.san}`,
        id: `${m.from}${m.to}`
    }));

    const webBaseUrl = global.serverUrl || `http://localhost:${process.env.PORT || 3000}`;
    const interactiveWebUrl = `${webBaseUrl}/chess/${encodeURIComponent(sessionKey)}`;

    // 3. Build Interactive Native Flow Buttons
    const buttons = [
        // CTA URL Button: Opens HTML5 Mini App in in-app browser
        {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: '🎮 Buka Papan Interaktif (HTML5)',
                url: interactiveWebUrl,
                merchant_url: interactiveWebUrl
            })
        }
    ];

    // Add legal moves dropdown if moves are available
    if (moveRows.length > 0) {
        buttons.push({
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: '♟️ Pilih Langkah Catur',
                sections: [
                    {
                        title: `Pilihan Langkah (${colorName})`,
                        highlight_label: 'Legal',
                        rows: moveRows
                    }
                ]
            })
        });
    }

    // Add Surrender button
    buttons.push(['🏳️ Menyerah', '.chess nyerah']);

    // Mentions
    const mentions = [gameData.player1, gameData.player2].filter(v => v && v !== 'BOT');

    try {
        await conn.sendButton(
            chatId,
            caption,
            footer,
            imageBuffer,
            buttons,
            quoted,
            { mentions }
        );
    } catch (sendErr) {
        console.error(chalk.red(`[sendChessBoard Error]: ${sendErr.message}`));
        try {
            if (imageBuffer) {
                await conn.sendMessage(chatId, { image: imageBuffer, caption, mentions }, { quoted });
            } else {
                await conn.sendMessage(chatId, { text: caption, mentions }, { quoted });
            }
        } catch {
            await conn.sendMessage(chatId, { text: caption, mentions }, { quoted }).catch(() => {});
        }
    }
}
