---
name: debug
description: Systematically investigate, diagnose, and resolve bugs and runtime errors in the bot codebase through structured root cause analysis.
---

# Systematic Debugging Skill

Use this skill when investigating a bug, crash, unexpected behavior, connection drop, or unhandled rejection reported in the bot.

## Core Principle
**DO NOT modify code immediately when a bug is reported.** First understand and trace the issue to its root cause.

---

## Phase 1: Inspect & Collect Evidence
Inspect the environment and relevant context before touching code:
- Check recent changes: `git status`, `git diff`
- Inspect `package.json` dependencies and scripts
- Inspect recent error logs, console stack traces, or uncaught rejections
- Locate relevant plugin, handler, or library files
- Check database state in `global.db.data` or JSON backups if state-related

## Phase 2: Reproduce
Determine deterministic conditions:
- **Trigger**: What command, event, or payload triggers the bug?
- **Expected Behavior**: What should happen according to specification?
- **Actual Behavior**: What actually happened (error message, crash, silent fail)?
- **Frequency**: Is it deterministic (100%), race condition, or external API dependent?

## Phase 3: Trace Execution Path
Trace the complete execution flow from ingress to failure:
1. WhatsApp Socket Event / Baileys message receipt
2. `handler.js` message parsing and plugin matching
3. Plugin handler function execution (`handler(m, { conn, ... })`)
4. External API call / Media processing / Database mutation
5. Message transmission or reaction to user
Identify exactly where the actual behavior deviates from expectation.

## Phase 4: Identify Root Cause
Differentiate clearly:
- **ROOT CAUSE**: The fundamental defect (e.g. unhandled null pointer, missing await, proto mismatch, API schema change).
- **SYMPTOM**: The visible failure (e.g. bot crash, silent timeout, error message sent to user).
- **SECONDARY ERRORS**: Subsequent failures caused by improper recovery.

*Never treat the symptom while leaving the root cause untouched.*

## Phase 5: Plan & Propose Fix
Formulate a minimal, targeted fix:
- Files to modify
- Specific changes per file
- Potential side effects on adjacent plugins or core socket loop
- Verification strategy
- Present the findings (Root cause, Evidence, Affected components, Plan) to the user before implementing.

## Phase 6: Implement
- Modify only the files approved for the fix.
- Keep the diff small, focused, and consistent with the codebase.
- Avoid incidental refactoring or renaming.

## Phase 7: Verify
- Validate JavaScript syntax: run a syntax check or dry test.
- Verify the original error no longer occurs.
- Verify adjacent functionality is unaffected.
- Check logs for regressions or memory leaks.

## Phase 8: Report
Provide a clean summary:
- **Problem**: Description of the issue.
- **Root Cause**: What specifically went wrong.
- **Fix**: What was changed and why.
- **Files Modified**: List of touched files.
- **Verification Performed**: Commands run and results.
- **Remaining Risks**: Any residual uncertainty or third-party dependency risks.

