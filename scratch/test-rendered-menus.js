import menuHandler from '../plugins/menu/menu.js';
import dlHandler from '../plugins/menu/menu-download.js';

// Setup globals
global.namebot = 'NelBot-MD';
global.author = 'Nenel';
global.versi = '4.0.0';
global.db = {
  data: {
    users: {
      'user1@s.whatsapp.net': {
        name: 'Nenel',
        limit: 100,
        role: 'Master',
        premiumTime: 9999999999,
        pasangan: []
      }
    }
  }
};
global.plugins = {
  'tiktok': { help: ['tiktok <url>'], tags: ['downloader'], limit: 1 },
  'youtube': { help: ['ytmp3 <url>', 'ytmp4 <url>'], tags: ['downloader'], premium: true },
  'spotify': { help: ['spotify <judul>'], tags: ['downloader'] }
};

const m = {
  sender: 'user1@s.whatsapp.net',
  pushName: 'Nenel-san',
  chat: 'chat1@s.whatsapp.net',
  reply: (txt) => console.log('REPLY:\n' + txt)
};

const conn = {
  getName: async () => 'Nenel',
  sendMessage: async (chat, content) => {
    console.log('--- SENT MESSAGE ---');
    console.log(content.caption || content.text);
  }
};

async function test() {
  console.log('=== MAIN MENU TEST ===');
  await menuHandler(m, { conn, usedPrefix: '.' });

  console.log('\n=== SUBMENU (DOWNLOADER) TEST ===');
  await dlHandler(m, { conn, usedPrefix: '.' });
}

test().catch(console.error);
