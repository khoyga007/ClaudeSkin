@echo off
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\ClaudeSkin-watch.vbs" 2>nul
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*watch.mjs*' } | ForEach-Object { Stop-Process -Id $_.ProcessId }"
echo Autostart off.
pause
