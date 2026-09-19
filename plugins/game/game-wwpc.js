import {
    emoji_role,
    sesi,
    playerOnGame,
    playerOnRoom,
    playerExit,
    dataPlayer,
    dataPlayerById,
    getPlayerById,
    getPlayerById2,
    killWerewolf,
    killww,
    hunterShoot,
    witchAction,
    dreamySeer,
    sorcerer,
    protectGuardian,
    roleShuffle,
    roleChanger,
    roleAmount,
    roleGenerator,
    addTimer,
    startGame,
    playerHidup,
    playerMati,
    vote,
    voteResult,
    clearAllVote,
    getWinner,
    win,
    pagi,
    malam,
    skill,
    voteStart,
    voteDone,
    voting,
    run,
    run_vote,
    run_malam,
    run_pagi
} from '../../lib/werewolf.js'

let handler = async (m, { conn, command, usedPrefix, args }) => {
    let { sender, chat } = m
    conn.werewolf = conn.werewolf ? conn.werewolf : {}
    let ww = conn.werewolf
    let value = (args[0] || '').toLowerCase()
    let target = args[1]

    if (playerOnGame(sender, ww) === false)
        return m.reply("Kamu tidak dalam sesi game")
    const playerData = dataPlayer(sender, ww)
    const isHunterShot = value === "hunter" && playerData.role === "hunter" && playerData.canShoot === true
    const isWitchAction = ["poison", "revive"].includes(value) && playerData.role === "sorcerer"
    if (playerData.status === true && !isHunterShot && !isWitchAction)
        return m.reply("Skill telah digunakan, skill hanya bisa digunakan sekali setiap malam")
    if (playerData.isdead === true && !isHunterShot)
        return m.reply("Kamu sudah mati")
    if (!target || target.length < 1 || target.split('').length > 2) 
        return m.reply(`Masukan nomor player \nContoh : \n${usedPrefix + command} kill 1`)
    if (isNaN(target)) 
        return m.reply("Gunakan hanya nomor")
    let byId = getPlayerById2(sender, parseInt(target), ww)
    if (!byId) return m.reply("Player tidak terdaftar")
    if (byId.db.isDummy)
        return m.reply("Target dummy tidak valid untuk aksi interaksi. Gunakan pemain asli saja.")
    const isWitchRevive = value === "revive" && playerData.role === "sorcerer"
    if (byId.db.isdead === true && !isWitchRevive)
        return m.reply("Player sudah mati")
    if (byId.db.id === sender)
        return m.reply("Tidak bisa menggunakan skill untuk diri sendiri")
    if (value === "kill") {
        if (dataPlayer(sender, ww).role !== "werewolf")
            return m.reply("Peran ini bukan untuk kamu")

        if (byId.db.role === "sorcerer") 
            return m.reply("Tidak bisa menggunakan skill untuk teman")

            return m.reply("Berhasil membunuh player " + parseInt(target)).then(() => {
                dataPlayer(sender, ww).status = true
                killWerewolf(sender, parseInt(target), ww)
            })
    } else if (value === "dreamy") {
        if (dataPlayer(sender, ww).role !== "seer") 
            return m.reply("Peran ini bukan untuk kamu")

        let dreamy = dreamySeer(sender, parseInt(target), ww)
        return m.reply(`Berhasil membuka identitas player ${target} adalah ${dreamy}`).then(() => {
                dataPlayer(sender, ww).status = true
        })
    } else if (value === "deff") {
        if (dataPlayer(sender, ww).role !== "guardian") 
            return m.reply("Peran ini bukan untuk kamu")

        return m.reply(`Berhasil melindungi player ${target}`).then(() => {
            protectGuardian(sender, parseInt(target), ww)
            dataPlayer(sender, ww).status = true
        })
    } else if (value === "sorcerer") {
        if (dataPlayer(sender, ww).role !== "sorcerer") 
            return m.reply("Peran ini bukan untuk kamu")
        return m.reply(`Gunakan *.wwpc poison nomor* untuk meracuni atau *.wwpc revive nomor* untuk menghidupkan pemain.`)
    } else if (value === "poison" || value === "revive") {
        if (playerData.role !== "sorcerer")
            return m.reply("Peran ini bukan untuk kamu")
        if (!witchAction(sender, parseInt(target), value, ww))
            return m.reply("Target tidak valid untuk aksi Penyihir")
        return m.reply(`Berhasil menggunakan ${value === "poison" ? "racun" : "ramuan hidup"} pada player ${target}`).then(() => {
            dataPlayer(sender, ww).status = true
        })
    } else if (value === "hunter") {
        if (!isHunterShot) return m.reply("Kamu tidak bisa menggunakan tembakan Hunter sekarang")
        if (!hunterShoot(sender, parseInt(target), ww)) return m.reply("Target tembakan tidak valid")
        return m.reply(`🏹 Tembakan Hunter mengenai player ${target}`)
    }
}

handler.command = /^((ww|werewolf)pc)$/i
handler.private = true

export default handler