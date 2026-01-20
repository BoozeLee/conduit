# Changelog

All notable changes to Conduit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Open source release - Conduit is now free and publicly available

## [0.1.6] - 2025-01-18

### Added
- File viewer with tabs and clickable file paths in chat
- Hover highlighting for clickable file paths
- Slash command menu for quick actions
- Plan/build prompts for all supported models
- Human-readable elapsed time display
- Configurable chat scrollbar

### Fixed
- Chat selection copy alignment
- Relative path resolution in `:open` command
- Footer click context alignment with hint selection
- UTF-8 safe path truncation in file viewer header
- Error display when home directory is unavailable for tilde expansion

## [0.1.5] - 2025-01-10

### Added
- Session import from Claude Code and Codex CLI
- Model selector with `Ctrl+O`
- View mode toggle between Chat and Raw Events

### Fixed
- Codex command output coalescing
- Dialog instructions rendering on bottom border
- NPX fallback detection
- Raw event logging hardening
- Gemini input signature alignment

## [0.1.4] - 2025-01-05

### Added
- Git integration with PR status and branch tracking
- Worktree management support
- Session persistence and resumption

### Fixed
- Tab switching stability improvements
- Token counting accuracy

## [0.1.3] - 2025-01-01

### Added
- Real-time token tracking with cost estimation
- Status bar with session information
- Sidebar toggle with `Ctrl+T`

### Fixed
- Streaming response handling for large outputs
- Input box multi-line support

## [0.1.2] - 2024-12-28

### Added
- Tab-based session management (up to 10 concurrent sessions)
- Keyboard shortcuts for tab navigation
- Session forking with `Alt+Shift+F`

### Fixed
- Agent process cleanup on tab close
- Memory usage optimization

## [0.1.1] - 2024-12-25

### Added
- Codex CLI agent support
- Agent switching within sessions
- Markdown rendering in chat view

### Fixed
- Claude Code event parsing
- Syntax highlighting for code blocks

## [0.1.0] - 2024-12-20

### Added
- Initial release
- Claude Code agent integration
- Basic TUI with chat interface
- Real-time streaming responses
- Terminal-native UI with Ratatui

[Unreleased]: https://github.com/conduit-cli/conduit/compare/v0.1.6...HEAD
[0.1.6]: https://github.com/conduit-cli/conduit/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/conduit-cli/conduit/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/conduit-cli/conduit/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/conduit-cli/conduit/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/conduit-cli/conduit/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/conduit-cli/conduit/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/conduit-cli/conduit/releases/tag/v0.1.0
