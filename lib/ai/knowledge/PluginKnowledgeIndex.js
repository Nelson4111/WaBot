/**
 * PluginKnowledgeIndex.js — Single Source of Truth Plugin Indexer & Selective RAG Engine
 *
 * Mengindeks seluruh fitur bot langsung dari file plugin masing-masing (global.plugins)
 * secara otomatis (lazy cache + dirty check per plugin) tanpa perlu menyalin semua teks
 * ke file JSON terpisah.
 *
 * Setiap file plugin menjadi sumber kebenaran tunggal (Single Source of Truth) melalui:
 *   1. handler.command (regex / array / string nama command & alias)
 *   2. handler.help (format penggunaan)
 *   3. handler.tags (kategori fitur)
 *   4. handler.desc / handler.description (opsional: penjelasan fungsi fitur)
 *   5. handler.tutorial / handler.guide (opsional: langkah tutorial cara pakai)
 *   6. Auto-ekstraksi pintar dari isi kode fungsi plugin (Contoh:, Cara pakai:, guideText, dll.)
 */

// Kamus sinonim bahasa sehari-hari -> kata kunci fitur/command
const FEATURE_SYNONYMS = {
  ssound: ['stiker suara', 'sticker suara', 'stiker bersuara', 'stiker lagu', 'stiker musik', 'stiker ada suaranya', 'sound sticker', 'audio sticker'],
  strim: ['potong stiker', 'trim stiker', 'potong video stiker', 'durasi stiker', 'pangkas stiker'],
  sticker: ['buat stiker', 'bikin stiker', 'ubah jadi stiker', 'foto jadi stiker', 'video jadi stiker', 'stiker wa'],
  smeme: ['stiker meme', 'stiker teks', 'tulisan di stiker', 'meme stiker'],
  sreact: ['reaksi stiker', 'sticker reaction', 'reaction stiker', 'addreact', 'listreact', 'setsreact'],
  tiktok: ['download tiktok', 'unduh tiktok', 'video tiktok', 'vt tiktok', 'tt tanpa wm', 'tiktok no wm'],
  ig: ['download ig', 'reels ig', 'instagram downloader', 'unduh instagram', 'story ig'],
  play: ['putar lagu', 'cari lagu', 'download lagu', 'musik youtube', 'stel lagu', 'nyetel lagu'],
  pinterest: ['cari foto', 'gambar pinterest', 'download pinterest', 'pin gambar'],
  hd: ['jernihkan foto', 'perjelas foto', 'remini', 'upscale foto', 'foto buram jadi hd'],
  rship: ['pacaran', 'nikah', 'pasangan', 'lamar', 'putus', 'cerai', 'affection', 'hubungan'],
  bank: ['nabung', 'tabungan', 'simpan uang', 'tarik uang', 'depo', 'atm', 'bunga bank'],
  arcade: ['game web', 'blockblast', 'geometry dash', 'tetris', 'main game di chat', 'html game'],
  rich: ['tampilan kode', 'font besar', 'ai rich', 'tanpa baca selengkapnya', 'kotak kode salin']
}

// Deskripsi kategori default jika plugin tidak mendefinisikan deskripsi eksplisit
const CATEGORY_DESCRIPTIONS = {
  sticker: 'Pembuatan dan pengolahan stiker WhatsApp (stiker foto, video animasi, stiker bersuara, meme, potong durasi, konversi).',
  downloader: 'Pengunduh media dari platform sosial media (TikTok, Instagram, YouTube, Spotify, Pinterest, Facebook, CapCut, dll).',
  rpg: 'Fitur Roleplay Game (ekonomi, bank, pekerjaan, dungeon, pet, ternak, guild, kriminal, patroli, inventori).',
  pasangan: 'Sistem hubungan & pernikahan virtual (tembak, lamar, nikah, kencan, cincin, rumah tangga).',
  arcade: 'Mini game interaktif HTML5 langsung di dalam gelembung chat WhatsApp (Block Blast, Geometry Dash, Tetris, Mabar).',
  game: 'Permainan kuis dan tebak-tebakan interaktif di grup/chat (Family 100, Tebak Gambar, Cak Lontong, Blackjack, Slot).',
  ai: 'Asisten kecerdasan buatan (chat AI, tanya jawab, generasi gambar, edit gambar AI, voice note AI).',
  audio: 'Efek suara, voice note, soundboard, pengubah suara, dan konversi audio.',
  maker: 'Pembuat gambar kustom, quote chat (qc), brat, sertifikat, dan manipulasi canvas.',
  tools: 'Alat utilitas sehari-hari (translate, OCR baca teks gambar, buka view-once/rvo, upload tourl, cek protobuf, rich UI).',
  group: 'Manajemen dan moderasi grup WhatsApp (kick, add, hidetag, tagall, welcome, antilink, antispam, absen, mute).',
  anime: 'Pencarian info anime, jadwal rilis, gambar karakter waifu/husbu, dan deteksi judul anime dari screenshot.',
  csm: 'Game RPG khusus bertema Chainsaw Man.',
  fun: 'Hiburan seru-seruan, cek khodam, jodoh, kerang ajaib, dan lelucon.',
  info: 'Informasi status sistem bot, runtime, total fitur, gempa BMKG, dan laporan ke Owner.',
  internet: 'Pencarian informasi dari internet (Google, Wikipedia, cuaca, info loker, lirik lagu).',
  moneytrack: 'Pencatatan keuangan pribadi dan pemindai struk belanja otomatis.',
  owner: 'Perintah khusus kendali Owner & administrasi sistem bot.',
  quotes: 'Kumpulan kutipan kata bijak, motivasi, anime, dan bucin.',
  search: 'Pencarian data, katalog rental cosplay (cosrent), dan referensi.',
  stalker: 'Melihat profil akun sosial media (TikTok, Instagram, GitHub, Free Fire, MLBB).'
}

class PluginKnowledgeIndex {
  constructor() {
    this.cache = new Map() // pluginFile -> { ref, entry }
    this.lastScanCount = 0
  }

  /**
   * Memastikan indeks sinkron dengan global.plugins (hanya memproses plugin yang baru/berubah).
   */
  syncIndex() {
    const plugins = global.plugins || {}
    const pluginEntries = Object.entries(plugins)

    // Bersihkan plugin yang sudah dihapus
    if (this.cache.size !== pluginEntries.length) {
      for (const cachedKey of this.cache.keys()) {
        if (!(cachedKey in plugins)) {
          this.cache.delete(cachedKey)
        }
      }
    }

    for (const [filename, plugin] of pluginEntries) {
      if (!plugin || plugin.disabled) continue
      const existing = this.cache.get(filename)
      if (existing && existing.ref === plugin) continue

      const parsedEntry = this._extractPluginMetadata(filename, plugin)
      if (parsedEntry) {
        this.cache.set(filename, {
          ref: plugin,
          entry: parsedEntry
        })
      }
    }
  }

  /**
   * Mengekstrak seluruh informasi fungsi, command, alias, dan tutorial langsung dari objek/kode plugin.
   */
  _extractPluginMetadata(filename, plugin) {
    try {
      const folderCategory = filename.includes('/') ? filename.split('/')[0].toLowerCase() : 'general'
      const rawTags = Array.isArray(plugin.tags) ? plugin.tags.filter(Boolean).map(t => String(t).toLowerCase()) : []
      const tags = [...new Set([folderCategory, ...rawTags])].filter(t => t && t !== 'system')

      // 1. Ekstrak daftar format bantuan dari handler.help terlebih dahulu
      const helpList = Array.isArray(plugin.help)
        ? plugin.help.filter(Boolean).map(h => String(h).trim())
        : (typeof plugin.help === 'string' ? [plugin.help.trim()] : [])

      // 2. Ekstrak daftar nama command dari handler.command + handler.help
      const commands = this._parseCommands(plugin.command, helpList)

      // Jika plugin adalah handler sistem latar belakang (_*.js) tanpa command & tanpa help, lewati
      if (commands.length === 0 && helpList.length === 0) {
        return null
      }

      const primaryCmd = commands[0] || (helpList[0] ? helpList[0].split(/\s+/)[0].replace(/^[./!]/, '') : filename.replace(/\.js$/i, ''))

      // 3. Ambil deskripsi & tutorial (prioritas: properti eksplisit di plugin -> ekstraksi otomatis dari isi kode fungsi plugin)
      const explicitDesc = plugin.desc || plugin.description || ''
      const explicitTutorial = plugin.tutorial || plugin.guide || plugin.usage || plugin.example || ''

      const extractedFromCode = this._extractGuideFromSource(plugin, primaryCmd)

      const description = explicitDesc || extractedFromCode.description || this._buildAutoDescription(primaryCmd, commands, helpList, tags, folderCategory)
      const tutorialLines = explicitTutorial
        ? (Array.isArray(explicitTutorial) ? explicitTutorial : [String(explicitTutorial)])
        : extractedFromCode.tutorialLines

      // 4. Status hak akses & limit
      const flags = []
      if (plugin.owner || plugin.rowner) flags.push('Khusus Owner')
      if (plugin.admin) flags.push('Admin Grup')
      if (plugin.group) flags.push('Khusus Grup')
      if (plugin.private) flags.push('Private Chat')
      if (plugin.premium) flags.push('Premium')
      if (plugin.limit) flags.push('Memakai Limit')

      // 5. Bangun kumpulan kata kunci pencarian (termasuk sinonim bahasa sehari-hari)
      const searchTerms = new Set([
        primaryCmd.toLowerCase(),
        ...commands.map(c => c.toLowerCase()),
        ...tags,
        ...helpList.map(h => h.toLowerCase()),
        filename.toLowerCase().replace(/\.js$/i, '').replace(/[/_-]/g, ' ')
      ])

      for (const cmd of commands) {
        const cLow = cmd.toLowerCase()
        if (FEATURE_SYNONYMS[cLow]) {
          for (const syn of FEATURE_SYNONYMS[cLow]) searchTerms.add(syn)
        }
      }
      if (FEATURE_SYNONYMS[folderCategory]) {
        for (const syn of FEATURE_SYNONYMS[folderCategory]) searchTerms.add(syn)
      }

      return {
        filename,
        primaryCmd,
        commands,
        helpList: helpList.length > 0 ? helpList : commands.map(c => c),
        tags,
        category: folderCategory,
        description,
        tutorialLines,
        flags,
        isOwnerOnly: Boolean(plugin.owner || plugin.rowner),
        searchBlob: [
          ...searchTerms,
          description.toLowerCase(),
          tutorialLines.join(' ').toLowerCase()
        ].join(' | ')
      }
    } catch {
      return null
    }
  }

  _parseCommands(cmdProp, helpList = []) {
    const result = new Set()

    // Ambil kata pertama dari setiap item handler.help (karena selalu merupakan nama command bersih)
    if (Array.isArray(helpList)) {
      for (const h of helpList) {
        const firstToken = String(h || '')
          .trim()
          .replace(/^[./!#]+/, '')
          .split(/[\s<[\](|]+/)[0]
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '')
        if (firstToken && firstToken.length >= 1 && firstToken.length <= 28) {
          result.add(firstToken)
        }
      }
    }

    const extractFromProp = (prop) => {
      if (!prop) return
      if (typeof prop === 'string') {
        const clean = prop.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
        if (clean) result.add(clean)
        return
      }
      if (Array.isArray(prop)) {
        for (const item of prop) extractFromProp(item)
        return
      }
      if (prop instanceof RegExp) {
        let src = prop.source
          .replace(/^\^|\$$/g, '')
          .replace(/^\(\?:|\^\(|\)\$/g, '')
          .replace(/^\(|\)$/g, '')

        const parts = src.split('|')
        for (const rawPart of parts) {
          // Jika part mengandung grup opsional kompleks seperti s(tic?ker)?(gif)?, uji kandidat umum
          if (/[?+*()]/.test(rawPart)) {
            const commonCandidates = ['s', 'sticker', 'stiker', 'sgif', 'stikergif', 'stickergif', 'swm', 'stickerwm', 'menu', 'help']
            for (const cand of commonCandidates) {
              try {
                if (prop.test(cand)) result.add(cand)
              } catch {}
            }
          } else {
            const clean = rawPart.replace(/[^a-zA-Z0-9_-]/g, '').trim().toLowerCase()
            if (clean.length >= 1 && clean.length <= 28) {
              result.add(clean)
            }
          }
        }
      }
    }

    extractFromProp(cmdProp)
    return [...result]
  }

  /**
   * Mengekstrak kalimat tutorial, contoh penggunaan, atau panduan yang sudah tertulis
   * di dalam kode file plugin itu sendiri (seperti Contoh:, Cara pakai:, guideText, status.warning, dll).
   */
  _extractGuideFromSource(plugin, primaryCmd) {
    const tutorialLines = []
    let description = ''

    try {
      const fnSource = typeof plugin === 'function'
        ? plugin.toString()
        : (typeof plugin.handler === 'function' ? plugin.handler.toString() : '')
      if (!fnSource) return { description, tutorialLines }

      // Hapus komentar satu baris (// ...) agar tidak ikut terekstrak sebagai teks panduan user
      const noCommentsSrc = fnSource
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/\$\{\s*(?:usedPrefix|_p)\s*\+\s*command\s*\}/g, `.${primaryCmd}`)
        .replace(/\$\{\s*(?:usedPrefix|_p)\s*\}/g, '.')
        .replace(/\$\{\s*command\s*\}/g, primaryCmd)

      // Cari baris panduan yang memang ditujukan untuk user (Contoh:, Cara pakai:, Format:, › .cmd)
      const lineRegex = /(?:Contoh\s*:|Cara\s+(?:pakai|Penggunaan)\s*:|Format\s*:|ᴍᴏᴅᴇ\s*\d+\s*:|›\s*\*\.[a-z0-9_-]+)[^\n`"']*/gi
      const matches = noCommentsSrc.match(lineRegex) || []

      for (const rawLine of matches) {
        // Abaikan jika baris terlihat seperti potongan kode JS (mengandung tanda kurung fungsi);
        if (/\w+\([^)]*\)\)/.test(rawLine) || /function\s*\(/.test(rawLine)) continue

        let clean = rawLine
          .replace(/\\n/g, ' ')
          .replace(/\$\{[^}]+\}/g, '<param>')
          .replace(/[*`_~]/g, '')
          .replace(/^\s*[>|•›-]+\s*/, '')
          .replace(/\s+/g, ' ')
          .trim()

        if (clean.length >= 10 && clean.length <= 160 && !tutorialLines.includes(clean)) {
          tutorialLines.push(clean)
          if (tutorialLines.length >= 5) break
        }
      }

      // Cari kalimat penjelasan di dalam status.warning / m.reply (abaikan pesan batal/cancel session)
      const warnMatches = [...noCommentsSrc.matchAll(/status\.(?:warning|info)\(\s*[`"']([^`"'\n]{15,150})/gi)]
      for (const mWarn of warnMatches) {
        const candidate = (mWarn[1] || '')
          .replace(/\\n/g, ' ')
          .replace(/\$\{[^}]+\}/g, '')
          .replace(/[*`_~]/g, '')
          .trim()
        if (
          candidate.length >= 15 &&
          !candidate.startsWith('╭') &&
          !/tidak ada (?:session|antrean|sesi)|berhasil dibatalkan/i.test(candidate)
        ) {
          description = candidate
          break
        }
      }
    } catch {}

    return { description, tutorialLines }
  }

  _buildAutoDescription(primaryCmd, commands, helpList, tags, category) {
    const catDesc = CATEGORY_DESCRIPTIONS[category] || `Fitur kategori ${category}.`
    const aliasText = commands.length > 1 ? ` (Alias: ${commands.slice(1, 5).map(c => '.' + c).join(', ')})` : ''
    return `Fitur .${primaryCmd}${aliasText} — ${catDesc}`
  }

  /**
   * Mendeteksi apakah pesan user sedang bertanya tentang Bot / Fitur Bot / Command,
   * atau sedang mengobrol bebas di luar konteks bot (curhat, koding umum, pengetahuan umum, dll).
   *
   * @param {string} text
   * @returns {boolean}
   */
  isBotFeatureQuery(text) {
    if (!text || typeof text !== 'string') return false
    const low = text.toLowerCase().trim()

    // 1. Jika user menuliskan prefix command secara eksplisit (misal ".ssound itu apa", "cara pakai .bank")
    if (/(?:^|\s)\.[a-z0-9_-]{2,20}\b/i.test(low)) return true

    // 2. Jika user menyebut kata kunci terkait bot, grup WhatsApp, atau perintah bot
    const mentionsBotContext = /\b(bot|fitur|command|perintah|cmd|menu|help|owner|nenel|avelia|sewa|limit|premium|stiker|sticker|ssound|strim|smeme|sreact|rpg|bank|pasangan|nikah|lamar|rship|ternak|guild|dungeon|cosrent|arcade|blockblast|download|unduh|tiktok|tt|ytmp3|ytmp4|ig|reels|pin|pinterest|play|lagu|musik|rvo|ocr|toimg|tomp3|kick|keluarkan|hidetag|tagall|admin|grup|group|brat|removebg|bg|hd|remini|cekrek|bmkg|gempa|cuaca|shortlink|afk)\b/i.test(low)

    if (!mentionsBotContext) {
      // Cek apakah ada kata kunci sinonim fitur bot yang kuat atau nama command yang persis
      this.syncIndex()
      for (const syns of Object.values(FEATURE_SYNONYMS)) {
        if (syns.some(s => low.includes(s))) return true
      }

      // Cek apakah ada token yang merupakan nama command bot
      const words = low.replace(/[^a-z0-9_-]/g, ' ').split(/\s+/).filter(w => w.length >= 3)
      for (const { entry } of this.cache.values()) {
        if (words.some(w => entry.commands.includes(w))) {
          return true
        }
      }

      return false
    }

    // 3. Jika user meminta dibuatkan script/koding pemrograman (contoh: "buatkan contoh kode javascript"),
    //    itu bukan pertanyaan tentang fitur bot kecuali dia menyebut "fitur bot" / "command bot"
    if (/\b(kode|script|program|coding|html|css|javascript|python|java|c\+\+|sql|algoritma|rumus)\b/i.test(low) && !/\b(fitur\s+bot|command\s+bot|menu\s+bot|di\s+bot)\b/i.test(low)) {
      return false
    }

    return true
  }

  /**
   * Mencari Top-K plugin yang paling mendekati pertanyaan user (Selective RAG).
   * Tidak pernah mengirim semua plugin; hanya mengambil maksimal `limit` (default 5) plugin paling relevan!
   *
   * @param {string} query
   * @param {object} [options]
   * @param {number} [options.limit=5]
   * @param {boolean} [options.includeOwner=false]
   * @returns {Array<object>}
   */
  searchRelevantPlugins(query, { limit = 5, includeOwner = false } = {}) {
    if (!query || typeof query !== 'string') return []
    this.syncIndex()

    const qLow = query.toLowerCase().trim()
    const cleanQueryCmd = qLow.replace(/^[./!#]+/, '').split(/\s+/)[0]
    const tokens = qLow
      .replace(/[^a-z0-9_.\s-]/g, ' ')
      .split(/\s+/)
      .map(t => t.replace(/^[./!]+/, ''))
      .filter(t => t.length >= 2 && !['cara', 'gimana', 'bagaimana', 'apa', 'itu', 'yang', 'untuk', 'buat', 'bikin', 'pakai', 'pake', 'fungsi', 'fitur', 'bot', 'ada', 'gak', 'nggak', 'bisa', 'tolong', 'dong', 'kak', 'min', 'avelia'].includes(t))

    const results = []

    for (const { entry } of this.cache.values()) {
      if (!includeOwner && entry.isOwnerOnly && !qLow.includes('owner') && !entry.commands.includes(cleanQueryCmd)) {
        continue
      }

      let score = 0

      // 1. Exact match pada nama command utama atau alias
      if (entry.commands.includes(cleanQueryCmd)) {
        score += 120
      }

      for (const token of tokens) {
        if (entry.commands.includes(token)) {
          score += 80
        } else if (entry.commands.some(c => c.startsWith(token) || token.startsWith(c))) {
          score += 35
        }

        if (entry.tags.includes(token) || entry.category === token) {
          score += 45
        }

        if (entry.helpList.some(h => h.toLowerCase().includes(token))) {
          score += 30
        }

        if (entry.description.toLowerCase().includes(token)) {
          score += 20
        }

        if (entry.tutorialLines.some(l => l.toLowerCase().includes(token))) {
          score += 18
        }
      }

      // 2. Pencocokan Frasa Sinonim Bahasa Sehari-hari
      for (const [key, syns] of Object.entries(FEATURE_SYNONYMS)) {
        if (syns.some(syn => qLow.includes(syn))) {
          if (entry.commands.includes(key) || entry.category === key || entry.tags.includes(key)) {
            score += 95
          }
        }
      }

      // 3. Fallback pencocokan substring jika tokens kosong (misal user tanya "cara buat stiker")
      if (tokens.length === 0) {
        if (qLow.includes('stiker') || qLow.includes('sticker')) {
          if (entry.category === 'sticker') score += 40
        }
      }

      if (score >= 20) {
        results.push({ entry, score })
      }
    }

    results.sort((a, b) => b.score - a.score)
    return results.slice(0, limit).map(r => r.entry)
  }

  /**
   * Merakit teks konteks RAG yang sangat ringkas dan padat untuk disuntikkan ke System Prompt AI
   * HANYA ketika user bertanya tentang fitur bot.
   */
  buildAIPluginContext(userText, { isOwner = false } = {}) {
    if (!this.isBotFeatureQuery(userText)) {
      return ''
    }

    const topPlugins = this.searchRelevantPlugins(userText, {
      limit: 5,
      includeOwner: isOwner
    })

    if (topPlugins.length === 0) {
      return ''
    }

    const lines = topPlugins.map((p, idx) => {
      const cmdList = p.commands.slice(0, 6).map(c => `.${c}`).join(', ')
      const usageList = p.helpList.slice(0, 4).map(h => (h.startsWith('.') ? h : `.${h}`)).join(' | ')
      const tutorial = p.tutorialLines.length > 0
        ? `\n  Panduan/Contoh: ${p.tutorialLines.slice(0, 3).join(' ; ')}`
        : ''
      const flagStr = p.flags.length > 0 ? ` [${p.flags.join(', ')}]` : ''

      return `${idx + 1}. Fitur *${p.primaryCmd.toUpperCase()}* (Kategori: ${p.category})${flagStr}\n` +
        `  - Command/Alias: ${cmdList}\n` +
        `  - Format Pakai: ${usageList}\n` +
        `  - Fungsi: ${p.description}${tutorial}`
    })

    return `\n# DATA FITUR BOT YANG MENDEKATI PERTANYAAN USER (SUMBER ASLI DARI FILE PLUGIN):\n` +
      `Gunakan data akurat di bawah ini untuk menjelaskan cara pakai/fungsi fitur kepada user (jangan mengarang command di luar daftar ini):\n` +
      lines.join('\n\n')
  }

  /**
   * Merender kartu tutorial lengkap untuk command `.help <nama_fitur / kategori>`
   */
  formatHelpLookupResponse(query, usedPrefix = '.', { isOwner = false } = {}) {
    if (!query || !query.trim()) return null
    this.syncIndex()

    const cleanQ = query.trim().toLowerCase().replace(/^[./!#]+/, '')

    // 1. Cek apakah ada exact match dengan nama command
    let exactPlugin = null
    for (const { entry } of this.cache.values()) {
      if (entry.commands.includes(cleanQ)) {
        exactPlugin = entry
        break
      }
    }

    if (exactPlugin) {
      return this._renderSinglePluginCard(exactPlugin, usedPrefix)
    }

    // 2. Jika bukan nama command persis, cari daftar plugin yang mendekati (misal `.help sticker` atau `.help stiker suara`)
    const matches = this.searchRelevantPlugins(cleanQ, {
      limit: 8,
      includeOwner: isOwner
    })

    if (matches.length === 0) {
      return `*╭  〔 ⚠ ꜰ ɪ ᴛ ᴜ ʀ  ᴛ ɪ ᴅ ᴀ ᴋ  ᴅ ɪ ᴛ ᴇ ᴍ ᴜ ᴋ ᴀ ɴ 〕*\n` +
        `> Tidak ditemukan fitur atau command yang cocok dengan kata kunci *"${query}"*.\n` +
        `> › Ketik *${usedPrefix}menu* atau *${usedPrefix}allmenu* untuk melihat daftar lengkap fitur bot.\n` +
        `*╰──────────────────────*`
    }

    if (matches.length === 1) {
      return this._renderSinglePluginCard(matches[0], usedPrefix)
    }

    // Render kartu pertama secara detail + daftar fitur terkait lainnya
    const top = matches[0]
    const otherList = matches.slice(1).map((p, i) => {
      const formats = p.helpList.slice(0, 2).map(h => `${usedPrefix}${h.replace(/^[./!]/, '')}`).join(', ')
      return `*┆* ${i + 1}. *${usedPrefix}${p.primaryCmd}* — ${formats}\n*┆*    ↳ _${p.description.slice(0, 90)}_`
    }).join('\n')

    return this._renderSinglePluginCard(top, usedPrefix) +
      `\n\n*╭  〔 ✦ ꜰ ɪ ᴛ ᴜ ʀ  ᴛ ᴇ ʀ ᴋ ᴀ ɪ ᴛ  ʟ ᴀ ɪ ɴ ɴ ʏ ᴀ 〕*\n` +
      `${otherList}\n` +
      `*╰──────────────────────*\n` +
      `> _Ketik *${usedPrefix}help <nama_command>* untuk melihat detail fitur tertentu._`
  }

  _renderSinglePluginCard(p, usedPrefix = '.') {
    const aliases = p.commands.map(c => `\`${usedPrefix}${c}\``).join(', ')
    const usageLines = p.helpList.map(h => `*┆* › *${usedPrefix}${h.replace(/^[./!]/, '')}*`).join('\n')
    const flagBadge = p.flags.length > 0 ? p.flags.join(' • ') : 'Publik (Semua User)'

    const tutorialSection = p.tutorialLines.length > 0
      ? `\n*╭  〔 📖 ᴛ ᴜ ᴛ ᴏ ʀ ɪ ᴀ ʟ  &  ᴄ ᴏ ɴ ᴛ ᴏ ʜ 〕*\n` +
        p.tutorialLines.map(l => `*┆* • ${l}`).join('\n') +
        `\n*╰──────────────────────*`
      : ''

    return `*──  ୨୧ ✧ PANDUAN FITUR BOT ✧ ୨୧  ──*\n\n` +
      `*╭  〔 ❖ ɪ ɴ ꜰ ᴏ  ꜰ ɪ ᴛ ᴜ ʀ 〕*\n` +
      `*┆* ⟡ ꜰɪᴛᴜʀ     : *${usedPrefix}${p.primaryCmd.toUpperCase()}*\n` +
      `*┆* ◈ ᴋᴀᴛᴇɢᴏʀɪ  : *${p.category.toUpperCase()}*\n` +
      `*┆* ✧ ᴀʟɪᴀꜱ     : ${aliases}\n` +
      `*┆* ⌬ ᴀᴋꜱᴇꜱ     : *${flagBadge}*\n` +
      `*┆* 📂 ꜱᴜᴍʙᴇʀ    : \`plugins/${p.filename}\`\n` +
      `*╰──────────────────────*\n\n` +
      `*╭  〔 ✦ ꜰ ᴜ ɴ ɢ ꜱ ɪ  &  ᴋ ᴇ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*\n` +
      `*┆* ${p.description}\n` +
      `*╰──────────────────────*\n\n` +
      `*╭  〔 ⚙ ꜰ ᴏ ʀ ᴍ ᴀ ᴛ  ᴘ ᴇ ʀ ɪ ɴ ᴛ ᴀ ʜ 〕*\n` +
      `${usageLines}\n` +
      `*╰──────────────────────*` +
      tutorialSection
  }
}

export const pluginKnowledgeIndex = new PluginKnowledgeIndex()
export { PluginKnowledgeIndex }
