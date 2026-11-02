---
name: verify
description: Perform structured testing, syntax checking, runtime health inspection, and regression verification on the bot codebase.
---

# Comprehensive Verification Skill

Use this skill to systematically verify recent changes, newly created plugins, bug fixes, or overall bot codebase health before committing or shipping.

---

## Verification Protocol

### Step 1: Inspect Changes
Inspect all uncommitted modifications:
```powershell
git status
git diff --stat
```
Identify every file touched and understand the intentional scope of changes.

### Step 2: Static & Syntax Validation
Verify that every touched JavaScript/ESM file has zero syntax errors, missing brackets, or invalid imports:
```powershell
node --check <path/to/modified_file.js>
```
If multiple files were changed, run a batch syntax validation across all modified files.

### Step 3: Dependency & Import Consistency
- Confirm all imported modules exist in `package.json` or local relative paths.
- Ensure relative path depths (`../` vs `../../`) correctly resolve to `lib/` or `src/`.
- Ensure named vs default exports match (`import { status } from '../../lib/style.js'`).

### Step 4: Security & Safety Check
Confirm no high-risk operations were introduced:
- No hardcoded API keys, passwords, or session tokens.
- No dangerous dynamic evaluation (`eval(text)`, `exec(text)` without sanitization).
- No unhandled promise rejections (all async API calls must be wrapped in `try/catch` or cleanly handled).
- No mutations that wipe `sessions/` or corrupt `database.json`.

### Step 5: Runtime & Logic Check
When testing commands or handlers:
- **Valid Input**: Does the command return expected output?
- **Missing Input**: Does it show a clean warning/help message according to `STYLE_GUIDE.md`?
- **Network Failure**: Does it catch timeouts gracefully using `status.error()` instead of crashing the process?
- **Permission Boundaries**: Does it respect `owner`, `admin`, `group`, or `limit` guards?

### Step 6: Honest Reporting
Generate a structured verification report:

```markdown
### Verification Summary
- **Status**: PASS / PARTIAL / FAIL
- **Files Verified**:
  - `path/to/file.js`: Syntax OK, Handlers validated
- **Tests Performed**:
  - Command / Action: `node --check ...`
  - Result: No syntax errors detected
- **Regression Check**:
  - Adjacent functionality tested or unaffected
- **Confidence Level & Remaining Risks**:
  - What has been verified with certainty
  - What requires live WhatsApp socket testing (if applicable)
```
*Never claim "everything works" without explicit verification evidence.*

