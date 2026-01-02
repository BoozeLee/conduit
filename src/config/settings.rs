use std::path::PathBuf;

use crate::agent::AgentType;

/// Application configuration
#[derive(Debug, Clone)]
pub struct Config {
    /// Default agent type for new sessions
    pub default_agent: AgentType,
    /// Working directory for agent operations
    pub working_dir: PathBuf,
    /// Maximum number of tabs allowed
    pub max_tabs: usize,
    /// Show token usage in status bar
    pub show_token_usage: bool,
    /// Show estimated cost in status bar
    pub show_cost: bool,
    /// Default allowed tools for Claude
    pub claude_allowed_tools: Vec<String>,
    /// Claude model pricing (input tokens per $1M)
    pub claude_input_cost_per_million: f64,
    /// Claude model pricing (output tokens per $1M)
    pub claude_output_cost_per_million: f64,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            default_agent: AgentType::Claude,
            working_dir: std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
            max_tabs: 10,
            show_token_usage: true,
            show_cost: true,
            claude_allowed_tools: vec![
                "Read".into(),
                "Edit".into(),
                "Write".into(),
                "Bash".into(),
                "Glob".into(),
                "Grep".into(),
            ],
            // Claude Sonnet 3.5 pricing
            claude_input_cost_per_million: 3.0,
            claude_output_cost_per_million: 15.0,
        }
    }
}

impl Config {
    pub fn with_working_dir(mut self, dir: PathBuf) -> Self {
        self.working_dir = dir;
        self
    }

    pub fn with_default_agent(mut self, agent: AgentType) -> Self {
        self.default_agent = agent;
        self
    }

    /// Calculate cost for given token usage
    pub fn calculate_cost(&self, input_tokens: i64, output_tokens: i64) -> f64 {
        let input_cost = (input_tokens as f64 / 1_000_000.0) * self.claude_input_cost_per_million;
        let output_cost = (output_tokens as f64 / 1_000_000.0) * self.claude_output_cost_per_million;
        input_cost + output_cost
    }
}
