@echo off
color 0A
title J.A.R.V.I.S. Launcher

echo.
echo  =============================================
echo    J.A.R.V.I.S. - AI Assistant Launcher
echo  =============================================
echo.

:: -----------------------------------------------
:: STEP 1: Check for .env and create if not found
:: -----------------------------------------------
if not exist "backend\.env" (
    echo  [!] No .env file found in backend folder.
    echo.
    set /p APIKEY= Enter your Google Gemini API Key: 
    echo GOOGLE_API_KEY=%APIKEY%> backend\.env
    echo  [OK] .env file created!
    echo.
) else (
    echo  [OK] .env file already exists.
    echo.
)

:: -----------------------------------------------
:: STEP 2: Check Python
:: -----------------------------------------------
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found! Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)
echo  [OK] Python found.

:: -----------------------------------------------
:: STEP 3: Check Node.js
:: -----------------------------------------------
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found! Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo  [OK] Node.js found.
echo.

:: -----------------------------------------------
:: STEP 4: Setup Backend venv
:: -----------------------------------------------
echo  [*] Setting up Python virtual environment...
if not exist "backend\venv" (
    python -m venv backend\venv
    echo  [OK] Virtual environment created.
) else (
    echo  [OK] Virtual environment already exists.
)

:: -----------------------------------------------
:: STEP 5: Install backend dependencies
:: -----------------------------------------------
echo  [*] Installing backend dependencies (this may take a few minutes)...
call backend\venv\Scripts\activate.bat
pip install -r backend\requirements.txt --quiet
echo  [OK] Backend dependencies installed.
echo.

:: -----------------------------------------------
:: STEP 6: Install frontend dependencies
:: -----------------------------------------------
echo  [*] Installing frontend dependencies...
cd frontend
npm install --silent
cd ..
echo  [OK] Frontend dependencies installed.
echo.

:: -----------------------------------------------
:: STEP 7: Start Backend in new window
:: -----------------------------------------------
echo  [*] Starting Backend on http://localhost:3000 ...
start "JARVIS Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 3000"

timeout /t 3 /nobreak >nul

:: -----------------------------------------------
:: STEP 8: Start Frontend in new window
:: -----------------------------------------------
echo  [*] Starting Frontend on http://localhost:5173 ...
start "JARVIS Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 4 /nobreak >nul

:: -----------------------------------------------
:: STEP 9: Open browser
:: -----------------------------------------------
echo  [*] Opening browser...
start http://localhost:5173

echo.
echo  =============================================
echo   J.A.R.V.I.S. is starting up!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo.
echo   Close the Backend and Frontend windows
echo   to stop the app.
echo  =============================================
echo.
pause
