import { renderChessHtml } from './chess-template.js';
import { sendChessBoard } from './chess-board-sender.js';
import chalk from 'chalk';

/**
 * Mounts interactive chess endpoints onto the Express app instance.
 * @param {import('express').Express} app 
 */
export default function initChessServer(app) {
    if (!app) return;

    // 1. Interactive HTML5 WebApp page
    app.get('/chess/:sessionId', (req, res) => {
        const { sessionId } = req.params;
        global.chess = global.chess || {};
        const gameData = global.chess[sessionId];

        if (!gameData || !gameData.instance) {
            return res.status(404).send(`<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sesi Tidak Ditemukan</title>
    <style>
        body { font-family: sans-serif; background: #0f172a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; }
        .card { background: #1e293b; padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); max-width: 400px; }
        h2 { color: #f87171; margin-bottom: 12px; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="card">
        <h2>❌ Sesi Catur Tidak Ditemukan</h2>
        <p>Permainan ini mungkin sudah selesai, dibatalkan, atau belum dimulai.<br><br>Ketik <b>.chess bot</b> atau <b>.chess @nomor</b> di WhatsApp untuk memulai pertandingan baru.</p>
    </div>
</body>
</html>`);
        }

        const html = renderChessHtml(sessionId, gameData);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    });

    // 2. GET Game State API
    app.get('/api/chess/:sessionId', (req, res) => {
        const { sessionId } = req.params;
        global.chess = global.chess || {};
        const gameData = global.chess[sessionId];

        if (!gameData || !gameData.instance) {
            return res.status(404).json({ success: false, error: 'Sesi catur tidak ditemukan.' });
        }

        const game = gameData.instance;
        res.json({
            success: true,
            sessionId,
            fen: game.fen(),
            turn: game.turn(),
            player1: gameData.player1,
            player2: gameData.player2,
            status: gameData.status,
            botMode: !!gameData.botMode,
            isGameOver: game.isGameOver ? game.isGameOver() : (game.game_over ? game.game_over() : false),
            inCheck: game.in_check ? game.in_check() : false,
            isCheckmate: game.in_checkmate ? game.in_checkmate() : false,
            isDraw: game.in_draw ? game.in_draw() : false,
            moves: game.moves ? game.moves() : []
        });
    });

    // 3. POST Move API (executed from HTML5 WebApp)
    app.post('/api/chess/:sessionId/move', async (req, res) => {
        const { sessionId } = req.params;
        const { from, to, promotion = 'q' } = req.body || {};

        global.chess = global.chess || {};
        const gameData = global.chess[sessionId];

        if (!gameData || !gameData.instance) {
            return res.status(404).json({ success: false, error: 'Sesi catur tidak ditemukan atau telah selesai.' });
        }

        if (gameData.status !== 'PLAYING') {
            return res.status(400).json({ success: false, error: 'Permainan belum dalam status bermain.' });
        }

        const game = gameData.instance;

        try {
            let move;
            try {
                move = game.move({ from, to, promotion });
            } catch (moveErr) {
                return res.status(400).json({ success: false, error: moveErr.message || 'Langkah ilegal menurut aturan catur!' });
            }

        if (!move) {
            return res.status(400).json({ success: false, error: 'Langkah ilegal menurut aturan catur!' });
        }

            console.log(chalk.green(`[Chess Web Move] Sesi: ${sessionId} | Langkah: ${from} ➔ ${to} (${move.san})`));

            // If Bot Mode and game not over -> AI executes an automatic move
            let botMoveMade = null;
            if (gameData.botMode && !game.isGameOver()) {
                const legalMoves = game.moves();
                if (legalMoves.length > 0) {
                    // Pick a random legal move (or capture if possible)
                    const captures = game.moves({ verbose: true }).filter(m => m.captured);
                    const selectedBotMove = captures.length > 0 
                        ? captures[Math.floor(Math.random() * captures.length)].san
                        : legalMoves[Math.floor(Math.random() * legalMoves.length)];

                    const botMove = game.move(selectedBotMove);
                    botMoveMade = botMove?.san;
                    console.log(chalk.cyan(`[Chess Bot AI Move] Langkah Bot: ${botMoveMade}`));
                }
            }

            const isGameOver = game.isGameOver ? game.isGameOver() : (game.game_over ? game.game_over() : false);

            // Broadcast board update to WhatsApp chat in background
            if (global.conn && gameData.chatId) {
                setTimeout(async () => {
                    try {
                        if (isGameOver) {
                            const isCheckmate = typeof game.isCheckmate === 'function' ? game.isCheckmate() : (typeof game.in_checkmate === 'function' ? game.in_checkmate() : false);
                            const resText = isCheckmate ? '🏁 *SKAKMAT! PERMAINAN SELESAI*' : '🤝 *REMIS (DRAW)! PERMAINAN SELESAI*';
                            await global.conn.sendMessage(gameData.chatId, { text: `♟️ ${resText}` });
                            delete global.chess[sessionId];
                        } else {
                            await sendChessBoard(global.conn, gameData.chatId, gameData, sessionId);
                        }
                    } catch (notifyErr) {
                        console.error('[Chess Notify WA Error]:', notifyErr.message);
                    }
                }, 100);
            }

            return res.json({
                success: true,
                fen: game.fen(),
                turn: game.turn(),
                move: move.san,
                botMove: botMoveMade,
                isGameOver
            });

        } catch (err) {
            console.error('[Chess Move Exception]:', err);
            return res.status(500).json({ success: false, error: err.message || 'Gagal mengeksekusi langkah' });
        }
    });

    // 4. POST Surrender API
    app.post('/api/chess/:sessionId/surrender', async (req, res) => {
        const { sessionId } = req.params;
        global.chess = global.chess || {};
        const gameData = global.chess[sessionId];

        if (!gameData) {
            return res.status(404).json({ success: false, error: 'Sesi catur tidak ditemukan.' });
        }

        if (global.conn && gameData.chatId) {
            await global.conn.sendMessage(gameData.chatId, {
                text: `🏳️ *CATUR BERAKHIR*\n\nPemain menyerah melalui Web App.\nPermainan catur telah selesai.`
            }).catch(() => {});
        }

        delete global.chess[sessionId];
        return res.json({ success: true, message: 'Permainan berhasil diakhiri.' });
    });

    console.log(chalk.green('♟️ [CHESS SERVER] Endpoints /chess/:sessionId & /api/chess/:sessionId berhasil dimuat!'));
}
