import axios from 'axios';
import * as cheerio from 'cheerio';

function clean(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

async function extractDetail(url) {
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 15000
  });
  const $ = cheerio.load(res.data);

  // 1. Nama / Title
  const nama = clean($('h1').first().text()) || clean($('title').text().split('-')[0]);

  // 2. Series & Character
  const series = clean($('a[href*="/series/"]').first().text());
  const costume = clean($('a[href*="/character/"]').first().text()) || nama;
  const brand = clean($('a[href*="/brand/"]').first().text());

  // 3. Rental Store Info
  const rental = clean($('#div-2 .user-card .fw-bold').first().text()) || clean($('.user-card .fw-bold').first().text()) || clean($('title').text().split('-').pop());
  const instagram = clean($('a[href*="instagram.com"]').first().attr('href')?.split('instagram.com/')[1]?.replace(/\/$/, '')) || clean($('#div-2 .text-muted').first().text());

  // 4. Harga
  const hargaRaw = clean($('#div-1 .text-success.h5, #div-1 .text-success.fw-bold, .text-success').first().text());
  const hargaMatch = $('#div-1').text().match(/Rp\s?[\d.,]+(?:\s*\/\s*\d+\s*hari)?/i);
  const harga = hargaMatch ? clean(hargaMatch[0]) : (hargaRaw || '-');

  // 5. Lokasi
  const kota = clean($('a[href*="/kota/"]').first().text());
  const provinsi = clean($('a[href*="/provinsi/"]').first().text());
  let lokasi = [kota, provinsi].filter(Boolean).join(', ');
  if (!lokasi) {
    const locMatch = $('#div-1').text().match(/(?:Jawa\s+\w+|Jakarta|Bali|Sumatera|Kalimantan|Sulawesi|Yogyakarta|Bandung|Malang|Surabaya|Bekasi|Tangerang|Bogor|Depok|Semarang|Solo)/i);
    lokasi = locMatch ? clean(locMatch[0]) : '-';
  }

  // 6. Badges (Size, Gender, LD, LP) in #div-1
  const badges = $('#div-1 .cui-border, #div-1 .badge, #div-1 .mb-3 span').map((i, el) => clean($(el).text())).get().filter(Boolean);
  
  let size = badges.find(b => /^(XS|S|M|L|XL|XXL|XXXL|All\s*Size|Free\s*Size|S\s*-\s*M|M\s*-\s*L|L\s*-\s*XL|XL\s*-\s*XXL)/i.test(b)) || '-';
  let gender = badges.find(b => /^(Wanita|Pria|Unisex)$/i.test(b)) || '-';
  
  const div1Text = $('#div-1').text();
  const ldMatch = div1Text.match(/LD\s*:?\s*([\d\-\s]+(?:\s*cm)?)/i);
  const lpMatch = div1Text.match(/LP\s*:?\s*([\d\-\s]+(?:\s*cm)?)/i);
  const ld = ldMatch ? clean(ldMatch[1]) : '-';
  const lp = lpMatch ? clean(lpMatch[1]) : '-';

  // 7. Kelengkapan / Detail
  const includeDetail = clean($('#div-1 .html-format').first().text());

  // 8. Image
  const image = $('meta[property="og:image"]').attr('content') || $('img.card-img-cover, a[data-fslightbox] img').first().attr('src') || '';

  return {
    nama,
    series: series || '-',
    costume: costume || '-',
    brand: brand || '-',
    rental: rental || '-',
    instagram: instagram || '-',
    harga,
    size,
    gender,
    ld,
    lp,
    lokasi: lokasi || '-',
    detail: includeDetail || '-',
    image,
    link: url
  };
}

async function test() {
  const urls = [
    'https://ruangcosplay.com/sewa/marin-kitagawa/16734',
    'https://ruangcosplay.com/sewa/tomoyo-daidouji/16732',
    'https://ruangcosplay.com/sewa/lucy-heartfilia/21928',
    'https://ruangcosplay.com/sewa/frieren/22812'
  ];

  console.log('--- TESTING ACCURATE EXTRACTION ---');
  for (const u of urls) {
    try {
      const data = await extractDetail(u);
      console.log('\nResult for:', u);
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error on', u, e.message);
    }
  }
}

test();
