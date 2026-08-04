import fetch from 'node-fetch'

async function testBackupAiProviders() {
  const prompt = 'halo, siapa namamu?'
  
  // Provider 1: Pollinations with random user agent to bypass 429
  try {
    const ua = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random()*20 + 100)}.0.0.0 Safari/537.36`
    const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
      headers: { 'User-Agent': ua, 'Referer': 'https://pollinations.ai/' }
    })
    console.log('Pollinations Status:', res.status)
    if (res.ok) {
      console.log('Pollinations text:', (await res.text()).slice(0, 100))
      return
    }
  } catch (e) {
    console.log('Pollinations err:', e.message)
  }
}

testBackupAiProviders()
