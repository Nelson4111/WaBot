# BotMinecraft2 — Farm Bot Mineflayer 1.21.6

Bot Minecraft multi-layer untuk server survival `rhsmp.mc.hrkm.my.id`.

## Quick Start

```bash
npm install
node index.js
# atau dengan PM2:
npm run pm2:start
```

---

## Struktur Bot

| Bot | Role | Fitur |
|-----|------|-------|
| `Bot-Nenel1` | Primary | Full AI pipeline + Chat AI (Groq) + semua farm modules |
| `Bot-Nenel2+` | Farm | Mob farm + deposit, tanpa AI chat |

---

## Perintah (via `/msg <botname> !<command>`)

Semua perintah dikirim lewat **private message** agar tidak bentrok antar bot.

### Zone Commands
```
/msg Bot-Nenel1 !setzone mob [radius]     — Set zona mob farm di posisi bot saat ini
/msg Bot-Nenel1 !setzone crop [radius]    — Set zona crop farm di posisi bot saat ini
/msg Bot-Nenel1 !setzone chest [radius]   — Set zona scan chest di posisi bot saat ini
/msg Bot-Nenel1 !getzone mob              — Cek posisi zona mob farm
```

### Sell & Enchant Setup
```
/msg Bot-Nenel1 !setsellpoint             — Set titik jual di posisi bot saat ini
/msg Bot-Nenel1 !setenchantpos            — Set posisi enchanting station di posisi bot
```

### Give Item
```
/msg Bot-Nenel1 !give <player> <item> [count]
/msg Bot-Nenel1 !give Nelson41111 diamond 5
```

### Status & Control
```
/msg Bot-Nenel1 !status     — HP, food, slots, goal, posisi
/msg Bot-Nenel1 !stop       — Hentikan semua aktivitas
/msg Bot-Nenel1 !resume     — Lanjutkan aktivitas
/msg Bot-Nenel1 !scan       — Force scan dunia sekitar
/msg Bot-Nenel1 !say <teks>  — Bot akan mengirim teks ke chat publik
```

### AI Chat
```
/msg Bot-Nenel1 !ask <pertanyaan>   — Tanya langsung via command
```
**Atau panggil di chat publik** dengan menyebut kata "bot" atau "nenel":
```
Hei bot, apa itu diamond?
Nenel, berapa harga ender pearl?
```

---

## Setup Awal (Urutan yang Disarankan)

1. **Masuk ke server** — tunggu bot spawn
2. **Set zona mob farm**: pergi ke dekat mob farm, lalu:
   ```
   /msg Bot-Nenel1 !setzone mob 20
   ```
3. **Set zona crop farm**: pergi ke lahan, lalu:
   ```
   /msg Bot-Nenel1 !setzone crop 30
   ```
4. **Set titik jual**: pergi ke area jual, lalu:
   ```
   /msg Bot-Nenel1 !setsellpoint
   ```
5. Bot mulai farming otomatis berdasarkan Utility AI scoring

---

## Tambah Bot Baru

Edit `config.js`, tambahkan entri di array `bots`:
```js
bots: [
  { username: 'Bot-Nenel1', password: '', role: 'primary' },
  { username: 'Bot-Nenel2', password: '', role: 'farm' },
  { username: 'Bot-Nenel3', password: '', role: 'farm' }, // tambah ini
],
```

---

## Arsitektur (11 Lapisan)

```
SafetySystem (paralel, prioritas tertinggi)
     ↓
TickScheduler → WorldScanner → EnvironmentAnalyzer
                     ↓
                Blackboard (shared state)
                     ↓
             DecisionEngine (HSM + Utility AI)
                     ↓
              TaskPlanner (BT + GOAP-lite)
                     ↓
         MovementPlanner + ActionExecutor (+ Humanizer)
                     ↓
           RecoverySystem (semua layer lapor ke sini)
                     ↓
                  Monitor
```

---

## File Konfigurasi

Semua parameter ada di [`config.js`](config.js):
- `humanization.*` — delay, rotasi, noise
- `safety.*` — threshold HP/food/fall
- `recovery.*` — retry, backoff
- `farm.*` — deposit/sell threshold
- `mobFarm.*` / `cropFarm.*` — parameter per modul

---

## Logs

```
logs/bot-YYYY-MM-DD.log   — Log harian
logs/pm2-error.log        — PM2 error
logs/pm2-out.log          — PM2 stdout
```
