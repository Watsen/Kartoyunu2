@echo off
echo Kart Oyunu durduruluyor...
echo.

echo Frontend durduruluyor...
taskkill /F /FI "WINDOWTITLE eq Frontend*" >nul 2>&1

echo Backend durduruluyor...
taskkill /F /FI "WINDOWTITLE eq Backend*" >nul 2>&1

echo Redis durduruluyor...
taskkill /F /IM redis-server.exe >nul 2>&1

echo.
echo Oyun durduruldu!
echo.
pause 