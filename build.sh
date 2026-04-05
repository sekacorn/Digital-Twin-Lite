#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=================================="
echo "  Digital Twin Lite - Build"
echo "=================================="
echo

cd "$ROOT_DIR/frontend"
echo "[1/3] Installing frontend dependencies..."
npm install

echo "[2/3] Creating production frontend build..."
npm run build

cd "$ROOT_DIR/backend"
echo "[3/3] Running backend test suite..."
if [[ -n "${PYTHON_CMD:-}" ]]; then
  "$PYTHON_CMD" -m pytest -q
else
  python3 -m pytest -q 2>/dev/null || python -m pytest -q
fi

echo
echo "Build complete. Start the production app with ./run.sh"
