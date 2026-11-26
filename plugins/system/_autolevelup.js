import { checkLevelUp } from '../../lib/levelling.js'

export async function before(m) {
    if (!m.sender || m.isBaileys) return
    const chat = global.db?.data?.chats?.[m.chat]
    let user = global.db?.data?.users?.[m.sender]
    if (!user || user.autolevelup === false) return
    if (chat && typeof chat.autolevelup !== 'boolean') chat.autolevelup = true
    if (chat && typeof chat.autolevelupLevel !== 'number') chat.autolevelupLevel = 0
    // Eksekusi checkLevelUp dilakukan terpusat di handler.js (finally block) setelah user.exp += m.exp
}
