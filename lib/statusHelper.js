import * as baileys from '@whiskeysockets/baileys'

/**
 * Mencabut / menghapus Status Grup (SWGC) atau pesan status mention di WhatsApp.
 * - Untuk status sendiri (fromMe: true): Mengirim REVOKE dengan tag meta is_group_status="true"
 *   serta membersihkan di status@broadcast.
 * - Untuk status/pesan anggota lain (fromMe: false / Admin Revoke): Mengirim Admin Delete standar (edit: '8')
 *   menggunakan kombinasi raw LID dan Phone JID agar cocok dengan database server WhatsApp.
 * @param {Object} conn WhatsApp connection instance
 * @param {string} chatJid Group JID
 * @param {Object} options
 * @param {string|string[]} options.id Message ID yang akan dihapus
 * @param {boolean} [options.fromMe=true] Apakah status dibuat oleh bot sendiri
 * @param {string|string[]} [options.participant] Participant JID (LID atau Phone JID)
 * @param {string} [options.alternateParticipant] Alternatif participant JID (Phone JID jika participant utama LID)
 * @returns {Promise<boolean>} Status apakah pengiriman delete berhasil
 */
export async function revokeGroupStatus(conn, chatJid, { id, fromMe = true, participant = undefined, alternateParticipant = undefined }) {
  if (!conn || !chatJid || !id) return false

  const isFromMe = !!fromMe
  const ids = Array.isArray(id) ? id : [id]
  const rawParticipants = Array.isArray(participant)
    ? participant
    : [participant, alternateParticipant].filter(Boolean)

  const participants = isFromMe
    ? [undefined]
    : (rawParticipants.length ? [...new Set(rawParticipants)] : [undefined])

  let anySuccess = false

  for (const singleId of ids) {
    // 1. Jika status buatan bot sendiri
    if (isFromMe) {
      const cleanKey = {
        remoteJid: chatJid,
        fromMe: true,
        id: singleId
      }

      const protoMsg = {
        protocolMessage: {
          key: cleanKey,
          type: baileys.proto.Message.ProtocolMessage.Type.REVOKE
        }
      }

      // Jalur Relay dengan meta is_group_status="true"
      try {
        await conn.relayMessage(chatJid, protoMsg, {
          additionalAttributes: { edit: '7' },
          additionalNodes: [
            {
              tag: 'meta',
              attrs: { is_group_status: 'true' },
              content: undefined
            }
          ]
        })
        anySuccess = true
      } catch (err) {
        console.warn('[statusHelper] relayMessage self revoke warn:', err?.message || err)
      }

      // Standar delete
      try {
        await conn.sendMessage(chatJid, { delete: cleanKey })
        anySuccess = true
      } catch {}

      // Bersihkan di status@broadcast jika ada
      try {
        await conn.relayMessage('status@broadcast', {
          protocolMessage: {
            key: {
              remoteJid: 'status@broadcast',
              fromMe: true,
              id: singleId
            },
            type: baileys.proto.Message.ProtocolMessage.Type.REVOKE
          }
        }, {
          additionalAttributes: { edit: '7' }
        })
      } catch {}

      try {
        if (typeof conn.chatModify === 'function') {
          await conn.chatModify({
            clear: {
              messages: [{ id: singleId, fromMe: true, timestamp: Date.now() }]
            }
          }, 'status@broadcast')
        }
      } catch {}
    }
    // 2. Jika status/pesan buatan anggota lain (Admin Revoke di grup)
    else {
      for (const part of participants) {
        const cleanKey = {
          remoteJid: chatJid,
          fromMe: false,
          id: singleId,
          ...(part ? { participant: part } : {})
        }

        // Jalur 1: Standar Admin Delete via sendMessage (Baileys otomatis set edit: '8')
        try {
          await conn.sendMessage(chatJid, { delete: cleanKey })
          anySuccess = true
        } catch (err) {
          console.warn(`[statusHelper] Admin delete sendMessage warn (${part}):`, err?.message || err)
        }

        // Jalur 2: Relay REVOKE protokol edit '8' eksplisit (tanpa meta tag agar tidak ditolak server)
        try {
          await conn.relayMessage(chatJid, {
            protocolMessage: {
              key: cleanKey,
              type: baileys.proto.Message.ProtocolMessage.Type.REVOKE
            }
          }, {
            additionalAttributes: { edit: '8' }
          })
          anySuccess = true
        } catch (err) {
          console.warn(`[statusHelper] Admin delete relay warn (${part}):`, err?.message || err)
        }
      }
    }
  }

  return anySuccess
}

/**
 * Mendeteksi apakah pesan merupakan pesan Status Grup (SWGC).
 * Catatan: SWGC adalah status yang diunggah langsung ke obrolan grup (Group Status V2).
 * Untuk pesan mention/tag status WA pribadi, gunakan isGroupStatusMentionMessage(m).
 * @param {Object} m Pesan Baileys
 * @returns {boolean}
 */
export function isGroupStatusMessage(m) {
  if (!m) return false

  // 1. Deteksi tipe proto spesifik status grup
  if (m.mtype === 'groupStatusMessage') return true
  if (m.message?.groupStatusMessage) return true

  // 2. Cek flag isGroupStatus pada contextInfo pesan langsung
  if (m.msg?.contextInfo?.isGroupStatus) return true
  if (m.message?.[m.mtype]?.contextInfo?.isGroupStatus) return true

  // 3. Cek jika pesan dibungkus wrapper viewOnce atau ephemeral
  const content = m.message?.viewOnceMessage?.message ||
                  m.message?.viewOnceMessageV2?.message ||
                  m.message?.viewOnceMessageV2Extension?.message ||
                  m.message?.ephemeralMessage?.message ||
                  m.message

  if (content && typeof content === 'object') {
    for (const key of Object.keys(content)) {
      if (content[key]?.contextInfo?.isGroupStatus) return true
    }
  }

  return false
}

/**
 * Mendeteksi apakah pesan merupakan tag status WhatsApp (Status Mention / Tag SW).
 * Catatan: Ini terjadi saat seseorang mengunggah status di WA pribadinya lalu me-mention grup.
 * @param {Object} m Pesan Baileys
 * @returns {boolean}
 */
export function isGroupStatusMentionMessage(m) {
  if (!m) return false

  // 1. Deteksi tipe proto spesifik mention status WA
  if (m.mtype === 'groupStatusMentionMessage') return true
  if (m.message?.groupStatusMentionMessage) return true

  // 2. Cek flag isStatusMention atau groupStatusMentionMessage di contextInfo / sub-pesan
  if (m.msg?.contextInfo?.isStatusMention) return true
  if (m.message?.groupStatusMentionMessage?.message) return true

  return false
}

