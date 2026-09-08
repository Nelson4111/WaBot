import { WebSocketServer } from 'ws';
import url from 'url';
import chalk from 'chalk';

/**
 * Global Room Storage
 * Room structure:
 * {
 *   id: string,
 *   players: Map<WebSocket, PlayerData>,
 *   stars: Array<{ id: number, x: number, y: number }>,
 *   interval: NodeJS.Timeout | null,
 *   lastActive: number
 * }
 */
const rooms = new Map();

// Arena boundaries
const ARENA_WIDTH = 400;
const ARENA_HEIGHT = 340;
const PLAYER_RADIUS = 14;
const STAR_RADIUS = 7;
const MAX_STARS = 12;

// Player Color Palette
const COLORS = [
    '#f43f5e', '#06b6d4', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6'
];

function generateStars(count = MAX_STARS) {
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            id: Math.random().toString(36).substring(2, 9),
            x: Math.floor(20 + Math.random() * (ARENA_WIDTH - 40)),
            y: Math.floor(20 + Math.random() * (ARENA_HEIGHT - 40))
        });
    }
    return stars;
}

function getOrCreateRoom(roomId) {
    if (!rooms.has(roomId)) {
        const room = {
            id: roomId,
            players: new Map(),
            stars: generateStars(MAX_STARS),
            interval: null,
            lastActive: Date.now()
        };

        // 25 FPS Game Loop (Broadcast state to all clients in room)
        room.interval = setInterval(() => {
            if (room.players.size === 0) {
                if (Date.now() - room.lastActive > 60000) {
                    clearInterval(room.interval);
                    rooms.delete(roomId);
                    console.log(chalk.gray(`[WS-Arena] Room ${roomId} idle & dibersihkan.`));
                }
                return;
            }

            const state = {
                type: 'state',
                players: Array.from(room.players.values()).map(p => ({
                    id: p.id,
                    name: p.name,
                    color: p.color,
                    x: Math.round(p.x),
                    y: Math.round(p.y),
                    score: p.score
                })),
                stars: room.stars
            };

            const payload = JSON.stringify(state);
            for (const [ws, _] of room.players) {
                if (ws.readyState === ws.OPEN) {
                    ws.send(payload);
                }
            }
        }, 40);

        rooms.set(roomId, room);
        console.log(chalk.green(`[WS-Arena] Room baru dibuat: ${roomId}`));
    }
    return rooms.get(roomId);
}

/**
 * Initializes WebSocket Server attached to the HTTP server.
 * @param {import('http').Server} server 
 */
export default function initMultiplayerWsServer(server) {
    if (!server) return null;

    const wss = new WebSocketServer({
        noServer: true,
        // Accept all origins, including "null" from WhatsApp in-bubble WebView
        verifyClient: (info, done) => {
            done(true);
        }
    });

    server.on('upgrade', (request, socket, head) => {
        const { pathname } = url.parse(request.url || '');
        if (pathname === '/ws/arena' || pathname === '/ws') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
    });

    wss.on('connection', (ws, req) => {
        const parsedUrl = url.parse(req.url || '', true);
        const roomId = (parsedUrl.query.room || 'global-room').toString().trim();
        const rawName = (parsedUrl.query.name || 'Player').toString().trim();
        const cleanName = rawName.substring(0, 15).replace(/[<>]/g, '');

        const playerId = 'p_' + Math.random().toString(36).substring(2, 7);
        const room = getOrCreateRoom(roomId);
        room.lastActive = Date.now();

        const colorIndex = room.players.size % COLORS.length;
        const playerData = {
            id: playerId,
            name: cleanName || 'Pemain',
            color: COLORS[colorIndex],
            x: Math.floor(50 + Math.random() * (ARENA_WIDTH - 100)),
            y: Math.floor(50 + Math.random() * (ARENA_HEIGHT - 100)),
            score: 0,
            targetX: 200,
            targetY: 170
        };

        room.players.set(ws, playerData);
        console.log(chalk.cyan(`[WS-Arena] Pemain masuk: ${cleanName} (${playerId}) di Room: ${roomId} (Total: ${room.players.size})`));

        // Send Welcome Message with Player's own assigned ID & Arena Config
        ws.send(JSON.stringify({
            type: 'init',
            playerId,
            arena: { width: ARENA_WIDTH, height: ARENA_HEIGHT },
            color: playerData.color
        }));

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                room.lastActive = Date.now();

                if (data.type === 'ping') {
                    if (ws.readyState === ws.OPEN) {
                        ws.send(JSON.stringify({ type: 'pong', time: Date.now() }));
                    }
                    return;
                }

                if (data.type === 'move') {
                    const targetX = Math.max(PLAYER_RADIUS, Math.min(ARENA_WIDTH - PLAYER_RADIUS, Number(data.x) || playerData.x));
                    const targetY = Math.max(PLAYER_RADIUS, Math.min(ARENA_HEIGHT - PLAYER_RADIUS, Number(data.y) || playerData.y));

                    // Smooth interpolation towards target position
                    playerData.x += (targetX - playerData.x) * 0.4;
                    playerData.y += (targetY - playerData.y) * 0.4;

                    // Collision check with stars
                    for (let i = room.stars.length - 1; i >= 0; i--) {
                        const star = room.stars[i];
                        const dx = playerData.x - star.x;
                        const dy = playerData.y - star.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < PLAYER_RADIUS + STAR_RADIUS) {
                            playerData.score += 1;
                            // Respawn star at a new location
                            room.stars[i] = {
                                id: Math.random().toString(36).substring(2, 9),
                                x: Math.floor(20 + Math.random() * (ARENA_WIDTH - 40)),
                                y: Math.floor(20 + Math.random() * (ARENA_HEIGHT - 40))
                            };
                        }
                    }
                }
            } catch (err) {
                // Ignore malformed message
            }
        });

        ws.on('close', () => {
            room.players.delete(ws);
            room.lastActive = Date.now();
            console.log(chalk.yellow(`[WS-Arena] Pemain keluar: ${cleanName} (${playerId}) dari Room: ${roomId} (Sisa: ${room.players.size})`));
        });

        ws.on('error', (err) => {
            console.warn(chalk.red(`[WS-Arena] Error pada socket: ${err.message}`));
        });
    });

    console.log(chalk.blue('🚀 [WS-Arena] WebSocket Multiplayer Server siap di path /ws/arena'));
    return wss;
}

export { rooms };
