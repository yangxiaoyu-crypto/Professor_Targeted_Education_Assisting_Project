@echo off
chcp 65001 >nul
echo ========================================
echo 用户认证服务启动脚本
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

echo [1/3] 检查依赖...
pip show PyJWT >nul 2>&1
if errorlevel 1 (
    echo [提示] 检测到缺少 PyJWT 模块，正在安装依赖包...
    pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo [成功] 依赖安装完成
) else (
    echo [成功] 依赖检查通过
)

echo [2/3] 启动认证服务...
echo.
echo 服务地址: http://localhost:5000
echo API文档:
echo   - POST /auth/register  用户注册
echo   - POST /auth/login     用户登录
echo   - GET  /auth/me        获取当前用户信息
echo   - POST /auth/logout    用户登出
echo   - POST /auth/refresh   刷新token
echo.
echo ========================================
echo.

REM 启动服务
python auth_service.py

pause

