import { getMenuThumbnail } from './style.js'
import { getImagePath } from './game-roles-media.js'

const createGameRolesButton = async (conn, jid, text, image, quoted, options) => {
    if (typeof conn.ButtonV2 !== 'function') {
        throw new Error('ButtonV2 tidak tersedia untuk membuat header Game Roles.')
    }

    const button = new conn.ButtonV2(conn)
    button.setTitle(options.title || 'GAME ROLES')
    if (options.subtitle) button.setSubtitle(options.subtitle)
    button.setBody(text)
    button.setFooter(options.footer || 'Avelia • Game Roles')

    const imagePath = getImagePath(image)
    const thumbnail = imagePath ? await getMenuThumbnail(imagePath) : image
    if (thumbnail) button.setRawThumbnail(thumbnail)

    for (const [label, id] of options.buttons || []) {
        button.addButton(label, id)
    }
    const contextInfo = { ...(options.contextInfo || {}) }
    if (quoted) {
        Object.assign(contextInfo, {
            stanzaId: quoted.key?.id,
            participant: quoted.sender || quoted.key?.participant || quoted.key?.remoteJid,
            quotedMessage: quoted.message || (quoted.vM ? quoted.vM.message : undefined)
        })
    }
    if (options.mentions?.length) contextInfo.mentionedJid = options.mentions
    if (Object.keys(contextInfo).length) button.setContextInfo(contextInfo)

    return button
}

export async function buildGameRolesHeaderMessage(conn, jid, text, image, options = {}) {
    const button = await createGameRolesButton(conn, jid, text, image, null, options)
    return button.build(jid)
}

export async function sendGameRolesHeader(conn, jid, text, image, quoted, options = {}) {
    const buttons = options.buttons || []
    const mentions = options.mentions || []

    if (image && typeof conn.ButtonV2 !== 'function') {
        throw new Error('ButtonV2 tidak tersedia; gambar Game Roles tidak dikirim sebagai foto biasa.')
    }

    if (buttons.length && typeof conn.ButtonV2 === 'function') {
        try {
            const button = await createGameRolesButton(conn, jid, text, image, quoted, options)
            return await button.send(jid)
        } catch (error) {
            console.error('[Game Roles] Header card send failed:', error)
            throw error
        }
    }

    if (!conn.ButtonV2 && buttons.length && typeof conn.sendButton === 'function') {
        return conn.sendButton(jid, text, options.footer || 'Avelia • Game Roles', image, buttons, quoted)
    }
    return conn.sendMessage(jid, { text, ...(mentions.length ? { mentions } : {}) }, quoted ? { quoted } : {})
}
