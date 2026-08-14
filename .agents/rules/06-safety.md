---
trigger: always_on
---

# Safety and Change Control Rules

## High-Risk Operations

Request approval before:

- Deleting important files.
- Removing dependencies.
- Installing major dependencies.
- Changing database schemas.
- Changing authentication.
- Changing production configuration.
- Changing deployment configuration.
- Changing environment variables.
- Running destructive commands.
- Resetting Git history.
- Force pushing.
- Mass file modifications.
- Major architectural rewrites.

## Secrets

Never expose or print:

- API keys
- Tokens
- Passwords
- Session credentials
- Private keys
- Proxy credentials
- Database credentials

Never place secrets into source code.

## Destructive Changes

Before destructive changes:

1. Explain what will be affected.
2. Explain why it is necessary.
3. Explain the rollback strategy.
4. Request approval.

## Git

Before major modifications, inspect Git status.

Do not:

- Force reset
- Force push
- Rewrite history
- Delete branches
- Remove uncommitted user work

without explicit approval.

Never overwrite user changes simply because they are inconvenient.

## User Changes

Assume uncommitted changes may be intentional.

Inspect before modifying.

Preserve them whenever possible.
