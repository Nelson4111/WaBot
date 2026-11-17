export async function sendGameResult(conn, {
    chat,
    text,
    image,
    title,
    subtitle,
    footer,
    buttons,
    quoted,
    mentions = []
}) {
    const contextInfo = mentions.length ? { mentionedJid: mentions } : undefined

    if (typeof conn.sendButtonV2 === 'function') {
        return conn.sendButtonV2(chat, {
            title,
            subtitle,
            text,
            footer,
            buffer: image,
            buttons,
            ...(contextInfo ? { contextInfo } : {})
        }, quoted)
    }

    if (typeof conn.sendButton === 'function') {
        return conn.sendButton(
            chat,
            text,
            footer,
            image,
            buttons,
            quoted,
            contextInfo ? { contextInfo } : {}
        )
    }

    return conn.sendMessage(chat, {
        image,
        caption: text,
        mentions
    }, { quoted })
}
