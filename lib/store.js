/**
 * @param {import('@whiskeysockets/baileys').WASocket | import('@whiskeysockets/baileys').WALegacySocket}
 */
function bind(conn) {
    if (!conn.chats) conn.chats = {}

    // Single-flight dedup Map: jid -> Promise
    // Jika ada fetch groupMetadata yang sedang in-flight untuk JID yang sama,
    // caller berikutnya akan reuse Promise yang sama, bukan membuat request baru.
    if (!conn._groupMetaInFlight) conn._groupMetaInFlight = new Map()
    
    async function fetchGroupMetadata(id) {
        // Tier 1: memoryStore
        if (global.memoryStore?.groupMetadata?.[id]) {
            return global.memoryStore.groupMetadata[id]
        }
        // Tier 2: global cache (TTL 15 menit)
        if (global.groupMetadataCache?.has(id)) {
            const c = global.groupMetadataCache.get(id)
            if (Date.now() - c.time < 15 * 60 * 1000) return c.data
        }
        // Tier 3: conn.chats
        if (conn.chats[id]?.metadata) {
            return conn.chats[id].metadata
        }
        // In-flight dedup: jika sudah ada fetch yang sedang berjalan, reuse
        if (conn._groupMetaInFlight.has(id)) {
            return conn._groupMetaInFlight.get(id)
        }
        const fetchPromise = conn.groupMetadata(id)
            .then(meta => {
                if (meta && global.updateGroupMetadataCache) global.updateGroupMetadataCache(id, meta)
                return meta
            })
            .catch(_ => null)
            .finally(() => conn._groupMetaInFlight.delete(id))
        conn._groupMetaInFlight.set(id, fetchPromise)
        return fetchPromise
    }
    /**
     * 
     * @param {import('@whiskeysockets/baileys').Contact[]|{contacts:import('@whiskeysockets/baileys').Contact[]}} contacts 
     * @returns 
     */
    function updateNameToDb(contacts) {
        if (!contacts) return
        try {
            contacts = contacts.contacts || contacts
            for (const contact of contacts) {
                const id = conn.decodeJid(contact.id)
                if (!id || id === 'status@broadcast') continue
                let chats = conn.chats[id]
                if (!chats) chats = conn.chats[id] = { ...contact, id }
                conn.chats[id] = {
                    ...chats,
                    ...({
                        ...contact, id, ...(id.endsWith('@g.us') ?
                            { subject: contact.subject || contact.name || chats.subject || '' } :
                            { name: contact.notify || contact.name || chats.name || chats.notify || '' })
                    } || {})
                }
                
                // --- LID RESOLVER: Simpan mapping LID ke JID ---
                if (!global.lids) global.lids = {}
                
                const lid = contact.lid ? conn.decodeJid(contact.lid) : null
                const jid = contact.id ? conn.decodeJid(contact.id) : null
                
                if (lid && lid.endsWith('@lid') && jid && jid.endsWith('@s.whatsapp.net')) {
                    global.lids[lid] = jid
                    if (global.db && global.db.data) {
                        if (!global.db.data.lids) global.db.data.lids = {}
                        global.db.data.lids[lid] = jid
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }
    }
    conn.ev.on('contacts.upsert', updateNameToDb)
    conn.ev.on('groups.update', updateNameToDb)
    conn.ev.on('contacts.set', updateNameToDb)
    conn.ev.on('chats.set', async ({ chats }) => {
        try {
            for (let { id, name, readOnly } of chats) {
                id = conn.decodeJid(id)
                if (!id || id === 'status@broadcast') continue
                const isGroup = id.endsWith('@g.us')
                let chats = conn.chats[id]
                if (!chats) chats = conn.chats[id] = { id }
                chats.isChats = !readOnly
                if (name) chats[isGroup ? 'subject' : 'name'] = name
                if (isGroup && !chats.metadata) {
                    const metadata = await fetchGroupMetadata(id)
                    if (metadata) {
                        if (name || metadata?.subject) chats.subject = name || metadata.subject
                        chats.metadata = metadata
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }
    })
    conn.ev.on('group-participants.update', async function updateParticipantsToDb({ id, participants, action }) {
        if (!id) return
        id = conn.decodeJid(id)
        if (id === 'status@broadcast') return
        if (!(id in conn.chats)) conn.chats[id] = { id }
        let chats = conn.chats[id]
        chats.isChats = true
        const groupMetadata = await fetchGroupMetadata(id)
        if (!groupMetadata) return
        chats.subject = groupMetadata.subject
        chats.metadata = groupMetadata
    })

    conn.ev.on('groups.update', async function groupUpdatePushToDb(groupsUpdates) {
        try {
            for (const update of groupsUpdates) {
                const id = conn.decodeJid(update.id)
                if (!id || id === 'status@broadcast') continue
                const isGroup = id.endsWith('@g.us')
                if (!isGroup) continue
                let chats = conn.chats[id]
                if (!chats) chats = conn.chats[id] = { id }
                chats.isChats = true
                const metadata = await fetchGroupMetadata(id)
                if (metadata) {
                    chats.metadata = metadata
                }
                if (update.subject || metadata?.subject) chats.subject = update.subject || metadata.subject
            }
        } catch (e) {
            console.error(e)
        }
    })
    conn.ev.on('chats.upsert', function chatsUpsertPushToDb(chatsUpsert) {
        try {
            const { id, name } = chatsUpsert
            if (!id || id === 'status@broadcast') return
            conn.chats[id] = { ...(conn.chats[id] || {}), ...chatsUpsert, isChats: true }
            const isGroup = id.endsWith('@g.us')
            if (isGroup) conn.insertAllGroup()
        } catch (e) {
            console.error(e)
        }
    })
    conn.ev.on('presence.update', async function presenceUpdatePushToDb({ id, presences }) {
        try {
            const sender = Object.keys(presences)[0] || id
            const _sender = conn.decodeJid(sender)
            const presence = presences[sender]['lastKnownPresence'] || 'composing'
            let chats = conn.chats[_sender]
            if (!chats) chats = conn.chats[_sender] = { id: sender }
            chats.presences = presence
            if (id.endsWith('@g.us')) {
                let chats = conn.chats[id]
                if (!chats) {
                    const metadata = await fetchGroupMetadata(id)
                    if (metadata) chats = conn.chats[id] = { id, subject: metadata.subject, metadata, isChats: true }
                }
            }
        } catch (e) {
            console.error(e)
        }
    })
}
export default {
    bind
}
