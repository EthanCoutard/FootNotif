@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

if not exist logs mkdir logs
set "logFile=logs\job.log"

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format ''yyyy-MM-dd HH:mm:ss''"') do set "now=%%i"
echo ==============================>>"%logFile%"
echo !now! Starting job>>"%logFile%"

if exist .env (
  for /f "usebackq tokens=* delims=" %%x in (".env") do (
    if not "%%x"=="" if not "%%x:~0,1%"=="#" set "%%x"
  )
)

set "pythonBin=%cd%\.venv\Scripts\python.exe"
set "apiUrl=http://127.0.0.1:%API_PORT%"

for /f %%s in ('curl -s -o nul -w "%%{http_code}" "%apiUrl%/health"') do set "status=%%s"

if not "!status!"=="200" (
  for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format ''yyyy-MM-dd HH:mm:ss''"') do set "now=%%i"
  echo !now! API not running, starting...>>"%logFile%"

  wmic process where "CommandLine like '%%app.py%%'" get ProcessId | findstr /r "[0-9]" >nul
  if !errorlevel! equ 0 (
    for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format ''yyyy-MM-dd HH:mm:ss''"') do set "now=%%i"
    echo !now! API process seems already starting, waiting...>>"%logFile%"
  ) else (
    start "" /b cmd /c ""%pythonBin%" app.py >> "%logFile%" 2>&1"
  )

  set tries=0

:waitLoop
  timeout /t 1 >nul
  set /a tries=!tries!+1

  for /f %%s in ('curl -s -o nul -w "%%{http_code}" "%apiUrl%/health"') do set "status=%%s"

  if "!status!"=="200" (
    for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format ''yyyy-MM-dd HH:mm:ss''"') do set "now=%%i"
    echo !now! API started successfully>>"%logFile%"
    goto sendMail
  )

  if !tries! GEQ 20 (
    for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format ''yyyy-MM-dd HH:mm:ss''"') do set "now=%%i"
    echo !now! API failed to start>>"%logFile%"
    exit /b 1
  )

  goto waitLoop
)

:sendMail
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format ''yyyy-MM-dd HH:mm:ss''"') do set "now=%%i"
echo !now! Sending notifications>>"%logFile%"
curl -s -X POST "%apiUrl%/notifications/send" >>"%logFile%"
echo.>>"%logFile%"

for /f "tokens=2 delims=," %%i in ('wmic process where "CommandLine like '%%app.py%%'" get ProcessId /format:csv ^| findstr /r "[0-9]"') do taskkill /PID %%i /F
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format ''yyyy-MM-dd HH:mm:ss''"') do set "now=%%i"
echo !now! app.py stopped>>"%logFile%"

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format ''yyyy-MM-dd HH:mm:ss''"') do set "now=%%i"
echo !now! Job finished>>"%logFile%


endlocal
exit /b 0
