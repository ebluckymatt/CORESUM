@echo off
setlocal

set "REPO_ROOT=%~dp0.."
pushd "%REPO_ROOT%"

powershell -ExecutionPolicy Bypass -File ".\scripts\setup-private-preview.ps1" -TargetRoot "%LOCALAPPDATA%\HTSG-Execution-Platform-Private" -InstallDeps -GeneratePrisma
if errorlevel 1 exit /b 1

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /r /c:":3001 .*LISTENING"') do taskkill /PID %%P /F >nul 2>nul

set "PRIVATE_ROOT=%LOCALAPPDATA%\HTSG-Execution-Platform-Private"
set "NODE_EXE=%REPO_ROOT%\.tools\node\node.exe"
set "STDOUT_LOG=%PRIVATE_ROOT%\private-preview.stdout.log"
set "STDERR_LOG=%PRIVATE_ROOT%\private-preview.stderr.log"

if exist "%STDOUT_LOG%" del /f /q "%STDOUT_LOG%"
if exist "%STDERR_LOG%" del /f /q "%STDERR_LOG%"

pushd "%PRIVATE_ROOT%"
start "htsg-private-preview" /b "%NODE_EXE%" ".\node_modules\next\dist\bin\next" dev --hostname 127.0.0.1 --port 3001 1>"%STDOUT_LOG%" 2>"%STDERR_LOG%"
popd

echo HTSG private preview is starting on http://127.0.0.1:3001
endlocal
