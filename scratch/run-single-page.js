import { getPage, getDetail } from '../tools/updateCosrent.js'
import fs from 'fs'

function escapeJS(text = '') {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n|\r/g, ' ')
}

async function testPage1() {
  console.log('Testing page 1 scraping...')
  const links = await getPage(1)
  console.log(`Found ${links.length} costumes on page 1`)

  const sampleLinks = links.slice(0, 10) // fetch 10 items for rapid verification
  const results = []

  for (const l of sampleLinks) {
    console.log('Fetching:', l)
    const d = await getDetail(l)
    results.push(d)
    console.log(` -> [${d.series}] ${d.nama} | Toko: ${d.rental} | ${d.harga} | Lokasi: ${d.lokasi}`)
  }

  let output = `export const COSRENT_LIST = [\n`
  for (const c of results) {
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
  console.log('Successfully saved to ./lib/cosrentList.js!')
}

testPage1().catch(console.error)
