/**
 * BizFlow Helper
 * Helper untuk mengirim interactiveMessage + nativeFlowMessage
 * dengan stanza additionalNodes khusus WhatsApp Business (v9 mixed).
 */

export const BIZ_NATIVE_FLOW_NODES = [
  {
    tag: 'biz',
    attrs: {
      actual_actors: '2',
      host_storage: '2',
      privacy_mode_ts: '1789884174'
    },
    content: [
      {
        tag: 'interactive',
        attrs: {
          type: 'native_flow',
          v: '1'
        },
        content: [
          {
            tag: 'native_flow',
            attrs: {
              v: '9',
              name: 'mixed'
            }
          }
        ]
      },
      {
        tag: 'quality_control',
        attrs: {
          source_type: 'third_party'
        }
      }
    ]
  }
]

/**
 * Mengirim pesan interactiveMessage dengan node biz native flow v9 mixed
 * @param {Object} conn Socket connection instance Baileys
 * @param {string} jid Chat JID target
 * @param {Object} content Opsi konten pesan
 * @param {string} [content.text] Isi teks pesan di body
 * @param {string} [content.footer] Footer teks pesan
 * @param {Array} [content.buttons] Array tombol native flow
 * @param {string|Object} [content.messageParamsJson] JSON params
 * @param {Object} [content.contextInfo] ContextInfo (mentions, quoted, dll)
 * @param {Object} [relayOptions] Opsi tambahan untuk conn.relayMessage
 * @returns {Promise<any>}
 */
export async function sendBizFlowMessage(conn, jid, content = {}, relayOptions = {}) {
  const text = content.text || 'ya kamu lah, siapa lagi wkwk'
  const messageParamsJson = typeof content.messageParamsJson === 'object'
    ? JSON.stringify(content.messageParamsJson)
    : String(content.messageParamsJson || '{}')

  const nativeFlowMessage = {
    messageParamsJson
  }

  if (Array.isArray(content.buttons) && content.buttons.length > 0) {
    nativeFlowMessage.buttons = content.buttons
  }

  const interactiveMessage = {
    body: {
      text
    },
    nativeFlowMessage
  }

  if (content.footer) {
    interactiveMessage.footer = { text: content.footer }
  }

  if (content.contextInfo && typeof content.contextInfo === 'object') {
    interactiveMessage.contextInfo = content.contextInfo
  }

  return await conn.relayMessage(
    jid,
    {
      interactiveMessage
    },
    {
      additionalNodes: BIZ_NATIVE_FLOW_NODES,
      ...relayOptions
    }
  )
}
