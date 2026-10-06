import { addRpgExp, getUserRPG, loadDB, saveDB } from '../../lib/waifuHelper.js'
import { resolveLid } from '../../lib/simple.js'
import {
  getMountTitle,
  MOUNTAINS,
  MOUNT_COOLDOWN,
  MOUNT_PREMIUM_COOLDOWN,
  MOUNT_STORIES,
  MOUNT_TEAM_LIMIT,
  MOUNT_TRASH
} from '../../lib/mountData.js'

const normalize = value => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase()

const formatDuration = milliseconds => {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return [hours ? `${hours} jam` : '', minutes ? `${minutes} menit` : '']
    .filter(Boolean)
    .join(' ') || 'kurang dari 1 menit'
}

const formatHeight = height => `${height.toLocaleString('id-ID')} mdpl`
const getCooldown = user => user?.premium === true || Number(user?.premiumTime) > Date.now()
  ? MOUNT_PREMIUM_COOLDOWN
  : MOUNT_COOLDOWN
const getRemainingCooldown = (user, mount, now = Date.now()) =>
  (Number(mount.lastCooldown) || getCooldown(user)) - (now - (Number(mount.lastMount) || 0))
const normalizeJid = jid => {
  const resolved = resolveLid(jid)
  return typeof resolved === 'string' ? resolved.split(':')[0] : jid
}
const getUserMount = user => {
  if (!user.mount || typeof user.mount !== 'object') user.mount = {}
  user.mount.history = Array.isArray(user.mount.history) ? user.mount.history : []
  user.mount.peaks = Array.isArray(user.mount.peaks) ? user.mount.peaks : []
  user.mount.summits = Math.max(0, Number(user.mount.summits) || 0)
  user.mount.exp = Math.max(0, Number(user.mount.exp) || 0)
  user.mount.trash = Math.max(0, Number(user.mount.trash) || 0)
  return user.mount
}

const findTeamForUser = (teams, jid) => Object.values(teams)
  .find(team => Array.isArray(team.members) && team.members.some(member => normalizeJid(member) === normalizeJid(jid)))

const ensureMountStats = data => {
  if (!data.mountStats || typeof data.mountStats !== 'object') {
    const players = Object.values(data.users || {}).map(player => player?.mount).filter(Boolean)
    data.mountStats = {
      participants: players.reduce((sum, player) => sum + (Number(player.summits) || 0), 0),
      trash: players.reduce((sum, player) => sum + (Number(player.trash) || 0), 0)
    }
  }
  data.mountStats.participants = Math.max(0, Number(data.mountStats.participants) || 0)
  data.mountStats.trash = Math.max(0, Number(data.mountStats.trash) || 0)
  if (!Array.isArray(data.mountRequests)) data.mountRequests = []
  return data.mountStats
}

const getHighestClimbedHeight = player => (player.peaks || [])
  .reduce((highest, name) => Math.max(highest, MOUNTAINS.find(mountain => mountain.name === name)?.height || 0), 0)

const findMountain = value => {
  const index = Number(value)
  if (Number.isInteger(index) && index >= 1 && index <= MOUNTAINS.length) return MOUNTAINS[index - 1]
  const wanted = normalize(value)
  return MOUNTAINS.find(mountain => normalize(mountain.name) === wanted)
}

const getName = (conn, jid) => {
  return conn.getName?.(jid) || jid.split('@')[0]
}

const handler = async (m, { conn, text, usedPrefix, isOwner }) => {
  const wdb = loadDB()
  const data = global.db.data
  const stats = ensureMountStats(data)
  if (!data.mountTeams || typeof data.mountTeams !== 'object') data.mountTeams = {}
  const teams = data.mountTeams
  const args = String(text || '').trim().split(/\s+/).filter(Boolean)
  const action = normalize(args[0])
  const senderJid = normalizeJid(m.sender)
  const sender = wdb.users[senderJid]
  if (!sender) wdb.users[senderJid] = {}
  const user = wdb.users[senderJid]
  const mount = getUserMount(user)
  const team = findTeamForUser(teams, senderJid)

  const showCommands = () => m.reply(
    `╭─❏「 ⛰️ MOUNT COMMAND 」❏\n` +
    `│ ${usedPrefix}mt list — Daftar gunung\n` +
    `│ ${usedPrefix}mt pilih <nomor/nama> — Pilih gunung\n` +
    `│ ${usedPrefix}mt guide — Panduan pendakian\n` +
    `│ ${usedPrefix}mt command — Daftar command\n` +
    `│ ${usedPrefix}mt info — Statistik pendakian\n` +
    `│ ${usedPrefix}mt request <nama gunung> — Ajukan gunung\n` +
    `│ ${usedPrefix}mt request — Lihat daftar request\n` +
    `│ ${usedPrefix}mt solo — Pilih mode solo\n` +
    `│ ${usedPrefix}mt team create <nama> — Buat tim\n` +
    `│ ${usedPrefix}mt team join <nama> — Gabung tim\n` +
    `│ ${usedPrefix}mt team leave — Keluar dari tim\n` +
    `│ ${usedPrefix}mt team info — Info tim\n` +
    `│ ${usedPrefix}mt start — Mulai pendakian\n` +
    `│ ${usedPrefix}mt status — Status pilihan\n` +
    `│ ${usedPrefix}mt cd — Status cooldown\n` +
    `│ ${usedPrefix}mt profile — Profil pendakian\n` +
    `│ ${usedPrefix}mt history — Riwayat pendakian\n` +
    `│ ${usedPrefix}mt top — Peringkat pendaki\n` +
    `│ ${usedPrefix}mt done <nama/nomor> — Hapus request (owner/co-owner)\n` +
    `╰─━━━━━━━━━━━━━━─`
  )

  if (!action || action === 'command' || action === 'commands') return showCommands()

  if (action === 'info') {
    const completedMounts = new Set(Object.values(wdb.users)
      .flatMap(player => player?.mount?.peaks || []))
    const cleaned = Math.max(stats.trash, Object.values(wdb.users)
      .reduce((sum, player) => sum + (Number(player?.mount?.trash) || 0), 0))
    return m.reply(
      `╭─❏「 📊 INFO PENDAKIAN 」❏\n` +
      `Gunung tersedia: ${MOUNTAINS.length}\n` +
      `Sampah terkumpul: ${cleaned.toLocaleString('id-ID')} item\n` +
      `Pendakian individu: ${stats.participants.toLocaleString('id-ID')} kali\n` +
      `Gunung yang sudah pernah didaki: ${completedMounts.size}\n\n` +
      `Usulkan gunung dengan ${usedPrefix}mt request <nama gunung>.\n` +
      `Daftar usulan: ${usedPrefix}mt request\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'request' || action === 'req') {
    const mountainName = args.slice(1).join(' ').trim()
    if (mountainName) {
      if (mountainName.length > 80) return m.reply('Nama gunung maksimal 80 karakter.')
      const existing = data.mountRequests.find(request => normalize(request.name) === normalize(mountainName))
      if (existing) return m.reply(`Gunung *${existing.name}* sudah ada di daftar request (#${data.mountRequests.indexOf(existing) + 1}).`)
      data.mountRequests.push({ name: mountainName, jid: senderJid, createdAt: Date.now() })
      await saveDB(wdb)
      return m.reply(`✅ Usulan gunung *${mountainName}* dicatat. Lihat daftar melalui ${usedPrefix}mt request.`)
    }
    const requests = data.mountRequests
    const list = requests.length
      ? requests.map((request, index) =>
        `${index + 1}. ${request.name} — diusulkan ${getName(conn, request.jid)}`
      ).join('\n')
      : 'Belum ada usulan gunung.'
    return m.reply(
      `╭─❏「 📝 REQUEST GUNUNG 」❏\n` +
      `Kirim usulan gunung nyata atau fiksi dengan ${usedPrefix}mt request <nama gunung>.\n` +
      `Usulan akan ditinjau sebelum dimasukkan ke daftar pendakian.\n\n` +
      `Daftar request (${requests.length}):\n${list}\n\n` +
      `Owner/co-owner dapat menghapus usulan dengan ${usedPrefix}mt done <nama gunung/nomor>.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'done') {
    if (!isOwner) return m.reply('❌ Perintah ini khusus Owner atau Co-owner.')
    const selector = args.slice(1).join(' ').trim()
    if (!selector) return m.reply(`Format: ${usedPrefix}mt done <nama gunung/nomor>\nLihat daftar: ${usedPrefix}mt request`)
    const number = Number(selector)
    const index = Number.isInteger(number) && number >= 1
      ? number - 1
      : data.mountRequests.findIndex(request => normalize(request.name) === normalize(selector))
    if (index < 0 || index >= data.mountRequests.length) return m.reply('Request tidak ditemukan. Cek daftar dengan `.mt request`.')
    const [removed] = data.mountRequests.splice(index, 1)
    await saveDB(wdb)
    return m.reply(`✅ Request gunung *${removed.name}* dihapus dari daftar.`)
  }

  if (action === 'list' || action === 'gunung') {
    const list = MOUNTAINS.map((mountain, index) =>
      `${String(index + 1).padStart(2, '0')}. ${mountain.name} — ${formatHeight(mountain.height)} • ${mountain.difficulty} • ${mountain.type}`
    ).join('\n')
    return m.reply(`╭─❏「 ⛰️ DAFTAR GUNUNG 」❏\nUrut dari elevasi terendah ke tertinggi\n\n${list}\n\nPilih dengan: ${usedPrefix}mt pilih <nomor/nama>\n╰─━━━━━━━━━━━━━━─`)
  }

  if (action === 'pilih' || action === 'select' || action === 'mountain') {
    const mountain = findMountain(args.slice(1).join(' '))
    if (!mountain) return m.reply(`Gunung tidak ditemukan. Cek ${usedPrefix}mt list, lalu pilih nomor atau nama gunung.`)
    mount.mountain = mountain.name
    await saveDB(wdb)
    return m.reply(`⛰️ Gunung pilihanmu: *${mountain.name}* (${formatHeight(mountain.height)}).\nMode: ${mount.mode === 'solo' ? 'Solo' : mount.mode === 'team' && team ? `Tim ${team.name}` : 'Belum dipilih'}.\nGunakan ${usedPrefix}mt solo atau bergabung/buat tim, lalu ${usedPrefix}mt start.`)
  }

  if (action === 'guide' || action === 'panduan') {
    return m.reply(
      `╭─❏「 📖 PANDUAN PENDAKIAN 」❏\n` +
      `1. Pilih gunung: ${usedPrefix}mt list lalu ${usedPrefix}mt pilih <nomor/nama>.\n` +
      `2. Tentukan mode: ${usedPrefix}mt solo, atau buat/gabung tim lewat ${usedPrefix}mt team.\n` +
      `3. Mulai dengan ${usedPrefix}mt start. Pendakian berlangsung instan dan menghasilkan XP serta sampah temuan yang masuk ke tas RPG.\n` +
      `4. Cooldown 5 jam (Premium 2 jam) per pendaki. Cek ${usedPrefix}mt cd, profil ${usedPrefix}mt profile, dan riwayat ${usedPrefix}mt history.\n` +
      `Tim maksimal ${MOUNT_TEAM_LIMIT} orang; setiap anggota tim harus siap (cooldown selesai) saat pendakian dimulai.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'solo') {
    mount.mode = 'solo'
    await saveDB(wdb)
    return m.reply('✅ Mode pendakian *solo* dipilih. Pilih gunung dengan `.mt pilih <nomor/nama>`, lalu gunakan `.mt start`.')
  }

  if (action === 'team') {
    const teamAction = normalize(args[1])
    const teamName = args.slice(2).join(' ').trim()

    if (teamAction === 'create') {
      if (team) return m.reply(`Kamu sudah bergabung dengan tim *${team.name}*. Keluar dulu dengan ${usedPrefix}mt team leave.`)
      if (!teamName) return m.reply(`Format: ${usedPrefix}mt team create <nama>`)
      if (teamName.length > 32) return m.reply('Nama tim maksimal 32 karakter.')
      if (Object.values(teams).some(item => normalize(item.name) === normalize(teamName))) {
        return m.reply('Nama tim tersebut sudah digunakan. Pilih nama lain.')
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      teams[id] = { id, name: teamName, leader: senderJid, members: [senderJid], createdAt: Date.now() }
      mount.mode = 'team'
      await saveDB(wdb)
      return m.reply(`✅ Tim pendakian *${teamName}* berhasil dibuat. Ajak teman bergabung dengan ${usedPrefix}mt team join ${teamName}.`)
    }

    if (teamAction === 'join') {
      if (team) return m.reply(`Kamu sudah bergabung dengan tim *${team.name}*.`)
      if (!teamName) return m.reply(`Format: ${usedPrefix}mt team join <nama>`)
      const target = Object.values(teams).find(item => normalize(item.name) === normalize(teamName))
      if (!target) return m.reply('Tim tidak ditemukan. Periksa nama tim melalui anggota tim tersebut.')
      if (target.members.length >= MOUNT_TEAM_LIMIT) return m.reply(`Tim sudah penuh (maksimal ${MOUNT_TEAM_LIMIT} anggota).`)
      target.members.push(senderJid)
      mount.mode = 'team'
      await saveDB(wdb)
      return m.reply(`✅ Kamu bergabung dengan tim *${target.name}* (${target.members.length}/${MOUNT_TEAM_LIMIT}).`)
    }

    if (teamAction === 'leave') {
      if (!team) return m.reply('Kamu belum bergabung dengan tim pendakian.')
      team.members = team.members.filter(jid => normalizeJid(jid) !== senderJid)
      mount.mode = null
      if (normalizeJid(team.leader) === senderJid && team.members.length) team.leader = team.members[0]
      if (!team.members.length) delete teams[team.id]
      await saveDB(wdb)
      return m.reply(`Kamu telah keluar dari tim *${team.name}*. Pilih mode lagi sebelum memulai pendakian.`)
    }

    if (teamAction === 'info') {
      if (!team) return m.reply('Kamu belum bergabung dengan tim pendakian.')
      const members = team.members.map((jid, index) =>
        `${index + 1}. ${getName(conn, jid)}${normalizeJid(jid) === normalizeJid(team.leader) ? ' 👑' : ''}`
      ).join('\n')
      return m.reply(`╭─❏「 🧗 TIM ${team.name} 」❏\nAnggota (${team.members.length}/${MOUNT_TEAM_LIMIT}):\n${members}\n╰─━━━━━━━━━━━━━━─`)
    }

    return m.reply(`Perintah tim: ${usedPrefix}mt team create/join/leave/info`)
  }

  if (action === 'cd' || action === 'cooldown') {
    const cooldown = getCooldown(user)
    const remaining = getRemainingCooldown(user, mount)
    return m.reply(remaining > 0
      ? `⏳ Cooldown pendakian tersisa *${formatDuration(remaining)}* (${(Number(mount.lastCooldown) || cooldown) === MOUNT_PREMIUM_COOLDOWN ? 'Premium: 2 jam' : 'Reguler: 5 jam'}).`
      : '✅ Kamu siap mendaki lagi! Cooldown sudah selesai.')
  }

  if (action === 'status') {
    const selected = MOUNTAINS.find(item => item.name === mount.mountain)
    const mode = mount.mode === 'solo' ? 'Solo' : mount.mode === 'team' && team ? `Tim: ${team.name}` : 'Belum dipilih'
    const remaining = getRemainingCooldown(user, mount)
    return m.reply(`╭─❏「 ⛰️ STATUS PENDAKIAN 」❏\nGunung: ${selected ? `${selected.name} (${formatHeight(selected.height)})` : 'Belum dipilih'}\nMode: ${mode}\nCooldown: ${remaining > 0 ? formatDuration(remaining) : 'Siap'}\n╰─━━━━━━━━━━━━━━─`)
  }

  if (action === 'profile' || action === 'profil') {
    const highest = mount.peaks
      .map(name => MOUNTAINS.find(item => item.name === name))
      .filter(Boolean)
      .sort((a, b) => b.height - a.height)[0]
    const remaining = getRemainingCooldown(user, mount)
    return m.reply(
      `╭─❏「 🧗 PROFIL PENDAKI 」❏\n` +
      `Pendaki: ${getName(conn, m.sender)}\n` +
      `Title: ${getMountTitle(mount.summits)}\n` +
      `Total puncak: ${mount.summits}\n` +
      `Gunung berbeda: ${mount.peaks.length}/${MOUNTAINS.length}\n` +
      `XP pendakian: ${mount.exp.toLocaleString('id-ID')}\n` +
      `Sampah dikumpulkan: ${mount.trash.toLocaleString('id-ID')} item\n` +
      `Puncak tertinggi: ${highest ? `${highest.name} (${formatHeight(highest.height)})` : '-'}\n` +
      `Cooldown: ${remaining > 0 ? formatDuration(remaining) : 'Siap'}\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  if (action === 'top' || action === 'leaderboard') {
    const entries = Object.entries(wdb.users)
      .map(([jid, player]) => ({ jid, name: getName(conn, jid), ...getUserMount(player) }))
      .filter(player => player.summits > 0)
      .sort((a, b) => b.summits - a.summits || b.exp - a.exp)
      .slice(0, 10)
    if (!entries.length) return m.reply('Belum ada pendaki di papan peringkat.')
    const rows = entries.map((player, index) =>
      `${index + 1}. ${player.name} — ${getMountTitle(player.summits)} • ${player.summits} puncak • ${player.exp.toLocaleString('id-ID')} XP`
    ).join('\n')
    return m.reply(`╭─❏「 🏆 TOP PENDAKI 」❏\n${rows}\n╰─━━━━━━━━━━━━━━─`)
  }

  if (action === 'history' || action === 'riwayat') {
    if (!mount.history.length) return m.reply('Belum ada riwayat pendakian. Pilih gunung dan mulai dengan `.mt start`.')
    const rows = mount.history.slice(0, 10).map((entry, index) => {
      const date = new Date(entry.at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      return `${index + 1}. ${entry.mountain} • ${entry.mode} • ${date} • +${entry.exp} XP, ${entry.trash} sampah`
    }).join('\n')
    return m.reply(`╭─❏「 📜 RIWAYAT PENDAKIAN 」❏\n${rows}\n╰─━━━━━━━━━━━━━━─`)
  }

  if (action === 'start' || action === 'mulai') {
    const mountain = MOUNTAINS.find(item => item.name === mount.mountain)
    if (!mountain) return m.reply(`Pilih gunung dulu dengan ${usedPrefix}mt list lalu ${usedPrefix}mt pilih <nomor/nama>.`)
    if (mount.mode !== 'solo' && mount.mode !== 'team') return m.reply(`Pilih mode pendakian dulu: ${usedPrefix}mt solo atau buat/gabung tim.`)

    let participants = [senderJid]
    if (mount.mode === 'team') {
      if (!team) return m.reply(`Mode tim dipilih, tetapi kamu belum bergabung dalam tim. Buat/gabung dengan ${usedPrefix}mt team.`)
      if (team.members.length < 2) return m.reply('Tim perlu minimal 2 anggota untuk memulai pendakian bersama.')
      participants = [...new Set(team.members.map(normalizeJid))]
    }

    const now = Date.now()
    const waiting = participants
      .map(jid => {
        const account = wdb.users[jid] || (wdb.users[jid] = {})
        return { jid, account, player: getUserMount(account) }
      })
      .filter(({ account, player }) => getRemainingCooldown(account, player, now) > 0)
    if (waiting.length) {
      const list = waiting.map(({ jid, account, player }) =>
        `${getName(conn, jid)} (${formatDuration(getRemainingCooldown(account, player, now))})`
      ).join(', ')
      return m.reply(`Pendakian belum bisa dimulai. Cooldown anggota berikut belum selesai: ${list}.`)
    }

    const participantMounts = participants.map(jid => getUserMount(wdb.users[jid]))
    const forcedMountain = MOUNTAINS.find(candidate =>
      participantMounts.some(player =>
        getHighestClimbedHeight(player) >= candidate.height && !player.peaks.includes(candidate.name)
      )
    )
    const progressionNotice = forcedMountain && forcedMountain.name !== mountain.name
      ? `Gunung lebih rendah yang belum ditaklukkan mengatur urutan otomatis: *${forcedMountain.name}* (${formatHeight(forcedMountain.height)}).\n\n`
      : ''
    if (forcedMountain) mountain = forcedMountain

    const trash = MOUNT_TRASH[Math.floor(Math.random() * MOUNT_TRASH.length)]
    const exp = 80 + Math.floor(mountain.height / 100)
    const story = MOUNT_STORIES[Math.floor(Math.random() * MOUNT_STORIES.length)].replace('{trash}', `${trash.emoji} ${trash.name}`)
    const modeName = mount.mode === 'solo' ? 'Solo' : `Tim ${team.name}`
    const results = []

    for (const jid of participants) {
      const player = getUserMount(wdb.users[jid] || (wdb.users[jid] = {}))
      const rpg = getUserRPG(wdb, jid).rpg
      rpg.inventory = rpg.inventory || {}
      const trashAmount = 1 + Math.floor(Math.random() * 2)
      rpg.inventory[trash.id] = (Number(rpg.inventory[trash.id]) || 0) + trashAmount
      addRpgExp(rpg, exp)
      player.summits += 1
      player.exp += exp
      player.trash += trashAmount
      player.lastMount = now
      player.lastCooldown = getCooldown(wdb.users[jid])
      if (!player.peaks.includes(mountain.name)) player.peaks.push(mountain.name)
      player.history.unshift({ mountain: mountain.name, mode: modeName, at: now, exp, trash: trashAmount })
      player.history = player.history.slice(0, 10)
      results.push(`${getName(conn, jid)}: +${exp} XP, ${trash.emoji} ${trash.name} x${trashAmount}`)
      stats.trash += trashAmount
    }

    stats.participants += participants.length
    await saveDB(wdb)
    return m.reply(
      `╭─❏「 🏔️ PENDAKIAN SELESAI 」❏\n` +
      `Gunung: *${mountain.name}* (${formatHeight(mountain.height)})\n` +
      `Mode: ${modeName}\n\n` +
      `${progressionNotice}` +
      `${story}\n\n` +
      `🎒 *Hasil setiap pendaki:*\n${results.join('\n')}\n\n` +
      `Sampah sudah dimasukkan ke tas masing-masing. Terima kasih sudah menjaga gunung tetap bersih!\n` +
      `Cooldown reguler 5 jam (Premium 2 jam). Gunakan ${usedPrefix}mt profile untuk melihat progres.\n` +
      `╰─━━━━━━━━━━━━━━─`
    )
  }

  return m.reply(`Perintah tidak dikenal. Ketik ${usedPrefix}mt command untuk melihat daftar perintah.`)
}

handler.help = ['mount', 'muncak', 'mt']
handler.tags = ['rpg']
handler.command = /^(mount|muncak|mt)$/i
export default handler
