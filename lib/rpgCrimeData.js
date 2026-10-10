export const RPG_CRIME_TYPES = Object.freeze([
  Object.freeze({ key: 'rampok', label: 'Rampok', emoji: '🕵️', score: 4 }),
  Object.freeze({ key: 'jarah', label: 'Jarah', emoji: '🏚️', score: 4 }),
  Object.freeze({ key: 'culik', label: 'Culik', emoji: '🕶️', score: 3 }),
  Object.freeze({ key: 'bunuh', label: 'Bunuh', emoji: '🔪', score: 3 }),
  Object.freeze({ key: 'begal', label: 'Begal', emoji: '🏴‍☠️', score: 2 }),
  Object.freeze({ key: 'copet', label: 'Copet', emoji: '🤏', score: 1 }),
  Object.freeze({ key: 'kabur', label: 'Kabur sendiri', emoji: '🏃', score: 5 }),
  Object.freeze({ key: 'breakout', label: 'Breakout', emoji: '🧱', score: 5 })
])

export const KIDNAP_ESCAPE_COOLDOWN = 60 * 1000
export const KIDNAP_ESCAPE_WINDOW = 5 * 60 * 1000
export const KIDNAP_INACTIVITY_TIMEOUT = 60 * 60 * 1000
export const KIDNAP_INACTIVITY_LABEL = `${KIDNAP_INACTIVITY_TIMEOUT / (60 * 60 * 1000)} jam`

export const KIDNAP_ESCAPE_STORIES = Object.freeze([
  '🏃 Saat penjaga lengah, korban menemukan celah dan berhasil menyelinap pergi.',
  '🏃 Korban memanfaatkan suasana yang sepi untuk melepaskan diri dan kabur.',
  '🏃 Dengan sigap, korban mengelabui penculik lalu melarikan diri sebelum tertangkap.',
  '🏃 Kesempatan kecil itu tidak disia-siakan: korban berhasil kabur dari penculikan.',
  '🏃 Korban berhasil membuka jalan keluar dan berlari menjauh dari tempat penyekapan.',
  '🏃 Ketika perhatian penculik teralihkan, korban langsung mengambil kesempatan untuk kabur.',
  '🏃 Korban menemukan pintu yang tidak terkunci dan segera melarikan diri.',
  '🏃 Berbekal keberanian, korban berhasil melepaskan diri dari pengawasan penculik.',
  '🏃 Suara gaduh di sekitar mengalihkan perhatian penculik, memberi korban kesempatan untuk kabur.',
  '🏃 Korban diam-diam keluar dari tempat persembunyian penculik tanpa diketahui.',
  '🏃 Kelengahan sesaat dimanfaatkan korban untuk menjauh dan mencari pertolongan.',
  '🏃 Korban berhasil mengelabui penculik dengan berpura-pura menurut sebelum melarikan diri.',
  '🏃 Saat situasi mulai kacau, korban mengambil kesempatan untuk menyelamatkan diri.',
  '🏃 Korban menemukan jalur keluar tersembunyi dan berhasil meninggalkan tempat penyekapan.',
  '🏃 Pengawasan yang tidak ketat membuat korban berhasil menyelinap keluar.',
  '🏃 Korban menunggu waktu yang tepat, lalu berlari secepat mungkin menuju tempat aman.',
  '🏃 Perhatian penculik terpecah, dan korban langsung memanfaatkan kesempatan untuk kabur.',
  '🏃 Korban berhasil melepaskan ikatan dan melarikan diri sebelum penculik menyadarinya.',
  '🏃 Dalam situasi yang tepat, korban berhasil keluar tanpa meninggalkan jejak.',
  '🏃 Korban memanfaatkan pergantian penjagaan untuk melarikan diri dari tempat penculikan.',
  '🏃 Penculik kehilangan jejak korban setelah korban berhasil keluar melalui jalan samping.',
  '🏃 Korban berhasil menyelinap melewati penjagaan dan berlari mencari bantuan.',
  '🏃 Sebuah kesempatan tak terduga muncul, dan korban langsung menggunakannya untuk kabur.',
  '🏃 Korban berhasil mengecoh penculik dan meninggalkan lokasi sebelum keadaan kembali terkendali.',
  '🏃 Setelah berusaha mencari celah, korban akhirnya berhasil melarikan diri menuju tempat aman.'
])
export const KIDNAP_INACTIVITY_STORIES = Object.freeze([
  '🏃 Penculik tak kunjung memberi kabar selama {duration}. Korban memanfaatkan kelengahan itu untuk kabur.',
  '🏃 Setelah menunggu {duration} tanpa aktivitas dari penculik, korban berhasil mencari jalan keluar.',
  '🏃 Penjagaan lengah setelah penculik menghilang selama {duration}. Korban pun berhasil melarikan diri.',
  '🏃 Penculik terlalu lama menghilang ({duration}). Korban mengambil kesempatan dan berhasil kabur.',
  '🏃 Selama {duration}, penculik tidak menunjukkan tanda-tanda kembali. Korban akhirnya berhasil meloloskan diri.',
  '🏃 Tidak ada kabar dari penculik selama {duration}. Korban menggunakan waktu itu untuk mencari jalan keluar.',
  '🏃 Setelah ditinggalkan selama {duration}, korban menemukan kesempatan untuk melarikan diri.',
  '🏃 Penculik tidak aktif selama {duration}, membuat pengawasan terhadap korban semakin longgar.',
  '🏃 Korban menunggu selama {duration} tanpa pengawasan yang berarti, lalu berhasil kabur.',
  '🏃 Penculik menghilang selama {duration}. Korban segera memanfaatkan situasi untuk menyelamatkan diri.',
  '🏃 Selama {duration}, tempat penyekapan tidak dijaga dengan baik. Korban berhasil melarikan diri.',
  '🏃 Tak ada aktivitas dari penculik selama {duration}. Korban akhirnya menemukan celah untuk keluar.',
  '🏃 Korban menyadari penculik sudah lama tidak kembali ({duration}) dan segera mencari jalan keluar.',
  '🏃 Setelah penculik tidak muncul selama {duration}, korban berhasil meninggalkan tempat penyekapan.',
  '🏃 Waktu berlalu selama {duration} tanpa kabar dari penculik. Korban pun mengambil kesempatan untuk kabur.',
  '🏃 Pengawasan terabaikan selama {duration} karena penculik tidak kunjung kembali. Korban berhasil meloloskan diri.',
  '🏃 Korban memanfaatkan absennya penculik selama {duration} untuk mencari pertolongan.',
  '🏃 Penculik tidak melakukan aktivitas selama {duration}, memberi korban waktu untuk merencanakan pelarian.',
  '🏃 Selama {duration}, korban menunggu kesempatan yang tepat hingga akhirnya berhasil kabur.',
  '🏃 Penculik membiarkan tempat penyekapan tanpa pengawasan selama {duration}. Korban berhasil keluar.',
  '🏃 Tidak ada pergerakan dari penculik selama {duration}. Korban pun berani mengambil langkah untuk melarikan diri.',
  '🏃 Korban berhasil keluar setelah penculik tidak memberikan kabar selama {duration}.',
  '🏃 Penculik terlalu lama tidak aktif ({duration}), sehingga korban leluasa mencari jalan keluar.',
  '🏃 Kesempatan muncul setelah {duration} tanpa pengawasan dari penculik. Korban berhasil menyelamatkan diri.',
  '🏃 Setelah menunggu {duration} tanpa kehadiran penculik, korban akhirnya berhasil melarikan diri.'
])

export function createRpgCrimeRecord(initialValues = {}) {
  return {
    ...Object.fromEntries(RPG_CRIME_TYPES.map(({ key }) => [key, 0])),
    total: 0,
    ...initialValues
  }
}

export const RPG_CRIME_ACTIONS = Object.freeze({
  jarah: {
    label: 'Jarah',
    type: 'homeRaid',
    cooldown: 6 * 60 * 60 * 1000,
    successChance: 0.68,
    failurePenaltyRate: 0,
    failurePenaltyMin: 15000,
    failurePenaltyMax: 300000,
    prisonDuration: 2 * 60 * 60 * 1000,
    ransom: 2000000,
    caseLabel: '🏚️ Jarah'
  },
  culik: {
    label: 'Culik',
    type: 'kidnap',
    cooldown: 12 * 60 * 60 * 1000,
    successChance: 0.62,
    failurePenaltyRate: 0.08,
    failurePenaltyMin: 20000,
    failurePenaltyMax: 500000,
    prisonDuration: 4 * 60 * 60 * 1000,
    kidnapDuration: 5 * 60 * 60 * 1000,
    ransom: 4000000,
    caseLabel: '🕶️ Culik',
    escapeCooldown: KIDNAP_ESCAPE_COOLDOWN,
    escapeWindow: KIDNAP_ESCAPE_WINDOW
  }
})
