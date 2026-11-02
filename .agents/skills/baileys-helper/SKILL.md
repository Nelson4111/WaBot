---
name: baileys-helper
description: Diagnose, debug, and optimize WhatsApp Multi-Device socket connections, authentication state, message generation, and reconnect flows using Baileys.
---

# Baileys WhatsApp Socket Helper Skill

Use this skill when handling `@whiskeysockets/baileys` connection updates, socket drops, message serialization issues, media decoding, or interactive button structures.

---

## 1. Socket Lifecycle & Disconnect Handling

Baileys emits `connection.update` whenever the socket state changes:
```javascript
conn.ev.on('connection.update', async (update) => {
  const { connection, lastDisconnect, qr } = update
  
  if (connection === 'close') {
    const statusCode = lastDisconnect?.error?.output?.statusCode
    const shouldReconnect = statusCode !== DisconnectReason.loggedOut
    
    console.log(`[Connection] Closed with code: ${statusCode}, Reconnect: ${shouldReconnect}`)
    
    // Status Code Diagnostics:
    // 401 (loggedOut): Session invalidated or deleted by phone. Do NOT auto-reconnect without fresh login.
    // 408 (timedOut): Network timeout; safe to reconnect.
    // 428 (connectionClosed): Normal server drop; reconnect.
    // 503 (unavailable): WhatsApp service temporary downtime; reconnect with exponential backoff.
    // 515 (restartRequired): Session sync restart needed; immediately re-initialize socket.
  } else if (connection === 'open') {
    console.log('[Connection] ✅ WhatsApp Socket Connected Successfully')
  }
})
```

---

## 2. Interactive Messages & Native Flow Buttons

WhatsApp frequently updates proto definitions for interactive messages. Avelia uses `conn.Button` to encapsulate native flow message creation:

### Anatomy of Native Flow Button Payload
```javascript
const interactiveMessage = {
  viewOnceMessage: {
    message: {
      interactiveMessage: {
        header: {
          title: "Header Title",
          hasMediaAttachment: false
        },
        body: {
          text: caption
        },
        footer: {
          text: footerText
        },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'quick_reply',
              buttonParamsJson: JSON.stringify({
                display_text: '✦ Menu Utama',
                id: `${prefix}menu`
              })
            },
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '🌐 Website',
                url: 'https://example.com'
              })
            }
          ]
        }
      }
    }
  }
}
```

---

## 3. Audio & Waveform Handling
Avelia requires proper PTT (Push-To-Talk) waveform handling:
- Audio messages marked with `ptt: true` must have an accompanying `waveform` (Uint8Array of 64 or 100 bytes).
- Always ensure `scripts/patch-baileys.js` has run via `npm run postinstall` if dependency updates overwrite `@whiskeysockets/baileys`.
- When generating voice notes from audio buffers, provide or preserve waveform arrays to prevent WhatsApp from rendering broken audio bars.

---

## 4. Media Upload & Buffer Best Practices

1. **Buffer Validation**:
   Always verify the downloaded stream/buffer is valid and has expected magic numbers using `file-type`:
   ```javascript
   import { fileTypeFromBuffer } from 'file-type'
   const type = await fileTypeFromBuffer(buffer)
   if (!type || !['image/jpeg', 'image/png', 'video/mp4'].includes(type.mime)) {
     throw new Error('Unsupported media format')
   }
   ```
2. **Sharp / Canvas Processing**:
   - Ensure `sharp` matches platform architecture (e.g. sharp override in `package.json`).
   - Clean up temporary files immediately in `tmp/` using `try ... finally { fs.unlinkSync(tmpFile) }`.

---

## 5. Anti-Ban & Rate Limiting Protocols

1. **Message Throttling**: Never burst identical messages to multiple groups simultaneously without at least 1500–3000ms jitter.
2. **Presence Simulation**: When processing media or long tasks, simulate presence:
   ```javascript
   await conn.sendPresenceUpdate('composing', m.chat)
   ```
3. **Avoid Triggering Spam Traps**:
   - Do not auto-join invite links sent by random users.
   - Ignore broadcast channels or status broadcasts unless explicitly designed.

