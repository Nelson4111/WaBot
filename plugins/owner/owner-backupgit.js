import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

function getTimestamp() {
  const d = new Date()
  const dateStr = d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
  const timeStr = d.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false })
  return `${dateStr} ${timeStr} WIB`
}

export async function runGitBackup() {
  const timestamp = getTimestamp()
  const commitMsg = `Auto backup database ${timestamp}`
  console.log(`[GitHub Backup] Memulai auto backup (${timestamp})...`)

  try {
    // 0. Set Git Identity (Sangat penting untuk server panel)
    await execPromise('git config user.email "bot@nelbotz.com"').catch(() => {})
    await execPromise('git config user.name "NelBotz AutoBackup"').catch(() => {})

    // 1. Git add khusus database saja
    await execPromise('git add --sparse database.json').catch(() => {})
    
    // Cek file apa saja yang akan di-commit
    const { stdout: diffOutput } = await execPromise('git diff --name-only --cached')
    const filesToPush = diffOutput.trim().split('\n').filter(f => f).join(', ')

    if (!filesToPush) {
        console.log('[GitHub Backup] Tidak ada perubahan data untuk di-commit (clean).')
        return { success: true, message: 'Tidak ada perubahan file baru untuk dipush.' }
    }

    console.log(`[GitHub Backup] File yang akan di-push: ${filesToPush}`)

    // 2. Git commit
    await execPromise(`git commit -m "${commitMsg}"`)

    // 3. Git push ke origin main secara 100% non-interaktif
    const { stdout, stderr } = await execPromise('git push origin main')
    console.log(`[GitHub Backup] Backup berhasil dipush ke GitHub! (File: ${filesToPush})`)
    return { success: true, message: `Backup berhasil dipush ke GitHub (${timestamp})\n📝 File yang di-push: ${filesToPush}`, stdout, stderr }
  } catch (error) {
    console.error('[GitHub Backup] Gagal:', error.message)
    return { success: false, message: error.message }
  }
}

// Inisialisasi Backup saat Startup & Scheduler (Setiap 12 Jam)
let isInitialized = false
if (!isInitialized) {
  isInitialized = true
  
  // 1. Jalankan langsung saat pertama kali bot startup (setelah 10 detik agar koneksi awal stabil)
  setTimeout(() => {
    console.log('[GitHub Backup] Menjalankan backup otomatis pertama saat startup...')
    runGitBackup()
  }, 10000)

  // 2. Jalankan secara berkala setiap 12 jam (12 * 60 * 60 * 1000 ms)
  const TWELVE_HOURS = 12 * 60 * 60 * 1000
  setInterval(() => {
    console.log('[GitHub Backup] Menjalankan backup otomatis berkala 12 jam...')
    runGitBackup()
  }, TWELVE_HOURS)

  console.log('[GitHub Backup] Service aktif. Backup akan berjalan saat startup dan setiap 12 jam.')
}

let handler = async (m, { conn }) => {
  await m.react('⏳')
  await m.reply('📦 *Memulai backup database & project ke GitHub...*')

  let res = await runGitBackup()

  if (res.success) {
    await m.react('✅')
    m.reply(`✅ *GitHub Backup Selesai!*\n\n📝 *Status:* ${res.message}`)
  } else {
    await m.react('❌')
    m.reply(`❌ *GitHub Backup Gagal!*\n\n⚠️ *Error:* ${res.message}`)
  }
}

handler.help = ['backupgit', 'gitbackup', 'autobackup']
handler.tags = ['owner']
handler.command = /^(backupgit|gitbackup|autobackup)$/i
handler.owner = true

export default handler
