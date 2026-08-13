let handler = async (m) => {

  const year = new Date().getFullYear()
  const now = new Date()

  const kalender = {
    2026: [
      ['01-01','Tahun Baru Masehi'],
      ['02-17','Tahun Baru Imlek'],
      ['03-19','Hari Raya Nyepi'],
      ['03-31','Hari Raya Idul Fitri'],
      ['04-01','Hari Raya Idul Fitri'],
      ['04-03','Wafat Isa Almasih'],
      ['05-01','Hari Buruh Internasional'],
      ['05-14','Kenaikan Isa Almasih'],
      ['05-27','Hari Raya Waisak'],
      ['06-01','Hari Lahir Pancasila'],
      ['08-17','Hari Kemerdekaan RI'],
      ['09-16','Maulid Nabi Muhammad SAW'],
      ['12-25','Hari Raya Natal']
    ],

    2027: [
      ['01-01','Tahun Baru Masehi'],
      ['02-06','Tahun Baru Imlek'],
      ['03-08','Hari Raya Nyepi'],
      ['03-20','Hari Raya Idul Fitri'],
      ['03-21','Hari Raya Idul Fitri'],
      ['03-26','Wafat Isa Almasih'],
      ['05-01','Hari Buruh Internasional'],
      ['05-06','Kenaikan Isa Almasih'],
      ['05-15','Hari Raya Waisak'],
      ['06-01','Hari Lahir Pancasila'],
      ['08-17','Hari Kemerdekaan RI'],
      ['09-06','Maulid Nabi Muhammad SAW'],
      ['12-25','Hari Raya Natal']
    ]
  }

  if (!kalender[year])
    return m.reply(`❌ Data libur tahun ${year} belum tersedia`)

  let list = kalender[year]
    .map(([tgl,nama]) => ({
      nama,
      date: new Date(`${year}-${tgl}`)
    }))
    .filter(v => v.date > now)
    .sort((a,b)=>a.date-b.date)

  if (!list.length)
    return m.reply('❌ Tidak ada libur tersisa tahun ini')

  let next = list[0]

  let selisih = Math.ceil(
    (next.date - now) / (1000*60*60*24)
  )

  let tanggal = next.date.toLocaleDateString('id-ID',{
    day:'numeric',
    month:'long',
    year:'numeric'
  })

  m.reply(
`📅 *LIBUR NASIONAL TERDEKAT*

🎉 ${next.nama}
🗓️ ${tanggal}

⏳ ${selisih} hari lagi`
  )
}

handler.help = ['liburnas']
handler.tags = ['info']
handler.command = /^liburnas$/i

export default handler