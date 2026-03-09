@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0start-web-tunnel-background.ps1" %*
