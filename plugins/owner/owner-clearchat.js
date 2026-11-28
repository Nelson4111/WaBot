let handler = async (m, { conn, args }) => {
    try {
        if (!args[0]) throw 'Input Jid People/Groups'
        const jid = args[0]
        await conn.chatModify({
          delete: true,
          lastMessages: [{
            key: m.key,
            messageTimestamp: m.messageTimestamp
          }]
        }, jid);
      conn.reply(m.chat, `Success Delete Chat for ${jid}`, m);
    } catch (error) {
      console.error(error);
      conn.reply(m.chat, 'Terjadi Kesalahan Saat Menghapus Chat, Mohon Perhatikan Jidnya', m);
    }
  }

  handler.help = ['clearchat']
  handler.tags = ['owner']
  handler.owner = true
  handler.command = /^(clearchat)$/i

  handler.desc = 'Perintah khusus Owner bot untuk mengelola dan mengatur clearchat.'
handler.tutorial = [
  '.clearchat',
  'Hanya dapat dijalankan oleh Owner bot'
]

export default handler