import chalk from 'chalk'

export async function initSewaCheck(conn) {
    setInterval(async () => {
        if (!global.db?.data) return
        if (!Array.isArray(global.db.data.sewa)) {
            global.db.data.sewa = Array.isArray(global.db.data.aux_sewa) ? global.db.data.aux_sewa : []
        }

        try {
            let sewaData = global.db.data.sewa
            let now = Date.now()
            let changed = false

            for (let i = 0; i < sewaData.length; i++) {
                if (now > sewaData[i].expired) {
                    let groupID = sewaData[i].id
                    try {
                        await conn.sendMessage(groupID, { 
                            text: `*╭  〔 ⚠ ᴍ ᴀ ꜱ ᴀ  ꜱ ᴇ ᴡ ᴀ  ʜ ᴀ ʙ ɪ ꜱ 〕*\n> Masa sewa bot di grup ini telah berakhir.\n> Bot akan keluar otomatis. Terima kasih telah menggunakan layanan kami!\n*╰───────────────*` 
                        })
                        await conn.groupLeave(groupID)
                    } catch (e) {
                        console.error(chalk.red(`Gagal keluar dari grup ${groupID}:`), e)
                    }
                    sewaData.splice(i, 1)
                    changed = true
                    i-- 
                }
            }

            if (changed) {
                await global.db.write().catch(err => console.error('[SEWA CHECK SYNC ERROR]', err))
                console.log(chalk.yellowBright('✅ Database sewa Supabase diperbarui (Masa aktif habis)'))
            }
        } catch (e) {
            console.error(chalk.red('Error Sewa Check:'), e)
        }
    }, 1000 * 60 * 10) 
    
    console.log(chalk.greenBright('✅ System Auto-Check Sewa Started'))
}
