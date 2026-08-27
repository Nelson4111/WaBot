import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const url = 'https://ruangcosplay.com/sewa/marin-kitagawa/16734';
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(res.data);

  console.log('=== PART 3 OF DIV-1 ===');
  console.log($('#div-1').html().substring(2000, 3800));
}

test();
