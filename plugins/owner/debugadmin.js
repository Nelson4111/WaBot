let handler = async (m, { conn, participants }) => {
    let botJid = conn.decodeJid(conn.user.id)
    let senderJid = conn.decodeJid(m.sender)
    
    let botFound = participants.find(u => {
        let uJid = conn.decodeJid(u.id || u.jid)
        return uJid === botJid || u.lid === botJid || u.id === botJid || u.jid === botJid
    })
    
    let userFound = participants.find(u => {
        let uJid = conn.decodeJid(u.id || u.jid)
        return uJid === senderJid || u.lid === senderJid || u.id === senderJid || u.jid === senderJid
    })

    let isRAdmin = userFound?.admin === 'superadmin' || userFound?.isSuperAdmin || false
    let isAdmin = isRAdmin || userFound?.admin === 'admin' || userFound?.isAdmin || false
    let isBotAdmin = botFound?.admin === 'admin' || botFound?.admin === 'superadmin' || botFound?.isAdmin || botFound?.isSuperAdmin || false

    let txt = `*DEBUG ADMIN INFO*\n\n`
    txt += `*conn.user.id*: ${conn.user.id}\n`
    txt += `*conn.decodeJid(conn.user.id)*: ${botJid}\n\n`
    
    txt += `*BOT FOUND IN PARTICIPANTS*: ${botFound ? 'Yes' : 'No'}\n`
    if (botFound) {
        txt += `*botFound.id*: ${botFound.id}\n`
        txt += `*botFound.admin*: ${botFound.admin}\n`
        txt += `*botFound.isAdmin*: ${botFound.isAdmin}\n`
        txt += `*botFound.isSuperAdmin*: ${botFound.isSuperAdmin}\n`
        txt += `*isBotAdmin (calc)*: ${isBotAdmin}\n\n`
    }

    txt += `*USER FOUND IN PARTICIPANTS*: ${userFound ? 'Yes' : 'No'}\n`
    if (userFound) {
        txt += `*userFound.id*: ${userFound.id}\n`
        txt += `*userFound.admin*: ${userFound.admin}\n`
        txt += `*isAdmin (calc)*: ${isAdmin}\n\n`
    }

    txt += `*First 3 participants dump*:\n`
    txt += JSON.stringify(participants.slice(0, 3), null, 2)

    await m.reply(txt)
}
handler.help = ['debugadmin']
handler.tags = ['owner']
handler.command = /^debugadmin$/i
handler.owner = true

export default handler
