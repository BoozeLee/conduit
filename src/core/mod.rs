//! Core module containing shared infrastructure for Conduit.
//!
//! This module provides the foundational components used by both the TUI and web interfaces:
//! - Database access and DAO stores
//! - Agent runners (Claude, Codex, Gemini)
//! - Configuration and tool availability
//! - Worktree management

mod nexus_core;
pub mod dto;
mod repo_settings;
pub mod services;

pub use nexus_core::NexusCore;
pub use repo_settings::{resolve_repo_workspace_settings, RepoWorkspaceSettings};
