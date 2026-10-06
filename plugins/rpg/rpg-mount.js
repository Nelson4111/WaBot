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
  `│ 📌 *DAFTAR COMMAND*\n` +
  `╰─━━━━━━━━━━━━━━─\n\n` +
  `⛰️ *MOUNTAIN*\n` +
  `> ↳ ${usedPrefix}mt list — Daftar gunung\n` +
  `> ↳ ${usedPrefix}mt detail <nomor/nama> — Detail gunung\n` +
  `> ↳ ${usedPrefix}mt pilih <nomor/nama> — Pilih gunung\n` +
  `> ↳ ${usedPrefix}mt guide — Panduan pendakian\n` +
  `> ↳ ${usedPrefix}mt command — Daftar command\n` +
  `> ↳ ${usedPrefix}mt info — Statistik pendakian\n` +
  `> ↳ ${usedPrefix}mt request <nama gunung> — Ajukan gunung\n` +
  `> ↳ ${usedPrefix}mt request — Lihat daftar request\n\n` +
  `👥 *MODE PENDAKIAN*\n` +
  `> ↳ ${usedPrefix}mt solo — Pilih mode solo\n` +
  `> ↳ ${usedPrefix}mt team create <nama> — Buat tim\n` +
  `> ↳ ${usedPrefix}mt team join <nama> — Gabung tim\n` +
  `> ↳ ${usedPrefix}mt team leave — Keluar dari tim\n` +
  `> ↳ ${usedPrefix}mt team info — Info tim\n` +
  `> ↳ ${usedPrefix}mt start — Mulai pendakian\n\n` +
  `📊 *STATUS & PROFIL*\n` +
  `> ↳ ${usedPrefix}mt status — Status pilihan\n` +
  `> ↳ ${usedPrefix}mt cd — Status cooldown\n` +
  `> ↳ ${usedPrefix}mt profile — Profil pendakian\n` +
  `> ↳ ${usedPrefix}mt history — Riwayat pendakian\n` +
  `> ↳ ${usedPrefix}mt top — Peringkat pendaki\n\n` +
  `🛠️ *OWNER / CO-OWNER*\n` +
  `> ↳ ${usedPrefix}mt done <nama/nomor> — Hapus request (owner/co-owner)\n\n` +
  `─━━━━━━━━━━━━━━─`
)

if (!action || action === 'command' || action === 'commands') return showCommands()

if (action === 'detail' || action === 'info' && args.length > 1) {
  const selector = args.slice(1).join(' ').trim()
  if (!selector) return m.reply(
    `╭─❏「 📌 DETAIL GUNUNG 」❏\n` +
    `│ 📌 *FORMAT COMMAND*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ${usedPrefix}mt detail <nomor/nama>\n` +
    `> ↳ Contoh : ${usedPrefix}mt detail 1\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  const mountain = findMountain(selector)
  if (!mountain) return m.reply(
    `╭─❏「 ❌ DETAIL GUNUNG 」❏\n` +
    `│ ❌ *GUNUNG TIDAK DITEMUKAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ Cek ${usedPrefix}mt list, lalu gunakan nomor atau nama gunung.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )

  const mountainNumber = MOUNTAINS.indexOf(mountain) + 1
  const climbed = mount.peaks.includes(mountain.name)
  const exp = 80 + Math.floor(mountain.height / 100)

  return m.reply(
    `╭─❏「 ⛰️ DETAIL GUNUNG 」❏\n` +
    `│ ⛰️ *${mountain.name}*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ 🔢 Nomor daftar : ${mountainNumber}\n` +
    `> ↳ 📏 Elevasi : ${formatHeight(mountain.height)}\n` +
    `> ↳ 🗺️ Jenis : ${mountain.type}\n` +
    `> ↳ 🧗 Tingkat kesulitan : ${mountain.difficulty}\n` +
    `> ↳ ✨ XP pendakian : +${exp}\n` +
    `> ↳ 🏆 Status kamu : ${climbed ? 'Sudah pernah didaki' : 'Belum pernah didaki'}\n\n` +
    `📌 *PILIH GUNUNG*\n` +
    `> ↳ ${usedPrefix}mt pilih ${mountainNumber}\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'info') {
  const completedMounts = new Set(Object.values(wdb.users)
    .flatMap(player => player?.mount?.peaks || []))
  const cleaned = Math.max(stats.trash, Object.values(wdb.users)
    .reduce((sum, player) => sum + (Number(player?.mount?.trash) || 0), 0))

  return m.reply(
    `╭─❏「 📊 INFO PENDAKIAN 」❏\n` +
    `│ 📊 *STATISTIK PENDAKIAN*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `> ↳ ⛰️ Gunung tersedia : ${MOUNTAINS.length}\n` +
    `> ↳ 🗑️ Sampah terkumpul : ${cleaned.toLocaleString('id-ID')} item\n` +
    `> ↳ 🥾 Pendakian individu : ${stats.participants.toLocaleString('id-ID')} kali\n` +
    `> ↳ ⛰️ Gunung yang sudah pernah didaki : ${completedMounts.size}\n\n` +
    `📌 *REQUEST GUNUNG*\n` +
    `> ↳ Usulkan gunung dengan ${usedPrefix}mt request <nama gunung>.\n` +
    `> ↳ Daftar usulan : ${usedPrefix}mt request\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

if (action === 'request' || action === 'req') {
  const mountainName = args.slice(1).join(' ').trim()

  if (mountainName) {
    if (mountainName.length > 80) return m.reply(
      `╭─❏「 ❌ REQUEST GUNUNG 」❏\n` +
      `│ ❌ *NAMA GUNUNG TERLALU PANJANG*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Nama gunung maksimal 80 karakter.\n\n` +
      `─━━━━━━━━━━━━━━─`
    )

    const existing = data.mountRequests.find(request => normalize(request.name) === normalize(mountainName))

    if (existing) return m.reply(
      `╭─❏「 ⚠️ REQUEST GUNUNG 」❏\n` +
      `│ ⚠️ *REQUEST SUDAH ADA*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ Gunung *${existing.name}* sudah ada di daftar request (#${data.mountRequests.indexOf(existing) + 1}).\n\n` +
      `─━━━━━━━━━━━━━━─`
    )

    data.mountRequests.push({ name: mountainName, jid: senderJid, createdAt: Date.now() })
    await saveDB(wdb)

    return m.reply(
      `╭─❏「 ✅ REQUEST GUNUNG 」❏\n` +
      `│ ✅ *USULAN BERHASIL DICATAT*\n` +
      `╰─━━━━━━━━━━━━━━─\n\n` +
      `> ↳ ⛰️ Gunung : *${mountainName}*\n` +
      `> ↳ 📝 Lihat daftar : ${usedPrefix}mt request\n\n` +
      `─━━━━━━━━━━━━━━─`
    )
  }

  const requests = data.mountRequests
  const list = requests.length
    ? requests.map((request, index) =>
        `${index + 1}. ${request.name} — diusulkan ${getName(conn, request.jid)}`
      ).join('\n')
    : 'Belum ada usulan gunung.'

  return m.reply(
    `╭─❏「 📝 REQUEST GUNUNG 」❏\n` +
    `│ 📝 *DAFTAR REQUEST GUNUNG*\n` +
    `╰─━━━━━━━━━━━━━━─\n\n` +
    `📌 *CARA MENGUSULKAN*\n` +
    `> ↳ Kirim usulan gunung nyata atau fiksi dengan ${usedPrefix}mt request <nama gunung>.\n` +
    `> ↳ Usulan akan ditinjau sebelum dimasukkan ke daftar pendakian.\n\n` +
    `⛰️ *DAFTAR REQUEST (${requests.length})*\n` +
    `> ${list}\n\n` +
    `🛠️ *PENGELOLAAN REQUEST*\n` +
    `> ↳ Owner dapat menghapus usulan dengan ${usedPrefix}mt done <nama gunung/nomor>.\n\n` +
    `─━━━━━━━━━━━━━━─`
  )
}

  if (action === 'done') {
    if (!isOwner) return m.reply(
        `╭─❏「 ❌ MOUNT REQUEST 」❏\n` +
        `│ ❌ *PERINTAH KHUSUS OWNER*\n` +
        `╰─━━━━━━━━━━━━━━─`
    )

    const selector = args.slice(1).join(' ').trim()
    if (!selector) return m.reply(
        `╭─❏「 📌 FORMAT SALAH 」❏\n` +
        `│ 📌 *FORMAT COMMAND*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${usedPrefix}mt done <nama gunung/nomor>\n` +
        `> ↳ Lihat daftar : ${usedPrefix}mt request\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    const number = Number(selector)
    const index = Number.isInteger(number) && number >= 1
      ? number - 1
      : data.mountRequests.findIndex(request => normalize(request.name) === normalize(selector))

    if (index < 0 || index >= data.mountRequests.length) return m.reply(
        `╭─❏「 ❌ REQUEST GUNUNG 」❏\n` +
        `│ ❌ *REQUEST TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Cek daftar dengan ${usedPrefix}mt request.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    const [removed] = data.mountRequests.splice(index, 1)
    await saveDB(wdb)

    return m.reply(
        `╭─❏「 ✅ REQUEST GUNUNG 」❏\n` +
        `│ ✅ *REQUEST DIHAPUS*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ⛰️ Gunung : *${removed.name}*\n` +
        `> ↳ Request berhasil dihapus dari daftar.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'list' || action === 'gunung') {
    const list = MOUNTAINS.map((mountain, index) =>
        `> ${String(index + 1).padStart(2, '0')}. ${mountain.name}`
    ).join('\n')

    return m.reply(
        `╭─❏「 ⛰️ AVELIA MOUNTAINS 」❏\n` +
        `│ 📋 *DAFTAR GUNUNG*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 *COMMAND LIST*\n` +
        `> ↳ ${usedPrefix}mt detail <nomor/nama>\n` +
        `> ↳ ${usedPrefix}mt pilih <nomor/nama>\n` +
        `─━━━━━━━━━━━━━━─\n` +
        `${list}\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'pilih' || action === 'select' || action === 'mountain') {
    const mountain = findMountain(args.slice(1).join(' '))

    if (!mountain) return m.reply(
        `╭─❏「 ❌ PILIH GUNUNG 」❏\n` +
        `│ ❌ *GUNUNG TIDAK DITEMUKAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Cek ${usedPrefix}mt list, lalu pilih nomor atau nama gunung.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    mount.mountain = mountain.name
    await saveDB(wdb)

    return m.reply(
        `╭─❏「 ⛰️ GUNUNG PILIHAN 」❏\n` +
        `│ ⛰️ *${mountain.name}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ 📏 Elevasi : ${formatHeight(mountain.height)}\n` +
        `> ↳ 🧗 Mode : ${mount.mode === 'solo' ? 'Solo' : mount.mode === 'team' && team ? `Tim ${team.name}` : 'Belum dipilih'}\n\n` +
        `📌 *LANGKAH BERIKUTNYA*\n` +
        `> ↳ Gunakan ${usedPrefix}mt solo atau bergabung/buat tim.\n` +
        `> ↳ Lalu ${usedPrefix}mt start.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'guide' || action === 'panduan') {
    return m.reply(
        `╭─❏「 📖 PANDUAN PENDAKIAN 」❏\n` +
        `│ 📖 *PANDUAN PENDAKIAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `📌 *TAHAP PENDAKIAN*\n` +
        `> ↳ 1. Cek daftar ${usedPrefix}mt list dan detail ${usedPrefix}mt detail <nomor/nama>, lalu pilih dengan ${usedPrefix}mt pilih <nomor/nama>.\n` +
        `> ↳ 2. Tentukan mode: ${usedPrefix}mt solo, atau buat/gabung tim lewat ${usedPrefix}mt team.\n` +
        `> ↳ 3. Mulai dengan ${usedPrefix}mt start. Pendakian berlangsung instan dan menghasilkan XP serta sampah temuan yang masuk ke tas RPG.\n` +
        `> ↳ 4. Cooldown 5 jam (Premium 2 jam) per pendaki. Cek ${usedPrefix}mt cd, profil ${usedPrefix}mt profile, dan riwayat ${usedPrefix}mt history.\n` +
        `> ↳ 5. Tim maksimal ${MOUNT_TEAM_LIMIT} orang; setiap anggota tim harus siap (cooldown selesai) saat pendakian dimulai.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'solo') {
    mount.mode = 'solo'
    await saveDB(wdb)

    return m.reply(
        `╭─❏「 🧗 MODE PENDAKIAN 」❏\n` +
        `│ 🧗 *MODE SOLO DIPILIH*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pilih gunung dengan ${usedPrefix}mt pilih <nomor/nama>.\n` +
        `> ↳ Lalu gunakan ${usedPrefix}mt start.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'team') {
    const teamAction = normalize(args[1])
    const teamName = args.slice(2).join(' ').trim()

    if (teamAction === 'create') {
        if (team) return m.reply(
            `╭─❏「 🧗 TIM PENDAKIAN 」❏\n` +
            `│ ⚠️ *SUDAH BERGABUNG DENGAN TIM*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Kamu sudah bergabung dengan tim *${team.name}*.\n` +
            `> ↳ Keluar dulu dengan ${usedPrefix}mt team leave.\n\n` +
            `─━━━━━━━━━━━━━━─`
        )

        if (!teamName) return m.reply(
            `╭─❏「 📌 FORMAT SALAH 」❏\n` +
            `│ 📌 *FORMAT CREATE TIM*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ ${usedPrefix}mt team create <nama>\n\n` +
            `─━━━━━━━━━━━━━━─`
        )

        if (teamName.length > 32) return m.reply(
            `╭─❏「 ❌ TIM PENDAKIAN 」❏\n` +
            `│ ❌ *NAMA TIM TERLALU PANJANG*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Nama tim maksimal 32 karakter.\n\n` +
            `─━━━━━━━━━━━━━━─`
        )

        if (Object.values(teams).some(item => normalize(item.name) === normalize(teamName))) {
            return m.reply(
                `╭─❏「 ❌ TIM PENDAKIAN 」❏\n` +
                `│ ❌ *NAMA TIM SUDAH DIGUNAKAN*\n` +
                `╰─━━━━━━━━━━━━━━─\n\n` +
                `> ↳ Pilih nama lain.\n\n` +
                `─━━━━━━━━━━━━━━─`
            )
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        teams[id] = { id, name: teamName, leader: senderJid, members: [senderJid], createdAt: Date.now() }
        mount.mode = 'team'
        await saveDB(wdb)

        return m.reply(
            `╭─❏「 ✅ TIM PENDAKIAN 」❏\n` +
            `│ 🧗 *${teamName}*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Tim pendakian berhasil dibuat.\n` +
            `> ↳ Ajak teman bergabung dengan ${usedPrefix}mt team join ${teamName}.\n\n` +
            `─━━━━━━━━━━━━━━─`
        )
    }

    if (teamAction === 'join') {
        if (team) return m.reply(
            `╭─❏「 🧗 TIM PENDAKIAN 」❏\n` +
            `│ ⚠️ *SUDAH BERGABUNG DENGAN TIM*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Kamu sudah bergabung dengan tim *${team.name}*.\n\n` +
            `─━━━━━━━━━━━━━━─`
        )

        if (!teamName) return m.reply(
            `╭─❏「 📌 FORMAT SALAH 」❏\n` +
            `│ 📌 *FORMAT JOIN TIM*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ ${usedPrefix}mt team join <nama>\n\n` +
            `─━━━━━━━━━━━━━━─`
        )

        const target = Object.values(teams).find(item => normalize(item.name) === normalize(teamName))

        if (!target) return m.reply(
            `╭─❏「 ❌ TIM PENDAKIAN 」❏\n` +
            `│ ❌ *TIM TIDAK DITEMUKAN*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Periksa nama tim melalui anggota tim tersebut.\n\n` +
            `─━━━━━━━━━━━━━━─`
        )

        if (target.members.length >= MOUNT_TEAM_LIMIT) return m.reply(
            `╭─❏「 ❌ TIM PENDAKIAN 」❏\n` +
            `│ ❌ *TIM SUDAH PENUH*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Maksimal ${MOUNT_TEAM_LIMIT} anggota.\n\n` +
            `─━━━━━━━━━━━━━━─`
        )

        target.members.push(senderJid)
        mount.mode = 'team'
        await saveDB(wdb)

        return m.reply(
            `╭─❏「 ✅ TIM PENDAKIAN 」❏\n` +
            `│ 🧗 *BERHASIL BERGABUNG*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Tim : *${target.name}*\n` +
            `> ↳ Anggota : ${target.members.length}/${MOUNT_TEAM_LIMIT}\n\n` +
            `─━━━━━━━━━━━━━━─`
        )
    }

    if (teamAction === 'leave') {
        if (!team) return m.reply(
            `╭─❏「 🧗 TIM PENDAKIAN 」❏\n` +
            `│ ❌ *BELUM BERGABUNG DENGAN TIM*\n` +
            `╰─━━━━━━━━━━━━━━─`
        )

        team.members = team.members.filter(jid => normalizeJid(jid) !== senderJid)
        mount.mode = null
        if (normalizeJid(team.leader) === senderJid && team.members.length) team.leader = team.members[0]
        if (!team.members.length) delete teams[team.id]
        await saveDB(wdb)

        return m.reply(
            `╭─❏「 🚪 TIM PENDAKIAN 」❏\n` +
            `│ 🚪 *KELUAR DARI TIM*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Kamu telah keluar dari tim *${team.name}*.\n` +
            `> ↳ Pilih mode lagi sebelum memulai pendakian.\n\n` +
            `─━━━━━━━━━━━━━━─`
        )
    }

    if (teamAction === 'info') {
        if (!team) return m.reply(
            `╭─❏「 🧗 TIM PENDAKIAN 」❏\n` +
            `│ ❌ *BELUM BERGABUNG DENGAN TIM*\n` +
            `╰─━━━━━━━━━━━━━━─`
        )

        const members = team.members.map((jid, index) =>
            `${index + 1}. ${getName(conn, jid)}${normalizeJid(jid) === normalizeJid(team.leader) ? ' 👑' : ''}`
        ).join('\n')

        return m.reply(
            `╭─❏「 🧗 TIM ${team.name} 」❏\n` +
            `│ 👥 *Anggota : ${team.members.length}/${MOUNT_TEAM_LIMIT}*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `${members}\n\n` +
            `─━━━━━━━━━━━━━━─`
        )
    }

    return m.reply(
        `╭─❏「 📌 COMMAND TIM 」❏\n` +
        `│ 📌 *DAFTAR COMMAND TIM*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ ${usedPrefix}mt team create <nama>\n` +
        `> ↳ ${usedPrefix}mt team join <nama>\n` +
        `> ↳ ${usedPrefix}mt team leave\n` +
        `> ↳ ${usedPrefix}mt team info\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

 if (action === 'cd' || action === 'cooldown') {
    const cooldown = getCooldown(user)
    const remaining = getRemainingCooldown(user, mount)

    return m.reply(
        remaining > 0
            ? `╭─❏「 ⏳ COOLDOWN PENDAKIAN 」❏\n` +
              `│ ⏳ *COOLDOWN TERSISA*\n` +
              `╰─━━━━━━━━━━━━━━─\n\n` +
              `> ↳ Sisa : *${formatDuration(remaining)}*\n` +
              `> ↳ ${(Number(mount.lastCooldown) || cooldown) === MOUNT_PREMIUM_COOLDOWN ? 'Premium: 2 jam' : 'Reguler: 5 jam'}\n\n` +
              `─━━━━━━━━━━━━━━─`
            : `╭─❏「 ✅ COOLDOWN PENDAKIAN 」❏\n` +
              `│ ✅ *SIAP MENDAKI LAGI*\n` +
              `╰─━━━━━━━━━━━━━━─\n\n` +
              `> ↳ Cooldown sudah selesai.\n\n` +
              `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'status') {
    const selected = MOUNTAINS.find(item => item.name === mount.mountain)
    const mode = mount.mode === 'solo' ? 'Solo' : mount.mode === 'team' && team ? `Tim: ${team.name}` : 'Belum dipilih'
    const remaining = getRemainingCooldown(user, mount)

    return m.reply(
        `╭─❏「 ⛰️ STATUS PENDAKIAN 」❏\n` +
        `│ ⛰️ *STATUS PENDAKIAN*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Gunung : ${selected ? `${selected.name} (${formatHeight(selected.height)})` : 'Belum dipilih'}\n` +
        `> ↳ Mode : ${mode}\n` +
        `> ↳ Cooldown : ${remaining > 0 ? formatDuration(remaining) : 'Siap'}\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'profile' || action === 'profil') {
    const highest = mount.peaks
        .map(name => MOUNTAINS.find(item => item.name === name))
        .filter(Boolean)
        .sort((a, b) => b.height - a.height)[0]
    const remaining = getRemainingCooldown(user, mount)

    return m.reply(
        `╭─❏「 🧗 PROFIL PENDAKI 」❏\n` +
        `│ 🧗 *${getName(conn, m.sender)}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ 🏆 Title : ${getMountTitle(mount.summits)}\n` +
        `> ↳ ⛰️ Total puncak : ${mount.summits}\n` +
        `> ↳ 🗻 Gunung berbeda : ${mount.peaks.length}/${MOUNTAINS.length}\n` +
        `> ↳ ✨ XP pendakian : ${mount.exp.toLocaleString('id-ID')}\n` +
        `> ↳ 🗑️ Sampah dikumpulkan : ${mount.trash.toLocaleString('id-ID')} item\n` +
        `> ↳ 🏔️ Puncak tertinggi : ${highest ? `${highest.name} (${formatHeight(highest.height)})` : '-'}\n` +
        `> ↳ ⏳ Cooldown : ${remaining > 0 ? formatDuration(remaining) : 'Siap'}\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'top' || action === 'leaderboard') {
    const entries = Object.entries(wdb.users)
        .map(([jid, player]) => ({ jid, name: getName(conn, jid), ...getUserMount(player) }))
        .filter(player => player.summits > 0)
        .sort((a, b) => b.summits - a.summits || b.exp - a.exp)
        .slice(0, 10)

    if (!entries.length) return m.reply(
        `╭─❏「 🏆 TOP PENDAKI 」❏\n` +
        `│ ❌ *BELUM ADA PENDAKI*\n` +
        `╰─━━━━━━━━━━━━━━─`
    )

    const rows = entries.map((player, index) =>
        `🏆 *${index + 1}. ${player.name}*\n` +
        `> ↳ Title : ${getMountTitle(player.summits)}\n` +
        `> ↳ Puncak : ${player.summits}\n` +
        `> ↳ XP : ${player.exp.toLocaleString('id-ID')}`
    ).join('\n\n')

    return m.reply(
        `╭─❏「 🏆 TOP PENDAKI 」❏\n` +
        `│ 🏆 *PERINGKAT PENDAKI*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${rows}\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'history' || action === 'riwayat') {
    if (!mount.history.length) return m.reply(
        `╭─❏「 📜 RIWAYAT PENDAKIAN 」❏\n` +
        `│ 📜 *BELUM ADA RIWAYAT*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pilih gunung dan mulai dengan ${usedPrefix}mt start.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    const rows = mount.history.slice(0, 10).map((entry, index) => {
        const date = new Date(entry.at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
        return `⛰️ *${index + 1}. ${entry.mountain}*\n` +
          `> ↳ Mode : ${entry.mode}\n` +
          `> ↳ Waktu : ${date}\n` +
          `> ↳ Hasil : +${entry.exp} XP, ${entry.trash} sampah`
    }).join('\n\n')

    return m.reply(
        `╭─❏「 📜 RIWAYAT PENDAKIAN 」❏\n` +
        `│ 📜 *RIWAYAT TERAKHIR*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `${rows}\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

if (action === 'start' || action === 'mulai') {
    const mountain = MOUNTAINS.find(item => item.name === mount.mountain)

    if (!mountain) return m.reply(
        `╭─❏「 ⛰️ PENDAKIAN 」❏\n` +
        `│ ❌ *GUNUNG BELUM DIPILIH*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pilih gunung dulu dengan ${usedPrefix}mt list lalu ${usedPrefix}mt pilih <nomor/nama>.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    if (mount.mode !== 'solo' && mount.mode !== 'team') return m.reply(
        `╭─❏「 🧗 PENDAKIAN 」❏\n` +
        `│ ❌ *MODE BELUM DIPILIH*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ Pilih mode pendakian dulu: ${usedPrefix}mt solo atau buat/gabung tim.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )

    let participants = [senderJid]

    if (mount.mode === 'team') {
        if (!team) return m.reply(
            `╭─❏「 🧗 PENDAKIAN TIM 」❏\n` +
            `│ ❌ *BELUM BERGABUNG DENGAN TIM*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Buat/gabung dengan ${usedPrefix}mt team.\n\n` +
            `─━━━━━━━━━━━━━━─`
        )

        if (team.members.length < 2) return m.reply(
            `╭─❏「 🧗 PENDAKIAN TIM 」❏\n` +
            `│ ❌ *ANGGOTA TIM KURANG*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ Tim perlu minimal 2 anggota untuk memulai pendakian bersama.\n\n` +
            `─━━━━━━━━━━━━━━─`
        )

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

        return m.reply(
            `╭─❏「 ⏳ PENDAKIAN TERTUNDA 」❏\n` +
            `│ ⏳ *COOLDOWN ANGGOTA BELUM SELESAI*\n` +
            `╰─━━━━━━━━━━━━━━─\n\n` +
            `> ↳ ${list}\n\n` +
            `─━━━━━━━━━━━━━━─`
        )
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
        `│ 🏔️ *${mountain.name}*\n` +
        `╰─━━━━━━━━━━━━━━─\n\n` +
        `> ↳ 📏 Elevasi : ${formatHeight(mountain.height)}\n` +
        `> ↳ 🧗 Mode : ${modeName}\n\n` +
        `${progressionNotice}` +
        `${story}\n\n` +
        `🎒 *HASIL SETIAP PENDAKI*\n` +
        `${results.join('\n')}\n\n` +
        `📌 *INFORMASI*\n` +
        `> ↳ Sampah sudah dimasukkan ke tas masing-masing. Terima kasih sudah menjaga gunung tetap bersih!\n` +
        `> ↳ Cooldown reguler 5 jam (Premium 2 jam).\n` +
        `> ↳ Gunakan ${usedPrefix}mt profile untuk melihat progres.\n\n` +
        `─━━━━━━━━━━━━━━─`
    )
}

  return m.reply(`Perintah tidak dikenal. Ketik ${usedPrefix}mt command untuk melihat daftar perintah.`)
}

handler.help = ['mount', 'muncak', 'mt']
handler.tags = ['rpg']
handler.command = /^(mount|muncak|mt)$/i
export default handler
