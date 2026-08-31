/**
 * CSM Quest Command Handler
 */

import { saveDB } from '../../../lib/waifuHelper.js'
import { QUEST_LIST, ITEM_LIST } from '../../../lib/rpg-libmyCSM.js'
import { header, getInventoryEntryByInput } from '../lib/utils.js'
import { ensureDailyQuests, awardQuestReward } from '../lib/quest.js'

export async function handleQuest(ctx) {
  const { m, csm, wdb, args, today } = ctx
  ensureDailyQuests(csm, wdb, today)

  const questAction = (args[1] || '').toLowerCase()
  if (questAction === 'item') {
    const confirm = ['yes', 'ya', 'confirm', 'ok'].includes((args[2] || '').toLowerCase())
    const cancel = ['no', 'cancel', 'batal', 'tolak'].includes((args[2] || '').toLowerCase())

    if (confirm && csm.pendingQuestItem) {
      const itemName = csm.pendingQuestItem.itemName
      const itemIndex = csm.inventory.findIndex(inv => inv && inv.nama === itemName)
      if (itemIndex >= 0) csm.inventory.splice(itemIndex, 1)
      csm.blood += 2500
      csm.pendingQuestItem = null
      saveDB(wdb)
      return m.reply(
        header('QUEST ITEM DISETOR') +
        `${ITEM_LIST.find(item => item.nama === itemName)?.emoji || '📦'} *${itemName}*\n\n` +
        `✅ Sudah disetor ke quest.\n` +
        `🩸 +2.500 Blood\n` +
        `━━━━━━━━━━━`
      )
    }

    if (cancel) {
      csm.pendingQuestItem = null
      saveDB(wdb)
      return m.reply(header('SETOR DIBATALKAN') + `Tidak ada item quest yang disetor.\n━━━━━━━━━━━`)
    }

    const questItemEntries = (csm.inventory || []).map((inv, index) => {
      const item = ITEM_LIST.find(entry => entry.nama === inv.nama)
      return item && item.jenis === 'Quest Item' ? { inv, index, item } : null
    }).filter(Boolean)

    if (!questItemEntries.length) {
      return m.reply(header('TIDAK ADA QUEST ITEM') + `Kamu belum punya item quest di inventory.\n━━━━━━━━━━━`)
    }

    if (!args[2] || (!confirm && !cancel && !['yes', 'no', 'ya', 'confirm', 'ok', 'cancel', 'batal', 'tolak'].includes((args[2] || '').toLowerCase()))) {
      const list = questItemEntries.map((entry, i) => `${i + 1}. ${entry.item.emoji} ${entry.item.nama} [${entry.item.tier}]`).join('\n')
      return m.reply(
        header('QUEST ITEM') +
        `${list}\n\n` +
        `Pilih item yang ingin disetor:\n` +
        `*.csm quest item <nomor>*\n\n` +
        `Lalu konfirmasi:\n` +
        `*.csm quest item yes*\n` +
        `*.csm quest item no*\n━━━━━━━━━━━`
      )
    }

    const selected = getInventoryEntryByInput(csm, args[2])
    if (!selected || !selected.data || selected.data.jenis !== 'Quest Item') {
      return m.reply(header('QUEST ITEM SALAH') + `Nomor atau nama item quest tidak valid.\n━━━━━━━━━━━`)
    }

    csm.pendingQuestItem = { inventoryIndex: selected.inventoryIndex, itemName: selected.data.nama }
    saveDB(wdb)
    return m.reply(
      header('KONFIRMASI SETOR QUEST') +
      `${selected.data.emoji} *${selected.data.nama}*\n\n` +
      `Reward: 🩸 +2.500 Blood\n\n` +
      `Ketik *.csm quest item yes* untuk setor.\n` +
      `Ketik *.csm quest item no* untuk batal.\n━━━━━━━━━━━`
    )
  }

  const skipKeyword = (args[1] || '').toLowerCase()
  const skipQuestNumber = Number(args[2])
  if (skipKeyword === 'skip' && Number.isInteger(skipQuestNumber) && skipQuestNumber >= 1 && skipQuestNumber <= (csm.dailyQuests?.length || 0)) {
    const quest = csm.dailyQuests[skipQuestNumber - 1]
    if (!quest) return m.reply(header('QUEST TIDAK ADA') + `Nomor quest tidak valid.\n━━━━━━━━━━━`)
    if (quest.claimed) return m.reply(header('QUEST SUDAH DIKLAIM') + `${quest.name}\n\n> ✅ Reward sudah diterima.\n━━━━━━━━━━━`)
    const cost = 5000
    if (csm.blood < cost) return m.reply(header('DARAH KURANG') + `Butuh ${cost.toLocaleString()} Blood untuk skip quest ${skipQuestNumber}.\nPunya: ${csm.blood.toLocaleString()} Blood\n━━━━━━━━━━━`)
    csm.blood -= cost
    quest.progress = quest.target
    awardQuestReward(csm, wdb, m, quest, 'skip')
    return m.reply(header('QUEST DI-SKIP') + `${quest.name}\n\n> 💸 -${cost.toLocaleString()} Blood\n> ✅ Reward otomatis diklaim.\n━━━━━━━━━━━`)
  }

  const questNumber = Number(args[1])

  if (Number.isInteger(questNumber) && questNumber >= 1 && questNumber <= (csm.dailyQuests?.length || 0)) {
    const quest = csm.dailyQuests[questNumber - 1]
    const progress = Math.min(quest.target, Number(quest.progress || 0))

    if (quest.claimed)
      return m.reply(
        header('QUEST SUDAH DIKLAIM') +
        `${quest.name}\n` +
        `> ✅ Reward sudah diterima.\n` +
        `> 📅 Silakan pilih quest aktif lainnya.\n` +
        `|━━━━━━━━━━━`
      )

    if (progress < quest.target)
      return m.reply(
        header('QUEST BELUM SELESAI') +
        `${quest.name}\n\n` +
        `> 🎯 Progress: ${progress}/${quest.target}\n` +
        `> 🎁 Target akan otomatis diklaim saat progress mencapai ${quest.target}.\n` +
        `> 💸 Skip: *.csm quest skip ${questNumber}* (5.000 Blood)\n` +
        `|━━━━━━━━━━━`
      )

    awardQuestReward(csm, wdb, m, quest, 'claim')
    return m.reply(
      header('QUEST SELESAI') +
      `${quest.name}\n\n` +
      `> 🩸 +${Number(quest.blood || 0).toLocaleString()} Blood\n` +
      `> 📈 +${Number(quest.exp || 0).toLocaleString()} EXP\n` +
      `> ✅ Reward diklaim otomatis.\n` +
      `|━━━━━━━━━━━`
    )
  }

  const activeQuests = csm.dailyQuests || []
  const questLines = activeQuests.map((quest, index) => {
    const progress = Math.min(quest.target, Number(quest.progress || 0))
    return (
      `*${index + 1}.* ${quest.name}\n` +
      `> 🎯 Progress: ${progress}/${quest.target}\n` +
      `> 🩸 Reward: ${Number(quest.blood || 0).toLocaleString()} Blood | 📈 ${Number(quest.exp || 0).toLocaleString()} EXP\n` +
      `> ${quest.claimed ? '✅ Status: Selesai & Diklaim' : '⚔️ Status: Berjalan otomatis'}\n` +
      `> __Skip__: *.csm quest skip ${index + 1}* (5.000 Blood)`
    )
  }).join('\n\n')

  return m.reply(
    header('DAFTAR QUEST HARIAN') +
    `> 📜 Menampilkan quest aktif dari total ${QUEST_LIST.length}.\n\n` +
    `${questLines}\n\n` +
    `> 💡 Quest akan otomatis diklaim saat target selesai. Gunakan *.csm quest skip <nomor>* jika ingin lewati dengan biaya 5.000 Blood.\n` +
    `|━━━━━━━━━━━`
  )
}
