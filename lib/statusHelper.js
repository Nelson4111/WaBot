import * as baileys from '@whiskeysockets/baileys'

/**
 * Mencabut / menghapus Status Grup (SWGC) di WhatsApp untuk semua anggota grup.
 * 1. Mengirim pesan REVOKE via relayMessage dengan tag <meta is_group_status="true">
 *    agar WhatsApp menghapusnya dari status/story grup.
 * 2. Mengirim standard sendMessage delete dengan key bersih.
 * 3. Jika status buatan bot sendiri, bersihkan juga referensi di status@broadcast.
 * @param {Object} conn WhatsApp connection instance
 * @param {string} chatJid Group JID
 * @param {Object} options
 * @param {string} options.id Message ID yang akan dihapus
 * @param {boolean} [options.fromMe=true] Apakah status dibuat oleh bot sendiri
 * @param {string} [options.participant] Participant JID jika status dibuat anggota lain
 */
export async function revokeGroupStatus(conn, chatJid, { id, fromMe = true, participant = undefined }) {
  if (!conn || !chatJid || !id) return false

  const isFromMe = !!fromMe
  const cleanKey = {
    remoteJid: chatJid,
    fromMe: isFromMe,
    id: id,
    participant: isFromMe ? undefined : participant
  }

  const protoMsg = {
    protocolMessage: {
      key: cleanKey,
      type: baileys.proto.Message.ProtocolMessage.Type.REVOKE
    }
  }

  // 1. Jalur Utama: Relay REVOKE ke grup dengan meta is_group_status="true"
  // edit '7' untuk pesan sendiri, edit '8' untuk admin revoke pesan orang lain
  try {
    await conn.relayMessage(chatJid, protoMsg, {
      additionalAttributes: {
        edit: isFromMe ? '7' : '8'
      },
      additionalNodes: [
        {
          tag: 'meta',
          attrs: { is_group_status: 'true' },
          content: undefined
        }
      ]
    })
  } catch (err) {
    console.warn('[statusHelper] revokeGroupStatus relay error:', err?.message || err)
  }

  // 2. Jalur Standar: sendMessage delete
  try {
    await conn.sendMessage(chatJid, {
      delete: cleanKey
    })
  } catch (err) {
    console.warn('[statusHelper] sendMessage delete error:', err?.message || err)
  }

  // 3. Jika status bot sendiri, bersihkan referensi di status@broadcast
  if (isFromMe) {
    try {
      await conn.relayMessage('status@broadcast', {
        protocolMessage: {
          key: {
            remoteJid: 'status@broadcast',
            fromMe: true,
            id: id
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
            messages: [{ id, fromMe: true, timestamp: Date.now() }]
          }
        }, 'status@broadcast')
      }
    } catch {}
  }

  return true
}

/**
 * Mendeteksi apakah pesan merupakan pesan Status Grup (SWGC) atau tag status grup.
 * @param {Object} m Pesan Baileys
 * @returns {boolean}
 */
export function isGroupStatusMessage(m) {
  if (!m) return false

  // 1. Deteksi tipe proto spesifik status grup
  if (m.mtype === 'groupStatusMessage' || m.mtype === 'groupStatusMentionMessage') return true
  if (m.message?.groupStatusMessage || m.message?.groupStatusMentionMessage) return true

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
