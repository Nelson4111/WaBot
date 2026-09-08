import fs from 'fs'
import fetch from 'node-fetch'
import moment from 'moment-timezone'
const fallbackThumb = "https://qu.ax/mgyIh"

let handler = m => m

handler.all = async function (m) {
    global.wm = global.namebot || "Avelia"

    // === Thumbnail Buffer Loader ===
    let thumbBuffer
    try {
        thumbBuffer = fs.readFileSync('./media/thumbnail.jpg')
    } catch {
        thumbBuffer = Buffer.from([])
    }

    let thumbUrl = fallbackThumb
    try {
        const listThumb = JSON.parse(fs.readFileSync('./media/thumb.json'))
        thumbUrl = listThumb[Math.floor(Math.random() * listThumb.length)]
    } catch {}

    // === Fake Verified Text Message ===
    global.finteractive = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`
        },
        message: {
            extendedTextMessage: {
                text: `${global.namebot || 'Avelia'} Official ✓`
            }
        }
    }

    // === Fake Catalog / Product Message (100% Kelihatan di Semua HP & WA Mod) ===
    global.ftoko = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`
        },
        message: {
            productMessage: {
                product: {
                    productImage: {
                        jpegThumbnail: thumbBuffer
                    },
                    title: `${global.namebot || 'Avelia'} Official ✓`,
                    description: `${momentGreeting()}`,
                    currencyCode: "IDR",
                    priceAmount1000: "1000000",
                    retailerId: "Avelia",
                    productImageCount: 1
                },
                businessOwnerJid: `0@s.whatsapp.net`
            }
        }
    }
    global.forder = global.ftoko

    // === adReply (Tampilan Banner Gambar) ===
    global.adReply = {
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: `${global.namebot || 'Avelia'} Official ✓`,
                newsletterJid: global.ch || ""
            },
            externalAdReply: {
                title: `${global.namebot || 'Avelia'} Official ✓`,
                body: `${momentGreeting()}`,
                mediaType: 1,
                previewType: "PHOTO",
                thumbnail: thumbBuffer,
                thumbnailUrl: thumbUrl,
                renderLargerThumbnail: false,
                showAdAttribution: true,
                mediaUrl: global.ch,
                sourceUrl: global.ch
            }
        }
    }

    // === fkontak (Kartu Kontak Verified ✓) ===
    global.fkontak = {
        key: {
            fromMe: false,
            participant: m.sender || `0@s.whatsapp.net`
        },
        message: {
            contactMessage: {
                displayName: `${global.namebot || 'Avelia'} Verified ✓`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${global.namebot || 'Avelia'};;;\nFN:${global.namebot || 'Avelia'} Verified ✓\nORG:Official Bot Service\nTEL;type=CELL;type=VOICE;waid=${(m.sender || '').split('@')[0]}:${(m.sender || '').split('@')[0]}\nEND:VCARD`,
                jpegThumbnail: thumbBuffer,
            }
        }
    }

    // === Fake VN ===
    global.fvn = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`
        },
        message: {
            audioMessage: {
                mimetype: "audio/ogg; codecs=opus",
                seconds: "999999",
                ptt: true
            }
        }
    }

    // === Fake Text ===
    global.ftextt = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`
        },
        message: {
            extendedTextMessage: {
                text: `${global.namebot || 'Avelia'} Official ✓`,
                title: `${global.namebot || 'Avelia'} Official ✓`,
                jpegThumbnail: thumbBuffer
            }
        }
    }

    // === Fake Gif ===
    global.fgif = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`
        },
        message: {
            videoMessage: {
                title: `${global.namebot || 'Avelia'} Official ✓`,
                h: "Hmm",
                seconds: "999",
                gifPlayback: true,
                caption: `${global.namebot || 'Avelia'} Official ✓`,
                jpegThumbnail: thumbBuffer
            }
        }
    }

    // === Fake Document ===
    global.fdocs = {
        key: { participant: '0@s.whatsapp.net' },
        message: {
            documentMessage: {
                title: `${global.namebot || 'Avelia'} Official ✓`,
                jpegThumbnail: thumbBuffer
            }
        }
    }

    // === Fake Group Invite ===
    global.fgclink = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
        },
        message: {
            groupInviteMessage: {
                groupJid: "628xxx-xxx@g.us",
                inviteCode: "null",
                groupName: `${global.namebot || 'Avelia'} Community`,
                caption: `${global.namebot || 'Avelia'} Official ✓`,
                jpegThumbnail: thumbBuffer
            }
        }
    }
}

export default handler

function momentGreeting() {
    const hour = moment.tz('Asia/Jakarta').hour()
    if (hour >= 18) return 'Konbanwa🍃'
    if (hour >= 15) return 'Konnichiwa🌾'
    if (hour >= 11) return 'Konnichiwa☀️'
    if (hour >= 4) return 'Ohayo🌄'
    return 'Oyasumi🌙'
}