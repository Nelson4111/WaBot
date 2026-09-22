/**
 * Bot & Group Feature Toggle Manager
 * Mengatur aktif/tidaknya fitur grup dan fitur global owner
 * Style: Zen Shinto Aesthetic (STYLE_GUIDE.md)
 */

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat] || {}
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
    case 'antitag':
    case 'antitagsw':
    case 'antisw':
    case 'antiswgc':
    case 'antistatusgc':
    case 'viewonce':
    case 'document':
    case 'menu':
    case 'voice':
    case 'autovn':
    case 'vn':
      checkAdmin()
      let dbName = type === 'antilink' ? 'antiLink' : 
                   type === 'antitoxic' ? 'antiToxic' : 
                   type === 'antisticker' ? 'antiSticker' : 
                   type === 'antiimage' ? 'antiImage' : 
                   type === 'antitag' ? 'antiTag' : 
                   (type === 'antitagsw' || type === 'antisw') ? 'antiTagSw' : 
                   (type === 'antiswgc' || type === 'antistatusgc') ? 'antiSwgc' : 
                   type === 'antidelete' ? 'delete' : 
                   type === 'document' ? 'useDocument' : 
                   (type === 'autovn' || type === 'vn') ? 'voice' : type

      chat[dbName] = isEnable
      if (type === 'antitagsw' || type === 'antisw') {
        chat.antiTagSwCount = {}
        chat.antitagsw = { status: isEnable, count: {} }
      }
      if (type === 'voice' || type === 'autovn' || type === 'vn') {
        if (global.db?.data?.voice?.groups) {
          global.db.data.voice.groups[m.chat] = global.db.data.voice.groups[m.chat] || {}
          global.db.data.voice.groups[m.chat].disabled = !isEnable
        }
      }
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
    case 'voicegc':
    case 'voicepc':
      isAll = true
      if (!isROwner && !isOwner) {
        global.dfail('rowner', m, conn)
        throw false
      }
      if (type === 'public') global.opts.self = !isEnable
      else if (type === 'self') global.opts.self = isEnable
      else if (type === 'voicegc' || type === 'voicepc') {
        if (!global.db.data.voice) global.db.data.voice = {}
        if (!global.db.data.voice.settings) global.db.data.voice.settings = {}
        if (type === 'voicegc') global.db.data.voice.settings.group = isEnable
        if (type === 'voicepc') global.db.data.voice.settings.pc = isEnable
        break
      } else {
        let optKey = type.replace('only', 'only').replace('private', 'pc').replace('group', 'gc').replace('status', 'sw')
        global.opts[optKey] = isEnable
      }
      
      if (!global.db.data.settings) global.db.data.settings = {}
      if (!global.db.data.settings['bot']) global.db.data.settings['bot'] = {}
      let finalOptKey = type === 'public' || type === 'self' ? 'self' : type.replace('only', 'only').replace('private', 'pc').replace('group', 'gc').replace('status', 'sw')
      global.db.data.settings['bot'][finalOptKey] = (type === 'public' || type === 'self') ? global.opts.self : isEnable
      break

    default:
      if (!/[01]/.test(command)) {
        const status = (val) => val ? '✓ ᴀᴋᴛɪꜰ' : '✕ ᴍᴀᴛɪ'

        const helpText = `*──  ୨୧ ✧ PENGATURAN FITUR ✧ ୨୧  ──*

> *おしらせ!* (ꜱᴇᴛᴛɪɴɢꜱ ᴅᴀꜱʜʙᴏᴀʀᴅ)
> Kelola perlindungan grup dan fungsionalitas bot secara langsung.

*╭  〔 ❖ ꜰ ɪ ᴛ ᴜ ʀ  ɢ ʀ ᴜ ᴘ 〕*
*┆* ⟡ welcome     : *${status(chat.welcome)}*
*┆* ✧ leave       : *${status(chat.leave)}*
*┆* ✦ antispam    : *${status(chat.antispam)}*
*┆* ◈ antilink    : *${status(chat.antiLink)}*
*┆* ⟡ antitoxic   : *${status(chat.antiToxic)}*
*┆* ✧ antisticker : *${status(chat.antiSticker)}*
*┆* ✦ antiimage   : *${status(chat.antiImage)}*
*┆* ◈ antitag     : *${status(chat.antiTag)}*
*┆* ⟡ antitagsw   : *${status(chat.antiTagSw || chat.antitagsw?.status)}*
*┆* ✦ antiswgc    : *${status(chat.antiSwgc)}*
*┆* ⟡ antidelete  : *${status(chat.delete)}*
*┆* ✧ onlyadmin   : *${status(chat.onlyadmin)}*
*┆* ✦ detect      : *${status(chat.detect)}*
*┆* ◈ document    : *${status(chat.useDocument)}*
*┆* ⟡ viewonce    : *${status(chat.viewonce)}*
*┆* ✧ menu        : *${status(chat.menu)}*
*┆* ⟡ voice       : *${status(chat.voice !== false && !global.db?.data?.voice?.groups?.[m.chat]?.disabled)}*
*╰───────────────*

*╭  〔 ⌬ ꜰ ɪ ᴛ ᴜ ʀ  ᴏ ᴡ ɴ ᴇ ʀ 〕*
*┆* › public • self • restrict • nyimak
*┆* › autoread • autobio • gconly • pconly
*┆* › pconlyprem • owneronly • swonly
*┆* › voicegc • voicepc
*╰───────────────*

*╭  〔 ◈ ᴄ ᴀ ʀ ᴀ  ᴘ ᴇ ɴ ɢ ɢ ᴜ ɴ ᴀ ᴀ ɴ 〕*
*┆* › Mengaktifkan : *${usedPrefix}enable <opsi>*
*┆* › Mematikan    : *${usedPrefix}disable <opsi>*
*┆* › Contoh       : *${usedPrefix}enable antilink*
*╰───────────────*`.trim()

        return m.reply(helpText)
      }
      throw false
  }

  const successText = `*╭  〔 ❖ ꜱ ᴇ ᴛ ᴛ ɪ ɴ ɢ  ᴅ ɪ ᴘ ᴇ ʀ ʙ ᴀ ʀ ᴜ ɪ 〕*
*┆* ⟡ ꜰɪᴛᴜʀ  : *${type}*
*┆* ✧ ꜱᴛᴀᴛᴜꜱ : *${isEnable ? 'Aktif (ON)' : 'Nonaktif (OFF)'}*
*┆* ✦ ʀᴜᴀɴɢ  : *${isAll ? 'Seluruh Sistem Bot' : 'Grup Ini'}*
*╰───────────────*`.trim()

  m.reply(successText)
}

handler.help = ['enable <option>', 'disable <option>']
handler.tags = ['group', 'owner']
handler.command = /^(enable|disable|on|off|1|0)$/i

export default handler