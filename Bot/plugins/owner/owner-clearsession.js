import fs from 'node:fs';

let handler = async (m, {
    conn
}) => {
    const ootaedit = await conn.sendMessage(m.chat, {
        text: "Wait.... Sessions Mau Di Hapus!"
    }, {
        quoted: m
    });
    fs.readdir(`./sessions`, async function(err, files) {
        if (err) {
            console.log('Unable to scan directory: ' + err);
            return m.reply('Unable to scan directory: ' + err);
        }
        let filteredArray = files.filter(item => item.startsWith("pre-key") ||
            item.startsWith("sender-key") || item.startsWith("session-") || item.startsWith("app-state")
        )
        console.log(`Menghapus ${filteredArray.length} file sesi...`);
        let teks = ` *– 乂 Sessions - Akan Di Delete*\n\nTotal: ${filteredArray.length} file.`
        
        if (filteredArray.length == 0) return conn.sendMessage(m.chat, {
            text: `${teks}`,
            edit: ootaedit.key
        }, {
            quoted: m
        })
        
        await conn.sendMessage(m.chat, {
            text: `${teks}`,
            edit: ootaedit.key
        }, {
            quoted: m
        })
        
        await sleep(2000)
        
        await conn.sendMessage(m.chat, {
            text: `🖐️Wait... Menghapus ${filteredArray.length} file sesi!!`,
            edit: ootaedit.key
        }, {
            quoted: m
        })
        
        let deleted = 0;
        for (const file of filteredArray) {
            try {
                fs.unlinkSync(`./sessions/${file}`)
                deleted++;
            } catch (e) {
                console.error(`Gagal menghapus file ${file}:`, e);
            }
        }
        
        await sleep(2000)
        
        await conn.sendMessage(m.chat, {
            text: `✅ Oke ${deleted} file Sessions Udah Di Hapus!!\n*Bot akan melakukan restart untuk menerapkan perubahan.*`,
            edit: ootaedit.key
        }, {
            quoted: m
        })
        if (process.send) {
            process.send('reset')
        }
    });
};

handler.command = ["delsesi", "clearsesi", "deletesesi"];
handler.help = ["delsesi", "clearsesi", "deletesesi"];
handler.tags = ["owner"];
handler.owner = true;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default handler;