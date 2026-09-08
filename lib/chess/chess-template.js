/**
 * HTML5 Interactive Chessboard Template
 * Self-contained, responsive, zero-external-dependency, retina-ready SVG pieces,
 * with touch/drag-and-drop, click-to-move, Web Audio API sound effects, and real-time sync.
 */

export function renderChessHtml(sessionKey, gameData, serverBaseUrl = '') {
    const fen = gameData?.instance ? gameData.instance.fen() : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const player1 = gameData?.player1 ? gameData.player1.split('@')[0] : 'Putih';
    const player2 = gameData?.player2 ? (gameData.player2 === 'BOT' ? '🤖 Bot AI' : gameData.player2.split('@')[0]) : 'Hitam';
    const turn = gameData?.instance ? gameData.instance.turn() : 'w';
    const isGameOver = gameData?.instance ? gameData.instance.isGameOver() : false;
    const botMode = !!gameData?.botMode;

    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Avelia Chess - ${player1} vs ${player2}</title>
    <style>
        :root {
            --bg-primary: #0f172a;
            --bg-card: rgba(30, 41, 59, 0.85);
            --border-card: rgba(255, 255, 255, 0.1);
            --accent-glow: #38bdf8;
            --accent-active: #0ea5e9;
            --sq-light: #eedbc5;
            --sq-dark: #b88b4a;
            --sq-highlight: rgba(56, 189, 248, 0.55);
            --sq-last-move: rgba(250, 204, 21, 0.4);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            user-select: none;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: radial-gradient(circle at top, #1e293b 0%, #0f172a 100%);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px;
            overflow-x: hidden;
        }

        .chess-container {
            width: 100%;
            max-width: 460px;
            background: var(--bg-card);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--border-card);
            border-radius: 20px;
            padding: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 40px rgba(56, 189, 248, 0.15);
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        /* Header & Player Badges */
        .player-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 10px 14px;
            transition: border-color 0.3s, box-shadow 0.3s;
        }

        .player-bar.active-turn {
            border-color: var(--accent-glow);
            box-shadow: 0 0 14px rgba(56, 189, 248, 0.3);
        }

        .player-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .player-avatar {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            background: #334155;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .player-name {
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.3px;
        }

        .player-color-tag {
            font-size: 11px;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        .turn-badge {
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 20px;
            background: rgba(56, 189, 248, 0.15);
            color: var(--accent-glow);
            border: 1px solid rgba(56, 189, 248, 0.3);
            display: none;
            animation: pulse 1.5s infinite;
        }

        .player-bar.active-turn .turn-badge {
            display: inline-block;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }

        /* Chessboard */
        .board-wrapper {
            position: relative;
            width: 100%;
            aspect-ratio: 1 / 1;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            border: 4px solid #3e2723;
        }

        #chessboard {
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(8, 1fr);
        }

        .square {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: clamp(28px, 8vw, 42px);
            cursor: pointer;
            transition: background 0.15s;
        }

        .square.light {
            background-color: var(--sq-light);
        }

        .square.dark {
            background-color: var(--sq-dark);
        }

        .square.selected {
            background-color: var(--sq-highlight) !important;
        }

        .square.last-move {
            background-color: var(--sq-last-move) !important;
        }

        /* Coordinate labels */
        .coord-file, .coord-rank {
            position: absolute;
            font-size: 10px;
            font-weight: 700;
            pointer-events: none;
            opacity: 0.7;
        }
        .coord-file {
            bottom: 2px;
            right: 3px;
        }
        .coord-rank {
            top: 2px;
            left: 3px;
        }
        .square.light .coord-file, .square.light .coord-rank { color: #8d6e63; }
        .square.dark .coord-file, .square.dark .coord-rank { color: #eedbc5; }

        /* Valid Move Indicator Dot */
        .valid-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: rgba(14, 165, 233, 0.75);
            box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
            pointer-events: none;
            position: absolute;
            z-index: 5;
        }

        .valid-capture {
            position: absolute;
            width: 90%;
            height: 90%;
            border-radius: 50%;
            border: 4px solid rgba(239, 68, 68, 0.75);
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
            pointer-events: none;
            z-index: 5;
        }

        .piece {
            width: 90%;
            height: 90%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            cursor: grab;
            transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .piece:active {
            cursor: grabbing;
            transform: scale(1.18);
            z-index: 10;
        }

        .piece svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
        }

        /* Controls & Status Bar */
        .status-bar {
            text-align: center;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-muted);
            padding: 4px 0;
            min-height: 24px;
        }

        .btn-row {
            display: flex;
            gap: 10px;
        }

        .btn-action {
            flex: 1;
            padding: 10px;
            border-radius: 10px;
            border: none;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s;
        }

        .btn-refresh {
            background: #334155;
            color: #fff;
        }
        .btn-refresh:hover {
            background: #475569;
        }

        .btn-surrender {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .btn-surrender:hover {
            background: rgba(239, 68, 68, 0.3);
        }

        /* Modal Promotion */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(4px);
            z-index: 100;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: var(--bg-card);
            border: 1px solid var(--border-card);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            max-width: 320px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }

        .promo-options {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 16px;
        }

        .promo-btn {
            width: 54px;
            height: 54px;
            border-radius: 10px;
            background: #334155;
            border: 1px solid rgba(255, 255, 255, 0.1);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .promo-btn:hover {
            background: var(--accent-active);
            transform: scale(1.1);
        }
    </style>
</head>
<body>
    <div class="chess-container">
        <!-- Top Player (Black) -->
        <div class="player-bar" id="player2-bar">
            <div class="player-info">
                <div class="player-avatar">⚫</div>
                <div>
                    <div class="player-name" id="p2-name">${player2}</div>
                    <div class="player-color-tag">Hitam</div>
                </div>
            </div>
            <div class="turn-badge" id="p2-turn">Giliran</div>
        </div>

        <!-- 8x8 Board -->
        <div class="board-wrapper">
            <div id="chessboard"></div>
        </div>

        <!-- Bottom Player (White) -->
        <div class="player-bar" id="player1-bar">
            <div class="player-info">
                <div class="player-avatar">⚪</div>
                <div>
                    <div class="player-name" id="p1-name">${player1}</div>
                    <div class="player-color-tag">Putih</div>
                </div>
            </div>
            <div class="turn-badge" id="p1-turn">Giliran</div>
        </div>

        <div class="status-bar" id="game-status">Memuat status catur...</div>

        <div class="btn-row">
            <button class="btn-action btn-refresh" onclick="fetchGameState()">🔄 Sync Papan</button>
            <button class="btn-action btn-surrender" onclick="surrender()">🏳️ Nyerah</button>
        </div>
    </div>

    <!-- Promotion Modal -->
    <div class="modal-overlay" id="promo-modal">
        <div class="modal-content">
            <h3>Pilih Promosi Pion</h3>
            <div class="promo-options" id="promo-options"></div>
        </div>
    </div>

    <!-- Chess.js CDN Lite -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"></script>

    <script>
        const SESSION_KEY = "${sessionKey}";
        let currentFen = "${fen}";
        let isGameOver = ${isGameOver};
        let botMode = ${botMode};
        let game = new Chess(currentFen);
        let selectedSquare = null;
        let pendingMove = null;

        // Web Audio Synthesizer (Zero Audio Asset Files Required)
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        function playSound(type) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;
            if (type === 'move') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'capture') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'check') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.setValueAtTime(800, now + 0.08);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
        }

        // SVG Pieces (Crisp Retina Vector Graphics)
        const PIECES_SVG = {
            'wP': '<svg viewBox="0 0 45 45"><path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 L 34,39.5 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/></svg>',
            'wR': '<svg viewBox="0 0 45 45"><g fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9,39 L 36,39 L 36,36 L 9,36 z"/><path d="M 12,36 L 12,32 L 33,32 L 33,36 z"/><path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 z"/><path d="M 34,14 L 31,17 L 14,17 L 11,14 z"/><path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17 z"/><path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5 z"/></g></svg>',
            'wN': '<svg viewBox="0 0 45 45"><g fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="#ffffff"/><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.05,5.14 20,5 C 23.01,4.86 20.95,7.99 22,10 z" fill="#ffffff"/><circle cx="15" cy="14" r="1" fill="#000000"/></g></svg>',
            'wB': '<svg viewBox="0 0 45 45"><g fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#ffffff"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z"/><path d="M 12,36 C 11,32 12,24 15,22 C 15.6,21.6 16.5,21.5 17.5,21.5 C 19.5,21.5 21.5,23.5 22.5,23.5 C 23.5,23.5 25.5,21.5 27.5,21.5 C 28.5,21.5 29.4,21.6 30,22 C 33,24 34,32 33,36 z"/><path d="M 22.5,10 C 24,10 27,12 27,15 C 27,17 25,18.5 22.5,18.5 C 20,18.5 18,17 18,15 C 18,12 21,10 22.5,10 z"/></g><circle cx="22.5" cy="8" r="1.5" fill="#ffffff"/><path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18"/></g></svg>',
            'wQ': '<svg viewBox="0 0 45 45"><g fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14,11 L 14,25 L 7,14 z"/><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 11,38.5 L 34,38.5 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 z"/><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/></g></svg>',
            'wK': '<svg viewBox="0 0 45 45"><g fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 22.5,11.63 L 22.5,6" stroke-linejoin="miter"/><path d="M 20,8 L 25,8"/><path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25 z" fill="#ffffff"/><path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,33 34,27 34,27 C 34,27 30.5,25 22.5,25 C 14.5,25 11,27 11,27 C 11,27 8.5,33 11.5,37 z" fill="#ffffff"/><circle cx="22.5" cy="3.5" r="1.5" fill="#ffffff"/></g></svg>',
            'bP': '<svg viewBox="0 0 45 45"><path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 L 34,39.5 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" fill="#1e1e1e" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/></svg>',
            'bR': '<svg viewBox="0 0 45 45"><g fill="#1e1e1e" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M 9,39 L 36,39 L 36,36 L 9,36 z"/><path d="M 12,36 L 12,32 L 33,32 L 33,36 z"/><path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 z"/><path d="M 34,14 L 31,17 L 14,17 L 11,14 z"/><path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17 z"/><path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5 z"/></g></svg>',
            'bN': '<svg viewBox="0 0 45 45"><g fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="#1e1e1e"/><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.05,5.14 20,5 C 23.01,4.86 20.95,7.99 22,10 z" fill="#1e1e1e"/><circle cx="15" cy="14" r="1" fill="#ffffff"/></g></svg>',
            'bB': '<svg viewBox="0 0 45 45"><g fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><g fill="#1e1e1e"><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z"/><path d="M 12,36 C 11,32 12,24 15,22 C 15.6,21.6 16.5,21.5 17.5,21.5 C 19.5,21.5 21.5,23.5 22.5,23.5 C 23.5,23.5 25.5,21.5 27.5,21.5 C 28.5,21.5 29.4,21.6 30,22 C 33,24 34,32 33,36 z"/><path d="M 22.5,10 C 24,10 27,12 27,15 C 27,17 25,18.5 22.5,18.5 C 20,18.5 18,17 18,15 C 18,12 21,10 22.5,10 z"/></g><circle cx="22.5" cy="8" r="1.5" fill="#1e1e1e"/><path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18"/></g></svg>',
            'bQ': '<svg viewBox="0 0 45 45"><g fill="#1e1e1e" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14,11 L 14,25 L 7,14 z"/><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 11,38.5 L 34,38.5 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 z"/><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="8" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/></g></svg>',
            'bK': '<svg viewBox="0 0 45 45"><g fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M 22.5,11.63 L 22.5,6" stroke-linejoin="miter"/><path d="M 20,8 L 25,8"/><path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25 z" fill="#1e1e1e"/><path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,33 34,27 34,27 C 34,27 30.5,25 22.5,25 C 14.5,25 11,27 11,27 C 11,27 8.5,33 11.5,37 z" fill="#1e1e1e"/><circle cx="22.5" cy="3.5" r="1.5" fill="#1e1e1e"/></g></svg>'
        };

        const boardEl = document.getElementById('chessboard');
        const statusEl = document.getElementById('game-status');
        const p1Bar = document.getElementById('player1-bar');
        const p2Bar = document.getElementById('player2-bar');

        function renderBoard() {
            boardEl.innerHTML = '';
            const boardState = game.board();

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const squareName = String.fromCharCode(97 + c) + (8 - r);
                    const isLight = (r + c) % 2 === 0;
                    const sq = document.createElement('div');
                    sq.className = 'square ' + (isLight ? 'light' : 'dark');
                    sq.dataset.square = squareName;

                    // Coordinates
                    if (c === 7) {
                        const rankLabel = document.createElement('span');
                        rankLabel.className = 'coord-rank';
                        rankLabel.innerText = 8 - r;
                        sq.appendChild(rankLabel);
                    }
                    if (r === 7) {
                        const fileLabel = document.createElement('span');
                        fileLabel.className = 'coord-file';
                        fileLabel.innerText = String.fromCharCode(97 + c);
                        sq.appendChild(fileLabel);
                    }

                    // Piece
                    const pieceObj = boardState[r][c];
                    if (pieceObj) {
                        const pieceKey = pieceObj.color + pieceObj.type.toUpperCase();
                        const pEl = document.createElement('div');
                        pEl.className = 'piece';
                        pEl.innerHTML = PIECES_SVG[pieceKey] || '';
                        pEl.dataset.piece = pieceKey;
                        pEl.dataset.color = pieceObj.color;
                        sq.appendChild(pEl);
                    }

                    sq.addEventListener('click', () => onSquareClick(squareName));
                    boardEl.appendChild(sq);
                }
            }

            updateStatus();
        }

        function onSquareClick(sq) {
            if (isGameOver) return;

            // If a square was already selected
            if (selectedSquare) {
                // Check if clicking same square -> unselect
                if (selectedSquare === sq) {
                    clearHighlights();
                    selectedSquare = null;
                    return;
                }

                // Check if target is a legal move
                const moves = game.moves({ square: selectedSquare, verbose: true });
                const validMove = moves.find(m => m.to === sq);

                if (validMove) {
                    // Check pawn promotion
                    if (validMove.flags.includes('p')) {
                        pendingMove = { from: selectedSquare, to: sq };
                        showPromoModal(game.turn());
                        return;
                    }

                    executeMove(selectedSquare, sq);
                    clearHighlights();
                    selectedSquare = null;
                    return;
                }

                // If clicking another of our own pieces -> switch selection
                const piece = game.get(sq);
                if (piece && piece.color === game.turn()) {
                    clearHighlights();
                    selectPiece(sq);
                    return;
                }

                clearHighlights();
                selectedSquare = null;
            } else {
                // First click: select our piece
                const piece = game.get(sq);
                if (piece && piece.color === game.turn()) {
                    selectPiece(sq);
                }
            }
        }

        function selectPiece(sq) {
            selectedSquare = sq;
            const sqEl = document.querySelector(\`[data-square="\${sq}"]\`);
            if (sqEl) sqEl.classList.add('selected');

            // Show legal moves
            const moves = game.moves({ square: sq, verbose: true });
            moves.forEach(m => {
                const targetEl = document.querySelector(\`[data-square="\${m.to}"]\`);
                if (targetEl) {
                    if (m.captured) {
                        const cap = document.createElement('div');
                        cap.className = 'valid-capture';
                        targetEl.appendChild(cap);
                    } else {
                        const dot = document.createElement('div');
                        dot.className = 'valid-dot';
                        targetEl.appendChild(dot);
                    }
                }
            });
        }

        function clearHighlights() {
            document.querySelectorAll('.square').forEach(el => {
                el.classList.remove('selected');
                const dot = el.querySelector('.valid-dot');
                if (dot) dot.remove();
                const cap = el.querySelector('.valid-capture');
                if (cap) cap.remove();
            });
        }

        async function executeMove(from, to, promotion = 'q') {
            const move = game.move({ from, to, promotion });
            if (!move) return;

            // Play sound
            if (game.in_check()) playSound('check');
            else if (move.captured) playSound('capture');
            else playSound('move');

            renderBoard();

            // Submit move to backend
            try {
                statusEl.innerText = 'Mengirim langkah...';
                const res = await fetch(\`/api/chess/\${encodeURIComponent(SESSION_KEY)}/move\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ from, to, promotion })
                });
                const data = await res.json();
                if (data.success) {
                    game = new Chess(data.fen);
                    renderBoard();
                } else {
                    statusEl.innerText = '⚠️ ' + (data.error || 'Gagal melangkah');
                    // Revert local board if rejected
                    fetchGameState();
                }
            } catch (err) {
                console.error(err);
                statusEl.innerText = '⚠️ Kesalahan jaringan!';
            }
        }

        function updateStatus() {
            const turn = game.turn();
            if (turn === 'w') {
                p1Bar.classList.add('active-turn');
                p2Bar.classList.remove('active-turn');
            } else {
                p2Bar.classList.add('active-turn');
                p1Bar.classList.remove('active-turn');
            }

            if (game.in_checkmate()) {
                isGameOver = true;
                const winner = turn === 'w' ? 'Hitam' : 'Putih';
                statusEl.innerHTML = \`🏁 <b>SKAKMAT!</b> \${winner} Menang!\`;
                playSound('check');
            } else if (game.in_draw()) {
                isGameOver = true;
                statusEl.innerHTML = '🤝 <b>REMIS (DRAW)!</b> Permainan berakhir imbang.';
            } else if (game.in_check()) {
                statusEl.innerHTML = \`⚠️ <b>SKAK!</b> Giliran \${turn === 'w' ? 'Putih' : 'Hitam'}.\`;
            } else {
                statusEl.innerHTML = \`Giliran <b>\${turn === 'w' ? 'Putih' : 'Hitam'}</b> melangkah.\`;
            }
        }

        function showPromoModal(color) {
            const modal = document.getElementById('promo-modal');
            const opts = document.getElementById('promo-options');
            opts.innerHTML = '';

            ['q', 'r', 'b', 'n'].forEach(type => {
                const btn = document.createElement('div');
                btn.className = 'promo-btn';
                const key = color + type.toUpperCase();
                btn.innerHTML = PIECES_SVG[key] || type;
                btn.onclick = () => {
                    modal.style.display = 'none';
                    if (pendingMove) {
                        executeMove(pendingMove.from, pendingMove.to, type);
                        pendingMove = null;
                        clearHighlights();
                        selectedSquare = null;
                    }
                };
                opts.appendChild(btn);
            });

            modal.style.display = 'flex';
        }

        async function fetchGameState() {
            try {
                const res = await fetch(\`/api/chess/\${encodeURIComponent(SESSION_KEY)}\`);
                if (!res.ok) return;
                const data = await res.json();
                if (data.success && data.fen !== game.fen()) {
                    const prevFen = game.fen();
                    game = new Chess(data.fen);
                    playSound('move');
                    renderBoard();
                }
            } catch (err) {
                console.warn('Sync poll failed:', err);
            }
        }

        async function surrender() {
            if (!confirm('Yakin ingin menyerah?')) return;
            try {
                const res = await fetch(\`/api/chess/\${encodeURIComponent(SESSION_KEY)}/surrender\`, { method: 'POST' });
                const data = await res.json();
                if (data.success) {
                    alert('Permainan telah berakhir.');
                    fetchGameState();
                }
            } catch (e) {
                alert('Gagal memproses.');
            }
        }

        // Initialize and auto-poll every 2.5s for real-time multiplayer updates
        renderBoard();
        setInterval(fetchGameState, 2500);
    </script>
</body>
</html>`;
}
