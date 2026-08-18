import crypto from 'crypto';
import fetch from 'node-fetch';

/**
 * Helper untuk menyensor nomor telepon pengguna WhatsApp
 * Contoh: 6281234567890 -> +62812****7890
 */
export function maskPhoneNumber(jidOrNumber) {
  if (!jidOrNumber) return 'Anonymous';
  let num = jidOrNumber.replace(/[^0-9]/g, '');
  if (num.length < 8) return jidOrNumber;
  let prefix = num.slice(0, 5);
  let suffix = num.slice(-4);
  return `+${prefix}****${suffix}`;
}

/**
 * Inisialisasi struktur data Bridge di global database
 */
export function initBridgeDB() {
  if (!global.db) global.db = { data: {} };
  if (!global.db.data) global.db.data = {};
  if (!global.db.data.bridges) global.db.data.bridges = {};
  if (!global.db.data.linkCodes) global.db.data.linkCodes = {};
  if (!global.db.data.linkedUsers) global.db.data.linkedUsers = {};
  if (!global.db.data.transactions) global.db.data.transactions = {};
}

// Memory-level transaction lock untuk mencegah double spending
const accountLocks = new Set();

/**
 * Menjalankan operasi transaksi yang aman dari race condition (Mutex Lock)
 */
export async function withTransactionLock(userId, transactionFn) {
  if (accountLocks.has(userId)) {
    throw new Error('TRANSACTION_LOCKED: Transaksi lain sedang berlangsung untuk akun ini. Coba sesaat lagi.');
  }
  accountLocks.add(userId);
  try {
    return await transactionFn();
  } finally {
    accountLocks.delete(userId);
  }
}

/**
 * Generate 6-Digit OTP Pairing Code dengan masa berlaku 3 menit (TTL)
 */
export function generateLinkOTP(waJid, pushName = 'User') {
  initBridgeDB();
  
  // Hapus kode lama jika ada
  for (const [code, data] of Object.entries(global.db.data.linkCodes)) {
    if (data.waJid === waJid) {
      delete global.db.data.linkCodes[code];
    }
  }

  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 3 * 60 * 1000; // 3 Menit

  global.db.data.linkCodes[code] = {
    waJid,
    pushName,
    attempts: 0,
    expiresAt
  };

  return { code, expiresAt };
}

/**
 * Verifikasi Kode OTP dari Discord dan tautkan akun
 */
export function verifyLinkOTP(code, discordUser) {
  initBridgeDB();
  const record = global.db.data.linkCodes[code];

  if (!record) {
    return { success: false, reason: 'KODE_INVALID', message: 'Kode OTP tidak ditemukan atau salah.' };
  }

  if (Date.now() > record.expiresAt) {
    delete global.db.data.linkCodes[code];
    return { success: false, reason: 'KODE_EXPIRED', message: 'Kode OTP sudah kadaluarsa (melebihi 3 menit).' };
  }

  if (record.attempts >= 3) {
    delete global.db.data.linkCodes[code];
    return { success: false, reason: 'MAX_ATTEMPTS', message: 'Terlalu banyak percobaan salah. Kode dibatalkan demi keamanan.' };
  }

  const waJid = record.waJid;
  const dbUsers = global.db.data.users || {};

  // Pastikan data user ada
  if (!dbUsers[waJid]) dbUsers[waJid] = {};
  if (!dbUsers[waJid].rpg) dbUsers[waJid].rpg = {};

  // Kaitkan ID Discord ke profil WhatsApp
  dbUsers[waJid].discordId = discordUser.id;
  dbUsers[waJid].discordTag = discordUser.tag || discordUser.username;

  // Catat reverse-mapping untuk pencarian cepat dari Discord
  global.db.data.linkedUsers[discordUser.id] = {
    waJid,
    linkedAt: Date.now()
  };

  // Hapus OTP setelah sukses
  delete global.db.data.linkCodes[code];

  return {
    success: true,
    waJid,
    pushName: record.pushName,
    discordUser
  };
}

/**
 * Melepaskan tautan akun (Unlink)
 */
export function unlinkAccount(waJid) {
  initBridgeDB();
  const dbUsers = global.db.data.users || {};
  const user = dbUsers[waJid];

  if (!user || !user.discordId) {
    return { success: false, message: 'Akun WhatsApp ini belum ditautkan ke akun Discord manapun.' };
  }

  const discordId = user.discordId;
  delete user.discordId;
  delete user.discordTag;
  delete global.db.data.linkedUsers[discordId];

  return { success: true, discordId };
}

/**
 * Mengirim pesan WhatsApp ke Webhook Discord (Forwarder)
 */
export async function forwardToDiscordWebhook(webhookUrl, { senderName, senderJid, text, mediaBuffer, mediaType, filename }) {
  if (!webhookUrl) return null;

  try {
    const maskedNumber = maskPhoneNumber(senderJid);
    const username = `${senderName || 'WA Member'} (${maskedNumber})`;
    const avatarUrl = 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg';

    // Jika ada lampiran media (gambar/audio/dokumen)
    if (mediaBuffer && Buffer.isBuffer(mediaBuffer)) {
      // Periksa batas ukuran Discord (8MB)
      if (mediaBuffer.length > 8 * 1024 * 1024) {
        return await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Bridge-Relay': 'NelBot-Bridge' },
          body: JSON.stringify({
            username,
            avatar_url: avatarUrl,
            content: `${text ? text + '\n\n' : ''}⚠️ _[Lampiran media ${mediaType || 'file'} melebihi batas 8MB Discord]_`
          })
        });
      }

      // Kirim via FormData
      const FormData = (await import('form-data')).default;
      const form = new FormData();
      form.append('username', username);
      form.append('avatar_url', avatarUrl);
      if (text) form.append('content', text);
      form.append('file', mediaBuffer, { filename: filename || `media_${Date.now()}.${mediaType || 'bin'}` });

      return await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          ...form.getHeaders(),
          'X-Bridge-Relay': 'NelBot-Bridge'
        },
        body: form
      });
    }

    // Teks biasa
    if (!text || !text.trim()) return null;

    return await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bridge-Relay': 'NelBot-Bridge'
      },
      body: JSON.stringify({
        username,
        avatar_url: avatarUrl,
        content: text.slice(0, 2000) // Batas karakter Discord
      })
    });
  } catch (err) {
    console.error('[Bridge Error] Gagal forward ke Discord Webhook:', err.message);
    return null;
  }
}
