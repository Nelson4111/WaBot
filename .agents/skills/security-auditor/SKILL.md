---
name: security-auditor
description: Audit bot plugins and codebase for security vulnerabilities, dangerous dynamic evaluations, path traversal, injection attacks, and credential leaks.
---

# Bot Security Auditor Skill

Use this skill when reviewing code, validating new external plugins, auditing dependencies, or performing security hardening on the bot codebase.

---

## 1. High-Risk Vulnerability Vectors

### A. Remote Code Execution (RCE) / Dynamic Evaluation
- **Anti-Pattern**: Using `eval()`, `Function()`, or `vm.runInContext` on user-controlled input.
  ```javascript
  // DANGEROUS:
  eval(text)
  new Function('conn', 'm', text)(conn, m)
  ```
- **Rule**: If an execution plugin (e.g. `plugins/owner/exec.js`) exists, it MUST be locked strictly behind `handler.owner = true` with secondary validation of `m.sender` against `global.owner` array.

### B. Command Injection via Shell Execution
- **Anti-Pattern**: Passing unescaped strings directly to `child_process.exec()` or `child_process.execSync()`.
  ```javascript
  // DANGEROUS:
  import { exec } from 'child_process'
  exec(`ffmpeg -i ${userInput} output.mp3`) // Vulnerable to shell injection: '; rm -rf /'
  ```
- **Remediation**: Use `execFile` or `spawn` with argument arrays:
  ```javascript
  import { spawn } from 'child_process'
  const ffmpeg = spawn('ffmpeg', ['-i', validatedInputPath, outputPath])
  ```

### C. Path Traversal & Arbitrary File Access
- **Anti-Pattern**: Allowing users to read or write arbitrary files via relative paths:
  ```javascript
  // DANGEROUS:
  fs.readFileSync(`./media/${text}`) // text = '../../.env' or '../../sessions/creds.json'
  ```
- **Remediation**:
  1. Strip directory traversal sequences: `path.basename(text)`.
  2. Verify resolved path stays inside allowed root:
     ```javascript
     const safePath = path.resolve(ALLOWED_DIR, path.basename(text))
     if (!safePath.startsWith(ALLOWED_DIR)) throw new Error('Access denied')
     ```

### D. Regular Expression Denial of Service (ReDoS)
- **Anti-Pattern**: Nested quantifiers causing catastrophic backtracking on long inputs:
  ```javascript
  // DANGEROUS:
  const vulnerableRegex = /([a-zA-Z]+)+$/
  ```
- **Rule**: Audit all `handler.command` and parsing regex patterns. Use bounded patterns and atomic groups where necessary.

### E. Credential & Session Protection
- **Critical Directory**: `sessions/` contains active WhatsApp cryptographic keys and pairing credentials.
- **Rules**:
  - Never print session contents to console or send via chat.
  - Never allow plugins to serve or expose files from `sessions/`, `.env`, or database backups.
  - Ensure `.gitignore` includes `sessions/`, `.env`, `*.tmp`, and sensitive database backups.

### F. Prototype Pollution in Database Operations
- **Anti-Pattern**: Directly assigning unvalidated object keys into `global.db.data`:
  ```javascript
  // DANGEROUS:
  global.db.data.users[m.sender][key] = value // key could be '__proto__' or 'constructor'
  ```
- **Remediation**: Whitelist allowed field keys before updating user records.

---

## 2. Security Audit Procedure

1. **Grep for Dangerous Sinks**:
   ```powershell
   Get-ChildItem -Recurse -Filter "*.js" plugins | Select-String -Pattern "eval\(|exec\(|execSync\(|Function\("
   ```
2. **Review Privilege Guards**:
   Verify every privileged command (owner, admin, botAdmin, group) has corresponding flags:
   ```javascript
   handler.owner = true
   handler.admin = true
   ```
3. **Inspect Output Sanitization**:
   Ensure error messages sent back to user chat do not leak server file paths, stack traces, or environment variables.

---

## 3. Audit Report Format
When completing an audit, report:
- **Scope**: Files or directories inspected.
- **Findings**: Categorized by severity (Critical, High, Medium, Low, Info).
- **Vulnerable Code Snippet**: Exact lines and reason.
- **Remediation**: Drop-in secure replacement.

