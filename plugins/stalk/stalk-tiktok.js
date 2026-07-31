import axios from 'axios';
import * as cheerio from 'cheerio';

async function tiktokStalk(username) {
    try {
        const response = await axios.get(`https://www.tiktok.com/@${username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);
        const scriptData = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();
        
        if (!scriptData) return { error: 'Data tidak ditemukan' };
        
        const parsedData = JSON.parse(scriptData);
        const userDetail = parsedData.__DEFAULT_SCOPE__?.['webapp.user-detail'];

        if (!userDetail || userDetail.statusCode !== 0) {
            return { error: 'User tidak ditemukan' };
        }

        const userInfo = userDetail.userInfo?.user;
        const stats = userDetail.userInfo?.stats;

        return {
            username: userInfo?.uniqueId || null,
            nama: userInfo?.nickname || null,
            bio: userInfo?.signature || null,
            verifikasi: userInfo?.verified || false,
            totalfollowers: stats?.followerCount || 0,
            totalmengikuti: stats?.followingCount || 0,
            totaldisukai: stats?.heart || 0,
            totalvideo: stats?.videoCount || 0,
            avatar: userInfo?.avatarLarger || userInfo?.avatarMedium || null,
        };
    } catch (error) {
        return { error: 'Username tidak valid atau tidak ditemukan' };
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Harap masukkan username TikTok!');
    
    await conn.sendMessage(m.chat, { react: { text: "⏰", key: m.key } });
    
    const result = await tiktokStalk(text.replace('@', ''));

    if (result.error) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return m.reply(`❌ *Gagal:* ${result.error}\n\nPastikan username yang kamu masukkan benar dan tidak di-private.`);
    }

    const message = `📤 *T I K T O K - S T A L K*

👤 *Username*: ${result.username || '-'}
📛 *Nama*: ${result.nama || '-'}
📝 *Bio*: ${result.bio || '-'}
✅ *Terverifikasi*: ${result.verifikasi ? 'Ya' : 'Tidak'}

📊 *Statistik:*
👥 *Followers*: ${result.totalfollowers.toLocaleString()}
🏃 *Following*: ${result.totalmengikuti.toLocaleString()}
❤️ *Total Like*: ${result.totaldisukai.toLocaleString()}
🎬 *Total Video*: ${result.totalvideo.toLocaleString()}`;

    if (result.avatar) {
        await conn.sendMessage(m.chat, { image: { url: result.avatar }, caption: message }, { quoted: m });
    } else {
        await m.reply(message);
    }
    
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
};

handler.help = ['ttstalk <username>']
handler.tags = ["stalk"]
handler.command = /^(ttstalk)$/i;
handler.limit = true;

export default handler;