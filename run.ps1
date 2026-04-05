$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDist = Join-Path $root "frontend\dist"

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

if (-not (Test-Path $frontendDist)) {
    Write-Host "No frontend production build found. Running .\build.ps1 first..." -ForegroundColor Yellow
    & (Join-Path $root "build.ps1")
}

$backendDir = Join-Path $root "backend"
$pythonCmd = Get-PythonCommand
$port = if ($env:PORT) { $env:PORT } else { "8000" }

Set-Location $backendDir

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Digital Twin Lite - Run"        -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Serving the built frontend and API on http://localhost:$port" -ForegroundColor Green
Write-Host ""

& $pythonCmd -m uvicorn app.main:app --host 0.0.0.0 --port $port
