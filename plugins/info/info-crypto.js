import fetch from 'node-fetch'

const dolar = n =>
  '$' + Number(n).toLocaleString('en-US')

let handler = async (m, { conn }) => {
  try {
    await m.react('🕒')

    let res = await fetch('https://zelapioffciall.koyeb.app/live/market')
    let json = await res.json()
    if (!json.status || !Array.isArray(json.data)) throw json

    let list = json.data.slice(0, 10)

    let teks =
      '📊 *CRYPTO MARKET LIVE*\n' +
      '━━━━━━━━━━━━━━━━━━\n\n'

    for (let i of list) {
      let change = i.price_change_percentage_24h
      let emoji = change > 0 ? '🟢' : change < 0 ? '🔴' : '⚪'

      teks +=
        `#${i.market_cap_rank} ${i.name} (${i.symbol})\n` +
        `💰 Price : ${dolar(i.current_price)}\n` +
        `${emoji} 24h    : ${change?.toFixed(2) || 0}%\n` +
        `🏦 MCap  : ${dolar(i.market_cap)}\n` +
        `🔄 Vol   : ${dolar(i.total_volume)}\n` +
        '━━━━━━━━━━━━━━━━━━\n'
    }

    await conn.sendMessage(m.chat, { text: teks.trim() }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('Error')
  }
}

handler.help = ['crypto']
handler.tags = ['info']
handler.command = /^crypto$/i

export default handler