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
    case 'leave':
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
      checkAdmin()
      chat.useDocument = isEnable
      break

    case 'public':
    case 'self':
    case 'restrict':
    case 'nyimak':
    case 'autoread':
    case 'autobio':
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
      
      if (!global.db.data.settings['bot']) global.db.data.settings['bot'] = {}
      let finalOptKey = type === 'public' || type === 'self' ? 'self' : type.replace('only', 'only').replace('private', 'pc').replace('group', 'gc').replace('status', 'sw')
      global.db.data.settings['bot'][finalOptKey] = (type === 'public' || type === 'self') ? global.opts.self : isEnable
      break

    default:
      if (!/[01]/.test(command)) {
        return m.reply(`
*≡ SETTINGS ADMIN (GRUP)*
○ welcome
○ leave
○ antispam
○ antilink
○ antitoxic
○ antisticker
○ antiimage
○ antidelete
○ onlyadmin
○ detect
○ document
○ viewonce
○ nsfw
○ menu
○ simi
○ autogpt

*≡ SETTINGS OWNER (GLOBAL)*
○ public
○ self
○ restrict
○ nyimak
○ autoread
○ autobio
○ gconly
○ pconly
○ pconlyprem
○ owneronly
○ swonly

*Contoh:*
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