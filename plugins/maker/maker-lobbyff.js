import fetch from 'node-fetch'
import fs from 'fs'
import { exec } from 'child_process'

// `ғɪᴛᴜʀ ʟᴏʙʏғғ - ᴛᴇᴍᴘʟᴀᴛᴇ ᴍᴀᴋᴇʀ`
//
// sᴜᴍʙᴇʀ:
// https://whatsapp.com/channel/0029VbBTTWK6GcGDqy6QkX0X
// ᴊᴀɴɢᴀɴ ʟᴜᴘᴀ ғᴏʟʟᴏᴡ!
// (ʀɪᴍ - ɴᴏᴠᴀ ᴍᴅ)

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const args_ff = text.split('|');
    if (args_ff.length < 2) return conn.sendMessage(m.chat, { text: `Format: ${usedPrefix + command} 1-4|Name\nExample: ${usedPrefix + command} 1|Jagoan FF` }, { quoted: m });

    const num = args_ff[0].trim();
    const name = args_ff[1].trim();

    if (isNaN(num) || num > 4 || num < 1) return conn.sendMessage(m.chat, { text: 'Template not found! Please choose between 1-4.' }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        const imageUrls = {
            1: 'https://cloud-fukushima.vercel.app/uploader/8fjhd6ftps.jpg',
            2: 'https://cloud-fukushima.vercel.app/uploader/oz8hb4ow75.jpg',
            3: 'https://cloud-fukushima.vercel.app/uploader/tvz1cie8df.jpg',
            4: 'https://cloud-fukushima.vercel.app/uploader/yo9sg4vmo3.jpg'
        };

        const imageUrl = imageUrls[num];
        const tempImagePath = `./temp_lobby_${Date.now()}.jpg`;
        const outputPath = `./temp_ff_${Date.now()}.jpg`;
        const fontPath = `./TeutonNormal.otf`;

        const response = await fetch(imageUrl);
        const buffer = await response.buffer();
        fs.writeFileSync(tempImagePath, buffer);

        let fontSize;
        if (name.length <= 6) fontSize = 'w*0.055';
        else if (name.length <= 10) fontSize = 'w*0.045';
        else if (name.length <= 15) fontSize = 'w*0.038';
        else fontSize = 'w*0.030';

        const ffCmd = `ffmpeg -i "${tempImagePath}" -vf "drawtext=fontfile='${fontPath}':text='${name}':x=((w-text_w)/2)+(w*0.02):y=h*0.80-(text_h/2):fontsize=${fontSize}:fontcolor=yellow:shadowcolor=black:shadowx=3:shadowy=3" "${outputPath}"`;

        exec(ffCmd, async (err) => {
            if (err) {
                console.error(err);
                if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
                return conn.sendMessage(m.chat, { text: 'Failed to process image. Check FFMPEG/Font.' });
            }

            await conn.sendMessage(m.chat, {
                image: fs.readFileSync(outputPath),
                caption: `✅ *FREE FIRE LOBBY CUSTOM*\n👤 Name: ${name.toUpperCase()}\n🖼 Template: No. ${num}`
            }, { quoted: m });

            if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        });

    } catch (e) {
        console.error(e);
        conn.sendMessage(m.chat, { text: 'Internal Server Error!' });
    }
}

handler.help = ['lobbyff']
handler.tags = ['maker']
handler.command = /^(lobbyff|lobyff)$/i

export default handler