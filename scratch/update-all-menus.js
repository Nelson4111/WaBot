import fs from 'fs';
import path from 'path';

const menuDir = path.resolve('c:/Users/aqana/Documents/Projects/Bot/plugins/menu');
const menuFiles = fs.readdirSync(menuDir).filter(f => f.startsWith('menu-') && f.endsWith('.js'));

console.log('Found submenu files:', menuFiles.length);

for (const file of menuFiles) {
  const filePath = path.join(menuDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Change bullet mapping from `⟡ ${v.cmd}` to `│ ⟡ ${v.cmd}`
  content = content.replace(
    /\.map\(v => `⟡ \${v\.cmd} \${v\.premium \? 'Ⓟ' : ''}\${v\.limit \? 'Ⓛ' : ''}`\)/g,
    ".map(v => `│ ⟡ ${v.cmd} ${v.premium ? 'Ⓟ' : ''}${v.limit ? 'Ⓛ' : ''}`)"
  );

  // 2. Change header icon: 〔 ⛩️ *...* 〕 to 〔 ✦ *...* 〕
  content = content.replace(/〔 ⛩️ \*(.*?)\* 〕/g, '〔 ✦ *$1* 〕');

  // 3. Change greeting line to blockquote: \n     ${greeting}\n to \n> ${greeting}\n
  content = content.replace(/\n\s+\${greeting}\n/g, '\n> ${greeting}\n');

  // 4. Change cards to box-drawing tree
  // PROFIL PENGGUNA
  content = content.replace(
    /〔 ✿ \*PROFIL PENGGUNA\* 〕\n⟡ \*Nama\* : \${name}\n⟡ \*Role\* : \${role}\n⟡ \*Status\* : \${prems}\n⟡ \*Limit\* : \${limit}\n⟡ \*Saldo\* : Rp \${uang\.toLocaleString\('id-ID'\)}/g,
    `┌──〔 ✦ *PROFIL PENGGUNA* 〕\n│ ⟡ *Nama* : \${name}\n│ ⟡ *Role* : \${role}\n│ ⟡ *Status* : \${prems}\n│ ⟡ *Limit* : \${limit}\n│ ⟡ *Saldo* : Rp \${uang.toLocaleString('id-ID')}\n└────────────────────────`
  );

  // WAKTU & TANGGAL
  content = content.replace(
    /〔 ✿ \*WAKTU & TANGGAL\* 〕\n⟡ \*Tanggal\* : \${tanggal}\n⟡ \*Hari\* : \${hari}\n⟡ \*Jam\* : \${jam} WIB/g,
    `┌──〔 ✦ *WAKTU & TANGGAL* 〕\n│ ⟡ *Tanggal* : \${tanggal}\n│ ⟡ *Hari* : \${hari}\n│ ⟡ *Jam* : \${jam} WIB\n└────────────────────────`
  );

  // DAFTAR PERINTAH
  content = content.replace(
    /〔 ✿ \*DAFTAR PERINTAH\* 〕\n\${([a-zA-Z0-9_]+)}/g,
    `┌──〔 ✦ *DAFTAR PERINTAH* 〕\n\${$1}\n└────────────────────────`
  );

  // Footer & divider
  content = content.replace(
    /── · ── · ── · ── · ── · ──\n_Terima kasih sudah menggunakan \${global\.namebot} ✨_/g,
    `· · ─ ─ ✦ ─ ─ · ·\n> _Terima kasih sudah menggunakan \${global.namebot}_`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', file);
}

console.log('All submenus updated successfully!');
