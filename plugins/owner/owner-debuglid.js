let handler = async (m, { conn, text }) => {
    let q = m.quoted ? m.quoted : m
    let who = q.sender
    let data = {
        m_sender: m.sender,
        q_sender: q.sender,
        participant: m.participant,
        key_participant: m.key.participant,
        contacts_val: conn.contacts ? conn.contacts[who] : 'no conn.contacts',
        chats_val: conn.chats ? conn.chats[who] : 'no conn.chats[who]',
        onWhatsApp: await conn.onWhatsApp(who).catch(e => e.message)
    }
    m.reply(JSON.stringify(data, null, 2))
}
handler.command = /^(debuglid)$/i
handler.owner = true
export default handler
