import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'

const BASE = 'https://ruangcosplay.com/sewa'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function clean(text = '') {
  return String(text).replace(/\s+/g, ' ').trim()
}

function progress(type, text) {
  console.log(`${type} ${text}`)
}

function escapeJS(text = '') {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n|\r/g, ' ')
}

async function getPage(page, retry = 0) {
  try {
    const res = await axios.get(`${BASE}?page=${page}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000
    })

    const $ = cheerio.load(res.data)
    const links = []

    $('a[href*="/sewa/"]').each((i, el) => {
      let href = $(el).attr('href')
      if (!href) return

      let link = href.startsWith('http') ? href : 'https://ruangcosplay.com' + href
      
      // Filter out non-detail links (like /sewa itself)
      if (link !== BASE && link !== 'https://ruangcosplay.com/sewa/' && !links.includes(link)) {
        links.push(link)
      }
    })

    return links
  } catch (err) {
    if (retry < 3) {
      progress('PAGE_PROGRESS', `Halaman ${page} gagal, retry ${retry + 1}/3 (${err.message})`)
      await sleep(2000)
      return getPage(page, retry + 1)
    }
    throw err
  }
}

async function getDetail(url, retry = 0) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000
    })

    const $ = cheerio.load(res.data)

    // 1. Nama Kostum
    const rawH1 = clean($('h1').first().text())
    const titleParts = clean($('title').text()).split('-')
    const nama = rawH1 || (titleParts[0] ? clean(titleParts[0]) : 'Kostum Cosplay')

    // 2. Series, Character, Brand
    const series = clean($('a[href*="/series/"]').first().text()) || '-'
    const rawChar = clean($('a[href*="/character/"]').first().text())
    const costume = rawChar || nama
    const brand = clean($('a[href*="/brand/"]').first().text()) || '-'

    // 3. Rental Store & Kontak
    const rentalRaw = clean($('#div-2 .user-card .fw-bold').first().text()) ||
                      clean($('.user-card .fw-bold').first().text()) ||
                      (titleParts.length > 1 ? clean(titleParts[titleParts.length - 1]) : 'RuangCosplay Rental')
    const rental = rentalRaw || '-'

    let instagram = '-'
    const igLink = $('a[href*="instagram.com"]').first().attr('href')
    if (igLink && !igLink.includes('/p/') && !igLink.includes('/reel/')) {
      const match = igLink.match(/instagram\.com\/([a-zA-Z0-9._]+)/i)
      if (match && match[1]) instagram = match[1]
    }
    if (instagram === '-') {
      const mutedText = clean($('#div-2 .text-muted').first().text())
      if (mutedText) instagram = mutedText.replace(/^@/, '')
    }

    // 4. Harga
    const div1 = $('#div-1')
    const div1Text = div1.text()
    const hargaMatch = div1Text.match(/Rp\s?[\d.,]+(?:\s*\/\s*\d+\s*hari)?/i)
    const rawPriceDiv = clean(div1.find('.text-success.h5, .text-success.fw-bold, .text-success').first().text())
    const harga = hargaMatch ? clean(hargaMatch[0]) : (rawPriceDiv || '-')

    // 5. Lokasi
    const kota = clean($('a[href*="/kota/"]').first().text())
    const provinsi = clean($('a[href*="/provinsi/"]').first().text())
    let lokasi = [kota, provinsi].filter(Boolean).join(', ')
    if (!lokasi) {
      const locMatch = div1Text.match(/(?:Jawa\s+\w+|Jakarta(?:\s+\w+)?|Bali|Sumatera(?:\s+\w+)?|Kalimantan(?:\s+\w+)?|Sulawesi(?:\s+\w+)?|Yogyakarta|Bandung|Malang|Surabaya|Bekasi|Tangerang|Bogor|Depok|Semarang|Solo)/i)
      lokasi = locMatch ? clean(locMatch[0]) : '-'
    }

    // 6. Badges (Size, Gender, LD, LP)
    const badges = div1.find('.cui-border, .badge, .mb-3 span')
      .map((i, el) => clean($(el).text()))
      .get()
      .filter(Boolean)

    let size = badges.find(b => /^(XS|S|M|L|XL|XXL|XXXL|All\s*Size|Free\s*Size|S\s*-\s*M|M\s*-\s*L|L\s*-\s*XL|XL\s*-\s*XXL)$/i.test(b)) || '-'
    let gender = badges.find(b => /^(Wanita|Pria|Unisex)$/i.test(b)) || '-'

    const ldMatch = div1Text.match(/LD\s*:?\s*([\d\-\s]+(?:\s*cm)?)/i)
    const lpMatch = div1Text.match(/LP\s*:?\s*([\d\-\s]+(?:\s*cm)?)/i)
    const ld = ldMatch ? clean(ldMatch[1]) : '-'
    const lp = lpMatch ? clean(lpMatch[1]) : '-'

    // 7. Kelengkapan / Detail
    let detail = clean(div1.find('.html-format').first().text())
    if (detail.startsWith('Detail')) detail = clean(detail.replace(/^Detail\s*/, ''))
    if (!detail) detail = '-'

    // 8. Image
    let image = $('meta[property="og:image"]').attr('content') ||
                $('img.card-img-cover, a[data-fslightbox] img').first().attr('data-src') ||
                $('img.card-img-cover, a[data-fslightbox] img').first().attr('src') || ''
    if (image && image.startsWith('/')) image = 'https://ruangcosplay.com' + image

    return {
      nama,
      series,
      costume,
      brand,
      rental,
      instagram,
      harga,
      size,
      gender,
      ld,
      lp,
      lokasi,
      detail,
      image,
      link: url
    }
  } catch (err) {
    if (retry < 3) {
      await sleep(2000)
      return getDetail(url, retry + 1)
    }
    throw err
  }
}

async function generate() {
  progress('PAGE_PROGRESS', '🚀 Memulai scan katalog RuangCosplay')

  let allData = []
  let page = 1

  while (true) {
    progress('PAGE_PROGRESS', `📄 Scan halaman ${page}`)

    let links = await getPage(page)

    if (!links || !links.length) {
      progress('PAGE_PROGRESS', '🏁 Halaman terakhir ditemukan')
      break
    }

    progress('PAGE_PROGRESS', `Halaman ${page} ditemukan ${links.length} costume`)

    for (const link of links) {
      try {
        progress('COSTUME_PROGRESS', `🔎 Membuka detail:\n${link}`)

        let data = await getDetail(link)

        if (data && data.nama) {
          allData.push(data)
          progress('COSTUME_PROGRESS', `✅ [${data.series}] ${data.nama} - ${data.rental} (${data.harga})`)
        }

        await sleep(600)
      } catch (err) {
        progress('COSTUME_PROGRESS', `❌ Gagal scan:\n${link} (${err.message})`)
      }
    }

    progress('PAGE_PROGRESS', `✅ Halaman ${page} selesai\n📦 Total sementara: ${allData.length}`)

    // Optional limit during full run if needed, but RuangCosplay typically has ~5-10 pages
    page++
    await sleep(1000)
  }

  // Deduplicate
  allData = allData.filter((v, i, a) => a.findIndex(x => x.link === v.link) === i)

  progress('GENERATE_PROGRESS', '📝 Membuat lib/cosrentList.js')

  let output = `export const COSRENT_LIST = [\n`

  for (const c of allData) {
    output += `  {\n`
    output += `    nama: '${escapeJS(c.nama)}',\n`
    output += `    series: '${escapeJS(c.series)}',\n`
    output += `    costume: '${escapeJS(c.costume)}',\n`
    output += `    brand: '${escapeJS(c.brand)}',\n`
    output += `    rental: '${escapeJS(c.rental)}',\n`
    output += `    instagram: '${escapeJS(c.instagram)}',\n`
    output += `    harga: '${escapeJS(c.harga)}',\n`
    output += `    size: '${escapeJS(c.size)}',\n`
    output += `    gender: '${escapeJS(c.gender)}',\n`
    output += `    ld: '${escapeJS(c.ld)}',\n`
    output += `    lp: '${escapeJS(c.lp)}',\n`
    output += `    lokasi: '${escapeJS(c.lokasi)}',\n`
    output += `    detail: '${escapeJS(c.detail)}',\n`
    output += `    image: '${escapeJS(c.image)}',\n`
    output += `    link: '${escapeJS(c.link)}'\n`
    output += `  },\n`
  }

  output += `]\n\nexport default COSRENT_LIST\n`

  fs.writeFileSync('./lib/cosrentList.js', output)

  progress('TOTAL_PROGRESS', `✅ Update selesai\n📦 Total costume akhir: ${allData.length}`)
}

// Support command line argument for test or direct run
const isDirectRun = process.argv[1]?.endsWith('updateCosrent.js')
if (isDirectRun) {
  generate().catch(err => {
    console.error('Fatal generator error:', err)
    process.exit(1)
  })
}

export { getPage, getDetail, generate }