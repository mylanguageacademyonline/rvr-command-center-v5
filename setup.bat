@echo off
TITLE RVR Catering Command Center - Automated Setup
COLOR 0A

echo ===================================================
echo   RVR Catering Command Center - One-Click Setup
echo ===================================================
echo.

:: 1. Check for Node.js
echo [1/5] Checking for Node.js...
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js (LTS version) from https://nodejs.org/ and try again.
    echo Press any key to exit...
    pause >nul
    exit
)
echo Node.js is installed. Moving on...
echo.

:: 2. Install Dependencies
echo [2/5] Installing required dependencies... This may take a minute.
call npm install
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Failed to install dependencies. Check your internet connection.
    pause >nul
    exit
)
echo Dependencies installed successfully.
echo.

:: 3. Build the Application
echo [3/5] Building the production application...
call npm run build
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Build failed! Check the logs above.
    pause >nul
    exit
)
echo Build completed successfully.
echo.

:: 4. Install PM2 Globally
echo [4/5] Installing Process Manager (PM2)...
call npm install -g pm2
echo PM2 installed.
echo.

:: 5. Start the Application
echo [5/5] Starting the server in the background...
call pm2 start npm --name "rvr-command-center" -- run start

echo.
echo ===================================================
echo   SETUP COMPLETE!
echo ===================================================
echo The system is now running in the background.
echo You can access it by opening your browser and navigating to:
echo http://localhost:3000
echo.
echo You can close this window now. The server will keep running.
pause
