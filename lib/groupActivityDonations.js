import { formatRpgMoney } from './rpgMoney.js'

const DONATION_NOTICE_INTERVAL = 100
const SKIP_ACTIVITY_COUNT_OPTION = '_skipGroupActivityDonationCount'
const MAX_TRACKED_MESSAGE_IDS = 2000

function getBotSettings(conn) {
  const rawJid = conn?.user?.jid || conn?.user?.id || ''
  const decodedJid = typeof conn?.decodeJid === 'function' ? conn.decodeJid(rawJid) : rawJid
  const botJid = decodedJid
    ? `${decodedJid.split('@')[0].split(':')[0]}@s.whatsapp.net`
    : 'bot'
  const settings = global.db.data.settings || (global.db.data.settings = {})
  const existingSettings = [botJid, decodedJid, rawJid]
    .filter(Boolean)
    .map(jid => settings[jid])
    .filter(value => value && typeof value === 'object')
  const botSettings = existingSettings.find(value =>
    'totalDonasi' in value || 'groupOutgoingMessageCounts' in value
  ) || existingSettings[0] || {}

  settings[botJid] = botSettings
  if (rawJid) settings[rawJid] = botSettings
  if (decodedJid) settings[decodedJid] = botSettings
  return botSettings
}

function scheduleDatabaseWrite() {
  if (typeof global.db?.write !== 'function') return
  if (global.groupActivityDonationWriteTimer) return

  global.groupActivityDonationWriteTimer = setTimeout(() => {
    global.groupActivityDonationWriteTimer = null
    Promise.resolve(global.db?.write?.()).catch(error => {
      console.error('[Group Activity Donation] Failed to persist counter:', error?.message || error)
    })
  }, 1000)
  global.groupActivityDonationWriteTimer.unref?.()
}

function createDonationNotice(conn) {
  const totalDonations = Number(getBotSettings(conn).totalDonasi) || 0
  return {
    text:
      `╭─❏「 ✨ TERIMA KASIH 」❏\n` +
      `│ 💬 APRESIASI AVELIA\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `💖 *DUKUNG AVELIA*\n` +
      `> ↳ Senang melihat obrolan di grup ini begitu ramai!\n` +
      `> ↳ Avelia bisa terus menemani berkat dukungan kalian.\n` +
      `> ↳ Jika berkenan, dukung operasional bot lewat donasi agar Avelia tetap aktif dan terus berkembang.\n\n` +
      `─━━━━━━━━━━━━━━─\n` +
      `💝 *Total Dukungan Terkumpul*\n` +
      `> ${formatRpgMoney(totalDonations)}\n\n` +
      `Terima kasih sudah menjadi bagian dari perjalanan Avelia! 💜`
  }
}

function getDonationCommand(conn) {
  const configuredPrefix = conn?.prefix || global.prefix
  const prefix = typeof configuredPrefix === 'string'
    ? configuredPrefix
    : Array.isArray(configuredPrefix)
      ? configuredPrefix.find(value => typeof value === 'string')
      : '.'
  return `${prefix || '.'}donasi`
}

export async function sendGroupActivityDonationNotice(conn, chat, donationCommand = getDonationCommand(conn)) {
  const { text } = createDonationNotice(conn)
  const content = {
    interactiveMessage: {
      body: { text },
      footer: { text: 'AVELIA • Made with love' },
      nativeFlowMessage: {
        buttons: [{
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: '💝 Dukung Avelia',
            id: donationCommand
          })
        }]
      }
    }
  }

  if (typeof conn.sendInteractive === 'function') {
    try {
      await conn.sendInteractive(chat, content, { [SKIP_ACTIVITY_COUNT_OPTION]: true })
      return
    } catch (error) {
      console.error('[Group Activity Donation] Interactive notice failed:', error?.message || error)
    }
  }

  await conn.sendMessage(chat, {
    text: `${text}\n\n> 💝 Donasi: *${donationCommand}*`
  }, { [SKIP_ACTIVITY_COUNT_OPTION]: true })
}

export async function trackGroupOutgoingMessage(conn, chat, options = {}, messageId) {
  if (options[SKIP_ACTIVITY_COUNT_OPTION] || !String(chat || '').endsWith('@g.us')) return
  if (!global.db?.data) return

  if (messageId) {
    const sentIds = global.groupActivityDonationMessageIds ||
      (global.groupActivityDonationMessageIds = new Set())
    if (sentIds.has(messageId)) return
    sentIds.add(messageId)
    if (sentIds.size > MAX_TRACKED_MESSAGE_IDS) {
      sentIds.delete(sentIds.values().next().value)
    }
  }

  const settings = getBotSettings(conn)
  const counts = settings.groupOutgoingMessageCounts ||
    (settings.groupOutgoingMessageCounts = {})
  const count = (Number(counts[chat]) || 0) + 1
  counts[chat] = count
  scheduleDatabaseWrite()

  if (count % DONATION_NOTICE_INTERVAL === 0) {
    try {
      await sendGroupActivityDonationNotice(conn, chat)
    } catch (error) {
      console.error('[Group Activity Donation] Failed to send notice:', error?.message || error)
    }
  }
}
