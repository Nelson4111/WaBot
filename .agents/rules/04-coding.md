---
trigger: always_on
---

# Coding Standards

## General

Write code that is:

- Readable
- Maintainable
- Modular
- Predictable
- Testable
- Consistent with the existing project

Prefer simple solutions over clever solutions.

## Existing Code

Before adding code:

- Search for existing implementations.
- Reuse existing utilities where appropriate.
- Follow existing naming conventions.
- Follow existing project structure.

Do not create duplicate helpers or systems.

## Functions

Functions should have clear responsibilities.

Avoid functions that simultaneously:

- Read configuration
- Handle external communication
- Perform business logic
- Modify state
- Produce user-facing output

when these responsibilities can reasonably be separated.

## Async Code

Handle asynchronous operations explicitly.

Consider:

- Promise rejection
- Timeout
- Connection failure
- Race conditions
- Retry behavior
- Cleanup
- Cancellation where applicable

Never assume external operations always succeed.

## State

Be careful when modifying shared state.

Always consider:

- Initialization
- Updates
- Concurrent operations
- Cleanup
- Invalid state
- Reconnection
- Restart behavior

## Logging

Logs should help diagnose problems.

Prefer structured, meaningful messages.

Avoid:

- Excessive spam
- Sensitive information
- Misleading success messages

Use appropriate log levels where the project supports them.

## Configuration

Do not hardcode values that should reasonably be configurable.

Do not expose secrets in source code.

Use environment variables or existing configuration mechanisms.

## Comments

Comments should explain WHY, not simply repeat WHAT the code does.

Do not add comments unnecessarily.

## Code Changes

Keep diffs small and focused.

A feature request should not become an excuse to rewrite the entire project.
