const toSmallNum = (str) => {
    const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' };
    return String(str).replace(/[0-9]/g, d => map[d] || d);
};

function formatDuration(ms) {
    let seconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const result = [];
    if (days) result.push(`${toSmallNum(days)} Hari`);
    if (hours) result.push(`${toSmallNum(hours)} Jam`);
    if (minutes) result.push(`${toSmallNum(minutes)} Menit`);
    if (seconds) result.push(`${toSmallNum(seconds)} Detik`);

    return result.join(' ') || 'beberapa detik';
}

let handler = async (m, { conn, groupMetadata }) => {
    if (!m.isGroup) return m.reply('Perintah ini hanya bisa digunakan di grup.');

    const users = global.db?.data?.users || {};
    const participants = groupMetadata?.participants || [];
    const afkMembers = [];

    for (const participant of participants) {
        if (!participant?.id) continue;
        const jid = conn.decodeJid ? conn.decodeJid(participant.id) : participant.id;
        const user = users[jid];
        if (!user || !(user.afk > -1)) continue;

        const name = participant.notify || jid.split('@')[0];
        const reason = user.afkReason || 'Tanpa Alasan';
        const duration = formatDuration(Date.now() - user.afk);
        afkMembers.push({ jid, name, reason, duration });
    }

    if (!afkMembers.length) {
        return m.reply('> Tidak ada member yang sedang AFK di grup ini.');
    }

    const list = afkMembers.map((member, index) =>
        `*${index + 1}.* @${member.jid.split('@')[0]}\n` +
        `   ⧗ Durasi: *${member.duration}*\n` +
        `   ✧ Alasan: _${member.reason}_`
    ).join('\n\n');

    const caption = `*──  ୨୧ ✧ ʟɪꜱᴛ ᴀꜰᴋ ✧ ୨୧  ──*\n\n${list}`;
    await conn.sendMessage(m.chat, {
        text: caption,
        mentions: afkMembers.map(member => member.jid)
    }, { quoted: m });
};

handler.help = ['listafk'];
handler.tags = ['main'];
handler.command = /^listafk$/i;
handler.group = true;

export default handler;
