/**
 * Smart Source Resolution & Fallback Resolver
 * Mengelola prioritas sumber audio (Spotify -> Deezer -> YouTube Music -> SoundCloud -> YouTube)
 * Dilengkapi pre-validation untuk menyaring track yang mati / 404 / diblokir sebelum diputar.
 */

const RESOLUTION_CHAIN = [
  { prefix: 'spsearch:', label: 'Spotify (ISRC-aware via LavaSrc)' },
  { prefix: 'dzsearch:', label: 'Deezer (Direct playback, tidak lewat YouTube)' },
  { prefix: 'ytmsearch:', label: 'YouTube Music (Client MUSIC, anti login-wall)' },
  { prefix: 'scsearch:', label: 'SoundCloud (dengan validasi stream)' },
  { prefix: 'ytsearch:', label: 'YouTube Video (Fallback terakhir)' }
];

/**
 * Validasi pre-emptive untuk menyaring track yang kemungkinan 404 atau diblokir
 * @param {Object} track KazagumoTrack / raw track
 * @param {string} prefix engine prefix
 * @returns {Object|null} track jika valid, null jika bermasalah
 */
function validateTrack(track, prefix = '') {
  if (!track) return null;

  // 1. Cek policy blokir dari metadata plugin
  const isBlockedPolicy = track.pluginInfo?.policy === 'BLOCK' || track.pluginInfo?.blocked === true;
  if (isBlockedPolicy) return null;

  // 2. Cek stream mati (isStream true tapi tidak seekable dan durasi 0)
  const isLiveDeadStream = track.isStream && !track.isSeekable && (track.length === 0 || track.duration === 0);
  if (isLiveDeadStream) return null;

  // 3. Khusus SoundCloud: cek URL validitas dasar
  if (prefix === 'scsearch:' || track.uri?.includes('soundcloud.com')) {
    if (!track.title || track.title.trim().length === 0) return null;
  }

  return track;
}

/**
 * Meresolusi query lagu dengan fallback cerdas antar-platform
 * @param {Object} manager Kazagumo instance
 * @param {string} query Search query string atau URL
 * @param {Object} requester Discord User object
 * @param {string} preferredEngine Engine pilihan user (opsional)
 * @returns {Promise<Object>} SearchResult dengan track tervalidasi
 */
async function resolveWithFallback(manager, query, requester, preferredEngine = null) {
  if (!query || typeof query !== 'string') {
    return { type: 'SEARCH', tracks: [] };
  }

  let cleanQuery = query.trim().replace(/[<>]/g, '');

  // 1. Jika query adalah URL langsung, biarkan manager menyelesaikan URL tersebut
  const isUrl = /^https?:\/\//i.test(cleanQuery);
  const searchFn = (manager.originalSearch || manager.search).bind(manager);

  if (isUrl) {
    const directResult = await searchFn(cleanQuery, { requester, skipChain: true }).catch(() => null);
    if (directResult?.tracks?.length > 0) {
      const validatedFirst = validateTrack(directResult.tracks[0], '');
      if (validatedFirst) return directResult;
    }
  }

  // 2. Susun urutan resolver chain (prioritaskan preferredEngine jika ada)
  let chain = [...RESOLUTION_CHAIN];
  if (preferredEngine) {
    const formattedPref = preferredEngine.endsWith(':') ? preferredEngine : `${preferredEngine}:`;
    const foundIdx = chain.findIndex(c => c.prefix === formattedPref);
    if (foundIdx > 0) {
      const [preferred] = chain.splice(foundIdx, 1);
      chain.unshift(preferred);
    }
  }

  // 3. Iterasi resolver chain dengan validasi pre-emptive
  for (const { prefix, label } of chain) {
    try {
      const searchQuery = cleanQuery.startsWith(prefix) ? cleanQuery : `${prefix}${cleanQuery}`;
      const result = await searchFn(searchQuery, {
        requester,
        engine: prefix.replace(':', ''),
        skipChain: true
      }).catch(() => null);

      if (result?.tracks?.length > 0) {
        // Cari track pertama yang lolos validasi
        for (const track of result.tracks) {
          const validated = validateTrack(track, prefix);
          if (validated) {
            return {
              type: result.type || 'TRACK',
              playlistName: result.playlistName,
              tracks: [validated, ...result.tracks.filter(t => t !== track)]
            };
          }
        }
      }
    } catch (err) {
      console.warn(`[Resolver] ${label} dilewati: ${err.message}`);
    }
  }

  return { type: 'SEARCH', tracks: [] };
}

module.exports = {
  RESOLUTION_CHAIN,
  validateTrack,
  resolveWithFallback
};
