import fetch from 'node-fetch';

let sessions = {};

const gemini = {
    getNewCookie: async () => {
        let r = await fetch("https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c", {
            headers: { "content-type": "application/x-www-form-urlencoded;charset=UTF-8" },
            body: "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
            method: "POST"
        });
        let ck = r.headers.get("set-cookie");
        if (!ck) throw Error("Cookie gagal didapatkan.");
        return ck.split(";")[0];
    },

    ask: async (p, prev = null) => {
        if (!p?.trim()) throw Error("Masukkan pertanyaan!");
        let r = null, c = null;
        if (prev) {
            let j = JSON.parse(Buffer.from(prev, 'base64').toString());
            r = j.newResumeArray, c = j.cookie;
        }
        let h = { 
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8", 
            "x-goog-ext-525001261-jspb": "[1,null,null,null,\"9ec249fc9ad08861\",null,null,null,[4]]", 
            cookie: c || await gemini.getNewCookie() 
        };
        let b = [[p], ["en-US"], r], a = [null, JSON.stringify(b)];
        let body = new URLSearchParams({ "f.req": JSON.stringify(a) });
        let x = await fetch("https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&f.sid=4206607810970164620&hl=en-US&_reqid=2813378&rt=c", { headers: h, body, method: "post" });
        
        if (!x.ok) throw Error(`Error: ${x.status}`);
        
        let d = await x.text();
        let lines = d.split('\n');
        let m = lines.find(line => line.includes('[[') && line.includes('wrb.fr'));
        
        if (!m) throw Error("Gagal parsing respons dari Gemini.");
        
        let p1 = JSON.parse(JSON.parse(m)[0][2]);
        let text = p1[4][0][1][0].replace(/\*\*(.+?)\*\*/g, "*$1*");
        let id = Buffer.from(JSON.stringify({ newResumeArray: [...p1[1], p1[4][0][0]], cookie: h.cookie })).toString('base64');
        
        return { text, id };
    }
};

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Contoh:* ${usedPrefix + command} Apa Itu JavaScript`);
    
    try {
        let s = sessions[m.sender], p = s && s.expire > Date.now() ? s.id : null;
        let r = await gemini.ask(text, p);
        
        sessions[m.sender] = { id: r.id, expire: Date.now() + 86400000 };

        await m.reply(r.text.trim());

    } catch (e) {
        console.error(e);
        m.reply("Gagal mendapatkan respon. Coba lagi nanti.");
    }
};

handler.help = ['gemini'];
handler.command = ['gemini'];
handler.tags = ['ai'];

export default handler;