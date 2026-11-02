---
name: feature
description: Plan, architect, and implement new features, commands, or integrations in the bot with end-to-end verification.
---

# Feature Development Skill

Use this skill when designing and building a new command, plugin, game, utility, or external service integration for the bot.

---

## Phase 1: Understand Requirements
Clarify the complete scope before writing code:
- **Requested Behavior**: What command(s) will trigger this feature?
- **User Inputs & Flags**: Parameters, flags, media attachments, or quoted messages.
- **Expected Outputs**: Response format (text card, image/video, button, audio).
- **Permissions**: Public, Owner-only, Admin-only, Group-only, Private-chat-only.
- **Economic Constraints**: Limit cost, money/exp reward, cooldown/timer.
- **Existing Capabilities**: Check if similar plugins or helpers exist in `plugins/` or `lib/`.

## Phase 2: Architectural Placement
Determine how the feature integrates into Avelia:
1. **Location**: Determine the correct category folder under `plugins/` (e.g. `plugins/game/`, `plugins/tools/`, `plugins/downloader/`, `plugins/rpg/`).
2. **Helper Modules**: Check if shared functions should be placed in `lib/` (e.g. `lib/style.js`, `lib/waifuHelper.js`).
3. **Database Schema**: Determine if new fields are needed in `global.db.data.users[m.sender]` or `global.db.data.chats[m.chat]`. Ensure default values are safely populated.
4. **Dependencies**: Prefer built-in libraries (`axios`, `node-fetch`, `cheerio`, `sharp`) before suggesting new npm packages.

## Phase 3: Implementation Plan
Draft a concise plan:
- File(s) to create or edit
- Command syntax (`handler.command`, `handler.help`, `handler.tags`)
- UI layout following `STYLE_GUIDE.md` (Card structure, Unicode symbols, Small Caps)
- Error handling strategy
- Potential edge cases (network timeout, invalid input, rate limiting)

*Present the plan to the user before implementing non-trivial features.*

## Phase 4: Implement
Follow Avelia ES Module standards:
```javascript
import { status } from '../../lib/style.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Input validation
  // Processing & API fetch
  // UI response formatting adhering to STYLE_GUIDE.md
}

handler.help = ['<command> <args>']
handler.tags = ['<category>']
handler.command = /^<command>$/i

// Options: handler.limit = true, handler.admin = true, handler.group = true
export default handler
```

## Phase 5: Verify
- Validate syntax using `node --check <file>` to detect syntax or import errors.
- Verify error handling catches unexpected API responses or network timeouts.
- Confirm state changes in `global.db.data` are valid.
- Verify no unhandled promise rejections occur.

## Phase 6: Report
Provide a completion summary:
- **Feature**: What was built and how to use it.
- **Command Syntax**: Example commands (`.command arg`).
- **Files Created/Modified**: List of file paths.
- **Verification Performed**: Syntax check and behavior verification.
- **Known Limitations**: Any external API rate limits or edge cases.

