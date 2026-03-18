@echo off
title LeadHunter
echo.
echo  ===================================
echo    LeadHunter - Intent Discovery
echo  ===================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo         Download from https://python.org
    pause
    exit /b 1
)

:: Navigate to backend directory
cd /d "%~dp0backend"

:: Create venv if not exists
if not exist "venv" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
)

:: Activate venv
call venv\Scripts\activate.bat

:: Install dependencies
echo [2/3] Installing dependencies...
pip install -r requirements.txt --quiet

:: Check .env
if not exist ".env" (
    echo.
    echo [WARNING] No .env file found!
    echo          Copying .env.example to .env ...
    copy .env.example .env >nul
    echo          Please edit backend\.env and add your API keys.
    echo.
    echo          GEMINI_API_KEY: https://aistudio.google.com/apikey
    echo          SERPAPI_KEY:    https://serpapi.com/manage-api-key
    echo.
    pause
)

:: Start server
echo [3/3] Starting LeadHunter server...
echo.
echo  Open in browser: http://localhost:8000
echo  Press Ctrl+C to stop
echo.

start "" http://localhost:8000
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
