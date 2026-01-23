# conduit

The main Conduit TUI application.

## Usage

```bash
conduit [OPTIONS]
```

## Options

| Option | Description |
|--------|-------------|
| `--data-dir PATH` | Custom data directory (default: `~/.conduit`) |
| `--help` | Show help message |
| `--version` | Show version |

## Examples

```bash
# Start Conduit with default settings
conduit

# Use a custom data directory
conduit --data-dir ~/my-conduit-data
```

## Environment

Conduit uses the following environment variables:
- `HOME` — For default data directory location
- `PATH` — For finding agent binaries
- `CONDUIT_REPRO_MODE` — Set to `record` or `replay` to enable repro recording/replay
- `CONDUIT_REPRO_CONTINUE_LIVE` — If `CONDUIT_REPRO_MODE=replay`, set to `1` to switch back to live mode after startup replay

## Data Directory

The data directory contains:
- `config.toml` — Configuration
- `conduit.db` — Session database
- `logs/` — Application logs
- `workspaces/` — Workspace data
- `themes/` — Custom themes
- `repro/` — Repro bundle artifacts (tape + metadata)
