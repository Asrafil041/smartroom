$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root 'backend'
$frontendPath = Join-Path $backendPath 'frontend'
$pythonPath = Join-Path $backendPath '.venv\Scripts\python.exe'

if (-not (Test-Path $pythonPath)) {
    throw "Python virtualenv not found at $pythonPath"
}

Write-Host "Starting Smart Room backend and frontend..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$backendPath'; & '$pythonPath' manage.py runserver 0.0.0.0:8000"
)

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$frontendPath'; npm run dev"
)

Write-Host "Backend : http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
