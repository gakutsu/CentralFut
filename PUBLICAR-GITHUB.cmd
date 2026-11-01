@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0publicar-no-github.ps1"
echo.
echo Pressione qualquer tecla para fechar esta janela.
pause >nul
