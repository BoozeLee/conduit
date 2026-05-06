//! Path utilities for Conduit data directories

use std::path::PathBuf;
use std::sync::OnceLock;

/// Global storage for custom data directory path
static DATA_DIR: OnceLock<PathBuf> = OnceLock::new();

/// Initialize the data directory with an optional custom path.
/// Must be called early in main() before any other path functions are used.
/// If custom_path is None, uses the default ~/.nexus location.
pub fn init_data_dir(custom_path: Option<PathBuf>) {
    let path = custom_path.unwrap_or_else(default_data_dir);
    // Log a debug message if already set (shouldn't happen in normal usage)
    if DATA_DIR.set(path.clone()).is_err() {
        let existing = DATA_DIR
            .get()
            .map(|p| p.display().to_string())
            .unwrap_or_else(|| "<unknown>".to_string());
        tracing::debug!(
            path = %path.display(),
            existing = %existing,
            "Data directory already initialized"
        );
    }
}

/// Get the default data directory path (~/.nexus)
fn default_data_dir() -> PathBuf {
    dirs::home_dir()
        .map(|h| h.join(".nexus"))
        .unwrap_or_else(|| PathBuf::from(".nexus"))
}

/// Get the base Conduit data directory.
/// Returns the custom path if set via init_data_dir(), otherwise ~/.nexus
pub fn data_dir() -> PathBuf {
    DATA_DIR.get().cloned().unwrap_or_else(default_data_dir)
}

/// Get the database file path (~/.nexus/nexus.db)
pub fn database_path() -> PathBuf {
    data_dir().join("nexus.db")
}

/// Get the logs directory (~/.nexus/logs)
pub fn logs_dir() -> PathBuf {
    data_dir().join("logs")
}

/// Get the default log file path (~/.nexus/logs/nexus.log)
pub fn log_file_path() -> PathBuf {
    logs_dir().join("nexus.log")
}

/// Get the workspaces directory (~/.nexus/workspaces)
pub fn workspaces_dir() -> PathBuf {
    data_dir().join("workspaces")
}

/// Migrate old worktrees folder to workspaces folder if needed
///
/// This is a one-time migration for users upgrading from older versions.
/// If ~/.nexus/worktrees exists and ~/.nexus/workspaces doesn't,
/// we rename the folder.
pub fn migrate_worktrees_to_workspaces() {
    let old_path = data_dir().join("worktrees");
    let new_path = data_dir().join("workspaces");

    if old_path.exists() && !new_path.exists() {
        match std::fs::rename(&old_path, &new_path) {
            Ok(()) => {
                tracing::info!(
                    old = %old_path.display(),
                    new = %new_path.display(),
                    "Migrated worktrees folder to workspaces"
                );
            }
            Err(e) => {
                tracing::warn!(
                    old = %old_path.display(),
                    new = %new_path.display(),
                    error = %e,
                    "Failed to migrate worktrees folder to workspaces"
                );
            }
        }
    }
}

/// Get the config file path (~/.nexus/config.toml)
pub fn config_path() -> PathBuf {
    data_dir().join("config.toml")
}
