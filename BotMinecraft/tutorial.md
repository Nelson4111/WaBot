# Minecraft AFK Bot — Dokumentasi Lengkap

> **Versi**: 1.0.0  
> **Node.js**: ≥ 20.x LTS  
> **Minecraft**: Java Edition 1.20.x  
> **OS Target**: Ubuntu 20.04 / 22.04 LTS  

---

## Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Struktur Project](#struktur-project)
3. [Penjelasan Setiap File](#penjelasan-setiap-file)
4. [Cara Install (Lokal)](#cara-install-lokal)
5. [Cara Setup VPS Ubuntu](#cara-setup-vps-ubuntu)
6. [Konfigurasi](#konfigurasi)
7. [Menjalankan Bot](#menjalankan-bot)
8. [Manajemen dengan PM2](#manajemen-dengan-pm2)
9. [Perintah In-Game](#perintah-in-game)
10. [Web Dashboard](#web-dashboard)
11. [Cara Menambah Module Baru](#cara-menambah-module-baru)
12. [Cara Update Project](#cara-update-project)
13. [Cara Debug](#cara-debug)
14. [Cara Membaca Log](#cara-membaca-log)
15. [Troubleshooting](#troubleshooting)
16. [FAQ](#faq)
17. [Best Practice](#best-practice)

---

## Gambaran Umum

Bot Minecraft ini dibangun di atas **Mineflayer** — library Node.js paling mature untuk membuat bot Minecraft. Bot ini dirancang untuk berjalan 24/7 di VPS Ubuntu dan dapat:

- **Tetap online** tanpa di-kick (anti-AFK otomatis)
- **Login otomatis** ke server yang menggunakan AuthMe (`/login`)
- **Respawn otomatis** saat mati
- **Makan otomatis** saat lapar
- **Guard mode** — serang hostile mobs dalam radius tertentu
- **Farm mode** — otomasi mob grinder (navigasi ke farm + loot collection)
- **Dikontrol via in-game chat** dengan sistem whitelist
- **Web dashboard** real-time di browser

---

## Struktur Project

```
BotMinecraft/
├── index.js                    # Entry point (minimal bootstrapper)
├── package.json                # Dependencies dan npm scripts
├── config.json                 # Konfigurasi umum (non-sensitif)
├── .env                        # Konfigurasi sensitif (username, password, host)
├── .env.example                # Template .env
├── ecosystem.config.js         # Konfigurasi PM2
├── .eslintrc.json              # Konfigurasi ESLint
├── .prettierrc                 # Konfigurasi Prettier
├── .gitignore                  # File yang tidak di-upload ke Git
├── tutorial.md                 # File ini
│
├── src/                        # Semua source code
│   ├── config/                 # Config loader dan validator
│   │   ├── index.js            # Merge .env + config.json + validasi
│   │   └── schema.js           # Joi schema validasi config
│   │
│   ├── core/                   # Inti lifecycle bot
│   │   ├── BotManager.js       # Orchestrator utama
│   │   ├── Connector.js        # Koneksi + reconnect logic
│   │   └── PluginLoader.js     # Register Mineflayer plugins
│   │
│   ├── modules/                # Fitur-fitur bot
│   │   ├── AutoAuth.js         # Login otomatis (AuthMe)
│   │   ├── AntiAfk.js          # Gerakan anti-AFK
│   │   ├── AutoEat.js          # Makan otomatis
│   │   ├── AutoRespawn.js      # Respawn otomatis
│   │   ├── GuardMode.js        # Serang hostile mobs
│   │   ├── MobFarm.js          # Otomasi mob grinder
│   │   └── Pathfinder.js       # Navigasi / pathfinding
│   │
│   ├── commands/               # Handler perintah in-game
│   │   ├── CommandRegistry.js  # Parser + dispatcher command
│   │   ├── StatusCommand.js    # !status
│   │   ├── GotoCommand.js      # !goto
│   │   ├── StopCommand.js      # !stop
│   │   ├── FarmCommand.js      # !farm
│   │   ├── GuardCommand.js     # !guard
│   │   ├── EatCommand.js       # !eat
│   │   ├── InventoryCommand.js # !inventory
│   │   ├── WaypointCommand.js  # !waypoint
│   │   ├── WhitelistCommand.js # !whitelist
│   │   ├── SayCommand.js       # !say
│   │   └── AfkCommand.js       # !afk
│   │
│   ├── events/                 # Mineflayer event handlers
│   │   ├── ChatHandler.js      # Routing chat → CommandRegistry
│   │   ├── DeathHandler.js     # Handle kematian bot
│   │   ├── ErrorHandler.js     # Handle error bot
│   │   └── SpawnHandler.js     # Handle spawn/respawn
│   │
│   ├── services/               # Layanan cross-cutting
│   │   ├── DataService.js      # CRUD file JSON (whitelist, waypoint, stats)
│   │   ├── StatsService.js     # Auto-save statistik
│   │   └── HealthCheck.js      # Monitoring health bot via cron
│   │
│   ├── utils/                  # Fungsi utilitas murni
│   │   ├── logger.js           # Winston logger (multi-level, multi-transport)
│   │   ├── retry.js            # Exponential backoff utility
│   │   ├── formatter.js        # Format chat, inventory, posisi
│   │   └── time.js             # Format waktu dan uptime
│   │
│   └── web/                    # Web dashboard
│       ├── server.js           # Express HTTP server
│       ├── routes/
│       │   ├── api.js          # REST API endpoints
│       │   └── logs.js         # SSE log streaming
│       └── public/
│           ├── index.html      # Dashboard HTML
│           ├── style.css       # Styling dashboard
│           └── app.js          # Frontend JavaScript
│
├── data/                       # Persistent JSON storage
│   ├── whitelist.json          # Daftar player whitelist
│   ├── waypoints.json          # Daftar waypoint tersimpan
│   ├── inventory.json          # Snapshot inventory terakhir
│   └── stats.json              # Statistik bot (deaths, logins, dsb.)
│
└── logs/                       # File log (dibuat otomatis)
    ├── combined-YYYY-MM-DD.log # Semua log
    └── error-YYYY-MM-DD.log    # Hanya error
```

---

## Penjelasan Setiap File

### Root Files

| File | Fungsi |
|---|---|
| `index.js` | Entry point. Bootstrap aplikasi, start semua services, handle SIGINT/SIGTERM |
| `config.json` | Semua konfigurasi yang aman untuk di-commit ke Git |
| `.env` | Username, password, host server — **JANGAN di-commit** |
| `ecosystem.config.js` | Konfigurasi PM2: auto-restart, memory limit, log path |

### `src/config/`

- **`index.js`** — Loader yang menggabungkan `.env` (via dotenv) dan `config.json`, lalu memvalidasi keduanya. Jika ada yang salah, aplikasi akan berhenti dengan pesan error yang jelas.
- **`schema.js`** — Joi schema untuk validasi `config.json`. Mencegah crash karena typo di config.

### `src/core/`

- **`BotManager.js`** — Orchestrator utama. Membuat instance bot, menginisialisasi semua modul setiap kali bot connect, menghentikan semua modul saat disconnect, dan mengekspos status bot ke web dashboard.
- **`Connector.js`** — Mengelola siklus hidup koneksi: connect → error → disconnect → reconnect dengan **exponential backoff** (5s, 10s, 20s, ..., maks 5 menit). Mewarisi EventEmitter.
- **`PluginLoader.js`** — Mendaftarkan semua Mineflayer plugin (pathfinder, pvp, auto-eat, tool) dalam urutan yang benar. Setiap plugin di-load dalam try-catch agar satu plugin gagal tidak menghentikan yang lain.

### `src/modules/`

- **`AutoAuth.js`** — Mendeteksi pesan login dari server (kata kunci bisa dikonfigurasi) dan mengirim `/login <password>` dengan delay realistis.
- **`AntiAfk.js`** — Setiap N detik (default: 30s), melakukan gerakan kecil acak: look (mengarahkan pandangan), sneak (shift), atau walk (langkah kecil). Menggunakan `node-cron`.
- **`AutoEat.js`** — Wrapper untuk `mineflayer-auto-eat`. Konfigurasi diambil dari `config.json`. Menyediakan method `forceEat()` untuk command `!eat`.
- **`AutoRespawn.js`** — Mendengarkan event `death` dan memanggil `bot.respawn()` setelah delay 2 detik.
- **`GuardMode.js`** — Setiap N ms, scan entity dalam radius tertentu, filter hostile mobs dari daftar di config, serang target terdekat menggunakan `mineflayer-pvp`.
- **`MobFarm.js`** — Navigasi ke waypoint `farm`, aktifkan guard mode, jalankan loop pengumpulan loot setiap N ms.
- **`Pathfinder.js`** — Wrapper di atas `mineflayer-pathfinder` dengan API `goto(x, z, y)`, deteksi stuck, dan timeout otomatis.

### `src/commands/`

- **`CommandRegistry.js`** — Pusat command system. Parse prefix, validasi whitelist, dispatch ke handler yang sesuai.
- Setiap file command (StatusCommand, GotoCommand, dsb.) hanya memiliki satu tanggung jawab: mengeksekusi satu perintah.

### `src/events/`

- **`ChatHandler.js`** — Mendengarkan event `chat` dan `whisper`, routing ke CommandRegistry.
- **`DeathHandler.js`** — Saat bot mati: catat statistik, hentikan farm/guard.
- **`SpawnHandler.js`** — Saat spawn: log posisi, update stats secara periodik.
- **`ErrorHandler.js`** — Tangani error pathfinder dan error umum.

### `src/services/`

- **`DataService.js`** — Semua operasi baca/tulis ke file JSON di folder `data/`. Menggunakan **atomic write** (write ke temp file dulu, lalu rename) untuk mencegah data corrupt.
- **`StatsService.js`** — Cron job yang menyimpan statistik bot ke disk setiap N menit.
- **`HealthCheck.js`** — Cron job yang memeriksa health dan food bot setiap N menit, log warning jika rendah.

### `src/utils/`

- **`logger.js`** — Winston logger dengan 5 level (error/warn/success/info/debug), output ke console dengan warna, output ke file dengan rotasi harian. Juga menyimpan buffer log untuk SSE.
- **`retry.js`** — Fungsi `calculateBackoff()` dan `retryWithBackoff()` untuk exponential backoff.
- **`formatter.js`** — Format posisi, health bar, inventory, nama item/mob.
- **`time.js`** — Format durasi, uptime, timestamp.

### `src/web/`

- **`server.js`** — Setup Express, daftarkan routes, serve static files.
- **`routes/api.js`** — REST API untuk dashboard: GET status/inventory/waypoints/stats, POST command.
- **`routes/logs.js`** — SSE endpoint untuk streaming log real-time ke browser.
- **`public/index.html`** — Dashboard HTML dengan layout sidebar + tabs.
- **`public/style.css`** — Dark mode UI dengan animasi dan responsive layout.
- **`public/app.js`** — Frontend JS: fetch API, Chart.js, SSE listener, tab navigation.

---

## Cara Install (Lokal)

### Prasyarat
- Node.js ≥ 20.x (gunakan [nvm](https://github.com/nvm-sh/nvm) untuk manajemen versi)
- npm ≥ 10.x (sudah termasuk dengan Node.js)

### Langkah

```bash
# 1. Clone repository
git clone <url-repo> BotMinecraft
cd BotMinecraft

# 2. Install dependencies
npm install

# 3. Buat file .env dari template
cp .env.example .env

# 4. Edit .env dengan data yang benar
nano .env
# Isi:
# BOT_USERNAME=NamaBotKamu
# BOT_PASSWORD=PasswordAuthMe
# SERVER_HOST=mc.server.com
# SERVER_PORT=25565
# WEB_PORT=3000
# NODE_ENV=development

# 5. Edit config.json jika perlu (opsional)
# Sesuaikan whitelist, radius guard, dsb.

# 6. Jalankan bot
npm start

# Atau mode development (auto-restart saat file berubah):
npm run dev
```

---

## Cara Setup VPS Ubuntu

### 1. Update Sistem

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential
```

### 2. Install Node.js via NVM (Recommended)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
nvm alias default --lts

# Verifikasi
node -v   # Harus ≥ v20.x
npm -v    # Harus ≥ v10.x
```

### 3. Install PM2 Global

```bash
npm install -g pm2
```

### 4. Clone dan Setup Project

```bash
# Clone project ke VPS
git clone <url-repo> ~/BotMinecraft
cd ~/BotMinecraft

# Install dependencies
npm install

# Setup .env
cp .env.example .env
nano .env
# Isi dengan data server Minecraft dan kredensial bot
```

### 5. Jalankan dengan PM2

```bash
pm2 start ecosystem.config.js

# Lihat status
pm2 status

# Lihat log
pm2 logs minecraft-bot
```

### 6. Auto-start Saat Reboot VPS

```bash
# Simpan konfigurasi PM2 saat ini
pm2 save

# Buat startup script (ikuti instruksi yang ditampilkan)
pm2 startup

# Contoh output (jalankan perintah yang ditampilkan):
# sudo env PATH=$PATH:/home/user/.nvm/versions/node/v20.x.x/bin pm2 startup systemd -u user --hp /home/user
```

### 7. (Opsional) Setup Nginx Reverse Proxy

Jika ingin akses dashboard via domain:

```nginx
# /etc/nginx/sites-available/minecraft-bot
server {
    listen 80;
    server_name bot.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Accel-Buffering no;  # Penting untuk SSE
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/minecraft-bot /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Konfigurasi

### `.env` (Sensitif)

| Variabel | Deskripsi | Default |
|---|---|---|
| `BOT_USERNAME` | Username bot Minecraft | **Wajib diisi** |
| `BOT_PASSWORD` | Password AuthMe | Kosong (jika server tanpa auth) |
| `SERVER_HOST` | Hostname/IP server | **Wajib diisi** |
| `SERVER_PORT` | Port server | `25565` |
| `WEB_PORT` | Port web dashboard | `3000` |
| `NODE_ENV` | Environment | `production` |

### `config.json` (Non-Sensitif)

| Key | Deskripsi | Default |
|---|---|---|
| `bot.version` | Versi Minecraft | `"1.20.1"` |
| `reconnect.enabled` | Aktifkan reconnect | `true` |
| `reconnect.initialDelayMs` | Delay reconnect pertama | `5000` |
| `reconnect.maxDelayMs` | Delay reconnect maksimum | `300000` |
| `auth.loginTriggerWords` | Kata kunci yang memicu auto-login | `["please log in", ...]` |
| `auth.loginDelayMs` | Delay sebelum kirim /login | `1500` |
| `antiAfk.enabled` | Aktifkan anti-AFK | `true` |
| `antiAfk.intervalSeconds` | Interval gerakan anti-AFK | `30` |
| `guard.enabled` | Guard mode default | `false` |
| `guard.radius` | Radius scan hostile mob | `16` |
| `guard.hostileMobs` | Daftar mob hostile | `["zombie", "skeleton", ...]` |
| `farm.waypointName` | Nama waypoint lokasi farm | `"farm"` |
| `commands.prefix` | Prefix command | `"!"` |
| `commands.whitelist` | Whitelist awal (dari config) | `[]` |
| `autoEat.startAt` | Mulai makan saat food ≤ N | `14` |

---

## Menjalankan Bot

### Mode Development (Lokal)

```bash
npm start                # Normal
npm run dev              # Auto-restart saat file berubah (Node ≥ 18)
NODE_ENV=development npm start  # Dengan debug log di console
```

### Mode Production (VPS dengan PM2)

```bash
pm2 start ecosystem.config.js
pm2 status
pm2 logs minecraft-bot --lines 100
```

---

## Manajemen dengan PM2

```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop minecraft-bot

# Restart (hard restart)
pm2 restart minecraft-bot

# Graceful reload (coba shutdown graceful dulu)
pm2 reload minecraft-bot

# Hapus dari PM2
pm2 delete minecraft-bot

# Monitor real-time
pm2 monit

# Lihat log
pm2 logs minecraft-bot
pm2 logs minecraft-bot --lines 200     # 200 baris terakhir
pm2 logs minecraft-bot --err           # Hanya error log

# Flush log
pm2 flush minecraft-bot

# Info detail
pm2 show minecraft-bot

# Simpan state PM2 (setelah perubahan)
pm2 save
```

### Auto-start Setelah Reboot

```bash
pm2 startup      # Ikuti instruksi yang ditampilkan
pm2 save         # Simpan daftar proses saat ini
```

---

## Perintah In-Game

Semua perintah menggunakan prefix `!` (bisa diubah di `config.json`).

| Perintah | Fungsi | Contoh |
|---|---|---|
| `!status` | Tampilkan status bot (HP, food, posisi, uptime, mode) | `!status` |
| `!goto <x> <z> [y]` | Navigasi ke koordinat | `!goto 100 -200` atau `!goto 100 -200 64` |
| `!stop` | Hentikan semua aktivitas (farm, guard, goto) | `!stop` |
| `!farm` | Toggle farming mode on/off | `!farm` |
| `!guard` | Toggle guard mode on/off | `!guard` |
| `!eat` | Paksa bot makan sekarang | `!eat` |
| `!inventory` atau `!inv` | Tampilkan isi inventory | `!inventory` |
| `!waypoint add <nama>` | Simpan posisi saat ini sebagai waypoint | `!waypoint add farm` |
| `!waypoint go <nama>` | Navigasi ke waypoint tersimpan | `!waypoint go base` |
| `!waypoint list` | Tampilkan semua waypoint | `!waypoint list` |
| `!waypoint delete <nama>` | Hapus waypoint | `!waypoint delete oldspot` |
| `!whitelist add <player>` | Tambah player ke whitelist | `!whitelist add Steve` |
| `!whitelist remove <player>` | Hapus player dari whitelist | `!whitelist remove Steve` |
| `!whitelist list` | Tampilkan whitelist | `!whitelist list` |
| `!say <pesan>` | Bot kirim chat ke server | `!say Halo semua!` |
| `!afk` | Toggle AFK mode (hentikan semua, anti-AFK tetap jalan) | `!afk` |
| `!help` | Tampilkan daftar command | `!help` |

### Setup Farm

1. Pergi ke lokasi mob grinder di Minecraft
2. Ketik `!waypoint add farm` untuk menyimpan lokasi
3. Ketik `!farm` untuk mulai mode farming
4. Bot akan navigasi ke farm, aktifkan guard, dan kumpulkan loot

---

## Web Dashboard

Akses di browser: `http://localhost:3000` (atau IP VPS jika dari luar)

### Tabs

- **Dashboard** — Status real-time (HP, food, posisi), grafik health/food, statistik
- **Inventory** — Isi inventory bot saat ini
- **Waypoints** — Daftar waypoint tersimpan + tombol Go
- **Live Logs** — Stream log real-time dengan filter level
- **Commands** — Kirim command ke bot dari browser, quick commands, referensi command

### REST API

```
GET  http://localhost:3000/api/status      → Status bot
GET  http://localhost:3000/api/inventory   → Inventory
GET  http://localhost:3000/api/waypoints   → Waypoints
GET  http://localhost:3000/api/stats       → Statistik
POST http://localhost:3000/api/command     → Kirim command (body: {"command": "!status"})
GET  http://localhost:3000/api/logs/stream → SSE stream log
GET  http://localhost:3000/api/logs/history?limit=100 → Log history
GET  http://localhost:3000/api/health      → Health check endpoint
```

---

## Cara Menambah Module Baru

### Contoh: Module AutoFish (memancing otomatis)

1. **Buat file module baru:**

```javascript
// src/modules/AutoFish.js
'use strict';

const { createModuleLogger } = require('../utils/logger');
const config = require('../config');

const log = createModuleLogger('AutoFish');

class AutoFish {
  constructor(bot) {
    this.bot = bot;
    this.isActive = false;
    this._interval = null;
  }

  start() {
    this.isActive = true;
    // Logic memancing...
    log.success('AutoFish aktif');
  }

  stop() {
    this.isActive = false;
    clearInterval(this._interval);
    log.info('AutoFish dihentikan');
  }
}

module.exports = AutoFish;
```

2. **Daftarkan di BotManager.js:**

```javascript
// src/core/BotManager.js
const AutoFish = require('../modules/AutoFish');

// Di dalam _initModules():
this._modules.autoFish = new AutoFish(bot);
```

3. **Buat command handler (opsional):**

```javascript
// src/commands/FishCommand.js
const FishCommand = {
  async handle(bot, botManager) {
    const { autoFish } = botManager.getModules();
    autoFish.isActive ? autoFish.stop() : autoFish.start();
    bot.chat(`Fish mode: ${autoFish.isActive ? 'ON' : 'OFF'}`);
  },
};
module.exports = FishCommand;
```

4. **Daftarkan command di CommandRegistry.js:**

```javascript
const FishCommand = require('./FishCommand');
// Di COMMAND_MAP:
fish: FishCommand.handle,
```

5. **Tambahkan ke COMMAND_LIST** di CommandRegistry.js untuk ditampilkan di `!help`.

---

## Cara Update Project

```bash
# 1. Pull perubahan terbaru
cd ~/BotMinecraft
git pull origin main

# 2. Install dependencies baru (jika ada)
npm install

# 3. Restart bot
pm2 restart minecraft-bot

# 4. Cek log untuk memastikan tidak ada error
pm2 logs minecraft-bot --lines 50
```

> **Catatan**: File `.env`, `data/`, dan `logs/` tidak terpengaruh oleh git pull karena ada di `.gitignore`.

---

## Cara Debug

### Mode Development dengan Debug Log

```bash
NODE_ENV=development npm start
```

Dengan `NODE_ENV=development`, log level DEBUG akan tampil di console.

### Cek Masalah Spesifik

```bash
# Lihat semua log
tail -f logs/combined-$(date +%Y-%m-%d).log

# Lihat hanya error
tail -f logs/error-$(date +%Y-%m-%d).log

# Filter log tertentu
grep "AutoAuth" logs/combined-$(date +%Y-%m-%d).log
grep "ERROR" logs/combined-$(date +%Y-%m-%d).log
```

### Debug Mineflayer

Tambahkan di `.env`:
```env
DEBUG=minecraft-protocol:*
```

Ini akan menampilkan semua packet yang dikirim/diterima — sangat verbose, hanya untuk debugging mendalam.

---

## Cara Membaca Log

### Format Log

```
[2024-01-15 12:30:45] [INFO] [BotManager] Bot online dan siap menerima perintah
[2024-01-15 12:30:46] [SUCCESS] [AutoAuth] Perintah /login dikirim
[2024-01-15 12:31:00] [WARN] [Connector] Bot di-kick dari server. Alasan: Server restart
[2024-01-15 12:31:05] [INFO] [Connector] Reconnect percobaan #1 dalam 5s...
[2024-01-15 12:31:10] [ERROR] [MobFarm] Gagal navigasi ke farm: Tidak ada path
```

### Level Log

| Level | Warna | Arti |
|---|---|---|
| `ERROR` | Merah | Error yang tertangani — perlu perhatian |
| `WARN` | Kuning | Peringatan — bisa jadi masalah |
| `SUCCESS` | Hijau | Operasi berhasil |
| `INFO` | Cyan | Informasi normal |
| `DEBUG` | Abu-abu | Detail teknis (hanya di development) |

### Prefix Module

Setiap log menyertakan nama module dalam kurung siku: `[BotManager]`, `[AutoAuth]`, `[Connector]`, dst. Gunakan ini untuk filter log saat debugging.

---

## Troubleshooting

### Bot Tidak Bisa Connect ke Server

**Gejala**: Log menampilkan `ECONNREFUSED` atau `ENOTFOUND`

**Solusi**:
1. Cek apakah server Minecraft online
2. Pastikan `SERVER_HOST` dan `SERVER_PORT` di `.env` benar
3. Pastikan port tidak diblok oleh firewall VPS:
   ```bash
   telnet mc.server.com 25565
   ```

---

### Bot Login Gagal (AuthMe)

**Gejala**: Bot connect tapi langsung di-kick, atau `AUTO_AUTH timeout`

**Solusi**:
1. Pastikan `BOT_PASSWORD` di `.env` benar
2. Cek kata kunci login di server berbeda dari default. Edit `config.json`:
   ```json
   "auth": {
     "loginTriggerWords": ["masukkan password", "silakan login"]
   }
   ```
3. Naikkan `auth.loginTimeoutMs` jika server lambat

---

### Bot Tidak Mau Makan

**Gejala**: Food level rendah tapi bot tidak makan

**Solusi**:
1. Pastikan inventory ada makanan
2. Cek `autoEat.startAt` di config — pastikan lebih rendah dari kondisi saat ini
3. Cek `autoEat.bannedFood` — pastikan makanan yang ada tidak di-ban

---

### Farm Mode Tidak Bisa Start

**Gejala**: `!farm` tapi bot bilang waypoint tidak ditemukan

**Solusi**:
1. Pergi ke lokasi farm di Minecraft
2. Ketik `!waypoint add farm` (sesuaikan nama di `config.farm.waypointName` jika berbeda)
3. Coba `!farm` lagi

---

### Bot Stuck Saat Navigasi

**Gejala**: Bot tidak bergerak tapi farm/goto masih aktif

**Solusi**:
1. Ketik `!stop` untuk batalkan navigasi
2. Kurangi `farm.stuckTimeoutMs` agar bot lebih cepat deteksi stuck
3. Pastikan tidak ada halangan di path bot (air, lava, dinding)

---

### Web Dashboard Tidak Bisa Diakses

**Gejala**: Browser tidak bisa buka `http://localhost:3000`

**Solusi**:
1. Pastikan bot sudah berjalan
2. Cek port:
   ```bash
   ss -tlnp | grep 3000
   ```
3. Jika di VPS, buka port di firewall:
   ```bash
   sudo ufw allow 3000/tcp
   ```
4. Ganti port di `.env` jika 3000 sudah dipakai

---

### Log Tidak Muncul di Dashboard

**Gejala**: Tab Logs di dashboard kosong

**Solusi**:
1. Pastikan SSE terhubung (tidak ada error di console browser)
2. Coba refresh halaman
3. Cek apakah Nginx proxy sudah punya `proxy_set_header X-Accel-Buffering no;`

---

### PM2 Tidak Auto-start Setelah Reboot

**Gejala**: Bot mati setelah VPS reboot

**Solusi**:
```bash
pm2 startup   # Ikuti instruksi
pm2 save      # Simpan state
```

---

## FAQ

**Q: Apakah bot bisa dipakai di server Hypixel?**  
A: Tidak disarankan. Hypixel memiliki anti-cheat (Watchdog) yang bisa ban akun yang menggunakan bot. Project ini dirancang untuk server semi-vanilla.

**Q: Apakah bisa menjalankan lebih dari 1 bot?**  
A: Arsitektur saat ini mendukung 1 bot per instance. Untuk multi-bot, jalankan beberapa instance dengan port dashboard berbeda (`WEB_PORT=3001`, dsb.) atau kembangkan BotManager menjadi pool manager.

**Q: Apakah password tersimpan aman?**  
A: Password disimpan di file `.env` yang ada di `.gitignore` — tidak di-upload ke Git. Namun, siapapun yang memiliki akses ke VPS bisa membacanya. Pastikan VPS aman.

**Q: Berapa CPU/RAM yang dibutuhkan?**  
A: Minimal. Bot ini sangat ringan — biasanya < 100MB RAM dan < 5% CPU pada VPS kecil (1vCPU, 1GB RAM sudah lebih dari cukup).

**Q: Apakah bisa dipakai di server dengan Microsoft Auth (online mode)?**  
A: Ya, tapi perlu mengubah `auth: 'offline'` menjadi `auth: 'microsoft'` di `Connector.js` dan menambahkan flow OAuth Microsoft. Ini perlu development tambahan.

**Q: Bagaimana cara reset semua data (whitelist, waypoints, stats)?**  
A: Hapus file di folder `data/` — akan otomatis dibuat ulang dengan nilai default saat bot restart.

**Q: Command `!farm` tidak jalan, apa yang harus dilakukan?**  
A: Pastikan waypoint dengan nama `farm` (atau sesuai `config.farm.waypointName`) sudah disimpan dengan `!waypoint add farm` saat berada di lokasi mob grinder.

---

## Best Practice

### Keamanan
- Selalu gunakan VPN atau batasi akses web dashboard ke IP tertentu via Nginx
- Jangan share file `.env` — di dalamnya ada password AuthMe
- Gunakan username bot yang tidak mencurigakan
- Jangan meninggalkan bot tanpa pengawasan di server publik ramai

### Stabilitas
- Gunakan PM2 dengan `max_memory_restart` untuk mencegah memory leak jangka panjang
- Set `reconnect.maxDelayMs` tidak terlalu pendek agar tidak dianggap spam oleh server
- Aktifkan `autoEat` dan `autoRespawn` selalu — bot yang mati dan tidak respawn = bot yang tidak berguna

### Farming
- Sebelum aktifkan `!farm`, pastikan farm sudah benar-benar dibangun di server
- Set waypoint farm di tengah area pengumpulan loot, bukan di platform spawner
- Monitor log untuk pastikan loot cycle berjalan normal

### Development
- Selalu jalankan `npm run lint` dan `npm run format` sebelum commit
- Gunakan `createModuleLogger('NamaModule')` di setiap file baru
- Semua error harus di-catch — tidak boleh ada unhandled rejection
- Tambahkan JSDoc di setiap fungsi publik yang dibuat

### Backup
- Backup folder `data/` secara berkala — berisi whitelist, waypoint, dan statistik
- `logs/` sudah di-rotate otomatis (14 hari) — tidak perlu backup manual

---

*Dokumentasi ini ditulis untuk versi 1.0.0. Jika ada pembaruan arsitektur atau fitur baru, perbarui bagian yang relevan.*
