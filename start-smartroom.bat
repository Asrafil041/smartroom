@echo off
setlocal
set ROOT=%~dp0

echo Starting Smart Room backend and frontend...
echo.

start "SmartRoom Backend" powershell -NoExit -Command "Set-Location '%ROOT%backend'; & '.\.venv\Scripts\python.exe' manage.py runserver 0.0.0.0:8000"
start "SmartRoom Frontend" powershell -NoExit -Command "Set-Location '%ROOT%backend\frontend'; npm run dev"

echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this launcher window...
pause >nul
