# Claude Code Tool Catalog

This document catalogs all tools observed in Claude Code sessions, organized by category and usage frequency.

## Tool Usage Summary

| Category | Tools | Total Uses |
|----------|-------|------------|
| File Operations | Bash, Read, Edit, Write, Glob, Grep | ~65,000+ |
| Task Management | TodoWrite, Task, TaskOutput | ~5,000+ |
| Planning | EnterPlanMode, ExitPlanMode | ~245 |
| User Interaction | AskUserQuestion, Skill, SlashCommand | ~200+ |
| Web | WebSearch, WebFetch | ~1,450+ |
| Browser Automation | playwright/*, chrome/*, pw/* | ~500+ |
| Tauri App Testing | tauri-mcp-server/* | ~400+ |
| Context/Docs | context7/* | ~500+ |
| Other MCP | gmail/*, nia/*, RepoPrompt/* | ~25+ |

---

## Core Tools (High Priority for Custom Formatting)

### 1. Bash (23,735 uses)
**Current display**: Command and output
**Arguments**: `{ "command": "...", "description": "..." }`
**Output**: Command stdout/stderr
**Enhancement ideas**:
- Syntax highlight command
- Collapsible long outputs
- Exit code badge (already done)
- Distinguish between quick commands vs long-running

### 2. Read (19,988 uses)
**Current display**: File path and content
**Arguments**: `{ "file_path": "...", "offset": N, "limit": N }`
**Output**: File contents with line numbers
**Enhancement ideas**:
- Show file icon based on extension
- Show line range if offset/limit specified
- Syntax highlighting for code files
- Collapse to just filename for very long files

### 3. Edit (12,063 uses)
**Current display**: File path and diff
**Arguments**: `{ "file_path": "...", "old_string": "...", "new_string": "..." }`
**Output**: Success/failure message
**Enhancement ideas**:
- Show unified diff with +/- coloring
- Highlight changed lines
- Show line numbers of change

### 4. Grep (7,808 uses)
**Current display**: Pattern and matches
**Arguments**: `{ "pattern": "...", "path": "...", "output_mode": "..." }`
**Output**: Matching files/lines
**Enhancement ideas**:
- Highlight matched pattern
- Show match count
- Collapsible file groups

### 5. TodoWrite (4,028 uses) ⭐ NEXT TO IMPLEMENT
**Current display**: JSON blob
**Arguments**: `{ "todos": [{ "content": "...", "status": "...", "activeForm": "..." }] }`
**Output**: Confirmation message
**Enhancement ideas**:
- Render as checkbox list
- Show status with icons: ⬜ pending, 🔄 in_progress, ✅ completed
- Show diff from previous state
- Highlight newly added/completed items

### 6. Glob (1,956 uses)
**Current display**: Pattern and matched files
**Arguments**: `{ "pattern": "...", "path": "..." }`
**Output**: List of matching files
**Enhancement ideas**:
- Tree view of matched files
- File count summary

### 7. Write (1,292 uses)
**Current display**: File path
**Arguments**: `{ "file_path": "...", "content": "..." }`
**Output**: Success message
**Enhancement ideas**:
- Show file icon
- Show file size/line count
- Preview first few lines

---

## Task Management Tools

### 8. Task (799 uses)
**Current display**: Agent type and prompt
**Arguments**: `{ "subagent_type": "...", "prompt": "...", "description": "..." }`
**Output**: Agent response
**Enhancement ideas**:
- Show agent icon based on type
- Collapsible agent output
- Status indicator (running/complete)

### 9. TaskOutput (28 uses)
**Current display**: Task ID and output
**Arguments**: `{ "task_id": "..." }`
**Output**: Task result
**Enhancement ideas**:
- Link to original Task invocation

### 10. KillShell (41 uses)
**Current display**: Shell ID
**Arguments**: `{ "shell_id": "..." }`
**Output**: Success message
**Enhancement ideas**:
- Show which command was killed

---

## Planning Tools

### 11. EnterPlanMode (12 uses)
**Current display**: Generic
**Arguments**: `{}`
**Output**: Mode change message
**Enhancement ideas**:
- Planning mode indicator badge

### 12. ExitPlanMode (233 uses)
**Current display**: Generic
**Arguments**: `{}`
**Output**: Plan summary
**Enhancement ideas**:
- Show plan was approved/rejected

---

## User Interaction Tools

### 13. AskUserQuestion (143 uses)
**Current display**: Question and options
**Arguments**: `{ "questions": [{ "question": "...", "options": [...] }] }`
**Output**: User's answer
**Enhancement ideas**:
- Render as interactive UI (read-only in history)
- Show selected option highlighted

### 14. Skill (23 uses)
**Current display**: Skill name
**Arguments**: `{ "skill": "...", "args": "..." }`
**Output**: Skill result
**Enhancement ideas**:
- Skill icon/badge

### 15. SlashCommand (39 uses)
**Current display**: Command name
**Arguments**: Command-specific
**Output**: Command result
**Enhancement ideas**:
- Command badge

---

## Web Tools

### 16. WebSearch (1,070 uses)
**Current display**: Query and results
**Arguments**: `{ "query": "..." }`
**Output**: Search results
**Enhancement ideas**:
- Show as search result cards
- Link previews

### 17. WebFetch (386 uses)
**Current display**: URL and content
**Arguments**: `{ "url": "...", "prompt": "..." }`
**Output**: Fetched content
**Enhancement ideas**:
- Show URL as clickable link
- Show favicon
- Content preview

---

## Browser Automation Tools (MCP)

### Playwright MCP (~200+ uses)
- `browser_click` (98)
- `browser_take_screenshot` (72)
- `browser_navigate` (71)
- `browser_wait_for` (48)
- `browser_snapshot` (41)
- `browser_press_key` (32)
- `browser_evaluate` (22)
- `browser_close` (19)
- `browser_fill_form` (16)
- Others...

**Enhancement ideas**:
- Screenshot preview (inline image)
- Navigation breadcrumb
- Action timeline

### Claude in Chrome (~30 uses)
- `computer` (14)
- `tabs_context_mcp` (5)
- `navigate` (5)
- `read_page` (4)

### Compound Engineering PW (~80 uses)
- `browser_navigate` (32)
- `browser_click` (18)
- Others...

---

## Tauri MCP Tools (~400 uses)

- `webview_execute_js` (179)
- `webview_screenshot` (74)
- `driver_session` (41)
- `read_logs` (36)
- `webview_find_element` (26)
- `webview_keyboard` (21)
- `webview_interact` (12)
- Others...

**Enhancement ideas**:
- App screenshot preview
- Log viewer with filtering
- Element inspector view

---

## Documentation Tools (Context7)

- `get-library-docs` (268)
- `resolve-library-id` (198)

**Enhancement ideas**:
- Library name/version badge
- Docs preview

---

## Recommended Implementation Order

### Phase 1: High-Impact Core Tools
1. **TodoWrite** - Very common, poor current display
2. **Edit** - Common, would benefit from diff view
3. **Read** - Very common, needs better file preview

### Phase 2: Enhanced Core Tools
4. **Grep** - Pattern highlighting
5. **Glob** - Tree view
6. **Write** - File preview

### Phase 3: Task & Planning
7. **Task** - Agent output formatting
8. **AskUserQuestion** - Interactive display

### Phase 4: Web & Browser
9. **WebSearch** - Search cards
10. **WebFetch** - URL preview
11. Browser tools - Screenshots inline

### Phase 5: Specialized
12. Tauri tools
13. Context7 tools
14. Other MCP tools
