@echo off
chcp 65001 >nul
echo ========================================
echo 知识库索引重建脚本
echo ========================================
echo.
echo 本脚本将重建知识库索引，包含所有教学资料和ISW手册
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

echo [1/2] 检查依赖...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo [提示] 首次运行，正在安装依赖包...
    pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)

echo [2/2] 开始重建知识库索引...
echo.

REM 运行重建脚本
python rebuild_knowledge_base.py

if errorlevel 1 (
    echo.
    echo [错误] 重建失败，请检查日志
    pause
    exit /b 1
) else (
    echo.
    echo [成功] 知识库索引重建完成！
    echo.
    echo 下一步: 启动知识库服务
    echo   运行: start_service.bat
    echo.
    pause
)
