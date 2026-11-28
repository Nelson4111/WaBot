/*
   *Roblox Stalk*
type : plugins esm 
wm :
 https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K
wm scarape :
https://whatsapp.com/channel/0029Vb8JrC33GJP0ejgQFf22/137
*/

import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`📦 Contoh:\n${usedPrefix + command} elz_gokilll`)

  let json = await robloxStalk(text)
  if (!json) return m.reply('❌ Gagal mengambil data. Username mungkin tidak ditemukan.')

  let { account, presence, stats, badges } = json

  let caption = `*🕹️ Roblox User Stalk*\n\n`
  caption += `👤 *Username:* ${account.username}\n`
  caption += `📛 *Display Name:* ${account.displayName}\n`
  caption += `📅 *Akun Dibuat:* ${account.created}\n`
  caption += `📜 *Deskripsi:* ${account.description}\n`
  caption += `✅ *Verified Badge:* ${account.hasVerifiedBadge ? '✅' : '❌'}\n`
  caption += `🚫 *Banned:* ${account.isBanned ? '✅' : '❌'}\n\n`
  caption += `*📡 Presence:*\n`
  caption += `🌐 *Online:* ${presence.isOnline ? '✅' : '❌'}\n`
  caption += `🕑 *Last Online:* ${presence.lastOnline}\n`
  caption += `🎮 *Recent Game:* ${presence.recentGame}\n\n`
  caption += `*📊 Stats:*\n`
  caption += `👥 *Friends:* ${stats.friendCount}\n`
  caption += `👣 *Followers:* ${stats.followers}\n`
  caption += `📌 *Following:* ${stats.following}\n\n`

  if (badges.length) {
    caption += `🎖️ *Recent Badges:*\n`
    badges.forEach((b, i) => {
      caption += `${i + 1}. ${b.name}\n`
    })
  }

  await conn.sendFile(m.chat, account.profilePicture, 'profile.jpg', caption, m)
}

handler.help = ['robloxstalk <username>']
handler.tags = ['stalk']
handler.command = /^robloxstalk$/i
handler.limit = true

handler.desc = 'Melihat informasi profil dan statistik akun ROBLOX publik.'
handler.tutorial = [
  '.robloxstalk <username/id>',
  'Contoh: .robloxstalk target'
]

export default handler

async function robloxStalk(username) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      Accept: 'application/json',
    }

    const getUsernameData = async () => {
      const res = await axios.post('https://users.roblox.com/v1/usernames/users', { usernames: [username] }, { headers })
      return res.data?.data?.[0] || null
    }

    const getUserData = id => axios.get(`https://users.roblox.com/v1/users/${id}`, { headers }).then(res => res.data).catch(() => ({}))
    const getProfile = id => axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${id}&size=720x720&format=Png&isCircular=false`, { headers }).then(res => res.data?.data?.[0]?.imageUrl || null).catch(() => null)
    const getPresence = id => axios.post('https://presence.roblox.com/v1/presence/users', { userIds: [id] }, { headers }).then(res => {
      const p = res.data?.userPresences?.[0] || {}
      return {
        isOnline: p.userPresenceType === 2,
        lastOnline: p.lastOnline || 'Tidak tersedia',
        location: p.lastLocation || '❌ Tidak sedang bermain apa pun (offline)'
      }
    }).catch(() => ({ isOnline: false, lastOnline: 'Tidak tersedia', location: '❌ Tidak sedang bermain apa pun (offline)' }))

    const getFriendCount = id => axios.get(`https://friends.roblox.com/v1/users/${id}/friends/count`, { headers }).then(res => res.data?.count || 0).catch(() => 0)
    const getFollowers = id => axios.get(`https://friends.roblox.com/v1/users/${id}/followers/count`, { headers }).then(res => res.data?.count || 0).catch(() => 0)
    const getFollowing = id => axios.get(`https://friends.roblox.com/v1/users/${id}/followings/count`, { headers }).then(res => res.data?.count || 0).catch(() => 0)
    const getBadges = id => axios.get(`https://badges.roblox.com/v1/users/${id}/badges?limit=10&sortOrder=Desc`, { headers }).then(res => res.data?.data?.map(b => ({ name: b.name, description: b.description, iconImageId: b.iconImageId })) || []).catch(() => [])

    const userData = await getUsernameData()
    if (!userData) throw new Error('Username tidak ditemukan.')

    const id = userData.id
    const [userDetails, profilePicture, presence, friendCount, followers, following, badges] = await Promise.all([
      getUserData(id),
      getProfile(id),
      getPresence(id),
      getFriendCount(id),
      getFollowers(id),
      getFollowing(id),
      getBadges(id)
    ])

    return {
      account: {
        username: userDetails.name,
        displayName: userDetails.displayName,
        profilePicture,
        description: userDetails.description || '-',
        created: userDetails.created,
        isBanned: userDetails.isBanned || false,
        hasVerifiedBadge: userDetails.hasVerifiedBadge || false,
      },
      presence,
      stats: {
        friendCount,
        followers,
        following
      },
      badges
    }
  } catch (err) {
    console.error('[ROBLOX STALK ERROR]', err.response?.status, err.response?.data || err.message)
    return null
  }
}