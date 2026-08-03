---
trigger: always_on
---

# Architecture Rules

## General

Treat the existing project architecture as intentional unless evidence shows otherwise.

Before changing architecture:

1. Understand the current architecture.
2. Identify the architectural problem.
3. Explain why the current design is insufficient.
4. Explain the proposed alternative.
5. Evaluate risks and trade-offs.
6. Obtain approval before major architectural changes.

## Change Scope

Every task must have a clearly defined scope.

Do not:

- Rewrite unrelated modules.
- Rename unrelated files.
- Reformat the entire project.
- Replace working libraries without justification.
- Introduce unnecessary abstractions.
- Create duplicate implementations.
- Move files without a clear reason.
- Change APIs unnecessarily.

## Dependency Policy

Before installing a dependency:

1. Determine whether the existing project can solve the problem without it.
2. Explain why the dependency is necessary.
3. Check compatibility with the current Node.js/runtime environment.
4. Check whether the dependency conflicts with existing packages.
5. Explain the maintenance impact.

Do not install packages automatically for convenience.

## Modularity

Prefer clear separation of responsibilities.

Avoid large files that contain unrelated responsibilities.

Business logic, configuration, infrastructure, external integrations, and user interaction should remain logically separated.

## Existing Behavior

Existing behavior is considered a contract unless the task explicitly requests changing it.

When modifying a feature:

- Preserve unrelated behavior.
- Preserve existing APIs where possible.
- Preserve configuration compatibility where possible.
- Avoid breaking existing commands or interfaces.

## Architectural Decisions

For major architectural decisions, provide:

Decision:
Reason:
Alternatives considered:
Advantages:
Disadvantages:
Risks:
Migration impact:
