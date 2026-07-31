// Script by Pixxxry
// Custom Integration: GPT AI per-user session  
// Jangan hapus credit ini!

import axios from 'axios';

let handler = m => m;

// Simpan sessions ke global biar ga gampang hilang
if (!global.sessions) global.sessions = {};

handler.before = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat] || {};
    const userId = m.sender;

    // Enable AutoGPT → aktifkan mode, tapi JANGAN hapus memory
    if (/^\.enable autogpt/i.test(m.text)) {
        if (!global.sessions[userId]) global.sessions[userId] = [];
        chat.autogpt = true;
        return true;
    }

    // Disable AutoGPT → matikan mode, tapi JANGAN hapus memory  
    if (/^\.disable autogpt/i.test(m.text)) {
        chat.autogpt = false;
        return true;
    }

    // Clear memory manual (kalau mau reset)
    if (/^\.clear memory$/i.test(m.text)) {
        if (global.sessions[userId]) {
            global.sessions[userId] = [];
        }
        return true;
    }

    // Mode aktif dan user tidak dibanned
    if (chat.autogpt && !chat.isBanned) {
        if (!m.text) return;

        try {
            // Inisialisasi session user jika belum ada
            if (!global.sessions[userId]) global.sessions[userId] = [];

            // Simpan pesan user (maksimal 20 pesan terakhir)
            global.sessions[userId].push(`User: ${m.text}`);
            if (global.sessions[userId].length > 20) {
                global.sessions[userId] = global.sessions[userId].slice(-20);
            }

            // Efek autotyping
            await conn.sendPresenceUpdate('composing', m.chat);

            // BUILD PROMPT DENGAN PERSONALITY GEN Z
            let contextPrompt = '';
            const userSession = global.sessions[userId];
            
            if (userSession.length > 2) {
                const recentHistory = userSession.slice(-10).join('\n');
                contextPrompt = `Roleplay sebagai temen chat Gen Z yang chill. Personality: santai, ga neko-neko, responnya pendek tapi nyambung.

PERCAKAPAN SEBELUMNYA:
${recentHistory}

PESAN USER: ${m.text}

STYLE RESPONSE:
- Bahasa casual: gw, lu, anjir, wkwk, sih  
- Respons pendek, ga bertele-tele
- Emoji secukupnya, jangan berlebihan
- Boleh sarkas dikit, tapi jangan kasar
- Ingat context chat sebelumnya
- JANGAN kayak robot formal
- JANGAN pake kata-kata alay kayak baper, gemoy, uhuy
- JANGAN lebay pake emoji

CONTOH:
User: lagi apa?
Response: Lagi scroll tiktok wkwk, lu?

User: bantuin dong  
Response: Gas, butuh apa?

User: cape banget hari ini
Response: Sama gw juga, kerjaan numpuk anjir

SEKARANG RESPON: ${m.text}`;
            } else {
                contextPrompt = `Roleplay sebagai temen chat yang chill. Personality: santai, ga neko-neko.

PESAN USER: ${m.text}

ATURAN:
- Pake bahasa sehari-hari kayak chat WA beneran
- Respons pendek dan langsung ke inti  
- Emoji secukupnya, jangan berlebihan
- Jangan kayak robot formal
- Jangan pake bahasa alay

CONTOH:
User: halo
Response: Yo, ada apa?

User: gimana kabar?
Response: Lagi santai, lu gimana?

User: bantu aku dong
Response: Oke, butuh apa?

RESPON SEKARANG: ${m.text}`;
            }

            console.log(`[MEMORY] ${userId}: ${userSession.length} messages`);

            // Request ke API Veloria
            const { data } = await axios.get(`https://www.veloria.my.id/ai/gpt?prompt=${encodeURIComponent(contextPrompt)}`);

            // Extract response
            let replyText;
            if (data && data.result) {
                replyText = data.result.toString().trim();
            } else if (data && data.response) {
                replyText = data.response.toString().trim();
            } else if (typeof data === 'string') {
                replyText = data.trim();
            } else {
                replyText = 'Yo, ada yang bisa gw bantu?';
            }

            // HAPUS "AI:" dari response jika ada
            replyText = replyText.replace(/^AI:\s*/i, '').replace(/^Bot:\s*/i, '').trim();

            // BIKIN LEBIH CASUAL
            replyText = replyText
                .replace(/saya/g, 'gw')
                .replace(/Saya/g, 'Gw')
                .replace(/anda/g, 'lu')
                .replace(/Anda/g, 'Lu')
                .replace(/kamu/g, 'lu')
                .replace(/Kamu/g, 'Lu')
                .replace(/wahai/g, '')
                .replace(/dengan senang hati/g, 'oke')
                .replace(/sangat/g, '')
                .replace(/sekali/g, '');

            // HAPUS TANDA KUTIP JIKA ADA
            replyText = replyText.replace(/^"|"$/g, '').trim();

            // Simpan balasan AI ke session user
            global.sessions[userId].push(`AI: ${replyText}`);
            if (global.sessions[userId].length > 20) {
                global.sessions[userId] = global.sessions[userId].slice(-20);
            }

            // Hentikan efek typing
            await conn.sendPresenceUpdate('paused', m.chat);

            // Kirim balasan ke user
            await conn.sendMessage(m.chat, { 
                text: replyText
            }, { quoted: m });

        } catch (e) {
            console.error('AutoGPT Error:', e.message);
            await m.reply('Lagi error nih, coba lagi ya.');
        }

        return true;
    }

    return true;
};

export default handler;