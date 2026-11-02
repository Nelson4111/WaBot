---
name: avelia-plugin-creator
description: Scaffold, write, and refine plugins for Avelia WhatsApp Bot adhering strictly to ES Modules architecture, handler specifications, and the Zen Shinto UI Style Guide.
---

# Avelia WhatsApp Bot Plugin Creator Skill

Use this skill whenever creating a new plugin, converting an external script into an Avelia plugin, or redesigning an existing plugin's UI layout.

---

## 1. Plugin Architecture & Lifecycle

Every plugin in Avelia resides in the `plugins/` directory (categorized into folders such as `plugins/game/`, `plugins/tools/`, `plugins/downloader/`, `plugins/rpg/`, etc.) and is loaded dynamically as an ES Module.

### Standard Plugin Boilerplate
```javascript
import { status } from '../../lib/style.js'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  // 1. Input Validation
  if (!text) {
    return m.reply(
      `*╭  〔 ⚠ ᴘ ᴇ ʀ ɪ ɴ ɢ ᴀ ᴛ ᴀ ɴ 〕*\n` +
      `> Masukkan parameter yang valid!\n` +
      `> Contoh: *${usedPrefix + command} query*\n` +
      `*╰───────────────*`
    )
  }

  // 2. Loading State (for slow or network-bound operations)
  // await conn.sendMessage(m.chat, { text: status.wait('Memproses permintaan...') }, { quoted: m })

  try {
    // 3. Business Logic / API Fetch
    let result = "Contoh hasil..."

    // 4. Output Response conforming to STYLE_GUIDE.md
    let caption = `*──  ୨୧ ✧ ${command.toUpperCase()} ✧ ୨୧  ──*\n\n` +
      `*╭  〔 ✦ ʜ ᴀ ꜱ ɪ ʟ 〕*\n` +
      `> ${result}\n` +
      `*╰───────────────*`

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
  } catch (err) {
    console.error(`[${command}] Error:`, err)
    m.reply(status.error('Gagal memproses permintaan. Silakan coba lagi nanti.'))
  }
}

// Metadata configurations
handler.help = ['<cmd> <arg>']
handler.tags = ['<category>']
handler.command = /^<cmd>$/i

// Access Control Flags (optional):
// handler.limit = true        // Consumes user limit
// handler.premium = true      // Premium users only
// handler.group = true        // Usable only in groups
// handler.private = true      // Usable only in private chat
// handler.admin = true        // Requires user to be group admin
// handler.botAdmin = true     // Requires bot to be group admin
// handler.owner = true        // Owner only

export default handler
```

---

## 2. Handler Context Reference

The second argument `{ conn, ... }` provides:
- `conn`: Baileys socket instance (`conn.sendMessage`, `conn.sendFile`, `conn.Button`, `conn.getName`).
- `text`: Everything typed after the command prefix and command name.
- `args`: Array of string tokens split by whitespace (`text.split(' ')`).
- `usedPrefix`: The prefix matched (e.g. `.`, `/`, `!`, `#`).
- `command`: The specific command string invoked (lowercase).
- `participants`: Array of participant objects in a group.
- `isAdmin`: Boolean indicating if sender is group admin.
- `isBotAdmin`: Boolean indicating if bot has admin rights.
- `isOwner`: Boolean indicating if sender is configured bot owner.

The message object `m` provides:
- `m.chat`: Remote JID of current chat/group (`...card.s.whatsapp.net` or `...@g.us`).
- `m.sender`: JID of the sender.
- `m.quoted`: Object representing quoted message (if replying to one).
- `m.reply(text)`: Shortcut to reply to current message.

---

## 3. UI Styling Standards (Zen Shinto / Celestial Japanese)

Adhere to `STYLE_GUIDE.md`:
1. **Unicode Aesthetic Palette**:
   - Profile/User: `𝜚`, `ᰔ`, `㋡`, `﹫`
   - System/Tech: `⚙`, `⌬`, `𖦹`, `⧗`, `⏱`
   - Status/Rank: `❖`, `✮`, `✰`
   - Bullet & Data: `⟡` (primary), `✧` (secondary), `✦` (tertiary), `›` (action)
   - Header & Ribbon: `*──  ୨୧ ✧ [JUDUL] ✧ ୨୧  ──*`
2. **Small Caps**:
   Convert labels to small caps: `ɴᴀᴍᴀ`, `ʀᴏʟᴇ`, `ꜱᴛᴀᴛᴜꜱ`, `ʟɪᴍɪᴛ`, `ꜱᴀʟᴅᴏ`, `ʜᴀʀɪ`, `ᴛᴀɴɢɢᴀʟ`, `ᴊᴀᴍ`.
3. **Small Number Helper (`toSmallNum`)**:
   ```javascript
   const toSmallNum = (str) => {
     const map = { '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿' }
     return String(str).replace(/[0-9]/g, d => map[d] || d)
   }
   ```
4. **Hybrid Card Formatting**:
   - Single-line key-value:
     ```text
     *╭  〔 ✦ ᴅ ᴇ ᴛ ᴀ ɪ ʟ 〕*
     *┆* ⟡ ᴊᴜᴅᴜʟ : *Re:Zero*
     *┆* ✧ ʀᴏʟᴇ  : *User*
     *╰───────────────*
     ```
   - Multiline / Description (Use single `>` blockquote inside card without manual line breaks):
     ```text
     *╭  〔 📖 ꜱ ɪ ɴ ᴏ ᴘ ꜱ ɪ ꜱ 〕*
     > Natsuki Subaru tiba-tiba dipanggil ke dunia lain...
     *╰───────────────*
     ```

---

## 4. Native Flow Buttons (`conn.Button`)

To send interactive native flow buttons:
```javascript
const btn = new conn.Button(conn)
btn.setBody(captionText)
btn.setFooter(`${global.namebot} • Versi ${toSmallNum(global.versi || '10.0.0')}`)
if (mediaUrl) btn.setImage(mediaUrl) // or btn.setVideo(videoUrl, { gifPlayback: true })

btn.addReply('✦ Main Lagi', `${usedPrefix}game`)
btn.addReply('✧ Menu', `${usedPrefix}menu`)
await btn.send(m.chat)
```

---

## 5. Pre-Commit Checklist for Plugins
1. Run syntax check: `node --check plugins/<category>/<plugin>.js`
2. Ensure relative path imports are valid (e.g. `../../lib/style.js`).
3. Ensure all external network calls have timeout limits and are protected by `try/catch`.
4. Ensure `m.reply` or `conn.sendMessage` handles empty or undefined strings cleanly.

