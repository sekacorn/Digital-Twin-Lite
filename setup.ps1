# Digital Twin Lite — Setup Script (Windows PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Digital Twin Lite - Setup"        -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Backend setup
Write-Host "[1/4] Creating Python virtual environment..." -ForegroundColor Yellow
Set-Location backend
py -m venv venv
& .\venv\Scripts\Activate.ps1

Write-Host "[2/4] Installing backend dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet

Write-Host "[3/4] Running backend tests..." -ForegroundColor Yellow
python -m pytest tests/ -v

Set-Location ..

# Frontend setup
Write-Host "[4/4] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Setup complete!"                  -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "To run the app:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "    cd backend"
Write-Host "    .\venv\Scripts\Activate.ps1"
Write-Host "    python -m uvicorn app.main:app --reload"
Write-Host ""
Write-Host "  Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "    cd frontend"
Write-Host "    npm run dev"
Write-Host ""
Write-Host "  Then open http://localhost:5173" -ForegroundColor Green
Write-Host ""
