#!/bin/bash

# Get list of staged Rust files that need clippy check
CHANGED_FILES=$(git diff --cached --name-only | grep -E "\.rs$")

if [ -n "$CHANGED_FILES" ]; then
    echo "Running clippy with autofix for changed Rust files:"
    echo "$CHANGED_FILES"
    cargo clippy --fix --allow-dirty --allow-staged -- -D warnings && cargo clippy -- -D warnings
else
    echo "No Rust files changed, skipping clippy check"
    exit 0
fi
