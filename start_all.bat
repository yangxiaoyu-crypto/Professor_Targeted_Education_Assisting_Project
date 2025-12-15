@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM Teaching AI Assistant - Complete Startup Script
REM Function: Auto start knowledge base rebuild, backend, frontend
REM ============================================================

echo.
echo ============================================================
echo      Teaching AI Assistant - Complete Startup
echo ============================================================
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed. Please install Node.js 16+
    pause
    exit /b 1
)
echo OK: Node.js installed

REM Check if Python is installed
echo [2/5] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not installed. Please install Python 3.8+
    pause
    exit /b 1
)
echo OK: Python installed

REM Check backend dependencies
echo [3/5] Checking backend dependencies...
cd backend
if not exist "requirements.txt" (
    echo ERROR: requirements.txt not found
    cd ..
    pause
    exit /b 1
)
echo OK: requirements.txt found

REM Start knowledge base rebuild
echo.
echo [4/5] Starting knowledge base rebuild...
echo.
echo NOTE: First run will rebuild knowledge base index (5-15 minutes)
echo Processing 154 documents, generating 43,859 document blocks
echo.

REM Create new window to run rebuild script
start "Knowledge Base Rebuild" cmd /k "cd backend && python rebuild_knowledge_base.py && echo. && echo OK: Knowledge base rebuild complete! && pause"

REM Wait for user confirmation
echo.
echo Please wait for knowledge base rebuild to complete...
echo When you see "OK: Knowledge base rebuild complete!" press any key to continue
pause

REM Start backend service
echo.
echo [5/5] Starting backend service...
echo.
echo Starting backend service in new window
echo Access: http://localhost:5001
echo.

start "Backend Service - Knowledge Base RAG" cmd /k "cd backend && python knowledge_service.py"

REM Wait for backend service to start
echo.
echo Waiting for backend service to start (about 3 seconds)...
timeout /t 3 /nobreak

REM Start frontend application
echo.
echo Starting frontend application...
echo.
echo Access: http://localhost:3000
echo Demo account: demo / 123456
echo.

cd ..
start "Frontend Application - Teaching AI Assistant" cmd /k "npm run dev"

REM Display startup complete information
echo.
echo ============================================================
echo                  Startup Complete!
echo ============================================================
echo.
echo Frontend App:  http://localhost:3000
echo Backend Service: http://localhost:5001
echo Demo Account: demo / 123456
echo.
echo Windows opened:
echo - Knowledge base rebuild window
echo - Backend service window
echo - Frontend application window
echo.
echo Tips:
echo - Open http://localhost:3000 in your browser
echo - Login with demo/123456
echo - Keep all windows open
echo - Closing any window will stop the service
echo.
echo ============================================================
echo.

pause
