let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let type = (args[0] || '').toLowerCase()
  let isAll = false

  const checkAdmin = () => {
    if (m.isGroup && !isAdmin && !isOwner) {
      global.dfail('admin', m, conn)
      throw false
    }
  }

  switch (type) {
    case 'welcome':
    case 'detect':
    case 'antispam':
    case 'antidelete':
    case 'onlyadmin':
    case 'antilink':
    case 'antitoxic':
    case 'antisticker':
    case 'antiimage':
    case 'viewonce':
    case 'nsfw':
    case 'menu':
    case 'simi':
    case 'autogpt':
      checkAdmin()
      let dbName = type === 'antilink' ? 'antiLink' : 
                   type === 'antitoxic' ? 'antiToxic' : 
                   type === 'antisticker' ? 'antiSticker' : 
                   type === 'antiimage' ? 'antiImage' : 
                   type === 'antidelete' ? 'delete' : type
      chat[dbName] = isEnable
      break

    case 'document':
      chat.useDocument = isEnable
      break

    case 'public':
    case 'self':
    case 'restrict':
    case 'nyimak':
    case 'autoread':
    case 'pconly':
    case 'privateonly':
    case 'pconlyprem':
    case 'owneronly':
    case 'gconly':
    case 'grouponly':
    case 'swonly':
    case 'statusonly':
      isAll = true
      if (!isROwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      if (type === 'public') global.opts.self = !isEnable
      else if (type === 'self') global.opts.self = isEnable
      else {
        let optKey = type.replace('only', 'only').replace('private', 'pc').replace('group', 'gc').replace('status', 'sw')
        global.opts[optKey] = isEnable
      }
      break

    default:
      if (!/[01]/.test(command)) {
        return m.reply(`
List option:
| antispam
| antilink
| antitoxic
| antisticker
| antiimage
| antidelete
| onlyadmin
| welcome
| detect
| document
| gconly
| menu
| nsfw
| nyimak
| owneronly
| pconly
| pconlyprem
| public
| self
| simi
| swonly
| viewonce
| autogpt

Contoh:
${usedPrefix}enable welcome 
${usedPrefix}disable welcome 
`.trim())
      }
      throw false
  }

  m.reply(`
*${type}* berhasil di *${isEnable ? 'nyala' : 'mati'}kan*
${isAll ? 'untuk bot ini' : 'untuk chat ini'}
`.trim())
}

handler.help = ['enable <option>', 'disable <option>']
handler.tags = ['group', 'owner']
handler.command = /^(enable|disable|on|off|1|0)$/i

export default handler