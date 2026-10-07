import { buyLimit } from '../../lib/limitShop.js'

let handler = async (m, { args, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  const isMoney = /money|uang/i.test(command) || (args[1] && /money|uang/i.test(args[1]))
  return buyLimit(m, user, isMoney ? [args[0], 'money'] : args, usedPrefix)
}

handler.help = ['buylimit <jumlah|all> [money]', 'buylimitmoney <jumlah|all>']
handler.tags = ['game', 'rpg']
handler.command = /^(buylimit|buylimitmoney|buylimituang)$/i

export default handler