#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: bash setup.sh <fal-api-key>"
  exit 1
fi

KEY_DIR="$HOME/.config/fal"
KEY_FILE="$KEY_DIR/key"

mkdir -p "$KEY_DIR"
printf '%s' "$1" > "$KEY_FILE"
chmod 600 "$KEY_FILE"
echo "API key saved to $KEY_FILE"
