@echo off
cd /d "%~dp0"
node start-preview.cjs
if errorlevel 1 pause
