import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  conn.pakasir = conn.pakasir || {};

  if (text.toLowerCase() === 'batal') {
    if (!conn.pakasir[m.sender]) return conn.sendMessage(m.chat, { text: 'Tidak ada transaksi aktif.' }, { quoted: m });
    
    if (conn.pakasir[m.sender].msg) {
        await conn.sendMessage(m.chat, { delete: conn.pakasir[m.sender].msg.key }).catch(e => e)
    }
    
    conn.pakasir[m.sender].status = 'CANCELLED';
    return conn.sendMessage(m.chat, { text: 'Donasi berhasil dibatalkan.' }, { quoted: m });
  }

  try {
    if (conn.pakasir[m.sender]) return conn.sendMessage(m.chat, { text: `Selesaikan donasi sebelumnya atau ketik ${usedPrefix + command} batal` }, { quoted: m });
    
    if (!text) return conn.sendMessage(m.chat, { text: `Contoh: ${usedPrefix + command} 5000` }, { quoted: m });

    let amount = parseInt(text.replace(/\D/g, ''));
    if (isNaN(amount) || amount < 1000)
      return conn.sendMessage(m.chat, { text: 'Minimal donasi Rp 1.000' }, { quoted: m });

    let project = global.pakasir_project;
    let api_key = global.pakasir_api_key;

    if (!project || !api_key) return conn.sendMessage(m.chat, { text: 'API Pakasir belum disetting di config.js' }, { quoted: m });

    let order_id = `DONASI-${Date.now()}`;

    let createResRaw = await fetch("https://app.pakasir.com/api/transactioncreate/qris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, api_key, order_id, amount })
    });

    let createRes = await createResRaw.json();
    let payment = createRes.payment || createRes;

    if (!payment || (!payment.payment_number && !createRes.code))
      return conn.sendMessage(m.chat, { text: 'Gagal membuat QRIS.' }, { quoted: m });

    let payCode = createRes.code || payment.code || "";
    let qrisString = payment.payment_number || createRes.qris_string || "";

    let qrBuffer;
    if (payCode) {
      qrBuffer = await fetch(`https://app.pakasir.com/qris/${payCode}.png`).then(r => r.arrayBuffer());
    } else if (qrisString) {
      qrBuffer = await fetch(`https://quickchart.io/qr?text=${encodeURIComponent(qrisString)}&size=500&format=png`).then(r => r.arrayBuffer());
    }

    let invoiceText = `
─── 💳 *DONASI BOT* ───
Order ID: ${order_id}
Nominal: Rp ${amount.toLocaleString()}

Silahkan scan QRIS di atas.
Pesan ini akan terhapus otomatis setelah bayar.
Ketik *${usedPrefix + command} batal* untuk membatalkan.
─────────────────
`.trim();

    let qrMsg = await conn.sendMessage(m.chat, {
      image: Buffer.from(qrBuffer),
      caption: invoiceText
    }, { quoted: m });

    conn.pakasir[m.sender] = { 
        order_id, 
        status: 'PENDING',
        msg: qrMsg 
    };

    let attempts = 0;
    while (attempts < 60) { 
      await new Promise(r => setTimeout(r, 5000));

      if (!conn.pakasir[m.sender] || conn.pakasir[m.sender].status === 'CANCELLED') {
        delete conn.pakasir[m.sender];
        return;
      }

      let detailUrl = `https://app.pakasir.com/api/transactiondetail?project=${encodeURIComponent(project)}&amount=${encodeURIComponent(amount)}&order_id=${encodeURIComponent(order_id)}&api_key=${encodeURIComponent(api_key)}`;
      let detRaw = await fetch(detailUrl);
      let det = await detRaw.json();
      let tx = det.transaction || det || {};
      let status = (tx.status || "").toString().toUpperCase();

      if (status.includes("SUCCESS") || status.includes("COMPLETED") || status.includes("BERHASIL")) {
        await conn.sendMessage(m.chat, { delete: qrMsg.key }).catch(e => e)

        let user = global.db.data.users[m.sender];
        let settings = global.db.data.settings[conn.user.jid];

        user.totalDonasi = (user.totalDonasi || 0) + amount;
        settings.totalDonasi = (settings.totalDonasi || 0) + amount;
        
        await conn.sendMessage(m.chat, { 
            text: `✅ *DONASI BERHASIL*\n\nTerima kasih @${m.sender.split('@')[0]}! Donasi sebesar *Rp ${amount.toLocaleString()}* telah diterima.\n\nTotal donasi Anda: *Rp ${user.totalDonasi.toLocaleString()}*`,
            mentions: [m.sender]
        }, { quoted: m });

        let report = `
📢 *LAPORAN DONASI MASUK*
─────────────────
• *Nama:* ${m.pushName}
• *ID:* wa.me/${m.sender.split('@')[0]}
• *Nominal:* Rp ${amount.toLocaleString()}
• *Order ID:* ${order_id}
• *Total Global:* Rp ${settings.totalDonasi.toLocaleString()}
─────────────────
`.trim();
        await conn.sendMessage(global.owner[0] + '@s.whatsapp.net', { text: report });

        delete conn.pakasir[m.sender];
        return;
      }

      if (status.includes("FAILED") || status.includes("EXPIRED")) {
        await conn.sendMessage(m.chat, { delete: qrMsg.key }).catch(e => e)
        conn.sendMessage(m.chat, { text: `Donasi Gagal/Expired.` }, { quoted: m });
        delete conn.pakasir[m.sender];
        return;
      }
      attempts++;
    }
    
    await conn.sendMessage(m.chat, { delete: qrMsg.key }).catch(e => e)
    delete conn.pakasir[m.sender];

  } catch (e) {
    console.log(e);
    delete conn.pakasir[m.sender];
  }
};

handler.help = ["donasi <nominal>"];
handler.tags = ["main"];
handler.command = ['donasi']
handler.private = true

export default handler;