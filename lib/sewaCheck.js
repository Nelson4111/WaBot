import fs from 'fs'
import chalk from 'chalk'

export async function initSewaCheck(conn) {
    setInterval(async () => {
        const pathSewa = './lib/database/sewa.json'
        if (!fs.existsSync(pathSewa)) return

        try {
            let sewaData = JSON.parse(fs.readFileSync(pathSewa, 'utf-8'))
            let now = Date.now()
            let changed = false

            for (let i = 0; i < sewaData.length; i++) {
                if (now > sewaData[i].expired) {
                    let groupID = sewaData[i].id
                    try {
                        await conn.sendMessage(groupID, { 
                            text: '⚠️ *MASA SEWA HABIS*\n\nMasa sewa bot di grup ini telah berakhir. Bot akan keluar otomatis. Terima kasih telah menggunakan layanan kami!' 
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
                fs.writeFileSync(pathSewa, JSON.stringify(sewaData, null, 2))
                console.log(chalk.yellowBright('✅ Database sewa diperbarui (Masa aktif habis)'))
            }
        } catch (e) {
            console.error(chalk.red('Error Sewa Check:'), e)
        }
    }, 1000 * 60 * 10) 
    
    console.log(chalk.greenBright('✅ System Auto-Check Sewa Started'))
}
