---
name: syntax-checker
description: Rapidly validate JavaScript ES Module syntax, import resolutions, and structural integrity across plugins and modules without starting the full bot.
---

# Fast Syntax Checker Skill

Use this skill to quickly verify JavaScript / ESM syntax integrity across plugins, libraries, and scripts without running the full WhatsApp bot or establishing network connections.

---

## 1. Quick Validation Commands

### Single File Validation
To check syntax on a specific file:
```powershell
node --check path/to/file.js
```
If the command outputs nothing and exits with code 0, the syntax is valid. If there is a parse error, Node prints the line number and token mismatch.

### Batch Validation on Changed Files (Git)
To check only files changed in git:
```powershell
git status --short | Select-String "\.js$" | ForEach-Object {
    $file = ($_ -split '\s+')[-1]
    if (Test-Path $file) {
        Write-Host "Checking: $file"
        node --check $file
    }
}
```

### Full Plugins Directory Scan
To scan all plugins for syntax errors:
```powershell
Get-ChildItem -Recurse -Filter "*.js" plugins | ForEach-Object {
    $err = node --check $_.FullName 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error in $($_.FullName): $err" -ForegroundColor Red
    }
}
```

---

## 2. Common ESM & Syntax Pitfalls in Avelia

### A. Missing `.js` Extension in Relative Imports
In ES Modules (`"type": "module"` in `package.json`), all relative imports MUST include file extensions:
```javascript
// ❌ WRONG:
import { status } from '../../lib/style'

// ✅ CORRECT:
import { status } from '../../lib/style.js'
```

### B. Broken Template String Interpolation
Ensure backticks are balanced and `${}` expressions are closed:
```javascript
// ❌ WRONG:
let text = `*── ✧ ${name ✧ ──*`

// ✅ CORRECT:
let text = `*── ✧ ${name} ✧ ──*`
```

### C. Regex Delimiters in `handler.command`
Verify regex flags and escape sequences in `handler.command`:
```javascript
// ✅ CORRECT:
handler.command = /^(suit|rps)$/i
```

---

## 3. AST Validation via `syntax-error`
The project includes the `syntax-error` package in `package.json`. It can be run programmatically to inspect code snippets or strings:
```javascript
import syntaxError from 'syntax-error'
import fs from 'fs'

const code = fs.readFileSync('plugins/game/game-suit.js', 'utf8')
const err = syntaxError(code, 'game-suit.js', { sourceType: 'module' })
if (err) {
  console.error(`Syntax error on line ${err.line}, col ${err.column}: ${err.message}`)
} else {
  console.log('✅ Syntax valid')
}
```

