#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT_VALUE="${PORT:-8000}"

if [[ ! -d "$ROOT_DIR/frontend/dist" ]]; then
  echo "No frontend production build found. Running ./build.sh first..."
  "$ROOT_DIR/build.sh"
fi

cd "$ROOT_DIR/backend"

echo "=================================="
echo "  Digital Twin Lite - Run"
echo "=================================="
echo
echo "Serving the built frontend and API on http://localhost:${PORT_VALUE}"
echo

if [[ -n "${PYTHON_CMD:-}" ]]; then
  "$PYTHON_CMD" -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT_VALUE"
elif [[ -x "$ROOT_DIR/backend/venv/bin/python" ]]; then
  "$ROOT_DIR/backend/venv/bin/python" -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT_VALUE"
elif [[ -x "$ROOT_DIR/backend/venv/Scripts/python.exe" ]]; then
  "$ROOT_DIR/backend/venv/Scripts/python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT_VALUE"
else
  python3 -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT_VALUE" 2>/dev/null || python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT_VALUE"
fi
