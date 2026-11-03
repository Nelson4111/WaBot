import { AUCTION_ITEMS } from './rpg-auctionData.js'
import { BANK_SPECIAL_ITEMS } from './rpg-bankData.js'
import { HOME_LEVELS } from './rpgHomeData.js'
import { hewanList as LIVESTOCK_TYPES } from './rpg-libternakData.js'
import { MALL_CATEGORIES } from './rpgMallData.js'
import { pets as PET_TYPES } from './rpg-petData.js'
import {
  addRpgMoney,
  compareRpgMoney,
  normalizeRpgMoney,
  subtractRpgMoney
} from './rpgMoney.js'
import { getBillAmounts, getTaxPeriod, TAX_CATEGORIES } from './rpgTax.js'

const itemCatalog = Object.values(MALL_CATEGORIES)
  .flatMap(category => category.items)
  .concat(AUCTION_ITEMS, BANK_SPECIAL_ITEMS)
const itemById = new Map(itemCatalog.map(item => [item.id, item]))

function getOpenBills(taxpayer, state, now) {
  return taxpayer.bills
    .filter(bill => !bill.waived && compareRpgMoney(getBillAmounts(bill, now, state.config.penaltyTiers).total, 0) > 0)
    .sort((left, right) => Number(left.issuedAt) - Number(right.issuedAt))
}

function getOutstanding(bills, state, now) {
  return bills.reduce((total, bill) =>
    total + BigInt(getBillAmounts(bill, now, state.config.penaltyTiers).total), 0n)
}

function recordPayment(state, taxpayer, jid, amount, now) {
  let remaining = BigInt(amount)
  for (const bill of getOpenBills(taxpayer, state, now)) {
    if (remaining <= 0n) break
    const amounts = getBillAmounts(bill, now, state.config.penaltyTiers)
    const billPayment = remaining < BigInt(amounts.total) ? remaining : BigInt(amounts.total)
    const penalty = billPayment < BigInt(amounts.penalty) ? billPayment : BigInt(amounts.penalty)
    const principal = billPayment - penalty
    bill.paidPenalty = (BigInt(bill.paidPenalty || '0') + penalty).toString()
    bill.paidPrincipal = (BigInt(bill.paidPrincipal || '0') + principal).toString()
    bill.paidTotal = (BigInt(bill.paidTotal || '0') + billPayment).toString()

    const revenueByTax = {}
    let remainingPrincipal = principal
    for (const category of TAX_CATEGORIES) {
      const categoryBalance = BigInt(bill.items?.[category.id] || '0')
      const previousPaid = BigInt(bill.paidByCategory?.[category.id] || '0')
      const outstanding = categoryBalance - previousPaid
      const allocation = remainingPrincipal < outstanding ? remainingPrincipal : outstanding
      if (allocation > 0n) {
        revenueByTax[category.id] = allocation.toString()
        bill.paidByCategory ||= {}
        bill.paidByCategory[category.id] = (previousPaid + allocation).toString()
        remainingPrincipal -= allocation
      }
      if (remainingPrincipal <= 0n) break
    }

    const transaction = {
      id: `GT-${String(state.nextTransactionId++).padStart(8, '0')}`,
      jid,
      taxId: taxpayer.taxId,
      billId: bill.id,
      period: bill.period,
      amount: billPayment.toString(),
      principal: principal.toString(),
      penalty: penalty.toString(),
      revenueByTax,
      at: now,
      source: 'tax-enforcement'
    }
    state.treasury.transactions.unshift(transaction)
    taxpayer.payments.unshift(transaction)
    state.treasury.revenueByTax.lateFees = (
      BigInt(state.treasury.revenueByTax.lateFees || '0') + penalty
    ).toString()
    for (const [category, categoryAmount] of Object.entries(revenueByTax)) {
      state.treasury.revenueByTax[category] = (
        BigInt(state.treasury.revenueByTax[category] || '0') + BigInt(categoryAmount)
      ).toString()
    }
    const collection = state.collections[bill.period]
    if (collection) {
      collection.income = (BigInt(collection.income || '0') + billPayment).toString()
      if (!bill.completedAt && getBillAmounts(bill, now, state.config.penaltyTiers).total === '0') {
        collection.paid = (Number(collection.paid) || 0) + 1
        bill.completedAt = now
      }
    }
    remaining -= billPayment
  }

  const paid = BigInt(amount) - remaining
  state.treasury.balance = addRpgMoney(state.treasury.balance, paid.toString())
  state.treasury.income = addRpgMoney(state.treasury.income, paid.toString())
  state.treasury.transactions.length = Math.min(state.treasury.transactions.length, 500)
  return paid.toString()
}

function addSeizedAsset(state, rpg, source, itemId, value, name, now, extra = {}) {
  const appraisal = BigInt(value || '0')
  if (appraisal <= 0n) return false
  rpg.taxSeizedAssets ||= []
  const seizureId = `TS-${String(state.nextSeizureId++).padStart(6, '0')}`
  rpg.taxSeizedAssets.push({
    id: seizureId,
    source,
    itemId,
    name,
    value: appraisal.toString(),
    redemptionFee: ((appraisal * 110n + 99n) / 100n).toString(),
    seizedAt: now,
    ...extra
  })
  return true
}

function seizeInventory(state, rpg, inventory, source, requiredValue, now) {
  let seizedValue = 0n
  for (const [itemId, rawQuantity] of Object.entries(inventory || {})) {
    const item = itemById.get(itemId)
    const value = BigInt(normalizeRpgMoney(item?.price || 0))
    let quantity = Math.max(0, Math.floor(Number(rawQuantity) || 0))
    while (quantity > 0 && seizedValue < requiredValue && value > 0n) {
      quantity--
      if (!addSeizedAsset(state, rpg, source, itemId, value.toString(), item.name, now)) break
      seizedValue += value
    }
    if (quantity > 0) inventory[itemId] = quantity
    else delete inventory[itemId]
    if (seizedValue >= requiredValue) break
  }
  return seizedValue
}

function seizeHomeAssets(state, rpg, requiredValue, now) {
  let seizedValue = 0n
  const home = rpg.home
  if (!home || typeof home !== 'object') return seizedValue

  for (const [property, source] of [['furniture', 'home-furniture'], ['trophies', 'home-trophy']]) {
    if (!Array.isArray(home[property])) continue
    while (home[property].length && seizedValue < requiredValue) {
      const itemId = home[property].at(-1)
      const item = itemById.get(itemId)
      if (!item || !addSeizedAsset(state, rpg, source, itemId, item.price, item.name, now)) break
      home[property].pop()
      seizedValue += BigInt(item.price)
    }
    if (seizedValue >= requiredValue) return seizedValue
  }

  for (const [itemId, quantityValue] of Object.entries(home.garage || {})) {
    const item = itemById.get(itemId)
    const value = BigInt(normalizeRpgMoney(item?.price || 0))
    let quantity = Math.max(0, Math.floor(Number(quantityValue) || 0))
    while (quantity > 0 && seizedValue < requiredValue && value > 0n) {
      if (!addSeizedAsset(state, rpg, 'home-garage', itemId, value.toString(), item.name, now)) break
      quantity--
      seizedValue += value
    }
    if (quantity > 0) home.garage[itemId] = quantity
    else delete home.garage[itemId]
    if (seizedValue >= requiredValue) return seizedValue
  }

  if (Number(home.level) > 0 && seizedValue < requiredValue) {
    const level = Math.min(HOME_LEVELS.length - 1, Math.floor(Number(home.level)))
    const value = HOME_LEVELS.slice(1, level + 1).reduce((total, entry) => total + BigInt(entry.cost), 0n)
    if (addSeizedAsset(state, rpg, 'home-level', 'home', value.toString(), HOME_LEVELS[level].name, now, { level })) {
      home.level = 0
      seizedValue += value
    }
  }
  return seizedValue
}

function seizeInvestments(state, data, rpg, requiredValue, now) {
  const portfolio = rpg.invest?.portfolio || {}
  let seizedValue = 0n
  for (const [symbol, holding] of Object.entries(portfolio)) {
    if (seizedValue >= requiredValue) break
    const price = Number(data.invest?.prices?.[symbol] ?? holding?.avgPrice)
    const quantity = Number(holding?.qty)
    if (!Number.isFinite(price) || !Number.isFinite(quantity) || price <= 0 || quantity <= 0) continue
    const value = BigInt(Math.floor(price * quantity))
    if (!addSeizedAsset(state, rpg, 'investment', symbol, value, `${symbol} investment`, now, {
      holding: { ...holding }
    })) continue
    delete portfolio[symbol]
    seizedValue += value
  }
  return seizedValue
}

function seizePets(state, rpg, requiredValue, now) {
  if (!Array.isArray(rpg.pets)) return 0n
  let seizedValue = 0n
  for (let index = rpg.pets.length - 1; index >= 0 && seizedValue < requiredValue; index--) {
    const pet = rpg.pets[index]
    const type = PET_TYPES[pet?.tipe]
    if (!type) continue
    const rarityFactor = BigInt(state.config.petRarityFactors?.[type.rarity] || 10000)
    const value = BigInt(type.harga) * rarityFactor / 10000n
    if (!addSeizedAsset(state, rpg, 'pet', pet.tipe, value, `${pet.tipe} pet`, now, { pet })) continue
    rpg.pets.splice(index, 1)
    seizedValue += value
  }
  return seizedValue
}

function seizeLivestock(state, rpg, requiredValue, now) {
  let seizedValue = 0n
  for (const [type, quantityValue] of Object.entries(rpg.ternak || {})) {
    const animal = LIVESTOCK_TYPES[type]
    const value = BigInt(normalizeRpgMoney(animal?.hargaBibit || 0))
    let quantity = Math.max(0, Math.floor(Number(quantityValue) || 0))
    while (quantity > 0 && seizedValue < requiredValue && value > 0n) {
      if (!addSeizedAsset(state, rpg, 'livestock', type, value.toString(), animal.nama, now)) break
      quantity--
      seizedValue += value
    }
    if (quantity > 0) rpg.ternak[type] = quantity
    else delete rpg.ternak[type]
    if (seizedValue >= requiredValue) break
  }
  return seizedValue
}

function declareBankruptcy(account, rpg, now) {
  account.money = '0'
  rpg.bank = '0'
  rpg.taxBankruptAt = now
  rpg.invest ||= {}
  rpg.invest.portfolio = {}
  rpg.mallInventory = {}
  rpg.auctionVault = {}
  rpg.pets = []
  rpg.ternak = {}
  rpg.cafe = null
  if (rpg.home && typeof rpg.home === 'object') {
    rpg.home.level = 0
    rpg.home.furniture = []
    rpg.home.trophies = []
    rpg.home.garage = {}
  }
}

export function enforceOverdueTax(data, state, now = Date.now()) {
  let enforced = 0
  const period = getTaxPeriod(new Date(now))
  for (const [jid, account] of Object.entries(data.users || {})) {
    const rpg = account?.rpg
    if (!rpg) continue
    const taxpayer = state.taxpayers[jid]
    if (!taxpayer) continue
    const bills = getOpenBills(taxpayer, state, now)
    const overdueBills = bills.filter(bill => now >= Number(bill.dueAt || 0))
    if (!overdueBills.length) continue
    if (rpg.taxEnforcementPeriod === period) continue

    let outstanding = getOutstanding(overdueBills, state, now)
    const cash = BigInt(normalizeRpgMoney(account.money || 0))
    const bank = BigInt(normalizeRpgMoney(rpg.bank || account.bank || 0))
    let payment = cash + bank
    if (payment > outstanding) payment = outstanding
    if (payment > 0n) {
      const cashPayment = cash < payment ? cash : payment
      account.money = subtractRpgMoney(account.money || 0, cashPayment.toString())
      const bankPayment = payment - cashPayment
      if (bankPayment > 0n) rpg.bank = subtractRpgMoney(rpg.bank || account.bank || 0, bankPayment.toString())
      recordPayment(state, taxpayer, jid, payment.toString(), now)
      outstanding -= payment
    }

    if (outstanding > 0n) {
      const before = rpg.taxSeizedAssets?.length || 0
      let seizedValue = seizeInventory(state, rpg, rpg.auctionVault, 'auction', outstanding, now)
      if (seizedValue < outstanding) {
        seizedValue += seizeHomeAssets(state, rpg, outstanding - seizedValue, now)
      }
      if (seizedValue < outstanding) {
        seizedValue += seizeInventory(state, rpg, rpg.mallInventory, 'mall', outstanding - seizedValue, now)
      }
      if (seizedValue < outstanding) {
        seizedValue += seizeInvestments(state, data, rpg, outstanding - seizedValue, now)
      }
      if (seizedValue < outstanding) {
        seizedValue += seizePets(state, rpg, outstanding - seizedValue, now)
      }
      if (seizedValue < outstanding) {
        seizedValue += seizeLivestock(state, rpg, outstanding - seizedValue, now)
      }
      if (seizedValue < outstanding) {
        declareBankruptcy(account, rpg, now)
        state.audit.unshift({
          actor: 'system',
          action: 'tax-bankruptcy',
          detail: `${taxpayer.taxId}: outstanding ${outstanding.toString()}`,
          at: now
        })
      }
      const count = (rpg.taxSeizedAssets?.length || 0) - before
      if (count) state.audit.unshift({
        actor: 'system',
        action: 'tax-seizure',
        detail: `${taxpayer.taxId}: ${count} item(s), ${seizedValue.toString()}`,
        at: now
      })
    }

    rpg.taxEnforcementPeriod = period
    enforced++
  }
  state.audit.length = Math.min(state.audit.length, 200)
  return enforced
}

export function restoreTaxSeizedAsset(rpg, asset) {
  const { source, itemId, quantity = 1 } = asset
  if (source === 'auction') {
    rpg.auctionVault ||= {}
    rpg.auctionVault[itemId] = (Number(rpg.auctionVault[itemId]) || 0) + quantity
  } else if (source === 'mall') {
    rpg.mallInventory ||= {}
    rpg.mallInventory[itemId] = (Number(rpg.mallInventory[itemId]) || 0) + quantity
  } else if (source === 'home-furniture' || source === 'home-trophy') {
    rpg.home ||= {}
    const property = source === 'home-furniture' ? 'furniture' : 'trophies'
    rpg.home[property] ||= []
    rpg.home[property].push(itemId)
  } else if (source === 'home-garage') {
    rpg.home ||= {}
    rpg.home.garage ||= {}
    rpg.home.garage[itemId] = (Number(rpg.home.garage[itemId]) || 0) + quantity
  } else if (source === 'home-level') {
    rpg.home ||= {}
    rpg.home.level = Math.max(Number(rpg.home.level) || 0, Number(asset.level) || 0)
  } else if (source === 'investment') {
    rpg.invest ||= {}
    rpg.invest.portfolio ||= {}
    const current = rpg.invest.portfolio[itemId]
    if (!current) rpg.invest.portfolio[itemId] = { ...asset.holding }
    else {
      const currentQty = Number(current.qty) || 0
      const restoredQty = Number(asset.holding?.qty) || 0
      const totalQty = currentQty + restoredQty
      current.avgPrice = totalQty
        ? (((Number(current.avgPrice) || 0) * currentQty) + ((Number(asset.holding?.avgPrice) || 0) * restoredQty)) / totalQty
        : 0
      current.qty = totalQty
    }
  } else if (source === 'pet') {
    rpg.pets ||= []
    rpg.pets.push(asset.pet)
  } else if (source === 'livestock') {
    rpg.ternak ||= {}
    rpg.ternak[itemId] = (Number(rpg.ternak[itemId]) || 0) + quantity
  } else {
    throw new RangeError(`Jenis barang sitaan tidak dikenal: ${source}`)
  }
}
