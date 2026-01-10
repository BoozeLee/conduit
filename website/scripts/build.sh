#!/bin/bash
set -e

# Install mdbook if not present
if ! command -v mdbook &> /dev/null; then
  echo "Installing mdbook..."
  curl -sSL https://github.com/rust-lang/mdBook/releases/download/v0.4.40/mdbook-v0.4.40-x86_64-unknown-linux-gnu.tar.gz | tar -xz
  chmod +x mdbook
  export PATH="$PWD:$PATH"
fi

# Build docs
echo "Building documentation..."
cd ..
mdbook build docs
cp -r docs/book website/public/docs
cd website

# Build Astro site
echo "Building website..."
npx astro build
