/**
 * utils/filters.js
 * Daftar filter audio yang tersedia untuk /filter dan /bassboost
 */

// Filter names harus sesuai dengan built-in discord-player filter names
export const BASSBOOST_LEVELS = {
    off:    [],
    low:    ['bassboost_low'],
    medium: ['bassboost_medium'],
    hard:   ['bassboost_high'],
}

export const AUDIO_FILTERS = {
    nightcore: {
        label: '🌙 Nightcore',
        description: 'Mempercepat lagu + menaikkan pitch (anime vibes!)',
        filters: ['nightcore'],
    },
    vaporwave: {
        label: '🌊 Vaporwave',
        description: 'Memperlambat lagu + efek retro 80s',
        filters: ['vaporwave'],
    },
    '8d': {
        label: '🎧 8D Audio',
        description: 'Efek audio berputar di kepala (pakai headset!)',
        filters: ['8D'],
    },
    lofi: {
        label: '☕ Lo-Fi',
        description: 'Efek santai lo-fi study vibes',
        filters: ['lofi'],
    },
    karaoke: {
        label: '🎤 Karaoke',
        description: 'Menghilangkan vokal (instrumental)',
        filters: ['karaoke'],
    },
    tremolo: {
        label: '〰️ Tremolo',
        description: 'Efek getaran pada volume',
        filters: ['tremolo'],
    },
    vibrato: {
        label: '🎵 Vibrato',
        description: 'Efek getaran pada pitch',
        filters: ['vibrato'],
    },
    off: {
        label: '❌ Off',
        description: 'Matikan semua filter',
        filters: [],
    },
}

export const FILTER_CHOICES = Object.entries(AUDIO_FILTERS).map(([key, val]) => ({
    name: val.label,
    value: key,
}))
