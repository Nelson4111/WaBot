import { status } from '../../lib/style.js'

let handler = async (m, { usedPrefix }) => {
    return status.info(m, 'Permainan Werewolf kini 100% berlangsung langsung di dalam grup!', [
        'Kamu tidak perlu lagi keluar-masuk ke PC / DM bot.',
        'Semua kartu peran, aksi malam, dan voting siang sudah menggunakan tombol interaktif langsung di dalam grup.'
    ])
}

handler.command = /^((ww|werewolf)pc)$/i
handler.private = true

handler.desc = 'Memulai permainan kuis interaktif wwpc di dalam grup WhatsApp.'
handler.tutorial = [
  '.ww',
  'Ketik jawaban langsung di obrolan setelah soal dikirimkan oleh bot'
]

export default handler