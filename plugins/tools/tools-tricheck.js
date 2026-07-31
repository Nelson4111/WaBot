/**
 ╔══════════════════════
      ⧉  [tricheck] — [tool]
╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
  ✺ Creator  : SXZnightmare
  ✺ Scrape      : 
  [ https://gist.github.com/whofik/553fd856c89138aafdec97bf5639cebe ]
  ✺ Scrape Maker : [ whofik ]
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(
                `Contoh: ${usedPrefix + command} 62897xxxxxxx\n\n` +
                `📌 *Prefix SIM TRI:* 0895, 0896, 0897, 0898, 0899\n` +
                `🌍 Format internasional: 62895–62899`
            );
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        let msisdn = text.replace(/[^0-9]/g, '');

        if (msisdn.startsWith('08')) {
            msisdn = '62' + msisdn.slice(1);
        }

        const triPrefix = /^(6289[5-9])/;

        if (!triPrefix.test(msisdn)) {
            return m.reply(`*Nomor bukan prefix SIM TRI (0895–0899).*`);
        }

        const response = await fetch("https://tri.co.id/api/v1/information/sim-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "sec-ch-ua-platform": '"Android"',
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "sec-ch-ua": '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
                "sec-ch-ua-mobile": "?1",
                "Origin": "https://tri.co.id",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Dest": "empty",
                "Referer": "https://tri.co.id/",
                "Accept-Language": "id,en-US;q=0.9,en;q=0.8,ar;q=0.7"
            },
            body: JSON.stringify({
                action: "MSISDN_STATUS_WEB",
                input1: "",
                input2: "",
                language: "ID",
                msisdn
            })
        });

        const result = await response.json();

        if (!result?.status) {
            return m.reply(`*Nomor tidak valid atau bukan SIM TRI.*`);
        }

        const data = result.data;

        if (!data || data.responseCode !== "00000") {
            return m.reply(`*Nomor tidak valid atau bukan SIM TRI.*`);
        }

        const getStatusEmoji = (status) => {
            const s = status?.toLowerCase() || '';
            if (s.includes('aktif')) return '✅';
            if (s.includes('non')) return '❌';
            if (s.includes('blok')) return '🔒';
            return '❓';
        };

        const now = new Date();
        const endDate = data.actEndDate ? new Date(data.actEndDate) : null;
        const remainingDays = endDate && !isNaN(endDate)
            ? Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)))
            : '-';

        let caption = `📡 *INFORMASI SIM CARD*
═══════════════════

📋 *INFORMASI UMUM*
   📱 Nomor       : ${data.msisdn}
   🆔 ICCID       : ${data.iccid}

📊 *STATUS LAYANAN*
   ${getStatusEmoji(data.cardStatus)} Kartu      : ${data.cardStatus}
   ${getStatusEmoji(data.activationStatus)} Registrasi : ${data.activationStatus}

📅 *MASA BERLAKU*
   🟢 Aktivasi    : ${data.activationDate || '-'}
   🔴 Berakhir    : ${data.actEndDate || '-'}
   ⏱️ Sisa waktu  : ${remainingDays} hari

📦 *PRODUK & DISTRIBUSI*
   📦 Produk      : ${data.prodDesc || '-'}
   📍 Wilayah     : ${data.retDistrict || '-'}

═══════════════════
🕐 ${new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}`;

        await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

    } catch (e) {
        await m.reply(`🍂 *Terjadi kesalahan saat memproses.*`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['tricheck'];
handler.tags = ['tools'];
handler.command = /^(tricheck)$/i;
handler.limit = false;
handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

export default handler;