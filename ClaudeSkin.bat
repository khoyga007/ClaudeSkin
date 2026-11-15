@echo off
cd /d "%~dp0"
node inject.mjs %1
pause
