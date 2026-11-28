/*
wa.me/6282285357346
github: https://github.com/sadxzyq
Instagram: https://instagram.com/tulisan.ku.id
ini wm gw cok jan di hapus
*/

let handler = async (m, {
    conn
}) => {
    conn.bomb = conn.bomb || {};
    let id = m.chat,
        timeout = 180000;
    if (id in conn.bomb) return conn.reply(m.chat, '*^ sesi ini belum selesai!*', conn.bomb[id][0]);
    const bom = ['💥', '✅', '✅', '✅', '✅', '✅', '✅', '✅', '✅'].sort(() => Math.random() - 0.5);
    const number = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    const array = bom.map((v, i) => ({
        emot: v,
        number: number[i],
        position: i + 1,
        state: false
    }));
    let teks = `乂  *B O M B*\n\nKirim angka *1* - *9* untuk membuka *9* kotak nomor di bawah ini :\n\n`;
    for (let i = 0; i < array.length; i += 3) teks += array.slice(i, i + 3).map(v => v.state ? v.emot : v.number).join('') + '\n';
    teks += `\nTimeout : [ *${((timeout / 1000) / 60)} menit* ]\nApabila mendapat kotak yang berisi bom maka point akan di kurangi.`;
    let msg = await conn.reply(m.chat, teks, m);
    let { key } = msg

    let v;
    conn.bomb[id] = [
        msg,
        array,
        setTimeout(() => {
            v = array.find(v => v.emot == '💥');
            if (conn.bomb[id]) conn.reply(m.chat, `*Waktu habis!*, Bom berada di kotak nomor ${v.number}.`, conn.bomb[id][0].key);
            delete conn.bomb[id];
        }, timeout),
        key
    ];

};

handler.help = ["bomb"];
handler.tags = ["game"];
handler.command = /^(bomb)$/i;

handler.desc = 'Memulai permainan kuis interaktif bom di dalam grup WhatsApp.'
handler.tutorial = [
  '.bomb',
  'Ketik jawaban langsung di obrolan setelah soal dikirimkan oleh bot'
]

export default handler;