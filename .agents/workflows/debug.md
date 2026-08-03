---
description: /debug
---

# Debug Workflow

When this workflow is invoked, perform a structured debugging investigation.

## Phase 1: Inspect

Inspect:

- Project structure
- Git status
- package.json
- Relevant source files
- Configuration
- Recent changes
- Relevant logs

Do not modify files yet.

## Phase 2: Reproduce

Attempt to reproduce the reported problem.

Document:

Expected:
Actual:
Trigger:
Frequency:

## Phase 3: Trace

Trace the relevant execution path.

Identify where behavior diverges.

## Phase 4: Root Cause

Determine:

Root cause:
Evidence:
Affected files:
Secondary effects:

Do not confuse symptoms with the root cause.

## Phase 5: Plan

Create a minimal implementation plan.

Include:

- Files to modify
- Changes per file
- Risks
- Testing strategy
- Rollback strategy

STOP and request approval before implementation.

## Phase 6: Implement

After approval:

- Implement only the approved solution.
- Avoid unrelated refactoring.
- Keep the diff focused.

## Phase 7: Verify

Run relevant:

- Tests
- Lint
- Type checking
- Build
- Runtime verification

Reproduce the original scenario.

## Phase 8: Report

Return:

### Root Cause

...

### Changes

...

### Files Modified

...

### Verification

...

### Test Results

...

### Remaining Risks

...

### Recommended Follow-up

...
