$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-PythonCommand {
    if ($env:PYTHON_CMD) {
        return $env:PYTHON_CMD
    }

    if ($env:PYTHON) {
        return $env:PYTHON
    }

    $backendPython = Join-Path $root "backend\venv\Scripts\python.exe"
    if (Test-Path $backendPython) {
        return $backendPython
    }

    $localPython = Get-ChildItem (Join-Path $env:LOCALAPPDATA "Python") -Recurse -Filter python.exe -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notlike "*\\Scripts\\python.exe" } |
        Sort-Object FullName -Descending |
        Select-Object -First 1
    if ($localPython) {
        return $localPython.FullName
    }

    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCmd) {
        return $pythonCmd.Source
    }

    $pyCmd = Get-Command py -ErrorAction SilentlyContinue
    if ($pyCmd) {
        return $pyCmd.Source
    }

    throw "Python was not found. Run .\setup.ps1 first, install Python, or set PYTHON_CMD."
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Digital Twin Lite - Build"      -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Set-Location (Join-Path $root "frontend")

$pythonCmd = Get-PythonCommand

Write-Host "[1/3] Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    throw "Command failed during: [1/3] Installing frontend dependencies..."
}

Write-Host "[2/3] Creating production frontend build..." -ForegroundColor Yellow
cmd /c npm run build
if ($LASTEXITCODE -ne 0) {
    throw "Command failed during: [2/3] Creating production frontend build..."
}

Set-Location (Join-Path $root "backend")

Write-Host "[3/3] Running backend test suite..." -ForegroundColor Yellow
& $pythonCmd -m pytest -q -p no:cacheprovider
if ($LASTEXITCODE -ne 0) {
    throw "Command failed during: [3/3] Running backend test suite..."
}

Write-Host ""
Write-Host "Build complete. Start the production app with .\run.ps1" -ForegroundColor Green
