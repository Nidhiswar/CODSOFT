@echo off
echo ==================================================
echo   🚀 NOVEL EXPORTERS FULL-STACK INTEGRATION 🚀
echo ==================================================
echo.
echo Phase 1: Validating Services...
echo Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is running.
) else (
    echo [!!] WARNING: MongoDB service not detected! 
    echo Please start MongoDB for Login/Orders to work.
)

echo.
echo Phase 2: Killing old processes...
taskkill /F /IM node.exe /T 2>NUL
echo.

echo Phase 3: Launching Integrated Suite...
echo.
echo [BACKEND] Starting on http://127.0.0.1:5000
start "Novel-Backend" /min cmd /k "cd backend && node server.js"

timeout /t 3 /nobreak > nul

echo [FRONTEND] Starting on http://127.0.0.1:8080
start "Novel-Frontend" /min cmd /k "cd novel-exporters-hub-main && npm run dev"

echo.
echo ==================================================
echo   ✅ SUCCESS: BOTH SERVICES ARE DEPLOYING
echo   - Frontend: http://localhost:8080
echo   - Backend Status: http://localhost:5000/api
echo ==================================================
echo.
pause
