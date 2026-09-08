import fs from 'fs'
import path from 'path'
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    // Callback penanganan tombol tes akinator
    if (/^akians$/i.test(command)) {
        const parts = (text || '').split('|')
        const jawaban = parts[0] || 'Pilihan'
        const targetNumber = parts[1] || ''
        const senderNumber = (m.sender || '').split('@')[0]

        // 1. Role Guard: Cegah penonton iseng mengklik tombol pemain
        if (targetNumber && targetNumber !== senderNumber) {
            return await m.reply(`🚫 *AKSES DITOLAK!*\nTombol ini khusus untuk @${targetNumber}.\nKamu (@${senderNumber}) tidak memiliki izin menjawab permainan ini!`, null, { mentions: [targetNumber + '@s.whatsapp.net', m.sender] })
        }

        // 2. Hack In-Place Edit (Chameleon ala Bot Yuki):
        // Begitu pemain sah menjawab, pesan tombol di grup langsung di-edit menjadi pesan gembok penonton!
        // Sehingga tombol hilang dari chat dan tidak bisa diklik lagi oleh siapapun.
        if (m.quoted && m.quoted.fromMe) {
            try {
                const targetKey = m.quoted.vM?.key || m.quoted.key || {
                    remoteJid: m.chat,
                    fromMe: true,
                    id: m.quoted.id,
                    participant: conn.user?.jid || conn.user?.id
                }
                const lockText = `❓ *Pertanyaan 1:*\nApakah dia Tinggal di Indonesia?\n\n📊 Progress: 20%\n\n> 🔒 ᴛᴏᴍʙᴏʟ ᴊᴀᴡᴀʙᴀɴ ʜᴀɴʏᴀ ᴍᴜɴᴄᴜʟ ᴜɴᴛᴜᴋ ᴘᴇᴍᴀɪɴ\n> ✅ *Jawaban @${targetNumber}:* ${jawaban.toUpperCase()}`
                await conn.sendMessage(m.chat, {
                    text: lockText,
                    mentions: [targetNumber + '@s.whatsapp.net'],
                    edit: targetKey
                })
            } catch (err) {
                console.warn('[CHAMELEON EDIT FAILED]:', err?.message)
            }
        }

        return await m.reply(`✅ *JAWABAN DITERIMA!*\nJawaban kamu: *${jawaban.toUpperCase()}*\n(Validasi peran berhasil: hanya @${targetNumber} yang diizinkan)`, null, { mentions: [targetNumber + '@s.whatsapp.net'] })
    }

    const type = (args[0] || '').toLowerCase()

    // 1. Tipe 1: Quick Reply Stack (Ala Akinator / Vertikal Panah Hijau)
    if (type === '1' || type === 'quick') {
        const text = `🎮 *TIPE 1: QUICK REPLY STACK (ALA AKINATOR)*\n
Format tombol vertikal dengan panah hijau \`↩\`. 
Langsung muncul di bawah gelembung chat tanpa perlu tap popup.

Biasa digunakan untuk:
• Game Akinator / Kuis
• Pilihan Ya / Tidak / Ragu
• Menu aksi cepat`
        const footer = 'Avelia • Button Lab Type 1'
        const buttons = [
            ['✅ Pilihan 1 (Ya)', `${usedPrefix}ping`],
            ['❌ Pilihan 2 (Tidak)', `${usedPrefix}owner`],
            ['🤷 Pilihan 3 (Tidak Tahu)', `${usedPrefix}menu`],
            ['🟡 Pilihan 4 (Mungkin)', `${usedPrefix}tesbutton 2`],
            ['🔙 Kembali ke Lab', `${usedPrefix}tesbutton`]
        ]
        return await conn.sendButton(m.chat, text, footer, null, buttons, m)
    }

    // 2. Tipe 2: Multi-Action Mixed Buttons (URL, Copy, Call, Reply)
    if (type === '2' || type === 'mixed') {
        const text = `🛠️ *TIPE 2: MULTI-ACTION (MIXED BUTTONS)*\n
Kombinasi 4 jenis tombol berbeda sekaligus dalam satu pesan:
1. Tombol Balas Pesan (Quick Reply)
2. Tombol Buka Tautan (URL Link)
3. Tombol Salin Kode Voucher (One-Tap Copy)
4. Tombol Panggilan Suara (Call Phone)`
        const footer = 'Avelia • Button Lab Type 2'
        const buttons = [
            ['⚡ Balas Chat Cepat', `${usedPrefix}ping`],
            ['🌐 Buka Web Google', 'https://www.google.com', 'url'],
            ['📋 Salin Kode Promo', 'AVELIA-SUPER-2026', 'copy'],
            ['📞 Panggilan Admin', '+6281241100804', 'call']
        ]
        return await conn.sendButton(m.chat, text, footer, null, buttons, m)
    }

    // 3. Tipe 3: Header Image Banner + Native Buttons
    if (type === '3' || type === 'image') {
        const text = `🖼️ *TIPE 3: BANNER GAMBAR + TOMBOL INTERAKTIF*\n
Pesan dilengkapi dengan lampiran banner gambar penuh di bagian atas, diikuti oleh teks informasi dan bilah tombol di bawahnya.`
        const footer = 'Avelia • Button Lab Type 3'
        const bannerUrl = 'https://raw.githubusercontent.com/Nelson4111/WaBot/main/media/avelia-banner.jpg'
        // Fallback sample image jika banner lokal tidak ada
        const sampleImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'

        const buttons = [
            ['👍 Suka & Keren', `${usedPrefix}ping`],
            ['🌐 Kunjungi Website', 'https://github.com', 'url'],
            ['📋 Salin ID Banner', 'IMG-BANNER-001', 'copy']
        ]

        return await conn.sendButton(m.chat, text, footer, sampleImage, buttons, m)
    }

    // 4. Tipe 4: Dropdown List Menu (Single-Select Bottom Sheet)
    if (type === '4' || type === 'list') {
        const title = '📋 TIPE 4: DROPDOWN LIST MENU'
        const text = `Tipe menu pop-up (bottom sheet) yang bisa menampung banyak pilihan terstruktur dengan Section, Header, dan Deskripsi.`
        const footer = 'Avelia • Button Lab Type 4'
        const sections = [
            {
                title: 'Kategori Arcade & Game',
                rows: [
                    { title: '🎮 Star Arena', description: 'Game ruang angkasa di chat', id: `${usedPrefix}mabar` },
                    { title: '♟️ Catur Klasik', description: 'Main catur melawan teman', id: `${usedPrefix}catur` },
                    { title: '🧩 Tebak Gambar', description: 'Kuis asah otak visual', id: `${usedPrefix}tebakgambar` }
                ]
            },
            {
                title: 'Kategori Utilitas & Tools',
                rows: [
                    { title: '⚡ Cek Ping & Respon', description: 'Kecepatan server bot saat ini', id: `${usedPrefix}ping` },
                    { title: '📜 Daftar Menu Lengkap', description: 'Semua 500+ perintah bot', id: `${usedPrefix}allmenu` },
                    { title: '👑 Kontak Owner', description: 'Hubungi pengembang bot', id: `${usedPrefix}owner` }
                ]
            }
        ]

        return await conn.sendList(
            m.chat,
            title,
            text,
            footer,
            '📂 Buka Pilihan Menu',
            sections,
            m
        )
    }

    // 5. Tipe 5: Mega Combo (Single Select + URL + Copy Button)
    if (type === '5' || type === 'combo') {
        try {
            const btn = new conn.Button(conn)
            btn.setTitle('🚀 TIPE 5: MEGA COMBO')
            btn.setBody('Ini adalah kombinasi tingkat lanjut:\nAda tombol Dropdown List Menu sekaligus tombol Link dan Salin Teks di baris yang sama!')
            btn.setFooter('Avelia • Button Lab Type 5')

            // 1. Dropdown
            btn.addSelection('📑 Klik Untuk Buka Opsi')
            btn.makeSection('Pilihan Cepat', '🔥')
            btn.makeRow('⚡', 'Ping Status', 'Cek kecepatan bot', `${usedPrefix}ping`)
            btn.makeRow('📜', 'All Menu', 'Lihat daftar fitur', `${usedPrefix}allmenu`)

            // 2. Action Buttons
            btn.addUrl('🌐 Website Bot', 'https://google.com')
            btn.addCopy('📋 Salin Token', 'TOKEN-MEGA-COMBO-999')

            if (m) {
                btn.setContextInfo({
                    stanzaId: m.key?.id,
                    participant: m.sender,
                    quotedMessage: m.message
                })
            }

            return await btn.send(m.chat)
        } catch (err) {
            console.error('[BUTTON COMBO ERROR]:', err)
            return m.reply(`❌ Gagal membuat combo button: ${err.message}`)
        }
    }

    // 6. Tipe 6: Classic ViewOnce Button (ButtonV2 ala Bot Yuki & Variasi Kombinasi)
    if (type === '6' || type === 'v2') {
        const subMode = (args[1] || '').toLowerCase()
        const senderNumber = (m.sender || '').split('@')[0]

        // Helper angka kecil Unicode (𝟶, 𝟷, 𝟸...)
        const toSmallNum = (str) => {
            const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
            return String(str).replace(/[0-9]/g, d => map[d] || d)
        }

        // Helper format waktu & tanggal ala Bot Yuki
        const formatUptime = (sec) => {
            const h = Math.floor(sec / 3600).toString().padStart(2, '0')
            const mi = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
            const s = Math.floor(sec % 60).toString().padStart(2, '0')
            return `${h}:${mi}:${s}`
        }

        const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
        const tanggalStr = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`

        const hour = d.getHours()
        let greeting = 'ꜱᴇʟᴀᴍᴀᴛ ᴍᴀʟᴀᴍ'
        if (hour >= 4 && hour < 11) greeting = 'ꜱᴇʟᴀᴍᴀᴛ ᴘᴀɢɪ'
        else if (hour >= 11 && hour < 15) greeting = 'ꜱᴇʟᴀᴍᴀᴛ ꜱɪᴀɴɢ'
        else if (hour >= 15 && hour < 18) greeting = 'ꜱᴇʟᴀᴍᴀᴛ ꜱᴏʀᴇ'

        const user = global.db?.data?.users?.[m.sender] || {}
        const userName = m.pushName || 'ɴᴇɴᴇʟ'

        const yukiText = `*──  ୨୧ 🩶 ʜᴏꜱʜɪɴᴏ-ᴅᴇꜱᴜ 🩶 ୨୧  ──*

   *こんにちわ!* (ʜᴇʟʟᴏ!)
   ${greeting} *${userName}* ♡
   ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴍʏ ᴡᴏʀʟᴅ ✨

*╭  〔 👤 ᴜ ꜱ ᴇ ʀ 〕*
*┆* ɴᴀᴍᴀ    : *${userName}*
*┆* ʟᴇᴠᴇʟ   : *${toSmallNum(user.level || 1)} (ʀᴏᴏᴋɪᴇ)*
*┆* ʀᴏʟᴇ    : *${user.role || 'ɴᴇᴡʙɪᴇ'} ㋡*
*┆* ʟɪᴍɪᴛ   : *${toSmallNum(user.limit ?? 19)}*
*┆* ᴇxᴘ     : *${toSmallNum(user.exp || 6342)} / ${toSmallNum(188)}*
*┆* xᴘ𝟺ʟᴠ   : *ꜱɪᴀᴘ ᴜɴᴛᴜᴋ ${usedPrefix}levelup*
*╰───────────────*

*╭  〔 ⚙️ ꜱ ʏ ꜱ ᴛ ᴇ ᴍ 〕*
*┆* ᴜᴘᴛɪᴍᴇ      : *${toSmallNum(formatUptime(process.uptime()))}*
*┆* ᴛᴀɴɢɢᴀʟ     : *${toSmallNum(tanggalStr)}*
*┆* ᴅᴀᴛᴀʙᴀꜱᴇ    : *${toSmallNum(Object.keys(global.db?.data?.users || {}).length || 100)} / ${toSmallNum(1166)}*
*┆* ᴛᴏᴛᴀʟ ꜰɪᴛᴜʀ : *${toSmallNum(Object.keys(global.plugins || {}).length || 751)}*
*╰───────────────*

*╭  〔  📌  ɴᴏᴛᴇ  〕*
*┆* Ⓟ = ᴘʀᴇᴍɪᴜᴍ   Ⓛ = ʟɪᴍɪᴛ
*╰───────────────*

   ｡˚ ⊹ *ᴛᴀᴘ ᴛᴏᴍʙᴏʟ ᴅɪ ʙᴀᴡᴀʜ* ⊹ ˚ ｡
✨ *ᴜɴᴛᴜᴋ ᴘɪʟɪʜ ᴋᴀᴛᴇɢᴏʀɪ ᴍᴇɴᴜ* ✨`

        // 6.1 DEFAULT: Mode Quick Reply ButtonV2 (Tampilan Menyatu Rapi & Indah ala Bot Yuki)
        // ✅ ADA GAMBAR / AVATAR / BANNER
        // ✅ HEADER KARTU: Title + Subtitle
        // ✅ TEKS SAMBUTAN LENGKAP
        // ✅ TOMBOL MENYATU RAPI DENGAN CHAT BUBBLE (Solid pill button, tanpa icon list :≡ atau panah ▾)
        // 6.1 DEFAULT: Menu List Interaktif 27 Kategori (BERSIH, TANPA CHAT REPLY, LANGSUNG BUKA POP-UP LIST!)
        // ✅ TANPA GAMBAR/MEDIA: Gelembung chat tidak terkotak/rusak, tombol menyatu rapi
        // ✅ HEADER KARTU: Title + Subtitle
        // ✅ TEKS SAMBUTAN LENGKAP
        // ✅ SAAT DITEKAN: User TIDAK mengirim chat apa pun, langsung membuka pop-up bottom sheet 27 Kategori!
        // 6.1 DEFAULT: Hybrid ButtonV2 ala Bot Yuki (Pill Button Rapi + Native Flow List)
        // ✅ HEADER LOKASI: Title + Subtitle + Thumbnail Rapi (Persis seperti Bot Yuki)
        // ✅ TEKS SAMBUTAN LENGKAP
        // ✅ TOMBOL: Pil solid hijau rapi 'ᴘɪʟɪʜ ᴍᴇɴᴜ' (Tanpa icon :≡ atau panah ▾)
        // 6.1 DEFAULT / LIST: Menu List Interaktif (Pill Button + Native Flow List)
        if (!subMode || subMode === 'main' || subMode === 'list' || subMode === '1') {
            let avatar = await conn.profilePictureUrl(m.sender, 'image').catch(() => null)
            if (!avatar) avatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'

            const categories = [
                { title: 'Semua Perintah', desc: 'Tampilkan seluruh menu bot', id: `${usedPrefix}allmenu` },
                { title: 'AI & ChatBot', desc: 'Fitur ChatGPT, Claude, AI Edit, dll', id: `${usedPrefix}menuai` },
                { title: 'Anime & Wibu', desc: 'Fitur Anime, Waifu, Gambar Anime', id: `${usedPrefix}menuanime` },
                { title: 'Manipulasi Audio', desc: 'Sound effect, convert audio, TTS', id: `${usedPrefix}menuaudio` },
                { title: 'Chainsaw Man RPG', desc: 'Game RPG Chainsaw Man', id: `${usedPrefix}menucsm` },
                { title: 'Pengunduh Media', desc: 'Download TikTok, IG, YT, dll', id: `${usedPrefix}menudownload` },
                { title: 'Fitur Hiburan', desc: 'Fitur seru-seruan & jokes', id: `${usedPrefix}menufun` },
                { title: 'Mini Games', desc: 'Game tebak-tebakan, catur, dll', id: `${usedPrefix}menugame` },
                { title: 'Manajemen Grup', desc: 'Admin tools & pengaturan grup', id: `${usedPrefix}menugroup` },
                { title: 'Informasi Bot', desc: 'Info status sistem & bot', id: `${usedPrefix}menuinfo` },
                { title: 'Pencarian Web', desc: 'Google, Wikipedia, Cuaca, dll', id: `${usedPrefix}menuinternet` },
                { title: 'Pembuat Gambar', desc: 'Canvas maker, logo, quotes', id: `${usedPrefix}menumaker` },
                { title: 'Catatan Keuangan', desc: 'Money track & scanner struk', id: `${usedPrefix}menumoneytrack` },
                { title: 'Khusus Owner', desc: 'Perintah kendali owner', id: `${usedPrefix}menuowner` },
                { title: 'Fitur Hubungan', desc: 'Pernikahan, pasangan, dll', id: `${usedPrefix}menupasangan` },
                { title: 'Roleplay Game', desc: 'Game RPG petualangan klasik', id: `${usedPrefix}menurpg` },
                { title: 'Pencarian Data', desc: 'Search data & scraper', id: `${usedPrefix}menusearch` },
                { title: 'Stalker Sosmed', desc: 'Stalk akun Instagram, TikTok, dll', id: `${usedPrefix}menustalker` },
                { title: 'Pembuat Stiker', desc: 'Buat stiker foto, teks, video', id: `${usedPrefix}menusticker` },
                { title: 'Alat & Utilitas', desc: 'Tools pembantu sehari-hari', id: `${usedPrefix}menutools` }
            ]

            const btn = new conn.ButtonV2(conn)
            btn.setTitle('⛩️ ʜᴏꜱʜɪɴᴏ-ᴅᴇꜱᴜ')
            btn.setSubtitle('ᴋᴀɪ ᴅᴇꜱᴜ • ꜱʏꜱᴛᴇᴍ ᴍᴇɴᴜ')
            btn.setBody(yukiText)
            btn.setFooter('ʜᴏꜱʜɪɴᴏ-ᴅᴇꜱᴜ')
            if (avatar) btn.setThumbnail(avatar)

            btn.addRawButton({
                buttonId: 'menu_select',
                buttonText: { displayText: 'ᴘɪʟɪʜ ᴍᴇɴᴜ' },
                type: 1,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({
                        title: 'PILIH KATEGORI',
                        sections: [
                            {
                                title: '✦ DAFTAR KATEGORI MENU',
                                highlight_label: 'Populer',
                                rows: categories.map(cat => ({
                                    header: '',
                                    title: cat.title,
                                    description: cat.desc,
                                    id: cat.id
                                }))
                            }
                        ]
                    })
                }
            })

            if (m) {
                btn.setContextInfo({
                    stanzaId: m.key?.id,
                    participant: m.sender,
                    quotedMessage: m.message,
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterName: `「 ${global.namebot} 」`,
                        newsletterJid: global.ch
                    }
                })
            }

            return await btn.send(m.chat)
        }

        // 6.3 Mode GIF Looping Playback (Header Video Animasi Bergerak)
        if (subMode === 'gif' || subMode === 'video') {
            let videoMenu = 'https://c.termai.cc/v174/zFX'
            try {
                if (fs.existsSync('./media/menu.json')) {
                    const listMenu = JSON.parse(fs.readFileSync('./media/menu.json'))
                    if (Array.isArray(listMenu) && listMenu.length > 0) {
                        videoMenu = listMenu[Math.floor(Math.random() * listMenu.length)]
                    }
                }
            } catch (e) {
                videoMenu = 'https://c.termai.cc/v174/zFX'
            }

            const categories = [
                { title: 'Absen', desc: '8 command', id: `${usedPrefix}menu absen` },
                { title: 'Ai', desc: '12 command', id: `${usedPrefix}menu ai` },
                { title: 'Anime', desc: '72 command', id: `${usedPrefix}menu anime` },
                { title: 'Audio', desc: '5 command', id: `${usedPrefix}menu audio` },
                { title: 'Clan', desc: '26 command', id: `${usedPrefix}menu clan` },
                { title: 'Database', desc: '5 command', id: `${usedPrefix}menu database` },
                { title: 'Demo', desc: '14 command', id: `${usedPrefix}menu demo` },
                { title: 'Downloader', desc: '36 command', id: `${usedPrefix}menu downloader` },
                { title: 'Fun', desc: '35 command', id: `${usedPrefix}menu fun` },
                { title: 'Game', desc: '28 command', id: `${usedPrefix}menu game` },
                { title: 'Group', desc: '42 command', id: `${usedPrefix}menu group` },
                { title: 'Info', desc: '15 command', id: `${usedPrefix}menu info` },
                { title: 'Internet', desc: '30 command', id: `${usedPrefix}menu internet` },
                { title: 'Islamic', desc: '18 command', id: `${usedPrefix}menu islamic` },
                { title: 'Kerang', desc: '10 command', id: `${usedPrefix}menu kerang` },
                { title: 'Maker', desc: '24 command', id: `${usedPrefix}menu maker` },
                { title: 'Menfess', desc: '6 command', id: `${usedPrefix}menu menfess` },
                { title: 'Owner', desc: '45 command', id: `${usedPrefix}menu owner` },
                { title: 'Primbon', desc: '14 command', id: `${usedPrefix}menu primbon` },
                { title: 'Quotes', desc: '22 command', id: `${usedPrefix}menu quotes` },
                { title: 'Rpg', desc: '55 command', id: `${usedPrefix}menu rpg` },
                { title: 'Sticker', desc: '25 command', id: `${usedPrefix}menu sticker` },
                { title: 'Stalker', desc: '12 command', id: `${usedPrefix}menu stalker` },
                { title: 'Tools', desc: '48 command', id: `${usedPrefix}menu tools` },
                { title: 'Uploader', desc: '8 command', id: `${usedPrefix}menu uploader` },
                { title: 'Voice', desc: '16 command', id: `${usedPrefix}menu voice` }
            ]

            try {
                const media = await prepareWAMessageMedia(
                    { video: { url: videoMenu }, gifPlayback: true },
                    { upload: conn.waUploadToServer }
                )

                const btn = new conn.ButtonV2(conn)
                btn.setBody(yukiText)
                btn.setFooter('ʜᴏꜱʜɪɴᴏ-ᴅᴇꜱᴜ')
                // HeaderType 5 = VIDEO pada enum Baileys/WAProto (Bukan 2 yang merupakan TEXT)
                btn.setMedia({
                    headerType: 5,
                    videoMessage: media.videoMessage
                })

                btn.addRawButton({
                    buttonId: 'menu_select',
                    buttonText: { displayText: 'ᴘɪʟɪʜ ᴍᴇɴᴜ' },
                    type: 1,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: 'PILIH KATEGORI',
                            sections: [
                                {
                                    title: 'TOTAL 27 KATEGORI',
                                    highlight_label: 'KATEGORI',
                                    rows: categories.map(cat => ({
                                        header: '',
                                        title: cat.title,
                                        description: cat.desc,
                                        id: cat.id
                                    }))
                                }
                            ]
                        })
                    }
                })

                if (m) {
                    btn.setContextInfo({
                        stanzaId: m.key?.id,
                        participant: m.sender,
                        quotedMessage: m.message,
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: `「 ${global.namebot} 」`,
                            newsletterJid: global.ch
                        }
                    })
                }

                return await btn.send(m.chat)
            } catch (errGif) {
                console.error('Error saat kirim ButtonV2 GIF:', errGif)
                return m.reply(`⚠️ *Gagal Mengirim ButtonV2 GIF!*\n\n*Penyebab:* ${errGif.message}\n\n*Catatan:* WhatsApp Multi-Device membatasi pesan media video di dalam format ButtonV2 (Classic Buttons). Jika ingin GIF looping resmi, gunakan: \`${usedPrefix}tesbutton 6 gifflow\``)
            }
        }

        // 6.3b Mode GIF Looping Native Flow (Interactive Message Card Resmi WA ala menu.js)
        if (subMode === 'gifflow' || subMode === 'flowgif' || subMode === 'gifcard') {
            let videoMenu = 'https://c.termai.cc/v174/zFX'
            try {
                if (fs.existsSync('./media/menu.json')) {
                    const listMenu = JSON.parse(fs.readFileSync('./media/menu.json'))
                    if (Array.isArray(listMenu) && listMenu.length > 0) {
                        videoMenu = listMenu[Math.floor(Math.random() * listMenu.length)]
                    }
                }
            } catch (e) {
                videoMenu = 'https://c.termai.cc/v174/zFX'
            }

            const categories = [
                { title: 'Absen', desc: '8 command', id: `${usedPrefix}menu absen` },
                { title: 'Ai', desc: '12 command', id: `${usedPrefix}menu ai` },
                { title: 'Anime', desc: '72 command', id: `${usedPrefix}menu anime` },
                { title: 'Audio', desc: '5 command', id: `${usedPrefix}menu audio` },
                { title: 'Clan', desc: '26 command', id: `${usedPrefix}menu clan` },
                { title: 'Database', desc: '5 command', id: `${usedPrefix}menu database` },
                { title: 'Demo', desc: '14 command', id: `${usedPrefix}menu demo` },
                { title: 'Downloader', desc: '36 command', id: `${usedPrefix}menu downloader` },
                { title: 'Fun', desc: '35 command', id: `${usedPrefix}menu fun` },
                { title: 'Game', desc: '28 command', id: `${usedPrefix}menu game` },
                { title: 'Group', desc: '42 command', id: `${usedPrefix}menu group` },
                { title: 'Info', desc: '15 command', id: `${usedPrefix}menu info` },
                { title: 'Internet', desc: '30 command', id: `${usedPrefix}menu internet` },
                { title: 'Islamic', desc: '18 command', id: `${usedPrefix}menu islamic` },
                { title: 'Kerang', desc: '10 command', id: `${usedPrefix}menu kerang` },
                { title: 'Maker', desc: '24 command', id: `${usedPrefix}menu maker` },
                { title: 'Menfess', desc: '6 command', id: `${usedPrefix}menu menfess` },
                { title: 'Owner', desc: '45 command', id: `${usedPrefix}menu owner` },
                { title: 'Primbon', desc: '14 command', id: `${usedPrefix}menu primbon` },
                { title: 'Quotes', desc: '22 command', id: `${usedPrefix}menu quotes` },
                { title: 'Rpg', desc: '55 command', id: `${usedPrefix}menu rpg` },
                { title: 'Sticker', desc: '25 command', id: `${usedPrefix}menu sticker` },
                { title: 'Stalker', desc: '12 command', id: `${usedPrefix}menu stalker` },
                { title: 'Tools', desc: '48 command', id: `${usedPrefix}menu tools` },
                { title: 'Uploader', desc: '8 command', id: `${usedPrefix}menu uploader` },
                { title: 'Voice', desc: '16 command', id: `${usedPrefix}menu voice` }
            ]

            try {
                const btn = new conn.Button(conn)
                btn.setBody(yukiText)
                btn.setFooter('ʜᴏꜱʜɪɴᴏ-ᴅᴇꜱᴜ')
                btn.setVideo(videoMenu, { gifPlayback: true })

                btn.addButton('single_select', JSON.stringify({
                    title: 'PILIH KATEGORI',
                    sections: [
                        {
                            title: 'TOTAL 27 KATEGORI',
                            highlight_label: 'KATEGORI',
                            rows: categories.map(cat => ({
                                header: '',
                                title: cat.title,
                                description: cat.desc,
                                id: cat.id
                            }))
                        }
                    ]
                }))

                if (m) {
                    btn.setContextInfo({
                        stanzaId: m.key?.id,
                        participant: m.sender,
                        quotedMessage: m.message,
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterName: `「 ${global.namebot} 」`,
                            newsletterJid: global.ch
                        }
                    })
                }

                return await btn.send(m.chat)
            } catch (errFlow) {
                console.error('Error saat kirim Native Flow GIF:', errFlow)
                return m.reply(`⚠️ *Gagal Mengirim Native Flow GIF:* ${errFlow.message}`)
            }
        }

        // 6.3 Kombinasi 3: Struk / My Statistics (Gambar 2 / Struk 2 Tombol Progres)
        if (subMode === 'stats' || subMode === 'struk' || subMode === '2') {
            let avatar = await conn.profilePictureUrl(m.sender, 'image').catch(() => null)
            if (!avatar) avatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'

            const title = '⛩️ MY STATISTICS'
            const subtitle = 'Hoshino-Desu'
            const body = `👤 *+${senderNumber}*　「🔥 Streak : 0」
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
  🧾 *STRUK STATISTIK*
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
📊 Total Pesan........ *66*
🎯 Target Menuju...... *5.000*
┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈

  ⌈ Ｐｒｏｇｒｅｓ ⌋　　  ⌈ Ｓｉｓａ ⌋`
            const footer = 'HOSHINO X KAI'
            const buttons = [
                ['𖤐 1%', `${usedPrefix}ping`],
                ['𖤐 4.934', `${usedPrefix}allmenu`]
            ]

            return await conn.sendButtonV2(m.chat, {
                title,
                subtitle,
                text: body,
                footer,
                buffer: avatar,
                buttons
            }, m)
        }

        // 6.3 Kombinasi 3: Main Menu Dashboard (Location Header: Title + Subtitle + Buttons)
        if (subMode === 'dashboard' || subMode === 'dash' || subMode === '3') {
            const title = '📜 MAIN MENU DASHBOARD'
            const subtitle = 'Avelia • Active Online 24/7'
            const body = `Halo kak @${senderNumber}! 👋
Selamat datang di Panel Kontrol Avelia.

Silakan pilih opsi navigasi cepat di bawah ini:`
            const footer = 'Avelia v4.0.0 • Classic ButtonV2'
            const buttons = [
                ['⚡ Speedtest', `${usedPrefix}ping`],
                ['📋 Semua Menu', `${usedPrefix}allmenu`],
                ['👑 Info Owner', `${usedPrefix}owner`]
            ]

            const sampleThumb = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'
            return await conn.sendButtonV2(m.chat, {
                title,
                subtitle,
                text: body,
                footer,
                buffer: sampleThumb,
                buttons,
                contextInfo: { mentions: [m.sender] }
            }, m)
        }

        // 6.4 Kombinasi 4: Clean Header (Title + Subtitle tanpa Thumbnail Gambar)
        if (subMode === 'clean' || subMode === 'nothumb' || subMode === 'text' || subMode === '4') {
            const title = '🔔 PEMBERITAHUAN SISTEM'
            const subtitle = 'Avelia Notification Service'
            const body = `📦 *CLASSIC BUTTON TANPA THUMBNAIL*

Format ini menggunakan Location Header murni (Judul & Sub-judul) tanpa thumbnail gambar.
Tampilan menjadi sangat bersih, ringan, dan cepat dimuat di koneksi lambat.`
            const footer = 'Avelia System Notice'
            const buttons = [
                ['✅ Konfirmasi', `${usedPrefix}ping`],
                ['🔙 Menu Lab', `${usedPrefix}tesbutton`]
            ]

            return await conn.sendButtonV2(m.chat, {
                title,
                subtitle,
                text: body,
                footer,
                buffer: null,
                buttons
            }, m)
        }

        // 6.5 Kombinasi 5: Image Media Header (HeaderType 4: Foto Penuh + Tombol)
        if (subMode === 'image' || subMode === 'media' || subMode === 'banner' || subMode === '5') {
            const sampleImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80'
            const body = `🖼️ *HEADER IMAGE + CLASSIC BUTTONS*

Kombinasi ButtonV2 dengan banner gambar penuh di atas pesan teks dan tombol kotak respons.`
            const footer = 'Avelia Image Showcase'
            const buttons = [
                ['👍 Suka & Keren', `${usedPrefix}ping`],
                ['📋 Semua Menu', `${usedPrefix}allmenu`]
            ]

            return await conn.sendButtonV2(m.chat, {
                text: body,
                footer,
                image: sampleImage,
                buttons
            }, m)
        }

        // 6.6 Kombinasi 6: Document Media Header (HeaderType 3: Kartu Dokumen PDF + Tombol)
        if (subMode === 'doc' || subMode === 'document' || subMode === 'pdf' || subMode === '6') {
            const body = `📄 *HEADER DOKUMEN + CLASSIC BUTTONS*

Kombinasi ButtonV2 dengan lampiran kartu dokumen PDF di atas teks struk dan tombol respon.`
            const footer = 'Avelia Document Card'
            const buttons = [
                ['📂 Download File', `${usedPrefix}ping`],
                ['ℹ️ Info Detail', `${usedPrefix}owner`]
            ]

            return await conn.sendButtonV2(m.chat, {
                text: body,
                footer,
                document: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                mimetype: 'application/pdf',
                fileName: 'STRUK_STATISTIK_2026.pdf',
                buttons
            }, m)
        }

        // Fallback jika submode tidak dikenali
        return m.reply(`❓ *Submode Button 6 Tidak Dikenali!*\nPilihan kombinasi Button 6:\n• \`${usedPrefix}tesbutton 6\` atau \`${usedPrefix}tesbutton 6 list\` (Menu Pop-up List Dropdown)\n• \`${usedPrefix}tesbutton 6 stats\` (Struk Statistik 2 Tombol [Gambar 2])\n• \`${usedPrefix}tesbutton 6 dashboard\` (Dashboard Menu Navigasi 3 Tombol)\n• \`${usedPrefix}tesbutton 6 clean\` (Header Bersih Tanpa Gambar)\n• \`${usedPrefix}tesbutton 6 image\` (Header Gambar Penuh)\n• \`${usedPrefix}tesbutton 6 doc\` (Header Kartu Dokumen PDF)`)
    }

    // 7. Tipe 7: Target User Spesifik (Akinator System ala Bot Yuki)
    if (type === '7' || type === 'target' || type === 'lock' || type === 'aki') {
        const subMode = (args[1] || '').toLowerCase()
        const targetJid = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
        const targetNumber = targetJid.split('@')[0]

        const bodyText = `❓ *Pertanyaan 1:*\nApakah dia Tinggal di Indonesia?\n\n📊 Progress: 0%\n\n> Ketik *.akistop* untuk berhenti`
        const footerText = '🧞 Akinator - Pilih jawaban kamu!'
        const spectatorText = `❓ *Pertanyaan 1:*\nApakah dia Tinggal di Indonesia?\n\n📊 Progress: 0%\n\n> 🔒 ᴛᴏᴍʙᴏʟ ᴊᴀᴡᴀʙᴀɴ ʜᴀɴʏᴀ ᴍᴜɴᴄᴜʟ ᴜɴᴛᴜᴋ ᴘᴇᴍᴀɪɴ\n> Ketik *.akistop* untuk berhenti`

        const buttons = [
            ['✅ Ya', `${usedPrefix}akians ya|${targetNumber}`],
            ['❌ Tidak', `${usedPrefix}akians tidak|${targetNumber}`],
            ['🤷 Tidak Tahu', `${usedPrefix}akians idk|${targetNumber}`],
            ['🟡 Mungkin', `${usedPrefix}akians probably|${targetNumber}`],
            ['🔶 Mungkin Tidak', `${usedPrefix}akians probablynot|${targetNumber}`],
            ['↩️ Kembali', `${usedPrefix}tesbutton`]
        ]

        // 1. Mode DM / Ghost Tunnel (Persis Screenshot 1):
        if (subMode === 'dm' || subMode === 'pc') {
            await conn.reply(m.chat, spectatorText, m, { mentions: [targetJid] })
            return await conn.sendButton(targetJid, bodyText, footerText, null, buttons)
        }

        // Siapkan objek button
        const btn = new conn.Button(conn)
        btn.setBody(bodyText)
        btn.setFooter(footerText)
        btn.addButton('', '{}')
        for (const [lbl, val] of buttons) btn.addReply(lbl, val)
        if (m) {
            btn.setContextInfo({
                stanzaId: m.key?.id,
                participant: m.sender,
                quotedMessage: m.message
            })
        }
        const built = await btn.build(m.chat)

        // 2. Eksperimen Diagnostik: .tesbutton 7 p (Targeted Participant via LID)
        // UJI ISOLASI: Kirim interactiveMessage dengan participant JID yang sudah di-resolve ke LID
        if (subMode === 'p' || subMode === 'player' || subMode === 'lid') {
            const { jidNormalizedUser, generateMessageIDV2 } = await import('@whiskeysockets/baileys')
            const cleanTargetJid = jidNormalizedUser(targetJid)
            const targetDigits = cleanTargetJid.split('@')[0].split(':')[0].replace(/\D/g, '')

            let groupMeta = null
            let addressingMode = 'pn'
            let resolvedParticipantJid = cleanTargetJid

            try {
                groupMeta = await conn.groupMetadata(m.chat)
                addressingMode = groupMeta?.addressingMode || 'pn'
                
                const found = groupMeta?.participants?.find(p => {
                    const pDigits = (p.id || '').split('@')[0].split(':')[0].replace(/\D/g, '')
                    const pLidDigits = (p.lid || '').split('@')[0].split(':')[0].replace(/\D/g, '')
                    return pDigits === targetDigits || pLidDigits === targetDigits || p.id === cleanTargetJid
                })

                if (found) {
                    resolvedParticipantJid = (addressingMode === 'lid' && found.lid) ? found.lid : found.id
                }
            } catch (e) {
                console.warn('[TES-BUTTON P] GroupMeta error:', e?.message)
            }

            await m.reply(`🧪 *[EKSPERIMEN LID]* Mode: \`${addressingMode}\`\n🎯 Target: \`${resolvedParticipantJid}\`\nMengirim interactiveMessage ke grup dengan participant targeted...`)

            const testId = generateMessageIDV2(conn.user?.id)
            return await conn.relayMessage(m.chat, built.message, {
                messageId: testId,
                participant: { jid: resolvedParticipantJid },
                additionalAttributes: {
                    addressing_mode: addressingMode
                },
                additionalNodes: [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }]
                    }
                ]
            })
        }

        // 2b. Eksperimen Diagnostik: .tesbutton 7 r
        // UJI ISOLASI: Kirim InteractiveMessage ke Pemain via 1-on-1 dengan recipient=groupJid
        if (subMode === 'r' || subMode === 'recipient') {
            await m.reply('🧪 *[EKSPERIMEN R]* Mengirim InteractiveMessage ke Pemain (recipient: grup)...')
            const { jidNormalizedUser, generateMessageIDV2 } = await import('@whiskeysockets/baileys')
            const cleanTargetJid = jidNormalizedUser(targetJid)
            const testId = generateMessageIDV2(conn.user?.id)

            const playerMsg = JSON.parse(JSON.stringify(built.message))
            const mtype = Object.keys(playerMsg)[0]
            if (mtype && playerMsg[mtype]) {
                playerMsg[mtype].contextInfo = {
                    ...(playerMsg[mtype].contextInfo || {}),
                    remoteJid: m.chat
                }
            }

            return await conn.relayMessage(cleanTargetJid, playerMsg, {
                messageId: testId,
                additionalAttributes: {
                    recipient: m.chat
                },
                additionalNodes: [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }]
                    }
                ]
            })
        }

        // 2c. Eksperimen Diagnostik: .tesbutton 7 c (Combined Single Message)
        // UJI PROTOBUF GABUNGAN: Satu pesan tunggal memuat extendedTextMessage (gembok) DAN interactiveMessage (tombol)
        if (subMode === 'c' || subMode === 'combo' || subMode === 'hybrid') {
            await m.reply('🧪 *[EKSPERIMEN C]* Mengirim 1 Pesan Tunggal berisi Gembok + Tombol sekaligus ke Grup...')
            const { jidNormalizedUser, generateMessageIDV2 } = await import('@whiskeysockets/baileys')
            const cleanTargetJid = jidNormalizedUser(targetJid)

            let innerInteractive = built.message.viewOnceMessage?.message?.interactiveMessage || 
                                   built.message.interactiveMessage || 
                                   null

            const combinedMessage = {
                extendedTextMessage: {
                    text: spectatorText,
                    contextInfo: {
                        mentionedJid: [cleanTargetJid]
                    }
                },
                ...(innerInteractive ? { interactiveMessage: innerInteractive } : built.message)
            }

            return await conn.relayMessage(m.chat, combinedMessage, {
                messageId: generateMessageIDV2(conn.user?.id),
                additionalNodes: [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }]
                    }
                ]
            })
        }

        // 3. Eksperimen Diagnostik: .tesbutton 7 s
        // UJI ISOLASI: Hanya kirim extendedTextMessage teks gembok siaran biasa ke grup
        if (subMode === 's' || subMode === 'spectator') {
            await m.reply('🧪 *[EKSPERIMEN S]* Mengirim teks gembok biasa ke grup...')
            return await conn.sendMessage(m.chat, { text: spectatorText }, { quoted: m })
        }

        // 4. Eksperimen Diagnostik: .tesbutton 7 order1 (Interactive Dulu -> Jeda 2s -> Teks Gembok)
        if (subMode === 'order1') {
            await m.reply('🧪 *[EKSPERIMEN ORDER1]* T0: Interactive (ID X) ➔ Jeda 2s ➔ T2: Teks Gembok (ID X)...')
            const { jidNormalizedUser, generateMessageIDV2 } = await import('@whiskeysockets/baileys')
            const cleanTargetJid = jidNormalizedUser(targetJid)
            const sharedId = generateMessageIDV2(conn.user?.id)

            // T0: Kirim Interactive ke Pemain
            await conn.relayMessage(m.chat, built.message, {
                messageId: sharedId,
                participant: { jid: cleanTargetJid },
                additionalNodes: [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }]
                    }
                ]
            })

            // T1: Jeda 2 detik
            await new Promise(r => setTimeout(r, 2000))

            // T2: Kirim Teks Gembok ke Grup dengan ID sama
            return await conn.relayMessage(m.chat, { extendedTextMessage: { text: spectatorText } }, {
                messageId: sharedId
            })
        }

        // 5. Eksperimen Diagnostik: .tesbutton 7 order2 (Teks Gembok Dulu -> Jeda 2s -> Interactive)
        if (subMode === 'order2') {
            await m.reply('🧪 *[EKSPERIMEN ORDER2]* T0: Teks Gembok (ID X) ➔ Jeda 2s ➔ T2: Interactive (ID X)...')
            const { jidNormalizedUser, generateMessageIDV2 } = await import('@whiskeysockets/baileys')
            const cleanTargetJid = jidNormalizedUser(targetJid)
            const sharedId = generateMessageIDV2(conn.user?.id)

            // T0: Kirim Teks Gembok ke Grup
            await conn.relayMessage(m.chat, { extendedTextMessage: { text: spectatorText } }, {
                messageId: sharedId
            })

            // T1: Jeda 2 detik
            await new Promise(r => setTimeout(r, 2000))

            // T2: Kirim Interactive ke Pemain dengan ID sama
            return await conn.relayMessage(m.chat, built.message, {
                messageId: sharedId,
                participant: { jid: cleanTargetJid },
                additionalNodes: [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [{ tag: 'interactive', attrs: { type: 'native_flow', v: '1' }, content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }] }]
                    }
                ]
            })
        }

        // 6. Mode Default: Isolated Sender Key Architecture (Eksklusif Tombol untuk Pemain, Teks Gembok untuk Penonton)
        try {
            await m.reply(`🧪 *[DUAL VISIBILITY: ISOLATED SENDER KEY]*\n🎯 *Target Pemain:* @${targetNumber}\n👥 *Penonton Grup:* Teks Gembok\n📦 *Status:* Tombol (pkmsg) + Gembok (skmsg terisolasi)\n\n_Mengirim pesan dual-visibility ke grup..._`, null, {
                mentions: [targetJid]
            })

            const { sendDualGroupMessage } = await import(`../../lib/dual-group-message.js?v=${Date.now()}`)
            return await sendDualGroupMessage(conn, m.chat, targetJid, built.message, spectatorText, {
                quoted: m
            })
        } catch (err) {
            console.error('[TES-BUTTON 7 ERROR]:', err)
            return m.reply(`⚠️ *[DEBUG GAGAL DUAL MESSAGE]*:\n\`\`\`${err.message}\`\`\``)
        }
    }

    // 8. Mode 'all' (Kirim semua 7 tipe berurutan)
    if (type === 'all' || type === 'semua') {
        await m.reply('🚀 *Mengirim semua 7 tipe tombol secara berurutan...*\nMohon tunggu sekitar 2 detik antar pesan.')

        for (let i = 1; i <= 7; i++) {
            await handler(m, { conn, args: [String(i)], usedPrefix, command })
            await new Promise(r => setTimeout(r, 2000))
        }
        return
    }

    // Default: Tampilkan Panduan Laboratorium Tombol + Tombol Pilihan Tes
    const guideText = `🧪 *AVELIA INTERACTIVE BUTTON LABORATORY* 🧪
Pilih tipe tombol yang ingin kamu uji coba di bawah ini:

• *1. Quick Reply Stack* (Ala Akinator, panah hijau vertikal)
• *2. Multi-Action Mixed* (URL, Copy, Call, Reply)
• *3. Banner Gambar + Tombol* (Gambar visual di atas tombol)
• *4. Dropdown List Menu* (Pop-up bottom sheet banyak pilihan)
• *5. Mega Combo* (Dropdown + URL + Copy sekaligus)
• *6. Classic Button (V2)* (Struk Statistik ala Bot Yuki, Header Lokasi/Media)
  _Variasi: \`${usedPrefix + command} 6 [stats|menu|clean|image|doc]\`_
• *7. Targeted Button* (🧞 Akinator ala Bot Yuki: Tombol Grup + Role Guard)
• *Ketik:* \`${usedPrefix + command} 7\` (Mode Utama: 6 Tombol di Grup + Role Guard)
• *Ketik:* \`${usedPrefix + command} 7 dm\` (Mode DM: Gembok di Grup, Tombol di DM)
• *Ketik:* \`${usedPrefix + command} all\` untuk kirim semua sekaligus!

Silakan ketuk tombol cepat di bawah untuk langsung menguji:`

    const mainButtons = [
        ['1️⃣ Quick Reply', `${usedPrefix + command} 1`],
        ['6️⃣ Struk Statistik', `${usedPrefix + command} 6 stats`],
        ['📜 6️⃣ Menu V2', `${usedPrefix + command} 6 menu`],
        ['3️⃣ Banner + Button', `${usedPrefix + command} 3`],
        ['4️⃣ Dropdown List', `${usedPrefix + command} 4`],
        ['🧞 7️⃣ Akinator Group', `${usedPrefix + command} 7`]
    ]

    return await conn.sendButton(m.chat, guideText, 'Avelia • Ultimate Button Showcase', null, mainButtons, m)
}

handler.help = ['tesbutton', 'buttonlab', 'akians']
handler.tags = ['info', 'tools']
handler.command = /^(tesbutton|buttonlab|buttoncheck|cekbutton|akians)$/i
handler.unreg = true

export default handler
