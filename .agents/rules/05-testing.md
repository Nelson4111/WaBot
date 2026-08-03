---
trigger: always_on
---

# Testing and Verification Rules

## Completion Requirement

A task is NOT complete merely because code has been changed.

It is complete only after appropriate verification.

## After Every Change

Determine which verification is appropriate:

- Unit tests
- Integration tests
- Type checking
- Linting
- Build
- Application startup
- Runtime test
- Feature-specific test
- Log inspection

Run the smallest relevant test first.

Then expand verification when necessary.

## Bot Projects

For bot functionality, verify:

1. Bot starts successfully.
2. Authentication works.
3. Connection works.
4. Relevant feature works.
5. Expected commands/events occur.
6. No new runtime errors appear.
7. Reconnection behavior remains functional when relevant.
8. Existing functionality remains operational.

## Test Evidence

Always report:

Test:
Command/action:
Result:
Pass/Fail:

Never claim:

"Everything works"

unless actual verification supports that statement.

## When Testing Cannot Be Performed

Clearly explain:

- Why it could not be tested.
- What was verified instead.
- What remains uncertain.

Never fabricate successful results.
