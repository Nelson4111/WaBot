/**
 * utils/progressBar.js
 * Membuat progress bar visual untuk lagu yang sedang diputar
 */

export function createProgressBar(currentMs, totalMs, size = 18) {
    if (!totalMs || totalMs <= 0) return '▬'.repeat(size)
    const percent = Math.min(currentMs / totalMs, 1)
    const filled = Math.round(size * percent)
    const before = Math.max(filled - 1, 0)
    const after = size - before - 1
    return '▬'.repeat(before) + '🔘' + '▬'.repeat(Math.max(after, 0))
}

export function msToTime(ms) {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    const ss = String(s % 60).padStart(2, '0')
    const mm = String(m % 60).padStart(2, '0')
    if (h > 0) return `${h}:${mm}:${ss}`
    return `${mm}:${ss}`
}
