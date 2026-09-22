import fs from 'node:fs';
import { manualDeleteSession } from '../../lib/sessionRecovery.js';

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    const target = (text || '').trim();

    // 1. Mode Targeted Identifier: .delsesi <identifier> (misal 59090864717979.0 atau 59090864717979)
    if (target && target.toLowerCase() !== 'all') {
        const result = await manualDeleteSession(target, conn.authState?.keys, './sessions');
        if (!result.success) {
            return m.reply(`❌ *Gagal menghapus sesi:* ${result.error}`);
        }
        
        let report = `*╭  〔 ⚡ ꜱ ɪ ɢ ɴ ᴀ ʟ  ꜱ ᴇ ꜱ ꜱ ɪ ᴏ ɴ  ꜰ ɪ x 〕*\n`;
        report += `> ⟡ *Target Identifier* : \`${target}\`\n`;
        report += `> ⟡ *Sesi Dihapus* : \n`;
        for (const f of result.filesRemoved) {
            report += `>   • ${f}\n`;
        }
        report += `> \n`;
        report += `> ⟡ *Status* : ✅ Sesi berhasil di-reset!\n`;
        report += `> _Bot akan otomatis melakukan handshake kunci baru saat ada pesan masuk dari nomor tersebut._\n`;
        report += `*╰───────────────*`;
        
        return m.reply(report.trim());
    }

    // 2. Mode Panduan jika tanpa argumen
    if (!target) {
        let helpText = `*╭  〔 🛠️ ᴘ ᴀ ɴ ᴅ ᴜ ᴀ ɴ  ᴅ ᴇ ʟ ꜱ ᴇ ꜱ ɪ 〕*\n`;
        helpText += `> ⟡ *Hapus Sesi Spesifik (Aman)*:\n`;
        helpText += `> • *${usedPrefix + command} <identifier>*\n`;
        helpText += `>   _Contoh: ${usedPrefix + command} 59090864717979.0_\n`;
        helpText += `>   _Contoh: ${usedPrefix + command} 59090864717979_\n\n`;
        helpText += `> ⟡ *Bersihkan Seluruh Cache Sesi (Tanpa logout)*:\n`;
        helpText += `> • *${usedPrefix + command} all*\n`;
        helpText += `>   _Menghapus file cache session & pre-key tanpa menyentuh creds.json._\n`;
        helpText += `*╰───────────────*`;
        return m.reply(helpText.trim());
    }

    // 3. Mode Bulk: .delsesi all
    const ootaedit = await conn.sendMessage(m.chat, {
        text: "Wait.... Memeriksa sesi untuk dibersihkan..."
    }, {
        quoted: m
    });

    fs.readdir(`./sessions`, async function(err, files) {
        if (err) {
            console.log('Unable to scan directory: ' + err);
            return m.reply('Unable to scan directory: ' + err);
        }
        
        // Safety: Pastikan creds.json TIDAK PERNAH masuk dalam filteredArray
        let filteredArray = files.filter(item => 
            !item.includes('creds') && (
                item.startsWith("pre-key") ||
                item.startsWith("sender-key") || 
                item.startsWith("session-") || 
                item.startsWith("app-state")
            )
        );

        console.log(`Menghapus ${filteredArray.length} file sesi...`);
        let teks = `*– 乂 Sessions - Akan Di Delete*\n\nTotal: ${filteredArray.length} file cache (creds.json aman).`;
        
        if (filteredArray.length == 0) return conn.sendMessage(m.chat, {
            text: `${teks}\n\nTidak ada file cache yang perlu dihapus.`,
            edit: ootaedit.key
        }, {
            quoted: m
        });
        
        await conn.sendMessage(m.chat, {
            text: `🖐️ Wait... Menghapus ${filteredArray.length} file cache sesi!!`,
            edit: ootaedit.key
        }, {
            quoted: m
        });
        
        let deleted = 0;
        for (const file of filteredArray) {
            try {
                fs.unlinkSync(`./sessions/${file}`);
                deleted++;
            } catch (e) {
                console.error(`Gagal menghapus file ${file}:`, e);
            }
        }
        
        await sleep(1000);
        
        await conn.sendMessage(m.chat, {
            text: `✅ Sukses menghapus ${deleted} file cache sesi!\n*creds.json tetap aman.*\n*Bot akan restart otomatis untuk refresh memory.*`,
            edit: ootaedit.key
        }, {
            quoted: m
        });

        if (global.db && global.db.data) {
            await global.db.write().catch(err => console.error('[CLEARSESI DB WRITE ERROR]', err));
        }

        if (process.send) {
            process.send('reset');
        }
    });
};

handler.command = ["delsesi", "clearsesi", "deletesesi"];
handler.help = ["delsesi <identifier>", "delsesi all"];
handler.tags = ["owner"];
handler.owner = true;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default handler;