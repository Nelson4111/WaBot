import jimp from 'jimp'
import { generateWAMessageContent } from '@whiskeysockets/baileys'
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
    run_pagi,
    generateVoteCodeMap,
    resolveSecretCodeAction,
    getNightProgress,
    resolveNightActions
} from '../../lib/werewolf.js'
import { sendDualGroupMessage } from '../../lib/dual-group-message.js'

let thumb = "https://user-images.githubusercontent.com/72728486/235316834-f9f84ba0-8df3-4444-81d8-db5270995e6d.jpg";

const formatCodeList = (room, player) => {
    if (!room || !player || !player.secretCodes) return "-";
    const entries = Object.entries(player.secretCodes).slice(0, 4);
    if (!entries.length) return "-";
    return entries.map(([code, choice]) => {
        if (choice.type === "dummy") {
            return `\`${code}\` → ${choice.label}`;
        }
        if (choice.type === "check" || choice.type === "kill" || choice.type === "guard" || choice.type === "poison" || choice.type === "revive" || choice.type === "hunter") {
            const target = room.player.find(p => p.number === choice.targetNumber);
            const targetLabel = target ? `@${target.id.split('@')[0]}` : `#${choice.targetNumber}`;
            return `\`${code}\` → ${targetLabel}`;
        }
        return `\`${code}\` → ${choice.label || 'Pilihan'}`;
    }).join('\n');
};

const sendWerewolfRole = async (conn, groupJid, targetJid, content, attempts = 3) => {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            const playerMessage = await generateWAMessageContent(content, { upload: conn.waUploadToServer });
            const targetTag = `@${targetJid.split('@')[0]}`;
            const spectatorText = `> 🔒 _[Role rahasia tersembunyi untuk ${targetTag}]_`;
            await sendDualGroupMessage(conn, groupJid, targetJid, playerMessage, spectatorText, {
                contextInfo: {
                    mentionedJid: [targetJid]
                }
            });
            return true;
        } catch (error) {
            if (attempt === attempts) {
                console.error(`[werewolf] failed to send role to ${targetJid}: ${error?.message || error}`);
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        }
    }
};

const normalizePhone = (value = '') => {
    const cleaned = String(value || '').replace(/[^0-9]/g, '');
    return cleaned;
};

const hasRpgPanelAccess = (sender = '') => {
    const senderPhone = normalizePhone(sender);
    const senderJid = String(sender || '').toLowerCase();
    const ownerList = Array.isArray(global.owner) ? global.owner : [];
    const hasOwnerAccess = ownerList.some((entry) => {
        const ownerId = Array.isArray(entry) ? entry[0] : entry;
        const ownerPhone = normalizePhone(ownerId);
        return ownerPhone === senderPhone || String(ownerId).toLowerCase() === senderJid || (senderPhone && ownerPhone && senderPhone.endsWith(ownerPhone));
    });
    if (hasOwnerAccess) return true;

    const coOwner = global.db?.data?.users?.[sender]?.isCoOwner || global.db?.data?.users?.[String(sender).replace(/@s\.whatsapp\.net$/, '') + '@s.whatsapp.net']?.isCoOwner || false;
    if (coOwner) return true;

    const accessList = global.rpgPanelUsers || global.rpgPanelVoiceAccess || [];
    if (Array.isArray(accessList)) {
        return accessList.some((item) => normalizePhone(item) === senderPhone || String(item).toLowerCase() === senderJid);
    }
    if (accessList && typeof accessList === 'object') {
        return Object.keys(accessList).some((key) => normalizePhone(key) === senderPhone || String(key).toLowerCase() === senderJid);
    }
    return false;
};

const getNightProgressState = (room) => {
    if (!room || !Array.isArray(room.player)) return { done: 0, total: 0, completed: false };
    const alivePlayers = room.player.filter((player) => !player.isdead && !player.isDummy);
    const total = alivePlayers.length;
    const done = alivePlayers.filter((player) => player.nightDone === true).length;
    return { done, total, completed: total > 0 && done >= total };
};

const announceNightProgress = async (conn, room, chat) => {
    if (!room || !chat) return;
    const progress = getNightProgressState(room);
    if (!progress.total) return;
    if (progress.completed) {
        await conn.sendMessage(chat, {
            text: `🌙 *SEMUA PEMAIN TELAH MELAKUKAN AKSI*\n\nMemproses kejadian malam...\n\n${progress.done}/${progress.total} pemain selesai.`
        });
        room.time = 'pagi';
        room.player.forEach((player) => {
            player.nightDone = false;
        });
        return;
    }
    await conn.sendMessage(chat, {
        text: `🌙 *${progress.done}/${progress.total} PEMAIN SELESAI*\n\nMalam belum diproses.\nSemua pemain hidup wajib mengirim aksi sebelum malam berakhir.`
    });
};

const buildActionPrivateReply = (room, sender, result) => {
    if (!room || !sender) return '✅ Aksi malam kamu telah diterima.';
    const player = room.player.find((entry) => entry.id === sender);
    if (!player) return '✅ Aksi malam kamu telah diterima.';
    const target = result?.targetNumber ? room.player.find((entry) => entry.number === result.targetNumber) : null;
    const targetTag = target ? `@${target.id.split('@')[0]}` : 'target tertentu';
    const role = validRoleName(player.role) || 'warga';
    const targetRoleName = validRoleName(target?.role) || '—';

    if (role === 'werewolf') {
        if (result?.action === 'skip' || result?.choices?.type === 'skip') return `🐺 *Werewolf*\n\nKamu memilih untuk tidak membunuh malam ini.`;
        return `🐺 *Werewolf*\n\nKamu menargetkan ${targetTag} untuk dibunuh malam ini.`;
    }

    if (role === 'seer') {
        if (result?.action === 'skip' || result?.choices?.type === 'skip') return `🔮 *Seer*\n\nKamu memilih untuk menunda pemeriksaan malam ini.`;
        return `🔮 *Seer*\n\nKamu memeriksa ${targetTag}.\nRole target: *${targetRoleName}*`;
    }

    if (role === 'guardian') {
        if (result?.action === 'skip' || result?.choices?.type === 'skip') return `🛡️ *Guardian*\n\nKamu memilih tidak melindungi siapa pun malam ini.`;
        return `🛡️ *Guardian*\n\nKamu melindungi ${targetTag} malam ini.`;
    }

    if (role === 'sorcerer') {
        if (result?.action === 'skip' || result?.choices?.type === 'skip') return `🔮 *Penyihir*\n\nKamu memilih tidak menggunakan racun atau revive malam ini.`;
        if (result?.action === 'revive') return `🔮 *Penyihir*\n\nKamu memilih menghidupkan kembali ${targetTag}.`;
        return `🔮 *Penyihir*\n\nKamu meracuni ${targetTag}.`;
    }

    if (role === 'hunter' && result?.targetNumber) return `🏹 *Hunter*\n\nKamu menyiapkan tembakan untuk ${targetTag}.`;
    if (role === 'mayor') return `👑 *Mayor*\n\nAksi malam kamu tercatat.`;
    if (role === 'jester') return `🃏 *Jester*\n\nAksi malam kamu tercatat.`;
    if (role === 'blacksmith') return `⚒️ *Blacksmith*\n\nAksi malam kamu tercatat.`;

    return `✅ *Aksi malam kamu telah masuk.*`;
};

const sendTargetedActionReply = async (conn, chat, sender, room, result) => {
    if (!conn || !chat || !sender) return;
    const privateText = buildActionPrivateReply(room, sender, result);
    const spectatorText = `> 🔒 _[Aksi malam dari @${sender.split('@')[0]} sudah diproses]_`;
    await sendDualGroupMessage(conn, chat, sender, {
        text: privateText,
        mentions: [sender]
    }, spectatorText, {
        contextInfo: {
            mentionedJid: [sender]
        }
    });
};

const deadPlayerNotice = "Kamu sudah mati, tidak diperbolehkan mengetik aksi/command untuk menjaga kelancaran permainan. Silakan tunggu ronde berikutnya atau menunggu hasil akhir game.";
const validRoleName = (value) => {
    const role = String(value || '').toLowerCase();
    return ['werewolf', 'warga', 'seer', 'guardian', 'sorcerer', 'hunter', 'mayor', 'jester', 'blacksmith'].includes(role) ? role : null;
};

const getRealPlayerCount = (room) => {
    if (!room || !Array.isArray(room.player)) return 0;
    return room.player.filter((player) => !player?.isDummy).length;
};

const createWargaPlayer = (room, order) => ({
    id: `warga-${String(room?.room || 'room')}-${order}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@dummy`,
    number: order,
    sesi: room?.room || '',
    status: false,
    role: 'warga',
    effect: [],
    vote: 0,
    isdead: false,
    isvote: false,
    isDummy: true,
    displayName: `Warga ${order}`
});

const getDisplayPlayerLabel = (player) => {
    if (!player) return '—';
    if (player.isDummy) return `Warga ${player.number}`;
    return `@${player.id.replace('@s.whatsapp.net', '')}`;
};

let handler = async (m, { conn, command, usedPrefix, args }) => {
    const { sender, chat } = m;
    conn.werewolf = conn.werewolf ? conn.werewolf : {};
    const ww = conn.werewolf;
    let value = args[0];
    const target = args[1];
    const normalizedValue = String(value || "").toLowerCase();
    const isSecretCode = /^[A-Z0-9]{4,5}$/i.test(String(value || ""));
    const currentRoomPlayer = ww[chat]?.player?.find((player) => player.id === sender) || null;
    const isDeadInRoom = !!(currentRoomPlayer && currentRoomPlayer.isdead);
    const allowedDeadCommands = ["delete", "info", "role", "player", "create", "join", "start", "exit"];

    conn.werewolfTest = conn.werewolfTest || {};
    const testState = conn.werewolfTest[chat];
    if (normalizedValue === "test") {
        if (!hasRpgPanelAccess(sender)) return m.reply("Command test hanya bisa digunakan owner.");
        if (ww[chat]) return m.reply("Group masih dalam sesi permainan");
        const testPlayers = [sender, ...[2, 3, 4, 5].map((number) => `ww-test-${number}@s.whatsapp.net`)];
        ww[chat] = {
            room: chat, owner: sender, status: false, iswin: null, cooldown: null,
            day: 0, time: "malem", player: testPlayers.map((id, index) => ({
                id, number: index + 1, sesi: chat, status: false, role: false,
                effect: [], vote: 0, isdead: false, isvote: false
            })), dead: [], voting: false, seer: false, guardian: [], testMode: true
        };
        conn.werewolfTest[chat] = {
            owner: sender,
            phase: "night"
        };
        value = "start";
    }

    if (testState && testState.owner === sender) {
        if (!ww[chat]) delete conn.werewolfTest[chat];
    }

    if (isDeadInRoom && normalizedValue && !allowedDeadCommands.includes(normalizedValue) && !(ww[chat] && ww[chat].status && isSecretCode)) {
        if (!currentRoomPlayer.deathNoticeSent) {
            currentRoomPlayer.deathNoticeSent = true;
            await conn.sendMessage(sender, { text: deadPlayerNotice });
        }
        return m.reply(deadPlayerNotice);
    }

    if (ww[chat] && ww[chat].status && isSecretCode && !["create", "join", "start", "vote", "exit", "delete", "player", "info", "role"].includes(normalizedValue)) {
        const phase = ww[chat].time === "voting" ? "vote" : "night";
        const result = resolveSecretCodeAction(chat, sender, value, ww, phase);
        if (result.ok) {
            m.react('✅');
            if (phase === "vote") {
                await sendTargetedActionReply(conn, chat, sender, ww[chat], result);
            } else {
                await sendTargetedActionReply(conn, chat, sender, ww[chat], result);
                if (ww[chat].testMode) {
                    ww[chat].player.filter((player) => player.id !== sender).forEach((player) => {
                        player.nightDone = true;
                        player.lastNightAction = { type: "skip", label: "Simulasi" };
                    });
                    ww[chat].nightTarget = null;
                }
                const progress = getNightProgress(ww[chat]);
                if (progress.completed) {
                    resolveNightActions(chat, ww);
                    await conn.sendMessage(chat, {
                        text: `🌙 *SEMUA PEMAIN TELAH MELAKUKAN AKSI*\n\nMemproses kejadian malam...\n\n${progress.done}/${progress.total} pemain selesai.`
                    });
                    ww[chat].time = 'pagi';
                    ww[chat].player.forEach((player) => {
                        player.nightDone = false;
                    });
                    if (ww[chat].testMode) {
                        conn.werewolfTest[chat].phase = "voting";
                        await voting(conn, ww[chat], ww);
                    }
                } else {
                    await conn.sendMessage(chat, {
                        text: `🌙 *${progress.done}/${progress.total} PEMAIN SELESAI*\n\nMalam belum diproses.\nSemua pemain hidup wajib mengirim aksi sebelum malam berakhir.`
                    });
                }
            }
            return;
        }
        m.react('❌');
        return;
    }

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
        if (getRealPlayerCount(ww[chat]) >= 15) return m.reply("Maaf jumlah player telah penuh");
        if (playerOnRoom(sender, chat, ww) === true) return m.reply("Kamu sudah join dalam room ini");
        if (playerOnGame(sender, ww) === true) return m.reply("Kamu masih dalam sesi game");

        ww[chat].player.forEach((player, index) => {
            player.number = index + 1;
        });
        
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
            isDummy: false,
        };
        ww[chat].player.push(dataPlayerBaru);
        
        let jids = ww[chat].player.filter((p) => !p.isDummy).map(p => p.id);
        let text = `\n*⌂ W E R E W O L F - P L A Y E R*\n\n`;
        ww[chat].player.forEach((p) => {
            text += `${p.number}) ${getDisplayPlayerLabel(p)}\n`;
        });
        text += "\nJumlah player minimal adalah 5 dan maksimal 15";
        
        await conn.sendMessage(m.chat, {
            image: { url: thumb },
            caption: text.trim(),
            mentions: jids
        }, { quoted: m });

    } else if (value === "add" && (target === "warga" || target === "dummy" || target === "dummies")) {
        if (!ww[chat]) return m.reply("Belum ada sesi permainan");
        if (ww[chat].status === true) return m.reply("Sesi permainan sudah dimulai");
        const requestedCount = Number(args[2] ?? args[1] ?? 1);
        const addCount = Number.isFinite(requestedCount) && requestedCount > 0 ? Math.floor(requestedCount) : 1;
        const totalBefore = ww[chat].player.length;
        for (let i = 0; i < addCount; i++) {
            const order = totalBefore + i + 1;
            ww[chat].player.push(createWargaPlayer(ww[chat], order));
        }
        ww[chat].player.forEach((player, index) => {
            player.number = index + 1;
        });
        m.reply(`Berhasil menambahkan ${addCount} warga pelengkap ke room. Mereka otomatis bertindak sebagai warga.`);

    } else if (value === "del" && (target === "warga" || target === "dummy" || target === "dummies")) {
        if (!ww[chat]) return m.reply("Belum ada sesi permainan");
        const wargaPlayers = ww[chat].player.filter((player) => player.isDummy);
        if (!wargaPlayers.length) return m.reply("Tidak ada warga pelengkap di room ini");
        ww[chat].player = ww[chat].player.filter((player) => !player.isDummy);
        ww[chat].player.forEach((player, index) => {
            player.number = index + 1;
        });
        m.reply(`Berhasil menghapus ${wargaPlayers.length} warga pelengkap dari room.`);

    } else if (value === "start") {
        if (!ww[chat]) return m.reply("Belum ada sesi permainan");
        if (getRealPlayerCount(ww[chat]) < 1) return m.reply("Maaf jumlah player belum memenuhi syarat (Minimal 1 pemain asli)");
        if (ww[chat].status === true) return m.reply("Sesi permainan telah dimulai");
        if (ww[chat].owner !== sender) return m.reply(`Hanya owner room (@${ww[chat].owner.split('@')[0]}) yang dapat memulai`);

        if (!roleGenerator(chat, ww)) {
            return m.reply("Gagal generate role. Pastikan semua player siap dan room cukup valid untuk dimulai.");
        }
        if (ww[chat].player.some((player) => !validRoleName(player.role))) {
            return m.reply("Ada player yang belum punya role. Game tidak bisa dimulai.");
        }
        addTimer(chat, ww);
        startGame(chat, ww);

        let list1 = "";
        let list2 = "";
        let allPlayers = ww[chat].player.filter((p) => !p.isDummy).map(p => p.id);

        ww[chat].player.filter((p) => !p.isDummy).forEach(p => {
            list1 += `(${p.number}) @${p.id.split('@')[0]}\n`;
            list2 += `(${p.number}) @${p.id.split('@')[0]} ${ (p.role === 'werewolf' || p.role === 'sorcerer') ? `[${p.role}]` : '' }\n`;
        });

        await m.reply("Pesta dimulai! Role rahasia dikirim di grup, hanya pemain tertentu yang bisa melihat isinya.");
        await conn.sendMessage(chat, {
            text: `*⌂ W E R E W O L F - G A M E*\n\nTerlalu bimbang menentukan pilihan. Warga pun pulang ke rumah masing-masing, tidak ada yang dieksekusi hari ini. Bulan bersinar terang, malam yang mencekam telah datang. Semoga tidak ada yang mati malam ini. Pemain malam hari: kalian punya 90 detik untuk beraksi!`
        });

        for (let p of ww[chat].player) {
            if (p.isDummy) continue;
            let roleText = "";
            let name = conn.getName(p.id);
            const codeList = formatCodeList(ww[chat], p);

            if (p.role === "werewolf") {
                roleText = `🎭 *ROLE KAMU*\n\n🐺 *Werewolf*\n\nTim serigala. Bunuh pemain saat malam.\n\nSemua pemain hidup wajib melakukan interaksi malam, kecuali yang sudah mati.\n\n🔪 *AKSI MALAM*\n${codeList}\n\nKetik .ww <KODE>`;
            } else if (p.role === "warga") {
                roleText = `🎭 *ROLE KAMU*\n\n👱‍♂️ *Warga*\n\nCari dan voting Werewolf.\n\nSemua pemain hidup wajib melakukan interaksi malam, kecuali yang sudah mati.\n\n🏠 *PILIH TEMPAT PERSEMBUNYIAN*\n${codeList}\n\nKetik .ww <KODE>`;
            } else if (p.role === "seer") {
                roleText = `🎭 *ROLE KAMU*\n\n👳 *Seer*\n\nMemeriksa role pemain.\n\nSemua pemain hidup wajib melakukan interaksi malam, kecuali yang sudah mati.\n\n🔮 *PILIH PEMAIN*\n${codeList}\n\nKetik .ww <KODE>`;
            } else if (p.role === "guardian") {
                roleText = `🎭 *ROLE KAMU*\n\n👼 *Guardian*\n\nLindungi pemain dari serangan.\n\nSemua pemain hidup wajib melakukan interaksi malam, kecuali yang sudah mati.\n\n🛡️ *PILIH PEMAIN*\n${codeList}\n\nKetik .ww <KODE>`;
            } else if (p.role === "sorcerer") {
                roleText = `🎭 *ROLE KAMU*\n\n🔮 *Penyihir*\n\nPunya dua aksi: racun dan revive.\n\nSemua pemain hidup wajib melakukan interaksi malam, kecuali yang sudah mati.\n\n☠️ *RACUN*\n${codeList}\n\nKetik .ww <KODE>`;
            } else if (p.role === "hunter") {
                roleText = `🎭 *ROLE KAMU*\n\n🏹 *Hunter*\n\nJika mati, memberikan tembakan akhir.\n\nSemua pemain hidup wajib melakukan interaksi malam, kecuali yang sudah mati.\n\n🎯 *PERIKSA SENJATA*\n${codeList}\n\nKetik .ww <KODE>`;
            } else if (p.role === "mayor") {
                roleText = `🎭 *ROLE KAMU*\n\n👑 *Mayor*\n\nSetiap vote bernilai 2.\n\nSemua pemain hidup wajib melakukan interaksi malam, kecuali yang sudah mati.\n\n📋 *AKTIVITAS MALAM*\n${codeList}\n\nKetik .ww <KODE>`;
            } else if (p.role === "jester") {
                roleText = `🎭 *ROLE KAMU*\n\n🃏 *Jester*\n\nMenang jika berhasil dibunuh melalui voting.\n\nSemua pemain hidup wajib melakukan interaksi malam, kecuali yang sudah mati.\n\n🃏 *KEGIATAN MALAM*\n${codeList}\n\nKetik .ww <KODE>`;
            } else if (p.role === "blacksmith") {
                roleText = `🎭 *ROLE KAMU*\n\n⚒️ *Blacksmith*\n\nMemiliki armor yang menahan satu serangan.\n\nSemua pemain hidup wajib melakukan interaksi malam, kecuali yang sudah mati.\n\n⚒️ *AKTIVITAS BLACKSMITH*\n${codeList}\n\nKetik .ww <KODE>`;
            }

            if (roleText) {
                await sendWerewolfRole(conn, chat, p.id, { text: roleText, mentions: allPlayers });
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (!ww[chat].testMode) await run(conn, chat, ww);

    } else if (value === "vote") {
        if (!ww[chat] || ww[chat].status === false || ww[chat].time !== "voting") return m.reply("Sesi voting belum tersedia");
        if (playerOnRoom(sender, chat, ww) === false || dataPlayer(sender, ww).isdead) return m.reply("Kamu tidak bisa voting");
        if (!target || isNaN(target)) return m.reply("Masukan nomor player!");
        if (dataPlayer(sender, ww).isvote) return m.reply("Kamu sudah voting");

        let b = getPlayerById(chat, sender, parseInt(target), ww);
        if (!b || b.db.isdead) return m.reply("Player tidak valid atau sudah mati");

        vote(chat, parseInt(target), sender, ww);
        m.react('✅');
        if (ww[chat].testMode) {
            const room = ww[chat];
            const selected = room.player.find((player) => player.number === parseInt(target));
            room.player.filter((player) => player.id !== sender && !player.isdead).forEach((player) => {
                player.isvote = true;
                if (selected) selected.vote += 1;
            });
            room.voting = true;
            await malam(conn, room, ww);
            delete conn.werewolfTest[chat];
        }

    } else if (ww[chat] && ww[chat].status && ww[chat].time === "voting" && isSecretCode) {
        const result = resolveSecretCodeAction(chat, sender, value, ww, "vote");
        if (!result.ok) {
            m.react('❌');
            return;
        }
        m.react('✅');
        if (ww[chat].testMode) {
            const room = ww[chat];
            const werewolf = room.player.find((player) => player.role === "werewolf" && !player.isdead);
            room.player.filter((player) => player.id !== sender && !player.isdead).forEach((player) => {
                player.isvote = true;
                if (werewolf) werewolf.vote += 1;
            });
            room.voting = true;
            await malam(conn, room, ww);
            delete conn.werewolfTest[chat];
        }
        return;

    } else if (value == "exit") {
        if (!ww[chat] || ww[chat].status) return m.reply("Tidak bisa keluar sekarang");
        if (!playerExit(chat, sender, ww)) return m.reply("Kamu belum join di room ini");
        m.reply("Berhasil keluar dari room");

    } else if (value === "delete") {
        if (!ww[chat]) return m.reply("Belum ada sesi permainan");
        const canDelete = ww[chat].owner === sender || hasRpgPanelAccess(sender);
        if (!canDelete) return m.reply("Hanya owner room");
        await conn.sendMessage(chat, {
            text: `⚠️ *ROOM WEREWOLF DIHAPUS MANUAL*\n\nRoom ini telah dihapus oleh pemilik/otoritas yang berwenang.`
        }).catch(() => {});
        delete ww[chat];
        m.reply("Room berhasil dihapus");

    } else if (value === "player") {
        if (!ww[chat]) return m.reply("Tidak ada sesi permainan");
        let jids = ww[chat].player.filter((p) => !p.isDummy).map(p => p.id);
        let text = "\n*⌂ W E R E W O L F - G A M E*\n\nLIST PLAYER:\n";
        ww[chat].player.forEach((p, index) => {
            p.number = index + 1;
            const roleLabel = validRoleName(p.role);
            const label = getDisplayPlayerLabel(p);
            text += `(${p.number}) ${label} ${p.isdead ? `☠️ [${roleLabel || '—'}]` : ""}\n`;
        });
        await conn.sendMessage(m.chat, {
            image: { url: thumb },
            caption: text.trim(),
            mentions: jids
        }, { quoted: m });

    } else if (value === "info") {
        let text = `*⌂ W E R E W O L F - INFO*\n\n`;
        text += `Werewolf adalah game deduksi sosial. Setiap pemain mendapat role rahasia dan harus bekerja sama, berbohong, atau menganalisis pemain lain untuk memenangkan timnya. Game bisa dimulai dalam satu grup dengan minimal 5 pemain dan maksimal 15 pemain.\n\n`;
        text += `*CARA MULAI*\n`;
        text += `1. Pemain membuat room dengan *.ww create*\n`;
        text += `2. Pemain lain bergabung dengan *.ww join* (minimal 5, maksimal 15 pemain).\n`;
        text += `3. Owner room menjalankan *.ww start* setelah jumlah pemain cukup.\n\n`;
        text += `*ALUR PERMAINAN*\n`;
        text += `🌙 Malam: Semua pemain yang masih hidup wajib mengirim satu kode aksi di grup. Pemain yang mati tidak perlu mengirim aksi.\n`;
        text += `☀️ Siang: Semua pemain yang masih hidup berdiskusi dan melakukan voting. Hasil voting terlihat oleh semua pemain.\n`;
        text += `🔁 Fase malam dan siang berulang sampai salah satu tim menang.\n\n`;
        text += `*KODE RAHASIA*\n`;
        text += `Setiap pemain menerima daftar kode yang berbeda. Ketik *.ww KODE* di grup untuk melakukan aksi. Isi aksi hanya terlihat oleh pemain yang bersangkutan, sedangkan grup menerima tanda bahwa aksinya sudah diproses.\n\n`;
        text += `*ROLE UTAMA*\n`;
        text += `🐺 Werewolf: Hilangkan warga desa tanpa ketahuan.\n`;
        text += `👨‍🌾 Warga Desa: Temukan dan keluarkan semua Werewolf.\n`;
        text += `🔮 Seer/Penerawang: Periksa identitas pemain pada malam hari.\n`;
        text += `🛡️ Guardian/Malaikat: Lindungi pemain dari serangan malam.\n`;
        text += `🧙 Sorcerer/Penyihir: Berpihak pada Werewolf dan membantu mereka menang.\n\n`;
        text += `🏹 Hunter: Jika mati, menembak satu pemain untuk ikut mati.\n`;
        text += `👑 Mayor: Setiap vote yang diberikan bernilai 2.\n`;
        text += `🃏 Jester: Menang sendiri jika mati karena voting.\n`;
        text += `⚒️ Blacksmith: Memiliki armor sekali pakai yang menahan satu serangan malam.\n\n`;
        text += `*COMMAND*\n`;
        text += `• ww player - Lihat daftar nomor pemain\n`;
        text += `• ww add warga - Tambahkan warga pelengkap ke room\n`;
        text += `• ww del warga - Hapus semua warga pelengkap dari room\n`;
        text += `• ww vote nomor - Vote pemain pada fase siang\n`;
        text += `• ww exit - Keluar sebelum game dimulai\n`;
        text += `• ww delete - Hapus room (owner room atau owner)\n`;
        text += `• ww guide - Panduan cara bermain Werewolf\n\n`;
        text += `Role dan kode aksi dikirim melalui pesan rahasia di dalam grup, bukan private chat.`;
        m.reply(text);
    } else if (value === "guide") {
        m.reply(`*⌂ W E R E W O L F - GUIDE*\n\n` +
            `*1. Buat room*\n` +
            `Ketik *.ww create*, lalu minta pemain lain mengetik *.ww join*. Minimal 5 pemain dan maksimal 15 pemain.\n\n` +
            `*2. Mulai permainan*\n` +
            `Owner room mengetik *.ww start*. Setiap pemain akan menerima role dan kode rahasia di grup. Isi role hanya dapat dilihat oleh pemain yang mendapatkannya.\n\n` +
            `*3. Fase malam*\n` +
            `Pemain hidup wajib memilih satu kode dari daftar miliknya, lalu mengetik *.ww KODE* di grup. Pemain mati tidak boleh melakukan aksi. Malam diproses setelah semua pemain hidup mengirim aksi.\n\n` +
            `*4. Fase voting*\n` +
            `Gunakan *.ww vote nomor* untuk memilih pemain. Voting dapat dilihat semua pemain. Pemain mati tidak dapat melakukan voting.\n\n` +
            `*5. Perintah penting*\n` +
            `*.ww player* untuk melihat daftar pemain\n` +
            `*.ww add warga* untuk menambahkan warga pelengkap ke room\n` +
            `*.ww del warga* untuk menghapus semua warga pelengkap di room\n` +
            `*.ww info* untuk ringkasan permainan\n` +
            `*.ww delete* untuk menghapus room oleh owner atau pemilik akses RPG panel\n\n` +
            `Tujuan warga adalah menemukan Werewolf. Tujuan Werewolf adalah menghabiskan warga sampai jumlahnya seimbang atau lebih banyak.`);
    } else if (value === "role") {
        m.reply(`*⌂ W E R E W O L F - ROLE*\n\n` +
            `🐺 Werewolf - Tim serigala, membunuh pemain saat malam.\n` +
            `👱‍♂️ Warga - Cari dan voting Werewolf.\n` +
            `👳 Seer - Memeriksa role pemain.\n` +
            `👼 Guardian - Melindungi pemain dari serangan.\n` +
            `🔮 Penyihir - Bisa meracuni atau menghidupkan pemain.\n` +
            `🏹 Hunter - Jika mati, bisa menembak satu pemain.\n` +
            `👑 Mayor - Setiap vote bernilai 2.\n` +
            `🃏 Jester - Menang jika berhasil dibunuh lewat voting.\n` +
            `⚒️ Blacksmith - +1 armor untuk menahan satu serangan malam.`);
    } else {
        let text = `*⌂ W E R E W O L F - G A M E*\n\n• ww info\n• ww guide\n• ww role\n• ww create\n• ww join\n• ww add warga\n• ww del warga\n• ww start\n• ww exit\n• ww delete\n• ww player`;
        m.reply(text);
    }
}

handler.help = ['werewolf'];
handler.tags = ['game'];
handler.command = ['ww','werewolf'];
handler.group = true;

export default handler;