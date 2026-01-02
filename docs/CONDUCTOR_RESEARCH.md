# Conductor: Multi-Agent AI Coding Orchestration

> Research compiled: January 2026

## Overview

**Conductor** is a macOS application built by [Melty Labs](https://www.conductor.build/) that orchestrates multiple AI coding agents (Claude Code, Codex) working in parallel across your repository. It treats AI assistants like a real engineering team—launching multiple threads simultaneously, managing git worktrees automatically, and enabling diff-based code review.

**Current Version:** 0.28.6

**Founders:**
- Charlie Holtz (former Replicate growth lead, quantitative developer at Point72)
- Jackson de Campos (Netflix ML infrastructure engineer)

Both met at Brown University. Conductor is a [Y Combinator company](https://www.ycombinator.com/companies/conductor).

---

## The "Conductor" Paradigm

The term "conductor" represents a broader shift in how developers work with AI—evolving from hands-on coders to orchestrators who:

1. **Delegate** tasks to multiple AI agents
2. **Provide** high-level guidance and specifications
3. **Review** and verify results
4. **Merge** approved changes

This mirrors the historical shift from assembly to high-level languages to frameworks—each abstraction layer increasing developer leverage.

### Conductor vs. Orchestrator Distinction

| Aspect | Conductor (Single Agent) | Orchestrator (Multi-Agent) |
|--------|--------------------------|---------------------------|
| **Scope** | Micro-level tasks | Macro-level goals |
| **Autonomy** | Requires constant prompts | High-autonomy execution |
| **Tempo** | Synchronous | Asynchronous |
| **Traceability** | Often ephemeral | Persistent artifacts (branches, PRs) |
| **Human Effort** | Continuous engagement | Front-loaded (spec) + back-loaded (review) |

---

## Key Features

### 1. Parallel Agent Execution
Run multiple Claude Code or Codex instances concurrently on different branches. Experiment with different approaches without waiting for sequential completion.

### 2. Git Worktree Isolation
Each agent gets its own isolated git worktree:
- Prevents merge conflicts between agents
- Enables clean branch separation
- Automatic setup and teardown

### 3. Visual Thread Tracking
Dashboard showing all active threads simultaneously:
- Progress indicators
- Diffs in real-time
- Test results
- No context switching between windows

### 4. Diff-First Review Model
Review only modified code instead of scanning entire files. This scales review effort to actual changes rather than repository size.

### 5. Linear Integration
Start work directly from Linear issues—connect your task management to your AI workforce.

### 6. PR Automation
Create pull requests with testing and feedback loops directly from the Conductor interface.

---

## How It Works

### Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CONDUCTOR                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│   │ Agent 1  │    │ Agent 2  │    │ Agent 3  │    ...         │
│   │ (Claude) │    │ (Codex)  │    │ (Claude) │                │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘                │
│        │               │               │                       │
│   ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐                │
│   │ Worktree │    │ Worktree │    │ Worktree │                │
│   │ branch-1 │    │ branch-2 │    │ branch-3 │                │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘                │
│        │               │               │                       │
│        └───────────────┼───────────────┘                       │
│                        │                                        │
│                  ┌─────▼─────┐                                 │
│                  │  Review   │                                 │
│                  │  & Merge  │                                 │
│                  └───────────┘                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Process

1. **Repository Setup**
   - Add your GitHub repository
   - Conductor clones it locally

2. **Agent Deployment**
   - Click to spin up a new Claude Code or Codex agent
   - Each agent gets an isolated workspace (git worktree)
   - Assign tasks via natural language

3. **Parallel Execution**
   - Multiple agents work simultaneously
   - Each on their own branch
   - No interference between tasks

4. **Oversight & Integration**
   - Monitor progress in the dashboard
   - Review diffs as they're generated
   - Merge approved changes
   - Create PRs directly

---

## Installation & Setup

### System Requirements

| Requirement | Status |
|-------------|--------|
| macOS | Required |
| Apple Silicon | Required (Intel in development) |
| Windows/Linux | Coming soon |
| GitHub repositories | Required (local repos not supported) |

### Prerequisites

1. **GitHub CLI Authentication**
   ```bash
   gh auth status
   ```
   Ensure you have terminal access to GitHub.

2. **Claude Code Setup**
   ```bash
   # Install Claude Code if needed
   # Then authenticate:
   claude /login
   ```

### Installation Steps

1. Visit [conductor.build](https://conductor.build)
2. Click "Download Conductor"
3. Drag the application to your Applications folder
4. Launch the app
5. Conductor automatically detects your Claude Code login

### Authentication

Conductor integrates with your existing Claude Code authentication:
- Claude Pro subscription
- Claude Max plan
- API key (configured in Claude Code)

No separate billing—you pay only for the underlying AI service APIs.

---

## Pricing

**Completely free.**

- No subscription
- No tiered pricing
- No feature gates
- Pay only for your AI API usage (Claude/OpenAI)

---

## Use Cases

### Ideal Scenarios for Parallel Agents

| Use Case | Why It Works |
|----------|--------------|
| **Research & Proof of Concepts** | Explore multiple approaches simultaneously |
| **System Understanding** | Agents document different parts of codebase |
| **Low-Stakes Maintenance** | Fix deprecation warnings, minor issues in parallel |
| **Feature Variants** | Test different implementations of same feature |
| **Carefully Specified Work** | Detailed specs reduce review effort |

### Best Practices

1. **Clear Task Specifications**
   - Vague instructions yield subpar results
   - Provide exact implementation details when possible

2. **Task Isolation**
   - Assign non-overlapping work to each agent
   - Avoid having multiple agents touch the same files

3. **Incremental Review**
   - Review changes as they come in
   - Don't let a backlog build up

4. **Start Small**
   - Begin with 2-3 agents
   - Scale up as you learn the workflow

---

## Comparison with Similar Tools

### Conductor vs. Claude Squad

| Feature | Conductor | Claude Squad |
|---------|-----------|--------------|
| **Interface** | Native macOS app | Terminal-based (tmux) |
| **Platform** | macOS only | Cross-platform |
| **Agents** | Claude Code, Codex | Claude Code, Aider, Codex, OpenCode, Amp |
| **Isolation** | Git worktrees | tmux + git worktrees |
| **License** | Commercial (free) | Open source (AGPL-3.0) |
| **Visual Dashboard** | Yes | No (terminal UI) |
| **GitHub Integration** | Deep (PR creation) | Basic |

### Other Tools in the Space

| Tool | Description |
|------|-------------|
| **[Claude Squad](https://github.com/smtg-ai/claude-squad)** | Open-source terminal multiplexer for AI agents |
| **[code-conductor](https://github.com/ryanmac/code-conductor)** | GitHub-native orchestration for Claude Code |
| **GitHub Copilot Agent** | Autonomous coding via GitHub issues |
| **Google Jules** | Cloud-based autonomous coding agent |
| **OpenAI Codex Cloud** | Asynchronous multi-task execution |
| **Cursor Background Agents** | Multi-agent orchestration in Cursor IDE |

---

## Limitations & Trade-offs

### Current Limitations

| Limitation | Details |
|------------|---------|
| **Platform** | macOS only (Apple Silicon required) |
| **Repository Source** | GitHub only (no local repos) |
| **Docker Support** | Incomplete |
| **Submodule Support** | Limited |
| **Dependency Duplication** | Can occur in complex projects |

### Challenges with Multi-Agent Workflows

1. **Review Bottleneck**
   - Human review capacity becomes the limiting factor
   - Multiple agents can outpace a single reviewer

2. **Coordination Conflicts**
   - Risk of duplicated work if tasks overlap
   - Mitigated by clear task separation

3. **Context Sharing**
   - Agents don't share context with each other
   - Each operates independently

4. **Debugging Complexity**
   - When agents fail, diagnosis can be complex
   - May require reverting to single-agent mode

---

## Trusted By

Engineers at major companies including:
- Linear
- Vercel
- Notion
- Stripe
- Life360

---

## Resources

### Official Links
- **Website:** [conductor.build](https://www.conductor.build/)
- **Documentation:** [docs.conductor.build](https://docs.conductor.build/)
- **GitHub (Melty Labs):** [github.com/meltylabs](https://github.com/meltylabs)

### Further Reading
- [Conductors to Orchestrators: The Future of Agentic Coding](https://addyo.substack.com/p/conductors-to-orchestrators-the-future) - Addy Osmani
- [Embracing the Parallel Coding Agent Lifestyle](https://simonwillison.net/2025/Oct/5/parallel-coding-agents/) - Simon Willison
- [How to Run Claude Code in Parallel](https://ona.com/stories/parallelize-claude-code) - Ona (formerly Gitpod)

---

## Quick Start Checklist

- [ ] Verify macOS with Apple Silicon
- [ ] Install and authenticate GitHub CLI (`gh auth status`)
- [ ] Install and authenticate Claude Code (`claude /login`)
- [ ] Download Conductor from [conductor.build](https://conductor.build)
- [ ] Connect your first GitHub repository
- [ ] Launch your first parallel agents!

---

*This document was compiled from official Conductor documentation and industry analysis of multi-agent coding workflows.*
