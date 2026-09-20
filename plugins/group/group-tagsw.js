import * as baileys from "@whiskeysockets/baileys";
import crypto from "node:crypto";
import { PassThrough } from "stream";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import { join } from "path";
import os from "os";
import ffmpeg from "fluent-ffmpeg";
import { revokeGroupStatus } from "../../lib/statusHelper.js";

let Izumi = async (m, { conn, text, usedPrefix, command, isBotAdmin }) => {
  if (!m.isGroup) {
    return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Perintah ini hanya dapat digunakan di dalam grup!\n*╰───────────────*');
  }

  // Helper untuk memberi reaksi emoji status proses ke pesan user
  const react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }).catch(() => {});

  // Inisialisasi penyimpanan status grup di database
  global.db.data = global.db.data || {};
  global.db.data.chats = global.db.data.chats || {};
  let chat = global.db.data.chats[m.chat];
  if (!chat) chat = global.db.data.chats[m.chat] = {};
  if (!Array.isArray(chat.groupStatuses)) chat.groupStatuses = [];

  // Bersihkan status yang sudah lewat 24 jam (otomatis expired di WhatsApp)
  const now = Date.now();
  chat.groupStatuses = chat.groupStatuses.filter(s => (now - s.timestamp) < 24 * 60 * 60 * 1000);

  const isDelete = /^(delswgc|hapusswgc|deleteswgc)$/i.test(command);

  // ==========================================
  // ALUR 1: HAPUS STATUS GRUP (DELETE / REVOKE)
  // ==========================================
  if (isDelete) {
    const rawArg = (text || '').trim().toLowerCase();

    // 1. Opsi Cek Daftar Status Aktif (.delswgc list)
    if (rawArg === 'list') {
      if (chat.groupStatuses.length === 0) {
        return m.reply('*╭  〔 📋 ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ 〕*\n> Belum ada status grup aktif yang diunggah dalam 24 jam terakhir.\n*╰───────────────*');
      }

      let listText = `*╭  〔 📋 ᴅ ᴀ ꜰ ᴛ ᴀ ʀ  ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*\n`;
      listText += `> Total aktif: ${chat.groupStatuses.length} status\n\n`;
      chat.groupStatuses.forEach((s, idx) => {
        const minsAgo = Math.max(1, Math.round((now - s.timestamp) / 60000));
        const snippet = s.caption ? ` - "${s.caption.slice(0, 30)}${s.caption.length > 30 ? '...' : ''}"` : '';
        listText += `*${idx + 1}.* [${s.type}]${snippet}\n   ├ Waktu: ${minsAgo} menit lalu\n   └ ID: \`${s.id}\`\n`;
      });
      listText += `\n> Ketik *${usedPrefix + command} <nomor>* untuk hapus status tertentu.\n`;
      listText += `> Ketik *${usedPrefix + command} all* untuk hapus semua status.\n`;
      listText += `*╰───────────────*`;
      return m.reply(listText);
    }

    // 2. Opsi Hapus Semua Status (.delswgc all)
    if (rawArg === 'all') {
      if (chat.groupStatuses.length === 0) {
        return m.reply('*╭  〔 ◈ ᴘ ᴇ ɴ ᴛ ɪ ɴ ɢ 〕*\n> Tidak ada status grup aktif yang tersimpan untuk dihapus.\n*╰───────────────*');
      }

      await react('⏳');
      let count = 0;
      for (const st of chat.groupStatuses) {
        try {
          await revokeGroupStatus(conn, m.chat, { id: st.id, fromMe: true });
          count++;
        } catch (e) {
          console.error('[group-tagsw] Gagal menghapus status:', st.id, e);
        }
      }

      chat.groupStatuses = [];
      await react('🗑️');
      return m.reply(`*╭  〔 ⟡ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*\n> Berhasil menghapus ${count} status grup ✦\n*╰───────────────*`);
    }

    // 3. Opsi Hapus Berdasarkan Nomor Urut (.delswgc 1)
    if (/^\d+$/.test(rawArg)) {
      const idx = parseInt(rawArg) - 1;
      if (idx < 0 || idx >= chat.groupStatuses.length) {
        await react('❌');
        return m.reply(`*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Nomor status tidak valid! Silakan cek daftar dengan *${usedPrefix + command} list*.\n*╰───────────────*`);
      }

      await react('⏳');
      const target = chat.groupStatuses[idx];
      try {
        await revokeGroupStatus(conn, m.chat, { id: target.id, fromMe: true });
        chat.groupStatuses.splice(idx, 1);
        await react('🗑️');
        return m.reply(`*╭  〔 ⟡ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*\n> Berhasil menghapus status nomor ${idx + 1} (${target.type}) ✦\n*╰───────────────*`);
      } catch (e) {
        await react('❌');
        return m.reply(`*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal menghapus status: ${e.message}\n*╰───────────────*`);
      }
    }

    // 4. Opsi Hapus Berdasarkan Reply (Quoted Pesan Status / Konfirmasi / Status Anomali)
    let targetStatusId = null;
    let targetParticipant = undefined;
    let alternateParticipant = undefined;
    let isTargetFromMe = true;
    let innerStatusKey = null;

    if (m.quoted) {
      const matchInDb = chat.groupStatuses.find(s => s.id === m.quoted.id);
      if (matchInDb) {
        targetStatusId = matchInDb.id;
        isTargetFromMe = true;
        targetParticipant = undefined;
      } else {
        // Cek apakah teks pesan yang di-quote berisi ID status
        const textMatch = (m.quoted.text || '').match(/ID:\s*`?([A-Za-z0-9_\-+=]+)`?/i);
        if (textMatch && textMatch[1]) {
          targetStatusId = textMatch[1];
          isTargetFromMe = true;
          targetParticipant = undefined;
        } else {
          // Status/pesan yang di-reply langsung (bisa buatan bot atau anomali/member lain)
          targetStatusId = m.quoted.id;
          isTargetFromMe = !!m.quoted.fromMe || (conn.user?.id && baileys.areJidsSameUser(m.quoted.sender, conn.user.id));

          // Ekstrak identitas raw LID dan Phone JID pengirim secara akurat
          const rawPart = m.msg?.contextInfo?.participant || m.quoted.vM?.key?.participant || '';
          const senderJid = m.quoted.sender || '';
          targetParticipant = rawPart || senderJid || undefined;
          alternateParticipant = (senderJid && senderJid !== targetParticipant)
            ? senderJid
            : (rawPart && rawPart !== targetParticipant ? rawPart : undefined);

          // Cek jika pesan adalah groupStatusMentionMessage yang menyimpan inner key status
          const innerKey = m.quoted.msg?.message?.protocolMessage?.key ||
                           m.quoted.message?.groupStatusMentionMessage?.message?.protocolMessage?.key;
          if (innerKey && innerKey.id) {
            innerStatusKey = innerKey;
          }
        }
      }
    } else if (rawArg && rawArg.length > 10) {
      targetStatusId = rawArg;
      isTargetFromMe = true;
      targetParticipant = undefined;
    }

    if (targetStatusId) {
      // Jika status/pesan milik anomali atau anggota lain, bot WAJIB menjadi Admin Grup
      if (!isTargetFromMe && !isBotAdmin) {
        await react('❌');
        return m.reply('*╭  〔 ◈ ɪ ᴢ ɪ ɴ  ᴅ ɪ ᴛ ᴏ ʟ ᴀ ᴋ 〕*\n> Bot harus menjadi *Admin Grup* untuk menghapus status atau pesan dari anggota lain (Admin Delete)!\n*╰───────────────*');
      }

      await react('⏳');
      try {
        // 1. Coba hapus langsung melalui helper m.quoted.delete() jika tersedia
        if (m.quoted && typeof m.quoted.delete === 'function') {
          await m.quoted.delete().catch(() => {});
        }

        // 2. Cabut status via revokeGroupStatus dengan multi-partisipan (LID & Phone JID)
        const ok = await revokeGroupStatus(conn, m.chat, {
          id: targetStatusId,
          fromMe: isTargetFromMe,
          participant: targetParticipant,
          alternateParticipant: alternateParticipant
        });

        // 3. Jika ada inner status key dari groupStatusMentionMessage, coba bersihkan juga
        if (innerStatusKey?.id) {
          await revokeGroupStatus(conn, innerStatusKey.remoteJid || m.chat, {
            id: innerStatusKey.id,
            fromMe: false,
            participant: innerStatusKey.participant || targetParticipant,
            alternateParticipant: alternateParticipant
          }).catch(() => {});
        }

        // Hapus dari riwayat lokal jika ada
        chat.groupStatuses = chat.groupStatuses.filter(s => s.id !== targetStatusId && (!innerStatusKey || s.id !== innerStatusKey.id));
        await react('🗑️');

        const targetUserNum = (targetParticipant || alternateParticipant || m.quoted?.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '');
        const targetDesc = isTargetFromMe ? 'terpilih' : `milik @${targetUserNum || 'pengguna'}`;

        const noticeText = isTargetFromMe
          ? `*╭  〔 ⟡ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*\n> Berhasil menghapus status grup ${targetDesc} ✦\n*╰───────────────*`
          : `*╭  〔 ⟡ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*\n` +
            `> Berhasil menghapus status/mention grup ${targetDesc} dari obrolan ✦\n` +
            `*╰───────────────*`;

        const mentionList = [targetParticipant, alternateParticipant, m.quoted?.sender].filter(v => v && !v.endsWith('@g.us'));

        return conn.sendMessage(m.chat, {
          text: noticeText,
          mentions: [...new Set(mentionList)]
        }, { quoted: m });
      } catch (e) {
        await react('❌');
        return m.reply(`*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal menghapus status: ${e.message}\n*╰───────────────*`);
      }
    }

    // 5. Opsi Default: Hapus Status Grup Terakhir
    if (chat.groupStatuses.length > 0) {
      await react('⏳');
      const latest = chat.groupStatuses.pop();
      try {
        await revokeGroupStatus(conn, m.chat, { id: latest.id, fromMe: true });
        await react('🗑️');
        return m.reply(`*╭  〔 ⟡ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*\n> Berhasil menghapus status grup terakhir (${latest.type}) ✦\n*╰───────────────*`);
      } catch (e) {
        await react('❌');
        return m.reply(`*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal menghapus status grup: ${e.message}\n*╰───────────────*`);
      }
    }

    return m.reply(
      `*╭  〔 ◈ ʜ ᴀ ᴘ ᴜ ꜱ  ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ 〕*\n` +
      `> Tidak ada riwayat status grup yang tersimpan.\n\n` +
      `*Cara Penggunaan:* \n` +
      `• *${usedPrefix + command}* (Hapus status grup terakhir)\n` +
      `• *${usedPrefix + command} list* (Lihat daftar status aktif)\n` +
      `• *${usedPrefix + command} <nomor>* (Hapus status berdasarkan nomor)\n` +
      `• *${usedPrefix + command} all* (Hapus semua status)\n` +
      `• Atau balas (reply) pesan status dengan *${usedPrefix + command}*\n` +
      `*╰───────────────*`
    );
  }

  // ==========================================
  // ALUR 2: UPLOAD STATUS GRUP (GROUP STATUS V2)
  // ==========================================
  let textInput = '';
  let warna = '';
  let url = '';

  if (text) {
    if (text.includes('|')) {
      const parts = text.split('|').map(p => p.trim());
      textInput = parts[0] || '';
      warna = parts[1] || '';
      url = parts[2] || '';
    } else {
      textInput = text.trim();
    }
  }

  let id = m.chat;
  if (url) {
    const inviteCode = url.split('/').pop().split('?')[0];
    try {
      let geti = await conn.groupGetInviteInfo(inviteCode);
      if (geti?.id) id = geti.id;
    } catch {}
  }

  // Fallback quoted / media
  let quoted = m.quoted || m;
  let cap = quoted.caption || (quoted !== m ? (textInput || quoted.text) : textInput);
  let q = quoted;
  let mime = q?.mimetype || q?.msg?.mimetype || '';

  // Helper untuk menyimpan ke riwayat & kirim konfirmasi
  const saveAndReply = async (sta, type, captionText) => {
    chat.groupStatuses.push({
      id: sta.key.id,
      type: type,
      caption: captionText || '',
      timestamp: now,
      sender: m.sender
    });

    await react('✅');

    return conn.reply(
      m.chat,
      `*╭  〔 ⟡ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*\n` +
      `> Berhasil mengunggah status ${type.toLowerCase()} grup ✦\n` +
      `> *ID:* \`${sta.key.id}\`\n\n` +
      `> _Ketik *${usedPrefix}delswgc* untuk menghapus status ini._\n` +
      `*╰───────────────*`,
      sta
    );
  };

  // 1. MEDIA GAMBAR / FOTO
  if (/image/.test(mime)) {
    await react('⏳');
    const buffer = await quoted.download().catch(() => null);
    if (!buffer) {
      await react('❌');
      return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal mengunduh gambar.\n*╰───────────────*');
    }

    const sta = await groupStatus(conn, id, {
      image: buffer,
      caption: cap
    });
    return saveAndReply(sta, 'Foto', cap);
  }

  // 2. MEDIA VIDEO (DENGAN AUTO-SPLIT JIKA > 30 DETIK)
  else if (/video/.test(mime)) {
    await react('⏳');
    const rawBuffer = await quoted.download().catch(() => null);
    if (!rawBuffer) {
      await react('❌');
      return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal mengunduh video.\n*╰───────────────*');
    }

    // Potong video menjadi bagian-bagian 30 detik (maksimal 5 bagian / 2.5 menit)
    const parts = await splitVideoForStatus(rawBuffer, 5);

    let lastSta = null;
    for (const item of parts) {
      const partCap = parts.length > 1
        ? (cap ? `${cap} (${item.part}/${item.totalParts})` : `(${item.part}/${item.totalParts})`)
        : cap;

      const sta = await groupStatus(conn, id, {
        video: item.buffer,
        caption: partCap,
        seconds: item.seconds,
        mimetype: 'video/mp4'
      });

      chat.groupStatuses.push({
        id: sta.key.id,
        type: parts.length > 1 ? `Video (${item.part}/${item.totalParts})` : 'Video',
        caption: partCap || '',
        timestamp: now,
        sender: m.sender
      });

      lastSta = sta;

      // Beri jeda 1.2 detik antar bagian agar urutan status di WhatsApp teratur
      if (parts.length > 1 && item.part < item.totalParts) {
        await new Promise(r => setTimeout(r, 1200));
      }
    }

    await react('✅');

    if (parts.length > 1) {
      return conn.reply(
        m.chat,
        `*╭  〔 ⟡ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*\n` +
        `> Berhasil mengunggah *${parts.length} bagian* status video grup ✦\n` +
        `> Durasi dipecah per 30 detik (seperti WhatsApp resmi).\n` +
        `> *ID Bagian Terakhir:* \`${lastSta.key.id}\`\n\n` +
        `> _Semua bagian otomatis tersimpan di riwayat. Ketik *${usedPrefix}delswgc* untuk menghapus._\n` +
        `*╰───────────────*`,
        lastSta
      );
    } else {
      return conn.reply(
        m.chat,
        `*╭  〔 ⟡ ꜱ ᴛ ᴀ ᴛ ᴜ ꜱ  ɢ ʀ ᴜ ᴘ 〕*\n` +
        `> Berhasil mengunggah status video grup ✦\n` +
        `> *ID:* \`${lastSta.key.id}\`\n\n` +
        `> _Ketik *${usedPrefix}delswgc* untuk menghapus status ini._\n` +
        `*╰───────────────*`,
        lastSta
      );
    }
  }

  // 3. MEDIA AUDIO / VOICE NOTE (VN)
  else if (/audio/.test(mime)) {
    await react('⏳');
    const buffer = await quoted.download().catch(() => null);
    if (!buffer) {
      await react('❌');
      return m.reply('*╭  〔 ◈ ᴇ ʀ ʀ ᴏ ʀ 〕*\n> Gagal mengunduh audio.\n*╰───────────────*');
    }

    const audioVn = await toVN(buffer);
    const audioWaveform = await generateWaveform(buffer);

    const sta = await groupStatus(conn, id, {
      audio: audioVn,
      waveform: audioWaveform,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true
    });
    return saveAndReply(sta, 'Audio', 'Voice Note');
  }

  // 4. TEKS STATUS (BERWARNA)
  else if (cap || textInput) {
    await react('⏳');
    const statusText = cap || textInput;

    const warnaStatusWA = new Map([
      ['biru',    '#34B7F1'],
      ['hijau',   '#25D366'],
      ['kuning',  '#FFD700'],
      ['jingga',  '#FF8C00'],
      ['merah',   '#FF3B30'],
      ['ungu',    '#9C27B0'],
      ['abu',     '#9E9E9E'],
      ['hitam',   '#000000'],
      ['putih',   '#FFFFFF'],
      ['cyan',    '#00BCD4']
    ]);

    let color = null;
    if (warna) {
      const textWarna = warna.toLowerCase();
      for (const [nama, kode] of warnaStatusWA.entries()) {
        if (textWarna.includes(nama)) {
          color = kode;
          break;
        }
      }
      if (!color && /^#?[0-9A-Fa-f]{6}$/.test(warna)) {
        color = warna.startsWith('#') ? warna : `#${warna}`;
      }
    }

    // Default warna acak estetik jika warna tidak ditentukan
    if (!color) {
      const defaultPalette = ['#25D366', '#34B7F1', '#9C27B0', '#FF3B30', '#000000', '#FF8C00'];
      color = defaultPalette[Math.floor(Math.random() * defaultPalette.length)];
    }

    const sta = await groupStatus(conn, id, {
      text: statusText,
      backgroundColor: color
    });
    return saveAndReply(sta, 'Teks', statusText);
  }

  // 5. BANTUAN CARA PAKAI
  else {
    return m.reply(
      `*╭  〔 ◈ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*\n` +
      `*• Upload Status Grup:* \n` +
      `  - *Teks:* \`${usedPrefix + command} Halo grup | biru\`\n` +
      `  - *Foto/Video:* Kirim/balas foto atau video dengan caption \`${usedPrefix + command} <caption opsional>\`\n` +
      `  - *Audio/VN:* Balas audio dengan \`${usedPrefix + command}\`\n\n` +
      `*• Hapus Status Grup:* \n` +
      `  - *${usedPrefix}delswgc* (Hapus status terakhir)\n` +
      `  - *${usedPrefix}delswgc list* (Lihat daftar status aktif)\n` +
      `  - *${usedPrefix}delswgc <nomor>* (Hapus berdasarkan nomor)\n` +
      `  - *${usedPrefix}delswgc all* (Hapus semua status aktif)\n` +
      `*╰───────────────*`
    );
  }
};

/**
 * Mengirim WhatsApp Status langsung ke Grup (Group Status V2).
 * @param {import("@whiskeysockets/baileys").WASocket} conn
 * @param {string} jid
 * @param {import("@whiskeysockets/baileys").AnyMessageContent} content
 */
async function groupStatus(conn, jid, content) {
  const { backgroundColor } = content;
  delete content.backgroundColor;

  const inside = await baileys.generateWAMessageContent(content, {
    upload: conn.waUploadToServer,
    backgroundColor
  });

  // Pastikan isGroupStatus = true terpasang pada contextInfo pesan konten
  const messageType = Object.keys(inside)[0];
  if (inside[messageType]) {
    inside[messageType].contextInfo = {
      ...(inside[messageType].contextInfo || {}),
      isGroupStatus: true
    };
  }

  const messageSecret = crypto.randomBytes(32);
  const m = baileys.generateWAMessageFromContent(jid, {
    ...inside,
    messageContextInfo: { messageSecret }
  }, {});

  // Lampirkan tag meta is_group_status="true" agar WhatsApp mengenali & merender media status dengan benar
  await conn.relayMessage(jid, m.message, {
    messageId: m.key.id,
    additionalNodes: [
      {
        tag: 'meta',
        attrs: { is_group_status: 'true' },
        content: undefined
      }
    ]
  });
  return m;
}



Izumi.help = ["swgc", "upswgc", "delswgc", "hapusswgc"];
Izumi.command = /^(swgc|upswgc|statusgc|delswgc|hapusswgc|deleteswgc)$/i;
Izumi.tags = ["group"];
Izumi.admin = true;
Izumi.group = true;

/**
 * Memotong & memproses video menjadi bagian-bagian 30 detik untuk status WhatsApp.
 * - Membaca durasi total via ffprobe.
 * - Jika > 30 detik, memecah video menjadi Part 1, Part 2, dst. (maksimal maxParts).
 * - Menjadikan MP4 H.264 (yuv420p) + AAC + -movflags +faststart.
 * @param {Buffer} inputBuffer
 * @param {number} maxParts Maksimal bagian yang diizinkan (default 5)
 * @returns {Promise<Array<{buffer: Buffer, seconds: number, part: number, totalParts: number}>>}
 */
async function splitVideoForStatus(inputBuffer, maxParts = 5) {
  const tmpIn = join(os.tmpdir(), `split_in_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`);

  try {
    await fs.writeFile(tmpIn, inputBuffer);

    let totalDuration = 0;
    try {
      const probe = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        tmpIn
      ]);
      let out = '';
      probe.stdout.on('data', d => out += d);
      await new Promise(r => probe.on('close', r));
      const parsed = parseFloat(out.trim());
      if (!isNaN(parsed) && parsed > 0) totalDuration = parsed;
    } catch (e) {
      console.warn('[group-tagsw] ffprobe error:', e);
    }

    const partLength = 30; // 30 detik per status WhatsApp
    const numParts = totalDuration > partLength ? Math.min(maxParts, Math.ceil(totalDuration / partLength)) : 1;
    const results = [];

    for (let i = 0; i < numParts; i++) {
      const startTime = i * partLength;
      const duration = Math.min(partLength, Math.max(1, Math.round(totalDuration ? (totalDuration - startTime) : partLength)));
      const tmpOut = join(os.tmpdir(), `split_out_${Date.now()}_${i}_${Math.random().toString(36).slice(2)}.mp4`);

      await new Promise((resolve) => {
        const proc = spawn('ffmpeg', [
          '-y',
          '-ss', String(startTime),
          '-i', tmpIn,
          '-t', String(duration),
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-preset', 'fast',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-ar', '44100',
          '-movflags', '+faststart',
          tmpOut
        ]);

        proc.on('close', async (code) => {
          try {
            if (code === 0 && await fs.access(tmpOut).then(() => true).catch(() => false)) {
              const buf = await fs.readFile(tmpOut);
              await fs.unlink(tmpOut).catch(() => {});
              results.push({ buffer: buf, seconds: duration, part: i + 1, totalParts: numParts });
            }
          } catch {}
          resolve();
        });

        proc.on('error', () => resolve());
      });
    }

    if (results.length > 0) {
      return results;
    }

    // Fallback jika pemrosesan ffmpeg gagal
    return [{ buffer: inputBuffer, seconds: Math.min(30, Math.round(totalDuration || 30)), part: 1, totalParts: 1 }];
  } catch (err) {
    console.error('[group-tagsw] splitVideoForStatus error:', err);
    return [{ buffer: inputBuffer, seconds: 30, part: 1, totalParts: 1 }];
  } finally {
    await fs.unlink(tmpIn).catch(() => {});
  }
}

async function toVN(inputBuffer) {
  return new Promise((resolve, reject) => {
    const inStream = new PassThrough();
    const outStream = new PassThrough();
    const chunks = [];

    inStream.end(inputBuffer);

    ffmpeg(inStream)
      .noVideo()
      .audioCodec('libopus')
      .format('ogg')
      .audioBitrate('48k')
      .audioChannels(1)
      .audioFrequency(48000)
      .outputOptions([
        '-map_metadata', '-1',
        '-application', 'voip',
        '-compression_level', '10',
        '-page_duration', '20000'
      ])
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe(outStream, { end: true });

    outStream.on('data', c => chunks.push(c));
  });
}

async function generateWaveform(inputBuffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(inputBuffer);

    const chunks = [];

    ffmpeg(inputStream)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("s16le")
      .on("error", reject)
      .on("end", () => {
        const rawData = Buffer.concat(chunks);
        const samples = rawData.length / 2;

        const amplitudes = [];
        for (let i = 0; i < samples; i++) {
          let val = rawData.readInt16LE(i * 2);
          amplitudes.push(Math.abs(val) / 32768);
        }

        let blockSize = Math.floor(amplitudes.length / bars);
        let avg = [];
        for (let i = 0; i < bars; i++) {
          let block = amplitudes.slice(i * blockSize, (i + 1) * blockSize);
          avg.push(block.reduce((a, b) => a + b, 0) / block.length);
        }

        let max = Math.max(...avg);
        let normalized = avg.map(v => Math.floor((v / max) * 100));

        let buf = Buffer.from(new Uint8Array(normalized));
        resolve(buf.toString("base64"));
      })
      .pipe() 
      .on("data", chunk => chunks.push(chunk));
  });
}

export default Izumi;