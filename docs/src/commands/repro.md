# repro

Create, inspect, and run **Repro Bundles** (deterministic snapshots).

See also: [Repro Bundles (Deterministic Snapshots)](../advanced/repro-bundles.md)

## Usage

```bash
conduit repro <SUBCOMMAND>
```

## Subcommands

### export

Create a repro bundle zip from the current data directory:

```bash
conduit repro export --out PATH [--mode local|shareable]
```

Notes:

- The bundle always includes a database snapshot.
- If `<data_dir>/repro/tape.jsonl` exists, it is included in the bundle.

### inspect

Print bundle metadata:

```bash
conduit repro inspect PATH
```

### extract

Extract a bundle into a Conduit-compatible data directory layout on disk:

```bash
conduit repro extract PATH --out-dir DIR [--overwrite]
```

This writes:

- `DIR/conduit.db`
- `DIR/repro/meta.json`
- `DIR/repro/tape.jsonl`
- `DIR/repro/workspace.patch` (if present)

### run

Run Conduit from a bundle (uses a temporary data directory):

```bash
conduit repro run PATH [--ui tui|web] [--host HOST] [--port PORT] [--require-tools] [--continue-live]
```

Behavior:

- Default UI is `tui`.
- During replay, the app is read-only (inputs are blocked).
- `--continue-live` replays once on startup and then switches back to live mode so you can keep using a real agent.
- By default, tool checks are skipped so replay doesn't get stuck on missing binaries. Use `--require-tools` if you want the usual tool prompts.

## Examples

```bash
# Record a scenario into ~/.conduit/repro/tape.jsonl
CONDUIT_REPRO_MODE=record conduit

# Export bundle (local mode)
conduit repro export --out /tmp/conduit.repro.zip --mode local

# Replay in TUI (read-only)
conduit repro run /tmp/conduit.repro.zip

# Replay then continue live (still uses a temp data dir)
conduit repro run /tmp/conduit.repro.zip --continue-live

# Extract to a persistent directory and replay using --data-dir
conduit repro extract /tmp/conduit.repro.zip --out-dir ./repro-data --overwrite
CONDUIT_REPRO_MODE=replay conduit --data-dir ./repro-data
```

