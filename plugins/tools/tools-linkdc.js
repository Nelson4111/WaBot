import { generateLinkOTP, unlinkAccount, initBridgeDB } from '../../lib/bridgeHelper.js';

let handler = async (m, { conn, usedPrefix, command }) => {
  initBridgeDB();
  const dbUsers = global.db.data.users || {};
  const user = dbUsers[m.sender] || {};

  // Command: .linkdc (Generate OTP)
  if (command === 'linkdc' || command === 'tautkandiscord') {
    if (user.discordId) {
      let cap = `*───「 🔗 AKUN SUDAH TERTAUT 」───*\n\n`;
      cap += `Akun WhatsApp kamu sudah terhubung dengan Discord:\n`;
      cap += `👤 **Discord User:** @${user.discordTag || user.discordId}\n`;
      cap += `🆔 **Discord ID:** \`${user.discordId}\`\n\n`;
      cap += `_Ketik *${usedPrefix}unlinkdc* jika ingin melepaskan tautan ini._`;
      return m.reply(cap);
    }

    const { code, expiresAt } = generateLinkOTP(m.sender, m.name || m.pushName || 'Player');
    const sisaDetik = Math.floor((expiresAt - Date.now()) / 1000);

    let cap = `*───「 🔐 KODE VERIFIKASI LINK DISCORD 」───*\n\n`;
    cap += `Gunakan kode OTP ini untuk menautkan akunmu di Discord:\n\n`;
    cap += `👉 *Kode OTP:* \`${code}\`\n`;
    cap += `⏱️ *Berlaku Selama:* 3 Menit (${sisaDetik} detik)\n\n`;
    cap += `*Langkah Selanjutnya:*\n`;
    cap += `1. Buka server Discord bot.\n`;
    cap += `2. Ketik perintah: \`/linkwa kode:${code}\`\n\n`;
    cap += `⚠️ *PENTING:* Jangan bagikan kode ini kepada siapapun!`;

    return m.reply(cap);
  }

  // Command: .unlinkdc (Lepas Tautan)
  if (command === 'unlinkdc' || command === 'hapuslinkdiscord') {
    const result = unlinkAccount(m.sender);
    if (!result.success) {
      return m.reply(`❌ ${result.message}`);
    }

    return m.reply(`✅ *BERHASIL MEMUTUSKAN TAUTAN!*\n\nAkun WhatsApp kamu tidak lagi terhubung dengan akun Discord (${result.discordId}).`);
  }

  // Command: .statuslink
  if (command === 'statuslink' || command === 'ceklink') {
    if (!user.discordId) {
      return m.reply(`ℹ️ Akun WhatsApp kamu *belum terhubung* ke akun Discord manapun.\n\nKetik *${usedPrefix}linkdc* untuk mendapatkan kode verifikasi.`);
    }

    let cap = `*───「 🔗 STATUS KONEKSI AKUN 」───*\n\n`;
    cap += `✅ Status: Terhubung\n`;
    cap += `👤 Discord Tag: @${user.discordTag || 'Unknown'}\n`;
    cap += `🆔 Discord ID: \`${user.discordId}\`\n`;
    cap += `🛡️ Keamanan: Aktif (Shared In-Memory Synced)`;

    return m.reply(cap);
  }
};

handler.help = ['linkdc', 'unlinkdc', 'statuslink'];
handler.tags = ['tools'];
handler.command = /^(linkdc|tautkandiscord|unlinkdc|hapuslinkdiscord|statuslink|ceklink)$/i;

export default handler;
