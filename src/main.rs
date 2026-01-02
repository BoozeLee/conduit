use anyhow::Result;
use conduit::{App, Config};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::WARN.into()),
        )
        .with_writer(std::io::stderr)
        .init();

    // Create config
    let config = Config::default();

    // Create and run app
    let mut app = App::new(config);
    app.run().await
}
