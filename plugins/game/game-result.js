import { sendThumbnailButtonCard } from '../../lib/thumbnailButtonCard.js'

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
    return sendThumbnailButtonCard(conn, {
        chat,
        title,
        subtitle,
        text,
        footer,
        thumbnail: image,
        buttons: buttons?.length ? buttons : [
            ['🔄 Main Lagi', '.fam'],
            ['🎮 Menu Games', '.menugame']
        ],
        quoted,
        mentions
    })
}
