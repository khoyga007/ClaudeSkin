@echo off
rem Auto-apply theme every time Claude starts (needs Main Process Debugger left on). Usage: ClaudeSkin-autostart.bat [koi^|earth^|attention]
set THEME=%1
if "%THEME%"=="" set THEME=koi
rem stop any running watcher first so only one theme is auto-applied
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*watch.mjs*' } | ForEach-Object { Stop-Process -Id $_.ProcessId }"
set VBS=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\ClaudeSkin-watch.vbs
> "%VBS%" echo CreateObject("WScript.Shell").Run "cmd /c node ""%~dp0watch.mjs"" %THEME% > ""%~dp0watch.log"" 2>&1", 0, False
start "" wscript "%VBS%"
echo Autostart on (%THEME%). Remove: ClaudeSkin-autostart-off.bat
pause
