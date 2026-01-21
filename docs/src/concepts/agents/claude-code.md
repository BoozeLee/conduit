# Claude Code

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) is Anthropic's official CLI for Claude.

## Features

- **Tool Execution** — Read, write, and execute commands
- **Build/Plan Modes** — Toggle between full execution and read-only
- **Multiple Models** — Opus 4.5, Sonnet 4.5
- **200K Context** — Large context window

## Models

| Model | Best For |
|-------|----------|
| Opus 4.5 | Complex reasoning, architecture |
| Sonnet 4.5 | Balanced performance (default) |

## Build vs Plan Mode

- **Build Mode** (default) — Full capabilities
- **Plan Mode** — Read-only analysis, no file modifications

Toggle with `Tab` or `Ctrl+4`.

## Tools Available

- `Read` — Read file contents
- `Write` — Create or overwrite files
- `Edit` — Modify existing files
- `Bash` — Execute shell commands
- `Glob` — Find files by pattern
- `Grep` — Search file contents

## Installation

```bash
npm install -g @anthropic-ai/claude-code
```
