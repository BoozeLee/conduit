# Agent SDK Research: Claude Code & Codex CLI Embedding

This document summarizes research on how to programmatically embed Claude Code and Codex CLI into Rust applications.

---

## Overview

Both Claude Code and Codex CLI provide two integration approaches:

1. **CLI Headless Mode** - Spawn as subprocess with JSON streaming
2. **Native SDKs** - TypeScript/Python packages (not native Rust)

For Rust, the **subprocess approach** is the practical path.

---

## 1. Claude Code CLI Integration

### Headless Mode

**Documentation**: https://code.claude.com/docs/en/headless

```bash
# Basic usage
claude -p "Find and fix the bug in auth.py" --allowedTools "Read,Edit,Bash"

# Stream JSON output (for real-time parsing)
claude -p "task" --output-format stream-json

# JSON with metadata
claude -p "task" --output-format json
```

### Key CLI Flags

| Flag | Purpose |
|------|---------|
| `-p, --print` | Non-interactive/headless mode |
| `--output-format` | `text`, `json`, `stream-json` |
| `--allowedTools` | Pre-approve tools (e.g., `"Read,Edit,Bash"`) |
| `--json-schema` | Constrain output structure |
| `--resume <id>` | Continue previous session |
| `--continue` | Continue most recent session |
| `--system-prompt` | Replace default prompt |
| `--append-system-prompt` | Add to default prompt |

### JSON Output Format

```json
{
  "result": "Agent's response text",
  "session_id": "abc123",
  "usage": { "input_tokens": 1234, "output_tokens": 567 },
  "total_cost_usd": 0.045
}
```

### Stream JSON Format (JSONL)

Each line is a complete JSON object:

```jsonl
{"type": "system", "subtype": "init", "session_id": "abc123", ...}
{"type": "assistant", "message": {...}, ...}
{"type": "tool_use", "name": "Read", "input": {...}, ...}
{"type": "result", "result": "...", ...}
```

### Session Management

Sessions are tracked via `session_id` returned in the output. Resume with:

```bash
# Capture session ID
session_id=$(claude -p "Start review" --output-format json | jq -r '.session_id')

# Resume later
claude -p "Continue that review" --resume "$session_id"

# Or use --continue for most recent
claude -p "Continue" --continue
```

---

## 2. Codex CLI Integration

### Headless Mode

**Documentation**: https://developers.openai.com/codex/cli/reference/

```bash
# Basic execution
codex exec "Fix the CI failures"

# With JSON streaming
codex exec "task" --json

# Resume session
codex exec resume <SESSION_ID>
```

### Key CLI Flags

| Flag | Purpose |
|------|---------|
| `exec` (or `e`) | Non-interactive mode |
| `--json` | JSONL streaming output |
| `--output-last-message` | Write final response to file |
| `--output-schema` | JSON Schema for structured output |
| `--full-auto` | Low-friction automation preset |
| `--dangerously-bypass-approvals-and-sandbox` | Skip all checks (isolated only) |
| `--ask-for-approval` | `untrusted`, `on-failure`, `on-request`, `never` |

### Event Types (JSONL)

Based on Codex ThreadEvent structure:

```jsonl
{"type": "thread.started", "thread_id": "..."}
{"type": "turn.started"}
{"type": "item.started", "item": {...}}
{"type": "item.updated", "item": {...}}
{"type": "item.completed", "item": {...}}
{"type": "turn.completed", "usage": {...}}
{"type": "error", "message": "..."}
```

---

## 3. Context Management / Auto-Compaction

Both tools automatically manage context when it grows large.

### Claude Code

- **Trigger**: ~95% context capacity (or ~25% remaining)
- **Manual**: `/compact` command with optional focus instructions
- **Algorithm**: LLM summarizes conversation → new session starts with summary
- **Recommendation**: Compact at 80% for safety margin

### Codex CLI

- **Trigger**: Configurable threshold (default ~95%)
- **Manual**: `/compact` command
- **Algorithm**: Summarize history → keep recent ~20k tokens + summary

### What Gets Preserved

| Context Type | Persisted? |
|--------------|------------|
| Conversation messages | Yes |
| Files read | Yes (content cached) |
| Tool calls & results | Yes |
| Working directory | Yes |
| System prompt | Yes |
| Allowed tools | No (re-specify each call) |

---

## 4. Rust Implementation Strategy

### Recommended Approach: Subprocess with Async Streaming

Use `tokio::process` for async subprocess management:

```rust
use tokio::process::Command;
use tokio::io::{AsyncBufReadExt, BufReader};
use serde_json::Value;

pub struct ClaudeAgent {
    session_id: Option<String>,
}

impl ClaudeAgent {
    pub async fn query(&mut self, prompt: &str, tools: &[&str]) -> Result<AgentResponse> {
        let tools_arg = tools.join(",");

        let mut child = Command::new("claude")
            .args([
                "-p", prompt,
                "--output-format", "stream-json",
                "--allowedTools", &tools_arg,
            ])
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()?;

        let stdout = child.stdout.take().unwrap();
        let reader = BufReader::new(stdout);
        let mut lines = reader.lines();

        while let Some(line) = lines.next_line().await? {
            let event: Value = serde_json::from_str(&line)?;

            match event["type"].as_str() {
                Some("system") if event["subtype"] == "init" => {
                    self.session_id = event["session_id"].as_str().map(String::from);
                }
                Some("result") => {
                    return Ok(AgentResponse {
                        result: event["result"].as_str().unwrap_or("").to_string(),
                        session_id: self.session_id.clone(),
                    });
                }
                Some("tool_use") => {
                    // Handle tool use events (logging, UI updates, etc.)
                }
                _ => {}
            }
        }

        child.wait().await?;
        Err(anyhow::anyhow!("No result received"))
    }
}
```

### Key Rust Crates

| Crate | Purpose |
|-------|---------|
| `tokio::process` | Async subprocess spawning |
| `serde_json` | JSON parsing |
| `async-trait` | Async trait definitions |
| `thiserror` | Error types |
| `which` | Find binary paths |

---

## 5. Unified Event Types

Abstract both agents behind a common event enum:

```rust
pub enum AgentEvent {
    SessionInit { session_id: String, model: Option<String> },
    AssistantMessage { text: String, is_final: bool },
    ToolStarted { tool_name: String, tool_id: String, arguments: Value },
    ToolCompleted { tool_id: String, success: bool, result: Option<String> },
    TokenUsage { input: u64, output: u64, cached: u64, total: u64 },
    TurnCompleted,
    Error { message: String, is_fatal: bool },
}
```

Each agent implementation converts its raw JSONL events to this unified type.

---

## 6. Known Issues and Mitigations

| Issue | Mitigation |
|-------|------------|
| Different event schemas | Unified event layer abstracts differences |
| Session resume semantics differ | Use agent-specific resume flags |
| Quality degrades with repeated compaction | Limit to 2-3 compactions, suggest new session |
| Auto-compact triggers mid-task | Compact proactively at 80%, not 95% |
| Agent forgets mid-task state | Re-read critical files after compaction |

---

## Sources

- [Claude Agent SDK Overview](https://platform.claude.com/docs/en/api/agent-sdk/overview)
- [Claude Code Headless Mode](https://code.claude.com/docs/en/headless)
- [Codex SDK](https://developers.openai.com/codex/sdk/)
- [Codex CLI Reference](https://developers.openai.com/codex/cli/reference/)
- [Context Compaction Research](https://gist.github.com/badlogic/cd2ef65b0697c4dbe2d13fbecb0a0a5f)
- [tokio::process](https://docs.rs/tokio/latest/tokio/process/struct.Command.html)
