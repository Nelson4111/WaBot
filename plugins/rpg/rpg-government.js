import { loadDB } from '../../lib/waifuHelper.js'
import { formatRpgMoney } from '../../lib/rpgMoney.js'
import {
  ensureTaxState,
  formatTaxStatus,
  getTaxCategory,
  getTaxPeriod,
  TAX_CATEGORIES
} from '../../lib/rpgTax.js'

const formatMoney = value => formatRpgMoney(value)

async function persist() {
  if (typeof global.db?.write === 'function') await global.db.write()
}

function hasOpenBalance(taxpayer) {
  return taxpayer.bills.some(bill =>
    !bill.waived && BigInt(bill.principal || '0') > BigInt(bill.paidPrincipal || '0')
  )
}

function renderOverview(state, period) {
  const taxpayers = Object.values(state.taxpayers)
  let overdue = 0
  let unpaid = 0
  for (const taxpayer of taxpayers) {
    if (formatTaxStatus(taxpayer, Date.now(), state.config.penaltyTiers) === 'Overdue') overdue++
    if (hasOpenBalance(taxpayer)) unpaid++
  }
  const issued = Object.values(state.collections).reduce((total, collection) => total + (Number(collection.issued) || 0), 0)
  const paid = Object.values(state.collections).reduce((total, collection) => total + (Number(collection.paid) || 0), 0)
  return `╭─❏「 🏛️ AVELIA GOVERNMENT 」❏\n│ ADMINISTRASI PEMERINTAHAN AVELIA\n╰─━━━━━━━━━━━━━━─\n\n` +
    `🏛️ GOVERNMENT OVERVIEW\n\n> ↳ Pemerintahan Avelia mengelola administrasi pajak dan penerimaan negara.\n\n` +
    `─━━━━━━━━━━━━━━─\n\n💰 GOVERNMENT TREASURY\n\n> ↳ Saldo Kas : ${formatMoney(state.treasury.balance)}\n> ↳ Total Pemasukan : ${formatMoney(state.treasury.income)}\n> ↳ Pemasukan Periode Ini : ${formatMoney(state.collections[period]?.income || '0')}\n\n` +
    `📊 TAX STATISTICS\n\n> ↳ Total Taxpayer : ${taxpayers.length}\n> ↳ Tagihan Diterbitkan : ${issued}\n> ↳ Tagihan Terbayar : ${paid}\n> ↳ Tagihan Tertunggak : ${unpaid}\n> ↳ Tagihan Overdue : ${overdue}\n\n─━━━━━━━━━━━━━━─\n\n📌 Gunakan *.government treasury*, *.government income*, *.government history*, dan *.government statistics*.\n╰─━━━━━━━━━━━━━━─`
}

function renderTreasury(state, period) {
  const taxes = TAX_CATEGORIES.map(category =>
    `> ↳ ${category.name} : ${formatMoney(state.treasury.revenueByTax[category.id] || '0')}`
  ).join('\n')
  return `╭─❏「 💰 GOVERNMENT TREASURY 」❏\n│ KAS PEMERINTAH AVELIA\n╰─━━━━━━━━━━━━━━─\n\n` +
    `🏛️ TREASURY BALANCE\n\n> ↳ Saldo Kas : ${formatMoney(state.treasury.balance)}\n> ↳ Total Pemasukan : ${formatMoney(state.treasury.income)}\n> ↳ Total Pengeluaran : ${formatMoney(state.treasury.expenses)}\n\n─━━━━━━━━━━━━━━─\n\n📥 TAX REVENUE\n\n${taxes}\n> ↳ Denda : ${formatMoney(state.treasury.revenueByTax.lateFees || '0')}\n\n─━━━━━━━━━━━━━━─\n\n📅 Periode : ${period}\n╰─━━━━━━━━━━━━━━─`
}

let handler = async (m, { args = [], text = '', usedPrefix = '.', isOwner = false }) => {
  loadDB()
  const state = ensureTaxState(global.db.data)
  const words = String(text || args.join(' ') || '').trim().split(/\s+/).filter(Boolean)
  const mode = String(words.shift() || '').toLowerCase()
  const period = getTaxPeriod()

  if (mode === 'info' || !mode) {
    return m.reply(`🏛️ Avelia Government mengelola administrasi perpajakan dan pencatatan Treasury.\nGunakan *${usedPrefix || '.'}government command* untuk daftar layanan.`)
  }
  if (mode === 'command' || mode === 'commands') {
    return m.reply(`╭─❏「 📋 GOVERNMENT COMMAND 」❏\n│ ADMINISTRASI PEMERINTAHAN\n╰─━━━━━━━━━━━━━━─\n\n👤 LAYANAN\n> ↳ .government info / statistics\n> ↳ .government treasury / income [jenis pajak]\n> ↳ .government history\n\n🏛️ OWNER\n> ↳ .government config / audit\n> ↳ Penerbitan tagihan: .tax collect\n╰─━━━━━━━━━━━━━━─`)
  }
  if (mode === 'treasury') return m.reply(renderTreasury(state, period))
  if (mode === 'income') {
    const query = words.join(' ').trim()
    const category = query && query.toLowerCase() !== 'tax' ? getTaxCategory(query) : null
    if (query && query.toLowerCase() !== 'tax' && !category) {
      return m.reply('❌ Jenis pajak tidak dikenal. Gunakan *.government income tax* untuk melihat seluruh kategori.')
    }
    const rows = category
      ? [`> ↳ ${category.name} : ${formatMoney(state.treasury.revenueByTax[category.id] || '0')}`]
      : TAX_CATEGORIES.map(item => `> ↳ ${item.name} : ${formatMoney(state.treasury.revenueByTax[item.id] || '0')}`)
    return m.reply(`╭─❏「 📥 GOVERNMENT INCOME 」❏\n│ LAPORAN PEMASUKAN NEGARA\n╰─━━━━━━━━━━━━━━─\n\n${rows.join('\n')}\n> ↳ Denda : ${formatMoney(state.treasury.revenueByTax.lateFees || '0')}\n\n💰 Total pemasukan : ${formatMoney(state.treasury.income)}\n╰─━━━━━━━━━━━━━━─`)
  }
  if (mode === 'history') {
    const recent = state.treasury.transactions.slice(0, 15)
    return m.reply(`╭─❏「 📜 GOVERNMENT HISTORY 」❏\n│ RIWAYAT PENERIMAAN TREASURY\n╰─━━━━━━━━━━━━━━─\n\n${recent.length ? recent.map(tx => `> ${tx.id} · ${tx.period}\n> ↳ ${tx.taxId} · ${formatMoney(tx.amount)} · ${new Date(tx.at).toLocaleString('id-ID')}`).join('\n\n') : '> Belum ada transaksi penerimaan.'}\n\n╰─━━━━━━━━━━━━━━─`)
  }
  if (mode === 'statistics' || mode === 'statistik') return m.reply(renderOverview(state, period))
  if (mode === 'collect') return m.reply('Gunakan *.tax collect* untuk menerbitkan tagihan periode minggu sebelumnya.')
  if (['config', 'audit'].includes(mode)) {
    if (!isOwner) return m.reply('❌ Command administrasi Government hanya dapat digunakan Owner.')
    if (mode === 'config') {
      return m.reply(`⚙️ Government Configuration\n> ↳ Tax System : ${state.config.enabled ? 'Aktif' : 'Nonaktif'}\n> ↳ Periode : Senin–Minggu (WIB)\n> ↳ Jatuh tempo : Setiap Senin\n\nUbah status dengan *.tax set on/off*.`)
    }
    return m.reply(`📋 Audit Government\n> ↳ Collection tercatat: ${Object.keys(state.collections).length}\n> ↳ Transaksi Treasury: ${state.treasury.transactions.length}\n> ↳ Perubahan administrasi: ${state.audit.length}\n\n${state.audit.slice(0, 10).map(entry => `> ${entry.action} · ${entry.detail} · ${new Date(entry.at).toLocaleString('id-ID')}`).join('\n') || '> Belum ada perubahan administrasi.'}`)
  }
  return m.reply('Command Government tidak dikenal. Gunakan *.government command*.')
}

handler.help = ['government', 'gov']
handler.tags = ['rpg', 'economy']
handler.command = /^(government|gov)$/i

export default handler
