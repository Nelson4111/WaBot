let handler = async (m, { conn, usedPrefix }) => {
  let menu = `*╭───「 👑 RPG PANEL OWNER 」───╮*\n`
  menu += `│ *Fitur Admin RPG ZETA*\n`
  menu += `╰────────────────────╯\n\n`
  
  menu += `*───「 📦 GUDANG 」───*\n`
  menu += `├ ${usedPrefix}rpgpanel add @tag <item> <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel del @tag <item> <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel wipe @tag\n`
  menu += `└ ${usedPrefix}rpgpanel cek @tag\n\n`

  menu += `*───「 👤 USER STAT 」───*\n`
  menu += `├ ${usedPrefix}rpgpanel setmoney/addmoney @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel setlevel/addlevel @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel setexp/addexp @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel setdarah/adddarah @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel setmaxhp @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel setdiamond/adddiamond @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel setgold/addgold @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel setiron/addiron @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel setwood/addwood @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel setstone/addstone @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel sword/armor/pick/fishing @tag <lvl>\n`
  menu += `└ ${usedPrefix}rpgpanel inv @tag\n\n`

  menu += `*───「 💼 KERJA & HEAL 」───*\n`
  menu += `├ ${usedPrefix}rpgpanel kerjagaji @tag\n`
  menu += `├ ${usedPrefix}rpgpanel kerjalevel @tag <lvl>\n`
  menu += `├ ${usedPrefix}rpgpanel kerjareset @tag\n`
  menu += `└ ${usedPrefix}rpgpanel heal @tag\n\n`

  menu += `*───「 🏠 DAPUR & UPGRADE 」───*\n`
  menu += `├ ${usedPrefix}rpgpanel dapurup @tag\n`
  menu += `├ ${usedPrefix}rpgpanel dapurset @tag <slot>\n`
  menu += `├ ${usedPrefix}rpgpanel up @tag <item>\n`
  menu += `└ ${usedPrefix}rpgpanel uplvl @tag <item> <lvl>\n\n`

  menu += `*───「 🐾 PET & 🏡 TERNAK 」───*\n`
  menu += `├ ${usedPrefix}rpgpanel petadd/petdel/petlvl @tag <pet> <lvl>\n`
  menu += `├ ${usedPrefix}rpgpanel ternakadd/del/wipe/cek @tag <hewan> <jml>\n`
  menu += `└ ${usedPrefix}rpgpanel hybradd <baru> <h1> <h2>\n\n`

  menu += `*───「 🏰 GUILD 」───*\n`
  menu += `├ ${usedPrefix}rpgpanel guildadd/guildkick @tag <nama>\n`
  menu += `├ ${usedPrefix}rpgpanel guilddel/guildlvl/guildexp <nama> <lvl/exp>\n`
  menu += `├ ${usedPrefix}rpgpanel setcontrib @tag <guild> <jml>\n`
  menu += `└ ${usedPrefix}rpgpanel guildbuff <guild> <buff> <1h/24h>\n\n`

  menu += `*───「 🏦 BANK & 🚨 WANTED 」───*\n`
  menu += `├ ${usedPrefix}rpgpanel bank/bankadd @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel banktier/bankunfreeze @tag <tier>\n`
  menu += `├ ${usedPrefix}rpgpanel wantedadd/del @tag <jenis> <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel wantedreset/wipe/cek @tag\n`
  menu += `└ ${usedPrefix}rpgpanel backup\n`

  menu += `*───「 📊 PANEL B: STATS & RESET 」───*\n`
  menu += `├ ${usedPrefix}rpgpanelB toprpg\n`
  menu += `├ ${usedPrefix}rpgpanelB rpgstat\n`
  menu += `├ ${usedPrefix}rpgpanelB topyt\n`
  menu += `├ ${usedPrefix}rpgpanelB setlevel @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanelB setmoney @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanelB setdiamond @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanelB resetlevel @tag\n`
  menu += `├ ${usedPrefix}rpgpanelB resetmoney @tag\n`
  menu += `├ ${usedPrefix}rpgpanelB resetdiamond @tag\n`
  menu += `└ ${usedPrefix}rpgpanelB daily @tag\n\n`

  menu += `_Note: Owner Only_\n`
  menu += `_set = langsung ganti | add = ditambah_` 

  return m.reply(menu)
}
handler.help = ['rpgpanelmenu']
handler.tags = ['owner']
handler.command = /^(rpgpanelmenu)$/i
handler.owner = true
export default handler