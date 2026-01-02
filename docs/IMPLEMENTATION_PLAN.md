# Conduit Phase 1: Embed Claude Code & Codex CLI with TUI

## Overview

Build a Rust TUI application that embeds Claude Code and Codex CLI as subprocess agents with a tab-based multi-agent interface.

**Project Location**: `/Users/fcoury/code/conduit`
**Stack**: ratatui 0.29 + crossterm 0.28 + tokio

---

## Module Structure

```
conduit/src/
├── main.rs                      # Entry point
├── lib.rs                       # Public API exports
├── agent/                       # Core agent embedding layer
│   ├── mod.rs                   # Re-exports
│   ├── runner.rs                # AgentRunner trait
│   ├── claude.rs                # Claude Code implementation
│   ├── codex.rs                 # Codex CLI implementation
│   ├── session.rs               # Session ID management
│   ├── events.rs                # Unified event types
│   ├── stream.rs                # JSONL stream parser
│   └── error.rs                 # Error types
├── config/
│   ├── mod.rs
│   └── settings.rs              # App configuration
└── ui/                          # TUI layer
    ├── mod.rs
    ├── app.rs                   # Main App struct, event loop
    ├── events.rs                # AppEvent enum
    ├── tab_manager.rs           # Multi-tab orchestration
    ├── session.rs               # AgentSession (per-tab state)
    └── components/
        ├── mod.rs
        ├── chat_view.rs         # Message history + streaming
        ├── input_box.rs         # User input
        ├── status_bar.rs        # Agent status, tokens, cost
        ├── tab_bar.rs           # Tab strip
        └── global_footer.rs     # Keyboard hints
```

---

## Implementation Steps

### Step 1: Project Setup

**File**: `Cargo.toml`

```toml
[package]
name = "conduit"
version = "0.1.0"
edition = "2021"

[dependencies]
# Async runtime
tokio = { version = "1.42", features = ["full", "process", "sync", "macros", "rt-multi-thread"] }

# TUI
ratatui = "0.29"
crossterm = { version = "0.28", features = ["event-stream"] }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Error handling
thiserror = "1.0"
anyhow = "1.0"

# Async trait
async-trait = "0.1"

# Utilities
uuid = { version = "1.11", features = ["v4", "v7", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
which = "7.0"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
unicode-width = "0.2"

[target.'cfg(unix)'.dependencies]
libc = "0.2"
```

---

### Step 2: Agent Layer - Core Types

**File**: `src/agent/error.rs`
- Define `AgentError` enum with thiserror

**File**: `src/agent/events.rs`
- Define unified `AgentEvent` enum:
  - `SessionInit { session_id, model }`
  - `AssistantMessage { text, is_final }`
  - `ToolStarted { tool_name, tool_id, arguments }`
  - `ToolCompleted { tool_id, success, result }`
  - `TokenUsage { input, output, cached, total }`
  - `TurnCompleted { usage }`
  - `Error { message, is_fatal }`

**File**: `src/agent/session.rs`
- Define `SessionId` newtype wrapper
- Define `SessionMetadata` for persistence

---

### Step 3: Agent Layer - Runner Trait

**File**: `src/agent/runner.rs`

```rust
#[async_trait]
pub trait AgentRunner: Send + Sync {
    fn agent_type(&self) -> &'static str;
    async fn start(&self, config: AgentStartConfig) -> Result<AgentHandle, AgentError>;
    async fn stop(&self, handle: &AgentHandle) -> Result<(), AgentError>;
    fn is_available(&self) -> bool;
}

pub struct AgentStartConfig {
    pub prompt: String,
    pub working_dir: PathBuf,
    pub allowed_tools: Vec<String>,
    pub resume_session: Option<SessionId>,
}

pub struct AgentHandle {
    pub events: mpsc::Receiver<AgentEvent>,
    pub session_id: Option<SessionId>,
    pub pid: u32,
}
```

---

### Step 4: Agent Layer - JSONL Parser

**File**: `src/agent/stream.rs`

- Generic `JsonlStreamParser<T>` using `tokio::io::BufReader::lines()`
- Define `ClaudeRawEvent` enum (maps from Claude's stream-json output)
- Define `CodexRawEvent` enum (maps from Codex's --json output)

---

### Step 5: Agent Layer - Claude Implementation

**File**: `src/agent/claude.rs`

```rust
impl ClaudeCodeRunner {
    fn build_command(&self, config: &AgentStartConfig) -> Command {
        // claude -p "prompt" --output-format stream-json --allowedTools "..."
    }

    fn convert_event(raw: ClaudeRawEvent) -> Option<AgentEvent> {
        // Map Claude events to unified events
    }
}
```

CLI flags:
- `-p <prompt>` - Headless mode
- `--output-format stream-json` - JSONL streaming
- `--allowedTools "Read,Edit,Bash"` - Pre-approve tools
- `--resume <session_id>` - Continue session

---

### Step 6: Agent Layer - Codex Implementation

**File**: `src/agent/codex.rs`

```rust
impl CodexCliRunner {
    fn build_command(&self, config: &AgentStartConfig) -> Command {
        // codex exec "prompt" --json --full-auto
    }

    fn convert_event(raw: CodexRawEvent) -> Option<AgentEvent> {
        // Map Codex events to unified events
    }
}
```

CLI flags:
- `exec <prompt>` - Headless execution
- `--json` - JSONL output
- `--full-auto` - No approval prompts
- `resume <session_id>` - Continue session

---

### Step 7: TUI - App Shell

**File**: `src/ui/app.rs`

```rust
pub struct App {
    config: Config,
    should_quit: bool,
    tab_manager: TabManager,
    event_tx: mpsc::UnboundedSender<AppEvent>,
    event_rx: mpsc::UnboundedReceiver<AppEvent>,
}

impl App {
    pub async fn run() -> Result<()> {
        // Terminal setup (enable_raw_mode, EnterAlternateScreen)
        // Main loop: draw + handle events
        // Cleanup (disable_raw_mode, LeaveAlternateScreen)
    }
}
```

Reference: `/Users/fcoury/code/ccline/src/ui/app.rs`

---

### Step 8: TUI - Components

**File**: `src/ui/components/input_box.rs`
- Text input with cursor, history navigation
- Handle Enter (submit), Shift+Enter (newline), Up/Down (history)

**File**: `src/ui/components/chat_view.rs`
- Scrollable message history
- Streaming text buffer for real-time output
- User messages vs agent messages styling

**File**: `src/ui/components/status_bar.rs`
- Agent type indicator (Claude/Codex)
- Session ID display
- Token usage (input/output/context %)
- Cost tracker

**File**: `src/ui/components/tab_bar.rs`
- Tab strip with active indicator
- "+" button for new tab

---

### Step 9: TUI - Tab Manager

**File**: `src/ui/tab_manager.rs`

```rust
pub struct TabManager {
    sessions: Vec<AgentSession>,
    active_tab: usize,
}

pub struct AgentSession {
    id: Uuid,
    agent_type: AgentType,
    chat_view: ChatView,
    input_box: InputBox,
    status_bar: StatusBar,
    agent_handle: Option<AgentHandle>,
}
```

---

### Step 10: TUI - Layout

```
┌──────────────────────────────────────────────────────────┐
│ [Claude] │ [Codex] │ +                                   │  TabBar (3 rows)
├──────────────────────────────────────────────────────────┤
│                                                          │
│  User: Fix the bug in auth.py                            │  ChatView
│                                                          │  (flexible)
│  Claude: I'll analyze auth.py and fix the bug...         │
│  [Tool: Read auth.py]                                    │
│  [Tool: Edit auth.py]                                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ > _                                                      │  InputBox (3 rows)
├──────────────────────────────────────────────────────────┤
│ Claude │ sess:abc123 │ 1.2k/200k tokens │ $0.02         │  StatusBar (1 row)
├──────────────────────────────────────────────────────────┤
│ [Tab] Switch │ [Ctrl+N] New │ [Ctrl+C] Interrupt │ [?]  │  Footer (1 row)
└──────────────────────────────────────────────────────────┘
```

---

### Step 11: Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+N` | New tab (agent selector) |
| `Ctrl+W` | Close tab |
| `Tab` | Switch tab (when input empty) |
| `Ctrl+1-9` | Jump to tab N |
| `Ctrl+C` | Interrupt agent |
| `Enter` | Submit prompt |
| `Shift+Enter` | Newline |
| `Up/Down` | Scroll history (input empty) |
| `Ctrl+Q` | Quit |

---

## Testing Strategy

1. **Unit Tests**: JSONL parsing for both Claude and Codex formats
2. **Integration Tests**: Mock agent process with canned responses
3. **Manual Testing**: Run with actual `claude` and `codex` binaries

---

## Files to Create (in order)

1. `docs/AGENT_SDK_RESEARCH.md` - Research documentation
2. `docs/IMPLEMENTATION_PLAN.md` - Full plan
3. `Cargo.toml` - Dependencies
4. `src/lib.rs` - Module exports
5. `src/agent/mod.rs` - Agent module
6. `src/agent/error.rs` - Error types
7. `src/agent/events.rs` - Event types
8. `src/agent/session.rs` - Session management
9. `src/agent/stream.rs` - JSONL parser
10. `src/agent/runner.rs` - AgentRunner trait
11. `src/agent/claude.rs` - Claude implementation
12. `src/agent/codex.rs` - Codex implementation
13. `src/ui/mod.rs` - UI module
14. `src/ui/app.rs` - Main app
15. `src/ui/events.rs` - App events
16. `src/ui/tab_manager.rs` - Tab management
17. `src/ui/session.rs` - Per-tab state
18. `src/ui/components/mod.rs` - Component exports
19. `src/ui/components/input_box.rs`
20. `src/ui/components/chat_view.rs`
21. `src/ui/components/status_bar.rs`
22. `src/ui/components/tab_bar.rs`
23. `src/ui/components/global_footer.rs`
24. `src/main.rs` - Entry point

---

## Reference Files

- `/Users/fcoury/code/ccline/src/ui/app.rs` - TUI patterns (App struct, event loop)
- `/Users/fcoury/code/ccline/src/ui/components/` - Component architecture
- `/Users/fcoury/code/ccline/src/cli.rs` - Clap CLI patterns

---

## Success Criteria

1. Can spawn Claude Code in headless mode and display streaming output
2. Can spawn Codex CLI in exec mode and display streaming output
3. Tab-based UI allows switching between multiple agent sessions
4. Session IDs tracked for resume capability
5. Token usage and cost displayed in status bar
6. Keyboard shortcuts work as specified
