//! Session management module
//!
//! This module provides utilities for discovering and importing
//! sessions from external agents (Claude Code and Codex CLI).

pub mod import;

pub use import::{discover_all_sessions, discover_claude_sessions, discover_codex_sessions, ExternalSession};
