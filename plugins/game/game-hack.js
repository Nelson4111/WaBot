const COOLDOWN_MS = 5 * 60 * 1000

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = items => items[Math.floor(Math.random() * items.length)]
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const passwordSymbols = '=&.+-!@#$%_'

function terminalHeader(title) {
    return `╭─❏「 💻 ${title.toUpperCase()} 」❏
╰─━━━━━━━━━━━━━━─`
}

function terminalSection(title, content) {
    return `─━━━━━━━━━━━━━━─

📂 ${title}

${content}`
}

function infoCard(title, lines) {
    return `${terminalHeader(title)}

${lines}

─━━━━━━━━━━━━━━─

⚠️ CATATAN
> ↳ Semua nama, data, dan alamat selain target adalah hasil acak.`
}

function ensureUserHack(user) {
    if (!user.hack || typeof user.hack !== 'object') {
        user.hack = { exp: 0, attempts: 0, successes: 0, cooldown: 0, current: null, history: [] }
    }
    if (!Array.isArray(user.hack.history)) user.hack.history = []
    return user.hack
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return [hours, minutes, secs].map(value => String(value).padStart(2, '0')).join(':')
}

function formatRemaining(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000))
    const minutes = Math.floor(seconds / 60)
    return minutes > 0 ? `${minutes}m ${seconds % 60}d` : `${seconds}d`
}

function randomString(length, source = alphanumeric) {
    let result = ''
    for (let index = 0; index < length; index++) result += source[randomInt(0, source.length - 1)]
    return result
}

function randomPassword() {
    const core = randomString(9, alphanumeric)
    return `${randomString(2, letters)}${core}${randomInt(10, 99)}${pick(passwordSymbols)}`
}

function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''
}

function randomFullName(username) {
const names = [
    // Indonesia
    'Adiputra', 'Mahendra', 'Pratama', 'Wicaksana', 'Kusuma',
    'Wijaya', 'Ramadhan', 'Firmansyah', 'Nugraha', 'Permana',
    'Wibowo', 'Saputra', 'Hermawan', 'Kurniawan', 'Anggara',
    'Pradipta', 'Wiratama', 'Ardiansyah', 'Suryanata', 'Pangestu',
    'Abimanyu', 'Danendra', 'Wulandari', 'Puspitasari', 'Anggraini',

    // Jepang
    'Takahashi', 'Yamamoto', 'Nakamura', 'Kurosawa', 'Fujimoto',
    'Matsumoto', 'Kobayashi', 'Watanabe', 'Ishikawa', 'Sakamoto',
    'Shimizu', 'Tanaka', 'Mizushima', 'Hayashi', 'Kawasaki',
    'Tachibana', 'Hoshino', 'Kanzaki', 'Akizuki', 'Hanazawa',

    // Korea
    'Kim', 'Park', 'Choi', 'Jung', 'Kang',
    'Yoon', 'Han', 'Seo', 'Kwon', 'Shin',
    'Baek', 'Moon', 'Hwang', 'Jang', 'Ryu',

    // Barat dan Eropa
    'Alexander', 'Anderson', 'Bennett', 'Montgomery', 'Harrington',
    'Kingsley', 'Cunningham', 'Everhart', 'Sinclair', 'Whitmore',
    'Sterling', 'Henderson', 'Callahan', 'Fitzgerald', 'Wellington',
    'Blackwood', 'Kensington', 'Beaumont', 'Cavendish', 'Ashford',
    'Valentine', 'Laurent', 'Moreau', 'Castillo', 'Romano',
    'Bianchi', 'Ricci', 'Petrov', 'Volkov', 'Ivanov',
    'Schneider', 'Weber', 'Mueller', 'Dubois', 'Thompson',
    'Harrison', 'Donovan', 'Prescott', 'Westwood', 'Griffith',

    // Naruto - Clan & Family
    'Uchiha', 'Uzumaki', 'Hyuga', 'Senju', 'Namikaze',
    'Hatake', 'Nara', 'Yamanaka', 'Akimichi', 'Aburame',
    'Inuzuka', 'Sarutobi', 'Shimura', 'Kaguya', 'Otsutsuki',

    // Attack on Titan
    'Ackerman', 'Yeager', 'Reiss', 'Braun', 'Leonhart',
    'Arlert', 'Kirschtein', 'Springer', 'Finger', 'Tybur',

    // Spy x Family
    'Forger', 'Desmond', 'Briar', 'Blackbell', 'Sherwood',

    // Bleach
    'Kurosaki', 'Kuchiki', 'Ishida', 'Shihouin', 'Hitsugaya',

    // Fullmetal Alchemist
    'Elric', 'Rockbell', 'Mustang', 'Armstrong',

    // JoJo's Bizarre Adventure
    'Joestar', 'Brando', 'Zeppeli', 'Higashikata', 'Kujo',

    // Demon Slayer
    'Kamado', 'Agatsuma', 'Hashibira', 'Tomioka', 'Rengoku',

    // Jujutsu Kaisen
    'Kugisaki', 'Zenin', 'Fushiguro', 'Itadori',

    // One Piece
    'Monkey', 'Roronoa', 'Vinsmoke', 'Donquixote', 'Charlotte',

    // Death Note
    'Yagami', 'Amane', 'Mikami', 'Near', 'Mello',

    // Black Butler
    'Phantomhive', 'Trancy', 'Midford', 'Michaelis', 'Sullivan',

    // Campuran nama tambahan
    'Aurelius', 'Aveline', 'Nathaniel', 'Evangeline', 'Celestine',
    'Alessandra', 'Sebastian', 'Theodore', 'Maximilian', 'Isabelle',
    'Rosalie', 'Arabella', 'Dominique', 'Frederick', 'Leonardo',
    'Gabrielle', 'Seraphina', 'Juliette', 'Beatrice', 'Christopher',
    'Vincent', 'Emerson', 'Oliver', 'Kenshiro', 'Himawari',
    'Renji', 'Tsubasa', 'Hikaru', 'Yoshida', 'Kisaragi',
    'Amamiya', 'Tsukishima', 'Kagami', 'Shinonome', 'Hoshikawa',
    'Kazehaya', 'Miyazaki', 'Akiyama', 'Kurokawa', 'Shiratori',

    // Indonesia
    'Atmadja', 'Wirawan', 'Suhendra', 'Kusnandar', 'Sastrowardoyo',
    'Hardiansyah', 'Daniswara', 'Prawira', 'Baskara', 'Adinata',

    // Jepang
    'Shiba', 'Inoue', 'Shiranui', 'Kanzawa', 'Mori',
    'Onizuka', 'Kuroda', 'Fujikawa', 'Arisawa', 'Kamikawa',

    // Korea
    'Nam', 'Song', 'Lim', 'Bae', 'Oh',

    // Barat dan Eropa
    'Blackwell', 'Hawthorne', 'Lockwood', 'Ashbourne', 'Whitaker',
    'Rutherford', 'Waverly', 'Holloway', 'Kingsford', 'Lancaster',

    // Anime - Clan & Family
    'Kamado', 'Shinazugawa', 'Tokito', 'Kanroji', 'Iguro',
    'Himejima', 'Uzui', 'Kuroko', 'Kiryuu', 'Inumaki',
    'Nanami', 'Okkotsu', 'Geto', 'Yorozuya', 'Katsura', 'Morningstar'
]
    const base = capitalize(username.replace(/[^a-zA-Z]/g, '') || 'Player')
    const first = pick(names)
    let second = pick(names)
    while (second === first) second = pick(names)
    const patterns = [
        `${base} ${first} ${second}`,
        `${first} ${base} ${second}`,
        `${first} ${second} ${base}`
    ]
    return pick(patterns)
}

function randomEmail() {
    const localPart = randomString(randomInt(5, 10), letters).toLowerCase()
    const domain = pick(['gmail.fake', 'yahoo.fake', 'outlook.fake', 'icloud.fake', 'proton.fake'])
    return `${localPart}${randomInt(10, 999)}@${domain}`
}

function randomIp() {
    return Array.from({ length: 4 }, () => randomInt(1, 254)).join('.')
}

function formatMoneyWithSuffix(value) {
    const amount = Math.max(0, Number(value) || 0)
    if (amount >= 1e12) return `${(amount / 1e12).toFixed(amount % 1e12 ? 2 : 0)}T`
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(amount % 1e9 ? 2 : 0)}B`
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(amount % 1e6 ? 2 : 0)}M`
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(amount % 1e3 ? 1 : 0)}K`
    return String(amount)
}

function randomAddress() {
const locations = [
    ['Indonesia', 'Jakarta', 'Jl. Sakura'],
    ['Indonesia', 'Bandung', 'Jl. Melati'],
    ['Indonesia', 'Surabaya', 'Jl. Anggrek'],
    ['Indonesia', 'Yogyakarta', 'Jl. Malioboro'],
    ['Indonesia', 'Semarang', 'Jl. Pandanaran'],
    ['Indonesia', 'Bali', 'Jl. Sunset Road'],
    ['Indonesia', 'Medan', 'Jl. Merdeka'],
    ['Indonesia', 'Makassar', 'Jl. Pettarani'],
    ['Indonesia', 'Malang', 'Jl. Ijen'],
    ['Indonesia', 'Palembang', 'Jl. Sudirman'],
    ['Indonesia', 'Denpasar', 'Jl. Gatot Subroto'],
    ['Indonesia', 'Bogor', 'Jl. Pajajaran'],
    ['Indonesia', 'Solo', 'Jl. Slamet Riyadi'],
    ['Indonesia', 'Balikpapan', 'Jl. Jenderal Sudirman'],
    ['Indonesia', 'Manado', 'Jl. Sam Ratulangi'],

    ['Japan', 'Tokyo', 'Sakura Street'],
    ['Japan', 'Osaka', 'Dotonbori Avenue'],
    ['Japan', 'Kyoto', 'Higashiyama Road'],
    ['Japan', 'Yokohama', 'Minato Mirai Street'],
    ['Japan', 'Sapporo', 'Odori Avenue'],
    ['Japan', 'Nagoya', 'Meijo Street'],
    ['Japan', 'Nara', 'Deer Park Road'],
    ['Japan', 'Hiroshima', 'Peace Boulevard'],
    ['Japan', 'Fukuoka', 'Tenjin Street'],
    ['Japan', 'Kobe', 'Harborland Avenue'],

    ['South Korea', 'Seoul', 'Han River Road'],
    ['South Korea', 'Busan', 'Haeundae Beach Road'],
    ['South Korea', 'Incheon', 'Central Park Avenue'],
    ['South Korea', 'Daegu', 'Dongseong Street'],
    ['South Korea', 'Jeju', 'Palm Tree Road'],
    ['South Korea', 'Daejeon', 'Expo Street'],
    ['South Korea', 'Gwangju', 'Mugunghwa Road'],

    ['United States', 'New York', 'Maple Avenue'],
    ['United States', 'Los Angeles', 'Sunset Boulevard'],
    ['United States', 'Chicago', 'Michigan Avenue'],
    ['United States', 'San Francisco', 'Golden Gate Street'],
    ['United States', 'Las Vegas', 'Paradise Road'],
    ['United States', 'Miami', 'Ocean Drive'],
    ['United States', 'Seattle', 'Pine Street'],
    ['United States', 'Boston', 'Beacon Street'],
    ['United States', 'Washington DC', 'Pennsylvania Avenue'],
    ['United States', 'San Diego', 'Harbor Drive'],
    ['United States', 'Houston', 'Westheimer Road'],
    ['United States', 'Honolulu', 'Kalakaua Avenue'],

    ['United Kingdom', 'London', 'Rose Street'],
    ['United Kingdom', 'Manchester', 'Oxford Road'],
    ['United Kingdom', 'Liverpool', 'Hope Street'],
    ['United Kingdom', 'Birmingham', 'Broad Street'],
    ['United Kingdom', 'Edinburgh', 'Royal Mile'],
    ['United Kingdom', 'Glasgow', 'Buchanan Street'],
    ['United Kingdom', 'Oxford', 'High Street'],
    ['United Kingdom', 'Cambridge', 'King Street'],

    ['France', 'Paris', 'Champs Elysees'],
    ['France', 'Marseille', 'La Canebiere'],
    ['France', 'Lyon', 'Rue de la Republique'],
    ['France', 'Nice', 'Promenade des Anglais'],
    ['France', 'Bordeaux', 'Rue Sainte Catherine'],
    ['France', 'Toulouse', 'Rue Saint Rome'],

    ['Germany', 'Berlin', 'Unter den Linden'],
    ['Germany', 'Munich', 'Maximilianstrasse'],
    ['Germany', 'Hamburg', 'Reeperbahn'],
    ['Germany', 'Frankfurt', 'Zeil Street'],
    ['Germany', 'Cologne', 'Schildergasse'],
    ['Germany', 'Dresden', 'Prager Strasse'],

    ['Italy', 'Rome', 'Via del Corso'],
    ['Italy', 'Milan', 'Via Montenapoleone'],
    ['Italy', 'Venice', 'Calle Larga'],
    ['Italy', 'Florence', 'Via Roma'],
    ['Italy', 'Naples', 'Via Toledo'],
    ['Italy', 'Turin', 'Via Garibaldi'],

    ['Spain', 'Madrid', 'Gran Via'],
    ['Spain', 'Barcelona', 'La Rambla'],
    ['Spain', 'Seville', 'Calle Sierpes'],
    ['Spain', 'Valencia', 'Calle Colon'],
    ['Spain', 'Malaga', 'Calle Larios'],

    ['Australia', 'Sydney', 'George Street'],
    ['Australia', 'Melbourne', 'Collins Street'],
    ['Australia', 'Brisbane', 'Queen Street'],
    ['Australia', 'Perth', 'Hay Street'],
    ['Australia', 'Adelaide', 'Rundle Street'],
    ['Australia', 'Gold Coast', 'Cavill Avenue'],

    ['Canada', 'Toronto', 'Yonge Street'],
    ['Canada', 'Vancouver', 'Robson Street'],
    ['Canada', 'Montreal', 'Saint Catherine Street'],
    ['Canada', 'Ottawa', 'Elgin Street'],
    ['Canada', 'Calgary', 'Stephen Avenue'],

    ['Thailand', 'Bangkok', 'Sukhumvit Road'],
    ['Thailand', 'Phuket', 'Patong Beach Road'],
    ['Thailand', 'Chiang Mai', 'Nimmanhaemin Road'],
    ['Thailand', 'Pattaya', 'Beach Road'],

    ['Singapore', 'Singapore', 'Orchard Road'],
    ['Malaysia', 'Kuala Lumpur', 'Jalan Bukit Bintang'],
    ['Malaysia', 'Penang', 'Lebuh Chulia'],
    ['Vietnam', 'Hanoi', 'Hang Gai Street'],
    ['Vietnam', 'Ho Chi Minh City', 'Nguyen Hue Boulevard'],
    ['China', 'Shanghai', 'Nanjing Road'],
    ['China', 'Beijing', 'Wangfujing Street'],
    ['China', 'Guangzhou', 'Beijing Road'],
    ['India', 'Mumbai', 'Marine Drive'],
    ['India', 'New Delhi', 'Connaught Place'],
    ['Brazil', 'Rio de Janeiro', 'Copacabana Avenue'],
    ['Brazil', 'Sao Paulo', 'Paulista Avenue'],
    ['United Arab Emirates', 'Dubai', 'Sheikh Zayed Road'],
    ['Turkey', 'Istanbul', 'Istiklal Avenue']
]
    const [country, city, street] = pick(locations)
    const address = `${street} No. ${randomInt(1, 248)}, RT ${randomInt(1, 15)}/RW ${randomInt(1, 12)}`
    return `${address}\n🏙️ City       : ${city}\n🗺️ Country    : ${country}\n✉️ Postal Code: ${randomInt(10000, 99999)}`
}

function randomBirthday() {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const month = randomInt(0, months.length - 1)
    const daysInMonth = new Date(2000, month + 1, 0).getDate()
    return `${randomInt(1, daysInMonth)} ${months[month]} ${randomInt(1988, 2005)}`
}

async function syntheticTarget(m, mentionedJid, conn) {
    const raw = mentionedJid?.[0] || m.quoted?.sender
    if (!raw) return null
    const number = raw.split('@')[0].replace(/\D/g, '')
    const users = global.db?.data?.users || {}
    const storedName = users[raw]?.name || users[number]?.name
    let resolvedName = storedName
    try {
        resolvedName = resolvedName || await conn.getName(raw)
    } catch {}
    const username = String(resolvedName || m.pushName || number || 'player')
        .replace(/[^a-zA-Z0-9_.-]/g, '')
        .replace(/^[/_.*]+/, '') || number
    return { jid: raw, number, username, profile: users[raw] || users[number] || null }
}

function randomSimulation(target) {
    const outcomes = [
        ['Successful Hack', 42],
        ['Partial Access', 18],
        ['Firewall Blocked', 12],
        ['Trace Detected', 10],
        ['System Crashed', 9],
        ['Counter Hack', 9]
    ]
    let roll = randomInt(1, 100)
    let outcome = outcomes[outcomes.length - 1][0]
    for (const [name, chance] of outcomes) {
        if (roll <= chance) {
            outcome = name
            break
        }
        roll -= chance
    }

    const base = target ? target.username : randomString(randomInt(4, 8), letters)
    const email = randomEmail()
    const phone = target?.number
        ? `+${target.number.slice(0, 2)} ${target.number.slice(2, 6)}-${target.number.slice(6, 10)}-${target.number.slice(10)}`
        : `+62 8${randomInt(10, 99)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`
    const ip = randomIp()
    return {
        outcome,
        target: base,
        email,
        password: randomPassword(),
        phone,
        ip,
        fullName: randomFullName(base),
        birthday: randomBirthday(),
        balance: target?.profile?.rpg?.bank ?? randomInt(100000, 245000000000),
        bank: pick(['Avelia Bank', 'Nexus Bank', 'Zenith Bank', 'Moon Bank', 'Sakura Bank']),
        duration: randomInt(38, 167)
    }
}

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    const user = global.db?.data?.users?.[m.sender]
    if (!user) return m.reply(infoCard('SYSTEM ERROR', '> ↳ Data pemain belum tersedia.'))

    const hack = ensureUserHack(user)
    const action = String(args?.[0] || text || '').trim().toLowerCase()

    if (action === 'status') {
        if (!hack.current) {
            return m.reply(infoCard('HACK STATUS', `⚙️ Status     : Idle\n✨ EXP        : ${hack.exp || 0}\n🎯 Percobaan  : ${hack.attempts || 0}\n🔓 Berhasil   : ${hack.successes || 0}`))
        }
        const active = hack.current
        return m.reply(infoCard('HACK STATUS', `⚙️ Status     : ${active.state || 'Processing'}\n🎯 Target     : @${active.target}\n⌬ Tahap      : ${active.step || 1} / 5`))
    }

    if (action === 'history') {
        if (!hack.history.length) {
            return m.reply(infoCard('HACK HISTORY', '> ↳ Belum ada riwayat aktivitas hacking.'))
        }
        const lines = hack.history.slice(0, 8).map((item, index) =>
            `${String(index + 1).padStart(2, '0')} ${item.outcome} — @${item.target} · +${item.exp} EXP`
        )
        return m.reply(infoCard('HACK HISTORY', lines.join('\n')))
    }

    if (!action) {
        return m.reply(`${terminalHeader('HACK COMMAND')}

🎯 Target wajib dipilih melalui tag atau reply pesan.

${terminalSection('COMMAND LIST', `> ${usedPrefix}${command} @user
> Reply pesan user, lalu ketik ${usedPrefix}${command}
> ${usedPrefix}${command} status
> ${usedPrefix}${command} history`)}`)
    }

    const now = Date.now()
    if (hack.cooldown && now < hack.cooldown) {
        return m.reply(infoCard('COOLDOWN ACTIVE', `⏱️ Sisa waktu : ${formatRemaining(hack.cooldown - now)}`))
    }
    if (hack.current?.state === 'Running') {
        return m.reply(infoCard('PROCESS ACTIVE', '> ↳ Proses sebelumnya masih berjalan.\n> ↳ Gunakan .hack status untuk melihat progress.'))
    }

    const target = await syntheticTarget(m, m.mentionedJid, conn)
    if (!target) {
        return m.reply(infoCard('TARGET REQUIRED', `> ↳ Gunakan tag atau reply pesan user.\n> ↳ Contoh: ${usedPrefix}${command} @user`))
    }
    const targetName = target.username
    hack.current = { state: 'Running', target: targetName, step: 1, startedAt: now }
    hack.cooldown = now + COOLDOWN_MS

    const initial = `${terminalHeader('HACKING TERMINAL')}

> INITIALIZING CONNECTION...

${terminalSection('PROCESS STATUS', [
    '[01] Scanning target network...',
    '[02] Searching security vulnerabilities...',
    '[03] Bypassing firewall...',
    '[04] Decrypting credentials...',
    '[05] Accessing database...'
].join('\n'))}`
    await m.reply(initial)
    await sleep(900)

    const stages = [
        '[01] Target network mapped... OK',
        '[02] Vulnerability vector found... OK',
        '[03] Firewall bypass route secured... OK',
        '[04] Credentials decryption started...',
        '[05] Database handshake established...'
    ]
    for (let index = 0; index < stages.length; index++) {
        hack.current.step = index + 1
        await m.reply(`${terminalHeader('PROCESS STATUS')}

${terminalSection('HACKING PROGRESS', `> [${String(index + 1).padStart(2, '0')}] ${stages[index].replace(/^\[\d+\]\s*/, '')}`)}`)
        await sleep(index === 3 ? 1100 : 650)
    }

    const data = randomSimulation(target)
    let resultTitle = 'ᴀᴄᴄᴇꜱꜱ ɢʀᴀɴᴛᴇᴅ'
    const addressLines = randomAddress()
    let resultLines = `👤 Username    : ${targetName}\n🪪 Full Name   : ${data.fullName}\n🎂 Birthday    : ${data.birthday}\n📧 Email       : ${data.email}\n🔑 Password    : ${data.password}\n📱 Phone       : ${data.phone}\n🌐 IP Address  : ${data.ip}\n💳 Bank        : ${data.bank}\n🔢 PIN Bank    : ${String(randomInt(0, 9999)).padStart(4, '0')}\n💰 Balance     : Rp ${formatMoneyWithSuffix(data.balance)}\n🏠 Address     : ${addressLines}`

    if (data.outcome === 'Partial Access') {
        resultLines = `👤 Username    : ${targetName}\n🪪 Full Name   : ${data.fullName}\n🎂 Birthday    : ${data.birthday}\n📧 Email       : ${data.email}\n🔑 Password    : ${data.password}\n📱 Phone       : ${data.phone}\n🌐 IP Address  : ${data.ip}`
    } else if (data.outcome !== 'Successful Hack') {
        resultTitle = data.outcome.toUpperCase()
        const failureReasons = {
            'Partial Access': 'Akses hanya berhasil pada sebagian data target.',
            'Firewall Blocked': 'Firewall target aktif dan semua koneksi diblokir.',
            'Trace Detected': 'Jejak hacker terdeteksi sehingga proses dihentikan.',
            'System Crashed': 'Server target mengalami crash saat sesi infiltration.',
            'Counter Hack': 'Target membalas dengan serangan balik dan memutus sesi.'
        }
        resultLines = `> ${failureReasons[data.outcome] || 'Proses tidak berhasil mencapai data target.'}`
    }

    const exp = data.outcome === 'Successful Hack' ? 150 : data.outcome === 'Partial Access' ? 90 : 35
    user.exp = (user.exp || 0) + exp
    hack.exp = (hack.exp || 0) + exp
    hack.attempts = (hack.attempts || 0) + 1
    if (data.outcome === 'Successful Hack' || data.outcome === 'Partial Access') {
        hack.successes = (hack.successes || 0) + 1
    }

    hack.history.unshift({
        outcome: data.outcome,
        target: data.target,
        exp,
        at: Date.now()
    })
    hack.history = hack.history.slice(0, 10)
    hack.current = { state: 'Completed', target: data.target, step: 5, outcome: data.outcome }

    const mentions = target?.jid ? [target.jid] : []
    const result = `╭─❏「 💻 HACKING RESULT 」❏
╰─━━━━━━━━━━━━━━─

🎯 Target : @${targetName}
🔓 Status : ${data.outcome === 'Successful Hack' ? 'Access Granted' : data.outcome}
⏱️ Durasi : ${formatDuration(data.duration)}

─━━━━━━━━━━━━━━─

📂 EXTRACTED DATA

${resultLines}

─━━━━━━━━━━━━━━─

⚠️ CATATAN
> ↳ Data selain target, nomor, dan username dibuat acak.
> ↳ Tidak ada akun atau informasi asli yang diakses.
> ↳ Gunakan ${usedPrefix + command} history untuk melihat riwayat.`

    await conn.sendMessage(m.chat, { text: result, mentions }, { quoted: m })
}

handler.help = ['hack [@user|status|history]']
handler.tags = ['game']
handler.command = /^hack$/i
handler.register = true
handler.limit = false

export default handler
