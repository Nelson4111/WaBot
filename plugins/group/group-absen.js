import fs from 'fs'
import path from 'path'

const databasePath = path.join(process.cwd(), 'lib/database/absen.json')

const readDB = () => {
    if (!fs.existsSync(databasePath)) return {}
    try {
        return JSON.parse(fs.readFileSync(databasePath, 'utf-8'))
    } catch {
        return {}
    }
}

const writeDB = (data) => {
    const dir = path.dirname(databasePath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(databasePath, JSON.stringify(data, null, 2))
}

const getTodayWIB = () => {
    return new Date().toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", day: '2-digit', month: 'long', year: 'numeric' })
}

const getTimeWIB = () => {
    return new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: '2-digit', minute: '2-digit' }).replace('.', ':')
}

const STATUS_MAP = {
    '1': 'HADIR',
    '2': 'SAKIT',
    '3': 'IZIN',
    '4': 'ALPHA',
    'HADIR': 'HADIR',
    'SAKIT': 'SAKIT',
    'IZIN': 'IZIN',
    'ALPHA': 'ALPHA'
}

const STATUS_ICONS = {
    'HADIR': '✅ HADIR',
    'SAKIT': '🤒 SAKIT',
    'IZIN': '📩 IZIN',
    'ALPHA': '❌ ALPHA'
}

let handler = async (m, { conn, usedPrefix, command, text, isAdmin, isOwner }) => {
    let db = readDB()
    let id = m.chat
    let today = getTodayWIB()

    if (db[id] && db[id].date !== today) {
        delete db[id]
        writeDB(db)
    }

    let inputCmd = command.toLowerCase()
    let cleanText = (text || '').trim().toUpperCase()

    // 1. Menghapus Data Absen Hari Ini
    if (inputCmd === 'hapusabsen') {
        if (!isAdmin && !isOwner) return m.reply('❌ Hanya Admin yang dapat menghapus data absen.');
        if (!db[id]) return m.reply('Tidak ada data absen untuk dihapus.');
        delete db[id];
        writeDB(db);
        return m.reply('✅ Data absen hari ini berhasil dihapus.');
    }

    // 2. Mengecek Rekapitulasi Absen Hari Ini
    if (inputCmd === 'cekabsen' || inputCmd === 'rekapabsen') {
        if (!db[id]) return m.reply(`Belum ada data absen hari ini.\nAdmin bisa memulai dengan ketik *${usedPrefix}mulaiabsen <judul>*.`);

        let pesertaList = db[id].peserta || [];
        let listC = pesertaList.map((v, i) => {
            let num = (i + 1).toString().padStart(2, '0');
            let icon = STATUS_ICONS[v.status] || `[${v.status}]`;
            return `${num}. @${v.id.split('@')[0]} - ${icon} (Jam ${v.waktu})`;
        }).join('\n');

        let res = `📋 *REKAPITULASI KEHADIRAN GRUP*\n\n`;
        res += `📌 *Judul:* ${db[id].keterangan}\n`;
        res += `📅 *Tanggal:* ${db[id].date}\n\n`;
        res += `${listC || '_(Belum ada peserta yang mengisi)_'}\n\n`;
        res += `📊 *Total Terabsen:* ${pesertaList.length} Anggota`;

        return conn.sendMessage(m.chat, {
            text: res,
            mentions: pesertaList.map(p => p.id)
        }, { quoted: m });
    }

    // 3. Memulai Sesi Absen Baru (Khusus Admin)
    let isCreatingNewSession = false;
    if (inputCmd === 'mulaiabsen') {
        isCreatingNewSession = true;
    } else if (inputCmd === 'absen' && (isAdmin || isOwner)) {
        if (cleanText && !['1', '2', '3', '4', 'HADIR', 'SAKIT', 'IZIN', 'ALPHA'].includes(cleanText)) {
            isCreatingNewSession = true;
        }
    }

    if (isCreatingNewSession) {
        if (!isAdmin && !isOwner) return m.reply('❌ Hanya *Admin Grup* yang dapat memulai sesi absen baru!');

        let keterangan = text || 'Absen Kehadiran Anggota Grup';
        let annText = `📢 *PENGUMUMAN ABSEN GRUP*\n\n📌 *Judul:* ${keterangan}\n📅 *Tanggal:* ${today}\n👑 *Oleh Admin:* @${m.sender.split('@')[0]}\n\n*SILAKAN PILIH STATUS KEHADIRAN ANDA:*\n1. ✅ *HADIR* (Balas pesan ini dengan angka *1* atau ketik *.hadir*)\n2. 🤒 *SAKIT* (Balas pesan ini dengan angka *2* atau ketik *.sakit*)\n3. 📩 *IZIN* (Balas pesan ini dengan angka *3* atau ketik *.izin*)\n4. ❌ *ALPHA* (Balas pesan ini dengan angka *4* atau ketik *.alpha*)\n\n_Ketik *.cekabsen* untuk melihat rekapitulasi._`;

        let msg = await conn.sendMessage(m.chat, {
            text: annText,
            mentions: [m.sender]
        }, { quoted: m });

        db[id] = {
            date: today,
            keterangan: keterangan,
            annMsgId: msg?.key?.id || '',
            peserta: []
        };
        writeDB(db);
        return;
    }

    // 4. Mengisi Absen via Perintah Teks (.absen 1 / .hadir / .sakit / .izin / .alpha)
    if (!db[id]) {
        return m.reply(`❌ Sesi absen hari ini belum dibuka.\nAdmin dapat membuka sesi baru dengan ketik *${usedPrefix}mulaiabsen <judul>*.`);
    }

    let selectedStatus = STATUS_MAP[inputCmd.toUpperCase()] || STATUS_MAP[cleanText] || 'HADIR';

    if (!db[id].peserta) db[id].peserta = [];
    let existingIndex = db[id].peserta.findIndex(p => p.id === m.sender);
    if (existingIndex > -1) {
        db[id].peserta[existingIndex].status = selectedStatus;
        db[id].peserta[existingIndex].waktu = getTimeWIB();
    } else {
        db[id].peserta.push({
            id: m.sender,
            waktu: getTimeWIB(),
            status: selectedStatus
        });
    }
    writeDB(db);

    let icon = STATUS_ICONS[selectedStatus] || selectedStatus;
    return conn.sendMessage(m.chat, {
        text: `✅ *ABSEN TERCATAT*\n\n• Nama: @${m.sender.split('@')[0]}\n• Waktu: ${getTimeWIB()}\n• Status: ${icon}\n\nKetik *${usedPrefix}cekabsen* untuk melihat rekapitulasi.`,
        mentions: [m.sender]
    }, { quoted: m });
}

handler.all = async function (m) {
    if (!m.isGroup || !m.text || m.isBaileys) return;

    let db = readDB();
    let id = m.chat;
    if (!db[id]) return;

    let conn = this;
    let textClean = m.text.trim().toLowerCase();
    let selectedStatus = null;

    // Deteksi jika user mereply (balas) pesan pengumuman absen dengan angka 1, 2, 3, 4 atau kata status
    if (m.quoted && db[id].annMsgId && m.quoted.id === db[id].annMsgId) {
        if (['1', 'hadir'].includes(textClean)) selectedStatus = 'HADIR';
        else if (['2', 'sakit'].includes(textClean)) selectedStatus = 'SAKIT';
        else if (['3', 'izin'].includes(textClean)) selectedStatus = 'IZIN';
        else if (['4', 'alpha'].includes(textClean)) selectedStatus = 'ALPHA';
    }

    // Deteksi jika user membalas pesan absen tanpa prefix
    if (!selectedStatus && m.quoted) {
        if (['1', 'hadir'].includes(textClean)) selectedStatus = 'HADIR';
        else if (['2', 'sakit'].includes(textClean)) selectedStatus = 'SAKIT';
        else if (['3', 'izin'].includes(textClean)) selectedStatus = 'IZIN';
        else if (['4', 'alpha'].includes(textClean)) selectedStatus = 'ALPHA';
    }

    if (selectedStatus) {
        let voterJidClean = conn.decodeJid(m.sender);
        if (!db[id].peserta) db[id].peserta = [];
        
        let existingIndex = db[id].peserta.findIndex(p => p.id === voterJidClean);
        if (existingIndex > -1) {
            db[id].peserta[existingIndex].status = selectedStatus;
            db[id].peserta[existingIndex].waktu = getTimeWIB();
        } else {
            db[id].peserta.push({
                id: voterJidClean,
                waktu: getTimeWIB(),
                status: selectedStatus
            });
        }
        writeDB(db);

        let icon = STATUS_ICONS[selectedStatus] || selectedStatus;
        await conn.sendMessage(m.chat, {
            text: `✅ *ABSEN TERCATAT*\n\n• Nama: @${voterJidClean.split('@')[0]}\n• Waktu: ${getTimeWIB()}\n• Status: ${icon}\n\nKetik *.cekabsen* untuk melihat rekapitulasi.`,
            mentions: [voterJidClean]
        }, { quoted: m }).catch(() => {});
    }
}

handler.help = ['mulaiabsen <judul>', 'absen <status>', 'cekabsen', 'hapusabsen', 'hadir', 'sakit', 'izin', 'alpha']
handler.tags = ['group']
handler.command = /^(absen|mulaiabsen|cekabsen|rekapabsen|hapusabsen|hadir|sakit|izin|alpha)$/i
handler.group = true

export default handler