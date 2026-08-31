import fs from 'fs'
import { loadDB } from '../../lib/waifuHelper.js'
import { getGreeting } from '../../lib/style.js'

let handler = async (m, { conn, usedPrefix: _p }) => {
  let wib = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  let d = new Date(wib)
  let locale = 'id-ID'
  let tanggal = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  let hari = d.toLocaleDateString(locale, { weekday: 'long' })
  let jam = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })

  let user = global.db.data.users[m.sender] || {}
  const wdb = loadDB()
  const uang = wdb.money?.[m.sender] || 0
  let { limit = 0, role = 'User', name = m.pushName, premiumTime = 0 } = user
  let prems = premiumTime > 0 ? 'Premium Ⓟ' : 'Free Ⓛ'
  let greeting = getGreeting(name, d.getHours())

  let userCSM = wdb.users?.[m.sender]?.rpg?.csm
  let csmInfo = ''
  if (userCSM?.started) {
    csmInfo = `┌──〔 ✦ *STATUS CSM HUNTER* 〕\n` +
      `│ ⟡ *Nickname* : ${userCSM.nickname || '-'}\n` +
      `│ ⟡ *Level* : ${userCSM.level || 1} [${userCSM.title || 'Applicant'}]\n` +
      `│ ⟡ *HP* : ${userCSM.health || 100}/${userCSM.maxHealth || 100}\n` +
      `│ ⟡ *Blood* : ${(userCSM.blood || 0).toLocaleString('id-ID')}\n` +
      `│ ⟡ *Kontrak* : ${userCSM.devilContract || 'None'}\n` +
      `│ ⟡ *Partner Aktif* : ${userCSM.partners?.filter(p => p.status === 'active')?.length || 0}/5\n` +
      `└────────────────────────\n\n`
  }

  let csmFeatures = Object.values(global.plugins)
    .filter(p => !p.disabled && p.tags && p.tags.includes('csm'))
    .flatMap(p => (Array.isArray(p.help) ? p.help : [p.help]).map(cmd => ({
      cmd: p.prefix ? cmd : _p + cmd,
      limit: p.limit,
      premium: p.premium
    })))
    .sort((a, b) => a.cmd.localeCompare(b.cmd))
    .map(v => `│ ⟡ ${v.cmd} ${v.premium ? 'Ⓟ' : ''}${v.limit ? 'Ⓛ' : ''}`)
    .join('\n')

  let videoMenu = null
  try {
    const listMenu = JSON.parse(fs.readFileSync('./media/menu.json'))
    videoMenu = listMenu[Math.floor(Math.random() * listMenu.length)]
  } catch { videoMenu = null }

  let menuText = `
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆
   〔 ✦ *CHAINSAW MAN RPG MENU* 〕
> ${greeting}
⋆⁺₊⋆ ────────────────── ⋆⁺₊⋆

${csmInfo}┌──〔 ✦ *PROFIL PENGGUNA* 〕
│ ⟡ *Nama* : ${name}
│ ⟡ *Role* : ${role}
│ ⟡ *Status* : ${prems}
│ ⟡ *Limit* : ${limit}
│ ⟡ *Saldo* : Rp ${uang.toLocaleString('id-ID')}
└────────────────────────

┌──〔 ✦ *WAKTU & TANGGAL* 〕
│ ⟡ *Tanggal* : ${tanggal}
│ ⟡ *Hari* : ${hari}
│ ⟡ *Jam* : ${jam} WIB
└────────────────────────

┌──〔 ✦ *DAFTAR PERINTAH CSM* 〕
${csmFeatures}
└────────────────────────

· · ─ ─ ✦ ─ ─ · ·
> _Gunakan ${_p}csm tutorial untuk panduan lengkap Chainsaw Man RPG_
`.trim()

  let contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterName: `「 ${global.namebot} 」`,
      newsletterJid: global.ch
    }
  }

  if (videoMenu) {
    await conn.sendMessage(m.chat, {
      video: { url: videoMenu },
      gifPlayback: true,
      caption: menuText,
      footer: global.namebot,
      mentions: [m.sender],
      contextInfo
    }, { quoted: m })
  } else {
    await conn.sendMessage(m.chat, {
      text: menuText,
      footer: global.namebot,
      mentions: [m.sender],
      contextInfo
    }, { quoted: m })
  }
}

handler.command = /^(menucsm|csmmenu)$/i
handler.help = ['menucsm']
handler.tags = ['main']

export default handler
