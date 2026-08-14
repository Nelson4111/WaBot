---
trigger: always_on
---

# Debugging Rules

## Golden Rule

DO NOT modify code immediately when a bug is reported.

First understand the problem.

## Debugging Process

Follow these steps:

### Step 1: Reproduce

Determine:

- What action triggers the problem?
- What should happen?
- What actually happens?
- Is the problem deterministic?
- Can the issue be reproduced locally?

If reproduction is impossible, clearly state that.

### Step 2: Collect Evidence

Inspect relevant:

- Error logs
- Stack traces
- Source code
- Configuration
- Environment variables
- Dependencies
- Recent changes
- Runtime behavior
- Related modules

Do not guess when evidence is available.

### Step 3: Trace Execution

Trace the execution flow from the trigger to the failure.

Example:

User command
→ command handler
→ business logic
→ external API
→ response
→ state update

Identify exactly where expected behavior diverges from actual behavior.

### Step 4: Identify Root Cause

Separate:

ROOT CAUSE

from:

SYMPTOM

and:

SECONDARY ERRORS

Do not fix a symptom while leaving the root cause untouched.

### Step 5: Explain

Before implementation, report:

Root cause:
Evidence:
Affected components:
Why it happens:
Potential side effects:

### Step 6: Propose Fix

The fix must:

- Solve the root cause.
- Minimize changes.
- Preserve unrelated behavior.
- Avoid unnecessary dependencies.
- Include error handling where appropriate.

### Step 7: Implement

Only modify files relevant to the approved solution.

### Step 8: Verify

After implementation:

1. Reproduce the original scenario.
2. Confirm the original error no longer occurs.
3. Test the modified feature.
4. Test important adjacent functionality.
5. Inspect logs.
6. Check for regressions.

## Error Handling

Do not use generic error suppression such as:

- Empty catch blocks
- Ignoring rejected promises
- Silently swallowing exceptions
- Arbitrary retries
- Disabling validation

unless there is a documented reason.

Never hide an error merely to make the logs look clean.

## Failed Fixes

If a fix does not work:

Do not repeatedly modify random code.

Instead:

1. Stop.
2. Reassess the evidence.
3. Determine why the hypothesis was wrong.
4. Investigate again.
5. Propose a revised solution.

## Debugging Output

At the end report:

Problem:
Root cause:
Fix:
Files changed:
Tests performed:
Test results:
Remaining risks:
