let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    let type = (text || '').toLowerCase()
    
    // Simpan settingan lama dan paksa nyalakan useButton khusus untuk tes ini
    let oldUseButton = global.useButton
    global.useButton = true

    try {
        if (!type) {
            // Tampilkan Menu List jika dipanggil tanpa argumen
            let sections = [
                {
                    title: "Silakan pilih tipe interaktif yang ingin diuji:",
                    rows: [
                        { title: "Tes Regular Button", id: "button", rowId: `${usedPrefix + command} button`, description: "Mengirim tombol standar (max 3)" },
                        { title: "Tes List Menu", id: "list", rowId: `${usedPrefix + command} list`, description: "Mengirim menu dropdown bergaya List" },
                        { title: "Tes Gabungan", id: "gabungan", rowId: `${usedPrefix + command} gabungan`, description: "Mengirim List Menu + Regular Button" },
                        { title: "Tes Polling", id: "poll", rowId: `${usedPrefix + command} poll`, description: "Mengirim pesan polling / pemungutan suara" },
                        { title: "Tes Template / Hydrated", id: "hydrated", rowId: `${usedPrefix + command} hydrated`, description: "Mengirim pesan dengan tombol URL, Call, dan Quick Reply" },
                    ]
                }
            ]
            return await conn.sendList(
                m.chat, 
                "TESTING MENU INTERAKTIF", 
                "Pilih salah satu menu di bawah ini untuk melihat contohnya.", 
                "Powered by Baileys", 
                "Pilih Disini", 
                sections, 
                m
            )
        }

        if (type.includes('button')) {
            let buttons = [
                ["Button 1", `${usedPrefix + command} id_btn_1`],
                ["Button 2", `${usedPrefix + command} id_btn_2`],
                ["Button 3", `${usedPrefix + command} id_btn_3`]
            ]
            return await conn.sendButton(m.chat, "Ini adalah tes Regular Button", "Powered by Baileys", buttons, null)
        }

        if (type.includes('list')) {
            let sections = [
                {
                    title: "Bagian Pertama",
                    rows: [
                        { title: "Opsi 1", id: `${usedPrefix + command} opsi_1`, rowId: `${usedPrefix + command} opsi_1`, description: "Deskripsi Opsi 1" },
                        { title: "Opsi 2", id: `${usedPrefix + command} opsi_2`, rowId: `${usedPrefix + command} opsi_2`, description: "Deskripsi Opsi 2" }
                    ]
                }
            ]
            // HACK: Tambahkan delay 1.5 detik agar WhatsApp mengira ini bukan respons otomatis dari klik tombol
            await new Promise(resolve => setTimeout(resolve, 1500))
            
            return await conn.sendList(
                m.chat, 
                "Ini adalah tes List Menu", 
                "Deskripsi list...", 
                "Footer list", 
                "Klik Untuk Buka List", 
                sections, 
                null,
                {
                    // HACK: Palsukan sebagai pesan forward agar memutus konteks rantai pesan interaktif
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 1
                    }
                }
            )
        }

        if (type.includes('gabungan')) {
            let sections = [
                {
                    title: "Daftar Menu",
                    rows: [
                        { title: "Opsi 1", id: `${usedPrefix + command} opsi_1` },
                        { title: "Opsi 2", id: `${usedPrefix + command} opsi_2` }
                    ]
                }
            ]
            const { generateWAMessageFromContent } = (await import('@whiskeysockets/baileys')).default
            const msg = await generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: {
                            body: { text: "Ini adalah tes Gabungan List & Button" },
                            footer: { text: "Powered by Baileys" },
                            header: { title: "TES GABUNGAN", subtitle: "" },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "Buka List Menu",
                                            sections: sections
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Tombol Biasa 1",
                                            id: `${usedPrefix + command} id_btn_1`
                                        })
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Tombol Biasa 2",
                                            id: `${usedPrefix + command} id_btn_2`
                                        })
                                    }
                                ]
                            }
                        }
                    }
                }
            }, { quoted: null })
            
            // HACK: Tambahkan delay 1.5 detik
            await new Promise(resolve => setTimeout(resolve, 1500))
            return conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
        }

        if (type.includes('poll')) {
            // Dibungkus array lagi karena optiPoll[0] kalau string akan dianggap cuma 1 tombol
            let options = [["Pilihan A"], ["Pilihan B"], ["Pilihan C"]]
            return await conn.sendPoll(m.chat, "Ini adalah tes Polling. Pilih salah satu!", options)
        }

        if (type.includes('hydrated') || type.includes('template')) {
            return await conn.sendHydrated2(
                m.chat,
                "Ini adalah tes Hydrated/Template Buttons",
                "Powered by Baileys",
                null, // buffer (image/video)
                "https://github.com/Nelson4111/WaBot", // url
                "Go To Github", // urlText
                "6281241100804", // call
                "Call Owner", // callText
                [
                    ["Quick Reply 1", "id_quick_1"],
                    ["Quick Reply 2", "id_quick_2"]
                ], // buttons
                null
            )
        }
        
        if (type.includes('id_btn_') || type.includes('id_quick_') || type.includes('opsi_')) {
            return m.reply(`✅ Tombol berhasil ditekan!\nID yang dikirim ke bot: *${type}*`)
        }

        m.reply("Tipe tes tidak valid.")
    } finally {
        // Kembalikan ke settingan awal
        global.useButton = oldUseButton
    }
}

handler.help = ['testbutton']
handler.tags = ['info']
handler.command = /^(tes(t)?button)$/i

export default handler
