@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 正在安装依赖...
npm install

if %errorlevel% neq 0 (
    echo 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 依赖安装成功！
echo.
echo 正在启动项目...
echo.
npm run dev

pause
