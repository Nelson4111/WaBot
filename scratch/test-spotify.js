import axios from 'axios'

async function searchSpotifyFreeApis(query) {
  const apis = [
    `https://api.lolhuman.xyz/api/spotifysearch?apikey=GataDios&query=${encodeURIComponent(query)}`,
    `https://api.lolhuman.xyz/api/spotify?apikey=GataDios&url=${encodeURIComponent(query)}`,
    `https://api.botcahx.eu.org/api/search/spotify?query=${encodeURIComponent(query)}`,
    `https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(query)}`
  ]

  for (let api of apis) {
    try {
      console.log('Testing API:', api)
      const res = await axios.get(api, { timeout: 6000 })
      console.log('RES:', JSON.stringify(res.data).slice(0, 300))
    } catch (e) {
      console.log('FAIL:', api, e.message)
    }
  }
}

searchSpotifyFreeApis('sepenuh hati')
