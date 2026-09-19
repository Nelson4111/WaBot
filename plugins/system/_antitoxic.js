/**
 * Anti-Toxic System Plugin
 * Mendeteksi tutur kata kasar / toxic, auto-delete, sanksi 3x strike kick, dan panel kontrol admin.
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

const LEET_MAP = {
  '0': 'o',
  '1': 'i',
  '2': 'z',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's',
  '!': 'i'
}

function normalizeLeet(str) {
  let res = ''
  for (let ch of str) {
    res += LEET_MAP[ch] || ch
  }
  return res
}

function collapseRepeated(str) {
  return str.replace(/(.)\1+/g, '$1')
}

// Akar kata umpatan multi-karakter yang dapat membawa imbuhan / afiks Indonesia (contoh: dianjingin, kontolmu)
// Akar kata umpatan multi-karakter yang dapat membawa imbuhan / afiks Indonesia
const ROOT_AFFIXES = [
  'anjing', 'bangsat', 'kontol', 'memek', 'ngentot', 'bajingan', 'goblok', 'tolol', 'jancok', 'jancuk', 'pantek', 'puki',
  'jembut', 'peler', 'asu', 'anjir', 'anjrit', 'anjg', 'bangke', 'bangkean', 'kampret', 'keparat', 'brengsek', 'bedebah',
  'bego', 'bloon', 'idiot', 'bahlul', 'dungu', 'oon', 'sinting', 'gila', 'tai', 'taik', 'babi', 'lonte', 'lonthe',
  'pelacur', 'perek', 'sundal', 'jalang', 'bencong', 'banci', 'itil', 'tempik', 'kimak', 'titit', 'pepek', 'coli',
  'colmek', 'kenthu', 'ngaceng', 'nenen', 'tetek', 'tetek', 'bokep', 'vcs', 'wot', 'trisom', 'threesome', 'sex',
  'seks', 'porno', 'porn', 'pornografi', 'mesum', 'bugil', 'telanjang', 'sange', 'birahi', 'sperma', 'mani', 'vagina',
  'penis', 'zakar', 'dubur', 'pantat', 'bokong', 'payudara', 'puting', 'ngewe', 'ewe', 'ewean', 'masturbasi', 'masturbate',
  'orgasme', 'ejakulasi', 'sodomi', 'sodomi', 'anal', 'oral', 'erotis', 'erotic', 'fetish', 'hentai', 'ecchi', 'topless',
  'nude', 'nudity', 'striptease', 'stripper', 'prostitusi', 'pelacuran', 'cabul', 'pencabulan', 'crot', 'ngocok', 'onani', 'sangean',
  'memek', 'kontol', 'ngentot', 'ngewe', 'ngentod', 'ngentd', 'ngentot', 'entot', 'entod', 'ewe', 'ewean', 'enen', 'ngocok',
  'kocok', 'colay', 'coli', 'colmek', 'colmekan', 'masturbasi', 'masturbate', 'wikwik', 'wikwik', 'crot', 'ngecrot',
  'ngocrot', 'sange', 'sangean', 'sangeh', 'desah', 'desahan', 'desahdesah', 'vcs', 'vc', 'bokep', 'bokepan', 'video porno',
  'video sex', 'sex tape', 'sextape', 'nudes', 'nude', 'pornhub', 'xvideos', 'xnxx', 'redtube', 'youporn', 'xhamster',
  'spank', 'spanking', 'blowjob', 'handjob', 'deepthroat', 'rimjob', 'footjob', 'cum', 'cumming', 'cumshot', 'facial',
  'creampie', 'bukkake', 'gangbang', 'orgy', 'orgasme', 'climax', 'ejaculate', 'ejaculation', 'semen', 'sperm', 'pussy',
  'dick', 'cock', 'cunt', 'asshole', 'bitch', 'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bullshit', 'whore',
  'slut', 'bastard', 'damn', 'dickhead', 'prick', 'crap', 'wanker', 'jerkoff', 'jackoff', 'jerking', 'horny', 'porn',
  'porno', 'nsfw', 'lewd', 'lewding', 'sexual', 'sexually', 'naked', 'nakedness', 'xxx', 'xxxvideo', 'adult',
  'adultcontent', 'explicit', 'obscene', 'obscenity', 'prostitute', 'prostitution', 'escort', 'escortservice', 'hooker',
  'slutty', 'whorish', 'pervert', 'perverted', 'perversion', 'molest', 'molestation', 'pedofil', 'pedophile', 'pedophilia',
  'pedo', 'childporn', 'cp', 'lolicon', 'shotacon', 'lolita', 'incest', 'incestuous', 'bestiality', 'zoophilia', 'rape',
  'raped', 'raping', 'rapist', 'pemerkosa', 'pemerkosaan', 'perkosa', 'memperkosa', 'rudapaksa', 'pelecehan', 'melecehkan',
  'cabul', 'cabuli', 'mencabuli', 'pencabul', 'pencabulan', 'mesum', 'kemesuman', 'asusila', 'susila', 'tidaksenonoh', 'senonoh',
  'pornoaksi', 'pornografi', 'pornografi', 'pornomedia', 'pornstar', 'pornstar', 'onlyfans', 'fansly', 'camgirl', 'camboy',
  'webcamsex', 'cybersex', 'phone sex', 'sexting', 'sext', 'dickpic', 'dickpic', 'nudes', 'sendnudes', 'send nude', 'boobs',
  'boob', 'breast', 'tit', 'tits', 'nipple', 'nipples', 'ass', 'butt', 'butthole', 'arse', 'arsehole', 'balls', 'ballsy',
  'testicle', 'testicles', 'scrotum', 'vulva', 'clitoris', 'clit', 'labia', 'anus', 'anal', 'rectum', 'penis', 'vagina',
  'vulgar', 'vulgarity', 'dirtytalk', 'dirty talk', 'sextalk', 'sexchat', 'hornychat', 'nsfwchat', '18plus', '21plus',
  'kontolmu', 'kontolku', 'kontolnya', 'kontolan', 'mengontol', 'dikontol', 'terkontol', 'memekmu', 'memekku', 'memeknya',
  'memekan', 'mememek', 'ngentotin', 'ngentotin', 'ngentotin', 'ngentotmu', 'ngentotku', 'ngentotnya', 'dientot', 'diwewe',
  'ngewein', 'ngewean', 'ngewein', 'coliannya', 'coliin', 'dicolikan', 'masturbasian', 'masturbator', 'masturbatory',
  'anjingin', 'anjingin', 'anjingmu', 'anjingku', 'anjingnya', 'menganjing', 'dianggapanjing', 'bangsatmu', 'bangsatnya',
  'bangsatku', 'membangsat', 'dibangsatkan', 'goblokmu', 'gobloknya', 'goblokku', 'menggoblokkan', 'digoblokkan',
  'tololmu', 'tololnya', 'tololku', 'menololkan', 'ditololkan', 'begoan', 'begomu', 'begonya', 'idiotmu', 'idiotnya',
  'jancokmu', 'jancoknya', 'jancukmu', 'jancuknya', 'pukimak', 'pukima', 'pukimakmu', 'pukimakannya', 'kimakmu', 'kimaknya'
]

// Daftar kata kasar / toxic persis (token-level matching)
const EXACT_TOXIC = new Set([
  'anjing', 'anjg', 'ajg', 'anjir', 'anjrit', 'anjrot', 'anjrut', 'anjay', 'anjayy', 'anjg', 'anj', 'asw',
  'asu', 'asu', 'bangsat', 'bgst', 'bngst', 'bngsat', 'bangke', 'bajingan', 'bjngn', 'bajing', 'kampret', 'kmprt',
  'keparat', 'kprat', 'brengsek', 'brngsek', 'bedebah', 'sialan', 'sial', 'celeng', 'monyet', 'kera', 'babi',
  'goblok', 'gblg', 'gblk', 'tolol', 'tlol', 'tll', 'bego', 'bgo', 'bloon', 'blon', 'idiot', 'id10t', 'bahlul',
  'dungu', 'dng', 'oon', 'o\'on', 'sinting', 'edan', 'gila', 'gila2', 'bodoh', 'bodohh', 'bodohhh', 'dongo', 'dongok',
  'jancok', 'jancuk', 'jancok', 'jancuq', 'dancok', 'dancuk', 'cok', 'cuk', 'coq', 'cokkk', 'cukkk',
  'pantek', 'panteq', 'pntk', 'pantek', 'puki', 'pukimak', 'pukima', 'pukimak', 'kimak', 'kimaq', 'kimak',
  'kontol', 'kntl', 'kntil', 'kntol', 'knt1l', 'kont0l', 'kontolmu', 'kontolnya', 'titit', 't1t1t', 'tltlt', 'peler',
  'pler', 'plr', 'pepek', 'ppek', 'ppk', 'memek', 'mmk', 'm3m3k', 'mem3k', 'memeq', 'jembut', 'jmbt', 'jmbut',
  'ngentot', 'ngntt', 'ngnt0t', 'ngentod', 'ngentd', 'ngent0d', 'entot', 'entod', 'ewe', 'ewean', 'wewe',
  'kenthu', 'kenthut', 'ngaceng', 'ngacengg', 'cangkem', 'cangkeman', 'coli', 'colay', 'colmek', 'clmk', 'clmek',
  'ngocok', 'ngocok2', 'ngocrot', 'crot', 'ngecrot', 'masturbasi', 'masturbate', 'onani', 'onan1', 'sange', 'sangean',
  'sangeh', 'horny', 'hornie', 'hornyaf', 'birahi', 'birahian', 'desah', 'desahan', 'desah2', 'nenen', 'enen',
  'tetek', 'teteq', 'tet3k', 'tetekmu', 'teteknya', 'boobs', 'boob', 'tit', 'tits', 'nipple', 'nipples',
  'payudara', 'dada', 'puting', 'putingmu', 'putingnya', 'bokong', 'pantat', 'pantad', 'pntt', 'pntat', 'pantatmu',
  'pantatnya', 'pantatku', 'bokep', 'bokepan', 'bokepmu', 'bokepnya', 'bokepindo', 'vcs', 'vcsex', 'vcsan', 'vcsexan',
  'videosex', 'videosx', 'videosex', 'sex', 'seks', 'sexy', 'seksy', 'sexs', 's3x', 's3ks', 'porn', 'porno', 'p0rn',
  'p0rno', 'pornografi', 'pornhub', 'xvideos', 'xnxx', 'xhamster', 'redtube', 'youporn', 'xxx', 'nsfw', '18+', '18plus',
  'nude', 'nudes', 'nud3', 'nudity', 'bugil', 'bugilmu', 'bugilnya', 'telanjang', 'telanjangmu', 'telanjangnya',
  'topless', 'striptease', 'stripper', 'erotis', 'erotic', 'er0tic', 'fetish', 'fetishism', 'hentai', 'h3ntai', 'ecchi',
  'threesome', '3some', 'trisom', 'tr1som', 'threesom', 'gangbang', 'gangb4ng', 'gangbangs', 'orgy', 'orgi', 'orgy',
  'bukkake', 'bukk4ke', 'blowjob', 'bl0wjob', 'bj', 'handjob', 'hj', 'deepthroat', 'rimjob', 'footjob', 'cum',
  'cumming', 'cumshot', 'creampie', 'facial', 'squirting', 'squirt', 'pussy', 'puss', 'pussi', 'pusi', 'dick',
  'd1ck', 'cock', 'c0ck', 'cunt', 'c*nt', 'asshole', 'a55hole', 'bitch', 'b1tch', 'fuck', 'fck', 'fuk', 'fckk',
  'fucking', 'fcking', 'fucker', 'fckr', 'motherfucker', 'mofo', 'shit', 'sh1t', 'sht', 'bullshit', 'whore', 'wh0re',
  'slut', 'slutt', 'bastard', 'b4stard', 'damn', 'd4mn', 'prick', 'dickhead', 'dickhed', 'wanker', 'jackoff',
  'jerkoff', 'jerkingoff', 'ass', 'a55', 'arse', 'arsehole', 'butt', 'butthole', 'balls', 'ballz', 'testicle', 'scrotum',
  'vagina', 'v4gina', 'vajina', 'pussy', 'vulva', 'clitoris', 'clit', 'labia', 'anus', 'anal', 'dubur', 'zakar', 'penis',
  'p3nis', 'sperma', 'sperm', 'sperm4', 'mani', 'semen', 'ejakulasi', 'ejaculate', 'ejaculation', 'orgasme', 'orgasm',
  'oral', 'seksoral', 'sexoral', 'anal', 'seksanal', 'sexanal', 'sodomi', 'sodom1', 'incest', 'inc3st', 'pedofil',
  'pedophile', 'pedophilia', 'pedo', 'cp', 'childporn', 'lolicon', 'l0licon', 'shotacon', 'bestiality', 'zoophilia',
  'rape', 'raped', 'raping', 'rapist', 'perkosa', 'diperkosa', 'memperkosa', 'pemerkosa', 'pemerkosaan', 'rudapaksa',
  'pelecehan', 'melecehkan', 'cabul', 'cabuli', 'mencabuli', 'pencabul', 'pencabulan', 'asusila', 'tidaksenonoh',
  'prostitusi', 'prostitute', 'pelacur', 'pelacuran', 'lonte', 'lonthe', 'perek', 'sundal', 'jalang', 'pelacur',
  'hooker', 'whor3', 'escort', 'escortgirl', 'escortboy', 'camgirl', 'camboy', 'onlyfans', 'fansly', 'sexting',
  'sext', 'sexchat', 'cybersex', 'webcamsex', 'phone sex', 'dickpic', 'sendnudes', 'sendnude', 'nudesend', 'dirtytalk',
  'dirtytalking', 'dirtychat', 'sexchat', 'nsfwchat', 'explicit', 'obscene', 'obscenity', 'lewd', 'lewdness', 'pervert',
  'perverted', 'perversion', 'mesum', 'kemesuman', 'pornoaksi', 'pornomedia', 'pornstar', 'adultcontent', 'adultvideo',
  'xxxvideo', 'xxxvid', 'sexvideo', 'sexvid', 'sexcam', 'camsex', 'wot', 'wotsex', 'vcssex', 'vcsbokep', 'vcbokep',
  'vcsex', 'videochatsex', 'sangevideo', 'sangean', 'bokepan', 'bokepin', 'bokepmu', 'bokepnya', 'bokepgratis',
  'bokepindo', 'bokepindonesia', 'bokepjav', 'jav', 'japaneseadult', 'javporn', 'javxxx'
])

// Daftar kata aman bahasa Indonesia yang mengandung substring mirip kata kasar
const SAFE_WHITELIST = new Set([
  'pantai', 'santai', 'lantai', 'rantai', 'petai', 'teratai', 'intai', 'mengintai', 'diintai', 'pengintai', 'pengintaian', 'mengintip',
  'asumsi', 'asuhan', 'mengasuh', 'pengasuh', 'asuransi', 'masukan', 'kemasukan', 'memasukkan', 'basuh', 'membasuh', 'pembasuh', 'terbasuh',
  'kasur', 'bukan', 'makan', 'tekan', 'pakan', 'rekan', 'kocok', 'cocok', 'cokelat', 'coklat', 'coki', 'cokil', 'soto', 'toko',
  'foto', 'titik', 'titip', 'menitip', 'penitipan', 'dititipkan', 'babiq', 'membabi', 'tahu', 'paku', 'saku', 'baku', 'beku',
  'daku', 'laku', 'kaku', 'suka', 'duka', 'kotak', 'botak', 'otak', 'tolong', 'menolong', 'penolong', 'menepuki', 'ditepuki',
  'tepuk', 'bertepuk', 'tepukan', 'tepuk tangan', 'assalam', 'assalamualaikum', 'shitake', 'shitakei', 'shitake mushroom',
  'pantauan', 'memantau', 'pemantauan', 'santai', 'bersantai', 'kesantaian', 'lantunan', 'melantun', 'ranting', 'rantingnya',
  'perantingan', 'petani', 'pertanian', 'peternakan', 'teratak', 'teratai', 'intan', 'mengintai', 'pengintaian', 'asuhan',
  'pengasuhan', 'kasual', 'kasualisasi', 'masuk', 'masukan', 'kemasukan', 'rekanan', 'berekan', 'cocokan', 'mencocokkan',
  'pencocokan', 'coklat', 'cokelat', 'cokelatan', 'tokoh', 'toko', 'tokonya', 'fotografi', 'fotografer', 'fotokopi', 'fotokopian',
  'titiknya', 'titipan', 'penitipan', 'penitip', 'dititipi', 'pakunya', 'sakunya', 'bakunya', 'bekunya', 'lakunya', 'kakunya',
  'sukanya', 'dukanya', 'kotaknya', 'botaknya', 'otaknya', 'tolonglah', 'menolongnya', 'penolongnya', 'tepukan', 'bertepuk',
  'ditepuk', 'menepuk', 'menepuknya', 'tepukannya'
])

const ANTI_TOXIC_MAX_WARNS = 4

export function detectToxic(text) {
  if (!text || typeof text !== 'string') return null

  // 1. Bersihkan zero-width spaces dan normalisasi huruf kecil
  let cleaned = text
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '')
    .toLowerCase()

  // 2. Normalisasi karakter simbol intra-kata (seperti sh!t, b!tch, b@bi, k$ntol, f*ck)
  cleaned = cleaned
    .replace(/([a-z0-9])!([a-z0-9])/gi, '$1i$2')
    .replace(/([a-z0-9])@([a-z0-9])/gi, '$1a$2')
    .replace(/([a-z0-9])\$([a-z0-9])/gi, '$1s$2')
    .replace(/([a-z0-9])0([a-z0-9])/gi, '$1o$2')
    .replace(/f[\*_]{1,2}ck/gi, 'fuck')
    .replace(/b[\*_]{1,2}tch/gi, 'bitch')
    .replace(/k[\*_]{1,2}nt[\*_]{1,2}l/gi, 'kontol')
    .replace(/m[\*_]{1,2}m[\*_]{1,2}k/gi, 'memek')
    .replace(/[*_~`]/g, ' ')

  // 3. Deteksi ejaan per huruf terpisah spasi / titik (contoh: a n j i n g atau k . o . n . t . o . l)
  const spacedMatches = cleaned.match(/(?:^|\s)([a-z0-9](?:[\s._\-~*^]+[a-z0-9]){2,})(?:\s|$)/g)
  if (spacedMatches) {
    for (let sm of spacedMatches) {
      let combined = sm.replace(/[\s._\-~*^]/g, '')
      let combinedNorm = collapseRepeated(normalizeLeet(combined))
      if (EXACT_TOXIC.has(combined) || EXACT_TOXIC.has(combinedNorm)) {
        return combined
      }
      for (let root of ROOT_AFFIXES) {
        if (combinedNorm.includes(root)) return root
      }
    }
  }

  // 4. Tokenisasi teks berdasarkan spasi dan tanda baca
  const tokens = cleaned.split(/[\s.,!?:;"'()[\]{}<>\/\\_~*^+=|#&%@$—–-]+/).filter(Boolean)

  for (let rawToken of tokens) {
    if (SAFE_WHITELIST.has(rawToken)) continue

    // Token persis
    if (EXACT_TOXIC.has(rawToken)) return rawToken

    // Normalisasi leetspeak
    let leet = normalizeLeet(rawToken)
    if (SAFE_WHITELIST.has(leet)) continue
    if (EXACT_TOXIC.has(leet)) return rawToken

    // Normalisasi pengulangan huruf (anjiiing -> anjing)
    let collapsed = collapseRepeated(rawToken)
    if (SAFE_WHITELIST.has(collapsed)) continue
    if (EXACT_TOXIC.has(collapsed)) return rawToken

    // Kombinasi leetspeak + pengulangan huruf
    let both = collapseRepeated(leet)
    if (SAFE_WHITELIST.has(both)) continue
    if (EXACT_TOXIC.has(both)) return rawToken

    // Pengecekan akar kata umpatan dengan afiks/imbuhan (dianjingin, kontolmu, memeknya)
    for (let root of ROOT_AFFIXES) {
      if (both.includes(root)) {
        if (!SAFE_WHITELIST.has(both)) {
          return rawToken
        }
      }
    }
  }

  return null
}

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return global.dfail('group', m, conn)
  if (!isAdmin && !isOwner) return global.dfail('admin', m, conn)

  let chat = global.db.data.chats[m.chat]
  if (!chat) return
  if (!chat.toxicWarn || typeof chat.toxicWarn !== 'object') chat.toxicWarn = {}
  if (!chat.toxicWhitelist || typeof chat.toxicWhitelist !== 'object') chat.toxicWhitelist = {}
  if (!chat.toxicKickHistory || !Array.isArray(chat.toxicKickHistory)) chat.toxicKickHistory = []

  let sub = (args[0] || '').toLowerCase()
  const statusStr = (val) => val ? '✓ ᴀᴋᴛɪꜰ (ᴏɴ)' : '✕ ɴᴏɴᴀᴋᴛɪꜰ (ᴏꜰꜰ)'

  if (/^(on|enable|1)$/i.test(sub)) {
    if (chat.antiToxic) {
      return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Sudah Aktif!*\n*╰───────────────*`)
    }
    chat.antiToxic = true
    return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ     : *Aktif (ON)*\n*┆* ✧ ᴛɪɴᴅᴀᴄᴋᴀɴ   : Auto-delete kata kasar + ${ANTI_TOXIC_MAX_WARNS}x strike kick\n*┆* ✦ ʙᴏᴛ ᴀᴅᴍɪɴ : *${isBotAdmin ? '✓ ᴀᴅᴍɪɴ' : '✕ ʙᴜᴄᴀɴ ᴀᴅᴍɪɴ (jadikan admin agar bisa delete/kick)'}*\n*╰───────────────*\n> _Grup sekarang dilindungi dari tutur kata kasar / toxic, termasuk admin dan owner._`)
  }

  if (/^(off|disable|0)$/i.test(sub)) {
    if (!chat.antiToxic) {
      return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Sudah Nonaktif!*\n*╰───────────────*`)
    }
    chat.antiToxic = false
    return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ꜱᴛᴀᴛᴜꜱ : *Nonaktif (OFF)*\n*╰───────────────*\n> _Perlindungan anti-toxic telah dimatikan._`)
  }

  if (/^(history|kickhistory|log)$/i.test(sub)) {
    const history = Array.isArray(chat.toxicKickHistory) ? chat.toxicKickHistory.slice(-10).reverse() : []
    if (!history.length) {
      return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ʜɪꜱᴛᴏʀʏ : *Belum ada user yang di-kick*\n*╰───────────────*`)
    }

    const lines = history.map((entry, idx) => {
      const user = (entry.user || '').replace(/@s\\.whatsapp\\.net$/, '')
      const date = entry.date ? new Date(entry.date).toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : 'N/A'
      return `${idx + 1}. @${user} • ${date}`
    }).join('\n')

    return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ʜɪꜱᴛᴏʀʏ ᴋɪᴄᴋ ᴛᴇʀᴀᴋʜɪʀ\n*┆* ${lines}\n*╰───────────────*`)
  }

  if (/^(wl|whitelist)$/i.test(sub)) {
    const target = (args[1] || '').trim()
    const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (target ? target.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null)

    if (!who) {
      return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* › Tambah : *${usedPrefix + command} whitelist @user*\n*┆* › Hapus  : *${usedPrefix + command} whitelist remove @user*\n*╰───────────────*`)
    }

    const mode = (args[2] || '').toLowerCase()
    if (mode === 'remove' || mode === 'del' || mode === 'hapus') {
      delete chat.toxicWhitelist[who]
      return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ᴡʜɪᴛᴇʟɪꜛᴛ : *Dihapus*\n*┆* ✧ ᴜꜱᴇʀ : @${who.split('@')[0]}\n*╰───────────────*`)
    }

    chat.toxicWhitelist[who] = true
    return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ᴡʜɪᴛᴇʟɪꜛᴛ : *Ditambahkan*\n*┆* ✧ ᴜꜱᴇʀ : @${who.split('@')[0]}\n*┆* ✦ ᴋᴇᴛᴇʀᴀɴɢᴀɴ : *Tidak auto-kick walau strike 4x*\n*╰───────────────*`)
  }

  if (/^reset$/i.test(sub)) {
    let target = (args[1] || '').toLowerCase()
    if (target === 'all' || target === 'semua') {
      const totalReset = Object.keys(chat.toxicWarn).length
      chat.toxicWarn = {}
      return m.reply(`*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ᴛɪɴᴅᴀᴋᴀɴ : *Reset Seluruh Peringatan*\n*┆* ✧ ᴛᴏᴛᴀʟ    : *${totalReset} Anggota*\n*╰───────────────*\n> _Semua catatan pelanggaran toxic di grup ini telah direset ke 0._`)
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
    if (!who && target) {
      let cleanNum = target.replace(/[^0-9]/g, '')
      if (cleanNum.length >= 8) who = cleanNum + '@s.whatsapp.net'
    }

    if (who) {
      let prevWarn = chat.toxicWarn[who] || 0
      delete chat.toxicWarn[who]
      let uNum = who.split('@')[0].split(':')[0].replace(/\D/g, '')
      return conn.sendMessage(m.chat, {
        text: `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*\n*┆* ⟡ ᴛɪɴᴅᴀᴋᴀɴ : *Reset Strike User*\n*┆* ✧ ᴜꜱᴇʀ     : @${uNum}\n*┆* ✦ ꜱᴛʀɪᴋᴇ   : *${prevWarn} ➔ 0*\n*╰───────────────*\n> _Catatan peringatan pengguna telah dibersihkan._`,
        mentions: [who]
      })
    }

    return m.reply(`*╭  〔 ◈ ᴄ ᴀ ʀ ᴀ  ʀ ᴇ ꜱ ᴇ ᴛ 〕*\n*┆* › Reset per user : *${usedPrefix + command} reset @user*\n*┆* › Reset semua    : *${usedPrefix + command} reset all*\n*╰───────────────*`)
  }

  // Dashboard Status & Info
  let totalViolators = Object.keys(chat.toxicWarn || {}).filter(k => (chat.toxicWarn[k] || 0) > 0).length

  const infoText = `*──  ୨୧ ✧ PENGATURAN ANTI TOXIC ✧ ୨୧  ──*

> *おしらせ!* (ᴀɴᴛɪ-ᴛᴏxɪᴄ ꜱʏꜱᴛᴇᴍ)
> Melindungi grup dari tutur kata kasar, caci maki, dan konten toxic.

*╭  〔 ❖ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*
*┆* ⟡ ꜰɪᴛᴜʀ       : *${statusStr(chat.antiToxic)}*
*┆* ✧ ʙᴏᴛ ᴀᴅᴍɪɴ   : *${isBotAdmin ? '✓ ᴀᴅᴍɪɴ' : '✕ ʙᴜᴋᴀɴ ᴀᴅᴍɪɴ'}*
*┆* ✦ ᴍᴀᴋꜱ ꜱᴛʀɪᴋᴇ : *${ANTI_TOXIC_MAX_WARNS}x Peringatan (Auto Kick)*
*┆* ◈ ᴛᴇʀᴄᴀᴛᴀᴛ    : *${totalViolators} Anggota Terkena Strike*
*╰───────────────*

*╭  〔 ◈ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*
*┆* › Mengaktifkan : *${usedPrefix + command} on*
*┆* › Mematikan    : *${usedPrefix + command} off*
*┆* › Reset User   : *${usedPrefix + command} reset @user*
*┆* › Reset Semua  : *${usedPrefix + command} reset all*
*┆* › History Kick: *${usedPrefix + command} history*
*┆* › WhiteList   : *${usedPrefix + command} whitelist @user*
*╰───────────────*`.trim()

  return m.reply(infoText)
}

handler.help = ['antitoxic [on/off/reset]']
handler.tags = ['group']
handler.command = /^anti(toxic|kasar)$/i
handler.group = true
handler.admin = true

handler.before = async function (m, { conn, isAdmin, isOwner, isBotAdmin }) {
  if (!m.isGroup) return false
  const chat = global.db.data?.chats?.[m.chat]
  if (!chat?.antiToxic) return false
  if (m.fromMe) return false

  let text = m.text || m.caption || (m.msg && m.msg.caption) || ''
  if (!text) return false

  const toxicHit = detectToxic(text)
  if (!toxicHit) return false

  if (!chat.toxicWarn || typeof chat.toxicWarn !== 'object') chat.toxicWarn = {}
  if (!chat.toxicWhitelist || typeof chat.toxicWhitelist !== 'object') chat.toxicWhitelist = {}
  if (!chat.toxicKickHistory || !Array.isArray(chat.toxicKickHistory)) chat.toxicKickHistory = []

  const isWhitelisted = !!chat.toxicWhitelist[m.sender]
  chat.toxicWarn[m.sender] = (chat.toxicWarn[m.sender] || 0) + 1

  const strikes = chat.toxicWarn[m.sender]
  const userNumber = (m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')

  // Hapus pesan toxic terlebih dahulu tanpa quote
  if (isBotAdmin) {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant || m.sender
      }
    }).catch(() => null)
  }
  if (isWhitelisted && strikes >= ANTI_TOXIC_MAX_WARNS) {
    const wlText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ    : @${userNumber}
*┆* ✧ ᴘᴇʟᴀɴɢɢᴀʀᴀɴ : Tutur kata kasar / toxic
*┆* ✦ ᴘᴇʀɪɴɢᴀᴛᴀɴ  : *[ ${strikes} / ${ANTI_TOXIC_MAX_WARNS} ]*
*┆* ◈ ᴛɪɴᴅᴀᴄᴋᴀɴ    : *Whitelist aktif, tidak auto-kick*
*╰───────────────*
> _User masuk daftar whitelist, jadi tetap aman dari kick otomatis._`.trim()

    await conn.sendMessage(m.chat, {
      text: wlText,
      mentions: [m.sender]
    }).catch(() => null)
    return true
  }
  if (strikes < ANTI_TOXIC_MAX_WARNS) {
    const warnText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ    : @${userNumber}
*┆* ✧ ᴘᴇʟᴀɴɢɢᴀʀᴀɴ : Tutur kata kasar / toxic
*┆* ✦ ᴘᴇʀɪɴɢᴀᴛᴀɴ  : *[ ${strikes} / ${ANTI_TOXIC_MAX_WARNS} ]*
*┆* ◈ ᴛɪɴᴅᴀᴋᴀɴ    : ${isBotAdmin ? 'Pesan telah dihapus otomatis.' : 'Pesan terdeteksi (bot butuh admin).'}
*╰───────────────*
> _Jaga kesopanan dan ketertiban saat berinteraksi di grup ini!_`.trim()

    await conn.sendMessage(m.chat, {
      text: warnText,
      mentions: [m.sender]
    }).catch(() => null)
  } else {
    if (isWhitelisted) {
      chat.toxicWarn[m.sender] = ANTI_TOXIC_MAX_WARNS
      const protectedText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ    : @${userNumber}
*┆* ✧ ᴘᴇʟᴀɴɢɢᴀʀᴀɴ : Warnings sudah mencapai batas
*┆* ✦ ᴘᴇʀɪɴɢᴀᴛᴀɴ  : *[ ${ANTI_TOXIC_MAX_WARNS} / ${ANTI_TOXIC_MAX_WARNS} ]*
*┆* ◈ ᴛɪɴᴅᴀᴄᴋᴀɴ    : *Whitelist diproteksi, tidak auto-kick*
*╰───────────────*
> _User masuk whitelist, jadi tidak otomatis dikeluarkan._`.trim()

      await conn.sendMessage(m.chat, {
        text: protectedText,
        mentions: [m.sender]
      }).catch(() => null)
      return true
    }

    chat.toxicWarn[m.sender] = 0
    chat.toxicKickHistory = Array.isArray(chat.toxicKickHistory) ? chat.toxicKickHistory : []
    chat.toxicKickHistory.push({
      user: m.sender,
      date: new Date().toISOString()
    })
    chat.toxicKickHistory = chat.toxicKickHistory.slice(-30)

    const kickText = `*╭  〔 ◈ ᴀ ɴ ᴛ ɪ  ᴛ ᴏ x ɪ ᴄ 〕*
*┆* ⟡ ᴘᴇɴɢɪʀɪᴍ    : @${userNumber}
*┆* ✧ ᴘᴇʟᴀɴɢɢᴀʀᴀɴ : Batas maksimum tercapai!
*┆* ✦ ᴘᴇʀɪɴɢᴀᴛᴀɴ  : *[ ${ANTI_TOXIC_MAX_WARNS} / ${ANTI_TOXIC_MAX_WARNS} ]*
*┆* ◈ ᴛɪɴᴅᴀᴋᴀɴ    : ${isBotAdmin ? 'Pelanggar dikeluarkan dari grup.' : 'Peringatan maksimal (jadikan bot admin untuk kick).'}
*╰───────────────*
> _Pelanggar telah mencapai batas toleransi tutur kata kasar._`.trim()

    await conn.sendMessage(m.chat, {
      text: kickText,
      mentions: [m.sender]
    }).catch(() => null)

    if (isBotAdmin) {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => null)
    }
  }

  return true
}

export default handler