---
name: code-review
description: Perform structured, senior-level code reviews on pull requests, commits, and plugin modifications to ensure reliability, performance, and maintainability.
---

# Senior Code Review Skill

Use this skill when reviewing code changes, auditing a pull request, or performing quality assurance before merging or deploying updates.

---

## Code Review Checklist

### 1. Correctness & Architecture
- [ ] Does the change solve the core requirement without introducing side effects?
- [ ] Does the implementation preserve the existing modular architecture?
- [ ] Are plugin files placed in appropriate category folders under `plugins/`?
- [ ] Are shared utilities placed in `lib/` rather than duplicated across plugins?

### 2. Error Boundaries & Event Loop Safety
- [ ] Are all asynchronous operations (`await`, `fetch`, `axios`) wrapped in proper error handling?
- [ ] Does failure in an external API send a user-friendly error message rather than crashing the Node.js process?
- [ ] Are synchronous blocking calls (e.g. `fs.readFileSync`, heavy regex, CPU-bound crypto loops) avoided inside the live message handler?

### 3. Memory & Resource Cleanup
- [ ] Are temporary files in `tmp/` properly deleted after sending media?
- [ ] Are interval timers (`setInterval`) and event listeners (`conn.ev.on`) properly cleared when a game, duel, or session finishes?
- [ ] Does `global.db.data` growth stay bounded (no unbounded arrays or accumulating uncollected session keys)?

### 4. UI & Formatting Compliance
- [ ] Does message text comply with `STYLE_GUIDE.md`?
  - Uses varied Unicode symbols instead of cluttered cartoon emojis.
  - Maintains WhatsApp blockquote `>` for headers, quotes, and notes.
  - Uses small caps typography for labels.
  - Formats numbers using `toSmallNum`.
- [ ] Are button payloads (`conn.Button`) valid JSON strings without broken escapes?

### 5. Git & Scope Hygiene
- [ ] Does the diff contain only files related to the approved scope?
- [ ] Are unintentional file deletions or auto-formatting mass-edits excluded?
- [ ] Are uncommitted user changes preserved?

---

## Review Output Format

Provide feedback structured as follows:

```markdown
### Code Review Summary
- **Overall Verdict**: APPROVED / CHANGES_REQUESTED / COMMENT
- **Files Reviewed**:
  - `path/to/file1.js`

### Key Strengths
- Clear explanation of positive design patterns found.

### Issues & Recommendations
- **[Severity: High/Medium/Low]**: Description of issue
  - **Location**: `file.js:L10-L20`
  - **Why**: Explanation of risk or standard violation
  - **Suggested Fix**: Drop-in code snippet

### Verification Checklist
- [x] Syntax checked (`node --check`)
- [x] No unhandled promise rejections
- [x] Conforms to Style Guide
```

