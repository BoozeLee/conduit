# AGENTS.md

Project-specific instructions for agents working in this repo.

## Commit Message Guidelines

- Use Angular-style commit messages (e.g., `feat: ...`, `chore: ...`) and include a short detail summary in the body.

## Changes routine

- Based on complexity and affected surface, decide whether to follow the TDD red-green approach or not.
- Always run `cargo check --all` after making changes and before the last test cycle.
- Always run all tests after finishing the changes with `cargo nextest run --all`. If execution fails, also try `cargo test --all` before reporting the test failure.
- Always run the Code Hygiene routine after finishing the changes.

## Code hygiene

- After each feature implementation, run `cargo fmt --all` and `cargo clippy -- -D warnings`.
  - Fix all the reported issues.

## Error handling

- Do not swallow errors. Avoid `let _ =` or `_ =` to discard `Result` values; handle them explicitly or log the failure with context.
