import * as Elaina from '@rexxhayanasi/elaina-baileys'
import * as Baileys from '@whiskeysockets/baileys'

const proto = Elaina.proto || Baileys.proto
const generateWAMessageFromContent = Elaina.generateWAMessageFromContent || Baileys.generateWAMessageFromContent
const generateMessageIDV2 = Elaina.generateMessageIDV2 || Baileys.generateMessageIDV2

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Tentukan URL WebSocket (Bisa custom, Cloudflare sesepuh, atau PieSocket yang aktif)
    let WS_URL = 'wss://free.blr2.piesocket.com/v3/1?api_key=OZhgMu47NmZgmMWMIzXUY3NXL26NWHABe3zJGQCF&notify_self=1'
    
    if (args[0]) {
        if (/^(cf|sesepuh|cloudflare)$/i.test(args[0])) {
            WS_URL = 'wss://expert-louis-zen-fuzzy.trycloudflare.com/test'
        } else if (/^wss?:\/\//i.test(args[0])) {
            WS_URL = args[0]
        }
    }

    const sources = [
        {
            source_type: 'THIRD_PARTY',
            source_display_name: 'WebSocket Server',
            source_subtitle: 'Realtime Stream',
            source_url: WS_URL,
            favicon: {
                url: 'https://mmg.whatsapp.net/o1/v/t24/f2/m239/CONTOH?ccb=9-4&oh=x&oe=y&_nc_sid=z&mms3=true',
                mime_type: 'image/jpeg',
                width: 16,
                height: 16
            }
        }
    ]

    const html = `
<style>
* {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none;
    user-select: none;
}

body {
    margin: 0;
    padding: 16px;
    background: transparent;
    color: #fff;
    font-family: Arial, sans-serif;
}

.wrap {
    width: 100%;
    max-width: 620px;
    margin: auto;
}

.card {
    padding: 20px;
    border-radius: 16px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.12);
}

.label {
    font-size: 10px;
    letter-spacing: 1.5px;
    color: rgba(255,255,255,.4);
}

.title {
    margin-top: 6px;
    font-size: 21px;
    font-weight: bold;
}

.status {
    margin-top: 18px;
    padding: 15px;
    border-radius: 12px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
}

.status-title {
    font-size: 14px;
    font-weight: bold;
}

.status-text {
    margin-top: 6px;
    font-size: 12px;
    color: rgba(255,255,255,.6);
}

.info {
    margin-top: 14px;
    font-size: 11px;
    line-height: 1.7;
    color: rgba(255,255,255,.5);
    word-break: break-all;
}

.log {
    margin-top: 15px;
    padding: 12px;
    min-height: 100px;
    border-radius: 10px;
    background: rgba(0,0,0,.25);
    font-family: monospace;
    font-size: 10px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>

<div class="wrap">
    <div class="card">
        <div class="label">WEBSOCKET TEST</div>

        <div class="title">
            Realtime Connection
        </div>

        <div class="status">
            <div class="status-title" id="status">
                CONNECTING...
            </div>

            <div class="status-text" id="detail">
                Membuka koneksi WebSocket
            </div>
        </div>

        <div class="info">
            Server:
            <span id="server"></span>
            <br>
            State:
            <span id="state">CONNECTING</span>
        </div>

        <div class="log" id="log">
Memulai WebSocket...
        </div>
    </div>
</div>

<script>
(function () {
    const WS_URL = '${WS_URL}'

    const status = document.getElementById('status')
    const detail = document.getElementById('detail')
    const state = document.getElementById('state')
    const server = document.getElementById('server')
    const log = document.getElementById('log')

    server.textContent = WS_URL

    function write(text) {
        log.textContent += '\\n' + text
    }

    if (typeof WebSocket === 'undefined') {
        status.textContent = 'NOT SUPPORTED'
        detail.textContent = 'WebSocket API tidak tersedia'
        state.textContent = 'UNSUPPORTED'
        write('✗ WebSocket API tidak tersedia')
        return
    }

    write('→ WebSocket API tersedia')
    write('→ Membuka: ' + WS_URL)

    let ws

    try {
        ws = new WebSocket(WS_URL)
        ws.binaryType = 'arraybuffer'
    } catch (error) {
        status.textContent = 'FAILED'
        detail.textContent = error.message
        state.textContent = 'FAILED'
        write('✗ Exception: ' + error.message)
        return
    }

    ws.onopen = function () {
        status.textContent = 'CONNECTED'
        detail.textContent = 'WebSocket berhasil terhubung'
        state.textContent = 'OPEN'

        write('✓ WebSocket OPEN')
        write('✓ Handshake berhasil')

        const payload = {
            type: 'test',
            message: 'HELLO_FROM_AI_RICH',
            timestamp: Date.now()
        }

        write('→ Mengirim test...')
        try {
            ws.send(JSON.stringify(payload))
            write('✓ Test terkirim')
        } catch (err) {
            write('⚠️ Gagal send: ' + err.message)
        }
    }

    ws.onmessage = function (event) {
        write('← SERVER: ' + event.data)

        try {
            const data = JSON.parse(event.data)

            if (data.type === 'connected') {
                write('✓ Server menerima koneksi')
            }

            if (data.type === 'test') {
                status.textContent = 'REALTIME OK'
                detail.textContent = 'Server menerima dan membalas'
                state.textContent = 'OPEN'
                write('✓ SERVER RESPONSE OK')
            }

            if (data.type === 'error') {
                write('✗ SERVER ERROR: ' + data.message)
            }
        } catch {
            write('✓ Data diterima')
        }
    }

    ws.onerror = function () {
        status.textContent = 'CONNECTION ERROR'
        detail.textContent = 'WebSocket gagal terhubung'
        state.textContent = 'ERROR'
        write('✗ WebSocket ERROR')
    }

    ws.onclose = function (event) {
        state.textContent = 'CLOSED'

        write(
            '✗ WebSocket CLOSED' +
            '\\nCode: ' + event.code +
            '\\nReason: ' + (event.reason || '-')
        )
    }
})()
</script>
`

    const subMessageType = proto.AIRichResponseSubMessageType?.AI_RICH_RESPONSE_TEXT || 2

    const isi = {
        messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            botMetadata: {
                messageDisclaimerText: 'WebSocket Test',
                richResponseSourcesMetadata: {
                    sources
                }
            }
        },

        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,

                    submessages: [
                        {
                            messageType: subMessageType,
                            messageText: 'WebSocket Test'
                        }
                    ],

                    unifiedResponse: {
                        data: Buffer.from(
                            JSON.stringify({
                                response_id: generateMessageIDV2 ? generateMessageIDV2() : 'RES_' + Date.now(),
                                sections: [
                                    {
                                        view_model: {
                                            primitive: {
                                                __typename: 'GenAIaeacdsnwHtmlPrimitive',
                                                payload: html,
                                                trusted_sources: sources.map(x => x.source_url)
                                            },
                                            __typename: 'GenAISingleLayoutViewModel'
                                        }
                                    }
                                ]
                            })
                        ).toString('base64')
                    },

                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedAiBotMessageInfo: {
                            botJid: '0@bot'
                        },
                        forwardOrigin: 4
                    }
                }
            }
        }
    }

    const msg = generateWAMessageFromContent(
        m.chat,
        isi,
        {
            messageId: generateMessageIDV2 ? generateMessageIDV2() : undefined
        }
    )

    await conn.relayMessage(
        m.chat,
        msg.message,
        {
            messageId: msg.key.id
        }
    )

    return m.reply(`*──  ୨୧ ✧ ᴀɪ ʀɪᴄʜ ᴡᴇʙꜱᴏᴄᴋᴇᴛ ᴛᴇꜱᴛ ✧ ୨୧  ──*

> *おしらせ!* (ᴘʀᴏᴛᴏ ᴛᴇꜱᴛ!)
> Pesan uji coba AI Rich WebView berhasil dikirim.

*╭  〔 ⚙ ɪɴꜰᴏʀᴍᴀꜱɪ ᴛᴇꜱ 〕*
*┆* ⟡ ᴛᴀʀɢᴇᴛ ᴡꜱ   : \`${WS_URL}\`
*┆* ✧ ꜱᴛᴀᴛᴜꜱ      : *botMetadata.richResponseSourcesMetadata*
*╰──────────────────────*

> *Panduan Tes:*
> ⟡ Ketuk kartu tampilan di atas di HP WhatsApp kamu.
> ✧ Perhatikan kotak log: apakah status berubah menjadi **CONNECTED** / **OPEN**?
> ✦ Tes URL lain:
>   › \`${usedPrefix + command} cf\` (Coba URL Cloudflare sesepuh)
>   › \`${usedPrefix + command} <url_wss_kamu>\``)
}

handler.help = ['tesproto', 'protows', 'wstest']
handler.tags = ['arcade', 'tools']
handler.command = /^(tesproto|rawproto|protows|wstest)$/i

export default handler
