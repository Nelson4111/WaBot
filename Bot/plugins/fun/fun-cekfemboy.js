let handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
  
  let hasil = pickRandom(femboy)
  let caption = `*cek femboy*\n\n`
  caption += `User: @${user.split('@')[0]}\n`
  caption += `${hasil}`

  conn.sendMessage(m.chat, { text: caption, mentions: [user] }, { quoted: m })
}

handler.help = ['femboycek', 'cekfemboy']
handler.tags = ['fun']
handler.command = /^(femboycek|cekfemboy)$/i

export default handler

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

const femboy = [
  'Femboy Level : 0%\n\nFix, ini mah spek kuli panggul pasar, gak cocok pantek jadi femboy',
  'Femboy Level : 5%\n\nMuka brewokan gini kok mau jadi femboy? Tobat bang',
  'Femboy Level : 10%\n\nCuma berani pake filter snapchat doang ya?',
  'Femboy Level : 18%\n\nBaru level coba-coba pake skincare punya kakaknya.',
  'Femboy Level : 25%\n\nSuaranya masih ngebass banget, mending jadi qori aja.',
  'Femboy Level : 33%\n\nPotensi ada, tapi otot lengannya masih terlalu sangar.',
  'Femboy Level : 40%\n\nUdah mulai pinter milih outfit aesthetic ya dek.',
  'Femboy Level : 50%\n\nSetengah maskulin, setengah feminin. Bingung liatnya.',
  'Femboy Level : 58%\n\nCukup imut, tapi kalau lari masih kayak pemain bola.',
  'Femboy Level : 65%\n\nUdah cocok pake wig, tinggal pinter makeup aja.',
  'Femboy Level : 72%\n\nCowok-cowok udah mulai lirik nih, hati-hati!',
  'Femboy Level : 80%\n\nSpek idaman para penyuka pemboi.',
  'Femboy Level : 88%\n\nBuset, ini kalau pake rok pasti banyak yang ketipu!',
  'Femboy Level : 95%\n\nCantik banget anjir, hampir mau gw pacarin!',
  'Femboy Level : 100%\n\nTHE REAL ASTOLFO! Gak perlu diragukan lagi.',
  'Femboy Level : -50%\n\nINI MAH KOMANDAN KOPASSUS,gak cocok jadi femboy',
  'Femboy Level : 44%\n\nBaru tahap "shaving" kaki, semangat ya jadi femboynya',
  'Femboy Level : 91%\n\nAuto dapet rank SSS di komunitas trap.',
  'Femboy Level : 15%\n\nJangan dipaksain bang,lu gak ada montok nya.',
  'Femboy Level : 69%\n\nNice level Imutnya pas, nakalnya pas.',
  'Femboy Level : 3%\n\nBau oli samping, fix bukan femboy.',
  'Femboy Level : 99%\n\nSatu langkah lagi menuju jalan sesat yang sempurna!'
]