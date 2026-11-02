# WhatsApp Bot Engineering & Safety Standards

These rules are specific to the **Avelia WhatsApp Bot** codebase and must be strictly observed by the agent at all times.

---

## 1. Authentication & Session Protection
- The `sessions/` directory contains active WhatsApp cryptographic keys and pairing credentials.
- **NEVER** delete, overwrite, or clean up files inside `sessions/` unless explicitly instructed with clear user confirmation.
- **NEVER** print, log, or export session contents, private keys, or pairing codes in chat responses or public files.

---

## 2. Event Loop Safety & Error Boundaries
- In Node.js, an uncaught exception or unhandled promise rejection inside a message handler can terminate the entire bot process.
- **Always** wrap asynchronous operations in plugins (especially network calls, scrapers, canvas/sharp rendering, and database reads) inside `try ... catch` blocks.
- **Never** perform long-running synchronous blocking tasks (e.g. `fs.readFileSync` for large files or synchronous heavy crypto) in the live message execution loop.

---

## 3. Database State Integrity (`global.db.data`)
- The bot state is held in memory and persisted to `database.json`.
- When accessing or mutating user/chat records:
  ```javascript
  let user = global.db.data.users[m.sender]
  if (!user) user = global.db.data.users[m.sender] = {}
  ```
- Always initialize default values (e.g., `exp`, `limit`, `role`, `money`) safely before mutating numeric fields (`user.money = (user.money || 0) + 100`).
- Never overwrite the entire `global.db.data` object with unvalidated input.

---

## 4. UI Aesthetic & Style Guide Adherence
- All user-facing messages sent by plugins must follow the **Zen Shinto / Celestial Japanese Aesthetic** defined in `STYLE_GUIDE.md`.
- Retain WhatsApp blockquote (`>`) formatting for headers, quotes, and notes.
- Use the standard Unicode symbol palette (`𝜚`, `ᰔ`, `㋡`, `⚙`, `⌬`, `❖`, `⧗`, `⏱`, `◈`, `⟡`, `✧`, `✦`, `›`) and avoid cluttered emoji spam.
- Format labels in **Small Caps** and numerical data with `toSmallNum` or `lib/style.js`.

---

## 5. Plugin Modularity & ES Modules
- All plugins must be valid ES Modules (`"type": "module"`).
- All relative imports must include the `.js` extension (e.g., `import { status } from '../../lib/style.js'`).
- Plugins must export `handler` as default (`export default handler`).
- Plugins must declare metadata (`handler.help`, `handler.tags`, `handler.command`) cleanly.

