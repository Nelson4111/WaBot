let handler = async (m, { conn, args, usedPrefix, command }) => {
    let type = (args[0] || '').toLowerCase()

    if (!type) {
        // Tampilkan Menu List jika dipanggil tanpa argumen
        let sections = [
            {
                title: "Silakan pilih tipe interaktif yang ingin diuji:",
                rows: [
                    { title: "Tes Regular Button", rowId: `${usedPrefix + command} button`, description: "Mengirim tombol standar (max 3)" },
                    { title: "Tes List Menu", rowId: `${usedPrefix + command} list`, description: "Mengirim menu dropdown bergaya List" },
                    { title: "Tes Polling", rowId: `${usedPrefix + command} poll`, description: "Mengirim pesan polling / pemungutan suara" },
                    { title: "Tes Template / Hydrated", rowId: `${usedPrefix + command} hydrated`, description: "Mengirim pesan dengan tombol URL, Call, dan Quick Reply" },
                ]
            }
        ]
        return conn.sendList(
            m.chat, 
            "TESTING MENU INTERAKTIF", 
            "Pilih salah satu menu di bawah ini untuk melihat contohnya.", 
            "Powered by Baileys", 
            "Pilih Disini", 
            sections, 
            m
        )
    }

    if (type === 'button') {
        let buttons = [
            ["Button 1", "id_btn_1"],
            ["Button 2", "id_btn_2"],
            ["Button 3", "id_btn_3"]
        ]
        return conn.sendButton(m.chat, "Ini adalah tes Regular Button", "Powered by Baileys", null, buttons, m)
    }

    if (type === 'list') {
        let sections = [
            {
                title: "Bagian Pertama",
                rows: [
                    { title: "Opsi 1", rowId: "id_opsi_1", description: "Deskripsi Opsi 1" },
                    { title: "Opsi 2", rowId: "id_opsi_2", description: "Deskripsi Opsi 2" }
                ]
            }
        ]
        return conn.sendList(
            m.chat, 
            "Ini adalah tes List Menu", 
            "Deskripsi list...", 
            "Footer list", 
            "Klik Untuk Buka List", 
            sections, 
            m
        )
    }

    if (type === 'poll') {
        let options = ["Pilihan A", "Pilihan B", "Pilihan C"]
        return conn.sendPoll(m.chat, "Ini adalah tes Polling. Pilih salah satu!", options)
    }

    if (type === 'hydrated') {
        return conn.sendHydrated2(
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
            m
        )
    }

    m.reply("Tipe tes tidak valid.")
}

handler.help = ['testbutton']
handler.tags = ['info']
handler.command = /^(tes(t)?button)$/i

export default handler
