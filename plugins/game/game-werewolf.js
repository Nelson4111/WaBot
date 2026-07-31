import jimp from 'jimp'
import {
    emoji_role,
    sesi,
    playerOnGame,
    playerOnRoom,
    playerExit,
    dataPlayer,
    dataPlayerById,
    getPlayerById,
    getPlayerById2,
    killWerewolf,
    killww,
    dreamySeer,
    sorcerer,
    protectGuardian,
    roleShuffle,
    roleChanger,
    roleAmount,
    roleGenerator,
    addTimer,
    startGame,
    playerHidup,
    playerMati,
    vote,
    voteResult,
    clearAllVote,
    getWinner,
    win,
    pagi,
    malam,
    skill,
    voteStart,
    voteDone,
    voting,
    run,
    run_vote,
    run_malam,
    run_pagi
} from '../../lib/werewolf.js'

const resize = async (image, width, height) => {
    const read = await jimp.read(image);
    const data = await read.resize(width, height).getBufferAsync(jimp.MIME_JPEG);
    return data;
};

let thumb = "https://user-images.githubusercontent.com/72728486/235316834-f9f84ba0-8df3-4444-81d8-db5270995e6d.jpg";

let handler = async (m, { conn, command, usedPrefix, args }) => {
    const { sender, chat } = m;
    conn.werewolf = conn.werewolf ? conn.werewolf : {};
    const ww = conn.werewolf;
    const value = args[0];
    const target = args[1];

    if (value === "create") {
        if (chat in ww) return m.reply("Group masih dalam sesi permainan");
        if (playerOnGame(sender, ww) === true) return m.reply("Kamu masih dalam sesi game");
        ww[chat] = {
            room: chat,
            owner: sender,
            status: false,
            iswin: null,
            cooldown: null,
            day: 0,
            time: "malem",
            player: [],
            dead: [],
            voting: false,
            seer: false,
            guardian: [],
        };
        await m.reply("Room berhasil dibuat, ketik *.ww join* untuk bergabung");

    } else if (value === "join") {
        if (!ww[chat]) return m.reply("Belum ada sesi permainan");
        if (ww[chat].status === true) return m.reply("Sesi permainan sudah dimulai");
        if (ww[chat].player.length >= 15) return m.reply("Maaf jumlah player telah penuh");
        if (playerOnRoom(sender, chat, ww) === true) return m.reply("Kamu sudah join dalam room ini");
        if (playerOnGame(sender, ww) === true) return m.reply("Kamu masih dalam sesi game");
        
        let dataPlayerBaru = {
            id: sender,
            number: ww[chat].player.length + 1,
            sesi: chat,
            status: false,
            role: false,
            effect: [],
            vote: 0,
            isdead: false,
            isvote: false,
        };
        ww[chat].player.push(dataPlayerBaru);
        
        let jids = ww[chat].player.map(p => p.id);
        let text = `\n*⌂ W E R E W O L F - P L A Y E R*\n\n`;
        ww[chat].player.forEach(p => {
            text += `${p.number}) @${p.id.replace("@s.whatsapp.net", "")}\n`;
        });
        text += "\nJumlah player minimal adalah 5 dan maximal 15";
        
        conn.sendMessage(m.chat, {
            text: text.trim(),
            contextInfo: {
                mentionedJid: jids,
                externalAdReply: {
                    title: "W E R E W O L F",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnail: await resize(thumb, 300, 175),
                    sourceUrl: "",
                    mediaUrl: thumb,
                }
            }
        }, { quoted: m });

    } else if (value === "start") {
        if (!ww[chat]) return m.reply("Belum ada sesi permainan");
        if (ww[chat].player.length < 5) return m.reply("Maaf jumlah player belum memenuhi syarat (Minimal 5)");
        if (ww[chat].status === true) return m.reply("Sesi permainan telah dimulai");
        if (ww[chat].owner !== sender) return m.reply(`Hanya owner room (@${ww[chat].owner.split('@')[0]}) yang dapat memulai`);

        roleGenerator(chat, ww);
        addTimer(chat, ww);
        startGame(chat, ww);

        let list1 = "";
        let list2 = "";
        let allPlayers = ww[chat].player.map(p => p.id);

        ww[chat].player.forEach(p => {
            list1 += `(${p.number}) @${p.id.split('@')[0]}\n`;
            list2 += `(${p.number}) @${p.id.split('@')[0]} ${ (p.role === 'werewolf' || p.role === 'sorcerer') ? `[${p.role}]` : '' }\n`;
        });

        await m.reply("Pesta dimulai! Role sedang dikirim ke Private Chat masing-masing.");

        for (let p of ww[chat].player) {
            let roleText = "";
            let name = conn.getName(p.id);

            if (p.role === "werewolf") {
                roleText = `Hai ${name}, Kamu adalah *Werewolf* ${emoji_role("werewolf")}\n*LIST PLAYER*:\n${list2}\n\nKetik *.wwpc kill nomor*`;
            } else if (p.role === "warga") {
                roleText = `Hai ${name}, Peran kamu adalah *Warga Desa* ${emoji_role("warga")}\n*LIST PLAYER*:\n${list1}`;
            } else if (p.role === "seer") {
                roleText = `Hai ${name}, Kamu adalah *Penerawang* ${emoji_role("seer")}\n*LIST PLAYER*:\n${list1}\n\nKetik *.wwpc dreamy nomor*`;
            } else if (p.role === "guardian") {
                roleText = `Hai ${name}, Kamu adalah *Malaikat Pelindung* ${emoji_role("guardian")}\n*LIST PLAYER*:\n${list1}\n\nKetik *.wwpc deff nomor*`;
            } else if (p.role === "sorcerer") {
                roleText = `Hai ${name}, Kamu adalah *Penyihir* ${emoji_role("sorcerer")}\n*LIST PLAYER*:\n${list2}\n\nKetik *.wwpc sorcerer nomor*`;
            }

            if (roleText) {
                await conn.sendMessage(p.id, { text: roleText, mentions: allPlayers });
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        await run(conn, chat, ww);

    } else if (value === "vote") {
        if (!ww[chat] || ww[chat].status === false || ww[chat].time !== "voting") return m.reply("Sesi voting belum tersedia");
        if (playerOnRoom(sender, chat, ww) === false || dataPlayer(sender, ww).isdead) return m.reply("Kamu tidak bisa voting");
        if (!target || isNaN(target)) return m.reply("Masukan nomor player!");
        if (dataPlayer(sender, ww).isvote) return m.reply("Kamu sudah voting");

        let b = getPlayerById(chat, sender, parseInt(target), ww);
        if (!b || b.db.isdead) return m.reply("Player tidak valid atau sudah mati");

        vote(chat, parseInt(target), sender, ww);
        m.react('✅');

    } else if (value == "exit") {
        if (!ww[chat] || ww[chat].status) return m.reply("Tidak bisa keluar sekarang");
        playerExit(chat, sender, ww);
        m.reply("Berhasil keluar dari room");

    } else if (value === "delete") {
        if (!ww[chat] || ww[chat].owner !== sender) return m.reply("Hanya owner yang bisa hapus room");
        delete ww[chat];
        m.reply("Room berhasil dihapus");

    } else if (value === "player") {
        if (!ww[chat]) return m.reply("Tidak ada sesi permainan");
        let jids = ww[chat].player.map(p => p.id);
        let text = "\n*⌂ W E R E W O L F - G A M E*\n\nLIST PLAYER:\n";
        ww[chat].player.forEach(p => {
            text += `(${p.number}) @${p.id.split('@')[0]} ${p.isdead ? `☠️ [${p.role}]` : ""}\n`;
        });
        conn.sendMessage(m.chat, { text: text, contextInfo: { mentionedJid: jids } }, { quoted: m });

    } else {
        let text = `*⌂ W E R E W O L F - G A M E*\n\n• ww create\n• ww join\n• ww start\n• ww exit\n• ww delete\n• ww player`;
        m.reply(text);
    }
}

handler.help = ['werewolf'];
handler.tags = ['game'];
handler.command = ['ww','werewolf'];
handler.group = true;

export default handler;