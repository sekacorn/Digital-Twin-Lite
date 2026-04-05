#!/bin/bash
# Digital Twin Lite — Setup Script (Linux/macOS/Git Bash)

set -e

echo "=================================="
echo "  Digital Twin Lite — Setup"
echo "=================================="
echo ""

# Backend setup
echo "[1/4] Creating Python virtual environment..."
cd backend
python3 -m venv venv 2>/dev/null || python -m venv venv
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate

echo "[2/4] Installing backend dependencies..."
pip install -r requirements.txt --quiet

echo "[3/4] Running backend tests..."
python -m pytest tests/ -v

cd ..

# Frontend setup
echo "[4/4] Installing frontend dependencies..."
cd frontend
npm install

echo ""
echo "=================================="
echo "  Setup complete!"
echo "=================================="
echo ""
echo "To run the app:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend"
echo "    source venv/bin/activate  # or venv/Scripts/activate on Windows"
echo "    python -m uvicorn app.main:app --reload"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "  Then open http://localhost:5173"
echo ""
