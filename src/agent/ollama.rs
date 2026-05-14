use async_trait::async_trait;
use futures::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use crate::agent::error::AgentError;
use crate::agent::events::{AgentEvent, AssistantMessageEvent};
use crate::agent::runner::{AgentHandle, AgentInput, AgentRunner, AgentStartConfig, AgentType};
use crate::agent::session::SessionId;
use std::path::PathBuf;
use tracing::{debug, error};

pub struct OllamaRunner {
    model: String,
    base_url: String,
}

impl OllamaRunner {
    pub fn new(model: String, base_url: String) -> Self {
        Self { model, base_url }
    }
}

#[async_trait]
impl AgentRunner for OllamaRunner {
    fn agent_type(&self) -> AgentType {
        AgentType::Ollama
    }

    async fn start(&self, _config: AgentStartConfig) -> Result<AgentHandle, AgentError> {
        let (event_tx, event_rx) = mpsc::channel(100);
        let (input_tx, mut input_rx) = mpsc::channel(100);
        let client = Client::new();
        let model = self.model.clone();
        let url = format!("{}/api/chat", self.base_url);

        tokio::spawn(async move {
            while let Some(input) = input_rx.recv().await {
                // Use a placeholder or appropriate type for local models
                if let AgentInput::CodexPrompt { text, .. } = input {
                    let payload = serde_json::json!({
                        "model": model,
                        "messages": [{"role": "user", "content": text}],
                        "stream": true
                    });


                    match client.post(&url).json(&payload).send().await {
                        Ok(resp) => {
                            let mut stream = resp.bytes_stream();
                            while let Some(item) = stream.next().await {
                                if let Ok(bytes) = item {
                                    if let Ok(json) = serde_json::from_slice::<serde_json::Value>(&bytes) {
                                        if let Some(content) = json["message"]["content"].as_str() {
                                            let _ = event_tx.send(AgentEvent::AssistantMessage(AssistantMessageEvent {
                                                text: content.to_string(),
                                                is_final: false,
                                            })).await;
                                        }
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            error!("Ollama request error: {:?}", e);
                        }
                    }
                }
            }
        });

        // PID 0 is a safe placeholder for non-process agents
        Ok(AgentHandle::new(event_rx, 0, Some(input_tx)))
    }

    async fn send_input(&self, handle: &AgentHandle, input: AgentInput) -> Result<(), AgentError> {
        if let Some(ref tx) = handle.input_tx {
            tx.send(input).await.map_err(|_| AgentError::RunnerError)?;
        }
        Ok(())
    }

    async fn stop(&self, _handle: &AgentHandle) -> Result<(), AgentError> {
        Ok(())
    }

    async fn kill(&self, _handle: &AgentHandle) -> Result<(), AgentError> {
        Ok(())
    }

    fn is_available(&self) -> bool {
        true
    }

    fn binary_path(&self) -> Option<PathBuf> {
        None
    }
}
