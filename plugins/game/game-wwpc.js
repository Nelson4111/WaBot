import { status } from '../../lib/style.js'

let handler = async (m, { usedPrefix }) => {
    return status.info(m, 'Permainan Werewolf kini 100% berlangsung langsung di dalam grup!', [
        'Kamu tidak perlu lagi keluar-masuk ke PC / DM bot.',
        'Semua kartu peran, aksi malam, dan voting siang sudah menggunakan tombol interaktif langsung di dalam grup.'
    ])
}

handler.command = /^((ww|werewolf)pc)$/i
handler.private = true

export default handler