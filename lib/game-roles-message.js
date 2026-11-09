import { getMenuThumbnail } from './style.js'
import { getImagePath } from './game-roles-media.js'

export async function buildGameRolesHeaderMessage(conn, jid, text, image, options = {}) {
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
    if (options.mentions?.length) {
        button.setContextInfo({ mentionedJid: options.mentions })
    }

    return button.build(jid)
}

export async function sendGameRolesHeader(conn, jid, text, image, quoted, options = {}) {
    const buttons = options.buttons || []
    const mentions = options.mentions || []
    const imagePath = getImagePath(image)
    const rawThumbnail = imagePath ? await getMenuThumbnail(imagePath) : null

    if ((image || buttons.length) && typeof conn.sendButtonV2 === 'function') {
        try {
            return await conn.sendButtonV2(jid, {
                title: options.title || 'GAME ROLES',
                subtitle: options.subtitle || '',
                text,
                footer: options.footer || 'Avelia • Game Roles',
                ...(rawThumbnail ? { rawThumbnail } : image ? { buffer: image } : {}),
                buttons,
                ...(mentions.length ? { contextInfo: { mentionedJid: mentions } } : {}),
                noLocationHeader: false
            }, quoted)
        } catch (error) {
            console.warn(`[Game Roles] Header card send failed: ${error.message}`)
        }
    }

    if (buttons.length && typeof conn.sendButton === 'function') {
        return conn.sendButton(jid, text, options.footer || 'Avelia • Game Roles', image, buttons, quoted)
    }
    if (!image) {
        return conn.sendMessage(jid, { text, ...(mentions.length ? { mentions } : {}) }, quoted ? { quoted } : {})
    }
    return conn.sendMessage(jid, {
        image,
        caption: text,
        ...(mentions.length ? { mentions } : {})
    }, quoted ? { quoted } : {})
}
