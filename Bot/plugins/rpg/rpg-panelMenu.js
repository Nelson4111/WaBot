let handler = async (m, { conn, usedPrefix }) => {
  let menu = `*╭───「 👑 RPG PANEL OWNER 」───╮*\n`
  menu += `│ *Fitur Admin RPG*\n`
  menu += `╰────────────────────╯\n\n`
  
  menu += `*───「 📦 GUDANG 」───*\n`
  menu += `├ ${usedPrefix}rpgpanel add @tag <item> <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel del @tag <item> <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel wipe @tag\n`
  menu += `└ ${usedPrefix}rpgpanel cek @tag\n`

  menu += `*───「 👤 USER 」───*\n`
  menu += `├ ${usedPrefix}rpgpanel money @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel level/exp @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel darah/maxhp @tag <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel sword/armor/pick/fishing @tag <lvl>\n`
  menu += `├ ${usedPrefix}rpgpanel diamond/gold @tag <jml>\n`
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
  menu += `├ ${usedPrefix}rpgpanel bank/banktier/bankunfreeze @tag <jml/tier>\n`
  menu += `├ ${usedPrefix}rpgpanel wantedadd/del @tag <jenis> <jml>\n`
  menu += `├ ${usedPrefix}rpgpanel wantedreset/wipe/cek @tag\n`
  menu += `└ ${usedPrefix}rpgpanel backup\n`

  menu += `*───「 📊 PANEL B: STATS & EDIT 」───*\n`
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

  menu += `_Note: Owner Only | .rpgpanel = edit data | .rpgpanelB = stats & reset_`

  return m.reply(menu)
}
handler.help = ['rpgpanelmenu']
handler.tags = ['owner']
handler.command = /^(rpgpanelmenu)$/i
handler.owner = true
export default handler