import COSRENT_LIST from '../../lib/cosrentList.js'
import {
  getGreeting,
  shintoHeader,
  shintoCard,
  shintoSection,
  shintoDivider,
  shintoFooter,
  status
} from '../../lib/style.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const name = m.name || m.pushName || 'Cosplayer-san'
  const hour = new Date().getHours()

  if (!Array.isArray(COSRENT_LIST) || COSRENT_LIST.length === 0) {
    return m.reply(
      status.error(
        `Data katalog cosplay belum tersedia.\nSilakan jalankan update melalui *${usedPrefix}cosupdate* terlebih dahulu.`
      )
    )
  }

  const args = (text || '').trim().split(/\s+/)
  const sub = args[0]?.toLowerCase()

  // 1. DETAIL VIEW: .cosrent detail <index> atau .cosrent <nomor>
  const isNumberOnly = /^\d+$/.test(text?.trim())
  if (sub === 'detail' || isNumberOnly) {
    const targetIdx = isNumberOnly ? parseInt(text.trim(), 10) - 1 : parseInt(args[1], 10) - 1
    const item = COSRENT_LIST[targetIdx]

    if (!item) {
      return m.reply(
        status.warning(
          `Nomor katalog *${targetIdx + 1}* tidak ditemukan.\nTotal katalog saat ini: *${COSRENT_LIST.length}* kostum.\n\nGunakan *${usedPrefix + command} <nama>* untuk mencari.`
        )
      )
    }

    const cardFields = {
      'Series': item.series || '-',
      'Karakter': item.costume || '-',
      'Brand': item.brand || '-',
      'Harga': item.harga || '-',
      'Ukuran': `${item.size || '-'}${item.gender && item.gender !== '-' ? ` (${item.gender})` : ''}`
    }

    if (item.ld && item.ld !== '-') cardFields['LD (Lingkar Dada)'] = item.ld
    if (item.lp && item.lp !== '-') cardFields['LP (Lingkar Pinggang)'] = item.lp
    cardFields['Lokasi'] = item.lokasi || '-'
    cardFields['Rental'] = item.rental || '-'
    if (item.instagram && item.instagram !== '-') cardFields['Instagram'] = `@${item.instagram}`

    let detailCard = shintoCard(item.nama.toUpperCase(), cardFields)

    let kelengkapanContent = item.detail && item.detail !== '-'
      ? `⟡ ${item.detail}`
      : '⟡ Silakan cek informasi lengkap pada link katalog penyedia rental.'

    let kelengkapanSection = shintoSection('KELENGKAPAN & CATATAN', kelengkapanContent)

    let caption = [
      shintoHeader('DETAIL SEWA COSPLAY', getGreeting(name, hour)),
      detailCard,
      kelengkapanSection,
      `🔗 *Link Resmi:* ${item.link}`,
      shintoDivider(),
      `💡 *Tips:* Hubungi rental melalui DM Instagram untuk booking & cek ketersediaan tanggal.`
    ].join('\n\n')

    if (item.image && item.image.startsWith('http')) {
      try {
        return await conn.sendMessage(
          m.chat,
          {
            image: { url: item.image },
            caption
          },
          { quoted: m }
        )
      } catch (e) {
        // Fallback jika gambar gagal dimuat
        return m.reply(caption)
      }
    }

    return m.reply(caption)
  }

  // 2. KOTA / LOKASI FILTER: .cosrent kota <nama> / .cosrent lokasi <nama>
  if (sub === 'kota' || sub === 'lokasi') {
    const locQuery = args.slice(1).join(' ').toLowerCase()
    if (!locQuery) {
      return m.reply(
        status.warning(
          `Masukkan nama kota yang dicari.\nContoh: *${usedPrefix + command} kota bekasi*`
        )
      )
    }

    const filtered = COSRENT_LIST.filter(c =>
      (c.lokasi || '').toLowerCase().includes(locQuery)
    )

    if (filtered.length === 0) {
      return m.reply(
        status.warning(
          `Tidak ada kostum yang terdaftar di lokasi *"${locQuery}"*.\nCoba cari kota lain seperti *Jakarta, Bekasi, Bandung, Semarang, Surabaya*, dll.`
        )
      )
    }

    let rows = filtered.slice(0, 15).map((c, i) => {
      const realIndex = COSRENT_LIST.findIndex(x => x.link === c.link) + 1
      return [
        `*${i + 1}.* [${c.series}] *${c.nama}*`,
        `   💰 ${c.harga} • 📏 Size ${c.size}`,
        `   🏪 ${c.rental} • 📍 ${c.lokasi}`,
        `   👉 Ketik: *${usedPrefix + command} detail ${realIndex}*`
      ].join('\n')
    })

    let body = [
      shintoHeader('KATALOG COSPLAY WILAYAH', `Lokasi: ${locQuery.toUpperCase()}`),
      `Ditemukan *${filtered.length}* kostum di wilayah ini (Menampilkan ${Math.min(filtered.length, 15)} teratas):\n`,
      rows.join('\n\n'),
      shintoDivider(),
      `💡 *Gunakan:* _${usedPrefix + command} detail <nomor>_ untuk melihat info lengkap & foto.`
    ].join('\n')

    return m.reply(body)
  }

  // 3. SERIES FILTER: .cosrent series <nama>
  if (sub === 'series') {
    const seriesQuery = args.slice(1).join(' ').toLowerCase()
    if (!seriesQuery) {
      return m.reply(
        status.warning(
          `Masukkan nama series/anime yang dicari.\nContoh: *${usedPrefix + command} series genshin*`
        )
      )
    }

    const filtered = COSRENT_LIST.filter(c =>
      (c.series || '').toLowerCase().includes(seriesQuery)
    )

    if (filtered.length === 0) {
      return m.reply(
        status.warning(
          `Tidak ada kostum dari anime/series *"${seriesQuery}"* di katalog saat ini.`
        )
      )
    }

    let rows = filtered.slice(0, 15).map((c, i) => {
      const realIndex = COSRENT_LIST.findIndex(x => x.link === c.link) + 1
      return [
        `*${i + 1}.* *${c.nama}*`,
        `   💰 ${c.harga} • 📏 Size ${c.size}${c.gender && c.gender !== '-' ? ` (${c.gender})` : ''}`,
        `   🏪 ${c.rental} • 📍 ${c.lokasi}`,
        `   👉 Ketik: *${usedPrefix + command} detail ${realIndex}*`
      ].join('\n')
    })

    let body = [
      shintoHeader('KATALOG SERIES', seriesQuery.toUpperCase()),
      `Ditemukan *${filtered.length}* kostum dari series ini:\n`,
      rows.join('\n\n'),
      shintoDivider(),
      `💡 *Gunakan:* _${usedPrefix + command} detail <nomor>_ untuk melihat foto & kontak rental.`
    ].join('\n')

    return m.reply(body)
  }

  // 4. SEARCH QUERY: .cosrent <kata kunci>
  if (text && text.trim().length > 0) {
    const q = text.toLowerCase().trim()
    const results = COSRENT_LIST.filter(c =>
      (c.nama || '').toLowerCase().includes(q) ||
      (c.series || '').toLowerCase().includes(q) ||
      (c.costume || '').toLowerCase().includes(q) ||
      (c.rental || '').toLowerCase().includes(q) ||
      (c.lokasi || '').toLowerCase().includes(q) ||
      (c.brand || '').toLowerCase().includes(q)
    )

    if (results.length === 0) {
      const sampleSeries = [...new Set(COSRENT_LIST.map(c => c.series).filter(s => s && s !== '-'))].slice(0, 6)

      return m.reply(
        status.warning(
          `Pencarian *"${text}"* tidak ditemukan di katalog.\n\n` +
          `✨ *Series Populer Tersedia:*\n` +
          sampleSeries.map(s => `• ${s}`).join('\n') +
          `\n\nCoba gunakan kata kunci lain (nama karakter, judul anime, kota, atau nama toko).`
        )
      )
    }

    let rows = results.slice(0, 12).map((c, i) => {
      const realIndex = COSRENT_LIST.findIndex(x => x.link === c.link) + 1
      return [
        `*${i + 1}.* [${c.series}] *${c.nama}*`,
        `   💰 ${c.harga} • 📏 Size ${c.size}`,
        `   🏪 ${c.rental} • 📍 ${c.lokasi}`,
        `   👉 Ketik: *${usedPrefix + command} detail ${realIndex}*`
      ].join('\n')
    })

    let body = [
      shintoHeader('HASIL PENCARIAN COSRENT', `Keyword: "${text}"`),
      `Ditemukan *${results.length}* kostum (Menampilkan ${Math.min(results.length, 12)} teratas):\n`,
      rows.join('\n\n'),
      shintoDivider(),
      `💡 *Gunakan:* _${usedPrefix + command} detail <nomor>_ untuk melihat info detail & foto kostum.`
    ].join('\n')

    return m.reply(body)
  }

  // 5. DEFAULT OVERVIEW / MENU: .cosrent
  const totalCostumes = COSRENT_LIST.length
  const uniqueSeries = [...new Set(COSRENT_LIST.map(c => c.series).filter(s => s && s !== '-'))]
  const uniqueRentals = [...new Set(COSRENT_LIST.map(c => c.rental).filter(r => r && r !== '-'))]
  const sampleSeries = uniqueSeries.slice(0, 8)

  let overviewCard = shintoCard('INFORMASI KATALOG', {
    'Total Kostum': `${totalCostumes} Item`,
    'Total Series': `${uniqueSeries.length} Judul`,
    'Rental Terdaftar': `${uniqueRentals.length} Toko`,
    'Sumber Data': 'RuangCosplay Indonesia'
  })

  let usageSection = shintoSection('PANDUAN PENCARIAN', [
    `⟡ *${usedPrefix + command} <karakter/anime>* : Cari kostum/karakter`,
    `⟡ *${usedPrefix + command} kota <nama kota>* : Filter berdasarkan lokasi`,
    `⟡ *${usedPrefix + command} series <judul anime>* : Filter berdasarkan anime`,
    `⟡ *${usedPrefix + command} detail <nomor>* : Lihat detail lengkap & foto`
  ].join('\n'))

  let popularSeriesSection = shintoSection('SERIES TERSEDIA', sampleSeries.map(s => `⟡ • ${s}`).join('\n'))

  let textMenu = [
    shintoHeader('COSPLAY RENTAL INDONESIA', getGreeting(name, hour)),
    overviewCard,
    usageSection,
    popularSeriesSection,
    shintoFooter('Cari kostum impianmu dengan cepat & akurat!')
  ].join('\n\n')

  return m.reply(textMenu)
}

handler.help = ['cosrent <pencarian>', 'cosrent detail <nomor>', 'cosrent kota <nama>']
handler.tags = ['info', 'search']
handler.command = /^(cosrent|cosplayrent|sewacosplay|coslist)$/i

export default handler
