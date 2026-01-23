# Repro Bundles (Deterministic Snapshots)

Conduit sessions can be expensive and non-deterministic to reproduce because they depend on:

- An LLM (and its evolving context)
- External tools (git, shell, CLIs)
- Your local workspace state
- A persistent database (`conduit.db`)

Repro Bundles are a debugging feature designed to make reproducing issues easier by capturing:

- A **database snapshot** (so Conduit boots into the same persisted app state)
- A **tape** of recorded agent interactions (events + inputs) that can be replayed deterministically

This lets you "freeze" a real scenario and re-run Conduit from that snapshot later.

## Key Concepts

### Data Directory Layout

Conduit stores state under its data directory (default: `~/.conduit`).

Repro adds a `repro/` folder:

```
~/.conduit/
  conduit.db
  repro/
    meta.json
    tape.jsonl
    workspace.patch   (optional)
```

### Tape (`tape.jsonl`)

The tape is a JSONL file with:

- A header line (`type: header`)
- Many entry lines (`type: entry`) containing either:
  - `AgentEvent` (things the agent emitted)
  - `AgentInput` (inputs Conduit sent to the agent)

The tape is **append-only** while recording.

### Repro Bundle (`.zip`)

A repro bundle is a zip file that packages:

- `meta.json` (bundle metadata)
- `tape.jsonl` (recording)
- `db.sqlite` (SQLite DB snapshot)
- `workspace.patch` (optional, reserved for future use)

When you `extract` or `run` a bundle, it is translated into Conduit's on-disk layout:

- `db.sqlite` becomes `conduit.db`
- bundle artifacts are placed under `repro/`

## Common Workflows

### 1) Record a Real Scenario, Then Export

Record while you reproduce the issue manually (TUI or Web):

```bash
CONDUIT_REPRO_MODE=record conduit
```

This writes a tape to:

- `~/.conduit/repro/tape.jsonl` (or `--data-dir` if you use a custom one)

Then export a bundle:

```bash
conduit repro export --out /tmp/conduit.repro.zip --mode local
```

### 2) Replay Offline From a Bundle (Read-Only)

Run Conduit using the bundle's DB snapshot and tape:

```bash
conduit repro run /tmp/conduit.repro.zip
```

Replay mode is **read-only**:

- TUI prompt submission is blocked during replay
- WebSocket `send_input` / control responses are rejected during replay
- Permission prompts are not shown; replay uses recorded artifacts

### 3) Replay, Then Continue With a Live Agent

If you want to replay first and then keep working with a real agent:

```bash
conduit repro run /tmp/conduit.repro.zip --continue-live
```

Notes:

- `repro run` uses a **temporary** data directory. Any DB/tape changes you make after replay will be lost when the process exits.
- If you need persistence, use `repro extract` (below) and run with `--data-dir`.

### 4) Extract a Bundle to a Persistent Data Directory

Extract the bundle to a directory on disk:

```bash
conduit repro extract /tmp/conduit.repro.zip --out-dir ./repro-data --overwrite
```

Then run Conduit against that data directory:

```bash
CONDUIT_REPRO_MODE=replay conduit --data-dir ./repro-data
```

To replay and then continue live using environment variables:

```bash
CONDUIT_REPRO_MODE=replay CONDUIT_REPRO_CONTINUE_LIVE=1 conduit --data-dir ./repro-data
```

## Limitations and Safety Notes

### Determinism Boundaries

Repro Bundles improve determinism, but they do not capture everything:

- External filesystem state (your repo checkout, untracked files, etc.)
- External commands and their environment
- Network responses
- The LLM's internal state and any non-determinism in the underlying CLI/tooling

The goal is to make it easy to reproduce Conduit-visible behavior (DB state + event stream), not to fully virtualize the environment.

### "Shareable" Bundles Are Not Fully Sanitized Yet

`--mode shareable` currently performs **best-effort scrubbing of tape text fields only**.

It does **not** sanitize the database snapshot. Treat bundles as potentially sensitive unless you manually audit and scrub them.

### DB Export Consistency

`conduit repro export` currently snapshots the DB using a simple file copy. For best results:

- Run it while Conduit is not actively writing to the DB.
- Prefer exporting from a quiescent state (no active sessions writing state).

## Where to Look in the Code

- Repro bundle + tape primitives: `src/repro/`
- Recording/replay runner wrappers: `src/agent/recording.rs`, `src/agent/replay.rs`
- TUI wiring: `src/ui/app.rs`
- Web wiring: `src/web/ws/handler.rs`

