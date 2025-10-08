@echo off
chcp 65001 >nul
echo ================================
echo   教学智能助手 - 快速启动
echo ================================
echo.

echo [1/3] 检查Node.js环境...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到Node.js，请先安装Node.js 16或更高版本
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js已安装
node -v
echo.

echo [2/3] 检查依赖包...
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖包...
    echo 这可能需要几分钟时间，请耐心等待...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        echo 尝试使用淘宝镜像：npm install --registry=https://registry.npmmirror.com
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖包已存在
)
echo.

echo [3/3] 启动开发服务器...
echo.
echo ================================================
echo   🚀 服务器正在启动...
echo   📱 浏览器将自动打开 http://localhost:3000
echo   💡 按 Ctrl+C 可以停止服务器
echo ================================================
echo.

call npm run dev

pause

