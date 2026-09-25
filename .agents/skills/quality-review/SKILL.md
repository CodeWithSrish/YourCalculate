---
name: quality-review
description: Standard operational workflow, safety checks, validation rules, and completion protocol for every task.
---

# Quality Review & Implementation Workflow

## Pre-Implementation Phase
1. **Inspect First**: Always inspect the existing workspace, directory structure, and relevant files before writing code.
2. **Understand Existing Architecture**: Locate existing patterns, shared utilities, types, and reusable components.
3. **Plan Minimal Scope**: Implement only what was requested. Avoid speculative refactoring or premature architecture.

## Implementation Phase
- **Minimal Changes**: Make the smallest change necessary to fulfill the request.
- **Preserve Working Code**: Never rewrite existing working functionality unless explicitly instructed.
- **Do Not Modify Unrelated Files**: Confine edits strictly to files relevant to the active task.
- **Deterministic Math**: Guarantee numerical calculations remain pure and deterministic.
- **Zero Unnecessary Dependencies**: Do not add packages or dependencies unless strictly needed.
- **Maintain Codebase Cleanliness**: Keep code strongly typed, well-formatted, and self-documenting.

## Post-Implementation Validation Phase
Execute these validation steps before concluding:
1. **Tests**: Run unit and integration tests covering changed functionality.
2. **Type Checking**: Run `tsc --noEmit` to verify strict TypeScript adherence.
3. **Linting**: Run linter to ensure code style compliance.
4. **Build Verification**: Run production build checks when appropriate.
5. **Review Diffs**: Review modified files to confirm no unintended changes or debug artifacts were left behind.

## Reporting & Protocol
1. Report exactly what files were created or modified.
2. Report validation results clearly (test passes, lint status, type-check status).
3. **STOP**: Never automatically proceed to the next phase or initiate unrequested work. Wait for user feedback.
