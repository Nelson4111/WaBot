import { initBridgeDB, forwardToDiscordWebhook } from '../../lib/bridgeHelper.js';

let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin }) => {
  initBridgeDB();
  const bridges = global.db.data.bridges;

  // Command: .setbridge <webhook_url>
  if (command === 'setbridge') {
    if (!m.isGroup) return m.reply('❌ Perintah ini hanya bisa digunakan di dalam Grup WhatsApp.');
    if (!isAdmin && !isOwner) return m.reply('❌ Hanya Admin Grup atau Owner yang bisa mengatur Bridge.');

    if (!text || !text.startsWith('https://discord.com/api/webhooks/')) {
      let helpMsg = `*───「 🌉 SETUP DISCORD BRIDGE 」───*\n\n`;
      helpMsg += `Gunakan perintah ini untuk menghubungkan grup ini dengan Text Channel Discord.\n\n`;
      helpMsg += `*Cara Mendapatkan Webhook URL di Discord:*\n`;
      helpMsg += `1. Buka Server Discord Anda.\n`;
      helpMsg += `2. Edit Channel tujuan ➡️ Integrations ➡️ Webhooks ➡️ New Webhook.\n`;
      helpMsg += `3. Klik *Copy Webhook URL*.\n`;
      helpMsg += `4. Jalankan perintah: *${usedPrefix}setbridge <url_webhook>*\n\n`;
      helpMsg += `*Contoh:* ${usedPrefix}setbridge https://discord.com/api/webhooks/123/abc`;
      return m.reply(helpMsg);
    }

    bridges[m.chat] = {
      webhookUrl: text.trim(),
      setBy: m.sender,
      groupName: m.pushName || 'WhatsApp Group',
      createdAt: Date.now(),
      enabled: true
    };

    m.reply(`✅ *BERHASIL MENGHUBUNGKAN GRUP!*\n\nPesan di grup ini sekarang akan otomatis diteruskan ke channel Discord terkait secara dua arah.`);
    
    // Kirim notifikasi pertama ke Discord
    return forwardToDiscordWebhook(text.trim(), {
      senderName: 'Sistem Bridge',
      senderJid: m.sender,
      text: `🎉 **Grup WhatsApp berhasil terhubung ke Channel Discord ini!**\nNama Grup: \`${m.chat}\`\nSemua percakapan akan disinkronkan secara aman.`
    });
  }

  // Command: .delbridge
  if (command === 'delbridge' || command === 'unlinkbridge') {
    if (!m.isGroup) return m.reply('❌ Perintah ini hanya bisa digunakan di dalam Grup WhatsApp.');
    if (!isAdmin && !isOwner) return m.reply('❌ Hanya Admin Grup atau Owner yang bisa menghapus Bridge.');

    if (!bridges[m.chat]) {
      return m.reply('❌ Grup ini belum terhubung dengan Discord Bridge manapun.');
    }

    delete bridges[m.chat];
    return m.reply('✅ *Bridge Berhasil Dihapus!* Pesan grup ini tidak lagi diteruskan ke Discord.');
  }

  // Command: .statusbridge
  if (command === 'statusbridge' || command === 'checkbridge') {
    if (!m.isGroup) return m.reply('❌ Perintah ini hanya bisa digunakan di dalam Grup WhatsApp.');
    const current = bridges[m.chat];
    if (!current) {
      return m.reply('ℹ️ Grup ini *belum terhubung* ke Discord Bridge.');
    }

    return m.reply(`🌉 *STATUS BRIDGE GRUP*\n\n✅ Status: Aktif\n🔗 Target: Discord Webhook Connected\n📅 Dibuat: ${new Date(current.createdAt).toLocaleString('id-ID')}`);
  }
};

// Listener global untuk forward chat WhatsApp ke Discord
handler.all = async function (m) {
  if (!m.chat || !m.chat.endsWith('@g.us')) return; // Hanya untuk grup
  if (!global.db?.data?.bridges) return;

  const bridge = global.db.data.bridges[m.chat];
  if (!bridge || !bridge.enabled || !bridge.webhookUrl) return;

  // Jangan teruskan command bot jika diawali prefix (opsional agar tidak spam)
  if (m.text && /^[.!#/$%^&]/.test(m.text)) return;

  try {
    let mediaBuffer = null;
    let mediaType = null;
    let filename = null;

    // Download media jika ada
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (/image|video|audio|sticker|document/.test(mime)) {
      mediaBuffer = await q.download?.().catch(() => null);
      if (mediaBuffer) {
        if (/image/.test(mime)) mediaType = 'jpg';
        else if (/video/.test(mime)) mediaType = 'mp4';
        else if (/audio/.test(mime)) mediaType = 'mp3';
        else if (/sticker/.test(mime)) mediaType = 'webp';
        else mediaType = 'bin';
        filename = `wa_media_${Date.now()}.${mediaType}`;
      }
    }

    // Forward ke Webhook Discord
    await forwardToDiscordWebhook(bridge.webhookUrl, {
      senderName: m.name || m.pushName || 'WhatsApp Member',
      senderJid: m.sender,
      text: m.text || '',
      mediaBuffer,
      mediaType,
      filename
    });
  } catch (err) {
    console.error('[Bridge Handler Error]', err.message);
  }
};

handler.help = ['setbridge <webhook_url>', 'delbridge', 'statusbridge'];
handler.tags = ['tools'];
handler.command = /^(setbridge|delbridge|unlinkbridge|statusbridge|checkbridge)$/i;
handler.group = true;

export default handler;
