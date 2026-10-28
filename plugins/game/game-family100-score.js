export function awardFamily100Mvp(room) {
    if (room.mvpAwarded) return null
    room.mvpAwarded = true

    const answerCounts = new Map()
    for (const jid of room.terjawab || []) {
        if (typeof jid === 'string' && jid) {
            answerCounts.set(jid, (answerCounts.get(jid) || 0) + 1)
        }
    }

    if (answerCounts.size < 2) return null

    const rankedPlayers = [...answerCounts.entries()].sort(([, first], [, second]) => second - first)
    if (rankedPlayers[0][1] === rankedPlayers[1][1]) return null

    const [jid, answers] = rankedPlayers[0]
    const user = global.db.data.users[jid] = global.db.data.users[jid] || {}
    user.family100Score = (Number(user.family100Score) || 0) + 2

    return {
        jid,
        name: user.family100Name || user.name || jid.split('@')[0],
        answers
    }
}
