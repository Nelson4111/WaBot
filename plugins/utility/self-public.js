let handler = async(m, { conn, command }) => {
  let isPublic = command === "public";
  let self = global.opts["self"]

  let coOwnerNum = (Array.isArray(global.owner?.[1]) ? global.owner[1][0] : global.owner?.[1]) || global.nomorcoown || ''
  if(self === !isPublic) return m.reply(`Dah ${!isPublic ? "Self" : "Public"} dari tadi ${m.sender.split("@")[0] === coOwnerNum ? "Mbak" : "Bang"} :v`)

  global.opts["self"] = !isPublic

  m.reply(`Berhasil ${!isPublic ? "Self" : "Public"} bot!`)
}

handler.help = ["self", "public"]
handler.tags = ["owner"]

handler.rowner = true

handler.command = /^(self|public)/i

export default handler