@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Subiendo la guia a GitHub...
git add .
git commit -m "Actualizacion de la guia"
git push
echo.
echo Listo. Ya puedes cerrar esta ventana.
pause
