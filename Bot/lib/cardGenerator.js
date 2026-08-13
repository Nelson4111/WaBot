/**
 * lib/cardGenerator.js
 * Generate kartu gambar lokal menggunakan skia-canvas + sharp
 * Ukuran kartu mengikuti dimensi background: 734x424px
 */

import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mediaDir = path.join(__dirname, '../media')

const CARD_W = 734
const CARD_H = 424

// ───────────────────────────────────────────────
// Helper: Fetch gambar dari URL → Buffer
// ───────────────────────────────────────────────
async function fetchImageBuffer(url) {
    return new Promise((resolve, reject) => {
        const proto = url.startsWith('https') ? https : http
        proto.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchImageBuffer(res.headers.location).then(resolve).catch(reject)
            }
            const chunks = []
            res.on('data', c => chunks.push(c))
            res.on('end', () => resolve(Buffer.concat(chunks)))
            res.on('error', reject)
        }).on('error', reject)
    })
}

// ───────────────────────────────────────────────
// Helper: Escape teks untuk SVG
// ───────────────────────────────────────────────
function esc(t, maxLen = 25) {
    return String(t ?? '').substring(0, maxLen)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

// ───────────────────────────────────────────────
// Helper: Crop gambar menjadi lingkaran (Buffer PNG)
// ───────────────────────────────────────────────
async function makeCircularAvatar(imgBuf, size = 100, borderColor = 'rgba(255,215,0,0.9)') {
    const resized = await sharp(imgBuf)
        .resize(size, size, { fit: 'cover', position: 'center' })
        .png()
        .toBuffer()

    const b64 = resized.toString('base64')
    const r = size / 2
    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <clipPath id="c"><circle cx="${r}" cy="${r}" r="${r}"/></clipPath>
        </defs>
        <image href="data:image/png;base64,${b64}" width="${size}" height="${size}" clip-path="url(#c)"/>
        <circle cx="${r}" cy="${r}" r="${r - 2}" fill="none" stroke="${borderColor}" stroke-width="3"/>
    </svg>`

    return await sharp(Buffer.from(svg)).png().toBuffer()
}

// ───────────────────────────────────────────────
// Helper: Load background → resize ke 734×424
// ───────────────────────────────────────────────
async function loadBackground(bgPath) {
    return await sharp(bgPath)
        .resize(CARD_W, CARD_H, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 90 })
        .toBuffer()
}

// ───────────────────────────────────────────────
// Helper: Fallback avatar (kotak berwarna)
// ───────────────────────────────────────────────
async function fallbackAvatar(size, r, g, b) {
    return await sharp({
        create: { width: size, height: size, channels: 4, background: { r, g, b, alpha: 1 } }
    }).png().toBuffer()
}

// ═══════════════════════════════════════════════
// WELCOME CARD (Glassmorphism Center)
// ═══════════════════════════════════════════════
export async function generateWelcomeCard({ avatarUrl, username, groupName, memberCount }) {
    const bgBuf = await loadBackground(path.join(mediaDir, 'BG.jpg'))

    let avatarBuf
    try { avatarBuf = await fetchImageBuffer(avatarUrl) }
    catch { avatarBuf = await fallbackAvatar(100, 80, 80, 120) }

    // Avatar dikecilkan ke 100px
    const avatarCircle = await makeCircularAvatar(avatarBuf, 100, 'rgba(255,215,0,0.95)')

    const panelW = 330, panelH = 345
    const panelX = Math.floor((CARD_W - panelW) / 2)
    const panelY = 38

    const svg = `<svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="vign" cx="50%" cy="50%">
                <stop offset="35%" stop-color="black" stop-opacity="0"/>
                <stop offset="100%" stop-color="black" stop-opacity="0.55"/>
            </radialGradient>
        </defs>
        <rect width="${CARD_W}" height="${CARD_H}" fill="url(#vign)"/>
        <!-- Glass panel -->
        <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}"
              rx="18" fill="rgba(10,10,30,0.62)" stroke="rgba(255,215,0,0.45)" stroke-width="1.5"/>
        <!-- Top accent line -->
        <rect x="${panelX + 30}" y="${panelY + 12}" width="${panelW - 60}" height="2"
              rx="1" fill="rgba(255,215,0,0.7)"/>

        <!-- WELCOME! (Judul diperbesar, tanpa teks Kanji yang error) -->
        <text x="${CARD_W / 2}" y="${panelY + 160}" text-anchor="middle"
              font-family="Arial Black, sans-serif" font-size="28" font-weight="900"
              fill="white" letter-spacing="3">WELCOME!</text>
        
        <!-- username (diperbesar) -->
        <text x="${CARD_W / 2}" y="${panelY + 195}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFD700">
            ${esc(username, 20)}
        </text>

        <!-- "Selamat datang di" (diperbesar) -->
        <text x="${CARD_W / 2}" y="${panelY + 228}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.75)">
            Selamat datang di
        </text>

        <!-- group name (diperbesar) -->
        <text x="${CARD_W / 2}" y="${panelY + 254}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="rgba(255,255,255,0.95)">
            ${esc(groupName, 26)}
        </text>

        <!-- member count -->
        <text x="${CARD_W / 2}" y="${panelY + 290}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="14" fill="rgba(255,215,0,0.85)">
            👥 Member ke-${memberCount ?? '?'}
        </text>

        <!-- Bottom accent line -->
        <rect x="${panelX + 30}" y="${panelY + panelH - 16}" width="${panelW - 60}" height="2"
              rx="1" fill="rgba(255,215,0,0.7)"/>
    </svg>`

    return await sharp(bgBuf).composite([
        { input: Buffer.from(svg), top: 0, left: 0 },
        { input: avatarCircle, top: panelY + 32, left: Math.floor((CARD_W - 100) / 2) },
    ]).jpeg({ quality: 90 }).toBuffer()
}

// ═══════════════════════════════════════════════
// GOODBYE / LEAVE CARD (Glassmorphism Center)
// ═══════════════════════════════════════════════
export async function generateGoodbyeCard({ avatarUrl, username, groupName, memberCount }) {
    const bgBuf = await loadBackground(path.join(mediaDir, 'BG.jpg'))

    let avatarBuf
    try { avatarBuf = await fetchImageBuffer(avatarUrl) }
    catch { avatarBuf = await fallbackAvatar(100, 120, 60, 60) }

    // Avatar dikecilkan ke 100px dengan border merah/soft pink
    const avatarCircle = await makeCircularAvatar(avatarBuf, 100, 'rgba(255,100,100,0.9)')

    const panelW = 330, panelH = 345
    const panelX = Math.floor((CARD_W - panelW) / 2)
    const panelY = 38

    const svg = `<svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="vign" cx="50%" cy="50%">
                <stop offset="35%" stop-color="black" stop-opacity="0"/>
                <stop offset="100%" stop-color="black" stop-opacity="0.6"/>
            </radialGradient>
        </defs>
        <rect width="${CARD_W}" height="${CARD_H}" fill="url(#vign)"/>
        <!-- Glass panel dengan nuansa gelap/merah soft -->
        <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}"
              rx="18" fill="rgba(25,10,15,0.65)" stroke="rgba(255,100,100,0.45)" stroke-width="1.5"/>
        <!-- Top accent line -->
        <rect x="${panelX + 30}" y="${panelY + 12}" width="${panelW - 60}" height="2"
              rx="1" fill="rgba(255,100,100,0.7)"/>

        <!-- GOODBYE! (Judul diperbesar) -->
        <text x="${CARD_W / 2}" y="${panelY + 160}" text-anchor="middle"
              font-family="Arial Black, sans-serif" font-size="28" font-weight="900"
              fill="#FF6B6B" letter-spacing="3">GOODBYE!</text>
        
        <!-- username -->
        <text x="${CARD_W / 2}" y="${panelY + 195}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFD700">
            ${esc(username, 20)}
        </text>

        <!-- "Telah meninggalkan" -->
        <text x="${CARD_W / 2}" y="${panelY + 228}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.75)">
            Telah meninggalkan grup
        </text>

        <!-- group name -->
        <text x="${CARD_W / 2}" y="${panelY + 254}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="rgba(255,255,255,0.95)">
            ${esc(groupName, 26)}
        </text>

        <!-- member remaining -->
        <text x="${CARD_W / 2}" y="${panelY + 290}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="14" fill="rgba(255,180,180,0.85)">
            👥 Sisa Member: ${memberCount ?? '?'}
        </text>

        <!-- Bottom accent line -->
        <rect x="${panelX + 30}" y="${panelY + panelH - 16}" width="${panelW - 60}" height="2"
              rx="1" fill="rgba(255,100,100,0.7)"/>
    </svg>`

    return await sharp(bgBuf).composite([
        { input: Buffer.from(svg), top: 0, left: 0 },
        { input: avatarCircle, top: panelY + 32, left: Math.floor((CARD_W - 100) / 2) },
    ]).jpeg({ quality: 90 }).toBuffer()
}

// ═══════════════════════════════════════════════
// PROFILE CARD (Menggunakan BG.jpg Anime Sunset & Teks Diperbesar)
// ═══════════════════════════════════════════════
export async function generateProfileCard({ avatarUrl, username, role = 'User', status = 'Free', exp = 0, limit = 0, uang = 0, registered = false }) {
    // Menggunakan background anime sunset BG.jpg sesuai permintaan user
    const bgBuf = await loadBackground(path.join(mediaDir, 'BG.jpg'))

    let avatarBuf
    try { avatarBuf = await fetchImageBuffer(avatarUrl) }
    catch { avatarBuf = await fallbackAvatar(110, 80, 80, 120) }

    const avatarCircle = await makeCircularAvatar(avatarBuf, 110, 'rgba(255,215,0,0.95)')
    const regIcon = registered ? '✅' : '❌'

    const svg = `<svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="rgba(15,10,25,0.82)"/>
                <stop offset="40%" stop-color="rgba(15,10,25,0.82)"/>
                <stop offset="65%" stop-color="rgba(15,10,25,0.65)"/>
                <stop offset="100%" stop-color="rgba(15,10,25,0.88)"/>
            </linearGradient>
        </defs>
        <rect width="${CARD_W}" height="${CARD_H}" fill="url(#lg)"/>

        <!-- Title bar -->
        <rect x="0" y="0" width="${CARD_W}" height="46" fill="rgba(200,80,40,0.45)"/>
        <text x="${CARD_W / 2}" y="30" text-anchor="middle"
              font-family="Arial Black, sans-serif" font-size="16" font-weight="bold" fill="white" letter-spacing="5">
            乂 U S E R · P R O F I L E 乂
        </text>
        <line x1="0" y1="46" x2="${CARD_W}" y2="46" stroke="rgba(255,180,80,0.8)" stroke-width="1.5"/>

        <!-- Vertical Separator -->
        <line x1="225" y1="60" x2="225" y2="${CARD_H - 20}" stroke="rgba(255,180,80,0.4)" stroke-width="1"/>

        <!-- Stats Text (Font Size Diperbesar dari 12/13px ke 15/16px) -->
        <text x="245" y="98" font-family="Arial, sans-serif" font-size="15" fill="rgba(255,220,180,0.8)">◈ Name</text>
        <text x="335" y="98" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">${esc(username, 22)}</text>

        <text x="245" y="130" font-family="Arial, sans-serif" font-size="15" fill="rgba(255,220,180,0.8)">◈ Role</text>
        <text x="335" y="130" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFD700">${esc(role, 20)}</text>

        <text x="245" y="162" font-family="Arial, sans-serif" font-size="15" fill="rgba(255,220,180,0.8)">◈ Status</text>
        <text x="335" y="162" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#A0F0FF">${esc(status, 20)}</text>

        <text x="245" y="194" font-family="Arial, sans-serif" font-size="15" fill="rgba(255,220,180,0.8)">◈ Exp</text>
        <text x="335" y="194" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFD700">${Number(exp).toLocaleString('id-ID')}</text>

        <text x="245" y="226" font-family="Arial, sans-serif" font-size="15" fill="rgba(255,220,180,0.8)">◈ Limit</text>
        <text x="335" y="226" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">${limit}</text>

        <text x="245" y="258" font-family="Arial, sans-serif" font-size="15" fill="rgba(255,220,180,0.8)">◈ Uang</text>
        <text x="335" y="258" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#4AFF91">Rp ${Number(uang).toLocaleString('id-ID')}</text>

        <!-- Registered badge bottom -->
        <rect x="238" y="${CARD_H - 58}" width="${CARD_W - 258}" height="36" rx="8"
              fill="rgba(200,80,40,0.4)" stroke="rgba(255,180,80,0.5)" stroke-width="1"/>
        <text x="${(CARD_W + 238) / 2}" y="${CARD_H - 34}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">
            REGISTERED : ${regIcon}
        </text>

        <line x1="0" y1="${CARD_H - 1}" x2="${CARD_W}" y2="${CARD_H - 1}" stroke="rgba(255,180,80,0.5)" stroke-width="1"/>
    </svg>`

    return await sharp(bgBuf).composite([
        { input: Buffer.from(svg), top: 0, left: 0 },
        { input: avatarCircle, top: Math.floor((CARD_H - 110) / 2) + 10, left: 45 },
    ]).jpeg({ quality: 90 }).toBuffer()
}

// ═══════════════════════════════════════════════
// FISHING / MANCING CARD
// ═══════════════════════════════════════════════
export async function generateFishingCard({ avatarUrl, username, ikan, exp, rodLevel = 0 }) {
    const bgBuf = await loadBackground(path.join(mediaDir, 'bg_fishing.jpg'))

    let avatarBuf
    try { avatarBuf = await fetchImageBuffer(avatarUrl) }
    catch { avatarBuf = await fallbackAvatar(80, 60, 120, 160) }

    const avatarCircle = await makeCircularAvatar(avatarBuf, 80, 'rgba(100,200,255,0.9)')
    const fishEmoji = { hiu: '🦈', bawal: '🐟', nila: '🐠', lele: '🐡' }
    const fishIcon = fishEmoji[ikan] || '🐟'
    const panelY = CARD_H - 165

    const svg = `<svg width="${CARD_W}" height="${CARD_H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="rgba(0,20,40,0.3)"/>
                <stop offset="55%" stop-color="rgba(0,20,40,0)"/>
                <stop offset="75%" stop-color="rgba(0,20,40,0.6)"/>
                <stop offset="100%" stop-color="rgba(0,20,40,0.88)"/>
            </linearGradient>
        </defs>
        <rect width="${CARD_W}" height="${CARD_H}" fill="url(#fade)"/>
        <rect x="0" y="${panelY}" width="${CARD_W}" height="${CARD_H - panelY}" fill="rgba(0,30,60,0.72)"/>
        <line x1="0" y1="${panelY}" x2="${CARD_W}" y2="${panelY}" stroke="rgba(100,200,255,0.6)" stroke-width="1.5"/>
        <!-- Title -->
        <text x="120" y="${panelY + 30}" font-family="Arial Black,sans-serif"
              font-size="18" font-weight="900" fill="white" letter-spacing="1">
            FISHING RESULT
        </text>
        <!-- Result -->
        <text x="120" y="${panelY + 58}" font-family="Arial,sans-serif"
              font-size="14" fill="rgba(200,240,255,0.8)">Hasil tangkapan:</text>
        <text x="120" y="${panelY + 84}" font-family="Arial Black,sans-serif"
              font-size="20" fill="#FFD700">${fishIcon} 1 ${esc(ikan.toUpperCase(), 12)}</text>
        <!-- XP + Rod -->
        <text x="120" y="${panelY + 112}" font-family="Arial,sans-serif"
              font-size="14" fill="rgba(200,240,255,0.85)">
            ✨ XP +${exp}  •  🎣 Rod Lv.${rodLevel}
        </text>
        <!-- Username -->
        <text x="120" y="${panelY + 138}" font-family="Arial,sans-serif"
              font-size="13" fill="rgba(150,200,255,0.65)">
            ${esc(username)}
        </text>
        <!-- Decorative ripple circles -->
        <circle cx="${CARD_W - 70}" cy="75" r="45" fill="none" stroke="rgba(100,200,255,0.12)" stroke-width="1.5"/>
        <circle cx="${CARD_W - 70}" cy="75" r="30" fill="none" stroke="rgba(100,200,255,0.18)" stroke-width="1.5"/>
        <circle cx="${CARD_W - 70}" cy="75" r="15" fill="none" stroke="rgba(100,200,255,0.28)" stroke-width="1.5"/>
    </svg>`

    return await sharp(bgBuf).composite([
        { input: Buffer.from(svg), top: 0, left: 0 },
        { input: avatarCircle, top: panelY + 43, left: 20 },
    ]).jpeg({ quality: 90 }).toBuffer()
}
