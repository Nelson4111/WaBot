import style from '../lib/style.js'

console.log('--- Testing Greetings ---')
for (const hour of [7, 13, 16, 22]) {
  const g = style.getGreeting('Nenel', hour)
  console.log(`[Hour ${hour}:00] => ${g}`)
}

console.log('\n--- Testing Header ---')
console.log(style.shintoHeader('MAIN MENU', style.getGreeting('Nenel', 20)))

console.log('\n--- Testing Card ---')
console.log(style.shintoCard('PROFIL USER', {
  'Nama': 'Nenel',
  'Status': 'Premium Ⓟ',
  'Limit': 100,
  'Saldo': 'Rp 500.000'
}))

console.log('\n--- Testing Status Messages ---')
console.log(style.status.wait('Mengunduh audio...'))
console.log(style.status.success('Pengaturan disimpan!'))
console.log(style.status.error('Link tidak valid!'))
console.log(style.status.warning('Contoh: .tiktok <url>'))

console.log('\n--- All Style Tests Passed Successfully! ---')
