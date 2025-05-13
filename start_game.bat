@echo off
echo Kart Oyunu Baslatiliyor...
echo.

echo Redis servisi kontrol ediliyor...
sc query Redis
if errorlevel 1 (
    echo Redis servisi bulunamadi. Redis'i baslatmaya calisiyorum...
    start "" "C:\Program Files\Redis\redis-server.exe"
    if errorlevel 1 (
        echo Redis baslatilamadi. Alternatif yol deneniyor...
        start "" "C:\Program Files (x86)\Redis\redis-server.exe"
    )
    timeout /t 5
)

echo Backend klasoru kontrol ediliyor...
if not exist "backend" (
    echo HATA: Backend klasoru bulunamadi!
    echo Lutfen bu dosyayi projenin ana klasorunde calistirdiginizden emin olun.
    pause
    exit
)

echo Frontend klasoru kontrol ediliyor...
if not exist "frontend" (
    echo HATA: Frontend klasoru bulunamadi!
    echo Lutfen bu dosyayi projenin ana klasorunde calistirdiginizden emin olun.
    pause
    exit
)

echo Node.js kontrol ediliyor...
where node >nul 2>nul
if errorlevel 1 (
    echo HATA: Node.js bulunamadi!
    echo Lutfen https://nodejs.org/en adresinden Node.js'i indirip kurun.
    pause
    exit
)

echo Backend baslatiliyor...
start "Backend" cmd /k "cd backend && npm install && npm run dev"

echo Frontend baslatiliyor...
start "Frontend" cmd /k "cd frontend && npm install && npm start"

echo.
echo Oyun baslatildi! Tarayicinizda http://localhost:3000 adresini acin.
echo.
echo Oyunu durdurmak icin stop_game.bat dosyasini calistirin.
echo.
pause 