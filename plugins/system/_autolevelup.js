import { checkLevelUp } from '../../lib/levelling.js'

export async function before(m) {
    if (!m.sender || m.isBaileys) return
    let user = global.db?.data?.users?.[m.sender]
    if (!user || user.autolevelup === false) return

    try {
        await checkLevelUp(m, this)
    } catch (e) {
        console.error('[_autolevelup Error]:', e?.message || e)
    }
}
