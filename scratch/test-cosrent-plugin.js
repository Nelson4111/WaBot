import handler from '../plugins/info/cosrent.js'

async function runTest() {
  console.log('=== TEST 1: DEFAULT OVERVIEW ===')
  let m1 = {
    sender: 'user1@s.whatsapp.net',
    name: 'Nenel-san',
    chat: 'chat1@s.whatsapp.net',
    reply: (txt) => {
      console.log('REPLY 1:');
      console.log(txt);
    }
  }
  let connMock = {
    sendMessage: async (chat, content) => {
      console.log('SEND_MESSAGE IMAGE URL:', content.image?.url);
      console.log('CAPTION:\n', content.caption);
    }
  }

  await handler(m1, { conn: connMock, text: '', usedPrefix: '.', command: 'cosrent' })

  console.log('\n=== TEST 2: SEARCH QUERY ("jingliu") ===')
  await handler(m1, { conn: connMock, text: 'jingliu', usedPrefix: '.', command: 'cosrent' })

  console.log('\n=== TEST 3: DETAIL VIEW ("detail 1") ===')
  await handler(m1, { conn: connMock, text: 'detail 1', usedPrefix: '.', command: 'cosrent' })

  console.log('\n=== TEST 4: LOCATION FILTER ("kota bekasi") ===')
  await handler(m1, { conn: connMock, text: 'kota bekasi', usedPrefix: '.', command: 'cosrent' })

  console.log('\n=== TEST 5: SERIES FILTER ("series honkai") ===')
  await handler(m1, { conn: connMock, text: 'series honkai', usedPrefix: '.', command: 'cosrent' })

  console.log('\n✅ All cosrent plugin tests completed successfully!')
}

runTest().catch(console.error)
