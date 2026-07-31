let handler = async (m, { command, text, usedPrefix }) => {
    let input = text || (m.quoted && m.quoted.text)
    if (!input) return m.reply(` Masukkan teks yang ingin diubah!\n*Contoh:* ${usedPrefix}${command} halo kamu lagi apa`)

    let cmd = command.toLowerCase()
    let result = ''

    if (cmd === 'hilih') {
        result = input.replace(/[aaeouAAEOU]/g, 'i').replace(/[aeou]/g, 'i')
    } else if (cmd === 'halah') {
        result = input.replace(/[eeiouEEIOU]/g, 'a').replace(/[eiou]/g, 'a')
    } else if (cmd === 'huluh') {
        result = input.replace(/[aaeioAAEIO]/g, 'u').replace(/[aeio]/g, 'u')
    } else if (cmd === 'heleh') {
        result = input.replace(/[aaiouAAIOU]/g, 'e').replace(/[aiou]/g, 'e')
    } else if (cmd === 'holoh') {
        result = input.replace(/[aaeiuAAEIU]/g, 'o').replace(/[aeiu]/g, 'o')
    }

    return m.reply(result)
}

handler.help = ['hilih <teks>', 'halah <teks>', 'huluh <teks>', 'heleh <teks>', 'holoh <teks>']
handler.tags = ['fun']
handler.command = /^(hilih|halah|huluh|heleh|holoh)$/i

export default handler
